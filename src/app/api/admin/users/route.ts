import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { cookies } from "next/headers"
import { hashPassword } from "@/lib/password-utils"

import { parseSessionCookie } from "@/lib/cookie-utils"

async function verifyAdmin() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("etax_session")?.value

  if (!sessionCookie) {
    throw new Error("Chưa đăng nhập")
  }

  // Dùng parseSessionCookie để verify JWT thay vì parse JSON trực tiếp
  const sessionData = await parseSessionCookie(sessionCookie)
  
  if (!sessionData || !sessionData.uid) {
    throw new Error("Session không hợp lệ")
  }

  if (!sessionData.admin) {
    throw new Error("Không có quyền admin")
  }

  return sessionData
}

export async function GET() {
  try {
    await verifyAdmin()

    const db = adminDb
    if (!db) {
      console.error("[API /admin/users GET] Firebase Admin chưa được khởi tạo")
      return NextResponse.json({ error: "Firebase Admin chưa sẵn sàng" }, { status: 500 })
    }

    const usersSnapshot = await db.collection("users").get()
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      password: undefined, // Never return password
    }))

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error("[API /admin/users GET]", error)
    if (error.message === "Chưa đăng nhập" || error.message === "Không có quyền admin") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await verifyAdmin()

    const db = adminDb
    const auth = adminAuth

    if (!db || !auth) {
      console.error("[API /admin/users POST] Firebase Admin chưa được khởi tạo")
      return NextResponse.json({ error: "Firebase Admin chưa sẵn sàng" }, { status: 500 })
    }

    const body = await req.json()
    let { email, password, name, role = "user", mstList = [], phone } = body

    // Validation: User role cần MST, Admin role cần email
    if (role === "user") {
      if (!mstList || mstList.length === 0) {
        return NextResponse.json({ error: "User cần ít nhất 1 MST" }, { status: 400 })
      }
      if (!password || !name) {
        return NextResponse.json({ error: "Thiếu thông tin: tên và mật khẩu" }, { status: 400 })
      }
      // Tự động tạo email từ MST đầu tiên nếu không có email
      if (!email) {
        const firstMst = mstList[0]?.trim()
        if (!firstMst) {
          return NextResponse.json({ error: "MST không hợp lệ" }, { status: 400 })
        }
        email = `${firstMst}@mst.local`
      }
    } else {
      // Admin role cần email
      if (!email || !password || !name) {
        return NextResponse.json({ error: "Admin cần đủ: email, mật khẩu và tên" }, { status: 400 })
      }
    }

    // Check if email exists
    try {
      await auth.getUserByEmail(email)
      return NextResponse.json({ error: "Email đã tồn tại" }, { status: 400 })
    } catch {
      // User doesn't exist, continue
    }

    // Create Firebase Auth user (Firebase Auth sẽ tự hash password)
    const firebaseUser = await auth.createUser({
      email,
      password,
      displayName: name,
    })

    // Set admin claim if role is admin
    if (role === "admin") {
      await auth.setCustomUserClaims(firebaseUser.uid, { admin: true })
    }

    // Hash password cho Firestore (Firebase Auth dùng plaintext cho login, nhưng Firestore cần hash để verify)
    const hashedPassword = await hashPassword(password)

    // Create Firestore user document
    const userDoc = {
      uid: firebaseUser.uid,
      email,
      name,
      role,
      password: hashedPassword, // Lưu hashed password trong Firestore
      mstList,
      phone: phone || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await db.collection("users").add(userDoc)

    // Create mst_to_user documents for each MST in mstList
    if (mstList && mstList.length > 0 && role === "user") {
      const batch = db.batch()
      const duplicateMsts: string[] = []
      
      for (const mst of mstList) {
        const normalizedMst = mst.trim()
        if (normalizedMst) {
          const mstDocRef = db.collection("mst_to_user").doc(normalizedMst)
          
          // Check if MST already exists with different user
          const existingDoc = await mstDocRef.get()
          if (existingDoc.exists) {
            const existingData = existingDoc.data()
            if (existingData?.userId !== docRef.id) {
              duplicateMsts.push(`${normalizedMst} (already used by user ${existingData?.userId})`)
              console.warn(`[API /admin/users POST] MST ${normalizedMst} already exists for user ${existingData?.userId}`)
            }
          }
          
          batch.set(mstDocRef, {
            userId: docRef.id,
            mst: normalizedMst,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true })
        }
      }
      
      // Return error if duplicates found
      if (duplicateMsts.length > 0) {
        return NextResponse.json(
          {
            error: `Một hoặc nhiều MST đã được sử dụng bởi users khác`,
            code: "MST_DUPLICATE",
            duplicateMsts,
          },
          { status: 400 }
        )
      }
      
      await batch.commit()
    }

    // Tự động tạo profile cho mỗi MST (chỉ cho user role)
    if (mstList && mstList.length > 0 && role === "user") {
      const profileBatch = db.batch()
      
      for (const mst of mstList) {
        const normalizedMst = mst.trim()
        if (normalizedMst) {
          const profileRef = db.collection("profiles").doc(normalizedMst)
          const existingProfile = await profileRef.get()
          
          // Chỉ tạo profile mới nếu chưa có
          if (!existingProfile.exists) {
            profileBatch.set(profileRef, {
              mst: normalizedMst,
              fullName: name, // Dùng tên từ user
              email: email || undefined,
              phone: phone || undefined,
              address: undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }, { merge: true })
          } else {
            // Nếu đã có profile, chỉ update thông tin user nếu cần
            const profileData = existingProfile.data()
            if (!profileData?.fullName || !profileData?.email) {
              profileBatch.update(profileRef, {
                fullName: name,
                email: email || profileData?.email,
                phone: phone || profileData?.phone,
                updatedAt: new Date().toISOString(),
              })
            }
          }
        }
      }
      
      await profileBatch.commit()
    }

    return NextResponse.json({
      userId: docRef.id,
      user: {
        id: docRef.id,
        ...userDoc,
        password: undefined,
      },
    })
  } catch (error: any) {
    console.error("[API /admin/users POST]", error)
    if (error.message === "Chưa đăng nhập" || error.message === "Không có quyền admin") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "Email đã tồn tại" }, { status: 400 })
    }
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

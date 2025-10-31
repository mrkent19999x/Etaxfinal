import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { cookies } from "next/headers"

const MAX_AGE = 60 * 60 * 8 // 8 hours

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mst, password, email } = body
    const db = adminDb
    const auth = adminAuth

    if (!db || !auth) {
      console.error("[API /auth/login] Firebase Admin chưa được khởi tạo")
      return NextResponse.json({ error: "Firebase Admin chưa sẵn sàng" }, { status: 500 })
    }

    // Admin login: email + password
    if (email && password) {
      try {
        // Find user in Firestore by email
        const usersSnapshot = await db.collection("users").where("email", "==", email.toLowerCase()).limit(1).get()

        if (usersSnapshot.empty) {
          return NextResponse.json({ error: "Sai email hoặc mật khẩu" }, { status: 401 })
        }

        const userDoc = usersSnapshot.docs[0]
        const userData = userDoc.data()

        if (userData.role !== "admin") {
          return NextResponse.json({ error: "Không có quyền admin" }, { status: 403 })
        }

        // Verify password (in production, use hashed password comparison)
        if (userData.password !== password) {
          return NextResponse.json({ error: "Sai email hoặc mật khẩu" }, { status: 401 })
        }

        // Get or create Firebase Auth user
        let firebaseUid: string
        try {
          const existingUser = await auth.getUserByEmail(email.toLowerCase())
          firebaseUid = existingUser.uid
        } catch {
          // Create Firebase Auth user
          const newUser = await auth.createUser({
            email: email.toLowerCase(),
            password: password,
            displayName: userData.name,
          })
          firebaseUid = newUser.uid
          await auth.setCustomUserClaims(firebaseUid, { admin: true })

          // Update Firestore with uid
          await db.collection("users").doc(userDoc.id).update({ uid: firebaseUid })
        }

        // Create session data
        const sessionData = { uid: firebaseUid, email: email.toLowerCase(), admin: true }

        // Set cookie with session data (in production, use signed/encrypted cookie)
        const cookieStore = await cookies()
        cookieStore.set("etax_session", JSON.stringify(sessionData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: MAX_AGE,
          path: "/",
        })

        return NextResponse.json({ success: true, user: { id: firebaseUid, email: email.toLowerCase() } })
      } catch (error: any) {
        console.error("[Admin login error]", error)
        return NextResponse.json({ error: "Đăng nhập thất bại" }, { status: 500 })
      }
    }

    // User login: MST + password
    if (mst && password) {
      const normalizedMst = mst.trim()

      // Find user with this MST in Firestore
      const usersSnapshot = await db.collection("users").where("role", "==", "user").get()
      let targetUser: any = null
      let targetMst: string | null = null

      for (const doc of usersSnapshot.docs) {
        const userData = doc.data()
        if (userData.mstList?.includes(normalizedMst)) {
          // Verify password
          if (userData.password === password) {
            targetUser = { id: doc.id, ...userData }
            targetMst = normalizedMst
            break
          }
        }
      }

      if (!targetUser || !targetMst) {
        return NextResponse.json({ error: "Sai MST hoặc mật khẩu" }, { status: 401 })
      }

      const resolvedMst = targetMst

      // Get or create Firebase Auth user for this MST
      const mstEmail = `${normalizedMst}@mst.local`
      let firebaseUid: string

      try {
        const existingUser = await auth.getUserByEmail(mstEmail)
        firebaseUid = existingUser.uid
      } catch {
        // Create new Firebase Auth user
        const newUser = await auth.createUser({
          email: mstEmail,
          password: password,
          displayName: targetUser.name || normalizedMst,
        })
        firebaseUid = newUser.uid

        // Update Firestore user doc with uid
        await db.collection("users").doc(targetUser.id).update({ uid: firebaseUid })
      }

      // Create session data
      const sessionData = { uid: firebaseUid, mst: resolvedMst, email: mstEmail, admin: false }

      // Set cookie HttpOnly
      const cookieStore = await cookies()
      cookieStore.set("etax_session", JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MAX_AGE,
        path: "/",
      })

      // Also set MST in separate cookie for easy access
      cookieStore.set("etax_mst", resolvedMst, {
        httpOnly: false, // Can be read by client
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MAX_AGE,
        path: "/",
      })

      return NextResponse.json({
        success: true,
        user: { id: firebaseUid, mst: targetMst, name: targetUser.name },
      })
    }

    return NextResponse.json({ error: "Thiếu thông tin đăng nhập" }, { status: 400 })
  } catch (error: any) {
    console.error("[API /auth/login]", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { cookies } from "next/headers"

async function verifyAdmin() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("etax_session")?.value

  if (!sessionCookie) {
    throw new Error("Chưa đăng nhập")
  }

  let sessionData: any
  try {
    sessionData = JSON.parse(sessionCookie)
  } catch {
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

    const usersSnapshot = await adminDb.collection("users").get()
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

    const body = await req.json()
    const { email, password, name, role = "user", mstList = [], phone } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 })
    }

    // Check if email exists
    try {
      await adminAuth.getUserByEmail(email)
      return NextResponse.json({ error: "Email đã tồn tại" }, { status: 400 })
    } catch {
      // User doesn't exist, continue
    }

    // Create Firebase Auth user
    const firebaseUser = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    })

    // Set admin claim if role is admin
    if (role === "admin") {
      await adminAuth.setCustomUserClaims(firebaseUser.uid, { admin: true })
    }

    // Create Firestore user document
    const userDoc = {
      uid: firebaseUser.uid,
      email,
      name,
      role,
      mstList,
      phone: phone || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await adminDb.collection("users").add(userDoc)

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

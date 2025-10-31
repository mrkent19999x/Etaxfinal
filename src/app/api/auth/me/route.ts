import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("etax_session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    // Parse session data (stored as JSON string)
    let sessionData: any
    try {
      sessionData = JSON.parse(sessionCookie)
    } catch {
      return NextResponse.json({ error: "Session không hợp lệ" }, { status: 401 })
    }

    const { uid, email, admin, mst } = sessionData

    if (!uid) {
      return NextResponse.json({ error: "Session không hợp lệ" }, { status: 401 })
    }

    const db = adminDb
    const auth = adminAuth
    if (!db || !auth) {
      console.error("[API /auth/me] Firebase Admin chưa được khởi tạo")
      return NextResponse.json({ error: "Firebase Admin chưa sẵn sàng" }, { status: 500 })
    }

    // Get user data from Firestore
    const userDoc = await db.collection("users").where("uid", "==", uid).limit(1).get()

    if (userDoc.empty) {
      // If admin, might not have user doc
      if (admin) {
        try {
          const adminUser = await auth.getUser(uid)
          return NextResponse.json({
            user: {
              id: uid,
              email: adminUser.email,
              role: "admin",
              name: adminUser.displayName || "Admin",
            },
          })
        } catch {
          return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 })
        }
      }
      return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 })
    }

    const userData = userDoc.docs[0].data()
    const role = admin ? "admin" : "user"

    // For user, get MST from session or user data
    let userMst: string | null = mst || null
    if (!userMst && role === "user" && userData.mstList?.length > 0) {
      // Get MST from cookie or use first MST
      const mstCookie = cookieStore.get("etax_mst")?.value
      userMst = mstCookie || userData.mstList[0]
    }

    // Get profile if user
    let profile = null
    if (userMst) {
      const profileDoc = await db.collection("profiles").doc(userMst).get()
      if (profileDoc.exists) {
        profile = profileDoc.data()
      }
    }

    return NextResponse.json({
      user: {
        id: uid,
        email: email || userData.email,
        role,
        name: userData.name || email?.split("@")[0] || "User",
        mstList: userData.mstList || [],
        mst: userMst,
        phone: userData.phone,
        profile,
      },
    })
  } catch (error: any) {
    console.error("[API /auth/me]", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

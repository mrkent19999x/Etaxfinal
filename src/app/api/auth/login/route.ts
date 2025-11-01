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

    // If Firebase Admin not initialized, return error so client can use localStorage fallback
    if (!db || !auth) {
      console.warn("[API /auth/login] Firebase Admin chưa được khởi tạo - client sẽ dùng localStorage fallback")
      return NextResponse.json({ error: "Firebase Admin chưa sẵn sàng - vui lòng thử lại hoặc kiểm tra cấu hình" }, { status: 503 })
    }
    
    console.log("[DEBUG] Firebase Admin initialized:", { hasDb: !!db, hasAuth: !!auth })

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
      console.log("[DEBUG] User login attempt:", { mst: normalizedMst, hasPassword: !!password })

      // Find user with this MST in Firestore
      const usersSnapshot = await db.collection("users").where("role", "==", "user").get()
      console.log("[DEBUG] Firestore query result:", { 
        totalUsers: usersSnapshot.docs.length,
        users: usersSnapshot.docs.map(d => ({ id: d.id, mstList: d.data().mstList }))
      })
      
      let targetUser: any = null
      let targetMst: string | null = null

      for (const doc of usersSnapshot.docs) {
        const userData = doc.data()
        console.log("[DEBUG] Checking user:", { id: doc.id, mstList: userData.mstList, hasMST: userData.mstList?.includes(normalizedMst) })
        if (userData.mstList?.includes(normalizedMst)) {
          // Verify password
          console.log("[DEBUG] MST matched, checking password:", { storedPassword: userData.password, providedPassword: password, match: userData.password === password })
          if (userData.password === password) {
            targetUser = { id: doc.id, ...userData }
            targetMst = normalizedMst
            break
          } else {
            console.log("[DEBUG] Password mismatch for MST:", normalizedMst)
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

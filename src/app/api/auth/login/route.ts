import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { cookies } from "next/headers"
import { comparePassword } from "@/lib/password-utils"
import { signSessionCookie } from "@/lib/cookie-utils"
import { checkRateLimit } from "@/lib/rate-limit"

const MAX_AGE = 60 * 60 * 8 // 8 hours

export async function POST(req: NextRequest) {
  try {
    // Check rate limit trước khi xử lý login
    const rateLimitResult = await checkRateLimit(req)
    if (rateLimitResult && !rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.reset)
      return NextResponse.json(
        {
          error: "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau.",
          code: "RATE_LIMIT_EXCEEDED",
          reset: resetDate.toISOString(),
          remaining: rateLimitResult.remaining,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        }
      )
    }

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

        // Verify password với hash comparison (backward compatible với plaintext)
        const isPasswordValid = await comparePassword(password, userData.password)
        if (!isPasswordValid) {
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

        // Sign session data với JWT
        const signedToken = await signSessionCookie(sessionData)

        // Set cookie với signed token
        const cookieStore = await cookies()
        cookieStore.set("etax_session", signedToken, {
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

      // Optimized: Query mst_to_user collection thay vì loop all users
      let targetUser: any = null
      let targetMst: string | null = null
      let duplicateMstUsers: string[] = []

      try {
        // Query mst_to_user collection
        const mstDoc = await db.collection("mst_to_user").doc(normalizedMst).get()
        
        if (mstDoc.exists) {
          const mstData = mstDoc.data()
          const userId = mstData?.userId
          
          if (userId) {
            // Get user document
            const userDoc = await db.collection("users").doc(userId).get()
            
            if (userDoc.exists) {
              const userData = userDoc.data()
              
              // Verify user role
              if (userData?.role !== "user") {
                console.log("[DEBUG] User is not role='user':", userId)
              } else {
                // Verify MST is still in user's mstList (double-check)
                if (userData.mstList?.includes(normalizedMst)) {
                  // Verify password với hash comparison (backward compatible với plaintext)
                  const isPasswordValid = await comparePassword(password, userData.password)
                  console.log("[DEBUG] MST matched, checking password:", { isPasswordValid })
                  
                  if (isPasswordValid) {
                    targetUser = { id: userDoc.id, ...userData }
                    targetMst = normalizedMst
                  } else {
                    console.log("[DEBUG] Password mismatch for MST:", normalizedMst)
                  }
                } else {
                  console.log("[DEBUG] MST not in user's mstList:", { userId, mstList: userData.mstList })
                }
              }
            }
          }
        } else {
          // Fallback: Query all users (backward compatibility nếu mst_to_user chưa migrate)
          console.log("[DEBUG] MST not found in mst_to_user, falling back to loop all users")
          const usersSnapshot = await db.collection("users").where("role", "==", "user").get()
          
          for (const doc of usersSnapshot.docs) {
            const userData = doc.data()
            if (userData.mstList?.includes(normalizedMst)) {
              const isPasswordValid = await comparePassword(password, userData.password)
              if (isPasswordValid) {
                targetUser = { id: doc.id, ...userData }
                targetMst = normalizedMst
                break
              }
            }
          }
        }
      } catch (error: any) {
        console.error("[DEBUG] Error querying mst_to_user:", error)
        // Fallback to old method
      }

      if (!targetUser || !targetMst) {
        return NextResponse.json({ error: "Sai MST hoặc mật khẩu" }, { status: 401 })
      }

      // Check for duplicate MSTs (warn admin but allow login)
      if (duplicateMstUsers.length > 0) {
        console.warn(`[SECURITY] MST ${normalizedMst} is used by multiple users:`, duplicateMstUsers)
        // Could send alert to admin here
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

      // Sign session data với JWT
      const signedToken = await signSessionCookie(sessionData)

      // Set cookie với signed token
      const cookieStore = await cookies()
      cookieStore.set("etax_session", signedToken, {
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

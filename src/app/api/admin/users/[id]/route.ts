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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdmin()
    const { id } = await params

    const db = adminDb
    const auth = adminAuth

    if (!db || !auth) {
      console.error("[API /admin/users/[id] PATCH] Firebase Admin chưa được khởi tạo")
      return NextResponse.json({ error: "Firebase Admin chưa sẵn sàng" }, { status: 500 })
    }

    const body = await req.json()
    const { name, email, password, role, mstList, phone } = body

    // Get existing user doc
    const userDoc = await db.collection("users").doc(id).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 })
    }

    const userData = userDoc.data()!
    const uid = userData.uid

    // Update Firebase Auth user
    const updateAuth: any = {}
    if (name) updateAuth.displayName = name
    if (email && email !== userData.email) {
      updateAuth.email = email
    }
    if (password) updateAuth.password = password

    if (Object.keys(updateAuth).length > 0) {
      await auth.updateUser(uid, updateAuth)
    }

    // Update admin claim
    if (role !== undefined) {
      if (role === "admin") {
        await auth.setCustomUserClaims(uid, { admin: true })
      } else {
        await auth.setCustomUserClaims(uid, { admin: false })
      }
    }

    // Update Firestore doc
    const updateDoc: any = {
      updatedAt: new Date().toISOString(),
    }
    if (name) updateDoc.name = name
    if (email && email !== userData.email) updateDoc.email = email
    if (role !== undefined) updateDoc.role = role
    if (mstList !== undefined) updateDoc.mstList = mstList
    if (phone !== undefined) updateDoc.phone = phone || null

    await db.collection("users").doc(id).update(updateDoc)

    const updatedDoc = await db.collection("users").doc(id).get()
    return NextResponse.json({
      user: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        password: undefined,
      },
    })
  } catch (error: any) {
    console.error("[API /admin/users/[id] PATCH]", error)
    if (error.message === "Chưa đăng nhập" || error.message === "Không có quyền admin") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdmin()
    const { id } = await params

    const db = adminDb
    const auth = adminAuth

    if (!db || !auth) {
      console.error("[API /admin/users/[id] DELETE] Firebase Admin chưa được khởi tạo")
      return NextResponse.json({ error: "Firebase Admin chưa sẵn sàng" }, { status: 500 })
    }

    // Get user doc
    const userDoc = await db.collection("users").doc(id).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 })
    }

    const userData = userDoc.data()!
    const uid = userData.uid

    // Delete Firebase Auth user
    try {
      await auth.deleteUser(uid)
    } catch (error: any) {
      console.warn("[API /admin/users/[id] DELETE] Failed to delete auth user:", error)
    }

    // Delete Firestore doc
    await db.collection("users").doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[API /admin/users/[id] DELETE]", error)
    if (error.message === "Chưa đăng nhập" || error.message === "Không có quyền admin") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

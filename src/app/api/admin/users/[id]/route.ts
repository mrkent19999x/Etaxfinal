import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { cookies } from "next/headers"
import { hashPassword } from "@/lib/password-utils"

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
    if (password) {
      // Hash password trước khi lưu vào Firestore
      updateDoc.password = await hashPassword(password)
    }

    await db.collection("users").doc(id).update(updateDoc)

    // Sync mst_to_user collection khi mstList thay đổi
    if (mstList !== undefined && userData.role === "user") {
      const oldMstList = (userData.mstList || []).map((m: string) => m.trim()).filter(Boolean)
      const newMstList = (mstList || []).map((m: string) => m.trim()).filter(Boolean)
      
      // Find MSTs to remove (trong old nhưng không trong new)
      const toRemove = oldMstList.filter((m: string) => !newMstList.includes(m))
      
      // Find MSTs to add/update (trong new)
      const toAdd = newMstList.filter((m: string) => !oldMstList.includes(m))
      const toUpdate = newMstList.filter((m: string) => oldMstList.includes(m))
      
      const batch = db.batch()
      
      // Delete removed MSTs
      for (const mst of toRemove) {
        const mstDocRef = db.collection("mst_to_user").doc(mst)
        const mstDoc = await mstDocRef.get()
        
        // Only delete if this user owns it (to avoid deleting if another user also has this MST)
        if (mstDoc.exists && mstDoc.data()?.userId === id) {
          batch.delete(mstDocRef)
        }
      }
      
      // Add/update new MSTs
      const duplicateMsts: string[] = []
      
      for (const mst of [...toAdd, ...toUpdate]) {
        const mstDocRef = db.collection("mst_to_user").doc(mst)
        
        // Check for duplicates when adding new MSTs
        if (toAdd.includes(mst)) {
          const existingDoc = await mstDocRef.get()
          if (existingDoc.exists) {
            const existingData = existingDoc.data()
            if (existingData?.userId !== id) {
              duplicateMsts.push(`${mst} (already used by user ${existingData?.userId})`)
              console.warn(`[API /admin/users/[id] PATCH] MST ${mst} already exists for user ${existingData?.userId}`)
            }
          }
        }
        
        batch.set(mstDocRef, {
          userId: id,
          mst: mst,
          updatedAt: new Date().toISOString(),
        }, { merge: true })
        
        // Set createdAt only for new documents
        if (toAdd.includes(mst)) {
          const existingDoc = await mstDocRef.get()
          if (!existingDoc.exists) {
            batch.update(mstDocRef, {
              createdAt: new Date().toISOString(),
            })
          }
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
      
      if (toRemove.length > 0 || toAdd.length > 0 || toUpdate.length > 0) {
        await batch.commit()
      }
    }

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

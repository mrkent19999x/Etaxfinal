import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { adminDb } from "@/lib/firebase-admin"
import { requireAdminSession, requireUserSession } from "@/lib/session"

const querySchema = z.object({
  mst: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

export async function GET(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()))
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    let sessionMst: string | undefined
    let isAdmin = false
    try {
      await requireAdminSession()
      isAdmin = true
    } catch {
      const session = await requireUserSession()
      sessionMst = session.mst
    }

    const mst = isAdmin ? parsed.data.mst ?? sessionMst : sessionMst
    if (!mst) {
      return NextResponse.json({ error: "Thiếu mã số thuế" }, { status: 400 })
    }

    let query = adminDb
      .collection("notifications")
      .where("mst", "==", mst)
      .orderBy("createdAt", "desc")
      .limit(parsed.data.limit ?? 50)

    const snapshot = await query.get()
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json({ notifications })
  } catch (error: any) {
    const message = error?.message ?? "Lỗi server"
    // Filter out Firestore index errors - không trả về error về index cho client
    if (message.includes("index") || message.includes("FAILED_PRECONDITION")) {
      console.warn("[API /notifications] Firestore index error (fallback sẽ tự xử lý):", message)
      return NextResponse.json({ notifications: [] }, { status: 200 })
    }
    const status = message.includes("đăng nhập") || message.includes("quyền") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

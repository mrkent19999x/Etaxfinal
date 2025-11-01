import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { adminDb } from "@/lib/firebase-admin"
import { requireAdminSession, requireUserSession } from "@/lib/session"

const querySchema = z.object({
  mst: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  reference: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

export async function GET(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries())
    const parsed = querySchema.safeParse(searchParams)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    let sessionMst: string | undefined
    let isAdmin = false
    try {
      const adminSession = await requireAdminSession()
      isAdmin = !!adminSession
    } catch {
      const userSession = await requireUserSession()
      sessionMst = userSession.mst
    }

    const { mst: requestedMst, fromDate, toDate, reference, limit } = parsed.data
    const mst = isAdmin ? requestedMst ?? sessionMst : sessionMst

    if (!mst) {
      return NextResponse.json({ error: "Thiếu mã số thuế" }, { status: 400 })
    }

    let query = adminDb.collection("documents").where("mst", "==", mst)

    if (reference) {
      query = query.where("reference", "==", reference)
    }

    if (fromDate) {
      query = query.where("effectiveDate", ">=", fromDate)
    }

    if (toDate) {
      query = query.where("effectiveDate", "<=", toDate)
    }

    query = query.orderBy("effectiveDate", "desc")

    const snapshot = await query.limit(limit ?? 50).get()
    const documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json({ documents })
  } catch (error: any) {
    const message = error?.message ?? "Lỗi server"
    // Filter out Firestore index errors - không trả về error về index cho client
    if (message.includes("index") || message.includes("FAILED_PRECONDITION")) {
      console.warn("[API /documents] Firestore index error (fallback sẽ tự xử lý):", message)
      return NextResponse.json({ documents: [] }, { status: 200 })
    }
    const status = message.includes("đăng nhập") || message.includes("quyền") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

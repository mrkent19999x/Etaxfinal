import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { adminDb } from "@/lib/firebase-admin"
import { requireAdminSession } from "@/lib/session"
import { fieldDefinitionSchema } from "@/lib/content-service"

const createSchema = fieldDefinitionSchema.extend({
  id: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession()

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const searchParams = req.nextUrl.searchParams
    const screenId = searchParams.get("screenId") ?? undefined

    let query = adminDb.collection("fieldDefinitions")
    if (screenId) {
      query = query.where("screenId", "==", screenId)
    }
    const snapshot = await query.orderBy("screenId").orderBy("order").get()
    const definitions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ definitions })
  } catch (error: any) {
    const message = error?.message ?? "Lỗi server"
    const status = message.includes("quyền") || message.includes("đăng nhập") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminSession()

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const body = await req.json()
    const parsed = createSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const now = new Date().toISOString()
    const docData = {
      ...parsed.data,
      order: parsed.data.order ?? 0,
      createdAt: now,
      updatedAt: now,
      createdBy: session.uid,
    }

    const docRef = await adminDb.collection("fieldDefinitions").add(docData)

    return NextResponse.json({ id: docRef.id, ...docData })
  } catch (error: any) {
    console.error("[API /admin/field-definitions POST]", error)
    const message = error?.message ?? "Lỗi server"
    const status = message.includes("quyền") || message.includes("đăng nhập") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

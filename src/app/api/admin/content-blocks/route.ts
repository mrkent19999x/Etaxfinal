import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { z } from "zod"

import { adminDb } from "@/lib/firebase-admin"
import { requireAdminSession } from "@/lib/session"
import { contentBlockSchema } from "@/lib/content-service"

const createSchema = contentBlockSchema.extend({
  id: z.string().optional(),
})

export async function GET() {
  try {
    await requireAdminSession()
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const snapshot = await adminDb.collection("contentBlocks").orderBy("createdAt", "desc").get()
    const blocks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ blocks })
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
      createdAt: now,
      updatedAt: now,
      createdBy: session.uid,
    }

    const docRef = await adminDb.collection("contentBlocks").add(docData)
    return NextResponse.json({ id: docRef.id, ...docData })
  } catch (error: any) {
    console.error("[API /admin/content-blocks POST]", error)
    const message = error?.message ?? "Lỗi server"
    const status = message.includes("quyền") || message.includes("đăng nhập") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

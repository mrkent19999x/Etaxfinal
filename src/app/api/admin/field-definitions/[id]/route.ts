import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { adminDb } from "@/lib/firebase-admin"
import { requireAdminSession } from "@/lib/session"
import { fieldDefinitionSchema } from "@/lib/content-service"

const updateSchema = fieldDefinitionSchema.partial()

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminSession()
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const doc = await adminDb.collection("fieldDefinitions").doc(params.id).get()
    if (!doc.exists) {
      return NextResponse.json({ error: "Không tìm thấy field definition" }, { status: 404 })
    }

    return NextResponse.json({ id: doc.id, ...doc.data() })
  } catch (error: any) {
    const message = error?.message ?? "Lỗi server"
    const status = message.includes("quyền") || message.includes("đăng nhập") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminSession()

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const docRef = adminDb.collection("fieldDefinitions").doc(params.id)
    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      return NextResponse.json({ error: "Không tìm thấy field definition" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const now = new Date().toISOString()
    await docRef.update({ ...parsed.data, updatedAt: now })
    const updated = await docRef.get()
    return NextResponse.json({ id: updated.id, ...updated.data() })
  } catch (error: any) {
    console.error("[API /admin/field-definitions/:id PATCH]", error)
    const message = error?.message ?? "Lỗi server"
    const status = message.includes("quyền") || message.includes("đăng nhập") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminSession()
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    await adminDb.collection("fieldDefinitions").doc(params.id).delete()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    const message = error?.message ?? "Lỗi server"
    const status = message.includes("quyền") || message.includes("đăng nhập") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

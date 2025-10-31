import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { z } from "zod"

import { adminBucket, adminDb } from "@/lib/firebase-admin"
import { requireAdminSession } from "@/lib/session"
import { pdfTemplateSchema } from "@/lib/pdf-service"

const updateSchema = pdfTemplateSchema.partial().extend({
  fileBase64: z.string().optional(),
  fileName: z.string().optional(),
})

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireAdminSession()
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const doc = await adminDb.collection("pdfTemplates").doc(id).get()
    if (!doc.exists) {
      return NextResponse.json({ error: "Không tìm thấy template" }, { status: 404 })
    }

    return NextResponse.json({ id: doc.id, ...doc.data() })
  } catch (error: any) {
    const message = error?.message ?? "Lỗi server"
    const status = message.includes("quyền") || message.includes("đăng nhập") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireAdminSession()

    if (!adminDb || !adminBucket) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const docRef = adminDb.collection("pdfTemplates").doc(id)
    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      return NextResponse.json({ error: "Không tìm thấy template" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { fileBase64, fileName, ...updates } = parsed.data

    const currentData = snapshot.data() ?? {}
    let storagePath = updates.storagePath ?? currentData.storagePath

    if (fileBase64) {
      const base64Payload = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64
      const buffer = Buffer.from(base64Payload, "base64")
      const targetPath = storagePath || `pdf-templates/${fileName ?? `${randomUUID()}.pdf`}`
      await adminBucket.file(targetPath).save(buffer, {
        contentType: "application/pdf",
        metadata: {
          cacheControl: "private, max-age=0, must-revalidate",
        },
      })
      storagePath = targetPath
    }

    const now = new Date().toISOString()
    const payload = {
      ...updates,
      fields: updates.fields ?? currentData.fields ?? [],
      defaults: updates.defaults ?? currentData.defaults ?? {},
      storagePath,
      updatedAt: now,
    }

    await docRef.update(payload)

    const updatedDoc = await docRef.get()

    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() })
  } catch (error: any) {
    console.error("[API /admin/pdf/templates/:id PATCH]", error)
    const message = error?.message ?? "Lỗi server"
    const status = message.includes("quyền") || message.includes("đăng nhập") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireAdminSession()

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const docRef = adminDb.collection("pdfTemplates").doc(id)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Không tìm thấy template" }, { status: 404 })
    }

    await docRef.delete()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const message = error?.message ?? "Lỗi server"
    const status = message.includes("quyền") || message.includes("đăng nhập") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

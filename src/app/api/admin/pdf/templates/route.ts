import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { z } from "zod"

import { adminBucket, adminDb } from "@/lib/firebase-admin"
import { requireAdminSession } from "@/lib/session"
import { pdfTemplateSchema } from "@/lib/pdf-service"

const createTemplateSchema = pdfTemplateSchema.extend({
  fileBase64: z.string().optional(),
  fileName: z.string().optional(),
})

export async function GET() {
  try {
    await requireAdminSession()
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const snapshot = await adminDb.collection("pdfTemplates").orderBy("createdAt", "desc").get()
    const templates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json({ templates })
  } catch (error: any) {
    const message = error?.message ?? "Lỗi server"
    const status = message.includes("quyền") || message.includes("đăng nhập") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminSession()

    if (!adminDb || !adminBucket) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const body = await req.json()
    const parsed = createTemplateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { fileBase64, fileName, ...templateInput } = parsed.data

    let storagePath = templateInput.storagePath

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

    if (!storagePath) {
      return NextResponse.json({ error: "Thiếu storagePath hoặc fileBase64" }, { status: 400 })
    }

    const now = new Date().toISOString()

    const docData = {
      ...templateInput,
      fields: templateInput.fields ?? [],
      defaults: templateInput.defaults ?? {},
      storagePath,
      createdAt: now,
      updatedAt: now,
      createdBy: session.uid,
    }

    const docRef = await adminDb.collection("pdfTemplates").add(docData)

    return NextResponse.json({ id: docRef.id, ...docData })
  } catch (error: any) {
    console.error("[API /admin/pdf/templates POST]", error)
    const message = error?.message ?? "Lỗi server"
    const status = message.includes("quyền") || message.includes("đăng nhập") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

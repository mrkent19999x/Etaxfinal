import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { adminDb } from "@/lib/firebase-admin"
import { requireAdminSession } from "@/lib/session"
import { generatePdfDocument, getPdfTemplateById } from "@/lib/pdf-service"

const generateSchema = z.object({
  templateId: z.string().min(1),
  mst: z.string().min(1),
  payload: z.record(z.any()).optional(),
  reference: z.string().min(1).optional(),
  effectiveDate: z.string().optional(),
  mergeProfile: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminSession()

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const body = await req.json()
    const parsed = generateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { templateId, mst, payload, reference, effectiveDate, mergeProfile } = parsed.data

    const template = await getPdfTemplateById(templateId)
    if (!template) {
      return NextResponse.json({ error: "Không tìm thấy template" }, { status: 404 })
    }

    let mergedPayload: Record<string, any> = {
      ...(template.defaults ?? {}),
    }

    if (mergeProfile !== false) {
      const profileDoc = await adminDb.collection("profiles").doc(mst).get()
      if (profileDoc.exists) {
        mergedPayload = { ...mergedPayload, ...profileDoc.data() }
      }
    }

    if (payload) {
      mergedPayload = { ...mergedPayload, ...payload }
    }

    const result = await generatePdfDocument({
      template,
      mst,
      payload: mergedPayload,
      reference,
      effectiveDate,
      adminUid: session.uid,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error("[API /admin/pdf/generate]", error)
    const message = error?.message ?? "Lỗi server"
    const status = message.includes("quyền") || message.includes("đăng nhập") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

import { PDFDocument, StandardFonts } from "pdf-lib"
import { adminBucket, adminDb } from "@/lib/firebase-admin"
import { randomUUID } from "crypto"
import { z } from "zod"

export const pdfFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().optional(),
  dataKey: z.string().min(1),
  type: z.enum(["text", "date", "currency", "number", "checkbox"]).default("text"),
  fieldName: z.string().optional(),
  page: z.number().int().min(1).optional(),
  x: z.number().nonnegative().optional(),
  y: z.number().nonnegative().optional(),
  fontSize: z.number().positive().max(72).optional(),
  maxLength: z.number().int().positive().optional(),
})

export type PdfField = z.infer<typeof pdfFieldSchema>

export const pdfTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  storagePath: z.string().min(1),
  isAcroForm: z.boolean().default(false),
  pages: z.number().int().min(1),
  fields: z.array(pdfFieldSchema),
  defaults: z.record(z.any()).optional(),
})

export type PdfTemplateInput = z.infer<typeof pdfTemplateSchema>

export interface PdfTemplate extends PdfTemplateInput {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface GeneratePdfOptions {
  template: PdfTemplate
  mst: string
  payload: Record<string, any>
  reference?: string
  effectiveDate?: string
  adminUid: string
}

const VI_DATE = new Intl.DateTimeFormat("vi-VN")
const VI_CURRENCY = new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 0 })

function formatValue(value: any, type: PdfField["type"]): string {
  if (value == null) return ""

  switch (type) {
    case "date": {
      const date = value instanceof Date ? value : new Date(value)
      if (!Number.isNaN(date.getTime())) {
        return VI_DATE.format(date)
      }
      return String(value)
    }
    case "currency": {
      const num = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]/g, ""))
      if (!Number.isNaN(num)) {
        return VI_CURRENCY.format(num)
      }
      return String(value)
    }
    case "number":
      return String(value)
    case "checkbox":
      return value ? "Yes" : "No"
    default:
      return String(value)
  }
}

export async function generatePdfDocument({
  template,
  mst,
  payload,
  reference,
  effectiveDate,
  adminUid,
}: GeneratePdfOptions) {
  if (!adminBucket) {
    throw new Error("Firebase Storage chưa được cấu hình")
  }

  const [templateBuffer] = await adminBucket.file(template.storagePath).download()
  const pdfDoc = await PDFDocument.load(templateBuffer)
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const form = template.isAcroForm ? pdfDoc.getForm() : null

  for (const field of template.fields) {
    const rawValue = payload[field.dataKey]
    if (rawValue === undefined || rawValue === null || rawValue === "") {
      continue
    }

    const text = formatValue(rawValue, field.type)

    if (form && field.fieldName) {
      try {
        if (field.type === "checkbox") {
          const checkbox = form.getCheckBox(field.fieldName)
          if (String(rawValue) === "true" || rawValue === true || rawValue === 1) {
            checkbox.check()
          } else {
            checkbox.uncheck()
          }
        } else {
          const formField = form.getTextField(field.fieldName)
          formField.setText(text)
        }
        continue
      } catch (error) {
        console.warn(`[PDF] Không tìm thấy field ${field.fieldName} trong template ${template.id}`)
      }
    }

    if (field.page == null || field.x == null || field.y == null) {
      console.warn(`[PDF] Field ${field.key} thiếu tọa độ để vẽ text`)
      continue
    }

    const pageIndex = field.page - 1
    const page = pdfDoc.getPage(pageIndex)
    page.drawText(text, {
      x: field.x,
      y: field.y,
      size: field.fontSize ?? 12,
      font: helveticaFont,
    })
  }

  if (form) {
    try {
      form.flatten()
    } catch (error) {
      console.warn(`[PDF] Không thể flatten form cho template ${template.id}`, error)
    }
  }

  const pdfBytes = await pdfDoc.save()

  const resolvedReference = reference ?? randomUUID()
  const outputPath = `generated-documents/${mst}/${resolvedReference}.pdf`
  const file = adminBucket.file(outputPath)
  await file.save(Buffer.from(pdfBytes), {
    contentType: "application/pdf",
    metadata: {
      cacheControl: "private, max-age=0, must-revalidate",
    },
  })

  const signedUrlExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: signedUrlExpiry,
  })

  const now = new Date().toISOString()
  const documentRecord = {
    templateId: template.id,
    mst,
    reference: resolvedReference,
    filePath: outputPath,
    fileUrl: signedUrl,
    fileUrlExpiresAt: signedUrlExpiry.toISOString(),
    payload,
    createdBy: adminUid,
    createdAt: now,
    effectiveDate: effectiveDate ?? now,
    status: "generated",
  }

  const docRef = await adminDb?.collection("documents").add(documentRecord)

  const notificationRecord = {
    mst,
    type: "pdf_generated",
    title: `Chứng từ mới từ ${template.name}`,
    message: `Mã tham chiếu ${resolvedReference}`,
    reference: resolvedReference,
    docId: docRef?.id ?? resolvedReference,
    templateId: template.id,
    createdAt: now,
    createdBy: adminUid,
    read: false,
  }

  await adminDb?.collection("notifications").add(notificationRecord)

  return {
    reference: resolvedReference,
    filePath: outputPath,
    fileUrl: signedUrl,
    fileUrlExpiresAt: signedUrlExpiry.toISOString(),
    documentId: docRef?.id ?? null,
  }
}

export async function getPdfTemplateById(templateId: string): Promise<PdfTemplate | null> {
  if (!adminDb) return null
  const doc = await adminDb.collection("pdfTemplates").doc(templateId).get()
  if (!doc.exists) return null
  const data = doc.data() as PdfTemplateInput & {
    createdAt: string
    updatedAt: string
    createdBy: string
  }
  return {
    id: doc.id,
    ...data,
  }
}

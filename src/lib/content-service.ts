import { z } from "zod"
import { adminDb } from "@/lib/firebase-admin"

export const contentBlockSchema = z.object({
  key: z.string().min(1),
  title: z.string().optional(),
  body: z.string().optional(),
  style: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

export type ContentBlockInput = z.infer<typeof contentBlockSchema>

export interface ContentBlock extends ContentBlockInput {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export const fieldDefinitionSchema = z.object({
  screenId: z.string().min(1),
  fieldId: z.string().min(1),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  type: z.enum(["text", "number", "date", "currency", "select", "textarea"]).default("text"),
  options: z.array(z.record(z.any())).optional(),
  validation: z.record(z.any()).optional(),
  style: z.record(z.any()).optional(),
  order: z.number().optional(),
})

export type FieldDefinitionInput = z.infer<typeof fieldDefinitionSchema>

export interface FieldDefinition extends FieldDefinitionInput {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export async function getContentBlockByKey(key: string): Promise<ContentBlock | null> {
  if (!adminDb) return null
  const snapshot = await adminDb.collection("contentBlocks").where("key", "==", key).limit(1).get()
  if (snapshot.empty) return null
  const doc = snapshot.docs[0]
  const data = doc.data() as ContentBlock
  const { id: _, ...rest } = data
  return { ...rest, id: doc.id }
}

export async function getFieldDefinitions(screenId: string): Promise<FieldDefinition[]> {
  if (!adminDb) return []
  try {
    const snapshot = await adminDb
      .collection("fieldDefinitions")
      .where("screenId", "==", screenId)
      .orderBy("order", "asc")
      .get()
    return snapshot.docs.map((doc) => {
      const data = doc.data() as FieldDefinition
      const { id: _, ...rest } = data
      return { ...rest, id: doc.id }
    })
  } catch (error: any) {
    // Fallback: Load all và sort trong memory nếu thiếu index
    if (error?.message?.includes("index") || error?.code === "failed-precondition") {
      console.warn("[getFieldDefinitions] Index chưa được tạo, dùng fallback sort")
      const snapshot = await adminDb
        .collection("fieldDefinitions")
        .where("screenId", "==", screenId)
        .get()
      return snapshot.docs
        .map((doc) => {
          const data = doc.data() as FieldDefinition
          const { id: _, ...rest } = data
          return { ...rest, id: doc.id }
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    }
    console.error("[getFieldDefinitions]", error)
    return []
  }
}

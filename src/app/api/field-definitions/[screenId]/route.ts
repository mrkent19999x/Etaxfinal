import { NextRequest, NextResponse } from "next/server"

import { adminDb } from "@/lib/firebase-admin"

export async function GET(_: NextRequest, { params }: { params: Promise<{ screenId: string }> }) {
  try {
    const { screenId } = await params
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    const snapshot = await adminDb
      .collection("fieldDefinitions")
      .where("screenId", "==", screenId)
      .orderBy("order", "asc")
      .get()

    const definitions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ definitions })
  } catch (error: any) {
    console.error("[API /field-definitions/:screenId]", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"

import { adminDb } from "@/lib/firebase-admin"

export async function GET(_: NextRequest, { params }: { params: Promise<{ screenId: string }> }) {
  try {
    const { screenId } = await params
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }

    let snapshot
    try {
      snapshot = await adminDb
        .collection("fieldDefinitions")
        .where("screenId", "==", screenId)
        .orderBy("order", "asc")
        .get()
    } catch (error: any) {
      // Fallback: Load all và sort trong memory nếu thiếu index
      if (error?.message?.includes("index") || error?.code === "failed-precondition") {
        console.warn("[API /field-definitions/:screenId] Index chưa được tạo, dùng fallback sort")
        snapshot = await adminDb
          .collection("fieldDefinitions")
          .where("screenId", "==", screenId)
          .get()
        const definitions = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        return NextResponse.json({ definitions })
      }
      throw error
    }

    const definitions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ definitions })
  } catch (error: any) {
    console.error("[API /field-definitions/:screenId]", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

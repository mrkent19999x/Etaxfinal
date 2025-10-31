import { NextRequest, NextResponse } from "next/server"

import { adminDb } from "@/lib/firebase-admin"

export async function GET(_: NextRequest, { params }: { params: { key: string } }) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin chưa được khởi tạo" }, { status: 500 })
    }
    const snapshot = await adminDb
      .collection("contentBlocks")
      .where("key", "==", params.key)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return NextResponse.json({ content: null })
    }

    const doc = snapshot.docs[0]
    return NextResponse.json({ content: { id: doc.id, ...doc.data() } })
  } catch (error: any) {
    console.error("[API /content-blocks/:key]", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

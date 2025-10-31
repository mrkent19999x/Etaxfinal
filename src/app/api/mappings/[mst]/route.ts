import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { cookies } from "next/headers"
import type { MappingRow } from "@/lib/data-store"

async function verifyAuth() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("etax_session")?.value

  if (!sessionCookie) {
    throw new Error("Chưa đăng nhập")
  }

  try {
    JSON.parse(sessionCookie)
  } catch {
    throw new Error("Session không hợp lệ")
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ mst: string }> }) {
  try {
    await verifyAuth()
    const { mst } = await params
    const db = adminDb

    if (!db) {
      console.error("[API /mappings/[mst] GET] Firebase Admin chưa được khởi tạo")
      return NextResponse.json({ error: "Firebase Admin chưa sẵn sàng" }, { status: 500 })
    }

    const mappingDoc = await db.collection("mappings").doc(mst).get()

    if (!mappingDoc.exists) {
      return NextResponse.json({ mappings: [] })
    }

    const data = mappingDoc.data()!
    return NextResponse.json({ mappings: data.rows || [] })
  } catch (error: any) {
    console.error("[API /mappings/[mst] GET]", error)
    if (error.message === "Chưa đăng nhập") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ mst: string }> }) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("etax_session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    let sessionData: any
    try {
      sessionData = JSON.parse(sessionCookie)
    } catch {
      return NextResponse.json({ error: "Session không hợp lệ" }, { status: 401 })
    }

    if (!sessionData.admin) {
      return NextResponse.json({ error: "Không có quyền admin" }, { status: 403 })
    }

    const { mst } = await params
    const body = await req.json()
    const { rows }: { rows: MappingRow[] } = body

    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })
    }

    const db = adminDb

    if (!db) {
      console.error("[API /mappings/[mst] PUT] Firebase Admin chưa được khởi tạo")
      return NextResponse.json({ error: "Firebase Admin chưa sẵn sàng" }, { status: 500 })
    }

    await db.collection("mappings").doc(mst).set(
      {
        mst,
        rows,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    return NextResponse.json({ success: true, mappings: rows })
  } catch (error: any) {
    console.error("[API /mappings/[mst] PUT]", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

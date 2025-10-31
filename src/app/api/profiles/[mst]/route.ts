import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { cookies } from "next/headers"
import type { MstProfile } from "@/lib/data-store"

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
      console.error("[API /profiles/[mst] GET] Firebase Admin chưa được khởi tạo")
      return NextResponse.json({ error: "Firebase Admin chưa sẵn sàng" }, { status: 500 })
    }

    const profileDoc = await db.collection("profiles").doc(mst).get()

    if (!profileDoc.exists) {
      return NextResponse.json({ profile: null })
    }

    return NextResponse.json({ profile: profileDoc.data() as MstProfile })
  } catch (error: any) {
    console.error("[API /profiles/[mst] GET]", error)
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
    const profile: MstProfile = body

    if (!profile.mst || profile.mst !== mst) {
      return NextResponse.json({ error: "MST không khớp" }, { status: 400 })
    }

    const db = adminDb
    if (!db) {
      console.error("[API /profiles/[mst] PUT] Firebase Admin chưa được khởi tạo")
      return NextResponse.json({ error: "Firebase Admin chưa sẵn sàng" }, { status: 500 })
    }

    await db.collection("profiles").doc(mst).set(
      {
        ...profile,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    console.error("[API /profiles/[mst] PUT]", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

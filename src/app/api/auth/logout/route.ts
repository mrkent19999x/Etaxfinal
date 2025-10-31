import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("etax_session")
    cookieStore.delete("etax_mst")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API /auth/logout]", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

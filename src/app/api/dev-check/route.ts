import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function GET() {
  // Chỉ hoạt động trong dev mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 })
  }

  try {
    // Đọc build ID từ Next.js .next folder
    // Build ID thay đổi mỗi lần Next.js rebuild (khi có code change)
    const buildIdPath = join(process.cwd(), ".next", "BUILD_ID")
    let buildId = "unknown"
    
    try {
      buildId = readFileSync(buildIdPath, "utf-8").trim()
    } catch {
      // File chưa tồn tại (lần đầu start), dùng timestamp
      buildId = Date.now().toString()
    }

    return NextResponse.json({
      buildId,
      timestamp: Date.now(),
    })
  } catch (error) {
    // Fallback nếu không đọc được
    return NextResponse.json({
      buildId: Date.now().toString(),
      timestamp: Date.now(),
    })
  }
}


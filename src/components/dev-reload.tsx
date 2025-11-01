"use client"

import { useEffect } from "react"

/**
 * Auto-reload component for dev mode
 * Polls /api/dev-check to detect server restarts/updates and reloads the page automatically
 */
export function DevReload() {
  useEffect(() => {
    // Chỉ chạy trong dev mode
    if (process.env.NODE_ENV !== "development") {
      return
    }

    let lastBuildTime: string | null = null
    let pollInterval: NodeJS.Timeout | null = null
    let retryCount = 0
    const MAX_RETRIES = 3

    const checkForUpdates = async () => {
      try {
        const response = await fetch("/api/dev-check?t=" + Date.now(), {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          // API không available (có thể là production), bỏ qua
          return
        }

        const data = await response.json()
        const currentBuildId = data.buildId

        if (lastBuildTime === null) {
          // Lần đầu tiên, lưu build ID
          lastBuildTime = currentBuildId
          console.log("📱 Dev Reload: Đã kết nối, đang theo dõi updates...")
          retryCount = 0
        } else if (currentBuildId !== lastBuildTime) {
          // Có update mới (server đã restart hoặc rebuild), reload page
          console.log("🔄 Phát hiện update mới, đang reload...")
          window.location.reload()
        } else {
          retryCount = 0 // Reset retry count khi connection OK
        }
      } catch (error) {
        retryCount++
        if (retryCount >= MAX_RETRIES) {
          // Sau vài lần retry không được, có thể server chưa start, bỏ qua
          console.warn("⚠️ Dev Reload: Không thể kết nối với dev server")
        }
      }
    }

    // Poll mỗi 2 giây
    pollInterval = setInterval(checkForUpdates, 2000)

    // Check ngay lần đầu
    checkForUpdates()

    // Cleanup khi component unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [])

  return null // Component không render gì
}


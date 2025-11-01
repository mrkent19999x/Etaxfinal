"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { DetailHeader } from "@/components/detail-header"
import { ProtectedView } from "@/components/protected-view"

interface NotificationRecord {
  id: string
  mst: string
  type: string
  title: string
  message?: string
  createdAt: string
  reference?: string
  docId?: string
  read?: boolean
}

type TabKey = "all" | "pdf_generated" | "administrative" | "obligation" | "other"

const TAB_CONFIG: { key: TabKey; label: string }[] = [
  { key: "pdf_generated", label: "Thông báo chứng từ" },
  { key: "administrative", label: "Thông báo hành chính" },
  { key: "obligation", label: "Biến động nghĩa vụ" },
  { key: "other", label: "Thông báo khác" },
]

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("pdf_generated")
  const [searchTerm, setSearchTerm] = useState("")
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError("")
    ;(async () => {
      try {
        const res = await fetch("/api/notifications")
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error ?? "Không thể tải thông báo")
        }
        const data = await res.json()
        if (!cancelled) setNotifications(data.notifications ?? [])
      } catch (err: any) {
        console.error(err)
        // Filter out Firestore index errors - không hiển thị trên UI
        const errorMessage = err?.message ?? "Không thể tải thông báo"
        if (!cancelled && !errorMessage.includes("index") && !errorMessage.includes("FAILED_PRECONDITION")) {
          setError(errorMessage)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const notif of notifications) {
      const key = notif.type || "other"
      map[key] = (map[key] ?? 0) + 1
    }
    return map
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return notifications.filter((notif) => {
      const matchTab = activeTab === "all" ? true : notif.type === activeTab
      const matchTerm = !term
        ? true
        : [notif.title, notif.message, notif.createdAt, notif.reference]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term))
      return matchTab && matchTerm
    })
  }, [notifications, activeTab, searchTerm])

  return (
    <ProtectedView>
      <div className="flex h-full flex-col bg-white">
        <DetailHeader title="Thông báo" />

        <div className="bg-[color:var(--color-primary)] px-4 py-2">
          <div className="flex justify-between gap-2">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-left text-[11px] font-medium text-[color:var(--color-primary)] transition-all ${
                  activeTab === tab.key ? "ring-2 ring-white/70" : "opacity-90"
                }`}
              >
                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)]/10 text-[9px] font-bold text-[color:var(--color-primary)]">
                  {counts[tab.key] ?? 0}
                </span>
                <span className="leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
            <span className="text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo nội dung hoặc ngày"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
            />
          </div>
          <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[color:var(--color-primary)]" disabled>
            ➕ Nâng cao
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">Đang tải...</div>
          ) : error ? (
            <div className="rounded bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">Không có thông báo</div>
          ) : (
            filteredNotifications.map((notif) => (
              <div key={notif.id} className="space-y-1">
                <p className="px-1 text-xs text-gray-600">{new Date(notif.createdAt).toLocaleString("vi-VN")}</p>
                <Link href={notif.docId ? `/thong-bao/${notif.id}?doc=${notif.docId}` : `/thong-bao/${notif.id}`}>
                  <div className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="flex-1 text-sm font-medium text-gray-800">{notif.title}</p>
                      {notif.reference ? (
                        <span className="rounded-full bg-[color:var(--color-primary)]/10 px-2 py-0.5 text-[11px] text-[color:var(--color-primary)]">
                          {notif.reference}
                        </span>
                      ) : null}
                    </div>
                    {notif.message ? <p className="text-sm text-gray-600">{notif.message}</p> : null}
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </ProtectedView>
  )
}

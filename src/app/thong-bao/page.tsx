"use client"

import { useState } from "react"
import { DetailHeader } from "@/components/detail-header"
import Link from "next/link"
import { ProtectedView } from "@/components/protected-view"

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")

  const notifications = [
    {
      id: 1,
      category: "administrative",
      title: "Thông báo kế hoạch tạm dừng hệ thống",
      date: "27/06/2025 15:05:59",
      content: "Cục Thuế thông báo về việc tạm dừng các hệ thống thuế điện tử từ 18h00 ngày 27/6/2025 (...",
    },
    {
      id: 2,
      category: "obligation",
      title: "V/v : Tài khoản giao dịch thuế điện tử",
      date: "21/06/2025 21:02:15",
      content: "Thông báo về tài khoản giao dịch thuế điện tử mới",
    },
    {
      id: 3,
      category: "other",
      title: "Cập nhật hệ thống",
      date: "15/06/2025 10:30:00",
      content: "Hệ thống đã được cập nhật với các tính năng mới",
    },
  ]

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "all") return true
    if (activeTab === "administrative") return notif.category === "administrative"
    if (activeTab === "obligation") return notif.category === "obligation"
    if (activeTab === "other") return notif.category === "other"
    return true
  })

  return (
    <ProtectedView>
      <div className="h-full bg-white flex flex-col">
        <DetailHeader title="Thông báo" />

        {/* Notification Tabs - mapping 1:1 mobile with warm red-orange band */}
        <div className="bg-[#F05A3E] px-4 py-2">
          <div className="flex justify-between gap-2">
            <button
              onClick={() => setActiveTab("administrative")}
              className={`flex-shrink-0 px-2.5 py-1.5 rounded-full bg-white text-[#F05A3E] text-[11px] leading-tight font-medium text-left flex items-center gap-1.5 transition-all ${
                activeTab === "administrative" ? "ring-2 ring-white/70" : "opacity-90"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#F05A3E]/10 text-[#F05A3E] text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                0
              </span>
              <span className="whitespace-normal break-words leading-tight text-[11px]">
                <span className="block">Thông báo</span>
                <span className="block">hành chính của</span>
                <span className="block">CQT</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab("obligation")}
              className={`flex-shrink-0 px-2.5 py-1.5 rounded-full bg-white text-[#F05A3E] text-[11px] leading-tight font-medium text-left flex items-center gap-1.5 transition-all ${
                activeTab === "obligation" ? "ring-2 ring-white/70" : "opacity-90"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#F05A3E]/10 text-[#F05A3E] text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                0
              </span>
              <span className="whitespace-normal break-words leading-tight text-[11px]">
                <span className="block">Biến động</span>
                <span className="block">nghĩa vụ thuế</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab("other")}
              className={`flex-shrink-0 px-2.5 py-1.5 rounded-full bg-white text-[#F05A3E] text-[11px] leading-tight font-medium text-left flex items-center gap-1.5 transition-all ${
                activeTab === "other" ? "ring-2 ring-white/70" : "opacity-90"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#F05A3E]/10 text-[#F05A3E] text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                0
              </span>
              <span className="whitespace-normal break-words leading-tight text-[11px]">
                <span className="block">Thông báo</span>
                <span className="block">khác</span>
              </span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white px-4 py-2 flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <span className="text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo nội dung hoặc ngày"
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
          <button className="text-red-600 font-medium text-sm flex items-center gap-1 px-3 py-2">
            <span>➕</span>
            Nâng cao
          </button>
        </div>

        {/* Notifications List - fixed one-screen layout (no vertical scroll) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.slice(0, 2).map((notif) => (
              <div key={notif.id} className="space-y-1">
                <p className="text-gray-700 text-xs px-1">{notif.date}</p>
                <Link href={`/thong-bao/${notif.id}`}>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <p className="text-gray-800 font-medium text-sm flex-1">{notif.title}</p>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{notif.content}</p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Không có thông báo</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedView>
  )
}

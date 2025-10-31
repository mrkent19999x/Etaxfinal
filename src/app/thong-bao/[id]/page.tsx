"use client"

import { DetailHeader } from "@/components/detail-header"
import { useParams } from "next/navigation"
import { useBodyLock } from "@/hooks/use-body-lock"

export default function NotificationDetailPage() {
  const params = useParams()
  useBodyLock(true)
  const id = params.id

  const notificationDetails: Record<string, { title: string; date: string; content: string }> = {
    "1": {
      title: "Giao dịch nộp thuế",
      date: "Ngày thông báo: 11/10/2025 12:37:23",
      content: "Người nộp thuế đã nộp thuế thành công. Mã tham chiếu: 11020250044818128. Số tiền nộp: 9.600 VND.",
    },
    "2": {
      title: "V/v : Tài khoản giao dịch thuế điện tử",
      date: "Ngày thông báo: 21/06/2025 21:02:15",
      content:
        "Thông báo về tài khoản giao dịch thuế điện tử mới được tạo. Vui lòng kiểm tra thông tin tài khoản của bạn.",
    },
    "3": {
      title: "Cập nhật hệ thống",
      date: "Ngày thông báo: 15/06/2025 10:30:00",
      content:
        "Hệ thống eTax Mobile đã được cập nhật với các tính năng mới. Vui lòng cập nhật ứng dụng để sử dụng các tính năng mới nhất.",
    },
  }

  const notification = notificationDetails[id as string] || notificationDetails["1"]

  return (
    <div className="h-full bg-gray-100 flex flex-col">
      <DetailHeader title="Chi tiết thông báo" />

      {/* Notification Detail Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{notification.title}</h2>
          <p className="text-gray-500 text-sm mb-6">{notification.date}</p>
          <p className="text-gray-700 text-base leading-relaxed">{notification.content}</p>
        </div>
      </div>
    </div>
  )
}

"use client"

import { DetailHeader } from "@/components/detail-header"
import { ProtectedView } from "@/components/protected-view"

export default function TraCuuThongTinNguoiPhuThuocPage() {
  const services = [
    { id: 1, icon: "👤", label: "Tra cứu thông tin người phụ thuộc" },
    { id: 2, icon: "📋", label: "Kê khai người phụ thuộc" },
    { id: 3, icon: "✏️", label: "Cập nhật thông tin người phụ thuộc" },
    { id: 4, icon: "🔍", label: "Lịch sử thay đổi người phụ thuộc" },
  ]
  return (
    <ProtectedView>
      <div className="h-full bg-gray-100 flex flex-col">
        <DetailHeader title="Tra cứu thông tin người phụ thuộc" />

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-3xl shadow-sm hover:shadow-md transition-shadow">
                  {service.icon}
                </div>
                <p className="text-xs text-center text-gray-700 font-medium leading-tight">{service.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedView>
  )
}

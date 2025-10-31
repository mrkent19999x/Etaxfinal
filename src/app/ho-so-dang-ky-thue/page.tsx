"use client"

import { DetailHeader } from "@/components/detail-header"
import { ProtectedView } from "@/components/protected-view"
import Image from "next/image"

export default function HoSoDangKyThuePage() {
  const services = [
    { id: 1, icon: "hs1.png", label: "Xem hồ sơ đăng ký thuế" },
    { id: 2, icon: "hs2.png", label: "Cập nhật hồ sơ đăng ký" },
    { id: 3, icon: "hs3.png", label: "Lịch sử thay đổi hồ sơ" },
  ]
  return (
    <ProtectedView>
      <div className="h-full bg-gray-100 flex flex-col">
        <DetailHeader title="Hồ sơ đăng ký thuế" />

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <Image src={`/assets/${service.icon}`} alt={service.label} width={56} height={56} className="object-contain w-full h-full" />
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

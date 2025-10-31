"use client"

import { DetailHeader } from "@/components/detail-header"
import { ProtectedView } from "@/components/protected-view"
import Image from "next/image"

export default function DangKyThuePage() {
  const services = [
    {
      id: 1,
      icon: "dk1.png",
      label: "Thay đổi thông tin đăng ký thuế",
    },
    {
      id: 2,
      icon: "dk2.png",
      label: "Tra cứu thông tin người phụ thuộc",
    },
    {
      id: 3,
      icon: "dk3.png",
      label: "Hồ sơ đăng ký thuế",
    },
  ]
  return (
    <ProtectedView>
      <div className="h-full bg-gray-100 flex flex-col">
        <DetailHeader title="Đăng ký thuế" />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-4 mt-6 mb-6">
            <div className="grid grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="w-[44px] h-[44px] flex items-center justify-center overflow-hidden">
                    <Image src={`/assets/${service.icon}`} alt={service.label} width={44} height={44} className="object-contain w-full h-full" />
                  </div>
                  <p className="text-xs text-center text-gray-700 font-medium leading-tight line-clamp-2">{service.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedView>
  )
}

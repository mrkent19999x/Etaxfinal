"use client"

import { DetailHeader } from "@/components/detail-header"
import { ProtectedView } from "@/components/protected-view"
import Image from "next/image"

export default function HoaDonDienTuPage() {
  const services = [
    { id: 1, icon: "hddt1.png", label: "Kê khai tờ khai đăng ký HĐDT" },
    { id: 2, icon: "hddt2.png", label: "Tờ khai chờ xác thực" },
    { id: 3, icon: "hddt3.png", label: "Tra cứu tờ khai đăng ký HĐĐT" },
  ]
  return (
    <ProtectedView>
      <div className="h-full bg-gray-800 flex flex-col">
        <DetailHeader title="Hoá đơn điện tử" />

        <div className="flex-1 overflow-y-auto bg-gray-100 px-4 py-6">
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
    </ProtectedView>
  )
}

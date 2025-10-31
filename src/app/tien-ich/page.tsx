"use client"

import { DetailHeader } from "@/components/detail-header"
import { ProtectedView } from "@/components/protected-view"
import Image from "next/image"

export default function TienIchPage() {
  const services = [
    { id: 1, icon: "ti1.png", label: "Tra cứu bảng giá tính thuế phương tiền" },
    { id: 2, icon: "ti2.png", label: "Tra cứu thông tin NNT" },
    { id: 3, icon: "ti3.png", label: "Tra cứu hộ kinh doanh" },
    { id: 4, icon: "ti4.png", label: "Công cụ tính thuế TNCN" },
    { id: 5, icon: "ti5.png", label: "Quét QR-Code cho Tem rượu, thuốc là điện tử" },
  ]
  return (
    <ProtectedView>
      <div className="min-h-screen flex flex-col">
        <DetailHeader title="Tiện ích" />

        <div className="flex-1 overflow-y-auto px-4 py-6">
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

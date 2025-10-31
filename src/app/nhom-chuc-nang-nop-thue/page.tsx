"use client"

import { DetailHeader } from "@/components/detail-header"
import { ProtectedView } from "@/components/protected-view"
import Image from "next/image"

export default function TaxPaymentFunctionsPage() {
  const services = [
    { id: 1, icon: "nt1.png", label: "Nộp thuế" },
    { id: 2, icon: "nt2.png", label: "Nộp thuế thay" },
    { id: 3, icon: "nt3.png", label: "Tra cứu chứng từ nộp thuế" },
    { id: 4, icon: "nt4.png", label: "Tự lập giấy nộp tiền" },
    { id: 5, icon: "nt5.png", label: "Liên kết/Hủy liên kết tài khoản" },
    { id: 6, icon: "nt6.png", label: "Đề nghị xử lý khoản nộp thừa" },
    { id: 7, icon: "nt7.png", label: "Tra cứu đề nghị xử lý khoản nộp thừa" },
    { id: 8, icon: "nt8.png", label: "Quét QR-Code để nộp thuế" },
  ]
  return (
    <ProtectedView>
      <div className="h-full bg-gray-800 flex flex-col">
        <DetailHeader title="Nhóm chức năng nộp thuế" />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="p-6">
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
      </div>
    </ProtectedView>
  )
}

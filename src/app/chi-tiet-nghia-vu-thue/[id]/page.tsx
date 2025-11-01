"use client"

import { ChevronLeft, Home } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useMemo } from "react"
import { ProtectedView } from "@/components/protected-view"
import { etaxHeaderStyle } from "@/components/header-style"
import { useUserSession } from "@/hooks/use-user-session"

export default function ChiTietNghiaVuThuePage() {
  const router = useRouter()
  const params = useParams()
  const session = useUserSession()
  const userDetails = useMemo(() => ({
    mst: session.mst || "",
    fullName: session.name || "",
  }), [session.mst, session.name])

  // Mock data - sẽ thay bằng dữ liệu thực
  const obligationDetail = useMemo(
    () => ({
      id: params.id as string,
      office: "Cục Thuế TP.HCM",
      type: "Thuế giá trị gia tăng",
      status: "Chưa nộp",
      totalAmount: 5_000_000,
      dueDate: "15/11/2025",
      referenceCode: "TB-2025-001234",
      items: [
        {
          label: "Mã số thuế",
          value: userDetails.mst,
        },
        {
          label: "Tên người nộp thuế",
          value: userDetails.fullName,
        },
        {
          label: "Cơ quan thuế quản lý",
          value: "Cục Thuế TP.HCM",
        },
        {
          label: "Số quyết định",
          value: "QĐ-2025-001234",
        },
        {
          label: "Ngày quyết định",
          value: "01/10/2025",
        },
        {
          label: "Kỳ tính thuế",
          value: "09/2025",
        },
        {
          label: "Hạn nộp",
          value: "15/11/2025",
        },
        {
          label: "Số tiền phải nộp",
          value: "5,000,000 VNĐ",
        },
      ],
    }),
    [params.id, userDetails]
  )
  return (
    <ProtectedView>
      <div className="h-full bg-gray-100 flex flex-col">
        {/* Header */}
        <div className="etax-header px-6 py-4 flex items-center justify-between text-white" style={etaxHeaderStyle}>
          <button onClick={() => router.back()} className="hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-light text-lg">Chi tiết nghĩa vụ thuế</h1>
          <Link href="/">
            <Home className="w-6 h-6 text-white cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Status Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="text-center">
              <div className="inline-block bg-yellow-100 px-6 py-3 rounded-full mb-4">
                <span className="text-yellow-800 font-bold">Chưa nộp</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{obligationDetail.totalAmount.toLocaleString()} VNĐ</h2>
              <p className="text-gray-600">Hạn nộp: {obligationDetail.dueDate}</p>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Thông tin chi tiết</h3>

            <div className="space-y-4">
              {obligationDetail.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start gap-4 py-3 border-b border-gray-200 last:border-b-0"
                >
                  <span className="text-gray-600 font-medium flex-shrink-0">{item.label}</span>
                  <span className="text-gray-900 font-bold text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reference */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-6">
            <h4 className="font-bold text-gray-800 mb-2">Mã tham chiếu</h4>
            <p className="text-gray-700 font-mono">{obligationDetail.referenceCode}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button className="w-full bg-[color:var(--color-primary)] hover:opacity-90 text-white font-semibold py-4 rounded-xl transition-colors">
              Nộp thuế ngay
            </button>
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 rounded-xl transition-colors">
              Tải chứng từ
            </button>
          </div>
        </div>
      </div>
    </ProtectedView>
  )
}

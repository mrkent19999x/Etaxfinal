"use client"

import { ChevronLeft, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMemo } from "react"
import { ProtectedView } from "@/components/protected-view"
import { etaxHeaderStyle } from "@/components/header-style"
import { useUserSession } from "@/hooks/use-user-session"

interface UserInfo {
  mst: string
  fullName: string
  companyName: string
  address: string
  taxOffice: string
  phone: string
  email: string
  representative: string
  registrationDate: string
  status: string
}

export default function ThongTinNguoiNopThuePage() {
  const router = useRouter()
  const session = useUserSession()
  const userInfo = useMemo<UserInfo>(() => ({
    mst: session.mst || "",
    fullName: session.name || "",
    companyName: "CÔNG TY TNHH ABC",
    address: "số 8 hêm, Phương Minh Khai(Hết hiệu lực), TP Hà Nội",
    taxOffice: "Thuế cơ số 3 thành phố Hà Nội",
    phone: "0856941234",
    email: "tuxuanchien6101992@gmail.com",
    representative: "Trần Văn A",
    registrationDate: "01/01/2020",
    status: "Đang hoạt động",
  }), [session.mst, session.name])
  return (
    <ProtectedView>
      <div className="h-full bg-gray-100 flex flex-col">
        {/* Header */}
        <div className="etax-header px-6 py-4 flex items-center justify-between text-white" style={etaxHeaderStyle}>
          <button onClick={() => router.back()} className="hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-light text-lg">Thông tin người nộp thuế</h1>
          <Link href="/">
            <Home className="w-6 h-6 text-white cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full border-4 bg-gray-100 flex items-center justify-center" style={{ borderColor: 'var(--color-primary)' }}>
                <span className="text-4xl">🏢</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{userInfo.fullName}</h2>
                <p className="text-sm text-gray-600">MST: {userInfo.mst}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Company Name */}
              <div className="flex justify-between items-start gap-4 py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Tên doanh nghiệp</span>
                <span className="text-gray-900 font-bold text-right">{userInfo.companyName}</span>
              </div>

              {/* MST */}
              <div className="flex justify-between items-start gap-4 py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Mã số thuế</span>
                <span className="text-gray-900 font-bold text-right">{userInfo.mst}</span>
              </div>

              {/* Address */}
              <div className="flex justify-between items-start gap-4 py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Địa chỉ</span>
                <span className="text-gray-900 font-bold text-right text-sm">{userInfo.address}</span>
              </div>

              {/* Tax Office */}
              <div className="flex justify-between items-start gap-4 py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Cơ quan thuế</span>
                <span className="text-gray-900 font-bold text-right text-sm">{userInfo.taxOffice}</span>
              </div>

              {/* Phone */}
              <div className="flex justify-between items-start gap-4 py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Điện thoại</span>
                <span className="text-gray-900 font-bold text-right">{userInfo.phone}</span>
              </div>

              {/* Email */}
              <div className="flex justify-between items-start gap-4 py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Email</span>
                <span className="text-gray-900 font-bold text-right break-all text-sm">{userInfo.email}</span>
              </div>

              {/* Representative */}
              <div className="flex justify-between items-start gap-4 py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Người đại diện</span>
                <span className="text-gray-900 font-bold text-right">{userInfo.representative}</span>
              </div>

              {/* Registration Date */}
              <div className="flex justify-between items-start gap-4 py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Ngày đăng ký</span>
                <span className="text-gray-900 font-bold text-right">{userInfo.registrationDate}</span>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center gap-4 py-3">
                <span className="text-gray-600 font-medium">Trạng thái</span>
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold">
                  {userInfo.status}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-[color:var(--color-primary)] hover:opacity-90 text-white rounded-xl py-4 px-4 font-semibold transition-colors">
              Cập nhật thông tin
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl py-4 px-4 font-semibold transition-colors">
              Tải hồ sơ
            </button>
          </div>
        </div>
      </div>
    </ProtectedView>
  )
}

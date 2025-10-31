"use client"

import { ChevronLeft, Home, Edit, QrCode, Lock, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { etaxHeaderStyle } from "@/components/header-style"
import { useBodyLock } from "@/hooks/use-body-lock"

export default function AccountInfoPage() {
  const router = useRouter()
  useBodyLock(true)

  return (
    <div className="phone-frame flex flex-col h-full bg-gray-100">
      {/* KHUNG 1: Topbar - CỐ ĐỊNH */}
      <header className="etax-header px-4 py-3 flex items-center justify-between text-white flex-shrink-0" style={etaxHeaderStyle}>
        <button onClick={() => router.back()} className="hover:opacity-80 transition-opacity">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-semibold text-xl">Thông tin tài khoản</h1>
        <Link href="/">
          <Home className="w-6 h-6 text-white cursor-pointer hover:opacity-80 transition-opacity" />
        </Link>
      </header>

      {/* KHUNG 2: Avatar + 4 nút - CỐ ĐỊNH, LIỀN VỚI TOPBAR */}
      <div className="bg-gray-800 px-6 pt-16 pb-6 flex-shrink-0 min-h-[50dvh] flex flex-col">
        {/* Avatar Icon - Ở trên cùng khung 2, cách topbar rõ ràng */}
        <div className="flex justify-center pt-4">
          <div className="w-32 h-32 rounded-full bg-white p-2 border-2 border-red-700">
            <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 4 Nút bấm - Kích thước bằng nhau */}
        <div className="grid grid-cols-2 gap-4 mt-12">
          <button className="bg-red-600 hover:bg-red-700 rounded-2xl h-14 w-full px-4 flex items-center justify-center space-x-2 transition-colors">
            <Edit className="w-6 h-6 text-white flex-shrink-0" />
            <span className="text-white text-sm font-medium whitespace-nowrap">Thay đổi thông tin</span>
          </button>

          <button className="bg-red-600 hover:bg-red-700 rounded-2xl h-14 w-full px-4 flex items-center justify-center space-x-2 transition-colors">
            <QrCode className="w-6 h-6 text-white flex-shrink-0" />
            <span className="text-white text-sm font-medium whitespace-nowrap">Mã QR-Code thông</span>
          </button>

          <Link href="/doi-mat-khau" className="bg-red-600 hover:bg-red-700 rounded-2xl h-14 w-full px-4 flex items-center justify-center space-x-2 transition-colors">
            <Lock className="w-6 h-6 text-white flex-shrink-0" />
            <span className="text-white text-sm font-medium whitespace-nowrap">Đổi mật khẩu</span>
          </Link>

          <button className="bg-red-600 hover:bg-red-700 rounded-2xl h-14 w-full px-4 flex items-center justify-center space-x-2 transition-colors">
            <Trash2 className="w-6 h-6 text-white flex-shrink-0" />
            <span className="text-white text-sm font-medium whitespace-nowrap">Xoá tài khoản</span>
          </button>
        </div>
      </div>

      {/* KHUNG 3: Thông tin tài khoản - CHỈ PHẦN NÀY SCROLL */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Thông tin tài khoản</h2>
        <div className="space-y-4 pb-6">
          <div className="flex justify-between py-2">
            <span className="text-gray-700 font-medium">Mã số thuế</span>
            <span className="font-bold text-gray-900">001092028300</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-700 font-medium">Tên đầy đủ</span>
            <span className="font-bold text-gray-900">từ xuân chiến</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-700 font-medium">Địa chỉ</span>
            <span className="font-bold text-gray-900 text-right">số 8 hẻm, Phường Minh Khai(Hết hiệu lực), TP Hà Nội</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-700 font-medium">Tên CQT quản lý</span>
            <span className="font-bold text-gray-900 text-right">Thuế cơ sở 3 thành phố Hà Nội</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-700 font-medium">Số điện thoại</span>
            <span className="font-bold text-gray-900">0856941234</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-700 font-medium">Thư điện tử</span>
            <span className="font-bold text-gray-900 text-right break-all">tuxuanchien6101992@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}

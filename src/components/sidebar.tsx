"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useUserSession } from "@/hooks/use-user-session"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter()
  const session = useUserSession()

  useEffect(() => {
    if (!session.loading && !session.isAuthenticated) {
      router.replace("/login")
    }
  }, [session.loading, session.isAuthenticated, router])

  const displayName = session.name ?? "Người dùng"
  const displayMst = session.mst ?? "--"

  const handleMenuClick = (href: string) => {
    if (href !== "#") {
      router.push(href)
      onClose()
    }
  }

  const handleLogout = () => {
    session.logout()
    router.replace("/login")
    onClose()
  }

  if (session.loading) return null

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - chiếm 3/4 màn hình */}
      <aside
        className={`fixed left-0 top-0 w-3/4 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ height: '100dvh' }}
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
        aria-hidden={!isOpen}
      >
        {/* Header - Background image */}
        <div
          className="flex flex-col justify-end items-center text-white relative"
          style={{
            height: "327px",
            backgroundImage: "url('/assets/sidebar/slidebg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            paddingTop: "calc(37px + env(safe-area-inset-top, 0px))"
          }}
        >
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white hover:opacity-80 z-10 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-sm"
            aria-label="Đóng menu"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
          
          {/* Logo */}
          <div className="flex justify-center items-center w-full mt-5 mb-0">
            <Image src="/assets/logo.webp" alt="Logo eTax Mobile" width={130} height={130} />
          </div>
          
          {/* Greeting Box */}
          <div 
            className="text-white px-5 py-3 w-full text-left"
            style={{
              backgroundColor: "var(--color-primary)",
              fontSize: "22px",
              fontWeight: 600,
              lineHeight: 1.3,
              boxShadow: "inset 0 2px 4px rgba(255,255,255,0.2), 0 1px 3px rgba(0,0,0,0.3)",
              margin: 0
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: 600, lineHeight: 1.3 }}>
            <p className="text-sm mt-1 text-white/80">MST đang sử dụng: {displayMst}</p>
              Xin chào <span style={{ fontSize: "24px", fontWeight: "bold" }}>{displayName}</span>
            </div>
          </div>
        </div>

        {/* Menu Items - White background */}
        <div className="flex-1 overflow-y-auto bg-white px-0 py-0" style={{ maxHeight: "calc(100dvh - 327px)" }}>
          <nav className="space-y-0" aria-label="Menu điều hướng chính">
            <button 
              onClick={() => handleMenuClick("/")} 
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-inset"
            >
              <Image src="/assets/trangchu.png" alt="" width={36} height={36} aria-hidden="true" />
              <span className="font-medium text-base">Trang chủ</span>
            </button>
            <button 
              onClick={() => handleMenuClick("/hoa-don-dien-tu")} 
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-inset"
            >
              <Image src="/assets/index1.png" alt="" width={36} height={36} aria-hidden="true" />
              <span className="font-medium text-base">Hoá đơn điện tử</span>
            </button>
            <button 
              onClick={() => handleMenuClick("/khai-thue")} 
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-inset"
            >
              <Image src="/assets/icon5.png" alt="" width={36} height={36} aria-hidden="true" />
              <span className="font-medium text-base">Khai thuế</span>
            </button>
            <button 
              onClick={() => handleMenuClick("/dang-ky-thue")} 
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-inset"
            >
              <Image src="/assets/icon5.png" alt="" width={36} height={36} aria-hidden="true" />
              <span className="font-medium text-base">Đăng ký thuế</span>
            </button>
            <button 
              onClick={() => handleMenuClick("/ho-tro-quyet-toan")} 
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-inset"
            >
              <Image src="/assets/icon6.png" alt="" width={36} height={36} aria-hidden="true" />
              <span className="font-medium text-base">Hỗ trợ quyết toán thuế TNCN</span>
            </button>
            <button 
              onClick={() => handleMenuClick("/nhom-chuc-nang-nop-thue")} 
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-inset"
            >
              <Image src="/assets/icon7.png" alt="" width={36} height={36} aria-hidden="true" />
              <span className="font-medium text-base">Nhóm chức năng nộp thuế</span>
            </button>
            <button 
              onClick={() => handleMenuClick("/tra-cuu-nghia-vu-thue")} 
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-inset"
            >
              <Image src="/assets/icon8.png" alt="" width={36} height={36} aria-hidden="true" />
              <span className="font-medium text-base">Tra cứu nghĩa vụ thuế</span>
            </button>
            <button 
              onClick={() => handleMenuClick("/thong-bao")} 
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-inset"
            >
              <Image src="/assets/icon9.png" alt="" width={36} height={36} aria-hidden="true" />
              <span className="font-medium text-base">Tra cứu thông báo</span>
            </button>
            <button 
              onClick={() => handleMenuClick("/tien-ich")} 
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-inset"
            >
              <Image src="/assets/icon10.png" alt="" width={36} height={36} aria-hidden="true" />
              <span className="font-medium text-base">Tiện ích</span>
            </button>
            <button 
              onClick={() => handleMenuClick("/ho-tro")} 
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-inset"
            >
              <Image src="/assets/icon11.png" alt="" width={36} height={36} aria-hidden="true" />
              <span className="font-medium text-base">Hỗ trợ</span>
            </button>
            <button 
              onClick={() => handleMenuClick("/thiet-lap-ca-nhan")} 
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-inset"
            >
              <Image src="/assets/icon12.png" alt="" width={36} height={36} aria-hidden="true" />
              <span className="font-medium text-base">Thiết lập cá nhân</span>
            </button>
            <button 
              onClick={() => handleMenuClick("/doi-mat-khau")} 
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-inset"
            >
              <Image src="/assets/icon-doimk.png" alt="" width={36} height={36} aria-hidden="true" />
              <span className="font-medium text-base">Đổi mật khẩu đăng nhập</span>
            </button>
            <button 
              onClick={() => handleMenuClick("/van-tay")} 
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-inset"
            >
              <Image src="/assets/faceid.png" alt="" width={36} height={36} aria-hidden="true" />
              <span className="font-medium text-base">Đăng nhập bằng vân tay / FaceID</span>
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div
          className="border-t border-gray-100 px-5 py-3 mt-0 bg-white"
          style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
        >
          <button
            onClick={handleLogout}
            className="w-full py-4 px-5 bg-gradient-to-br from-[#b71c1c] to-[#d32f2f] text-white rounded-[25px] font-bold text-base cursor-pointer shadow-[0_4px_8px_rgba(183,28,28,0.3)] transition-transform hover:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-offset-2"
          >
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  )
}

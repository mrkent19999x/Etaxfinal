"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu, Bell, QrCode } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Sidebar } from "@/components/sidebar"
import { etaxHeaderStyle } from "@/components/header-style"
import { useBodyLock } from "@/hooks/use-body-lock"
import { useUserSession } from "@/hooks/use-user-session"

export default function EtaxMobileHome() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const session = useUserSession()
  const [frequentTitle, setFrequentTitle] = useState("Chức năng hay dùng")
  const [servicesTitle, setServicesTitle] = useState("Danh sách nhóm dịch vụ")
  useBodyLock(true)

  useEffect(() => {
    if (!session.loading && !session.isAuthenticated) {
      router.replace("/login")
    }
  }, [session.loading, session.isAuthenticated, router])

  if (session.loading || !session.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu người dùng...</p>
        </div>
      </div>
    )
  }

  const frequentFeatures = [
    { id: 1, icon: "icon1.png", label: "Tra cứu thông tin người phụ thuộc", href: "/tra-cuu-thong-tin-nguoi-phu-thuoc" },
    { id: 2, icon: "icon2.png", label: "Hồ sơ đăng ký thuế", href: "/ho-so-dang-ky-thue" },
    { id: 3, icon: "icon3.png", label: "Hồ sơ quyết toán thuế", href: "/ho-so-quyet-toan-thue" },
    { id: 4, icon: "icon4.png", label: "Tra cứu chứng từ thuế", href: "/tra-cuu-chung-tu" },
  ]

  const services = [
    { id: 1, icon: "index1.png", label: "Hoá đơn điện tử", href: "/hoa-don-dien-tu" },
    { id: 2, icon: "index2.png", label: "Khai thuế", href: "/khai-thue" },
    { id: 3, icon: "index3.png", label: "Đăng ký thuế", href: "/dang-ky-thue" },
    { id: 4, icon: "index4.png", label: "Hỗ trợ quyết toán thuế TNCN", href: "/ho-tro-quyet-toan" },
    { id: 5, icon: "index5.png", label: "Nhóm chức năng nộp thuế", href: "/nhom-chuc-nang-nop-thue" },
    { id: 6, icon: "index6.png", label: "Tra cứu nghĩa vụ thuế", href: "/tra-cuu-nghia-vu-thue" },
    { id: 7, icon: "index7.png", label: "Tra cứu thông báo", href: "/thong-bao" },
    { id: 8, icon: "index8.png", label: "Tiện ích", href: "/tien-ich" },
    { id: 9, icon: "index9.png", label: "Hỗ trợ", href: "/ho-tro" },
    { id: 10, icon: "index10.png", label: "Thiết lập cá nhân", href: "/thiet-lap-ca-nhan" },
  ]

  return (
    <div className="phone-frame">
      <div className="flex flex-col h-full">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <header className="etax-header px-6 py-4 flex items-center justify-between text-white" style={etaxHeaderStyle} aria-label="Header chính">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50 rounded-sm"
            aria-label="Mở menu điều hướng"
            aria-expanded={sidebarOpen}
          >
            <Menu className="w-6 h-6 cursor-pointer" aria-hidden="true" />
          </button>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <Image src="/assets/logo.webp" alt="Logo eTax Mobile - Về trang chủ" width={48} height={48} className="mb-1" priority />
            <h1 className="font-light text-lg">eTax Mobile</h1>
          </div>
          <div className="flex gap-4">
            <button 
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50 rounded-sm"
              aria-label="Quét QR code"
            >
              <QrCode className="w-6 h-6 cursor-pointer" aria-hidden="true" />
            </button>
            <button 
              onClick={() => router.push("/thong-bao")} 
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50 rounded-sm"
              aria-label="Xem thông báo"
            >
              <Bell className="w-6 h-6 cursor-pointer" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-[color:var(--color-surface-muted)]" style={{ backgroundImage: 'url(/assets/sidebar/nen.png)', backgroundSize: 'cover', backgroundPosition: 'center top', backgroundRepeat: 'no-repeat' }} id="main-content">
          {/* User Profile Card */}
          <div className="mx-4 mt-2 bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm" style={{ backgroundImage: 'url(/assets/backgrounftd.png)', backgroundSize: 'cover', backgroundPosition: 'right center', backgroundRepeat: 'no-repeat' }}>
            <div className="w-16 h-16 rounded-full border-4 border-[color:var(--color-primary)] bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image src="/assets/avatar.png" alt={`Ảnh đại diện của ${session.name ?? session.mst}`} width={64} height={64} className="object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-gray-600 text-sm">MST: {session.mst}</p>
              <div className="flex items-center gap-2">
                <p className="text-[color:var(--color-primary)] font-bold text-lg">{session.name ?? session.mst}</p>
                <Link 
                  href="/thong-tin-tai-khoan" 
                  className="flex-shrink-0 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-300 rounded-sm"
                  aria-label="Xem thông tin tài khoản"
                >
                  <Image src="/assets/nutha.png" alt="" width={20} height={20} className="object-contain" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* Frequently Used Features */}
          <section className="mx-4 mt-2 bg-white rounded-2xl p-5 shadow-sm" aria-labelledby="frequent-features-heading">
            <div className="mb-4">
              <h2 id="frequent-features-heading" className="text-lg font-bold text-gray-800">{frequentTitle}</h2>
            </div>

            {/* Horizontal Scroll */}
            <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <nav className="flex gap-4 min-w-max" aria-label="Danh sách chức năng thường dùng">
                {frequentFeatures.map((feature) => (
                  <Link 
                    key={feature.id} 
                    href={feature.href} 
                    prefetch={false}
                    className="flex-shrink-0 w-24 flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-300 rounded-lg"
                    aria-label={feature.label}
                  >
                    <div className="w-14 h-14 flex items-center justify-center overflow-hidden">
                      <Image 
                        src={`/assets/${feature.icon}`} 
                        alt="" 
                        width={48} 
                        height={48}
                        className="object-contain w-full h-full"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-xs text-center text-gray-700 font-medium leading-tight">{feature.label}</p>
                  </Link>
                ))}
              </nav>
            </div>
          </section>

          {/* Service Grid */}
          <section className="mx-4 mt-2 bg-white rounded-2xl p-5 shadow-sm mb-6" style={{ 
            marginBottom: "calc(24px + env(safe-area-inset-bottom, 0px))"
          }} aria-labelledby="services-heading">
            <h2 id="services-heading" className="mb-6 text-lg font-bold text-gray-800">{servicesTitle}</h2>

            <nav className="grid grid-cols-3 gap-6" aria-label="Danh sách dịch vụ">
              {services.map((service) => (
                <Link 
                  key={service.id} 
                  href={service.href} 
                  prefetch={false} 
                  className={`flex flex-col items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-300 rounded-lg ${service.href === "#" ? "pointer-events-none opacity-50" : ""}`}
                  aria-label={service.label}
                  aria-disabled={service.href === "#"}
                >
                  <div className="w-14 h-14 flex items-center justify-center overflow-hidden">
                    <Image 
                      src={`/assets/${service.icon}`} 
                      alt="" 
                      width={48} 
                      height={48}
                      className="object-contain w-full h-full"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-xs text-center text-gray-700 font-medium leading-tight">{service.label}</p>
                </Link>
              ))}
            </nav>
          </section>
        </main>
      </div>
    </div>
  )
}
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/content-blocks/home.frequentFeatures")
        if (res.ok) {
          const data = await res.json()
          if (!cancelled && data.content) {
            if (data.content.title) setFrequentTitle(data.content.title)
          }
        }
      } catch (error) {
        console.warn("Không thể tải content block home.frequentFeatures", error)
      }
    })()

    ;(async () => {
      try {
        const res = await fetch("/api/content-blocks/home.services")
        if (res.ok) {
          const data = await res.json()
          if (!cancelled && data.content?.title) {
            setServicesTitle(data.content.title)
          }
        }
      } catch (error) {
        console.warn("Không thể tải content block home.services", error)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

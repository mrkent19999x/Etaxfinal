"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useUserSession } from "@/hooks/use-user-session"
import { useBodyLock } from "@/hooks/use-body-lock"

export default function LoginPage() {
  const router = useRouter()
  const session = useUserSession()
  const [mst, setMst] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Khóa body scroll hoàn toàn khi component mount
  useBodyLock(true)

  useEffect(() => {
    if (!session.loading && session.isAuthenticated) {
      router.replace("/")
    }
  }, [session.loading, session.isAuthenticated, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!mst.trim() || !password.trim()) {
      setError("Vui lòng nhập MST và mật khẩu")
      setIsLoading(false)
      return
    }

    try {
      await session.login(mst.trim(), password.trim())
      router.replace("/")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="phone-frame relative flex flex-col overflow-hidden"
      style={{
        backgroundImage: "url('/assets/bglogin.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#103b90"
      }}
    >
      {/* Content - scrollable nếu cần nhưng body vẫn bị khóa */}
      <div className="relative z-10 flex-1 flex flex-col px-6 overflow-y-auto overscroll-contain" style={{ 
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 5.5rem)`, /* ~88px cho bottom nav + safe-area */
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        minHeight: 0 /* Cho phép flex-1 hoạt động đúng */
      }}>
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <Image
            src="/assets/logo.webp"
            alt="eTax Logo"
            width={96}
            height={96}
            className="object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            priority
          />
          <h1 className="text-white text-[28px] font-bold mt-4 tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
            eTax Mobile
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full space-y-6">
          {/* MST Input */}
          <div>
            <label htmlFor="mst-input" className="sr-only">
              Mã số thuế
            </label>
            <div className="flex items-center gap-3 min-h-[52px]">
              <Image 
                src="/assets/icon-mst-new.svg" 
                alt="" 
                width={20}
                height={20}
                className="opacity-95"
                aria-hidden="true"
              />
              <input
                id="mst-input"
                type="text"
                inputMode="numeric"
                placeholder="Mã số thuế"
                value={mst}
                onChange={(e) => setMst(e.target.value)}
                className="flex-1 bg-transparent text-white text-base py-2 outline-none placeholder:text-white/90 rounded-sm"
                autoComplete="username"
                aria-required="true"
                style={{ touchAction: 'manipulation' }}
              />
            </div>
            <div className="h-px bg-white/80 mt-0" />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password-input" className="sr-only">
              Mật khẩu
            </label>
            <div className="flex items-center gap-3 min-h-[52px]">
              <Image 
                src="/assets/icon-password-new.svg" 
                alt="" 
                width={20}
                height={20}
                className="opacity-95"
                aria-hidden="true"
              />
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-white text-base py-2 outline-none placeholder:text-white/90 rounded-sm"
                autoComplete="current-password"
                aria-required="true"
                style={{ touchAction: 'manipulation' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="w-[38px] h-[38px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/40 rounded-sm transition-colors"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                style={{ touchAction: 'manipulation' }}
              >
                <Image 
                  src={showPassword ? "/assets/icon-eye.svg" : "/assets/icon-eye-closed.svg"}
                  alt=""
                  width={20}
                  height={20}
                  className="opacity-70"
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="h-px bg-white/80 mt-0" />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-300 text-sm text-center font-medium" role="alert" aria-live="assertive">
              {error}
            </p>
          )}

          {/* Help Links */}
          <div className="flex justify-between gap-4 text-sm text-yellow-400 font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
            <a href="#" className="hover:text-yellow-200 transition-colors">
              Quên tài khoản (Mã số thuế)?
            </a>
            <a href="#" className="hover:text-yellow-200 transition-colors">
              Quên mật khẩu?
            </a>
          </div>

          {/* Login Button with Fingerprint Icon */}
          <div className="relative">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] rounded-[28px] bg-[color:var(--color-primary)] text-white font-bold text-base tracking-wide hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center focus:outline-none"
              style={{ touchAction: 'manipulation' }}
              aria-label={isLoading ? "Đang đăng nhập, vui lòng đợi" : "Đăng nhập"}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            {/* Fingerprint Icon Overlay */}
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 pointer-events-none" aria-hidden="true">
              <Image 
                src="/assets/faceid.png"
                alt=""
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
          </div>
        </form>

        {/* VNeID Login */}
        <div className="w-full mt-6">
          <button 
            className="w-full flex items-center gap-1.5 px-5 py-4 rounded-[18px] bg-white hover:bg-white/95 active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
            style={{ touchAction: 'manipulation' }}
            aria-label="Đăng nhập bằng tài khoản Định danh điện tử VNeID"
          >
            <div className="flex flex-col flex-1 text-center">
              <span className="text-[#111827] font-semibold text-[16px] leading-tight">
                Đăng nhập bằng tài khoản
              </span>
              <span className="text-[#111827] font-semibold text-[15px] leading-tight">
                Định danh điện tử
              </span>
            </div>
            <Image
              src="/assets/vnid.webp"
              alt=""
              width={44}
              height={44}
              className="object-contain"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Sign up Links */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between items-center text-base text-white">
            <span>Bạn chưa có tài khoản?</span>
            <a href="#" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
              Đăng ký ngay
            </a>
          </div>
          <div className="text-base text-white mt-4 w-full">
            Người nước ngoài hoặc người Việt Nam sống ở nước ngoài không có số định danh cá nhân-chưa có mã số thuế?{" "}
            <a href="#" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
              Đăng ký thuế ngay.
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav
        className="absolute bottom-0 inset-x-0 flex items-center justify-around py-3 px-6"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px) - 12px, 12px)" }}
        aria-label="Thanh điều hướng dưới cùng"
      >
        <button 
          className="flex flex-col items-center gap-1 active:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/40 rounded-sm" 
          style={{ touchAction: 'manipulation' }}
          aria-label="QR tem"
        >
          <Image src="/assets/icon-qr.webp" alt="" width={30} height={30} className="opacity-95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]" aria-hidden="true" />
          <span className="text-sm text-white">QR tem</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 active:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/40 rounded-sm" 
          style={{ touchAction: 'manipulation' }}
          aria-label="Tiện ích"
        >
          <Image src="/assets/tienich.png" alt="" width={30} height={30} className="opacity-95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]" aria-hidden="true" />
          <span className="text-sm text-white">Tiện ích</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 active:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/40 rounded-sm" 
          style={{ touchAction: 'manipulation' }}
          aria-label="Hỗ trợ"
        >
          <Image src="/assets/hotro.png" alt="" width={30} height={30} className="opacity-95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]" aria-hidden="true" />
          <span className="text-sm text-white">Hỗ trợ</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 active:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/40 rounded-sm" 
          style={{ touchAction: 'manipulation' }}
          aria-label="Chia sẻ"
        >
          <Image src="/assets/chiase.png" alt="" width={30} height={30} className="opacity-95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]" aria-hidden="true" />
          <span className="text-sm text-white">Chia sẻ</span>
        </button>
      </nav>
    </div>
  )
}

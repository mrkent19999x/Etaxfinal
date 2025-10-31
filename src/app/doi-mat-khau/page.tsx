"use client"

import { ChevronLeft, Home, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { ProtectedView } from "@/components/protected-view"
import { etaxHeaderStyle } from "@/components/header-style"

export default function DoiMatKhauPage() {
  const router = useRouter()
  
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp")
      return
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    // Simulate API call
    setTimeout(() => {
      setSuccess("Đổi mật khẩu thành công!")
      setTimeout(() => {
        router.push("/thiet-lap-ca-nhan")
      }, 1500)
    }, 1000)
  }
  return (
    <ProtectedView>
      <div className="h-full bg-gray-100 flex flex-col">
        {/* Header */}
        <header className="etax-header px-6 py-4 flex items-center justify-between text-white" style={etaxHeaderStyle}>
          <button 
            onClick={() => router.back()} 
            className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50 rounded-sm"
            aria-label="Quay lại"
          >
            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
          </button>
          <h1 className="text-white font-light text-lg">Đổi mật khẩu</h1>
          <Link 
            href="/"
            className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded-sm"
            aria-label="Về trang chủ"
          >
            <Home className="w-6 h-6 text-white cursor-pointer hover:opacity-80 transition-opacity" aria-hidden="true" />
          </Link>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 px-6 py-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Old Password */}
              <div>
                <label htmlFor="old-password" className="block text-gray-700 font-medium mb-2">Mật khẩu cũ</label>
                <div className="relative">
                  <input
                    id="old-password"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-red-200 pr-12"
                    placeholder="Nhập mật khẩu cũ"
                    autoComplete="current-password"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-200 rounded-sm"
                    aria-label={showOldPassword ? "Ẩn mật khẩu cũ" : "Hiện mật khẩu cũ"}
                  >
                    {showOldPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="new-password" className="block text-gray-700 font-medium mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-red-200 pr-12"
                    placeholder="Nhập mật khẩu mới"
                    autoComplete="new-password"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-200 rounded-sm"
                    aria-label={showNewPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="block text-gray-700 font-medium mb-2">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-red-200 pr-12"
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={confirmPassword && newPassword !== confirmPassword}
                    aria-describedby={confirmPassword && newPassword !== confirmPassword ? "password-mismatch-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-200 rounded-sm"
                    aria-label={showConfirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-[color:var(--color-primary)] text-sm text-center font-medium" role="alert" aria-live="assertive" id="password-mismatch-error">
                  {error}
                </p>
              )}

              {/* Success Message */}
              {success && (
                <p className="text-green-600 text-sm text-center font-medium" role="status" aria-live="polite">
                  {success}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
            className="w-full bg-[color:var(--color-primary)] hover:opacity-90 text-white font-semibold py-4 rounded-xl transition-colors focus:outline-none"
              >
                Đổi mật khẩu
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedView>
  )
}

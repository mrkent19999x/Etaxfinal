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
        <div className="etax-header px-6 py-4 flex items-center justify-between text-white" style={etaxHeaderStyle}>
          <button onClick={() => router.back()} className="hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-light text-lg">Đổi mật khẩu</h1>
          <Link href="/">
            <Home className="w-6 h-6 text-white cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 px-6 py-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Old Password */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Mật khẩu cũ</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none pr-12"
                    placeholder="Nhập mật khẩu cũ"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none pr-12"
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-600 focus:outline-none pr-12"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}

              {/* Success Message */}
              {success && <p className="text-green-600 text-sm text-center">{success}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 rounded-xl transition-colors"
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

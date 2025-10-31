"use client"

import { ChevronLeft, Home, Fingerprint, Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { ProtectedView } from "@/components/protected-view"
import { etaxHeaderStyle } from "@/components/header-style"

export default function VanTayPage() {
  const router = useRouter()
  
  const [biometricType, setBiometricType] = useState<"fingerprint" | "face">("fingerprint")
  const [isEnabled, setIsEnabled] = useState(false)

  const handleToggle = () => {
    setIsEnabled(!isEnabled)
    if (!isEnabled) {
      // Simulate biometric enrollment
      setTimeout(() => {
        alert("Đăng ký sinh trắc học thành công!")
      }, 1000)
    }
  }
  return (
    <ProtectedView>
      <div className="h-full bg-gray-100 flex flex-col">
        {/* Header */}
        <div className="etax-header px-6 py-4 flex items-center justify-between text-white" style={etaxHeaderStyle}>
          <button onClick={() => router.back()} className="hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-light text-lg">Sinh trắc học</h1>
          <Link href="/">
            <Home className="w-6 h-6 text-white cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 px-6 py-6">
          {/* Biometric Options */}
          <div className="space-y-4">
            {/* Fingerprint */}
            <div
              onClick={() => setBiometricType("fingerprint")}
              className={`bg-white rounded-2xl p-6 shadow-sm cursor-pointer transition-all ${
                biometricType === "fingerprint" ? "border-2 border-red-600" : "border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    biometricType === "fingerprint" ? "bg-red-100" : "bg-gray-100"
                  }`}
                >
                  <Fingerprint
                    className={`w-8 h-8 ${biometricType === "fingerprint" ? "text-red-600" : "text-gray-400"}`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Vân tay</h3>
                  <p className="text-sm text-gray-600">Đăng nhập bằng vân tay</p>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggle()
                  }}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    isEnabled && biometricType === "fingerprint" ? "bg-red-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white mt-1 transition-transform ${
                      isEnabled && biometricType === "fingerprint" ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Face ID */}
            <div
              onClick={() => setBiometricType("face")}
              className={`bg-white rounded-2xl p-6 shadow-sm cursor-pointer transition-all ${
                biometricType === "face" ? "border-2 border-red-600" : "border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    biometricType === "face" ? "bg-red-100" : "bg-gray-100"
                  }`}
                >
                  <Camera className={`w-8 h-8 ${biometricType === "face" ? "text-red-600" : "text-gray-400"}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Face ID</h3>
                  <p className="text-sm text-gray-600">Đăng nhập bằng nhận diện khuôn mặt</p>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggle()
                  }}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    isEnabled && biometricType === "face" ? "bg-red-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white mt-1 transition-transform ${
                      isEnabled && biometricType === "face" ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-800 mb-2">Hướng dẫn sử dụng</h3>
            <p className="text-sm text-gray-600 mb-4">
              Đăng ký sinh trắc học giúp bạn đăng nhập nhanh và bảo mật hơn
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
              <li>Chọn phương thức sinh trắc học bạn muốn sử dụng</li>
              <li>Bật công tắc để kích hoạt</li>
              <li>Làm theo hướng dẫn trên màn hình để đăng ký</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedView>
  )
}

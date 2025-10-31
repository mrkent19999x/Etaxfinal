"use client"

import type { ReactNode } from "react"

import { useAuthGuard } from "@/lib/auth-guard"
import { useBodyLock } from "@/hooks/use-body-lock"

interface ProtectedViewProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Bọc nội dung yêu cầu đăng nhập. Trả về fallback (spinner) trong lúc kiểm tra.
 */
export function ProtectedView({ children, fallback }: ProtectedViewProps) {
  const { isAuthenticated, isChecking } = useAuthGuard()
  useBodyLock(true)

  if (isChecking) {
    return (
      fallback ?? (
        <div className="phone-frame flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DC143C] mx-auto" />
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      )
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="phone-frame">
      {children}
    </div>
  )
}

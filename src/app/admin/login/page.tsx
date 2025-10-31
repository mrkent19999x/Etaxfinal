"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"

export default function AdminLoginPage() {
  const { login, loading, error, user } = useFirebaseAuth()
  const router = useRouter()
  const [email, setEmail] = useState("admin@etax.local")
  const [password, setPassword] = useState("admin123")
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.replace("/admin")
    }
  }, [loading, user, router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setSubmitting(true)

    if (!email.trim() || !password.trim()) {
      setFormError("Vui lòng nhập email và mật khẩu")
      setSubmitting(false)
      return
    }

    try {
      await login(email.trim(), password.trim())
      router.replace("/admin")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại"
      setFormError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold text-center text-red-600">Admin Dashboard</h1>
        <p className="text-center text-gray-600 mt-2">Đăng nhập để quản lý dữ liệu người dùng</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email quản trị</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="admin@etax.local"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="••••••"
            />
          </div>

          {(formError || error) && (
            <p className="text-sm text-red-500">{formError || error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-red-600 py-2 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  )
}

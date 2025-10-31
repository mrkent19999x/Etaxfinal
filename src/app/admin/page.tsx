"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useRequireAdmin } from "@/hooks/use-admin-auth"
import { FileText, Users, MapPin, Receipt } from "lucide-react"
import Link from "next/link"
import { listAccounts, type Account } from "@/lib/data-store"

export default function AdminDashboardPage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [statusMessage, setStatusMessage] = useState<string>("")

  useEffect(() => {
    if (!isAdmin) return

    let cancelled = false

    ;(async () => {
      try {
        const data = await listAccounts()
        if (cancelled) return
        setAccounts(data)
      } catch (error) {
        if (cancelled) return
        console.error("Không thể tải danh sách tài khoản", error)
        setStatusMessage("Không thể lấy danh sách tài khoản. Thử tải lại trang nhé.")
        setAccounts([])
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const totalUsers = accounts.filter((account) => account.role === "user").length
  const totalAdmins = accounts.filter((account) => account.role === "admin").length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // useRequireAdmin sẽ redirect
  }

  const stats = [
    { label: "Tài khoản người dùng", value: totalUsers.toString(), icon: Users, color: "bg-blue-500", href: "/admin/users" },
    { label: "Quản trị viên", value: totalAdmins.toString(), icon: FileText, color: "bg-green-500", href: "/admin/users" },
    { label: "Mapping MST", value: "0", icon: MapPin, color: "bg-yellow-500", href: "/admin/mappings" },
    { label: "Giao dịch", value: "0", icon: Receipt, color: "bg-purple-500", href: "/admin/transactions" },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-600 mt-1">Quản lý hệ thống eTax</p>
          {statusMessage ? <p className="mt-2 text-sm text-[color:var(--color-primary)]">{statusMessage}</p> : null}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/users"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="mb-2" size={24} />
              <p className="font-medium">Quản lý Users</p>
              <p className="text-sm text-gray-600">Tạo, sửa, xóa người dùng</p>
            </Link>
            <Link
              href="/admin/templates"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="mb-2" size={24} />
              <p className="font-medium">Quản lý Templates</p>
              <p className="text-sm text-gray-600">Tạo và chỉnh sửa PDF templates</p>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

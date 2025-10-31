"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { 
  Users, 
  FileText, 
  MapPin, 
  Receipt, 
  LogOut,
  Menu,
  X
} from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const { user, userData, logout } = useFirebaseAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: FileText },
    { href: "/admin/users", label: "Quản lý Users", icon: Users },
    { href: "/admin/templates", label: "Templates", icon: FileText },
    { href: "/admin/mappings", label: "Mapping Field", icon: MapPin },
    { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-bold text-[color:var(--color-primary)]">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{userData?.name || user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-30
            w-64 bg-white shadow-lg
            transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            transition-transform duration-200 ease-in-out
            pt-16 lg:pt-0
          `}
        >
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-[color:var(--color-primary)] rounded-lg transition-colors"
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Overlay cho mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

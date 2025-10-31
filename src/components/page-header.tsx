"use client"

import Link from "next/link"
import { ChevronLeft, Home, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { etaxHeaderStyle } from "./header-style"

interface PageHeaderProps {
  title: string
  showNotification?: boolean
}

export function PageHeader({ title, showNotification = true }: PageHeaderProps) {
  const router = useRouter()

  return (
    <header className="etax-header sticky top-0 z-50 flex items-center justify-between px-6 py-4 text-white" style={etaxHeaderStyle}>
      <button onClick={() => router.back()} className="p-2 hover:opacity-80 transition">
        <ChevronLeft size={24} />
      </button>

      <h1 className="text-xl font-semibold text-center flex-1">{title}</h1>

      <div className="flex gap-2">
        {showNotification && (
          <Link href="/thong-bao" className="p-2 hover:opacity-80 transition">
            <Bell size={24} />
          </Link>
        )}
        <Link href="/" className="p-2 hover:opacity-80 transition">
          <Home size={24} />
        </Link>
      </div>
    </header>
  )
}

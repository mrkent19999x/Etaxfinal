"use client"
import { Home, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { etaxHeaderStyle } from "./header-style"

interface DetailHeaderProps {
  title: string
}

export function DetailHeader({ title }: DetailHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  return (
    <div className="etax-header sticky top-0 z-50 flex items-center justify-between px-6 py-4 text-white" style={etaxHeaderStyle}>
      <button onClick={handleBack} className="hover:opacity-80 transition-opacity">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <h1 className="text-lg font-light">{title}</h1>
      <button onClick={() => router.push("/")} className="hover:opacity-80 transition-opacity">
        <Home className="w-6 h-6" />
      </button>
    </div>
  )
}

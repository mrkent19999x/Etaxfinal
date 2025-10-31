"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "./sidebar"

interface AppWrapperProps {
  children: React.ReactNode
  onMenuClick?: () => void
}

export function AppWrapper({ children }: AppWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {children}
    </>
  )
}

export function useSidebar() {
  return {
    openSidebar: () => {
      // This will be handled by the parent component
    },
  }
}

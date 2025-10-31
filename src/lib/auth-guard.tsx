"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useUserSession } from "@/hooks/use-user-session"

interface UseAuthGuardOptions {
  allowedPaths?: string[]
}

interface UseAuthGuardReturn {
  isAuthenticated: boolean
  isChecking: boolean
}

export function useAuthGuard(options: UseAuthGuardOptions = {}): UseAuthGuardReturn {
  const router = useRouter()
  const session = useUserSession()
  const { allowedPaths = ["/login"] } = options
  const allowedLookup = useMemo(() => new Set(allowedPaths), [allowedPaths])

  useEffect(() => {
    if (session.loading || session.isAuthenticated) {
      return
    }

    if (typeof window === "undefined") return
    const currentPath = window.location.pathname
    if (!allowedLookup.has(currentPath)) {
      router.replace("/login")
    }
  }, [session.loading, session.isAuthenticated, allowedLookup, router])

  return {
    isAuthenticated: session.isAuthenticated,
    isChecking: session.loading,
  }
}

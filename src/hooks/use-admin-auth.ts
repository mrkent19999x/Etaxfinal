"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebaseAuth } from "./use-firebase-auth"

interface UseAdminAuthReturn {
  isAdmin: boolean
  isLoading: boolean
  isChecking: boolean
}

export function useRequireAdmin(): UseAdminAuthReturn {
  const router = useRouter()
  const { user, loading, isAdmin: checkIsAdmin } = useFirebaseAuth()
  const isAdmin = checkIsAdmin() ?? false

  useEffect(() => {
    if (loading) return
    if (!user || !isAdmin) {
      router.push("/admin/login")
    }
  }, [user, isAdmin, loading, router])

  return {
    isAdmin,
    isLoading: loading,
    isChecking: loading,
  }
}

export function useAdminAuth(): UseAdminAuthReturn {
  const { loading, isAdmin: checkIsAdmin } = useFirebaseAuth()
  const isAdmin = checkIsAdmin() ?? false

  return {
    isAdmin,
    isLoading: loading,
    isChecking: loading,
  }
}

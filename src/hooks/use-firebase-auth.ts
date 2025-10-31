"use client"

import { useState, useEffect } from "react"
import {
  getAdminSession,
  loginAdmin,
  logoutAdmin,
  listAccounts,
  createAccount,
  type Account,
} from "@/lib/data-store"

interface AuthState {
  user: Account | null
  loading: boolean
  error: string | null
}

export function useFirebaseAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function initSession() {
      try {
        const session = await getAdminSession()
        setState({
          user: session,
          loading: false,
          error: null,
        })
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: null,
        })
      }
    }

    if (typeof window !== "undefined") {
      initSession()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const result = await loginAdmin(email, password)
      if (!result) {
        const errorMessage = "Sai email hoặc mật khẩu"
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }))
        throw new Error(errorMessage)
      }

      setState({ user: result, loading: false, error: null })
      return result
    } catch (error: any) {
      const errorMessage = error.message || "Đăng nhập thất bại"
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }))
      throw error
    }
  }

  const register = async (email: string, password: string, payload: Partial<Account>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const accounts = await listAccounts()
      const existing = accounts.find((account) => account.email.toLowerCase() === email.toLowerCase())
      if (existing) {
        throw new Error("Email đã tồn tại")
      }

      const created = await createAccount({
        email,
        password,
        name: payload.name ?? "Admin",
        role: "admin",
        mstList: payload.mstList ?? [],
        phone: payload.phone,
      })

      setState({ user: created, loading: false, error: null })
      return created
    } catch (error: any) {
      const errorMessage = error.message || "Đăng ký thất bại"
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }))
      throw error
    }
  }

  const logout = async () => {
    await logoutAdmin()
    setState({ user: null, loading: false, error: null })
  }

  const isAdmin = () => state.user?.role === "admin"

  const canAccessMst = (mst: string) => {
    if (state.user?.role === "admin") return true
    return state.user?.mstList?.includes(mst) ?? false
  }

  return {
    user: state.user,
    userData: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    isAdmin,
    canAccessMst,
  }
}

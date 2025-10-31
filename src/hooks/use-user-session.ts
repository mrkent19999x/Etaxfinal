"use client"

import { useState, useEffect } from "react"
import { getUserSession, loginUserByMst, logoutUser, getProfile } from "@/lib/data-store"

export interface UserSessionState {
  isAuthenticated: boolean
  mst: string | null
  name: string | null
  loading: boolean
  error: string | null
}

export function useUserSession() {
  const [state, setState] = useState<UserSessionState>({
    isAuthenticated: false,
    mst: null,
    name: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function initSession() {
      try {
        const session = await getUserSession()
        if (session) {
          const profile = await getProfile(session.mst)
          setState({
            isAuthenticated: true,
            mst: session.mst,
            name: profile?.fullName ?? session.name ?? session.mst,
            loading: false,
            error: null,
          })
        } else {
          setState({
            isAuthenticated: false,
            mst: null,
            name: null,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        setState({
          isAuthenticated: false,
          mst: null,
          name: null,
          loading: false,
          error: null,
        })
      }
    }

    if (typeof window !== "undefined") {
      initSession()
    }
  }, [])

  const login = async (mst: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const stored = await loginUserByMst(mst, password)
      if (!stored) {
        const errorMessage = "Sai MST hoặc mật khẩu"
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }))
        throw new Error(errorMessage)
      }

      const persisted = await getUserSession()
      const profile = await getProfile(stored.mst)
      setState({
        isAuthenticated: true,
        mst: stored.mst,
        name: profile?.fullName ?? persisted?.name ?? stored.mst,
        loading: false,
        error: null,
      })
    } catch (error: any) {
      const errorMessage = error.message || "Đăng nhập thất bại"
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }))
      throw error
    }
  }

  const logout = async () => {
    await logoutUser()
    setState({
      isAuthenticated: false,
      mst: null,
      name: null,
      loading: false,
      error: null,
    })
  }

  return {
    ...state,
    login,
    logout,
  }
}

export function useRequireUser() {
  return useUserSession()
}

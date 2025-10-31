"use client"

import { useEffect } from "react"

export function useBodyLock(lock: boolean = true) {
  useEffect(() => {
    if (!lock || typeof document === "undefined" || typeof window === "undefined") {
      return
    }

    const body = document.body
    const root = document.documentElement

    const previousBodyOverflow = body.style.overflow
    const previousBodyHeight = body.style.height
    const previousBodyPosition = body.style.position
    const previousBodyTop = body.style.top
    const previousBodyLeft = body.style.left
    const previousBodyWidth = body.style.width
    const previousBodyOverscroll = body.style.overscrollBehavior

    const previousRootOverflow = root.style.overflow
    const previousRootOverscroll = root.style.overscrollBehavior
    const previousRootHeight = root.style.height

    const scrollX = window.scrollX
    const scrollY = window.scrollY

    body.style.setProperty("overflow", "hidden", "important")
    body.style.height = "100%"
    body.style.width = "100%"
    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.left = `-${scrollX}px`
    body.style.overscrollBehavior = "contain"

    root.style.setProperty("overflow", "hidden", "important")
    root.style.overscrollBehavior = "contain"
    root.style.height = "100%"

    return () => {
      body.style.overflow = previousBodyOverflow
      body.style.height = previousBodyHeight
      body.style.position = previousBodyPosition
      body.style.top = previousBodyTop
      body.style.left = previousBodyLeft
      body.style.width = previousBodyWidth
      body.style.overscrollBehavior = previousBodyOverscroll

      root.style.overflow = previousRootOverflow
      root.style.overscrollBehavior = previousRootOverscroll
      root.style.height = previousRootHeight

      window.scrollTo(scrollX, scrollY)
    }
  }, [lock])
}


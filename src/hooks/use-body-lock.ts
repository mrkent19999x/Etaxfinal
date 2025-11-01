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
    const previousBodyAppHeight = body.style.getPropertyValue("--app-height")

    const previousRootOverflow = root.style.overflow
    const previousRootOverscroll = root.style.overscrollBehavior
    const previousRootHeight = root.style.height
    const previousRootAppHeight = root.style.getPropertyValue("--app-height")

    const scrollX = window.scrollX
    const scrollY = window.scrollY
    let rafId = 0

    const applyAppHeight = () => {
      const viewport = window.visualViewport
      const height = viewport?.height ?? window.innerHeight
      root.style.setProperty("--app-height", `${height}px`)
      body.style.setProperty("--app-height", `${height}px`)
    }

    const scheduleAppHeight = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      rafId = window.requestAnimationFrame(applyAppHeight)
    }

    scheduleAppHeight()

    window.addEventListener("resize", scheduleAppHeight)
    window.addEventListener("orientationchange", scheduleAppHeight)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", scheduleAppHeight)
      window.visualViewport.addEventListener("scroll", scheduleAppHeight)
    }

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
      if (previousBodyAppHeight) {
        body.style.setProperty("--app-height", previousBodyAppHeight)
      } else {
        body.style.removeProperty("--app-height")
      }

      root.style.overflow = previousRootOverflow
      root.style.overscrollBehavior = previousRootOverscroll
      root.style.height = previousRootHeight
      if (previousRootAppHeight) {
        root.style.setProperty("--app-height", previousRootAppHeight)
      } else {
        root.style.removeProperty("--app-height")
      }

      window.removeEventListener("resize", scheduleAppHeight)
      window.removeEventListener("orientationchange", scheduleAppHeight)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", scheduleAppHeight)
        window.visualViewport.removeEventListener("scroll", scheduleAppHeight)
      }
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }

      window.scrollTo(scrollX, scrollY)
    }
  }, [lock])
}

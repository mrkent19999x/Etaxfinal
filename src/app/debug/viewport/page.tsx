"use client"

import { useEffect, useState } from "react"

type Metrics = {
  innerHeight: number
  innerWidth: number
  clientHeight: number
  clientWidth: number
  visualViewportHeight: number | null
  visualViewportWidth: number | null
  appHeightVar: string | null
  safeBottom: number
  safeTop: number
}

export default function ViewportDebugPage() {
  const [m, setM] = useState<Metrics>(() => ({
    innerHeight: 0,
    innerWidth: 0,
    clientHeight: 0,
    clientWidth: 0,
    visualViewportHeight: null,
    visualViewportWidth: null,
    appHeightVar: null,
    safeBottom: 0,
    safeTop: 0,
  }))

  useEffect(() => {
    const update = () => {
      const root = document.documentElement
      const cs = getComputedStyle(root)
      const vv = window.visualViewport
      const safeBottom = parseInt(
        getComputedStyle(document.body).getPropertyValue("padding-bottom").replace("px", ""),
        10,
      ) || 0
      const safeTop = parseInt(cs.getPropertyValue("padding-top").replace("px", ""), 10) || 0

      setM({
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
        clientHeight: root.clientHeight,
        clientWidth: root.clientWidth,
        visualViewportHeight: vv?.height ?? null,
        visualViewportWidth: vv?.width ?? null,
        appHeightVar: cs.getPropertyValue("--app-height") || null,
        safeBottom,
        safeTop,
      })
    }
    update()
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)
    window.visualViewport?.addEventListener("resize", update)
    window.visualViewport?.addEventListener("scroll", update)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
      window.visualViewport?.removeEventListener("resize", update)
      window.visualViewport?.removeEventListener("scroll", update)
    }
  }, [])

  return (
    <div className="phone-frame flex flex-col" style={{ background: "#0b2d66" }}>
      <div className="p-4 text-white space-y-3 overflow-y-auto">
        <h1 className="text-xl font-semibold">Viewport Debug</h1>
        <ul className="space-y-1">
          <li>innerHeight: {m.innerHeight}px</li>
          <li>innerWidth: {m.innerWidth}px</li>
          <li>root.clientHeight: {m.clientHeight}px</li>
          <li>root.clientWidth: {m.clientWidth}px</li>
          <li>visualViewport.height: {m.visualViewportHeight ?? "(null)"}px</li>
          <li>visualViewport.width: {m.visualViewportWidth ?? "(null)"}px</li>
          <li>--app-height: {m.appHeightVar ?? "(unset)"}</li>
          <li>safe-area top padding: {m.safeTop}px</li>
          <li>safe-area bottom padding: {m.safeBottom}px</li>
        </ul>

        <p className="mt-3 text-sm text-white/80">
          Tip: add this page to home screen and open in standalone to reproduce PWA conditions on iOS.
        </p>
      </div>

      <div
        className="mt-auto text-center text-white py-3"
        style={{
          background: "rgba(255,255,255,0.1)",
          paddingBottom: "max(env(safe-area-inset-bottom, 0px) - 12px, 12px)",
        }}
      >
        Bottom bar – should sit just above the home indicator
      </div>
    </div>
  )
}


"use client"

interface PhoneFrameWrapperProps {
  children: React.ReactNode
}

export function PhoneFrameWrapper({ children }: PhoneFrameWrapperProps) {
  return (
    <div className="phone-frame">
      {children}
    </div>
  )
}


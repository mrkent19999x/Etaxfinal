"use client"

import React from "react"

interface BackgroundWrapperProps {
  children: React.ReactNode
  imageUrl?: string
  className?: string
}

export function BackgroundWrapper({ 
  children, 
  imageUrl = "", 
  className = "" 
}: BackgroundWrapperProps) {
  // Nếu có imageUrl thì dùng ảnh nền, nếu không thì dùng màu đỏ mặc định
  const backgroundStyle = imageUrl 
    ? { 
        backgroundImage: `url('${imageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {}

  return (
    <div 
      className={`min-h-screen ${className}`}
      style={backgroundStyle}
    >
      {children}
    </div>
  )
}
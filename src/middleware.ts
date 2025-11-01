import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { parseSessionCookie } from "@/lib/cookie-utils"

const PUBLIC_PATHS = [
  "/login",
  "/admin/login",
  "/manifest.json",
  "/sw.js",
  "/offline.html",
  "/icon-192.png",
  "/icon-512.png",
]

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))) {
    return true
  }
  if (pathname.startsWith("/assets") || pathname.startsWith("/_next") || pathname.startsWith("/api/auth/login")) {
    return true
  }
  return false
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Allow API routes (they have their own auth)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Get session cookie
  const sessionCookie = req.cookies.get("etax_session")?.value

  if (!sessionCookie) {
    // Not logged in - redirect to appropriate login
    const url = req.nextUrl.clone()
    if (pathname.startsWith("/admin")) {
      url.pathname = "/admin/login"
    } else {
      url.pathname = "/login"
    }
    return NextResponse.redirect(url)
  }

  // Parse và verify session cookie (hỗ trợ cả signed JWT và legacy JSON)
  try {
    const sessionData = await parseSessionCookie(sessionCookie)
    
    if (!sessionData || !sessionData.uid) {
      throw new Error("Invalid session")
    }

    // Check admin routes
    if (pathname.startsWith("/admin")) {
      if (!sessionData.admin) {
        const url = req.nextUrl.clone()
        url.pathname = "/admin/login"
        return NextResponse.redirect(url)
      }
    }

    return NextResponse.next()
  } catch (error: any) {
    // Session invalid or expired
    const url = req.nextUrl.clone()
    if (pathname.startsWith("/admin")) {
      url.pathname = "/admin/login"
    } else {
      url.pathname = "/login"
    }
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

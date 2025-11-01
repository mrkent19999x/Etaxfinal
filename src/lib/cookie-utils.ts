import { SignJWT, jwtVerify } from "jose"

const ALGORITHM = "HS256"

/**
 * Get cookie secret từ env var hoặc fallback
 * @returns string - Secret key để sign cookies
 */
function getCookieSecret(): string {
  const secret = process.env.COOKIE_SECRET
  
  if (!secret) {
    // Fallback cho development (không an toàn cho production)
    if (process.env.NODE_ENV === "development") {
      console.warn("[cookie-utils] COOKIE_SECRET not set, using fallback secret (NOT SECURE)")
      return "dev-secret-key-not-secure-change-in-production"
    }
    throw new Error("COOKIE_SECRET environment variable is required")
  }
  
  if (secret.length < 32) {
    console.warn("[cookie-utils] COOKIE_SECRET should be at least 32 characters")
  }
  
  return secret
}

/**
 * Sign session data thành JWT token
 * @param data - Session data object
 * @returns Promise<string> - Signed JWT token
 */
export async function signSessionCookie(data: Record<string, any>): Promise<string> {
  const secret = new TextEncoder().encode(getCookieSecret())
  
  const jwt = await new SignJWT(data)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime("8h") // 8 hours
    .sign(secret)
  
  return jwt
}

/**
 * Verify và decode JWT token từ cookie
 * @param token - JWT token string
 * @returns Promise<Record<string, any> | null> - Decoded session data hoặc null nếu invalid
 */
export async function verifySessionCookie(token: string): Promise<Record<string, any> | null> {
  try {
    const secret = new TextEncoder().encode(getCookieSecret())
    
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM],
    })
    
    return payload as Record<string, any>
  } catch (error: any) {
    // Token expired, invalid signature, etc.
    console.warn("[cookie-utils] Failed to verify session cookie:", error.message)
    return null
  }
}

/**
 * Parse cookie value - hỗ trợ cả signed JWT và plain JSON (backward compatibility)
 * @param cookieValue - Cookie value string
 * @returns Promise<Record<string, any> | null> - Parsed session data
 */
export async function parseSessionCookie(cookieValue: string): Promise<Record<string, any> | null> {
  if (!cookieValue) {
    return null
  }
  
  // Try decode URL encoding first
  let decoded: string
  try {
    decoded = decodeURIComponent(cookieValue)
  } catch {
    decoded = cookieValue
  }
  
  // Try verify as JWT first (new format)
  const jwtResult = await verifySessionCookie(decoded)
  if (jwtResult) {
    return jwtResult
  }
  
  // Fallback: try parse as JSON (old format - backward compatibility)
  try {
    const parsed = JSON.parse(decoded)
    // Validate structure
    if (parsed && typeof parsed === "object" && parsed.uid) {
      console.warn("[cookie-utils] Using unsigned cookie (legacy format). Consider migrating to signed cookies.")
      return parsed
    }
  } catch {
    // Not valid JSON either
  }
  
  return null
}


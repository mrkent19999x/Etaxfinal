import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// In-memory store cho development
interface MemoryStore {
  [key: string]: { count: number; resetTime: number }
}

class MemoryRateLimit {
  private store: MemoryStore = {}
  private limit: number
  private windowSeconds: number

  constructor(limit: number, windowSeconds: number) {
    this.limit = limit
    this.windowSeconds = windowSeconds
    
    // Clean up expired entries every minute
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), 60000)
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    }
  }

  async check(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now()
    const windowMs = this.windowSeconds * 1000
    
    // Get or create entry
    let entry = this.store[identifier]
    
    if (!entry || entry.resetTime < now) {
      // New window or expired, reset
      entry = {
        count: 0,
        resetTime: now + windowMs,
      }
      this.store[identifier] = entry
    }
    
    entry.count++
    
    const remaining = Math.max(0, this.limit - entry.count)
    const success = entry.count <= this.limit
    
    return {
      success,
      limit: this.limit,
      remaining,
      reset: entry.resetTime,
    }
  }
}

/**
 * Get rate limiter instance
 * - Development: In-memory store
 * - Production: Upstash Redis (nếu có config)
 */
function getRateLimiter() {
  // Check if Upstash Redis is configured
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN
  
  if (upstashUrl && upstashToken && process.env.NODE_ENV === "production") {
    // Use Upstash Redis for production
    const redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    })
    
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
      analytics: true,
    })
  }
  
  // Fallback to in-memory store for development
  console.log("[rate-limit] Using in-memory rate limiter (development mode)")
  return new MemoryRateLimit(5, 15 * 60) // 5 attempts per 15 minutes
}

// Define a type that represents both possible return types
type RateLimiter = InstanceType<typeof Ratelimit> | MemoryRateLimit

// Helper type guard functions
function isUpstashRateLimiter(limiter: RateLimiter): limiter is InstanceType<typeof Ratelimit> {
  return limiter && typeof (limiter as any).limit === "function"
}

function isMemoryRateLimiter(limiter: RateLimiter): limiter is MemoryRateLimit {
  return limiter && typeof (limiter as any).check === "function"
}

// Login rate limiter: 5 attempts per 15 minutes per IP
export const loginRateLimiter: RateLimiter = getRateLimiter()

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(req: Request): string {
  // Try to get IP from headers (Vercel, Cloudflare, etc.)
  const forwarded = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  const cfConnectingIp = req.headers.get("cf-connecting-ip")
  
  const ip = cfConnectingIp || realIp || (forwarded ? forwarded.split(",")[0].trim() : null) || "unknown"
  
  return `login:${ip}`
}

/**
 * Check rate limit for a request
 * @returns { limit: number; remaining: number; reset: number } hoặc null nếu không limit
 */
export async function checkRateLimit(req: Request): Promise<{ success: boolean; limit: number; remaining: number; reset: number } | null> {
  try {
    const identifier = getClientIdentifier(req)
    
    // Check if using Upstash Ratelimit (has limit method) or MemoryRateLimit (has check method)
    if (isUpstashRateLimiter(loginRateLimiter)) {
      return await loginRateLimiter.limit(identifier)
    } else if (isMemoryRateLimiter(loginRateLimiter)) {
      return await loginRateLimiter.check(identifier)
    } else {
      console.error("[rate-limit] Unknown rate limiter type")
      return null
    }
  } catch (error) {
    console.error("[rate-limit] Error checking rate limit:", error)
    // Fail open: nếu rate limiter fail, allow request (better UX than blocking all)
    return null
  }
}


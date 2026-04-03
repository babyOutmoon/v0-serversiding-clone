// Simple in-memory rate limiter
// Note: This resets on server restart. For production, use Redis-based rate limiting.

type RateLimitEntry = {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries on each request (lazy cleanup)
function cleanupOldEntries() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

export type RateLimitConfig = {
  windowMs: number  // Time window in milliseconds
  maxRequests: number  // Max requests per window
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 60 }
): { success: boolean; remaining: number; resetIn: number } {
  // Lazy cleanup on each request
  cleanupOldEntries()
  
  const now = Date.now()
  const key = identifier
  
  const entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return { 
      success: true, 
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs
    }
  }
  
  if (entry.count >= config.maxRequests) {
    // Rate limited
    return { 
      success: false, 
      remaining: 0,
      resetIn: entry.resetTime - now
    }
  }
  
  // Increment counter
  entry.count++
  rateLimitStore.set(key, entry)
  
  return { 
    success: true, 
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now
  }
}

// Get client IP from request
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const real = request.headers.get("x-real-ip")
  
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  
  if (real) {
    return real
  }
  
  return "unknown"
}

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  // Login: 5 attempts per minute
  login: { windowMs: 60000, maxRequests: 5 },
  // Signup: 3 attempts per 5 minutes
  signup: { windowMs: 300000, maxRequests: 3 },
  // Admin API: 30 requests per minute
  admin: { windowMs: 60000, maxRequests: 30 },
  // General API: 60 requests per minute
  general: { windowMs: 60000, maxRequests: 60 },
  // Whitelist check: 100 requests per minute (for Roblox scripts)
  whitelist: { windowMs: 60000, maxRequests: 100 },
  // Key redemption: 5 per minute
  redeem: { windowMs: 60000, maxRequests: 5 },
}

import { NextResponse } from "next/server"
import { getUserByUsername, updateUser, isBlacklisted } from "@/lib/db"
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit"

// Verify Cloudflare Turnstile token
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    console.warn("Turnstile secret key not configured - skipping verification")
    return true // Skip if not configured
  }

  try {
    const formData = new FormData()
    formData.append("secret", secretKey)
    formData.append("response", token)
    formData.append("remoteip", ip)

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: formData }
    )

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("Turnstile verification error:", error)
    return false
  }
}

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const ip = getClientIP(request)
    
    // Rate limit check - 5 login attempts per minute per IP
    const rateLimitResult = rateLimit(`login:${ip}`, RATE_LIMITS.login)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateLimitResult.resetIn / 1000)),
            "X-RateLimit-Remaining": "0",
          }
        }
      )
    }

    const { username, password, turnstileToken } = await request.json()

    // Verify Cloudflare Turnstile if token provided
    if (turnstileToken) {
      const isValidTurnstile = await verifyTurnstile(turnstileToken, ip)
      if (!isValidTurnstile) {
        return NextResponse.json(
          { error: "Security verification failed. Please try again." },
          { status: 400 }
        )
      }
    } else if (process.env.TURNSTILE_SECRET_KEY) {
      // If Turnstile is configured but no token provided
      return NextResponse.json(
        { error: "Security verification required" },
        { status: 400 }
      )
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    // Check if user is blacklisted
    const blacklisted = await isBlacklisted(username)
    if (blacklisted) {
      return NextResponse.json(
        { 
          error: "blacklisted",
          blacklist: {
            reason: "You have been blacklisted",
          }
        },
        { status: 403 }
      )
    }

    // Find user
    const user = await getUserByUsername(username)
    
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }

    // Update user info
    await updateUser(username, {
      last_login: new Date().toISOString(),
      ip,
      is_online: true,
    })

    // Create session with 30-day expiration
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        plan: user.plan,
        robloxUsername: user.roblox_username,
        avatar: user.avatar,
      },
      sessionToken,
      expiresAt,
    })

    // Set cookie for session persistence (30 days)
    response.cookies.set("moonss_auth", JSON.stringify({
      username: user.username,
      sessionToken,
      role: user.role,
      id: user.id,
      email: user.email,
      plan: user.plan,
      robloxUsername: user.roblox_username,
      avatar: user.avatar,
      expiresAt,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: "/",
    })

    // Set secure HTTP-only session cookie for API authentication
    const secureSession = Buffer.from(`${user.username}:${Date.now()}:${sessionToken}`).toString("base64")
    response.cookies.set("moon_session", secureSession, {
      httpOnly: true, // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

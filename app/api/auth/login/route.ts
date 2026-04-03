import { NextResponse } from "next/server"
import { 
  getUserByUsername, 
  updateUser, 
  isBlacklisted,
  isAccountLocked,
  incrementFailedLogins,
  resetFailedLogins,
  logSecurityEvent
} from "@/lib/db"
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const ip = getClientIP(request)
    
    // Rate limit check - 5 login attempts per minute per IP
    const rateLimitResult = rateLimit(`login:${ip}`, RATE_LIMITS.login)
    if (!rateLimitResult.success) {
      await logSecurityEvent("login_rate_limit", ip, null, "Login rate limit exceeded")
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

    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    // Check if user is blacklisted
    const blacklisted = await isBlacklisted(username)
    if (blacklisted) {
      await logSecurityEvent("login_blacklisted", ip, username, "Blacklisted user attempted login")
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

    // Check if account is locked
    const locked = await isAccountLocked(username)
    if (locked) {
      await logSecurityEvent("login_locked", ip, username, "Locked account login attempt")
      return NextResponse.json(
        { error: "Account is temporarily locked due to too many failed attempts. Please try again in 15 minutes." },
        { status: 423 }
      )
    }

    // Find user
    const user = await getUserByUsername(username)
    
    if (!user || user.password !== password) {
      // Log failed attempt and increment counter
      if (user) {
        const failCount = await incrementFailedLogins(username)
        await logSecurityEvent("login_failed", ip, username, `Failed login attempt ${failCount}`)
        
        if (failCount >= 5) {
          return NextResponse.json(
            { error: "Account locked due to too many failed attempts. Please try again in 15 minutes." },
            { status: 423 }
          )
        }
      }
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }

    // Check email verification (but allow existing users who haven't verified yet)
    if (user.email_verified === false && user.verification_token) {
      return NextResponse.json(
        { 
          error: "Please verify your email address before logging in. Check your inbox for the verification link.",
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 }
      )
    }

    // Reset failed login attempts on successful login
    await resetFailedLogins(username)

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

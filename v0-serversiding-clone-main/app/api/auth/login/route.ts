import { NextResponse } from "next/server"
import { users, sessions, isBlacklisted } from "@/lib/store"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    // Get client IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "Unknown"

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    // Check if user is blacklisted
    const blacklistEntry = isBlacklisted(username)
    if (blacklistEntry) {
      return NextResponse.json(
        { 
          error: "blacklisted",
          blacklist: {
            reason: blacklistEntry.reason,
            blacklistedBy: blacklistEntry.blacklistedBy,
            blacklistedAt: blacklistEntry.blacklistedAt,
          }
        },
        { status: 403 }
      )
    }

    // Find user
    const user = users.get(username.toLowerCase())
    
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }

    // Update user info
    user.lastLogin = new Date().toISOString()
    user.ip = ip
    user.isOnline = true

    // Create session with 30-day expiration
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    sessions.set(username.toLowerCase(), { token: sessionToken, expiresAt })

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        plan: user.plan,
        robloxUsername: user.robloxUsername,
      },
      sessionToken,
      expiresAt,
    })

    // Set HTTP-only cookie for session persistence
    response.cookies.set("moonss_auth", JSON.stringify({
      username: user.username,
      sessionToken,
      role: user.role,
      id: user.id,
      email: user.email,
      plan: user.plan,
      robloxUsername: user.robloxUsername,
      expiresAt,
    }), {
      httpOnly: false, // Allow JS access for client-side state
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

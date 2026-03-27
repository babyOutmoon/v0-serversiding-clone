import { NextResponse } from "next/server"
import { getUserByUsername, updateUser, isBlacklisted } from "@/lib/db"

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
    console.log("[v0] Looking up user:", username)
    const user = await getUserByUsername(username)
    console.log("[v0] User found:", user ? "yes" : "no", user ? { id: user.id, plan: user.plan } : null)
    
    if (!user || user.password !== password) {
      console.log("[v0] Login failed - user exists:", !!user, "password match:", user?.password === password)
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

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

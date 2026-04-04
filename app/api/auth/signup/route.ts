import { NextResponse } from "next/server"
import { getUserByUsername, createUser } from "@/lib/db"
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
    // Get client IP
    const ip = getClientIP(request)
    
    // Rate limit check
    const rateLimitResult = rateLimit(`signup:${ip}`, RATE_LIMITS.signup)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      )
    }
    
    const { username, email, password, turnstileToken } = await request.json()

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

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate username - alphanumeric only, no special chars
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters" },
        { status: 400 }
      )
    }

    // Password strength check
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      )
    }

    // Create user with email_verified = false
    const newUser = await createUser({
      username,
      password,
      email,
      ip,
      role: "user",
      plan: "none",
    })

    if (!newUser) {
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully!",
      username: newUser.username,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { getUserByUsername, createUser, setVerificationCode, logSecurityEvent, checkDuplicateFingerprint, setUserFingerprint } from "@/lib/db"
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email"
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit"

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
    
    // Check security block
    const securityCheck = await logSecurityEvent(ip, "signup")
    if (securityCheck.blocked) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please try again in 1 hour." },
        { status: 429 }
      )
    }

    const { username, email, password, fingerprint } = await request.json()

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

    // Check for duplicate fingerprint (same device trying to create multiple accounts)
    if (fingerprint) {
      const isDuplicate = await checkDuplicateFingerprint(fingerprint)
      if (isDuplicate) {
        return NextResponse.json(
          { error: "An account already exists on this device" },
          { status: 400 }
        )
      }
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

    // Set fingerprint if provided
    if (fingerprint) {
      await setUserFingerprint(username, fingerprint)
    }

    // Generate and send verification code
    const verificationCode = generateVerificationCode()
    await setVerificationCode(username, verificationCode)
    
    const emailSent = await sendVerificationEmail(email, verificationCode, username)
    
    if (!emailSent) {
      console.error("[signup] Failed to send verification email to:", email)
    }

    return NextResponse.json({
      success: true,
      message: "Account created! Please check your email for verification code.",
      requiresVerification: true,
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

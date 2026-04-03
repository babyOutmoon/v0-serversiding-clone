import { NextResponse } from "next/server"
import { getUserByUsername, getUserByEmail, createUser, setVerificationToken, logSecurityEvent } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
    
    // Rate limit - 3 signup attempts per hour per IP
    const rateLimitResult = rateLimit(`signup:${ip}`, RATE_LIMITS.signup)
    if (!rateLimitResult.success) {
      await logSecurityEvent("signup_rate_limit", ip, null, "Signup rate limit exceeded")
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      )
    }

    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate username (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters (letters, numbers, underscore only)" },
        { status: 400 }
      )
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    // Block disposable/temporary email domains
    const blockedDomains = [
      "tempmail", "guerrillamail", "10minutemail", "mailinator", "throwaway",
      "fakeinbox", "trashmail", "yopmail", "temp-mail", "disposable"
    ]
    const emailDomain = email.split("@")[1]?.toLowerCase() || ""
    if (blockedDomains.some(d => emailDomain.includes(d))) {
      await logSecurityEvent("blocked_email_domain", ip, username, `Blocked: ${emailDomain}`)
      return NextResponse.json(
        { error: "Please use a valid email address (temporary emails not allowed)" },
        { status: 400 }
      )
    }

    // Validate password strength
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

    // Check if email already exists
    const existingEmail = await getUserByEmail(email)
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
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
      email_verified: false,
    })

    if (!newUser) {
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      )
    }

    // Generate and send verification email
    const verificationToken = await setVerificationToken(username)
    if (verificationToken) {
      const emailResult = await sendVerificationEmail(email, username, verificationToken)
      if (!emailResult.success) {
        console.error("[signup] Failed to send verification email:", emailResult.error)
      }
    }

    await logSecurityEvent("signup_success", ip, username, "Account created, verification email sent")

    return NextResponse.json({
      success: true,
      message: "Account created! Please check your email to verify your account.",
      requiresVerification: true,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

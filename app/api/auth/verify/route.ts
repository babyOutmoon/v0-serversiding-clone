import { NextResponse } from "next/server"
import { verifyEmail, setVerificationCode, getUserEmail, clearSecurityBlock } from "@/lib/db"
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email"
import { rateLimit, getClientIP } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
    
    // Rate limit - 10 verification attempts per 15 minutes
    const rateLimitResult = rateLimit(`verify:${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 10 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      )
    }

    const { username, code, action } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      )
    }

    // Resend verification code
    if (action === "resend") {
      const email = await getUserEmail(username)
      if (!email) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }

      const newCode = generateVerificationCode()
      await setVerificationCode(username, newCode)
      
      const sent = await sendVerificationEmail(email, newCode, username)
      if (!sent) {
        return NextResponse.json(
          { error: "Failed to send verification email" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent!",
      })
    }

    // Verify code
    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      )
    }

    const result = await verifyEmail(username, code)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Verification failed" },
        { status: 400 }
      )
    }

    // Clear any security blocks for this IP on successful verification
    await clearSecurityBlock(ip, "signup")

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    })
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

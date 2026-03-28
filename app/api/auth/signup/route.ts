import { NextResponse } from "next/server"
import { getUserByUsername, createEmailVerification } from "@/lib/db"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()
    
    // Get client IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "Unknown"

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate username
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters" },
        { status: 400 }
      )
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
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

    // Generate verification code
    const code = generateCode()

    // Store verification data (password stored temporarily until verified)
    const verification = await createEmailVerification({
      email,
      code,
      username,
      password: `${password}|||${ip}`, // Store IP with password temporarily
    })

    if (!verification) {
      return NextResponse.json(
        { error: "Failed to create verification" },
        { status: 500 }
      )
    }

    // Send verification email
    const { error: emailError } = await resend.emails.send({
      from: "Moon <onboarding@resend.dev>",
      to: email,
      subject: "Verify your Moon account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0f;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #a855f7; margin: 0; font-size: 36px;">Moon</h1>
            <p style="color: #666; margin-top: 5px;">Server-Side Executor</p>
          </div>
          <div style="background: #1a1a2e; border-radius: 12px; padding: 30px; text-align: center; border: 1px solid #333;">
            <h2 style="color: #fff; margin-top: 0;">Verify your email</h2>
            <p style="color: #aaa;">Hi ${username}, use the code below to verify your account:</p>
            <div style="background: #2a2a4e; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #a855f7;">${code}</span>
            </div>
            <p style="color: #888; font-size: 14px;">This code expires in 10 minutes.</p>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            If you didn&apos;t request this, you can ignore this email.
          </p>
        </div>
      `,
    })

    if (emailError) {
      console.error("[signup] Email error:", emailError)
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
      requiresVerification: true,
      email,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

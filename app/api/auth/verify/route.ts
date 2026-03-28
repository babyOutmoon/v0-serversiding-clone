import { NextResponse } from "next/server"
import { verifyEmailCode, deleteEmailVerification, createUser, getUserByUsername } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      )
    }

    // Verify the code
    const verification = await verifyEmailCode(email, code)
    
    if (!verification) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      )
    }

    // Check if username is still available (in case someone else took it)
    const existingUser = await getUserByUsername(verification.username)
    if (existingUser) {
      await deleteEmailVerification(verification.id)
      return NextResponse.json(
        { error: "Username is no longer available. Please sign up again." },
        { status: 400 }
      )
    }

    // Parse password and IP from stored data
    const [password, ip] = verification.password.split("|||")

    // Create the user
    const newUser = await createUser({
      username: verification.username,
      password,
      email: verification.email,
      ip: ip || "Unknown",
      role: "user",
      plan: "none",
    })

    // Delete the verification record
    await deleteEmailVerification(verification.id)

    if (!newUser) {
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Email verified! Account created successfully.",
    })
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

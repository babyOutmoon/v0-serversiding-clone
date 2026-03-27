import { NextResponse } from "next/server"
import { getUserByUsername, createUser } from "@/lib/db"

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

    // Check if username already exists
    console.log("[v0] Checking if username exists:", username)
    const existingUser = await getUserByUsername(username)
    console.log("[v0] Existing user:", existingUser ? "found" : "not found")
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      )
    }

    // Create user
    console.log("[v0] Creating new user:", username)
    const newUser = await createUser({
      username,
      password,
      email,
      ip,
      role: "user",
      plan: "none",
    })

    console.log("[v0] New user result:", newUser ? "created" : "failed")
    if (!newUser) {
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

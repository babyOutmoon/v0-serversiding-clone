import { NextResponse } from "next/server"

// Simple in-memory user store (shared with login - in production use database)
const users: Map<string, { id: string; username: string; password: string; email: string; role: string }> = new Map()

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Check if username already exists
    if (users.has(username.toLowerCase())) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      )
    }

    // Check if username is reserved (admin)
    if (username.toLowerCase() === "moonv2") {
      return NextResponse.json(
        { error: "This username is not available" },
        { status: 400 }
      )
    }

    // Create user
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      password, // In production, hash the password!
      email,
      role: "user",
    }

    users.set(username.toLowerCase(), newUser)

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export { users }

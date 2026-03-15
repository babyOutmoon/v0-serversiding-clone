import { NextResponse } from "next/server"
import { users, type User } from "@/lib/store"

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
    if (users.has(username.toLowerCase())) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      )
    }

    // Create user
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      password,
      email,
      role: "user",
      ip,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isOnline: false,
      robloxUsername: null,
      plan: "none",
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

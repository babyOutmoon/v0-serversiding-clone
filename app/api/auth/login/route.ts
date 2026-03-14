import { NextResponse } from "next/server"

// Admin credentials - in production, use proper database
const ADMIN_USER = {
  username: "MoonV2",
  password: "Nah2828",
  role: "admin",
  id: "admin-001",
}

// Simple in-memory user store for demo (in production, use a database)
const users: Map<string, { id: string; username: string; password: string; email: string; role: string }> = new Map()

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    // Check admin credentials
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
      return NextResponse.json({
        success: true,
        user: {
          id: ADMIN_USER.id,
          username: ADMIN_USER.username,
          role: ADMIN_USER.role,
        },
      })
    }

    // Check registered users
    const user = users.get(username.toLowerCase())
    if (user && user.password === password) {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      })
    }

    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

// Export users map for signup route
export { users }

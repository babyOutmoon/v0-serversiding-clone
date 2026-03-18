import { NextResponse } from "next/server"
import { isBlacklisted, getUserByUsername } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    // Check blacklist
    const blacklisted = await isBlacklisted(username)
    if (blacklisted) {
      return NextResponse.json({
        valid: false,
        blacklisted: true,
        blacklist: {
          reason: "You have been blacklisted",
        }
      })
    }

    // Get user info
    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json({ valid: false, reason: "User not found" })
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        plan: user.plan,
        robloxUsername: user.roblox_username,
        avatar: user.avatar,
      }
    })
  } catch (error) {
    console.error("Check error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

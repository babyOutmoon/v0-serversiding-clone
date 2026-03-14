import { NextResponse } from "next/server"
import { isBlacklisted, isSessionValid, sessions, users } from "@/lib/store"

export async function POST(request: Request) {
  try {
    const { username, sessionToken } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    // Check blacklist
    const blacklistEntry = isBlacklisted(username)
    if (blacklistEntry) {
      return NextResponse.json({
        valid: false,
        blacklisted: true,
        blacklist: {
          reason: blacklistEntry.reason,
          blacklistedBy: blacklistEntry.blacklistedBy,
          blacklistedAt: blacklistEntry.blacklistedAt,
        }
      })
    }

    // Verify session with expiration check
    const session = sessions.get(username.toLowerCase())
    if (!session || !isSessionValid(username, sessionToken)) {
      return NextResponse.json({ valid: false, reason: "Session expired" })
    }

    // Get user info
    const user = users.get(username.toLowerCase())
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
        robloxUsername: user.robloxUsername,
      }
    })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

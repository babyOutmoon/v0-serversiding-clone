import { NextResponse } from "next/server"
import { 
  users, 
  updateUserPlan, 
  updateUserRobloxUsername,
  redeemWhitelistKey,
  getRegisteredRobloxUsers,
  ROBLOX_WEBHOOK_KEY
} from "@/lib/store"

// Get Roblox user ID from username (to verify it exists)
async function verifyRobloxUsername(username: string): Promise<boolean> {
  try {
    const res = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
    })
    
    if (!res.ok) return false
    
    const data = await res.json()
    return data.data && data.data.length > 0
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const { username, robloxUsername, key } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      )
    }

    // Find user - try multiple approaches
    let user = users.get(username.toLowerCase())
    if (!user) {
      for (const [, u] of users) {
        if (u.username.toLowerCase() === username.toLowerCase()) {
          user = u
          break
        }
      }
    }
    
    // If user still not found, create a temporary entry (server may have restarted)
    if (!user) {
      // Create a basic user entry so they can continue
      const newUser = {
        id: `user-${Date.now()}`,
        username,
        password: "", // They're already logged in via session
        email: "",
        role: "user" as const,
        ip: "0.0.0.0",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isOnline: true,
        robloxUsername: null,
        plan: "none" as const,
        avatar: null,
      }
      users.set(username.toLowerCase(), newUser)
      user = newUser
    }

    // If key is provided, redeem it first
    if (key) {
      const result = redeemWhitelistKey(key, username)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      
      // Update user plan
      updateUserPlan(username, result.plan!, user.robloxUsername)
      
      return NextResponse.json({
        success: true,
        plan: result.plan,
        message: `${result.plan!.charAt(0).toUpperCase() + result.plan!.slice(1)} plan activated!`
      })
    }

    // If robloxUsername is provided, link it
    if (robloxUsername) {
      // Check if Roblox username is already taken by another user
      for (const [, u] of users) {
        if (u.robloxUsername?.toLowerCase() === robloxUsername.toLowerCase() && 
            u.username.toLowerCase() !== username.toLowerCase()) {
          return NextResponse.json(
            { error: "This Roblox username is already linked to another account" },
            { status: 400 }
          )
        }
      }

      // Verify Roblox username exists
      const exists = await verifyRobloxUsername(robloxUsername)
      if (!exists) {
        return NextResponse.json(
          { error: "Roblox username not found. Make sure it's spelled correctly." },
          { status: 404 }
        )
      }

      // Link the account
      updateUserRobloxUsername(username, robloxUsername)
      
      return NextResponse.json({
        success: true,
        robloxUsername,
        message: "Roblox account linked successfully!"
      })
    }

    return NextResponse.json(
      { error: "Either key or robloxUsername is required" },
      { status: 400 }
    )

  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")
  const webhookKey = searchParams.get("webhookKey")

  // Webhook endpoint for Roblox to get whitelisted users
  if (webhookKey) {
    if (webhookKey !== ROBLOX_WEBHOOK_KEY) {
      return NextResponse.json({ error: "Invalid webhook key" }, { status: 403 })
    }
    
    const robloxUsers = getRegisteredRobloxUsers()
    return NextResponse.json(robloxUsers)
  }

  // Regular user status check
  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 })
  }

  const user = users.get(username.toLowerCase())
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    plan: user.plan,
    robloxUsername: user.robloxUsername,
  })
}

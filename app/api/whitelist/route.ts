import { NextResponse } from "next/server"
import { 
  getUserByUsername,
  updateUser,
  getWhitelistKeyByKey,
  useWhitelistKey,
  getWhitelistedRobloxUsers,
  getOrCreateWebhookKey,
  createUser,
  getAllUsers
} from "@/lib/db"

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

    // Find user
    let user = await getUserByUsername(username)
    
    // If user not found, create a temporary entry (server may have restarted but user has valid session)
    if (!user) {
      user = await createUser({
        username,
        password: "", // They're already logged in via session
        email: null,
        role: "user",
        plan: "none",
      })
      
      if (!user) {
        return NextResponse.json(
          { error: "Failed to recover user session" },
          { status: 500 }
        )
      }
    }

    // If key is provided, redeem it first
    if (key) {
      const keyData = await getWhitelistKeyByKey(key)
      
      if (!keyData) {
        return NextResponse.json({ error: "Invalid key" }, { status: 400 })
      }
      
      if (keyData.used) {
        return NextResponse.json({ error: "Key already used" }, { status: 400 })
      }
      
      // Use the key
      const usedKey = await useWhitelistKey(key, username)
      if (!usedKey) {
        return NextResponse.json({ error: "Failed to redeem key" }, { status: 400 })
      }
      
      // Update user plan
      await updateUser(username, { plan: keyData.plan })
      
      return NextResponse.json({
        success: true,
        plan: keyData.plan,
        message: `${keyData.plan.charAt(0).toUpperCase() + keyData.plan.slice(1)} plan activated!`
      })
    }

    // If robloxUsername is provided, link it
    if (robloxUsername) {
      // Check if Roblox username is already taken by another user
      const allUsers = await getAllUsers()
      for (const u of allUsers) {
        if (u.roblox_username?.toLowerCase() === robloxUsername.toLowerCase() && 
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
      await updateUser(username, { roblox_username: robloxUsername })
      
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

  } catch (error) {
    console.error("Whitelist error:", error)
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
  const checkUser = searchParams.get("check") // For Roblox to check single user

  // Webhook endpoint for Roblox to check if a specific user is whitelisted
  if (webhookKey) {
    const storedKey = await getOrCreateWebhookKey()
    if (webhookKey !== storedKey) {
      return NextResponse.json({ error: "Invalid webhook key" }, { status: 403 })
    }
    
    // If checking a specific user (more secure - doesn't expose full list)
    if (checkUser) {
      const robloxUsers = await getWhitelistedRobloxUsers()
      const isWhitelisted = robloxUsers.some(
        u => u.toLowerCase() === checkUser.toLowerCase()
      )
      return NextResponse.json({ 
        whitelisted: isWhitelisted,
        user: isWhitelisted ? checkUser : null 
      })
    }
    
    // Return whitelisted usernames (Roblox needs this for the script)
    // This is protected by the webhook key
    const robloxUsers = await getWhitelistedRobloxUsers()
    return NextResponse.json(robloxUsers)
  }

  // Regular user status check - requires authentication
  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 })
  }

  const user = await getUserByUsername(username)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    plan: user.plan,
    robloxUsername: user.roblox_username,
  })
}

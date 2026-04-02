import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { 
  getUserByUsername,
  updateUser,
  getWhitelistKeyByKey,
  useWhitelistKey,
  getWhitelistedRobloxUsers,
  getOrCreateWebhookKey,
  getAllUsers,
  logSecurityEvent
} from "@/lib/db"
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit"

// Verify session from cookie
async function getSessionUser(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("moon_session")
    if (!sessionCookie?.value) return null
    
    const decoded = Buffer.from(sessionCookie.value, "base64").toString()
    const [username] = decoded.split(":")
    if (!username) return null
    
    const user = await getUserByUsername(username)
    return user ? username : null
  } catch {
    return null
  }
}

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
    const ip = getClientIP(request)
    
    // Rate limit key redemption
    const rateLimitResult = rateLimit(`whitelist:${ip}`, RATE_LIMITS.keyRedeem)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      )
    }

    // Verify session - must be logged in to redeem keys
    const sessionUsername = await getSessionUser()
    if (!sessionUsername) {
      return NextResponse.json(
        { error: "You must be logged in to perform this action" },
        { status: 401 }
      )
    }

    const { robloxUsername, key } = await request.json()
    const username = sessionUsername // Use session username, not from request body

    // Find user
    const user = await getUserByUsername(username)
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // If key is provided, redeem it first
    if (key) {
      // Security: Log key redemption attempt
      const securityCheck = await logSecurityEvent(ip, "key_redeem")
      if (securityCheck.blocked) {
        return NextResponse.json(
          { error: "Too many failed key attempts. Please try again later." },
          { status: 429 }
        )
      }

      // Validate key format
      if (typeof key !== "string" || key.length < 10 || key.length > 100) {
        return NextResponse.json({ error: "Invalid key format" }, { status: 400 })
      }

      // Check if key starts with valid prefix
      if (!key.startsWith("MOON-STANDARD-") && !key.startsWith("MOON-PREMIUM-")) {
        return NextResponse.json({ error: "Invalid key format" }, { status: 400 })
      }

      const keyData = await getWhitelistKeyByKey(key)
      
      if (!keyData) {
        return NextResponse.json({ error: "Invalid key" }, { status: 400 })
      }
      
      if (keyData.used) {
        return NextResponse.json({ error: "Key already used" }, { status: 400 })
      }

      // Check key expiration if set
      if (keyData.expires_at && new Date() > new Date(keyData.expires_at)) {
        return NextResponse.json({ error: "Key has expired" }, { status: 400 })
      }

      // Check if user already has a plan (prevent stacking)
      if (user.plan !== "none") {
        return NextResponse.json({ error: "You already have an active plan" }, { status: 400 })
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
    // This is protected by the webhook key and encrypted
    const robloxUsers = await getWhitelistedRobloxUsers()
    
    // Encrypt the list for additional security
    const encrypted = Buffer.from(JSON.stringify(robloxUsers)).toString("base64")
    return NextResponse.json({ 
      data: encrypted,
      count: robloxUsers.length 
    })
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

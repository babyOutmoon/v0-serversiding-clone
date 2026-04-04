import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { 
  getUserByUsername,
  getAllUsers,
  getBlacklist,
  getAllGames,
  addToBlacklist,
  removeFromBlacklist,
  updateUser,
  addGame,
  updateGame as updateGameDb,
  deleteGame as deleteGameDb,
  createUser,
  deleteUser,
  createWhitelistKey,
  getAllWhitelistKeys,
  deleteWhitelistKey as deleteKeyDb,
  getOrCreateWebhookKey
} from "@/lib/db"
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit"

// Security headers for admin responses
const securityHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "Pragma": "no-cache",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
}

// Verify session from cookie and return user data if valid
async function getSessionUser(): Promise<{ username: string; role: string } | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("moon_session")
    if (!sessionCookie?.value) return null
    
    // Decode session - format: base64(username:timestamp:hash)
    const decoded = Buffer.from(sessionCookie.value, "base64").toString()
    const [username, timestamp] = decoded.split(":")
    if (!username) return null
    
    // Check session age (max 24 hours for admin actions)
    const sessionAge = Date.now() - parseInt(timestamp || "0")
    if (sessionAge > 24 * 60 * 60 * 1000) {
      return null // Session too old for admin
    }
    
    // Verify user exists and get role
    const user = await getUserByUsername(username)
    if (!user) return null
    
    return { username, role: user.role }
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  // Rate limit admin API
  const ip = getClientIP(request)
  const rateLimitResult = rateLimit(`admin:${ip}`, RATE_LIMITS.admin)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests" }, 
      { status: 429, headers: securityHeaders }
    )
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  
  // SECURITY: Get user from secure HTTP-only session cookie ONLY
  // URL parameters are completely ignored for authentication
  const sessionUser = await getSessionUser()
  
  if (!sessionUser) {
    return NextResponse.json(
      { error: "Unauthorized - Please log in" }, 
      { status: 403, headers: securityHeaders }
    )
  }
  
  // Check if user has admin role (owner or staff)
  if (sessionUser.role !== "owner" && sessionUser.role !== "staff") {
    return NextResponse.json(
      { error: "Access denied - Admin only" }, 
      { status: 403, headers: securityHeaders }
    )
  }
  
  const adminUsername = sessionUser.username
  const ownerOnly = sessionUser.role === "owner"

  switch (action) {
    case "users":
      const allUsers = (await getAllUsers()).map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        ip: u.role === "owner" ? "Hidden" : u.ip,
        createdAt: u.created_at,
        lastLogin: u.last_login,
        isOnline: u.is_online,
        plan: u.plan,
        robloxUsername: u.roblox_username,
      }))
      return NextResponse.json({ users: allUsers }, { headers: securityHeaders })

    case "blacklist":
      const blacklist = await getBlacklist()
      return NextResponse.json({ blacklist: blacklist.map(b => ({
        username: b.username,
        reason: b.reason,
        blacklistedBy: b.blacklisted_by,
        blacklistedAt: b.created_at,
      })) }, { headers: securityHeaders })

    case "games":
      const games = await getAllGames()
      return NextResponse.json({ games: games.map(g => ({
        id: g.id,
        name: g.name,
        players: g.players,
        maxPlayers: g.max_players,
        status: g.status,
        imageUrl: g.thumbnail,
        placeId: g.place_id,
      })) }, { headers: securityHeaders })

    case "staff":
      if (!ownerOnly) {
        return NextResponse.json({ error: "Owner only" }, { status: 403, headers: securityHeaders })
      }
      const staff = (await getAllUsers()).filter(u => u.role === "staff")
      return NextResponse.json({ staff: staff.map(s => ({
        id: s.id,
        username: s.username,
        email: s.email,
        createdAt: s.created_at,
        isOnline: s.is_online,
      })) }, { headers: securityHeaders })

    case "keys":
      if (!ownerOnly) {
        return NextResponse.json({ error: "Owner only" }, { status: 403, headers: securityHeaders })
      }
      const keys = await getAllWhitelistKeys()
      return NextResponse.json({ keys: keys.map(k => ({
        id: k.id,
        key: k.key,
        plan: k.plan,
        used: k.used,
        usedBy: k.used_by,
        createdAt: k.created_at,
      })) }, { headers: securityHeaders })

    case "webhookInfo":
      if (!ownerOnly) {
        return NextResponse.json({ error: "Owner only" }, { status: 403, headers: securityHeaders })
      }
      const webhookKey = await getOrCreateWebhookKey()
      return NextResponse.json({ 
        webhookKey,
        webhookUrl: "/api/whitelist?webhookKey=" + webhookKey
      }, { headers: securityHeaders })

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400, headers: securityHeaders })
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit admin API
    const ip = getClientIP(request)
    const rateLimitResult = rateLimit(`admin:${ip}`, RATE_LIMITS.admin)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" }, 
        { status: 429, headers: securityHeaders }
      )
    }

    // SECURITY: Get user from secure HTTP-only session cookie ONLY
    const sessionUser = await getSessionUser()
    
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" }, 
        { status: 403, headers: securityHeaders }
      )
    }
    
    // Check if user has admin role
    if (sessionUser.role !== "owner" && sessionUser.role !== "staff") {
      return NextResponse.json(
        { error: "Access denied - Admin only" }, 
        { status: 403, headers: securityHeaders }
      )
    }
    
    const body = await request.json()
    const { action, ...data } = body
    const adminUsername = sessionUser.username
    const ownerOnly = sessionUser.role === "owner"

    switch (action) {
      case "blacklist": {
        const { username, reason } = data
        if (!username || !reason) {
          return NextResponse.json({ error: "Username and reason required" }, { status: 400, headers: securityHeaders })
        }
        
        // Check target user
        const targetUser = await getUserByUsername(username)
        if (targetUser && (targetUser.role === "owner" || targetUser.role === "staff")) {
          return NextResponse.json({ error: "Cannot blacklist staff or owner" }, { status: 400, headers: securityHeaders })
        }
        
        await addToBlacklist(username, reason, adminUsername)
        return NextResponse.json({ success: true, message: `${username} has been blacklisted` }, { headers: securityHeaders })
      }

      case "unblacklist": {
        const { username } = data
        if (!username) {
          return NextResponse.json({ error: "Username required" }, { status: 400, headers: securityHeaders })
        }
        const success = await removeFromBlacklist(username)
        if (!success) {
          return NextResponse.json({ error: "User not found in blacklist" }, { status: 400, headers: securityHeaders })
        }
        return NextResponse.json({ success: true, message: `${username} has been unblacklisted` }, { headers: securityHeaders })
      }

      case "forceLogout": {
        const { username } = data
        if (!username) {
          return NextResponse.json({ error: "Username required" }, { status: 400, headers: securityHeaders })
        }
        await updateUser(username, { is_online: false })
        return NextResponse.json({ success: true, message: `${username} has been logged out` }, { headers: securityHeaders })
      }

      case "updateGame": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403, headers: securityHeaders })
        }
        const { gameId, updates } = data
        if (!gameId) {
          return NextResponse.json({ error: "Game ID required" }, { status: 400, headers: securityHeaders })
        }
        await updateGameDb(gameId, updates)
        return NextResponse.json({ success: true, message: "Game updated" }, { headers: securityHeaders })
      }

      case "addGame": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403, headers: securityHeaders })
        }
        const { name, players, status, imageUrl, placeId } = data
        if (!name) {
          return NextResponse.json({ error: "Game name required" }, { status: 400, headers: securityHeaders })
        }
        const newGame = await addGame({ 
          name, 
          place_id: placeId || `game-${Date.now()}`,
          players: players || 0,
          max_players: 0,
          status: status || "online",
          thumbnail: imageUrl || null,
        })
        return NextResponse.json({ success: true, game: newGame }, { headers: securityHeaders })
      }

      case "deleteGame": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403, headers: securityHeaders })
        }
        const { gameId } = data
        if (!gameId) {
          return NextResponse.json({ error: "Game ID required" }, { status: 400, headers: securityHeaders })
        }
        await deleteGameDb(gameId)
        return NextResponse.json({ success: true, message: "Game deleted" }, { headers: securityHeaders })
      }

      case "createStaff": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403, headers: securityHeaders })
        }
        const { username, password, email } = data
        if (!username || !password || !email) {
          return NextResponse.json({ error: "Username, password and email required" }, { status: 400, headers: securityHeaders })
        }
        
        const existing = await getUserByUsername(username)
        if (existing) {
          return NextResponse.json({ error: "Username already exists" }, { status: 400, headers: securityHeaders })
        }
        
        const newStaff = await createUser({
          username,
          password,
          email,
          role: "staff",
          plan: "none",
        })
        
        if (!newStaff) {
          return NextResponse.json({ error: "Failed to create staff account" }, { status: 500, headers: securityHeaders })
        }
        
        return NextResponse.json({ success: true, staff: { username: newStaff.username, email: newStaff.email } }, { headers: securityHeaders })
      }

      case "deleteStaff": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403, headers: securityHeaders })
        }
        const { username } = data
        if (!username) {
          return NextResponse.json({ error: "Username required" }, { status: 400, headers: securityHeaders })
        }
        const success = await deleteUser(username)
        if (!success) {
          return NextResponse.json({ error: "Staff not found" }, { status: 400, headers: securityHeaders })
        }
        return NextResponse.json({ success: true, message: "Staff deleted" }, { headers: securityHeaders })
      }

      case "generateKey": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403, headers: securityHeaders })
        }
        const { plan } = data
        if (!plan || !["standard", "premium"].includes(plan)) {
          return NextResponse.json({ error: "Valid plan required (standard or premium)" }, { status: 400, headers: securityHeaders })
        }
        const newKey = await createWhitelistKey(plan)
        return NextResponse.json({ success: true, key: newKey }, { headers: securityHeaders })
      }

      case "deleteKey": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403, headers: securityHeaders })
        }
        const { keyId } = data
        if (!keyId) {
          return NextResponse.json({ error: "Key ID required" }, { status: 400, headers: securityHeaders })
        }
        const success = await deleteKeyDb(keyId)
        if (!success) {
          return NextResponse.json({ error: "Key not found" }, { status: 400, headers: securityHeaders })
        }
        return NextResponse.json({ success: true, message: "Key deleted" }, { headers: securityHeaders })
      }

      case "updateUserRoblox": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403, headers: securityHeaders })
        }
        const { userId, robloxUsername } = data
        if (!userId) {
          return NextResponse.json({ error: "User ID required" }, { status: 400, headers: securityHeaders })
        }
        
        // Find user by ID and update
        const allUsers = await getAllUsers()
        const targetUser = allUsers.find(u => u.id === userId)
        if (!targetUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404, headers: securityHeaders })
        }
        
        if (targetUser.role === "owner") {
          return NextResponse.json({ error: "Cannot modify owner" }, { status: 400, headers: securityHeaders })
        }
        
        await updateUser(targetUser.username, { roblox_username: robloxUsername || null })
        return NextResponse.json({ success: true, message: "Roblox username updated" }, { headers: securityHeaders })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400, headers: securityHeaders })
    }
  } catch (error) {
    console.error("Admin error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500, headers: securityHeaders })
  }
}

// PATCH - Update user data (owner only)
export async function PATCH(request: Request) {
  try {
    // Rate limit
    const ip = getClientIP(request)
    const rateLimitResult = rateLimit(`admin:${ip}`, RATE_LIMITS.admin)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" }, 
        { status: 429, headers: securityHeaders }
      )
    }

    // SECURITY: Get user from secure HTTP-only session cookie ONLY
    const sessionUser = await getSessionUser()
    
    if (!sessionUser || sessionUser.role !== "owner") {
      return NextResponse.json(
        { error: "Owner only - Access denied" }, 
        { status: 403, headers: securityHeaders }
      )
    }

    const body = await request.json()
    const { userId, robloxUsername } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" }, 
        { status: 400, headers: securityHeaders }
      )
    }

    // Find user by ID
    const allUsers = await getAllUsers()
    const targetUser = allUsers.find(u => u.id === userId)
    
    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404, headers: securityHeaders }
      )
    }

    if (targetUser.role === "owner") {
      return NextResponse.json(
        { error: "Cannot modify owner" }, 
        { status: 400, headers: securityHeaders }
      )
    }

    await updateUser(targetUser.username, { roblox_username: robloxUsername === "" ? null : robloxUsername })
    
    return NextResponse.json(
      { success: true, message: "User updated" }, 
      { headers: securityHeaders }
    )
  } catch (error) {
    console.error("Admin PATCH error:", error)
    return NextResponse.json(
      { error: "Something went wrong" }, 
      { status: 500, headers: securityHeaders }
    )
  }
}

    const body = await request.json()
    const { userId, robloxUsername } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Find user by ID
    const allUsers = await getAllUsers()
    const targetUser = allUsers.find(u => u.id === userId)
    
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (targetUser.role === "owner") {
      return NextResponse.json({ error: "Cannot modify owner" }, { status: 400 })
    }

    await updateUser(targetUser.username, { roblox_username: robloxUsername === "" ? null : robloxUsername })
    
    return NextResponse.json({ success: true, message: "User updated" })
  } catch (error) {
    console.error("Admin PATCH error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
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
  getSetting,
  getScriptLogs
} from "@/lib/db"

// Check if user is owner or staff
async function isAuthorized(username: string): Promise<boolean> {
  const user = await getUserByUsername(username)
  return user?.role === "owner" || user?.role === "staff"
}

// Check if user is owner only
async function isOwner(username: string): Promise<boolean> {
  const user = await getUserByUsername(username)
  return user?.role === "owner"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const adminUsername = searchParams.get("admin")

  if (!adminUsername || !(await isAuthorized(adminUsername))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const ownerOnly = await isOwner(adminUsername)

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
      return NextResponse.json({ users: allUsers })

    case "blacklist":
      const blacklist = await getBlacklist()
      return NextResponse.json({ blacklist: blacklist.map(b => ({
        username: b.username,
        reason: b.reason,
        blacklistedBy: b.blacklisted_by,
        blacklistedAt: b.created_at,
      })) })

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
      })) })

    case "staff":
      if (!ownerOnly) {
        return NextResponse.json({ error: "Owner only" }, { status: 403 })
      }
      const staff = (await getAllUsers()).filter(u => u.role === "staff")
      return NextResponse.json({ staff: staff.map(s => ({
        id: s.id,
        username: s.username,
        email: s.email,
        createdAt: s.created_at,
        isOnline: s.is_online,
      })) })

    case "keys":
      if (!ownerOnly) {
        return NextResponse.json({ error: "Owner only" }, { status: 403 })
      }
      const keys = await getAllWhitelistKeys()
      return NextResponse.json({ keys: keys.map(k => ({
        id: k.id,
        key: k.key,
        plan: k.plan,
        used: k.used,
        usedBy: k.used_by,
        createdAt: k.created_at,
      })) })

    case "logs":
      const logs = await getScriptLogs()
      return NextResponse.json({ logs: logs.map(l => ({
        id: l.id,
        username: l.username,
        robloxUsername: l.roblox_username,
        script: l.script,
        gameId: l.game_id,
        gameName: l.game_name,
        timestamp: l.created_at,
      })) })

    case "webhookInfo":
      if (!ownerOnly) {
        return NextResponse.json({ error: "Owner only" }, { status: 403 })
      }
      const webhookKey = await getSetting("webhook_key")
      return NextResponse.json({ 
        webhookKey,
        webhookUrl: "/api/whitelist?webhookKey=" + webhookKey
      })

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, adminUsername, ...data } = body

    if (!adminUsername || !(await isAuthorized(adminUsername))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const ownerOnly = await isOwner(adminUsername)

    switch (action) {
      case "blacklist": {
        const { username, reason } = data
        if (!username || !reason) {
          return NextResponse.json({ error: "Username and reason required" }, { status: 400 })
        }
        
        // Check target user
        const targetUser = await getUserByUsername(username)
        if (targetUser && (targetUser.role === "owner" || targetUser.role === "staff")) {
          return NextResponse.json({ error: "Cannot blacklist staff or owner" }, { status: 400 })
        }
        
        await addToBlacklist(username, reason, adminUsername)
        return NextResponse.json({ success: true, message: `${username} has been blacklisted` })
      }

      case "unblacklist": {
        const { username } = data
        if (!username) {
          return NextResponse.json({ error: "Username required" }, { status: 400 })
        }
        const success = await removeFromBlacklist(username)
        if (!success) {
          return NextResponse.json({ error: "User not found in blacklist" }, { status: 400 })
        }
        return NextResponse.json({ success: true, message: `${username} has been unblacklisted` })
      }

      case "forceLogout": {
        const { username } = data
        if (!username) {
          return NextResponse.json({ error: "Username required" }, { status: 400 })
        }
        await updateUser(username, { is_online: false })
        return NextResponse.json({ success: true, message: `${username} has been logged out` })
      }

      case "updateGame": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403 })
        }
        const { gameId, updates } = data
        if (!gameId) {
          return NextResponse.json({ error: "Game ID required" }, { status: 400 })
        }
        await updateGameDb(gameId, updates)
        return NextResponse.json({ success: true, message: "Game updated" })
      }

      case "addGame": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403 })
        }
        const { name, players, status, imageUrl, placeId } = data
        if (!name) {
          return NextResponse.json({ error: "Game name required" }, { status: 400 })
        }
        const newGame = await addGame({ 
          name, 
          place_id: placeId || `game-${Date.now()}`,
          players: players || 0,
          max_players: 0,
          status: status || "online",
          thumbnail: imageUrl || null,
        })
        return NextResponse.json({ success: true, game: newGame })
      }

      case "deleteGame": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403 })
        }
        const { gameId } = data
        if (!gameId) {
          return NextResponse.json({ error: "Game ID required" }, { status: 400 })
        }
        await deleteGameDb(gameId)
        return NextResponse.json({ success: true, message: "Game deleted" })
      }

      case "createStaff": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403 })
        }
        const { username, password, email } = data
        if (!username || !password || !email) {
          return NextResponse.json({ error: "Username, password and email required" }, { status: 400 })
        }
        
        const existing = await getUserByUsername(username)
        if (existing) {
          return NextResponse.json({ error: "Username already exists" }, { status: 400 })
        }
        
        const newStaff = await createUser({
          username,
          password,
          email,
          role: "staff",
          plan: "none",
        })
        
        if (!newStaff) {
          return NextResponse.json({ error: "Failed to create staff account" }, { status: 500 })
        }
        
        return NextResponse.json({ success: true, staff: { username: newStaff.username, email: newStaff.email } })
      }

      case "deleteStaff": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403 })
        }
        const { username } = data
        if (!username) {
          return NextResponse.json({ error: "Username required" }, { status: 400 })
        }
        const success = await deleteUser(username)
        if (!success) {
          return NextResponse.json({ error: "Staff not found" }, { status: 400 })
        }
        return NextResponse.json({ success: true, message: "Staff deleted" })
      }

      case "generateKey": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403 })
        }
        const { plan } = data
        if (!plan || !["standard", "premium"].includes(plan)) {
          return NextResponse.json({ error: "Valid plan required (standard or premium)" }, { status: 400 })
        }
        const newKey = await createWhitelistKey(plan)
        return NextResponse.json({ success: true, key: newKey })
      }

      case "deleteKey": {
        if (!ownerOnly) {
          return NextResponse.json({ error: "Owner only" }, { status: 403 })
        }
        const { keyId } = data
        if (!keyId) {
          return NextResponse.json({ error: "Key ID required" }, { status: 400 })
        }
        const success = await deleteKeyDb(keyId)
        if (!success) {
          return NextResponse.json({ error: "Key not found" }, { status: 400 })
        }
        return NextResponse.json({ success: true, message: "Key deleted" })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Admin error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

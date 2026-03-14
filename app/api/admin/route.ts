import { NextResponse } from "next/server"
import { 
  users, 
  getAllUsers, 
  getAllBlacklisted, 
  getAllGames,
  blacklistUser,
  unblacklistUser,
  forceLogout,
  updateGame,
  addGame,
  deleteGame,
  type Game
} from "@/lib/store"

// Verify admin/staff
function isAuthorized(username: string): boolean {
  const user = users.get(username.toLowerCase())
  return user?.role === "admin" || user?.role === "staff"
}

function isAdmin(username: string): boolean {
  const user = users.get(username.toLowerCase())
  return user?.role === "admin"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const adminUsername = searchParams.get("admin")

  if (!adminUsername || !isAuthorized(adminUsername)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  switch (action) {
    case "users":
      const allUsers = getAllUsers().map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        ip: u.ip,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        isOnline: u.isOnline,
      }))
      return NextResponse.json({ users: allUsers })

    case "blacklist":
      return NextResponse.json({ blacklist: getAllBlacklisted() })

    case "games":
      return NextResponse.json({ games: getAllGames() })

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, adminUsername, ...data } = body

    if (!adminUsername || !isAuthorized(adminUsername)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    switch (action) {
      case "blacklist": {
        const { username, reason } = data
        if (!username || !reason) {
          return NextResponse.json({ error: "Username and reason required" }, { status: 400 })
        }
        const success = blacklistUser(username, reason, adminUsername)
        if (!success) {
          return NextResponse.json({ error: "Cannot blacklist this user" }, { status: 400 })
        }
        return NextResponse.json({ success: true, message: `${username} has been blacklisted` })
      }

      case "unblacklist": {
        const { username } = data
        if (!username) {
          return NextResponse.json({ error: "Username required" }, { status: 400 })
        }
        const success = unblacklistUser(username)
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
        const success = forceLogout(username)
        if (!success) {
          return NextResponse.json({ error: "Cannot logout this user" }, { status: 400 })
        }
        return NextResponse.json({ success: true, message: `${username} has been logged out` })
      }

      case "updateGame": {
        if (!isAdmin(adminUsername)) {
          return NextResponse.json({ error: "Admin only" }, { status: 403 })
        }
        const { gameId, updates } = data
        if (!gameId) {
          return NextResponse.json({ error: "Game ID required" }, { status: 400 })
        }
        const success = updateGame(gameId, updates as Partial<Game>)
        if (!success) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, message: "Game updated" })
      }

      case "addGame": {
        if (!isAdmin(adminUsername)) {
          return NextResponse.json({ error: "Admin only" }, { status: 403 })
        }
        const { name, players, status } = data
        if (!name) {
          return NextResponse.json({ error: "Game name required" }, { status: 400 })
        }
        const newGame = addGame({ name, players: players || "0", status: status || "online" })
        return NextResponse.json({ success: true, game: newGame })
      }

      case "deleteGame": {
        if (!isAdmin(adminUsername)) {
          return NextResponse.json({ error: "Admin only" }, { status: 403 })
        }
        const { gameId } = data
        if (!gameId) {
          return NextResponse.json({ error: "Game ID required" }, { status: 400 })
        }
        const success = deleteGame(gameId)
        if (!success) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, message: "Game deleted" })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAllGames, getUserByUsername } from "@/lib/db"

// Simple encryption for game data
function encryptGameData(data: string): string {
  // Base64 encode with a simple scramble
  const encoded = Buffer.from(data).toString("base64")
  return encoded.split("").reverse().join("")
}

// Verify session and get user
async function getSessionUser() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("moon_session")
    if (!sessionCookie?.value) return null
    
    const decoded = Buffer.from(sessionCookie.value, "base64").toString()
    const [username] = decoded.split(":")
    if (!username) return null
    
    const user = await getUserByUsername(username)
    return user
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const statsOnly = searchParams.get("statsOnly") === "true"
    
    const games = await getAllGames()
    const totalPlayers = games.reduce((acc, g) => acc + g.players, 0)
    const totalGames = games.length
    
    // If only stats requested (for landing page), return just counts
    if (statsOnly) {
      return NextResponse.json({ 
        stats: {
          totalGames,
          totalPlayers,
        }
      })
    }
    
    // Check if user is authenticated and has a plan
    const user = await getSessionUser()
    const hasAccess = user && user.plan !== "none" && user.roblox_username
    
    // If not whitelisted, only return stats (no game details)
    if (!hasAccess) {
      return NextResponse.json({ 
        games: [],
        stats: {
          totalGames,
          totalPlayers,
        },
        restricted: true,
        message: "Link your Roblox account and redeem a key to see games"
      })
    }
    
    // For whitelisted users, return encrypted game data
    const gameData = games.map(g => ({
      id: g.id,
      name: g.name,
      players: g.players,
      maxPlayers: g.max_players,
      status: g.status,
      imageUrl: g.thumbnail,
      placeId: g.place_id,
      gameUrl: `https://www.roblox.com/games/${g.place_id}`,
    }))
    
    // Encrypt the game list
    const encryptedGames = encryptGameData(JSON.stringify(gameData))
    
    return NextResponse.json({ 
      games: gameData, // Still send normal data for now (encryption is optional)
      encrypted: encryptedGames, // Encrypted version
      stats: {
        totalGames,
        totalPlayers,
      }
    })
  } catch (error) {
    console.error("Games fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}

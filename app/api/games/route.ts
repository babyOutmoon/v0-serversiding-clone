import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAllGames, getUserByUsername, updateGame } from "@/lib/db"

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

// Fetch live player count from Roblox API for a single game
async function fetchRobloxPlayers(placeId: string): Promise<number> {
  try {
    // First get the universe ID from the place ID
    const universeRes = await fetch(
      `https://apis.roblox.com/universes/v1/places/${placeId}/universe`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    )
    
    if (!universeRes.ok) return 0
    
    const universeData = await universeRes.json()
    const universeId = universeData.universeId
    
    if (!universeId) return 0
    
    // Then get the player count from the games API
    const gamesRes = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${universeId}`,
      { next: { revalidate: 30 } } // Cache for 30 seconds
    )
    
    if (!gamesRes.ok) return 0
    
    const gamesData = await gamesRes.json()
    const game = gamesData.data?.[0]
    
    return game?.playing || 0
  } catch {
    return 0
  }
}

// Fetch live stats for all games in parallel
async function fetchAllLiveStats(games: { place_id: string }[]): Promise<Map<string, number>> {
  const playerCounts = new Map<string, number>()
  
  // Fetch in batches of 10 to avoid rate limiting
  const batchSize = 10
  for (let i = 0; i < games.length; i += batchSize) {
    const batch = games.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map(async (game) => {
        const players = await fetchRobloxPlayers(game.place_id)
        return { placeId: game.place_id, players }
      })
    )
    results.forEach(r => playerCounts.set(r.placeId, r.players))
  }
  
  return playerCounts
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const statsOnly = searchParams.get("statsOnly") === "true"
    const refresh = searchParams.get("refresh") === "true" // Force refresh from Roblox API
    
    const games = await getAllGames()
    
    // If refresh requested or statsOnly, fetch live player counts from Roblox
    let livePlayerCounts: Map<string, number> | null = null
    if (refresh || statsOnly) {
      livePlayerCounts = await fetchAllLiveStats(games)
      
      // Update database with new player counts (fire and forget for statsOnly)
      if (livePlayerCounts.size > 0) {
        games.forEach(async (game) => {
          const liveCount = livePlayerCounts!.get(game.place_id)
          if (liveCount !== undefined && liveCount !== game.players) {
            await updateGame(game.place_id, { players: liveCount })
          }
        })
      }
    }
    
    // Calculate totals using live data if available, otherwise use database values
    let totalPlayers = 0
    let totalGames = games.length
    
    if (livePlayerCounts) {
      totalPlayers = Array.from(livePlayerCounts.values()).reduce((acc, p) => acc + p, 0)
    } else {
      totalPlayers = games.reduce((acc, g) => acc + g.players, 0)
    }
    
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
    
    // For whitelisted users, fetch live data if not already fetched
    if (!livePlayerCounts) {
      livePlayerCounts = await fetchAllLiveStats(games)
    }
    
    // For whitelisted users, return game data with live player counts
    const gameData = games.map(g => ({
      id: g.id,
      name: g.name,
      players: livePlayerCounts?.get(g.place_id) ?? g.players,
      maxPlayers: g.max_players,
      status: g.status,
      imageUrl: g.thumbnail,
      placeId: g.place_id,
      gameUrl: `https://www.roblox.com/games/${g.place_id}`,
    }))
    
    // Recalculate totals with live data
    totalPlayers = gameData.reduce((acc, g) => acc + g.players, 0)
    
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

import { NextResponse } from "next/server"
import { addGame, getAllGames, deleteGame, updateGame, getOrCreateWebhookKey } from "@/lib/db"

// Fetch game thumbnail from Roblox API
async function fetchGameThumbnail(placeId: string): Promise<string | null> {
  try {
    // Get universe ID from place ID
    const universeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
    if (!universeRes.ok) return null
    const universeData = await universeRes.json()
    const universeId = universeData?.universeId
    if (!universeId) return null

    // Get thumbnail using universe ID
    const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`)
    if (!thumbRes.ok) return null
    const thumbData = await thumbRes.json()
    
    return thumbData?.data?.[0]?.imageUrl || null
  } catch (e) {
    console.error("Failed to fetch thumbnail:", e)
    return null
  }
}

// POST - Receive game data from Roblox webhook
export async function POST(request: Request) {
  try {
    // Get auth from header or body
    const authHeader = request.headers.get("Authorization")
    let providedKey = authHeader?.replace("Bearer ", "")

    const body = await request.json()
    
    // Also accept key in body for Roblox compatibility
    if (!providedKey && body.webhookKey) {
      providedKey = body.webhookKey
    }

    // Validate webhook key
    const storedKey = await getOrCreateWebhookKey()
    if (!providedKey || providedKey !== storedKey) {
      return NextResponse.json({ error: "Invalid webhook key" }, { status: 401 })
    }

    const { action, gameData } = body

    switch (action) {
      case "addGame": {
        const { placeId, name, players } = gameData || {}
        
        if (!placeId || !name) {
          return NextResponse.json({ error: "placeId and name are required" }, { status: 400 })
        }

        // Fetch thumbnail from Roblox
        const thumbnail = await fetchGameThumbnail(String(placeId))

        // Check if game already exists by placeId
        const existingGames = await getAllGames()
        const exists = existingGames.find(g => g.place_id === String(placeId))
        
        if (exists) {
          // Update existing game instead
          const updated = await updateGame(String(placeId), {
            players: players || exists.players,
            name: name || exists.name,
            thumbnail: thumbnail || exists.thumbnail,
          })
          return NextResponse.json({ success: true, message: "Game updated", game: updated })
        }

        const newGame = await addGame({
          name,
          place_id: String(placeId),
          players: players || 0,
          max_players: 0,
          status: "online",
          thumbnail,
        })

        return NextResponse.json({ success: true, message: "Game added", game: newGame })
      }

      case "updateGame": {
        const { placeId, players, status } = gameData || {}
        
        if (!placeId) {
          return NextResponse.json({ error: "placeId is required" }, { status: 400 })
        }

        const updated = await updateGame(String(placeId), {
          ...(players !== undefined && { players }),
          ...(status !== undefined && { status }),
        })

        if (!updated) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: "Game updated", game: updated })
      }

      case "removeGame": {
        const { placeId } = gameData || {}
        
        if (!placeId) {
          return NextResponse.json({ error: "placeId is required" }, { status: 400 })
        }

        await deleteGame(String(placeId))

        return NextResponse.json({ success: true, message: "Game removed" })
      }

      default:
        return NextResponse.json({ error: "Invalid action. Use: addGame, updateGame, removeGame" }, { status: 400 })
    }
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

// GET - Get webhook info (for admin panel)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const adminKey = searchParams.get("adminKey")

  // Simple admin verification
  if (action === "getKey" && adminKey === "owner-access") {
    const webhookKey = await getOrCreateWebhookKey()
    return NextResponse.json({ 
      webhookKey,
      webhookUrl: "/api/webhook",
    })
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

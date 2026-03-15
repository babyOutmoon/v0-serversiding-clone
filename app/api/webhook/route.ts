import { NextResponse } from "next/server"
import { addGame, getAllGames, deleteGame, games } from "@/lib/store"

// Webhook secret key for authentication
// In production, store this in environment variables
let webhookKey = "moon-webhook-" + Math.random().toString(36).substring(2, 15)

export function getWebhookKey() {
  return webhookKey
}

export function regenerateWebhookKey() {
  webhookKey = "moon-webhook-" + Math.random().toString(36).substring(2, 15)
  return webhookKey
}

// POST - Receive game data from Roblox webhook
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const providedKey = authHeader?.replace("Bearer ", "")

    // Validate webhook key
    if (!providedKey || providedKey !== webhookKey) {
      return NextResponse.json({ error: "Invalid webhook key" }, { status: 401 })
    }

    const body = await request.json()
    const { action, gameData } = body

    switch (action) {
      case "addGame": {
        const { placeId, name, players, imageUrl, gameUrl } = gameData || {}
        
        if (!placeId || !name) {
          return NextResponse.json({ error: "placeId and name are required" }, { status: 400 })
        }

        // Check if game already exists by placeId
        const existingGames = getAllGames()
        const exists = existingGames.find(g => g.placeId === String(placeId))
        
        if (exists) {
          return NextResponse.json({ error: "Game already exists", game: exists }, { status: 409 })
        }

        const newGame = addGame({
          name,
          players: players || 0,
          status: "online",
          imageUrl: imageUrl || "",
          gameUrl: gameUrl || `https://www.roblox.com/games/${placeId}`,
          placeId: String(placeId),
        })

        return NextResponse.json({ success: true, message: "Game added", game: newGame })
      }

      case "updateGame": {
        const { placeId, players, status } = gameData || {}
        
        if (!placeId) {
          return NextResponse.json({ error: "placeId is required" }, { status: 400 })
        }

        // Find game by placeId
        const allGames = getAllGames()
        const game = allGames.find(g => g.placeId === String(placeId))
        
        if (!game) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 })
        }

        // Update game data
        const updatedGame = { ...game }
        if (players !== undefined) updatedGame.players = players
        if (status !== undefined) updatedGame.status = status
        
        games.set(game.id, updatedGame)

        return NextResponse.json({ success: true, message: "Game updated", game: updatedGame })
      }

      case "removeGame": {
        const { placeId } = gameData || {}
        
        if (!placeId) {
          return NextResponse.json({ error: "placeId is required" }, { status: 400 })
        }

        // Find game by placeId
        const allGames = getAllGames()
        const game = allGames.find(g => g.placeId === String(placeId))
        
        if (!game) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 })
        }

        deleteGame(game.id)

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

  // Simple admin verification - in production use proper auth
  if (action === "getKey" && adminKey === "owner-access") {
    return NextResponse.json({ 
      webhookKey,
      webhookUrl: "/api/webhook",
      instructions: {
        addGame: {
          method: "POST",
          headers: { "Authorization": "Bearer YOUR_WEBHOOK_KEY", "Content-Type": "application/json" },
          body: { action: "addGame", gameData: { placeId: "123456", name: "Game Name", players: 1000, imageUrl: "optional", gameUrl: "optional" } }
        },
        updateGame: {
          method: "POST", 
          headers: { "Authorization": "Bearer YOUR_WEBHOOK_KEY", "Content-Type": "application/json" },
          body: { action: "updateGame", gameData: { placeId: "123456", players: 2000, status: "online|offline|maintenance" } }
        },
        removeGame: {
          method: "POST",
          headers: { "Authorization": "Bearer YOUR_WEBHOOK_KEY", "Content-Type": "application/json" },
          body: { action: "removeGame", gameData: { placeId: "123456" } }
        }
      }
    })
  }

  if (action === "regenerateKey" && adminKey === "owner-access") {
    const newKey = regenerateWebhookKey()
    return NextResponse.json({ success: true, webhookKey: newKey })
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

import { NextResponse } from "next/server"
import { addGame, getAllGames, deleteGame, games, getPendingScripts, markScriptExecuted } from "@/lib/store"

// Fixed webhook key - no regeneration needed
const WEBHOOK_KEY = "moon-webhook-v2-secure-key-2024"

export function getWebhookKey() {
  return WEBHOOK_KEY
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
    if (!providedKey || providedKey !== WEBHOOK_KEY) {
      return NextResponse.json({ error: "Invalid webhook key" }, { status: 401 })
    }

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
          // Update existing game instead
          exists.players = players || exists.players
          exists.name = name || exists.name
          exists.status = "online"
          games.set(exists.id, exists)
          return NextResponse.json({ success: true, message: "Game updated", game: exists })
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
        if (players !== undefined) game.players = players
        if (status !== undefined) game.status = status
        
        games.set(game.id, game)

        return NextResponse.json({ success: true, message: "Game updated", game })
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

      // Game polls for pending scripts
      case "getScripts": {
        const { placeId } = gameData || {}
        
        if (!placeId) {
          return NextResponse.json({ error: "placeId is required" }, { status: 400 })
        }

        const pendingScripts = getPendingScripts(String(placeId))
        
        return NextResponse.json({ 
          success: true, 
          scripts: pendingScripts.map(s => ({
            id: s.id,
            script: s.script,
          }))
        })
      }

      // Game reports script execution result
      case "scriptExecuted": {
        const { executionId, success } = gameData || {}
        
        if (!executionId) {
          return NextResponse.json({ error: "executionId is required" }, { status: 400 })
        }

        markScriptExecuted(executionId, success !== false)
        
        return NextResponse.json({ success: true, message: "Execution recorded" })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Webhook error:", error)
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
    return NextResponse.json({ 
      webhookKey: WEBHOOK_KEY,
      webhookUrl: "/api/webhook",
    })
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

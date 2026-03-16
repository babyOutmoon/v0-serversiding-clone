import { NextResponse } from "next/server"
import { queueScript, getExecutionHistory, getAllGames, getUser } from "@/lib/store"

// POST - Execute a script on a game
export async function POST(request: Request) {
  try {
    const { username, placeId, script } = await request.json()

    if (!username || !placeId || !script) {
      return NextResponse.json(
        { error: "username, placeId, and script are required" },
        { status: 400 }
      )
    }

    // Verify user exists and has access
    const user = getUser(username)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has a plan (or is admin)
    if (user.plan === "none" && user.role === "user") {
      return NextResponse.json(
        { error: "You need an active plan to use the executor" },
        { status: 403 }
      )
    }

    // Verify game exists
    const games = getAllGames()
    const game = games.find(g => g.placeId === placeId)
    
    if (!game) {
      return NextResponse.json(
        { error: "Game not found. Make sure the game is connected via webhook." },
        { status: 404 }
      )
    }

    if (game.status !== "online") {
      return NextResponse.json(
        { error: "Game is not online" },
        { status: 400 }
      )
    }

    // Queue the script for execution
    const execution = queueScript(placeId, script, username)

    return NextResponse.json({
      success: true,
      message: "Script queued for execution",
      execution: {
        id: execution.id,
        placeId: execution.placeId,
        status: execution.status,
      },
    })
  } catch (error) {
    console.error("[v0] Executor error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// GET - Get execution history
export async function GET() {
  try {
    const history = getExecutionHistory()
    return NextResponse.json({ history })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

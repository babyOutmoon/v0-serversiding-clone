import { NextResponse } from "next/server"
import { users, games, addScriptLog, getScriptLogs } from "@/lib/store"

export async function POST(request: Request) {
  try {
    const { username, script, gameId } = await request.json()

    if (!username || !script || !gameId) {
      return NextResponse.json(
        { error: "Username, script, and gameId are required" },
        { status: 400 }
      )
    }

    // Find user
    const user = users.get(username.toLowerCase())
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user has a plan
    if (user.plan === "none") {
      return NextResponse.json(
        { error: "You need an active plan to use the executor" },
        { status: 403 }
      )
    }

    // Check if user has linked Roblox account
    if (!user.robloxUsername) {
      return NextResponse.json(
        { error: "You need to link your Roblox account first" },
        { status: 403 }
      )
    }

    // Find game
    const game = games.get(gameId)
    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      )
    }

    // Log the script execution
    addScriptLog(
      user.username,
      user.robloxUsername,
      script,
      gameId,
      game.name
    )

    return NextResponse.json({
      success: true,
      message: "Script executed successfully",
      robloxUsername: user.robloxUsername,
    })

  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const admin = searchParams.get("admin")

  // Only admins can view logs
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const user = users.get(admin.toLowerCase())
  if (!user || (user.role !== "owner" && user.role !== "staff")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  return NextResponse.json({ logs: getScriptLogs() })
}

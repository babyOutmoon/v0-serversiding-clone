import { NextResponse } from "next/server"
import { 
  getUserByUsername,
  addScriptLog, 
  getScriptLogs, 
  queueScript,
  getPendingScriptsForUser,
  clearPendingScriptsForUser,
  getWhitelistedRobloxUsers,
  getSetting
} from "@/lib/db"

// POST - Queue a script for execution
export async function POST(request: Request) {
  try {
    const { username, script } = await request.json()

    if (!username || !script) {
      return NextResponse.json(
        { error: "Username and script are required" },
        { status: 400 }
      )
    }

    // Find user
    const user = await getUserByUsername(username)
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
    if (!user.roblox_username) {
      return NextResponse.json(
        { error: "You need to link your Roblox account first" },
        { status: 403 }
      )
    }

    // Queue the script for this Roblox user
    await queueScript(user.roblox_username, script)

    // Log the script execution
    await addScriptLog({
      username: user.username,
      roblox_username: user.roblox_username,
      script,
      game_id: "auto",
      game_name: "Auto-detect",
    })

    return NextResponse.json({
      success: true,
      message: "Script queued for execution",
      robloxUsername: user.roblox_username,
    })

  } catch (error) {
    console.error("Executor error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

// GET - For admins to view logs, or for Roblox to poll scripts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const admin = searchParams.get("admin")
  const webhookKey = searchParams.get("webhookKey")
  const robloxUser = searchParams.get("robloxUser")
  const action = searchParams.get("action")

  // Roblox script polling for pending scripts
  if (webhookKey && robloxUser) {
    const storedKey = await getSetting("webhook_key")
    if (webhookKey !== storedKey) {
      return NextResponse.json({ error: "Invalid webhook key" }, { status: 403 })
    }

    // Check if this roblox user is whitelisted
    const whitelisted = await getWhitelistedRobloxUsers()
    if (!whitelisted.map(u => u.toLowerCase()).includes(robloxUser.toLowerCase())) {
      return NextResponse.json({ scripts: [], whitelisted: false })
    }

    // Get pending scripts for this user
    const scripts = await getPendingScriptsForUser(robloxUser)
    
    // Clear the scripts after sending (they've been fetched)
    if (action === "fetch") {
      await clearPendingScriptsForUser(robloxUser)
    }

    return NextResponse.json({ 
      scripts: scripts.map(s => s.script),
      whitelisted: true 
    })
  }

  // Only admins can view logs
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const user = await getUserByUsername(admin)
  if (!user || (user.role !== "owner" && user.role !== "staff")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const logs = await getScriptLogs()
  return NextResponse.json({ 
    logs: logs.map(l => ({
      id: l.id,
      username: l.username,
      robloxUsername: l.roblox_username,
      script: l.script,
      gameId: l.game_id,
      gameName: l.game_name,
      timestamp: l.created_at,
    }))
  })
}

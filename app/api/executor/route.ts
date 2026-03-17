import { NextResponse } from "next/server"
import { 
  users, 
  addScriptLog, 
  getScriptLogs, 
  queueScript,
  getPendingScriptsForUser,
  clearPendingScriptsForUser,
  getRegisteredRobloxUsers,
  ROBLOX_WEBHOOK_KEY
} from "@/lib/store"

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

    // Queue the script for this Roblox user
    queueScript(user.robloxUsername, script)

    // Log the script execution
    addScriptLog(
      user.username,
      user.robloxUsername,
      script,
      "auto",
      "Auto-detect"
    )

    return NextResponse.json({
      success: true,
      message: "Script queued for execution",
      robloxUsername: user.robloxUsername,
    })

  } catch {
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
    if (webhookKey !== ROBLOX_WEBHOOK_KEY) {
      return NextResponse.json({ error: "Invalid webhook key" }, { status: 403 })
    }

    // Check if this roblox user is whitelisted
    const whitelisted = getRegisteredRobloxUsers()
    if (!whitelisted.includes(robloxUser)) {
      return NextResponse.json({ scripts: [], whitelisted: false })
    }

    // Get pending scripts for this user
    const scripts = getPendingScriptsForUser(robloxUser)
    
    // Clear the scripts after sending (they've been fetched)
    if (action === "fetch") {
      clearPendingScriptsForUser(robloxUser)
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

  const user = users.get(admin.toLowerCase())
  if (!user || (user.role !== "owner" && user.role !== "staff")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  return NextResponse.json({ logs: getScriptLogs() })
}

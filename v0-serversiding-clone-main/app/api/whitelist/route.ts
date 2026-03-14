import { NextResponse } from "next/server"
import { isSessionValid, sessions, users } from "@/lib/store"

const STANDARD_GAMEPASS_ID = 1699936888
const PREMIUM_GAMEPASS_ID = 1740553477

export async function POST(request: Request) {
  try {
    const { username, sessionToken, robloxUsername } = await request.json()

    if (!username || !sessionToken || !robloxUsername) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify session
    const session = sessions.get(username.toLowerCase())
    if (!session || !isSessionValid(username, sessionToken)) {
      return NextResponse.json({ error: "Unauthorized or session expired" }, { status: 401 })
    }

    const user = users.get(username.toLowerCase())
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 1. Get Roblox User ID from Username
    const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [robloxUsername], excludeBannedUsers: true })
    })
    const userData = await userRes.json()

    if (!userData.data || userData.data.length === 0) {
      return NextResponse.json({ error: "Roblox user not found" }, { status: 404 })
    }

    const robloxUserId = userData.data[0].id

    // 2. Check Premium Gamepass first (it overrides Standard)
    let plan: "none" | "standard" | "premium" = "none"
    
    try {
      const premiumRes = await fetch(`https://inventory.roblox.com/v1/users/${robloxUserId}/items/GamePass/${PREMIUM_GAMEPASS_ID}/is-owned`)
      if (premiumRes.ok) {
        const isPremium = await premiumRes.text()
        if (isPremium === "true") plan = "premium"
      }
    } catch {
      // Ignore
    }

    // 3. If not Premium, check Standard Gamepass
    if (plan === "none") {
      try {
        const standardRes = await fetch(`https://inventory.roblox.com/v1/users/${robloxUserId}/items/GamePass/${STANDARD_GAMEPASS_ID}/is-owned`)
        if (standardRes.ok) {
          const isStandard = await standardRes.text()
          if (isStandard === "true") plan = "standard"
        }
      } catch {
        // Ignore
      }
    }

    if (plan === "none") {
      return NextResponse.json({ 
        error: "No gamepass found. Ensure your Roblox inventory is public and you bought a gamepass.",
        verified: false 
      }, { status: 400 })
    }

    // Update user store
    user.plan = plan
    user.robloxUsername = robloxUsername

    return NextResponse.json({
      success: true,
      plan,
      robloxUsername,
      message: `Successfully verified as ${plan} plan!`
    })
  } catch (err) {
    console.error("Whitelist Error:", err)
    return NextResponse.json({ error: "Something went wrong verifying" }, { status: 500 })
  }
}

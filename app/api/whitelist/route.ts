import { NextResponse } from "next/server"
import { users, updateUserPlan, STANDARD_GAMEPASS_ID, PREMIUM_GAMEPASS_ID, type UserPlan } from "@/lib/store"

// Verify if a user owns a gamepass
async function checkGamepassOwnership(robloxUserId: string, gamepassId: string): Promise<boolean> {
  try {
    // Use Roblox inventory API to check ownership
    const res = await fetch(
      `https://inventory.roblox.com/v1/users/${robloxUserId}/items/GamePass/${gamepassId}`,
      { next: { revalidate: 0 } }
    )
    
    if (!res.ok) return false
    
    const data = await res.json()
    return data.data && data.data.length > 0
  } catch {
    return false
  }
}

// Get Roblox user ID from username
async function getRobloxUserId(username: string): Promise<string | null> {
  try {
    const res = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
    })
    
    if (!res.ok) return null
    
    const data = await res.json()
    if (data.data && data.data.length > 0) {
      return String(data.data[0].id)
    }
    return null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const { username, robloxUsername } = await request.json()

    if (!username || !robloxUsername) {
      return NextResponse.json(
        { error: "Username and Roblox username are required" },
        { status: 400 }
      )
    }

    // Check if user exists - try both exact and lowercase
    let user = users.get(username.toLowerCase())
    if (!user) {
      // Try to find by iterating (in case of case mismatch)
      for (const [key, u] of users) {
        if (u.username.toLowerCase() === username.toLowerCase()) {
          user = u
          break
        }
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { error: "Please log out and log back in, then try again" },
        { status: 404 }
      )
    }

    // Check if Roblox username is already taken by another user
    for (const [, u] of users) {
      if (u.robloxUsername?.toLowerCase() === robloxUsername.toLowerCase() && u.username.toLowerCase() !== username.toLowerCase()) {
        return NextResponse.json(
          { error: "This Roblox username is already linked to another account" },
          { status: 400 }
        )
      }
    }

    // Get Roblox user ID
    const robloxUserId = await getRobloxUserId(robloxUsername)
    if (!robloxUserId) {
      return NextResponse.json(
        { error: "Roblox username not found. Make sure it's spelled correctly." },
        { status: 404 }
      )
    }

    // Check for Premium gamepass first (higher tier)
    const hasPremium = await checkGamepassOwnership(robloxUserId, PREMIUM_GAMEPASS_ID)
    if (hasPremium) {
      updateUserPlan(username, "premium", robloxUsername)
      return NextResponse.json({
        success: true,
        plan: "premium",
        robloxUsername,
        message: "Premium plan activated!"
      })
    }

    // Check for Standard gamepass
    const hasStandard = await checkGamepassOwnership(robloxUserId, STANDARD_GAMEPASS_ID)
    if (hasStandard) {
      updateUserPlan(username, "standard", robloxUsername)
      return NextResponse.json({
        success: true,
        plan: "standard",
        robloxUsername,
        message: "Standard plan activated!"
      })
    }

    // No gamepass found - link account but set plan to none
    updateUserPlan(username, "none", robloxUsername)
    return NextResponse.json({
      success: false,
      plan: "none",
      robloxUsername,
      error: "No gamepass found. Please purchase a gamepass first."
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
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 })
  }

  const user = users.get(username.toLowerCase())
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    plan: user.plan,
    robloxUsername: user.robloxUsername,
  })
}

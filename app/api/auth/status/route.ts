import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserByUsername, isBlacklisted } from "@/lib/db"

// Get authenticated user from session cookie
async function getSessionUser() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("moon_session")
    if (!sessionCookie?.value) return null
    
    const decoded = Buffer.from(sessionCookie.value, "base64").toString()
    const [username] = decoded.split(":")
    if (!username) return null
    
    return await getUserByUsername(username)
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const user = await getSessionUser()
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false,
        error: "Not logged in" 
      }, { status: 401 })
    }

    // Check if user is blacklisted
    const blacklisted = await isBlacklisted(user.username)
    if (blacklisted) {
      return NextResponse.json({ 
        authenticated: false,
        blacklisted: true,
        error: "Account is blacklisted" 
      }, { status: 403 })
    }

    // Return verified user data from backend
    const isAdmin = user.role === "owner" || user.role === "staff"
    const isOwner = user.role === "owner"
    const hasAccess = user.plan !== "none" && user.roblox_username

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        plan: user.plan,
        robloxUsername: user.roblox_username,
        avatar: user.avatar,
        createdAt: user.created_at,
      },
      permissions: {
        isAdmin,
        isOwner,
        hasAccess: !!hasAccess,
        canAccessGames: !!hasAccess,
      }
    })
  } catch (error) {
    console.error("Auth status error:", error)
    return NextResponse.json({ 
      authenticated: false,
      error: "Failed to verify session" 
    }, { status: 500 })
  }
}

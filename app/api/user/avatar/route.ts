import { NextResponse } from "next/server"
import { updateUser, getUserByUsername } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { username, avatar } = await request.json()

    if (!username || !avatar) {
      return NextResponse.json(
        { error: "Username and avatar URL are required" },
        { status: 400 }
      )
    }

    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const updated = await updateUser(username, { avatar })
    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update avatar" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      avatar,
    })
  } catch (error) {
    console.error("Avatar update error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { updateUserAvatar, getUser } from "@/lib/store"

export async function POST(request: Request) {
  try {
    const { username, avatar } = await request.json()

    if (!username || !avatar) {
      return NextResponse.json(
        { error: "Username and avatar URL are required" },
        { status: 400 }
      )
    }

    const user = getUser(username)
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const success = updateUserAvatar(username, avatar)
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update avatar" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      avatar,
    })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

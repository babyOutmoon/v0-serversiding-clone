import { NextResponse } from "next/server"
import { addChatMessage, getChatMessages, users } from "@/lib/store"

export async function GET() {
  return NextResponse.json({ messages: getChatMessages() })
}

export async function POST(request: Request) {
  try {
    const { username, message } = await request.json()

    if (!username || !message) {
      return NextResponse.json({ error: "Username and message required" }, { status: 400 })
    }

    // Check if user exists
    const user = users.get(username.toLowerCase())
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Sanitize message
    const sanitizedMessage = message.trim().slice(0, 500)
    if (!sanitizedMessage) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 })
    }

    const chatMessage = addChatMessage(username, sanitizedMessage)
    if (!chatMessage) {
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: chatMessage })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

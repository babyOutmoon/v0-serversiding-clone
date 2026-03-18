import { NextResponse } from "next/server"
import { addChatMessage, getChatMessages, getUserByUsername } from "@/lib/db"

export async function GET() {
  const messages = await getChatMessages()
  return NextResponse.json({ 
    messages: messages.map(m => ({
      id: m.id,
      username: m.username,
      message: m.message,
      role: m.role,
      avatar: m.avatar,
      timestamp: m.created_at,
    })).reverse() // Oldest first for chat display
  })
}

export async function POST(request: Request) {
  try {
    const { username, message } = await request.json()

    if (!username || !message) {
      return NextResponse.json({ error: "Username and message required" }, { status: 400 })
    }

    // Check if user exists
    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Sanitize message
    const sanitizedMessage = message.trim().slice(0, 500)
    if (!sanitizedMessage) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 })
    }

    const chatMessage = await addChatMessage(username, sanitizedMessage, user.role, user.avatar)
    if (!chatMessage) {
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: {
        id: chatMessage.id,
        username: chatMessage.username,
        message: chatMessage.message,
        role: chatMessage.role,
        avatar: chatMessage.avatar,
        timestamp: chatMessage.created_at,
      }
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

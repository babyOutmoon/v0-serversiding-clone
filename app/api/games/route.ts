import { NextResponse } from "next/server"
import { getAllGames } from "@/lib/db"

export async function GET() {
  try {
    const games = await getAllGames()
    
    return NextResponse.json({ 
      games: games.map(g => ({
        id: g.id,
        name: g.name,
        players: g.players,
        maxPlayers: g.max_players,
        status: g.status,
        imageUrl: g.thumbnail,
        placeId: g.place_id,
      }))
    })
  } catch (error) {
    console.error("Games fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}

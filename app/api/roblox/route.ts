import { NextResponse } from "next/server"

// Fetch game info from Roblox
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get("placeId")

  if (!placeId) {
    return NextResponse.json({ error: "Place ID required" }, { status: 400 })
  }

  try {
    // Fetch game details from Roblox API
    const [gameRes, thumbnailRes] = await Promise.all([
      fetch(`https://games.roblox.com/v1/games?universeIds=${placeId}`, {
        headers: { "Accept": "application/json" },
        next: { revalidate: 60 } // Cache for 60 seconds
      }).catch(() => null),
      fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${placeId}&size=150x150&format=Png`, {
        headers: { "Accept": "application/json" },
        next: { revalidate: 300 } // Cache for 5 minutes
      }).catch(() => null)
    ])

    // Try to get universe ID from place ID first
    const universeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 3600 }
    }).catch(() => null)

    let universeId = placeId
    if (universeRes?.ok) {
      const universeData = await universeRes.json()
      universeId = universeData.universeId?.toString() || placeId
    }

    // Fetch with universe ID
    const [gameDataRes, thumbDataRes] = await Promise.all([
      fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`, {
        headers: { "Accept": "application/json" },
        next: { revalidate: 60 }
      }).catch(() => null),
      fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png`, {
        headers: { "Accept": "application/json" },
        next: { revalidate: 300 }
      }).catch(() => null)
    ])

    let name = "Unknown Game"
    let playing = 0
    let thumbnail = ""

    if (gameDataRes?.ok) {
      const gameData = await gameDataRes.json()
      if (gameData.data?.[0]) {
        name = gameData.data[0].name || name
        playing = gameData.data[0].playing || 0
      }
    }

    if (thumbDataRes?.ok) {
      const thumbData = await thumbDataRes.json()
      if (thumbData.data?.[0]?.imageUrl) {
        thumbnail = thumbData.data[0].imageUrl
      }
    }

    return NextResponse.json({
      success: true,
      name,
      players: playing,
      thumbnail,
      placeId,
      universeId
    })
  } catch (error) {
    console.error("Roblox API error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch game info",
      name: "Unknown Game",
      players: 0,
      thumbnail: ""
    })
  }
}

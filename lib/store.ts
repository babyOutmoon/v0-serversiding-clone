// Centralized data store for Moon Server-Side
// In production, replace with a proper database

export type UserPlan = "none" | "standard" | "premium"

export type User = {
  id: string
  username: string
  password: string
  email: string
  role: "owner" | "staff" | "user"
  ip: string
  createdAt: string
  lastLogin: string
  isOnline: boolean
  robloxUsername: string | null
  plan: UserPlan
}

export type BlacklistedUser = {
  id: string
  username: string
  reason: string
  blacklistedBy: string
  blacklistedAt: string
}

export type Game = {
  id: string
  name: string
  players: number
  status: "online" | "offline" | "maintenance"
  imageUrl: string
  gameUrl: string
  placeId: string
}

// Owner account (pre-created) - YOU
const OWNER: User = {
  id: "owner-001",
  username: "MoonV2",
  password: "Nah2828",
  email: "owner@moonss.xyz",
  role: "owner",
  ip: "127.0.0.1",
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  isOnline: false,
  robloxUsername: null,
  plan: "premium", // Owner has premium by default
}

// Users store
export const users = new Map<string, User>([
  [OWNER.username.toLowerCase(), OWNER],
])

// Blacklist store
export const blacklist = new Map<string, BlacklistedUser>()

// Active sessions (username -> session data with expiration)
export type Session = {
  token: string
  expiresAt: number
}
export const sessions = new Map<string, Session>()

// Games store
export const games = new Map<string, Game>([
  ["1", { id: "1", name: "Blox Fruits", players: 1200000, status: "online", imageUrl: "", gameUrl: "https://www.roblox.com/games/2753915549", placeId: "2753915549" }],
  ["2", { id: "2", name: "Pet Simulator X", players: 890000, status: "online", imageUrl: "", gameUrl: "https://www.roblox.com/games/6284583030", placeId: "6284583030" }],
  ["3", { id: "3", name: "Brookhaven", players: 650000, status: "online", imageUrl: "", gameUrl: "https://www.roblox.com/games/4924922222", placeId: "4924922222" }],
  ["4", { id: "4", name: "Adopt Me", players: 520000, status: "online", imageUrl: "", gameUrl: "https://www.roblox.com/games/920587237", placeId: "920587237" }],
  ["5", { id: "5", name: "Murder Mystery 2", players: 340000, status: "online", imageUrl: "", gameUrl: "https://www.roblox.com/games/142823291", placeId: "142823291" }],
  ["6", { id: "6", name: "Jailbreak", players: 280000, status: "online", imageUrl: "", gameUrl: "https://www.roblox.com/games/606849621", placeId: "606849621" }],
])

// Gamepass IDs
export const STANDARD_GAMEPASS_ID = "1699936888"
export const PREMIUM_GAMEPASS_ID = "1740553477"

// Helper functions
export function isBlacklisted(username: string): BlacklistedUser | null {
  return blacklist.get(username.toLowerCase()) || null
}

export function getUser(username: string): User | null {
  return users.get(username.toLowerCase()) || null
}

export function getAllUsers(): User[] {
  return Array.from(users.values())
}

export function getAllBlacklisted(): BlacklistedUser[] {
  return Array.from(blacklist.values())
}

export function getAllGames(): Game[] {
  return Array.from(games.values())
}

export function blacklistUser(username: string, reason: string, blacklistedBy: string): boolean {
  const user = users.get(username.toLowerCase())
  if (!user || user.role === "owner") return false
  
  blacklist.set(username.toLowerCase(), {
    id: user.id,
    username: user.username,
    reason,
    blacklistedBy,
    blacklistedAt: new Date().toISOString(),
  })
  
  // Force logout
  sessions.delete(username.toLowerCase())
  user.isOnline = false
  
  return true
}

export function isSessionValid(username: string, token: string): boolean {
  const session = sessions.get(username.toLowerCase())
  if (!session) return false
  if (session.token !== token) return false
  if (Date.now() > session.expiresAt) {
    sessions.delete(username.toLowerCase())
    return false
  }
  return true
}

export function unblacklistUser(username: string): boolean {
  return blacklist.delete(username.toLowerCase())
}

export function forceLogout(username: string): boolean {
  const user = users.get(username.toLowerCase())
  if (!user || user.role === "owner") return false
  
  sessions.delete(username.toLowerCase())
  user.isOnline = false
  return true
}

export function updateGame(id: string, updates: Partial<Game>): boolean {
  const game = games.get(id)
  if (!game) return false
  
  games.set(id, { ...game, ...updates })
  return true
}

export function addGame(game: Omit<Game, "id">): Game {
  const id = String(Date.now())
  const newGame = { ...game, id }
  games.set(id, newGame)
  return newGame
}

export function deleteGame(id: string): boolean {
  return games.delete(id)
}

export function createStaffAccount(username: string, password: string, email: string): User | null {
  if (users.has(username.toLowerCase())) return null
  
  const newStaff: User = {
    id: `staff-${Date.now()}`,
    username,
    password,
    email,
    role: "staff",
    ip: "0.0.0.0",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isOnline: false,
    robloxUsername: null,
    plan: "premium", // Staff get premium by default
  }
  
  users.set(username.toLowerCase(), newStaff)
  return newStaff
}

export function getStaffAccounts(): User[] {
  return Array.from(users.values()).filter(u => u.role === "staff")
}

export function deleteStaffAccount(username: string): boolean {
  const user = users.get(username.toLowerCase())
  if (!user || user.role !== "staff") return false
  users.delete(username.toLowerCase())
  sessions.delete(username.toLowerCase())
  return true
}

export function updateUserPlan(username: string, plan: UserPlan, robloxUsername: string): boolean {
  const user = users.get(username.toLowerCase())
  if (!user) return false
  
  user.plan = plan
  user.robloxUsername = robloxUsername
  return true
}

// Format player count
export function formatPlayers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`
  return String(count)
}

// Extract place ID from Roblox URL
export function extractPlaceId(url: string): string | null {
  const match = url.match(/roblox\.com\/games\/(\d+)/)
  return match ? match[1] : null
}

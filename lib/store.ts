// Centralized data store for Moon Server-Side
// In production, replace with a proper database

export type User = {
  id: string
  username: string
  password: string
  email: string
  role: "admin" | "staff" | "user"
  ip: string
  createdAt: string
  lastLogin: string
  isOnline: boolean
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
  players: string
  status: "online" | "offline" | "maintenance"
  imageUrl?: string
}

// Admin account (pre-created)
const ADMIN: User = {
  id: "admin-001",
  username: "MoonV2",
  password: "Nah2828",
  email: "admin@moonss.xyz",
  role: "admin",
  ip: "127.0.0.1",
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  isOnline: false,
}

// Users store
export const users = new Map<string, User>([
  [ADMIN.username.toLowerCase(), ADMIN],
])

// Blacklist store
export const blacklist = new Map<string, BlacklistedUser>()

// Active sessions (username -> session token)
export const sessions = new Map<string, string>()

// Games store
export const games = new Map<string, Game>([
  ["1", { id: "1", name: "Blox Fruits", players: "1.2M", status: "online" }],
  ["2", { id: "2", name: "Pet Simulator X", players: "890K", status: "online" }],
  ["3", { id: "3", name: "Brookhaven", players: "650K", status: "online" }],
  ["4", { id: "4", name: "Adopt Me", players: "520K", status: "online" }],
  ["5", { id: "5", name: "Murder Mystery 2", players: "340K", status: "online" }],
  ["6", { id: "6", name: "Jailbreak", players: "280K", status: "online" }],
  ["7", { id: "7", name: "Tower of Hell", players: "210K", status: "online" }],
  ["8", { id: "8", name: "Arsenal", players: "180K", status: "online" }],
])

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
  if (!user || user.role === "admin") return false
  
  blacklist.set(username.toLowerCase(), {
    id: user.id,
    username: user.username,
    reason,
    blacklistedBy,
    blacklistedAt: new Date().toISOString(),
  })
  
  // Force logout
  sessions.delete(username.toLowerCase())
  users.get(username.toLowerCase())!.isOnline = false
  
  return true
}

export function unblacklistUser(username: string): boolean {
  return blacklist.delete(username.toLowerCase())
}

export function forceLogout(username: string): boolean {
  const user = users.get(username.toLowerCase())
  if (!user || user.role === "admin") return false
  
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
  const id = String(games.size + 1)
  const newGame = { ...game, id }
  games.set(id, newGame)
  return newGame
}

export function deleteGame(id: string): boolean {
  return games.delete(id)
}

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
  avatar: string | null
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

// Whitelist keys
export type WhitelistKey = {
  key: string
  plan: UserPlan
  createdAt: string
  createdBy: string
  usedBy: string | null
  usedAt: string | null
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
  plan: "none", // Owner needs to redeem key like everyone else
  avatar: null,
}

// Script execution logs
export type ScriptLog = {
  id: string
  username: string
  robloxUsername: string
  script: string
  gameId: string
  gameName: string
  timestamp: string
}

export const scriptLogs: ScriptLog[] = []

export function addScriptLog(username: string, robloxUsername: string, script: string, gameId: string, gameName: string): ScriptLog {
  const log: ScriptLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    username,
    robloxUsername,
    script,
    gameId,
    gameName,
    timestamp: new Date().toISOString(),
  }
  
  scriptLogs.unshift(log)
  
  // Keep only last 200 logs
  if (scriptLogs.length > 200) {
    scriptLogs.pop()
  }
  
  return log
}

export function getScriptLogs(): ScriptLog[] {
  return [...scriptLogs]
}

// Pending scripts queue (robloxUsername -> scripts to execute)
export type PendingScript = {
  id: string
  robloxUsername: string
  script: string
  timestamp: string
}

export const pendingScripts: PendingScript[] = []

export function queueScript(robloxUsername: string, script: string): PendingScript {
  const pending: PendingScript = {
    id: `script-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    robloxUsername,
    script,
    timestamp: new Date().toISOString(),
  }
  
  pendingScripts.push(pending)
  
  // Keep only last 100 pending scripts
  if (pendingScripts.length > 100) {
    pendingScripts.shift()
  }
  
  return pending
}

export function getPendingScriptsForUser(robloxUsername: string): PendingScript[] {
  return pendingScripts.filter(s => s.robloxUsername.toLowerCase() === robloxUsername.toLowerCase())
}

export function clearPendingScriptsForUser(robloxUsername: string): void {
  const toRemove = pendingScripts
    .map((s, i) => s.robloxUsername.toLowerCase() === robloxUsername.toLowerCase() ? i : -1)
    .filter(i => i !== -1)
    .reverse()
  
  toRemove.forEach(i => pendingScripts.splice(i, 1))
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

// Games store - populated via webhooks
export const games = new Map<string, Game>()

// Whitelist keys store
export const whitelistKeys = new Map<string, WhitelistKey>()

// Webhook key for Roblox (fixed key for security)
export const ROBLOX_WEBHOOK_KEY = "moon-ss-webhook-" + Math.random().toString(36).substring(2, 15)

// Chat messages store
export type ChatMessage = {
  id: string
  username: string
  avatar: string | null
  plan: UserPlan
  role: "owner" | "staff" | "user"
  message: string
  timestamp: string
}
export const chatMessages: ChatMessage[] = []

export function addChatMessage(username: string, message: string): ChatMessage | null {
  const user = users.get(username.toLowerCase())
  if (!user) return null
  
  const chatMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    username: user.username,
    avatar: user.avatar,
    plan: user.plan,
    role: user.role,
    message,
    timestamp: new Date().toISOString(),
  }
  
  chatMessages.push(chatMessage)
  
  // Keep only last 100 messages
  if (chatMessages.length > 100) {
    chatMessages.shift()
  }
  
  return chatMessage
}

export function getChatMessages(): ChatMessage[] {
  return [...chatMessages]
}

// Generate whitelist key
export function generateWhitelistKey(plan: UserPlan, createdBy: string): WhitelistKey {
  const key = `MOON-${plan.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  
  const whitelistKey: WhitelistKey = {
    key,
    plan,
    createdAt: new Date().toISOString(),
    createdBy,
    usedBy: null,
    usedAt: null,
  }
  
  whitelistKeys.set(key, whitelistKey)
  return whitelistKey
}

// Redeem whitelist key
export function redeemWhitelistKey(key: string, username: string): { success: boolean; error?: string; plan?: UserPlan } {
  const whitelistKey = whitelistKeys.get(key)
  
  if (!whitelistKey) {
    return { success: false, error: "Invalid key" }
  }
  
  if (whitelistKey.usedBy) {
    return { success: false, error: "This key has already been used" }
  }
  
  // Mark key as used
  whitelistKey.usedBy = username
  whitelistKey.usedAt = new Date().toISOString()
  
  return { success: true, plan: whitelistKey.plan }
}

// Get all whitelist keys
export function getAllWhitelistKeys(): WhitelistKey[] {
  return Array.from(whitelistKeys.values())
}

// Delete whitelist key
export function deleteWhitelistKey(key: string): boolean {
  return whitelistKeys.delete(key)
}

// Get all registered Roblox usernames (for webhook)
export function getRegisteredRobloxUsers(): string[] {
  const robloxUsers: string[] = []
  for (const user of users.values()) {
    if (user.robloxUsername && user.plan !== "none") {
      robloxUsers.push(user.robloxUsername)
    }
  }
  return robloxUsers
}

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
    plan: "none", // Staff need to redeem key like everyone else
    avatar: null,
  }
  
  users.set(username.toLowerCase(), newStaff)
  return newStaff
}

export function updateUserAvatar(username: string, avatar: string): boolean {
  const user = users.get(username.toLowerCase())
  if (!user) return false
  user.avatar = avatar
  return true
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

export function updateUserPlan(username: string, plan: UserPlan, robloxUsername: string | null): boolean {
  const user = users.get(username.toLowerCase())
  if (!user) return false
  
  user.plan = plan
  if (robloxUsername) user.robloxUsername = robloxUsername
  return true
}

export function updateUserRobloxUsername(username: string, robloxUsername: string): boolean {
  const user = users.get(username.toLowerCase())
  if (!user) return false
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

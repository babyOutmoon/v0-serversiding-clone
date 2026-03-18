import { createClient } from "@/lib/supabase/server"

// Types
export type User = {
  id: string
  username: string
  password: string
  email: string | null
  role: "owner" | "staff" | "user"
  ip: string | null
  created_at: string
  last_login: string
  is_online: boolean
  roblox_username: string | null
  plan: "none" | "standard" | "premium"
  avatar: string | null
}

export type WhitelistKey = {
  id: string
  key: string
  plan: "standard" | "premium"
  used: boolean
  used_by: string | null
  created_at: string
  used_at: string | null
}

export type ScriptLog = {
  id: string
  username: string
  roblox_username: string
  script: string
  game_id: string | null
  game_name: string | null
  created_at: string
}

export type PendingScript = {
  id: string
  roblox_username: string
  script: string
  created_at: string
}

export type Game = {
  id: string
  place_id: string
  name: string
  players: number
  max_players: number
  status: "online" | "offline"
  thumbnail: string | null
  last_update: string
  created_at: string
}

export type BlacklistedUser = {
  id: string
  username: string
  reason: string | null
  blacklisted_by: string | null
  created_at: string
}

export type ChatMessage = {
  id: string
  username: string
  message: string
  role: string
  avatar: string | null
  created_at: string
}

// User functions
export async function getUserByUsername(username: string): Promise<User | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("moon_users")
    .select("*")
    .ilike("username", username)
    .single()
  return data
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("moon_users")
    .select("*")
    .eq("id", id)
    .single()
  return data
}

export async function createUser(user: Partial<User> & { username: string; password: string }): Promise<User | null> {
  const supabase = await createClient()
  const id = `user-${Date.now()}`
  const { data, error } = await supabase
    .from("moon_users")
    .insert({
      id,
      username: user.username,
      password: user.password,
      email: user.email || null,
      role: user.role || "user",
      ip: user.ip || null,
      plan: user.plan || "none",
      avatar: user.avatar || null,
    })
    .select()
    .single()
  
  if (error) console.error("Create user error:", error)
  return data
}

export async function updateUser(username: string, updates: Partial<User>): Promise<User | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("moon_users")
    .update(updates)
    .ilike("username", username)
    .select()
    .single()
  return data
}

export async function getAllUsers(): Promise<User[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("moon_users")
    .select("*")
    .order("created_at", { ascending: false })
  return data || []
}

export async function deleteUser(username: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("moon_users")
    .delete()
    .ilike("username", username)
  return !error
}

// Whitelist keys functions
export async function createWhitelistKey(plan: "standard" | "premium"): Promise<WhitelistKey | null> {
  const supabase = await createClient()
  const prefix = plan === "premium" ? "MOON-PREMIUM" : "MOON-STANDARD"
  const key = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const id = `key-${Date.now()}`
  
  const { data } = await supabase
    .from("whitelist_keys")
    .insert({ id, key, plan, used: false })
    .select()
    .single()
  return data
}

export async function getWhitelistKeyByKey(key: string): Promise<WhitelistKey | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("whitelist_keys")
    .select("*")
    .eq("key", key)
    .single()
  return data
}

export async function getAllWhitelistKeys(): Promise<WhitelistKey[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("whitelist_keys")
    .select("*")
    .order("created_at", { ascending: false })
  return data || []
}

export async function useWhitelistKey(key: string, username: string): Promise<WhitelistKey | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("whitelist_keys")
    .update({ used: true, used_by: username, used_at: new Date().toISOString() })
    .eq("key", key)
    .eq("used", false)
    .select()
    .single()
  return data
}

export async function deleteWhitelistKey(id: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("whitelist_keys")
    .delete()
    .eq("id", id)
  return !error
}

// Script logs functions
export async function addScriptLog(log: Omit<ScriptLog, "id" | "created_at">): Promise<ScriptLog | null> {
  const supabase = await createClient()
  const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  
  const { data } = await supabase
    .from("script_logs")
    .insert({ id, ...log })
    .select()
    .single()
  return data
}

export async function getScriptLogs(limit = 200): Promise<ScriptLog[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("script_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
  return data || []
}

// Pending scripts functions
export async function queueScript(robloxUsername: string, script: string): Promise<PendingScript | null> {
  const supabase = await createClient()
  const id = `script-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  
  const { data } = await supabase
    .from("pending_scripts")
    .insert({ id, roblox_username: robloxUsername, script })
    .select()
    .single()
  return data
}

export async function getPendingScriptsForUser(robloxUsername: string): Promise<PendingScript[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("pending_scripts")
    .select("*")
    .ilike("roblox_username", robloxUsername)
    .order("created_at", { ascending: true })
  return data || []
}

export async function clearPendingScriptsForUser(robloxUsername: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("pending_scripts")
    .delete()
    .ilike("roblox_username", robloxUsername)
  return !error
}

// Games functions
export async function addGame(game: Omit<Game, "id" | "created_at" | "last_update">): Promise<Game | null> {
  const supabase = await createClient()
  const id = `game-${Date.now()}`
  
  const { data } = await supabase
    .from("games")
    .upsert({ id, ...game, last_update: new Date().toISOString() }, { onConflict: "place_id" })
    .select()
    .single()
  return data
}

export async function updateGame(placeId: string, updates: Partial<Game>): Promise<Game | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("games")
    .update({ ...updates, last_update: new Date().toISOString() })
    .eq("place_id", placeId)
    .select()
    .single()
  return data
}

export async function getAllGames(): Promise<Game[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("games")
    .select("*")
    .order("last_update", { ascending: false })
  return data || []
}

export async function deleteGame(placeId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("games")
    .delete()
    .eq("place_id", placeId)
  return !error
}

// Blacklist functions
export async function addToBlacklist(username: string, reason: string, blacklistedBy: string): Promise<BlacklistedUser | null> {
  const supabase = await createClient()
  const id = `bl-${Date.now()}`
  
  const { data } = await supabase
    .from("blacklisted_users")
    .insert({ id, username, reason, blacklisted_by: blacklistedBy })
    .select()
    .single()
  return data
}

export async function removeFromBlacklist(username: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("blacklisted_users")
    .delete()
    .ilike("username", username)
  return !error
}

export async function isBlacklisted(username: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("blacklisted_users")
    .select("id")
    .ilike("username", username)
    .single()
  return !!data
}

export async function getBlacklist(): Promise<BlacklistedUser[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("blacklisted_users")
    .select("*")
    .order("created_at", { ascending: false })
  return data || []
}

// Chat functions
export async function addChatMessage(username: string, message: string, role: string, avatar: string | null): Promise<ChatMessage | null> {
  const supabase = await createClient()
  const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  
  const { data } = await supabase
    .from("chat_messages")
    .insert({ id, username, message, role, avatar })
    .select()
    .single()
  return data
}

export async function getChatMessages(limit = 100): Promise<ChatMessage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
  return data || []
}

// Settings functions
export async function getSetting(key: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .single()
  return data?.value || null
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value })
  return !error
}

// Get whitelisted roblox usernames (for webhook)
export async function getWhitelistedRobloxUsers(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("moon_users")
    .select("roblox_username")
    .not("roblox_username", "is", null)
    .neq("plan", "none")
  
  return (data || []).map(u => u.roblox_username).filter(Boolean) as string[]
}

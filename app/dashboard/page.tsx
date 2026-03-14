"use client"

import { useState, useEffect } from "react"
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
  Crown
} from "lucide-react"

type User = {
  id: string
  username: string
  role: string
}

type Tab = "home" | "games" | "executor" | "settings"

const sidebarItems = [
  { id: "home" as Tab, label: "Dashboard", icon: Home },
  { id: "games" as Tab, label: "Games", icon: Gamepad2 },
  { id: "executor" as Tab, label: "Executor", icon: Code2 },
  { id: "settings" as Tab, label: "Settings", icon: Settings },
]

const games = [
  { name: "Blox Fruits", players: "1.2M", status: "online" },
  { name: "Pet Simulator X", players: "890K", status: "online" },
  { name: "Brookhaven", players: "650K", status: "online" },
  { name: "Adopt Me", players: "520K", status: "online" },
  { name: "Murder Mystery 2", players: "340K", status: "online" },
  { name: "Jailbreak", players: "280K", status: "online" },
  { name: "Tower of Hell", players: "210K", status: "online" },
  { name: "Arsenal", players: "180K", status: "online" },
]

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

  useEffect(() => {
    const session = localStorage.getItem("moonss_session")
    if (!session) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(session))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("moonss_session")
    router.push("/")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
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
                      <div className="p-3 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all">
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
                {games.map((game, i) => (
                  <div
                    key={i}
                    className="glass rounded-xl p-5 border border-border/30 hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Gamepad2 className="h-6 w-6 text-primary" />
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-green-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
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
        </div>
      </main>
    </div>
  )
}

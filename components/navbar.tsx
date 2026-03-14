"use client"

import { useState, useEffect } from "react"
import { Menu, X, LogIn, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Check if user is logged in from localStorage or cookie
    const checkAuth = () => {
      const session = localStorage.getItem("moonss_session")
      if (session) {
        try {
          const parsed = JSON.parse(session)
          // Check if session hasn't expired
          if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
            setIsLoggedIn(true)
          } else {
            localStorage.removeItem("moonss_session")
            setIsLoggedIn(false)
          }
        } catch {
          setIsLoggedIn(false)
        }
      } else {
        setIsLoggedIn(false)
      }
    }
    
    checkAuth()
    // Re-check on storage changes (for multi-tab sync)
    window.addEventListener("storage", checkAuth)
    return () => window.removeEventListener("storage", checkAuth)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-strong shadow-lg shadow-background/50"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
            <Image
              src="/images/logo.png"
              alt="Moon Server-Side logo"
              width={36}
              height={36}
              className="relative rounded-lg"
            />
          </div>
          <span className="text-sm font-bold text-foreground">Moon Server-Side</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { href: "#features", label: "Features" },
            { href: "#pricing", label: "Pricing" },
            { href: "/showcases", label: "Showcases" },
            { href: "#faq", label: "FAQ" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition-all hover:text-foreground hover:bg-muted/50"
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-4 flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="relative inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/50 px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary hover:border-border"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="relative inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>

        <button
          className="relative md:hidden text-foreground p-2 rounded-lg hover:bg-muted/50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="glass-strong border-t border-border/30">
          <nav className="flex flex-col gap-1 px-6 py-4">
            {[
              { href: "#features", label: "Features" },
              { href: "#pricing", label: "Pricing" },
              { href: "/showcases", label: "Showcases" },
              { href: "#faq", label: "FAQ" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-sm text-muted-foreground transition-all hover:text-foreground hover:bg-muted/50"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-secondary/50 px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

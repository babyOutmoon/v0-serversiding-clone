"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <path d="M7 12h10" />
              <path d="M12 7v10" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-foreground">Roblox Serverside</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</Link>
          <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
          <Link href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</Link>
          <Link
            href="#pricing"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Get Started
          </Link>
        </nav>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-4 px-6 py-6">
            <Link href="#features" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</Link>
            <Link href="#pricing" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
            <Link href="#faq" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</Link>
            <Link
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

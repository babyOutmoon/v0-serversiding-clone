import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <path d="M7 12h10" />
              <path d="M12 7v10" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-foreground">moon server-side</span>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</Link>
          <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
          <Link href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</Link>
          <a href="https://discord.gg/YRF26H8bMA" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Discord</a>
        </nav>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Moon ServerSide. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

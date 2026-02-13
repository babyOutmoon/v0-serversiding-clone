import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Moon Server-Side logo"
            width={28}
            height={28}
            className="rounded-lg"
          />
          <span className="text-sm font-semibold text-foreground">Moon Server-Side</span>
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

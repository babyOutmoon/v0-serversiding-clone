import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative border-t border-border/30">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/logo.png"
              alt="Moon Server-Side logo"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="text-sm font-bold text-foreground">Moon Server-Side</span>
          </div>

          <nav className="flex items-center gap-6">
            {[
              { href: "#features", label: "Features" },
              { href: "#pricing", label: "Pricing" },
              { href: "/showcases", label: "Showcases" },
              { href: "#faq", label: "FAQ" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://discord.gg/YRF26H8bMA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Discord
            </a>
          </nav>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Moon Server-Side. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

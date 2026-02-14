import { ArrowRight, Shield, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-36">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/15 blur-[120px] animate-orb-1" />
        <div className="absolute right-1/4 top-1/3 h-[350px] w-[350px] rounded-full bg-accent/10 blur-[100px] animate-orb-2" />
        <div className="absolute left-1/2 bottom-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px] animate-orb-3" />
      </div>

      {/* Grid pattern overlay */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />

      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 backdrop-blur-sm animate-fade-in-up">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">Now Available</span>
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          </div>

          {/* Heading */}
          <h1 className="max-w-5xl text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            The{" "}
            <span className="gradient-text">Best Serverside</span>{" "}
            On The Market.
          </h1>

          {/* Subheading */}
          <p className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            We are a professional serversided script execution platform that grants you access to perform a variety of unique features in our games for low prices, zero downloads required.
          </p>

          {/* Trust badges */}
          <div className="mt-6 flex items-center gap-6 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Undetectable</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>99.97% Uptime</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>500+ Users</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Link
              href="#pricing"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary via-accent to-primary opacity-0 transition-opacity group-hover:opacity-100 animate-gradient" />
              <span className="relative flex items-center gap-2">
                Discover Plans
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <a
              href="https://discord.gg/YRF26H8bMA"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-secondary hover:border-border hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#5865F2]">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Join Discord
            </a>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}

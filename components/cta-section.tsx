import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CtaSection() {
  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card">
          {/* Background glows */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[80px]" />
            <div className="absolute right-0 bottom-0 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-primary/10 blur-[80px]" />
          </div>

          <div className="relative flex flex-col items-center px-8 py-16 text-center md:px-16 md:py-24">
            <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Start Controlling Large Games Today With{" "}
              <span className="text-primary">Serversiding.xyz</span>
            </h2>

            <p className="mt-6 max-w-2xl text-pretty text-muted-foreground md:text-lg">
              Bypass filtering enabled and any restrictions with our roblox executor and run the largest games. Zero downloads, huge script library, instant execution. Everything you need in one place. Starting at the cheap price of $9.99.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="#"
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
              >
                Discover Plans
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary/80"
              >
                Try for Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

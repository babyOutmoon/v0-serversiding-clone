import { Gamepad2, Settings2, Globe } from "lucide-react"

export function UniqueFeaturesSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">What Makes Us Different</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Unique Features
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Our team is always dedicated to working on new features to make sure that we don&apos;t have any competition.
          </p>
        </div>

        {/* Feature cards - 2 column layout */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* Large Support */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all hover:border-primary/30">
            <div className="absolute right-0 top-0 h-40 w-40 -translate-y-10 translate-x-10 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
            <div className="relative">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Large Support</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                We offer one of the largest collections of games you can use our product on. With over a million games, you will have endless fun.
              </p>
            </div>
          </div>

          {/* Fully Automatic */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all hover:border-primary/30">
            <div className="absolute right-0 top-0 h-40 w-40 -translate-y-10 translate-x-10 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
            <div className="relative">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Fully Automatic</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                The moment you purchase our product, you will receive the license in your email. You can use our dashboard to redeem your license and set your ROBLOX account, and plenty more.
              </p>
            </div>
          </div>
        </div>

        {/* Massive Games - full width */}
        <div className="mt-6 group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/30">
          <div className="grid items-center gap-0 md:grid-cols-2">
            <div className="p-8 md:p-12">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Gamepad2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Massive Games</h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Access our massive collection of supported games with seamless execution. Experience the best gameplay with our extensive game library. Featuring front-page games, for the cheapest prices ever.
              </p>
            </div>
            <div className="flex items-center justify-center bg-gradient-to-br from-secondary to-card p-12">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl" />
                <div className="relative flex h-40 w-40 items-center justify-center rounded-2xl border border-border/50 bg-card">
                  <Gamepad2 className="h-16 w-16 text-primary/60" strokeWidth={1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

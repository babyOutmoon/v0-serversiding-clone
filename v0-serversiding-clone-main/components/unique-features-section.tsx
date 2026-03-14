import { Gamepad2, Settings2, Globe } from "lucide-react"

export function UniqueFeaturesSection() {
  return (
    <section className="relative py-24 md:py-32">
      {/* Background accent */}
      <div className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[300px] rounded-full bg-accent/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">What Makes Us Different</span>
          </div>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Unique <span className="gradient-text">Features</span>
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
            Our team is always dedicated to working on new features to make sure that we don&apos;t have any competition.
          </p>
        </div>

        {/* Bento grid layout */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* Large Support */}
          <div className="group relative overflow-hidden rounded-2xl glass p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.01]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute right-0 top-0 h-48 w-48 -translate-y-12 translate-x-12 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/15" />
            <div className="relative">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
                <Globe className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Large Support</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                We offer one of the largest collections of games you can use our product on. With over a million games, you will have endless fun.
              </p>
            </div>
          </div>

          {/* Fully Automatic */}
          <div className="group relative overflow-hidden rounded-2xl glass p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.01]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute right-0 top-0 h-48 w-48 -translate-y-12 translate-x-12 rounded-full bg-accent/5 blur-3xl transition-all duration-500 group-hover:bg-accent/15" />
            <div className="relative">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-accent/20">
                <Settings2 className="h-6 w-6 text-accent transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Fully Automatic</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                The moment you purchase our product, you will receive the license in your Discord ticket.
              </p>
            </div>
          </div>
        </div>

        {/* Massive Games - full width */}
        <div className="mt-6 group relative overflow-hidden rounded-2xl glass transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="grid items-center gap-0 md:grid-cols-2">
            <div className="p-8 md:p-12">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
                <Gamepad2 className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Massive Games</h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Access our massive collection of supported games with seamless execution. Experience the best gameplay with our extensive game library. Featuring front-page games, for the cheapest prices ever.
              </p>
            </div>
            <div className="flex items-center justify-center p-12">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-primary/15 blur-2xl animate-orb-2" />
                <div className="relative flex h-40 w-40 items-center justify-center rounded-2xl glass">
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

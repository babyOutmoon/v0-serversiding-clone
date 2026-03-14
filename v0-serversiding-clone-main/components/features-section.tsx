import { CloudOff, Zap, Monitor } from "lucide-react"

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      {/* Background accent */}
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-[400px] w-[300px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">Why Choose Us</span>
          </div>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Delivering the <span className="gradient-text">Best Experience</span>
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
            With a ton of features, we&apos;ve made it easy for you to get the most out of our product.
          </p>
        </div>

        {/* Main feature card */}
        <div className="mt-16 overflow-hidden rounded-2xl glass gradient-border">
          <div className="grid items-center gap-0 md:grid-cols-2">
            {/* Visual */}
            <div className="flex items-center justify-center p-12 md:p-16">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-2xl animate-orb-1" />
                <div className="relative flex h-48 w-48 items-center justify-center rounded-2xl border border-border/30 glass md:h-56 md:w-56">
                  <Monitor className="h-20 w-20 text-primary/70" strokeWidth={1} />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="p-8 md:p-12">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
                <CloudOff className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">No Download</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground md:text-3xl">No Download Required</h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Run all of your favourite scripts directly from our dashboard in-game. Experience instant execution speeds in a few seconds, and stop having to worry about problems with scripts!
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {["Instant game connection", "Large script hub", "Private scripts", "Auto-run support"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Zap className="h-3 w-3 text-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { Cloud, Infinity, Zap } from "lucide-react"

const cards = [
  {
    icon: Cloud,
    title: "Cloud Script Hub",
    description: "Despite our software being internal, you can still load scripts from our cloud script hub. We ensure any scripts you create privately don't get lost either.",
  },
  {
    icon: Infinity,
    title: "Endless Execution",
    description: "Execute anything you wish with our product. Our product can be used to execute filtering-disabled scripts on all of our supported games without any issues what-so-ever.",
  },
  {
    icon: Zap,
    title: "Live Execution",
    description: "Our software is designed to be performant and be very quick. Any script you run replicates instantly on the game server you are in, even if you run it from a web panel.",
  },
]

export function InterfaceSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Interface</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Beautiful Interface
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            With a ton of features, we&apos;ve made it easy for you to get the most out of our product.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
              <div className="relative">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <card.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                <p className="mt-3 leading-relaxed text-sm text-muted-foreground">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

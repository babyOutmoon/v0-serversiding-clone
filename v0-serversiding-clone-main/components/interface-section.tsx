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
    description: "Our software is designed to be performant and be very quick. Any script you run replicates instantly on the game server you are in, even if you run it from a internal panel.",
  },
]

export function InterfaceSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">Interface</span>
          </div>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Beautiful <span className="gradient-text">Interface</span>
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
            With a ton of features, we&apos;ve made it easy for you to get the most out of our product.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl glass p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02]"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              {/* Hover glow */}
              <div className="absolute right-0 top-0 h-40 w-40 -translate-y-10 translate-x-10 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/15" />

              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
                  <card.icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{card.title}</h3>
                <p className="mt-3 leading-relaxed text-sm text-muted-foreground">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

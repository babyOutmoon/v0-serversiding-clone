"use client"

import { useEffect, useState, useRef } from "react"
import { Info } from "lucide-react"

const stats = [
  { value: 500, suffix: "+", label: "customer accounts on serversiding.xyz", source: "Real time stats" },
  { value: 1200, suffix: "+", label: "unique games logged since 2025", source: "Real time stats" },
  { value: 99.97, suffix: "%", label: "satisfaction rate from our customers", source: "TrustPilot Reviews" },
  { value: 50, suffix: "K+", label: "roblox scripts executed by our users", source: "Real time stats" },
]

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 2000
          const startTime = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target * 100) / 100)

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setCount(target)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return (
    <div ref={ref} className="text-4xl font-bold text-foreground md:text-5xl">
      {Number.isInteger(target) ? Math.floor(count).toLocaleString() : count.toFixed(2)}
      {suffix}
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Social Proof</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Trusted by <span className="text-primary">Hundreds</span> of Customers
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            moon server-side is built by a team of experts and veterans in this community. We strive to deliver many high-quality supported games, and one of the best experiences you will have.
          </p>
        </div>

        {/* Stats grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 text-center"
            >
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
                <Info className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary">{stat.source}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

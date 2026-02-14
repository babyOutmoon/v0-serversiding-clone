"use client"

import { useState } from "react"
import { Check, Star } from "lucide-react"

const DISCORD_URL = "https://discord.gg/YRF26H8bMA"

const plans = [
  {
    name: "Whitelist",
    price: "500R$",
    period: "/lifetime",
    description: "It's only only the whitelit.",
    features: [
      "Access to 100+ games",
      "Cloud Script Hub",
      "Basic script execution",
      "Discord support",
      "Little Strict ToS",
    ],
    cta: "Get Whitelist",
    highlighted: false,
    action: "discord" as const,
  },
  {
    name: "Abuse Permission (Add-On)",
    price: "500R$",
    period: "/lifetime",
    description: "Warning: This is only a Add-On. You need to buy the Whitelist before buying this!",
    features: [
      "Access to 100+ games",
      "Cloud Script Hub",
      "Unlimited script execution",
      "Priority support",
      "More LEess ToS",
      "Auto-run support",
    ],
    cta: "Get Abuse Permissions",
    highlighted: true,
    action: "discord" as const,
  },
  {
    name: "Free Trial",
    price: "0R$",
    period: "/lifetime",
    description: "Only games with 5 players.",
    features: [
      "Access to 10 games",
      "Cloud Script Hub",
      "Limited script execution",
      "Limited support",
      "Executor access",
      "Custom script requests",
    ],
    cta: "Get Free Trial",
    highlighted: false,
    action: "soon" as const,
  },
]

export function PricingSection() {
  const [showToast, setShowToast] = useState(false)

  function handleClick() {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-primary/5 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">Pricing</span>
          </div>
          <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Choose Your <span className="gradient-text">Plan</span>
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-muted-foreground md:text-lg leading-relaxed">
            Simple and transparent pricing. Pick the plan that fits your needs and start executing today.
          </p>
        </div>

        {/* Plans grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative flex flex-col rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] ${
                plan.highlighted
                  ? "glass-strong shadow-xl shadow-primary/10 animate-border-glow border-primary/40"
                  : "glass hover:shadow-lg hover:shadow-primary/5"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/30">
                    <Star className="h-3 w-3 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Top gradient line */}
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${
                plan.highlighted ? "via-primary/60" : "via-primary/30 opacity-0 group-hover:opacity-100"
              } to-transparent transition-opacity`} />

              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold gradient-text">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mb-8 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {plan.action === "discord" ? (
                  <a
                    href={DISCORD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full rounded-xl px-6 py-3.5 text-center text-sm font-semibold transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
                        : "border border-border/50 bg-secondary/50 text-foreground hover:bg-secondary hover:border-border"
                    }`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <button
                    onClick={handleClick}
                    className={`w-full rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
                        : "border border-border/50 bg-secondary/50 text-foreground hover:bg-secondary hover:border-border"
                    }`}
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast notification */}
      <div
        className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ease-out ${
          showToast
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="rounded-xl glass-strong px-8 py-4 shadow-2xl shadow-primary/20 border-primary/30">
          <p className="text-sm font-semibold text-foreground">Soon...</p>
        </div>
      </div>
    </section>
  )
}

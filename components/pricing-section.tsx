"use client"

import { useState } from "react"
import { Check } from "lucide-react"

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
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
            <span className="text-xs font-medium text-primary">Pricing</span>
          </div>
          <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Choose Your <span className="text-primary">Plan</span>
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-muted-foreground md:text-lg">
            Simple and transparent pricing. Pick the plan that fits your needs and start executing today.
          </p>
        </div>

        {/* Plans grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all ${plan.highlighted
                  ? "border-primary/50 bg-card shadow-lg shadow-primary/10"
                  : "border-border/50 bg-card hover:border-border"
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mb-8 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
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
                    className={`block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-all ${plan.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
                        : "border border-border bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <button
                    onClick={handleClick}
                    className={`w-full rounded-lg px-6 py-3 text-sm font-semibold transition-all ${plan.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
                        : "border border-border bg-secondary text-foreground hover:bg-secondary/80"
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
        className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ease-out ${showToast
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
          }`}
      >
        <div className="rounded-xl border border-primary/30 bg-card px-8 py-4 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <p className="text-sm font-semibold text-foreground">Soon...</p>
        </div>
      </div>
    </section>
  )
}

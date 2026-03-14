"use client"

import { useState } from "react"
import { Check, Star } from "lucide-react"

const DISCORD_URL = "https://discord.gg/YRF26H8bMA"

const plans = [
  {
    name: "Standard",
    price: "500R$",
    period: "/lifetime",
    description: "Perfect to discover.",
    features: [
      "Access to 100+ games",
      "Cloud Script Hub",
      "Basic script execution",
      "Discord support",
      "Strict ToS",
    ],
    cta: "Get Standard",
    highlighted: false,
    action: "popup" as const,
    gamepassUrl: "https://www.roblox.com/game-pass/1699936888/Standard",
  },
  {
    name: "Premium",
    price: "1000R$",
    period: "/lifetime",
    description: "The Best Plan.",
    features: [
      "Access to 100+ games",
      "Cloud Script Hub",
      "Unlimited script execution",
      "Priority support",
      "Very Less ToS",
      "Auto-run support",
    ],
    cta: "Get Premium",
    highlighted: true,
    action: "popup" as const,
    gamepassUrl: "https://www.roblox.com/game-pass/1740553477/Premium",
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
  const [popupData, setPopupData] = useState<{name: string, url: string} | null>(null)

  function handleClick(planName: string, action: "discord" | "soon" | "popup", url?: string) {
    if (action === "popup" && url) {
      setPopupData({ name: planName, url })
    } else if (action === "soon") {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
    }
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
              className={`group relative flex flex-col rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] ${plan.highlighted
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
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${plan.highlighted ? "via-primary/60" : "via-primary/30 opacity-0 group-hover:opacity-100"
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
                <button
                  onClick={() => handleClick(plan.name, plan.action, plan.gamepassUrl)}
                  className={`w-full rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 ${plan.highlighted
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
                      : "border border-border/50 bg-secondary/50 text-foreground hover:bg-secondary hover:border-border"
                    }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup Modal for Purchasing */}
      {popupData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg glass-strong rounded-3xl border border-primary/20 shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setPopupData(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">How to get {popupData.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">Follow these 4 simple steps to activate your plan.</p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold text-foreground">Buy the Gamepass</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">Purchase the official {popupData.name} gamepass on Roblox.</p>
                  <a 
                    href={popupData.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg bg-[#00A2FF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0092E6] transition-colors gap-2"
                  >
                    Buy on Roblox
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground font-bold text-sm border border-border">2</div>
                <div>
                  <h4 className="font-semibold text-foreground">Sign Up or Login</h4>
                  <p className="text-sm text-muted-foreground mt-1">Create an account on our dashboard if you haven&apos;t already.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground font-bold text-sm border border-border">3</div>
                <div>
                  <h4 className="font-semibold text-foreground">Enable Public Inventory</h4>
                  <p className="text-sm text-muted-foreground mt-1">In your Roblox Privacy Settings, set &quot;Who can see my inventory?&quot; to Everyone.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground font-bold text-sm border border-border">4</div>
                <div>
                  <h4 className="font-semibold text-foreground">Whitelist Your Account</h4>
                  <p className="text-sm text-muted-foreground mt-1">Go to the <strong>Whitelist tab</strong> in our dashboard, enter your Roblox Username, and click Verify!</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <a
                href="/login"
                className="w-full rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      <div
        className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ease-out ${showToast
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

"use client"

import { useState } from "react"
import { Check, Star, X, ExternalLink, Copy, CheckCircle } from "lucide-react"

const STANDARD_GAMEPASS = "https://www.roblox.com/game-pass/1699936888/Standard"
const PREMIUM_GAMEPASS = "https://www.roblox.com/game-pass/1740553477/Premium"

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
    gamepassUrl: STANDARD_GAMEPASS,
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
    gamepassUrl: PREMIUM_GAMEPASS,
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
    gamepassUrl: null,
  },
]

export function PricingSection() {
  const [showToast, setShowToast] = useState(false)
  const [purchaseModal, setPurchaseModal] = useState<{ open: boolean; plan: typeof plans[0] | null }>({ open: false, plan: null })
  const [copied, setCopied] = useState(false)

  function handleClick(plan: typeof plans[0]) {
    if (plan.gamepassUrl) {
      setPurchaseModal({ open: true, plan })
    } else {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
    }
  }

  function copyLink() {
    if (purchaseModal.plan?.gamepassUrl) {
      navigator.clipboard.writeText(purchaseModal.plan.gamepassUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-primary/5 blur-[140px]" />
      </div>

      {/* Purchase Modal */}
      {purchaseModal.open && purchaseModal.plan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg glass-strong rounded-2xl border border-primary/30 p-6 animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setPurchaseModal({ open: false, plan: null })}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/20 mb-4">
                <Star className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Get {purchaseModal.plan.name}</h2>
              <p className="text-muted-foreground mt-1">Follow these steps to purchase</p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Step 1 */}
              <div className="flex gap-4 p-4 rounded-xl glass border border-border/30">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Enable Inventory</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Make sure your Roblox inventory is set to <span className="text-primary font-medium">Public</span> in your privacy settings so we can verify your purchase.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 p-4 rounded-xl glass border border-border/30">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Purchase the Gamepass</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click the button below to purchase the <span className="text-primary font-medium">{purchaseModal.plan.name}</span> gamepass on Roblox.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <a
                      href={purchaseModal.plan.gamepassUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Gamepass
                    </a>
                    <button
                      onClick={copyLink}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-all"
                    >
                      {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 p-4 rounded-xl glass border border-border/30">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Redeem in Dashboard</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    After purchasing, <span className="text-primary font-medium">login or sign up</span> to Moon Server-Side and go to the <span className="text-primary font-medium">Whitelist</span> tab to redeem your Roblox username.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPurchaseModal({ open: false, plan: null })}
                className="flex-1 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/80 transition-all"
              >
                Close
              </button>
              <a
                href="/signup"
                className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-center text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all"
              >
                Sign Up Now
              </a>
            </div>
          </div>
        </div>
      )}

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
                  onClick={() => handleClick(plan)}
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

"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CtaSection() {
  const [showToast, setShowToast] = useState(false)

  function handleTryFree() {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl glass-strong">
          {/* Animated background orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/15 blur-[80px] animate-orb-1" />
            <div className="absolute right-0 bottom-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-accent/10 blur-[80px] animate-orb-2" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-96 rounded-full bg-primary/5 blur-[100px]" />
          </div>

          {/* Grid pattern */}
          <div className="pointer-events-none absolute inset-0 grid-pattern opacity-20" />

          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="relative flex flex-col items-center px-8 py-16 text-center md:px-16 md:py-24">
            <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Start Controlling Large Games Today With{" "}
              <span className="gradient-text">Moon Server-Side</span>
            </h2>

            <p className="mt-6 max-w-2xl text-pretty text-muted-foreground md:text-lg leading-relaxed">
              Bypass filtering enabled and any restrictions with our roblox executor and run the largest games. Zero downloads, huge script library, instant execution. Everything you need in one place. Starting at the cheap price of 500R$.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="#pricing"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary via-accent to-primary opacity-0 transition-opacity group-hover:opacity-100 animate-gradient" />
                <span className="relative flex items-center gap-2">
                  Discover Plans
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <button
                onClick={handleTryFree}
                className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-secondary hover:border-border hover:scale-[1.02] active:scale-[0.98]"
              >
                Try for Free
              </button>
            </div>
          </div>
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

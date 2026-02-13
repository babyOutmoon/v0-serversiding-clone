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
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card">
          {/* Background glows */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[80px]" />
            <div className="absolute right-0 bottom-0 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-primary/10 blur-[80px]" />
          </div>

          <div className="relative flex flex-col items-center px-8 py-16 text-center md:px-16 md:py-24">
            <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Start Controlling Large Games Today With{" "}
              <span className="text-primary">Moon Server-Side</span>
            </h2>

            <p className="mt-6 max-w-2xl text-pretty text-muted-foreground md:text-lg">
              Bypass filtering enabled and any restrictions with our roblox executor and run the largest games. Zero downloads, huge script library, instant execution. Everything you need in one place. Starting at the cheap price of 500R$.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="#pricing"
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
              >
                Discover Plans
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                onClick={handleTryFree}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary/80"
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
        <div className="rounded-xl border border-primary/30 bg-card px-8 py-4 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <p className="text-sm font-semibold text-foreground">Soon...</p>
        </div>
      </div>
    </section>
  )
}

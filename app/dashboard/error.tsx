"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md">
        <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          An error occurred while loading the dashboard. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/80 transition-all"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}

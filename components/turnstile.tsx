"use client"

import { useEffect, useRef, useCallback } from "react"

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: TurnstileOptions) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onloadTurnstileCallback?: () => void
  }
}

interface TurnstileOptions {
  sitekey: string
  callback?: (token: string) => void
  "error-callback"?: () => void
  "expired-callback"?: () => void
  theme?: "light" | "dark" | "auto"
  size?: "normal" | "compact"
}

interface TurnstileProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  theme?: "light" | "dark" | "auto"
}

export function Turnstile({ onVerify, onError, onExpire, theme = "dark" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const scriptLoadedRef = useRef(false)

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return
    
    // Remove existing widget if any
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch {
        // Ignore
      }
    }

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (!siteKey) {
      console.error("Turnstile site key not configured")
      return
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      "error-callback": onError,
      "expired-callback": onExpire,
      theme: theme,
      size: "normal",
    })
  }, [onVerify, onError, onExpire, theme])

  useEffect(() => {
    // Load Turnstile script if not already loaded
    if (!scriptLoadedRef.current && !document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script")
      script.id = "cf-turnstile-script"
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCallback"
      script.async = true
      script.defer = true
      
      window.onloadTurnstileCallback = () => {
        scriptLoadedRef.current = true
        renderWidget()
      }
      
      document.head.appendChild(script)
    } else if (window.turnstile) {
      renderWidget()
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }, [renderWidget])

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center my-4"
    />
  )
}

// Server-side verification function
export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    console.error("Turnstile secret key not configured")
    return false
  }

  try {
    const formData = new FormData()
    formData.append("secret", secretKey)
    formData.append("response", token)
    if (ip) {
      formData.append("remoteip", ip)
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    )

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("Turnstile verification error:", error)
    return false
  }
}

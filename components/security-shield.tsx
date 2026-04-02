"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

export function SecurityShield({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  // Detect dev tools
  const detectDevTools = useCallback(() => {
    const threshold = 160
    const widthThreshold = window.outerWidth - window.innerWidth > threshold
    const heightThreshold = window.outerHeight - window.innerHeight > threshold
    
    if (widthThreshold || heightThreshold) {
      // Dev tools might be open - you can add custom handling here
      console.clear()
    }
  }, [])

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Disable keyboard shortcuts for dev tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault()
        return false
      }
      
      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault()
        return false
      }
      
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault()
        return false
      }
      
      // Ctrl+Shift+C (Element picker)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault()
        return false
      }
      
      // Ctrl+U (View source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault()
        return false
      }
      
      // Ctrl+S (Save page)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault()
        return false
      }

      // Cmd variants for Mac
      if (e.metaKey && e.altKey && e.key === "i") {
        e.preventDefault()
        return false
      }
      
      if (e.metaKey && e.altKey && e.key === "j") {
        e.preventDefault()
        return false
      }
      
      if (e.metaKey && e.altKey && e.key === "c") {
        e.preventDefault()
        return false
      }
      
      if (e.metaKey && e.key === "u") {
        e.preventDefault()
        return false
      }
    }

    // Disable text selection on sensitive elements
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.closest("[data-no-select]")) {
        e.preventDefault()
        return false
      }
    }

    // Disable drag on images
    const handleDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === "IMG") {
        e.preventDefault()
        return false
      }
    }

    // Clear console periodically
    const clearConsoleInterval = setInterval(() => {
      console.clear()
    }, 1000)

    // Detect if page is being inspected via timing
    const antiDebugInterval = setInterval(() => {
      const start = performance.now()
      // Check console timing - if it takes too long, dev tools might be open
      for (let i = 0; i < 100; i++) {
        console.log("")
        console.clear()
      }
      const end = performance.now()
      if (end - start > 200) {
        // Potential dev tools detected
        console.clear()
      }
    }, 10000)

    // Detect dev tools resize
    window.addEventListener("resize", detectDevTools)
    
    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("selectstart", handleSelectStart)
    document.addEventListener("dragstart", handleDragStart)

    // Disable copy on sensitive elements
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("[data-no-copy]")) {
        e.preventDefault()
        return false
      }
    }
    document.addEventListener("copy", handleCopy)

    // Initial dev tools check
    detectDevTools()

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("selectstart", handleSelectStart)
      document.removeEventListener("dragstart", handleDragStart)
      document.removeEventListener("copy", handleCopy)
      window.removeEventListener("resize", detectDevTools)
      clearInterval(clearConsoleInterval)
      clearInterval(antiDebugInterval)
    }
  }, [detectDevTools, router])

  return <>{children}</>
}

// CSS to add to globals.css for additional protection
export const securityStyles = `
  /* Disable text selection on protected content */
  [data-no-select] {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  /* Disable image dragging */
  img {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
  }
  
  /* Disable pointer events on hidden content */
  [data-protected] {
    pointer-events: none;
  }
`

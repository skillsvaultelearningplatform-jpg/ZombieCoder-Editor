"use client"

import { useEffect, useCallback } from "react"

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  callback: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey
        const metaMatch = !!shortcut.metaKey === event.metaKey
        const shiftMatch = !!shortcut.shiftKey === event.shiftKey
        const altMatch = !!shortcut.altKey === event.altKey

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          event.preventDefault()
          shortcut.callback()
          break
        }
      }
    },
    [shortcuts],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

// Specific hook for AI Command Box
export function useAICommandShortcut(onOpen: () => void) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: "k",
      ctrlKey: true,
      callback: onOpen,
      description: "Open AI Command Box",
    },
    {
      key: "k",
      metaKey: true, // For Mac
      callback: onOpen,
      description: "Open AI Command Box (Mac)",
    },
  ]

  useKeyboardShortcuts(shortcuts)
}

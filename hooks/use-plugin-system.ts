"use client"

import { useState, useCallback, useEffect } from "react"

export interface Extension {
  id: string
  name: string
  version: string
  description: string
  author: string
  category: "theme" | "language" | "tool" | "ai" | "snippet"
  isEnabled: boolean
  isInstalled: boolean
  size: string
  rating: number
  downloads: number
  icon?: string
  main?: string
  contributes?: {
    themes?: any[]
    languages?: any[]
    commands?: any[]
    snippets?: any[]
  }
}

export interface PluginAPI {
  registerCommand: (id: string, callback: () => void) => void
  registerTheme: (theme: any) => void
  registerLanguage: (language: any) => void
  registerSnippet: (snippet: any) => void
  showMessage: (message: string) => void
  getWorkspaceConfig: () => any
  setWorkspaceConfig: (config: any) => void
}

export function usePluginSystem() {
  const [extensions, setExtensions] = useState<Extension[]>([])
  const [installedExtensions, setInstalledExtensions] = useState<Extension[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock extension marketplace data
  const mockExtensions: Extension[] = [
    {
      id: "zombiecoder.dark-theme",
      name: "ZombieCoder Dark Pro",
      version: "1.0.0",
      description: "Premium dark theme with Bengali syntax highlighting",
      author: "ZombieCoder Team",
      category: "theme",
      isEnabled: false,
      isInstalled: false,
      size: "2.1 MB",
      rating: 4.8,
      downloads: 15420,
      icon: "🎨",
    },
    {
      id: "zombiecoder.bengali-snippets",
      name: "Bengali Code Snippets",
      version: "2.1.0",
      description: "Code snippets with Bengali comments and documentation",
      author: "BD Developers",
      category: "snippet",
      isEnabled: false,
      isInstalled: false,
      size: "1.5 MB",
      rating: 4.6,
      downloads: 8930,
      icon: "📝",
    },
    {
      id: "zombiecoder.ai-assistant-pro",
      name: "AI Assistant Pro",
      version: "1.5.0",
      description: "Enhanced AI with Bengali language support and local models",
      author: "ZombieCoder AI",
      category: "ai",
      isEnabled: false,
      isInstalled: false,
      size: "45.2 MB",
      rating: 4.9,
      downloads: 23450,
      icon: "🤖",
    },
    {
      id: "zombiecoder.python-tools",
      name: "Python Development Tools",
      version: "3.0.1",
      description: "Advanced Python debugging and analysis tools",
      author: "Python BD",
      category: "tool",
      isEnabled: false,
      isInstalled: false,
      size: "8.7 MB",
      rating: 4.7,
      downloads: 12340,
      icon: "🐍",
    },
  ]

  // Load extensions from marketplace
  const loadExtensions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setExtensions(mockExtensions)
    } catch (err) {
      setError("Failed to load extensions")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Install extension
  const installExtension = useCallback(
    async (extensionId: string) => {
      setIsLoading(true)
      try {
        const extension = extensions.find((ext) => ext.id === extensionId)
        if (extension) {
          const installedExt = { ...extension, isInstalled: true }
          setInstalledExtensions((prev) => [...prev, installedExt])
          setExtensions((prev) => prev.map((ext) => (ext.id === extensionId ? installedExt : ext)))

          // Store in localStorage
          const stored = localStorage.getItem("zombiecoder-extensions") || "[]"
          const storedExtensions = JSON.parse(stored)
          storedExtensions.push(installedExt)
          localStorage.setItem("zombiecoder-extensions", JSON.stringify(storedExtensions))
        }
      } catch (err) {
        setError("Failed to install extension")
      } finally {
        setIsLoading(false)
      }
    },
    [extensions],
  )

  // Uninstall extension
  const uninstallExtension = useCallback(async (extensionId: string) => {
    setInstalledExtensions((prev) => prev.filter((ext) => ext.id !== extensionId))
    setExtensions((prev) =>
      prev.map((ext) => (ext.id === extensionId ? { ...ext, isInstalled: false, isEnabled: false } : ext)),
    )

    // Update localStorage
    const stored = localStorage.getItem("zombiecoder-extensions") || "[]"
    const storedExtensions = JSON.parse(stored)
    const updated = storedExtensions.filter((ext: Extension) => ext.id !== extensionId)
    localStorage.setItem("zombiecoder-extensions", JSON.stringify(updated))
  }, [])

  // Enable/disable extension
  const toggleExtension = useCallback((extensionId: string) => {
    setInstalledExtensions((prev) =>
      prev.map((ext) => (ext.id === extensionId ? { ...ext, isEnabled: !ext.isEnabled } : ext)),
    )
    setExtensions((prev) => prev.map((ext) => (ext.id === extensionId ? { ...ext, isEnabled: !ext.isEnabled } : ext)))
  }, [])

  // Plugin API for extensions
  const pluginAPI: PluginAPI = {
    registerCommand: (id: string, callback: () => void) => {
      console.log(`[v0] Registered command: ${id}`)
    },
    registerTheme: (theme: any) => {
      console.log(`[v0] Registered theme:`, theme)
    },
    registerLanguage: (language: any) => {
      console.log(`[v0] Registered language:`, language)
    },
    registerSnippet: (snippet: any) => {
      console.log(`[v0] Registered snippet:`, snippet)
    },
    showMessage: (message: string) => {
      console.log(`[v0] Extension message: ${message}`)
    },
    getWorkspaceConfig: () => {
      return JSON.parse(localStorage.getItem("zombiecoder-config") || "{}")
    },
    setWorkspaceConfig: (config: any) => {
      localStorage.setItem("zombiecoder-config", JSON.stringify(config))
    },
  }

  // Load installed extensions on mount
  useEffect(() => {
    const stored = localStorage.getItem("zombiecoder-extensions")
    if (stored) {
      const storedExtensions = JSON.parse(stored)
      setInstalledExtensions(storedExtensions)
    }
    loadExtensions()
  }, [loadExtensions])

  return {
    extensions,
    installedExtensions,
    isLoading,
    error,
    loadExtensions,
    installExtension,
    uninstallExtension,
    toggleExtension,
    pluginAPI,
  }
}

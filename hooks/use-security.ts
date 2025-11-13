"use client"

import { useState, useCallback, useEffect } from "react"

export interface SecurityConfig {
  blockExternalRequests: boolean
  enableSandbox: boolean
  privacyMode: boolean
  telemetryDisabled: boolean
  proxyEnabled: boolean
  proxyUrl?: string
  allowedDomains: string[]
  blockedDomains: string[]
}

export interface SecurityThreat {
  id: string
  type: "malware" | "external_request" | "unsafe_code" | "telemetry"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  blocked: boolean
  timestamp: Date
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  blockExternalRequests: true,
  enableSandbox: true,
  privacyMode: true,
  telemetryDisabled: true,
  proxyEnabled: false,
  allowedDomains: ["localhost", "127.0.0.1"],
  blockedDomains: ["analytics.google.com", "facebook.com", "doubleclick.net"],
}

export function useSecurity() {
  const [config, setConfig] = useState<SecurityConfig>(DEFAULT_SECURITY_CONFIG)
  const [threats, setThreats] = useState<SecurityThreat[]>([])
  const [isSecureMode, setIsSecureMode] = useState(true)

  // Load security config from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("zombiecoder_security_config")
      if (stored) {
        setConfig({ ...DEFAULT_SECURITY_CONFIG, ...JSON.parse(stored) })
      }
    } catch (error) {
      console.error("Failed to load security config:", error)
    }
  }, [])

  // Save security config
  const saveConfig = useCallback(
    (newConfig: Partial<SecurityConfig>) => {
      const updatedConfig = { ...config, ...newConfig }
      setConfig(updatedConfig)
      localStorage.setItem("zombiecoder_security_config", JSON.stringify(updatedConfig))
    },
    [config],
  )

  // Block external requests
  const blockExternalRequests = useCallback(() => {
    if (!config.blockExternalRequests) return

    // Override fetch to block external requests
    const originalFetch = window.fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url

      // Check if URL is allowed
      const isAllowed = config.allowedDomains.some((domain) => url.includes(domain))
      const isBlocked = config.blockedDomains.some((domain) => url.includes(domain))

      if (isBlocked || (!isAllowed && !url.startsWith("/"))) {
        const threat: SecurityThreat = {
          id: `threat_${Date.now()}`,
          type: "external_request",
          severity: "medium",
          description: `Blocked external request to: ${url}`,
          blocked: true,
          timestamp: new Date(),
        }
        setThreats((prev) => [...prev, threat])
        throw new Error(`External request blocked: ${url}`)
      }

      return originalFetch(input, init)
    }
  }, [config])

  // Configure proxy
  const configureProxy = useCallback(
    (proxyUrl: string) => {
      saveConfig({ proxyEnabled: true, proxyUrl })
    },
    [saveConfig],
  )

  // Validate local only operations
  const validateLocalOnly = useCallback(
    (operation: string) => {
      if (!config.privacyMode) return true

      // Check if operation involves external resources
      const externalPatterns = [/https?:\/\/(?!localhost|127\.0\.0\.1)/, /cdn\./, /api\./, /analytics/, /tracking/]

      const isExternal = externalPatterns.some((pattern) => pattern.test(operation))

      if (isExternal) {
        const threat: SecurityThreat = {
          id: `threat_${Date.now()}`,
          type: "external_request",
          severity: "high",
          description: `Blocked external operation: ${operation}`,
          blocked: true,
          timestamp: new Date(),
        }
        setThreats((prev) => [...prev, threat])
        return false
      }

      return true
    },
    [config.privacyMode],
  )

  // Disable analytics
  const disableAnalytics = useCallback(() => {
    // Block common analytics scripts
    const analyticsBlacklist = [
      "google-analytics.com",
      "googletagmanager.com",
      "facebook.com/tr",
      "hotjar.com",
      "mixpanel.com",
      "segment.com",
    ]

    analyticsBlacklist.forEach((domain) => {
      if (!config.blockedDomains.includes(domain)) {
        saveConfig({
          blockedDomains: [...config.blockedDomains, domain],
        })
      }
    })

    // Disable common tracking globals
    if (typeof window !== "undefined") {
      ;(window as any).gtag = () => {}
      ;(window as any).ga = () => {}
      ;(window as any).fbq = () => {}
      ;(window as any)._paq = []
    }
  }, [config.blockedDomains, saveConfig])

  // Clear telemetry data
  const clearTelemetryData = useCallback(() => {
    try {
      // Clear localStorage telemetry
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes("analytics") || key.includes("telemetry") || key.includes("tracking"))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      // Clear sessionStorage telemetry
      const sessionKeysToRemove = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.includes("analytics") || key.includes("telemetry") || key.includes("tracking"))) {
          sessionKeysToRemove.push(key)
        }
      }
      sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key))

      console.log("Telemetry data cleared")
    } catch (error) {
      console.error("Failed to clear telemetry data:", error)
    }
  }, [])

  // Enable privacy mode
  const privacyMode = useCallback(() => {
    saveConfig({
      privacyMode: true,
      blockExternalRequests: true,
      telemetryDisabled: true,
    })
    disableAnalytics()
    clearTelemetryData()
    blockExternalRequests()
  }, [saveConfig, disableAnalytics, clearTelemetryData, blockExternalRequests])

  // Initialize security features
  useEffect(() => {
    if (config.blockExternalRequests) {
      blockExternalRequests()
    }
    if (config.telemetryDisabled) {
      disableAnalytics()
    }
    if (config.privacyMode) {
      clearTelemetryData()
    }
  }, [config, blockExternalRequests, disableAnalytics, clearTelemetryData])

  return {
    config,
    threats,
    isSecureMode,
    saveConfig,
    blockExternalRequests,
    configureProxy,
    validateLocalOnly,
    disableAnalytics,
    clearTelemetryData,
    privacyMode,
  }
}

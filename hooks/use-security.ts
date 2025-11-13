"use client"

import { useEffect } from "react"

// Store reference to original fetch if it exists
const originalFetch = (globalThis as any).__originalFetch || globalThis.fetch

export function useSecurity() {
  useEffect(() => {
    // Restore original fetch function to unblock blob URLs
    if (originalFetch && globalThis.fetch !== originalFetch) {
      console.log("[v0] Restoring original fetch function to fix blob URL blocking")
      globalThis.fetch = originalFetch
    }
  }, [])

  // Return mock security functions
  return {
    config: {
      blockExternalRequests: false,
      enableSandbox: false,
      privacyMode: false,
      telemetryDisabled: false,
      proxyEnabled: false,
      allowedDomains: ["localhost", "127.0.0.1"],
      blockedDomains: [],
    },
    threats: [],
    isSecureMode: false,
    saveConfig: () => {},
    blockExternalRequests: () => {},
    configureProxy: () => {},
    validateLocalOnly: () => true,
    disableAnalytics: () => {},
    clearTelemetryData: () => {},
    privacyMode: () => {},
  }
}

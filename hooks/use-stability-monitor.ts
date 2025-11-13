"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface StabilityMetrics {
  uptime: number
  crashCount: number
  memoryLeaks: number
  performanceScore: number
  errorRate: number
  lastCrash: Date | null
}

export interface StabilityAlert {
  id: string
  type: "memory-leak" | "performance-degradation" | "high-error-rate" | "crash"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: Date
  resolved: boolean
}

export function useStabilityMonitor() {
  const [metrics, setMetrics] = useState<StabilityMetrics>({
    uptime: 0,
    crashCount: 0,
    memoryLeaks: 0,
    performanceScore: 95,
    errorRate: 0,
    lastCrash: null,
  })

  const [alerts, setAlerts] = useState<StabilityAlert[]>([])
  const [isStable, setIsStable] = useState(true)
  const startTime = useRef(Date.now())
  const errorCount = useRef(0)
  const lastErrorTime = useRef(Date.now())

  const checkMemoryLeaks = useCallback(() => {
    if (typeof window !== "undefined" && (performance as any).memory) {
      const memInfo = (performance as any).memory
      const memoryUsage = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize

      if (memoryUsage > 0.9) {
        const alert: StabilityAlert = {
          id: `memory_${Date.now()}`,
          type: "memory-leak",
          severity: "high",
          message: `Potential memory leak detected: ${(memoryUsage * 100).toFixed(1)}% usage`,
          timestamp: new Date(),
          resolved: false,
        }

        setAlerts((prev) => [alert, ...prev.slice(0, 19)])
        setMetrics((prev) => ({ ...prev, memoryLeaks: prev.memoryLeaks + 1 }))
      }
    }
  }, [])

  const checkPerformance = useCallback(() => {
    const now = performance.now()
    const frameTime = now % 1000

    if (frameTime > 50) {
      // Frame took longer than 50ms
      setMetrics((prev) => ({
        ...prev,
        performanceScore: Math.max(prev.performanceScore - 1, 0),
      }))

      if (frameTime > 100) {
        const alert: StabilityAlert = {
          id: `perf_${Date.now()}`,
          type: "performance-degradation",
          severity: "medium",
          message: `Slow frame detected: ${frameTime.toFixed(1)}ms`,
          timestamp: new Date(),
          resolved: false,
        }

        setAlerts((prev) => [alert, ...prev.slice(0, 19)])
      }
    }
  }, [])

  const reportError = useCallback(() => {
    errorCount.current += 1
    const now = Date.now()
    const timeSinceLastError = now - lastErrorTime.current

    // Calculate error rate (errors per minute)
    const errorRate = timeSinceLastError < 60000 ? errorCount.current / (timeSinceLastError / 60000) : 0

    setMetrics((prev) => ({ ...prev, errorRate }))

    if (errorRate > 5) {
      // More than 5 errors per minute
      const alert: StabilityAlert = {
        id: `error_rate_${Date.now()}`,
        type: "high-error-rate",
        severity: "high",
        message: `High error rate detected: ${errorRate.toFixed(1)} errors/min`,
        timestamp: new Date(),
        resolved: false,
      }

      setAlerts((prev) => [alert, ...prev.slice(0, 19)])
      setIsStable(false)
    }

    lastErrorTime.current = now
  }, [])

  const reportCrash = useCallback(() => {
    setMetrics((prev) => ({
      ...prev,
      crashCount: prev.crashCount + 1,
      lastCrash: new Date(),
    }))

    const alert: StabilityAlert = {
      id: `crash_${Date.now()}`,
      type: "crash",
      severity: "critical",
      message: "Application crash detected and recovered",
      timestamp: new Date(),
      resolved: false,
    }

    setAlerts((prev) => [alert, ...prev.slice(0, 19)])
    setIsStable(false)
  }, [])

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, resolved: true } : alert)))
  }, [])

  const getStabilityScore = useCallback(() => {
    const { crashCount, memoryLeaks, performanceScore, errorRate } = metrics
    let score = 100

    // Deduct points for issues
    score -= crashCount * 10
    score -= memoryLeaks * 5
    score -= (100 - performanceScore) * 0.5
    score -= Math.min(errorRate * 2, 20)

    return Math.max(score, 0)
  }, [metrics])

  useEffect(() => {
    const interval = setInterval(() => {
      const uptime = Date.now() - startTime.current
      setMetrics((prev) => ({ ...prev, uptime }))

      checkMemoryLeaks()
      checkPerformance()

      // Reset error count every minute
      if (uptime % 60000 < 1000) {
        errorCount.current = 0
        setMetrics((prev) => ({ ...prev, errorRate: 0 }))
      }

      // Check overall stability
      const stabilityScore = getStabilityScore()
      setIsStable(stabilityScore > 70)
    }, 5000)

    // Global error handler
    const handleError = (event: ErrorEvent) => {
      console.error("[v0] Global error:", event.error)
      reportError()
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("[v0] Unhandled promise rejection:", event.reason)
      reportError()
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      clearInterval(interval)
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [checkMemoryLeaks, checkPerformance, getStabilityScore, reportError])

  return {
    metrics,
    alerts,
    isStable,
    reportError,
    reportCrash,
    resolveAlert,
    getStabilityScore,
  }
}

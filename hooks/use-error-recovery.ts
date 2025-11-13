"use client"

import { useState, useCallback, useRef } from "react"

export interface ErrorLog {
  id: string
  error: Error
  timestamp: Date
  context: string
  recovered: boolean
  retryCount: number
}

export function useErrorRecovery() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [isRecovering, setIsRecovering] = useState(false)
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const logError = useCallback((error: Error, context = "unknown") => {
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error,
      timestamp: new Date(),
      context,
      recovered: false,
      retryCount: 0,
    }

    console.error(`[v0] Error in ${context}:`, error)
    setErrors((prev) => [errorLog, ...prev.slice(0, 49)]) // Keep last 50 errors

    return errorLog.id
  }, [])

  const attemptRecovery = useCallback(
    async (errorId: string, recoveryFn: () => Promise<void> | void, maxRetries = 3) => {
      const error = errors.find((e) => e.id === errorId)
      if (!error || error.retryCount >= maxRetries) return false

      setIsRecovering(true)

      try {
        await recoveryFn()

        setErrors((prev) =>
          prev.map((e) => (e.id === errorId ? { ...e, recovered: true, retryCount: e.retryCount + 1 } : e)),
        )

        console.log(`[v0] Successfully recovered from error: ${errorId}`)
        return true
      } catch (recoveryError) {
        console.error(`[v0] Recovery failed for error ${errorId}:`, recoveryError)

        setErrors((prev) => prev.map((e) => (e.id === errorId ? { ...e, retryCount: e.retryCount + 1 } : e)))

        // Schedule retry with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, error.retryCount), 30000)
        const timeoutId = setTimeout(() => {
          attemptRecovery(errorId, recoveryFn, maxRetries)
        }, retryDelay)

        retryTimeouts.current.set(errorId, timeoutId)
        return false
      } finally {
        setIsRecovering(false)
      }
    },
    [errors],
  )

  const clearErrors = useCallback(() => {
    // Clear all retry timeouts
    retryTimeouts.current.forEach((timeout) => clearTimeout(timeout))
    retryTimeouts.current.clear()

    setErrors([])
  }, [])

  const getErrorStats = useCallback(() => {
    const total = errors.length
    const recovered = errors.filter((e) => e.recovered).length
    const pending = errors.filter((e) => !e.recovered && e.retryCount < 3).length
    const failed = errors.filter((e) => !e.recovered && e.retryCount >= 3).length

    return { total, recovered, pending, failed }
  }, [errors])

  return {
    errors,
    isRecovering,
    logError,
    attemptRecovery,
    clearErrors,
    getErrorStats,
  }
}

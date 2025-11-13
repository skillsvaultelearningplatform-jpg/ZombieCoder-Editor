"use client"

import { useState, useCallback, useRef } from "react"

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export function useCache<T>(defaultTTL = 300000) {
  // 5 minutes default
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())
  const [hitRate, setHitRate] = useState(0)
  const [totalRequests, setTotalRequests] = useState(0)
  const [cacheHits, setCacheHits] = useState(0)

  const get = useCallback(
    (key: string): T | null => {
      setTotalRequests((prev) => prev + 1)

      const entry = cache.current.get(key)
      if (!entry) return null

      const now = Date.now()
      if (now - entry.timestamp > entry.ttl) {
        cache.current.delete(key)
        return null
      }

      setCacheHits((prev) => {
        const newHits = prev + 1
        setHitRate((newHits / (totalRequests + 1)) * 100)
        return newHits
      })

      return entry.data
    },
    [totalRequests],
  )

  const set = useCallback(
    (key: string, data: T, ttl: number = defaultTTL) => {
      cache.current.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
      })
    },
    [defaultTTL],
  )

  const clear = useCallback(() => {
    cache.current.clear()
    setHitRate(0)
    setTotalRequests(0)
    setCacheHits(0)
  }, [])

  const cleanup = useCallback(() => {
    const now = Date.now()
    for (const [key, entry] of cache.current.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cache.current.delete(key)
      }
    }
  }, [])

  return {
    get,
    set,
    clear,
    cleanup,
    hitRate,
    size: cache.current.size,
  }
}

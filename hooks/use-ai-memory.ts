"use client"

import { useState, useCallback, useEffect } from "react"

export interface AIMemoryItem {
  id: string
  key: string
  data: any
  timestamp: number
  context?: string
}

export interface CodeSuggestion {
  id: string
  type: "completion" | "fix" | "optimization" | "documentation"
  title: string
  description: string
  code: string
  confidence: number
  timestamp: number
}

const AI_MEMORY_STORE = "ai_memory"
const SUGGESTIONS_STORE = "ai_suggestions"

export function useAIMemory() {
  const [memories, setMemories] = useState<AIMemoryItem[]>([])
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([])

  // Initialize AI Memory in localStorage (offline-first)
  const initAIMemory = useCallback(() => {
    try {
      const stored = localStorage.getItem(AI_MEMORY_STORE)
      if (stored) {
        setMemories(JSON.parse(stored))
      }

      const storedSuggestions = localStorage.getItem(SUGGESTIONS_STORE)
      if (storedSuggestions) {
        setSuggestions(JSON.parse(storedSuggestions))
      }
    } catch (error) {
      console.error("Failed to load AI memory:", error)
    }
  }, [])

  // Store memory
  const storeMemory = useCallback((key: string, data: any, context?: string) => {
    const memory: AIMemoryItem = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      key,
      data,
      timestamp: Date.now(),
      context,
    }

    setMemories((prev) => {
      const updated = [...prev, memory]
      localStorage.setItem(AI_MEMORY_STORE, JSON.stringify(updated))
      return updated
    })

    return memory
  }, [])

  // Retrieve memory
  const retrieveMemory = useCallback(
    (key: string) => {
      return memories.filter((memory) => memory.key === key).sort((a, b) => b.timestamp - a.timestamp)
    },
    [memories],
  )

  // Clear memory
  const clearMemory = useCallback((key?: string) => {
    if (key) {
      setMemories((prev) => {
        const updated = prev.filter((memory) => memory.key !== key)
        localStorage.setItem(AI_MEMORY_STORE, JSON.stringify(updated))
        return updated
      })
    } else {
      setMemories([])
      localStorage.removeItem(AI_MEMORY_STORE)
    }
  }, [])

  // Generate code suggestions (offline AI simulation)
  const generateSuggestions = useCallback((code: string, language: string) => {
    const newSuggestions: CodeSuggestion[] = []

    // Simulate AI suggestions based on code patterns
    if (code.includes("console.log") && !code.includes("// TODO: Remove debug")) {
      newSuggestions.push({
        id: `suggestion_${Date.now()}_1`,
        type: "optimization",
        title: "Remove Debug Statements",
        description: "Consider removing console.log statements for production",
        code: code.replace(/console\.log$$[^)]*$$;?\n?/g, ""),
        confidence: 0.8,
        timestamp: Date.now(),
      })
    }

    if (language === "javascript" && code.includes("var ")) {
      newSuggestions.push({
        id: `suggestion_${Date.now()}_2`,
        type: "fix",
        title: "Use Modern Variable Declarations",
        description: "Replace 'var' with 'const' or 'let' for better scoping",
        code: code.replace(/var /g, "const "),
        confidence: 0.9,
        timestamp: Date.now(),
      })
    }

    if (code.includes("function ") && !code.includes("/**")) {
      newSuggestions.push({
        id: `suggestion_${Date.now()}_3`,
        type: "documentation",
        title: "Add Function Documentation",
        description: "Add JSDoc comments to improve code documentation",
        code: code.replace(
          /function (\w+)$$[^)]*$$/g,
          `/**
 * $1 ফাংশনের বর্ণনা
 * @param {*} params - ফাংশন প্যারামিটার
 * @returns {*} রিটার্ন ভ্যালুর বর্ণনা
 */
function $1($&)`,
        ),
        confidence: 0.7,
        timestamp: Date.now(),
      })
    }

    // Bengali coding patterns
    if (code.includes("// বাংলা") || code.includes("// bangla")) {
      newSuggestions.push({
        id: `suggestion_${Date.now()}_4`,
        type: "completion",
        title: "বাংলা কমেন্ট সাপোর্ট",
        description: "বাংলা কমেন্টের জন্য UTF-8 এনকোডিং নিশ্চিত করুন",
        code: `// -*- coding: utf-8 -*-\n${code}`,
        confidence: 0.6,
        timestamp: Date.now(),
      })
    }

    if (newSuggestions.length > 0) {
      setSuggestions((prev) => {
        const updated = [...prev, ...newSuggestions].slice(-10)
        localStorage.setItem(SUGGESTIONS_STORE, JSON.stringify(updated))
        return updated
      })
    }

    return newSuggestions
  }, [])

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([])
    localStorage.removeItem(SUGGESTIONS_STORE)
  }, [])

  useEffect(() => {
    initAIMemory()
  }, [initAIMemory])

  return {
    memories,
    suggestions,
    storeMemory,
    retrieveMemory,
    clearMemory,
    generateSuggestions,
    clearSuggestions,
  }
}

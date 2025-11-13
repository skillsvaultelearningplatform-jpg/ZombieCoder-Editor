"use client"

import { useCallback } from "react"

export type AgentType = "tech" | "marketing" | "hr" | "sarcasm"

interface AgentInfo {
  name: string
  description: string
  keywords: string[]
  color: string
  icon: string
}

const AGENTS: Record<AgentType, AgentInfo> = {
  tech: {
    name: "Tech Agent",
    description: "কোডিং, বাগ ফিক্স, এবং টেকনিক্যাল সমস্যার সমাধান",
    keywords: [
      "code",
      "bug",
      "error",
      "function",
      "javascript",
      "react",
      "typescript",
      "css",
      "html",
      "api",
      "database",
      "কোড",
      "বাগ",
      "এরর",
      "ফাংশন",
    ],
    color: "blue",
    icon: "💻",
  },
  marketing: {
    name: "Marketing Agent",
    description: "ব্র্যান্ডিং, মার্কেটিং স্ট্র্যাটেজি, এবং বিজনেস পরামর্শ",
    keywords: [
      "marketing",
      "brand",
      "business",
      "strategy",
      "campaign",
      "social",
      "content",
      "seo",
      "মার্কেটিং",
      "ব্র্যান্ড",
      "ব্যবসা",
      "কৌশল",
    ],
    color: "green",
    icon: "📈",
  },
  hr: {
    name: "HR Agent",
    description: "টিম ম্যানেজমেন্ট, কর্পোরেট কালচার, এবং মানব সম্পদ",
    keywords: [
      "team",
      "management",
      "culture",
      "employee",
      "hiring",
      "performance",
      "meeting",
      "টিম",
      "ম্যানেজমেন্ট",
      "কর্মী",
      "নিয়োগ",
    ],
    color: "purple",
    icon: "👥",
  },
  sarcasm: {
    name: "Sarcasm Agent",
    description: "মজার এবং ব্যঙ্গাত্মক উত্তর (ফলব্যাক এজেন্ট)",
    keywords: ["funny", "joke", "sarcasm", "humor", "মজা", "হাসি", "ব্যঙ্গ"],
    color: "orange",
    icon: "😏",
  },
}

export function useAICommandRouter() {
  const routeInputToAgent = useCallback((input: string): AgentType => {
    const lowerInput = input.toLowerCase()

    // Check each agent's keywords
    for (const [agentType, agentInfo] of Object.entries(AGENTS)) {
      const hasKeyword = agentInfo.keywords.some((keyword) => lowerInput.includes(keyword.toLowerCase()))

      if (hasKeyword) {
        return agentType as AgentType
      }
    }

    // Advanced routing logic
    if (lowerInput.includes("fix") || lowerInput.includes("debug") || lowerInput.includes("help")) {
      return "tech"
    }

    if (lowerInput.includes("sell") || lowerInput.includes("promote") || lowerInput.includes("audience")) {
      return "marketing"
    }

    if (lowerInput.includes("people") || lowerInput.includes("staff") || lowerInput.includes("organize")) {
      return "hr"
    }

    // Default fallback
    return "sarcasm"
  }, [])

  const getAgentInfo = useCallback((agentType: AgentType): AgentInfo => {
    return AGENTS[agentType]
  }, [])

  const getAllAgents = useCallback((): Record<AgentType, AgentInfo> => {
    return AGENTS
  }, [])

  return {
    routeInputToAgent,
    getAgentInfo,
    getAllAgents,
  }
}

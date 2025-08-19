"use client"

import { useCallback } from "react"
import type { VoiceCommand } from "./use-voice-input"

export interface VoiceCommandAction {
  command: string
  patterns: string[]
  action: (params?: any) => void
  description: string
}

export function useVoiceCommands() {
  // Process voice command
  const processVoiceCommand = useCallback((transcript: string): VoiceCommand | null => {
    const normalizedTranscript = transcript.toLowerCase().trim()

    // Bengali commands
    const bengaliCommands = [
      {
        patterns: ["নতুন ফাইল", "নতুন ফাইল তৈরি কর", "ফাইল বানাও"],
        action: "create_file",
        confidence: 0.9,
      },
      {
        patterns: ["সেভ কর", "ফাইল সেভ কর", "সংরক্ষণ কর"],
        action: "save_file",
        confidence: 0.9,
      },
      {
        patterns: ["কোড রান কর", "চালাও", "এক্সিকিউট কর"],
        action: "run_code",
        confidence: 0.8,
      },
      {
        patterns: ["ফরম্যাট কর", "কোড সুন্দর কর", "সাজাও"],
        action: "format_code",
        confidence: 0.8,
      },
      {
        patterns: ["খুঁজে বের কর", "সার্চ কর", "খোঁজ"],
        action: "search",
        confidence: 0.7,
      },
      {
        patterns: ["বন্ধ কর", "ক্লোজ কর"],
        action: "close_file",
        confidence: 0.8,
      },
    ]

    // English commands
    const englishCommands = [
      {
        patterns: ["create new file", "new file", "make file"],
        action: "create_file",
        confidence: 0.9,
      },
      {
        patterns: ["save file", "save", "save this"],
        action: "save_file",
        confidence: 0.9,
      },
      {
        patterns: ["run code", "execute", "run this"],
        action: "run_code",
        confidence: 0.8,
      },
      {
        patterns: ["format code", "format", "beautify"],
        action: "format_code",
        confidence: 0.8,
      },
      {
        patterns: ["find", "search", "look for"],
        action: "search",
        confidence: 0.7,
      },
      {
        patterns: ["close file", "close", "close this"],
        action: "close_file",
        confidence: 0.8,
      },
    ]

    // Hotword activation
    if (normalizedTranscript.includes("hey zombiecoder") || normalizedTranscript.includes("হে জম্বিকোডার")) {
      return {
        command: normalizedTranscript,
        action: "activate",
        confidence: 1.0,
      }
    }

    // Check all commands
    const allCommands = [...bengaliCommands, ...englishCommands]

    for (const cmd of allCommands) {
      for (const pattern of cmd.patterns) {
        if (normalizedTranscript.includes(pattern)) {
          return {
            command: normalizedTranscript,
            action: cmd.action,
            confidence: cmd.confidence,
          }
        }
      }
    }

    return null
  }, [])

  // Register voice shortcut
  const registerVoiceShortcut = useCallback((command: string, action: () => void) => {
    // Store in localStorage for persistence
    const shortcuts = JSON.parse(localStorage.getItem("voice_shortcuts") || "{}")
    shortcuts[command] = action.toString()
    localStorage.setItem("voice_shortcuts", JSON.stringify(shortcuts))
  }, [])

  // Execute voice action
  const executeVoiceAction = useCallback((action: string, params?: any) => {
    switch (action) {
      case "activate":
        console.log("ZombieCoder activated!")
        return "আমি শুনছি! কি করতে চান?"

      case "create_file":
        console.log("Creating new file...")
        return "নতুন ফাইল তৈরি করছি..."

      case "save_file":
        console.log("Saving file...")
        return "ফাইল সেভ করছি..."

      case "run_code":
        console.log("Running code...")
        return "কোড চালাচ্ছি..."

      case "format_code":
        console.log("Formatting code...")
        return "কোড ফরম্যাট করছি..."

      case "search":
        console.log("Opening search...")
        return "সার্চ খুলছি..."

      case "close_file":
        console.log("Closing file...")
        return "ফাইল বন্ধ করছি..."

      default:
        return "দুঃখিত, এই কমান্ড বুঝতে পারিনি।"
    }
  }, [])

  return {
    processVoiceCommand,
    registerVoiceShortcut,
    executeVoiceAction,
  }
}

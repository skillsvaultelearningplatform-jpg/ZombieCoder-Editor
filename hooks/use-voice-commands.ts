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
  const processVoiceCommand = useCallback((transcript: string, language = "bn-BD"): VoiceCommand | null => {
    const normalizedTranscript = transcript.toLowerCase().trim()

    // Enhanced Bengali commands with more variations
    const bengaliCommands = [
      {
        patterns: ["নতুন ফাইল", "নতুন ফাইল তৈরি কর", "ফাইল বানাও", "নতুন ডকুমেন্ট"],
        action: "create_file",
        confidence: 0.9,
      },
      {
        patterns: ["সেভ কর", "ফাইল সেভ কর", "সংরক্ষণ কর", "রক্ষা কর"],
        action: "save_file",
        confidence: 0.9,
      },
      {
        patterns: ["কোড রান কর", "চালাও", "এক্সিকিউট কর", "প্রোগ্রাম চালাও"],
        action: "run_code",
        confidence: 0.8,
      },
      {
        patterns: ["ফরম্যাট কর", "কোড সুন্দর কর", "সাজাও", "গোছাও"],
        action: "format_code",
        confidence: 0.8,
      },
      {
        patterns: ["খুঁজে বের কর", "সার্চ কর", "খোঁজ", "খুঁজুন"],
        action: "search",
        confidence: 0.7,
      },
      {
        patterns: ["বন্ধ কর", "ক্লোজ কর", "ফাইল বন্ধ কর"],
        action: "close_file",
        confidence: 0.8,
      },
      {
        patterns: ["ফাংশন", "ফাংশন তৈরি কর", "নতুন ফাংশন"],
        action: "insert_code",
        confidence: 0.8,
      },
      {
        patterns: ["ভেরিয়েবল", "ভেরিয়েবল তৈরি কর", "নতুন ভেরিয়েবল"],
        action: "insert_code",
        confidence: 0.8,
      },
      {
        patterns: ["কনসোল লগ", "লগ কর", "প্রিন্ট কর"],
        action: "insert_code",
        confidence: 0.8,
      },
      {
        patterns: ["লুপ", "ফর লুপ", "লুপ তৈরি কর"],
        action: "insert_code",
        confidence: 0.8,
      },
      {
        patterns: ["শর্ত", "ইফ কন্ডিশন", "শর্ত তৈরি কর"],
        action: "insert_code",
        confidence: 0.8,
      },
    ]

    // Enhanced English commands
    const englishCommands = [
      {
        patterns: ["create new file", "new file", "make file", "new document"],
        action: "create_file",
        confidence: 0.9,
      },
      {
        patterns: ["save file", "save", "save this", "save document"],
        action: "save_file",
        confidence: 0.9,
      },
      {
        patterns: ["run code", "execute", "run this", "run program"],
        action: "run_code",
        confidence: 0.8,
      },
      {
        patterns: ["format code", "format", "beautify", "organize code"],
        action: "format_code",
        confidence: 0.8,
      },
      {
        patterns: ["find", "search", "look for", "search for"],
        action: "search",
        confidence: 0.7,
      },
      {
        patterns: ["close file", "close", "close this"],
        action: "close_file",
        confidence: 0.8,
      },
      {
        patterns: ["function", "create function", "new function"],
        action: "insert_code",
        confidence: 0.8,
      },
      {
        patterns: ["variable", "create variable", "new variable"],
        action: "insert_code",
        confidence: 0.8,
      },
      {
        patterns: ["console log", "log", "print"],
        action: "insert_code",
        confidence: 0.8,
      },
      {
        patterns: ["loop", "for loop", "create loop"],
        action: "insert_code",
        confidence: 0.8,
      },
      {
        patterns: ["condition", "if condition", "if statement"],
        action: "insert_code",
        confidence: 0.8,
      },
    ]

    // Enhanced hotword activation
    const bengaliHotwords = ["হে জম্বিকোডার", "জম্বিকোডার", "হেই জম্বিকোডার"]
    const englishHotwords = ["hey zombiecoder", "zombiecoder", "hey zombie coder"]

    const isHotwordDetected = [...bengaliHotwords, ...englishHotwords].some((hotword) =>
      normalizedTranscript.includes(hotword),
    )

    if (isHotwordDetected) {
      return {
        command: normalizedTranscript,
        action: "activate",
        confidence: 1.0,
      }
    }

    // Check commands based on language preference
    const commandsToCheck = language.includes("bn")
      ? [...bengaliCommands, ...englishCommands]
      : [...englishCommands, ...bengaliCommands]

    for (const cmd of commandsToCheck) {
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
    const shortcuts = JSON.parse(localStorage.getItem("voice_shortcuts") || "{}")
    shortcuts[command] = action.toString()
    localStorage.setItem("voice_shortcuts", JSON.stringify(shortcuts))
  }, [])

  const executeVoiceAction = useCallback((action: string, language: "bn" | "en" = "bn", params?: any) => {
    const responses = {
      bn: {
        activate: "আমি শুনছি! কি করতে চান?",
        create_file: "নতুন ফাইল তৈরি করছি...",
        save_file: "ফাইল সেভ করছি...",
        run_code: "কোড চালাচ্ছি...",
        format_code: "কোড ফরম্যাট করছি...",
        search: "সার্চ খুলছি...",
        close_file: "ফাইল বন্ধ করছি...",
        insert_code: "কোড যোগ করছি...",
        default: "দুঃখিত, এই কমান্ড বুঝতে পারিনি।",
      },
      en: {
        activate: "I'm listening! What would you like to do?",
        create_file: "Creating new file...",
        save_file: "Saving file...",
        run_code: "Running code...",
        format_code: "Formatting code...",
        search: "Opening search...",
        close_file: "Closing file...",
        insert_code: "Inserting code...",
        default: "Sorry, I didn't understand that command.",
      },
    }

    const actionResponses = responses[language]

    switch (action) {
      case "activate":
        console.log("ZombieCoder activated!")
        return actionResponses.activate

      case "create_file":
        console.log("Creating new file...")
        return actionResponses.create_file

      case "save_file":
        console.log("Saving file...")
        return actionResponses.save_file

      case "run_code":
        console.log("Running code...")
        return actionResponses.run_code

      case "format_code":
        console.log("Formatting code...")
        return actionResponses.format_code

      case "search":
        console.log("Opening search...")
        return actionResponses.search

      case "close_file":
        console.log("Closing file...")
        return actionResponses.close_file

      case "insert_code":
        console.log("Inserting code...")
        return actionResponses.insert_code

      default:
        return actionResponses.default
    }
  }, [])

  return {
    processVoiceCommand,
    registerVoiceShortcut,
    executeVoiceAction,
  }
}

"use client"

import { useState, useCallback, useRef } from "react"

export interface TTSVoice {
  name: string
  lang: string
  localService: boolean
  default: boolean
}

export interface TTSOptions {
  voice?: string
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
}

export function useTextToSpeech() {
  const [isSupported, setIsSupported] = useState(typeof window !== "undefined" && "speechSynthesis" in window)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [availableVoices, setAvailableVoices] = useState<TTSVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Load available voices
  const loadVoices = useCallback(() => {
    if (!isSupported) return

    const voices = speechSynthesis.getVoices()
    const formattedVoices: TTSVoice[] = voices.map((voice) => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default,
    }))

    setAvailableVoices(formattedVoices)
  }, [isSupported])

  // Speak output
  const speakOutput = useCallback(
    (text: string, voiceType: "male" | "female" | "default" = "default", options: TTSOptions = {}) => {
      if (!isSupported || !text.trim()) return

      // Stop any current speech
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Set voice based on type and language preference
      const voices = speechSynthesis.getVoices()
      let selectedVoice = null

      // Prefer Bengali voices
      const bengaliVoices = voices.filter((voice) => voice.lang.includes("bn") || voice.lang.includes("BD"))
      if (bengaliVoices.length > 0) {
        selectedVoice = bengaliVoices[0]
      } else {
        // Fallback to English voices
        const englishVoices = voices.filter((voice) => voice.lang.includes("en"))
        if (englishVoices.length > 0) {
          if (voiceType === "female") {
            selectedVoice =
              englishVoices.find((voice) => voice.name.toLowerCase().includes("female")) || englishVoices[0]
          } else if (voiceType === "male") {
            selectedVoice = englishVoices.find((voice) => voice.name.toLowerCase().includes("male")) || englishVoices[0]
          } else {
            selectedVoice = englishVoices[0]
          }
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      // Set options
      utterance.rate = options.rate || 1
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 1
      utterance.lang = options.lang || "bn-BD"

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      utteranceRef.current = utterance
      speechSynthesis.speak(utterance)
    },
    [isSupported],
  )

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  // Load voices on mount
  useState(() => {
    if (isSupported) {
      loadVoices()
      // Voices might load asynchronously
      speechSynthesis.onvoiceschanged = loadVoices
    }
  })

  return {
    isSupported,
    isSpeaking,
    availableVoices,
    speakOutput,
    stopSpeaking,
    loadVoices,
  }
}

"use client"

import { useState, useCallback, useRef, useEffect } from "react"

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export interface VoiceSession {
  id: string
  isActive: boolean
  isListening: boolean
  language: string
  transcript: string
  confidence: number
}

export interface VoiceCommand {
  command: string
  action: string
  parameters?: Record<string, any>
  confidence: number
}

export function useVoiceInput() {
  const [session, setSession] = useState<VoiceSession | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any | null>(null)
  const [voiceLevel, setVoiceLevel] = useState(0)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
  }, [])

  const startVoiceSession = useCallback(
    (language = "bn-BD") => {
      if (!isSupported) {
        setError("Speech recognition not supported in this browser")
        return
      }

      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = language
        recognition.maxAlternatives = 3

        const sessionId = `voice_${Date.now()}`

        recognition.onstart = () => {
          setSession({
            id: sessionId,
            isActive: true,
            isListening: true,
            language,
            transcript: "",
            confidence: 0,
          })
          setError(null)
        }

        recognition.onresult = (event) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const transcript = result[0].transcript

            if (result.isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          setSession((prev) =>
            prev
              ? {
                  ...prev,
                  transcript: finalTranscript || interimTranscript,
                  confidence: event.results[event.results.length - 1]?.[0]?.confidence || 0,
                }
              : null,
          )
        }

        recognition.onerror = (event) => {
          setError(`Voice recognition error: ${event.error}`)
          setSession((prev) => (prev ? { ...prev, isListening: false } : null))
        }

        recognition.onend = () => {
          setSession((prev) => (prev ? { ...prev, isListening: false } : null))
        }

        recognition.start()
        recognitionRef.current = recognition
      } catch (err) {
        setError("Failed to start voice recognition")
      }
    },
    [isSupported],
  )

  const stopVoiceSession = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setSession(null)
    setVoiceLevel(0)
  }, [])

  const transcribeInput = useCallback(() => {
    return session?.transcript || ""
  }, [session])

  useEffect(() => {
    if (session?.isListening) {
      const interval = setInterval(() => {
        setVoiceLevel(Math.random() * 100)
      }, 100)
      return () => clearInterval(interval)
    } else {
      setVoiceLevel(0)
    }
  }, [session?.isListening])

  return {
    session,
    isSupported,
    error,
    voiceLevel,
    startVoiceSession,
    stopVoiceSession,
    transcribeInput,
  }
}

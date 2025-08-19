"use client"

import { useState, useCallback, useEffect } from "react"
import { useVoiceInput } from "@/hooks/use-voice-input"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { useVoiceCommands } from "@/hooks/use-voice-commands"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Mic, MicOff, Volume2, VolumeX, Zap } from "lucide-react"

interface EnhancedVoiceInputProps {
  onVoiceCommand?: (command: string, action: string) => void
  onTranscript?: (text: string) => void
  onCodeInsert?: (code: string) => void
}

export function EnhancedVoiceInput({ onVoiceCommand, onTranscript, onCodeInsert }: EnhancedVoiceInputProps) {
  const { session, isSupported, error, voiceLevel, startVoiceSession, stopVoiceSession, transcribeInput } =
    useVoiceInput()
  const { isSpeaking, speakOutput, stopSpeaking } = useTextToSpeech()
  const { processVoiceCommand, executeVoiceAction } = useVoiceCommands()

  const [language, setLanguage] = useState<"bn-BD" | "en-US">("bn-BD")
  const [hotwordEnabled, setHotwordEnabled] = useState(true)
  const [noiseReduction, setNoiseReduction] = useState(true)
  const [voiceRate, setVoiceRate] = useState([1])
  const [voicePitch, setVoicePitch] = useState([1])
  const [isListeningForHotword, setIsListeningForHotword] = useState(false)

  // Hotword detection
  useEffect(() => {
    if (hotwordEnabled && !session?.isListening) {
      setIsListeningForHotword(true)
      // Start passive listening for hotword
      startVoiceSession(language)
    }
  }, [hotwordEnabled, session, startVoiceSession, language])

  // Process transcript for hotword and commands
  useEffect(() => {
    if (session?.transcript) {
      const transcript = session.transcript.toLowerCase()

      // Check for hotword activation
      if (hotwordEnabled && (transcript.includes("hey zombiecoder") || transcript.includes("হে জম্বিকোডার"))) {
        speakOutput("আমি শুনছি! কি করতে চান?", "female", {
          rate: voiceRate[0],
          pitch: voicePitch[0],
        })
        setIsListeningForHotword(false)
        return
      }

      // Process regular commands
      const command = processVoiceCommand(session.transcript)
      if (command && command.confidence > 0.6) {
        const response = executeVoiceAction(command.action)
        speakOutput(response, "female", {
          rate: voiceRate[0],
          pitch: voicePitch[0],
        })
        onVoiceCommand?.(command.command, command.action)

        // Handle code insertion commands
        if (command.action === "insert_code") {
          const codeSnippet = extractCodeFromTranscript(session.transcript)
          if (codeSnippet) {
            onCodeInsert?.(codeSnippet)
          }
        }
      }
    }
  }, [
    session?.transcript,
    hotwordEnabled,
    processVoiceCommand,
    executeVoiceAction,
    speakOutput,
    voiceRate,
    voicePitch,
    onVoiceCommand,
    onCodeInsert,
  ])

  const extractCodeFromTranscript = useCallback((transcript: string): string => {
    // Simple code extraction logic
    if (transcript.includes("function")) {
      return `function ${transcript.split("function")[1]?.trim() || "newFunction"}() {\n  // Your code here\n}`
    }
    if (transcript.includes("console log")) {
      const message = transcript.split("console log")[1]?.trim() || "Hello World"
      return `console.log("${message}");`
    }
    if (transcript.includes("variable")) {
      const varName = transcript.split("variable")[1]?.trim() || "myVariable"
      return `const ${varName} = "";`
    }
    return transcript
  }, [])

  const handleStartListening = useCallback(() => {
    setIsListeningForHotword(false)
    startVoiceSession(language)
  }, [startVoiceSession, language])

  const handleStopListening = useCallback(() => {
    const transcript = transcribeInput()
    if (transcript) {
      onTranscript?.(transcript)
    }
    stopVoiceSession()
    if (hotwordEnabled) {
      setIsListeningForHotword(true)
    }
  }, [transcribeInput, onTranscript, stopVoiceSession, hotwordEnabled])

  if (!isSupported) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center">Enhanced voice features not supported</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">Enhanced Voice</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "bn-BD" ? "en-US" : "bn-BD")}
              className="h-7 text-xs"
            >
              {language === "bn-BD" ? "বাংলা" : "English"}
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex gap-2">
          {isListeningForHotword && (
            <Badge variant="secondary" className="text-xs">
              Listening for "Hey ZombieCoder"
            </Badge>
          )}
          {session?.isListening && !isListeningForHotword && (
            <Badge variant="default" className="text-xs">
              Active Listening
            </Badge>
          )}
          {isSpeaking && (
            <Badge variant="outline" className="text-xs">
              Speaking
            </Badge>
          )}
        </div>

        {/* Voice Level Indicator */}
        {session?.isListening && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-3 bg-muted rounded-full flex-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-100"
                  style={{ width: `${voiceLevel}%` }}
                />
              </div>
              <Badge variant="secondary" className="text-xs">
                {Math.round((session.confidence || 0) * 100)}%
              </Badge>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            variant={session?.isListening && !isListeningForHotword ? "destructive" : "default"}
            size="sm"
            onClick={session?.isListening && !isListeningForHotword ? handleStopListening : handleStartListening}
            className="flex-1"
          >
            {session?.isListening && !isListeningForHotword ? (
              <MicOff className="h-4 w-4 mr-2" />
            ) : (
              <Mic className="h-4 w-4 mr-2" />
            )}
            {session?.isListening && !isListeningForHotword ? "Stop" : "Listen"}
          </Button>

          <Button variant="outline" size="sm" onClick={isSpeaking ? stopSpeaking : undefined} disabled={!isSpeaking}>
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Hotword Activation</span>
            <Switch checked={hotwordEnabled} onCheckedChange={setHotwordEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Noise Reduction</span>
            <Switch checked={noiseReduction} onCheckedChange={setNoiseReduction} />
          </div>

          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Voice Speed: {voiceRate[0]}</span>
            <Slider value={voiceRate} onValueChange={setVoiceRate} min={0.5} max={2} step={0.1} />
          </div>

          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Voice Pitch: {voicePitch[0]}</span>
            <Slider value={voicePitch} onValueChange={setVoicePitch} min={0.5} max={2} step={0.1} />
          </div>
        </div>

        {/* Current Transcript */}
        {session?.transcript && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Current Input:</p>
            <div className="p-2 bg-muted rounded text-xs max-h-20 overflow-y-auto">{session.transcript}</div>
          </div>
        )}

        {/* Error */}
        {error && <div className="p-2 bg-destructive/10 text-destructive rounded text-xs">{error}</div>}

        {/* Advanced Commands */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Advanced Commands:</p>
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div>"Hey ZombieCoder" - Activate</div>
            <div>"Create function [name]" - Insert function</div>
            <div>"Console log [message]" - Insert log</div>
            <div>"Variable [name]" - Create variable</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

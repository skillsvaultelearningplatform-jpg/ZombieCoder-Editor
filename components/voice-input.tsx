"use client"

import { useState, useCallback } from "react"
import { useVoiceInput } from "@/hooks/use-voice-input"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { useVoiceCommands } from "@/hooks/use-voice-commands"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"

interface VoiceInputProps {
  onVoiceCommand?: (command: string, action: string) => void
  onTranscript?: (text: string) => void
}

export function VoiceInput({ onVoiceCommand, onTranscript }: VoiceInputProps) {
  const { session, isSupported, error, voiceLevel, startVoiceSession, stopVoiceSession, transcribeInput } =
    useVoiceInput()
  const { isSpeaking, speakOutput, stopSpeaking } = useTextToSpeech()
  const { processVoiceCommand, executeVoiceAction } = useVoiceCommands()
  const [language, setLanguage] = useState<"bn-BD" | "en-US">("bn-BD")

  const handleStartListening = useCallback(() => {
    startVoiceSession(language)
  }, [startVoiceSession, language])

  const handleStopListening = useCallback(() => {
    const transcript = transcribeInput()
    if (transcript) {
      onTranscript?.(transcript)

      // Process voice command
      const command = processVoiceCommand(transcript)
      if (command) {
        const response = executeVoiceAction(command.action)
        speakOutput(response)
        onVoiceCommand?.(command.command, command.action)
      }
    }
    stopVoiceSession()
  }, [
    transcribeInput,
    onTranscript,
    processVoiceCommand,
    executeVoiceAction,
    speakOutput,
    onVoiceCommand,
    stopVoiceSession,
  ])

  if (!isSupported) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center">Voice input not supported in this browser</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Voice Control</h3>
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

        {/* Voice Level Indicator */}
        {session?.isListening && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 bg-muted rounded-full flex-1 overflow-hidden">
                <div className="h-full bg-primary transition-all duration-100" style={{ width: `${voiceLevel}%` }} />
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
            variant={session?.isListening ? "destructive" : "default"}
            size="sm"
            onClick={session?.isListening ? handleStopListening : handleStartListening}
            className="flex-1"
          >
            {session?.isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
            {session?.isListening ? "Stop" : "Listen"}
          </Button>

          <Button variant="outline" size="sm" onClick={isSpeaking ? stopSpeaking : undefined} disabled={!isSpeaking}>
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Transcript */}
        {session?.transcript && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Transcript:</p>
            <div className="p-2 bg-muted rounded text-xs">{session.transcript}</div>
          </div>
        )}

        {/* Error */}
        {error && <div className="p-2 bg-destructive/10 text-destructive rounded text-xs">{error}</div>}

        {/* Voice Commands Help */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Voice Commands:</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>"নতুন ফাইল" - New file</div>
            <div>"সেভ কর" - Save file</div>
            <div>"কোড রান কর" - Run code</div>
            <div>"ফরম্যাট কর" - Format</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

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
import { Mic, MicOff, Volume2, VolumeX, Zap, Languages } from "lucide-react"

interface EnhancedVoiceInputProps {
  onVoiceCommand?: (command: string, action: string) => void
  onTranscript?: (text: string) => void
  onCodeInsert?: (code: string) => void
  language?: "bn" | "en"
}

export function EnhancedVoiceInput({
  onVoiceCommand,
  onTranscript,
  onCodeInsert,
  language = "bn",
}: EnhancedVoiceInputProps) {
  const { session, isSupported, error, voiceLevel, startVoiceSession, stopVoiceSession, transcribeInput } =
    useVoiceInput()
  const { isSpeaking, speakOutput, stopSpeaking } = useTextToSpeech()
  const { processVoiceCommand, executeVoiceAction } = useVoiceCommands()

  const [voiceLanguage, setVoiceLanguage] = useState<"bn-BD" | "en-US">(language === "bn" ? "bn-BD" : "en-US")
  const [hotwordEnabled, setHotwordEnabled] = useState(true)
  const [noiseReduction, setNoiseReduction] = useState(true)
  const [voiceRate, setVoiceRate] = useState([1])
  const [voicePitch, setVoicePitch] = useState([1])
  const [isListeningForHotword, setIsListeningForHotword] = useState(false)
  const [continuousMode, setContinuousMode] = useState(false)
  const [sensitivity, setSensitivity] = useState([0.7])

  useEffect(() => {
    if (hotwordEnabled && !session?.isListening) {
      setIsListeningForHotword(true)
      startVoiceSession(voiceLanguage)
    }
  }, [hotwordEnabled, session, startVoiceSession, voiceLanguage])

  useEffect(() => {
    if (session?.transcript) {
      const transcript = session.transcript.toLowerCase()

      // Enhanced hotword detection for Bengali
      const bengaliHotwords = ["হে জম্বিকোডার", "জম্বিকোডার", "হেই জম্বিকোডার"]
      const englishHotwords = ["hey zombiecoder", "zombiecoder", "hey zombie coder"]

      const isHotwordDetected = [...bengaliHotwords, ...englishHotwords].some((hotword) => transcript.includes(hotword))

      if (hotwordEnabled && isHotwordDetected) {
        const response = language === "bn" ? "আমি শুনছি! কি করতে চান?" : "I'm listening! What would you like to do?"

        speakOutput(response, "female", {
          rate: voiceRate[0],
          pitch: voicePitch[0],
          lang: voiceLanguage,
        })
        setIsListeningForHotword(false)
        return
      }

      // Enhanced command processing
      const command = processVoiceCommand(session.transcript, voiceLanguage)
      if (command && command.confidence > sensitivity[0]) {
        const response = executeVoiceAction(command.action, language)
        speakOutput(response, "female", {
          rate: voiceRate[0],
          pitch: voicePitch[0],
          lang: voiceLanguage,
        })
        onVoiceCommand?.(command.command, command.action)

        // Enhanced code insertion with Bengali support
        if (command.action === "insert_code") {
          const codeSnippet = extractCodeFromTranscript(session.transcript)
          if (codeSnippet) {
            onCodeInsert?.(codeSnippet)
          }
        }

        // Auto-continue listening in continuous mode
        if (continuousMode && !isListeningForHotword) {
          setTimeout(() => {
            startVoiceSession(voiceLanguage)
          }, 1000)
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
    voiceLanguage,
    onVoiceCommand,
    onCodeInsert,
    language,
    sensitivity,
    continuousMode,
    isListeningForHotword,
    startVoiceSession,
  ])

  const extractCodeFromTranscript = useCallback(
    (transcript: string): string => {
      const lowerTranscript = transcript.toLowerCase()

      // Bengali programming patterns
      if (lowerTranscript.includes("ফাংশন") || lowerTranscript.includes("function")) {
        const functionName = extractName(transcript, ["ফাংশন", "function"]) || "newFunction"
        return `function ${functionName}() {\n  // ${language === "bn" ? "আপনার কোড এখানে" : "Your code here"}\n}`
      }

      if (lowerTranscript.includes("কনসোল লগ") || lowerTranscript.includes("console log")) {
        const message =
          extractMessage(transcript, ["কনসোল লগ", "console log"]) || (language === "bn" ? "হ্যালো ওয়ার্ল্ড" : "Hello World")
        return `console.log("${message}");`
      }

      if (lowerTranscript.includes("ভেরিয়েবল") || lowerTranscript.includes("variable")) {
        const varName = extractName(transcript, ["ভেরিয়েবল", "variable"]) || "myVariable"
        return `const ${varName} = "";`
      }

      if (lowerTranscript.includes("লুপ") || lowerTranscript.includes("loop")) {
        return `for (let i = 0; i < 10; i++) {\n  // ${language === "bn" ? "লুপের কোড" : "Loop code"}\n}`
      }

      if (lowerTranscript.includes("শর্ত") || lowerTranscript.includes("condition") || lowerTranscript.includes("if")) {
        return `if (condition) {\n  // ${language === "bn" ? "শর্তের কোড" : "Condition code"}\n}`
      }

      return transcript
    },
    [language],
  )

  const extractName = (transcript: string, keywords: string[]): string | null => {
    for (const keyword of keywords) {
      const parts = transcript.split(keyword)
      if (parts.length > 1) {
        const name = parts[1].trim().split(" ")[0]
        return name || null
      }
    }
    return null
  }

  const extractMessage = (transcript: string, keywords: string[]): string | null => {
    for (const keyword of keywords) {
      const parts = transcript.split(keyword)
      if (parts.length > 1) {
        return parts[1].trim() || null
      }
    }
    return null
  }

  const handleStartListening = useCallback(() => {
    setIsListeningForHotword(false)
    startVoiceSession(voiceLanguage)
  }, [startVoiceSession, voiceLanguage])

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

  useEffect(() => {
    setVoiceLanguage(language === "bn" ? "bn-BD" : "en-US")
  }, [language])

  if (!isSupported) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center">
          {language === "bn" ? "উন্নত ভয়েস ফিচার সাপোর্ট করে না" : "Enhanced voice features not supported"}
        </p>
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
            <h3 className="text-sm font-medium">{language === "bn" ? "উন্নত ভয়েস" : "Enhanced Voice"}</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceLanguage(voiceLanguage === "bn-BD" ? "en-US" : "bn-BD")}
              className="h-7 text-xs"
            >
              <Languages className="h-3 w-3 mr-1" />
              {voiceLanguage === "bn-BD" ? "বাংলা" : "English"}
            </Button>
          </div>
        </div>

        {/* Enhanced Status Indicators */}
        <div className="flex flex-wrap gap-2">
          {isListeningForHotword && (
            <Badge variant="secondary" className="text-xs">
              {language === "bn" ? '"হে জম্বিকোডার" এর জন্য অপেক্ষা' : 'Listening for "Hey ZombieCoder"'}
            </Badge>
          )}
          {session?.isListening && !isListeningForHotword && (
            <Badge variant="default" className="text-xs">
              {language === "bn" ? "সক্রিয় শ্রবণ" : "Active Listening"}
            </Badge>
          )}
          {isSpeaking && (
            <Badge variant="outline" className="text-xs">
              {language === "bn" ? "কথা বলছে" : "Speaking"}
            </Badge>
          )}
          {continuousMode && (
            <Badge variant="secondary" className="text-xs">
              {language === "bn" ? "ক্রমাগত মোড" : "Continuous Mode"}
            </Badge>
          )}
        </div>

        {/* Enhanced Voice Level Indicator */}
        {session?.isListening && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-3 bg-muted rounded-full flex-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 transition-all duration-100"
                  style={{ width: `${voiceLevel}%` }}
                />
              </div>
              <Badge variant="secondary" className="text-xs">
                {Math.round((session.confidence || 0) * 100)}%
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {language === "bn" ? "ভয়েস লেভেল" : "Voice Level"}
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
            {session?.isListening && !isListeningForHotword
              ? language === "bn"
                ? "বন্ধ"
                : "Stop"
              : language === "bn"
                ? "শুনুন"
                : "Listen"}
          </Button>

          <Button variant="outline" size="sm" onClick={isSpeaking ? stopSpeaking : undefined} disabled={!isSpeaking}>
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Enhanced Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {language === "bn" ? "হটওয়ার্ড সক্রিয়করণ" : "Hotword Activation"}
            </span>
            <Switch checked={hotwordEnabled} onCheckedChange={setHotwordEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{language === "bn" ? "ক্রমাগত মোড" : "Continuous Mode"}</span>
            <Switch checked={continuousMode} onCheckedChange={setContinuousMode} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{language === "bn" ? "শব্দ কমানো" : "Noise Reduction"}</span>
            <Switch checked={noiseReduction} onCheckedChange={setNoiseReduction} />
          </div>

          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">
              {language === "bn" ? `সংবেদনশীলতা: ${sensitivity[0]}` : `Sensitivity: ${sensitivity[0]}`}
            </span>
            <Slider value={sensitivity} onValueChange={setSensitivity} min={0.3} max={1} step={0.1} />
          </div>

          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">
              {language === "bn" ? `ভয়েস গতি: ${voiceRate[0]}` : `Voice Speed: ${voiceRate[0]}`}
            </span>
            <Slider value={voiceRate} onValueChange={setVoiceRate} min={0.5} max={2} step={0.1} />
          </div>

          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">
              {language === "bn" ? `ভয়েস পিচ: ${voicePitch[0]}` : `Voice Pitch: ${voicePitch[0]}`}
            </span>
            <Slider value={voicePitch} onValueChange={setVoicePitch} min={0.5} max={2} step={0.1} />
          </div>
        </div>

        {/* Current Transcript */}
        {session?.transcript && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{language === "bn" ? "বর্তমান ইনপুট:" : "Current Input:"}</p>
            <div className="p-2 bg-muted rounded text-xs max-h-20 overflow-y-auto">{session.transcript}</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-2 bg-destructive/10 text-destructive rounded text-xs">
            {language === "bn" ? `ত্রুটি: ${error}` : error}
          </div>
        )}

        {/* Enhanced Commands */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{language === "bn" ? "উন্নত কমান্ড:" : "Advanced Commands:"}</p>
          <div className="grid grid-cols-1 gap-1 text-xs">
            {language === "bn" ? (
              <>
                <div>"হে জম্বিকোডার" - সক্রিয় করুন</div>
                <div>"ফাংশন [নাম]" - ফাংশন তৈরি</div>
                <div>"কনসোল লগ [বার্তা]" - লগ যোগ করুন</div>
                <div>"ভেরিয়েবল [নাম]" - ভেরিয়েবল তৈরি</div>
                <div>"লুপ" - ফর লুপ তৈরি</div>
                <div>"শর্ত" - ইফ কন্ডিশন তৈরি</div>
              </>
            ) : (
              <>
                <div>"Hey ZombieCoder" - Activate</div>
                <div>"Function [name]" - Create function</div>
                <div>"Console log [message]" - Insert log</div>
                <div>"Variable [name]" - Create variable</div>
                <div>"Loop" - Create for loop</div>
                <div>"Condition" - Create if condition</div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

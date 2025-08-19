"use client"

import { useState, useCallback, useEffect } from "react"
import { useAIMemory, type CodeSuggestion } from "@/hooks/use-ai-memory"
import { useLinting, type LintIssue } from "@/hooks/use-linting"
import { EnhancedVoiceInput } from "@/components/enhanced-voice-input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Code, FileText, Lightbulb, AlertTriangle, CheckCircle, Zap } from "lucide-react"

interface AIPanelProps {
  currentCode?: string
  currentLanguage?: string
  onApplySuggestion?: (code: string) => void
  onCodeInsert?: (code: string) => void
}

export function AIPanel({
  currentCode = "",
  currentLanguage = "javascript",
  onApplySuggestion,
  onCodeInsert,
}: AIPanelProps) {
  const { suggestions, generateSuggestions, clearSuggestions, storeMemory } = useAIMemory()
  const { issues, lintCode, formatCode } = useLinting()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "ai"; content: string }>>([])

  // Analyze code when it changes
  useEffect(() => {
    if (currentCode.trim()) {
      const timeoutId = setTimeout(() => {
        setIsAnalyzing(true)
        lintCode(currentCode, currentLanguage)
        generateSuggestions(currentCode, currentLanguage)
        setIsAnalyzing(false)
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [currentCode, currentLanguage, lintCode, generateSuggestions])

  const handleApplySuggestion = useCallback(
    (suggestion: CodeSuggestion) => {
      onApplySuggestion?.(suggestion.code)
      storeMemory("applied_suggestion", suggestion, currentCode)
    },
    [onApplySuggestion, storeMemory, currentCode],
  )

  const handleFormatCode = useCallback(() => {
    const formatted = formatCode(currentCode, currentLanguage)
    onApplySuggestion?.(formatted)
  }, [currentCode, currentLanguage, formatCode, onApplySuggestion])

  const handleChatSubmit = useCallback(() => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }])

    // Simulate AI response (offline)
    setTimeout(() => {
      let aiResponse = "আমি আপনার কোড বিশ্লেষণ করছি..."

      if (userMessage.toLowerCase().includes("optimize")) {
        aiResponse = "আপনার কোডে কিছু অপটিমাইজেশনের সুযোগ রয়েছে। console.log স্টেটমেন্ট সরান এবং আধুনিক ES6+ সিনট্যাক্স ব্যবহার করুন।"
      } else if (userMessage.toLowerCase().includes("bug") || userMessage.toLowerCase().includes("error")) {
        aiResponse = "আমি আপনার কোডে কিছু সম্ভাব্য সমস্যা দেখতে পাচ্ছি। লিন্টিং ট্যাবে বিস্তারিত দেখুন।"
      } else if (userMessage.toLowerCase().includes("document")) {
        aiResponse = "ডকুমেন্টেশনের জন্য JSDoc কমেন্ট যোগ করুন। এটি কোডের পঠনযোগ্যতা বাড়াবে।"
      } else {
        aiResponse = "আমি ZombieCoder AI সহায়ক। আপনার কোড সম্পর্কে যেকোনো প্রশ্ন করুন!"
      }

      setChatHistory((prev) => [...prev, { role: "ai", content: aiResponse }])
    }, [chatInput])

    setChatInput("")
  }, [chatInput])

  const handleVoiceCommand = useCallback(
    (command: string, action: string) => {
      storeMemory("voice_command", { command, action }, currentCode)

      // Add voice command to chat history
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: `Voice: ${command}` },
        { role: "ai", content: `Executed: ${action}` },
      ])
    },
    [storeMemory, currentCode],
  )

  const handleVoiceTranscript = useCallback((transcript: string) => {
    setChatInput(transcript)
  }, [])

  const getSeverityIcon = (severity: LintIssue["severity"]) => {
    switch (severity) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getSuggestionIcon = (type: CodeSuggestion["type"]) => {
    switch (type) {
      case "completion":
        return <Code className="h-4 w-4 text-blue-500" />
      case "fix":
        return <Zap className="h-4 w-4 text-red-500" />
      case "optimization":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case "documentation":
        return <FileText className="h-4 w-4 text-green-500" />
    }
  }

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">ZombieCoder AI</h2>
          {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary ml-auto" />}
        </div>
        <p className="text-xs text-muted-foreground mt-1">অফলাইন AI সহায়ক</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="suggestions" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-4 mt-2">
            <TabsTrigger value="suggestions" className="text-xs">
              সাজেশন
            </TabsTrigger>
            <TabsTrigger value="linting" className="text-xs">
              লিন্টিং
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs">
              ভয়েস
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">
              চ্যাট
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="suggestions" className="h-full m-0 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">কোড সাজেশন</h3>
                    <Button variant="ghost" size="sm" onClick={clearSuggestions} className="h-6 text-xs">
                      Clear
                    </Button>
                  </div>

                  {suggestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">কোড লিখুন সাজেশনের জন্য</div>
                  ) : (
                    suggestions.map((suggestion) => (
                      <Card key={suggestion.id} className="p-3">
                        <div className="flex items-start gap-2">
                          {getSuggestionIcon(suggestion.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-xs font-medium truncate">{suggestion.title}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(suggestion.confidence * 100)}%
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApplySuggestion(suggestion)}
                              className="h-6 text-xs"
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="linting" className="h-full m-0 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">কোড বিশ্লেষণ</h3>
                    <Button variant="ghost" size="sm" onClick={handleFormatCode} className="h-6 text-xs">
                      Format
                    </Button>
                  </div>

                  {issues.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      কোনো সমস্যা পাওয়া যায়নি
                    </div>
                  ) : (
                    issues.map((issue) => (
                      <Card key={issue.id} className="p-3">
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">Line {issue.line}</span>
                              <Badge variant="outline" className="text-xs">
                                {issue.rule}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{issue.message}</p>
                            {issue.fixable && (
                              <Button variant="outline" size="sm" className="h-6 text-xs mt-2 bg-transparent">
                                Quick Fix
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="voice" className="h-full m-0 p-4">
              <EnhancedVoiceInput
                onVoiceCommand={handleVoiceCommand}
                onTranscript={handleVoiceTranscript}
                onCodeInsert={onCodeInsert}
              />
            </TabsContent>

            <TabsContent value="chat" className="h-full m-0 p-4 flex flex-col">
              <h3 className="text-sm font-medium mb-3">AI চ্যাট</h3>

              <ScrollArea className="flex-1 mb-3">
                <div className="space-y-2">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">AI এর সাথে কথা বলুন</div>
                  ) : (
                    chatHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-xs ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground ml-4"
                            : "bg-muted text-muted-foreground mr-4"
                        }`}
                      >
                        {message.content}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="space-y-2">
                <Textarea
                  placeholder="AI কে প্রশ্ন করুন..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="min-h-[60px] text-xs resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleChatSubmit()
                    }
                  }}
                />
                <Button onClick={handleChatSubmit} size="sm" className="w-full h-7 text-xs">
                  Send
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

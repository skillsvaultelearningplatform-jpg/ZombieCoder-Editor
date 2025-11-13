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
import { Bot, Code, FileText, Lightbulb, AlertTriangle, CheckCircle, Zap, Languages } from "lucide-react"

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
  const [language, setLanguage] = useState<"bn" | "en">("bn")

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

  const getBengaliAIResponse = useCallback(
    (userMessage: string): string => {
      const lowerMessage = userMessage.toLowerCase()

      const bengaliPatterns = {
        optimize: ["অপটিমাইজ", "উন্নত", "ভালো", "দ্রুত", "optimize"],
        bug: ["বাগ", "ত্রুটি", "সমস্যা", "এরর", "bug", "error", "problem"],
        help: ["সাহায্য", "হেল্প", "help", "assist"],
        explain: ["ব্যাখ্যা", "বুঝিয়ে", "explain", "describe"],
        document: ["ডকুমেন্ট", "কমেন্ট", "document", "comment"],
        fix: ["ঠিক", "সমাধান", "fix", "solve"],
        code: ["কোড", "প্রোগ্রাম", "code", "program"],
        function: ["ফাংশন", "function"],
        variable: ["ভেরিয়েবল", "variable"],
        loop: ["লুপ", "loop"],
        condition: ["শর্ত", "condition", "if"],
        array: ["অ্যারে", "array", "list"],
        object: ["অবজেক্ট", "object"],
      }

      if (bengaliPatterns.optimize.some((word) => lowerMessage.includes(word))) {
        return language === "bn"
          ? "আপনার কোডে অপটিমাইজেশনের জন্য কিছু সুপারিশ:\n• console.log স্টেটমেন্ট সরিয়ে ফেলুন\n• var এর পরিবর্তে const/let ব্যবহার করুন\n• আধুনিক ES6+ সিনট্যাক্স ব্যবহার করুন\n• অপ্রয়োজনীয় কোড সরান"
          : "Here are optimization suggestions for your code:\n• Remove console.log statements\n• Use const/let instead of var\n• Use modern ES6+ syntax\n• Remove unnecessary code"
      }

      if (bengaliPatterns.bug.some((word) => lowerMessage.includes(word))) {
        return language === "bn"
          ? "আমি আপনার কোডে সম্ভাব্য সমস্যাগুলি খুঁজে দেখছি:\n• সিনট্যাক্স এরর চেক করুন\n• ভেরিয়েবল নাম সঠিক আছে কিনা দেখুন\n• ফাংশন কল সঠিক আছে কিনা যাচাই করুন\n• লিন্টিং ট্যাবে বিস্তারিত দেখুন"
          : "I'm checking for potential issues in your code:\n• Check for syntax errors\n• Verify variable names\n• Validate function calls\n• See detailed analysis in Linting tab"
      }

      if (bengaliPatterns.explain.some((word) => lowerMessage.includes(word))) {
        return language === "bn"
          ? "আমি আপনার কোড ব্যাখ্যা করতে পারি:\n• কোডের কোন অংশ সম্পর্কে জানতে চান?\n• ফাংশনের কাজ বুঝতে চান?\n• ভেরিয়েবলের ব্যবহার জানতে চান?\n• নির্দিষ্ট লাইন সম্পর্কে প্রশ্ন করুন"
          : "I can explain your code:\n• Which part would you like to understand?\n• Want to know how functions work?\n• Need help with variable usage?\n• Ask about specific lines"
      }

      if (bengaliPatterns.document.some((word) => lowerMessage.includes(word))) {
        return language === "bn"
          ? "কোড ডকুমেন্টেশনের জন্য:\n• JSDoc কমেন্ট যোগ করুন\n• ফাংশনের বর্ণনা লিখুন\n• প্যারামিটার ও রিটার্ন ভ্যালু উল্লেখ করুন\n• উদাহরণ কোড যোগ করুন"
          : "For code documentation:\n• Add JSDoc comments\n• Write function descriptions\n• Mention parameters and return values\n• Add example code"
      }

      if (bengaliPatterns.function.some((word) => lowerMessage.includes(word))) {
        return language === "bn"
          ? "ফাংশন সম্পর্কে সাহায্য:\n• ফাংশন কীভাবে তৈরি করবেন\n• প্যারামিটার পাস করার নিয়ম\n• রিটার্ন ভ্যালু ব্যবহার\n• অ্যারো ফাংশন vs নরমাল ফাংশন"
          : "Function help:\n• How to create functions\n• Parameter passing rules\n• Return value usage\n• Arrow functions vs normal functions"
      }

      const defaultResponses = {
        bn: [
          "আমি ZombieCoder AI সহায়ক। আপনার কোড সম্পর্কে যেকোনো প্রশ্ন করুন!",
          "আপনার কোড বিশ্লেষণ করে সাহায্য করতে পারি। কী জানতে চান?",
          "বাংলায় প্রোগ্রামিং শিখুন! আমি এখানে সাহায্য করতে আছি।",
          "কোড লিখতে সমস্যা হচ্ছে? আমাকে বলুন কী সাহায্য লাগে।",
        ],
        en: [
          "I'm ZombieCoder AI assistant. Ask me anything about your code!",
          "I can analyze your code and help you. What would you like to know?",
          "Learn programming in Bengali! I'm here to help.",
          "Having trouble with code? Tell me what help you need.",
        ],
      }

      const responses = defaultResponses[language]
      return responses[Math.floor(Math.random() * responses.length)]
    },
    [language],
  )

  const handleVoiceCommand = useCallback(
    (command: string, action: string) => {
      storeMemory("voice_command", { command, action }, currentCode)

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

  const handleChatSubmit = useCallback(() => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }])

    setTimeout(() => {
      const aiResponse = getBengaliAIResponse(userMessage)
      setChatHistory((prev) => [...prev, { role: "ai", content: aiResponse }])
    }, 500)

    setChatInput("")
  }, [chatInput, getBengaliAIResponse])

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">ZombieCoder AI</h2>
          {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary ml-auto" />}
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            {language === "bn" ? "অফলাইন AI সহায়ক" : "Offline AI Assistant"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage((prev) => (prev === "bn" ? "en" : "bn"))}
            className="h-6 px-2 text-xs"
          >
            <Languages className="h-3 w-3 mr-1" />
            {language === "bn" ? "বাং" : "EN"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="suggestions" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-4 mt-2">
            <TabsTrigger value="suggestions" className="text-xs">
              {language === "bn" ? "সাজেশন" : "Suggestions"}
            </TabsTrigger>
            <TabsTrigger value="linting" className="text-xs">
              {language === "bn" ? "লিন্টিং" : "Linting"}
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs">
              {language === "bn" ? "ভয়েস" : "Voice"}
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">
              {language === "bn" ? "চ্যাট" : "Chat"}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="suggestions" className="h-full m-0 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{language === "bn" ? "কোড সাজেশন" : "Code Suggestions"}</h3>
                    <Button variant="ghost" size="sm" onClick={clearSuggestions} className="h-6 text-xs">
                      {language === "bn" ? "সাফ করুন" : "Clear"}
                    </Button>
                  </div>

                  {suggestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      {language === "bn" ? "কোড লিখুন সাজেশনের জন্য" : "Write code to get suggestions"}
                    </div>
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
                              {language === "bn" ? "প্রয়োগ করুন" : "Apply"}
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
                    <h3 className="text-sm font-medium">{language === "bn" ? "কোড বিশ্লেষণ" : "Code Analysis"}</h3>
                    <Button variant="ghost" size="sm" onClick={handleFormatCode} className="h-6 text-xs">
                      {language === "bn" ? "ফরম্যাট" : "Format"}
                    </Button>
                  </div>

                  {issues.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      {language === "bn" ? "কোনো সমস্যা পাওয়া যায়নি" : "No issues found"}
                    </div>
                  ) : (
                    issues.map((issue) => (
                      <Card key={issue.id} className="p-3">
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {language === "bn" ? `লাইন ${issue.line}` : `Line ${issue.line}`}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {issue.rule}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{issue.message}</p>
                            {issue.fixable && (
                              <Button variant="outline" size="sm" className="h-6 text-xs mt-2 bg-transparent">
                                {language === "bn" ? "দ্রুত সমাধান" : "Quick Fix"}
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
                language={language}
              />
            </TabsContent>

            <TabsContent value="chat" className="h-full m-0 p-4 flex flex-col">
              <h3 className="text-sm font-medium mb-3">{language === "bn" ? "AI চ্যাট" : "AI Chat"}</h3>

              <ScrollArea className="flex-1 mb-3">
                <div className="space-y-2">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      {language === "bn" ? "AI এর সাথে কথা বলুন" : "Chat with AI"}
                    </div>
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
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="space-y-2">
                <Textarea
                  placeholder={language === "bn" ? "AI কে প্রশ্ন করুন..." : "Ask AI a question..."}
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
                  {language === "bn" ? "পাঠান" : "Send"}
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

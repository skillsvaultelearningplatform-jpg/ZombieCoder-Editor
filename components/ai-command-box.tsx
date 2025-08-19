"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Code, Zap } from "lucide-react"
import { useAICommandRouter } from "@/hooks/use-ai-command-router"

interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant"
  agent: string
  timestamp: Date
}

interface AICommandBoxProps {
  isOpen: boolean
  onClose: () => void
  onCodeInsert: (code: string) => void
}

export function AICommandBox({ isOpen, onClose, onCodeInsert }: AICommandBoxProps) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { routeInputToAgent, getAgentInfo } = useAICommandRouter()

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      agent: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Route to appropriate agent
      const agent = routeInputToAgent(input)
      const agentInfo = getAgentInfo(agent)

      // Simulate AI response (replace with actual API call)
      const response = await simulateAgentResponse(input, agent)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: "assistant",
        agent: agent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // If response contains code, offer to insert
      if (response.hasCode && response.code) {
        onCodeInsert(response.code)
      }
    } catch (error) {
      console.error("AI Command error:", error)
    } finally {
      setIsLoading(false)
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === "Escape") {
      onClose()
    }
  }

  const simulateAgentResponse = async (input: string, agent: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const responses = {
      tech: {
        content: `// ${agent.toUpperCase()} Agent Response\n\nএখানে আপনার কোড সমাধান:\n\n\`\`\`javascript\nfunction sampleCode() {\n  console.log("ZombieCoder AI দ্বারা তৈরি!");\n  return "Hello from ${agent} agent";\n}\n\`\`\`\n\nএই কোডটি আপনার এডিটরে যোগ করতে চান?`,
        hasCode: true,
        code: `function sampleCode() {\n  console.log("ZombieCoder AI দ্বারা তৈরি!");\n  return "Hello from ${agent} agent";\n}`,
      },
      marketing: {
        content: `📈 **Marketing Agent Response**\n\nআপনার ব্র্যান্ডিং এবং মার্কেটিং সম্পর্কে পরামর্শ:\n\n• ZombieCoder একটি শক্তিশালী ব্র্যান্ড নাম\n• "আমি নিজে বানাইছি" - এটি একটি দুর্দান্ত স্লোগান\n• বাংলাদেশী ডেভেলপারদের জন্য বিশেষভাবে ডিজাইন করা\n\nআরও কিছু জানতে চান?`,
        hasCode: false,
        code: null,
      },
      hr: {
        content: `👥 **HR Agent Response**\n\nটিম ম্যানেজমেন্ট এবং কর্পোরেট কালচার সম্পর্কে:\n\n• দলগত কাজের গুরুত্ব\n• কোড রিভিউ প্রক্রিয়া\n• ডেভেলপার প্রোডাক্টিভিটি\n• টিম কমিউনিকেশন\n\nকোন নির্দিষ্ট বিষয়ে জানতে চান?`,
        hasCode: false,
        code: null,
      },
      sarcasm: {
        content: `😏 **Sarcasm Agent Response**\n\nওহ হ্যাঁ, আরেকটি AI এডিটর! কারণ আমাদের যথেষ্ট ছিল না... 🙄\n\nতবে সিরিয়াসলি, ZombieCoder বেশ ভালো লাগছে। "আমি নিজে বানাইছি" মনোভাব টা পছন্দ হয়েছে! 👍\n\nআর কিছু জানতে চান নাকি আমার সার্কাস্টিক মন্তব্য শুনতে চান? 😉`,
        hasCode: false,
        code: null,
      },
    }

    return responses[agent as keyof typeof responses] || responses.sarcasm
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[800px] h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            ZombieCoder AI Command
            <Badge variant="secondary" className="ml-auto">
              Ctrl+K
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Chat History */}
          <ScrollArea className="flex-1 border rounded-lg p-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>AI Assistant এর সাথে কথা বলুন...</p>
                <p className="text-sm mt-2">Tech, Marketing, HR, বা যেকোনো প্রশ্ন করুন!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div
                        className={`rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        {message.role === "assistant" && (
                          <Badge variant="outline" className="mb-2 text-xs">
                            {message.agent.toUpperCase()} Agent
                          </Badge>
                        )}
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="আপনার প্রশ্ন লিখুন... (Ctrl+Enter পাঠাতে)"
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  <Code className="w-3 h-3 mr-1" />
                  Tech
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Marketing
                </Badge>
                <Badge variant="outline" className="text-xs">
                  👥 HR
                </Badge>
                <Badge variant="outline" className="text-xs">
                  😏 Sarcasm
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!input.trim() || isLoading}>
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? "পাঠানো হচ্ছে..." : "পাঠান"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

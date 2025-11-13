"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useAgentStreaming } from "@/hooks/use-agent-streaming"
import { AgentAPI, type ChatMessage } from "@/lib/agent-api"
import { MarkdownMessage } from "@/components/markdown-message"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ImageIcon, Trash2, HelpCircle } from "lucide-react"
import { KeyboardHelpModal } from "@/components/keyboard-help-modal"

interface Model {
  id: string
  name: string
  provider: string
}

export function AgentChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [selectedModel, setSelectedModel] = useState("deepseek-coder-1.3b")
  const [models, setModels] = useState<Model[]>([])
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "error">("disconnected")
  const [showHelp, setShowHelp] = useState(false)
  const [messageHistory, setMessageHistory] = useState<number>(-1)

  const { isConnected, isStreaming, sendMessage } = useAgentStreaming()
  const agentAPI = new AgentAPI()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const loadModels = async () => {
      try {
        const fetchedModels = await agentAPI.getModels()
        setModels(fetchedModels)
      } catch (error) {
        console.error("Failed to load models:", error)
      }
    }

    loadModels()
  }, [])

  useEffect(() => {
    if (isConnected) {
      setConnectionStatus("connected")
    } else {
      setConnectionStatus("disconnected")
    }
  }, [isConnected])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter to send
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        handleSend()
      }

      // Ctrl+Up/Down for message history
      if ((e.ctrlKey || e.metaKey) && e.key === "ArrowUp") {
        e.preventDefault()
        navigateMessageHistory(-1)
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "ArrowDown") {
        e.preventDefault()
        navigateMessageHistory(1)
      }

      // Escape to clear input
      if (e.key === "Escape" && input.trim()) {
        e.preventDefault()
        clearInput()
      }
    }

    textareaRef.current?.addEventListener("keydown", handleKeyDown)
    return () => textareaRef.current?.removeEventListener("keydown", handleKeyDown)
  }, [input])

  const navigateMessageHistory = (direction: -1 | 1) => {
    const userMessages = messages.filter((m) => m.role === "user")
    if (userMessages.length === 0) return

    let newIndex = messageHistory + direction
    if (newIndex < -1) newIndex = -1
    if (newIndex >= userMessages.length) newIndex = userMessages.length - 1

    setMessageHistory(newIndex)

    if (newIndex === -1) {
      setInput("")
    } else {
      setInput(userMessages[userMessages.length - 1 - newIndex].content)
    }
  }

  const clearInput = () => {
    setInput("")
    setUploadedImages([])
    setMessageHistory(-1)
  }

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedImages((prev) => [...prev, ...files])
  }, [])

  const removeImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleInsertCode = useCallback((code: string) => {
    if (window) {
      window.dispatchEvent(
        new CustomEvent("editor:insert-code", {
          detail: { code },
        }),
      )
    }
  }, [])

  const handleReplaceCode = useCallback((code: string) => {
    if (window) {
      window.dispatchEvent(
        new CustomEvent("editor:replace-code", {
          detail: { code },
        }),
      )
    }
  }, [])

  const handleSend = useCallback(async () => {
    if (!input.trim() && uploadedImages.length === 0) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      images: uploadedImages.map((f) => URL.createObjectURL(f)),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    const images = uploadedImages
    setUploadedImages([])
    setMessageHistory(-1)
    setIsLoading(true)

    try {
      if (isConnected) {
        let fullResponse = ""

        sendMessage(input, {
          onChunk: (chunk) => {
            fullResponse += chunk
            setMessages((prev) => {
              const updated = [...prev]
              const lastMessage = updated[updated.length - 1]
              if (lastMessage?.role === "assistant" && lastMessage.isStreaming) {
                lastMessage.content = fullResponse
              }
              return updated
            })
          },
          onComplete: () => {
            setMessages((prev) => {
              const updated = [...prev]
              const lastMessage = updated[updated.length - 1]
              if (lastMessage?.role === "assistant") {
                lastMessage.isStreaming = false
              }
              return updated
            })
          },
          onError: (error) => {
            console.error("Streaming error:", error)
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: `Error: ${error.message}`,
                timestamp: new Date(),
              },
            ])
          },
        })

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "",
            timestamp: new Date(),
            isStreaming: true,
          },
        ])
      } else {
        const response = await agentAPI.chat(input, {
          model: selectedModel,
        })

        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, uploadedImages, isConnected, selectedModel, sendMessage])

  return (
    <>
      <div className="w-96 bg-[#1e1e1e] border-l border-[#333] flex flex-col h-full shadow-lg">
        {/* Header */}
        <div className="p-3 border-b border-[#333] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#cccccc]">Agent Chat</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(true)}
                className="h-6 w-6 p-0 text-[#888] hover:text-[#cccccc]"
                title="Keyboard shortcuts"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
              <div
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                  connectionStatus === "connected" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-green-400" : "bg-red-400"}`}
                />
                {connectionStatus === "connected" ? "Connected" : "Disconnected"}
              </div>
            </div>
          </div>

          {/* Model Selector */}
          <div className="space-y-1">
            <label className="text-xs text-[#888] block">Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="h-8 text-xs bg-[#2d2d2d] border-[#333] hover:border-[#555]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2d2d2d] border-[#333]">
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="text-xs">
                    {model.name} ({model.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-[#888]">
                <div className="text-center">
                  <div className="text-sm font-medium mb-1">No messages yet</div>
                  <div className="text-xs">Ask the agent anything or paste code</div>
                  <div className="text-xs mt-2">Ctrl+Enter to send (Ctrl+? for help)</div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-xs transition-all ${
                      message.role === "user"
                        ? "bg-[#007acc] text-white shadow-md"
                        : "bg-[#2d2d2d] text-[#cccccc] border border-[#333]"
                    }`}
                  >
                    {message.images && message.images.length > 0 && (
                      <div className="flex gap-1 mb-2">
                        {message.images.map((img, i) => (
                          <img
                            key={i}
                            src={img || "/placeholder.svg"}
                            alt="uploaded"
                            className="w-12 h-12 rounded object-cover border border-[#555]"
                          />
                        ))}
                      </div>
                    )}

                    {message.role === "assistant" ? (
                      <MarkdownMessage
                        content={message.content}
                        onInsert={handleInsertCode}
                        onReplace={handleReplaceCode}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    )}

                    {message.isStreaming && <span className="animate-pulse ml-1">▌</span>}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Image Previews */}
        {uploadedImages.length > 0 && (
          <div className="px-4 py-2 border-t border-[#333] flex gap-2 flex-wrap">
            {uploadedImages.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={URL.createObjectURL(img) || "/placeholder.svg"}
                  alt="preview"
                  className="w-12 h-12 rounded object-cover border border-[#555] group-hover:border-[#777]"
                />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 border-t border-[#333] space-y-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask agent anything... (Ctrl+Enter to send)"
            className="min-h-[60px] text-xs bg-[#2d2d2d] border-[#333] text-[#cccccc] resize-none focus:border-[#555]"
            disabled={isLoading || isStreaming}
          />

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isStreaming}
              className="flex-1 h-8 text-xs bg-[#2d2d2d] border-[#333] hover:bg-[#3d3d3d] hover:border-[#555]"
            >
              <ImageIcon className="w-3 h-3 mr-1" />
              Image
            </Button>

            {input.trim() && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearInput}
                className="flex-1 h-8 text-xs bg-[#2d2d2d] border-[#333] hover:bg-[#3d3d3d] hover:border-[#555]"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleSend}
              disabled={isLoading || isStreaming || (!input.trim() && uploadedImages.length === 0)}
              className="flex-1 h-8 text-xs bg-[#007acc] hover:bg-[#005a9e] disabled:opacity-50"
            >
              <Send className="w-3 h-3 mr-1" />
              Send
            </Button>
          </div>

          {/* Keyboard Help */}
          <div className="text-xs text-[#666] text-center">Press Ctrl+Enter to send • Ctrl+↑/↓ for history</div>
        </div>
      </div>

      {/* Keyboard Help Modal */}
      <KeyboardHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  )
}

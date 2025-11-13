"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAgentStreaming } from "@/hooks/use-agent-streaming"
import { useSettings } from "@/hooks/use-settings"
import { AgentAPI } from "@/lib/agent-api"
import { MarkdownRenderer } from "@/lib/markdown-renderer"
import { CodeBlock as CodeBlockComponent } from "@/components/code-block"
import type { ChatMessage } from "@/types/agent"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Upload } from "lucide-react"

export function AgentChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [selectedModel, setSelectedModel] = useState("deepseek-coder-1.3b")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [availableModels, setAvailableModels] = useState<string[]>([])

  const { isConnected, isStreaming, streamingContent, sendMessage, setStreamingContent } = useAgentStreaming()
  const { settings } = useSettings()
  const agentAPI = useRef(new AgentAPI())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load available models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await agentAPI.current.getModels()
        setAvailableModels(models.map((m) => m.id))
      } catch (error) {
        console.error("Failed to load models:", error)
      }
    }
    loadModels()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent])

  const handleSend = async () => {
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

    try {
      if (isConnected && settings?.chat.enableStreaming) {
        sendMessage(input)

        // Wait for streaming to complete and parse markdown
        setTimeout(() => {
          if (streamingContent) {
            const parsed = MarkdownRenderer.parse(streamingContent)
            const assistantMessage: ChatMessage = {
              id: Date.now().toString(),
              role: "assistant",
              content: parsed.content,
              codeBlocks: parsed.codeBlocks,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, assistantMessage])
            setStreamingContent("")
          }
        }, 1000)
      } else {
        const response = await agentAPI.current.chat(input, {
          model: selectedModel,
          temperature: settings?.chat.temperature || 0.7,
          maxTokens: settings?.chat.maxTokens || 2000,
          systemPrompt: settings?.chat.systemPrompt,
          images,
        })

        const parsed = MarkdownRenderer.parse(response)
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: parsed.content,
          codeBlocks: parsed.codeBlocks,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedImages((prev) => [...prev, ...files])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-[#333333]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#333333]">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="px-3 py-2 bg-[#2d2d2d] text-[#cccccc] border border-[#333333] rounded text-sm"
        >
          {availableModels.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <label htmlFor="image-upload">
            <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-[#2d2d2d]" asChild>
              <Upload className="w-4 h-4" />
            </Button>
            <input
              ref={fileInputRef}
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        <div className="text-xs">
          {isConnected ? (
            <span className="text-green-500">Connected</span>
          ) : (
            <span className="text-red-500">Disconnected</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] ${
                message.role === "user"
                  ? "bg-[#007acc] text-white rounded-lg p-3"
                  : "bg-[#2d2d2d] text-[#cccccc] rounded-lg p-3"
              }`}
            >
              {message.images && message.images.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {message.images.map((img, i) => (
                    <img
                      key={i}
                      src={img || "/placeholder.svg"}
                      alt="Upload"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ))}
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap break-words mb-2">{message.content}</div>
              {message.codeBlocks && message.codeBlocks.map((block, i) => <CodeBlockComponent key={i} block={block} />)}
              <div className="text-xs opacity-50 mt-2">{message.timestamp.toLocaleTimeString()}</div>
            </div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="flex gap-3 justify-start">
            <div className="max-w-[80%] bg-[#2d2d2d] text-[#cccccc] rounded-lg p-3">
              <div className="text-sm whitespace-pre-wrap break-words">{streamingContent}</div>
            </div>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="flex items-center gap-2 text-[#888888]">
            <div className="animate-spin">⟳</div>
            <span>Agent is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image Previews */}
      {uploadedImages.length > 0 && (
        <div className="flex gap-2 p-3 border-t border-[#333333] flex-wrap">
          {uploadedImages.map((img, i) => (
            <div key={i} className="relative w-16 h-16">
              <img
                src={URL.createObjectURL(img) || "/placeholder.svg"}
                alt="Upload"
                className="w-full h-full object-cover rounded"
              />
              <button
                onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-[#333333]">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask agent anything... (Ctrl+Enter to send)"
          className="min-h-[80px] resize-y bg-[#2d2d2d] border-[#333333] text-[#cccccc] placeholder-[#888888]"
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button
            onClick={handleSend}
            disabled={isStreaming || (!input.trim() && uploadedImages.length === 0)}
            className="gap-2 bg-[#007acc] hover:bg-[#005a9e] text-white"
          >
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

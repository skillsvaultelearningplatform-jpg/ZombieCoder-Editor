"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { StreamChunk } from "@/types/agent"
import { AgentAPI } from "@/lib/agent-api"

export function useAgentStreaming() {
  const [isConnected, setIsConnected] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const agentAPI = useRef(new AgentAPI())

  const connect = useCallback(() => {
    try {
      const ws = agentAPI.current.createWebSocketConnection()

      ws.onopen = () => {
        setIsConnected(true)
        console.log("[Agent] WebSocket connected")
      }

      ws.onmessage = (event) => {
        try {
          const data: StreamChunk = JSON.parse(event.data)

          if (data.type === "stream") {
            setStreamingContent((prev) => prev + (data.content || ""))
          } else if (data.type === "complete") {
            setIsStreaming(false)
          } else if (data.type === "error") {
            console.error("[Agent] Error:", data.error)
            setIsStreaming(false)
          }
        } catch (error) {
          console.error("[Agent] Failed to parse message:", error)
        }
      }

      ws.onerror = (error) => {
        console.error("[Agent] WebSocket error:", error)
      }

      ws.onclose = () => {
        setIsConnected(false)
        setTimeout(connect, 3000)
      }

      wsRef.current = ws
    } catch (error) {
      console.error("[Agent] Connection failed:", error)
    }
  }, [])

  const sendMessage = useCallback((message: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("[Agent] WebSocket not connected")
      return
    }

    setStreamingContent("")
    setIsStreaming(true)

    const payload = {
      message,
      stream: true,
    }

    wsRef.current.send(JSON.stringify(payload))
  }, [])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [connect])

  return {
    isConnected,
    isStreaming,
    streamingContent,
    sendMessage,
    setStreamingContent,
  }
}

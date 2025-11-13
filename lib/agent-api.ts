import type { ChatOptions, AgentModel } from "@/types/agent"

export class AgentAPI {
  private baseURL: string
  private wsURL: string

  constructor(baseURL = "http://127.0.0.1:8001/v1", wsURL = "ws://127.0.0.1:8001/ws") {
    this.baseURL = baseURL
    this.wsURL = wsURL
  }

  async chat(message: string, options: ChatOptions): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        model: options.model,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        system_prompt: options.systemPrompt,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Agent API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.content
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("image", file)

    const response = await fetch(`${this.baseURL}/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Image upload failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.url
  }

  async getModels(): Promise<AgentModel[]> {
    const response = await fetch(`${this.baseURL}/models`)

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }

    const data = await response.json()
    return data.models
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL.replace("/v1", "")}/health`)
      return response.ok
    } catch {
      return false
    }
  }

  createWebSocketConnection(): WebSocket {
    return new WebSocket(this.wsURL)
  }
}

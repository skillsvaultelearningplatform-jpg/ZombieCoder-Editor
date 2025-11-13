// Agent API types and interfaces
export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  images?: string[]
  codeBlocks?: CodeBlock[]
  timestamp: Date
}

export interface CodeBlock {
  language: string
  code: string
}

export interface AgentModel {
  id: string
  name: string
  provider: "Local" | "OpenAI" | "Anthropic" | "Google"
  maxTokens: number
}

export interface AgentConfig {
  apiEndpoint: string
  wsEndpoint: string
  streamingEnabled: boolean
  models: AgentModel[]
}

export interface ChatOptions {
  model: string
  temperature: number
  maxTokens: number
  stream?: boolean
  systemPrompt?: string
  images?: File[]
}

export interface StreamChunk {
  type: "stream" | "complete" | "error"
  content?: string
  error?: string
  fullResponse?: string
}

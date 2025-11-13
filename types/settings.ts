export interface GeneralSettings {
  theme: "dark" | "light" | "auto"
  fontSize: number
  fontFamily: string
  autoSave: boolean
  autoSaveDelay: number
}

export interface ChatSettings {
  defaultModel: string
  temperature: number
  maxTokens: number
  enableStreaming: boolean
  enableImages: boolean
  systemPrompt: string
}

export interface ModelsConfig {
  local?: {
    endpoint: string
    apiKey: string
  }
  openai?: {
    apiKey: string
    organization?: string
  }
  anthropic?: {
    apiKey: string
  }
}

export interface EditorSettings {
  tabSize: number
  insertSpaces: boolean
  wordWrap: "off" | "on" | "wordWrapColumn" | "bounded"
  minimap: boolean
  lineNumbers: "on" | "off" | "relative"
}

export interface TerminalSettings {
  shell: string
  fontSize: number
  cursorStyle: "block" | "underline" | "bar"
}

export interface AllSettings {
  general: GeneralSettings
  chat: ChatSettings
  models: ModelsConfig
  editor: EditorSettings
  terminal: TerminalSettings
}

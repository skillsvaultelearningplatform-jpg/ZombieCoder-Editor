import type {
  AllSettings,
  GeneralSettings,
  ChatSettings,
  EditorSettings,
  TerminalSettings,
  ModelsConfig,
} from "@/types/settings"

const DEFAULT_SETTINGS: AllSettings = {
  general: {
    theme: "dark",
    fontSize: 14,
    fontFamily: "JetBrains Mono",
    autoSave: true,
    autoSaveDelay: 1000,
  },
  chat: {
    defaultModel: "deepseek-coder-1.3b",
    temperature: 0.7,
    maxTokens: 2000,
    enableStreaming: true,
    enableImages: true,
    systemPrompt: "You are a helpful coding assistant. Provide clear, concise code solutions.",
  },
  models: {
    local: {
      endpoint: "http://127.0.0.1:8001/v1",
      apiKey: "DUMMY_API_KEY_FOR_LOCAL",
    },
  },
  editor: {
    tabSize: 2,
    insertSpaces: true,
    wordWrap: "off",
    minimap: true,
    lineNumbers: "on",
  },
  terminal: {
    shell: "powershell.exe",
    fontSize: 13,
    cursorStyle: "block",
  },
}

export class SettingsStore {
  private settings: AllSettings
  private storageKey = "zombiecoder-settings"

  constructor() {
    this.settings = this.loadFromStorage() || DEFAULT_SETTINGS
  }

  private loadFromStorage(): AllSettings | null {
    if (typeof window === "undefined") return null

    try {
      const saved = localStorage.getItem(this.storageKey)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings))
    } catch (error) {
      console.error("Failed to save settings:", error)
    }
  }

  getSettings(): AllSettings {
    return this.settings
  }

  updateGeneral(general: Partial<GeneralSettings>): void {
    this.settings.general = { ...this.settings.general, ...general }
    this.saveToStorage()
  }

  updateChat(chat: Partial<ChatSettings>): void {
    this.settings.chat = { ...this.settings.chat, ...chat }
    this.saveToStorage()
  }

  updateModels(models: Partial<ModelsConfig>): void {
    this.settings.models = { ...this.settings.models, ...models }
    this.saveToStorage()
  }

  updateEditor(editor: Partial<EditorSettings>): void {
    this.settings.editor = { ...this.settings.editor, ...editor }
    this.saveToStorage()
  }

  updateTerminal(terminal: Partial<TerminalSettings>): void {
    this.settings.terminal = { ...this.settings.terminal, ...terminal }
    this.saveToStorage()
  }

  reset(): void {
    this.settings = DEFAULT_SETTINGS
    this.saveToStorage()
  }
}

export const settingsStore = new SettingsStore()

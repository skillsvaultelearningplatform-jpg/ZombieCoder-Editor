"use client"

import { useState, useCallback, useEffect } from "react"
import type { AllSettings, GeneralSettings, ChatSettings } from "@/types/settings"
import { settingsStore } from "@/lib/settings-store"

export function useSettings() {
  const [settings, setSettings] = useState<AllSettings | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadedSettings = settingsStore.getSettings()
    setSettings(loadedSettings)
    setIsLoaded(true)
  }, [])

  const updateGeneral = useCallback((general: Partial<GeneralSettings>) => {
    settingsStore.updateGeneral(general)
    setSettings(settingsStore.getSettings())
  }, [])

  const updateChat = useCallback((chat: Partial<ChatSettings>) => {
    settingsStore.updateChat(chat)
    setSettings(settingsStore.getSettings())
  }, [])

  return {
    settings,
    isLoaded,
    updateGeneral,
    updateChat,
  }
}

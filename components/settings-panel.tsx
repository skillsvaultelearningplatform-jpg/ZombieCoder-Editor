"use client"

import type React from "react"

import { useState } from "react"
import { useSettings } from "@/hooks/use-settings"

export function SettingsPanel() {
  const { settings, updateGeneral, updateChat } = useSettings()
  const [activeTab, setActiveTab] = useState("general")

  if (!settings) {
    return <div className="p-4">Loading settings...</div>
  }

  return (
    <div className="flex h-full bg-[#1e1e1e]">
      {/* Sidebar Navigation */}
      <div className="w-[200px] bg-[#252526] border-r border-[#333333] p-4 space-y-2">
        {[
          { id: "general", label: "General" },
          { id: "chat", label: "Chat" },
          { id: "models", label: "Models" },
          { id: "editor", label: "Editor" },
          { id: "terminal", label: "Terminal" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-4 py-2 rounded text-sm ${
              activeTab === tab.id
                ? "bg-[#37373d] text-[#cccccc] border-l-2 border-[#007acc]"
                : "text-[#cccccc] hover:bg-[#2d2d2d]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === "general" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#cccccc]">General Settings</h2>

            <SettingRow label="Theme" description="Choose your preferred color theme">
              <select
                value={settings.general.theme}
                onChange={(e) => updateGeneral({ theme: e.target.value as "dark" | "light" | "auto" })}
                className="px-3 py-2 bg-[#2d2d2d] text-[#cccccc] border border-[#333333] rounded text-sm"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </SettingRow>

            <SettingRow label="Font Size" description="Editor font size (12-24)">
              <input
                type="number"
                min={12}
                max={24}
                value={settings.general.fontSize}
                onChange={(e) => updateGeneral({ fontSize: Number.parseInt(e.target.value) })}
                className="px-3 py-2 bg-[#2d2d2d] text-[#cccccc] border border-[#333333] rounded text-sm w-[100px]"
              />
            </SettingRow>

            <SettingRow label="Font Family" description="Editor font family">
              <input
                type="text"
                value={settings.general.fontFamily}
                onChange={(e) => updateGeneral({ fontFamily: e.target.value })}
                className="px-3 py-2 bg-[#2d2d2d] text-[#cccccc] border border-[#333333] rounded text-sm w-full"
              />
            </SettingRow>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#cccccc]">Chat Settings</h2>

            <SettingRow label="Temperature" description="Controls response randomness (0-1)">
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={settings.chat.temperature}
                onChange={(e) => updateChat({ temperature: Number.parseFloat(e.target.value) })}
                className="w-[200px]"
              />
            </SettingRow>

            <SettingRow label="Max Tokens" description="Maximum response length">
              <input
                type="number"
                value={settings.chat.maxTokens}
                onChange={(e) => updateChat({ maxTokens: Number.parseInt(e.target.value) })}
                className="px-3 py-2 bg-[#2d2d2d] text-[#cccccc] border border-[#333333] rounded text-sm w-[150px]"
              />
            </SettingRow>

            <SettingRow label="System Prompt" description="Default system prompt">
              <textarea
                value={settings.chat.systemPrompt}
                onChange={(e) => updateChat({ systemPrompt: e.target.value })}
                className="px-3 py-2 bg-[#2d2d2d] text-[#cccccc] border border-[#333333] rounded text-sm w-full min-h-[100px]"
              />
            </SettingRow>
          </div>
        )}

        {activeTab === "models" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#cccccc]">Models Configuration</h2>

            <div className="bg-[#2d2d2d] p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-[#cccccc]">Local Agent Server</h3>

              <SettingRow label="API Endpoint" description="Local agent server URL">
                <input
                  type="text"
                  value={settings.models.local?.endpoint || ""}
                  className="px-3 py-2 bg-[#1e1e1e] text-[#cccccc] border border-[#333333] rounded text-sm w-full"
                  readOnly
                />
              </SettingRow>

              <SettingRow label="API Key" description="Authentication key">
                <input
                  type="password"
                  value={settings.models.local?.apiKey || ""}
                  className="px-3 py-2 bg-[#1e1e1e] text-[#cccccc] border border-[#333333] rounded text-sm w-full"
                  readOnly
                />
              </SettingRow>
            </div>
          </div>
        )}

        {activeTab === "editor" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#cccccc]">Editor Settings</h2>
            <p className="text-[#888888] text-sm">Editor settings are configured through Monaco Editor preferences.</p>
          </div>
        )}

        {activeTab === "terminal" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#cccccc]">Terminal Settings</h2>
            <p className="text-[#888888] text-sm">Terminal settings are managed in the terminal component.</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface SettingRowProps {
  label: string
  description: string
  children: React.ReactNode
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex justify-between items-start gap-4 pb-4 border-b border-[#333333]">
      <div>
        <div className="font-medium text-[#cccccc]">{label}</div>
        <div className="text-xs text-[#888888] mt-1">{description}</div>
      </div>
      <div className="min-w-[250px]">{children}</div>
    </div>
  )
}

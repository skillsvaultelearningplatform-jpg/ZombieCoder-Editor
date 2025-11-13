"use client"

import { useState, useEffect } from "react"
import { AgentChatPanel } from "@/components/agent-chat-panel"
import { SettingsPanel } from "@/components/settings-panel"
import { Button } from "@/components/ui/button"
import { Settings, MessageSquare, Sun, Moon } from "lucide-react"

export default function Home() {
  const [activePanel, setActivePanel] = useState<"chat" | "settings">("chat")
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Apply theme
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  return (
    <div className="flex h-screen bg-[#1e1e1e]">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e]">
        {/* Top Menu Bar */}
        <div className="h-10 bg-[#323233] border-b border-[#3e3e42] px-0 flex items-center justify-between">
          <div className="flex items-center h-full">
            {/* File Menu Placeholder */}
            <div className="h-full flex items-center px-4 text-xs text-[#cccccc] cursor-default hover:bg-[#2d2d30]">
              File
            </div>
            <div className="h-full flex items-center px-4 text-xs text-[#cccccc] cursor-default hover:bg-[#2d2d30]">
              Edit
            </div>
            <div className="h-full flex items-center px-4 text-xs text-[#cccccc] cursor-default hover:bg-[#2d2d30]">
              View
            </div>
            <div className="h-full flex items-center px-4 text-xs text-[#cccccc] cursor-default hover:bg-[#2d2d30]">
              Run
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2 pr-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsDark(!isDark)}
              className="h-6 w-6 p-0"
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setActivePanel("chat")}
              className={`h-6 px-2 text-xs gap-1 ${activePanel === "chat" ? "bg-[#2d2d30]" : ""}`}
            >
              <MessageSquare className="w-3 h-3" />
              Chat
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setActivePanel("settings")}
              className={`h-6 px-2 text-xs gap-1 ${activePanel === "settings" ? "bg-[#2d2d30]" : ""}`}
            >
              <Settings className="w-3 h-3" />
              Settings
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Main Editor */}
          <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
            <div className="text-center text-[#888888]">
              <div className="text-4xl mb-4">🧟</div>
              <div className="text-xl font-semibold mb-2">ZombieCoder Editor v2.0</div>
              <div className="text-sm mb-4">Cursor AI / VS Code Copilot Style</div>
              <div className="text-xs text-[#555555]">
                {activePanel === "chat" ? "Chat with your AI agent →" : "Configure settings →"}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-[420px] bg-[#1e1e1e] border-l border-[#3e3e42] shadow-2xl">
            {activePanel === "chat" && <AgentChatPanel />}
            {activePanel === "settings" && <SettingsPanel />}
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-7 bg-[#007acc] border-t border-[#0e639c] flex items-center px-4 text-xs text-white">
          <span className="mr-auto">ZombieCoder Editor • Ready</span>
          <span>আমি নিজে বানাইছি</span>
        </div>
      </div>
    </div>
  )
}

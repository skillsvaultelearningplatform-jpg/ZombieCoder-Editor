"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TerminalIcon, X, Minimize2, Plus, Maximize2 } from "lucide-react"
import { useGit } from "@/hooks/use-git"
import { useEnhancedTerminal } from "@/hooks/use-enhanced-terminal"

interface TerminalLine {
  id: string
  type: "command" | "output" | "error"
  content: string
  timestamp: Date
  tabId: string
}

interface TerminalProps {
  isVisible: boolean
  onClose?: () => void
  onMinimize?: () => void
}

export function Terminal({ isVisible, onClose, onMinimize }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "welcome",
      type: "output",
      content: "ZombieCoder Terminal - আমি নিজে বানাইছি\nType 'help' for available commands",
      timestamp: new Date(),
      tabId: "main",
    },
  ])
  const [currentCommand, setCurrentCommand] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const [isMaximized, setIsMaximized] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { executeGitCommand } = useGit()
  const { tabs, getCommandSuggestions, executeEnhancedCommand, createNewTab, closeTab, switchTab } =
    useEnhancedTerminal()

  const activeTab = tabs.find((t) => t.isActive) || tabs[0]

  const executeCommand = (command: string) => {
    const newLine: TerminalLine = {
      id: `cmd_${Date.now()}`,
      type: "command",
      content: `${activeTab?.cwd || "/workspace"} $ ${command}`,
      timestamp: new Date(),
      tabId: activeTab?.id || "main",
    }

    let output = ""
    let outputType: "output" | "error" = "output"

    if (command.startsWith("git ")) {
      output = executeGitCommand(command)
    } else {
      output = executeEnhancedCommand(command, activeTab?.id || "main")

      if (output === "CLEAR_TERMINAL") {
        setLines((prev) => prev.filter((line) => line.tabId !== activeTab?.id))
        return
      }

      if (output.startsWith("Command not found:")) {
        outputType = "error"
      }
    }

    const outputLine: TerminalLine = {
      id: `out_${Date.now()}`,
      type: outputType,
      content: output,
      timestamp: new Date(),
      tabId: activeTab?.id || "main",
    }

    setLines((prev) => [...prev, newLine, outputLine])
    setCommandHistory((prev) => [...prev, command])
    setCurrentCommand("")
    setHistoryIndex(-1)
    setSuggestions([])
    setSelectedSuggestion(-1)
  }

  const handleInputChange = (value: string) => {
    setCurrentCommand(value)

    if (value.trim()) {
      const newSuggestions = getCommandSuggestions(value.trim())
      setSuggestions(newSuggestions)
      setSelectedSuggestion(-1)
    } else {
      setSuggestions([])
      setSelectedSuggestion(-1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
        setCurrentCommand(suggestions[selectedSuggestion])
        setSuggestions([])
        setSelectedSuggestion(-1)
      } else {
        executeCommand(currentCommand)
      }
    } else if (e.key === "Tab" && suggestions.length > 0) {
      e.preventDefault()
      setCurrentCommand(suggestions[0])
      setSuggestions([])
      setSelectedSuggestion(-1)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (suggestions.length > 0) {
        setSelectedSuggestion((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
      } else if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (suggestions.length > 0) {
        setSelectedSuggestion((prev) => (prev >= suggestions.length - 1 ? -1 : prev + 1))
      } else if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCurrentCommand("")
        } else {
          setHistoryIndex(newIndex)
          setCurrentCommand(commandHistory[newIndex])
        }
      }
    } else if (e.key === "Escape") {
      setSuggestions([])
      setSelectedSuggestion(-1)
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isVisible, activeTab])

  if (!isVisible) return null

  const currentTabLines = lines.filter((line) => line.tabId === activeTab?.id)

  return (
    <div className={`bg-card border-t border-border flex flex-col ${isMaximized ? "fixed inset-0 z-50" : "h-64"}`}>
      {/* Terminal Header */}
      <div className="h-8 bg-muted/50 border-b border-border flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Terminal</span>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 ml-4">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer ${
                  tab.isActive ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => switchTab(tab.id)}
              >
                <span>{tab.name}</span>
                {tabs.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTab(tab.id)
                    }}
                    className="h-3 w-3 p-0 hover:bg-destructive/20"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={createNewTab} className="h-5 w-5 p-0" title="New Terminal Tab">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMaximized(!isMaximized)}
            className="h-6 w-6 p-0"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onMinimize} className="h-6 w-6 p-0">
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 flex flex-col relative">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="p-3 font-mono text-sm space-y-1">
            {currentTabLines.map((line) => (
              <div
                key={line.id}
                className={`${
                  line.type === "command"
                    ? "text-primary"
                    : line.type === "error"
                      ? "text-destructive"
                      : "text-foreground"
                } whitespace-pre-wrap`}
              >
                {line.content}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Command Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute bottom-12 left-3 right-3 bg-popover border border-border rounded-md shadow-lg z-10">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  index === selectedSuggestion ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                }`}
                onClick={() => {
                  setCurrentCommand(suggestion)
                  setSuggestions([])
                  setSelectedSuggestion(-1)
                  inputRef.current?.focus()
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        {/* Command Input */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              {activeTab?.cwd || "/workspace"}
            </Badge>
            <span className="text-primary font-mono text-sm">$</span>
            <Input
              ref={inputRef}
              value={currentCommand}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              className="border-0 bg-transparent focus-visible:ring-0 font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

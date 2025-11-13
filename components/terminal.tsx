"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TerminalIcon, X, Minimize2 } from "lucide-react"

interface TerminalLine {
  id: string
  type: "command" | "output" | "error"
  content: string
  timestamp: Date
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
      content: "ZombieCoder Terminal - আমি নিজে বানাইছি",
      timestamp: new Date(),
    },
  ])
  const [currentCommand, setCurrentCommand] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const executeCommand = (command: string) => {
    const newLine: TerminalLine = {
      id: `cmd_${Date.now()}`,
      type: "command",
      content: `$ ${command}`,
      timestamp: new Date(),
    }

    let output = ""
    let outputType: "output" | "error" = "output"

    // Simple command simulation
    switch (command.toLowerCase().trim()) {
      case "help":
        output = `Available commands:
  help - Show this help message
  clear - Clear terminal
  pwd - Show current directory
  ls - List files
  echo [text] - Echo text
  date - Show current date
  whoami - Show current user`
        break
      case "clear":
        setLines([])
        return
      case "pwd":
        output = "/workspace/zombiecoder-editor"
        break
      case "ls":
        output = `app/  components/  hooks/  lib/  public/
package.json  tsconfig.json  next.config.mjs`
        break
      case "date":
        output = new Date().toString()
        break
      case "whoami":
        output = "zombiecoder-user"
        break
      default:
        if (command.startsWith("echo ")) {
          output = command.substring(5)
        } else if (command.trim() === "") {
          return
        } else {
          output = `Command not found: ${command}`
          outputType = "error"
        }
    }

    const outputLine: TerminalLine = {
      id: `out_${Date.now()}`,
      type: outputType,
      content: output,
      timestamp: new Date(),
    }

    setLines((prev) => [...prev, newLine, outputLine])
    setCommandHistory((prev) => [...prev, command])
    setCurrentCommand("")
    setHistoryIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(currentCommand)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCurrentCommand("")
        } else {
          setHistoryIndex(newIndex)
          setCurrentCommand(commandHistory[newIndex])
        }
      }
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
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="h-64 bg-card border-t border-border flex flex-col">
      {/* Terminal Header */}
      <div className="h-8 bg-muted/50 border-b border-border flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onMinimize} className="h-6 w-6 p-0">
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="p-3 font-mono text-sm space-y-1">
            {lines.map((line) => (
              <div
                key={line.id}
                className={`${
                  line.type === "command"
                    ? "text-primary"
                    : line.type === "error"
                      ? "text-destructive"
                      : "text-foreground"
                }`}
              >
                {line.content}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Command Input */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <span className="text-primary font-mono text-sm">$</span>
            <Input
              ref={inputRef}
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
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

"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, File, Save, FolderOpen, Settings, Terminal, Code, Palette, GitBranch } from "lucide-react"

interface Command {
  id: string
  title: string
  description: string
  shortcut?: string
  category: string
  icon: React.ReactNode
  action: () => void
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onCommand?: (command: Command) => void
}

export function CommandPalette({ isOpen, onClose, onCommand }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands: Command[] = [
    {
      id: "new-file",
      title: "New File",
      description: "Create a new file",
      shortcut: "Ctrl+N",
      category: "File",
      icon: <File className="h-4 w-4" />,
      action: () => console.log("New file"),
    },
    {
      id: "save-file",
      title: "Save File",
      description: "Save current file",
      shortcut: "Ctrl+S",
      category: "File",
      icon: <Save className="h-4 w-4" />,
      action: () => console.log("Save file"),
    },
    {
      id: "open-file",
      title: "Open File",
      description: "Open an existing file",
      shortcut: "Ctrl+O",
      category: "File",
      icon: <FolderOpen className="h-4 w-4" />,
      action: () => console.log("Open file"),
    },
    {
      id: "format-code",
      title: "Format Code",
      description: "Format current document",
      shortcut: "Shift+Alt+F",
      category: "Edit",
      icon: <Code className="h-4 w-4" />,
      action: () => console.log("Format code"),
    },
    {
      id: "toggle-terminal",
      title: "Toggle Terminal",
      description: "Show/hide terminal panel",
      shortcut: "Ctrl+`",
      category: "View",
      icon: <Terminal className="h-4 w-4" />,
      action: () => console.log("Toggle terminal"),
    },
    {
      id: "command-palette",
      title: "Command Palette",
      description: "Show command palette",
      shortcut: "Ctrl+Shift+P",
      category: "View",
      icon: <Palette className="h-4 w-4" />,
      action: () => console.log("Command palette"),
    },
    {
      id: "settings",
      title: "Settings",
      description: "Open settings",
      shortcut: "Ctrl+,",
      category: "Preferences",
      icon: <Settings className="h-4 w-4" />,
      action: () => console.log("Settings"),
    },
    {
      id: "git-status",
      title: "Git Status",
      description: "Show git status",
      category: "Source Control",
      icon: <GitBranch className="h-4 w-4" />,
      action: () => console.log("Git status"),
    },
  ]

  const filteredCommands = commands.filter(
    (command) =>
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase()) ||
      command.category.toLowerCase().includes(query.toLowerCase()),
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
          break
        case "Enter":
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            const command = filteredCommands[selectedIndex]
            command.action()
            onCommand?.(command)
            onClose()
          }
          break
        case "Escape":
          e.preventDefault()
          onClose()
          break
      }
    },
    [isOpen, filteredCommands, selectedIndex, onCommand, onClose],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b border-border px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground mr-3" />
            <Input
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 text-sm"
              autoFocus
            />
          </div>

          {/* Commands List */}
          <ScrollArea className="max-h-96">
            <div className="p-2">
              {filteredCommands.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No commands found</div>
              ) : (
                <div className="space-y-1">
                  {filteredCommands.map((command, index) => (
                    <div
                      key={command.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                        index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                      }`}
                      onClick={() => {
                        command.action()
                        onCommand?.(command)
                        onClose()
                      }}
                    >
                      {command.icon}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{command.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {command.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{command.description}</p>
                      </div>
                      {command.shortcut && (
                        <Badge variant="outline" className="text-xs font-mono">
                          {command.shortcut}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

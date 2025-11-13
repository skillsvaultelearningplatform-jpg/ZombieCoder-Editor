"use client"

import { useState, useCallback } from "react"
import { useFileSystem } from "@/hooks/use-file-system"

export interface TerminalTab {
  id: string
  name: string
  cwd: string
  isActive: boolean
}

export interface TerminalCommand {
  command: string
  description: string
  usage: string
}

export function useEnhancedTerminal() {
  const { files, createFile, deleteFile } = useFileSystem()
  const [tabs, setTabs] = useState<TerminalTab[]>([{ id: "main", name: "Terminal", cwd: "/workspace", isActive: true }])

  const commands: TerminalCommand[] = [
    { command: "ls", description: "List directory contents", usage: "ls [options] [directory]" },
    { command: "cd", description: "Change directory", usage: "cd <directory>" },
    { command: "mkdir", description: "Create directory", usage: "mkdir <directory>" },
    { command: "touch", description: "Create file", usage: "touch <filename>" },
    { command: "rm", description: "Remove file/directory", usage: "rm [options] <file>" },
    { command: "cat", description: "Display file contents", usage: "cat <filename>" },
    { command: "grep", description: "Search text patterns", usage: "grep <pattern> <file>" },
    { command: "find", description: "Find files and directories", usage: "find <path> -name <pattern>" },
    { command: "ps", description: "Show running processes", usage: "ps [options]" },
    { command: "kill", description: "Terminate process", usage: "kill <pid>" },
    { command: "npm", description: "Node package manager", usage: "npm <command> [options]" },
    { command: "node", description: "Run Node.js", usage: "node <file>" },
    { command: "git", description: "Git version control", usage: "git <command> [options]" },
  ]

  const getCommandSuggestions = useCallback(
    (input: string): string[] => {
      if (!input.trim()) return []

      const matchingCommands = commands
        .filter((cmd) => cmd.command.startsWith(input.toLowerCase()))
        .map((cmd) => cmd.command)

      return matchingCommands.slice(0, 5)
    },
    [commands],
  )

  const executeEnhancedCommand = useCallback(
    (command: string, tabId: string): string => {
      const parts = command.trim().split(" ")
      const cmd = parts[0].toLowerCase()
      const args = parts.slice(1)

      const currentTab = tabs.find((t) => t.id === tabId)
      const cwd = currentTab?.cwd || "/workspace"

      switch (cmd) {
        case "ls":
          const targetDir = args[0] || cwd
          const relevantFiles = files.filter(
            (f) =>
              f.path.startsWith(targetDir) &&
              f.path !== targetDir &&
              !f.path.substring(targetDir.length + 1).includes("/"),
          )

          if (relevantFiles.length === 0) {
            return "Directory is empty"
          }

          return relevantFiles.map((f) => (f.type === "folder" ? `📁 ${f.name}/` : `📄 ${f.name}`)).join("\n")

        case "cd":
          if (!args[0]) return "Usage: cd <directory>"

          const newPath = args[0].startsWith("/") ? args[0] : `${cwd}/${args[0]}`
          const dirExists = files.some((f) => f.path === newPath && f.type === "folder")

          if (dirExists || newPath === "/workspace") {
            setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, cwd: newPath } : t)))
            return `Changed directory to ${newPath}`
          }
          return `Directory not found: ${args[0]}`

        case "mkdir":
          if (!args[0]) return "Usage: mkdir <directory>"

          const dirPath = args[0].startsWith("/") ? args[0] : `${cwd}/${args[0]}`
          // Simulate directory creation
          return `Created directory: ${dirPath}`

        case "touch":
          if (!args[0]) return "Usage: touch <filename>"

          const filePath = args[0].startsWith("/") ? args[0] : `${cwd}/${args[0]}`
          createFile(args[0], "", "file")
          return `Created file: ${filePath}`

        case "rm":
          if (!args[0]) return "Usage: rm <file>"

          const fileToDelete = files.find((f) => f.name === args[0])
          if (fileToDelete) {
            deleteFile(fileToDelete.id)
            return `Removed: ${args[0]}`
          }
          return `File not found: ${args[0]}`

        case "cat":
          if (!args[0]) return "Usage: cat <filename>"

          const file = files.find((f) => f.name === args[0])
          if (file && file.type === "file") {
            return file.content || "File is empty"
          }
          return `File not found: ${args[0]}`

        case "grep":
          if (args.length < 2) return "Usage: grep <pattern> <file>"

          const patternToSearch = args[0]
          const filenameToSearch = args[1]
          const targetFile = files.find((f) => f.name === filenameToSearch)
          if (!targetFile) return `File not found: ${filenameToSearch}`

          const lines = targetFile.content.split("\n")
          const matches = lines.filter((line) => line.includes(patternToSearch))
          return matches.length > 0 ? matches.join("\n") : "No matches found"

        case "find":
          if (args.length < 3 || args[1] !== "-name") {
            return "Usage: find <path> -name <pattern>"
          }

          const searchPath = args[0]
          const searchPattern = args[2]
          const matchingFiles = files.filter(
            (f) => f.path.startsWith(searchPath) && f.name.includes(searchPattern.replace("*", "")),
          )

          return matchingFiles.length > 0 ? matchingFiles.map((f) => f.path).join("\n") : "No files found"

        case "ps":
          return `PID    COMMAND
1234   zombiecoder-editor
1235   node server.js
1236   git status
1237   npm run dev`

        case "kill":
          if (!args[0]) return "Usage: kill <pid>"
          return `Process ${args[0]} terminated`

        case "npm":
          if (!args[0]) return "Usage: npm <command>"

          switch (args[0]) {
            case "install":
              return "Installing dependencies...\nDependencies installed successfully!"
            case "run":
              return args[1] ? `Running script: ${args[1]}` : "Available scripts: dev, build, start, test"
            case "version":
              return "npm version 10.2.4"
            default:
              return `Unknown npm command: ${args[0]}`
          }

        case "node":
          if (!args[0]) return "Usage: node <file>"

          const jsFile = files.find((f) => f.name === args[0])
          if (jsFile && jsFile.name.endsWith(".js")) {
            return `Executing ${args[0]}...\nHello from Node.js!`
          }
          return `File not found or not a JavaScript file: ${args[0]}`

        case "clear":
          return "CLEAR_TERMINAL"

        case "pwd":
          return cwd

        case "whoami":
          return "zombiecoder-user"

        case "date":
          return new Date().toString()

        case "help":
          return commands.map((cmd) => `${cmd.command.padEnd(12)} - ${cmd.description}`).join("\n")

        default:
          return `Command not found: ${cmd}. Type 'help' for available commands.`
      }
    },
    [files, createFile, deleteFile, tabs],
  )

  const createNewTab = useCallback(() => {
    const newTab: TerminalTab = {
      id: `tab_${Date.now()}`,
      name: `Terminal ${tabs.length + 1}`,
      cwd: "/workspace",
      isActive: false,
    }

    setTabs((prev) => [...prev.map((t) => ({ ...t, isActive: false })), { ...newTab, isActive: true }])

    return newTab.id
  }, [tabs.length])

  const closeTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId)
      if (newTabs.length === 0) {
        return [{ id: "main", name: "Terminal", cwd: "/workspace", isActive: true }]
      }

      const closingTab = prev.find((t) => t.id === tabId)
      if (closingTab?.isActive && newTabs.length > 0) {
        newTabs[0].isActive = true
      }

      return newTabs
    })
  }, [])

  const switchTab = useCallback((tabId: string) => {
    setTabs((prev) => prev.map((t) => ({ ...t, isActive: t.id === tabId })))
  }, [])

  return {
    tabs,
    commands,
    getCommandSuggestions,
    executeEnhancedCommand,
    createNewTab,
    closeTab,
    switchTab,
  }
}

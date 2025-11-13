"use client"

import { useState, useCallback, useEffect } from "react"
import { MonacoEditor } from "@/components/monaco-editor"
import { FileExplorerSidebar } from "@/components/file-explorer-sidebar"
import { AIPanel } from "@/components/ai-panel"
import { SecurityPanel } from "@/components/security-panel"
import { CodeExecutor } from "@/components/code-executor"
import { ExtensionManager } from "@/components/extension-manager"
import { AppSidebar } from "@/components/app-sidebar"
import { Toolbar } from "@/components/toolbar"
import { StatusBar } from "@/components/status-bar"
import { TabBar } from "@/components/tab-bar"
import { Terminal } from "@/components/terminal"
import { CommandPalette } from "@/components/command-palette"
import { AICommandBox } from "@/components/ai-command-box"
import { ThemeProvider } from "@/components/theme-provider"
import { AgentChatPanel } from "@/components/agent-chat-panel"
import { SettingsPanel } from "@/components/settings-panel"
import { type FileItem, useFileSystem } from "@/hooks/use-file-system"
import { useSecurity } from "@/hooks/use-security"
import { useAICommandShortcut } from "@/hooks/use-keyboard-shortcuts"

interface Tab {
  id: string
  name: string
  path: string
  isDirty: boolean
  isActive: boolean
  file: FileItem
}

export default function ZombieCoderEditor() {
  const { updateFileContent } = useFileSystem()
  const { threats } = useSecurity()
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [currentCode, setCurrentCode] = useState("")
  const [activePanel, setActivePanel] = useState("explorer")
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isAICommandOpen, setIsAICommandOpen] = useState(false)
  const [isTerminalVisible, setIsTerminalVisible] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [tabs, setTabs] = useState<Tab[]>([])
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })

  useAICommandShortcut(() => setIsAICommandOpen(true))

  const handleNewFile = useCallback(() => {
    console.log("New file")
  }, [])

  const handleSaveFile = useCallback(() => {
    console.log("Save file")
  }, [])

  const handleCodeInsert = useCallback(
    (code: string) => {
      if (selectedFile) {
        const newContent = currentCode + "\n\n" + code
        setCurrentCode(newContent)
        updateFileContent(selectedFile.id, newContent)

        setTabs((prevTabs) => prevTabs.map((tab) => (tab.id === selectedFile.id ? { ...tab, isDirty: true } : tab)))
      }
    },
    [selectedFile, currentCode, updateFileContent],
  )

  const handleEditorInsertCode = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent
      const { code } = customEvent.detail
      handleCodeInsert(code)
    },
    [handleCodeInsert],
  )

  const handleEditorReplaceCode = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent
      const { code } = customEvent.detail
      setCurrentCode(code)
      if (selectedFile) {
        updateFileContent(selectedFile.id, code)
      }
    },
    [selectedFile, updateFileContent],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "p":
            if (e.shiftKey) {
              e.preventDefault()
              setIsCommandPaletteOpen(true)
            }
            break
          case "`":
            e.preventDefault()
            setIsTerminalVisible((prev) => !prev)
            break
          case "n":
            e.preventDefault()
            handleNewFile()
            break
          case "s":
            e.preventDefault()
            handleSaveFile()
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleNewFile, handleSaveFile])

  useEffect(() => {
    window.addEventListener("editor:insert-code", handleEditorInsertCode)
    window.addEventListener("editor:replace-code", handleEditorReplaceCode)

    return () => {
      window.removeEventListener("editor:insert-code", handleEditorInsertCode)
      window.removeEventListener("editor:replace-code", handleEditorReplaceCode)
    }
  }, [handleEditorInsertCode, handleEditorReplaceCode])

  const handleFileSelect = useCallback((file: FileItem) => {
    setSelectedFile(file)
    setCurrentCode(file.content)

    setTabs((prevTabs) => {
      const existingTab = prevTabs.find((tab) => tab.id === file.id)
      if (existingTab) {
        return prevTabs.map((tab) => ({
          ...tab,
          isActive: tab.id === file.id,
        }))
      } else {
        const newTab: Tab = {
          id: file.id,
          name: file.name,
          path: file.path,
          isDirty: false,
          isActive: true,
          file,
        }
        return [...prevTabs.map((tab) => ({ ...tab, isActive: false })), newTab]
      }
    })
  }, [])

  const handleContentChange = useCallback(
    async (content: string) => {
      setCurrentCode(content)
      if (selectedFile) {
        await updateFileContent(selectedFile.id, content)

        setTabs((prevTabs) =>
          prevTabs.map((tab) => (tab.id === selectedFile.id ? { ...tab, isDirty: content !== tab.file.content } : tab)),
        )
      }
    },
    [selectedFile, updateFileContent],
  )

  const handleApplySuggestion = useCallback(
    (suggestedCode: string) => {
      setCurrentCode(suggestedCode)
      if (selectedFile) {
        updateFileContent(selectedFile.id, suggestedCode)
      }
    },
    [selectedFile, updateFileContent],
  )

  const handleTabClick = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId)
      if (tab) {
        handleFileSelect(tab.file)
      }
    },
    [tabs, handleFileSelect],
  )

  const handleTabClose = useCallback(
    (tabId: string) => {
      setTabs((prevTabs) => {
        const newTabs = prevTabs.filter((tab) => tab.id !== tabId)

        const closingTab = prevTabs.find((tab) => tab.id === tabId)
        if (closingTab?.isActive && newTabs.length > 0) {
          newTabs[0].isActive = true
          handleFileSelect(newTabs[0].file)
        } else if (newTabs.length === 0) {
          setSelectedFile(null)
          setCurrentCode("")
        }

        return newTabs
      })
    },
    [handleFileSelect],
  )

  const renderSidebarContent = () => {
    switch (activePanel) {
      case "explorer":
        return <FileExplorerSidebar onFileSelect={handleFileSelect} currentFileId={selectedFile?.id} />
      case "ai":
        return (
          <AIPanel
            currentCode={currentCode}
            currentLanguage={selectedFile?.language}
            onApplySuggestion={handleApplySuggestion}
          />
        )
      case "security":
        return <SecurityPanel />
      case "extensions":
        return (
          <div className="w-80 bg-sidebar border-r border-sidebar-border">
            <ExtensionManager />
          </div>
        )
      case "debug":
        return (
          <div className="w-64 bg-sidebar border-r border-sidebar-border p-4">
            <CodeExecutor code={currentCode} language={selectedFile?.language || "javascript"} />
          </div>
        )
      case "agent":
        return <AgentChatPanel />
      case "settings":
        return <SettingsPanel />
      default:
        return (
          <div className="w-64 bg-sidebar border-r border-sidebar-border p-4">
            <h3 className="text-sm font-medium text-sidebar-foreground mb-2">
              {activePanel.charAt(0).toUpperCase() + activePanel.slice(1)}
            </h3>
            <p className="text-xs text-sidebar-foreground/70">Panel content coming soon...</p>
          </div>
        )
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <div className="h-screen w-full bg-background flex flex-col">
        {/* Toolbar */}
        <Toolbar
          onNewFile={handleNewFile}
          onSaveFile={handleSaveFile}
          onCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* App Sidebar */}
          <AppSidebar activePanel={activePanel} onPanelChange={setActivePanel} />

          {/* Secondary Sidebar */}
          {activePanel === "agent" ? <AgentChatPanel /> : renderSidebarContent()}

          {/* Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Tab Bar */}
            <TabBar tabs={tabs} onTabClick={handleTabClick} onTabClose={handleTabClose} onNewTab={handleNewFile} />

            {/* Editor */}
            <div className="flex-1 relative">
              <MonacoEditor file={selectedFile} onContentChange={handleContentChange} />
            </div>

            {/* Terminal */}
            <Terminal
              isVisible={isTerminalVisible}
              onClose={() => setIsTerminalVisible(false)}
              onMinimize={() => setIsTerminalVisible(false)}
            />
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar
          currentFile={selectedFile?.name}
          language={selectedFile?.language}
          line={cursorPosition.line}
          column={cursorPosition.column}
          errors={threats.filter((t) => t.severity === "critical" || t.severity === "high").length}
          warnings={threats.filter((t) => t.severity === "medium" || t.severity === "low").length}
          isVoiceActive={isVoiceActive}
          onToggleVoice={() => setIsVoiceActive(!isVoiceActive)}
        />

        {/* Command Palette */}
        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />

        {/* AI Command Box */}
        <AICommandBox
          isOpen={isAICommandOpen}
          onClose={() => setIsAICommandOpen(false)}
          onCodeInsert={handleCodeInsert}
        />
      </div>
    </ThemeProvider>
  )
}

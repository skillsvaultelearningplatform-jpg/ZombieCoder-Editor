"use client"

import { useState, useCallback, useEffect } from "react"
import { MonacoEditor } from "@/components/monaco-editor"
import { FileExplorerSidebar } from "@/components/file-explorer-sidebar"
import { AIPanel } from "@/components/ai-panel"
import { SecurityPanel } from "@/components/security-panel"
import { CodeExecutor } from "@/components/code-executor"
import { ExtensionManager } from "@/components/extension-manager"
import { GitPanel } from "@/components/git-panel"
import { PerformancePanel } from "@/components/performance-panel"
import { AppSidebar } from "@/components/app-sidebar"
import { Toolbar } from "@/components/toolbar"
import { StatusBar } from "@/components/status-bar"
import { TabBar } from "@/components/tab-bar"
import { Terminal } from "@/components/terminal"
import { CommandPalette } from "@/components/command-palette"
import { AICommandBox } from "@/components/ai-command-box"
import { ErrorBoundary } from "@/components/error-boundary"
import { ThemeProvider } from "@/components/theme-provider"
import { type FileItem, useFileSystem } from "@/hooks/use-file-system"
// import { useSecurity } from "@/hooks/use-security"
import { useAICommandShortcut } from "@/hooks/use-keyboard-shortcuts"
import { useErrorRecovery } from "@/hooks/use-error-recovery"
import { useStabilityMonitor } from "@/hooks/use-stability-monitor"

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
  // const { threats } = useSecurity()
  const threats: any[] = []
  const { logError, attemptRecovery } = useErrorRecovery()
  const { reportError, isStable } = useStabilityMonitor()
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
    try {
      console.log("[v0] Creating new file")
      // File creation logic here
    } catch (error) {
      const errorId = logError(error as Error, "handleNewFile")
      reportError()
      attemptRecovery(errorId, () => {
        console.log("[v0] Retrying file creation")
      })
    }
  }, [logError, reportError, attemptRecovery])

  const handleSaveFile = useCallback(() => {
    try {
      console.log("[v0] Saving file")
      // File saving logic here
    } catch (error) {
      const errorId = logError(error as Error, "handleSaveFile")
      reportError()
      attemptRecovery(errorId, () => {
        console.log("[v0] Retrying file save")
      })
    }
  }, [logError, reportError, attemptRecovery])

  const handleCodeInsert = useCallback(
    (code: string) => {
      try {
        if (selectedFile) {
          const newContent = currentCode + "\n\n" + code
          setCurrentCode(newContent)
          updateFileContent(selectedFile.id, newContent)

          setTabs((prevTabs) => prevTabs.map((tab) => (tab.id === selectedFile.id ? { ...tab, isDirty: true } : tab)))
        }
      } catch (error) {
        const errorId = logError(error as Error, "handleCodeInsert")
        reportError()
        attemptRecovery(errorId, () => {
          console.log("[v0] Retrying code insertion")
        })
      }
    },
    [selectedFile, currentCode, updateFileContent, logError, reportError, attemptRecovery],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      try {
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
      } catch (error) {
        const errorId = logError(error as Error, "keyboard shortcuts")
        reportError()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleNewFile, handleSaveFile, logError, reportError])

  const handleFileSelect = useCallback(
    (file: FileItem) => {
      try {
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
      } catch (error) {
        const errorId = logError(error as Error, "handleFileSelect")
        reportError()
        attemptRecovery(errorId, () => {
          console.log("[v0] Retrying file selection")
        })
      }
    },
    [logError, reportError, attemptRecovery],
  )

  const handleContentChange = useCallback(
    async (content: string) => {
      try {
        setCurrentCode(content)
        if (selectedFile) {
          await updateFileContent(selectedFile.id, content)

          setTabs((prevTabs) =>
            prevTabs.map((tab) =>
              tab.id === selectedFile.id ? { ...tab, isDirty: content !== tab.file.content } : tab,
            ),
          )
        }
      } catch (error) {
        const errorId = logError(error as Error, "handleContentChange")
        reportError()
        attemptRecovery(errorId, async () => {
          console.log("[v0] Retrying content change")
          if (selectedFile) {
            await updateFileContent(selectedFile.id, content)
          }
        })
      }
    },
    [selectedFile, updateFileContent, logError, reportError, attemptRecovery],
  )

  const handleApplySuggestion = useCallback(
    (suggestedCode: string) => {
      try {
        setCurrentCode(suggestedCode)
        if (selectedFile) {
          updateFileContent(selectedFile.id, suggestedCode)
        }
      } catch (error) {
        const errorId = logError(error as Error, "handleApplySuggestion")
        reportError()
        attemptRecovery(errorId, () => {
          console.log("[v0] Retrying suggestion application")
        })
      }
    },
    [selectedFile, updateFileContent, logError, reportError, attemptRecovery],
  )

  const handleTabClick = useCallback(
    (tabId: string) => {
      try {
        const tab = tabs.find((t) => t.id === tabId)
        if (tab) {
          handleFileSelect(tab.file)
        }
      } catch (error) {
        const errorId = logError(error as Error, "handleTabClick")
        reportError()
      }
    },
    [tabs, handleFileSelect, logError, reportError],
  )

  const handleTabClose = useCallback(
    (tabId: string) => {
      try {
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
      } catch (error) {
        const errorId = logError(error as Error, "handleTabClose")
        reportError()
      }
    },
    [handleFileSelect, logError, reportError],
  )

  const renderSidebarContent = () => {
    try {
      switch (activePanel) {
        case "explorer":
          return <FileExplorerSidebar onFileSelect={handleFileSelect} currentFileId={selectedFile?.id} />
        case "git":
          return <GitPanel />
        case "performance":
          return <PerformancePanel />
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
    } catch (error) {
      const errorId = logError(error as Error, "renderSidebarContent")
      reportError()
      return (
        <div className="w-64 bg-sidebar border-r border-sidebar-border p-4">
          <p className="text-sm text-destructive">Error loading panel</p>
        </div>
      )
    }
  }

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <div className="h-screen w-full bg-background flex flex-col">
          {!isStable && (
            <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2">
              <p className="text-sm text-yellow-400">
                System stability issues detected. Some features may be temporarily unavailable.
              </p>
            </div>
          )}

          {/* Toolbar */}
          <ErrorBoundary>
            <Toolbar
              onNewFile={handleNewFile}
              onSaveFile={handleSaveFile}
              onCommandPalette={() => setIsCommandPaletteOpen(true)}
            />
          </ErrorBoundary>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* App Sidebar */}
            <ErrorBoundary>
              <AppSidebar activePanel={activePanel} onPanelChange={setActivePanel} />
            </ErrorBoundary>

            {/* Secondary Sidebar */}
            <ErrorBoundary>{renderSidebarContent()}</ErrorBoundary>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col">
              {/* Tab Bar */}
              <ErrorBoundary>
                <TabBar tabs={tabs} onTabClick={handleTabClick} onTabClose={handleTabClose} onNewTab={handleNewFile} />
              </ErrorBoundary>

              {/* Editor */}
              <div className="flex-1 relative">
                <ErrorBoundary>
                  <MonacoEditor file={selectedFile} onContentChange={handleContentChange} />
                </ErrorBoundary>
              </div>

              {/* Terminal */}
              <ErrorBoundary>
                <Terminal
                  isVisible={isTerminalVisible}
                  onClose={() => setIsTerminalVisible(false)}
                  onMinimize={() => setIsTerminalVisible(false)}
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Status Bar */}
          <ErrorBoundary>
            <StatusBar
              currentFile={selectedFile?.name}
              language={selectedFile?.language}
              line={cursorPosition.line}
              column={cursorPosition.column}
              errors={0}
              warnings={0}
              isVoiceActive={isVoiceActive}
              onToggleVoice={() => setIsVoiceActive(!isVoiceActive)}
            />
          </ErrorBoundary>

          {/* Command Palette */}
          <ErrorBoundary>
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
          </ErrorBoundary>

          {/* AI Command Box */}
          <ErrorBoundary>
            <AICommandBox
              isOpen={isAICommandOpen}
              onClose={() => setIsAICommandOpen(false)}
              onCodeInsert={handleCodeInsert}
            />
          </ErrorBoundary>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

"use client"

import { useState, useCallback } from "react"
import { type FileItem, useFileSystem } from "@/hooks/use-file-system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { File, Plus, Search, Save, Trash2 } from "lucide-react"

interface FileExplorerSidebarProps {
  onFileSelect: (file: FileItem) => void
  currentFileId?: string
}

export function FileExplorerSidebar({ onFileSelect, currentFileId }: FileExplorerSidebarProps) {
  const { files, createFile, deleteFile, createSnapshot } = useFileSystem()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [newFileName, setNewFileName] = useState("")

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCreateFile = useCallback(async () => {
    if (!newFileName.trim()) return

    try {
      const file = await createFile(newFileName, `/${newFileName}`)
      onFileSelect(file)
      setNewFileName("")
      setIsCreatingFile(false)
    } catch (error) {
      console.error("Failed to create file:", error)
    }
  }, [newFileName, createFile, onFileSelect])

  const handleDeleteFile = useCallback(
    async (fileId: string, fileName: string) => {
      if (confirm(`Are you sure you want to delete ${fileName}?`)) {
        try {
          await deleteFile(fileId)
        } catch (error) {
          console.error("Failed to delete file:", error)
        }
      }
    },
    [deleteFile],
  )

  const handleCreateSnapshot = useCallback(async () => {
    const name = prompt("Enter snapshot name:")
    if (name) {
      try {
        await createSnapshot(name)
        alert("Snapshot created successfully!")
      } catch (error) {
        console.error("Failed to create snapshot:", error)
      }
    }
  }, [createSnapshot])

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-sidebar-foreground">Explorer</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setIsCreatingFile(true)} className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCreateSnapshot} className="h-6 w-6 p-0">
              <Save className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-sidebar-foreground/50" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-7 text-xs bg-sidebar-accent border-sidebar-border"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto p-2">
        {isCreatingFile && (
          <div className="mb-2 px-2">
            <Input
              placeholder="Enter file name..."
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFile()
                if (e.key === "Escape") {
                  setIsCreatingFile(false)
                  setNewFileName("")
                }
              }}
              className="h-6 text-xs"
              autoFocus
            />
          </div>
        )}

        {filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-sidebar-foreground/50 text-xs">
            {searchQuery ? "No files found" : "No files yet"}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredFiles.map((file) => (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger>
                  <div
                    className={`flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer hover:bg-sidebar-accent ${
                      currentFileId === file.id ? "bg-sidebar-accent" : ""
                    }`}
                    onClick={() => onFileSelect(file)}
                  >
                    <File className="h-3 w-3 text-sidebar-foreground/70" />
                    <span className="flex-1 truncate text-sidebar-foreground">{file.name}</span>
                    <span className="text-sidebar-foreground/50 text-xs">{file.language}</span>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => onFileSelect(file)}>Open</ContextMenuItem>
                  <ContextMenuItem onClick={() => handleDeleteFile(file.id, file.name)} className="text-destructive">
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-2 border-t border-sidebar-border text-xs text-sidebar-foreground/50">
        {files.length} files • Offline Ready
      </div>
    </div>
  )
}

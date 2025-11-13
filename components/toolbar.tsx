"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { File, Save, FolderOpen, Undo, Redo, Search, Play, Square, Settings, Palette } from "lucide-react"

interface ToolbarProps {
  onNewFile?: () => void
  onSaveFile?: () => void
  onOpenFile?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onSearch?: () => void
  onRun?: () => void
  onStop?: () => void
  onSettings?: () => void
  onCommandPalette?: () => void
}

export function Toolbar({
  onNewFile,
  onSaveFile,
  onOpenFile,
  onUndo,
  onRedo,
  onSearch,
  onRun,
  onStop,
  onSettings,
  onCommandPalette,
}: ToolbarProps) {
  return (
    <div className="h-10 bg-card border-b border-border flex items-center px-2 gap-1">
      {/* File Operations */}
      <Button variant="ghost" size="sm" onClick={onNewFile} className="h-8 w-8 p-0">
        <File className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onOpenFile} className="h-8 w-8 p-0">
        <FolderOpen className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onSaveFile} className="h-8 w-8 p-0">
        <Save className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Edit Operations */}
      <Button variant="ghost" size="sm" onClick={onUndo} className="h-8 w-8 p-0">
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onRedo} className="h-8 w-8 p-0">
        <Redo className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Search */}
      <Button variant="ghost" size="sm" onClick={onSearch} className="h-8 w-8 p-0">
        <Search className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Run Controls */}
      <Button variant="ghost" size="sm" onClick={onRun} className="h-8 w-8 p-0">
        <Play className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onStop} className="h-8 w-8 p-0">
        <Square className="h-4 w-4" />
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Side Controls */}
      <Button variant="ghost" size="sm" onClick={onCommandPalette} className="h-8 w-8 p-0">
        <Palette className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onSettings} className="h-8 w-8 p-0">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )
}

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitBranch, AlertTriangle, CheckCircle, Wifi, WifiOff, Mic, MicOff } from "lucide-react"

interface StatusBarProps {
  currentFile?: string
  language?: string
  line?: number
  column?: number
  errors?: number
  warnings?: number
  isOnline?: boolean
  isVoiceActive?: boolean
  gitBranch?: string
  onToggleVoice?: () => void
  onGitClick?: () => void
}

export function StatusBar({
  currentFile,
  language = "javascript",
  line = 1,
  column = 1,
  errors = 0,
  warnings = 0,
  isOnline = false,
  isVoiceActive = false,
  gitBranch = "main",
  onToggleVoice,
  onGitClick,
}: StatusBarProps) {
  return (
    <div className="h-6 bg-card border-t border-border flex items-center px-2 text-xs">
      {/* Left Side */}
      <div className="flex items-center gap-2">
        {/* Online/Offline Status */}
        <div className="flex items-center gap-1">
          {isOnline ? (
            <Wifi className="h-3 w-3 text-green-500" />
          ) : (
            <WifiOff className="h-3 w-3 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">{isOnline ? "Online" : "Offline"}</span>
        </div>

        {/* Git Branch */}
        <Button variant="ghost" size="sm" onClick={onGitClick} className="h-5 px-2 text-xs">
          <GitBranch className="h-3 w-3 mr-1" />
          {gitBranch}
        </Button>

        {/* Errors and Warnings */}
        {errors > 0 && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-destructive" />
            <span className="text-destructive">{errors}</span>
          </div>
        )}
        {warnings > 0 && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-yellow-500" />
            <span className="text-yellow-500">{warnings}</span>
          </div>
        )}
        {errors === 0 && warnings === 0 && (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-green-500">No Issues</span>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Voice Status */}
        <Button variant="ghost" size="sm" onClick={onToggleVoice} className="h-5 px-2 text-xs">
          {isVoiceActive ? (
            <Mic className="h-3 w-3 mr-1 text-primary" />
          ) : (
            <MicOff className="h-3 w-3 mr-1 text-muted-foreground" />
          )}
          Voice
        </Button>

        {/* Current Position */}
        <span className="text-muted-foreground">
          Ln {line}, Col {column}
        </span>

        {/* Language */}
        <Badge variant="secondary" className="text-xs">
          {language.toUpperCase()}
        </Badge>

        {/* Current File */}
        {currentFile && <span className="text-muted-foreground truncate max-w-32">{currentFile}</span>}

        {/* ZombieCoder Branding */}
        <span className="text-primary font-medium">আমি নিজে বানাইছি</span>
      </div>
    </div>
  )
}

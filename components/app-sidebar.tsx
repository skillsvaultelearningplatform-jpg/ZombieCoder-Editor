"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Files,
  Search,
  GitBranch,
  Bug,
  ExpandIcon as Extension,
  Settings,
  Bot,
  TerminalIcon,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

interface AppSidebarProps {
  activePanel: string
  onPanelChange: (panel: string) => void
}

export function AppSidebar({ activePanel, onPanelChange }: AppSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const sidebarItems = [
    { id: "explorer", icon: Files, label: "Explorer" },
    { id: "search", icon: Search, label: "Search" },
    { id: "git", icon: GitBranch, label: "Source Control" },
    { id: "debug", icon: Bug, label: "Debug & Execute" },
    { id: "extensions", icon: Extension, label: "Extensions" },
    { id: "ai", icon: Bot, label: "AI Assistant" },
    { id: "security", icon: Shield, label: "Security Center" },
    { id: "performance", icon: Activity, label: "Performance Monitor" },
    { id: "terminal", icon: TerminalIcon, label: "Terminal" },
  ]

  return (
    <div
      className={`${isExpanded ? "w-48" : "w-12"} bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200`}
    >
      <div className="flex items-center justify-between p-2 border-b border-sidebar-border">
        {isExpanded && (
          <span className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wide">ZombieCoder</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-6 h-6 p-0 text-sidebar-foreground/70 hover:text-sidebar-foreground"
        >
          {isExpanded ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-2">
        {sidebarItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => onPanelChange(item.id)}
            className={`${isExpanded ? "w-full justify-start px-3 h-8 mb-1" : "w-10 h-10 p-0 mx-1 mb-1"} ${
              activePanel === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
            title={!isExpanded ? item.label : undefined}
          >
            <item.icon className="h-4 w-4" />
            {isExpanded && <span className="ml-3 text-sm font-medium">{item.label}</span>}
          </Button>
        ))}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Bottom Actions */}
      <div className="py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPanelChange("settings")}
          className={`${isExpanded ? "w-full justify-start px-3 h-8" : "w-10 h-10 p-0 mx-1"} ${
            activePanel === "settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          }`}
          title={!isExpanded ? "Settings" : undefined}
        >
          <Settings className="h-4 w-4" />
          {isExpanded && <span className="ml-3 text-sm font-medium">Settings</span>}
        </Button>
      </div>
    </div>
  )
}

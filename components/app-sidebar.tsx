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
} from "lucide-react"

interface AppSidebarProps {
  activePanel: string
  onPanelChange: (panel: string) => void
}

export function AppSidebar({ activePanel, onPanelChange }: AppSidebarProps) {
  const sidebarItems = [
    { id: "explorer", icon: Files, label: "Explorer" },
    { id: "search", icon: Search, label: "Search" },
    { id: "git", icon: GitBranch, label: "Source Control" },
    { id: "debug", icon: Bug, label: "Debug & Execute" },
    { id: "extensions", icon: Extension, label: "Extensions" },
    { id: "ai", icon: Bot, label: "AI Assistant" },
    { id: "security", icon: Shield, label: "Security Center" },
    { id: "terminal", icon: TerminalIcon, label: "Terminal" },
  ]

  return (
    <div className="w-12 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Main Navigation */}
      <div className="flex-1 py-2">
        {sidebarItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => onPanelChange(item.id)}
            className={`w-10 h-10 p-0 mx-1 mb-1 ${
              activePanel === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
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
          className={`w-10 h-10 p-0 mx-1 ${
            activePanel === "settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          }`}
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { X, File, Circle } from "lucide-react"

interface Tab {
  id: string
  name: string
  path: string
  isDirty: boolean
  isActive: boolean
}

interface TabBarProps {
  tabs: Tab[]
  onTabClick?: (tabId: string) => void
  onTabClose?: (tabId: string) => void
  onNewTab?: () => void
}

export function TabBar({ tabs, onTabClick, onTabClose, onNewTab }: TabBarProps) {
  const [draggedTab, setDraggedTab] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTab(tabId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault()
    if (draggedTab && draggedTab !== targetTabId) {
      // Handle tab reordering logic here
      console.log(`Move tab ${draggedTab} to position of ${targetTabId}`)
    }
    setDraggedTab(null)
  }

  return (
    <div className="h-9 bg-card border-b border-border flex items-center">
      <ScrollArea className="flex-1">
        <div className="flex items-center">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`group relative flex items-center gap-2 px-3 py-1.5 border-r border-border cursor-pointer transition-colors min-w-0 ${
                tab.isActive ? "bg-background text-foreground" : "hover:bg-accent/50 text-muted-foreground"
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, tab.id)}
              onClick={() => onTabClick?.(tab.id)}
            >
              <File className="h-3 w-3 flex-shrink-0" />
              <span className="text-xs truncate max-w-32">{tab.name}</span>
              {tab.isDirty && <Circle className="h-2 w-2 fill-current flex-shrink-0" />}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose?.(tab.id)
                }}
                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* New Tab Button */}
      <Button variant="ghost" size="sm" onClick={onNewTab} className="h-8 w-8 p-0 flex-shrink-0 mx-1">
        <File className="h-4 w-4" />
      </Button>
    </div>
  )
}

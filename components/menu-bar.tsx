"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MenuBarProps {
  onMenuAction: (action: string) => void
}

export function MenuBar({ onMenuAction }: MenuBarProps) {
  const menuItems = [
    {
      label: "File",
      items: [
        { label: "New File", action: "file.new", shortcut: "Ctrl+N" },
        { label: "Open File", action: "file.open", shortcut: "Ctrl+O" },
        { label: "Save", action: "file.save", shortcut: "Ctrl+S" },
        { label: "Save As", action: "file.saveAs", shortcut: "Ctrl+Shift+S" },
        { separator: true },
        { label: "Close File", action: "file.close", shortcut: "Ctrl+W" },
        { label: "Close All", action: "file.closeAll", shortcut: "Ctrl+Shift+W" },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Undo", action: "edit.undo", shortcut: "Ctrl+Z" },
        { label: "Redo", action: "edit.redo", shortcut: "Ctrl+Y" },
        { separator: true },
        { label: "Cut", action: "edit.cut", shortcut: "Ctrl+X" },
        { label: "Copy", action: "edit.copy", shortcut: "Ctrl+C" },
        { label: "Paste", action: "edit.paste", shortcut: "Ctrl+V" },
        { separator: true },
        { label: "Find", action: "edit.find", shortcut: "Ctrl+F" },
        { label: "Replace", action: "edit.replace", shortcut: "Ctrl+H" },
        { label: "Find in Files", action: "edit.findInFiles", shortcut: "Ctrl+Shift+F" },
      ],
    },
    {
      label: "View",
      items: [
        { label: "Command Palette", action: "view.commandPalette", shortcut: "Ctrl+Shift+P" },
        { label: "Explorer", action: "view.explorer", shortcut: "Ctrl+Shift+E" },
        { label: "Search", action: "view.search", shortcut: "Ctrl+Shift+F" },
        { label: "Source Control", action: "view.git", shortcut: "Ctrl+Shift+G" },
        { label: "Terminal", action: "view.terminal", shortcut: "Ctrl+`" },
        { separator: true },
        { label: "Toggle Sidebar", action: "view.toggleSidebar", shortcut: "Ctrl+B" },
        { label: "Toggle Minimap", action: "view.toggleMinimap" },
        { label: "Zen Mode", action: "view.zenMode", shortcut: "Ctrl+K Z" },
      ],
    },
    {
      label: "Go",
      items: [
        { label: "Go to File", action: "go.toFile", shortcut: "Ctrl+P" },
        { label: "Go to Line", action: "go.toLine", shortcut: "Ctrl+G" },
        { label: "Go to Symbol", action: "go.toSymbol", shortcut: "Ctrl+Shift+O" },
        { separator: true },
        { label: "Back", action: "go.back", shortcut: "Alt+Left" },
        { label: "Forward", action: "go.forward", shortcut: "Alt+Right" },
      ],
    },
    {
      label: "Run",
      items: [
        { label: "Run Code", action: "run.code", shortcut: "F5" },
        { label: "Debug Code", action: "run.debug", shortcut: "Ctrl+F5" },
        { label: "Stop", action: "run.stop", shortcut: "Shift+F5" },
        { separator: true },
        { label: "Run Task", action: "run.task", shortcut: "Ctrl+Shift+P" },
      ],
    },
    {
      label: "Terminal",
      items: [
        { label: "New Terminal", action: "terminal.new", shortcut: "Ctrl+Shift+`" },
        { label: "Split Terminal", action: "terminal.split", shortcut: "Ctrl+Shift+5" },
        { label: "Kill Terminal", action: "terminal.kill" },
        { separator: true },
        { label: "Clear Terminal", action: "terminal.clear", shortcut: "Ctrl+K" },
      ],
    },
    {
      label: "Help",
      items: [
        { label: "Welcome", action: "help.welcome" },
        { label: "Documentation", action: "help.docs" },
        { label: "Keyboard Shortcuts", action: "help.shortcuts", shortcut: "Ctrl+K Ctrl+S" },
        { separator: true },
        { label: "About", action: "help.about" },
      ],
    },
  ]

  return (
    <div className="h-8 bg-background border-b border-border flex items-center px-2 text-sm">
      <div className="flex items-center space-x-1">
        <span className="text-xs font-semibold text-foreground/70 px-2">ZombieCoder</span>
        {menuItems.map((menu) => (
          <DropdownMenu key={menu.label}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs font-normal hover:bg-accent">
                {menu.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {menu.items.map((item, index) => {
                if (item.separator) {
                  return <DropdownMenuSeparator key={index} />
                }
                return (
                  <DropdownMenuItem key={item.action} onClick={() => onMenuAction(item.action)} className="text-sm">
                    {item.label}
                    {item.shortcut && <DropdownMenuShortcut className="text-xs">{item.shortcut}</DropdownMenuShortcut>}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </div>
  )
}

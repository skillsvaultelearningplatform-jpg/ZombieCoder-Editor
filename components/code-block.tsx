"use client"

import type { CodeBlock as ICodeBlock } from "@/types/agent"
import { useCodeEditor } from "@/hooks/use-code-editor"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface CodeBlockProps {
  block: ICodeBlock
  onInsert?: (code: string) => void
  onReplace?: (code: string) => void
}

export function CodeBlock({ block, onInsert, onReplace }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const { insertCode, replaceSelection } = useCodeEditor()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(block.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInsert = () => {
    if (onInsert) {
      onInsert(block.code)
    } else {
      insertCode(block.code)
    }
  }

  const handleReplace = () => {
    if (onReplace) {
      onReplace(block.code)
    } else {
      replaceSelection(block.code)
    }
  }

  return (
    <div className="bg-[#2d2d2d] border border-[#333333] rounded-lg overflow-hidden my-2">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#333333]">
        <span className="text-xs text-[#888888] font-mono">{block.language}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={handleInsert} className="text-xs h-6 px-2">
            Insert
          </Button>
          <Button size="sm" variant="ghost" onClick={handleReplace} className="text-xs h-6 px-2">
            Replace
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCopy} className="text-xs h-6 px-2 gap-1">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-[#cccccc] font-mono">{block.code}</code>
      </pre>
    </div>
  )
}

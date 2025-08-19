"use client"

import { useEffect, useRef, useState } from "react"
import * as monaco from "monaco-editor"
import type { FileItem } from "@/hooks/use-file-system"

interface MonacoEditorProps {
  file?: FileItem | null
  onContentChange?: (content: string) => void
}

export function MonacoEditor({ file, onContentChange }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!editorRef.current) return

    // Configure Monaco Editor
    monaco.editor.defineTheme("zombiecoder-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A737D", fontStyle: "italic" },
        { token: "keyword", foreground: "F97583" },
        { token: "string", foreground: "9ECBFF" },
        { token: "number", foreground: "79B8FF" },
        { token: "type", foreground: "B392F0" },
        { token: "function", foreground: "B392F0" },
        { token: "variable", foreground: "E1E4E8" },
      ],
      colors: {
        "editor.background": "#0d1117",
        "editor.foreground": "#e1e4e8",
        "editor.lineHighlightBackground": "#161b22",
        "editor.selectionBackground": "#264f78",
        "editor.inactiveSelectionBackground": "#3a3d41",
        "editorCursor.foreground": "#e1e4e8",
        "editorWhitespace.foreground": "#484f58",
      },
    })

    const initialContent =
      file?.content ||
      `// Welcome to ZombieCoder Editor
// বাংলাদেশের তরুণদের জন্য তৈরি - "আমি নিজে বানাইছি"

function helloZombieCoder() {
  console.log("Hello from ZombieCoder!");
  console.log("আমি নিজে বানাইছি!");
}

// Multi-language support
const languages = {
  javascript: "JavaScript/TypeScript",
  python: "Python",
  html: "HTML/CSS",
  react: "React/JSX",
  php: "PHP"
};

helloZombieCoder();`

    // Create editor instance
    const editor = monaco.editor.create(editorRef.current, {
      value: initialContent,
      language: file?.language || "javascript",
      theme: "zombiecoder-dark",
      fontSize: 14,
      fontFamily: "var(--font-mono)",
      lineNumbers: "on",
      roundedSelection: false,
      scrollBeyondLastLine: false,
      minimap: { enabled: true },
      automaticLayout: true,
      wordWrap: "on",
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showVariables: true,
      },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
      },
    })

    monacoRef.current = editor
    setIsLoading(false)

    const disposable = editor.onDidChangeModelContent(() => {
      const content = editor.getValue()
      onContentChange?.(content)
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      console.log("Save triggered")
      // File saving is now handled by parent component
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO, () => {
      console.log("Open triggered")
      // File opening is now handled by parent component
    })

    // Cleanup
    return () => {
      disposable.dispose()
      editor.dispose()
    }
  }, [])

  useEffect(() => {
    if (monacoRef.current && file) {
      const editor = monacoRef.current
      const currentContent = editor.getValue()

      if (currentContent !== file.content) {
        editor.setValue(file.content)
      }

      // Update language
      const model = editor.getModel()
      if (model && file.language) {
        monaco.editor.setModelLanguage(model, file.language)
      }
    }
  }, [file])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ZombieCoder Editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <div ref={editorRef} className="h-full w-full" />
    </div>
  )
}

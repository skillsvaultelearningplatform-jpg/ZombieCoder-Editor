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

    monaco.editor.defineTheme("zombiecoder-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A737D", fontStyle: "italic" },
        { token: "keyword", foreground: "F97583", fontStyle: "bold" },
        { token: "string", foreground: "9ECBFF" },
        { token: "number", foreground: "79B8FF" },
        { token: "type", foreground: "B392F0", fontStyle: "bold" },
        { token: "function", foreground: "B392F0" },
        { token: "variable", foreground: "E1E4E8" },
        { token: "constant", foreground: "79B8FF", fontStyle: "bold" },
        { token: "class", foreground: "FFAB70", fontStyle: "bold" },
        { token: "interface", foreground: "7C3AED", fontStyle: "bold" },
        { token: "namespace", foreground: "F97583" },
        { token: "operator", foreground: "F97583" },
        { token: "tag", foreground: "85E89D" },
        { token: "attribute.name", foreground: "FFAB70" },
        { token: "attribute.value", foreground: "9ECBFF" },
      ],
      colors: {
        "editor.background": "#0d1117",
        "editor.foreground": "#e1e4e8",
        "editor.lineHighlightBackground": "#161b22",
        "editor.selectionBackground": "#264f78",
        "editor.inactiveSelectionBackground": "#3a3d41",
        "editorCursor.foreground": "#e1e4e8",
        "editorWhitespace.foreground": "#484f58",
        "editorLineNumber.foreground": "#6e7681",
        "editorLineNumber.activeForeground": "#f0f6fc",
        "editor.selectionHighlightBackground": "#3fb95040",
        "editor.wordHighlightBackground": "#3fb95040",
        "editor.findMatchBackground": "#ffd33d44",
        "editor.findMatchHighlightBackground": "#ffd33d22",
        "editorBracketMatch.background": "#3fb95040",
        "editorBracketMatch.border": "#3fb950",
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

    const editor = monaco.editor.create(editorRef.current, {
      value: initialContent,
      language: file?.language || "javascript",
      theme: "zombiecoder-dark",
      fontSize: 14,
      fontFamily: "var(--font-mono)",
      lineNumbers: "on",
      roundedSelection: false,
      scrollBeyondLastLine: false,
      minimap: {
        enabled: true,
        side: "right",
        showSlider: "always",
        renderCharacters: true,
        maxColumn: 120,
        scale: 1,
      },
      automaticLayout: true,
      wordWrap: "on",
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        bracketPairsHorizontal: true,
        highlightActiveBracketPair: true,
        indentation: true,
        highlightActiveIndentation: true,
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showVariables: true,
        showClasses: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showMethods: true,
        showConstructors: true,
        showEnums: true,
        showConstants: true,
        showStructs: true,
        showEvents: true,
        showOperators: true,
        showTypeParameters: true,
        showValues: true,
        showUnits: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showWords: true,
        showIssues: true,
        showUsers: true,
        insertMode: "replace",
        filterGraceful: true,
        snippetsPreventQuickSuggestions: false,
      },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
      },
      quickSuggestionsDelay: 100,
      parameterHints: {
        enabled: true,
        cycle: true,
      },
      autoIndent: "full",
      formatOnPaste: true,
      formatOnType: true,
      tabCompletion: "on",
      wordBasedSuggestions: "allDocuments",
      semanticHighlighting: {
        enabled: true,
      },
      occurrencesHighlight: "singleFile",
      selectionHighlight: true,
      codeLens: true,
      folding: true,
      foldingStrategy: "indentation",
      showFoldingControls: "always",
      unfoldOnClickAfterEndOfLine: true,
      lightbulb: {
        enabled: "on",
      },
      hover: {
        enabled: true,
        delay: 300,
        sticky: true,
      },
      links: true,
      colorDecorators: true,
      contextmenu: true,
      mouseWheelZoom: true,
      multiCursorModifier: "ctrlCmd",
      accessibilitySupport: "auto",
      find: {
        cursorMoveOnType: true,
        seedSearchStringFromSelection: "always",
        autoFindInSelection: "never",
        addExtraSpaceOnTop: true,
        loop: true,
      },
    })

    monacoRef.current = editor
    setIsLoading(false)

    const disposable = editor.onDidChangeModelContent(() => {
      const content = editor.getValue()
      onContentChange?.(content)
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      console.log("Save triggered")
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO, () => {
      console.log("Open triggered")
    })

    // Additional VS Code-like shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyL, () => {
      editor.getAction("editor.action.selectHighlights")?.run()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      editor.getAction("editor.action.commentLine")?.run()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyA, () => {
      editor.getAction("editor.action.blockComment")?.run()
    })

    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.UpArrow, () => {
      editor.getAction("editor.action.moveLinesUpAction")?.run()
    })

    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => {
      editor.getAction("editor.action.moveLinesDownAction")?.run()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      editor.getAction("editor.action.deleteLines")?.run()
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
          <p className="text-xs text-muted-foreground mt-2">Enhanced with VS Code features</p>
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

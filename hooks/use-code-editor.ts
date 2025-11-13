"use client"

import { useRef, useCallback } from "react"
import { CodeActions } from "@/lib/code-actions"

export function useCodeEditor() {
  const editorRef = useRef<any>(null)

  const setEditor = useCallback((editor: any) => {
    editorRef.current = editor
  }, [])

  const insertCode = useCallback((code: string) => {
    CodeActions.insertCode(code, editorRef.current)
  }, [])

  const replaceSelection = useCallback((code: string) => {
    CodeActions.replaceSelection(code, editorRef.current)
  }, [])

  const createFile = useCallback((filename: string, code: string) => {
    CodeActions.createFile(filename, code)
  }, [])

  return {
    setEditor,
    insertCode,
    replaceSelection,
    createFile,
  }
}

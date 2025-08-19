"use client"

import { useRef, useCallback } from "react"
import type * as monaco from "monaco-editor"

export function useMonaco() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const setEditor = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }, [])

  const getValue = useCallback(() => {
    return editorRef.current?.getValue() || ""
  }, [])

  const setValue = useCallback((value: string) => {
    editorRef.current?.setValue(value)
  }, [])

  const insertText = useCallback((text: string) => {
    const editor = editorRef.current
    if (!editor) return

    const selection = editor.getSelection()
    if (selection) {
      editor.executeEdits("", [
        {
          range: selection,
          text: text,
          forceMoveMarkers: true,
        },
      ])
    }
  }, [])

  const formatCode = useCallback(() => {
    editorRef.current?.getAction("editor.action.formatDocument")?.run()
  }, [])

  const undo = useCallback(() => {
    editorRef.current?.trigger("keyboard", "undo", null)
  }, [])

  const redo = useCallback(() => {
    editorRef.current?.trigger("keyboard", "redo", null)
  }, [])

  const selectAll = useCallback(() => {
    editorRef.current?.trigger("keyboard", "editor.action.selectAll", null)
  }, [])

  const findAndReplace = useCallback(() => {
    editorRef.current?.getAction("editor.action.startFindReplaceAction")?.run()
  }, [])

  return {
    setEditor,
    getValue,
    setValue,
    insertText,
    formatCode,
    undo,
    redo,
    selectAll,
    findAndReplace,
  }
}

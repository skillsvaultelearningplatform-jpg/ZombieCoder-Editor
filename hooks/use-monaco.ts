"use client"

import { useRef, useCallback } from "react"
import * as monaco from "monaco-editor"

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

  const toggleMinimap = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return

    const currentOptions = editor.getOptions()
    const minimapEnabled = currentOptions.get(monaco.editor.EditorOption.minimap).enabled

    editor.updateOptions({
      minimap: { enabled: !minimapEnabled },
    })
  }, [])

  const toggleWordWrap = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return

    const currentOptions = editor.getOptions()
    const currentWrap = currentOptions.get(monaco.editor.EditorOption.wordWrap)

    editor.updateOptions({
      wordWrap: currentWrap === "on" ? "off" : "on",
    })
  }, [])

  const changeFontSize = useCallback((delta: number) => {
    const editor = editorRef.current
    if (!editor) return

    const currentOptions = editor.getOptions()
    const currentSize = currentOptions.get(monaco.editor.EditorOption.fontSize)
    const newSize = Math.max(8, Math.min(72, currentSize + delta))

    editor.updateOptions({
      fontSize: newSize,
    })
  }, [])

  const goToLine = useCallback((lineNumber: number) => {
    const editor = editorRef.current
    if (!editor) return

    editor.setPosition({ lineNumber, column: 1 })
    editor.revealLineInCenter(lineNumber)
  }, [])

  const duplicateLine = useCallback(() => {
    editorRef.current?.getAction("editor.action.copyLinesDownAction")?.run()
  }, [])

  const moveLinesUp = useCallback(() => {
    editorRef.current?.getAction("editor.action.moveLinesUpAction")?.run()
  }, [])

  const moveLinesDown = useCallback(() => {
    editorRef.current?.getAction("editor.action.moveLinesDownAction")?.run()
  }, [])

  const commentLine = useCallback(() => {
    editorRef.current?.getAction("editor.action.commentLine")?.run()
  }, [])

  const blockComment = useCallback(() => {
    editorRef.current?.getAction("editor.action.blockComment")?.run()
  }, [])

  const foldAll = useCallback(() => {
    editorRef.current?.getAction("editor.foldAll")?.run()
  }, [])

  const unfoldAll = useCallback(() => {
    editorRef.current?.getAction("editor.unfoldAll")?.run()
  }, [])

  const showCommandPalette = useCallback(() => {
    editorRef.current?.getAction("editor.action.quickCommand")?.run()
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
    toggleMinimap,
    toggleWordWrap,
    changeFontSize,
    goToLine,
    duplicateLine,
    moveLinesUp,
    moveLinesDown,
    commentLine,
    blockComment,
    foldAll,
    unfoldAll,
    showCommandPalette,
  }
}

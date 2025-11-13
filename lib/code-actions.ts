export class CodeActions {
  // Insert code at current position
  static insertCode(code: string, editor: any): void {
    if (!editor) return

    const position = editor.getPosition()
    if (!position) return

    editor.executeEdits("agent-insert", [
      {
        range: new (window as any).monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column,
        ),
        text: code,
      },
    ])
  }

  // Replace selected text
  static replaceSelection(code: string, editor: any): void {
    if (!editor) return

    const selection = editor.getSelection()
    if (!selection) return

    editor.executeEdits("agent-replace", [
      {
        range: selection,
        text: code,
      },
    ])
  }

  // Create new file
  static createFile(filename: string, code: string): void {
    window.dispatchEvent(
      new CustomEvent("create-file", {
        detail: { filename, content: code },
      }),
    )
  }
}

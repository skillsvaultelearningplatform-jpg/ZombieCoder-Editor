import type { CodeBlock } from "@/types/agent"

export class MarkdownRenderer {
  // Extract code blocks from markdown
  static extractCodeBlocks(text: string): CodeBlock[] {
    const blocks: CodeBlock[] = []
    const regex = /```(\w+)?\n([\s\S]*?)```/g
    let match

    while ((match = regex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || "plaintext",
        code: match[2].trim(),
      })
    }

    return blocks
  }

  // Parse markdown with code blocks
  static parse(text: string): { content: string; codeBlocks: CodeBlock[] } {
    const codeBlocks = this.extractCodeBlocks(text)
    return { content: text, codeBlocks }
  }

  // Render markdown to HTML (basic)
  static toHTML(text: string): string {
    let html = text

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || "plaintext"}">${this.escapeHtml(code.trim())}</code></pre>`
    })

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Italic
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>")

    // Links
    html = html.replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2">$1</a>')

    // Headings
    html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>")
    html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>")
    html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>")

    return html
  }

  private static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }
}

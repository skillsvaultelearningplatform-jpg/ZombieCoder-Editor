# ZombieCoder Editor - Complete Feature Guide

## Architecture Overview

### Component Structure

\`\`\`
app/
├── page.tsx (Main UI)
├── layout.tsx (Root layout)
└── globals.css (Styles)

components/
├── agent-chat-panel.tsx (Chat interface)
├── settings-panel.tsx (Settings UI)
├── code-block.tsx (Code rendering)
└── ui/ (shadcn components)

hooks/
├── use-agent-streaming.ts (WebSocket streaming)
├── use-settings.ts (Settings management)
└── use-code-editor.ts (Editor actions)

lib/
├── agent-api.ts (API client)
├── settings-store.ts (Settings storage)
├── markdown-renderer.ts (Markdown parsing)
└── code-actions.ts (Code insertion)

types/
├── agent.ts (Agent types)
└── settings.ts (Settings types)
\`\`\`

## Real-Time Streaming

The application uses WebSocket for real-time streaming responses:

\`\`\`typescript
// WebSocket connection
const ws = new WebSocket('ws://127.0.0.1:8001/ws/chat')

// Send message
ws.send(JSON.stringify({ message: 'Your question' }))

// Receive streaming chunks
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data.type === 'stream') {
    // Render chunk
  }
}
\`\`\`

## Code Block Rendering

Markdown code blocks are automatically detected and rendered with action buttons:

\`\`\`markdown
\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`
\`\`\`

This renders as:
- Language tag (python)
- Insert button (insert at cursor)
- Replace button (replace selection)
- Copy button (copy to clipboard)

## Settings Persistence

Settings are stored in browser localStorage and loaded on startup:

\`\`\`typescript
// Save settings
localStorage.setItem('zombiecoder-settings', JSON.stringify(settings))

// Load settings
const saved = localStorage.getItem('zombiecoder-settings')
\`\`\`

## Image Upload & Vision

Users can upload images and reference them in chat:

1. Click upload button
2. Select image file
3. Image preview appears
4. Include in chat message
5. Agent receives image URL

## Multi-Model Support

Switch between different AI models:

- Local Models (DeepSeek, Llama, etc.)
- Cloud APIs (GPT-4, Claude, etc.)
- Custom Models

## Temperature & Creativity

Control response randomness:

\`\`\`
Temperature 0.0 = Deterministic (always same output)
Temperature 0.7 = Balanced (default)
Temperature 1.0 = Maximum creativity
\`\`\`

## System Prompts

Customize AI behavior with system prompts:

\`\`\`
"You are a helpful coding assistant specializing in [language]"
\`\`\`

## Error Handling

The application gracefully handles:

- Connection failures (auto-reconnect)
- API errors (display message)
- Invalid settings (fallback to defaults)
- Network timeouts (retry logic)

## Performance Optimizations

- Message virtualization (only render visible messages)
- Debounced settings updates
- Efficient re-renders with React.memo
- Streaming for large responses

## Accessibility

- Keyboard shortcuts (Ctrl+Enter to send)
- Semantic HTML structure
- ARIA labels on buttons
- Color contrast compliance

## Security

- No credentials stored in code
- Environment variables for secrets
- Input sanitization for markdown
- XSS prevention in code rendering

---

For more information, see `SETUP_GUIDE_BANGLA.md`

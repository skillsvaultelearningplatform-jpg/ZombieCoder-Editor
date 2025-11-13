# ZombieCoder Editor v2.0 - Windows Deployment Guide

## Overview

ZombieCoder Editor is a professional IDE with Cursor AI/VS Code Copilot-style features, including real-time agent chat, streaming responses, and intelligent code assistance.

## System Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 500MB free space
- **Node.js**: 18.x or higher
- **Internet**: Required for agent server communication

## Quick Start

### Option 1: Windows Executable (Recommended)

1. Download `ZombieCoder-Setup-2.0.0.exe` from releases
2. Run the installer
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

### Option 2: Standalone Folder

1. Extract `ZombieCoder-2.0.0-standalone.zip` to desired location
2. Double-click `start.bat` in the extracted folder
3. Browser window opens automatically

### Option 3: Development Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/zombiecoder-editor.git
cd zombiecoder-editor

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev

# In another terminal, start agent server
cd path/to/agent-server
python -m uvicorn main:app --host 127.0.0.1 --port 8001
\`\`\`

## Configuration

### Environment Variables

Create `.env.local` in project root:

\`\`\`env
# Agent Server Configuration
NEXT_PUBLIC_AGENT_API_URL=http://127.0.0.1:8001/v1
NEXT_PUBLIC_AGENT_WS_URL=ws://127.0.0.1:8001/ws

# Optional: Remote Agent Server
# NEXT_PUBLIC_AGENT_API_URL=https://your-agent-server.com/v1
# NEXT_PUBLIC_AGENT_WS_URL=wss://your-agent-server.com/ws
\`\`\`

### Agent Server Setup

ZombieCoder requires a local or remote agent server running on port 8001.

**Required Agent Server Endpoints:**

\`\`\`
GET  /health                    - Health check
POST /v1/chat                   - Send chat message
WS   /ws/chat                   - WebSocket streaming chat
POST /v1/upload                 - Upload images
GET  /v1/models                 - List available models
\`\`\`

**Local Setup (Linux/Mac):**

\`\`\`bash
# Clone agent server
git clone https://github.com/yourusername/agent-server.git
cd agent-server

# Install dependencies
pip install -r requirements.txt

# Run server
python -m uvicorn main:app --host 127.0.0.1 --port 8001
\`\`\`

## Features

### Agent Chat Panel
- Real-time streaming responses
- Image upload support
- Model selection (DeepSeek, GPT-4, Claude)
- WebSocket integration
- Message history navigation

### Settings Panel (8 Tabs)
- **General**: Theme, font, auto-save
- **Chat**: Model config, streaming, image settings
- **Models**: Agent server endpoint configuration
- **Editor**: Tab size, word wrap, minimap
- **Terminal**: Shell and font settings
- **Rules**: Code style guide, auto-formatting
- **Indexing**: Workspace indexing settings
- **About**: Version and feature info

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+S | Save file |
| Ctrl+N | New file |
| Ctrl+W | Close tab |
| Ctrl+` | Toggle terminal |
| Ctrl+Shift+P | Command palette |
| Ctrl+K | Focus agent chat |
| Ctrl+Enter | Send message (in chat) |
| Ctrl+↑/↓ | Message history |
| Escape | Clear input |
| ? | Keyboard help |

## Troubleshooting

### Agent Server Connection Failed

**Error**: "Disconnected" status in chat panel

**Solutions**:
1. Verify agent server is running on localhost:8001
2. Check firewall settings
3. Review agent server logs for errors
4. Try restarting both applications

### Models Not Loading

**Error**: Model dropdown is empty

**Solutions**:
1. Ensure agent server `/v1/models` endpoint is working
2. Check network connectivity
3. Verify API endpoint in Settings > Models
4. Restart the application

### Chat Responses Not Streaming

**Error**: Messages appear all at once instead of streaming

**Solutions**:
1. Check WebSocket connection (should show "Connected")
2. Disable and re-enable streaming in Settings > Chat
3. Verify agent server supports streaming responses
4. Try HTTP fallback (streaming will be disabled)

### Terminal Not Working

**Error**: Terminal panel shows error or won't execute commands

**Solutions**:
1. Verify shell path in Settings > Terminal
2. For Windows: Use `cmd.exe` or `powershell.exe`
3. Check file permissions in working directory
4. Ensure shell is available in system PATH

### Performance Issues

**Solutions**:
1. Reduce editor minimap (Settings > Editor)
2. Disable workspace indexing if not needed
3. Clear browser cache and restart
4. Increase system RAM allocation
5. Close other applications

## Build & Distribution

### Build Standalone Package

\`\`\`bash
# Build Next.js application
npm run build

# Create standalone directory
powershell .\scripts\build-windows.ps1

# Output: dist/ZombieCoder/
\`\`\`

### Create Windows Installer

\`\`\`bash
# Install NSIS (from https://nsis.sourceforge.io)

# Build installer
makensis installer.nsi

# Output: ZombieCoder-Setup-2.0.0.exe
\`\`\`

## System-Wide Installation

### Install as Windows Service (Optional)

```powershell
# Run as Administrator

# Create service
New-Service -Name ZombieCoder `
  -DisplayName "ZombieCoder Editor" `
  -BinaryPathName "C:\Program Files\ZombieCoder\start.bat" `
  -StartupType Manual

# Start service
Start-Service ZombieCoder

# Stop service
Stop-Service ZombieCoder

# Development startup script

Write-Host "=== ZombieCoder Development Setup ===" -ForegroundColor Green

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js not found" -ForegroundColor Red
    exit 1
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`nStarting development server..." -ForegroundColor Yellow
Write-Host "Open http://localhost:3000 in your browser" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Gray

npm run dev

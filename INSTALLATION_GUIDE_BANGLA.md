# ZombieCoder Editor v2.0 - ইনস্টলেশন গাইড (বাংলা)

## সিস্টেম প্রয়োজনীয়তা

- **অপারেটিং সিস্টেম**: Windows 10/11 (64-bit)
- **RAM**: ন্যূনতম 4GB (সুপারিশকৃত 8GB)
- **ডিস্ক স্থান**: 500MB ফ্রি স্থান
- **Node.js**: 18.x বা উচ্চতর সংস্করণ
- **ইন্টারনেট**: এজেন্ট সার্ভার যোগাযোগের জন্য প্রয়োজনীয়

## দ্রুত শুরু

### পদ্ধতি 1: Windows এক্সিকিউটেবল (সুপারিশকৃত)

1. রিলিজ থেকে `ZombieCoder-Setup-2.0.0.exe` ডাউনলোড করুন
2. ফাইলটি চালান
3. ইনস্টলেশন উইজার্ড অনুসরণ করুন
4. স্টার্ট মেনু বা ডেস্কটপ শর্টকাট থেকে চালু করুন

### পদ্ধতি 2: স্ট্যান্ডঅ্যালোন ফোল্ডার

1. `ZombieCoder-2.0.0-standalone.zip` পছন্দের স্থানে এক্সট্র্যাক্ট করুন
2. এক্সট্র্যাক্টেড ফোল্ডারে `start.bat` ডাবল-ক্লিক করুন
3. ব্রাউজার স্বয়ংক্রিয়ভাবে খুলবে

### পদ্ধতি 3: উন্নয়ন সেটআপ

\`\`\`bash
# রেপোজিটরি ক্লোন করুন
git clone https://github.com/yourusername/zombiecoder-editor.git
cd zombiecoder-editor

# নির্ভরতা ইনস্টল করুন
npm install

# পরিবেশ ফাইল তৈরি করুন
cp .env.example .env.local

# ডেভেলপমেন্ট সার্ভার শুরু করুন
npm run dev
\`\`\`

## এজেন্ট সার্ভার সেটআপ

ZombieCoder একটি স্থানীয় বা দূরবর্তী এজেন্ট সার্ভার প্রয়োজন যা পোর্ট 8001 এ চলে।

**প্রয়োজনীয় এজেন্ট সার্ভার এন্ডপয়েন্ট:**

\`\`\`
GET  /health                    - স্বাস্থ্য পরীক্ষা
POST /v1/chat                   - চ্যাট বার্তা পাঠান
WS   /ws/chat                   - WebSocket স্ট্রিমিং
POST /v1/upload                 - ছবি আপলোড করুন
GET  /v1/models                 - উপলব্ধ মডেল তালিকা
\`\`\`

## মূল বৈশিষ্ট্য

### এজেন্ট চ্যাট প্যানেল
- রিয়েল-টাইম স্ট্রিমিং প্রতিক্রিয়া
- ছবি আপলোড সমর্থন
- মডেল নির্বাচন (DeepSeek, GPT-4, Claude)
- WebSocket ইন্টিগ্রেশন
- বার্তা ইতিহাস নেভিগেশন

### সেটিংস প্যানেল (8 ট্যাব)
- **সাধারণ**: থিম, ফন্ট, স্বয়ংক্রিয় সংরক্ষণ
- **চ্যাট**: মডেল কনফিগ, স্ট্রিমিং, ছবি সেটিংস
- **মডেল**: এজেন্ট সার্ভার এন্ডপয়েন্ট কনফিগ
- **এডিটর**: ট্যাব আকার, শব্দ মোড়ানো, মিনিম্যাপ
- **টার্মিনাল**: শেল এবং ফন্ট সেটিংস
- **নিয়ম**: কোড স্টাইল গাইড, স্বয়ংক্রিয় ফরম্যাটিং
- **ইন্ডেক্সিং**: ওয়ার্কস্পেস ইন্ডেক্সিং সেটিংস
- **সম্পর্কে**: সংস্করণ এবং বৈশিষ্ট্য তথ্য

## কীবোর্ড শর্টকাট

| শর্টকাট | কর্ম |
|----------|------|
| Ctrl+S | ফাইল সংরক্ষণ করুন |
| Ctrl+N | নতুন ফাইল |
| Ctrl+W | ট্যাব বন্ধ করুন |
| Ctrl+` | টার্মিনাল টগল করুন |
| Ctrl+Shift+P | কমান্ড প্যালেট |
| Ctrl+K | এজেন্ট চ্যাট ফোকাস করুন |
| Ctrl+Enter | বার্তা পাঠান (চ্যাটে) |
| Ctrl+↑/↓ | বার্তা ইতিহাস |
| Escape | ইনপুট সাফ করুন |

## সমস্যা সমাধান

### এজেন্ট সার্ভার সংযোগ ব্যর্থ

**ত্রুটি**: চ্যাট প্যানেলে "Disconnected" স্ট্যাটাস

**সমাধান**:
1. এজেন্ট সার্ভার localhost:8001 এ চলছে কিনা যাচাই করুন
2. ফায়ারওয়াল সেটিংস চেক করুন
3. এজেন্ট সার্ভার লগ পর্যালোচনা করুন
4. উভয় অ্যাপ্লিকেশন পুনরায় শুরু করার চেষ্টা করুন

### মডেল লোড হচ্ছে না

**ত্রুটি**: মডেল ড্রপডাউন খালি

**সমাধান**:
1. এজেন্ট সার্ভার `/v1/models` এন্ডপয়েন্ট কাজ করছে কিনা নিশ্চিত করুন
2. নেটওয়ার্ক সংযোগ যাচাই করুন
3. সেটিংস > মডেলে API এন্ডপয়েন্ট যাচাই করুন
4. অ্যাপ্লিকেশন পুনরায় শুরু করুন

## সহায়তা

- **ডকুমেন্টেশন**: docs/ ফোল্ডার দেখুন
- **সমস্যা**: GitHub Issues
- **ইমেইল**: support@zombiecoder.dev

## লাইসেন্স

MIT License - বিবরণের জন্য LICENSE ফাইল দেখুন
\`\`\`

```powershell file="scripts/build-windows.ps1"
# Windows Build Script for ZombieCoder Editor

Write-Host "=== ZombieCoder Editor v2.0 Build Script ===" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "`nChecking Node.js installation..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download and install Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

$nodeVersion = node --version
Write-Host "Found Node.js version: $nodeVersion" -ForegroundColor Green

# Build Next.js application
Write-Host "`nBuilding Next.js application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Create standalone directory
Write-Host "`nCreating standalone package..." -ForegroundColor Yellow
$standalonePath = "dist/ZombieCoder"
if (Test-Path $standalonePath) {
    Remove-Item -Path $standalonePath -Recurse -Force
}
New-Item -ItemType Directory -Path $standalonePath -Force | Out-Null

# Copy built files
Write-Host "Copying application files..." -ForegroundColor Yellow
Copy-Item -Path ".next/standalone/*" -Destination $standalonePath -Recurse -Force
Copy-Item -Path ".next/static" -Destination "$standalonePath/.next/static" -Recurse -Force
Copy-Item -Path "public" -Destination "$standalonePath/public" -Recurse -Force

# Create startup script
Write-Host "Creating startup script..." -ForegroundColor Yellow
$startupScript = @'
@echo off
title ZombieCoder Editor
echo.
echo Starting ZombieCoder Editor...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Get the directory of this script
set DIR=%~dp0

REM Check if agent server is running
echo Checking for agent server on port 8001...
netstat -ano | findstr ":8001" >nul
if %ERRORLEVEL% EQU 0 (
    echo Agent server found on port 8001
) else (
    echo WARNING: Agent server not found on port 8001
    echo Make sure your agent server is running before using the chat features
    echo.
)

REM Start the server
echo.
echo Server starting on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
node "%DIR%server.js"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to start server
    echo.
    pause
    exit /b 1
)
pause
'@

Set-Content -Path "$standalonePath/start.bat" -Value $startupScript -Encoding ASCII

# Create README
Write-Host "Creating README..." -ForegroundColor Yellow
$readmeContent = @'
# ZombieCoder Editor v2.0

## Installation
1. Ensure Node.js 18+ is installed from https://nodejs.org
2. Extract this folder to your desired location
3. Double-click `start.bat` to launch

## Agent Server Setup
ZombieCoder requires a local agent server running on port 8001.

Before launching, ensure your agent server is running:

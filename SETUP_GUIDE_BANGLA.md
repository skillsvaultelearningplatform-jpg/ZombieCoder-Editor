# ZombieCoder Editor v2.0 - সম্পূর্ণ সেটাপ গাইড

## প্রথম পদক্ষেপ (Initial Setup)

### প্রয়োজনীয় সফটওয়্যার (System Requirements)
- Windows 10/11 (64-bit)
- Node.js 18+ (https://nodejs.org)
- Git (https://git-scm.com)
- 4GB RAM (Minimum)
- 500MB Disk Space

### ধাপ ১: Repository ক্লোন করুন

\`\`\`bash
git clone https://github.com/skillsvaultelearningplatform-jpg/ZombieCoder-Editor
cd ZombieCoder-Editor
\`\`\`

### ধাপ ২: নির্ভরতা ইনস্টল করুন

\`\`\`bash
npm install
\`\`\`

### ধাপ ৩: পরিবেশ ভেরিয়েবল সেটাপ করুন

`.env.local` ফাইল তৈরি করুন এবং নিম্নলিখিত যোগ করুন:

\`\`\`env
NEXT_PUBLIC_AGENT_API_URL=http://127.0.0.1:8001/v1
NEXT_PUBLIC_AGENT_WS_URL=ws://127.0.0.1:8001/ws
NEXT_PUBLIC_ENABLE_STREAMING=true
\`\`\`

## Agent Server সেটাপ

### Agent Server চালু করা

আপনার agent server ৮০০১ পোর্টে চালু করুন:

\`\`\`bash
python -m uvicorn main:app --host 127.0.0.1 --port 8001
\`\`\`

### প্রয়োজনীয় Endpoints

Agent server এ নিম্নলিখিত endpoints থাকতে হবে:

#### 1. Health Check
\`\`\`
GET /health
Response: { "status": "healthy", "version": "1.0.0" }
\`\`\`

#### 2. Chat (HTTP)
\`\`\`
POST /v1/chat
Body: {
  "message": "Your question",
  "model": "deepseek-coder-1.3b",
  "temperature": 0.7,
  "max_tokens": 2000
}
Response: { "content": "AI response" }
\`\`\`

#### 3. Chat (WebSocket)
\`\`\`
WS /ws/chat
Send: { "message": "Your question", "model": "deepseek-coder-1.3b" }
Receive: { "type": "stream", "content": "chunk" }
Receive: { "type": "complete" }
\`\`\`

#### 4. Models List
\`\`\`
GET /v1/models
Response: {
  "models": [
    { "id": "deepseek-coder-1.3b", "name": "DeepSeek Coder", "provider": "Local" }
  ]
}
\`\`\`

#### 5. Image Upload
\`\`\`
POST /v1/upload
Headers: Content-Type: multipart/form-data
Body: FormData with "image" field
Response: { "url": "uploaded_image_url" }
\`\`\`

## ডেভেলপমেন্ট শুরু করুন

### ধাপ ১: Agent Server চালু করুন (নতুন টার্মিনাল)

\`\`\`bash
cd path/to/agent-server
python -m uvicorn main:app --host 127.0.0.1 --port 8001
\`\`\`

### ধাপ ২: ZombieCoder চালু করুন (অন্য টার্মিনাল)

\`\`\`bash
npm run dev
\`\`\`

### ধাপ ৩: ব্রাউজারে খুলুন

\`\`\`
http://localhost:3000
\`\`\`

## মূল ফিচার এবং ব্যবহার

### Agent Chat Panel

1. **Model Selection**: শীর্ষ ড্রপডাউন থেকে AI মডেল নির্বাচন করুন
2. **Image Upload**: ক্লিক করে ছবি আপলোড করুন এবং সেগুলো সম্পর্কে প্রশ্ন করুন
3. **Send Message**: Ctrl+Enter চেপে মেসেজ পাঠান
4. **Code Actions**: AI এর কোড সাজেশনে Insert/Replace/Copy বাটন ব্যবহার করুন

### Settings Panel

#### General Tab
- Theme পরিবর্তন করুন (Dark/Light/Auto)
- Font Size সামঞ্জস্য করুন
- Font Family নির্বাচন করুন

#### Chat Tab
- Temperature (creativity level) সেট করুন
- Max Tokens সীমা নির্ধারণ করুন
- System Prompt কাস্টমাইজ করুন

#### Models Tab
- Local agent server endpoint যাচাই করুন
- API Key কনফিগার করুন (local এর জন্য DUMMY_API_KEY_FOR_LOCAL)

## কমান্ড লাইন কমান্ড

\`\`\`bash
# ডেভেলপমেন্ট মোড
npm run dev

# প্রোডাকশনের জন্য বিল্ড করুন
npm run build

# প্রোডাকশনে চালান
npm start

# TypeScript চেক করুন
npm run type-check

# Linting চালান
npm run lint
\`\`\`

## ট্রাবলশুটিং

### Agent Server Connection Failed

**সমস্যা**: "Disconnected" দেখা যাচ্ছে

**সমাধান**:
1. Agent server চালু আছে কিনা চেক করুন (পোর্ট 8001)
2. `.env.local` এ সঠিক endpoint আছে কিনা যাচাই করুন
3. Agent server logs দেখুন কোনো error আছে কিনা

### Models Not Loading

**সমস্যা**: Model dropdown খালি

**সমাধান**:
1. `/v1/models` endpoint কাজ করছে কিনা চেক করুন
2. Agent server response format যাচাই করুন
3. Browser console এ error দেখুন

### Image Upload Failed

**সমস্যা**: ছবি আপলোড হচ্ছে না

**সমাধান**:
1. ছবির সাইজ ১০MB এর নিচে আছে কিনা চেক করুন
2. Supported format (PNG, JPG, WebP, SVG) ব্যবহার করছেন কিনা
3. `/v1/upload` endpoint কাজ করছে কিনা

### Settings Not Persisting

**সমস্যা**: সেটিংস সংরক্ষণ হচ্ছে না

**সমাধান**:
1. Browser localStorage enable আছে কিনা চেক করুন
2. Browser console এ error থাকলে দেখুন
3. Browser cache clear করুন এবং পুনরায় চেষ্টা করুন

## উন্নত কনফিগারেশন

### Custom Agent Models যোগ করুন

`lib/agent-api.ts` এ model list update করুন:

\`\`\`typescript
async getModels(): Promise<AgentModel[]> {
  // আপনার custom models যোগ করুন
  return [
    { id: 'your-model-1', name: 'Your Model', provider: 'Local', maxTokens: 4000 },
    { id: 'your-model-2', name: 'Your Model 2', provider: 'OpenAI', maxTokens: 8000 }
  ]
}
\`\`\`

### WebSocket Reconnection Policy

`hooks/use-agent-streaming.ts` এ reconnection delay change করুন:

\`\`\`typescript
setTimeout(connect, 3000) // ৩ সেকেন্ড পরে reconnect
\`\`\`

## প্রোডাকশন ডিপ্লয়মেন্ট

### Vercel এ ডিপ্লয় করুন

\`\`\`bash
# Vercel CLI ইনস্টল করুন
npm install -g vercel

# ডিপ্লয় করুন
vercel

# Environment variables সেট করুন
vercel env add NEXT_PUBLIC_AGENT_API_URL
vercel env add NEXT_PUBLIC_AGENT_WS_URL
\`\`\`

### Windows Executable তৈরি করুন

\`\`\`bash
npm run build
npm pkg set scripts.start="node server.js"

# Standalone package তৈরি হবে
# dist/ZombieCoder এ ফাইল পাবেন
\`\`\`

## সাপোর্ট এবং অবদান

- **Issues**: GitHub এ issue report করুন
- **Contributions**: Pull request সাদরে গৃহীত
- **Documentation**: এই ফাইল update করতে পারেন

## লাইসেন্স

MIT License - বিস্তারিত জানতে `LICENSE` ফাইল দেখুন।

---

**আপনার ZombieCoder Editor v2.0 এখন সম্পূর্ণ এবং প্রস্তুত! Happy Coding! 🧟**

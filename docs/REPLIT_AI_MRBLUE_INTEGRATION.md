# 🔄 Replit AI ↔ Mr. Blue AI Integration Guide

## Overview
This document demonstrates how Replit AI can programmatically communicate with Mr. Blue AI through the exposed REST API endpoints, enabling autonomous bidirectional agent collaboration, live streaming vibecoding, and orchestrated multi-agent workflows.

---

## 🎯 **Core Capabilities**

### 1. **Bidirectional Communication**
- Replit AI can send requests to Mr. Blue AI via HTTP/SSE
- Mr. Blue AI can respond with streaming updates
- Both agents can collaborate on code generation, debugging, and analysis

### 2. **Live Vibecoding Streaming**
- Real-time Server-Sent Events (SSE) for code generation
- Stream-based updates to Visual Editor preview
- Progress tracking for file changes

### 3. **Autonomous Agent Orchestration**
- Trigger specialized AI agents (audit, self-healing, code generation)
- Monitor agent progress and status
- Receive structured results

---

## 📡 **API Endpoints Reference**

### **Base URL**
```
https://[YOUR_REPLIT_URL]/api/mrblue
```

### **Authentication**
Most endpoints require JWT authentication via `Authorization: Bearer <token>` header.
Some endpoints (chat, stream, breadcrumbs) are public for unauthenticated access.

---

## 🚀 **Key Endpoints**

### 1. **Text Chat** (Standard Request/Response)
```http
POST /api/mrblue/chat
Content-Type: application/json

{
  "message": "Explain the Free Energy Principle in tango dancing",
  "context": {
    "currentPage": "/visual-editor",
    "userJourney": ["home", "dashboard", "visual-editor"],
    "mode": "text"
  },
  "conversationId": 123,
  "userId": 456
}
```

**Response:**
```json
{
  "response": "The Free Energy Principle in tango suggests...",
  "confidence": 0.95,
  "sources": ["mb.md"],
  "conversationId": 123
}
```

---

### 2. **Streaming Chat** (Server-Sent Events - SSE)
**The primary endpoint for live vibecoding and real-time updates**

```http
POST /api/mrblue/stream
Content-Type: application/json

{
  "message": "Create a user profile card component with avatar, name, and bio",
  "context": {
    "currentPage": "/visual-editor",
    "mode": "vibecoding"
  },
  "mode": "vibecoding"
}
```

**Server-Sent Events Response:**
```
event: progress
data: {"type":"thinking","message":"Analyzing request..."}

event: progress
data: {"type":"generating","message":"Creating component structure..."}

event: fileChange
data: {
  "filePath": "client/src/components/UserProfileCard.tsx",
  "action": "create",
  "reason": "New reusable profile card component",
  "newContent": "import { Avatar } from '@/components/ui/avatar'...",
  "status": "pending"
}

event: progress
data: {"type":"applying","message":"Writing file changes..."}

event: complete
data: {
  "sessionId": "vibe-abc123",
  "filesChanged": 1,
  "summary": "Created UserProfileCard.tsx component"
}
```

**Client-Side SSE Handling (JavaScript):**
```javascript
const eventSource = new EventSource('/api/mrblue/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: "...", mode: "vibecoding" })
});

eventSource.addEventListener('progress', (e) => {
  const data = JSON.parse(e.data);
  console.log('[Progress]', data.message);
});

eventSource.addEventListener('fileChange', (e) => {
  const change = JSON.parse(e.data);
  console.log('[File Change]', change.filePath, change.action);
  // Update Visual Editor preview in real-time
  updatePreview(change);
});

eventSource.addEventListener('complete', (e) => {
  const result = JSON.parse(e.data);
  console.log('[Complete]', result.summary);
  eventSource.close();
});

eventSource.addEventListener('error', (e) => {
  console.error('[SSE Error]', e);
  eventSource.close();
});
```

---

### 3. **Voice Transcription**
```http
POST /api/mrblue/transcribe
Content-Type: multipart/form-data

FormData:
  audio: [audio file blob]
```

**Response:**
```json
{
  "transcription": "Create a new dashboard page",
  "confidence": 0.98,
  "duration": 2.5
}
```

---

### 4. **Conversation Management**

#### Create Conversation
```http
POST /api/mrblue/conversations
Authorization: Bearer <token>

{
  "title": "Replit AI Session - Visual Editor Build"
}
```

#### List Conversations
```http
GET /api/mrblue/conversations
Authorization: Bearer <token>
```

#### Get Conversation with Messages
```http
GET /api/mrblue/conversations/:id
Authorization: Bearer <token>
```

#### Get Messages (Paginated)
```http
GET /api/mrblue/conversations/:id/messages?offset=0&limit=50
Authorization: Bearer <token>
```

---

### 5. **Message Actions**

#### Save Message
```http
POST /api/mrblue/messages
Authorization: Bearer <token>

{
  "conversationId": 123,
  "role": "assistant",
  "content": "Here's your component...",
  "metadata": {
    "vibecodingSessionId": "vibe-abc123",
    "filesChanged": 2
  }
}
```

#### React to Message
```http
POST /api/mrblue/messages/:id/react
Authorization: Bearer <token>

{
  "emoji": "👍"
}
```

#### Bookmark Message
```http
POST /api/mrblue/messages/:id/bookmark
Authorization: Bearer <token>

{
  "note": "Great implementation pattern"
}
```

---

### 6. **Autonomous Agents**

#### Page Inspection (DOM Analysis)
```http
POST /api/mrblue/inspect-page

{
  "currentPage": "/visual-editor",
  "domSnapshot": "<html>...</html>"
}
```

#### Analyze Page (Proactive Self-Healing)
```http
POST /api/mrblue/analyze-page

{
  "pageId": "/visual-editor",
  "autoHeal": true
}
```

**Response:**
```json
{
  "issues": [
    {
      "type": "accessibility",
      "severity": "medium",
      "message": "Missing alt text on images",
      "location": "src/components/Gallery.tsx:42"
    }
  ],
  "healingApplied": true,
  "fixedIssues": 3
}
```

---

### 7. **Vibecoding**

#### Generate Code
```http
POST /api/mrblue/generate-code
Authorization: Bearer <token>

{
  "prompt": "Create a responsive navbar with logo and menu items",
  "context": "React with TypeScript, Tailwind CSS"
}
```

#### Modify Code
```http
POST /api/mrblue/modify-code
Authorization: Bearer <token>

{
  "filePath": "client/src/components/Navbar.tsx",
  "instructions": "Add dark mode toggle button",
  "currentCode": "export function Navbar() { ... }"
}
```

#### Apply Vibecoding Changes
```http
POST /api/mrblue/vibecoding/apply

{
  "sessionId": "vibe-abc123",
  "fileChanges": [
    {
      "filePath": "client/src/components/Button.tsx",
      "action": "modify",
      "newContent": "..."
    }
  ]
}
```

---

## 🎬 **Demonstration: Replit AI ↔ Mr. Blue Live Vibecoding**

### **Scenario:**
Replit AI requests Mr. Blue to create a user authentication form with live streaming updates to the Visual Editor.

### **Step 1: Replit AI Sends Request**
```javascript
// Replit AI executes this code
const response = await fetch('https://[REPL_URL]/api/mrblue/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: "Create a login form with email, password, remember me checkbox, and a Google OAuth button. Use shadcn/ui components.",
    context: {
      currentPage: '/visual-editor',
      mode: 'vibecoding'
    },
    mode: 'vibecoding'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

let buffer = '';
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n\n');
  buffer = lines.pop() || '';
  
  for (const line of lines) {
    if (line.startsWith('event:')) {
      const eventType = line.substring(7).trim();
      const dataLine = lines[lines.indexOf(line) + 1];
      const data = JSON.parse(dataLine.substring(6));
      
      console.log(`[${eventType}]`, data);
      
      if (eventType === 'fileChange') {
        console.log(`📝 ${data.action} ${data.filePath}`);
        console.log(`💡 Reason: ${data.reason}`);
      }
    }
  }
}
```

### **Step 2: Mr. Blue Streams Response**

**Event 1: Thinking**
```
event: progress
data: {"type":"thinking","message":"Planning login form component..."}
```

**Event 2: File Change - Create Component**
```
event: fileChange
data: {
  "filePath": "client/src/components/auth/LoginForm.tsx",
  "action": "create",
  "reason": "New login form component with email/password fields and OAuth",
  "newContent": "import { useState } from 'react';\nimport { Button } from '@/components/ui/button';\nimport { Input } from '@/components/ui/input';\nimport { Checkbox } from '@/components/ui/checkbox';\nimport { Label } from '@/components/ui/label';\nimport { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';\nimport { SiGoogle } from 'react-icons/si';\n\nexport function LoginForm() {\n  const [email, setEmail] = useState('');\n  const [password, setPassword] = useState('');\n  const [rememberMe, setRememberMe] = useState(false);\n\n  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    console.log({ email, password, rememberMe });\n  };\n\n  return (\n    <Card className=\"w-full max-w-md\">\n      <CardHeader>\n        <CardTitle>Login</CardTitle>\n      </CardHeader>\n      <CardContent>\n        <form onSubmit={handleSubmit} className=\"space-y-4\">\n          <div className=\"space-y-2\">\n            <Label htmlFor=\"email\">Email</Label>\n            <Input\n              id=\"email\"\n              type=\"email\"\n              value={email}\n              onChange={(e) => setEmail(e.target.value)}\n              required\n            />\n          </div>\n          <div className=\"space-y-2\">\n            <Label htmlFor=\"password\">Password</Label>\n            <Input\n              id=\"password\"\n              type=\"password\"\n              value={password}\n              onChange={(e) => setPassword(e.target.value)}\n              required\n            />\n          </div>\n          <div className=\"flex items-center space-x-2\">\n            <Checkbox\n              id=\"remember\"\n              checked={rememberMe}\n              onCheckedChange={setRememberMe}\n            />\n            <Label htmlFor=\"remember\">Remember me</Label>\n          </div>\n          <Button type=\"submit\" className=\"w-full\">\n            Login\n          </Button>\n          <Button variant=\"outline\" className=\"w-full\" type=\"button\">\n            <SiGoogle className=\"mr-2\" />\n            Login with Google\n          </Button>\n        </form>\n      </CardContent>\n    </Card>\n  );\n}",
  "status": "pending"
}
```

**Event 3: Complete**
```
event: complete
data: {
  "sessionId": "vibe-20251119-abc123",
  "filesChanged": 1,
  "summary": "Created LoginForm.tsx with email/password inputs, remember me checkbox, and Google OAuth button"
}
```

### **Step 3: Visual Editor Updates in Real-Time**

As each `fileChange` event arrives, the Visual Editor:
1. **Updates the file tree** to show new/modified files
2. **Highlights changed code** in the code editor
3. **Refreshes the iframe preview** to display the new component
4. **Shows change tracker** with diff visualization

---

## 🧠 **Advanced: Autonomous Multi-Agent Orchestration**

### **MB.MD Protocol Engine Integration**

Replit AI can trigger Mr. Blue's autonomous development system:

```javascript
// Replit AI triggers autonomous build
const response = await fetch('https://[REPL_URL]/api/mrblue/autonomous/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task: "Build a complete user dashboard with profile, settings, and activity feed",
    methodology: "MB.MD Protocol v9.2",
    agents: [
      "planner",      // Create task breakdown
      "designer",     // Generate UI/UX specs
      "developer",    // Implement components
      "tester",       // Write Playwright tests
      "validator"     // Quality gates (95-99/100)
    ],
    constraints: {
      maxIterations: 10,
      qualityThreshold: 95,
      parallelAgents: 3
    }
  })
});
```

**Mr. Blue Orchestrates:**
1. **Planner Agent** → Breaks down task into 12 subtasks
2. **Designer Agent** → Creates design_guidelines.md with color scheme
3. **Developer Agent** → Implements 5 components in parallel
4. **Tester Agent** → Generates Playwright test suite
5. **Validator Agent** → Runs 10-layer quality gates, ensures 95%+ score

**Streaming Progress:**
```
event: agentUpdate
data: {"agent":"planner","status":"complete","output":"12 subtasks created"}

event: agentUpdate
data: {"agent":"designer","status":"in_progress","output":"Generating color palette..."}

event: agentUpdate
data: {"agent":"developer","status":"in_progress","output":"Creating ProfileCard.tsx (1/5)"}

event: complete
data: {"tasksCompleted":12,"qualityScore":97,"testsPassed":45}
```

---

## 🔐 **Security & Rate Limiting**

### **Authentication Flow:**
1. Replit AI authenticates via `/api/auth/login` or uses service token
2. Receives JWT access token (15min expiry) + refresh token (7day expiry)
3. Includes `Authorization: Bearer <token>` on protected endpoints
4. Automatically refreshes tokens via `/api/auth/refresh`

### **Rate Limits:**
- **Public endpoints** (chat, stream): 100 requests/hour per IP
- **Authenticated endpoints**: 1000 requests/hour per user
- **Vibecoding**: 50 code generation requests/day (tier-based)

---

## 📊 **Monitoring & Observability**

All Mr. Blue API calls are instrumented with OpenTelemetry:

```javascript
// View trace in Prometheus/Grafana
GET /metrics

# HELP mrblue_requests_total Total Mr Blue API requests
# TYPE mrblue_requests_total counter
mrblue_requests_total{endpoint="/chat",status="200"} 1523
mrblue_requests_total{endpoint="/stream",status="200"} 487

# HELP mrblue_vibecoding_duration_seconds Vibecoding session duration
# TYPE mrblue_vibecoding_duration_seconds histogram
mrblue_vibecoding_duration_seconds_bucket{le="5"} 120
mrblue_vibecoding_duration_seconds_bucket{le="10"} 450
```

---

## 🎯 **Next Steps**

### **Phase 4: Implement Free Energy Principle (FEP)**
- **Expected Free Energy** calculation for response selection
- **Active Inference** for proactive error prevention
- **Bayesian belief updating** for user modeling

### **Phase 5: Computer Use Automation**
- Mr. Blue triggers browser automation via Playwright
- Natural language → DOM interactions
- Screenshot analysis + visual verification

### **Phase 6: Organoid Intelligence (OI)**
- Bio-inspired learning algorithms
- Self-organizing neural architectures
- Adaptive response generation

---

## 📚 **References**

- **MB.MD Protocol v9.2**: `mb.md`
- **Mr. Blue Routes**: `server/routes/mrBlue.ts`
- **Visual Editor**: `client/src/pages/VisualEditorPage.tsx`
- **Vibecoding System**: `server/services/vibecoding/`
- **Autonomous Agents**: `server/services/autonomous/`

---

## ✅ **Summary**

Replit AI can now:
- ✅ Send requests to Mr. Blue AI via REST API
- ✅ Receive real-time streaming updates via SSE
- ✅ Trigger autonomous agent workflows
- ✅ Monitor progress and results
- ✅ Collaborate on code generation, debugging, and analysis

**This bidirectional integration enables true AI ↔ AI collaboration, following the MB.MD Protocol v9.2 (Free Energy Principle + Organoid Intelligence) for production-grade autonomous software development.**

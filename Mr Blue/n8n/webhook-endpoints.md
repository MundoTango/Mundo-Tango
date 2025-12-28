# Webhook Endpoints

**Invocation:** `use mb.md: n8n:webhooks`

## 🎯 N8N WORKFLOW INTEGRATION

### Mr Blue Marketing Plan Generator

**Workflow URL:** https://boddye.app.n8n.cloud/workflow/nf9PeVgKpPwbmNja

**Webhook Endpoint (Test):** 
```
https://boddye.app.n8n.cloud/webhook-test/944090e4-a3e5-46b7-a8d0-4609f2ebeabc
```

**Usage from Mr. Blue UI:**
1. User submits a task via the Mr. Blue chatbox
2. Backend sends POST request to n8n webhook with task details
3. n8n triggers AI model (GPT-4O-MINI) to generate marketing plan
4. AI output is saved to Notion page: [Marketing Plan](https://www.notion.so/Marketing-Plan-2d48ff6927a58125945adce20eb042f1)
5. Response returned to user

**Payload Structure:**
```json
{
  "task": "string - The marketing task description from user"
}
```

**Security:** 
- Webhook secret validation is REQUIRED (configured via N8NWEBHOOKSECRET env variable)
- All requests must include valid signature

---

---

## 🔗 ALL MR. BLUE API ENDPOINTS

### Core Chat & Messaging

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mrblue/chat` | Send message to Mr. Blue |
| POST | `/api/mrblue/chat/stream` | Streaming response |
| POST | `/api/mrblue/analyze` | Pre-generation analysis |
| GET | `/api/mrblue/conversations` | Get conversation history |
| DELETE | `/api/mrblue/conversations/:id` | Delete conversation |

### Agent Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mrblue/agents` | List all agents |
| GET | `/api/mrblue/agents/:id` | Get agent details |
| GET | `/api/mrblue/agents/:id/status` | Agent availability |
| POST | `/api/mrblue/agents/:id/execute` | Execute agent task |
| POST | `/api/mrblue/agents/:id/message` | Send A2A message |
| GET | `/api/mrblue/agents/:id/metrics` | Agent performance |

### Page Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mrblue/agents/landing/analyze` | Analyze landing page |
| POST | `/api/mrblue/agents/events/analyze` | Analyze events page |
| POST | `/api/mrblue/agents/housing/analyze` | Analyze housing page |
| POST | `/api/mrblue/agents/groups/analyze` | Analyze groups page |
| POST | `/api/mrblue/agents/profile/analyze` | Analyze profile page |

### Self-Healing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mrblue/audit/page` | Audit specific page |
| POST | `/api/mrblue/audit/full` | Full site audit |
| GET | `/api/mrblue/audit/status` | Audit status |
| GET | `/api/mrblue/audit/history` | Audit history |
| POST | `/api/mrblue/self-heal` | Trigger self-healing |

### Scraping

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/unified-scrape` | Start scrape job |
| GET | `/api/admin/unified-scraper-status` | Scraper status |
| GET | `/api/admin/scraped-events` | View scraped events |
| POST | `/api/admin/scraped-events/:id/approve` | Approve event |
| DELETE | `/api/admin/scraped-events/:id` | Delete event |

### Vibe Coding

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mrblue/vibe/generate` | Generate code |
| POST | `/api/mrblue/vibe/apply` | Apply code changes |
| GET | `/api/mrblue/vibe/preview` | Preview changes |
| POST | `/api/mrblue/vibe/rollback` | Rollback changes |

### Memory & Context

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mrblue/memory/search` | Semantic search |
| POST | `/api/mrblue/memory/store` | Store memory |
| GET | `/api/mrblue/context/page/:path` | Get page context |
| POST | `/api/mrblue/context/update` | Update context |

### Voice

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mrblue/voice/transcribe` | Transcribe audio |
| POST | `/api/mrblue/voice/synthesize` | Text to speech |
| GET | `/api/mrblue/voice/voices` | Available voices |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Admin dashboard data |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/errors` | Error log |
| POST | `/api/admin/broadcast` | Broadcast message |

---

## 📤 OUTGOING WEBHOOKS

Configure these in n8n to receive events from Mr. Blue:

### Error Events

```json
{
  "webhookUrl": "https://your-n8n/webhook/mr-blue-error",
  "events": ["error.critical", "error.high", "error.medium"],
  "payload": {
    "type": "error",
    "severity": "string",
    "agent": "string",
    "message": "string",
    "stack": "string",
    "timestamp": "ISO8601"
  }
}
```

### Task Events

```json
{
  "webhookUrl": "https://your-n8n/webhook/mr-blue-task",
  "events": ["task.started", "task.completed", "task.failed"],
  "payload": {
    "type": "task",
    "taskId": "string",
    "status": "started|completed|failed",
    "agent": "string",
    "duration": "number",
    "result": "object"
  }
}
```

### Scraping Events

```json
{
  "webhookUrl": "https://your-n8n/webhook/mr-blue-scrape",
  "events": ["scrape.started", "scrape.completed", "scrape.error"],
  "payload": {
    "type": "scrape",
    "source": "string",
    "status": "string",
    "eventsFound": "number",
    "newEvents": "number",
    "errors": "array"
  }
}
```

### User Events

```json
{
  "webhookUrl": "https://your-n8n/webhook/mr-blue-user",
  "events": ["user.signup", "user.upgrade", "user.churn"],
  "payload": {
    "type": "user",
    "event": "string",
    "userId": "string",
    "metadata": "object"
  }
}
```

---

## 🔧 WEBHOOK REGISTRATION

```typescript
// Register webhook in Mr. Blue
POST /api/mrblue/webhooks

{
  "url": "https://your-n8n-instance/webhook/endpoint",
  "events": ["error.critical", "task.completed"],
  "secret": "your-webhook-secret"
}

// Response
{
  "id": "webhook_123",
  "status": "active",
  "events": ["error.critical", "task.completed"]
}
```

---

## 🔒 WEBHOOK SECURITY

### Signature Verification

All webhooks include a signature header:

```
X-MrBlue-Signature: sha256=abc123...
```

Verify in n8n:
```javascript
const crypto = require('crypto');
const signature = $request.headers['x-mrblue-signature'];
const expected = 'sha256=' + crypto
  .createHmac('sha256', $credentials.webhookSecret)
  .update(JSON.stringify($request.body))
  .digest('hex');

if (signature !== expected) {
  throw new Error('Invalid signature');
}
```

---

*Every event. Every webhook. Connected.*

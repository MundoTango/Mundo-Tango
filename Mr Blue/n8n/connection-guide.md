# n8n Connection Guide

**Invocation:** `use mb.md: n8n`

---

## 🔗 CONNECTING N8N TO MR. BLUE

n8n is a workflow automation platform that can trigger and orchestrate Mr. Blue agents externally.

```
┌─────────────────────────────────────────────────────────────┐
│                  N8N ↔ MR. BLUE ARCHITECTURE                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────────────┐   │
│  │      N8N        │         │      MUNDO TANGO        │   │
│  │   Workflows     │◀───────▶│      (Mr. Blue)         │   │
│  └────────┬────────┘   API   └─────────────────────────┘   │
│           │                                                 │
│           │                                                 │
│  ┌────────┴────────────────────────────────────────────┐   │
│  │  WORKFLOW TYPES:                                     │   │
│  │  • Scheduled scraping                               │   │
│  │  • Event-triggered actions                          │   │
│  │  • External integrations (Slack, Email, etc.)       │   │
│  │  • Multi-step automations                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 SETUP STEPS

### 1. Base URL Configuration

```
Production: https://mundo-tango.replit.app
Development: https://[repl-url].replit.dev
```

### 2. Authentication

All API calls require authentication:

```typescript
// Option 1: API Key (recommended for n8n)
headers: {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
}

// Option 2: Session cookie (for browser-based)
headers: {
  'Cookie': 'session=YOUR_SESSION_TOKEN'
}
```

### 3. n8n HTTP Request Node Configuration

```json
{
  "node": "HTTP Request",
  "settings": {
    "url": "https://mundo-tango.replit.app/api/mrblue/chat",
    "method": "POST",
    "authentication": "predefinedCredentialType",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "message": "{{ $json.userMessage }}",
      "context": {
        "source": "n8n",
        "workflow": "{{ $workflow.name }}"
      }
    }
  }
}
```

---

## 🔧 CORE ENDPOINTS

### Chat with Mr. Blue

```
POST /api/mrblue/chat
```

```json
{
  "message": "Analyze the events page health",
  "context": {
    "userId": "system",
    "source": "n8n"
  }
}
```

Response:
```json
{
  "response": "Page health analysis complete...",
  "agentsActivated": ["PageAuditService", "EventsPageAgent"],
  "metrics": { "responseTime": 1234 }
}
```

### Trigger Agent Directly

```
POST /api/mrblue/agents/:agentId/execute
```

```json
{
  "task": {
    "type": "audit",
    "target": "/events"
  }
}
```

### Get Agent Status

```
GET /api/mrblue/agents/:agentId/status
```

### List All Agents

```
GET /api/mrblue/agents
```

---

## 📊 WEBHOOK ENDPOINTS

Configure n8n to receive webhooks from Mr. Blue:

### Error Notifications

```
POST [your-n8n-webhook-url]/mr-blue-error

Payload:
{
  "type": "error",
  "severity": "high",
  "agent": "PageAuditService",
  "message": "Events page returned 500",
  "timestamp": "2025-12-19T10:00:00Z"
}
```

### Task Completion

```
POST [your-n8n-webhook-url]/mr-blue-complete

Payload:
{
  "type": "task_complete",
  "taskId": "abc123",
  "result": "success",
  "summary": "Fixed 3 UI issues"
}
```

### Scraper Results

```
POST [your-n8n-webhook-url]/mr-blue-scrape

Payload:
{
  "type": "scrape_complete",
  "source": "HoyMilongaScraper",
  "eventsFound": 45,
  "newEvents": 12
}
```

---

## 📁 COMMON WORKFLOWS

### 1. Daily Health Check

```yaml
Trigger: Schedule (daily at 6 AM)
Steps:
  1. HTTP Request → POST /api/mrblue/agents/page-audit/execute
  2. IF health < 90% → Send Slack notification
  3. IF errors found → Create GitHub issue
```

### 2. Event Scraping Pipeline

```yaml
Trigger: Schedule (every 4 hours)
Steps:
  1. HTTP Request → POST /api/admin/unified-scrape
  2. Wait for completion
  3. HTTP Request → GET /api/admin/unified-scraper-status
  4. IF new events → Post to Discord
  5. Log results to Google Sheets
```

### 3. Error Alert Workflow

```yaml
Trigger: Webhook (mr-blue-error)
Steps:
  1. Filter by severity (high/critical only)
  2. Send Slack alert
  3. Create PagerDuty incident if critical
  4. Log to error tracking
```

### 4. User Signup Follow-up

```yaml
Trigger: Webhook (new-user-signup)
Steps:
  1. Wait 1 day
  2. HTTP Request → POST /api/mrblue/chat
     Body: "Generate onboarding tips for user {userId}"
  3. Send personalized email via SendGrid
```

---

## 🔒 SECURITY

### API Key Management

```typescript
// Store in n8n credentials
{
  "name": "MrBlue API",
  "type": "httpHeader",
  "data": {
    "name": "Authorization",
    "value": "Bearer {{ $credentials.mrBlueApiKey }}"
  }
}
```

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| /api/mrblue/chat | 60/min |
| /api/mrblue/agents/*/execute | 30/min |
| /api/admin/* | 10/min |

### IP Whitelisting (Optional)

Add n8n server IPs to allowed list for enhanced security.

---

## 🔗 RELATED

- Webhook Endpoints: `use mb.md: n8n:webhooks`
- Agent API Map: `use mb.md: n8n:agent-map`
- Workflow Templates: `use mb.md: n8n:templates`

---

*Automate everything. Sleep peacefully.*

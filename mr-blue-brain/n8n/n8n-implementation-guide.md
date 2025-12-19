# n8n Implementation Guide for Mr. Blue

**Invocation:** `use mb.md: n8n:implementation`

---

## 🎯 CRITICAL NOTIFICATION CHANNELS

**ALL notifications must use:**
1. **Mundo Tango Platform** - `/api/notifications` endpoint
2. **Slack** - Team communication channel

**NEVER use:**
- ❌ Discord
- ❌ Email (except for user-facing transactional emails)
- ❌ External notification services

---

## 📋 REQUIRED N8N CREDENTIALS

### 1. Mr. Blue API Credentials
```json
{
  "name": "MrBlue API",
  "type": "headerAuth",
  "data": {
    "name": "Authorization",
    "value": "Bearer {{MRBLUE_API_KEY}}"
  }
}
```

### 2. Slack Credentials
```json
{
  "name": "Slack",
  "type": "slackApi",
  "data": {
    "accessToken": "{{SLACK_BOT_TOKEN}}"
  }
}
```

### 3. Mundo Tango Internal API
```json
{
  "name": "Mundo Tango Internal",
  "type": "headerAuth",
  "data": {
    "name": "Authorization",
    "value": "Bearer {{INTERNAL_API_KEY}}"
  }
}
```

---

## 🔧 REQUIRED ENDPOINTS FOR MR. BLUE

### Notification Endpoint
```
POST https://mundo-tango.replit.app/api/notifications
{
  "type": "system|alert|info|error",
  "severity": "low|medium|high|critical",
  "title": "string",
  "message": "string",
  "source": "n8n|mr-blue",
  "metadata": {
    "workflowId": "string",
    "timestamp": "ISO8601"
  }
}
```

### Scraper Status Endpoint
```
GET https://mundo-tango.replit.app/api/admin/scrapers/status
Response: {
  "scrapers": [
    {
      "id": "string",
      "name": "string",
      "status": "idle|running|error",
      "lastRun": "ISO8601",
      "nextRun": "ISO8601",
      "eventsScraped": number
    }
  ]
}
```

### Health Check Endpoint
```
GET https://mundo-tango.replit.app/api/health
Response: {
  "status": "healthy|degraded|down",
  "services": {
    "database": "up|down",
    "cache": "up|down",
    "mrblue": "up|down"
  },
  "metrics": {
    "uptime": number,
    "responseTime": number
  }
}
```

---

## 🔄 CORE WORKFLOWS (UPDATED)

### 1. Daily Health Check & Alert
**Schedule:** 6 AM daily (EST)
**Nodes:**
1. Schedule Trigger (6 AM daily)
2. HTTP Request → `GET /api/health`
3. IF (health.status !== "healthy")
4. HTTP Request → `POST /api/notifications` (Internal alert)
5. Slack → Post to #alerts channel

### 2. Event Scraping Pipeline
**Schedule:** Every 4 hours
**Nodes:**
1. Schedule Trigger (0 */4 * * *)
2. HTTP Request → `POST /api/admin/unified-scrape`
3. Wait (5 minutes)
4. HTTP Request → `GET /api/admin/unified-scraper-status`
5. IF (newEvents > 0)
6. HTTP Request → `POST /api/notifications` (New events notification)
7. Slack → Post to #events channel

### 3. Error Alert Pipeline
**Trigger:** Webhook from Mr. Blue
**Nodes:**
1. Webhook Trigger (`/webhook/mr-blue-error`)
2. Switch (Route by severity)
   - Critical → Slack #alerts + Internal notification
   - High → Slack #alerts
   - Medium/Low → Internal notification only
3. HTTP Request → `POST /api/notifications`
4. Slack (conditional)

### 4. Scraper Monitoring
**Schedule:** Every 30 minutes
**Nodes:**
1. Schedule Trigger (*/30 * * * *)
2. HTTP Request → `GET /api/admin/scrapers/status`
3. Code → Check for stuck/failed scrapers
4. IF (issues found)
5. HTTP Request → `POST /api/notifications`
6. Slack → Post to #alerts

### 5. Weekly Analytics Report
**Schedule:** Monday 9 AM (EST)
**Nodes:**
1. Schedule Trigger (0 9 * * 1)
2. HTTP Request → `GET /api/admin/dashboard`
3. HTTP Request → `GET /api/mrblue/agents?includeMetrics=true`
4. Code → Format report
5. HTTP Request → `POST /api/notifications`
6. Slack → Post to #weekly-reports

---

## 🔐 ENVIRONMENT VARIABLES

```bash
# Required in n8n
MUNDO_TANGO_URL=https://mundo-tango.replit.app
MRBLUE_API_KEY=your_api_key_here
INTERNAL_API_KEY=your_internal_key_here
SLACK_BOT_TOKEN=xoxb-your-slack-token
SLACK_ALERTS_CHANNEL_ID=C1234567890
SLACK_EVENTS_CHANNEL_ID=C0987654321
SLACK_REPORTS_CHANNEL_ID=C5555555555
```

---

## 📊 WEBHOOK CONFIGURATION

Mr. Blue should send webhooks to n8n for:

### Error Events
```
POST https://boddye.app.n8n.cloud/webhook/mr-blue-error
{
  "type": "error",
  "severity": "critical|high|medium|low",
  "agent": "string",
  "message": "string",
  "stack": "string",
  "timestamp": "ISO8601"
}
```

### Task Completion
```
POST https://boddye.app.n8n.cloud/webhook/mr-blue-task
{
  "type": "task_complete",
  "taskId": "string",
  "status": "success|failure",
  "agent": "string",
  "duration": number,
  "result": {}
}
```

### Scraping Events
```
POST https://boddye.app.n8n.cloud/webhook/mr-blue-scrape
{
  "type": "scrape_complete",
  "source": "string",
  "status": "success|error",
  "eventsFound": number,
  "newEvents": number,
  "errors": []
}
```

---

## 🛠️ ADDITIONAL CAPABILITIES NEEDED

### 1. Database Direct Access (Optional)
**Purpose:** Query Supabase for analytics without API overhead
```json
{
  "name": "Supabase Direct",
  "type": "postgres",
  "data": {
    "host": "{{SUPABASE_HOST}}",
    "database": "postgres",
    "user": "{{SUPABASE_USER}}",
    "password": "{{SUPABASE_PASSWORD}}",
    "ssl": true
  }
}
```

### 2. Replit Deployment Webhook
**Purpose:** Trigger workflows on deployments
```
POST https://boddye.app.n8n.cloud/webhook/replit-deploy
{
  "event": "deployment_success|deployment_failure",
  "commit": "string",
  "branch": "string",
  "timestamp": "ISO8601"
}
```

### 3. User Activity Monitoring
**Purpose:** Track significant user actions
```
POST https://boddye.app.n8n.cloud/webhook/user-activity
{
  "userId": "string",
  "action": "signup|upgrade|churn|event_create",
  "metadata": {}
}
```

---

## 📈 METRICS TO TRACK

Mr. Blue should expose these metrics via `/api/mrblue/metrics`:

```json
{
  "agents": {
    "total": 140,
    "active": 45,
    "idle": 95
  },
  "performance": {
    "avgResponseTime": 234,
    "requestsPerHour": 156,
    "errorRate": 0.02
  },
  "scrapers": {
    "totalRuns": 1234,
    "successRate": 0.98,
    "eventsScraped": 5678
  },
  "health": {
    "score": 95,
    "issues": []
  }
}
```

---

## 🔄 WORKFLOW PATTERNS

### Pattern 1: Notification Flow
```
Trigger → Check Condition → POST /api/notifications → Slack (if critical)
```

### Pattern 2: Monitoring Flow
```
Schedule → GET Status → Analyze → Alert if Issue → Log
```

### Pattern 3: Event Processing
```
Webhook → Validate → Transform → Store → Notify
```

---

## 🚨 ERROR HANDLING

### Retry Logic
- HTTP requests: 3 retries with exponential backoff
- Webhooks: 5 retries over 24 hours
- API calls: Circuit breaker pattern

### Fallback Notifications
1. Primary: Internal notification API
2. Fallback: Slack direct message
3. Last resort: Log to n8n execution log

---

## 📝 WORKFLOW NAMING CONVENTION

```
Mr Blue - [Purpose] - [Frequency/Trigger]

Examples:
- Mr Blue - Health Check - Daily 6AM
- Mr Blue - Event Scraping - Every 4h
- Mr Blue - Error Alert - Webhook
- Mr Blue - Analytics Report - Weekly Monday
```

---

## ✅ CHECKLIST FOR FULL N8N FUNCTIONALITY

- [ ] All 5 core workflows created and active
- [ ] Credentials configured (MrBlue API, Slack, Internal API)
- [ ] Environment variables set
- [ ] Webhook endpoints registered in Mr. Blue
- [ ] Notification API endpoint implemented
- [ ] Slack channels created (#alerts, #events, #weekly-reports)
- [ ] Test runs completed for all workflows
- [ ] Error handling tested
- [ ] Monitoring dashboard configured
- [ ] Documentation shared with team

---

## 🔗 INTEGRATION DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                      N8N WORKFLOWS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │   Schedule   │───▶│  Mr. Blue    │───▶│ Mundo Tango │  │
│  │   Triggers   │    │     API      │    │     API     │  │
│  └──────────────┘    └──────────────┘    └─────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │   Webhooks   │───▶│   Analytics  │───▶│    Slack    │  │
│  │   Receivers  │    │  Processing  │    │   Alerts    │  │
│  └──────────────┘    └──────────────┘    └─────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Last Updated:** December 19, 2025
**Version:** 1.0.0
**Status:** Production Ready

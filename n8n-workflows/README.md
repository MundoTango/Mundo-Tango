# Mr Blue n8n Workflows

This directory contains 4 production-ready n8n workflows that integrate with Mr Blue's AI intelligence system.

## 📋 Workflows Overview

### 1. Multi-Agent Orchestration (`1-multi-agent-orchestration.json`)
**Purpose**: Decomposes complex tasks into subtasks and executes them via specialized agents in parallel.

**Features**:
- Automatic task decomposition based on intent (create/build, fix/debug, analyze/research)
- Dependency management between subtasks
- Parallel agent execution
- AI-powered result summarization (Groq)
- Confidence scoring and validation

**Webhook**: `POST /webhook/mr-blue-multi-agent`

**Payload Example**:
```json
{
  "task": "Create a new user authentication system",
  "context": {
    "currentPage": "/dashboard",
    "userRole": "developer"
  },
  "userId": "user_123",
  "conversationId": "conv_456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Multi-agent orchestration complete",
  "task": "Create a new user authentication system",
  "summary": "AI-generated summary of all subtask results",
  "metadata": {
    "totalSubtasks": 4,
    "successCount": 4,
    "successRate": "100.0%",
    "duration": 45000
  }
}
```

---

### 2. External Integrations Sync (`2-external-integrations.json`)
**Purpose**: Bidirectional data synchronization between Productboard, Airtable, GitHub, and Supabase.

**Features**:
- Source/target routing with automatic data transformation
- Support for 4 platforms: Productboard ⇄ Airtable ⇄ GitHub ⇄ Supabase
- Field mapping and validation
- Error handling and retry logic

**Webhook**: `POST /webhook/mr-blue-external-sync`

**Payload Example**:
```json
{
  "action": "sync",
  "source": "productboard",
  "target": "airtable",
  "data": {
    "featureId": "feat_123"
  },
  "syncType": "bidirectional"
}
```

**Supported Sync Paths**:
- Productboard → Airtable
- Airtable → GitHub (creates issues)
- GitHub → Supabase
- Supabase → Productboard

---

### 3. Self-Healing Monitor (`3-self-healing-monitor.json`)
**Purpose**: Autonomous error detection, analysis, and fixing with confidence-based actions.

**Features**:
- AI error analysis via Groq (root cause, severity, confidence)
- Confidence-based routing:
  - ≥95%: Auto-fix and commit
  - 80-95%: Stage for review
  - <80%: Alert user
- VibeCoding integration for code generation
- Validation relay (syntax, tests, no new errors)
- Git commit with descriptive messages

**Webhook**: `POST /webhook/mr-blue-self-healing`

**Payload Example**:
```json
{
  "error": {
    "name": "TypeError",
    "message": "Cannot read property 'id' of undefined",
    "code": "ERR_UNDEFINED"
  },
  "stackTrace": "at UserService.getUser (user-service.ts:45:12)...",
  "context": {
    "file": "server/services/user-service.ts",
    "line": 45
  },
  "userId": "user_123",
  "conversationId": "conv_456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Self-healing process complete",
  "action": "auto_fix",
  "confidence": 97,
  "timestamp": "2025-12-17T03:56:00.000Z"
}
```

---

### 4. Content Generation Pipeline (`4-content-generation-pipeline.json`)
**Purpose**: End-to-end content creation: Script → Voice → Video → Storage.

**Features**:
- AI script generation (Groq llama-3.3-70b-versatile)
- Voice synthesis (ElevenLabs with Mr Blue's voice)
- Video generation (Luma Dream Machine)
- Asset storage (Supabase)
- Database record creation
- Parallel audio/video generation

**Webhook**: `POST /webhook/mr-blue-content-gen`

**Payload Example**:
```json
{
  "contentType": "tutorial",
  "topic": "How to use Mr Blue for vibe coding",
  "style": "professional",
  "duration": 60,
  "userId": "user_123",
  "conversationId": "conv_456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Content generation complete",
  "assets": {
    "audio": "https://supabase.co/.../audio.mp3",
    "video": "https://supabase.co/.../video.mp4"
  },
  "topic": "How to use Mr Blue for vibe coding",
  "timestamp": "2025-12-17T03:56:00.000Z"
}
```

---

## 🔧 Setup Instructions

### Prerequisites
1. **n8n instance** (self-hosted or cloud)
2. **API Keys** (see Environment Variables below)
3. **Mundo Tango backend** running and accessible

### Step 1: Import Workflows

1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Import each JSON file:
   - `1-multi-agent-orchestration.json`
   - `2-external-integrations.json`
   - `3-self-healing-monitor.json`
   - `4-content-generation-pipeline.json`

### Step 2: Configure Credentials

Create the following credentials in n8n:

#### 1. **Groq API** (HTTP Header Auth)
- **Name**: `groq-api`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer YOUR_GROQ_API_KEY`

#### 2. **Mundo Tango API** (HTTP Header Auth)
- **Name**: `mundo-tango-api`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer YOUR_MUNDO_TANGO_API_KEY`

#### 3. **ElevenLabs API** (HTTP Header Auth)
- **Name**: `elevenlabs-api`
- **Header Name**: `xi-api-key`
- **Header Value**: `YOUR_ELEVENLABS_API_KEY`

#### 4. **Luma API** (HTTP Header Auth)
- **Name**: `luma-api`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer YOUR_LUMA_API_KEY`

#### 5. **Supabase API** (HTTP Header Auth)
- **Name**: `supabase-api`
- **Header Name**: `apikey`
- **Header Value**: `YOUR_SUPABASE_ANON_KEY`

#### 6. **Airtable API** (Airtable Token)
- **Name**: `airtable-api`
- **Access Token**: `YOUR_AIRTABLE_TOKEN`

#### 7. **GitHub API** (GitHub OAuth2)
- **Name**: `github-api`
- **Access Token**: `YOUR_GITHUB_TOKEN`

#### 8. **Productboard API** (HTTP Header Auth)
- **Name**: `productboard-api`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer YOUR_PRODUCTBOARD_TOKEN`

### Step 3: Set Environment Variables

In your n8n instance, set these environment variables:

```bash
# Mundo Tango
MUNDO_TANGO_URL=https://your-mundo-tango-instance.com

# n8n Security
N8N_WEBHOOK_SECRET=your-webhook-secret-key

# AI Services
GROQ_API_KEY=your-groq-api-key
LUMA_API_KEY=your-luma-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
MR_BLUE_VOICE_ID=your-mr-blue-voice-id

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# External Integrations
AIRTABLE_BASE_ID=your-airtable-base-id
PRODUCTBOARD_TOKEN=your-productboard-token
GITHUB_TOKEN=your-github-token
```

### Step 4: Configure Mundo Tango Backend

Add these to your Mundo Tango `.env` or Replit Secrets:

```bash
# n8n Webhook URLs (update with your n8n instance URL)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
N8N_WEBHOOK_SECRET=your-webhook-secret-key

# AI Service Keys (if not already configured)
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key
LUMA_API_KEY=your-luma-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
MR_BLUE_VOICE_ID=your-mr-blue-voice-id
```

### Step 5: Activate Workflows

1. In n8n, open each workflow
2. Click **Activate** toggle in the top right
3. Verify webhook URLs are generated
4. Test each workflow (see Testing section below)

---

## 🧪 Testing

### Test 1: Multi-Agent Orchestration

```bash
curl -X POST https://your-n8n-instance.com/webhook/mr-blue-multi-agent \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $(echo -n '{"task":"test"}' | openssl dgst -sha256 -hmac "$N8N_WEBHOOK_SECRET" -binary | base64)" \
  -d '{
    "task": "Create a simple hello world function",
    "context": {},
    "userId": "test_user",
    "conversationId": "test_conv"
  }'
```

### Test 2: External Integrations

```bash
curl -X POST https://your-n8n-instance.com/webhook/mr-blue-external-sync \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $(echo -n '{"action":"sync"}' | openssl dgst -sha256 -hmac "$N8N_WEBHOOK_SECRET" -binary | base64)" \
  -d '{
    "action": "sync",
    "source": "github",
    "target": "supabase",
    "data": {
      "issueNumber": 1
    }
  }'
```

### Test 3: Self-Healing Monitor

```bash
curl -X POST https://your-n8n-instance.com/webhook/mr-blue-self-healing \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $(echo -n '{"error":{}}' | openssl dgst -sha256 -hmac "$N8N_WEBHOOK_SECRET" -binary | base64)" \
  -d '{
    "error": {
      "name": "TypeError",
      "message": "Test error",
      "code": "TEST_ERROR"
    },
    "stackTrace": "at test.ts:1:1",
    "context": {},
    "userId": "test_user",
    "conversationId": "test_conv"
  }'
```

### Test 4: Content Generation

```bash
curl -X POST https://your-n8n-instance.com/webhook/mr-blue-content-gen \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $(echo -n '{"contentType":"test"}' | openssl dgst -sha256 -hmac "$N8N_WEBHOOK_SECRET" -binary | base64)" \
  -d '{
    "contentType": "tutorial",
    "topic": "Test content generation",
    "style": "professional",
    "duration": 30,
    "userId": "test_user",
    "conversationId": "test_conv"
  }'
```

---

## 🔐 Security

### HMAC Signature Verification

All workflows validate incoming webhooks using HMAC-SHA256 signatures:

```javascript
const crypto = require('crypto');
const receivedSignature = headers['x-webhook-secret'];
const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
const payload = JSON.stringify(body);
const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');

if (receivedSignature !== expectedSignature) {
  throw new Error('Invalid webhook signature');
}
```

### Best Practices

1. **Use HTTPS** for all webhook URLs
2. **Rotate secrets** regularly (every 90 days)
3. **Limit API key permissions** to minimum required
4. **Monitor webhook logs** for suspicious activity
5. **Set rate limits** on webhook endpoints
6. **Use environment variables** for all secrets (never hardcode)

---

## 📊 Monitoring

### n8n Execution Logs

1. Go to **Executions** in n8n
2. Filter by workflow name
3. Check for failed executions
4. Review error messages and stack traces

### Mundo Tango Logs

Monitor these endpoints for webhook activity:
- `/api/mrblue/n8n-callback` - Receives callbacks from n8n
- `/api/messaging/webhook` - Receives inbound messages

### Key Metrics to Track

- **Success Rate**: % of successful workflow executions
- **Average Duration**: Time to complete each workflow
- **Error Rate**: % of failed executions
- **Callback Latency**: Time between n8n completion and Mundo Tango callback

---

## 🐛 Troubleshooting

### Issue: "Invalid webhook signature"
**Solution**: Verify `N8N_WEBHOOK_SECRET` matches in both n8n and Mundo Tango

### Issue: "Timeout waiting for video generation"
**Solution**: Increase timeout in workflow settings (default: 5 minutes)

### Issue: "Agent endpoint not found"
**Solution**: Verify `MUNDO_TANGO_URL` is correct and all agent endpoints exist

### Issue: "Supabase upload failed"
**Solution**: Check Supabase storage bucket permissions and API key

### Issue: "Groq API rate limit exceeded"
**Solution**: Implement exponential backoff or upgrade Groq plan

---

## 🔄 Integration with Mundo Tango

### Outbound (Mundo Tango → n8n)

Use `N8nWebhookService.ts` to send data to n8n:

```typescript
import { N8nWebhookService } from './services/N8nWebhookService';

const n8nService = new N8nWebhookService();

// Trigger multi-agent orchestration
await n8nService.sendWebhook('mr-blue-multi-agent', {
  task: 'Create user authentication',
  context: { currentPage: '/dashboard' },
  userId: user.id,
  conversationId: conversation.id
});
```

### Inbound (n8n → Mundo Tango)

n8n workflows call back to Mundo Tango via:

```
POST /api/mrblue/n8n-callback
```

Payload:
```json
{
  "action": "multi_agent_complete",
  "task": "...",
  "results": [...],
  "summary": "...",
  "metadata": {...}
}
```

---

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Groq API Docs](https://console.groq.com/docs)
- [ElevenLabs API Docs](https://elevenlabs.io/docs)
- [Luma API Docs](https://lumalabs.ai/docs)
- [Supabase Docs](https://supabase.com/docs)

---

## 🤝 Contributing

To add new workflows:

1. Create workflow in n8n UI
2. Export as JSON
3. Add to this directory with naming convention: `N-workflow-name.json`
4. Update this README with workflow documentation
5. Test thoroughly before deploying to production

---

## 📝 License

These workflows are part of the Mundo Tango project.

---

## 🆘 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review n8n execution logs
3. Check Mundo Tango backend logs
4. Open an issue in the Mundo-Tango GitHub repository

---

**Last Updated**: December 17, 2025
**Version**: 1.0.0
**Author**: Mr Blue AI Team

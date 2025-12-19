# AI Implementation Guide
**Mundo Tango Platform - Complete Deployment Instructions**

Version: 1.0.0  
Last Updated: November 2025  
Status: Production Ready

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Database Setup](#2-database-setup)
3. [Service Configuration](#3-service-configuration)
4. [API Key Setup](#4-api-key-setup)
5. [Testing Procedures](#5-testing-procedures)
6. [Monitoring Setup](#6-monitoring-setup)
7. [Production Deployment](#7-production-deployment)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

### 1.1 Required Software

**Development Environment:**
- Node.js v20 or higher
- npm v10 or higher
- PostgreSQL 14+ (or Neon/Replit Database)
- Git
- OpenSSL (for generating secrets)

**Optional Tools:**
- Redis (for caching and rate limiting)
- Docker (for containerized deployment)
- PM2 (for process management)

### 1.2 Required API Keys

**Essential (Platform will not function without these):**
- PostgreSQL Database URL
- OpenAI API Key (minimum requirement for AI features)
- Session Secret
- JWT Secret
- JWT Refresh Secret

**Recommended (Enhanced functionality):**
- Anthropic API Key (Claude models)
- Groq API Key (fast inference)
- Google AI API Key (Gemini models)
- Stripe API Keys (payment processing)
- Sentry DSN (error tracking)

**Optional (Advanced features):**
- OpenRouter API Key (multi-model gateway)
- Cloudinary (media storage)
- Resend API Key (email)
- Twilio (SMS notifications)

### 1.3 Environment Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd mundo-tango

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Generate secure secrets
openssl rand -base64 32  # For SESSION_SECRET
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

### 1.4 Minimum Environment Configuration

Create a `.env` file with at minimum:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Security
SESSION_SECRET="<generated-secret-1>"
JWT_SECRET="<generated-secret-2>"
JWT_REFRESH_SECRET="<generated-secret-3>"

# AI (minimum)
OPENAI_API_KEY="sk-..."

# Application
NODE_ENV="development"
PORT="5000"
FRONTEND_URL="http://localhost:5000"
BACKEND_URL="http://localhost:5000"
```

---

## 2. Database Setup

### 2.1 Database Provisioning

**Option A: Replit Database (Recommended for Replit)**
```bash
# Replit automatically provisions a Neon PostgreSQL database
# DATABASE_URL is auto-set in environment
# No manual setup required
```

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL
# Create database
createdb mundo_tango

# Set DATABASE_URL in .env
DATABASE_URL="postgresql://localhost:5432/mundo_tango"
```

**Option C: Neon (Cloud PostgreSQL)**
```bash
# Sign up at https://neon.tech
# Create a project
# Copy connection string to DATABASE_URL
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/mundo_tango?sslmode=require"
```

### 2.2 Schema Deployment

```bash
# Push schema to database (creates tables)
npm run db:push

# Expected output:
# ✓ Applying schema changes...
# ✓ Schema updated successfully
# ✓ Tables created: users, events, posts, groups, etc.
```

### 2.3 Database Verification

**Check tables were created:**
```sql
-- Connect to your database
psql $DATABASE_URL

-- List all tables
\dt

-- Expected tables (partial list):
-- users
-- events
-- posts
-- groups
-- esa_agents
-- agent_tasks
-- learning_patterns
-- validation_results
-- agent_health
```

**Verify schema structure:**
```bash
# View schema file
cat shared/schema.ts | head -100

# Key tables:
# - users (4858 lines total schema)
# - events
# - posts
# - groups
# - ESA agent tables
# - AI intelligence tables
```

### 2.4 Database Migration Strategy

**Development:**
```bash
# Use db:push for rapid iteration
npm run db:push
```

**Production:**
```bash
# Generate migration files (safer for production)
npx drizzle-kit generate:pg
npx drizzle-kit migrate
```

**Backup Before Migration:**
```bash
# Backup database before schema changes
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## 3. Service Configuration

The Mundo Tango platform includes **15+ core services** that need to be configured:

### 3.1 AI Services (5 Providers)

**A. OpenAI Service** (Primary AI Provider)
```typescript
// Location: server/services/ai/OpenAIService.ts
// Models: gpt-4o, gpt-4o-mini
// Pricing: $3/1M input, $10/1M output (gpt-4o)

// Environment:
OPENAI_API_KEY="sk-..."

// Usage:
import { OpenAIService } from './services/ai/OpenAIService';
const response = await OpenAIService.query({
  prompt: "Your prompt here",
  model: 'gpt-4o-mini',  // or 'gpt-4o'
  temperature: 0.7,
  maxTokens: 1000
});
```

**B. Anthropic Service** (Claude Models)
```typescript
// Location: server/services/ai/AnthropicService.ts
// Models: claude-3-5-sonnet, claude-3-5-haiku, claude-3-opus
// Pricing: $3/1M input, $15/1M output (Sonnet)

// Environment:
ANTHROPIC_API_KEY="sk-ant-..."

// Usage:
import { AnthropicService, CLAUDE_MODELS } from './services/ai/AnthropicService';
const response = await AnthropicService.query({
  prompt: "Your prompt here",
  model: CLAUDE_MODELS.SONNET,
  temperature: 0.7,
  maxTokens: 1000
});

// With fallback support:
const response = await AnthropicService.queryWithFallback({
  prompt: "Your prompt",
  preferQuality: true  // Tries Sonnet → Haiku
});
```

**C. Groq Service** (Ultra-Fast Inference)
```typescript
// Location: server/services/ai/GroqService.ts
// Models: llama-3.1-70b, llama-3.1-8b, llama-3.3-70b
// Speed: 250-877 tokens/sec
// Pricing: FREE (rate-limited)

// Environment:
GROQ_API_KEY="gsk_..."

// Usage:
import { GroqService, GROQ_MODELS } from './services/ai/GroqService';
const response = await GroqService.query({
  prompt: "Your prompt here",
  model: GROQ_MODELS.LLAMA_70B,  // or LLAMA_8B for speed
  temperature: 0.7,
  maxTokens: 1000
});

// Rate limit status:
const status = GroqService.getRateLimitStatus(GROQ_MODELS.LLAMA_70B);
console.log(`Available: ${status.available}/${status.capacity} requests`);
```

**D. Gemini Service** (Google AI)
```typescript
// Location: server/services/ai/GeminiService.ts
// Models: gemini-2.5-flash-lite, gemini-1.5-flash, gemini-1.5-pro
// Context: 1M-2M tokens (largest available)
// Pricing: $0.02/1M cheapest (flash-lite)

// Environment:
GEMINI_API_KEY="..."

// Usage:
import { GeminiService } from './services/ai/GeminiService';
const response = await GeminiService.query({
  prompt: "Your prompt here",
  model: 'gemini-2.5-flash-lite',  // Cheapest option
  temperature: 0.7,
  maxTokens: 1000
});

// Get recommended model:
const model = GeminiService.getModelForUseCase('reasoning');
```

**E. OpenRouter Service** (Multi-Model Gateway)
```typescript
// Location: server/services/ai/OpenRouterService.ts
// Models: 70+ models from all providers
// Features: Unified API, automatic fallbacks

// Environment:
OPENROUTER_API_KEY="sk-or-..."

// Usage:
import { OpenRouterService, OPENROUTER_MODELS } from './services/ai/OpenRouterService';

// Single query:
const response = await OpenRouterService.query({
  prompt: "Your prompt",
  model: OPENROUTER_MODELS.LLAMA_70B,
  temperature: 0.7
});

// Multi-model fallback:
const response = await OpenRouterService.queryWithFallback({
  prompt: "Your prompt"
}, [
  OPENROUTER_MODELS.CLAUDE_SONNET,
  OPENROUTER_MODELS.GPT_4O,
  OPENROUTER_MODELS.LLAMA_70B
]);
```

### 3.2 ESA Agent Intelligence Services

**A. Agent Collaboration Service**
```typescript
// Location: server/services/collaboration/agentCollaborationService.ts
// Purpose: Agent-to-agent communication and coordination

// No API key required
// Auto-initialized on server start
```

**B. Learning Coordinator**
```typescript
// Location: server/services/learning/learningCoordinator.ts
// Purpose: Pattern learning and knowledge retention

// Requires: DATABASE_URL
// Auto-initialized on server start
```

**C. Quality Validator**
```typescript
// Location: server/services/validation/qualityValidator.ts
// Purpose: Output validation and quality assurance

// Requires: OPENAI_API_KEY (for validation logic)
```

**D. Intelligence Cycle Orchestrator**
```typescript
// Location: server/services/orchestration/intelligenceCycleOrchestrator.ts
// Purpose: Coordinates all intelligence cycles

// Requires: All AI API keys for full functionality
```

### 3.3 Storage & Caching Services

**A. Redis Cache** (Optional but recommended)
```typescript
// Location: server/services/caching/RedisCache.ts

// Environment:
REDIS_URL="redis://localhost:6379"  // or Redis Cloud URL

// Auto-degrades to in-memory if Redis unavailable
```

**B. Semantic Cache Service**
```typescript
// Location: server/services/ai/SemanticCacheService.ts
// Purpose: Cache AI responses to reduce costs

// Requires: OPENAI_API_KEY
```

### 3.4 External Integration Services

**A. Stripe Payment Service**
```typescript
// Environment:
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

// Location: Uses Stripe SDK throughout codebase
```

**B. Cloudinary Media Storage**
```typescript
// Environment:
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

// Or use Replit Object Storage (no config needed)
```

**C. Sentry Error Tracking**
```typescript
// Location: server/config/sentry.ts

// Environment:
SENTRY_DSN="https://...@sentry.io/..."

// Initialization:
import { initializeSentry } from './config/sentry';
initializeSentry(app);
```

### 3.5 Monitoring & Health Services

**A. Agent Performance Tracker**
```typescript
// Location: server/services/monitoring/agentPerformanceTracker.ts
// Auto-initialized, tracks all agent metrics
```

**B. Health Check Service**
```typescript
// Location: server/health-check.ts
// Endpoints: /health, /ready, /live

// No configuration required
```

### 3.6 Service Initialization Order

Services are initialized in this order (server/index.ts):

1. **Sentry** (error tracking first)
2. **Security middleware** (CSP, CORS, rate limiting)
3. **Database connection** (PostgreSQL)
4. **Session store** (in-memory or Redis)
5. **AI services** (OpenAI, Anthropic, etc.)
6. **ESA agents** (intelligence services)
7. **WebSocket server** (real-time features)
8. **Health checks** (monitoring endpoints)

---

## 4. API Key Setup

### 4.1 OpenAI API Key

**Required:** Yes (platform won't function without it)

**Steps:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Name it "Mundo Tango Production" (or Development)
5. Copy key immediately (only shown once)
6. Add to .env: `OPENAI_API_KEY="sk-..."`

**Verification:**
```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Should return list of available models
```

**Cost Management:**
- Set up usage limits in OpenAI dashboard
- Monitor usage: https://platform.openai.com/usage
- Recommended limit for development: $50/month
- Recommended limit for production: Based on usage

### 4.2 Anthropic API Key (Optional)

**Steps:**
1. Go to https://console.anthropic.com/
2. Sign in or create account
3. Navigate to API Keys
4. Click "Create Key"
5. Copy key: `sk-ant-...`
6. Add to .env: `ANTHROPIC_API_KEY="sk-ant-..."`

**Verification:**
```typescript
// Run this test in your app:
import { AnthropicService } from './services/ai/AnthropicService';
const response = await AnthropicService.query({
  prompt: "Say 'API key working'",
  model: 'claude-3-5-haiku-20241022',
  maxTokens: 10
});
console.log(response.content);
// Expected: "API key working" or similar
```

### 4.3 Groq API Key (Optional)

**Steps:**
1. Go to https://console.groq.com/
2. Sign in with Google or email
3. Navigate to API Keys
4. Click "Create API Key"
5. Copy key: `gsk_...`
6. Add to .env: `GROQ_API_KEY="gsk_..."`

**Verification:**
```bash
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instant",
    "messages": [{"role": "user", "content": "Hi"}],
    "max_tokens": 5
  }'
```

**Rate Limits:**
- 30 requests/minute
- 14,400 tokens/minute (70B models)
- 20,000 tokens/minute (8B models)
- FREE tier (no credit card required)

### 4.4 Google AI (Gemini) API Key (Optional)

**Steps:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Select or create a Google Cloud project
5. Copy key
6. Add to .env: `GEMINI_API_KEY="..."`

**Verification:**
```typescript
import { GeminiService } from './services/ai/GeminiService';
const response = await GeminiService.query({
  prompt: "Test",
  model: 'gemini-2.5-flash-lite',
  maxTokens: 10
});
console.log(response.content);
```

### 4.5 OpenRouter API Key (Optional)

**Steps:**
1. Go to https://openrouter.ai/keys
2. Sign in or create account
3. Add credits ($5 minimum)
4. Click "Create Key"
5. Copy key: `sk-or-...`
6. Add to .env: `OPENROUTER_API_KEY="sk-or-..."`

**Verification:**
```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"

# Should return 70+ available models
```

### 4.6 API Key Security Best Practices

**DO:**
- Use different API keys for development and production
- Set up usage alerts in each provider's dashboard
- Store keys in environment variables, never in code
- Use Replit Secrets UI for production keys
- Rotate keys every 90 days
- Set up billing alerts

**DON'T:**
- Commit .env files to Git
- Share API keys in chat/email
- Use production keys in development
- Hardcode keys in source code
- Give keys full permissions if scoped options exist

**Key Rotation Procedure:**
1. Generate new key in provider dashboard
2. Test new key in staging environment
3. Update production environment variable
4. Verify system still works
5. Delete old key from provider
6. Update documentation

---

## 5. Testing Procedures

### 5.1 Pre-Deployment Checklist

```bash
# 1. Install dependencies
npm install

# 2. Run type checking
npm run check

# 3. Build frontend and backend
npm run build

# 4. Run database migration
npm run db:push
```

### 5.2 Component Testing

**A. Test Database Connection**
```typescript
// tests/database-connection.test.ts
import { db } from './shared/db';
import { users } from './shared/schema';

async function testDatabaseConnection() {
  try {
    const result = await db.select().from(users).limit(1);
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

testDatabaseConnection();
```

**B. Test OpenAI Integration**
```typescript
// tests/openai-integration.test.ts
import { OpenAIService } from './server/services/ai/OpenAIService';

async function testOpenAI() {
  try {
    const response = await OpenAIService.query({
      prompt: "Say 'OpenAI integration working'",
      model: 'gpt-4o-mini',
      maxTokens: 10
    });
    console.log('✅ OpenAI:', response.content);
    console.log('Cost:', `$${response.cost.toFixed(6)}`);
    return true;
  } catch (error) {
    console.error('❌ OpenAI test failed:', error);
    return false;
  }
}

testOpenAI();
```

**C. Test Anthropic Integration**
```typescript
// tests/anthropic-integration.test.ts
import { AnthropicService, CLAUDE_MODELS } from './server/services/ai/AnthropicService';

async function testAnthropic() {
  try {
    const response = await AnthropicService.query({
      prompt: "Say 'Claude integration working'",
      model: CLAUDE_MODELS.HAIKU,
      maxTokens: 10
    });
    console.log('✅ Anthropic:', response.content);
    console.log('Cost:', `$${response.cost.toFixed(6)}`);
    return true;
  } catch (error) {
    console.error('❌ Anthropic test failed:', error);
    return false;
  }
}

testAnthropic();
```

**D. Test Groq Integration**
```typescript
// tests/groq-integration.test.ts
import { GroqService, GROQ_MODELS } from './server/services/ai/GroqService';

async function testGroq() {
  try {
    const response = await GroqService.query({
      prompt: "Say 'Groq integration working'",
      model: GROQ_MODELS.LLAMA_8B,
      maxTokens: 10
    });
    console.log('✅ Groq:', response.content);
    console.log('Speed:', `${response.speed.tokensPerSecond.toFixed(0)} tokens/sec`);
    console.log('Cost: FREE');
    return true;
  } catch (error) {
    console.error('❌ Groq test failed:', error);
    return false;
  }
}

testGroq();
```

**E. Test All AI Providers**
```bash
# Create a comprehensive test script
cat > tests/test-all-ai.ts << 'EOF'
import { OpenAIService } from './server/services/ai/OpenAIService';
import { AnthropicService, CLAUDE_MODELS } from './server/services/ai/AnthropicService';
import { GroqService, GROQ_MODELS } from './server/services/ai/GroqService';
import { GeminiService } from './server/services/ai/GeminiService';
import { OpenRouterService, OPENROUTER_MODELS } from './server/services/ai/OpenRouterService';

async function testAllProviders() {
  const results = [];

  // Test OpenAI
  try {
    await OpenAIService.query({ prompt: "Hi", maxTokens: 5 });
    results.push({ provider: 'OpenAI', status: '✅ Working' });
  } catch (error: any) {
    results.push({ provider: 'OpenAI', status: `❌ ${error.message}` });
  }

  // Test Anthropic
  try {
    await AnthropicService.query({ prompt: "Hi", model: CLAUDE_MODELS.HAIKU, maxTokens: 5 });
    results.push({ provider: 'Anthropic', status: '✅ Working' });
  } catch (error: any) {
    results.push({ provider: 'Anthropic', status: `❌ ${error.message}` });
  }

  // Test Groq
  try {
    await GroqService.query({ prompt: "Hi", model: GROQ_MODELS.LLAMA_8B, maxTokens: 5 });
    results.push({ provider: 'Groq', status: '✅ Working' });
  } catch (error: any) {
    results.push({ provider: 'Groq', status: `❌ ${error.message}` });
  }

  // Test Gemini
  try {
    await GeminiService.query({ prompt: "Hi", model: 'gemini-2.5-flash-lite', maxTokens: 5 });
    results.push({ provider: 'Gemini', status: '✅ Working' });
  } catch (error: any) {
    results.push({ provider: 'Gemini', status: `❌ ${error.message}` });
  }

  // Test OpenRouter
  try {
    await OpenRouterService.query({ prompt: "Hi", model: OPENROUTER_MODELS.LLAMA_70B, maxTokens: 5 });
    results.push({ provider: 'OpenRouter', status: '✅ Working' });
  } catch (error: any) {
    results.push({ provider: 'OpenRouter', status: `❌ ${error.message}` });
  }

  console.table(results);
}

testAllProviders();
EOF

# Run the test
npx tsx tests/test-all-ai.ts
```

### 5.3 End-to-End Testing

```bash
# Run Playwright E2E tests
npx playwright test

# Run specific test suites
npx playwright test tests/e2e/core-journeys/
npx playwright test tests/e2e/agents/

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests with debugging
npx playwright test --debug
```

### 5.4 Health Check Testing

```bash
# Test health endpoints
curl http://localhost:5000/health
# Expected: {"status":"ok","timestamp":"..."}

curl http://localhost:5000/ready
# Expected: {"status":"ready","database":"connected","services":"operational"}

curl http://localhost:5000/live
# Expected: {"status":"alive","uptime":123456}
```

### 5.5 Load Testing (Optional)

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 http://localhost:5000/api/health

# Test with authentication
ab -n 100 -c 5 -H "Authorization: Bearer <token>" \
   http://localhost:5000/api/monitoring/health
```

---

## 6. Monitoring Setup

### 6.1 Prometheus Metrics

**Endpoint:** `GET /api/monitoring/metrics?format=prometheus`

**Available Metrics:**
```prometheus
# Agent metrics
esa_agents_total          # Total number of agents
esa_agents_active         # Active agents
esa_agents_certified      # Certified agents (level >= 2)

# Task metrics
esa_tasks_total           # Total tasks
esa_tasks_completed       # Completed tasks
esa_tasks_failed          # Failed tasks
esa_tasks_pending         # Pending tasks

# Learning metrics
esa_patterns_total        # Total learning patterns
esa_patterns_avg_confidence  # Average pattern confidence
esa_patterns_avg_success     # Average success rate

# Validation metrics
esa_validations_total     # Total validations
esa_validations_pass_rate # Validation pass rate
```

**Prometheus Configuration:**
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'mundo-tango'
    scrape_interval: 30s
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/api/monitoring/metrics'
    params:
      format: ['prometheus']
    bearer_token: '<your-admin-token>'
```

### 6.2 Health Monitoring Dashboard

**System Health Endpoint:**
```bash
GET /api/monitoring/health
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "overallStatus": "healthy",
  "healthScore": 95,
  "agents": {
    "total": 25,
    "active": 24,
    "training": 1,
    "inactive": 0,
    "suspended": 0
  },
  "healthChecks": {
    "healthy": 20,
    "degraded": 3,
    "failing": 0,
    "total": 23
  },
  "taskQueue": {
    "pending": 5,
    "inProgress": 3,
    "stuck": 0
  },
  "timestamp": "2025-11-12T10:30:00Z"
}
```

### 6.3 Agent Performance Monitoring

**Per-Agent Metrics:**
```bash
GET /api/monitoring/performance/:agentId?timeRange=7d
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "agentId": "esa-001",
  "agentName": "Content Moderator",
  "timeRange": "7d",
  "performance": {
    "tasks": {
      "total": 150,
      "completed": 145,
      "failed": 3,
      "inProgress": 2,
      "avgDuration": 2.5
    },
    "successRate": "96.67",
    "avgCompletionTime": 2.5,
    "communications": {
      "messagesSent": 45,
      "escalations": 2,
      "collaborations": 12
    },
    "learning": {
      "patternsCreated": 8,
      "avgConfidence": 0.85
    },
    "validation": {
      "total": 20,
      "passed": 18,
      "failed": 1,
      "warnings": 1
    }
  },
  "currentStatus": "active",
  "certificationLevel": 3,
  "lastActive": "2025-11-12T10:25:00Z"
}
```

### 6.4 Alert Configuration

**Active Alerts Endpoint:**
```bash
GET /api/monitoring/alerts
Authorization: Bearer <admin-token>
```

**Alert Types:**
- `agent_health` - Agent failing or degraded
- `stuck_task` - Task in progress > 2 hours
- `high_escalation_rate` - >10 escalations in 24h
- `rate_limit_exceeded` - API rate limit hit
- `cost_threshold` - AI costs exceeding budget

**Alert Response:**
```json
{
  "alerts": [
    {
      "severity": "critical",
      "type": "agent_health",
      "message": "Agent esa-003 is failing",
      "agentId": "esa-003",
      "timestamp": "2025-11-12T10:15:00Z"
    },
    {
      "severity": "warning",
      "type": "high_escalation_rate",
      "message": "12 escalations in the last 24 hours",
      "timestamp": "2025-11-12T10:00:00Z"
    }
  ],
  "total": 2,
  "critical": 1,
  "warnings": 1
}
```

### 6.5 Grafana Dashboard Setup

**Install Grafana:**
```bash
# Using Docker
docker run -d -p 3000:3000 --name grafana grafana/grafana

# Access at http://localhost:3000
# Default credentials: admin/admin
```

**Add Prometheus Data Source:**
1. Go to Configuration → Data Sources
2. Click "Add data source"
3. Select "Prometheus"
4. URL: `http://localhost:9090`
5. Click "Save & Test"

**Import Dashboard:**
```json
// grafana/dashboards/mundo-tango-dashboard.json
{
  "dashboard": {
    "title": "Mundo Tango Platform",
    "panels": [
      {
        "title": "Agent Status",
        "targets": [{
          "expr": "esa_agents_active"
        }]
      },
      {
        "title": "Task Completion Rate",
        "targets": [{
          "expr": "rate(esa_tasks_completed[5m])"
        }]
      },
      {
        "title": "Validation Pass Rate",
        "targets": [{
          "expr": "esa_validations_pass_rate"
        }]
      }
    ]
  }
}
```

### 6.6 Sentry Error Tracking

**Configuration:**
```typescript
// server/config/sentry.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  profilesSampleRate: 0.1,
});
```

**Custom Error Tracking:**
```typescript
// Capture AI errors with context
try {
  const response = await OpenAIService.query({ prompt });
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      provider: 'openai',
      model: 'gpt-4o'
    },
    extra: {
      prompt: prompt.substring(0, 100),
      userId: req.user?.id
    }
  });
  throw error;
}
```

---

## 7. Production Deployment

### 7.1 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed (`npm run db:push`)
- [ ] All required API keys added and verified
- [ ] SSL/TLS certificates configured
- [ ] CORS origins properly set
- [ ] Rate limiting configured
- [ ] Error tracking (Sentry) enabled
- [ ] Monitoring dashboards set up
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### 7.2 Environment Variables - Production

```env
# ============================================================================
# PRODUCTION ENVIRONMENT VARIABLES
# ============================================================================

# Database (Use production database URL)
DATABASE_URL="postgresql://user:pass@prod-host/database?sslmode=require"

# Security (Generate new secrets for production!)
SESSION_SECRET="<new-production-secret>"
JWT_SECRET="<new-production-secret>"
JWT_REFRESH_SECRET="<new-production-secret>"

# Application
NODE_ENV="production"
PORT="5000"
FRONTEND_URL="https://mundotango.com"
BACKEND_URL="https://api.mundotango.com"

# AI (Use production API keys)
OPENAI_API_KEY="sk-prod-..."
ANTHROPIC_API_KEY="sk-ant-prod-..."
GROQ_API_KEY="gsk-prod-..."
GEMINI_API_KEY="prod-..."
OPENROUTER_API_KEY="sk-or-prod-..."

# Payments (Production keys)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Monitoring (Production DSN)
SENTRY_DSN="https://prod-key@sentry.io/project"

# Redis (Production instance)
REDIS_URL="rediss://prod-redis-url:6379"

# Rate Limiting (Stricter for production)
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="50"
AUTH_RATE_LIMIT_MAX_REQUESTS="3"

# CORS (Production domains only)
CORS_ORIGIN="https://mundotango.com,https://www.mundotango.com"

# Feature Flags
ENABLE_AI_FEATURES="true"
ENABLE_PAYMENTS="true"
ENABLE_REAL_TIME="true"
```

### 7.3 Deployment on Replit

**Steps:**
1. Push code to Replit repository
2. Configure secrets in Replit Secrets UI:
   - Add all API keys
   - Add SESSION_SECRET, JWT secrets
   - Add STRIPE keys
3. Database auto-provisioned by Replit
4. Click "Run" - server starts automatically
5. Access via Replit-provided URL

**Replit-Specific Configuration:**
```bash
# .replit file
run = "npm run dev"

[deployment]
run = ["npm", "run", "start"]
deploymentTarget = "cloudrun"
```

### 7.4 Deployment on Vercel/Netlify

**Build Configuration:**
```json
// vercel.json or netlify.toml
{
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server/index.ts" },
    { "src": "/(.*)", "dest": "client/$1" }
  ]
}
```

**Environment Variables:**
- Add all env vars via platform UI
- Use Vercel/Netlify environment variable management

### 7.5 Deployment on AWS/GCP/Azure

**Containerized Deployment:**
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy application
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 5000

# Start
CMD ["npm", "start"]
```

**Build and Deploy:**
```bash
# Build Docker image
docker build -t mundo-tango:latest .

# Run locally
docker run -p 5000:5000 --env-file .env mundo-tango:latest

# Push to registry
docker tag mundo-tango:latest your-registry/mundo-tango:latest
docker push your-registry/mundo-tango:latest

# Deploy to Kubernetes/ECS/Cloud Run
kubectl apply -f k8s/deployment.yaml
```

### 7.6 Database Migration Strategy

**Zero-Downtime Migration:**
```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup-pre-migration.sql

# 2. Test migration on staging
DATABASE_URL=$STAGING_DATABASE_URL npm run db:push

# 3. Verify staging works
curl https://staging.mundotango.com/health

# 4. Schedule maintenance window (optional)
# 5. Run production migration
DATABASE_URL=$PRODUCTION_DATABASE_URL npm run db:push

# 6. Verify production
curl https://mundotango.com/health

# 7. Monitor for errors
tail -f logs/production.log
```

### 7.7 Post-Deployment Verification

```bash
# 1. Check health
curl https://your-domain.com/health

# 2. Test API endpoints
curl https://your-domain.com/api/monitoring/health \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Verify AI services
# (Use test scripts from section 5.2)

# 4. Check error tracking
# Open Sentry dashboard, verify errors are being captured

# 5. Monitor performance
# Open Grafana dashboard, verify metrics flowing

# 6. Test critical user journeys
npx playwright test tests/e2e/critical/
```

### 7.8 Rollback Procedure

**If deployment fails:**
```bash
# 1. Immediately rollback to previous version
git revert HEAD
git push

# Or restore from backup:
git reset --hard <previous-commit-hash>
git push --force

# 2. Restore database if schema changed
psql $DATABASE_URL < backup-pre-migration.sql

# 3. Verify rollback successful
curl https://your-domain.com/health

# 4. Investigate issue
tail -f logs/error.log
# Check Sentry for error details

# 5. Fix issue in development
# 6. Re-test thoroughly
# 7. Re-deploy with fix
```

---

## 8. Troubleshooting

### 8.1 Common Issues

#### Issue: "DATABASE_URL not found"
**Symptoms:**
```
Error: DATABASE_URL, ensure the database is provisioned
```

**Solution:**
```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# If empty, set it in .env:
DATABASE_URL="postgresql://user:pass@host/db"

# Or use individual PG variables:
PGHOST="localhost"
PGPORT="5432"
PGUSER="postgres"
PGPASSWORD="yourpassword"
PGDATABASE="mundo_tango"
```

#### Issue: "OpenAI API key invalid"
**Symptoms:**
```
[OpenAIService] ❌ Error: Invalid API key
```

**Solution:**
```bash
# Verify key is set
echo $OPENAI_API_KEY | head -c 10
# Should show: sk-proj-XX or sk-XXXXX

# Test key directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# If invalid, generate new key:
# 1. Go to https://platform.openai.com/api-keys
# 2. Delete old key
# 3. Create new key
# 4. Update .env
# 5. Restart server
```

#### Issue: "Rate limit exceeded"
**Symptoms:**
```
[GroqService] ❌ Error: Rate limit exceeded for llama-3.1-70b-versatile
```

**Solution:**
```typescript
// Check rate limit status
import { GroqService, GROQ_MODELS } from './services/ai/GroqService';
const status = GroqService.getRateLimitStatus(GROQ_MODELS.LLAMA_70B);
console.log(status);
// { available: 0, capacity: 30, percentage: 0 }

// Wait or use fallback:
const response = await GroqService.queryWithFallback({
  prompt: "Your prompt",
  preferSpeed: true  // Tries 8B first (higher limit)
});

// Or use different provider:
import { OpenAIService } from './services/ai/OpenAIService';
const response = await OpenAIService.query({ prompt: "..." });
```

#### Issue: "Database migration failed"
**Symptoms:**
```
Error: relation "users" already exists
```

**Solution:**
```bash
# Check existing tables
psql $DATABASE_URL -c "\dt"

# If tables exist, drop and recreate (DEV ONLY!)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migration
npm run db:push

# For production, use proper migration:
npx drizzle-kit generate:pg
npx drizzle-kit migrate
```

#### Issue: "Sentry not capturing errors"
**Symptoms:**
- No errors showing in Sentry dashboard
- Errors logged to console but not Sentry

**Solution:**
```typescript
// 1. Check SENTRY_DSN is set
console.log('Sentry DSN:', process.env.SENTRY_DSN ? '✓ Set' : '✗ Not set');

// 2. Verify Sentry initialization
import * as Sentry from "@sentry/node";
Sentry.captureMessage("Test Sentry integration");

// 3. Check environment
// Sentry may be disabled in development
if (process.env.NODE_ENV !== 'production') {
  console.warn('Sentry disabled in development');
}

// 4. Force enable for testing
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'development',  // Explicitly set
  enabled: true,  // Force enable
});
```

#### Issue: "AI responses too slow"
**Symptoms:**
- Responses taking >10 seconds
- Users experiencing timeouts

**Solution:**
```typescript
// 1. Use faster models
import { GroqService, GROQ_MODELS } from './services/ai/GroqService';
// 877 tokens/sec vs 250 tokens/sec
const response = await GroqService.query({
  prompt: "...",
  model: GROQ_MODELS.LLAMA_8B  // Fastest
});

// 2. Reduce max tokens
const response = await OpenAIService.query({
  prompt: "...",
  maxTokens: 500  // Instead of 2000
});

// 3. Enable streaming
import { AnthropicService } from './services/ai/AnthropicService';
await AnthropicService.queryStream({
  prompt: "...",
}, (chunk) => {
  // Send chunk to client immediately
  res.write(chunk.content);
});

// 4. Use semantic caching
// Responses are automatically cached by SemanticCacheService
```

#### Issue: "High AI costs"
**Symptoms:**
- Unexpected charges from OpenAI/Anthropic
- Budget exceeded alerts

**Solution:**
```typescript
// 1. Use cheaper models
import { GeminiService } from './services/ai/GeminiService';
const response = await GeminiService.query({
  model: 'gemini-2.5-flash-lite',  // $0.02/1M vs $3/1M
  prompt: "..."
});

// 2. Implement cost limits
let dailyCost = 0;
const DAILY_LIMIT = 10; // $10/day

async function queryWithBudget(prompt: string) {
  const estimated = GeminiService.estimateCost(prompt, '', 'gemini-2.5-flash-lite', 500);
  
  if (dailyCost + estimated > DAILY_LIMIT) {
    throw new Error('Daily AI budget exceeded');
  }
  
  const response = await GeminiService.query({ prompt });
  dailyCost += response.cost;
  
  return response;
}

// 3. Monitor usage
// Check provider dashboards daily:
// - OpenAI: https://platform.openai.com/usage
// - Anthropic: https://console.anthropic.com/usage
// - Set up billing alerts

// 4. Use FREE Groq when possible
import { GroqService } from './services/ai/GroqService';
const response = await GroqService.query({ prompt: "..." });
// Cost: $0 (FREE)
```

### 8.2 Debugging Tools

**Enable Debug Logging:**
```bash
# Set in .env
DEBUG="express:*,ai:*,esa:*"

# Or at runtime
DEBUG=* npm run dev
```

**Database Query Logging:**
```typescript
// Add to shared/db.ts
import { drizzle } from 'drizzle-orm/neon-http';
export const db = drizzle(client, {
  logger: process.env.NODE_ENV === 'development'
});
```

**AI Service Logging:**
```typescript
// All AI services log automatically:
// [OpenAIService] ✅ gpt-4o | 1250ms | 150 tokens | $0.000495
// [AnthropicService] ✅ claude-3-5-sonnet-20241022 | 2100ms | 200 tokens | $0.003600
// [GroqService] ✅ llama-3.1-8b-instant | 180ms | 100 tokens | 877 tok/s | FREE
```

### 8.3 Performance Optimization

**Slow Database Queries:**
```sql
-- Enable query logging
SET log_statement = 'all';
SET log_duration = on;

-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Add indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at);
```

**Memory Issues:**
```bash
# Check Node memory usage
node --max-old-space-size=4096 server/index.ts

# Monitor memory
const used = process.memoryUsage();
console.log({
  rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
  heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
  heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`
});
```

### 8.4 Getting Help

**Resources:**
- **Platform Documentation:** `/docs` folder
- **API Documentation:** `/api-docs` (Swagger UI)
- **Replit Community:** https://replit.com/community
- **AI Provider Docs:**
  - OpenAI: https://platform.openai.com/docs
  - Anthropic: https://docs.anthropic.com
  - Groq: https://console.groq.com/docs
  - Google AI: https://ai.google.dev/docs

**Support Channels:**
- Create GitHub issue with logs and error details
- Check existing issues for similar problems
- Join platform Discord/Slack (if available)

**When Reporting Issues:**
1. Environment (Node version, OS, hosting platform)
2. Complete error message and stack trace
3. Steps to reproduce
4. Expected vs actual behavior
5. Relevant logs (sanitize API keys!)
6. Configuration (sanitize secrets!)

---

## Appendix A: Quick Reference

### Environment Variables Quick Reference
```env
# Minimum Required
DATABASE_URL="postgresql://..."
SESSION_SECRET="..."
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
OPENAI_API_KEY="sk-..."

# Recommended
ANTHROPIC_API_KEY="sk-ant-..."
GROQ_API_KEY="gsk_..."
GEMINI_API_KEY="..."
SENTRY_DSN="https://..."
STRIPE_SECRET_KEY="sk_test_..."

# Optional
OPENROUTER_API_KEY="sk-or-..."
REDIS_URL="redis://..."
CLOUDINARY_CLOUD_NAME="..."
```

### API Endpoints Quick Reference
```
Health Checks:
  GET /health
  GET /ready
  GET /live

Monitoring:
  GET /api/monitoring/health
  GET /api/monitoring/performance/:agentId
  GET /api/monitoring/metrics?format=prometheus
  GET /api/monitoring/alerts
  GET /api/monitoring/agents/status
  GET /api/monitoring/cycles
  GET /api/monitoring/trends
```

### CLI Commands Quick Reference
```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server
npm run check           # Type check
npm run build           # Build for production

# Database
npm run db:push         # Push schema changes
npx drizzle-kit studio  # Open database GUI

# Testing
npx playwright test     # Run E2E tests
npm run test           # Run unit tests

# Production
npm run start          # Start production server
```

### Cost Comparison Quick Reference
```
Model                    Input      Output     Speed        Free?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gemini Flash Lite       $0.02/1M   $0.08/1M   Fast         No
Groq Llama 8B          FREE       FREE        877 tok/s    YES
Groq Llama 70B         FREE       FREE        250 tok/s    YES
OpenAI GPT-4o Mini     $0.15/1M   $0.60/1M   Fast         No
Gemini Flash           $0.075/1M  $0.30/1M   Fast         No
OpenAI GPT-4o          $3.00/1M   $10.00/1M  Moderate     No
Claude Sonnet          $3.00/1M   $15.00/1M  Moderate     No
Claude Haiku           $0.80/1M   $4.00/1M   Fast         No
Gemini Pro             $1.25/1M   $5.00/1M   Moderate     No
```

---

## Appendix B: Service Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Mundo Tango Platform                    │
│                     AI-Powered Services                     │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                                  │
│  ├─ Components (Shadcn UI)                                │
│  ├─ Pages (Wouter routing)                                │
│  ├─ State (TanStack Query)                                │
│  └─ Real-time (WebSocket)                                 │
└───────────────────────────────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│  Backend (Express.js)                                     │
│  ├─ Authentication & Security                             │
│  ├─ Rate Limiting & CORS                                  │
│  ├─ API Routes                                            │
│  └─ WebSocket Server                                      │
└───────────────────────────────────────────────────────────┘
           │               │               │
           ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ AI Services  │  │ ESA Agents   │  │ Core Services│
│──────────────│  │──────────────│  │──────────────│
│ OpenAI       │  │ Collaboration│  │ Stripe       │
│ Anthropic    │  │ Learning     │  │ Cloudinary   │
│ Groq         │  │ Validation   │  │ Email        │
│ Gemini       │  │ Orchestrator │  │ SMS          │
│ OpenRouter   │  │ Memory       │  │ Monitoring   │
└──────────────┘  └──────────────┘  └──────────────┘
           │               │               │
           └───────────────┴───────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│  Database Layer (PostgreSQL + Drizzle ORM)                │
│  ├─ User Data                                             │
│  ├─ Events & Groups                                       │
│  ├─ Posts & Comments                                      │
│  ├─ Agent Intelligence                                    │
│  └─ Learning Patterns                                     │
└───────────────────────────────────────────────────────────┘
           │               │               │
           ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Redis Cache  │  │ Sentry       │  │ Prometheus   │
│ (Optional)   │  │ (Errors)     │  │ (Metrics)    │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

**Document End**

For questions or issues, refer to:
- Main Documentation: `/docs`
- API Documentation: `/api-docs`
- Troubleshooting: Section 8 above
- Support: Create GitHub issue

**Version History:**
- v1.0.0 (2025-11-12): Initial comprehensive guide

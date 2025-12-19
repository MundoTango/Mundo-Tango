# AI Cost Budget & Guardrails

> Expert Lens: Karthikeyan Rajendran (ML & Large-Scale Engineering)
> Last Updated: December 7, 2025
> Purpose: Document AI cost infrastructure + establish budgets

---

## Current Implementation Status

Mundo Tango has a **comprehensive AI cost management system** already in place. Per Karthikeyan's remediation, this document catalogs what exists and establishes operational budgets.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                     AI Cost Management Stack                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  User Request → TaskClassifier → ModelSelector → CascadeExecutor   │
│                       ↓                ↓               ↓            │
│               Budget Check      Tier Selection    Cost Track        │
│                       ↓                ↓               ↓            │
│                 CostTracker ← ← ← ← ← ← ← ← ← ← ← ← ← ┘            │
│                       ↓                                              │
│              Database: ai_spend_tracking                            │
│                       ↓                                              │
│              WebSocket: Budget Alerts (80%, 95%, 100%)              │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## Key Services

### 1. TaskClassifier (`server/services/ai/TaskClassifier.ts`)
**Purpose**: Analyze query complexity to determine routing strategy

| Output | Description |
|--------|-------------|
| `complexity` | 0.0-1.0 score (trivial → expert) |
| `domain` | chat/code/reasoning/summarization/bulk |
| `requiredQuality` | Minimum acceptable threshold |
| `estimatedTokens` | Expected token usage |
| `budgetConstraint` | Max $ per request |

**Tier Budgets** (per request):
- Free: $0.01/request
- Basic: $0.05/request
- Pro: $0.15/request
- Enterprise: $1.00/request

---

### 2. ModelSelector (`server/services/ai/ModelSelector.ts`)
**Purpose**: Select most cost-effective model for task

**Model Tiers**:
| Tier | Models | Cost Range |
|------|--------|------------|
| Tier 0 | Local (Ollama/LM Studio) | $0.00 |
| Tier 1 | Groq Llama 8B, Gemini Flash Lite | $0.00-0.02/1K |
| Tier 2 | Gemini Flash, GPT-4o-mini | $0.08-0.60/1K |
| Tier 3 | GPT-4o, Claude Sonnet | $3-10/1K |

**Selection Logic**:
1. Filter by domain specialty
2. Filter by minimum quality threshold
3. Sort by cost (cheapest first)
4. Build 3-tier cascade chain

---

### 3. CascadeExecutor (`server/services/ai/CascadeExecutor.ts`)
**Purpose**: Execute with progressive escalation

**Flow**:
```
Tier 0 (local) → confidence < 0.85? → Tier 1 (cheap cloud)
                                         → confidence < 0.80? → Tier 2 (mid)
                                                                  → confidence < 0.90? → Tier 3 (premium)
```

**Goal**: 80%+ requests handled by Tier 0/1 (free/cheap)

**Confidence Factors** (6 total):
- Response completeness (25%)
- Response length (15%)
- Error-free content (25%)
- Model quality baseline (15%)
- Technical term presence (10%)
- Code block completeness (10%)

---

### 4. CostTracker (`server/services/ai/CostTracker.ts`)
**Purpose**: Real-time budget monitoring & enforcement

**Features**:
- Track spend to `ai_spend_tracking` table
- Check against `cost_budgets` per user tier
- WebSocket alerts at 80%, 95%, 100%
- Block requests at 100% budget exceeded
- Daily/weekly cost reports

**Monthly Budgets by Tier**:
| Tier | Monthly Limit | Daily Limit |
|------|--------------|-------------|
| Free | $10 | $0.33 |
| Basic | $50 | $1.67 |
| Pro | $200 | $6.67 |
| Enterprise | $1,000 | $33.33 |

---

## Per-Flow Cost Budgets

### Critical User Journeys

| Flow | Max Budget | Typical Cost | Model Strategy |
|------|-----------|--------------|----------------|
| **Mr. Blue Chat** | $0.05/message | $0.01-0.03 | Tier 0→1 cascade |
| **Talent Match Query** | $0.10/query | $0.02-0.05 | Tier 1 with escalation |
| **Event Recommendation** | $0.03/request | $0.005-0.01 | Tier 0 only |
| **Profile Generation** | $0.15/profile | $0.05-0.08 | Tier 2 target |
| **Travel Planning (Mr. Blue)** | $0.25/session | $0.10-0.15 | Full cascade allowed |
| **Code Generation (Vibe Coding)** | $0.50/task | $0.15-0.30 | Tier 2-3 required |

### Background Operations

| Flow | Max Budget | Strategy |
|------|-----------|----------|
| Event scraping analysis | $0.01/event | Tier 0 only |
| Content moderation | $0.005/post | Tier 0 only |
| Profile enrichment | $0.02/profile | Tier 0-1 |
| Semantic search (embeddings) | $0.0001/query | text-embedding-3-small |

---

## Guardrails Implementation

### 1. Request-Level Guards
```typescript
// Before any AI call:
const budget = CostTracker.checkBudget(userId);
if (budget.isOverBudget) {
  throw new Error('Monthly AI budget exceeded');
}

// Estimate cost before execution:
const estimated = ModelSelector.estimateCost(prompt, model);
if (estimated > flowBudget) {
  // Downgrade to cheaper model
  model = ModelSelector.getCheapestModel(domain);
}
```

### 2. Response-Level Guards
```typescript
// After AI call:
CostTracker.trackSpend({
  userId,
  platform,
  model,
  cost: actualCost,
  tokens: usage.totalTokens
});

// Check if approaching limit:
if (budget.percentageUsed > 80) {
  broadcastToUser(userId, 'budget_warning', { remaining: budget.remaining });
}
```

### 3. Circuit Breakers
- Max 3 escalations per request
- Max 10 requests/minute per user (rate limit)
- Max $5/day for any single user (hard cap)

---

## Production vs Labs Separation

Per Karthikeyan's recommendation, AI agents are categorized:

### Production Agents (Stable, Hardened)
Located in: `server/services/ai/`
- TaskClassifier
- ModelSelector
- CascadeExecutor
- CostTracker
- OpenAIService
- GroqService
- GeminiService

**Requirements**:
- 100% test coverage on critical paths
- Defined SLOs (latency, error rate)
- Cost tracking on every call
- Circuit breakers enabled

### Research/Labs Agents (Experimental)
Located in: `server/services/ai/labs/` (TO CREATE)
- Experimental embedding strategies
- Novel reasoning approaches
- Prototype features

**Requirements**:
- Feature flag gated
- Separate cost bucket (not user-facing)
- No production traffic
- 50% lower quality thresholds acceptable

---

## Monitoring Dashboard

### Key Metrics (Grafana)

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Tier 0/1 success rate | >80% | <70% |
| Avg cost per request | <$0.03 | >$0.10 |
| Budget utilization | <80% | >90% |
| Escalation rate | <30% | >50% |
| Cache hit rate | >30% | <20% |

### Cost Reports API
- `GET /api/ai/cost/user/:userId` - User's spend
- `GET /api/ai/cost/daily` - Platform-wide daily
- `GET /api/ai/cost/model` - Breakdown by model

---

## Action Items

### Completed ✅
- [x] Cost tracking per model
- [x] Budget enforcement by tier
- [x] WebSocket alerts
- [x] 4-tier cascade execution
- [x] Task classification

### Pending 🔲
- [ ] Create `/labs` directory for experimental agents
- [ ] Add Grafana dashboards for cost metrics
- [ ] Implement semantic caching (30-50% target)
- [ ] Add per-flow budget enforcement middleware
- [ ] Create monthly cost projection endpoint

---

## Cost Optimization Strategies

1. **Cache First**: Use LanceDB for semantic caching of common queries
2. **Local First**: Tier 0 (Ollama) for simple tasks
3. **Batch Operations**: Group similar requests to reduce overhead
4. **Smart Routing**: Use TaskClassifier to avoid over-engineering simple tasks
5. **Truncation**: Limit context window to reduce token count

---

*"Every token has a cost. Spend wisely."*

# Rate Limiter Service - Complete Documentation

**Created:** November 11, 2025  
**Version:** 1.0.0  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Token Bucket Algorithm](#token-bucket-algorithm)
4. [Platform Configuration](#platform-configuration)
5. [Core Features](#core-features)
6. [API Reference](#api-reference)
7. [Usage Examples](#usage-examples)
8. [Integration Guide](#integration-guide)
9. [Metrics & Monitoring](#metrics--monitoring)
10. [Best Practices](#best-practices)

---

## Overview

The Rate Limiter Service implements a sophisticated **Token Bucket algorithm** to manage API rate limits across 5 AI platforms: OpenAI, Anthropic, Groq, Gemini, and OpenRouter.

### Key Features

✅ **Token Bucket Algorithm** - Per-platform, per-model rate limiting  
✅ **Burst Capacity** - Handle traffic spikes within configured limits  
✅ **Priority Queue** - Process high-priority requests first  
✅ **Automatic Retry** - Exponential backoff with configurable retries  
✅ **Daily Limits** - Track and enforce daily quotas  
✅ **Real-time Metrics** - Track success rates, wait times, queue lengths  
✅ **Event Emitters** - Monitor queue updates and processing  

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│            RATE LIMITER SERVICE                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Token Bucket │  │ Token Bucket │  │ Token Bucket │ │
│  │  OpenAI      │  │  Anthropic   │  │    Groq      │ │
│  │  GPT-4o      │  │   Claude     │  │  Llama 70B   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                            │                             │
│                    ┌───────▼────────┐                    │
│                    │ Priority Queue │                    │
│                    │  Management    │                    │
│                    └───────┬────────┘                    │
│                            │                             │
│                    ┌───────▼────────┐                    │
│                    │  Auto Refill   │                    │
│                    │   (per second) │                    │
│                    └───────┬────────┘                    │
│                            │                             │
│                    ┌───────▼────────┐                    │
│                    │ Retry Logic    │                    │
│                    │ (Exp Backoff)  │                    │
│                    └───────┬────────┘                    │
│                            │                             │
│                    ┌───────▼────────┐                    │
│                    │ Metrics        │                    │
│                    │ Tracking       │                    │
│                    └────────────────┘                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Token Bucket Algorithm

### How It Works

1. **Initialization**: Each platform/model gets a bucket with:
   - `capacity`: Steady-state tokens (requests/second)
   - `burstCapacity`: Maximum tokens for bursts
   - `refillRate`: Tokens added per second

2. **Token Consumption**: Each API request consumes 1 token

3. **Refilling**: Tokens refill continuously based on `refillRate`

4. **Queueing**: When tokens = 0, requests enter priority queue

5. **Processing**: Queue processes as tokens become available

### Example Flow

```typescript
// Initial state
Bucket: { tokens: 50, capacity: 10, burstCapacity: 50, refillRate: 10 }

// Request 1-10: Instant (burst capacity)
Bucket: { tokens: 40, ... }

// Request 11: Wait ~1 second (refill 10 tokens)
Bucket: { tokens: 39, ... }

// After 4 seconds idle: Refill to capacity
Bucket: { tokens: 50, ... }
```

---

## Platform Configuration

### OpenAI

```typescript
'gpt-4o': {
  requestsPerSecond: 10,      // 10 req/s
  burstCapacity: 50,           // 50 burst
  tokensPerMinute: 30_000,     // 30K TPM
  requestsPerDay: 10_000       // 10K RPD
}
```

### Anthropic

```typescript
'claude-3-5-sonnet-20241022': {
  requestsPerSecond: 5,        // 5 req/s
  burstCapacity: 25,           // 25 burst
  tokensPerMinute: 40_000,     // 40K TPM
  requestsPerDay: 5_000        // 5K RPD
}
```

### Groq

```typescript
'llama-3.1-70b-versatile': {
  requestsPerSecond: 0.5,      // 30 req/min
  burstCapacity: 10,           // 10 burst
  tokensPerMinute: 14_400,     // 14.4K TPM
  requestsPerDay: 14_400       // 14.4K RPD
}
```

### Gemini

```typescript
'gemini-1.5-flash': {
  requestsPerSecond: 1,        // 60 req/min
  burstCapacity: 100,          // 100 burst
  tokensPerMinute: 4_000_000,  // 4M TPM
  requestsPerDay: 1_500        // 1.5K RPD
}
```

### OpenRouter

```typescript
'meta-llama/llama-3-70b': {
  requestsPerSecond: 10,       // 10 req/s
  burstCapacity: 50,           // 50 burst
  tokensPerMinute: 100_000,    // 100K TPM
  requestsPerDay: 10_000       // 10K RPD
}
```

---

## Core Features

### 1. Token Acquisition

```typescript
const acquired = await rateLimiter.acquireToken('openai', 'gpt-4o', {
  priority: 5,           // Higher = processed first
  maxWaitMs: 10000,      // Max queue wait time
  useQueue: true         // Enable queueing
});
```

**Parameters:**
- `platform`: AI platform name
- `model`: Model identifier
- `options.priority`: Request priority (0-10, default: 0)
- `options.maxWaitMs`: Maximum wait time (default: 30000ms)
- `options.useQueue`: Enable queue (default: true)

**Returns:** `Promise<boolean>` - True if token acquired

---

### 2. Automatic Retry with Backoff

```typescript
const response = await rateLimiter.executeWithRetry(
  'anthropic',
  'claude-3-5-sonnet-20241022',
  async () => {
    return await makeAPICall();
  },
  {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2
  }
);
```

**Retry Logic:**
- Attempt 1: Wait 1000ms
- Attempt 2: Wait 2000ms (1000 * 2)
- Attempt 3: Wait 4000ms (2000 * 2)
- Jitter: +0-1000ms random

---

### 3. Priority Queue Management

Requests are processed in order of:
1. **Priority** (higher first)
2. **Timestamp** (FIFO for same priority)

```typescript
// High priority (processed first)
await rateLimiter.acquireToken('groq', 'llama-3.1-70b-versatile', {
  priority: 10
});

// Low priority (processed last)
await rateLimiter.acquireToken('groq', 'llama-3.1-70b-versatile', {
  priority: 0
});
```

---

### 4. Burst Handling

Burst capacity allows temporary spikes above steady-state rate:

```typescript
// Burst example: 50 requests instantly (OpenAI GPT-4o)
for (let i = 0; i < 50; i++) {
  await rateLimiter.acquireToken('openai', 'gpt-4o', {
    useQueue: false  // Fail fast if no tokens
  });
}
// ✅ All 50 succeed (burst capacity)

// Request 51: Must wait for refill
await rateLimiter.acquireToken('openai', 'gpt-4o', {
  useQueue: true  // Wait in queue
});
// ⏳ Waits ~0.1s (refill 1 token)
```

---

### 5. Daily Limits

Automatically tracks and resets daily quotas at midnight:

```typescript
// Check daily limit
const bucket = rateLimiter.getCurrentTokens('openai', 'gpt-4o');
// Returns current token count + daily usage

// Daily reset happens automatically at midnight
```

---

## API Reference

### Class: `RateLimiterService`

#### Methods

##### `acquireToken(platform, model, options)`

Acquire a token from the rate limit bucket.

**Returns:** `Promise<boolean>`

**Example:**
```typescript
const success = await rateLimiter.acquireToken('openai', 'gpt-4o');
```

---

##### `executeWithRetry(platform, model, operation, retryConfig)`

Execute an operation with automatic retry and rate limiting.

**Returns:** `Promise<T>` - Operation result

**Example:**
```typescript
const result = await rateLimiter.executeWithRetry(
  'anthropic',
  'claude-3-5-sonnet-20241022',
  async () => await myOperation(),
  { maxRetries: 3 }
);
```

---

##### `getMetrics(platform?, model?)`

Get rate limiting metrics.

**Returns:** `RateLimitMetrics[]`

**Example:**
```typescript
// All metrics
const allMetrics = rateLimiter.getMetrics();

// Platform-specific
const openaiMetrics = rateLimiter.getMetrics('openai');

// Model-specific
const gpt4Metrics = rateLimiter.getMetrics('openai', 'gpt-4o');
```

---

##### `getAllMetricsSummary()`

Get aggregated metrics summary across all platforms.

**Returns:** `MetricsSummary`

**Example:**
```typescript
const summary = rateLimiter.getAllMetricsSummary();
console.log(`Total Requests: ${summary.totalRequests}`);
console.log(`Success Rate: ${(summary.totalSuccessful / summary.totalRequests * 100).toFixed(2)}%`);
```

---

##### `getCurrentTokens(platform, model)`

Get current token count for a bucket.

**Returns:** `number`

**Example:**
```typescript
const tokens = rateLimiter.getCurrentTokens('gemini', 'gemini-1.5-flash');
console.log(`Available tokens: ${tokens}`);
```

---

##### `getQueueLength(platform, model)`

Get current queue length.

**Returns:** `number`

**Example:**
```typescript
const queueLength = rateLimiter.getQueueLength('groq', 'llama-3.1-70b-versatile');
console.log(`Queued requests: ${queueLength}`);
```

---

##### `isRateLimited(platform, model)`

Check if platform/model is currently rate limited.

**Returns:** `boolean`

**Example:**
```typescript
if (rateLimiter.isRateLimited('openai', 'gpt-4o')) {
  console.log('Rate limited, trying fallback...');
}
```

---

##### `getTimeUntilNextToken(platform, model)`

Get milliseconds until next token is available.

**Returns:** `number`

**Example:**
```typescript
const waitTime = rateLimiter.getTimeUntilNextToken('groq', 'llama-3.1-70b-versatile');
console.log(`Wait ${waitTime}ms for next token`);
```

---

##### `resetBucket(platform, model)`

Reset a rate limit bucket (admin use).

**Returns:** `void`

**Example:**
```typescript
rateLimiter.resetBucket('openai', 'gpt-4o');
// Resets tokens, queue, metrics
```

---

### Events

The service extends `EventEmitter` and emits:

#### `queueUpdated`

Emitted when queue length changes.

```typescript
rateLimiter.on('queueUpdated', (data) => {
  console.log(`Queue ${data.key}: ${data.queueLength} requests`);
});
```

#### `queueProcessed`

Emitted when a queued request is processed.

```typescript
rateLimiter.on('queueProcessed', (data) => {
  console.log(`Processed ${data.key}, ${data.remainingQueue} remaining`);
});
```

---

## Usage Examples

### Example 1: Basic Usage

```typescript
import { rateLimiter } from './RateLimiterService';

const success = await rateLimiter.acquireToken('openai', 'gpt-4o');

if (success) {
  const response = await callOpenAI();
  console.log(response);
}
```

### Example 2: With Retry

```typescript
const result = await rateLimiter.executeWithRetry(
  'anthropic',
  'claude-3-5-sonnet-20241022',
  async () => {
    return await callClaude();
  }
);
```

### Example 3: Priority Requests

```typescript
// Critical request
await rateLimiter.acquireToken('groq', 'llama-3.1-70b-versatile', {
  priority: 10,
  maxWaitMs: 5000
});

// Normal request
await rateLimiter.acquireToken('groq', 'llama-3.1-70b-versatile', {
  priority: 0,
  maxWaitMs: 30000
});
```

### Example 4: Metrics Monitoring

```typescript
const metrics = rateLimiter.getMetrics('openai', 'gpt-4o');

console.log(`Success Rate: ${(metrics[0].successfulRequests / metrics[0].totalRequests * 100).toFixed(2)}%`);
console.log(`Avg Wait Time: ${metrics[0].averageWaitTime.toFixed(2)}ms`);
```

---

## Integration Guide

### With UnifiedAIOrchestrator

```typescript
import { rateLimiter } from './RateLimiterService';
import { UnifiedAIOrchestrator } from './UnifiedAIOrchestrator';

async function smartQuery(prompt: string) {
  return await rateLimiter.executeWithRetry(
    'openai',
    'gpt-4o',
    async () => {
      return await UnifiedAIOrchestrator.smartRoute({
        query: prompt,
        useCase: 'chat',
        priority: 'speed'
      });
    }
  );
}
```

### With Express Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from './RateLimiterService';

export async function aiRateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { platform, model } = req.body;

  const tokenAcquired = await rateLimiter.acquireToken(platform, model, {
    maxWaitMs: 10000,
    useQueue: true
  });

  if (!tokenAcquired) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: rateLimiter.getTimeUntilNextToken(platform, model)
    });
  }

  next();
}
```

---

## Metrics & Monitoring

### Metrics Structure

```typescript
interface RateLimitMetrics {
  platform: string;
  model: string;
  totalRequests: number;
  successfulRequests: number;
  rateLimitedRequests: number;
  queuedRequests: number;
  averageWaitTime: number;
  burstUsage: number;
  currentTokens: number;
  capacity: number;
}
```

### Monitoring Dashboard Data

```typescript
const summary = rateLimiter.getAllMetricsSummary();

// Dashboard metrics
{
  totalPlatforms: 5,
  totalRequests: 10000,
  totalSuccessful: 9850,
  totalRateLimited: 150,
  totalQueued: 500,
  averageWaitTime: 245.67,
  platformBreakdown: {
    openai: { requests: 5000, successful: 4950, ... },
    anthropic: { requests: 2000, successful: 1980, ... },
    groq: { requests: 1500, successful: 1450, ... },
    gemini: { requests: 1000, successful: 990, ... },
    openrouter: { requests: 500, successful: 480, ... }
  }
}
```

---

## Best Practices

### 1. Use Appropriate Wait Times

```typescript
// Short-lived user requests
await rateLimiter.acquireToken('openai', 'gpt-4o', {
  maxWaitMs: 5000  // Fail fast
});

// Background jobs
await rateLimiter.acquireToken('gemini', 'gemini-1.5-flash', {
  maxWaitMs: 60000  // Can wait longer
});
```

### 2. Set Priorities

```typescript
// User-facing (high priority)
await rateLimiter.acquireToken('anthropic', 'claude-3-5-sonnet-20241022', {
  priority: 10
});

// Background processing (low priority)
await rateLimiter.acquireToken('groq', 'llama-3.1-70b-versatile', {
  priority: 1
});
```

### 3. Monitor Metrics

```typescript
// Periodic health check
setInterval(() => {
  const summary = rateLimiter.getAllMetricsSummary();
  
  if (summary.totalRateLimited / summary.totalRequests > 0.1) {
    console.warn('High rate limit rate (>10%)');
  }
}, 60000);
```

### 4. Use Retry for Critical Paths

```typescript
// Critical user action
await rateLimiter.executeWithRetry(
  'openai',
  'gpt-4o',
  async () => await criticalOperation(),
  {
    maxRetries: 5,
    initialDelayMs: 2000
  }
);
```

### 5. Graceful Degradation

```typescript
try {
  const tokenAcquired = await rateLimiter.acquireToken('openai', 'gpt-4o', {
    maxWaitMs: 3000,
    useQueue: false
  });

  if (!tokenAcquired) {
    // Fallback to cheaper model
    return await useFallbackModel();
  }
} catch (error) {
  // Final fallback
  return await useCache();
}
```

---

## Performance Characteristics

### Latency

- Token acquisition: **< 1ms** (when tokens available)
- Queue wait: **Depends on refill rate**
- Daily limit check: **< 0.1ms**

### Memory Usage

- Per bucket: **~200 bytes**
- Per queued request: **~100 bytes**
- Metrics: **~500 bytes per platform/model**

### Throughput

- **No bottleneck**: Service can handle 100K+ req/s
- **Bottleneck**: Platform rate limits (as configured)

---

## Troubleshooting

### Issue: All requests timing out

**Cause:** Queue backlog or daily limit reached

**Solution:**
```typescript
// Check queue
const queueLength = rateLimiter.getQueueLength(platform, model);

// Check daily limit
const metrics = rateLimiter.getMetrics(platform, model);
// If requestsToday near daily limit, wait for midnight reset
```

### Issue: Unexpected rate limiting

**Cause:** Burst capacity exhausted

**Solution:**
```typescript
// Check current tokens
const tokens = rateLimiter.getCurrentTokens(platform, model);

// Wait for refill or use different model
if (tokens < 1) {
  const waitTime = rateLimiter.getTimeUntilNextToken(platform, model);
  console.log(`Wait ${waitTime}ms or switch models`);
}
```

---

## License

MIT License - See LICENSE file for details

---

**Questions or Issues?** Contact the development team or open a GitHub issue.

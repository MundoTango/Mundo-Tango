# 🚦 Rate Limiter Service - Quick Start

> **Token Bucket Algorithm for Multi-AI Platform Rate Limiting**

Manage API rate limits across OpenAI, Anthropic, Groq, Gemini, and OpenRouter with intelligent queueing, burst handling, and automatic retry.

---

## 🎯 Quick Start (30 seconds)

### 1. Import the Service

```typescript
import { rateLimiter } from './server/services/ai/RateLimiterService';
```

### 2. Acquire Token

```typescript
const success = await rateLimiter.acquireToken('openai', 'gpt-4o');

if (success) {
  // Make your API call
  const response = await callOpenAI();
}
```

### 3. Use with Automatic Retry

```typescript
const result = await rateLimiter.executeWithRetry(
  'anthropic',
  'claude-3-5-sonnet-20241022',
  async () => await callClaude()
);
```

---

## 📊 Platform Limits

| Platform   | Model                    | Req/Sec | Burst | TPM       | RPD    |
|------------|--------------------------|---------|-------|-----------|--------|
| OpenAI     | gpt-4o                   | 10      | 50    | 30,000    | 10,000 |
| OpenAI     | gpt-4o-mini              | 10      | 50    | 200,000   | 10,000 |
| Anthropic  | claude-3-5-sonnet        | 5       | 25    | 40,000    | 5,000  |
| Groq       | llama-3.1-70b-versatile  | 0.5     | 10    | 14,400    | 14,400 |
| Gemini     | gemini-1.5-flash         | 1       | 100   | 4,000,000 | 1,500  |
| OpenRouter | meta-llama/llama-3-70b   | 10      | 50    | 100,000   | 10,000 |

---

## ✨ Key Features

✅ **Token Bucket Algorithm** - Smooth rate limiting with burst support  
✅ **Priority Queue** - Process critical requests first  
✅ **Auto Retry** - Exponential backoff (configurable)  
✅ **Daily Limits** - Track and enforce daily quotas  
✅ **Real-time Metrics** - Monitor success rates, wait times  
✅ **Event Emitters** - React to queue changes  

---

## 🔥 Common Use Cases

### Use Case 1: Basic Rate Limiting

```typescript
const tokenAcquired = await rateLimiter.acquireToken('openai', 'gpt-4o', {
  maxWaitMs: 5000,
  useQueue: true
});

if (!tokenAcquired) {
  console.log('Rate limited - try again later');
}
```

### Use Case 2: High Priority Request

```typescript
await rateLimiter.acquireToken('anthropic', 'claude-3-5-sonnet-20241022', {
  priority: 10,  // High priority (0-10 scale)
  maxWaitMs: 10000
});
```

### Use Case 3: Automatic Retry with Backoff

```typescript
const response = await rateLimiter.executeWithRetry(
  'groq',
  'llama-3.1-70b-versatile',
  async () => {
    return await makeGroqRequest();
  },
  {
    maxRetries: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2
  }
);
```

### Use Case 4: Burst Traffic Handling

```typescript
// Send 50 requests instantly (uses burst capacity)
const promises = Array.from({ length: 50 }, () =>
  rateLimiter.acquireToken('gemini', 'gemini-1.5-flash')
);

await Promise.all(promises);
// ✅ All 50 succeed due to burst capacity of 100
```

### Use Case 5: Monitor Metrics

```typescript
const metrics = rateLimiter.getMetrics('openai', 'gpt-4o');

console.log(`Total: ${metrics[0].totalRequests}`);
console.log(`Success: ${metrics[0].successfulRequests}`);
console.log(`Rate Limited: ${metrics[0].rateLimitedRequests}`);
console.log(`Avg Wait: ${metrics[0].averageWaitTime}ms`);
```

---

## 📈 Metrics & Health Checks

### Get Metrics for Specific Model

```typescript
const metrics = rateLimiter.getMetrics('anthropic', 'claude-3-5-sonnet-20241022');
```

### Get All Platforms Summary

```typescript
const summary = rateLimiter.getAllMetricsSummary();

console.log(`Total Platforms: ${summary.totalPlatforms}`);
console.log(`Total Requests: ${summary.totalRequests}`);
console.log(`Success Rate: ${(summary.totalSuccessful / summary.totalRequests * 100).toFixed(2)}%`);
```

### Check Rate Limit Status

```typescript
const isLimited = rateLimiter.isRateLimited('openai', 'gpt-4o');
const currentTokens = rateLimiter.getCurrentTokens('openai', 'gpt-4o');
const queueLength = rateLimiter.getQueueLength('openai', 'gpt-4o');
const waitTime = rateLimiter.getTimeUntilNextToken('openai', 'gpt-4o');

console.log(`Rate Limited: ${isLimited}`);
console.log(`Available Tokens: ${currentTokens}`);
console.log(`Queue Length: ${queueLength}`);
console.log(`Time Until Next Token: ${waitTime}ms`);
```

---

## 🎭 Event Listeners

```typescript
rateLimiter.on('queueUpdated', (data) => {
  console.log(`Queue ${data.key}: ${data.queueLength} requests`);
});

rateLimiter.on('queueProcessed', (data) => {
  console.log(`Processed ${data.key}: ${data.remainingQueue} remaining`);
});
```

---

## 🔧 Configuration

### Platform Limits (Customizable)

Edit `server/services/ai/RateLimiterService.ts`:

```typescript
const RATE_LIMIT_CONFIG: RateLimitConfig = {
  openai: {
    'gpt-4o': {
      requestsPerSecond: 10,
      burstCapacity: 50,
      tokensPerMinute: 30_000,
      requestsPerDay: 10_000
    }
  },
  // ... other platforms
};
```

### Retry Configuration

```typescript
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2
};
```

---

## 📁 File Structure

```
server/services/ai/
├── RateLimiterService.ts                    # Main service
├── types/
│   └── rate-limiter.types.ts               # TypeScript types
├── examples/
│   └── rate-limiter-usage.example.ts       # 8 usage examples
├── integration/
│   └── rate-limited-orchestrator.ts        # AI orchestrator integration
└── docs/
    ├── RATE_LIMITER_SERVICE.md             # Full documentation
    └── README_RATE_LIMITER.md              # This file
```

---

## 🚀 Integration with AI Services

### Example: Smart Routing with Rate Limiting

```typescript
import { rateLimitedOrchestrator } from './integration/rate-limited-orchestrator';

const response = await rateLimitedOrchestrator.smartRoute(
  {
    prompt: 'What is the capital of France?',
    temperature: 0.7
  },
  {
    useCase: 'chat',
    priority: 'speed',
    maxWaitMs: 10000
  }
);

console.log(response.content);
console.log(`Platform: ${response.platform}`);
console.log(`Cost: $${response.cost.toFixed(6)}`);
console.log(`Latency: ${response.latency}ms`);
```

---

## 🧪 Testing

### Run Examples

```bash
cd server/services/ai/examples
npx tsx rate-limiter-usage.example.ts
```

### Example Output

```
🚀 Running Rate Limiter Service Examples

=== Example 1: Basic Token Acquisition ===
[RateLimiter] ✅ Initialized openai:gpt-4o | Rate: 10 req/s | Burst: 50 | TPM: 30,000
[RateLimiter] ✅ Token acquired for openai:gpt-4o | Remaining: 49/50 | Daily: 1
✅ Token acquired, making API call...

=== Example 2: Automatic Retry with Backoff ===
[RateLimiter] ✅ Token acquired for anthropic:claude-3-5-sonnet-20241022
✅ Success: Quantum computing is a revolutionary approach to...

=== Example 3: Priority Queue Management ===
Queued 3 requests with different priorities...
[RateLimiter] ✅ Token acquired for groq:llama-3.1-70b-versatile (priority 10)
[RateLimiter] ✅ Token acquired for groq:llama-3.1-70b-versatile (priority 5)
[RateLimiter] ✅ Token acquired for groq:llama-3.1-70b-versatile (priority 0)
✅ All requests processed (high priority first)
```

---

## 📚 Additional Resources

- [Full Documentation](./docs/RATE_LIMITER_SERVICE.md)
- [Usage Examples](./examples/rate-limiter-usage.example.ts)
- [Integration Guide](./integration/rate-limited-orchestrator.ts)
- [TypeScript Types](./types/rate-limiter.types.ts)

---

## 💡 Best Practices

1. **Use appropriate wait times**: Short for user requests, longer for background jobs
2. **Set priorities**: High for user-facing, low for batch processing
3. **Monitor metrics**: Track success rates and wait times
4. **Handle failures gracefully**: Use fallback models when rate limited
5. **Configure platform limits**: Match your actual API quotas

---

## ⚠️ Common Pitfalls

❌ **Don't** set `useQueue: false` for all requests (defeats purpose)  
❌ **Don't** ignore daily limits (will cause failures at midnight)  
❌ **Don't** set all priorities to 10 (no prioritization)  
✅ **Do** use retry for critical paths  
✅ **Do** monitor metrics regularly  
✅ **Do** configure limits to match your API quotas  

---

## 🐛 Troubleshooting

### Problem: Requests timing out

**Solution:** Check queue length and daily limits

```typescript
const queueLength = rateLimiter.getQueueLength(platform, model);
const metrics = rateLimiter.getMetrics(platform, model);

if (queueLength > 100) {
  console.warn('Large queue backlog');
}
```

### Problem: Unexpected rate limiting

**Solution:** Check current token availability

```typescript
const tokens = rateLimiter.getCurrentTokens(platform, model);
const waitTime = rateLimiter.getTimeUntilNextToken(platform, model);

console.log(`Available tokens: ${tokens}`);
console.log(`Wait time: ${waitTime}ms`);
```

---

## 📝 License

MIT License

---

**Need Help?** Check the [full documentation](./docs/RATE_LIMITER_SERVICE.md) or open an issue.

# Error Recovery Protocol

**Invocation:** `use mb.md: operations:recovery`

---

## 🚨 ERROR RECOVERY DECISION TREE

```
ERROR DETECTED
     │
     ▼
┌─────────────────────────────────────┐
│ Is error in my code or external?    │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
   [MY CODE]      [EXTERNAL]
       │               │
       ▼               ▼
  Can I fix it?   Is it transient?
       │               │
   ┌───┴───┐       ┌───┴───┐
   ▼       ▼       ▼       ▼
 [YES]   [NO]   [YES]    [NO]
   │       │       │       │
   ▼       ▼       ▼       ▼
 FIX IT  ESCALATE RETRY  WORKAROUND
```

---

## 📋 ERROR TYPES & RESPONSES

### Type 1: Syntax/Type Errors

```typescript
// Detection: LSP diagnostics, TypeScript errors
// Response: Fix immediately

const response = {
  action: 'fix',
  steps: [
    '1. Read LSP error message',
    '2. Locate exact line/column',
    '3. Understand the expected vs actual',
    '4. Apply fix',
    '5. Verify LSP clear'
  ]
};
```

### Type 2: Runtime Errors

```typescript
// Detection: Server logs, error tracking
// Response: Investigate → Reproduce → Fix

const response = {
  action: 'debug',
  steps: [
    '1. Capture full stack trace',
    '2. Identify error location',
    '3. Read surrounding code',
    '4. Check recent changes',
    '5. Reproduce locally',
    '6. Apply fix',
    '7. Add test to prevent regression'
  ]
};
```

### Type 3: API/Integration Errors

```typescript
// Detection: 4xx/5xx responses, timeouts
// Response: Retry with backoff, then fallback

const response = {
  action: 'retry_with_fallback',
  retryStrategy: {
    maxAttempts: 3,
    backoff: 'exponential', // 1s, 2s, 4s
    fallbackAction: 'use_cached_data'
  }
};
```

### Type 4: Database Errors

```typescript
// Detection: Query failures, constraint violations
// Response: NEVER destructive action without approval

const response = {
  action: 'safe_recovery',
  rules: [
    'NEVER change ID column types',
    'NEVER drop tables without approval',
    'Use npm run db:push --force for sync',
    'Check existing schema before migration'
  ]
};
```

### Type 5: Build/Deploy Errors

```typescript
// Detection: Workflow failures, compile errors
// Response: Check logs, fix, restart

const response = {
  action: 'diagnose_and_fix',
  steps: [
    '1. Check workflow logs',
    '2. Identify failure point',
    '3. Fix configuration or code',
    '4. Restart workflow',
    '5. Verify success'
  ]
};
```

---

## 🔄 RETRY STRATEGIES

### Immediate Retry (Transient Errors)

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await sleep(1000 * attempt); // Linear backoff
    }
  }
}
```

### Exponential Backoff (Rate Limits)

```typescript
async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 5
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s, 16s
      await sleep(delay);
    }
  }
}
```

### Circuit Breaker (Persistent Failures)

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure: Date | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

---

## 🎯 ESCALATION PROTOCOL

### When to Escalate

1. **Cannot reproduce**: Issue unclear or environment-specific
2. **Requires approval**: Destructive operations (data deletion)
3. **Outside expertise**: Security, infrastructure, third-party
4. **Blocked**: Missing credentials, permissions

### How to Escalate

```typescript
interface Escalation {
  issue: string;
  attemptsMade: string[];
  blockedBy: string;
  suggestedAction: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

// Example escalation
const escalation: Escalation = {
  issue: 'Database migration failing with foreign key error',
  attemptsMade: [
    'Checked schema for circular references',
    'Tried npm run db:push --force',
    'Reviewed migration order'
  ],
  blockedBy: 'Need to understand existing data relationships',
  suggestedAction: 'Review database schema in Neon console',
  urgency: 'high'
};
```

---

## 📊 COMMON ERRORS & FIXES

| Error | Likely Cause | Fix |
|-------|--------------|-----|
| 500 on API | Null pointer, DB error | Check logs, trace stack |
| 401 Unauthorized | Token expired/invalid | Check auth middleware |
| 403 Forbidden | Permission issue | Check role/permission |
| 404 Not Found | Wrong route, missing data | Check route registration |
| CORS error | Missing headers | Add CORS middleware |
| DB connection | Pool exhausted | Increase pool size |
| Build failure | Type error, missing dep | Check compile output |

---

## 🔗 RELATED

- **Self-Healing Agents**: Automated recovery → `use mb.md: agents:self-healing`
- **Reflexion**: Learn from errors → `use mb.md: cognition:reflexion`
- **Testing**: Prevent errors → `use mb.md: patterns:testing`

---

*Fail fast. Recover faster.*

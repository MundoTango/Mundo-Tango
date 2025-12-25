# Parallel Execution Protocol

**Invocation:** `use mb.md: orchestration:parallel`

---

## ⚡ CORE PRINCIPLE

**Everything that CAN run in parallel MUST run in parallel.**

```typescript
// ❌ BAD: Sequential execution
for (const file of files) {
  await readFile(file);      // Waits for each
}

// ✅ GOOD: Parallel execution
await Promise.all(files.map(file => readFile(file)));
```

---

## 📋 PARALLELIZATION PATTERNS

### Pattern 1: Independent File Operations

```typescript
// Reading multiple files
const [schema, routes, service] = await Promise.all([
  read('shared/schema.ts'),
  read('server/routes.ts'),
  read('server/service.ts')
]);

// Editing multiple files
await Promise.all([
  edit({ file: 'file1.ts', changes }),
  edit({ file: 'file2.ts', changes }),
  edit({ file: 'file3.ts', changes })
]);
```

### Pattern 2: Search Operations

```typescript
// Multiple grep searches
const [apiRoutes, components, tests] = await Promise.all([
  grep({ pattern: 'router.get', path: 'server/routes' }),
  grep({ pattern: 'export function', path: 'client/src/components' }),
  grep({ pattern: 'describe\\(', path: 'tests' })
]);

// Multiple semantic searches
const results = await Promise.all([
  searchCodebase('authentication middleware'),
  searchCodebase('error handling patterns'),
  searchCodebase('database queries')
]);
```

### Pattern 3: Agent Activation

```typescript
// Activate multiple agents simultaneously
const agentResults = await Promise.all([
  pageAgent.analyze(page),
  securityAgent.audit(page),
  performanceAgent.profile(page),
  accessibilityAgent.check(page)
]);
```

### Pattern 4: Error Analysis

```typescript
// Store and index errors in parallel
await Promise.all([
  errorStore.save(error),
  lanceDB.index(error),
  patternMatcher.analyze(error),
  alertService.notify(error)
]);

// Search for similar errors in parallel
const similarErrors = await Promise.all(
  errors.map(e => contextService.searchSimilar(e))
);
```

### Pattern 5: Database Operations

```typescript
// Independent queries
const [users, events, groups] = await Promise.all([
  db.query.users.findMany(),
  db.query.events.findMany({ where: { active: true } }),
  db.query.groups.findMany({ limit: 10 })
]);

// Batch inserts
await Promise.all(
  items.map(item => db.insert(table).values(item))
);
```

---

## 🔧 IMPLEMENTATION GUIDELINES

### Identify Parallelization Opportunities

Ask: "Does operation B depend on the result of operation A?"

```typescript
// A and B are INDEPENDENT → Parallelize
const [a, b] = await Promise.all([
  operationA(),
  operationB()
]);

// C depends on A → Must be sequential
const a = await operationA();
const c = await operationC(a.result);
```

### Batch Size Management

```typescript
// For many operations, batch to avoid overwhelming system
async function parallelBatch<T>(
  items: T[],
  operation: (item: T) => Promise<any>,
  batchSize: number = 10
): Promise<any[]> {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => operation(item))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

### Error Handling in Parallel

```typescript
// Use Promise.allSettled for resilience
const results = await Promise.allSettled([
  riskyOperation1(),
  riskyOperation2(),
  riskyOperation3()
]);

// Process results
const successes = results
  .filter(r => r.status === 'fulfilled')
  .map(r => r.value);

const failures = results
  .filter(r => r.status === 'rejected')
  .map(r => r.reason);
```

---

## 📊 PERFORMANCE GAINS

| Operation | Sequential | Parallel | Speedup |
|-----------|------------|----------|---------|
| Read 5 files | 500ms | 150ms | 3.3x |
| Search 3 dirs | 900ms | 350ms | 2.6x |
| Activate 10 agents | 5000ms | 600ms | 8.3x |
| Index 100 errors | 10000ms | 1200ms | 8.3x |

---

## ⚠️ WHEN NOT TO PARALLELIZE

1. **Dependent operations**: B needs A's result
2. **Rate-limited APIs**: Respect limits
3. **Resource contention**: Same file writes
4. **Transaction integrity**: Must be atomic

```typescript
// These MUST be sequential
await db.transaction(async (tx) => {
  await tx.insert(users).values(user);      // Step 1
  await tx.insert(profiles).values(profile); // Step 2 (needs user id)
  await tx.insert(settings).values(settings);// Step 3 (needs profile id)
});
```

---

## 🎯 CHECKLIST

Before any sequence of operations:

- [ ] Can any of these run simultaneously?
- [ ] Do they have dependencies on each other?
- [ ] Am I hitting any rate limits?
- [ ] Is there resource contention?

**Default: Parallelize unless there's a reason not to.**

---

*Fast is parallel. Slow is sequential.*

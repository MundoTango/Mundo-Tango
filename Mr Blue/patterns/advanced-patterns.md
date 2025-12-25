# Advanced Patterns (39-61)

**Invocation:** `use mb.md: patterns:advanced`

---

## Pattern 39: PRD Reverse-Engineering Protocol ⭐⭐⭐

**5-Source Methodology for documenting existing systems:**

1. **Code Analysis**: Read implementation files
2. **Schema Review**: Check database tables
3. **API Inspection**: Document endpoints
4. **UI Walkthrough**: Map user flows
5. **Test Review**: Understand expected behavior

---

## Pattern 40: City Imagery Standardization ⭐⭐⭐

**Single source of truth for city images:**

```typescript
// client/src/lib/cityImageMap.ts
export function getCityImageUrl(city: string): string {
  // 3-tier fallback: custom → city-specific → generic
  return cityImageMap[city] ?? genericCityImage;
}
```

---

## Pattern 41: Parallel Agent Execution Protocol ⭐⭐⭐

**All independent agent operations run simultaneously:**

```typescript
// Activate multiple agents in parallel
const results = await Promise.all([
  agent1.execute(task),
  agent2.execute(task),
  agent3.execute(task)
]);
```

---

## Pattern 42: Drizzle ORM LeftJoin Protocol ⭐⭐⭐

**CRITICAL BUG FIX:**

```typescript
// WRONG: Nested objects with leftJoin can fail when null
const bad = await db.select({
  id: table.id,
  user: { id: users.id, name: users.name } // FAILS if user is null
}).from(table).leftJoin(users, eq(table.userId, users.id));

// CORRECT: Flat selection with manual mapping
const good = await db.select({
  id: table.id,
  userId: users.id,
  userName: users.name
}).from(table).leftJoin(users, eq(table.userId, users.id));

return good.map(row => ({
  id: row.id,
  user: row.userId ? { id: row.userId, name: row.userName } : null
}));
```

---

## Pattern 44: GitHub/Replit Mastery Protocol ⭐⭐⭐

**Optimal workspace usage:**
- GitHub for version control, PRs, code review
- Replit for runtime, testing, UI validation
- Never mix responsibilities

---

## Pattern 45: Agent Learning Protocol ⭐⭐⭐

**Self-improvement methodology:**

1. After each task, extract lessons
2. Store in LanceDB for retrieval
3. Apply learnings to future tasks
4. Update mb.md with patterns

---

## Pattern 46: Agent Performance Optimization ⭐⭐⭐

**Execution speed priorities:**

1. Parallelize all independent operations
2. Cache frequently accessed data
3. Use streaming for large responses
4. Minimize round-trips

---

## Pattern 47: Colleague Collaboration Protocol ⭐⭐⭐

**Multi-agent shared context:**

```typescript
// AGENT_MEMORY.md structure
interface AgentMemory {
  lastUpdate: Date;
  currentTask: string;
  blockers: string[];
  discoveries: string[];
  handoffNotes: string[];
}
```

---

## Pattern 48: Visual Editor Intelligence ⭐⭐⭐

**12 AI intelligences for visual editing:**

1. Context awareness
2. Component recognition
3. Style inference
4. Layout understanding
5. Accessibility checking
6. Performance analysis
7. Responsive design
8. Color harmony
9. Typography
10. Spacing consistency
11. Animation timing
12. Interaction patterns

---

## Pattern 49: Vibe Coding Detection ⭐⭐⭐

**Keywords that trigger code generation:**

```typescript
const vibeKeywords = [
  'make', 'change', 'add', 'remove', 'fix',
  'button', 'container', 'transparent', 'color',
  'this', 'that', 'bigger', 'smaller'
];
```

---

## Pattern 50: Voice Recognition Fallback ⭐⭐⭐

**Graceful degradation:**

1. Try browser SpeechRecognition
2. Fallback to Groq Whisper
3. Never show error toasts for TTS failures

---

## Pattern 51: E2E Testing Infrastructure ⭐⭐⭐

**Rate limiter handling in tests:**

```typescript
// Skip rate limiters in development
if (process.env.NODE_ENV === 'development') {
  return next();
}
```

---

## Pattern 52: Backend Agent System ⭐⭐⭐

**Four base agent types:**

1. BaseAPIAgent - Endpoint creation
2. BaseSchemaAgent - Database changes
3. BaseSecurityAgent - Auth/permissions
4. BaseServiceAgent - Business logic

---

## Pattern 53: Session Tracker ⭐⭐⭐

**Track UI changes since last save:**

```typescript
interface SessionTracker {
  changesSinceSave: Change[];
  lastSaveTime: Date;
  pendingBackendWork: Task[];
}
```

---

## Pattern 54: Git Auto-Commit ⭐⭐⭐

**Automatic commits after backend generation:**

```typescript
await simpleGit()
  .add('.')
  .commit(`[Mr. Blue] ${feature}: backend generated`);
```

---

## Pattern 55: Workflow Auto-Restart ⭐⭐⭐

**After significant changes, restart workflow:**

```typescript
await restartWorkflow('Start application');
await waitForHealthCheck('/api/health');
```

---

## Pattern 56: Agent Orchestration ⭐⭐⭐

**Coordinate multiple agents:**

```typescript
class BackendOrchestrator {
  async generateBackend(uiChanges: Change[]) {
    const tasks = this.decompose(uiChanges);
    
    return await Promise.all(
      tasks.map(t => this.assignToAgent(t))
    );
  }
}
```

---

## Pattern 57: Quality Validation Loop ⭐⭐⭐

**Multi-level validation:**

1. Replit AI validates Mr. Blue (95-99/100)
2. Mr. Blue validates agents (90+/100)
3. Agents self-validate (pass criteria)

---

## Pattern 58: Handoff Documentation ⭐⭐⭐

**Every handoff includes:**

1. What was built
2. What remains
3. How to execute
4. Success criteria
5. Testing strategy

---

## Pattern 59: Knowledge Propagation ⭐⭐⭐

**Share learnings across agents:**

```typescript
await globalKnowledgeBase.store({
  pattern: 'new-learning',
  source: 'agent-x',
  applicability: ['agent-y', 'agent-z']
});
```

---

## Pattern 60: Scraping Resilience ⭐⭐⭐

**Multi-stage scraping with fallbacks:**

1. Try static HTML scraping
2. Fallback to JavaScript rendering
3. Fallback to AI extraction
4. Store partial results

---

## Pattern 61: Platform Compliance ⭐⭐⭐

**Before any integration:**

1. Check rate limits
2. Verify API terms
3. Implement backoff
4. Log all requests
5. Handle bans gracefully

---

*Advanced patterns for sophisticated operations.*

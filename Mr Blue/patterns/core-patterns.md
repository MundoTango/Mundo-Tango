# Core Patterns (1-16)

**Invocation:** `use mb.md: patterns:core`

---

## Pattern 1: Explicit Decision Trees ⭐⭐⭐

**Problem:** Ambiguous tool selection wastes tokens and time.

**Solution:** Define explicit decision trees for every tool choice.

```typescript
// CODEBASE_SEARCH Decision Tree
if (question.requires('deep_understanding')) {
  if (codebase.size < '2M_tokens') {
    return use('search_codebase');
  } else {
    return use('grep').then('read');
  }
} else if (question.is('simple_pattern')) {
  return use('grep');
} else if (question.is('specific_file')) {
  return use('read');
}
```

---

## Pattern 2: Strategic Search Framework ⭐⭐⭐

**4-Phase Search Strategy:**

1. **Broad Discovery**: `ls`, `glob` for structure
2. **Pattern Matching**: `grep` for specific patterns
3. **Deep Reading**: `read` for file contents
4. **Semantic Search**: `search_codebase` for understanding

---

## Pattern 3: Grep Optimization ⭐⭐

**7 Advanced Grep Patterns:**

```bash
# 1. Find function definitions
grep "function\\s+\\w+"

# 2. Find exports
grep "export (const|function|class)"

# 3. Find imports of specific module
grep "from ['\"]@/lib/utils['\"]"

# 4. Find API routes
grep "router\\.(get|post|put|delete)"

# 5. Find React components
grep "export (default )?function [A-Z]"

# 6. Find type definitions
grep "interface|type\\s+\\w+\\s*="

# 7. Find TODO/FIXME
grep "(TODO|FIXME|HACK|XXX)"
```

---

## Pattern 4: Session State Tracking ⭐⭐⭐

**Track across session:**
- Files read/modified
- Decisions made
- Patterns discovered
- Errors encountered

```typescript
interface SessionState {
  filesAccessed: string[];
  decisionsLog: Decision[];
  patternsFound: Pattern[];
  errorsHandled: Error[];
}
```

---

## Pattern 5: Memory Lifecycle Management ⭐⭐

**Three memory tiers:**

1. **Immediate**: Current conversation (token limit)
2. **Session**: Task-specific context (session storage)
3. **Persistent**: Long-term patterns (LanceDB)

---

## Pattern 6: File Context Optimization ⭐⭐

**Read efficiently:**
- Use `offset` and `limit` for large files
- Read 500+ lines at once when possible
- Follow import chains for full context

---

## Pattern 7: Parallel Dependency Analysis ⭐⭐⭐

**Always parallelize independent operations:**

```typescript
// GOOD
const [a, b, c] = await Promise.all([
  readFile('a.ts'),
  readFile('b.ts'),
  readFile('c.ts')
]);

// BAD
const a = await readFile('a.ts');
const b = await readFile('b.ts');
const c = await readFile('c.ts');
```

---

## Pattern 8: Non-Interactive Execution ⭐⭐⭐

**Never prompt for input in scripts:**

```typescript
// BAD
const answer = await prompt("Continue?");

// GOOD
const answer = process.env.AUTO_CONFIRM ?? 'yes';
```

---

## Pattern 9: Cost-Aware Tool Usage ⭐⭐

**Tool cost hierarchy (lowest to highest):**
1. `grep` - Fast, cheap
2. `read` - Medium
3. `search_codebase` - Expensive but powerful
4. `do_web_search` - External, rate-limited

---

## Pattern 10: Database Mutation Safety ⭐⭐⭐

**CRITICAL RULES:**
- NEVER change ID column types
- NEVER drop tables without approval
- Use `npm run db:push --force` for sync
- Always check schema before migration

---

## Pattern 11: Error Recovery Decision Tree ⭐⭐⭐

```
ERROR
  ├── Syntax Error → Fix immediately
  ├── Runtime Error → Debug (logs, trace)
  ├── API Error → Retry with backoff
  ├── DB Error → Safe recovery only
  └── Build Error → Check config
```

---

## Pattern 12: Incremental Validation Loop ⭐⭐⭐

**After every change:**
1. Check LSP for errors
2. Run relevant tests
3. Verify UI if applicable
4. Commit if stable

---

## Pattern 13: Lint Scope Discipline ⭐⭐

**Only check what you changed:**

```bash
# GOOD: Check specific file
npx eslint src/file-you-changed.ts

# BAD: Check everything
npx eslint .
```

---

## Pattern 14: Decision Reasoning Protocol ⭐⭐

**Document WHY for every critical decision:**

```typescript
// Decision: Use PostgreSQL over MongoDB
// Reason: Relational data, ACID needed, Drizzle in stack
// Alternatives considered: MongoDB (flexible but no relations)
// Date: 2025-12-19
```

---

## Pattern 15: Failure Mode Documentation ⭐⭐

**When something fails, document:**
1. What failed
2. Why it failed
3. How it was fixed
4. How to prevent

---

## Pattern 16: Pattern Extraction Protocol ⭐⭐⭐

**After every significant task:**
1. What pattern emerged?
2. Is it generalizable?
3. Should it be in mb.md?
4. How to teach it?

---

*These 16 patterns form the foundation of all Mr. Blue operations.*

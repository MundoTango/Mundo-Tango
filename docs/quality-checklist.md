# Quality Validation Checklist

**Purpose:** Ensure enterprise-grade quality on every feature  
**Usage:** Before marking any feature "complete"  
**Target:** <0.3 bugs per feature (75% reduction vs baseline)

---

## 🎯 Quality Philosophy

**Speed vs Quality is a FALSE tradeoff**

- Finding bug immediately: 5 min to fix
- Finding bug later: 30 min (forgotten context)
- Finding bug in production: 2 hours (user impact, rollback)

**Testing during development is cheaper and faster** 💰

---

## ✅ 10-Layer Quality Pipeline

Every feature must pass ALL 10 layers before "done"

---

### **Layer 1: Pre-Flight Checks** ⚡

**Before writing any code:**

```bash
# 1. Search for existing implementation
grep -r "similar_feature" server/
grep -r "similar_feature" client/

# 2. If exists:
#    - Fix it (don't rebuild)
#    - Or enhance it
#    - Never duplicate

# 3. If missing:
#    - Check dependencies exist
#    - Review dependency-graph.md
#    - Ensure build order correct
```

**Checklist:**
- [ ] Searched codebase for similar code
- [ ] Checked patterns.md for templates
- [ ] Verified dependencies exist
- [ ] Confirmed build order optimal

**Prevents:** Duplicate code, rebuilds, wasted time

---

### **Layer 2: LSP Validation** 📝

**After writing TypeScript code:**

```bash
# Run LSP diagnostics
get_latest_lsp_diagnostics

# Fix ALL type errors before proceeding
# No exceptions
```

**Checklist:**
- [ ] Zero TypeScript errors
- [ ] All imports valid
- [ ] No `any` types (unless justified)
- [ ] Proper type inference
- [ ] No unused variables

**Prevents:** Runtime type errors, bugs from typos

---

### **Layer 3: Database Schema Validation** 🗄️

**Before schema changes:**

```bash
# 1. Check existing schema
grep -A 10 "table_name" shared/schema.ts

# 2. Verify:
#    - ID types match (serial vs varchar)
#    - Foreign keys reference existing tables
#    - No breaking changes to existing data

# 3. Push safely
npm run db:push

# 4. If data loss warning:
npm run db:push --force
```

**Checklist:**
- [ ] ID column types preserved
- [ ] Foreign keys valid
- [ ] No breaking changes
- [ ] Migration successful
- [ ] Data integrity maintained

**Prevents:** Data loss, migration failures, broken relationships

---

### **Layer 4: Playwright E2E Tests** 🎭

**Every P0/P1 feature requires E2E test:**

```typescript
Test Plan Structure:
1. [New Context] Create browser context
2. [Browser] Navigate to feature
3. [Verify] UI renders correctly
4. [Verify] Data loads from API
5. [Browser] Test user interactions
6. [Verify] State updates correctly
7. [Verify] Error states work
8. [Verify] Empty states work
9. [Verify] Loading states work
10. [API] Test API directly (if applicable)
```

**Minimum Test Coverage:**
- [ ] Happy path (everything works)
- [ ] Error cases (API fails, network down)
- [ ] Edge cases (empty data, max limits)
- [ ] Permissions (unauthorized access)
- [ ] UI states (loading, error, empty)

**Prevents:** UI bugs, integration issues, broken user flows

---

### **Layer 5: Regression Testing** 🔄

**After changes, verify existing features still work:**

```bash
# Changed auth?
→ Re-test login, signup, password reset

# Changed database schema?
→ Re-test all CRUD operations on that table

# Changed tier enforcement?
→ Re-test subscription upgrades, feature access

# Changed middleware?
→ Re-test all protected routes
```

**Checklist:**
- [ ] Related features tested
- [ ] No breaking changes
- [ ] Existing tests still pass
- [ ] Integration points verified

**Prevents:** Breaking existing functionality

---

### **Layer 6: Code Review Checklist** 👀

**Before marking feature complete:**

**TypeScript Quality:**
- [ ] TypeScript compiles (LSP clean)
- [ ] Proper types (no `any`)
- [ ] No type assertions (unless justified)
- [ ] Imports organized

**Backend Quality:**
- [ ] Database migration successful
- [ ] API routes return correct status codes
- [ ] Error handling present
- [ ] Validation using Zod schemas
- [ ] No SQL injection vulnerabilities
- [ ] No console.log() statements

**Frontend Quality:**
- [ ] Components render without errors
- [ ] Loading states exist
- [ ] Error states exist
- [ ] Empty states exist
- [ ] Responsive design
- [ ] Dark mode support
- [ ] Accessibility (data-testid, aria-labels)

**Security:**
- [ ] Permissions enforced
- [ ] Input validation
- [ ] CSRF protection (if needed)
- [ ] XSS prevention
- [ ] No secrets in code

**Performance:**
- [ ] No N+1 queries
- [ ] Proper pagination
- [ ] Efficient database queries
- [ ] Lazy loading where appropriate

**Prevents:** Most common bugs and security issues

---

### **Layer 7: Runtime Validation** 🏃

**After code complete, before shipping:**

```bash
# 1. Restart workflow
restart_workflow

# 2. Check logs for errors
refresh_all_logs

# 3. Verify:
#    - No console errors
#    - No 500 errors in API
#    - No database errors
#    - Clean startup
```

**Checklist:**
- [ ] Workflow restarts successfully
- [ ] No errors in logs
- [ ] No console errors
- [ ] API responds correctly
- [ ] Database queries work

**Prevents:** Runtime crashes, deployment failures

---

### **Layer 8: Error Catalog** 📚

**Document bugs found for future prevention:**

```markdown
## Wave X Errors Found & Fixed

❌ Bug: Dashboard crashed on empty data
   Cause: Missing null check
   Fix: Added empty state
   Prevention: Add to dashboard template

❌ Bug: Email sent duplicate notifications
   Cause: No deduplication check
   Fix: Added sent_emails tracking
   Prevention: Add to email template pattern
```

**Checklist:**
- [ ] Bugs documented in wave-log.md
- [ ] Root cause identified
- [ ] Prevention strategy noted
- [ ] Pattern updated (if applicable)

**Prevents:** Repeating same bugs

---

### **Layer 9: Template Validation** 🎨

**Only promote battle-tested code to patterns.md:**

**Promotion Criteria:**
- [ ] Used in production 1+ wave
- [ ] Zero bugs found
- [ ] Reusable across features
- [ ] Well-tested
- [ ] Well-documented

**Process:**
1. Build feature from scratch
2. Test thoroughly, fix all bugs
3. Use in production (1+ wave)
4. If stable → Promote to patterns.md
5. Document customization points

**Prevents:** Bad patterns spreading bugs

---

### **Layer 10: Continuous Monitoring** 📊

**Post-deployment validation:**

```bash
# Smoke test after deployment:
- Visit main pages
- Check console for errors
- Verify API responses
- Test critical user flows
- Monitor error rates
```

**First 24 Hours After Wave:**
- [ ] Monitor error logs
- [ ] Check user reports
- [ ] Verify metrics normal
- [ ] No performance degradation
- [ ] Database stable

**Prevents:** Production incidents

---

## 🎭 Testing Standards

### P0 Blocker Requirements
**Every P0 MUST have:**
- ✅ Playwright E2E test
- ✅ API integration test (if applicable)
- ✅ Error state coverage
- ✅ Permission checks
- ✅ Regression testing

### P1 Feature Requirements
**Every P1 SHOULD have:**
- ✅ E2E test OR integration test
- ✅ Basic error handling
- ✅ Permission checks

### P2/P3 Features
**At minimum:**
- ✅ Manual testing
- ✅ Basic validation
- ✅ No console errors

---

## 🚨 Quality Gates (Must Pass)

### Gate 1: Code Complete
- [ ] All files written
- [ ] LSP clean (zero errors)
- [ ] TypeScript compiles

### Gate 2: Functional
- [ ] Feature works as intended
- [ ] All user flows tested
- [ ] Edge cases handled

### Gate 3: Tested
- [ ] Playwright tests pass
- [ ] Regression tests pass
- [ ] No new errors introduced

### Gate 4: Production Ready
- [ ] Workflow restarts clean
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Security verified

**Cannot mark "complete" until ALL gates passed** ✅

---

## 📊 Quality Metrics

### Target Metrics (Wave 8+)

| Metric | Target | Baseline (Wave 7) | Improvement |
|--------|--------|-------------------|-------------|
| Bugs per feature | <0.3 | 1.3 | 75% reduction |
| Test coverage | 95% | ~60% | 35% increase |
| Post-wave fixes | <30min | 2+ hours | 75% reduction |
| Breaking changes | 0 | 1-2 | 100% reduction |
| Production incidents | 0 | N/A | Prevention |

### Wave Quality Score

**After each wave, calculate:**
```
Quality Score = (
  (Test Coverage * 0.3) +
  (Bug Prevention * 0.3) +
  (Performance * 0.2) +
  (Security * 0.2)
)

Target: >90%
```

---

## 🎯 Common Bug Patterns

### Pattern 1: Missing State Handling
```typescript
❌ Bad:
<div>{data.items.map(...)}</div>

✅ Good:
{isLoading && <Skeleton />}
{error && <ErrorMessage />}
{!data?.items.length && <EmptyState />}
{data?.items.map(...)}
```

### Pattern 2: No Error Handling
```typescript
❌ Bad:
const response = await fetch('/api/data');
const data = await response.json();

✅ Good:
try {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Failed');
  const data = await response.json();
  return data;
} catch (error) {
  console.error(error);
  throw error;
}
```

### Pattern 3: Missing Permissions
```typescript
❌ Bad:
router.post('/api/admin/delete', handler);

✅ Good:
router.post('/api/admin/delete', 
  requireAuth,
  requireRole('admin'),
  handler
);
```

### Pattern 4: SQL Injection Risk
```typescript
❌ Bad:
db.query(`SELECT * FROM users WHERE id = ${userId}`);

✅ Good:
db.query.users.findFirst({
  where: eq(users.id, userId)
});
```

---

## 🔄 Quality Improvement Loop

```
1. Build Feature
   ↓
2. Run Quality Checklist
   ↓
3. Find Issues
   ↓
4. Fix Issues
   ↓
5. Document in Error Catalog
   ↓
6. Update Patterns (if needed)
   ↓
7. Ship
   ↓
8. Monitor
   ↓
9. Learn → Next Feature Better
```

---

## 📝 Pre-Wave Quality Setup

**Before starting any wave:**

- [ ] Review wave-log.md (past bugs)
- [ ] Review error catalog
- [ ] Check quality-checklist.md
- [ ] Update patterns with fixes
- [ ] Set quality targets

---

## 📈 Success Stories

### Wave 7 Improvements
**RLS Policies:**
- Built: 52 policies
- Bugs Found: 0
- Quality: ✅ Excellent
- **Why:** Thorough testing, clear patterns

**Analytics Dashboard:**
- Built: 8 metrics, 4 charts
- Bugs Found: 0
- Quality: ✅ Excellent
- **Why:** Good state handling, tested

**Email Service:**
- Built: 10 templates
- Bugs Found: 1 (formatting)
- Quality: ⚠️ Good (1 minor bug)
- **Fix Applied:** Template validation

---

## 🎯 Quality Commitment

**Every wave we commit to:**
- ✅ No shortcuts on quality
- ✅ Test before shipping
- ✅ Document learnings
- ✅ Improve patterns
- ✅ Maintain high bar

**Quality is not negotiable** 💎

---

**Quality gates ensure quality outcomes** ✨

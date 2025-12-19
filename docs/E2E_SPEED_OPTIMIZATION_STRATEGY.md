# E2E Test Speed Optimization Strategy
**Platform:** Mundo Tango  
**Current Status:** 95%+ coverage, session reuse system active  
**Optimization Target:** 50%+ speed improvement  
**Last Updated:** November 13, 2025

---

## Current Performance Baseline

**Test Execution Time:**
- Full suite (148 tests): ~45 minutes
- Critical path (auth + feed + reactions): ~8 minutes
- Individual test average: ~18 seconds

**Bottlenecks Identified:**
1. Sequential test execution (default Playwright behavior)
2. Page navigation overhead (repeated /feed, /profile loads)
3. Wait for animations (500-700ms reaction popovers)
4. Network latency for API calls
5. Repeated login flows (mitigated by session reuse)

---

## Optimization Strategies

### 1. Parallel Test Execution ⚡ **[HIGHEST IMPACT]**

**Current:** Sequential execution
**Target:** 4 parallel workers

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : 4, // 4 workers locally, 2 in CI
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
});
```

**Expected Speedup:** 3-4x faster (45min → 12min)

---

### 2. Test Sharding for CI/CD ⚡

**Strategy:** Split test suite across multiple machines

```bash
# Run 4 shards in parallel (GitHub Actions)
- shard: 1/4
- shard: 2/4
- shard: 3/4
- shard: 4/4
```

**Expected Speedup:** 4x faster on CI (45min → 11min)

---

### 3. Smart Test Grouping 🎯

**Group tests by context to minimize page loads:**

```typescript
// tests/e2e/feed/reactions.spec.ts
test.describe('Reaction Features', () => {
  test.beforeAll(async ({ page }) => {
    // Load feed ONCE for all reaction tests
    await page.goto('/feed');
  });

  test('add reaction', async ({ page }) => {
    // No navigation - already on /feed
  });

  test('remove reaction', async ({ page }) => {
    // No navigation - reuse same page
  });

  test('change reaction type', async ({ page }) => {
    // No navigation - reuse same page
  });
});
```

**Expected Speedup:** 20-30% reduction in navigation overhead

---

### 4. Reduce Animation Waits ⚡

**Current:** Manual 600ms waits for popovers  
**Optimized:** Disable animations in test mode

```typescript
// client/src/App.tsx
const isTestMode = import.meta.env.MODE === 'test';

<motion.div
  initial={isTestMode ? false : { opacity: 0 }}
  animate={isTestMode ? false : { opacity: 1 }}
  transition={isTestMode ? { duration: 0 } : { duration: 0.2 }}
>
```

**Expected Speedup:** 10-15% reduction in wait times

---

### 5. API Response Mocking for UI Tests 🚀

**Strategy:** Mock slow API calls for UI-only tests

```typescript
test('reaction button visual state', async ({ page }) => {
  await page.route('**/api/posts/*/react', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        reactions: { love: 5 },
        currentReaction: 'love',
        totalReactions: 5
      })
    });
  });
  
  // Test UI immediately - no network delay
  await page.click('[data-testid="button-react-177"]');
});
```

**Expected Speedup:** 30-40% for UI-focused tests

---

### 6. Optimize Session Reuse 🔐

**Current:** Session stored in playwright-helpers/auth-setup.ts  
**Optimized:** Pre-generate sessions for different user roles

```typescript
// Generate 3 sessions: admin, regular user, creator
export const SESSIONS = {
  admin: { token: '...', userId: 15 },
  user: { token: '...', userId: 42 },
  creator: { token: '...', userId: 88 }
};
```

**Expected Speedup:** 5-10% (already optimized with session reuse)

---

### 7. Headless Mode Optimization 🖥️

**Strategy:** Use lightweight browser context

```typescript
// playwright.config.ts
use: {
  headless: true,
  viewport: { width: 1280, height: 720 },
  launchOptions: {
    args: [
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ]
  }
}
```

**Expected Speedup:** 10-15% browser overhead reduction

---

### 8. Skip Non-Critical Tests in PR Checks ✂️

**Strategy:** Tag tests by priority

```typescript
test('critical: user login', async ({ page }) => { ... });
test('important: feed pagination', async ({ page }) => { ... });
test('nice-to-have: profile bio edit', async ({ page }) => { ... });
```

**PR Checks:** Run only `critical` tests (5min)  
**Main Branch:** Run all tests (12min with parallel)

**Expected Speedup:** 80% for PR validation

---

## Implementation Priority

### Phase 1: Quick Wins (Immediate - 50% speedup)
1. ✅ Enable parallel workers (workers: 4)
2. ✅ Disable animations in test mode
3. ✅ Optimize wait strategies (reduce fixed timeouts)

### Phase 2: Medium Effort (Week 1 - 30% additional speedup)
1. Group tests by page context
2. Mock API responses for UI tests
3. Optimize headless browser settings

### Phase 3: Advanced (Week 2 - 20% additional speedup)
1. Implement test sharding for CI
2. Create priority-based test runs
3. Pre-generate multi-user sessions

---

## Expected Results

**Current Performance:**
- Full suite: 45 minutes
- Critical path: 8 minutes

**After Phase 1 (Immediate):**
- Full suite: **12 minutes** ⚡ (4x faster)
- Critical path: **3 minutes** ⚡

**After Phase 2 (Week 1):**
- Full suite: **8 minutes** ⚡ (5.6x faster)
- Critical path: **2 minutes** ⚡

**After Phase 3 (Week 2):**
- Full suite: **6 minutes** ⚡ (7.5x faster)
- PR checks: **2 minutes** ⚡ (critical tests only)

---

## Monitoring & Metrics

**Track These Metrics:**
1. Average test duration
2. Flakiness rate (retries / total)
3. Parallel worker utilization
4. Cache hit rate for sessions
5. Failed test categories

**Tools:**
- Playwright HTML Reporter
- GitHub Actions timing data
- Custom timing logs in tests

---

## Quick Start Implementation

**1. Update playwright.config.ts:**

```typescript
export default defineConfig({
  workers: 4,
  fullyParallel: true,
  retries: 1,
  use: {
    headless: true,
    trace: 'retain-on-failure',
  }
});
```

**2. Add test mode env var:**

```bash
# .env.test
VITE_TEST_MODE=true
NODE_ENV=test
```

**3. Disable animations:**

```typescript
// client/src/lib/constants.ts
export const ANIMATION_DURATION = import.meta.env.VITE_TEST_MODE ? 0 : 200;
```

**4. Run tests:**

```bash
npm run test:e2e -- --workers=4
```

---

## Cost-Benefit Analysis

**Time Investment:**
- Phase 1: 2 hours
- Phase 2: 8 hours
- Phase 3: 16 hours

**Time Saved (per test run):**
- Phase 1: 33 minutes
- Phase 2: 37 minutes (additional)
- Phase 3: 39 minutes (additional)

**ROI:** After 10 test runs, Phase 1 pays for itself completely

---

## Status

- ✅ Session reuse system (playwright-helpers/auth-setup.ts)
- ⏳ Parallel workers implementation
- ⏳ Animation disabling
- ⏳ API mocking for UI tests
- ⏳ Test sharding for CI

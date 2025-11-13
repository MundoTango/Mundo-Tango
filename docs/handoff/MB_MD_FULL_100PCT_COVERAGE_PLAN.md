# MB.MD FULL 100% COVERAGE PLAN
## Mundo Tango Platform - Complete E2E Testing in 21 Days

**Generated:** November 13, 2025  
**Methodology:** MB.MD Protocol (Simultaneously, Recursively, Critically)  
**Target:** 100% E2E coverage (190/190 routes tested)  
**Current:** 46.8% coverage (89/190 routes tested)  
**Remaining:** 101 routes to test in 21 days  
**Strategy:** Maximum parallel execution with 8 temporary specialized agents

---

## EXECUTIVE SUMMARY

### The MB.MD Approach
**Simultaneously:** 8 agents working in parallel across 8 workstreams  
**Recursively:** Deep testing at each layer (UI, API, Database, Integration)  
**Critically:** Quality gates at each phase, no shortcuts

### Success Metrics
- **100% Route Coverage:** 190/190 routes tested
- **95%+ Pass Rate:** Stable, reliable tests
- **<5min Suite Time:** Fast feedback loops
- **Zero LSP Errors:** Clean codebase
- **Production Ready:** Deployment confidence

### Timeline
- **Week 1 (Days 1-7):** P0 Critical Routes (35 routes) + Foundation
- **Week 2 (Days 8-14):** P1 Important Routes (40 routes) + Infrastructure
- **Week 3 (Days 15-21):** P2 Final Routes (26 routes) + Optimization

---

## TEMPORARY AGENT ARCHITECTURE

### 8 Specialized Agents (Parallel Execution)

#### **Agent 1: Life CEO Test Agent**
**Scope:** Life CEO AI system (16 routes)  
**Timeline:** Days 1-4  
**Deliverables:**
- Test all 16 Life CEO agent pages
- Verify AI response quality
- Test data persistence
- Validate agent recommendations

**Routes:**
- /life-ceo (dashboard)
- /life-ceo/health, /finance, /career, /productivity
- /life-ceo/travel, /home, /learning, /social
- /life-ceo/wellness, /entertainment, /creativity
- /life-ceo/fitness, /nutrition, /sleep, /stress

**Test Pattern:**
```typescript
// tests/e2e/batch-lifeceo-agents.spec.ts
test.describe('Life CEO Agents - Complete System', () => {
  const agents = ['health', 'finance', 'career', ...];
  
  for (const agent of agents) {
    test(`Life CEO ${agent} agent works correctly`, async ({ page }) => {
      await page.goto(`/life-ceo/${agent}`);
      await expect(page.getByTestId('agent-interface')).toBeVisible();
      await page.getByTestId('input-query').fill('Test question');
      await page.getByTestId('button-send').click();
      await expect(page.getByTestId('ai-response')).toBeVisible({ timeout: 10000 });
    });
  }
});
```

---

#### **Agent 2: Profile System Test Agent**
**Scope:** 23-tab profile system (15 routes)  
**Timeline:** Days 1-5  
**Deliverables:**
- Test all profile tabs
- Verify data display
- Test edit functionality
- Validate privacy controls

**Routes:**
- /profile/photos, /videos, /events, /groups
- /profile/music, /workshops, /reviews, /travel
- /profile/connections, /badges, /timeline
- /profile/achievements, /stats, /media
- /profile/[userId] (dynamic routes)

**Test Pattern:**
```typescript
// tests/e2e/batch-profile-tabs.spec.ts
test.describe('Profile Tab System - All 23 Tabs', () => {
  const tabs = ['photos', 'videos', 'events', ...];
  
  test.beforeEach(async ({ page }) => {
    // Session reuse helper
    await authHelper.loginAsTestUser(page);
  });
  
  for (const tab of tabs) {
    test(`Profile ${tab} tab displays correctly`, async ({ page }) => {
      await page.goto(`/profile/${tab}`);
      await expect(page.getByTestId(`tab-${tab}`)).toBeVisible();
      await expect(page.getByTestId(`${tab}-content`)).toBeVisible();
    });
  }
});
```

---

#### **Agent 3: Marketplace Test Agent**
**Scope:** Marketplace & detail pages (12 routes)  
**Timeline:** Days 2-6  
**Deliverables:**
- Test listing pages
- Verify detail views
- Test booking flows
- Validate payment integration

**Routes:**
- /housing/:id (individual listings)
- /events/:id (event details)
- /groups/:id (group pages)
- /workshops/:id (workshop details)
- /venues/:id (venue pages)
- /teachers/:id (teacher profiles)

**Test Pattern:**
```typescript
// tests/e2e/batch-marketplace-details.spec.ts
test.describe('Marketplace Detail Pages', () => {
  test('Housing listing detail page', async ({ page }) => {
    // Create test listing via API
    const listing = await apiHelper.createHousingListing();
    
    await page.goto(`/housing/${listing.id}`);
    await expect(page.getByTestId('listing-title')).toContainText(listing.title);
    await expect(page.getByTestId('listing-price')).toBeVisible();
    await expect(page.getByTestId('button-book')).toBeVisible();
  });
  
  // Similar tests for events, workshops, venues, teachers
});
```

---

#### **Agent 4: Content System Test Agent**
**Scope:** Content & media pages (10 routes)  
**Timeline:** Days 3-7  
**Deliverables:**
- Test blog system
- Verify story pages
- Test music library
- Validate media galleries

**Routes:**
- /blog/:id (individual posts)
- /stories/:id (story pages)
- /music-library/:id (track pages)
- /albums/:id (album details)
- /media/:id (media items)

**Test Pattern:**
```typescript
// tests/e2e/batch-content-pages.spec.ts
test.describe('Content System Pages', () => {
  test('Blog post detail page', async ({ page }) => {
    const post = await apiHelper.createBlogPost();
    
    await page.goto(`/blog/${post.id}`);
    await expect(page.getByTestId('post-title')).toContainText(post.title);
    await expect(page.getByTestId('post-content')).toBeVisible();
    await expect(page.getByTestId('post-author')).toBeVisible();
  });
  
  // Similar for stories, music, albums
});
```

---

#### **Agent 5: Account & Settings Test Agent**
**Scope:** Account management & settings (10 routes)  
**Timeline:** Days 4-8  
**Deliverables:**
- Test account flows
- Verify settings pages
- Test preferences
- Validate theme/language

**Routes:**
- /email-verification
- /password-reset
- /account-deletion
- /settings/notifications
- /settings/email-preferences
- /settings/accessibility
- /settings/language
- /settings/theme

**Test Pattern:**
```typescript
// tests/e2e/batch-account-settings.spec.ts
test.describe('Account & Settings Management', () => {
  test('Email verification flow', async ({ page }) => {
    await page.goto('/email-verification');
    await expect(page.getByTestId('verification-message')).toBeVisible();
  });
  
  test('Settings persistence', async ({ page }) => {
    await page.goto('/settings/notifications');
    await page.getByTestId('toggle-email-notifications').click();
    await page.reload();
    await expect(page.getByTestId('toggle-email-notifications')).toBeChecked();
  });
});
```

---

#### **Agent 6: Static & Info Test Agent**
**Scope:** Static pages & documentation (10 routes)  
**Timeline:** Days 5-9  
**Deliverables:**
- Test info pages
- Verify SEO tags
- Test navigation
- Validate content

**Routes:**
- /faq, /features, /dance-styles
- /dance-styles/:id
- /community-guidelines
- /privacy-policy
- /terms-of-service
- /about-tango

**Test Pattern:**
```typescript
// tests/e2e/batch-static-pages.spec.ts
test.describe('Static & Info Pages', () => {
  const staticPages = ['/faq', '/features', '/dance-styles', ...];
  
  for (const route of staticPages) {
    test(`${route} page loads and has SEO`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveTitle(/.+/); // Has title
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    });
  }
});
```

---

#### **Agent 7: Specialized Tools Test Agent**
**Scope:** Advanced tools & features (10 routes)  
**Timeline:** Days 6-10  
**Deliverables:**
- Test visual editor
- Verify talent match
- Test avatar designer
- Validate city guides

**Routes:**
- /avatar-designer
- /visual-editor
- /mr-blue-chat
- /talent-match
- /leaderboard
- /city-guides
- /city-guides/:city
- /venue-recommendations

**Test Pattern:**
```typescript
// tests/e2e/batch-specialized-tools.spec.ts
test.describe('Specialized Tools', () => {
  test('Avatar designer tool', async ({ page }) => {
    await page.goto('/avatar-designer');
    await expect(page.getByTestId('avatar-canvas')).toBeVisible();
    await page.getByTestId('button-customize').click();
    await expect(page.getByTestId('customization-panel')).toBeVisible();
  });
  
  test('Talent match AI', async ({ page }) => {
    await page.goto('/talent-match');
    await expect(page.getByTestId('match-interface')).toBeVisible();
    await page.getByTestId('button-find-matches').click();
    await expect(page.getByTestId('match-results')).toBeVisible({ timeout: 10000 });
  });
});
```

---

#### **Agent 8: Integration & Edge Cases Test Agent**
**Scope:** Remaining routes & edge cases (28 routes)  
**Timeline:** Days 7-14  
**Deliverables:**
- Test remaining pages
- Verify edge cases
- Test error states
- Validate prototypes

**Routes:**
- Dynamic routes
- Modal routes
- Nested pages
- Prototype pages
- Error states

**Test Pattern:**
```typescript
// tests/e2e/batch-edge-cases.spec.ts
test.describe('Edge Cases & Integrations', () => {
  test('Dynamic route with invalid ID', async ({ page }) => {
    await page.goto('/profile/invalid-user-id');
    await expect(page.getByTestId('error-message')).toBeVisible();
  });
  
  test('Modal routing', async ({ page }) => {
    await page.goto('/feed?modal=create-post');
    await expect(page.getByTestId('modal-create-post')).toBeVisible();
  });
});
```

---

## 21-DAY EXECUTION TIMELINE

### Week 1: P0 Critical Routes + Foundation (Days 1-7)

#### **Day 1: Setup + First Batch (10 routes)**
**Agents Active:** All 8 agents (setup phase)

**Morning (4 hours):**
- **All Agents:** Review codebase, understand architecture
- **All Agents:** Set up test helpers, session reuse, API helpers
- **Infrastructure:** Create shared test utilities

**Afternoon (4 hours):**
- **Agent 1:** Start Life CEO agents (4 routes: health, finance, career, productivity)
- **Agent 2:** Start Profile tabs (3 routes: photos, videos, events)
- **Agent 3:** Start Marketplace (3 routes: housing listings)

**Deliverables:** 10 tests created, infrastructure ready

---

#### **Day 2: Parallel Execution (14 routes)**
**Agents Active:** 1, 2, 3, 4

**Morning:**
- **Agent 1:** Life CEO agents (4 routes: travel, home, learning, social)
- **Agent 2:** Profile tabs (4 routes: groups, music, workshops, reviews)
- **Agent 3:** Marketplace (3 routes: event details)
- **Agent 4:** Content pages (3 routes: blog posts)

**Afternoon:**
- Run morning tests
- Fix failures
- Code review

**Deliverables:** 14 tests created, 24 total

---

#### **Day 3: Expansion (14 routes)**
**Agents Active:** 1, 2, 3, 4, 5

**Morning:**
- **Agent 1:** Life CEO agents (4 routes: wellness, entertainment, creativity, fitness)
- **Agent 2:** Profile tabs (3 routes: travel, connections, badges)
- **Agent 3:** Marketplace (3 routes: workshops, venues)
- **Agent 4:** Content pages (2 routes: stories, music)
- **Agent 5:** Account management (2 routes: email verification, password reset)

**Deliverables:** 14 tests created, 38 total

---

#### **Day 4: Full Agent Deployment (16 routes)**
**Agents Active:** All 8 agents

**Morning:**
- **Agent 1:** Life CEO final (4 routes: nutrition, sleep, stress, dashboard)
- **Agent 2:** Profile tabs (4 routes: timeline, achievements, stats, media)
- **Agent 3:** Marketplace (2 routes: teacher profiles)
- **Agent 4:** Content pages (2 routes: albums, media)
- **Agent 5:** Account management (2 routes: account deletion, settings)
- **Agent 6:** Static pages (2 routes: FAQ, features)

**Deliverables:** 16 tests created, 54 total

---

#### **Day 5: Consolidation (12 routes)**
**Agents Active:** 2, 5, 6, 7

**Morning:**
- **Agent 2:** Profile dynamic routes (3 routes)
- **Agent 5:** Settings pages (3 routes: notifications, email prefs, accessibility)
- **Agent 6:** Static pages (3 routes: dance styles, community guidelines)
- **Agent 7:** Specialized tools (3 routes: avatar designer, visual editor, mr-blue)

**Afternoon:**
- Run all 66 tests
- Fix failures
- Performance optimization

**Deliverables:** 12 tests created, 66 total

---

#### **Day 6: Quality Gate 1 (10 routes)**
**Agents Active:** 3, 6, 7, 8

**Morning:**
- **Agent 6:** Static pages (4 routes: privacy, terms, about-tango)
- **Agent 7:** Specialized tools (3 routes: talent match, leaderboard, city guides)
- **Agent 8:** Edge cases (3 routes: error states)

**Afternoon:**
- **All Agents:** Run full test suite
- **All Agents:** Fix all failures
- **Quality Gate:** Must achieve 95%+ pass rate

**Deliverables:** 10 tests created, 76 total, QA checkpoint

---

#### **Day 7: Week 1 Completion (9 routes)**
**Agents Active:** 7, 8

**Morning:**
- **Agent 7:** Specialized tools final (2 routes: venue recommendations)
- **Agent 8:** Edge cases (7 routes: dynamic routes, modals)

**Afternoon:**
- **All Agents:** Week 1 retrospective
- **Infrastructure:** Optimize test helpers
- **Documentation:** Update test coverage matrix

**Deliverables:** 9 tests created, 85 total routes tested (45% → 60% coverage)

---

### Week 2: P1 Important Routes + Infrastructure (Days 8-14)

#### **Day 8: Detail Pages Focus (12 routes)**
**Agents Active:** 3, 4, 8

**All Day:**
- **Agent 3:** Complete all marketplace detail pages (6 routes)
- **Agent 4:** Complete all content detail pages (4 routes)
- **Agent 8:** Nested page routes (2 routes)

**Deliverables:** 12 tests created, 97 total

---

#### **Day 9: Settings & Preferences (10 routes)**
**Agents Active:** 5, 6

**All Day:**
- **Agent 5:** Complete all settings pages (6 routes)
- **Agent 6:** Complete all static pages (4 routes)

**Deliverables:** 10 tests created, 107 total

---

#### **Day 10: Advanced Features (12 routes)**
**Agents Active:** 7, 8

**All Day:**
- **Agent 7:** Complete specialized tools (6 routes)
- **Agent 8:** Prototype pages (6 routes)

**Deliverables:** 12 tests created, 119 total

---

#### **Day 11: Dynamic Routes (14 routes)**
**Agents Active:** All agents

**All Day:**
- **All Agents:** Test dynamic routes with various IDs
- **All Agents:** Test query parameters
- **All Agents:** Test route transitions

**Deliverables:** 14 tests created, 133 total

---

#### **Day 12: Quality Gate 2 (10 routes)**
**Agents Active:** All agents

**Morning:**
- Complete remaining P1 routes (10 routes)

**Afternoon:**
- **Quality Gate 2:** Full test suite must pass at 95%+
- Fix all failures
- Performance benchmarks

**Deliverables:** 10 tests created, 143 total (75% coverage)

---

#### **Day 13: Integration Testing (8 routes)**
**Agents Active:** 8

**All Day:**
- Cross-page workflows
- Multi-step journeys
- Integration scenarios

**Deliverables:** 8 tests created, 151 total

---

#### **Day 14: Week 2 Completion (6 routes)**
**Agents Active:** All agents

**Morning:**
- Complete remaining routes (6 routes)

**Afternoon:**
- Week 2 retrospective
- Refactor brittle tests
- Optimize slow tests

**Deliverables:** 6 tests created, 157 total (82% coverage)

---

### Week 3: P2 Final Routes + Optimization (Days 15-21)

#### **Day 15-17: Final Route Coverage (20 routes)**
**Agents Active:** All agents

**Strategy:** Parallel sweep of all remaining untested routes

**Deliverables:** 20 tests created, 177 total (93% coverage)

---

#### **Day 18: Quality Gate 3 (8 routes)**
**Morning:**
- Complete final routes (8 routes)

**Afternoon:**
- **Quality Gate 3:** 100% route coverage
- All tests passing at 95%+
- Performance under 5 minutes

**Deliverables:** 8 tests created, 185 total (97% coverage)

---

#### **Day 19: Edge Case Completion (5 routes)**
**All Day:**
- Final edge cases
- Error scenarios
- Boundary conditions

**Deliverables:** 5 tests created, 190 total (100% coverage)

---

#### **Day 20: Optimization & Stability**
**All Day:**
- Refactor flaky tests
- Optimize slow tests
- Add retry logic
- Improve error messages

**Deliverables:** 100% coverage, 95%+ pass rate, <5min suite

---

#### **Day 21: Final Validation & Deployment**
**Morning:**
- Final test suite run
- Generate coverage report
- Update documentation

**Afternoon:**
- Deploy to production
- Monitor deployment
- Celebrate 100% coverage! 🎉

---

## PARALLEL EXECUTION STRATEGY

### Agent Coordination

#### **Shared Infrastructure (All Agents)**
```typescript
// tests/helpers/shared-helpers.ts
export class TestHelper {
  static async loginAsTestUser(page: Page) { /* ... */ }
  static async createTestData() { /* ... */ }
  static async cleanupTestData() { /* ... */ }
}

export class APIHelper {
  static async createListing(type: string, data: any) { /* ... */ }
  static async createContent(type: string, data: any) { /* ... */ }
}
```

#### **Agent-Specific Helpers**
Each agent creates domain-specific helpers:
- Agent 1: `LifeCEOHelper` - AI interaction patterns
- Agent 2: `ProfileHelper` - Tab navigation, data setup
- Agent 3: `MarketplaceHelper` - Listing creation, booking flows
- Agent 4: `ContentHelper` - Post/story/media creation
- Agent 5: `AccountHelper` - Settings management
- Agent 6: `SEOHelper` - Meta tag validation
- Agent 7: `ToolHelper` - Specialized feature testing
- Agent 8: `EdgeCaseHelper` - Error simulation

#### **Daily Standup Pattern**
```markdown
**Morning Standup (9 AM):**
- Each agent reports: Yesterday's progress, Today's plan, Blockers
- Resolve conflicts (shared routes, helper dependencies)
- Assign priority routes

**Evening Review (5 PM):**
- Each agent reports: Tests created, Pass rate, Issues found
- Code review agent work
- Plan next day
```

---

## TEST QUALITY STANDARDS

### Every Test Must Include

#### **1. Page Load Verification**
```typescript
await page.goto('/route');
await expect(page).toHaveTitle(/.+/);
await expect(page.getByTestId('main-content')).toBeVisible();
```

#### **2. Core Functionality**
```typescript
// Test the primary purpose of the page
await page.getByTestId('primary-action').click();
await expect(page.getByTestId('expected-result')).toBeVisible();
```

#### **3. Performance Check**
```typescript
const loadTime = await measurePageLoad(page);
expect(loadTime).toBeLessThan(3000); // <3s load time
```

#### **4. Error Handling**
```typescript
// Test error states
await page.getByTestId('invalid-action').click();
await expect(page.getByTestId('error-message')).toBeVisible();
```

#### **5. Data Persistence**
```typescript
// Create data, reload, verify persistence
await createTestData(page);
await page.reload();
await expect(page.getByTestId('persisted-data')).toBeVisible();
```

---

## RISK MANAGEMENT

### Known Risks & Mitigation

#### **Risk 1: Test Flakiness**
**Mitigation:**
- Proper wait strategies (waitForNetworkIdle)
- Retry logic for unreliable APIs
- Session reuse to reduce auth overhead
- Stable selectors (data-testid)

#### **Risk 2: Agent Conflicts**
**Mitigation:**
- Clear route ownership per agent
- Shared helper review process
- Daily coordination standups
- Git branch per agent

#### **Risk 3: Time Overruns**
**Mitigation:**
- Buffer days built into schedule
- Priority-based execution (P0→P1→P2)
- Quality gates at each week
- Can stop at 80% if needed

#### **Risk 4: Infrastructure Issues**
**Mitigation:**
- Test infrastructure on Day 1
- Backup test runners
- Local + CI test execution
- Monitoring test health

---

## SUCCESS CRITERIA

### Week 1 Gate
- ✅ 85 routes tested (60% coverage)
- ✅ 95%+ tests passing
- ✅ Infrastructure stable
- ✅ All agents productive

### Week 2 Gate
- ✅ 157 routes tested (82% coverage)
- ✅ 95%+ tests passing
- ✅ <5min test suite
- ✅ No critical bugs

### Week 3 Gate (Final)
- ✅ 190 routes tested (100% coverage)
- ✅ 95%+ tests passing
- ✅ <5min test suite
- ✅ Production deployed
- ✅ Zero LSP errors
- ✅ Documentation complete

---

## MEASUREMENT & TRACKING

### Daily Metrics
```markdown
| Day | Routes Tested | Pass Rate | Suite Time | Blockers |
|-----|---------------|-----------|------------|----------|
| 1   | 10            | 100%      | 0:30       | 0        |
| 2   | 24            | 96%       | 1:10       | 1        |
| ... | ...           | ...       | ...        | ...      |
```

### Agent Performance
```markdown
| Agent | Routes Assigned | Routes Completed | Pass Rate | Avg Time/Route |
|-------|-----------------|------------------|-----------|----------------|
| 1     | 16              | 16               | 98%       | 45min          |
| 2     | 15              | 15               | 97%       | 52min          |
| ...   | ...             | ...              | ...       | ...            |
```

---

## IMMEDIATE NEXT ACTIONS

### Day 1 Morning (4 hours) - START NOW

#### **Action 1: Create Test Infrastructure** (1 hour)
```bash
# Create shared helpers
mkdir -p tests/helpers
touch tests/helpers/auth-helper.ts
touch tests/helpers/api-helper.ts
touch tests/helpers/test-data.ts
```

#### **Action 2: Set Up Agent Workspaces** (1 hour)
```bash
# Create agent-specific test files
touch tests/e2e/batch-lifeceo-agents.spec.ts      # Agent 1
touch tests/e2e/batch-profile-tabs.spec.ts        # Agent 2
touch tests/e2e/batch-marketplace-details.spec.ts # Agent 3
touch tests/e2e/batch-content-pages.spec.ts       # Agent 4
touch tests/e2e/batch-account-settings.spec.ts    # Agent 5
touch tests/e2e/batch-static-pages.spec.ts        # Agent 6
touch tests/e2e/batch-specialized-tools.spec.ts   # Agent 7
touch tests/e2e/batch-edge-cases.spec.ts          # Agent 8
```

#### **Action 3: Create First Tests** (2 hours)
- Agent 1: Life CEO health agent
- Agent 2: Profile photos tab
- Agent 3: Housing listing detail

#### **Action 4: Validate Setup** (30min)
```bash
npx playwright test --project=chromium
```

---

## CONCLUSION

This MB.MD plan achieves **100% E2E coverage in 21 days** through:

1. **Maximum Parallelization:** 8 agents working simultaneously
2. **Clear Ownership:** Each agent owns specific routes
3. **Quality Gates:** Weekly checkpoints ensure progress
4. **Risk Mitigation:** Built-in buffers and fallbacks
5. **Realistic Timeline:** 4-5 routes per agent per day

**Current State:** 89/190 routes (46.8%)  
**Target State:** 190/190 routes (100%)  
**Timeline:** 21 days  
**Confidence:** High with MB.MD execution

---

**Document Status:** ✅ READY FOR IMMEDIATE EXECUTION  
**Next Action:** Start Day 1 Morning - Create test infrastructure  
**Generated:** November 13, 2025

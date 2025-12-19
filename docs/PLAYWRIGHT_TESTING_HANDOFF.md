# 🎭 PLAYWRIGHT TESTING HANDOFF
## Complete Guide to E2E Testing in Mundo Tango

**Date:** November 6, 2025  
**Methodology:** MB.MD Protocol (Simultaneously, Recursively, Critically)  
**Status:** Production-Ready Testing Infrastructure  
**Test Coverage:** 39+ test files, 150+ test cases  
**Standard Test Suites:** 7 comprehensive test categories

---

## 📚 TABLE OF CONTENTS

### PART 1: QUICK START
1. [Installation & Setup](#installation--setup)
2. [Running Tests](#running-tests)
3. [First Test Walkthrough](#first-test-walkthrough)

### PART 2: TEST INFRASTRUCTURE
4. [Configuration Deep Dive](#configuration-deep-dive)
5. [Project Structure](#project-structure)
6. [Test Organization](#test-organization)
7. [Naming Conventions](#naming-conventions)

### PART 3: WRITING TESTS
8. [Test Anatomy](#test-anatomy)
9. [Authentication Patterns](#authentication-patterns)
10. [Test ID Strategy](#test-id-strategy)
11. [Common Patterns](#common-patterns)
12. [Best Practices](#best-practices)

### PART 4: ADVANCED TOPICS
13. [Visual Editor Testing](#visual-editor-testing)
14. [Real-time Features](#real-time-features)
15. [API Testing](#api-testing)
16. [Database State Management](#database-state-management)

### PART 5: DEBUGGING & TROUBLESHOOTING
17. [Debugging Failed Tests](#debugging-failed-tests)
18. [Common Issues](#common-issues)
19. [Video & Screenshots](#video--screenshots)
20. [Trace Viewer](#trace-viewer)

### PART 6: STANDARD TEST SUITES
21. [Comprehensive Platform Tests](#comprehensive-platform-tests)
22. [Performance Tests](#performance-tests)
23. [Security & Auth Tests](#security--auth-tests)
24. [Design System Tests](#design-system-tests)
25. [Customer Journey Tests](#customer-journey-tests)
26. [ESA Framework Tests](#esa-framework-tests)
27. [Feature-Specific Tests](#feature-specific-tests)

### PART 7: CI/CD & DEPLOYMENT
28. [CI/CD Integration](#cicd-integration)
29. [Test Reports](#test-reports)
30. [Performance Considerations](#performance-considerations)

---

# PART 1: QUICK START

---

## INSTALLATION & SETUP

### Prerequisites

**Required:**
- Node.js 20+
- npm installed
- Mundo Tango app running (`npm run dev`)

**Already Installed:**
```json
{
  "@playwright/test": "^1.56.1"
}
```

### First-Time Setup

**1. Install Playwright Browsers:**
```bash
npx playwright install chromium
```

**2. Verify Installation:**
```bash
npx playwright --version
# Expected: Version 1.56.1
```

**3. Test Configuration:**
```bash
cat playwright.config.ts
# Should show configuration pointing to http://localhost:5000
```

---

## RUNNING TESTS

### Basic Commands

**Run ALL tests:**
```bash
npx playwright test
```

**Run specific test file:**
```bash
npx playwright test tests/e2e/01-public-marketing.spec.ts
```

**Run tests in a folder:**
```bash
npx playwright test tests/e2e/
```

**Run tests matching a pattern:**
```bash
npx playwright test visual-editor
```

**Run in headed mode (see browser):**
```bash
npx playwright test --headed
```

**Run in debug mode:**
```bash
npx playwright test --debug
```

**Run specific test by name:**
```bash
npx playwright test -g "should navigate through all public pages"
```

---

### Interactive Commands

**Open Playwright UI:**
```bash
npx playwright test --ui
```
- **Best for:** Interactive test exploration
- **Features:** Watch tests run, inspect elements, time travel debugging

**Open Last Test Report:**
```bash
npx playwright show-report
```
- **Shows:** HTML report with screenshots, videos, traces
- **Location:** `test-results/html-report/`

**Open Trace Viewer:**
```bash
npx playwright show-trace test-results/trace.zip
```
- **Shows:** Detailed execution timeline, network calls, DOM snapshots

---

### Advanced Options

**Run with specific browser:**
```bash
npx playwright test --project=chromium
```

**Run in parallel (specify workers):**
```bash
npx playwright test --workers=4
```
⚠️ **Note:** Current config sets `workers: 1` to avoid race conditions

**Update snapshots:**
```bash
npx playwright test --update-snapshots
```

**List all tests:**
```bash
npx playwright test --list
```

**Show test output:**
```bash
npx playwright test --reporter=line
```

---

## FIRST TEST WALKTHROUGH

### Example: Public Marketing Test

**File:** `tests/e2e/01-public-marketing.spec.ts`

**Test Code:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Public Marketing Site Journey', () => {
  test('should navigate through all public pages', async ({ page }) => {
    // 1. Navigate to home page
    await page.goto('/');
    
    // 2. Verify page title
    await expect(page).toHaveTitle(/Mundo Tango/i);
    
    // 3. Check for navigation
    await expect(page.getByTestId('nav-public')).toBeVisible();
    
    // 4. Navigate to About page
    await page.getByTestId('link-about').click();
    await page.waitForURL('**/about');
    
    // 5. Verify About page loaded
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
  });
});
```

**Run this test:**
```bash
npx playwright test tests/e2e/01-public-marketing.spec.ts
```

**Expected output:**
```
Running 1 test using 1 worker

  ✓  tests/e2e/01-public-marketing.spec.ts:3:3 › should navigate through all public pages (2s)

  1 passed (3s)
```

---

# PART 2: TEST INFRASTRUCTURE

---

## CONFIGURATION DEEP DIVE

### playwright.config.ts

**Full Configuration:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Parallel execution
  fullyParallel: false,  // Run tests sequentially
  workers: 1,            // Single worker to avoid race conditions
  
  // CI/CD settings
  forbidOnly: !!process.env.CI,  // Fail if test.only() in CI
  retries: process.env.CI ? 2 : 0,  // Retry failed tests in CI
  
  // Reporters
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']  // Console output
  ],
  
  // Global test settings
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'retain-on-failure',       // Trace only on failure
    screenshot: 'only-on-failure',     // Screenshot only on failure
    video: {
      mode: 'retain-on-failure',       // Video only on failure
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 },
  },

  // Output directory for videos
  outputDir: 'test-videos',

  // Browser configuration
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  // Web server auto-start
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,  // Reuse in dev, restart in CI
    timeout: 120000,  // 2 minutes to start server
  },
});
```

---

### Configuration Breakdown

**Test Execution:**
- `fullyParallel: false` - Tests run sequentially
- `workers: 1` - Single worker prevents race conditions
- **Why?** Database state shared between tests

**Retry Strategy:**
- Local: 0 retries (fail fast for quick feedback)
- CI: 2 retries (handle flaky network/timing issues)

**Media Capture:**
- Traces: Only on failure (full execution timeline)
- Screenshots: Only on failure (visual evidence)
- Videos: Only on failure (1920x1080 HD)
- **Why?** Saves disk space, speeds up tests

**Base URL:**
- `http://localhost:5000` - All `page.goto('/')` uses this
- Can override with `--config baseURL=http://example.com`

**Web Server:**
- Auto-starts `npm run dev` before tests
- Waits for server to be ready (polls URL)
- Reuses existing server in dev (faster iteration)
- Restarts in CI (clean environment)

---

## PROJECT STRUCTURE

### Test Directory Layout

```
tests/
├── e2e/                              # End-to-end user journeys
│   ├── 01-public-marketing.spec.ts   # Public pages
│   ├── 02-registration-auth.spec.ts  # User registration
│   ├── 03-social-engagement.spec.ts  # Social features
│   ├── 04-event-discovery.spec.ts    # Events system
│   ├── 05-mr-blue-ai-chat.spec.ts    # AI chat
│   ├── 06-housing-marketplace.spec.ts # Housing
│   ├── 07-admin-dashboard.spec.ts    # Admin features
│   ├── 08-profile-management.spec.ts # Profiles
│   ├── 09-algorithm-integration.spec.ts # Algorithms
│   ├── 10-modal-features.spec.ts     # Modals & dialogs
│   ├── community-map.spec.ts         # Map features
│   ├── customer-journey-*.spec.ts    # User journeys
│   ├── esa-*.spec.ts                 # ESA framework
│   ├── favorites.spec.ts             # Favorites
│   ├── invitations.spec.ts           # Invitations
│   ├── login-error-recovery.spec.ts  # Error handling
│   ├── memories.spec.ts              # Memories
│   ├── recommendations.spec.ts       # Recommendations
│   └── theme-validation.spec.ts      # Theme system
│
├── deployment/                       # Deployment validation
│   ├── environment-validation.spec.ts # Env vars
│   ├── performance-page-load.spec.ts  # Performance
│   └── security-auth.spec.ts          # Security
│
├── visual/                           # Visual regression
│   └── design-system.spec.ts         # Design system
│
├── visual-editor-*.spec.ts           # Visual Editor tests (12 files)
│   ├── visual-editor-ui.spec.ts      # UI structure
│   ├── visual-editor-selection.spec.ts # Element selection
│   ├── visual-editor-editing.spec.ts  # Editing controls
│   ├── visual-editor-mrblue.spec.ts   # Mr. Blue integration
│   ├── visual-editor-workflow.spec.ts # Complete workflows
│   └── ...                           # More VE tests
│
└── feed-login.spec.ts                # Quick smoke test
```

---

## TEST ORGANIZATION

### Test File Structure

**Standard Pattern:**
```typescript
import { test, expect } from '@playwright/test';

// Test suite (describe block)
test.describe('Feature Name', () => {
  
  // Setup before each test
  test.beforeEach(async ({ page }) => {
    // Common setup (login, navigation, etc.)
  });
  
  // Individual test cases
  test('should do something specific', async ({ page }) => {
    // Test implementation
  });
  
  test('should handle edge case', async ({ page }) => {
    // Edge case test
  });
  
  // Teardown after each test (if needed)
  test.afterEach(async ({ page }) => {
    // Cleanup
  });
});
```

---

### Grouping Strategy

**By User Journey:**
```typescript
test.describe('User Registration Journey', () => {
  test('should display registration form');
  test('should validate email format');
  test('should create account successfully');
  test('should redirect to onboarding');
});
```

**By Feature:**
```typescript
test.describe('Event Discovery', () => {
  test('should display event list');
  test('should filter by date');
  test('should search events');
  test('should view event details');
});
```

**By Page:**
```typescript
test.describe('Profile Page', () => {
  test('should display user info');
  test('should edit profile');
  test('should upload avatar');
  test('should update bio');
});
```

---

## NAMING CONVENTIONS

### File Naming

**Pattern:** `{number}-{feature-name}.spec.ts`

**Examples:**
```
01-public-marketing.spec.ts     # Numbered sequence
02-registration-auth.spec.ts
visual-editor-ui.spec.ts        # Feature-specific
community-map.spec.ts           # Standalone feature
```

**Rules:**
- Use kebab-case
- Always end with `.spec.ts`
- Number critical path tests (01, 02, 03...)
- Group related tests by prefix (`visual-editor-*`)

---

### Test Naming

**Pattern:** `should {action} {expected result}`

**Good Examples:**
```typescript
test('should display login form')
test('should validate email format')
test('should navigate to profile page after login')
test('should show error message for invalid credentials')
test('should toggle theme when button clicked')
```

**Bad Examples:**
```typescript
test('login') // Too vague
test('test the login functionality') // Redundant "test"
test('it works') // Not descriptive
```

---

### Describe Block Naming

**Pattern:** `{Feature/Page Name}`

**Examples:**
```typescript
test.describe('Public Marketing Site Journey')
test.describe('User Registration')
test.describe('Event Discovery')
test.describe('Visual Editor - UI Structure')
test.describe('Visual Editor - Element Selection')
```

---

# PART 3: WRITING TESTS

---

## TEST ANATOMY

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  // 1. ARRANGE - Set up initial state
  await page.goto('/some-page');
  
  // 2. ACT - Perform action
  await page.click('[data-testid="button-submit"]');
  
  // 3. ASSERT - Verify result
  await expect(page.getByText('Success!')).toBeVisible();
});
```

---

### Key Playwright Objects

**page:** Browser page object
```typescript
await page.goto('/');              // Navigate
await page.click('button');        // Click element
await page.fill('input', 'text');  // Fill input
await page.waitForURL('/profile'); // Wait for navigation
```

**expect:** Assertion library
```typescript
await expect(element).toBeVisible();
await expect(element).toHaveText('Hello');
await expect(page).toHaveURL('/profile');
await expect(element).toHaveAttribute('disabled');
```

**context:** Browser context (for multi-page tests)
```typescript
test('test', async ({ context }) => {
  const page1 = await context.newPage();
  const page2 = await context.newPage();
});
```

---

## AUTHENTICATION PATTERNS

### Standard Login Flow

**Most Common Pattern:**
```typescript
test.beforeEach(async ({ page }) => {
  // Navigate to home/login
  await page.goto('/');
  
  // Fill credentials
  await page.fill('[data-testid="input-email"]', 'admin@mundotango.life');
  await page.fill('[data-testid="input-password"]', 'admin123');
  
  // Submit
  await page.click('[data-testid="button-login"]');
  
  // Wait for redirect
  await page.waitForURL('/');
});
```

---

### Test User Accounts

**Available Test Accounts:**
```typescript
// Admin account
{
  email: 'admin@mundotango.life',
  password: 'admin123',
  role: 'super_admin'
}

// Regular user
{
  email: 'user@example.com',
  password: 'user123',
  role: 'user'
}

// Create in test if needed
await page.goto('/register');
await page.fill('[data-testid="input-username"]', 'testuser');
await page.fill('[data-testid="input-email"]', 'test@example.com');
await page.fill('[data-testid="input-password"]', 'test123');
await page.click('[data-testid="button-register"]');
```

---

### Reusable Login Helper

**Create helper function:**
```typescript
// tests/helpers/auth.ts
export async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.fill('[data-testid="input-email"]', 'admin@mundotango.life');
  await page.fill('[data-testid="input-password"]', 'admin123');
  await page.click('[data-testid="button-login"]');
  await page.waitForURL('/');
}

export async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.fill('[data-testid="input-email"]', email);
  await page.fill('[data-testid="input-password"]', password);
  await page.click('[data-testid="button-login"]');
  await page.waitForURL('/');
}

// Use in tests
import { loginAsAdmin } from './helpers/auth';

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);
});
```

---

## TEST ID STRATEGY

### Why Test IDs?

**Problem:** Selectors break with UI changes
```typescript
// BAD - Breaks if class names change
await page.click('.btn-primary.login-button');

// GOOD - Stable selector
await page.click('[data-testid="button-login"]');
```

---

### Test ID Convention

**Pattern:** `{type}-{description}`

**Interactive Elements:**
```typescript
[data-testid="button-submit"]
[data-testid="button-login"]
[data-testid="input-email"]
[data-testid="input-password"]
[data-testid="link-profile"]
[data-testid="select-country"]
```

**Display Elements:**
```typescript
[data-testid="text-username"]
[data-testid="text-email"]
[data-testid="status-payment"]
[data-testid="img-avatar"]
```

**Dynamic Elements:**
```typescript
[data-testid="card-event-${eventId}"]
[data-testid="post-${postId}"]
[data-testid="comment-${commentId}"]
```

---

### Selector Priority

**1. Test IDs (Most Reliable):**
```typescript
await page.click('[data-testid="button-submit"]');
```

**2. Role + Name (Semantic):**
```typescript
await page.getByRole('button', { name: 'Submit' });
await page.getByRole('heading', { name: /Welcome/i });
```

**3. Text Content:**
```typescript
await page.getByText('Submit');
await page.getByText(/Welcome to/i);
```

**4. Label (Forms):**
```typescript
await page.getByLabel('Email');
await page.getByLabel('Password');
```

**5. CSS Selectors (Last Resort):**
```typescript
await page.click('button.submit');
```

---

## COMMON PATTERNS

### Navigation & Waiting

**Navigate and wait:**
```typescript
await page.goto('/events');
await page.waitForURL('**/events');
```

**Click and wait for navigation:**
```typescript
await page.click('[data-testid="link-profile"]');
await page.waitForURL('**/profile/**');
```

**Wait for element:**
```typescript
await page.waitForSelector('[data-testid="post-list"]');
```

**Wait for network idle:**
```typescript
await page.waitForLoadState('networkidle');
```

---

### Forms

**Fill form:**
```typescript
await page.fill('[data-testid="input-title"]', 'My Event');
await page.fill('[data-testid="input-description"]', 'Event details');
await page.selectOption('[data-testid="select-type"]', 'workshop');
await page.check('[data-testid="checkbox-public"]');
await page.click('[data-testid="button-submit"]');
```

**Verify form validation:**
```typescript
await page.click('[data-testid="button-submit"]');
await expect(page.getByText('Email is required')).toBeVisible();
```

---

### Lists & Iteration

**Check list items:**
```typescript
const posts = page.locator('[data-testid^="post-"]');
await expect(posts).toHaveCount(10);

// Check first post
await expect(posts.first()).toBeVisible();

// Check last post
await expect(posts.last()).toBeVisible();

// Iterate over posts
const count = await posts.count();
for (let i = 0; i < count; i++) {
  const post = posts.nth(i);
  await expect(post).toBeVisible();
}
```

---

### Modals & Dialogs

**Open modal:**
```typescript
await page.click('[data-testid="button-create-event"]');
await expect(page.getByRole('dialog')).toBeVisible();
```

**Fill modal form:**
```typescript
await page.fill('[data-testid="input-event-title"]', 'New Event');
await page.click('[data-testid="button-save"]');
```

**Close modal:**
```typescript
await page.click('[data-testid="button-close"]');
await expect(page.getByRole('dialog')).not.toBeVisible();
```

---

### Assertions

**Visibility:**
```typescript
await expect(element).toBeVisible();
await expect(element).not.toBeVisible();
await expect(element).toBeHidden();
```

**Text:**
```typescript
await expect(element).toHaveText('Hello');
await expect(element).toContainText('Hello');
await expect(element).toHaveText(/Hello.*/);
```

**Attributes:**
```typescript
await expect(element).toHaveAttribute('href', '/profile');
await expect(element).toHaveAttribute('disabled');
await expect(element).toHaveClass(/active/);
```

**Count:**
```typescript
await expect(page.locator('.post')).toHaveCount(10);
```

**URL:**
```typescript
await expect(page).toHaveURL('/profile');
await expect(page).toHaveURL(/\/profile\/\d+/);
```

---

## BEST PRACTICES

### 1. Use Meaningful Waits

**BAD:**
```typescript
await page.waitForTimeout(2000); // Arbitrary wait
```

**GOOD:**
```typescript
await page.waitForSelector('[data-testid="post-list"]');
await page.waitForURL('**/feed');
await page.waitForLoadState('networkidle');
```

---

### 2. Test User-Visible Behavior

**BAD:**
```typescript
// Testing implementation details
expect(await page.locator('.hidden-class').count()).toBe(0);
```

**GOOD:**
```typescript
// Testing user-visible behavior
await expect(page.getByText('Welcome')).toBeVisible();
```

---

### 3. Keep Tests Independent

**Each test should:**
- Set up its own state
- Not depend on other tests
- Clean up after itself (if needed)

**BAD:**
```typescript
let userId;
test('create user', async () => {
  userId = await createUser(); // State shared
});
test('update user', async () => {
  await updateUser(userId); // Depends on previous test
});
```

**GOOD:**
```typescript
test('should update user', async ({ page }) => {
  const userId = await createUser(); // Own setup
  await updateUser(userId);
  // Test is self-contained
});
```

---

### 4. Use Descriptive Test Names

**BAD:**
```typescript
test('test 1', async ({ page }) => { ... });
test('it works', async ({ page }) => { ... });
```

**GOOD:**
```typescript
test('should display error message when email is invalid', async ({ page }) => { ... });
test('should redirect to feed after successful login', async ({ page }) => { ... });
```

---

### 5. Group Related Tests

```typescript
test.describe('Event Creation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/events/create');
  });
  
  test('should create basic event');
  test('should create recurring event');
  test('should validate required fields');
});
```

---

### 6. Avoid Hardcoded Waits

**Use auto-waiting instead:**
- `click()` waits for element to be visible and enabled
- `fill()` waits for element to be editable
- `expect()` auto-retries until timeout

**Only use `waitForTimeout()` as last resort.**

---

### 7. Handle Multiple States

```typescript
test('should handle both empty and loaded states', async ({ page }) => {
  await page.goto('/events');
  
  // Check for either loading or content
  const loading = page.getByText('Loading...');
  const content = page.locator('[data-testid="event-list"]');
  
  // Wait for one to appear
  await Promise.race([
    loading.waitFor({ state: 'visible' }),
    content.waitFor({ state: 'visible' })
  ]);
  
  // If loading, wait for content
  if (await loading.isVisible()) {
    await content.waitFor({ state: 'visible' });
  }
});
```

---

# PART 4: ADVANCED TOPICS

---

## VISUAL EDITOR TESTING

### Special Considerations

**Visual Editor is complex:**
- Iframe-based preview
- PostMessage communication
- Element selection
- Real-time updates
- Multiple tabs

---

### Iframe Interaction

**Access iframe:**
```typescript
const iframe = page.frameLocator('[data-testid="preview-iframe"]');

// Interact with elements inside iframe
await iframe.locator('button').click();
await expect(iframe.getByText('Hello')).toBeVisible();
```

**Switch between main and iframe:**
```typescript
// Main page
await page.click('[data-testid="tab-mr-blue"]');

// Inside iframe
const iframe = page.frameLocator('[data-testid="preview-iframe"]');
await iframe.locator('.element').click();

// Back to main page
await page.click('[data-testid="button-save"]');
```

---

### PostMessage Testing

**Test communication:**
```typescript
// Listen for postMessage events
page.on('framenavigated', async (frame) => {
  // Check frame communication
});

// Trigger action that sends postMessage
await page.click('[data-testid="button-select-element"]');

// Verify result in main window
await expect(page.locator('[data-testid="selected-element"]')).toHaveText('Button');
```

---

### Element Selection Flow

**Complete workflow:**
```typescript
test('should select and edit element', async ({ page }) => {
  // 1. Login and navigate
  await loginAsAdmin(page);
  await page.goto('/admin/visual-editor');
  
  // 2. Wait for editor to load
  await page.waitForSelector('[data-visual-editor="root"]');
  
  // 3. Select preview page
  await page.selectOption('[data-testid="select-preview-page"]', '/feed');
  await page.waitForTimeout(1000); // Wait for iframe reload
  
  // 4. Click element in iframe
  const iframe = page.frameLocator('[data-testid="preview-iframe"]');
  await iframe.locator('button').first().click();
  
  // 5. Verify element selected in main page
  await expect(page.locator('[data-testid="selected-element-type"]')).toContainText('button');
  
  // 6. Edit element
  await page.fill('[data-testid="input-position-x"]', '100');
  await page.click('[data-testid="button-apply-changes"]');
  
  // 7. Verify changes applied
  await expect(page.getByText('Changes applied')).toBeVisible();
});
```

---

## REAL-TIME FEATURES

### Testing Real-time Updates

**Approach 1: Multiple Browser Contexts**
```typescript
test('should show real-time messages', async ({ browser }) => {
  // Create two users
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  
  const page1 = await context1.newPage();
  const page2 = await context2.newPage();
  
  // User 1 logs in
  await loginAsUser(page1, 'user1@example.com', 'pass123');
  await page1.goto('/messages/conversation/1');
  
  // User 2 logs in
  await loginAsUser(page2, 'user2@example.com', 'pass123');
  await page2.goto('/messages/conversation/1');
  
  // User 1 sends message
  await page1.fill('[data-testid="input-message"]', 'Hello!');
  await page1.click('[data-testid="button-send"]');
  
  // User 2 should see message (real-time)
  await expect(page2.getByText('Hello!')).toBeVisible({ timeout: 5000 });
  
  await context1.close();
  await context2.close();
});
```

**Approach 2: Wait for WebSocket**
```typescript
test('should connect to websocket', async ({ page }) => {
  // Listen for WebSocket connection
  page.on('websocket', ws => {
    console.log('WebSocket opened:', ws.url());
    ws.on('framesent', frame => console.log('Sent:', frame.payload));
    ws.on('framereceived', frame => console.log('Received:', frame.payload));
  });
  
  await page.goto('/messages');
  
  // Wait for real-time connection
  await page.waitForTimeout(2000);
  
  // Verify connection indicator
  await expect(page.getByTestId('status-connected')).toBeVisible();
});
```

---

## API TESTING

### Direct API Calls in Tests

**Setup:**
```typescript
import { request } from '@playwright/test';

test('should create event via API', async ({ request }) => {
  // Login first to get token
  const loginResponse = await request.post('/api/auth/login', {
    data: {
      email: 'admin@mundotango.life',
      password: 'admin123'
    }
  });
  
  const { token } = await loginResponse.json();
  
  // Create event via API
  const response = await request.post('/api/events', {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    data: {
      title: 'Test Event',
      startDate: '2025-12-01T20:00:00Z',
      eventType: 'milonga'
    }
  });
  
  expect(response.ok()).toBeTruthy();
  const event = await response.json();
  expect(event.title).toBe('Test Event');
});
```

---

### Hybrid UI + API Tests

**Use API for setup, UI for verification:**
```typescript
test('should display created event', async ({ page, request }) => {
  // 1. Create event via API (fast setup)
  const token = await getAuthToken(request);
  const event = await createEventViaAPI(request, token, {
    title: 'Milonga Test',
    startDate: '2025-12-01T20:00:00Z'
  });
  
  // 2. Verify in UI (actual test)
  await page.goto('/events');
  await expect(page.getByText('Milonga Test')).toBeVisible();
  
  // 3. Click to view details
  await page.click(`[data-testid="event-${event.id}"]`);
  await expect(page).toHaveURL(`/events/${event.id}`);
  await expect(page.getByText('Milonga Test')).toBeVisible();
});
```

---

## DATABASE STATE MANAGEMENT

### Current Approach

**Shared Database:**
- All tests use same development database
- Tests do NOT reset database between runs
- Must handle existing data

**Implications:**
```typescript
// BAD - Assumes empty database
await expect(page.locator('.event')).toHaveCount(5);

// GOOD - Flexible count
await expect(page.locator('.event').first()).toBeVisible();

// GOOD - Verify created event exists
const eventId = await createEvent();
await expect(page.locator(`[data-testid="event-${eventId}"]`)).toBeVisible();
```

---

### Best Practices

**1. Create unique test data:**
```typescript
import { nanoid } from 'nanoid';

const uniqueTitle = `Test Event ${nanoid(6)}`;
await page.fill('[data-testid="input-title"]', uniqueTitle);
await page.click('[data-testid="button-submit"]');

// Now safe to assert
await expect(page.getByText(uniqueTitle)).toBeVisible();
```

**2. Search for your data:**
```typescript
const username = `testuser_${Date.now()}`;
await createUser(username);

// Search for specific user
await page.fill('[data-testid="input-search"]', username);
await expect(page.getByText(username)).toBeVisible();
```

**3. Clean up (optional):**
```typescript
test.afterEach(async ({ request }) => {
  // Delete test data if needed
  await request.delete(`/api/events/${testEventId}`);
});
```

---

# PART 5: DEBUGGING & TROUBLESHOOTING

---

## DEBUGGING FAILED TESTS

### Step 1: Run in Headed Mode

**See what's happening:**
```bash
npx playwright test --headed --workers=1
```

This opens browser window so you can watch test execution.

---

### Step 2: Use Debug Mode

**Interactive debugging:**
```bash
npx playwright test --debug
```

**Features:**
- Pauses before each action
- Step through test line by line
- Inspect page state
- Modify selectors on the fly

**In code:**
```typescript
test('debug example', async ({ page }) => {
  await page.goto('/');
  
  // Pause execution here
  await page.pause();
  
  await page.click('button');
});
```

---

### Step 3: Add Console Logs

```typescript
test('debugging test', async ({ page }) => {
  await page.goto('/events');
  
  // Log current URL
  console.log('Current URL:', page.url());
  
  // Log element count
  const count = await page.locator('.event').count();
  console.log('Event count:', count);
  
  // Log element text
  const text = await page.locator('h1').textContent();
  console.log('Heading:', text);
});
```

---

### Step 4: Take Screenshots

**Manual screenshots:**
```typescript
test('screenshot test', async ({ page }) => {
  await page.goto('/events');
  
  // Take screenshot at specific point
  await page.screenshot({ path: 'debug-events-page.png' });
  
  await page.click('[data-testid="button-create"]');
  
  // Screenshot after action
  await page.screenshot({ path: 'debug-after-click.png' });
});
```

**Automatic screenshots on failure:**
Already configured in `playwright.config.ts`:
```typescript
screenshot: 'only-on-failure'
```

---

### Step 5: Use Trace Viewer

**After test failure:**
```bash
npx playwright show-trace test-results/.../trace.zip
```

**Shows:**
- Complete timeline
- DOM snapshots at each step
- Network requests
- Console logs
- Screenshots

---

## COMMON ISSUES

### Issue 1: Element Not Found

**Error:**
```
Error: locator.click: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for locator('[data-testid="button-submit"]')
```

**Causes:**
- Element doesn't exist
- Wrong selector
- Element not visible
- Element inside iframe

**Solutions:**
```typescript
// Check if element exists
const exists = await page.locator('[data-testid="button-submit"]').count() > 0;
console.log('Element exists:', exists);

// Wait longer
await page.click('[data-testid="button-submit"]', { timeout: 60000 });

// Check inside iframe
const iframe = page.frameLocator('iframe');
await iframe.locator('[data-testid="button-submit"]').click();

// Wait for element to appear
await page.waitForSelector('[data-testid="button-submit"]', { state: 'visible' });
```

---

### Issue 2: Flaky Tests

**Symptoms:**
- Test passes sometimes, fails others
- Works locally, fails in CI

**Common Causes:**

**1. Race Conditions:**
```typescript
// BAD
await page.click('button');
await expect(page.getByText('Success')).toBeVisible(); // May fail

// GOOD
await page.click('button');
await page.waitForResponse(resp => resp.url().includes('/api/submit'));
await expect(page.getByText('Success')).toBeVisible();
```

**2. Animation Timing:**
```typescript
// Wait for animations to complete
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500); // Last resort
```

**3. Real-time Features:**
```typescript
// Increase timeout for real-time updates
await expect(page.getByText('New message')).toBeVisible({ timeout: 10000 });
```

---

### Issue 3: Authentication Issues

**Error:**
```
Error: page.waitForURL: Timeout exceeded while waiting for URL
Expected: "/"
Received: "/login"
```

**Solutions:**
```typescript
// Verify credentials are correct
await page.fill('[data-testid="input-email"]', 'admin@mundotango.life');
await page.fill('[data-testid="input-password"]', 'admin123');

// Check for error messages
await page.click('[data-testid="button-login"]');
const error = await page.locator('[data-testid="error-message"]').textContent();
console.log('Login error:', error);

// Verify token is set
await page.click('[data-testid="button-login"]');
await page.waitForTimeout(1000);
const token = await page.evaluate(() => localStorage.getItem('token'));
console.log('Token:', token ? 'Set' : 'Not set');
```

---

### Issue 4: Iframe Problems

**Can't interact with iframe content:**

```typescript
// WRONG
await page.click('.button-in-iframe'); // Won't work

// RIGHT
const iframe = page.frameLocator('[data-testid="preview-iframe"]');
await iframe.locator('.button-in-iframe').click();
```

**Wait for iframe to load:**
```typescript
await page.waitForSelector('[data-testid="preview-iframe"]');
await page.waitForTimeout(1000); // Wait for iframe content
const iframe = page.frameLocator('[data-testid="preview-iframe"]');
await iframe.locator('body').waitFor({ state: 'visible' });
```

---

## VIDEO & SCREENSHOTS

### Automatic Capture

**Configuration (already set):**
```typescript
use: {
  screenshot: 'only-on-failure',
  video: {
    mode: 'retain-on-failure',
    size: { width: 1920, height: 1080 }
  }
}
```

**Output Locations:**
- Screenshots: `test-results/`
- Videos: `test-videos/`

---

### Manual Capture

**Full page screenshot:**
```typescript
await page.screenshot({ 
  path: 'screenshot.png',
  fullPage: true 
});
```

**Element screenshot:**
```typescript
const element = page.locator('[data-testid="event-card"]');
await element.screenshot({ path: 'event-card.png' });
```

**Start/stop video:**
```typescript
test('record video', async ({ page }) => {
  // Video automatically recorded
  await page.goto('/events');
  // ... test actions ...
  // Video saved if test fails
});
```

---

## TRACE VIEWER

### Generate Traces

**Already configured:**
```typescript
trace: 'retain-on-failure'
```

**Force trace for specific test:**
```typescript
test.use({ trace: 'on' });

test('always trace this', async ({ page }) => {
  // This test will always generate trace
});
```

---

### View Traces

**Open trace file:**
```bash
npx playwright show-trace test-results/traces/trace.zip
```

**Features:**
- Timeline of all actions
- DOM snapshots at each step
- Network activity
- Console logs
- Screenshots
- Source code
- Time travel debugging

---

# PART 6: STANDARD TEST SUITES

---

## COMPREHENSIVE PLATFORM TESTS

**File:** `tests/e2e/comprehensive-platform-test-suite.spec.ts`  
**Purpose:** Test all 58+ pages across the entire platform  
**Coverage:** Public, Authenticated, Admin, Error pages

### What It Tests

**Complete Platform Coverage:**
- ✅ 9 Public pages (marketing, pricing, about, contact, etc.)
- ✅ 35+ Authenticated pages (feed, events, groups, housing, etc.)
- ✅ 14+ Admin pages (dashboard, users, moderation, etc.)
- ✅ Error pages (404, 403, 500)

---

### Key Features

**1. Self-Healing Locators:**
```typescript
import { SelfHealingLocator } from './helpers/self-healing-locator';

const selfHealing = new SelfHealingLocator();

// Automatically adapts if selectors change
const button = await selfHealing.find(page, {
  primary: '[data-testid="button-submit"]',
  fallback: ['button:has-text("Submit")', '.submit-btn']
});
```

**2. Mr. Blue Reporter:**
```typescript
import { MrBlueReporter } from './helpers/mr-blue-reporter';

const reporter = new MrBlueReporter();

await reporter.reportSuccess({
  pageId: 'P01',
  pageName: 'Marketing Home',
  agent: 'Marketing Agent',
  route: '/',
  testType: 'page-load',
  userRole: 'public'
});
```

**3. Performance Assertions:**
```typescript
async function assertPerformance(page: Page, pageId: string, threshold: number = 3000) {
  const loadTime = await measurePageLoad(page);
  expect(loadTime).toBeLessThan(threshold);
  
  await reporter.reportMetric({
    pageId,
    metric: 'Page Load Time',
    value: loadTime,
    threshold,
    passed: loadTime < threshold,
    unit: 'ms'
  });
}
```

---

### Test Structure

**Public Pages (9 tests):**
```typescript
test.describe('PUBLIC PAGES (9 tests)', () => {
  test('P01: Marketing Home loads correctly');
  test('P02: Pricing page loads correctly');
  test('P03: About page loads correctly');
  test('P04: Contact page loads correctly');
  test('P05: Marketing Prototype loads correctly');
  test('P06: Teachers Directory loads correctly');
  test('P07: Dance Styles loads correctly');
  test('P08: FAQ page loads correctly');
  test('P09: Login page loads correctly');
});
```

**Authenticated Pages (35+ tests):**
```typescript
test.describe('AUTHENTICATED PAGES (35+ tests)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);
  });

  test('A01: Feed page loads correctly');
  test('A02: Events page loads correctly');
  test('A03: Groups page loads correctly');
  test('A04: Housing Marketplace loads correctly');
  test('A05: Messages page loads correctly');
  test('A06: Notifications page loads correctly');
  test('A07: Profile page loads correctly');
  test('A08: Friends page loads correctly');
  // ... 27+ more authenticated pages
});
```

**Admin Pages (14+ tests):**
```typescript
test.describe('ADMIN PAGES (14+ tests)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ADMIN01: Admin Dashboard loads correctly');
  test('ADMIN02: User Management loads correctly');
  test('ADMIN03: Content Moderation loads correctly');
  test('ADMIN04: Visual Editor loads correctly');
  test('ADMIN05: System Monitoring loads correctly');
  // ... 9+ more admin pages
});
```

---

### How to Run

**Run all comprehensive tests:**
```bash
npx playwright test tests/e2e/comprehensive-platform-test-suite.spec.ts
```

**Run specific category:**
```bash
npx playwright test -g "PUBLIC PAGES"
npx playwright test -g "AUTHENTICATED PAGES"
npx playwright test -g "ADMIN PAGES"
```

**Run with reporting:**
```bash
npx playwright test tests/e2e/comprehensive-platform-test-suite.spec.ts --reporter=html
```

---

### Expected Output

```
Running 58 tests using 1 worker

PUBLIC PAGES (9 tests)
  ✓ P01: Marketing Home loads correctly (1.2s)
  ✓ P02: Pricing page loads correctly (0.9s)
  ✓ P03: About page loads correctly (0.8s)
  ...

AUTHENTICATED PAGES (35 tests)
  ✓ A01: Feed page loads correctly (1.5s)
  ✓ A02: Events page loads correctly (1.3s)
  ✓ A03: Groups page loads correctly (1.4s)
  ...

ADMIN PAGES (14 tests)
  ✓ ADMIN01: Admin Dashboard loads correctly (1.6s)
  ✓ ADMIN02: User Management loads correctly (1.4s)
  ...

  58 passed (85s)
```

---

## PERFORMANCE TESTS

**File:** `tests/deployment/performance-page-load.spec.ts`  
**Purpose:** Validate page load times  
**Critical:** Ensures fast user experience

### Performance Targets

**Landing/Login Pages:**
- Target: < 3 seconds
- Measured: DOM Content Loaded

**Authenticated Pages:**
- Target: < 5 seconds
- Includes: Initial data fetch

**API Responses:**
- Target: < 500ms
- Measured: Response time

---

### Test Cases

**1. Landing Page Performance:**
```typescript
test('Landing page should load in <3 seconds', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  
  const loadTime = Date.now() - startTime;
  console.log(`📊 Landing page loaded in: ${loadTime}ms`);

  expect(loadTime).toBeLessThan(3000);
});
```

**2. Login Page Performance:**
```typescript
test('Login page should load in <3 seconds', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  
  const loadTime = Date.now() - startTime;
  console.log(`📊 Login page loaded in: ${loadTime}ms`);

  expect(loadTime).toBeLessThan(3000);
});
```

**3. Authenticated Page Performance:**
```typescript
test('Feed page should load in <5 seconds (authenticated)', async ({ page }) => {
  // Login first
  await loginAsAdmin(page);

  // Measure feed load time
  const startTime = Date.now();
  await page.goto('/feed');
  await page.waitForLoadState('domcontentloaded');
  
  const loadTime = Date.now() - startTime;
  console.log(`📊 Feed page loaded in: ${loadTime}ms`);

  expect(loadTime).toBeLessThan(5000);
});
```

**4. DOM Size Check:**
```typescript
test('Should not have excessive DOM size', async ({ page }) => {
  await page.goto('/');
  
  const domSize = await page.evaluate(() => {
    return document.querySelectorAll('*').length;
  });

  console.log(`📊 DOM elements: ${domSize}`);
  expect(domSize).toBeLessThan(2000); // Performance threshold
});
```

**5. Critical CSS Inline:**
```typescript
test('Should load critical CSS inline', async ({ page }) => {
  await page.goto('/');
  
  const hasInlineStyles = await page.evaluate(() => {
    const styleTag = document.querySelector('style');
    return styleTag !== null && styleTag.textContent && styleTag.textContent.length > 100;
  });

  expect(hasInlineStyles).toBe(true);
});
```

---

### How to Run

```bash
# Run all performance tests
npx playwright test tests/deployment/performance-page-load.spec.ts

# With console output
npx playwright test tests/deployment/performance-page-load.spec.ts --reporter=line

# Specific test
npx playwright test -g "Landing page should load"
```

---

### Performance Metrics

**Good Performance:**
```
📊 Landing page loaded in: 1200ms ✅
📊 Login page loaded in: 1100ms ✅
📊 Feed page loaded in: 2800ms ✅
📊 DOM elements: 1250 ✅
```

**Poor Performance:**
```
📊 Landing page loaded in: 4500ms ❌
📊 Feed page loaded in: 8200ms ❌
📊 DOM elements: 3500 ❌
```

---

## SECURITY & AUTH TESTS

**File:** `tests/deployment/security-auth.spec.ts`  
**Purpose:** Validate authentication and authorization  
**Critical:** Prevents unauthorized access and data breaches

### What It Tests

**Authentication:**
- ✅ Protected routes require login
- ✅ Valid credentials allow access
- ✅ Invalid credentials are rejected
- ✅ Session persists after refresh
- ✅ Logout clears session

**Authorization:**
- ✅ Admin routes require admin role
- ✅ Regular users cannot access admin
- ✅ God user has full access

---

### Test Cases

**1. Block Unauthenticated Access:**
```typescript
test('should block unauthenticated access to /feed', async ({ page }) => {
  await page.goto('/feed');

  // Should redirect to login
  const url = page.url();
  expect(url.includes('/login') || url.includes('/register')).toBe(true);
});

test('should block unauthenticated access to /admin', async ({ page }) => {
  await page.goto('/admin');

  // Should redirect to login
  const url = page.url();
  expect(url.includes('/login') || url.includes('/register')).toBe(true);
});
```

**2. Valid Login:**
```typescript
test('should successfully login with valid credentials', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="input-username"]', 'admin');
  await page.fill('[data-testid="input-password"]', 'MundoTango2025!Admin');
  await page.click('[data-testid="button-login"]');

  // Wait for redirect
  await page.waitForURL(/\/(feed|home|dashboard)/, { timeout: 10000 });

  // Verify logged in
  const url = page.url();
  expect(url).toMatch(/\/(feed|home|dashboard)/);
});
```

**3. Invalid Login:**
```typescript
test('should reject invalid login credentials', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="input-username"]', 'admin');
  await page.fill('[data-testid="input-password"]', 'WrongPassword123!');
  await page.click('[data-testid="button-login"]');

  await page.waitForTimeout(2000);

  // Should still be on login page
  const url = page.url();
  expect(url).toContain('/login');
});
```

**4. Session Persistence:**
```typescript
test('should maintain session after page refresh', async ({ page }) => {
  // Login
  await loginAsAdmin(page);

  // Refresh page
  await page.reload();

  // Should still be logged in
  const url = page.url();
  expect(url).not.toContain('/login');
  expect(url).toMatch(/\/(feed|home|dashboard)/);
});
```

**5. Logout:**
```typescript
test('should logout and clear session', async ({ page }) => {
  // Login
  await loginAsAdmin(page);

  // Logout
  await page.click('[data-testid="button-logout"]');
  await page.waitForTimeout(2000);

  // Try to access protected route
  await page.goto('/feed');
  
  // Should redirect to login
  const url = page.url();
  expect(url).toContain('/login');
});
```

**6. Authorization - Admin Access:**
```typescript
test('should allow god user to access admin routes', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin');

  const url = page.url();
  expect(url).toContain('/admin');
});

test('should prevent non-admin from accessing admin routes', async ({ page }) => {
  // Unauthenticated attempt
  await page.goto('/admin/users');

  const url = page.url();
  expect(url.includes('/login') || url.includes('/403')).toBe(true);
});
```

---

### How to Run

```bash
# Run all security tests
npx playwright test tests/deployment/security-auth.spec.ts

# Run authentication tests only
npx playwright test -g "Authentication Security"

# Run authorization tests only
npx playwright test -g "Authorization Security"
```

---

## DESIGN SYSTEM TESTS

**File:** `tests/visual/design-system.spec.ts`  
**Purpose:** Validate themes and visual consistency  
**Themes:** Bold Minimaximalist + MT Ocean

### What It Tests

**Theme Detection:**
- ✅ Marketing pages use Bold Minimaximalist
- ✅ Platform pages use MT Ocean
- ✅ Theme switching works correctly

**CSS Variables:**
- ✅ Colors match design system
- ✅ Typography is correct
- ✅ Border radius is consistent
- ✅ Transitions are smooth

---

### Test Cases

**1. Theme Detection:**
```typescript
test.describe('Theme Detection', () => {
  test('Marketing page uses Bold Minimaximalist theme', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('bold-minimaximalist');
  });

  test('Platform page uses MT Ocean theme', async ({ page }) => {
    await page.goto('/');
    
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('mt-ocean');
  });
});
```

**2. Bold Minimaximalist CSS Variables:**
```typescript
test.describe('Bold Minimaximalist CSS Variables', () => {
  test('Primary color is burgundy #b91c3b', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    const primaryColor = await page.evaluate(() => 
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-primary').trim()
    );
    
    expect(primaryColor).toBe('#b91c3b');
  });

  test('Heading font weight is 800', async ({ page }) => {
    const headingWeight = await page.evaluate(() => 
      getComputedStyle(document.documentElement)
        .getPropertyValue('--font-weight-heading').trim()
    );
    
    expect(headingWeight).toBe('800');
  });

  test('Card border radius is 6px', async ({ page }) => {
    const cardRadius = await page.evaluate(() => 
      getComputedStyle(document.documentElement)
        .getPropertyValue('--radius-card').trim()
    );
    
    expect(cardRadius).toBe('0.375rem'); // 6px
  });
});
```

**3. MT Ocean CSS Variables:**
```typescript
test.describe('MT Ocean CSS Variables', () => {
  test('Primary color is turquoise #14b8a6', async ({ page }) => {
    await page.goto('/');
    
    const primaryColor = await page.evaluate(() => 
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-primary').trim()
    );
    
    expect(primaryColor).toBe('#14b8a6');
  });

  test('Card border radius is 16px', async ({ page }) => {
    const cardRadius = await page.evaluate(() => 
      getComputedStyle(document.documentElement)
        .getPropertyValue('--radius-card').trim()
    );
    
    expect(cardRadius).toBe('1rem'); // 16px
  });

  test('Transition speed is 300ms', async ({ page }) => {
    const transitionSpeed = await page.evaluate(() => 
      getComputedStyle(document.documentElement)
        .getPropertyValue('--transition-speed').trim()
    );
    
    expect(transitionSpeed).toBe('300ms');
  });
});
```

---

### How to Run

```bash
# Run all design system tests
npx playwright test tests/visual/design-system.spec.ts

# Run theme detection only
npx playwright test -g "Theme Detection"

# Run specific theme tests
npx playwright test -g "Bold Minimaximalist"
npx playwright test -g "MT Ocean"
```

---

## CUSTOMER JOURNEY TESTS

**File:** `tests/e2e/customer-journey-tests.spec.ts`  
**Purpose:** Test complete user flows end-to-end  
**Coverage:** Registration → Onboarding → Core Features

### What It Tests

**Complete User Journeys:**
- ✅ New user registration
- ✅ Onboarding flow
- ✅ Profile setup
- ✅ First post creation
- ✅ Event discovery
- ✅ Social engagement
- ✅ Housing search

---

### Test Structure

```typescript
test.describe('Customer Journey: New User', () => {
  test('Journey 1: Register → Onboard → Create First Post', async ({ page }) => {
    // 1. Register
    await page.goto('/register');
    await page.fill('[data-testid="input-username"]', 'newdancer123');
    await page.fill('[data-testid="input-email"]', 'newdancer@example.com');
    await page.fill('[data-testid="input-password"]', 'SecurePass123!');
    await page.click('[data-testid="button-register"]');

    // 2. Verify redirect to onboarding
    await page.waitForURL('**/onboarding');
    
    // 3. Complete onboarding
    await page.fill('[data-testid="input-bio"]', 'New to tango!');
    await page.click('[data-testid="button-next"]');
    
    // 4. Select dance role
    await page.click('[data-testid="checkbox-leader"]');
    await page.click('[data-testid="button-next"]');
    
    // 5. Select experience level
    await page.click('[data-testid="radio-beginner"]');
    await page.click('[data-testid="button-finish"]');
    
    // 6. Redirected to feed
    await page.waitForURL('**/feed');
    
    // 7. Create first post
    await page.fill('[data-testid="textarea-post"]', 'My first tango post!');
    await page.click('[data-testid="button-post"]');
    
    // 8. Verify post appears
    await expect(page.getByText('My first tango post!')).toBeVisible();
  });
});
```

---

### Journey Examples

**Journey 2: Discover and RSVP to Event**
```typescript
test('Journey 2: Browse Events → View Details → RSVP', async ({ page }) => {
  await loginAsUser(page);
  
  // Browse events
  await page.goto('/events');
  await expect(page.getByTestId('event-list')).toBeVisible();
  
  // Click first event
  await page.click('[data-testid^="event-"]');
  await page.waitForURL('**/events/**');
  
  // RSVP
  await page.click('[data-testid="button-rsvp"]');
  await expect(page.getByText('RSVP confirmed')).toBeVisible();
  
  // Verify in calendar
  await page.goto('/calendar');
  await expect(page.getByText('Upcoming Events')).toBeVisible();
});
```

**Journey 3: Connect with Dancers**
```typescript
test('Journey 3: Find Dancers → Send Friend Request → Chat', async ({ page }) => {
  await loginAsUser(page);
  
  // Search dancers
  await page.goto('/discover');
  await page.fill('[data-testid="input-search"]', 'tango');
  
  // View profile
  await page.click('[data-testid^="user-card-"]');
  
  // Send friend request
  await page.click('[data-testid="button-add-friend"]');
  await expect(page.getByText('Friend request sent')).toBeVisible();
  
  // Start chat (if friends)
  await page.click('[data-testid="button-message"]');
  await page.waitForURL('**/messages/**');
  
  // Send message
  await page.fill('[data-testid="input-message"]', 'Hello!');
  await page.click('[data-testid="button-send"]');
  await expect(page.getByText('Hello!')).toBeVisible();
});
```

---

### How to Run

```bash
# Run all customer journey tests
npx playwright test tests/e2e/customer-journey-tests.spec.ts

# Run specific journey
npx playwright test -g "Journey 1"

# Video proof mode
npx playwright test tests/e2e/customer-journey-video-proof.spec.ts --headed
```

---

## ESA FRAMEWORK TESTS

**Files:**
- `tests/e2e/esa-framework.spec.ts` - Framework tests
- `tests/e2e/esa-tasks.spec.ts` - Task management
- `tests/e2e/esa-communications.spec.ts` - Agent communication

**Purpose:** Test Expert Specialized Agents (ESA) system  
**Coverage:** 115 agents, task orchestration, health monitoring

### What It Tests

**Agent Framework:**
- ✅ Agent registration and discovery
- ✅ Task assignment and completion
- ✅ Inter-agent communication
- ✅ Health monitoring
- ✅ Self-healing capabilities

---

### Test Cases

**1. Agent Framework:**
```typescript
test.describe('ESA Framework', () => {
  test('should load agents table', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/esa-agents');
    
    await expect(page.getByTestId('table-agents')).toBeVisible();
    await expect(page.getByText('115 agents')).toBeVisible();
  });

  test('should display agent health metrics', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/esa-monitoring');
    
    await expect(page.getByTestId('metric-active-agents')).toBeVisible();
    await expect(page.getByTestId('metric-tasks-completed')).toBeVisible();
  });
});
```

**2. Task Management:**
```typescript
test.describe('ESA Tasks', () => {
  test('should create new task', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/esa-tasks');
    
    await page.click('[data-testid="button-create-task"]');
    await page.fill('[data-testid="input-task-name"]', 'Test Task');
    await page.click('[data-testid="button-save"]');
    
    await expect(page.getByText('Test Task')).toBeVisible();
  });

  test('should assign task to agent', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/esa-tasks');
    
    await page.click('[data-testid="button-assign-task"]');
    await page.selectOption('[data-testid="select-agent"]', 'marketing-agent');
    await page.click('[data-testid="button-confirm"]');
    
    await expect(page.getByText('Task assigned')).toBeVisible();
  });
});
```

**3. Agent Communications:**
```typescript
test.describe('ESA Communications', () => {
  test('should show agent message log', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/esa-communications');
    
    await expect(page.getByTestId('message-log')).toBeVisible();
  });

  test('should send message between agents', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/esa-communications');
    
    await page.click('[data-testid="button-new-message"]');
    await page.selectOption('[data-testid="select-from-agent"]', 'coordinator');
    await page.selectOption('[data-testid="select-to-agent"]', 'social-agent');
    await page.fill('[data-testid="input-message"]', 'Test message');
    await page.click('[data-testid="button-send"]');
    
    await expect(page.getByText('Message sent')).toBeVisible();
  });
});
```

---

### How to Run

```bash
# Run all ESA tests
npx playwright test tests/e2e/esa-*.spec.ts

# Run framework tests
npx playwright test tests/e2e/esa-framework.spec.ts

# Run task tests
npx playwright test tests/e2e/esa-tasks.spec.ts

# Run communication tests
npx playwright test tests/e2e/esa-communications.spec.ts
```

---

## FEATURE-SPECIFIC TESTS

### Additional Standard Tests

**1. Community Map Test:**
```bash
tests/e2e/community-map.spec.ts
```
- Tests map rendering
- Location markers
- Filter functionality
- User clustering

**2. Favorites Test:**
```bash
tests/e2e/favorites.spec.ts
```
- Add to favorites
- Remove from favorites
- View favorites list
- Filter favorites

**3. Invitations Test:**
```bash
tests/e2e/invitations.spec.ts
```
- Send invitation
- Accept invitation
- Decline invitation
- View pending invitations

**4. Recommendations Test:**
```bash
tests/e2e/recommendations.spec.ts
```
- AI-powered recommendations
- Recommendation accuracy
- Personalization
- Recommendation refresh

**5. Memories Test:**
```bash
tests/e2e/memories.spec.ts
```
- Create memory
- View memory timeline
- Share memories
- Memory privacy settings

**6. Theme Validation Test:**
```bash
tests/e2e/theme-validation.spec.ts
```
- Light/dark theme toggle
- Theme persistence
- CSS variable validation
- Visual consistency

**7. Login Error Recovery Test:**
```bash
tests/e2e/login-error-recovery.spec.ts
```
- Invalid credentials handling
- Network error recovery
- Session timeout handling
- Password reset flow

---

### How to Run All Standard Tests

**Run all standard test suites:**
```bash
# All E2E tests
npx playwright test tests/e2e/

# All deployment tests
npx playwright test tests/deployment/

# All visual tests
npx playwright test tests/visual/

# Everything
npx playwright test
```

**Run by category:**
```bash
# Comprehensive platform
npx playwright test comprehensive-platform

# Performance
npx playwright test performance

# Security
npx playwright test security

# Design system
npx playwright test design-system

# Customer journey
npx playwright test customer-journey

# ESA framework
npx playwright test esa-
```

---

### Test Suite Summary

| Test Suite | File | Tests | Purpose |
|------------|------|-------|---------|
| **Comprehensive Platform** | comprehensive-platform-test-suite.spec.ts | 58+ | All pages |
| **Performance** | performance-page-load.spec.ts | 8 | Load times |
| **Security** | security-auth.spec.ts | 10+ | Auth/authz |
| **Design System** | design-system.spec.ts | 30+ | Themes |
| **Customer Journey** | customer-journey-tests.spec.ts | 10+ | User flows |
| **ESA Framework** | esa-*.spec.ts | 15+ | Agents |
| **Feature Tests** | Various | 30+ | Specific features |

**Total Standard Tests:** 150+ test cases

---

# PART 7: CI/CD & DEPLOYMENT

---

## CI/CD INTEGRATION

### GitHub Actions Example

**`.github/workflows/playwright.yml`:**
```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run Playwright tests
        run: npx playwright test
        env:
          CI: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: test-results/
          retention-days: 30
      
      - name: Upload videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-videos
          path: test-videos/
          retention-days: 7
```

---

### Environment Variables

**Set in CI:**
```yaml
env:
  CI: true
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

**Access in tests:**
```typescript
const isCI = process.env.CI === 'true';

if (isCI) {
  // Adjust for CI environment
  test.setTimeout(60000); // Longer timeout in CI
}
```

---

## TEST REPORTS

### HTML Report

**Generate:**
```bash
npx playwright test
npx playwright show-report
```

**Location:** `test-results/html-report/index.html`

**Features:**
- Test results summary
- Failed test details
- Screenshots
- Videos
- Traces
- Retry information

---

### JSON Report

**Configuration:**
```typescript
reporter: [
  ['json', { outputFile: 'test-results/results.json' }]
]
```

**Use for:**
- Custom dashboards
- Metrics tracking
- Integration with other tools

---

### Custom Reporter

**Create custom reporter:**
```typescript
// reporter.ts
class MyReporter {
  onBegin(config, suite) {
    console.log(`Starting tests: ${suite.allTests().length} total`);
  }

  onTestEnd(test, result) {
    console.log(`${test.title}: ${result.status}`);
  }

  onEnd(result) {
    console.log(`Finished: ${result.status}`);
  }
}

export default MyReporter;
```

**Use in config:**
```typescript
reporter: [
  ['./reporter.ts']
]
```

---

## PERFORMANCE CONSIDERATIONS

### Test Execution Speed

**Current setup:**
- Workers: 1 (sequential execution)
- Tests: 39+ files, 100+ test cases
- Estimated runtime: 10-20 minutes

**Optimization options:**

**1. Increase workers (if safe):**
```typescript
workers: process.env.CI ? 2 : 4
```
⚠️ Only if tests don't share database state

**2. Run in parallel:**
```typescript
fullyParallel: true
```
⚠️ Only if tests are fully independent

**3. Use test sharding (CI):**
```bash
npx playwright test --shard=1/4  # Run 1st quarter
npx playwright test --shard=2/4  # Run 2nd quarter
# etc.
```

---

### Database Performance

**Current bottleneck:**
- Shared database state
- Sequential execution required

**Improvements:**

**1. Use test database per worker:**
```typescript
// Create isolated DB per worker
const db = `test_db_${process.env.TEST_WORKER_INDEX}`;
```

**2. Use transactions (rollback after test):**
```typescript
test.beforeEach(async ({ context }) => {
  await context.route('**/api/**', async route => {
    // Wrap in transaction
  });
});
```

**3. Seed only necessary data:**
```typescript
// Don't seed full production dataset
// Only create data needed for tests
```

---

### Network Performance

**Reduce API calls:**
```typescript
// BAD - Multiple API calls
test('slow test', async ({ page }) => {
  await page.goto('/events');
  await page.waitForLoadState('networkidle');
  await page.goto('/profile');
  await page.waitForLoadState('networkidle');
});

// GOOD - Direct navigation
test('fast test', async ({ page }) => {
  await page.goto('/events');
  // Interact without waiting for all network
  await page.click('[data-testid="link-profile"]');
});
```

---

# 🎯 QUICK REFERENCE

---

## Essential Commands

```bash
# Run all tests
npx playwright test

# Run specific file
npx playwright test tests/e2e/01-public-marketing.spec.ts

# Run in debug mode
npx playwright test --debug

# Run in UI mode
npx playwright test --ui

# Show report
npx playwright show-report

# Generate tests (codegen)
npx playwright codegen http://localhost:5000
```

---

## Common Selectors

```typescript
// Test ID (best)
page.locator('[data-testid="button-login"]')
page.getByTestId('button-login')

// Role
page.getByRole('button', { name: 'Login' })
page.getByRole('heading', { name: /Welcome/i })

// Text
page.getByText('Login')
page.getByText(/Welcome.*/i)

// Label
page.getByLabel('Email')

// Placeholder
page.getByPlaceholder('Enter email')
```

---

## Common Actions

```typescript
// Navigate
await page.goto('/events');

// Click
await page.click('[data-testid="button-submit"]');

// Fill input
await page.fill('[data-testid="input-email"]', 'test@example.com');

// Select dropdown
await page.selectOption('[data-testid="select-type"]', 'workshop');

// Check checkbox
await page.check('[data-testid="checkbox-agree"]');

// Upload file
await page.setInputFiles('[data-testid="input-file"]', 'image.png');

// Wait
await page.waitForSelector('[data-testid="post-list"]');
await page.waitForURL('**/feed');
```

---

## Common Assertions

```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// Text
await expect(element).toHaveText('Hello');
await expect(element).toContainText('Hello');

// Count
await expect(page.locator('.post')).toHaveCount(10);

// URL
await expect(page).toHaveURL('/profile');

// Attribute
await expect(element).toHaveAttribute('href', '/events');
```

---

# 🎓 LEARNING PATH

---

## Beginner (Week 1)

**Day 1-2: Setup & Basics**
- Install Playwright
- Run existing tests
- Understand test structure
- Read one simple test file

**Day 3-4: Write First Test**
- Copy existing test
- Modify it for new feature
- Add assertions
- Run and debug

**Day 5-7: Common Patterns**
- Login flow
- Navigation
- Forms
- Lists

---

## Intermediate (Week 2-3)

**Week 2: Advanced Selectors**
- Test IDs
- Role-based selectors
- Combining selectors
- Dynamic elements

**Week 3: Complex Flows**
- Multi-step journeys
- API + UI tests
- Real-time features
- Error handling

---

## Advanced (Week 4+)

**Advanced Topics:**
- Iframe testing
- Custom fixtures
- Visual regression
- Performance testing
- CI/CD integration
- Test data management

---

# 📚 RESOURCES

---

## Official Documentation

- **Playwright Docs:** https://playwright.dev
- **API Reference:** https://playwright.dev/docs/api/class-playwright
- **Best Practices:** https://playwright.dev/docs/best-practices

---

## Mundo Tango Specific

**Key Files to Study:**
1. `tests/e2e/01-public-marketing.spec.ts` - Simple navigation
2. `tests/e2e/02-registration-auth.spec.ts` - Authentication
3. `tests/visual-editor-ui.spec.ts` - Complex UI testing
4. `playwright.config.ts` - Configuration

**Test Helpers:**
- Create `tests/helpers/` for reusable functions
- Store test data in `tests/fixtures/`

---

## Troubleshooting Checklist

**Test Failing?**
1. ✅ Run in headed mode: `--headed`
2. ✅ Check selector in browser devtools
3. ✅ Add console.log for debugging
4. ✅ Check for timing issues (waitFor...)
5. ✅ Verify test data exists in database
6. ✅ Check authentication is working
7. ✅ Review trace: `show-trace`
8. ✅ Check iframe vs main page
9. ✅ Verify network requests completed
10. ✅ Ask for help with error message

---

# 🎉 CONCLUSION

You now have everything you need to:

✅ **Run tests** - Basic to advanced commands  
✅ **Write tests** - Patterns and best practices  
✅ **Debug tests** - Tools and techniques  
✅ **Organize tests** - Structure and naming  
✅ **Scale tests** - CI/CD and performance  

---

## Next Steps

**Immediate:**
1. Run your first test: `npx playwright test tests/feed-login.spec.ts`
2. Open UI mode: `npx playwright test --ui`
3. Try debugging: `npx playwright test --debug`

**Short-term:**
1. Write a test for new feature
2. Add test IDs to components
3. Create test helper functions

**Long-term:**
1. Increase test coverage to 80%+
2. Set up CI/CD pipeline
3. Implement visual regression testing
4. Build test data management system

---

**Happy Testing! 🎭✨**

---

**END OF PLAYWRIGHT TESTING HANDOFF**

**Author:** Mundo Tango Team  
**Last Updated:** November 5, 2025  
**Version:** 1.0  
**Questions?** Check the docs or trace viewer first!

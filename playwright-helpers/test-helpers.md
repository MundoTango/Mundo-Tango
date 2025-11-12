# Playwright Test Optimization - Session Reuse

## Problem
Previously, every test started by logging in, which:
- Wasted time (login flow takes 3-5 seconds per test)
- Increased test flakiness
- Violated MB.MD principle (don't repeat tested functionality)

## Solution: Session Reuse
Use Playwright's `storageState` to save authentication once and reuse it:

```typescript
// 1. ONE-TIME: Create auth session
await setupAuthSession({
  email: 'admin@mundotango.life',
  password: 'admin123',
  baseURL: 'http://localhost:5000'
});
// Creates .playwright-auth.json with cookies + localStorage

// 2. IN TESTS: Load auth session
const context = await browser.newContext({
  storageState: getAuthFilePath() // Load saved session
});

const page = await context.newPage();

// 3. Navigate directly to protected page (already authenticated!)
await page.goto('/events');
// No login needed - session is already active ✅
```

## Test Plan Pattern (MB.MD Optimized)

### OLD WAY (slow, redundant):
```
1. Navigate to /login
2. Fill email/password
3. Click login button
4. Wait for redirect
5. Navigate to /events
6. Test events page
```

### NEW WAY (fast, efficient):
```
1. [Context] Create browser context with storageState (already logged in)
2. [Browser] Navigate directly to /events
3. [Verify] Test events page functionality
```

## Implementation in Test Plans

```markdown
**Events Page Test (With Session Reuse)**

## Prerequisites
- Auth session exists at .playwright-auth.json
- Contains valid accessToken for admin@mundotango.life

## Test Plan
1. [New Context] Create browser context with auth session loaded
2. [Browser] Navigate directly to /events (path: /events)
3. [Verify] Assert page loads without redirect to /login
4. [Verify] Assert user is authenticated (check for profile menu, NOT public LOGIN button)
5. [Browser] Test events page functionality...
```

## When to Use Session Reuse

✅ **USE for:**
- Any test of protected pages (feed, events, profile, settings, etc.)
- Tests that don't specifically test authentication flow
- Bulk testing of 142 pages (Phase 2)

❌ **DON'T USE for:**
- Testing login flow itself
- Testing logout flow
- Testing unauthenticated access (public pages)
- Testing different user roles (need different sessions)

## Session Management

```bash
# Create auth session
node playwright-helpers/auth-setup.ts

# Clear auth session (force re-login)
rm .playwright-auth.json
```

## MB.MD Efficiency Gains

- **Before:** 142 pages × 5 seconds login = 710 seconds (11.8 min) wasted
- **After:** 1 session setup × 5 seconds = 5 seconds total
- **Savings:** 705 seconds (11.75 minutes) per test run ⚡

## Security Note

- `.playwright-auth.json` contains real session tokens
- Already in `.gitignore`
- Only valid for test environment
- Regenerate if tokens expire

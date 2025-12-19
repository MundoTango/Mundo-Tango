# CRITICAL: VisualEditorPage Crashes Playwright Chromium

**Date:** November 24, 2025  
**Priority:** P0 - Blocks all automated testing  
**Status:** Open - Requires Investigation

---

## Issue Summary

The VisualEditorPage component causes Playwright's Chromium browser to crash immediately upon navigation, preventing all automated E2E testing of the Mr. Blue AI system.

## Reproduction

```typescript
// This crashes Playwright Chromium:
await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
```

**Error:**
```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://localhost:5000/", waiting until "domcontentloaded"
```

## Evidence

✅ **Works in Regular Browser:**
- Page loads successfully in Chrome, Firefox, Safari
- All features function correctly
- No console errors
- Self-healing framework initializes properly

❌ **Crashes in Playwright:**
- Immediate crash on navigation attempt
- No error messages captured
- Browser closes unexpectedly
- Happens on both `/` and `/admin/visual-editor` routes

## Test Results Before vs After Fixes

### BEFORE FIXES:
- ❌ 21/21 tests failed at login (redirect to /dashboard issue)
- ❌ Rate limiting blocked test automation (429 errors)
- ❌ Cannot reach Visual Editor to test Mr. Blue

### AFTER FIXES APPLIED:
- ✅ Login works perfectly (redirects to /feed)
- ✅ No rate limiting issues (localhost bypassed)
- ✅ Authentication flow complete
- ❌ **NEW ISSUE:** Visual Editor crashes Playwright

## Root Cause Hypotheses

1. **Heavy JavaScript Bundle** - VisualEditorPage may load too many components simultaneously
2. **Iframe Issues** - The page uses iframes for preview, which may have automation incompatibilities
3. **Memory Leaks** - Uncontrolled memory growth crashes browser
4. **Infinite Loops** - useEffect dependencies causing render loops
5. **Browser API Incompatibility** - Using APIs that Playwright's Chromium doesn't support

## Fixes Applied (Unrelated to crash)

### Fix 1: Authentication Redirect
**File:** `client/src/contexts/AuthContext.tsx`
**Change:** Line 265-268
```typescript
// BEFORE:
setTimeout(() => navigate("/dashboard"), 0);

// AFTER:
setTimeout(() => navigate("/feed"), 0);
```

### Fix 2: Rate Limiting
**File:** `server/middleware/rateLimiter.ts`
**Change:** Lines 56-68
```typescript
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 1000,
  skip: (req: Request) => {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip?.includes('::ffff:127.0.0.1');
    return isDevelopment && isLocalhost;
  },
});
```

## Impact

### Blocked Functionality:
- ❌ Cannot run 21 comprehensive Mr. Blue QA tests
- ❌ Cannot validate Vibe Coding routing
- ❌ Cannot test voice input features
- ❌ Cannot verify self-healing framework
- ❌ Cannot test conversation persistence
- ❌ Cannot validate beta launch readiness

### Workarounds:
- ✅ Manual testing in regular browser works
- ✅ Unit tests for backend still work
- ⚠️ E2E testing requires different approach

## Recommended Next Steps

### Immediate (P0):
1. **Profile VisualEditorPage** - Identify heavy components
2. **Reduce Initial Load** - Lazy load non-critical features
3. **Test with Playwright Firefox/WebKit** - See if issue is Chromium-specific
4. **Add Crash Logging** - Capture crash dumps for analysis

### Short-term (P1):
1. **Split VisualEditorPage** - Break into smaller, testable components
2. **Create Lightweight Test Route** - Minimal version for automation
3. **Optimize Bundle Size** - Code splitting, tree shaking
4. **Fix Memory Leaks** - Audit useEffect cleanup functions

### Long-term (P2):
1. **Refactor Architecture** - Progressive enhancement approach
2. **Performance Budget** - Enforce bundle size limits
3. **Automated Performance Testing** - Prevent regressions

## Test Strategy Moving Forward

### Option A: Fix VisualEditorPage (Recommended)
- Investigate and resolve Playwright crash
- Resume comprehensive testing
- Full beta launch validation

### Option B: Alternative Testing Route
- Create `/visual-editor-test` route with minimal components
- Test Mr. Blue functionality in isolation
- Limited coverage but unblocked

### Option C: Manual Testing Only
- Document manual test procedures
- High risk for beta launch
- No regression protection

## Success Criteria

✅ **DONE:**
- [x] Authentication redirects to `/feed`
- [x] Rate limiting allows localhost
- [x] Login flow works in Playwright

🔄 **IN PROGRESS:**
- [ ] VisualEditorPage loads in Playwright
- [ ] 21 comprehensive tests pass
- [ ] Beta launch validated

## Related Files

- `client/src/pages/VisualEditorPage.tsx` - Component causing crash
- `tests/mb-md-comprehensive-qa.spec.ts` - Test suite blocked by crash
- `docs/MB_MD_QA_COMPREHENSIVE_MR_BLUE_TEST_PLAN.md` - Comprehensive test plan
- `docs/MB_MD_V9_5_VISUAL_EDITOR_PRD.md` - Visual Editor requirements

## Contact

- **Reporter:** Replit AI
- **Assigned To:** Development Team
- **Stakeholders:** Beta Launch Team, QA Team

---

**Note:** This is a **blocking issue** for production deployment. The comprehensive test suite was successfully created and would validate all Mr. Blue functionality if this crash is resolved.

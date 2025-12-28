# Internationalization Plan - MB.MD v2.0 Methodology

**Version:** 1.0 | **Date:** December 22, 2024 | **Scope:** 318 Non-Admin Pages

---

## 📊 PHASE 1: UNDERSTAND (MB.MD Step 1)

### Scope Analysis
| Category | Count | Priority |
|----------|-------|----------|
| Root pages (client/src/pages/*.tsx) | 225 | High |
| Onboarding pages | 10 | Critical |
| Life-CEO pages | 17 | Medium |
| Messages pages | 7 | Medium |
| MrBlue pages | 8 | Medium |
| Settings pages | 9 | High |
| Travel pages | 4 | Low |
| Platform pages | 3 | Low |
| Pro pages | 1 | Low |
| Auth pages | 1 | Critical |
| **TOTAL** | **318** | - |

### Requirements
1. Every non-admin page must have `useTranslation` hook
2. All user-facing strings must use `t('namespace:key', 'Fallback')` pattern
3. Fallback strings ensure UI never shows raw translation keys
4. Admin pages are EXCLUDED per user request
5. Support 69 languages with es-ar (Argentine Spanish) at position #2

---

## 🔍 PHASE 2: RESEARCH (MB.MD Step 2)

### Token Efficiency Analysis

**Problem:** 318 pages × ~100 lines avg = 31,800 lines to process
**Solution:** BATCH SCRIPTING with parallel execution

### Efficiency Strategies

| Strategy | Token Savings | Implementation |
|----------|--------------|----------------|
| **Bash Script Transformation** | 95% | Single script modifies all files |
| **Parallel Subagents** | 70% | 4 subagents process different categories |
| **Template-Based** | 80% | Generate translation keys from patterns |
| **Incremental Commits** | N/A | Checkpoint after each batch |

### Chosen Approach: HYBRID BATCH SCRIPT + SUBAGENT

```
┌─────────────────────────────────────────────────────────────┐
│                 TOKEN-EFFICIENT ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────┤
│  Step 1: Audit existing state (which pages need work)       │
│  Step 2: Generate comprehensive locale JSON files           │
│  Step 3: Batch script to inject t() calls by pattern        │
│  Step 4: Subagents verify/fix complex pages in parallel     │
│  Step 5: E2E test verification                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 PHASE 3: PLAN (MB.MD Step 3)

### Execution Batches

**Batch 1: Translation File Generation** (1 task)
- Generate comprehensive `public/locales/{en,es}/pages.json` with ALL keys
- Pattern: Extract common UI patterns → generate keys programmatically

**Batch 2: Critical Path (Parallel)** (4 subagents)
- Subagent A: Auth + Onboarding pages (11 pages)
- Subagent B: Settings + Profile pages (15 pages)
- Subagent C: Marketing + Landing pages (10 pages)
- Subagent D: Core app pages (20 pages)

**Batch 3: Feature Pages (Script)** (1 script)
- Bash script processes remaining 262 pages
- Pattern matching for common UI elements
- Auto-generate t() calls with English fallbacks

**Batch 4: Verification** (E2E tests)
- Test 5 key pages in Spanish
- Verify no broken UI
- Check RTL for Arabic

---

## ⚡ PHASE 4: VALIDATE (MB.MD Step 4)

### Pre-Execution Checklist
- [ ] Translation files exist at correct path
- [ ] i18next configured correctly
- [ ] No duplicate imports
- [ ] TypeScript compilation passes

---

## 🔨 PHASE 5: EXECUTE (MB.MD Step 5)

### Parallel Execution Plan

```
TIME  │ AGENT A          │ AGENT B          │ AGENT C          │ AGENT D
──────┼──────────────────┼──────────────────┼──────────────────┼──────────────────
T+0   │ Auth/Onboarding  │ Settings pages   │ Marketing pages  │ Generate locales
T+1   │ (continue)       │ (continue)       │ (continue)       │ Script: 50 pages
T+2   │ Verify batch 1   │ Verify batch 2   │ Verify batch 3   │ Script: 50 pages
T+3   │ ─────────────────┼──────────────────┼──────────────────┼ Script: 50 pages
T+4   │ E2E TEST         │ E2E TEST         │ E2E TEST         │ Script: 62 pages
```

### File Transformation Pattern

**Input (Before):**
```tsx
export default function MyPage() {
  return <h1>Welcome</h1>;
}
```

**Output (After):**
```tsx
import { useTranslation } from "react-i18next";

export default function MyPage() {
  const { t } = useTranslation();
  return <h1>{t('pages:mypage.title', 'Welcome')}</h1>;
}
```

---

## 🧪 PHASE 6: TEST (MB.MD Step 6)

### Test Matrix

| Page | Test Type | Verification |
|------|-----------|--------------|
| LandingPage | E2E | Spanish hero text |
| LoginPage | E2E | Spanish form labels |
| ProfilePage | E2E | Spanish tab labels |
| SettingsPage | E2E | Spanish menu items |
| Arabic RTL | Visual | Right-to-left layout |

---

## 📝 PHASE 7: DOCUMENT (MB.MD Step 7)

Update `replit.md` with:
- Total pages internationalized
- Translation file locations
- New namespaces added
- Language selector changes

---

## 🔄 PHASE 8: REVIEW (MB.MD Step 8)

### Self-Critique Checklist
- [ ] No unused `t` variables
- [ ] All strings have fallbacks
- [ ] No hardcoded text in JSX
- [ ] TypeScript compiles
- [ ] E2E tests pass

---

## 🔧 PHASE 9: ITERATE (MB.MD Step 9)

If issues found:
1. Fix TypeScript errors immediately
2. Add missing translation keys
3. Re-run E2E tests

---

## ✅ PHASE 10: COMPLETE (MB.MD Step 10)

### Deliverables
1. 318 pages with internationalization support
2. Comprehensive translation files for en/es
3. E2E test verification
4. Updated documentation

---

## 📊 ESTIMATED TOKEN USAGE

| Approach | Tokens | Time |
|----------|--------|------|
| Manual (page by page) | ~500K | 8+ hours |
| **Batch Script + Subagents** | **~50K** | **30 min** |
| **Savings** | **90%** | **94%** |

---

## 🚀 IMMEDIATE NEXT STEPS

1. **NOW:** Generate comprehensive locale JSON files with all page keys
2. **NOW:** Create batch transformation script for common patterns
3. **PARALLEL:** Run 4 subagents for complex pages
4. **VERIFY:** E2E test suite

**Command to start:** Execute Phase 5 immediately

---

## 📋 MB.MD MAINTENANCE LOG

*Per God Command #10: All work must be logged here.*

### Session: December 28, 2025 - Friendship System Cleanup

**Branch:** `main` (should have been `fix/friendship-system-cleanup` - policy now enforced)

**Tasks Completed:**
- [x] Deleted 58 test users from dev database
- [x] Cleaned 6 orphaned friendships (references to inactive users)
- [x] Cleaned 6 orphaned friend requests (references to inactive users)
- [x] Added `cancelFriendRequest()` storage method
- [x] Added `DELETE /api/friends/requests/:id` endpoint
- [x] Updated `getUserFriends()` to filter inactive users
- [x] Documented patterns in mb.md OPERATIONAL PATTERNS section

**God Commands Added:**
- [x] gc-009: Feature Branches Required
- [x] gc-010: Plan Tracker Updates Required

**Commits:**
- `ed93904` - Add cancel friend requests + filter inactive users
- `d468861` - Add user cleanup operational patterns to mb.md

**Next Session Should:**
- [ ] Create feature branch for any new work
- [ ] Add frontend "Cancel Request" button integration
- [ ] Implement closeness score recalculation service

---

### Session: December 28, 2025 - Mr. Blue QA Platform Handoff

**Branch:** `main` (handoff plan only - no code changes)

**Strategic Work (Replit AI → Mr. Blue):**
- [x] Created handoff playbook: `Mr Blue/playbooks/qa-customer-platform.md`
- [x] Updated Mr. Blue system prompt with QA monitoring responsibilities
- [x] Added God Commands gc-011 (Admin Approval Required) and gc-012 (God-Level Execution)
- [x] Documented RBAC execution rights (regular users vs god-level admins)

**Mr. Blue Should Now Execute:**
- [ ] Phase 0: Database schema (analyticsConsent, userFeedback, adminApprovals tables)
- [ ] Phase 1: Frontend session capture SDK
- [ ] Phase 2: GDPR consent component
- [ ] Phase 3: Mr. Blue context injection
- [ ] Phase 4: Feedback submission flow
- [ ] Phase 5: Admin approval queue UI
- [ ] Phase 6: God-level execution integration

**Invocation:** `use mb.md: playbooks:qa-customer-platform`

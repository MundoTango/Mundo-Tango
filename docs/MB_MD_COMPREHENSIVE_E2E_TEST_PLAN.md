# MB.MD COMPREHENSIVE E2E TEST PLAN
## Self-Healing Playwright Tests with Agent Handoff

**Version:** 1.0  
**Date:** November 25, 2025  
**Owner:** Mr. Blue + 1,218 Agents  
**Methodology:** MB.MD (Simultaneously, Recursively, Critically)  
**Status:** READY FOR EXECUTION

---

## MISSION

Execute comprehensive E2E tests for all core platform features with autonomous self-healing:
- **Memories Feed** - Landing + Detail pages
- **Profile** - View, Edit, Public pages
- **City Groups** - Landing + Detail pages
- **Professional Groups** - Landing + Detail pages
- **Events** - Discovery, Details, Create, My Events, Calendar

**Self-Healing Protocol:** When a test fails, hand off to a sub-agent to fix the issue, then resume testing from the exact failure point.

---

## TEST ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MB.MD TEST ORCHESTRATOR                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Phase 1: Execute Test Suite                                 │   │
│  │  - Run Playwright tests in sequence                         │   │
│  │  - Capture screenshots on each step                         │   │
│  │  - Log all console errors + network failures                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Phase 2: Failure Detection                                  │   │
│  │  - Identify exact failure point                             │   │
│  │  - Collect evidence (screenshot, logs, DOM state)           │   │
│  │  - Classify error type (UI/API/Data/Navigation)             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Phase 3: Sub-Agent Handoff (Auto-Fix)                       │   │
│  │  - Dispatch specialized agent based on error type           │   │
│  │  - Agent: Diagnose → Fix → Validate                         │   │
│  │  - Max 3 retry attempts per issue                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Phase 4: Resume Testing                                     │   │
│  │  - Restart from exact failure point                         │   │
│  │  - Continue remaining tests                                  │   │
│  │  - Generate final report                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PRD-BASED TEST CATEGORIES

### Based on ULTIMATE_SERIES_PRD_VERIFICATION.md:
- **User Profile (8 pages):** Profile View, Profile Edit, Account Settings, Privacy Settings
- **Social Features (8 pages):** Feed/Timeline, Create Post, User Profile, Friends List
- **Events System (10 pages):** Event Discovery, Event Details, Create Event, My Events, Calendar, RSVP
- **Groups & Communities (15 pages):** Group Discovery, Group Details, Create Group, My Groups, Group Events

---

## TEST SUITES (5 CATEGORIES)

### SUITE 1: MEMORIES FEED (4 Tests)

| Test ID | Test Name | Page | PRD Requirement | Expected Behavior |
|---------|-----------|------|-----------------|-------------------|
| MEM-001 | Memories landing loads | `/memories` | Feed/Timeline | Page loads with memory cards displayed |
| MEM-002 | Memory card interaction | `/memories` | Social Features | Click on memory card shows details |
| MEM-003 | Memory stats dashboard | `/memory-stats` | Analytics | Stats page shows user memory analytics |
| MEM-004 | Create new memory | `/memories` | Create Post | User can create and save a new memory |

**Test Data:**
- User: `admin@mundotango.life`
- Expected: Memory cards with title, date, content preview

**API Endpoints:**
- `GET /api/memories` - List user memories
- `POST /api/memories` - Create new memory
- `GET /api/memories/:id` - Get memory details

---

### SUITE 2: PROFILE (6 Tests)

| Test ID | Test Name | Page | PRD Requirement | Expected Behavior |
|---------|-----------|------|-----------------|-------------------|
| PROF-001 | Profile page loads | `/profile` | Profile View | User profile displays with avatar, bio, stats |
| PROF-002 | Profile edit form | `/profile/edit` | Profile Edit | Edit form loads with current data populated |
| PROF-003 | Profile update saves | `/profile/edit` | Profile Edit | Changes persist after save |
| PROF-004 | Public profile view | `/profile/:userId` | User Profile | Other users can view public profile |
| PROF-005 | Profile tabs work | `/profile` | Profile View | Posts, Events, Groups tabs switch correctly |
| PROF-006 | Avatar upload | `/profile/edit` | Profile Edit | User can upload new profile photo |

**Test Data:**
- User: `admin@mundotango.life`
- Test User ID: 1 (Super Admin)
- Expected: Avatar, bio, dance styles, location

**API Endpoints:**
- `GET /api/users/:id/profile` - Get profile
- `PATCH /api/users/:id/profile` - Update profile
- `GET /api/users/:id` - Get user public info

---

### SUITE 3: CITY GROUPS (6 Tests)

| Test ID | Test Name | Page | PRD Requirement | Expected Behavior |
|---------|-----------|------|-----------------|-------------------|
| CITY-001 | City groups landing | `/groups` | Group Discovery | Page loads with group cards |
| CITY-002 | Filter by city | `/groups` | Group Discovery | Filtering shows city-specific groups |
| CITY-003 | Group details page | `/groups/:id` | Group Details | Group info, members, events displayed |
| CITY-004 | Group events tab | `/groups/:id` | Group Events | Events tab shows group events with RSVP |
| CITY-005 | Join group | `/groups/:id` | My Groups | User can join a public group |
| CITY-006 | Group members list | `/groups/:id` | Group Details | Members tab shows member list |

**Test Data:**
- Melbourne Group ID: 21 (156+ events)
- Expected: Group name, description, member count, event count

**API Endpoints:**
- `GET /api/groups` - List groups
- `GET /api/groups/:id` - Get group details
- `GET /api/groups/:id/events` - Get group events
- `POST /api/groups/:id/join` - Join group

---

### SUITE 4: PROFESSIONAL GROUPS (5 Tests)

| Test ID | Test Name | Page | PRD Requirement | Expected Behavior |
|---------|-----------|------|-----------------|-------------------|
| PRO-001 | Pro groups landing | `/professional-groups` | Group Discovery | Page loads with professional group cards |
| PRO-002 | Filter by category | `/professional-groups` | Group Discovery | Filter by teachers, DJs, performers works |
| PRO-003 | Pro group details | `/groups/:id` | Group Details | Pro group shows specialized info |
| PRO-004 | Pro group events | `/groups/:id` | Group Events | Pro group events displayed correctly |
| PRO-005 | Apply to pro group | `/groups/:id` | My Groups | Application flow for private pro groups |

**Test Data:**
- Expected: Professional categories (Teachers, DJs, Performers, Organizers)
- Expected: Application/approval workflow for private groups

**API Endpoints:**
- `GET /api/groups?type=professional` - List pro groups
- `POST /api/groups/:id/apply` - Apply to join

---

### SUITE 5: EVENTS (10 Tests)

| Test ID | Test Name | Page | PRD Requirement | Expected Behavior |
|---------|-----------|------|-----------------|-------------------|
| EVT-001 | Events landing | `/events` | Event Discovery | Page loads with event cards |
| EVT-002 | Event type filters | `/events` | Event Discovery | Filter by milonga, class, workshop, festival |
| EVT-003 | Event search | `/events` | Event Discovery | Search by name, location, date works |
| EVT-004 | Event details page | `/events/:id` | Event Details | Full event info, RSVP button, source attribution |
| EVT-005 | RSVP to event | `/events/:id` | RSVP | User can RSVP and see confirmation |
| EVT-006 | Cancel RSVP | `/events/:id` | RSVP | User can cancel RSVP |
| EVT-007 | My events page | `/my-events` | My Events | Shows user's RSVPs and created events |
| EVT-008 | Event calendar | `/calendar` | Calendar | Calendar view shows events by date |
| EVT-009 | Create event form | `/events/create` | Create Event | Form loads with all required fields |
| EVT-010 | Event creation flow | `/events/create` | Create Event | User can create and publish event |

**Test Data:**
- Total Events: 260 across multiple cities
- Sample Event ID: 1291 (Melbourne class event)
- Event Types: milonga, practica, class, workshop, festival, marathon, encuentro

**API Endpoints:**
- `GET /api/events` - List events with filters
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/rsvp` - RSVP to event
- `DELETE /api/events/:id/rsvp` - Cancel RSVP
- `POST /api/events` - Create event
- `GET /api/users/:id/rsvps` - Get user RSVPs

---

## SELF-HEALING PROTOCOL

### Error Classification & Agent Assignment

| Error Type | Detection Pattern | Assigned Agent | Fix Strategy |
|------------|------------------|----------------|--------------|
| **UI_NOT_FOUND** | Element selector fails | FrontendFixAgent | Add missing element or fix selector |
| **API_ERROR** | 4xx/5xx response | APIFixAgent | Fix route handler or validation |
| **DATA_MISSING** | Empty response/null | DatabaseAgent | Create seed data or fix query |
| **NAVIGATION_FAIL** | Wrong URL/redirect | RoutingAgent | Fix route definition or redirect |
| **AUTH_REQUIRED** | 401/403 response | AuthAgent | Add auth or fix permissions |
| **TIMEOUT** | Page load >30s | PerformanceAgent | Optimize query or lazy load |

### Auto-Fix Retry Protocol

```
ATTEMPT 1: Primary Fix
├── Agent analyzes error
├── Generates fix based on pattern database
├── Applies fix
└── Re-runs failed test

ATTEMPT 2: Alternative Strategy
├── If ATTEMPT 1 failed, try alternative approach
├── Check similar past fixes in GlobalKnowledgeBase
└── Apply learned pattern

ATTEMPT 3: Escalation Preparation
├── If still failing, prepare detailed report
├── Collect all evidence (screenshots, logs, DOM)
└── ESCALATE to Replit AI with recommendations
```

### Evidence Collection (Per Test)

1. **Before Screenshot** - Page state before action
2. **After Screenshot** - Page state after action
3. **Console Logs** - All browser console output
4. **Network Log** - API calls and responses
5. **DOM Snapshot** - HTML state at failure point
6. **Error Stack** - Full error trace

---

## EXECUTION PLAN

### Phase 1: Sequential Suite Execution

```
SUITE 1: MEMORIES (4 tests)
    ↓ (if failure → handoff → fix → resume)
SUITE 2: PROFILE (6 tests)
    ↓ (if failure → handoff → fix → resume)
SUITE 3: CITY GROUPS (6 tests)
    ↓ (if failure → handoff → fix → resume)
SUITE 4: PRO GROUPS (5 tests)
    ↓ (if failure → handoff → fix → resume)
SUITE 5: EVENTS (10 tests)
    ↓
FINAL REPORT
```

### Phase 2: Parallel Optimization (After Initial Run)

Once all tests pass, re-run in parallel for performance validation:
- Run all 31 tests in 4 parallel workers
- Target: <3 minutes total execution
- Report any race conditions or state issues

---

## SUCCESS CRITERIA

| Metric | Target | Measurement |
|--------|--------|-------------|
| Pass Rate | >95% | Tests passing / Total tests |
| Auto-Fix Rate | >80% | Issues auto-fixed / Total issues |
| Escalation Rate | <10% | Issues escalated / Total issues |
| Execution Time | <10 min | Total test suite duration |
| Evidence Coverage | 100% | Tests with full evidence / Total tests |

---

## TEST EXECUTION COMMANDS

```bash
# Run all suites sequentially
npx playwright test tests/mb-md-comprehensive.spec.ts --project=chromium

# Run specific suite
npx playwright test tests/mb-md-comprehensive.spec.ts --grep "MEMORIES"
npx playwright test tests/mb-md-comprehensive.spec.ts --grep "PROFILE"
npx playwright test tests/mb-md-comprehensive.spec.ts --grep "CITY_GROUPS"
npx playwright test tests/mb-md-comprehensive.spec.ts --grep "PRO_GROUPS"
npx playwright test tests/mb-md-comprehensive.spec.ts --grep "EVENTS"

# Generate HTML report
npx playwright show-report test-results/html-report
```

---

## IMPLEMENTATION FILES TO CREATE

1. **Test Spec:** `tests/mb-md-comprehensive.spec.ts`
   - All 31 tests organized by suite
   - Self-healing hooks for failure detection
   - Evidence collection on each step

2. **Auto-Fix Service:** `server/services/testing/AutoFixService.ts`
   - Error classification logic
   - Agent dispatch mechanism
   - Retry orchestration

3. **Test Report:** `tests/reports/MB_MD_E2E_REPORT.md`
   - Auto-generated after each run
   - Pass/fail summary
   - Evidence links
   - Fix history

---

## AGENT RESPONSIBILITIES

### Mr. Blue (Coordinator)
- Orchestrates test execution
- Dispatches sub-agents on failure
- Generates final report

### FrontendFixAgent
- Fixes missing UI elements
- Corrects CSS/styling issues
- Updates data-testid attributes

### APIFixAgent
- Fixes route handlers
- Corrects validation schemas
- Handles response formatting

### DatabaseAgent
- Creates missing seed data
- Fixes query issues
- Validates data integrity

### AuthAgent
- Fixes permission issues
- Corrects auth middleware
- Handles session problems

---

## READY FOR EXECUTION

This plan covers:
- **31 comprehensive tests** across 5 core features
- **Self-healing protocol** with 3-attempt retry
- **Agent handoff** for automatic fixes
- **Evidence collection** for debugging
- **Resume capability** from failure point

**Next Step:** Execute `npm run test:mb-md` to begin testing with auto-fix enabled.

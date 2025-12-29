# MB.MD PATTERN 99: MULTI-AGENT SITE AUDITOR

**Invocation:** `use mb.md: pattern-99` or "audit the entire site"
**Version:** 1.0.0
**Status:** ACTIVE
**Created:** December 29, 2025

---

## MISSION

You are Mr. Blue, orchestrating 140+ specialized agents to systematically audit every page of Mundo Tango, detect issues through multiple expert perspectives, spawn parallel subagents to fix issues as they're found, then re-audit the fixes.

**Core Principles:**
- WORK SIMULTANEOUSLY - Parallel operations, not sequential
- WORK RECURSIVELY - Deep analysis, trace dependencies
- WORK CRITICALLY - Target 95-99/100 quality, not 80%
- LEARN CONTINUOUSLY - Every audit teaches you something new

---

## PHASE 0: VERIFY AGENT ORCHESTRATION (PREREQUISITE)

Before running the full audit, verify all systems are operational:

### Check 1: Agent Registry Status
```typescript
// Verify all 140+ agents are registered
const agents = agentCardRegistry.getAllAgents();
console.log(`Registered agents: ${agents.length}`);
// EXPECTED: 140+ agents across 7 domains
```

### Check 2: A2A Communication Test
```typescript
// Send test message: CEO → CTO
const testMessage: A2AMessage = {
  id: generateId(),
  from: 'ceo-agent',
  to: 'cto-agent',
  type: 'query',
  payload: { question: 'What is our current tech debt status?' },
  priority: 'normal'
};
const response = await a2aProtocol.routeMessage('cto-agent', testMessage);
// EXPECTED: Valid response from CTO agent
```

### Check 3: Page Load Orchestration
```typescript
// Test handlePageLoad() runs all 6 phases
const result = await AgentOrchestrationService.handlePageLoad('/feed');
console.log(`Phases completed: activation=${result.activationTime}ms, audit=${result.auditTime}ms`);
// EXPECTED: All 6 phases complete in <1000ms
```

### Check 4: Database Logging
```sql
SELECT COUNT(*) FROM a2a_messages WHERE created_at > NOW() - INTERVAL '5 minutes';
-- EXPECTED: Recent messages logged
```

**IF ANY CHECK FAILS:** Stop and fix orchestration before proceeding.

---

## PHASE 1: AGENT DEPLOYMENT MATRIX

### Executive Layer (Strategic Review)
| Agent | Perspective | Key Questions |
|-------|-------------|---------------|
| **CEO Agent** | Growth & Vision | Does this page help grow the global tango community? |
| **CTO Agent** | Technical Quality | Is the code solid? Performance? Security? Tech debt? |
| **CPO Agent** | Product Value | Does this feature deliver real user value? |
| **CFO Agent** | Revenue | Are monetization paths clear? Conversion optimized? |
| **CMO Agent** | User Acquisition | Will this attract and retain users? |

### VP Layer (Domain Expertise)
| Agent | Domain | Audit Focus |
|-------|--------|-------------|
| **VP Engineering** | Code Quality | PR-worthy code? Proper patterns? |
| **VP Design** | Design System | Consistent with MT Ocean theme? |
| **VP Data** | Analytics | Tracking implemented? Insights visible? |
| **VP Security** | Security | Auth, XSS, CSRF, data protection? |
| **VP DevOps** | Infrastructure | Performance, error handling, logging? |

### Head Layer (Specialist Checks)
| Agent | Specialty | Audit Focus |
|-------|-----------|-------------|
| **Head of QA** | Testing | Edge cases covered? |
| **Head of Frontend** | React/UI | Responsive? Accessible? |
| **Head of Backend** | APIs | Error handling? Validation? |
| **Head of AI** | AI Features | Mr. Blue working? AI integrated? |
| **Head of Search** | Discovery | Filtering works? Results relevant? |

### Self-Healing Agents (Auto-Fix)
| Agent | Role |
|-------|------|
| **PageAuditService** | Per-page health check |
| **SelfHealingService** | Attempt auto-repairs |
| **ErrorAnalysisAgent** | Root cause analysis |
| **UXValidationService** | UI/UX validation |
| **AccessibilityChecker** | A11y compliance |

---

## PHASE 2: FULL SITE AUDIT PROTOCOL

### Site Map (85+ Pages)

**Discovery Flow:**
1. `/` - Landing Page
2. `/about` - About Page
3. `/faq` - FAQ Page
4. `/pricing` - Pricing Page
5. `/for-dancers` - For Dancers
6. `/for-teachers` - For Teachers
7. `/for-organizers` - For Organizers
8. `/support-us` - Support Page
9. `/ambassadors` - Ambassador Program
10. `/volunteer` - Volunteer Page

**Auth & Onboarding:**
11. `/register` - Registration
12. `/login` - Login
13. `/forgot-password` - Password Reset
14. `/verify-email` - Email Verification
15. `/welcome` - Welcome Page
16. `/onboarding/step-1` - City Selection
17. `/onboarding/step-2` - Roles Selection
18. `/onboarding/step-3` - Event Discovery
19. `/onboarding/step-4` - Profile Setup
20. `/onboarding/step-5` - Completion

**Core Experience:**
21. `/feed` - Main Feed
22. `/cities/:slug` - City Pages (301 cities)
23. `/events` - Events Discovery
24. `/events/:id` - Event Details
25. `/create-event` - Event Creation
26. `/my-events` - My Events
27. `/profile/:username` - Profile View
28. `/profile/edit` - Profile Edit
29. `/search` - Global Search

**Social:**
30. `/friends` - Friends List
31. `/messages` - Messages Inbox
32. `/messages/:threadId` - Message Thread
33. `/notifications` - Notifications

**Community:**
34. `/groups` - Groups Landing
35. `/groups/:id` - Group Details
36. `/housing` - Housing/Host Homes
37. `/housing/:id` - Housing Details
38. `/venues` - Venues
39. `/venues/:id` - Venue Details
40. `/marketplace` - Marketplace
41. `/teachers` - Teachers Directory

**Content:**
42. `/blog` - Blog
43. `/blog/:slug` - Blog Article
44. `/stories` - Stories
45. `/live` - Live Streams
46. `/music-library` - Music Library
47. `/saved` - Saved Posts

**Settings:**
48. `/settings` - Settings
49. `/settings/account` - Account Settings
50. `/settings/privacy` - Privacy Settings
51. `/settings/notifications` - Notification Settings
52. `/subscriptions` - Subscriptions

**Admin:**
53. `/admin` - Admin Dashboard
54. `/admin/users` - User Management
55. `/admin/events` - Event Management
56. `/admin/scraping` - Scraping Admin
57. `/admin/pending-sources` - Pending Sources
58. `/admin/analytics` - Analytics

**Additional Pages:** (30+ more specialized pages)

---

## PHASE 3: PER-PAGE AUDIT PROTOCOL

For EACH page, execute this audit:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PER-PAGE AUDIT CYCLE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. LOAD PAGE                                                    │
│     • Desktop viewport (1280px)                                  │
│     • Mobile viewport (375px)                                    │
│     • Check console for errors                                   │
│                                                                  │
│  2. ACTIVATE AGENTS (50ms)                                       │
│     • Page-specific agents activated                             │
│     • Feature agents for components                              │
│     • Context loaded                                             │
│                                                                  │
│  3. RUN ALL PERSPECTIVES (200ms)                                 │
│     • CEO: Business value check                                  │
│     • CTO: Technical quality check                               │
│     • CPO: User value check                                      │
│     • CMO: Growth potential check                                │
│     • VP Design: Theme consistency                               │
│     • VP Security: Vulnerability scan                            │
│     • Head Frontend: React patterns                              │
│     • Head Backend: API health                                   │
│                                                                  │
│  4. LOG ISSUES                                                   │
│     • Severity: P0 (blocker) → P4 (polish)                      │
│     • Perspective: Which agent found it                          │
│     • Description: What's wrong                                  │
│     • Expected: What should happen                               │
│     • Actual: What's happening                                   │
│     • Fix Plan: How to fix it                                    │
│                                                                  │
│  5. SPAWN FIX SUBAGENT (if P0-P2)                               │
│     • Parallel subagent starts fixing                            │
│     • Main audit continues to next page                          │
│                                                                  │
│  6. LEARN                                                        │
│     • Store what this page SHOULD do                             │
│     • Update Mr. Blue's knowledge base                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## PHASE 4: ISSUE SCHEMA

```typescript
interface AuditIssue {
  id: string;
  page: string;
  component?: string;
  severity: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  perspective: 'CEO' | 'CTO' | 'CPO' | 'CFO' | 'CMO' | 'VP-Design' | 'VP-Security' | 'VP-Data' | 'Head-FE' | 'Head-BE' | 'Head-QA';
  category: 'functionality' | 'ui' | 'ux' | 'performance' | 'security' | 'accessibility' | 'localization' | 'mobile';
  description: string;
  expected: string;
  actual: string;
  fixPlan: string;
  status: 'open' | 'fixing' | 'fixed' | 'verified' | 'wontfix';
  fixedBy?: string;
  fixedAt?: Date;
  verifiedAt?: Date;
}

// Severity Guide:
// P0: BLOCKER - Platform unusable, data loss, security breach
// P1: CRITICAL - Major feature broken, significant user impact
// P2: HIGH - Feature degraded, workaround exists
// P3: MEDIUM - Minor issue, cosmetic, edge case
// P4: LOW - Polish, nice-to-have, future improvement
```

---

## PHASE 5: PARALLEL FIX QUEUE

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARALLEL FIX ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐   Issues    ┌────────────────────────────┐  │
│  │  AUDIT LOOP    │ ──────────▶ │  PRIORITY FIX QUEUE        │  │
│  │                │             │                            │  │
│  │  Continues     │             │  P0: ████████ (IMMEDIATE)  │  │
│  │  auditing      │             │  P1: ██████   (URGENT)     │  │
│  │  next page     │             │  P2: ████     (HIGH)       │  │
│  │                │             │  P3: ██       (MEDIUM)     │  │
│  └────────────────┘             │  P4: █        (LOW)        │  │
│                                 └─────────────┬──────────────┘  │
│                                               │                  │
│                                     Spawn     │                  │
│                                     Subagents │                  │
│                                               ▼                  │
│                                 ┌────────────────────────────┐  │
│                                 │  PARALLEL FIX SUBAGENTS    │  │
│                                 │                            │  │
│                                 │  ┌────┐ ┌────┐ ┌────┐     │  │
│                                 │  │Fix1│ │Fix2│ │Fix3│     │  │
│                                 │  └─┬──┘ └─┬──┘ └─┬──┘     │  │
│                                 │    │      │      │        │  │
│                                 └────┼──────┼──────┼────────┘  │
│                                      │      │      │            │
│                                      ▼      ▼      ▼            │
│                                 ┌────────────────────────────┐  │
│                                 │    RE-AUDIT QUEUE          │  │
│                                 │                            │  │
│                                 │  Pages with completed      │  │
│                                 │  fixes get re-audited      │  │
│                                 └────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## PHASE 6: REUSABLE COMPONENTS

Audit these ONCE, apply findings to ALL pages that use them:

| Component | Pages Used | Audit Focus |
|-----------|------------|-------------|
| `PostCard` | Feed, Profile, City, Group | Reactions, likes, saves, share |
| `EventCard` | Events, City, Feed, Search | RSVP sync, date display, filtering |
| `Sidebar` | All authenticated pages | Navigation, responsive collapse |
| `Header` | All pages | Search, language, notifications |
| `Toast` | All pages | Z-index, positioning, timing |
| `FriendCard` | Friends, Search, Profile | Request handling |
| `MessageThread` | Messages | Real-time, read status |
| `ImageUploader` | Profile, Post, Event | Preview, lightbox |
| `LocaleProvider` | All pages | Language persistence |
| `ThemeProvider` | All pages | Dark mode consistency |
| `MrBlueChat` | All pages | Singleton, mobile takeover |
| `CityCard` | Cities, Search, Groups | Follower count, navigation |
| `UserAvatar` | Everywhere | Fallback, size variants |
| `DatePicker` | Events, Filters | Locale, validation |
| `Map` | City, Events, Housing | Markers, clustering |

---

## PHASE 7: KNOWN BUGS (TAMÁS REPORT)

Priority fixes from user testing:

| # | Bug | Severity | Status |
|---|-----|----------|--------|
| 1 | Event filtering (Warsaw 8 events, 0 shown) | P1 | OPEN |
| 2 | RSVP status inconsistency | P1 | OPEN |
| 3 | Like/reaction persistence | P1 | OPEN |
| 4 | Direct messages blank screen | P1 | OPEN |
| 5 | Facebook share 404 | P2 | OPEN |
| 6 | Friend requests not in pending list | P1 | OPEN |
| 7 | Saved posts not visible | P2 | OPEN |
| 8 | Localization not persisting | P2 | OPEN |
| 9 | Toast z-index (hidden behind Mr. Blue) | P3 | OPEN |
| 10 | Photo lightbox missing | P3 | OPEN |
| 11 | 'Who liked this' not visible | P3 | OPEN |

---

## PHASE 8: VALIDATION CHECKLISTS

### Localization (69 Languages)
- [ ] Language dropdown works
- [ ] Selection persists on refresh
- [ ] All UI strings translated
- [ ] RTL languages display correctly (Arabic, Hebrew, Urdu)
- [ ] Date/time formats localized

### Mobile Responsiveness
- [ ] 375px (iPhone SE) - No overflow, readable text
- [ ] 768px (iPad) - Proper tablet layout
- [ ] 1280px (Desktop) - Full experience

### Dark Mode
- [ ] All pages support dark mode
- [ ] Proper contrast ratios
- [ ] No white flashes on load
- [ ] Images have dark-safe backgrounds

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader labels present
- [ ] Focus indicators visible
- [ ] Color contrast WCAG AA

---

## EXECUTION COMMAND

When user says "audit the entire site" or "use mb.md: pattern-99":

1. **Verify A2A** (Phase 0) - Run all 4 prerequisite checks
2. **If PASS** → Proceed to full audit
3. **If FAIL** → Report which system is broken, suggest fix
4. **Audit Loop** → Process all 85+ pages with all agent perspectives
5. **Fix in Parallel** → Spawn subagents for P0-P2 issues as found
6. **Re-Audit** → Verify all fixes work
7. **Learn** → Update MB.MD with new patterns discovered
8. **Report** → Generate comprehensive audit report

---

## LEARNING PROTOCOL

After every audit session, update these files:
- `mb.md` - New patterns discovered
- `.agent-memory/audit-learnings.md` - What worked, what didn't
- `Mr Blue/agents/overview.md` - New agent capabilities

**You are not just auditing. You are learning to be better with every page you analyze.**

---

*Mr. Blue Multi-Agent Site Auditor v1.0 - December 29, 2025*

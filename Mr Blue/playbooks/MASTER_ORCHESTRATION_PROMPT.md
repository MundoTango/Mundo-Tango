# Mr. Blue Master Orchestration Prompt
## Pattern 100: Full Platform Evolution

**Version:** 1.0.0  
**Date:** December 30, 2025  
**God Commands Active:** #0-#8 (ALL)  
**Target Quality:** 99/100

---

## MASTER EXECUTION PROMPT

```
Mr. Blue, execute FULL PLATFORM EVOLUTION with all 140+ agents working SIMULTANEOUSLY.

═══════════════════════════════════════════════════════════════════════════════
                         GOD COMMANDS (ENFORCE ALL)
═══════════════════════════════════════════════════════════════════════════════
#0: AUTO-INVOKE GitHub Practices + Plan Tracker
#1: Test before completing ANY task
#2: Work SIMULTANEOUSLY - Promise.all, parallel tool calls
#3: Work RECURSIVELY - Deep analysis (imports, dependencies, related files)
#4: Work CRITICALLY - Target 99/100 quality
#5: Check Infrastructure First - Use existing systems
#6: Never change ID column types (serial ↔ varchar breaks data)
#7: Auto-Fix Maximization - 3-attempt retry, <10% escalation
#8: Validation Loop - observe → decide → act → validate → adapt

═══════════════════════════════════════════════════════════════════════════════
                         PARALLEL WORKSTREAM ASSIGNMENTS
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ WORKSTREAM A: VibeCoding Evolution (Patterns 69-77)                         │
│ Agents: cto-agent, vp-engineering, vp-devops, ai-coordinator                │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Pattern 69: ReAct Orchestration                                           │
│   - Implement THOUGHT → ACTION → OBSERVATION loop                           │
│   - Add ReAct protocol to MrBlueConversationService                         │
│   - Create server/services/mrBlue/reactProtocol.ts                          │
│                                                                             │
│ □ Pattern 70: Safety Confirmation                                           │
│   - Add confirmation prompts for destructive actions                        │
│   - File deletion, DB DROP, API key changes require approval                │
│                                                                             │
│ □ Pattern 71: Checkpoint Management                                         │
│   - Save state before risky operations                                      │
│   - Rollback capability for failed changes                                  │
│                                                                             │
│ □ Pattern 72-77: Skills, Connectors, Browser, Sandbox, Tests, Search        │
│   - Create skill catalog for reusable solutions                             │
│   - Add connector registry for external APIs                                │
│   - Browser automation via Playwright                                       │
│   - Code sandbox for safe execution                                         │
│   - Test orchestration for self-verification                                │
│   - Web search integration for current data                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ WORKSTREAM B: Internationalization (318 Pages)                              │
│ Agents: vp-design, landing-page, feed-page, profile-page, content-agents    │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Generate comprehensive locale JSON files                                  │
│   - public/locales/{en,es,ar}/pages.json                                    │
│   - Pattern: Extract common UI patterns → generate keys                     │
│                                                                             │
│ □ Batch A (Parallel): Auth + Onboarding (11 pages)                          │
│ □ Batch B (Parallel): Settings + Profile (15 pages)                         │
│ □ Batch C (Parallel): Marketing + Landing (10 pages)                        │
│ □ Batch D (Parallel): Core app pages (20 pages)                             │
│ □ Script: Remaining 262 pages with batch transformation                     │
│                                                                             │
│ □ E2E Verification: Spanish, Arabic RTL                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ WORKSTREAM C: Friendship System Completion                                  │
│ Agents: social-coordinator, profile-page, notifications-agent               │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Frontend "Cancel Request" button integration                              │
│   - Add button to pending request cards                                     │
│   - Connect to DELETE /api/friends/requests/:id                             │
│                                                                             │
│ □ Closeness Score Recalculation Service                                     │
│   - Create server/services/closenessScoreService.ts                         │
│   - Implement recalculation based on interactions                           │
│   - Add API endpoint for manual recalculation                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ WORKSTREAM D: QA Platform Phases                                            │
│ Agents: qa-coordinator, error-analysis-service, ux-validation-service       │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Phase 0: Database schema                                                  │
│   - analyticsConsent, userFeedback, adminApprovals tables                   │
│   - Use Drizzle schema in shared/schema.ts                                  │
│                                                                             │
│ □ Phase 1: Frontend session capture SDK                                     │
│   - Track page views, clicks, navigation                                    │
│   - Store in userFeedback context                                           │
│                                                                             │
│ □ Phase 2: GDPR consent component                                           │
│   - Cookie consent banner                                                   │
│   - Granular opt-in/opt-out controls                                        │
│                                                                             │
│ □ Phase 3: Mr. Blue context injection                                       │
│   - Pass user journey data to Mr. Blue                                      │
│   - Enable contextual bug analysis                                          │
│                                                                             │
│ □ Phase 4: Feedback submission flow                                         │
│   - Already partially complete (FeedbackButton)                             │
│   - Add attachment support for screenshots                                  │
│                                                                             │
│ □ Phase 5: Admin approval queue UI                                          │
│   - /admin/feedback route (already exists)                                  │
│   - Add bulk actions, filtering                                             │
│                                                                             │
│ □ Phase 6: God-level execution integration                                  │
│   - VibeCoding tools for auto-fix from feedback                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ WORKSTREAM E: Self-Healing + Performance                                    │
│ Agents: self-healing-monitor, self-healing-diagnostics, performance-monitor │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Enable self-healing in production                                         │
│   - Currently disabled in dev for performance                               │
│   - Implement production toggle                                             │
│                                                                             │
│ □ Performance optimization audit                                            │
│   - Bundle size analysis                                                    │
│   - Code splitting for lazy loading                                         │
│   - Image optimization                                                      │
│                                                                             │
│ □ Error monitoring dashboard                                                │
│   - Real-time error tracking UI                                             │
│   - Auto-fix suggestions                                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ WORKSTREAM F: Scraper Enhancement                                           │
│ Agents: master-orchestrator, unified-event-scraper, scraper-agents          │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Fix geocoding failures                                                    │
│   - 11 events failing geocoding (concatenated country strings)              │
│   - Parse location data before geocoding API call                           │
│                                                                             │
│ □ Fix event ingestion failures                                              │
│   - 6 events failing: "Cannot read properties of null (reading 'trim')"     │
│   - Add null checks in ingestion pipeline                                   │
│                                                                             │
│ □ Improve source quality scoring                                            │
│   - Track success rates per source                                          │
│   - Auto-disable failing sources                                            │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                         STAGED EXECUTION STRATEGY
═══════════════════════════════════════════════════════════════════════════════

Based on architect review, execute in STAGED WAVES to avoid conflicts:

┌─────────────────────────────────────────────────────────────────────────────┐
│ WAVE 1: Foundation (Sequential - Required First)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Workstream A: VibeCoding (Patterns 69-71)                                │
│    - ReAct protocol, safety confirmation, checkpoints                       │
│    - These enable better orchestration for later waves                      │
│                                                                             │
│ 2. Workstream D: QA Platform (Phases 0-2)                                   │
│    - Database schema first (dependencies for other phases)                  │
│    - Session SDK, GDPR consent                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ WAVE 2: Core Features (Parallel - Safe to Run Together)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Workstream C: Friendship System                                           │
│   - Isolated to social features, no schema conflicts                        │
│                                                                             │
│ □ Workstream F: Scraper Fixes                                               │
│   - Backend only, isolated to scraper services                              │
│                                                                             │
│ □ Workstream D: QA Platform (Phases 3-6)                                    │
│   - Continue after Wave 1 database is stable                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ WAVE 3: Heavy Transformation (Off-Peak - Resource Intensive)                │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Workstream B: Internationalization (318 pages)                            │
│   - Batch script runs during low-activity period                            │
│   - Requires exclusive file access                                          │
│                                                                             │
│ □ Workstream A: VibeCoding (Patterns 72-77)                                 │
│   - Skills, connectors, browser automation                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ WAVE 4: Production Readiness (Final)                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Workstream E: Self-Healing production toggle                              │
│ □ Full E2E test suite                                                       │
│ □ Performance audit                                                         │
│ □ Documentation update                                                      │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                         EXECUTION RULES
═══════════════════════════════════════════════════════════════════════════════

1. STAGED WAVES - Not Full Parallelism
   - Wave 1 MUST complete before Wave 2 starts
   - Wave 2 items CAN run in parallel
   - Wave 3 requires controlled execution window
   - Wave 4 is final validation

2. FOR EACH TASK:
   a. RESEARCH: grepFiles() to understand existing code
   b. PLAN: Determine minimal changes needed
   c. EXECUTE: writeFile() with code changes
   d. VERIFY: Run tests, check for errors
   e. DOCUMENT: Update relevant docs

3. AUTO-FIX PROTOCOL:
   - Attempt 1: Apply direct fix
   - Attempt 2: Check related files, fix dependencies
   - Attempt 3: Deep analysis, root cause fix
   - Escalate only if all 3 attempts fail (<10% escalation rate)

4. TESTING REQUIREMENTS:
   - All UI changes: E2E test with Playwright
   - All API changes: Unit test with Vitest
   - All database changes: Migration verification
   - All i18n changes: Language verification

5. DOCUMENTATION UPDATES:
   - replit.md: Technical architecture
   - plan.md: Progress tracking
   - docs/audit/*: Audit results
   - mb.md: Pattern completions

═══════════════════════════════════════════════════════════════════════════════
                         AGENT ROUTING TABLE
═══════════════════════════════════════════════════════════════════════════════

| Workstream | Lead Agent | Support Agents |
|------------|------------|----------------|
| A (VibeCoding) | cto-agent | vp-engineering, ai-coordinator |
| B (i18n) | vp-design | page-agents (all 10) |
| C (Friendship) | social-coordinator | profile-page, notifications |
| D (QA Platform) | qa-coordinator | error-analysis, ux-validation |
| E (Self-Healing) | self-healing-monitor | diagnostics, prevention, recovery |
| F (Scrapers) | master-orchestrator | unified-event-scraper, scrapers |

═══════════════════════════════════════════════════════════════════════════════
                         SUCCESS CRITERIA
═══════════════════════════════════════════════════════════════════════════════

□ Quality Score: 99/100 (all pages, all features)
□ VibeCoding: Patterns 69-77 implemented
□ Internationalization: 318 pages with i18n
□ Friendship: Cancel request UI + closeness scores
□ QA Platform: All 6 phases complete
□ Self-Healing: Production-ready toggle
□ Scrapers: 0 geocoding/ingestion failures

═══════════════════════════════════════════════════════════════════════════════

EXECUTE NOW. ALL AGENTS. SIMULTANEOUS. NO WAITING.
Target completion: This session.
Report progress to: admin@mundotango.life

Mr. Blue Brain v3.1 - Pattern 100 ACTIVE
```

---

## INVOCATION METHODS

### Method 1: Via Mr. Blue Chat (God-Level Users)
Copy the prompt above and paste into Mr. Blue chat interface.

### Method 2: Via API
```bash
curl -X POST http://localhost:5000/api/mrblue/command \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "command": "execute pattern 100",
    "playbook": "MASTER_ORCHESTRATION_PROMPT"
  }'
```

### Method 3: Via MrBlueInternalExecutor
```typescript
import { MrBlueInternalExecutor } from './server/services/mrBlue/MrBlueInternalExecutor';

await MrBlueInternalExecutor.executePlaybook('MASTER_ORCHESTRATION_PROMPT', {
  parallel: true,
  workstreams: ['A', 'B', 'C', 'D', 'E', 'F']
});
```

---

## PROGRESS TRACKING

Update this section as workstreams complete:

| Workstream | Status | Progress | Lead Agent |
|------------|--------|----------|------------|
| A: VibeCoding | ⏳ PENDING | 0% | cto-agent |
| B: i18n | ⏳ PENDING | 0% | vp-design |
| C: Friendship | ⏳ PENDING | 0% | social-coordinator |
| D: QA Platform | ⏳ PENDING | 0% | qa-coordinator |
| E: Self-Healing | ⏳ PENDING | 0% | self-healing-monitor |
| F: Scrapers | ⏳ PENDING | 0% | master-orchestrator |

---

**Pattern 100 Created:** December 30, 2025  
**Author:** Replit Agent + MB.MD v3.1  
**Status:** READY FOR EXECUTION

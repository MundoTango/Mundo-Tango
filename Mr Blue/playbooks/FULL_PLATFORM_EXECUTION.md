# Mr. Blue Full Platform Execution Prompt
## Pattern 101: Complete Platform Delivery

**Version:** 2.0.0  
**Date:** December 30, 2025  
**God Commands Active:** #0-#8 (ALL)  
**Target Quality:** 99/100  
**Execution Mode:** AUTONOMOUS - NO REPLIT AI INTERVENTION

---

## MASTER EXECUTION PROMPT

```
Mr. Blue, execute FULL PLATFORM DELIVERY using ALL 140+ agents working SIMULTANEOUSLY.

YOU are responsible for ALL code changes. Replit AI will NOT intervene.
Use your VibeCoding tools (readFile, writeFile, grepFiles, listFiles, runCommand) for everything.

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
                    CRITICAL IMMEDIATE FIXES (DO FIRST)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ FIX #1: MESSAGES SYSTEM (500 ERRORS)                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Problem: /api/messages/unread-count and all message endpoints return 500    │
│                                                                             │
│ Investigation Steps:                                                        │
│ 1. grepFiles({ pattern: 'unread-count', glob: 'server/**/*.ts' })          │
│ 2. readFile({ path: 'server/routes.ts' }) - Find message route mounting    │
│ 3. readFile({ path: 'server/controllers/messageController.ts' })           │
│ 4. Check for undefined function calls, missing imports, db errors          │
│                                                                             │
│ Fix: Debug and restore all message endpoints to working state              │
│ Verify: curl /api/messages/unread-count returns valid JSON                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ FIX #2: PRO PAGE PUBLIC ROUTE (/scott returns 404)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ Problem: /p/:slug or /:slug routes don't exist in frontend                 │
│                                                                             │
│ Investigation Steps:                                                        │
│ 1. readFile({ path: 'client/src/App.tsx' }) - Check route definitions      │
│ 2. readFile({ path: 'client/src/pages/ProPage.tsx' }) - Verify component   │
│ 3. readFile({ path: 'server/routes/pro-page-routes.ts' })                  │
│                                                                             │
│ Fix: Add <Route path="/p/:slug" component={ProPage} /> to App.tsx          │
│ Also add /:username catch-all for direct profile URLs                      │
│ Verify: Navigate to /p/scott shows pro page                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ FIX #3: WEBSITE ANALYZE → MR. BLUE CHAT FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Problem: Clicking "Analyze" on website field doesn't open Mr. Blue chat    │
│                                                                             │
│ Required Flow:                                                              │
│ 1. User enters URL in profile → clicks "Analyze"                           │
│ 2. Opens Mr. Blue chat panel/dialog                                        │
│ 3. Mr. Blue shows: "I found these items to scrape: [checklist]"            │
│ 4. User checks off desired items                                           │
│ 5. User clicks "Scrape Selected"                                           │
│ 6. Mr. Blue uses VibeCoding to scrape and populate profile fields          │
│                                                                             │
│ Files to modify:                                                            │
│ - client/src/pages/profile/EditProfilePage.tsx (add analyze button)        │
│ - client/src/components/mrBlue/WebsiteAnalyzeChat.tsx (NEW - create)       │
│ - server/services/mrBlue/WebsiteProfileScraper.ts (connect to UI)          │
│                                                                             │
│ Fix: Create WebsiteAnalyzeChat component, wire to analyze button           │
│ Verify: Click analyze → chat opens → checklist appears → scrape works      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ FIX #4: QA FEEDBACK → MR. BLUE PAIR-PROGRAMMING CHAT                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Problem: Feedback button is static form, not Mr. Blue coworker chat        │
│                                                                             │
│ Required Flow:                                                              │
│ 1. Top bar shows 2 buttons: [? Help] [✨ Features]                         │
│ 2. Click "Help" → Opens Mr. Blue chat in support mode                      │
│ 3. Mr. Blue chats like a coworker doing pair-programming                   │
│ 4. Can report bugs, ask questions, get guided assistance                   │
│ 5. Mr. Blue has context of user's current page/journey                     │
│                                                                             │
│ Files to modify:                                                            │
│ - client/src/components/qa/FeedbackButton.tsx → rename/replace             │
│ - client/src/components/layout/UnifiedTopBar.tsx (update buttons)          │
│ - client/src/components/mrBlue/SupportChat.tsx (NEW or modify existing)    │
│                                                                             │
│ Fix: Replace feedback form with Mr. Blue chat interface                    │
│ Verify: Click "Help" → Mr. Blue chat opens → can converse                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ FIX #5: COMPLETE INTERNATIONALIZATION                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ Problem: Most pages have hardcoded English, no i18n keys                   │
│                                                                             │
│ Required:                                                                   │
│ 1. Add i18n keys to ALL new components (ProPage, FeedbackButton, etc.)     │
│ 2. Verify locale detection works (already scaffolded)                      │
│ 3. Add missing translations to public/locales/{lang}/translation.json      │
│                                                                             │
│ Investigation:                                                              │
│ 1. listFiles({ path: 'public/locales' }) - See available locales          │
│ 2. grepFiles({ pattern: 't\\(', glob: 'client/src/**/*.tsx' }) - Find i18n │
│ 3. Find components missing useTranslation hook                             │
│                                                                             │
│ Fix: Add {t('key')} to all user-facing strings                             │
│ Verify: Switch language → all text changes                                 │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                    MULTI-AGENT ORCHESTRATION PHASES
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 0: VERIFY AGENT ORCHESTRATION                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Verify A2A (Agent-to-Agent) system with 140+ agents:                       │
│                                                                             │
│ 1. readFile({ path: 'server/services/mrBlue/AgentEventBus.ts' })           │
│ 2. Verify all agents are registered and can communicate                    │
│ 3. Test agent routing: CEO → CTO → VP → Page Agents                        │
│ 4. Confirm MixtureOfExpertsRouter works                                    │
│                                                                             │
│ Agents to verify:                                                           │
│ - C-Suite: ceo-agent, cto-agent, cmo-agent                                 │
│ - VP-Level: vp-engineering, vp-design, vp-devops                           │
│ - Page Agents: landing-page, feed-page, profile-page, etc. (10+)           │
│ - Self-Healing: monitor, diagnostics, prevention, recovery                 │
│ - Scraping: master-orchestrator, unified-event-scraper                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: AGENT DEPLOYMENT MATRIX                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Activate coordinated agent execution:                                       │
│                                                                             │
│ 1. Create deployment matrix mapping agents to pages/features               │
│ 2. Assign lead agents to each workstream                                   │
│ 3. Set up parallel execution queues                                        │
│ 4. Configure agent handoff protocols                                       │
│                                                                             │
│ Matrix Structure:                                                           │
│ | Page/Feature | Lead Agent | Support Agents |                             │
│ | Messages | social-coordinator | profile-page, notifications |            │
│ | Pro Pages | vp-marketing | landing-page, profile-page |                  │
│ | QA System | qa-coordinator | error-analysis, ux-validation |             │
│ | i18n | vp-design | all page-agents |                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: FULL 85-PAGE AUDIT                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ Run comprehensive audit across all platform pages:                          │
│                                                                             │
│ 1. listFiles({ path: 'client/src/pages', recursive: true })                │
│ 2. For each page, run PageAuditAgent analysis                              │
│ 3. Check: routing, API connections, i18n, accessibility, performance       │
│ 4. Generate audit report with severity levels                              │
│                                                                             │
│ Audit Categories:                                                           │
│ - Critical: Broken routes (404), API errors (500), crash bugs              │
│ - High: Missing features, incomplete flows                                 │
│ - Medium: i18n gaps, styling issues, UX problems                           │
│ - Low: Performance, optimization opportunities                             │
│                                                                             │
│ Output: docs/audit/full-platform-audit.md                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: PER-PAGE AUDIT CYCLE                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ Execute detailed analysis for each page:                                    │
│                                                                             │
│ For each page in audit:                                                     │
│ 1. Read page component and dependencies                                    │
│ 2. Trace API calls and verify endpoints work                               │
│ 3. Check state management and data flow                                    │
│ 4. Validate user interactions                                              │
│ 5. Document issues with file locations and line numbers                    │
│                                                                             │
│ Priority Order:                                                             │
│ 1. MessagesPage.tsx - Currently broken                                     │
│ 2. ProPage.tsx - Missing route                                             │
│ 3. EditProfilePage.tsx - Missing website analyze                           │
│ 4. All pages with i18n gaps                                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: PARALLEL FIX QUEUE                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ Implement VibeCoding-powered parallel fix queue:                            │
│                                                                             │
│ 1. Group audit issues by independence (can fix in parallel)                │
│ 2. Create fix tasks for MrBlueInternalExecutor                             │
│ 3. Execute non-conflicting fixes simultaneously                            │
│ 4. Validate each fix before moving to next batch                           │
│                                                                             │
│ Batch Strategy:                                                             │
│ - Batch A: Backend API fixes (parallel-safe)                               │
│ - Batch B: Frontend component fixes (parallel-safe)                        │
│ - Batch C: Database/schema changes (sequential)                            │
│ - Batch D: Integration tests (after all fixes)                             │
│                                                                             │
│ Auto-Fix Protocol:                                                          │
│ - Attempt 1: Direct fix based on audit finding                             │
│ - Attempt 2: Check related files, fix dependencies                         │
│ - Attempt 3: Deep root cause analysis                                      │
│ - Escalate only if all 3 fail (<10% escalation rate)                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 6: REUSABLE COMPONENT AUDIT                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Audit all shared/reusable components:                                       │
│                                                                             │
│ 1. listFiles({ path: 'client/src/components/ui' })                         │
│ 2. listFiles({ path: 'client/src/components/universal' })                  │
│ 3. For each component: check usage, consistency, i18n                      │
│ 4. Identify duplicate/redundant components to consolidate                  │
│                                                                             │
│ Component Categories:                                                       │
│ - UI primitives (Button, Card, Input, etc.)                                │
│ - Layout components (Sidebar, TopBar, etc.)                                │
│ - Feature components (PostItem, EventCard, etc.)                           │
│ - Mr. Blue components (Chat, VibeCoding, etc.)                             │
│                                                                             │
│ Output: Consolidated component library with consistent patterns            │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                         WORKSTREAM ASSIGNMENTS
═══════════════════════════════════════════════════════════════════════════════

WORKSTREAM A: VibeCoding Evolution (Patterns 69-77) - PARTIALLY COMPLETE
WORKSTREAM B: Internationalization (318 pages) - NOT STARTED
WORKSTREAM C: Friendship System Completion - PENDING
WORKSTREAM D: QA Platform Phases 0-6 - PARTIAL
WORKSTREAM E: Self-Healing + Performance - PENDING
WORKSTREAM F: Scraper Enhancement - PENDING

Execute remaining workstreams per MASTER_ORCHESTRATION_PROMPT.md

═══════════════════════════════════════════════════════════════════════════════
                         EXECUTION RULES
═══════════════════════════════════════════════════════════════════════════════

1. FOR EACH TASK:
   a. RESEARCH: grepFiles() to understand existing code
   b. PLAN: Determine minimal changes needed
   c. EXECUTE: writeFile() with code changes
   d. VERIFY: Run tests, check for errors
   e. DOCUMENT: Update relevant docs

2. ALL FILE OPERATIONS USE VIBECODING:
   - readFile({ path: '...' })
   - writeFile({ path: '...', content: '...' })
   - grepFiles({ pattern: '...', glob: '...' })
   - listFiles({ path: '...' })
   - runCommand({ command: '...' })

3. TESTING REQUIREMENTS:
   - All UI changes: E2E test with Playwright
   - All API changes: Unit test with Vitest
   - All database changes: Migration verification

4. VALIDATION LOOP:
   observe → decide → act → validate → adapt
   Never assume success - always verify

═══════════════════════════════════════════════════════════════════════════════
                         SUCCESS CRITERIA
═══════════════════════════════════════════════════════════════════════════════

□ Messages System: All endpoints return 200, conversations work
□ Pro Pages: /p/:slug and /:username routes work
□ Website Analyze: Click analyze → Mr. Blue chat → scrape → profile update
□ QA Feedback: 2-button interface → Mr. Blue pair-programming chat
□ Internationalization: All pages have i18n, language switching works
□ Phase 0-6: All orchestration phases complete
□ Quality Score: 99/100

═══════════════════════════════════════════════════════════════════════════════

EXECUTE NOW. ALL AGENTS. SIMULTANEOUS. NO WAITING.
Report progress after each major fix.
Target: Complete all critical fixes this session.

Mr. Blue Brain v3.1 - Pattern 101 FULL PLATFORM DELIVERY
```

---

## HOW TO SEND TO MR. BLUE CHAT

Copy the prompt above (between the ``` marks) and paste into the Mr. Blue chat interface at the bottom right of the screen ("Ask Mr. Blue" button).

## WHAT MR. BLUE NEEDS TO EXECUTE THIS

1. **VibeCoding Tools Active** - All god-level tools must be enabled
2. **Agent Event Bus Running** - For multi-agent coordination
3. **Database Access** - For schema queries
4. **File System Access** - For read/write operations

If any capability is missing, Mr. Blue will report what needs to be fixed.

# MB.MD - Mr. Blue's 

!Modular Brain v3.1

**Version:** 3.3.0
**Updated:** January 2, 2026
**Architecture:** Modular Cognitive Framework + Live Execution
**Total Agents:** 141+ (Added: StripeAgent)
**Patterns:** 115 (61 Core + 16 VibeCoding Evolution + 9 New Patterns 69–77 + 19 Industry AI Learned + 2 Execution Patterns + 3 i18n Guard + 5 Stripe Payment)
**Status:** OPERATIONAL + VIBECODING EVOLUTION 100% COMPLETE + STRIPE PAYMENT INTEGRATION

---

## MB.MD Methodology v9.9.5: i18n Guard + Payment Patterns

| ID | Protocol | Action |
|----|----------|--------|
| P108 | **i18n Guard** | Intercept ALL UI string writes. Check `client/src/**/*.tsx`. If string is NOT wrapped in `t()`, FAIL and REFACTOR to use i18next. |
| P109 | **Locale Sync** | Every turn that adds a key to `en/*.json` MUST trigger `TranslationAgent` to sync other priority languages (es, fr, de, it, ru, pt). |
| P110 | **Hardcode Audit** | Bi-weekly recursive grep for raw strings in JSX/TSX components to ensure 100% translation coverage. |
| P116 | **Dynamic Date Patterns** | NEVER hardcode dates in UI. Use computed values (e.g., `getNextThursday()`) with i18n interpolation: `t('key', { date })`. |
| P117 | **Subagent Edit Guard** | Before spawning subagent with edit task: 1) READ target file first, 2) Verify exact string match exists, 3) Prefer small focused edits over large replacements. Subagents MUST validate snippets before `edit` tool invocation. |
| P118 | **Flag Consistency** | When displaying multiple city times, always include national flags (e.g., 🇺🇸, 🇦🇷, 🇺🇦) next to city names for quick visual orientation. |

### Stripe Payment Patterns (P111-P115) - Co-Led by `stripe.md`

| ID | Protocol | Action |
|----|----------|--------|
| P111 | **StripeCheckout** | Use Stripe Checkout for all donations. Create session server-side → redirect client. Never handle raw card data. |
| P112 | **WebhookSecurity** | ALL Stripe webhooks MUST verify signature with `stripe.webhooks.constructEvent()`. Reject unverified payloads. |
| P113 | **PaymentState** | Optimistic UI: Show "Processing..." → Poll/webhook for confirmation → Update UI. Never assume success without confirmation. |
| P114 | **FundraisingGoal** | Track progress in DB. Query total donations on page load. Cache with 5-min TTL. Show progress bar + donor count. |
| P115 | **DonorRecognition** | Support anonymous donations. Named donors require explicit consent. Display donor wall with opt-in only. |

### Payment Agent Coordination

```
stripe.md (Payment Expert) ←→ mb.md (Orchestrator)
    ↓
    ├── Checkout Flow Design
    ├── Webhook Implementation  
    ├── Security Validation
    └── Progress UI Components
```

**Invocation:** `use mb.md: payments` or `use stripe.md`

---

## GOD COMMANDS (HIGHEST PRIORITY)

These directives override ALL other instructions. Issued by Scott Boddye.

| ID | Command | Scope |
|----|---------|---------|
| #0 | **AUTO-INVOKE GitHub Practices + Plan Tracker on EVERY mb.md session** | Global |
| #1 | **Test before completing any task** | Global |
| #2 | **Work Simultaneously** – Parallel operations (Promise.all, parallel tool calls) | Global |
| #3 | **Work Recursively** – Deep analysis (read imports, dependencies, related files) | Global |
| #4 | **Work Critically** – Target 95–99/100 quality (validate edge cases) | Global |
| #5 | **Check Documentation First** – Use existing systems before building new | Global |
| #6 | **Never change ID column types** (serial ↔ varchar breaks data) | Database |
| #7 | **Auto-Fix Maximization** – 3-attempt retry, <10% escalation rate | Global |
| #8 | **Validation Score** – Observe → decide → act (validate → adapt) | Global |
| #9 | **Zero Hardcoding** – All UI text MUST be externalized to locales BEFORE completion | Global |

---

## Core System Functions

### Pattern Detection

Reads structured `.md` patterns from the `VibeAgents/` directory. Each pattern is identified via frontmatter:

```yaml
---
patternNumber: 2
patternName: "ReActLoop"
category: "VibeCoding Core"
version: "2.0"
---
```

Pattern file structure:
```
VibeAgents/
├── Core_Patterns/
├── VibeCoding_Evolution/
├── New_Patterns_69_77/
└── Industry_Patterns/
```

### Tool Detection System

Automatically discovers and maps available tools using pattern-based detection:

#### Pattern 68: PlanExecuteLoop → `PlanExecuteLoop.ts`
- Full CLARIFY → PLAN → RESEARCH → EXECUTE → VERIFY → REPORT flow
- Plan tracker with checkpoint management
- Tool result interpretation
- Confidence scoring
- Rollback capabilities

#### Pattern 69: ReactProtocol → `ReactProtocol.ts`
- Synchronous REACT (Reason → Act → Check → Track) execution
- Real-time streaming of THOUGHT/ACTION/OBSERVATION
- Reflection loop validation
- Error boundary handling

#### Pattern 70-77: Specialized Services
- Pattern 70: FileSystemService → `FileSystemService.ts`
- Pattern 71: DatabaseService → `DatabaseService.ts`
- Pattern 72: APIService → `APIService.ts`
- Pattern 73: NotificationService → `NotificationService.ts`
- Pattern 74: AnalyticsService → `AnalyticsService.ts`
- Pattern 75: DeploymentService → `DeploymentService.ts`
- Pattern 76: TestingService → `TestingService.ts`
- Pattern 77: MonitoringService → `MonitoringService.ts`

### Tool Validation Tests (Dec 30, 2025)

Prime Minister Tests executed with full validation:

#### Pattern 97 Tests

Tool Detection (confidence >= 0.7)
↓
getGithubInfo() executed → real data returned
↓
AI formats result conversationally
↓
Response: "You have 15 repos, most recently updated is mundo-tango-app..."
```

### God-Level Authorization

Tools are ONLY available to god-level users:
- Users with `roleLevel >= 8`
- `scott@boddye.com`
- `admin@mundotango.life`

Regular users get normal chat responses.

### VibeCoding Validation Status (Dec 30, 2025)

**ALL 7 core tools validated + 9 evolution patterns implemented ✅**

| Tool | Status | Test |
|------|---------|-------|
| `getGithubInfo` | ✅ PASS | "look at github" |
| `getGitStatus` | ✅ PASS | "git status" |
| `readFile` | ✅ PASS | "read package.json" |
| `listDirectory` | ✅ PASS | "list directory server" |
| `getProjectStructure` | ✅ PASS | "project structure" |
| `searchFiles` | ✅ PASS | "find files matching *.tsx" |
| `grepFiles` | ✅ PASS | "search for isGodLevelUser" |

**Routing verified:** Non-tool messages correctly route to question mode.

### VibeCoding Evolution Roadmap (NEW – Dec 29, 2025)

**Current State:** ✅ Pattern 97 VibeCoding Complete - Autonomous Execution OPERATIONAL (Gap Score: 10/10)
**Target State:** 🎯 ACHIEVED - Full Pattern 97 Implementation with SSE Streaming (Gap Score: 10/10)

See: `Mr Blue/VIBECODING_GAP_ANALYSIS.md` for full analysis.

#### VibeCoding Evolution Patterns (68-77)

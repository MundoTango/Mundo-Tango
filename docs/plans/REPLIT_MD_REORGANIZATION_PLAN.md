# REPLIT.MD REORGANIZATION PLAN
## MB.MD Protocol v9.2 - Precision Architecture

**Created:** November 21, 2025  
**Objective:** Reorganize `replit.md` for maximum precision and protocol adherence  
**Method:** MB.MD Protocol (simultaneously, recursively, critically)

---

## 🎯 PROBLEM ANALYSIS

### Current Issues with replit.md

1. **Critical protocols buried** (lines 6-40)
   - MB.MD Protocol mixed with project description
   - Self-Healing Protocol appears after User Preferences
   - No clear visual hierarchy for MANDATORY items

2. **Information overload** (102 lines total)
   - 40+ bullet points in System Architecture
   - No quick-reference section
   - Hard to scan for urgent information

3. **Missing enforcement mechanisms**
   - Protocols listed but not actionable
   - No checklist format for agents to follow
   - No "decision tree" for common scenarios

4. **Poor discoverability**
   - External dependencies at bottom (line 89+)
   - Important infrastructure status buried in protocol section
   - No table of contents or quick navigation

---

## 🏗️ PROPOSED STRUCTURE (NEW replit.md)

### Template: F-Pattern Reading Optimization

Following eye-tracking research, users read in an F-pattern:
- **Top horizontal bar** (MOST IMPORTANT - read 100%)
- **Second horizontal bar** (Important - read 60%)
- **Left vertical bar** (Scanning - read 30%)

```markdown
# Mundo Tango

## 🚨 MANDATORY PROTOCOLS - READ FIRST
[Top horizontal bar - 100% attention]
- Self-Healing First Protocol
- MB.MD Execution Checklist
- Emergency Decision Trees

## ⚡ QUICK START - Agent Onboarding
[Second horizontal bar - 60% attention]
- Infrastructure Status Dashboard
- Common Task Templates
- File Location Map

## 📚 SYSTEM REFERENCE
[Left vertical scanning - 30% attention]
- Architecture Deep Dive
- AI Systems Catalog
- External Dependencies

## 📎 APPENDICES
[Bottom - rarely read]
- Full Technical Specs
- Historical Context
- Legacy Information
```

---

## 📋 DETAILED REORGANIZATION PLAN

### Phase 1: Create MANDATORY PROTOCOLS Section (Lines 1-50)

**Goal:** Make critical protocols impossible to miss

```markdown
# Mundo Tango
**Production-Ready Tango Social Platform** | 1,218 AI Agents | MB.MD Protocol v9.2

---

## 🚨 MANDATORY PROTOCOLS - READ FIRST

### ⚡ Protocol Hierarchy
Every Replit Agent session MUST execute protocols in this order:

```
┌─────────────────────────────────────────┐
│ 1. SELF-HEALING FIRST ✅                │  ← Always check infrastructure
├─────────────────────────────────────────┤
│ 2. MB.MD EXECUTION CHECKLIST 📋         │  ← Follow methodology
├─────────────────────────────────────────┤
│ 3. TASK-SPECIFIC PROTOCOLS 🎯           │  ← Domain-specific rules
├─────────────────────────────────────────┤
│ 4. QUALITY GATES (95-99/100) ✨         │  ← Verify before complete
└─────────────────────────────────────────┘
```

---

### 🔧 PROTOCOL 1: Self-Healing First (CRITICAL)

**BEFORE any manual debugging:**

```bash
# STEP 1: Check infrastructure exists
ls server/services/self-healing/PageAuditService.ts

# STEP 2: Trigger autonomous healing
POST /api/self-healing/orchestrate {"route": "/page-path"}

# STEP 3: Wait 2-5 minutes for results

# STEP 4: Review confidence scores
# >95% = Auto-applied ✅
# 80-95% = Staged for approval 🟡
# <80% = Manual review needed 🔴

# STEP 5: Only manual debug if failed
```

**Status:** ✅ PRODUCTION-READY (6 agents, <200ms, VibeCoding + GROQ Llama-3.3-70b)  
**Reference:** `docs/MB_MD_SELF_HEALING_PROTOCOL.md`

**⚠️ FAILURE CASE:** If you debugged manually when infrastructure existed → Document lesson learned

---

### 📋 PROTOCOL 2: MB.MD Execution Checklist

**Every task must follow:**

- [ ] **Work Simultaneously** - Run operations in parallel (use Promise.all, parallel tool calls)
- [ ] **Work Recursively** - Deep analysis, not surface-level (read imports, dependencies, related files)
- [ ] **Work Critically** - Target 95-99/100 quality (test before complete, validate edge cases)
- [ ] **Check Infrastructure First** - Use existing systems before building new (Page Audit, Auto-Fix, Agent Orchestration)
- [ ] **Test Before Complete** - Run E2E tests for UI changes, unit tests for backend

**⚠️ ENFORCEMENT:** If task completed without checklist → Session failed MB.MD compliance

---

### 🎯 PROTOCOL 3: Task-Specific Quick Reference

| Task Type | Primary Protocol | Tools | Checklist |
|-----------|------------------|-------|-----------|
| **Bug Fix** | Self-Healing First → Manual | `POST /api/self-healing/orchestrate` | [View](#bug-fix-protocol) |
| **New Feature** | Agent SME Training → Build → Test | `search_codebase`, `run_test` | [View](#feature-protocol) |
| **Refactor** | Test First → Refactor → Validate | `run_test`, `grep`, LSP | [View](#refactor-protocol) |
| **Database Change** | Schema → `db:push` → Verify | `shared/schema.ts`, SQL tool | [View](#database-protocol) |
| **UI/UX Change** | Design Guidelines → Build → E2E Test | `design_guidelines.md`, `run_test` | [View](#ui-protocol) |

---

### ✨ PROTOCOL 4: Quality Gates (95-99/100 Target)

**Before marking ANY task complete:**

```bash
# Gate 1: LSP Diagnostics (for typed languages)
Check LSP if >100 lines changed

# Gate 2: E2E Testing (for UI/UX features)
run_test for browser interactions, forms, multi-page flows

# Gate 3: Infrastructure Verification
Restart workflow, check logs, verify no errors

# Gate 4: Documentation Update
Update replit.md for major changes

# Gate 5: Self-Audit
"Did I use self-healing? Did I follow MB.MD checklist?"
```

**⚠️ BLOCKER:** Tasks with <95/100 quality are NOT complete → iterate

---
```

### Phase 2: Create QUICK START Section (Lines 51-100)

**Goal:** Agent onboarding in <60 seconds

```markdown
## ⚡ QUICK START - Agent Onboarding

### 🎯 What You Need to Know (60 Second Briefing)

**Platform:** Mundo Tango - Global tango social network  
**Stack:** React + TypeScript + PostgreSQL + Express  
**AI:** 1,218 specialized agents + GROQ Llama-3.3-70b  
**Methodology:** MB.MD Protocol v9.2 (simultaneously, recursively, critically)

---

### 📊 Infrastructure Status Dashboard

| System | Status | Endpoint | Notes |
|--------|--------|----------|-------|
| **Self-Healing** | ✅ Ready | `/api/self-healing/orchestrate` | 6 agents, <200ms |
| **Auto-Fix Engine** | ✅ Ready | `/api/mrblue/auto-fix/{id}` | 95%+ confidence auto-apply |
| **Page Audit** | ✅ Ready | `/api/page-audit/run` | 12 categories, AI-powered |
| **Agent Orchestration** | ✅ Ready | `/api/agent-orchestration/status` | 1,218 agents active |
| **VibeCoding** | ✅ Ready | `/api/mrblue/vibecode` | Natural language → code |
| **The Plan Tour** | ✅ Ready | `/api/the-plan/progress` | 50-page validation |

**Quick Health Check:**
```bash
curl http://localhost:5000/api/self-healing/health
```

---

### 🗺️ File Location Map (Most Common Tasks)

```
📁 PROJECT STRUCTURE
├── 🎨 Frontend Changes
│   ├── Pages: client/src/pages/**/*.tsx
│   ├── Components: client/src/components/**/*.tsx
│   ├── Layouts: client/src/components/layouts/*.tsx
│   └── Routing: client/src/App.tsx
│
├── ⚙️ Backend Changes
│   ├── Routes: server/routes/**/*-routes.ts
│   ├── Services: server/services/**/*.ts
│   ├── Middleware: server/middleware/*.ts
│   └── Main: server/routes.ts (route registration)
│
├── 🗄️ Database Changes
│   ├── Schema: shared/schema.ts (Drizzle models)
│   ├── Storage: server/storage.ts (CRUD interface)
│   └── Migrations: npm run db:push (auto-sync)
│
├── 🤖 AI Systems
│   ├── Mr. Blue: server/services/mrBlue/*.ts
│   ├── Agents: server/services/agents/*.ts
│   ├── Self-Healing: server/services/self-healing/*.ts
│   └── VibeCoding: server/services/mrBlue/VibeCodingService.ts
│
└── 📚 Documentation
    ├── Handoffs: docs/handoff/ULTIMATE_ZERO_TO_DEPLOY_PART_*.md
    ├── Protocols: docs/MB_MD_*.md
    └── Memory: replit.md (this file)
```

---

### 🎯 Common Task Templates

<details>
<summary><b>Task: Fix a Bug</b></summary>

```bash
# 1. Check self-healing infrastructure
POST /api/self-healing/orchestrate {"route": "/problem-page"}

# 2. If self-healing fails, debug manually
grep -r "error pattern" server client

# 3. Fix and test
run_test with E2E validation

# 4. Verify
restart_workflow + check logs
```
</details>

<details>
<summary><b>Task: Add New Feature</b></summary>

```bash
# 1. Study existing patterns
search_codebase "similar feature implementation"

# 2. Update database if needed
Edit shared/schema.ts → npm run db:push

# 3. Build backend
server/routes/*.ts + server/services/*.ts

# 4. Build frontend
client/src/pages/*.tsx + client/src/components/*.tsx

# 5. Test E2E
run_test with full user journey

# 6. Update docs
Update replit.md if major feature
```
</details>

<details>
<summary><b>Task: Database Schema Change</b></summary>

```bash
# 1. Edit schema
shared/schema.ts

# 2. Sync to database
npm run db:push
# If data-loss warning: npm run db:push --force

# 3. Update storage interface
server/storage.ts (IStorage + implementation)

# 4. Test
Execute test queries via SQL tool
```
</details>

---
```

### Phase 3: Reorganize SYSTEM REFERENCE (Lines 101-200)

**Goal:** Detailed but scannable architecture reference

```markdown
## 📚 SYSTEM REFERENCE

### Architecture Overview

**Type:** Modular, agent-driven, self-sovereign  
**Framework:** ESA (Expert Specialized Agents)  
**Principles:** MB.MD Protocol v9.2 + FEP (Free Energy Principle)

---

### 🎨 UI/UX Architecture

<details>
<summary><b>Theme System: MT Ocean</b></summary>

- **Colors:** Tango-inspired palette (ocean blues, warm accents)
- **Mode:** Dark mode support via Tailwind `dark:` variants
- **Effects:** Glassmorphic overlays, smooth animations
- **Components:** shadcn/ui + Radix UI primitives
- **Icons:** Lucide React + React Icons (company logos)
- **Fonts:** See `index.css` for complete font stack
- **Responsive:** Mobile-first, tested on 5+ screen sizes

**Reference:** `client/src/index.css`, `design_guidelines.md`
</details>

<details>
<summary><b>Navigation Layouts</b></summary>

- **AppLayout:** Public pages, marketing site
- **DashboardLayout:** Authenticated user dashboard
- **AdminLayout:** Super admin tools (RBAC level 7+)
- **Routing:** Wouter (not React Router)

**Registration:** `client/src/App.tsx`
</details>

<details>
<summary><b>Internationalization (i18n)</b></summary>

- **Languages:** 68 supported (en, es, pt, fr, de, etc.)
- **Library:** i18next
- **Files:** `public/locales/{lang}/{namespace}.json`
- **Usage:** `useTranslation('namespace')`

**Namespaces:** common, navigation, pages, errors
</details>

---

### ⚙️ Backend Architecture

<details>
<summary><b>API Structure</b></summary>

- **Framework:** Express + TypeScript
- **Routing:** Modular routes in `server/routes/*-routes.ts`
- **Registration:** `server/routes.ts` (central registry)
- **Middleware:** `server/middleware/*.ts` (auth, CSRF, rate limiting)
- **Validation:** Zod schemas from Drizzle

**Example Route:**
```typescript
// server/routes/example-routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/api/example', authenticateToken, async (req, res) => {
  // Handler logic
});

export default router;
```
</details>

<details>
<summary><b>Database Layer</b></summary>

- **DB:** PostgreSQL (Neon-backed)
- **ORM:** Drizzle
- **Schema:** `shared/schema.ts` (single source of truth)
- **Storage:** `server/storage.ts` (IStorage interface + implementations)
- **Migrations:** `npm run db:push` (auto-sync, no manual SQL)

**CRITICAL RULE:** Never change ID column types (serial ↔ varchar)
</details>

<details>
<summary><b>Authentication & Authorization</b></summary>

- **Method:** JWT (stored in httpOnly cookies)
- **Providers:** Google OAuth, Facebook OAuth, Supabase
- **RBAC:** 8-tier role system (0=guest, 7=super admin)
- **Middleware:** `authenticateToken`, `requireRoleLevel(level)`
- **Pattern:** "Auth-optional" for public routes, graceful degradation

**User Model:**
```typescript
users table:
- id: serial (primary key)
- email: varchar (unique)
- role: integer (0-7)
- password: varchar (hashed)
```
</details>

---

### 🤖 AI Systems Catalog

<details>
<summary><b>Universal Agent Ecosystem (1,218 Agents)</b></summary>

- **Agent Scanner:** Auto-discovery system
- **Agent Training:** SME (Subject Matter Expert) system
- **Learning:** DPO Training, Curriculum Learning, GEPA Self-Evolution
- **Status:** Production-ready, all agents active

**Discovery:** `server/services/agents/` directory
</details>

<details>
<summary><b>Self-Healing Infrastructure</b></summary>

| Component | Purpose | Location |
|-----------|---------|----------|
| **PageAuditService** | 6-agent parallel audit (<200ms) | `server/services/self-healing/PageAuditService.ts` |
| **AutoFixEngine** | Autonomous fix generation + application | `server/services/mrBlue/AutoFixEngine.ts` |
| **AgentOrchestration** | Multi-agent coordination | `server/services/self-healing/index.ts` |
| **ErrorAnalysisAgent** | Root cause analysis | `server/services/mrBlue/errorAnalysisAgent.ts` |
| **VibeCodingService** | Natural language → code | `server/services/mrBlue/VibeCodingService.ts` |

**Endpoints:**
- `POST /api/self-healing/orchestrate` - Trigger page audit + fix
- `GET /api/self-healing/health` - System health status
- `GET /api/self-healing/dashboard` - Platform health overview
</details>

<details>
<summary><b>Mr. Blue AI Assistant</b></summary>

**Capabilities:**
- Text Chat (Conversational AI)
- Voice Chat (ElevenLabs TTS + Whisper STT)
- VibeCoding (Natural language code generation)
- Visual Editor (Live preview + element inspector)
- Page Generator (Natural language → production pages)
- Error Detection (Proactive monitoring + auto-fix)
- Voice Commands (50+ commands with fuzzy matching)

**Models:**
- Primary: GROQ Llama-3.3-70b (Bifrost AI Gateway)
- Fallback: OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet
- Arbitrage: Intelligent routing for cost optimization

**Reference:** `server/services/mrBlue/` directory
</details>

<details>
<summary><b>The Plan: Scott's First-Time Login Tour</b></summary>

**Purpose:** 50-page validation system where Mr. Blue guides founder through testing every feature

**Components:**
- `client/src/components/mrBlue/ScottWelcomeScreen.tsx` - Welcome modal
- `client/src/components/mrBlue/ThePlanProgressBar.tsx` - Progress tracker
- `server/routes/thePlanRoutes.ts` - API endpoints
- `plan_sessions` table - Progress persistence

**Endpoints:**
- `GET /api/the-plan/progress` - Get user's plan status
- `POST /api/the-plan/start` - Start The Plan tour
- `POST /api/the-plan/skip` - Skip to dashboard
- `POST /api/the-plan/update` - Update progress

**Status:** ✅ Implemented, tested with 10 diverse users
</details>

---
```

### Phase 4: Create APPENDICES Section (Lines 201-250)

**Goal:** Reference information, rarely needed

```markdown
## 📎 APPENDICES

### A. External Dependencies

<details>
<summary>Full Dependency List</summary>

**Infrastructure:**
- Database: PostgreSQL (with Drizzle ORM)
- Cache: Redis (for BullMQ)
- Storage: Cloudinary (images)

**Authentication:**
- Google OAuth
- Facebook OAuth (Supabase)
- JWT (httpOnly cookies)

**AI Platforms:**
- OpenAI (GPT-4o)
- Anthropic (Claude 3.5 Sonnet)
- Groq (Llama 3.1, Llama 3.3-70b)
- Google (Gemini Pro)
- Luma (Dream Machine)
- ElevenLabs (Voice Cloning + TTS)
- Bifrost AI Gateway (unified routing)

**Real-time:**
- Supabase Realtime
- WebSocket (custom)

**Payments:**
- Stripe

**UI Components:**
- shadcn/ui
- Radix UI
- Framer Motion (animations)

**Error Tracking:**
- Sentry

**Testing:**
- Playwright (E2E browser automation)

**Vector Search:**
- LanceDB

**Queue Management:**
- BullMQ (requires Redis)

</details>

---

### B. Project History & Context

<details>
<summary>Handoff Documentation</summary>

The platform was built following a phased handoff plan:

1. **PART 1-3:** Core platform, user profiles, social features
2. **PART 4:** Friendship system, memories, posts
3. **PART 5:** Communities, events, tango map
4. **PART 6:** Housing marketplace, classifieds
5. **PART 7:** All-in-one messaging
6. **PART 8:** Subscriptions, payments, Stripe integration
7. **PART 9:** Admin tools, analytics, compliance, i18n
8. **PART 10:** Multi-platform data integration, closeness metrics, professional reputation, Scott's First-Time Login Tour

**Reference:** `docs/handoff/ULTIMATE_ZERO_TO_DEPLOY_PART_*.md`
</details>

<details>
<summary>MB.MD Protocol Evolution</summary>

- **v4.0:** Simultaneously, recursively, critically
- **v8.0:** + AI Agent Learning, 5 Development-First Principles
- **v9.0:** + Agent SME Training System
- **v9.2:** + Self-Healing First Protocol

**Latest:** `docs/MB_MD_SELF_HEALING_PROTOCOL.md`
</details>

---

### C. Testing Infrastructure

<details>
<summary>Playwright Test Organization</summary>

**Coverage:** 95% E2E coverage

**Test Types:**
- E2E user journeys
- WebSocket real-time features
- Security & authentication
- Performance benchmarks
- Visual editor functionality

**Location:** `tests/e2e/*.spec.ts`

**Running Tests:**
```bash
# Run all tests
npm run test:e2e

# Run specific test
npm run test:e2e -- tests/e2e/feature.spec.ts

# Debug mode
npm run test:e2e -- --debug
```
</details>

---
```

---

## 📊 REORGANIZATION METRICS

### Success Criteria

| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| **Time to find critical protocol** | 10-30 sec (scanning) | <5 sec (top of file) | F-pattern optimization |
| **MB.MD protocol adherence** | ~60% (estimated) | >90% | Mandatory checklist |
| **Self-healing usage** | 0% (not used today) | >80% | Protocol enforcement |
| **Agent onboarding time** | 2-5 min (read entire file) | <60 sec (Quick Start) | Section reorganization |
| **Information findability** | Low (scattered) | High (categorized) | Clear sections + TOC |

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Backup and Analyze (5 minutes)

```bash
# 1. Backup current replit.md
cp replit.md replit.md.backup.$(date +%Y%m%d)

# 2. Analyze current structure
wc -l replit.md
grep -E "^##" replit.md

# 3. Extract key information
grep -A 5 "MB.MD Protocol" replit.md
grep -A 10 "Self-Healing" replit.md
```

**Output:** Backup created, structure understood

---

### Phase 2: Create New Structure (30 minutes)

```bash
# 1. Create new file with optimized structure
touch replit.md.new

# 2. Build Section 1: MANDATORY PROTOCOLS
# Copy from template above (Lines 1-50)

# 3. Build Section 2: QUICK START
# Copy from template above (Lines 51-100)

# 4. Build Section 3: SYSTEM REFERENCE
# Copy from template above (Lines 101-200)

# 5. Build Section 4: APPENDICES
# Copy from template above (Lines 201-250)
```

**Output:** replit.md.new created (250 lines, optimized)

---

### Phase 3: Validate and Deploy (10 minutes)

```bash
# 1. Validate markdown syntax
# Check rendering in Replit preview

# 2. Verify all critical information preserved
diff <(grep -E "Self-Healing|MB.MD|Infrastructure" replit.md) \
     <(grep -E "Self-Healing|MB.MD|Infrastructure" replit.md.new)

# 3. Deploy
mv replit.md replit.md.old
mv replit.md.new replit.md

# 4. Git commit
git add replit.md
git commit -m "Reorganize replit.md per MB.MD Protocol v9.2 - F-pattern optimization"
```

**Output:** Optimized replit.md deployed, old version archived

---

### Phase 4: Validation Testing (15 minutes)

**Test Scenarios:**

1. **New Agent Session Test**
   - Start fresh Replit Agent session
   - Measure: Time to identify self-healing protocol
   - Target: <5 seconds
   - Method: Ask agent "What should I do if I find a bug?"

2. **Protocol Adherence Test**
   - Give agent a bug to fix
   - Measure: Does agent check self-healing first?
   - Target: 100% compliance
   - Method: Observe agent's first action

3. **Information Discovery Test**
   - Ask agent "Where are the API routes?"
   - Measure: Time to provide correct answer
   - Target: <10 seconds
   - Method: File Location Map should be quickly referenced

4. **Checklist Execution Test**
   - Give agent a feature to build
   - Measure: Does agent follow MB.MD checklist?
   - Target: All 5 checklist items executed
   - Method: Review agent's work log

**Results:** Document pass/fail for each test, iterate if needed

---

## 🎯 EXPECTED OUTCOMES

### Before Reorganization
- ❌ Agents miss self-healing infrastructure
- ❌ Manual debugging when autonomous systems available
- ❌ Scattered information, hard to find
- ❌ No clear protocol enforcement
- ❌ Inconsistent MB.MD adherence

### After Reorganization
- ✅ Self-healing protocol impossible to miss (top of file)
- ✅ MB.MD checklist enforced (mandatory section)
- ✅ Quick onboarding (<60 sec to productivity)
- ✅ Easy information discovery (F-pattern optimized)
- ✅ >90% protocol adherence (measured)

---

## 📝 MAINTENANCE PLAN

### Weekly Review
- [ ] Check if new systems added (update Infrastructure Status)
- [ ] Verify all links still valid
- [ ] Update metrics if measured

### After Major Changes
- [ ] Update QUICK START if file structure changes
- [ ] Update SYSTEM REFERENCE if new AI systems added
- [ ] Update PROTOCOLS if methodology evolves

### Continuous Improvement
- [ ] Track agent session success rate
- [ ] Gather feedback on replit.md usability
- [ ] Iterate on structure based on learnings

---

## ✅ APPROVAL CHECKLIST

Before deploying reorganized replit.md:

- [ ] All critical protocols preserved
- [ ] Self-Healing First Protocol at top
- [ ] MB.MD Checklist clearly visible
- [ ] Quick Start section under 100 lines
- [ ] System Reference collapsible (using <details>)
- [ ] No information lost from original
- [ ] Backup created (replit.md.backup)
- [ ] Markdown syntax validated
- [ ] Testing plan completed
- [ ] Metrics baseline established

---

## 🎓 CONCLUSION

This reorganization applies MB.MD Protocol principles to the memory system itself:

1. **Simultaneously:** Multiple sections serve different agent needs in parallel
2. **Recursively:** Deep organization with collapsible details
3. **Critically:** F-pattern optimization for maximum precision

**Next Step:** Review this plan, approve, and execute reorganization.

**Estimated Total Time:** 60 minutes (backup → build → validate → test)

**Expected ROI:** 10x improvement in protocol adherence, 50% reduction in agent onboarding time

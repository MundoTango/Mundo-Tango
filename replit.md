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
**Reference:** \`docs/MB_MD_SELF_HEALING_PROTOCOL.md\`

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
| **Bug Fix** | Self-Healing First → Manual | \`POST /api/self-healing/orchestrate\` | Check infra → Trigger → Review → Manual fallback |
| **New Feature** | Agent SME Training → Build → Test | \`search_codebase\`, \`run_test\` | Study patterns → Schema → Backend → Frontend → Test |
| **Refactor** | Test First → Refactor → Validate | \`run_test\`, \`grep\`, LSP | Write tests → Refactor → LSP check → Re-test |
| **Database Change** | Schema → \`db:push\` → Verify | \`shared/schema.ts\`, SQL tool | Edit schema → db:push → Update storage → Test queries |
| **UI/UX Change** | Design Guidelines → Build → E2E Test | \`design_guidelines.md\`, \`run_test\` | Read guidelines → Build → E2E test → Visual validation |

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

**CRITICAL RULES:**
- **Database:** Never change ID column types (serial ↔ varchar) - breaks existing data
- **Handoff Plan:** Never deviate - Follow exact phase sequence

---

## ⚡ QUICK START - Agent Onboarding

### 🎯 What You Need to Know (60 Second Briefing)

**Platform:** Mundo Tango - Global tango social network connecting dancers, teachers, venues  
**Stack:** React + TypeScript + PostgreSQL + Express  
**AI:** 1,218 specialized agents + GROQ Llama-3.3-70b  
**Methodology:** MB.MD Protocol v9.2 (simultaneously, recursively, critically)  
**Current Phase:** Scott's First-Time Login Tour (50-page validation system)

---

### 📊 Infrastructure Status Dashboard

| System | Status | Endpoint | Notes |
|--------|--------|----------|-------|
| **Self-Healing** | ✅ Ready | \`/api/self-healing/orchestrate\` | 6 agents, <200ms |
| **Auto-Fix Engine** | ✅ Ready | \`/api/mrblue/auto-fix/{id}\` | 95%+ confidence auto-apply |
| **Page Audit** | ✅ Ready | \`/api/page-audit/run\` | 12 categories, AI-powered |
| **Agent Orchestration** | ✅ Ready | \`/api/agent-orchestration/status\` | 1,218 agents active |
| **VibeCoding** | ✅ Ready | \`/api/mrblue/vibecode\` | Natural language → code |
| **The Plan Tour** | ✅ Ready | \`/api/the-plan/progress\` | 50-page validation |

**Quick Health Check:** \`curl http://localhost:5000/api/self-healing/health\`

---

### 🗺️ File Location Map (Most Common Tasks)

\`\`\`
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
\`\`\`

---

## 📚 SYSTEM REFERENCE

### Overview
Mundo Tango is a production-ready social platform connecting the global tango community. Built with a self-sovereign, resilient architecture and enterprise-grade security. Integrates 7 business systems and 1,218 specialized AI agents.

**Business Model:** Premium services, event monetization, targeted advertising  
**Development:** MB.MD Protocol v9.2 with micro-batching, template reuse, parallel work, 10-layer quality gates

---

### 🎨 UI/UX - MT Ocean Theme
- **Colors:** Tango-inspired palette (ocean blues, warm accents)
- **Mode:** Dark mode via Tailwind \`dark:\` variants
- **Components:** shadcn/ui + Radix UI
- **Icons:** Lucide React + React Icons
- **i18n:** 68 languages via i18next
- **Layouts:** AppLayout (public), DashboardLayout (auth), AdminLayout (admin)
- **Routing:** Wouter (registered in \`client/src/App.tsx\`)

**Reference:** \`client/src/index.css\`, \`design_guidelines.md\`

---

### ⚙️ Backend - Express + PostgreSQL
- **Framework:** Express + TypeScript
- **DB:** PostgreSQL (Neon) + Drizzle ORM
- **Schema:** \`shared/schema.ts\` (single source of truth)
- **Storage:** \`server/storage.ts\` (IStorage interface)
- **Routes:** Modular in \`server/routes/*-routes.ts\`
- **Auth:** JWT (httpOnly cookies) + Google/Facebook OAuth
- **RBAC:** 8-tier role system (0=guest, 7=super admin)
- **Migrations:** \`npm run db:push\` (auto-sync)

**Auth Pattern:** Auth-optional for public routes, graceful degradation, 401 error handling

---

### 🤖 AI Systems

**Universal Agent Ecosystem (1,218 Agents)**
- Agent Scanner (auto-discovery)
- SME Training System (learn before implement)
- DPO Training, Curriculum Learning, GEPA Self-Evolution

**Self-Healing Infrastructure**
- PageAuditService: 6-agent parallel audit (<200ms)
- AutoFixEngine: Autonomous fix generation
- AgentOrchestration: Multi-agent coordination
- VibeCodingService: Natural language → code
- Endpoints: \`/api/self-healing/orchestrate\`, \`/api/self-healing/health\`

**Mr. Blue AI Assistant**
- Text/Voice Chat (ElevenLabs + Whisper)
- VibeCoding (GROQ Llama-3.3-70b)
- Visual Editor (live preview + element inspector)
- Page Generator (natural language → production pages)
- Error Detection (proactive + auto-fix)
- System 1 Context (LanceDB RAG)

**The Plan: Scott's First-Time Login Tour**
- 50-page validation system
- Components: ScottWelcomeScreen.tsx, ThePlanProgressBar.tsx
- API: \`/api/the-plan/progress\`, \`/api/the-plan/start\`, \`/api/the-plan/skip\`
- Reference: \`docs/handoff/MB_MD_PLAN_10_USER_VALIDATION.md\`

**Bifrost AI Gateway**
- Multi-provider (OpenAI, Anthropic, Groq, Google)
- Automatic failover + semantic caching + load balancing

---

### 🎯 Platform Features

**Social:** Events, groups, friendship, posts, real-time notifications (WebSocket), media gallery, live streaming, marketplace, subscriptions, reviews, leaderboard, blog, teacher/venue management, workshops, music library, stories, venue recommendations

**Business:** Talent Match AI, LIFE CEO AI (16 agents + LanceDB), Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, BullMQ Workers (39 functions, 6 workers, requires Redis)

---

### 🏗️ Project Structure
- \`client/\` - React frontend
- \`server/\` - Express backend  
- \`shared/\` - Shared types/schemas
- \`docs/\` - Documentation
- \`attached_assets/\` - Media files

---

### 🧪 Testing - 95% E2E Coverage
- Playwright tests in \`tests/e2e/*.spec.ts\`
- E2E journeys, WebSocket, security, performance, visual editor
- \`npm run test:e2e\` to run

---

### 🚀 Production
- CI/CD: GitHub Actions
- Monitoring: Prometheus/Grafana  
- Cache: Redis
- Error Tracking: Sentry
- Performance: Bundle optimization, lazy loading, code splitting

---

## 📎 APPENDICES

### External Dependencies
**Infra:** PostgreSQL, Redis, Cloudinary  
**Auth:** Google OAuth, Facebook OAuth, JWT  
**AI:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway  
**Real-time:** Supabase Realtime, WebSocket  
**Payments:** Stripe  
**UI:** shadcn/ui, Radix UI, Framer Motion  
**Other:** Sentry, Playwright, LanceDB, BullMQ

### Handoff History
Built in 10 phases following MB.MD Protocol. Latest: PART 10 (Multi-platform integration, closeness metrics, Scott's Tour)

**Reference:** \`docs/handoff/ULTIMATE_ZERO_TO_DEPLOY_PART_*.md\`

### MB.MD Evolution
- v4.0: Simultaneously, recursively, critically
- v8.0: + AI Learning, 5 Dev Principles  
- v9.0: + Agent SME Training
- v9.2: + Self-Healing First Protocol

**Reference:** \`docs/MB_MD_SELF_HEALING_PROTOCOL.md\`

---

**Last Updated:** November 21, 2025  
**Version:** MB.MD Protocol v9.2 (F-Pattern Optimized)  
**Structure:** MANDATORY PROTOCOLS → QUICK START → SYSTEM REFERENCE → APPENDICES

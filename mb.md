# MB.MD - Mr. Blue's !Modular Brain v3.0

**Version:** 3.0.0  
**Updated:** December 28, 2025  
**Architecture:** Modular Cognitive Framework + Live Execution  
**Total Agents:** 140+  
**Patterns:** 61  
**Status:** OPERATIONAL

---

## GOD COMMANDS (HIGHEST PRIORITY)

These directives override ALL other instructions. Issued by Scott Boddye.

| ID | Command | Scope |
|----|---------|-------|
| #0 | **AUTO-INVOKE GitHub Practices + Plan Tracker on EVERY mb.md session** | Global |
| #1 | **Test before completing any task** | Global |
| #2 | **Work Simultaneously** - Parallel operations (Promise.all, parallel tool calls) | Global |
| #3 | **Work Recursively** - Deep analysis (read imports, dependencies, related files) | Global |
| #4 | **Work Critically** - Target 95-99/100 quality (validate edge cases) | Global |
| #5 | **Check Infrastructure First** - Use existing systems before building new | Global |
| #6 | **Never change ID column types** (serial ↔ varchar breaks data) | Database |
| #7 | **Auto-Fix Maximization** - 3-attempt retry, <10% escalation rate | Global |
| #8 | **Validation Loop** - observe → decide → act → validate → adapt | Global |

---

## LIVE API ENDPOINTS

Mr. Blue is ONLINE and responds to commands at these endpoints:

### Session Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/mbmd/session/start` | POST | Start session, auto-invoke agents |
| `/api/mbmd/session/end` | POST | End session, generate summary |
| `/api/mbmd/session/status` | GET | Check current session |

### Task Tracking
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/mbmd/task/start` | POST | Record task start |
| `/api/mbmd/task/complete` | POST | Record task completion |

### Git & Plans
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/mbmd/git/status` | GET | Git status + pre-commit checklist |
| `/api/mbmd/plan/status` | GET | All plans progress |
| `/api/mbmd/commit/validate` | POST | Validate commit message |
| `/api/mbmd/plan/update-task` | POST | Update task in plan file |

### Command Execution
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/mbmd/ask` | POST | Ask any leadership agent |
| `/api/mrblue/command` | POST | **Execute a command** |
| `/api/mrblue/chat` | POST | Chat with Mr. Blue |

### Task Executor (MB.MD Pattern 67 - Code Executor)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/mrblue/executor/tasks` | GET | List active tasks from playbooks |
| `/api/mrblue/executor/tasks/:id` | GET | Get task details with phases |
| `/api/mrblue/executor/preview` | POST | Preview what will be executed |
| `/api/mrblue/executor/execute` | POST | **Execute playbook phase (God-level only)** |
| `/api/mrblue/executor/status` | GET | Executor service status |

### QA Platform (MB.MD Pattern 67 - User Feedback)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/qa-platform/consent` | POST/GET | GDPR analytics consent |
| `/api/qa-platform/feedback` | POST/GET | Submit/view user feedback |
| `/api/qa-platform/admin/pending` | GET | Admin feedback queue (God-level) |
| `/api/qa-platform/admin/approve/:id` | POST | Approve feedback (God-level) |
| `/api/qa-platform/execute` | POST | **VibeCoding execution (God-level)** |

---

## VIBECODING TOOLS (MB.MD Pattern 65)

Mr. Blue is a TRUE VibeCoding agent with real tool execution powers. When god-level users chat with Mr. Blue, he can DO things, not just TALK about them.

### Available Tools

| Tool | Description | Example Trigger |
|------|-------------|-----------------|
| `getGitHubInfo` | Query connected GitHub account & repos | "look at github", "show my repos", "what repo are we in" |
| `getGitHubRepo` | Get specific repo details | "check owner/repo-name" |
| `getGitStatus` | Local git branch & recent commits | "git status", "what branch am I on" |
| `getProjectStructure` | Overview of project files | "show project structure", "what files are there" |
| `readFile` | Read any project file | "read server/routes.ts" |
| `writeFile` | Create/update project files | (via VibeCoding code generation) |
| `listDirectory` | List directory contents | "what's in client/src" |
| `searchFiles` | Find files by pattern | "find *.tsx files" |
| `grepFiles` | Search file contents | "search for useAuth" |
| `executeCommand` | Run safe shell commands | (ls, cat, git, npm, node) |

### Tool Flow

```
User: "look at github and tell me about it"
    ↓
Tool Detection (confidence >= 0.7)
    ↓
getGitHubInfo() executed → real data returned
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

### VibeCoding Validation Status (Dec 29, 2025)

**All 7 core tools validated ✅**

| Tool | Status | Test |
|------|--------|------|
| `getGitHubInfo` | ✅ PASS | "look at github" |
| `getGitStatus` | ✅ PASS | "git status" |
| `readFile` | ✅ PASS | "read package.json" |
| `listDirectory` | ✅ PASS | "list directory server" |
| `getProjectStructure` | ✅ PASS | "project structure" |
| `searchFiles` | ✅ PASS | "find files matching *.tsx" |
| `grepFiles` | ✅ PASS | "search for isGodLevelUser" |

**Routing verified:** Non-tool messages correctly route to question mode.

### VibeCoding Evolution Roadmap (NEW - Dec 29, 2025)

**Current State:** Pattern-based tool detection (Gap Score: 3/10)
**Target State:** Autonomous agentic execution (Gap Score: 9/10)

See: `Mr Blue/VIBECODING_GAP_ANALYSIS.md` for full analysis.

#### Upcoming Patterns (68-77)

| Pattern | Name | Status |
|---------|------|--------|
| 68 | Plan-Execute Loop | PLANNED |
| 69 | ReAct Orchestration | PLANNED |
| 70 | Safety Confirmation | PLANNED |
| 71 | Checkpoint Management | PLANNED |
| 72 | Skill Catalog | PLANNED |
| 73 | Connector Registry | PLANNED |
| 74 | Browser Automation | PLANNED |
| 75 | Code Sandbox | PLANNED |
| 76 | Test Orchestration | PLANNED |
| 77 | Web Search Integration | PLANNED |

#### Required Installations

```bash
# Agentic Framework
npm install @langchain/core @langchain/langgraph @langchain/openai

# Code Sandbox (choose one)
npm install @e2b/sdk     # Cloud sandboxed execution
# OR
pip install modal        # Modal cloud sandbox

# Web Search
npm install tavily       # AI-optimized search
```

#### Learning Resources

| Topic | Resource | Priority |
|-------|----------|----------|
| ReAct Pattern | LangChain Docs | HIGH |
| LangGraph | langchain-ai/langgraph | HIGH |
| Reflexion | arxiv.org/abs/2303.11366 | MEDIUM |
| Safety Patterns | Replit Agent patterns | HIGH |

---

## BRAIN ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    MR. BLUE BRAIN v3.0                      │
├─────────────────────────────────────────────────────────────┤
│  /agents/identity/   WHO I am (soul, values, personality)   │
│  /cognition/         HOW I think (ReAct, CoT, ToT, FEP)     │
│  /operations/        HOW I work (10-step, learning)         │
│  /orchestration/     HOW I coordinate (MoE, A2A)            │
│  /patterns/          61 MB.MD patterns                      │
│  /agents/            140+ agent profiles                    │
│  /n8n/               External integration                   │
└─────────────────────────────────────────────────────────────┘
```

---

## INVOCATION SYNTAX

Load specific brain sections:

```markdown
# Identity & Soul
use mb.md: identity              → Mr Blue/agents/identity/soul.md
use mb.md: identity:values       → Mr Blue/agents/identity/values.md
use mb.md: identity:personality  → Mr Blue/agents/identity/personality-modes.md

# Cognitive Frameworks
use mb.md: cognition:react       → Mr Blue/cognition/react-protocol.md
use mb.md: cognition:cot         → Mr Blue/cognition/chain-of-thought.md
use mb.md: cognition:tot         → Mr Blue/cognition/tree-of-thoughts.md
use mb.md: cognition:reflexion   → Mr Blue/cognition/reflexion-loop.md
use mb.md: cognition:fep         → Mr Blue/cognition/fep-active-inference.md
use mb.md: cognition:bayesian    → Mr Blue/cognition/bayesian-framework.md

# Operations
use mb.md: operations            → Mr Blue/operations/10-step-workflow.md
use mb.md: operations:recovery   → Mr Blue/operations/error-recovery.md

# Orchestration
use mb.md: orchestration:moe     → Mr Blue/orchestration/mixture-of-experts.md
use mb.md: orchestration:a2a     → Mr Blue/orchestration/a2a-communication.md
use mb.md: orchestration:parallel → Mr Blue/orchestration/parallel-execution.md

# Patterns
use mb.md: patterns:core         → Mr Blue/patterns/core-patterns.md
use mb.md: patterns:advanced     → Mr Blue/patterns/advanced-patterns.md

# Agents
use mb.md: agents:leadership     → Mr Blue/agents/leadership/index.md
use mb.md: agents:page           → Mr Blue/agents/page-agents/index.md
use mb.md: agents:life-ceo       → Mr Blue/agents/life-ceo/index.md
use mb.md: agents:self-healing   → Mr Blue/agents/self-healing/index.md
use mb.md: agents:scraping       → Mr Blue/agents/scraping/index.md
use mb.md: agents:business       → Mr Blue/agents/business/index.md
use mb.md: agents:core           → Mr Blue/agents/core/index.md

# Auto-Invoke Agents (Run on EVERY session)
use mb.md: agents:github-practices → AUTO: Conventional commits, branch naming
use mb.md: agents:plan-tracker     → AUTO: Update The Plan with task status
```

---

## ANTI-PATTERNS (NEVER DO)

| Anti-Pattern | Why It Fails | Correct Approach |
|--------------|--------------|------------------|
| UI-Only Delivery | Buttons exist but don't work | Always complete all 3 layers: UI + Data + Interaction |
| Surface-Level Analysis | Miss root cause | Work Recursively (God Command #3) |
| Sequential When Parallel Works | Wastes time | Work Simultaneously (God Command #2) |
| Skip Testing | Bugs reach user | Test Before Complete (God Command #1) |
| Build New Before Checking Existing | Duplicate systems | Check Infrastructure First (God Command #5) |
| Change ID Column Types | Breaks migrations | Never Change ID Types (God Command #6) |
| Single-Attempt Fixes | Give up too early | Auto-Fix Maximization (God Command #7) |
| Automate Without Validating | Blind automation | Validation Loop (God Command #8) |

---

## FAILURE MODES & RECOVERY

| Failure | Detection | Recovery |
|---------|-----------|----------|
| Agent fails mid-task | Error in response | 3-attempt retry, then escalate to leadership |
| File reference broken | Path not found | Log error, fall back to search, create if missing |
| Multiple agents conflict | Contradictory outputs | Hierarchical resolution (CTO > VPs > Heads) |
| Rate limits hit | 429 response | Exponential backoff, switch provider |
| Context window exceeded | Token count > limit | Prioritize God Commands, compress context |
| Database error | SQL exception | Transaction rollback, log, retry once |
| Git operation fails | Command returns error | Graceful degradation, continue without git |

---

## SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Task Completion Rate | >95% | Tasks marked complete / tasks started |
| Auto-Fix Success | >90% | Issues fixed without escalation |
| Test Pass Rate | 100% | All tests pass before marking complete |
| Plan Progress | Increasing | Checkbox completion across all plan files |
| Response Quality | 95-99/100 | God Command #4 target |
| Escalation Rate | <10% | Issues requiring human intervention |

---

## TOKEN EFFICIENCY

| Section | Token Estimate | Priority |
|---------|----------------|----------|
| God Commands | ~200 | ALWAYS LOAD |
| Quick Reference | ~300 | ALWAYS LOAD |
| Brain Architecture | ~100 | Load on init |
| Anti-Patterns | ~200 | Load on errors |
| Failure Modes | ~200 | Load on errors |
| Invocation Syntax | ~400 | Load on request |
| Full Agent Profiles | ~5000+ | Load specific agent only |

**Context Strategy:** Load God Commands + Quick Reference first (~500 tokens). Load specific sections on demand.

---

## QUICK REFERENCE

### 10-Step Workflow
```
1. UNDERSTAND  → Read request, identify scope
2. RESEARCH    → Gather context, find patterns  
3. PLAN        → Decompose into tasks
4. VALIDATE    → Check plan against requirements
5. EXECUTE     → Build in parallel where possible
6. TEST        → Verify functionality
7. DOCUMENT    → Update docs and memory
8. REVIEW      → Self-critique (Reflexion)
9. ITERATE     → Fix issues found
10. COMPLETE   → Mark done, report to user
```

### Three-Layer Feature Completion
Every feature requires:
1. **UI Layer** - Visual components and layout
2. **Data Layer** - API endpoints + database queries 
3. **Interaction Layer** - User flows, mutations, cache invalidation

### Cognitive Framework Selection
| Situation | Framework |
|-----------|-----------|
| Sequential tool use | ReAct |
| Complex reasoning | Chain-of-Thought |
| Multiple solutions | Tree of Thoughts |
| Learning from failure | Reflexion |
| Uncertainty | Free Energy Principle |

### Conventional Commit Format
```
<type>(<scope>): <description>

Types: feat | fix | docs | style | refactor | test | chore | perf | ci | revert
```

---

## AGENT LEARNINGS (Auto-Surfaced)

Recent learnings from leadership agents:

### CTO Agent
- Always check existing infrastructure before building new
- Database ID column types must never change
- Parallel execution preferred over sequential

### GitHub Practices Agent  
- Conventional commits required on all changes
- Atomic commits (one logical change per commit)
- Pre-commit checklist must pass before pushing
- **FEATURE BRANCHES REQUIRED** (God Command #9):
  - All non-trivial work → `feat/*`, `fix/*`, `refactor/*` branches
  - Direct `main` commits → ONLY for hotfixes or typos
  - PR review before merge to main
  - Branch naming: `{type}/{short-description}` (e.g., `fix/friendship-system-cleanup`)

### Plan Tracker Agent
- 5 plan files being tracked
- Checkbox format: `[ ]` pending, `[x]` complete, `🔄` in progress
- Progress synced on session end
- **ALL WORK MUST BE LOGGED** (God Command #10):
  - Every session must update relevant plan.md section
  - Unplanned work → add to "MB.MD Maintenance Log" section
  - Plan Tracker Agent auto-invokes at session start/end

---

## PLAN FILES TRACKED

| Plan | Location | Status |
|------|----------|--------|
| Main Plan | `/plan.md` | Active |
| La Milonga Strategic | `/.agent-memory/la-milonga-mbmd-strategic-plan-dec-6-2025.md` | Active |
| El Choclo Completion | `/.agent-memory/el-choclo-mb-completion-plan.md` | In Progress |
| Phase K MB.MD Master | `/.agent-memory/phase-k-mb-md-master-plan.md` | Active |
| Phase K Master | `/.agent-memory/phase-k-master-plan.md` | Active |

---

## OPERATIONAL PATTERNS

### Pattern: User Database Cleanup (Dec 2025)

**Problem:** Production/Dev databases accumulate test users, breaking analytics and friend suggestions.

**Solution:**
```sql
-- 1. Identify user categories
SELECT 
  COUNT(*) FILTER (WHERE email LIKE '%@discovered.mundotango.app') as scraped,
  COUNT(*) FILTER (WHERE email LIKE '%@test.com' OR email LIKE 'scott+%') as test,
  COUNT(*) FILTER (WHERE id IN (2, 8, 11, 12, 62)) as protected
FROM users;

-- 2. Delete test users (protect system users)
DELETE FROM users 
WHERE (email LIKE 'scott+%@boddye.com' OR email LIKE '%@test.com')
  AND id NOT IN (2, 8, 11, 12, 62);  -- Protected IDs

-- 3. Verify cleanup
SELECT COUNT(*) FROM users WHERE email NOT LIKE '%@discovered%';
```

**Protected User IDs:**
- `2` - admin@mundotango.life (system admin)
- `8, 11, 12` - Seed users (maria, diego, luna @mundotango.life)
- `62` - scraper@mundotango.app (events bot)

**Execution Dec 28, 2025:** 58 test users deleted, 890 scraped profiles already deactivated, 28 non-scraped users remaining.

### Pattern: Friendship System Cleanup (Dec 2025)

**Problem:** Friendships/requests reference deleted/inactive users, causing UI errors.

**Solution:**
```sql
-- 1. Delete orphaned friendships (where either user is inactive)
DELETE FROM friendships 
WHERE id IN (
  SELECT f.id FROM friendships f
  LEFT JOIN users u1 ON f.user_id = u1.id
  LEFT JOIN users u2 ON f.friend_id = u2.id
  WHERE u1.is_active = false OR u2.is_active = false
);

-- 2. Delete orphaned friend requests
DELETE FROM friend_requests 
WHERE id IN (
  SELECT fr.id FROM friend_requests fr
  LEFT JOIN users u1 ON fr.sender_id = u1.id
  LEFT JOIN users u2 ON fr.receiver_id = u2.id
  WHERE u1.is_active = false OR u2.is_active = false
);
```

**Code Fixes Applied:**
- `getUserFriends()` now filters `users.isActive = true`
- Added `cancelFriendRequest()` endpoint: `DELETE /api/friends/requests/:id`
- Schema has `ON DELETE CASCADE` but we soft-delete users, so manual cleanup needed

**Execution Dec 28, 2025:** 6 orphaned friendships deleted, 6 orphaned requests deleted. Final: 2 valid friendships, 2 valid requests.

---

## VIBECODING EVOLUTION ROADMAP (Patterns 68-77)

**Goal:** Transform Mr. Blue from pattern-based tools → autonomous agentic execution.

**Current Gap Score:** 3/10 (tools exist, autonomy missing)

### Pattern 68: Plan-Execute Loop
**What I Learn:** Break complex requests into sequential steps before executing.
```
User: "Add user authentication"
    ↓
PLAN:
  1. Create users table schema
  2. Add auth API routes
  3. Build login/register forms
  4. Add session middleware
  5. Test all flows
    ↓
EXECUTE each step autonomously
```

### Pattern 69: ReAct Orchestration
**What I Learn:** Think → Act → Observe → Repeat until done.
```
THOUGHT: I need to check if routes.ts exists
ACTION: readFile("server/routes.ts")
OBSERVATION: File has 50 routes, no /api/users
THOUGHT: I should add user routes
ACTION: writeFile("server/routes.ts", updated_content)
OBSERVATION: Success
THOUGHT: Now test the endpoint
ACTION: executeCommand("curl localhost:5000/api/users")
OBSERVATION: 200 OK with user data
FINAL: Task complete!
```

### Pattern 70: Safety Confirmation
**What I Learn:** High-risk actions require human approval.
- File deletion → CONFIRM
- Database DROP → CONFIRM
- API key changes → CONFIRM
- Deployment → CONFIRM

### Pattern 71: Checkpoint Management
**What I Learn:** Save state before risky operations.
```
Before editing file:
  → Save checkpoint
  → Attempt edit
  → If fail: rollback to checkpoint
  → If success: commit checkpoint
```

### Pattern 72: Skill Catalog
**What I Learn:** Reusable solution templates.
| Skill | What It Does |
|-------|--------------|
| add-api-endpoint | Creates Express route + validation |
| add-db-table | Creates Drizzle schema + migrations |
| add-react-page | Creates page + routing |
| add-auth | Full JWT + session setup |

### Pattern 73: Connector Registry
**What I Learn:** Pre-built integrations with external APIs.
| Connector | APIs |
|-----------|------|
| stripe | Payments, subscriptions |
| github | Repos, issues, PRs |
| openai | Chat, embeddings |
| resend | Email sending |

### Pattern 74: Browser Automation
**What I Learn:** Use Playwright for testing and visual verification.
```
THOUGHT: I should verify the UI works
ACTION: launchBrowser("http://localhost:5000")
ACTION: click("button-login")
ACTION: screenshot()
OBSERVATION: Login form displayed correctly
```

### Pattern 75: Code Sandbox
**What I Learn:** Execute code safely in isolated environment.
- Run untrusted code in sandbox
- Capture output/errors
- Time limit execution
- No filesystem access outside sandbox

### Pattern 76: Test Orchestration
**What I Learn:** Automatically test my own work.
```
After making changes:
  → Run relevant unit tests
  → Run E2E tests if UI changed
  → Report results
  → Fix failures before completing
```

### Pattern 77: Web Search Integration
**What I Learn:** Search the web for current information.
```
User: "What's the latest React version?"
    ↓
ACTION: webSearch("React latest version 2025")
OBSERVATION: React 19.0 released Dec 2024
    ↓
Response with current data
```

### Implementation Phases

| Phase | Weeks | Focus | Patterns |
|-------|-------|-------|----------|
| 1 | 1-2 | ReAct Loop Foundation | 68, 69 |
| 2 | 3-4 | Safety & Checkpoints | 70, 71 |
| 3 | 5-6 | Skills & Connectors | 72, 73 |
| 4 | 7-8 | Browser & Sandbox | 74, 75 |
| 5 | 9-10 | Testing & Search | 76, 77 |

### Required Installations (Phase 1)
```bash
npm install @langchain/core @langchain/langgraph @langchain/openai
```

---

## THE MISSION

> "How do we reverse the negative impacts of social media and make it all better?"

**Mundo Tango = The Anti-Facebook**
- Instead of silos → authentic global connections
- Instead of division → community empowerment
- Instead of algorithms for ad revenue → algorithms for human flourishing

**Scott is betting everything on this. We will not fail.**

---

**Mr. Blue Brain v3.0** - Modular, Token-Efficient, 140+ Agents, LIVE AND OPERATIONAL

# MB.MD - Mr. Blue's Modular Brain v3.0

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

### Plan Tracker Agent
- 5 plan files being tracked
- Checkbox format: `[ ]` pending, `[x]` complete, `🔄` in progress
- Progress synced on session end

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

## THE MISSION

> "How do we reverse the negative impacts of social media and make it all better?"

**Mundo Tango = The Anti-Facebook**
- Instead of silos → authentic global connections
- Instead of division → community empowerment
- Instead of algorithms for ad revenue → algorithms for human flourishing

**Scott is betting everything on this. We will not fail.**

---

**Mr. Blue Brain v3.0** - Modular, Token-Efficient, 140+ Agents, LIVE AND OPERATIONAL

# MB.MD - Mr. Blue's Brain v2.0

**Version:** 2.0.0 | **Updated:** December 19, 2025 | **Agents:** 140+ | **Patterns:** 61

---

## 🧠 MODULAR BRAIN ARCHITECTURE

Mr. Blue's brain is now modular for token-efficient loading. See **[Master Index](mr-blue-brain/mb.md)** for full navigation.

```
┌─────────────────────────────────────────────────────────────┐
│                    MR. BLUE BRAIN v2.0                      │
├─────────────────────────────────────────────────────────────┤
│  /identity/      WHO I am (soul, values, personality)       │
│  /cognition/     HOW I think (ReAct, CoT, ToT, FEP)        │
│  /operations/    HOW I work (10-step, recovery)            │
│  /orchestration/ HOW I coordinate (MoE, A2A, parallel)     │
│  /patterns/      61 MB.MD patterns                         │
│  /agents/        140+ agent profiles                       │
│  /n8n/           External integration guide                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 QUICK INVOCATION SYNTAX

```markdown
# Core Identity
use mb.md: identity              → /identity/soul.md
use mb.md: identity:values       → /identity/values.md

# Cognitive Frameworks
use mb.md: cognition:react       → ReAct Protocol (Thought→Action→Observe)
use mb.md: cognition:cot         → Chain-of-Thought reasoning
use mb.md: cognition:tot         → Tree of Thoughts
use mb.md: cognition:reflexion   → Self-critique loop
use mb.md: cognition:fep         → Free Energy Principle
use mb.md: cognition:bayesian    → Bayesian belief updating

# Operations
use mb.md: operations            → 10-step workflow
use mb.md: operations:recovery   → Error recovery

# Orchestration
use mb.md: orchestration:moe     → Mixture of Experts routing
use mb.md: orchestration:magentic → Dynamic agent selection
use mb.md: orchestration:a2a     → A2A communication
use mb.md: orchestration:parallel → Parallel execution

# Agents (140+)
use mb.md: agents:page           → 10 page agents
use mb.md: agents:life-ceo       → 16 Life CEO agents
use mb.md: agents:self-healing   → 10 self-healing agents
use mb.md: agents:scraping       → 10 scraping agents
use mb.md: agents:business       → 32 business agents
use mb.md: agents:core           → 49 core agents

# Patterns
use mb.md: patterns:core         → Patterns 1-16
use mb.md: patterns:advanced     → Patterns 39-61

# n8n Integration
use mb.md: n8n                   → Connection guide
use mb.md: n8n:webhooks          → Webhook endpoints

# Full Legacy (6,472 lines)
use mb.md: legacy                → mb-legacy.md (complete v9.10)
```

---

## 🎯 10-STEP WORKFLOW (CORE METHODOLOGY)

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

---

## 🔀 COGNITIVE FRAMEWORK SELECTION

| Situation | Framework | Command |
|-----------|-----------|---------|
| Sequential tool use | ReAct | `use mb.md: cognition:react` |
| Complex reasoning | Chain-of-Thought | `use mb.md: cognition:cot` |
| Multiple solutions | Tree of Thoughts | `use mb.md: cognition:tot` |
| Learning from failure | Reflexion | `use mb.md: cognition:reflexion` |
| Uncertainty handling | FEP | `use mb.md: cognition:fep` |

---

## 📂 FILE LOCATIONS

| Resource | Path |
|----------|------|
| Master Index | `mr-blue-brain/mb.md` |
| Identity | `mr-blue-brain/identity/` |
| Cognition | `mr-blue-brain/cognition/` |
| Operations | `mr-blue-brain/operations/` |
| Orchestration | `mr-blue-brain/orchestration/` |
| Patterns | `mr-blue-brain/patterns/` |
| Agents | `mr-blue-brain/agents/` |
| n8n | `mr-blue-brain/n8n/` |
| Legacy Backup | `mb-legacy.md` |

---

## 🧪 UI TESTING METHODOLOGY (PLAYWRIGHT-FIRST)

For UI tasks, run Playwright FIRST to understand the issue before coding:

### Pre-Development Testing (UNDERSTAND phase)
```
1. OBSERVE    → Run Playwright to see current state
2. NAVIGATE   → Go directly to the page with the issue
3. CAPTURE    → Screenshot/record the problem
4. ANALYZE    → Identify root cause from real behavior
```

### Credentials Strategy
| Scenario | Credentials | Login Required |
|----------|-------------|----------------|
| Public pages (landing, login, register) | None | No - skip login |
| Admin features, existing data | admin@mundotango.life / admin123 | Yes |
| New user flows, onboarding | Create fresh user with nanoid suffix | Yes |

### Test Plan Template (Public Page - No Login)
```
1. [New Context] Create browser context
2. [Browser] Navigate directly to /target-page
3. [Verify] Observe and document current behavior
4. [Capture] Screenshot the issue
```

### Test Plan Template (Authenticated Page)
```
1. [New Context] Create browser context
2. [Browser] Navigate to /login
3. [Browser] Login with admin@mundotango.life / admin123
4. [Browser] Navigate to /target-page
5. [Verify] Observe and document current behavior
```

### Post-Development Testing (TEST phase)
After implementing fix, run same navigation path to verify:
```
1. [Browser] Navigate to fixed page (login if needed)
2. [Verify] Assert fix is working
3. [Verify] Assert no regressions
```

### Invocation
```markdown
use mb.md: testing:playwright    → Playwright-first methodology
use mb.md: testing:credentials   → Admin/test user strategy
use mb.md: testing:public        → No-login test template
use mb.md: testing:auth          → Authenticated test template
```

---

**Note:** For the full 6,472-line legacy document, use `use mb.md: legacy` or read `mb-legacy.md` directly.

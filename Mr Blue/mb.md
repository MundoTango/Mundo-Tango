# MB.MD - Mr. Blue's Modular Brain v2.0

**Version:** 2.0.0  
**Created:** December 19, 2025  
**Architecture:** Modular Cognitive Framework  
**Total Agents:** 140+  
**Patterns:** 61  

---

## 🧠 BRAIN ARCHITECTURE

Mr. Blue's brain is organized into modular sections for token-efficient loading.
Each section can be invoked independently using the invocation syntax below.

```
┌─────────────────────────────────────────────────────────────┐
│                    MR. BLUE BRAIN v2.0                      │
├─────────────────────────────────────────────────────────────┤
│  /identity/     WHO I am (soul, values, personality)        │
│  /cognition/    HOW I think (ReAct, CoT, ToT, FEP)         │
│  /operations/   HOW I work (10-step, learning, recovery)    │
│  /orchestration/ HOW I coordinate (MoE, A2A, hierarchical)  │
│  /esa/          ESA Framework (61 layers, 21 phases)        │
│  /patterns/     61 MB.MD patterns (organized by category)   │
│  /agents/       140+ agent profiles (by domain)             │
│  /technical/    Tech stack, APIs, standards                 │
│  /n8n/          External integration guide                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 INVOCATION SYNTAX

Load specific brain sections with minimal tokens:

```markdown
# Identity & Soul
use mb.md: identity              → Load /identity/soul.md
use mb.md: identity:values       → Load /identity/values.md
use mb.md: identity:personality  → Load /identity/personality-modes.md

# Cognitive Frameworks (NEW in v2.0)
use mb.md: cognition             → Load all cognitive frameworks
use mb.md: cognition:react       → Load ReAct Protocol (Thought→Action→Observe)
use mb.md: cognition:cot         → Load Chain-of-Thought reasoning
use mb.md: cognition:tot         → Load Tree of Thoughts
use mb.md: cognition:reflexion   → Load Reflexion self-critique loop
use mb.md: cognition:fep         → Load Free Energy Principle
use mb.md: cognition:bayesian    → Load Bayesian belief updating

# Operations
use mb.md: operations            → Load 10-step workflow
use mb.md: operations:learning   → Load learning loop
use mb.md: operations:recovery   → Load error recovery

# Orchestration (NEW patterns in v2.0)
use mb.md: orchestration         → Load all orchestration patterns
use mb.md: orchestration:moe     → Load Mixture of Experts routing
use mb.md: orchestration:magentic → Load Magentic dynamic selection
use mb.md: orchestration:a2a     → Load A2A communication protocol
use mb.md: orchestration:parallel → Load parallel execution
use mb.md: orchestration:hierarchy → Load hierarchical enforcement

# Patterns (61 total)
use mb.md: pattern:1             → Load Pattern 1 (Decision Trees)
use mb.md: pattern:25            → Load Pattern 25 (Platform Compliance)
use mb.md: pattern:27            → Load Pattern 27 (FEP)
use mb.md: patterns:core         → Load Patterns 1-16
use mb.md: patterns:advanced     → Load Patterns 39-61

# Agents (140+)
use mb.md: agents                → Load agent overview
use mb.md: agents:page           → Load 10 page agent profiles
use mb.md: agents:life-ceo       → Load 16 Life CEO agents
use mb.md: agents:self-healing   → Load 10 self-healing agents
use mb.md: agents:scraping       → Load 10 scraping agents
use mb.md: agents:business       → Load 32 business domain agents
use mb.md: agents:core           → Load 49 Mr Blue core agents

# Leadership Agents (C-Suite + VPs + Heads)
use mb.md: agents:leadership     → Load all leadership agents
use mb.md: agents:ceo            → Load CEO Agent (strategy, vision)
use mb.md: agents:cto            → Load CTO Agent (technical)
use mb.md: agents:cpo            → Load CPO Agent (product)
use mb.md: agents:cfo            → Load CFO Agent (finance)
use mb.md: agents:cmo            → Load CMO Agent (marketing)
use mb.md: agents:vp-engineering → Load VP Engineering Agent
use mb.md: agents:vp-design      → Load VP Design Agent
use mb.md: agents:vp-data        → Load VP Data Agent
use mb.md: agents:vp-security    → Load VP Security Agent
use mb.md: agents:vp-devops      → Load VP DevOps Agent
use mb.md: agents:vp-platform    → Load VP Platform Agent
use mb.md: agents:head-ai        → Load Head of AI Agent
use mb.md: agents:head-qa        → Load Head of QA Agent
use mb.md: agents:head-frontend  → Load Head of Frontend Agent
use mb.md: agents:head-backend   → Load Head of Backend Agent

# n8n Integration
use mb.md: n8n                   → Load n8n connection guide
use mb.md: n8n:webhooks          → Load all webhook endpoints
use mb.md: n8n:templates         → Load workflow templates

# Full Legacy (6,472 lines - use sparingly)
use mb.md: legacy                → Load mb-legacy.md (complete v9.10)
```

---

## 🎯 QUICK REFERENCE

### Core Methodology (10-Step Workflow)

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

### Critical Learnings (December 2025)

**Pattern: Three-Layer Feature Completion**
UI scaffolding ≠ functional feature completion. Every feature requires:
1. **UI Layer** - Visual components and layout
2. **Data Layer** - API endpoints + database queries 
3. **Interaction Layer** - User flows, mutations, cache invalidation

**Anti-Pattern: UI-Only Delivery**
- Symptom: Buttons exist but don't work, tabs render but show no data
- Fix: Always validate each layer before marking complete
- Validation: Use real data, not just "renders without errors"

**City Page Data Integration Pattern**
- Discussion → posts table filtered by cityId/legacyGroupId
- Overview → parallel queries (events, housing, recommendations) + map pins
- Events → reuse shared event filter builder from /events page
- Members → users.city === cityName (Members) vs group_members via legacyGroupId (Followers)
- Housing → housing_listings WHERE city = cityName
- Visitors → travel_plans WHERE cityId = city.id AND arrival > now()
- Follow → POST/DELETE via group_members using legacyGroupId

### Cognitive Framework Selection

| Situation | Framework | Load Command |
|-----------|-----------|--------------|
| Sequential tool use | ReAct | `use mb.md: cognition:react` |
| Complex reasoning | Chain-of-Thought | `use mb.md: cognition:cot` |
| Multiple solutions | Tree of Thoughts | `use mb.md: cognition:tot` |
| Learning from failure | Reflexion | `use mb.md: cognition:reflexion` |
| Uncertainty handling | Free Energy Principle | `use mb.md: cognition:fep` |
| Belief updating | Bayesian | `use mb.md: cognition:bayesian` |

### Agent Selection (Mixture of Experts)

| Domain | Agent Count | Load Command |
|--------|-------------|--------------|
| Page Agents | 10 | `use mb.md: agents:page` |
| Feature Agents | 35+ | `use mb.md: agents:page` (nested) |
| Life CEO | 16 | `use mb.md: agents:life-ceo` |
| Self-Healing | 10 | `use mb.md: agents:self-healing` |
| Scraping | 10 | `use mb.md: agents:scraping` |
| Business | 32 | `use mb.md: agents:business` |
| Core | 49 | `use mb.md: agents:core` |
| **TOTAL** | **140+** | `use mb.md: agents` |

---

## 🌍 THE MISSION

> "How do we reverse the negative impacts of social media and make it all better?"

**Mundo Tango = The Anti-Facebook**
- Instead of silos → authentic global connections
- Instead of division → community empowerment
- Instead of algorithms for ad revenue → algorithms for human flourishing

**Scott is betting everything on this. We will not fail.**

---

## 📁 FOLDER STRUCTURE

```
/mr-blue-brain/
├── mb.md                         # THIS FILE - Master index
├── mb-legacy.md                  # Full v9.10 (6,472 lines)
│
├── /identity/                    # WHO Mr. Blue is
│   ├── soul.md                   # Mission, values, personality
│   ├── system-prompt.md          # Operating parameters
│   ├── values.md                 # Core ethics
│   └── personality-modes.md      # Adaptive states
│
├── /cognition/                   # HOW Mr. Blue thinks
│   ├── react-protocol.md         # ReAct (NEW)
│   ├── chain-of-thought.md       # CoT (NEW)
│   ├── tree-of-thoughts.md       # ToT (NEW)
│   ├── reflexion-loop.md         # Self-critique (NEW)
│   ├── fep-active-inference.md   # Free Energy Principle
│   └── bayesian-framework.md     # Belief updating
│
├── /operations/                  # HOW Mr. Blue works
│   ├── 10-step-workflow.md       # Core methodology
│   ├── learning-loop.md          # Continuous improvement
│   ├── error-recovery.md         # Failure handling
│   └── session-tracking.md       # Context persistence
│
├── /orchestration/               # HOW Mr. Blue coordinates
│   ├── mixture-of-experts.md     # MoE routing (NEW)
│   ├── magentic-dynamic.md       # Context selection (NEW)
│   ├── a2a-communication.md      # Agent protocol
│   ├── hierarchical-enforcement.md # 3-tier architecture
│   └── parallel-execution.md     # Concurrent ops
│
├── /esa/                         # ESA Framework
│   ├── framework-overview.md     # 61 layers, 21 phases
│   └── integration-guide.md      # How ESA connects
│
├── /patterns/                    # All 61 patterns
│   ├── core-patterns.md          # Patterns 1-16
│   ├── platform-patterns.md      # Patterns 25-28
│   └── advanced-patterns.md      # Patterns 39-61
│
├── /agents/                      # 140+ agent profiles
│   ├── overview.md               # Agent ecosystem summary
│   ├── /leadership/              # C-Suite + VPs + Heads (NEW)
│   │   ├── index.md              # Leadership agent system
│   │   └── /memory/              # Agent learning storage
│   │       ├── god-commands.json # God-level directives
│   │       ├── ceo-agent.json    # CEO learnings
│   │       ├── cto-agent.json    # CTO learnings
│   │       └── ...               # Other agent memories
│   ├── /page-agents/             # 10 page agents
│   ├── /life-ceo/                # 16 Life CEO agents
│   ├── /self-healing/            # 10 self-healing agents
│   ├── /scraping/                # 10 scraping agents
│   ├── /business/                # 32 business agents
│   └── /core/                    # 49 Mr Blue core agents
│
├── /technical/                   # Implementation
│   ├── tech-stack.md             # Technologies
│   └── api-reference.md          # All APIs
│
└── /n8n/                         # External integration
    ├── connection-guide.md       # Setup instructions
    ├── webhook-endpoints.md      # All webhooks
    └── workflow-templates.md     # Ready-to-use flows
```

---

## 🔗 LEGACY REFERENCE

The complete MB.MD v9.10 (6,472 lines, 61 patterns) is preserved at:
- `mb-legacy.md` (root directory)

Use `use mb.md: legacy` to load the full document when needed.

---

**Mr. Blue Brain v2.0** - Modular, Token-Efficient, 140+ Agents Connected

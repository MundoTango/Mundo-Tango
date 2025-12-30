# MB.MD - Mr. Blue's !Modular Brain v3.1

**Version:** 3.2.0
**Updated:** December 30, 2025
**Architecture:** Modular Cognitive Framework + Live Execution
**Total Agents:** 140+
**Patterns:** 107 (61 Core + 16 VibeCoding Evolution + 9 New Patterns 69–77 + 19 Industry AI Learned + 2 Execution Patterns)
**Status:** OPERATIONAL + VIBECODING EVOLUTION 100% COMPLETE (10/10 patterns)

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

**Current State:** ✅ Pattern 97 VibeCoding Complete - Autonomous Execution OPERATIONAL (Gap Score: 9/10)
**Target State:** 🎯 ACHIEVED - Full Pattern 97 Implementation with SSE Streaming (Gap Score: 9/10)

See: `Mr Blue/VIBECODING_GAP_ANALYSIS.md` for full analysis.

#### VibeCoding Evolution Patterns (68-77)

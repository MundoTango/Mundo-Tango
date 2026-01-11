# Bug Diagnostic System - MB.MD Pattern 67

**Version:** 1.0.0
**Updated:** January 10, 2026
**Architecture:** Universal Bug Reporting + VibeCoding Fix System
**Agent:** BugDiagnosticAgent
**Status:** BUILDING

---

## Overview

The Bug Diagnostic System connects user bug reports to automated fixes through the MB.MD agent ecosystem. It provides:

1. **User Journey**: Conversational bug reporting with video replay
2. **Admin Journey**: Interactive VibeCoding-powered fix application
3. **Backend Orchestration**: Agent-driven analysis and fix execution

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER BUG REPORTING                         │
├─────────────────────────────────────────────────────────────────┤
│  Mr. Blue Chat → Element Selector → Playwright Video            │
│       ↓              ↓                    ↓                     │
│  Conversational   Specific Element    Journey Recording         │
│  Bug Analysis     Targeting           (not screenshots)         │
│       ↓              ↓                    ↓                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Feedback Queue (Admin)                      │   │
│  │  • Diagnostic Context  • Video Replay  • API Failures   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN FIX JOURNEY                           │
├─────────────────────────────────────────────────────────────────┤
│  "Let's Fix It" Button                                          │
│       ↓                                                         │
│  Navigate to Impacted Page + Store Context in Session           │
│       ↓                                                         │
│  Auto-Open Mr. Blue in VibeCoding Mode (?mrblue=debug)          │
│       ↓                                                         │
│  Full AI Chat with Agent Work Streaming                         │
│       ↓                                                         │
│  Reply to User → Messages Inbox                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND ORCHESTRATION                         │
├─────────────────────────────────────────────────────────────────┤
│  VibeCodingService → AgentOrchestrator → Org Chart Agents       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CTOAgent      │ Strategic oversight, architectural      │  │
│  │  FrontendAgent │ UI/UX issues, React components          │  │
│  │  BackendAgent  │ API fixes, database, server logic       │  │
│  │  SecurityAgent │ Auth issues, tokens, permissions        │  │
│  │  DesignAgent   │ Visual consistency, accessibility       │  │
│  │  QAAgent       │ Validates fixes, runs tests             │  │
│  │  DevOpsAgent   │ Deployment, environment configs         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  Mixture of Experts Router → Select Agents by Error Type        │
│       ↓                                                         │
│  ReactProtocol (Reason → Act → Observe)                         │
│       ↓                                                         │
│  AutoFixEngine → Apply with Confidence Scoring                  │
│       ↓                                                         │
│  ValidationLoop → Confirm Fix Works                             │
│       ↓                                                         │
│  User Notification → Messages Inbox                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Protocols

| ID | Protocol | Action |
|----|----------|--------|
| BD-01 | **God-Level Gating** | Hide "Try Auto-Fix" from DiagnosisSummary for users with tier < 8 |
| BD-02 | **Element Selector** | Use ElementSelectorService for bug mode element targeting |
| BD-03 | **Video Capture** | Replace screenshots with Playwright video recording of user journey |
| BD-04 | **Conversational Analysis** | Mr. Blue asks clarifying questions, uses AI to identify root cause |
| BD-05 | **Inbox Notifications** | All user updates go to Messages Inbox (not email) |
| BD-06 | **Navigation Handoff** | "Let's Fix It" stores context in sessionStorage, navigates to page |
| BD-07 | **VibeCoding Auto-Open** | Detect ?mrblue=debug param, auto-open with VibeCoding mode |
| BD-08 | **Agent Streaming** | Stream ALL agent work (reasoning, file analysis, changes) to chat |
| BD-09 | **Admin Reply** | Enable direct message from ticket to user's inbox |
| BD-10 | **Fix Validation** | ValidationLoop confirms fix before marking resolved |

---

## Key Files

### Frontend
| File | Purpose |
|------|---------|
| `client/src/components/qa/DiagnosisSummary.tsx` | Bug analysis display, Auto-Fix button |
| `client/src/components/mrBlue/core/MrBlueChat.tsx` | Chat interface, VibeCoding mode |
| `client/src/pages/admin/FeedbackQueuePage.tsx` | Admin review queue |
| `client/src/hooks/useJourneyTracker.ts` | Journey/video capture |
| `client/src/lib/qa/componentRegistry.ts` | Bug patterns, diagnostics |

### Backend
| File | Purpose |
|------|---------|
| `server/routes/qa-platform-routes.ts` | Feedback submission, admin approval |
| `server/routes/mrblue-vibecoding-routes.ts` | VibeCoding streaming endpoint |
| `server/services/mrBlue/VibeCodingService.ts` | VibeCoding execution |
| `server/services/mrBlue/AutoFixEngine.ts` | Fix application with confidence |
| `server/services/mrBlue/AgentOrchestrator.ts` | Agent deployment |
| `server/services/mrBlue/elementSelector.ts` | Element targeting |

### Agents
| File | Purpose |
|------|---------|
| `server/services/mrBlue/agents/BugDiagnosticAgent.ts` | Main orchestrator for this feature |
| `server/services/mrBlue/agents/leadership/CTOAgent.ts` | Strategic oversight |
| `server/services/mrBlue/ReactProtocol.ts` | Reason → Act → Observe loop |

---

## Agent Routing

Based on diagnostic context, route to appropriate agents:

| Error Pattern | Primary Agent | Supporting Agents |
|--------------|---------------|-------------------|
| 401/403 errors | SecurityAgent | BackendAgent |
| 404 errors | BackendAgent | QAAgent |
| UI not rendering | FrontendAgent | DesignAgent |
| Slow performance | BackendAgent | DevOpsAgent |
| Styling issues | DesignAgent | FrontendAgent |
| Data not saving | BackendAgent | SecurityAgent |
| Crash/Exception | QAAgent | CTOAgent |

---

## Database Schema Additions

```typescript
// In shared/schema.ts - additions for bug diagnostic

// Add to userFeedback table:
playwrightVideoUrl: text("playwright_video_url"),
relatedMessageId: integer("related_message_id").references(() => directMessages.id),

// New table for feedback-inbox linking
export const feedbackMessages = pgTable("feedback_messages", {
  id: serial("id").primaryKey(),
  feedbackId: integer("feedback_id").references(() => userFeedback.id),
  messageId: integer("message_id").references(() => directMessages.id),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

## Implementation Checklist

### Phase 1: Research ✅
- [x] CTOAgent: Map current bug flow
- [x] FrontendAgent: Analyze MrBlueChat, DiagnosisSummary
- [x] BackendAgent: Trace qa-platform routes
- [x] MessagingAgent: Learn directMessages schema
- [x] QAAgent: Research Playwright video

### Phase 2: Prep Work
- [ ] Add playwrightVideoUrl to schema
- [ ] Create feedback-to-inbox linking
- [ ] Add god-level utilities

### Phase 3: Build User Journey
- [ ] Hide Auto-Fix for non-god users
- [ ] Add element selector to bug mode
- [ ] Playwright video recording
- [ ] Full conversational bug mode
- [ ] Route to Messages Inbox

### Phase 4: Build Admin Journey
- [ ] Rename button to "Let's Fix It"
- [ ] Video replay in feedback detail
- [ ] "Reply to User" → Inbox
- [ ] Navigation + context handoff
- [ ] VibeCoding auto-open

### Phase 5: Build Backend Orchestration
- [ ] Connect VibeCodingService to AgentOrchestrator
- [ ] Deploy org chart agents
- [ ] Stream all agent work
- [ ] AutoFixEngine with ReactProtocol
- [ ] ValidationLoop

### Phase 6: Test
- [ ] User bug report flow
- [ ] Admin "Let's Fix It" flow
- [ ] Agent streaming and fix application
- [ ] User inbox notification

### Phase 7: Polish
- [ ] i18n for all UI strings
- [ ] Error handling
- [ ] Update replit.md

---

## Invocation

```
use bug-diagnostic.md: [task]
use @bug-diagnostic.md: analyze feedback queue
use @bug-diagnostic.md: fix bug #123
```

**Coordination with mb.md:**
```
mb.md (Master Orchestrator) ←→ bug-diagnostic.md (Feature Expert)
    ↓
    ├── User Bug Flow
    ├── Admin Fix Flow
    ├── Agent Orchestration
    └── Inbox Integration
```

---

## Testing Commands

```bash
# Test user bug submission
curl -X POST /api/qa-platform/feedback -d '{"feedbackType":"bug",...}'

# Test admin review
curl -X GET /api/qa-platform/admin/pending

# Test VibeCoding fix
curl -X POST /api/mrblue/vibecoding -d '{"message":"fix this bug",...}'
```

---

## God-Level Users

Only these users can use "Try Auto-Fix" and VibeCoding:
- `scott@boddye.com`
- `admin@mundotango.life`
- Any user with `tier === 8`

# MR BLUE VIBE CODING - COMPLETE IMPLEMENTATION PLAN

**Project:** MundoTango Mr Blue AI Assistant
**Created:** December 2, 2025
**Version:** 1.0
**Following:** MB.MD Patterns 1-50 (Parallel Agent Execution Protocol)

---

## EXECUTIVE SUMMARY

Transform Mr Blue into a production-grade, Replit-style AI coding assistant with multi-workspace management, vibe coding, self-healing, 3D avatar integration, and comprehensive support/moderation systems.

**Based on Industry Research:**
- Vibe Coding Platforms: Replit, Cursor, Emergent, Bolt
- Multi-Agent Orchestration: Anthropic, AWS Bedrock patterns
- Self-Healing: AWS CloudWatch + ML anomaly detection  
- Workspace Management: Cursor, Gemini CLI, 16x Prompt
- AI Moderation: Stream Dashboard, Hive patterns

---

## PHASE 1: BACKEND FOUNDATIONS (4-6 weeks)

### 1.1 Workspace Architecture

**Create workspace model** (`shared/schema.ts`):
```typescript
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  projectType: varchar("project_type", { length: 50 }),
  repoUrl: text("repo_url"),
  activeTools: text("active_tools").array(),
  memoryContext: json("memory_context"),
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**Build workspace API** (`server/routes/workspace-routes.ts`):
- POST /api/workspaces - Create workspace
- GET /api/workspaces - List user workspaces  
- PUT /api/workspaces/:id/switch - Switch active
- GET /api/workspaces/:id/context - Get memory
- PUT /api/workspaces/:id/context - Update memory

**Add workspace_id to all Mr Blue APIs** for context isolation.

### 1.2 Agent Registry & Orchestration

**Create agent catalog** (`server/services/agent-registry.ts`):
```typescript
const AGENT_REGISTRY = {
  code_generation: { priority: 1, capabilities: ["vibe_coding", "refactor"], cost: "low" },
  database: { priority: 2, capabilities: ["migrations", "queries"], cost: "medium" },
  test: { priority: 2, capabilities: ["write_tests", "run_tests"], cost: "low" },
  luma_video: { priority: 3, capabilities: ["avatar_render", "video_gen"], cost: "high" },
  voice: { priority: 2, capabilities: ["tts", "stt"], cost: "medium" },
  security: { priority: 1, capabilities: ["scan", "compliance"], cost: "low" },
};
```

**Build orchestration engine** (`server/services/orchestrator.ts`):
- Task decomposition (user intent → atomic agent tasks)
- Sequencing rules (dependencies between agents)
- Parallelization logic (Pattern 28)
- Error handling & retries per agent

### 1.3 Async Job Queue

**Set up BullMQ** (`server/services/job-queue.ts`):
```typescript
import Queue from 'bull';

const jobQueue = new Queue('mr-blue-jobs', process.env.REDIS_URL);

export const createJob = (type, data, workspaceId) => {
  return jobQueue.add(type, { ...data, workspaceId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  });
};
```

Job types: `vibe_code_generation`, `test_execution`, `luma_render`, `self_heal`, `moderation_review`.

---

## PHASE 2: FRONTEND UX (4-6 weeks)

### 2.1 Mr Blue Chat Panel

**Build persistent panel** (`client/src/components/mr-blue/MrBluePanel.tsx`):
- Right-side collapsible panel
- Mode indicators: Build (blue), Support (orange), Moderation (red)
- Streaming response support (SSE or WebSocket)
- Slash commands: `/workspace`, `/mode`, `/agents`, `/help`

### 2.2 Inline Vibe Coding UX

**Add editor context menu:**
- Right-click menu in Visual Editor
- Options: "Ask Mr Blue", "Refactor", "Fix error", "Add tests"
- Auto-populate chat with selected code + context

**Build diff preview** (`client/src/components/mr-blue/DiffPreview.tsx`):
- Side-by-side diff view (Monaco Diff Editor)
- "Apply", "Reject", "Modify" buttons
- "Apply and run tests" option

**Implement inline suggestions:**
- Ghost text in editor (like Copilot)
- Trigger on natural language comments
- Tab to accept, Escape to dismiss

### 2.3 3D Avatar Display

**Queue endpoints for 3D avatar specialist agent:**
```
POST /api/avatar/render       # Generate frame
GET  /api/avatar/status       # Check if ready
POST /api/avatar/speak        # Trigger lip-sync
GET/PUT /api/avatar/config    # Appearance settings
```

**Build avatar container:**
- States: idle, listening, thinking, speaking
- Fallback to text-only if service unavailable
- Auto-upgrade when service comes online

### 2.4 Workspace Switcher

**Build switcher** (`client/src/components/mr-blue/WorkspaceSwitcher.tsx`):
- Dropdown showing all workspaces
- Display: name, type icon, last active
- Quick-create: "+ New Workspace"
- Search/filter

**Add entry points:**
- Visual Editor toolbar: "Ask Mr Blue"
- Feed/Posts: "Report" button
- User profiles: "Report User"
- Error areas: "Get Help"

---

## PHASE 3: SELF-HEALING, SUPPORT & MODERATION (3-4 weeks)

### 3.1 Self-Healing via Vibe Coding

**Build self-heal endpoint** (`server/routes/mr-blue-routes.ts`):
```typescript
POST /api/mr-blue/self-heal
Process:
  1. Read own logs, config, recent changes
  2. Run diagnostic checks
  3. Identify root causes
  4. Generate code/config diffs
  5. Run tests to verify
  6. Present fix for admin approval
```

**Add self-monitoring** (`server/services/self-monitor.ts`):
- Continuous health checks
- Anomaly detection (response time, error rates)
- Auto-trigger self-heal
- Escalate to human if fails

### 3.2 User Support Conversations

**Build support flow:**
```typescript
POST /api/support/start
Process:
  1. Mr Blue greeting
  2. Ask clarifying questions
  3. Auto-collect context
  4. Run diagnostics
  5. Generate structured ticket
  6. Send to admin center
```

**Create support_tickets schema:**
```typescript
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  mrBlueConversationId: integer("conversation_id"),
  issueSummary: text("issue_summary").notNull(),
  stepsToReproduce: text("steps_to_reproduce"),
  impact: varchar("impact", { length: 20 }),
  suggestedResolution: text("suggested_resolution"),
  status: varchar("status", { length: 20 }).default("open"),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 3.3 Content & User Reporting

**Build report flow:**
```typescript
POST /api/moderation/report
Process:
  1. Open Mr Blue in Moderation mode
  2. Pre-load context
  3. Ask follow-ups
  4. Validate report
  5. Gather evidence
  6. Create structured report
  7. Send to admin center
```

**Create moderation_reports schema:**
```typescript
export const moderationReports = pgTable("moderation_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id),
  targetType: varchar("target_type", { length: 20 }).notNull(),
  targetId: integer("target_id").notNull(),
  reason: varchar("reason", { length: 50 }).notNull(),
  detailedExplanation: text("detailed_explanation"),
  mrBlueAssessment: json("mr_blue_assessment"),
  evidence: json("evidence"),
  urgency: varchar("urgency", { length: 20 }).default("medium"),
  status: varchar("status", { length: 20 }).default("pending"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**Build admin dashboards:**
- `SupportDashboard.tsx` - View/assign/resolve tickets
- `ModerationDashboard.tsx` - Review reports, take action

---

## PHASE 4: CONFIGURATION, TESTING & DEPLOYMENT (2-3 weeks)

### 4.1 Environment & Configuration

**Expand env validation:**
```typescript
const requiredEnvVars = [
  'SUPABASE_URL', 'SUPABASE_ANON_KEY',
  'LUMA_API_KEY', 'ELEVENLABS_API_KEY',
  'AVATAR_SERVICE_URL',
  'ADMIN_CENTER_API_KEY',
  'REDIS_URL',
];
```

**Build tool configuration:**
- Enable/disable agents per workspace
- Feature flags
- Rate limiting & cost controls

### 4.2 E2E Testing

**Write tests:**
- `workspace-management.spec.ts`
- `vibe-coding.spec.ts`
- `self-heal.spec.ts`
- `support-flow.spec.ts`
- `moderation-flow.spec.ts`

### 4.3 Documentation

**Create docs:**
- `docs/mr-blue/API.md`
- `docs/mr-blue/AGENT_REGISTRY.md`
- `docs/mr-blue/USER_GUIDE.md`

### 4.4 Deploy with Feature Flags

```typescript
export const MR_BLUE_FEATURES = {
  VIBE_CODING: true,
  THREE_D_AVATAR: false,
  SELF_HEAL: true,
  REPORTING: true,
  MULTI_WORKSPACE: true,
};
```

---

## SUCCESS CRITERIA

- [ ] Multi-workspace without context leakage
- [ ] Vibe-code inline with diff previews
- [ ] Self-diagnose and fix own errors
- [ ] Support via AI → structured tickets
- [ ] Reports with follow-ups → admin-ready
- [ ] 3D avatar auto-activates when ready

---

## TIMELINE

- **Phase 1**: 4-6 weeks
- **Phase 2**: 4-6 weeks
- **Phase 3**: 3-4 weeks
- **Phase 4**: 2-3 weeks
- **Total**: 13-19 weeks (3-5 months)

---

## MB.MD PATTERNS APPLIED

- **Pattern 28**: Parallel Agent Execution
- **Pattern 42**: Drizzle ORM safe leftJoin
- **Patterns 47-50**: (To be reviewed and applied)

---

## NEXT STEPS

1. Review Patterns 47-50 in mb.md
2. Start Phase 1.1: Workspace Architecture
3. Build agent registry
4. Set up job queue
5. Iterate with testing

**Ready to build!**

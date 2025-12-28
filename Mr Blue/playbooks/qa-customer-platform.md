# Mr. Blue QA/Customer Test Platform

**Invocation:** `use mb.md: playbooks:qa-customer-platform`
**Created:** December 28, 2025
**Status:** READY FOR EXECUTION
**Priority:** High

---

## MISSION BRIEF

You are being tasked with building a QA/Customer Test Platform that enables you (Mr. Blue) to:
1. Monitor what users are doing on the platform in real-time
2. Understand their journey when they chat with you
3. Handle feature requests, support issues, and bug reports
4. Route feedback to god-level admins for approval
5. Execute fixes using MB.MD methodology (when god-level admin is using you)

---

## REQUIREMENTS

### User Activity Tracking
- **Scope:** Full session replay (clicks, scrolls, mouse movements, page visits)
- **Storage:** Ephemeral (in-memory/Redis) during session
- **Persistence:** Only when user reports an issue → snapshot + store until resolved
- **GDPR:** Consent checkbox REQUIRED before any tracking begins

### RBAC Execution Rights
| User Type | Mr. Blue Powers |
|-----------|-----------------|
| Regular User | Feedback submission only → goes to approval queue |
| God-Level Admin | Full MB.MD execution (code changes, deploys) |

**God-Level Users:**
- Scott Boddye (scott@boddye.com)
- Admin (admin@mundotango.life)

### Admin Approval Workflow
1. User submits feedback/issue via Mr. Blue chat
2. Mr. Blue creates entry in feedback queue
3. Notification sent to god-level admins
4. Admin reviews at `/admin/feedback-queue`
5. Admin approves → Mr. Blue executes fix using MB.MD
6. Admin rejects → User notified, case closed

---

## IMPLEMENTATION PHASES

### Phase 0: Database Schema
Create these tables in `shared/schema.ts`:

```typescript
// GDPR consent tracking
export const analyticsConsent = pgTable("analytics_consent", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  consentGiven: boolean("consent_given").notNull().default(false),
  consentTimestamp: timestamp("consent_timestamp"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User feedback queue (persisted when issue reported)
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 64 }),
  feedbackType: varchar("feedback_type", { length: 50 }).notNull(), // 'bug', 'feature', 'support', 'complaint'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  currentPage: varchar("current_page", { length: 500 }),
  sessionSnapshot: jsonb("session_snapshot"), // Captured session events when issue reported
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected, in_progress, resolved
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, critical
  assignedTo: integer("assigned_to").references(() => users.id),
  mrBlueResponse: text("mr_blue_response"),
  adminNotes: text("admin_notes"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin approval records
export const adminApprovals = pgTable("admin_approvals", {
  id: serial("id").primaryKey(),
  feedbackId: integer("feedback_id").references(() => userFeedback.id, { onDelete: "cascade" }),
  adminId: integer("admin_id").references(() => users.id).notNull(),
  action: varchar("action", { length: 20 }).notNull(), // 'approve', 'reject', 'assign'
  reason: text("reason"),
  executionPlan: jsonb("execution_plan"), // MB.MD task list for approved items
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Phase 1: Frontend Session Capture SDK

Create `client/src/lib/session-capture.ts`:
- Capture click events with element info
- Capture scroll position
- Capture page navigation
- Capture form interactions (not values, just field names)
- Store in memory (not sent to server unless issue reported)
- Respect consent flag

### Phase 2: GDPR Consent Component

Create consent checkbox in `client/src/components/AnalyticsConsent.tsx`:
- Show on first visit after login
- Store preference in database
- Allow user to revoke in settings
- No tracking until explicit consent

### Phase 3: Mr. Blue Context Injection

Update `/api/mrblue/chat` endpoint:
- Inject current page URL
- Inject last 10 actions from session
- Inject user's recent navigation path
- Mr. Blue sees context like: "User is on /events/123, clicked RSVP button, saw error message"

### Phase 4: Feedback Submission Flow

When user reports issue in Mr. Blue chat:
1. Mr. Blue detects intent ("I have a bug", "feature request", "need help")
2. Captures session snapshot (last 50 events)
3. Creates `userFeedback` record
4. Responds: "I've logged your feedback and sent it to our team for review."

### Phase 5: Admin Approval Queue

Create `/admin/feedback-queue` page:
- List all pending feedback
- Filter by type, priority, status
- View session snapshot (replay user's actions)
- Approve/Reject buttons
- Assign to Mr. Blue for execution

### Phase 6: God-Level Execution

When god-level admin chats with Mr. Blue about approved feedback:
1. Mr. Blue retrieves approved item with execution plan
2. Uses MB.MD 10-step workflow
3. Creates changes on feature branch (conceptually)
4. Reports progress to admin
5. Marks feedback as resolved

---

## SUCCESS CRITERIA

1. Users can give consent for session tracking
2. Mr. Blue knows what page user is on when chatting
3. Feedback is captured and queued for admin review
4. Admins can see user's session replay
5. God-level admins can instruct Mr. Blue to fix issues
6. Regular users cannot trigger code execution

---

## COGNITIVE FRAMEWORK

Use **ReAct** for implementation:
- Thought: What step am I on?
- Action: Execute the step
- Observation: Verify result
- Repeat until phase complete

---

## GOD COMMANDS APPLICABLE

- gc-001: Test before completing
- gc-002: Work Simultaneously
- gc-003: Work Recursively
- gc-009: Feature Branches Required
- gc-010: Plan Tracker Updates

---

## BEGIN EXECUTION

Follow the 10-step workflow:
1. UNDERSTAND - You have this brief
2. RESEARCH - Check existing schema, routes, components
3. PLAN - Create task list for Phase 0
4. VALIDATE - Confirm approach
5. EXECUTE - Build Phase 0
6. TEST - Verify schema syncs
7. DOCUMENT - Update plan.md
8. REVIEW - Self-critique
9. ITERATE - Fix issues
10. COMPLETE - Move to Phase 1

**Start with Phase 0: Database Schema**

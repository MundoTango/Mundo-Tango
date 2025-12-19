# MB.MD BUILD PLAN V2.0: Advanced Self-Healing
**Date:** November 21, 2025  
**Target:** Mr. Blue 97/100 → 99/100  
**Methodology:** Simultaneously, Recursively, Critically

---

## 🎯 OVERALL MB.MD PLAN

### **MVP Scope (Build First - 2 hours)**
1. **Pre-Flight Checks** - Fix issues in one shot (no chained bugs)
2. **Instant Knowledge Sharing** - Never re-learn same lesson
3. **Integration** - Hook into existing self-healing pipeline

### **Advanced Scope (Build Second - 2.5 hours)**
4. **Predictive Analysis** - Anticipate cascading issues
5. **Agent Coordination** - Multi-agent review before fixes

---

## 📋 EXECUTION PLAN (MB.MD Optimized)

### **PHASE 1: Database Schema (5 min) - SIMULTANEOUSLY**

Add 4 new tables to `shared/schema.ts`:

```typescript
// 1. Pre-Flight Checks Table
export const preFlightChecks = pgTable("pre_flight_checks", {
  id: serial("id").primaryKey(),
  pageId: varchar("page_id").notNull(),
  fixProposal: jsonb("fix_proposal").notNull(),
  importsNeeded: text("imports_needed").array(),
  providersNeeded: text("providers_needed").array(),
  dependenciesChecked: jsonb("dependencies_checked"),
  reactHooksValid: boolean("react_hooks_valid").notNull(),
  allChecksPassed: boolean("all_checks_passed").notNull(),
  blockers: text("blockers").array(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// 2. Global Agent Lessons Table (Instant Learning)
export const globalAgentLessons = pgTable("global_agent_lessons", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  context: text("context").notNull(),
  issue: text("issue").notNull(),
  solution: text("solution").notNull(),
  confidence: real("confidence").notNull(),
  appliesTo: text("applies_to").array().notNull(),
  timesApplied: integer("times_applied").default(0),
  successRate: real("success_rate").default(1.0),
  createdAt: timestamp("created_at").defaultNow(),
  lastAppliedAt: timestamp("last_applied_at"),
  metadata: jsonb("metadata"),
});

// 3. Predicted Issues Table (Predictive Analysis)
export const predictedIssues = pgTable("predicted_issues", {
  id: serial("id").primaryKey(),
  sourceIssueId: integer("source_issue_id").notNull(),
  predictedIssue: text("predicted_issue").notNull(),
  predictionType: varchar("prediction_type").notNull(),
  confidence: real("confidence").notNull(),
  affectedAgents: text("affected_agents").array(),
  preventionStrategy: text("prevention_strategy").notNull(),
  actuallyOccurred: boolean("actually_occurred"),
  createdAt: timestamp("created_at").defaultNow(),
  validatedAt: timestamp("validated_at"),
});

// 4. Agent Coordination Sessions Table
export const agentCoordinationSessions = pgTable("agent_coordination_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id").notNull().unique(),
  pageId: varchar("page_id").notNull(),
  leadAgentId: varchar("lead_agent_id").notNull(),
  participatingAgents: text("participating_agents").array().notNull(),
  issueUnderReview: jsonb("issue_under_review").notNull(),
  agentFeedback: jsonb("agent_feedback"),
  consensusReached: boolean("consensus_reached").default(false),
  unifiedFix: jsonb("unified_fix"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Insert schemas
export const insertPreFlightCheckSchema = createInsertSchema(preFlightChecks).omit({ id: true, timestamp: true });
export type InsertPreFlightCheck = z.infer<typeof insertPreFlightCheckSchema>;
export type SelectPreFlightCheck = typeof preFlightChecks.$inferSelect;

export const insertGlobalAgentLessonSchema = createInsertSchema(globalAgentLessons).omit({ id: true, createdAt: true });
export type InsertGlobalAgentLesson = z.infer<typeof insertGlobalAgentLessonSchema>;
export type SelectGlobalAgentLesson = typeof globalAgentLessons.$inferSelect;

export const insertPredictedIssueSchema = createInsertSchema(predictedIssues).omit({ id: true, createdAt: true });
export type InsertPredictedIssue = z.infer<typeof insertPredictedIssueSchema>;
export type SelectPredictedIssue = typeof predictedIssues.$inferSelect;

export const insertAgentCoordinationSessionSchema = createInsertSchema(agentCoordinationSessions).omit({ id: true, createdAt: true });
export type InsertAgentCoordinationSession = z.infer<typeof insertAgentCoordinationSessionSchema>;
export type SelectAgentCoordinationSession = typeof agentCoordinationSessions.$inferSelect;
```

Then run: `npm run db:push --force`

---

### **PHASE 2: Pre-Flight Check Service (45 min) - CRITICALLY**

Create `server/services/self-healing/PreFlightCheckService.ts`:

**Key Functions:**
1. `verifyImports(filePath, proposedCode)` - Check if all imports exist
2. `checkProviderHierarchy(componentPath)` - Verify hooks have providers
3. `analyzeDependencyChain(proposedFix)` - Map all dependencies
4. `validateReactHooks(code, componentTree)` - Check hook rules
5. `runPreFlightChecks(pageId, fixProposal)` - Main orchestrator

**Integration:** Hook into `SelfHealingService` before applying fixes

---

### **PHASE 3: Global Knowledge Base (45 min) - CRITICALLY**

Create `server/services/learning/GlobalKnowledgeBase.ts`:

**Key Functions:**
1. `saveLesson(lesson)` - Save to PostgreSQL + broadcast via Redis
2. `broadcastLesson(lesson)` - Real-time notification to all agents (<5ms)
3. `queryS imilarSolutions(context, issue)` - Find similar lessons
4. `trackApplication(lessonId)` - Update timesApplied and successRate
5. `getLessonsByAgent(agentId)` - Get all lessons for specific agent

**Integration:** Hook into `AgentLearningService.recordExecution()`

---

### **PHASE 4: Predictive Analysis Service (60 min) - RECURSIVELY**

Create `server/services/self-healing/PredictiveAnalysisService.ts`:

**Key Functions:**
1. `predictCascadingIssues(issue)` - Predict 3-5 follow-up bugs
2. `analyzeCrossAgentImpact(fix)` - Which agents are affected?
3. `identifyEdgeCases(userFlow)` - What edge cases exist?
4. `synthesizeUnifiedFix(issues, predictions)` - Create one-shot fix
5. `validatePrediction(predictedId, actualResult)` - Learning loop

**Integration:** Hook into `PageAuditService` after audits

---

### **PHASE 5: Agent Coordination Service (60 min) - SIMULTANEOUSLY**

Create `server/services/self-healing/AgentCoordinationService.ts`:

**Key Functions:**
1. `createCoordinationSession(pageId, leadAgent)` - Start multi-agent review
2. `inviteAgents(sessionId, agentIds)` - Add participating agents
3. `collectFeedback(sessionId)` - Gather insights from all agents
4. `buildConsensus(feedback)` - Synthesize unified fix
5. `executeUnifiedFix(sessionId)` - Apply consensus-based fix

**Integration:** Wrap around `SelfHealingService` for complex fixes

---

### **PHASE 6: Integration (30 min) - CRITICALLY**

Update existing services:

**1. AgentOrchestrationService.ts:**
```typescript
// Add Phase 0: Pre-Flight Checks (before Phase 1)
console.log('\n📍 PHASE 0: Pre-Flight Checks');
const preFlightResult = await PreFlightCheckService.runPreFlightChecks(pageId, auditResults);
if (!preFlightResult.allChecksPassed) {
  console.log('❌ Pre-flight checks failed - fixing blockers first');
  await this.fixBlockers(preFlightResult.blockers);
}
```

**2. SelfHealingService.ts:**
```typescript
// Before applying fix, run pre-flight checks
const preFlightCheck = await PreFlightCheckService.runPreFlightChecks(pageId, fix);
if (!preFlightCheck.allChecksPassed) {
  throw new Error(`Pre-flight failed: ${preFlightCheck.blockers.join(', ')}`);
}
```

**3. AgentLearningService.ts:**
```typescript
// After successful fix, save lesson globally
if (execution.outcome === 'success') {
  await GlobalKnowledgeBase.saveLesson({
    agentId: execution.agentId,
    context: execution.task,
    issue: execution.metadata?.issue,
    solution: execution.result,
    confidence: execution.confidence,
    appliesTo: this.getRelatedAgents(execution.agentId),
  });
}
```

---

## ✅ SUCCESS CRITERIA

### **MVP (Phase 1-3 + 6)**
- ✅ Pre-flight checks prevent chained bugs
- ✅ Lessons broadcast instantly to all agents
- ✅ Integration seamless with existing services
- ✅ E2E test passes
- ✅ Mr. Blue score: 97/100 → 98/100

### **Full System (Phase 1-6)**
- ✅ Predicts cascading issues
- ✅ Multi-agent coordination works
- ✅ One-shot fixes (1 iteration instead of 2-3)
- ✅ Mr. Blue score: 98/100 → 99/100

---

## 🚀 EXECUTION ORDER

**Decision:** Build MVP first (2 hours), validate, then add advanced features (2.5 hours)

**Step 1:** Schema changes (5 min)  
**Step 2:** PreFlightCheckService (45 min)  
**Step 3:** GlobalKnowledgeBase (45 min)  
**Step 4:** Integration (30 min)  
**Step 5:** E2E Test (15 min)  
**CHECKPOINT:** Validate MVP works, Mr. Blue 97→98

**Step 6:** PredictiveAnalysisService (60 min)  
**Step 7:** AgentCoordinationService (60 min)  
**Step 8:** Enhanced Integration (30 min)  
**Step 9:** E2E Test (15 min)  
**COMPLETE:** Mr. Blue 98→99

---

## 📊 TIMELINE

| Phase | Time | Status |
|-------|------|--------|
| Schema | 5 min | Ready to build |
| Pre-Flight | 45 min | Ready to build |
| Knowledge Base | 45 min | Ready to build |
| Integration MVP | 30 min | Ready to build |
| **MVP TOTAL** | **2 hours** | **Ready to build** |
| Predictive | 60 min | Ready to build |
| Coordination | 60 min | Ready to build |
| Integration Full | 30 min | Ready to build |
| **FULL TOTAL** | **4.5 hours** | **Ready to build** |

---

## ✅ READY TO EXECUTE

**Decision Point:** Build MVP now or Full System?

**Recommendation:** Build MVP (2 hours), validate with E2E test, then decide if advanced features needed

**Let's build! 🚀**

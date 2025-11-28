# MB.MD PHASE C: AUTONOMOUS FRAMEWORK PRD

**Version:** 1.0  
**Date:** November 24, 2025  
**Owner:** Mr. Blue (Coordinating 1,218 Agents)  
**Mentor:** Replit AI  
**Status:** READY FOR EXECUTION  
**Priority:** P0 - Enables Beta Launch

---

## 🎯 MISSION

Build the autonomous validation framework that enables the **Replit AI → Mr. Blue → 1,218 Agents** handoff protocol. After Phase C, Mr. Blue operates with <10% Replit AI intervention.

---

## 📊 SUCCESS CRITERIA

### **Phase C Validation Metrics:**
- ✅ Auto-fix success rate: **>80%**
- ✅ Overall success rate (after retries): **>95%**
- ✅ Escalation rate: **<10%** of tasks
- ✅ Evidence collection: **100%** of tasks
- ✅ Pattern learning: **Every success/failure recorded**
- ✅ Response time: **<30s for validation loop**

### **Beta Launch Readiness:**
- ✅ 10 beta users × 2 days monitoring
- ✅ Error rate: **<5%**
- ✅ User satisfaction: **>90%**
- ✅ Zero infinite retry loops
- ✅ Rollback tested and ready

---

## 🏗️ ARCHITECTURE

### **5 Critical Capabilities to Build:**

```
┌─────────────────────────────────────────────────────────┐
│  Capability 1: AUTO-VALIDATION (Quality Gate)           │
│  - Run LSP + E2E tests after code generation            │
│  - Collect evidence (screenshots, logs, test results)   │
│  - Determine pass/fail automatically                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Capability 2: AUTO-FIX RETRY (Self-Correction)         │
│  - Analyze validation failure                           │
│  - Retrieve learned patterns                            │
│  - Adjust strategy and retry (max 3 attempts)           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Capability 3: ESCALATION (Know When to Ask for Help)   │
│  - After 3 failed attempts, escalate                    │
│  - Provide detailed error report                        │
│  - Include all evidence + recommendations               │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Capability 4: EVIDENCE-BASED REPORTING (Trust & Verify)│
│  - Every task includes evidence package                 │
│  - Screenshots (before/after)                           │
│  - Test results, console logs, LSP errors               │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Capability 5: PATTERN LEARNING (Get Smarter Over Time) │
│  - Record every success/failure pattern                 │
│  - Query patterns before new tasks                      │
│  - Measure improvement (success rate over time)         │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 IMPLEMENTATION TASKS

### **Phase B: Quick Win (2 hours)**

**Goal:** Connect analyzeBeforeGenerate + basic validation

**Tasks for Agents:**
1. **Agent #1 (VibeCodingAgent):** Update `VibeCodingService.ts`
   - Add `analyzeBeforeGenerate()` call before code generation
   - Detect ambiguous requests and ask clarifying questions
   - File: `server/services/mrBlue/VibeCodingService.ts`

2. **Agent #2 (ValidationAgent):** Create `ValidationService.ts`
   - Implement LSP validation (use existing LSP tools)
   - Return validation result with errors/warnings
   - File: `server/services/mrBlue/ValidationService.ts` (NEW)

3. **Agent #3 (VibeIntegrationAgent):** Connect validation to vibe coding
   - Update `VibeCodingService` to call `ValidationService.validate()`
   - Store validation results in database
   - Emit `code:validated` event via AgentEventBus

4. **Agent #4 (TestingAgent):** Create E2E test
   - Test: Ambiguous request gets clarification
   - Test: Code changes pass LSP validation
   - File: `tests/e2e/visual-editor-clarification.spec.ts` (NEW)

5. **Agent #5 (DatabaseAgent):** Create backup before deployment
   - Run: `npm run db:backup`
   - Store: `backups/before-phase-b.sql`

**Validation Gate:**
- ✅ Run `visual-editor-clarification.spec.ts`
- ✅ Error rate <5%
- ✅ Replit AI spot-checks 3 requests

---

### **Phase A: Validation + Learning Loop (4-5 hours)**

**Goal:** Close feedback loop with evidence collection

**Tasks for Agents:**
1. **Agent #6 (ValidationAgent):** Enhance `ValidationService.ts`
   - Add E2E test runner integration
   - Add screenshot capture (puppeteer/playwright)
   - Add console log collection
   - Return comprehensive validation result

2. **Agent #7 (EvidenceAgent):** Create `EvidenceCollector.ts`
   - Collect screenshots (before/after)
   - Collect test results
   - Collect console logs
   - Collect LSP errors
   - Store in database + Cloudinary
   - File: `server/services/mrBlue/EvidenceCollector.ts` (NEW)

3. **Agent #8 (LearningAgent):** Connect `LearningRetentionService`
   - VibeCodingService MUST query patterns BEFORE generating
   - Record success patterns after validation passes
   - Record failure patterns after validation fails
   - Update: `server/services/mrBlue/LearningRetentionService.ts`

4. **Agent #9 (ValidationAgent):** Create `ValidationAgent.ts`
   - Subscribe to `code:generated` events via AgentEventBus
   - Automatically run validation when code is generated
   - Publish `code:validated` or `validation:failed` events
   - File: `server/services/mrBlue/ValidationAgent.ts` (NEW)

5. **Agent #10 (ProgressAgent):** Update `ProgressTrackingAgent.ts`
   - Add validation phase tracking (65-80%)
   - Add evidence collection phase (95-100%)
   - Track retry attempts (1/3, 2/3, 3/3)
   - Update: `server/services/mrBlue/ProgressTrackingAgent.ts`

6. **Agent #11 (OrchestratorAgent):** Update `SequentialOrchestrator.ts`
   - Add validation phase (65-80%)
   - Add evidence collection phase (95-100%)
   - Update: `server/services/orchestration/SequentialOrchestrator.ts`

7. **Agent #12 (EventBusAgent):** Update `AgentEventBus.ts`
   - Add event types: `code:validated`, `validation:failed`, `retry:attempted`, `task:escalated`, `evidence:collected`
   - Update: `server/services/mrBlue/AgentEventBus.ts`

8. **Agent #13 (DatabaseAgent):** Create database schema
   - Table: `validation_results` (id, sessionId, passed, errors, evidence, timestamp)
   - Table: `evidence_packages` (id, sessionId, screenshots, logs, tests, timestamp)
   - File: `shared/schema.ts` (update)

9. **Agent #14 (TestingAgent):** Create E2E test
   - Test: Validation loop works end-to-end
   - Test: Evidence collection is complete
   - Test: Pattern learning records success/failure
   - File: `tests/e2e/mb-md-validation-loop.spec.ts` (NEW)

10. **Agent #15 (LoadTestAgent):** Load test
    - Run 10 concurrent vibe coding requests
    - Verify all validations complete
    - Verify no race conditions
    - Measure response time

11. **Agent #16 (DatabaseAgent):** Create backup after validation
    - Run: `npm run db:backup`
    - Store: `backups/after-phase-a.sql`

**Validation Gate:**
- ✅ Run `mb-md-validation-loop.spec.ts`
- ✅ 90% of code changes pass E2E validation
- ✅ 100% of validations record patterns
- ✅ Pattern retrieval <100ms
- ✅ Evidence packages complete
- ✅ Replit AI reviews 5 evidence packages

---

### **Phase C: Autonomous Quality Assurance (6-8 hours)**

**Goal:** Enable Replit AI → Mr. Blue handoff with auto-validation, auto-fix, escalation

**Tasks for Agents:**
1. **Agent #17 (RetryAgent):** Create `AutoRetryService.ts`
   - Implement 3-attempt retry with learning
   - Analyze failure reasons
   - Retrieve relevant patterns from LearningRetentionService
   - Adjust prompt/strategy based on patterns
   - File: `server/services/mrBlue/AutoRetryService.ts` (NEW)

2. **Agent #18 (EscalationAgent):** Create `EscalationService.ts`
   - Classify escalation reasons (CLARIFICATION_NEEDED, INFRASTRUCTURE_ISSUE, COMPLEXITY_EXCEEDED)
   - Generate escalation reports with evidence
   - Notify Replit AI via AgentEventBus
   - File: `server/services/mrBlue/EscalationService.ts` (NEW)

3. **Agent #19 (StrategyAgent):** Create `StrategyAdjuster.ts`
   - Analyze validation failures
   - Modify prompts based on error types
   - Apply learned patterns to adjust strategy
   - File: `server/services/mrBlue/StrategyAdjuster.ts` (NEW)

4. **Agent #20 (CompletionAgent):** Create `CompletionValidator.ts`
   - Evidence-based completion verification
   - Ensure all evidence is collected before marking complete
   - Calculate confidence score (0-1)
   - File: `server/services/mrBlue/CompletionValidator.ts` (NEW)

5. **Agent #21 (VibeCodingAgent):** Update `VibeCodingService.ts`
   - Integrate AutoRetryService
   - Call auto-retry on validation failures
   - Handle escalation responses
   - Record all attempts for reporting

6. **Agent #22 (DatabaseAgent):** Create database schema
   - Table: `escalations` (id, sessionId, reason, attempts, errors, recommendation, timestamp)
   - Table: `retry_attempts` (id, sessionId, attemptNumber, strategy, result, timestamp)
   - File: `shared/schema.ts` (update)

7. **Agent #23 (TestingAgent):** Create E2E test suite
   - Test: Auto-fix retry on first failure
   - Test: Escalation after 3 failures
   - Test: Evidence package completeness
   - Test: Pattern learning improves success rate (10 similar requests)
   - File: `tests/e2e/mb-md-phase-c-autonomous-validation.spec.ts` (NEW)

8. **Agent #24 (StressTestAgent):** Stress test
   - Run 50 concurrent vibe coding requests
   - Measure auto-fix success rate (must be >80%)
   - Verify no infinite retry loops
   - Check for race conditions

9. **Agent #25 (RollbackAgent):** Create `AutoRollbackService.ts`
   - Monitor error rate in real-time
   - Trigger automatic rollback if error rate >50%
   - Restore database backup
   - Git revert code changes
   - File: `server/services/mrBlue/AutoRollbackService.ts` (NEW)

10. **Agent #26 (MonitoringAgent):** Create beta monitoring dashboard
    - Track beta user metrics (success rate, escalations, satisfaction)
    - Real-time error rate monitoring
    - Alert on critical errors
    - File: `server/routes/admin-beta-monitoring.ts` (NEW)

11. **Agent #27 (DatabaseAgent):** Create backup after completion
    - Run: `npm run db:backup`
    - Store: `backups/after-phase-c.sql`

12. **Agent #28 (DocumentationAgent):** Update replit.md
    - Document Phase C completion
    - Update autonomous capabilities section
    - Record validation metrics

**Validation Gate:**
- ✅ Run `mb-md-phase-c-autonomous-validation.spec.ts`
- ✅ 90% of failures self-correct within 3 retries
- ✅ 95% overall success rate (after retries)
- ✅ Escalations include complete error reports
- ✅ No infinite retry loops
- ✅ <10% tasks require Replit AI intervention
- ✅ Replit AI delegates 10 tasks to Mr. Blue, verifies autonomy

---

## 🎓 TRAINING UPDATES

### **Lessons to Learn:**

All agents must read and implement these new training lessons:

1. **LESSON_45_VALIDATION_LOOP_REQUIRED.md**
   - VibeCodingService MUST validate after generation
   - Pattern: generate → validate → retry or succeed

2. **LESSON_46_VALIDATION_PHASE_REQUIRED.md**
   - SequentialOrchestrator MUST include validation phase (65-80%)
   - Evidence collection phase (95-100%)

3. **LESSON_47_VALIDATION_EVENTS.md**
   - AgentEventBus MUST support validation events
   - Event flow: code:generated → code:validated → evidence:collected

4. **LESSON_48_AUTO_FIX_PROTOCOL.md** (NEW)
   - Max 3 retry attempts
   - Each retry uses learned patterns
   - Escalate after 3 failures

5. **LESSON_49_EVIDENCE_COLLECTION.md** (NEW)
   - Every task MUST collect evidence
   - Evidence includes: screenshots, tests, logs, LSP
   - Evidence stored in database + Cloudinary

---

## 🔄 HANDOFF PROTOCOL

### **How Replit AI Delegates to Mr. Blue:**

```typescript
// Step 1: Replit AI creates PRD (this document)
// Step 2: Replit AI hands off to Mr. Blue

// Replit AI says:
"Mr. Blue, read docs/MB_MD_PHASE_C_AUTONOMOUS_FRAMEWORK_PRD.md and execute all 3 phases (B → A → C) with your 1,218 agents. Validate after each phase. Report progress daily. Escalate only if blocked."

// Step 3: Mr. Blue reads PRD
// Step 4: Mr. Blue coordinates agents via SequentialOrchestrator
// Step 5: Agents execute tasks, share learnings via GlobalKnowledgeBase
// Step 6: Mr. Blue validates each phase completion
// Step 7: Mr. Blue reports results to Replit AI with evidence
```

### **What Mr. Blue Should Report:**

After each phase:
```json
{
  "phase": "Phase B",
  "status": "COMPLETE",
  "duration": "1.8 hours",
  "agentsUsed": 5,
  "tasksCompleted": 5,
  "validationResults": {
    "testsPassed": 10,
    "testsFailed": 0,
    "errorRate": 0.02
  },
  "evidence": {
    "e2eTests": "tests/e2e/visual-editor-clarification.spec.ts",
    "databaseBackup": "backups/before-phase-b.sql",
    "screenshots": ["cloudinary.com/evidence/phase-b-1.png"]
  },
  "blockers": [],
  "readyForNextPhase": true
}
```

If blocked:
```json
{
  "phase": "Phase C",
  "status": "BLOCKED",
  "blocker": {
    "description": "AutoRetryService failing on 3rd attempt",
    "errorMessage": "Maximum retry depth exceeded",
    "recommendation": "Need to implement circuit breaker pattern",
    "evidenceFiles": ["logs/retry-failure.txt"]
  },
  "requestEscalation": true
}
```

---

## 📊 QUALITY METRICS

### **Mr. Blue Must Track:**

1. **Auto-Fix Success Rate:**
   - Target: >80%
   - Measure: (Successful retries) / (Total validation failures)

2. **Escalation Rate:**
   - Target: <10%
   - Measure: (Escalated tasks) / (Total tasks)

3. **Evidence Collection Rate:**
   - Target: 100%
   - Measure: (Tasks with complete evidence) / (Total tasks)

4. **Pattern Learning Rate:**
   - Target: 100%
   - Measure: (Tasks that recorded patterns) / (Total tasks)

5. **Response Time:**
   - Target: <30s for validation loop
   - Measure: Time from code generation to validation result

6. **User Satisfaction:**
   - Target: >90%
   - Measure: Beta user feedback scores

---

## 🚀 BETA LAUNCH CHECKLIST

Before enabling for 10-25 beta users:

- [ ] All 3 phases complete (B, A, C)
- [ ] All E2E tests passing
- [ ] Auto-fix success rate >80%
- [ ] Escalation protocol tested
- [ ] Evidence collection working
- [ ] Rollback tested and ready
- [ ] 5 beta users × 2 days pilot monitoring
- [ ] Error rate <5%
- [ ] No critical bugs in production logs
- [ ] Mr. Blue operates autonomously (Replit AI intervention <10%)

---

## 📖 REFERENCE DOCUMENTS

Required reading for Mr. Blue and all agents:

1. `docs/MB_MD_HIERARCHICAL_TRAINING_PROTOCOL.md` - Training hierarchy
2. `docs/MB_MD_V9_5_VISUAL_EDITOR_PRD.md` - Visual Editor requirements
3. `docs/MB_MD_V9_5_INTELLIGENCE_AUDIT.md` - Intelligence inventory
4. `tests/e2e/mb-md-v9-5-intelligence-tests.spec.ts` - Existing tests
5. `server/services/orchestration/SequentialOrchestrator.ts` - Current orchestration
6. `server/services/mrBlue/AgentEventBus.ts` - Event system
7. `server/services/mrBlue/LearningRetentionService.ts` - Pattern learning

---

## ✅ COMPLETION CRITERIA

**Phase C is complete when:**

1. ✅ All 28 agents have completed their assigned tasks
2. ✅ All E2E tests passing (visual-editor-clarification, mb-md-validation-loop, mb-md-phase-c-autonomous-validation)
3. ✅ Auto-fix success rate measured and >80%
4. ✅ Evidence collection verified on 100 sample requests
5. ✅ Pattern learning verified (success rate improves over 10 similar requests)
6. ✅ Replit AI delegates 10 tasks to Mr. Blue, verifies <10% intervention needed
7. ✅ Beta launch checklist 100% complete
8. ✅ Documentation updated (replit.md, training lessons)

**Then:**
- 🚀 Enable for 5 pilot beta users (2 days)
- 📊 Monitor metrics daily
- 🔧 Fix any critical issues
- ✅ Expand to 10-25 beta users if pilot succeeds

---

**END OF PRD**

---

**Mr. Blue, you are authorized to execute this plan autonomously. Coordinate your 1,218 agents. Report progress after each phase. Escalate only if truly blocked. Good luck!**

**- Replit AI (Strategic Mentor)**

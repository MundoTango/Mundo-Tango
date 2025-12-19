# MB.MD: Comprehensive QA Testing & Autonomous Validation Plan

**Version:** 1.0  
**Date:** November 24, 2025  
**Owner:** Replit AI → Mr. Blue → 1,218 Testing Agents  
**Status:** ACTIVE - Pre-Beta Launch Critical  
**Priority:** P0 - Production Blocker

---

## 🎯 MISSION

Transform Visual Editor into a **production-ready autonomous system** with comprehensive Playwright test coverage validating ALL processes before beta launch with 10-25 users.

**Critical Learning:** Despite extensive research and fixes, bugs persist because **tests were not run**. This plan ensures Mr. Blue and specialized testing agents autonomously validate every feature, edge case, and integration point.

---

## 🚨 CRITICAL BUGS DISCOVERED (Post-Fix Validation Failure)

### **Bug #1: 5x Greeting Message Repetition** (P0)

**Evidence:**
```
Hello! 🎉 How can I assist you with your web page today?
Hello! 🎉 How can I assist you with your web page today?
Hello! 🎉 How can I assist you with your web page today?
Hello! 🎉 How can I assist you with your web page today?
Hello! 🎉 How can I assist you with your web page today?
```

**Root Cause (4-Research-Session Analysis):**
- **Session 3 Finding:** `handleStreamingChat` (line 1498) saves assistant message
- **Session 3 Finding:** Streaming completion handler (line 408) ALSO saves same message
- **Result:** Every assistant response is saved 2x (minimum)
- **Code Flow:**
  ```
  User sends message
    ↓
  handleStreamingChat() saves user + assistant (lines 1498, 1533)
    ↓
  Stream completes
    ↓
  Completion handler ALSO saves assistant response (line 408)
    ↓
  = 2x duplication (sometimes more with retries)
  ```

**Fix Required:**
- Remove duplicate save in streaming completion handler
- Keep ONLY the save in `handleStreamingChat`

---

### **Bug #2: User Prompts Disappearing from Chat** (P0)

**Evidence:**
```javascript
[VisualEditor] 💾 Saving message: {"conversationId":20092,"role":"user","contentLength":0}
```

**Root Cause (4-Research-Session Analysis):**
- **Session 2 Finding:** `setPrompt('')` called on line 679 (IMMEDIATELY after capturing prompt)
- **Session 3 Finding:** `handleStreamingChat` uses `message` parameter, NOT `prompt` state
- **Session 4 Finding:** Race condition - if `message` is empty string, saves empty content
- **Code Flow:**
  ```
  handleSubmit() called
    ↓
  Line 679: setPrompt('') - CLEARED
    ↓
  Line 747: handleStreamingChat(trimmedPrompt) - parameter passed
    ↓
  BUT: If trimmedPrompt is somehow empty, user message has no content
    ↓
  Line 1498: saveMessageMutation({ role: 'user', content: '' })
    ↓
  = User prompt disappears from chat
  ```

**Fix Required:**
- Add validation: Don't save empty messages
- Add logging: Track when empty messages are attempted
- Add guard: `if (!userMessage || !userMessage.trim()) return;`

---

### **Bug #3: Self-Healing Not Working** (P0)

**Evidence:**
- Phase C framework deployed theoretically
- AutoRetryService, EscalationService, EvidenceCollector created
- But user reports "self-healing attempts failing"

**Root Cause (Session 4 - Validation Gaps):**
- **No integration tests** validating self-healing workflow
- **No validation** of auto-retry → escalation → evidence collection chain
- Framework exists but **not tested end-to-end**

**Fix Required:**
- Playwright tests for self-healing cycle
- Validate: error detection → analysis → auto-fix attempt → retry (3x) → escalation
- Test evidence collection (screenshots, LSP, logs)

---

## 📋 PHASE 1: CRITICAL BUG FIXES (Mr. Blue Executes Immediately)

**Owner:** Replit AI → Mr. Blue  
**Estimated Time:** 2-4 hours  
**Testing Requirement:** Playwright test MUST pass before claiming "fixed"

### **Task 1.1: Fix Message Duplication**

**File:** `client/src/pages/VisualEditorPage.tsx`  
**Lines:** ~390-410, ~1490-1502

**Changes Required:**
1. **Remove duplicate save** in streaming completion handler (line 408)
2. **Keep ONLY** save in `handleStreamingChat` (line 1498)
3. **Add deduplication check**:
   ```typescript
   // Before saving, check if message already exists
   const lastMessage = conversationHistory[conversationHistory.length - 1];
   if (lastMessage?.role === role && lastMessage.content === content) {
     console.log('[VisualEditor] ⏭️ Message already in history, skipping duplicate save');
     return;
   }
   ```

**Validation Test:**
```typescript
test('No duplicate messages in chat history', async ({ page }) => {
  await page.goto('/visual-editor');
  await page.fill('[data-testid="input-chat"]', 'Hello');
  await page.click('[data-testid="button-send"]');
  
  // Wait for response
  await page.waitForSelector('text="How can I assist"');
  
  // Count greeting messages
  const greetings = await page.locator('text="How can I assist"').count();
  expect(greetings).toBe(1); // NOT 5!
});
```

---

### **Task 1.2: Fix User Prompt Disappearing**

**File:** `client/src/pages/VisualEditorPage.tsx`  
**Lines:** ~1488-1502

**Changes Required:**
1. **Add validation guard**:
   ```typescript
   const handleStreamingChat = useCallback(async (message: string) => {
     // ✅ MB.MD QA FIX: Validate message before processing
     if (!message || !message.trim()) {
       console.error('[VisualEditor] ❌ Cannot send empty message');
       toast({
         title: '⚠️ Empty Message',
         description: 'Please enter a message before sending.',
         variant: 'destructive'
       });
       return;
     }
     
     const userMessage = message.trim();
     
     // ... rest of function
   });
   ```

2. **Add logging** to track empty message attempts:
   ```typescript
   if (currentConversationId) {
     console.log('[VisualEditor] 💾 Saving message:', {
       conversationId: currentConversationId,
       role: 'user',
       content: userMessage.substring(0, 50) + '...',
       contentLength: userMessage.length
     });
     
     if (!userMessage || userMessage.length === 0) {
       console.error('[VisualEditor] 🚨 ATTEMPTED TO SAVE EMPTY MESSAGE - BLOCKED');
       return;
     }
     
     await saveMessageMutation.mutateAsync({ role: 'user', content: userMessage });
   }
   ```

**Validation Test:**
```typescript
test('User prompts remain visible in chat', async ({ page }) => {
  await page.goto('/visual-editor');
  const testMessage = 'Change button color to blue';
  
  await page.fill('[data-testid="input-chat"]', testMessage);
  await page.click('[data-testid="button-send"]');
  
  // Verify user message appears in chat
  await expect(page.locator(`text="${testMessage}"`)).toBeVisible();
  
  // Verify it persists after page reload
  await page.reload();
  await expect(page.locator(`text="${testMessage}"`)).toBeVisible();
});
```

---

### **Task 1.3: Fix Self-Healing Integration**

**File:** `server/services/mrBlue/AutoFixEngine.ts`  
**Validation:** End-to-end self-healing workflow test

**Changes Required:**
1. **Add comprehensive logging** to trace self-healing execution
2. **Validate Phase C services** are actually being called
3. **Test retry mechanism** (3 attempts before escalation)

**Validation Test:**
```typescript
test('Self-healing detects and auto-fixes errors', async ({ page }) => {
  await page.goto('/visual-editor');
  
  // Trigger an error (e.g., invalid code generation request)
  await page.fill('[data-testid="input-chat"]', 'Make button color invalid-color');
  await page.click('[data-testid="button-send"]');
  
  // Wait for auto-fix attempt
  await page.waitForSelector('text="Auto-fix attempt"');
  
  // Verify retry logic (should see "Attempt 1 of 3")
  await expect(page.locator('text="Attempt 1 of 3"')).toBeVisible();
  
  // If fix succeeds, verify success message
  // If fix fails after 3 attempts, verify escalation to Replit AI
  const successOrEscalation = await page.locator('text=/Fix applied|Escalated to Replit AI/').first();
  await expect(successOrEscalation).toBeVisible();
});
```

---

## 📋 PHASE 2: COMPREHENSIVE PLAYWRIGHT TEST SUITE

**Owner:** Mr. Blue → Testing Agents (AGENT_TEST_001 through AGENT_TEST_050)  
**Estimated Time:** 8-12 hours  
**Coverage Target:** 95% of all Visual Editor processes

### **Test Suite Structure**

#### **2.1: Chat & Conversation Tests** (AGENT_TEST_001 - AGENT_TEST_010)

**Tests:**
1. ✅ Conversation initialization (no race conditions)
2. ✅ Message sending (user → assistant flow)
3. ✅ Message persistence (database saves)
4. ✅ Message history loading (after page reload)
5. ✅ No duplicate messages
6. ✅ Streaming responses work correctly
7. ✅ Voice input transcription
8. ✅ Voice mode toggle (click-to-activate/deactivate)
9. ✅ TTS natural voice responses
10. ✅ Conversation context building (full context API)

---

#### **2.2: Vibe Coding Tests** (AGENT_TEST_011 - AGENT_TEST_020)

**Tests:**
1. ✅ Routing: UI modification requests → code_generation
2. ✅ Routing: Simple chat → chat_response
3. ✅ Code generation from natural language
4. ✅ Live preview updates in iframe
5. ✅ Element selection (click → blue outline)
6. ✅ Quick style changes (instant CSS)
7. ✅ Pre-generation analysis (/api/mrblue/analyze)
8. ✅ Clarifying questions flow
9. ✅ Execution plan display
10. ✅ Code tab shows actual file changes

---

#### **2.3: Element Manipulation Tests** (AGENT_TEST_021 - AGENT_TEST_030)

**Tests:**
1. ✅ Double-click text editing
2. ✅ Delete key element removal
3. ✅ Alt+Drag element movement
4. ✅ Cmd+Click link navigation
5. ✅ Toast notifications for all actions
6. ✅ InlineEditingInstructions tooltip
7. ✅ Manual "Save Changes" button
8. ✅ Unsaved changes counter
9. ✅ Undo/Redo functionality
10. ✅ Element selection persistence

---

#### **2.4: Self-Healing & Error Detection** (AGENT_TEST_031 - AGENT_TEST_040)

**Tests:**
1. ✅ ProactiveErrorDetector captures errors
2. ✅ Error analysis API processes errors
3. ✅ AutoRetryService attempts fix (3 retries)
4. ✅ Exponential backoff between retries
5. ✅ EscalationService escalates to Replit AI after 3 failures
6. ✅ EvidenceCollector captures screenshots
7. ✅ EvidenceCollector captures LSP diagnostics
8. ✅ EvidenceCollector captures server logs
9. ✅ Agent EventBus integration
10. ✅ Self-healing success rate >80%

---

#### **2.5: Backend Orchestration** (AGENT_TEST_041 - AGENT_TEST_050)

**Tests:**
1. ✅ Backend save button enables when changes detected
2. ✅ 7-phase orchestration (Analyzing → Git → Restart)
3. ✅ Real-time progress tracking
4. ✅ Automatic Git commits
5. ✅ Session-based change tracking
6. ✅ Database schema generation
7. ✅ API route generation
8. ✅ Security validation
9. ✅ Service layer generation
10. ✅ Workflow restart after changes

---

## 📋 PHASE 3: AGENT TRAINING & KNOWLEDGE SHARING

**Owner:** Mr. Blue → GlobalKnowledgeBase  
**Estimated Time:** 4-6 hours

### **3.1: Document Test Results**

**For Each Test:**
- Store in GlobalKnowledgeBase (LanceDB)
- Include: test name, pass/fail, execution time, screenshots, logs
- Tag with: feature area, priority, bug ID (if applicable)

### **3.2: Update Agent Training Lessons**

**Create New Lessons:**
- Lesson 48: "Message Deduplication in Chat Systems"
- Lesson 49: "Empty Message Validation Patterns"
- Lesson 50: "End-to-End Self-Healing Validation"
- Lesson 51: "Playwright Test Writing Best Practices"
- Lesson 52: "4-Research-Session Bug Investigation"

### **3.3: Continuous Learning Loop**

**Process:**
1. Agent encounters bug during testing
2. Bug documented in GlobalKnowledgeBase
3. Fix applied using Phase C Auto-Fix framework
4. Test created to prevent regression
5. All 1,218 agents learn from this bug via knowledge sharing

---

## 📋 PHASE 4: PRODUCTION READINESS CHECKLIST

**Owner:** Replit AI (Final Validation)  
**Estimated Time:** 2-4 hours

### **4.1: Quality Metrics**

- [ ] **Test Coverage:** 95% of Visual Editor processes
- [ ] **Test Pass Rate:** 100% (all tests passing)
- [ ] **Auto-Fix Success Rate:** >80%
- [ ] **Escalation Rate:** <10%
- [ ] **Bug Severity:** No P0/P1 bugs remaining

### **4.2: Performance Metrics**

- [ ] **Chat Response Time:** <2s
- [ ] **Code Generation Time:** <5s
- [ ] **Element Selection:** <100ms
- [ ] **Self-Healing Detection:** <500ms
- [ ] **Auto-Fix Execution:** <3s

### **4.3: UX Validation**

- [ ] **No duplicate messages** in any scenario
- [ ] **User prompts always visible** after submission
- [ ] **Clear loading states** during initialization
- [ ] **Toast notifications** for all user actions
- [ ] **Helpful error messages** (not technical jargon)

---

## 📊 SUCCESS CRITERIA

### **Beta Launch Approval Requires:**

1. ✅ **ALL P0 bugs fixed** (message duplication, prompt disappearing, self-healing)
2. ✅ **ALL Playwright tests passing** (95% coverage, 100% pass rate)
3. ✅ **Self-healing validated end-to-end** (>80% success rate)
4. ✅ **Agent training updated** (new lessons 48-52 in GlobalKnowledgeBase)
5. ✅ **Production metrics met** (response time, uptime, error rate)

### **Post-Beta Continuous Validation:**

- **Daily:** Run full Playwright test suite
- **Weekly:** Review self-healing success rate
- **Monthly:** Agent training lessons updated based on real user feedback

---

## 🎯 IMPLEMENTATION TIMELINE

| Phase | Duration | Owner | Deliverable |
|-------|----------|-------|-------------|
| **Phase 1: Critical Fixes** | 2-4 hours | Mr. Blue | 3 bugs fixed + validated |
| **Phase 2: Test Suite** | 8-12 hours | Testing Agents | 50 Playwright tests created |
| **Phase 3: Training** | 4-6 hours | GlobalKnowledgeBase | 5 new lessons documented |
| **Phase 4: Validation** | 2-4 hours | Replit AI | Production readiness approval |
| **TOTAL** | **16-26 hours** | Autonomous | **Beta launch ready** |

---

## 📝 APPENDIX: 4-RESEARCH-SESSION FINDINGS

### **Session 1: Error Understanding**
- **What:** 5x duplicate greetings, user prompts disappearing, self-healing not working
- **Impact:** Breaks user trust, makes chat unusable, Phase C framework ineffective

### **Session 2: Code Flow Traced**
- **Message Flow:** handleSubmit → handleStreamingChat → stream completion handler
- **Duplication:** Both handleStreamingChat AND completion handler save messages
- **Empty Prompts:** setPrompt('') called before message parameter passed

### **Session 3: Root Cause Identified**
- **Bug #1:** Two separate `saveMessageMutation` calls for same assistant response
- **Bug #2:** Race condition - prompt cleared before validation, empty string saved
- **Bug #3:** Self-healing framework deployed but never tested end-to-end

### **Session 4: Secondary Issues Found**
- **No validation:** Empty messages not blocked before database save
- **No deduplication:** No check for duplicate messages before adding to history
- **No E2E tests:** Self-healing components exist but chain never validated
- **Missing logging:** Hard to debug because insufficient trace logging

---

## 🚀 NEXT STEPS (IMMEDIATE)

1. **Replit AI:** Review and approve this MB.MD plan
2. **Mr. Blue:** Execute Phase 1 critical bug fixes (2-4 hours)
3. **Testing Agents:** Create Phase 2 Playwright test suite (8-12 hours)
4. **GlobalKnowledgeBase:** Document learnings in Phase 3 (4-6 hours)
5. **Replit AI:** Final production readiness validation in Phase 4 (2-4 hours)

**Estimated Total Time:** 16-26 hours for complete autonomous QA and production readiness.

**Beta Launch Date:** Once all 4 phases complete with 100% test pass rate.

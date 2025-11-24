# MB.MD QA: Comprehensive Mr. Blue Test Plan

**Date:** November 24, 2025  
**Status:** Ready for Implementation  
**Testing Method:** Playwright E2E with Real User Scenarios  
**Auth:** admin@mundotango.life / admin123

---

## 🎯 TEST OBJECTIVES

1. **Validate Mr. Blue's Vibe Coding** - Does he generate code for UI modification requests?
2. **Validate Chat Routing** - Does he handle conversational questions properly?
3. **Validate Voice Input** - Does click-to-toggle voice mode work end-to-end?
4. **Validate Self-Healing** - Does the framework auto-fix errors when they occur?
5. **Validate Message Persistence** - Do messages survive page reloads?

---

## 📋 TEST BATTERY: 15 REALISTIC PROMPTS

### **CATEGORY 1: UI Modifications (Vibe Coding)** 🎨
These should trigger code generation, NOT just chat responses.

1. **"Make the header background transparent"**
   - Expected: Code generation → CSS changes → file updates visible
   - Validation: Check for file tree updates, code diff shown

2. **"Change button color to ocean blue"**
   - Expected: Tailwind class update or inline style change
   - Validation: Visual change in iframe preview

3. **"Add 20px padding to this container"**
   - Expected: Padding class added (p-5 or similar)
   - Validation: Element inspector shows updated padding

4. **"Make text bigger and bold"**
   - Expected: Font size + font weight classes updated
   - Validation: Typography changes visible in preview

5. **"Center align all text in this section"**
   - Expected: text-center class added
   - Validation: Visual alignment change

### **CATEGORY 2: Conversational Questions (Chat)** 💬
These should trigger chat responses, NOT code generation.

6. **"What can you do?"**
   - Expected: Chat response explaining capabilities
   - Validation: No code generation, only assistant message

7. **"How do I make a button clickable?"**
   - Expected: Helpful explanation, maybe code example in chat
   - Validation: Response appears in chat history

8. **"What's the difference between margin and padding?"**
   - Expected: Educational response
   - Validation: No file changes, chat-only response

### **CATEGORY 3: Complex Multi-Step Requests** 🔧
These test Mr. Blue's planning and research capabilities.

9. **"Create a hero section with image background and centered title"**
   - Expected: Multi-component generation
   - Validation: Multiple file changes, structured code

10. **"Make a responsive navigation bar with dropdown menu"**
    - Expected: Complex component with state management
    - Validation: Multiple files updated (component + styles)

### **CATEGORY 4: Clarification Needed** ❓
These should trigger Mr. Blue to ask for more information.

11. **"Change the color"**
    - Expected: "Which element?" or "What color?"
    - Validation: Clarification question in chat

12. **"Make it bigger"**
    - Expected: "Which element would you like to make bigger?"
    - Validation: Follow-up question appears

### **CATEGORY 5: Error Recovery** 🔄
These test self-healing when things go wrong.

13. **Send empty message** (just whitespace)
    - Expected: Blocked before save, error toast shown
    - Validation: No empty messages in database

14. **Send message before conversation initialized**
    - Expected: "Initializing Mr. Blue..." toast, retry logic kicks in
    - Validation: Conversation created, then message sent

15. **Network failure simulation**
    - Expected: Error detection → Auto-retry → Escalation if needed
    - Validation: Error logged, user notified, self-healing attempted

---

## 🎤 VOICE INPUT TEST SCENARIOS

### **Voice Test 1: Click-to-Toggle Mode**
1. Click mic button → starts listening
2. Speak: "Make this button blue"
3. Click mic button again → stops listening
4. Expected: Transcript appears, code generation triggered

### **Voice Test 2: Continuous Mode**
1. Click mic button
2. Speak multiple sentences without stopping
3. Expected: Full transcript captured

### **Voice Test 3: Voice + Text Hybrid**
1. Use voice for one message
2. Use text for next message
3. Expected: Both methods work seamlessly

---

## 🔍 VALIDATION CHECKPOINTS

For EACH test prompt, validate:

### **1. Message Persistence**
- ✅ User message appears in chat immediately
- ✅ User message persists after page reload
- ✅ Assistant response appears (code or chat)
- ✅ No duplicate messages

### **2. Routing Correctness**
- ✅ UI modifications → Code generation
- ✅ Questions → Chat responses
- ✅ Complex requests → Planning + execution

### **3. User Feedback**
- ✅ Loading states shown during processing
- ✅ Success toasts for code generation
- ✅ Error toasts for failures
- ✅ Text box clears after send

### **4. Self-Healing Activation**
- ✅ Errors detected by ProactiveErrorDetector
- ✅ AutoRetryService attempts fix (up to 3 times)
- ✅ EvidenceCollector captures screenshots + logs
- ✅ Escalation to Replit AI if 3 failures

### **5. Code Quality**
- ✅ Generated code is syntactically valid
- ✅ File updates are tracked in Git panel
- ✅ Changes visible in preview iframe

---

## 🧪 TEST IMPLEMENTATION STRUCTURE

```typescript
test.describe('Mr. Blue - Comprehensive QA', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);
    
    // Navigate to Visual Editor
    await page.goto('/admin/visual-editor');
    
    // Wait for Mr. Blue initialization
    await page.waitForSelector('[data-testid="input-chat"]');
    await page.waitForSelector('[data-testid="button-send"]');
  });
  
  // CATEGORY 1: Vibe Coding (UI Modifications)
  test('UI Mod #1: Make header transparent', async ({ page }) => {
    await sendMessage(page, 'Make the header background transparent');
    await validateCodeGeneration(page);
  });
  
  // ... repeat for all 15 prompts
  
  // VOICE TESTS
  test('Voice #1: Click-to-toggle mode works', async ({ page }) => {
    await page.click('[data-testid="button-voice-mode"]');
    await expect(page.locator('[data-testid="recording-indicator"]')).toBeVisible();
    // Simulate speaking (Playwright can't actually speak, but can test UI)
    await page.click('[data-testid="button-voice-mode"]');
    await expect(page.locator('[data-testid="recording-indicator"]')).not.toBeVisible();
  });
  
  // SELF-HEALING TESTS
  test('Self-healing: Empty message blocked', async ({ page }) => {
    await page.fill('[data-testid="input-chat"]', '   ');
    await expect(page.locator('[data-testid="button-send"]')).toBeDisabled();
  });
  
});
```

---

## 📊 SUCCESS METRICS

### **Must Pass (100% Required)**
- ✅ All 5 UI modification prompts → Code generation
- ✅ All 3 conversational prompts → Chat responses
- ✅ Voice toggle UI works (mic button, recording indicator)
- ✅ Empty messages blocked
- ✅ No duplicate messages
- ✅ Text box clears after send

### **Should Pass (>80% Required)**
- ✅ Complex multi-step requests planned correctly
- ✅ Clarification questions asked when ambiguous
- ✅ Self-healing auto-retry succeeds
- ✅ Messages persist across page reloads

### **Could Pass (Nice to Have)**
- ✅ Voice transcription works end-to-end (may fail in CI)
- ✅ Error escalation to Replit AI tracked
- ✅ Evidence packages created for failures

---

## 🚀 EXECUTION PLAN

1. **Run Test Suite**: `npx playwright test tests/mb-md-comprehensive-qa.spec.ts`
2. **Collect Evidence**: Screenshots, videos, console logs, LSP diagnostics
3. **Analyze Failures**: Use 4-Research-Session methodology for any issues
4. **Auto-Fix**: Trigger Phase C framework for detected errors
5. **Report**: Generate comprehensive QA report with pass/fail for all 15 prompts

---

## 🎯 EXPECTED OUTCOMES

**Best Case:**
- All 15 prompts routed correctly
- Voice UI works (actual transcription may not work in CI)
- Self-healing detects and fixes errors
- 100% message persistence

**Realistic Case:**
- 12/15 prompts pass (80% success rate)
- Voice UI toggles work, transcription needs manual testing
- Self-healing detects errors, may need manual fixes
- Message persistence works with minor issues

**Worst Case (Requires Investigation):**
- <10/15 prompts pass
- Vibe coding not routing correctly
- Chat responses appearing for UI modifications
- Messages duplicating or disappearing

---

## 📝 NEXT STEPS

1. Implement Playwright test with all 15 prompts
2. Run against live Visual Editor at `/admin/visual-editor`
3. Capture evidence for all failures
4. Use Mr. Blue's self-healing to auto-fix issues
5. Generate final QA report for beta launch readiness

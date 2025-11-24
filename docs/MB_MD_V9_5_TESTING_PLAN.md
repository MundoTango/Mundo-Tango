# MB.MD v9.5 Visual Editor - Testing Plan & Execution Report

**Version:** 9.5  
**Date:** November 24, 2025  
**Test Status:** IN PROGRESS  
**Priority:** P0 - Blocking Beta Launch

---

## 🎯 TESTING OBJECTIVE

Verify all 4 critical fixes implemented in MB.MD v9.5 work correctly in production environment:

1. ✅ Enhanced vibe coding detection (Fix #1)
2. ✅ Text box clearing after submit (Fix #2)
3. ✅ Voice recognition error handling (Fix #3)
4. ✅ Research & Planning capability (Fix #4)

---

## 📋 TEST MATRIX

### Fix #1: Enhanced Vibe Coding Detection

**Location:** `client/src/pages/VisualEditorPage.tsx:632-634`

**Implementation:**
```typescript
const isVibeCodeRequest = /\b(make|change|update|modify|set|add|remove)\s+(the|a|an|this|that)?\s*(button|header|text|color|background|container|div|element|section|card|panel|box|wrapper|style|size|width|height|padding|margin|border|radius|opacity|spacing)/i.test(trimmedPrompt) ||
                          /\b(have|with|to)\s+(a|an|the|this)?\s*(blue|red|green|yellow|white|black|transparent|opaque|hidden|visible|larger|smaller|wider|narrower|bold)/i.test(trimmedPrompt) ||
                          /color.*to|background.*to|background.*transparent|opacity.*to|font.*to|size.*to|width.*to|height.*to/i.test(lowerPrompt);
```

**Test Cases:**

| Test ID | Input | Expected Behavior | Pass/Fail |
|---------|-------|-------------------|-----------|
| 1.1 | "make this container background transparent" | Routes to CODE GENERATION (not chat) | ⏳ |
| 1.2 | "change div opacity to 50%" | Generates actual code changes | ⏳ |
| 1.3 | "add padding to element" | Triggers code generation workflow | ⏳ |
| 1.4 | "make button blue" | Routes to vibe coding path | ⏳ |
| 1.5 | "update section border radius" | Generates code modifications | ⏳ |

**Success Criteria:**
- ✅ All UI element keywords properly detected
- ✅ Routes to `code_generation` (NOT `chat_response`)
- ✅ Actual file changes visible in preview
- ✅ Console shows: `[StreamingChat] ✅ Parsed message type: "code_generation"`

---

### Fix #2: Text Box Clearing After Submit

**Location:** `client/src/pages/VisualEditorPage.tsx:629`

**Implementation:**
```typescript
const handleSubmit = async () => {
  if (!prompt.trim()) return;
  const trimmedPrompt = prompt.trim();
  
  // ✅ CLEAR TEXT BOX IMMEDIATELY after capturing prompt (MB.MD v9.5 Fix #2)
  setPrompt('');
  
  // ... rest of routing logic ...
};
```

**Test Cases:**

| Test ID | Action | Expected Behavior | Pass/Fail |
|---------|--------|-------------------|-----------|
| 2.1 | Type message → Click Send | Text box clears IMMEDIATELY | ⏳ |
| 2.2 | Type message → Press Enter | Text box clears IMMEDIATELY | ⏳ |
| 2.3 | Send empty message | No action (validation works) | ⏳ |
| 2.4 | Send message → Type new message | Can type new message without manual clearing | ⏳ |

**Success Criteria:**
- ✅ `<Textarea>` value resets to empty string
- ✅ No manual clearing required between messages
- ✅ Works for both button click AND Enter key

---

### Fix #3: Voice Recognition Error Handling

**Location:** `client/src/hooks/useVoiceInput.ts:131-167`

**Implementation:**
```typescript
recognition.onerror = (event: any) => {
  if (event.error === 'network') {
    toast({
      title: '🎤 Voice Mode Unavailable',
      description: isReplitEnv 
        ? 'Browser voice recognition doesn\'t work in development mode. Please use the text box for now.'
        : 'Voice recognition is temporarily unavailable. Please check your internet connection or use the text box.',
      variant: 'default',
    });
  } else if (event.error === 'not-allowed') {
    toast({
      title: '🎤 Microphone Access Denied',
      description: 'Please allow microphone access in your browser settings and try again.',
      variant: 'destructive',
    });
  }
  // ... other error cases ...
};
```

**Test Cases:**

| Test ID | Trigger | Expected Behavior | Pass/Fail |
|---------|---------|-------------------|-----------|
| 3.1 | Click voice button (network error) | Shows friendly "Voice Mode Unavailable" message | ⏳ |
| 3.2 | Deny mic permission | Shows "Microphone Access Denied" message | ⏳ |
| 3.3 | Voice error occurs | System continues working (graceful degradation) | ⏳ |
| 3.4 | Voice error → Use text input | Text input still functional | ⏳ |
| 3.5 | No speech detected | Console logs (no toast spam) | ⏳ |

**Success Criteria:**
- ✅ NO cryptic "network" error shown to user
- ✅ Helpful, actionable error messages
- ✅ System remains functional after voice failure
- ✅ User can fallback to text input seamlessly

---

### Fix #4: Research & Planning Capability

**Location:** `client/src/pages/VisualEditorPage.tsx:570-683`

**Implementation:**
```typescript
const analyzeBeforeGenerate = async (userPrompt: string): Promise<{
  needsClarification: boolean;
  questions?: string[];
  plan?: string;
  confidence: number;
}> => {
  // Call analysis endpoint
  const response = await apiRequest('/api/mrblue/analyze', {
    method: 'POST',
    body: JSON.stringify({ prompt: userPrompt, context })
  });
  
  return {
    needsClarification: response.needsClarification,
    questions: response.questions,
    plan: response.plan,
    confidence: response.confidence
  };
};
```

**Test Cases:**

| Test ID | Input | Expected Behavior | Pass/Fail |
|---------|-------|-------------------|-----------|
| 4.1 | "make it better" (vague) | Mr. Blue asks clarifying questions | ⏳ |
| 4.2 | "make button blue" (clear) | Mr. Blue shows execution plan → generates code | ⏳ |
| 4.3 | Ambiguous request | Code generation PAUSED until clarification | ⏳ |
| 4.4 | Answer clarifying question | Code generation resumes with full context | ⏳ |
| 4.5 | Clear request | Shows plan in chat → proceeds to code gen | ⏳ |

**Success Criteria:**
- ✅ `/api/mrblue/analyze` endpoint called before generation
- ✅ Vague requests trigger clarifying questions
- ✅ Clear requests show execution plan
- ✅ Code generation happens AFTER analysis complete
- ✅ Chat history shows analysis messages

---

## 🧪 E2E TEST SCENARIOS

### Scenario 1: Complete Vibe Coding Workflow

**Steps:**
1. Navigate to `/visual-editor`
2. Wait for page load
3. Type: "make this container background transparent"
4. Click Send
5. Observe console logs
6. Verify code generation
7. Check preview for changes

**Expected Result:**
- ✅ Text box clears immediately
- ✅ Console: `[StreamingChat] ✅ Parsed message type: "code_generation"`
- ✅ File changes visible in history
- ✅ Preview updates with transparent background

---

### Scenario 2: Voice Button Error Handling

**Steps:**
1. Navigate to `/visual-editor`
2. Click microphone button
3. Observe error handling
4. Verify text input still works

**Expected Result:**
- ✅ Friendly error message shown
- ✅ NO "network" error in toast
- ✅ Text input remains functional
- ✅ User can continue using app

---

### Scenario 3: Research & Planning Flow

**Steps:**
1. Navigate to `/visual-editor`
2. Type: "make it better"
3. Click Send
4. Read Mr. Blue's response
5. Answer clarifying question
6. Verify code generation proceeds

**Expected Result:**
- ✅ Mr. Blue asks specific questions
- ✅ No code generated until answered
- ✅ Clear execution plan shown
- ✅ Code generation with full context

---

## 📊 TEST EXECUTION LOG

### Test Run #1: [Timestamp to be added]

**Environment:**
- URL: `/visual-editor`
- Browser: Chrome/Firefox
- Status: Workflow running ✅

**Results:**
- Fix #1: ⏳ PENDING
- Fix #2: ⏳ PENDING
- Fix #3: ⏳ PENDING
- Fix #4: ⏳ PENDING

---

## 🐛 BUG TRACKING

### Critical Bugs (P0)
_None found yet_

### Major Bugs (P1)
_None found yet_

### Minor Issues (P2)
_None found yet_

---

## ✅ SIGN-OFF CHECKLIST

- [ ] All P0 requirements verified working
- [ ] Voice errors show helpful messages (not "network")
- [ ] Text box clears after every send
- [ ] Vibe coding routes to code generation
- [ ] Research & planning asks questions when needed
- [ ] Zero critical bugs blocking beta launch
- [ ] E2E tests executed and documented
- [ ] Test report completed and reviewed

---

## 📝 NOTES

_Testing notes will be added during execution_

---

**Next Steps:**
1. ✅ Start application workflow
2. Execute automated tests
3. Manual UI verification
4. Document findings
5. Report to main agent

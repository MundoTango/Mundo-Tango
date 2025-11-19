# MB.MD PROTOCOL v9.2 - BUILD PLAN: Restore Mr. Blue Vibecoding
**Date:** November 19, 2025  
**Methodology:** Simultaneously, Recursively, Critically  
**Quality Target:** 95-99/100  
**Estimated Time:** 1.25 hours

---

## 🎯 MISSION OBJECTIVE

**Goal:** Enable Mr. Blue to respond intelligently to vibecoding requests with live SSE streaming visualization to both chat interface AND Visual Editor preview.

**Success Criteria:**
1. ✅ User asks "can you vibe code?" → Mr. Blue: "Yes! What would you like me to build?"
2. ✅ Replit AI can programmatically trigger Mr. Blue vibecoding
3. ✅ SSE streaming shows live code changes in both chat + Visual Editor
4. ✅ Chat memory persists across page reloads

---

## 📝 TASK BREAKDOWN (MB.MD: Simultaneously, Recursively, Critically)

### **PHASE 1: Fix Intent Classification (15 min)**

#### **Task 1.1: Add Vibecoding Keywords to Action List**
**File:** `server/services/ConversationOrchestrator.ts`

```typescript
// BEFORE (lines 142-157):
const actionKeywords = [
  'add', 'create', 'make', 'build', 'implement',
  'fix', 'change', 'modify', 'update', 'remove',
  'delete', 'refactor', 'improve', 'optimize',
];

// AFTER:
const actionKeywords = [
  // Explicit vibecoding triggers (HIGHEST PRIORITY)
  'vibe code', 'vibecod', 'vibe cod', 'can you code', 'generate code',
  
  // Standard action verbs
  'add', 'create', 'make', 'build', 'implement',
  'fix', 'change', 'modify', 'update', 'remove',
  'delete', 'refactor', 'improve', 'optimize',
];
```

#### **Task 1.2: Reorder Intent Checks (Priority Fix)**
**File:** `server/services/ConversationOrchestrator.ts`

```typescript
async classifyIntent(message: string): Promise<Intent> {
  const msg = message.toLowerCase();

  // TIER 0: Explicit vibecoding requests (NEW - HIGHEST PRIORITY)
  const vibecodingKeywords = [
    'vibe code', 'vibecod', 'vibe cod', 
    'can you code', 'can you vibe',
    'generate code', 'write code',
  ];
  
  for (const keyword of vibecodingKeywords) {
    if (msg.includes(keyword)) {
      return {
        type: 'action',
        confidence: 0.99,
        reasoning: `Explicit vibecoding request: "${keyword}"`
      };
    }
  }

  // Tier 1: Page analysis (existing)
  // Tier 2: Question intent (existing)
  // Tier 3: Action intent (existing)
}
```

**Testing:**
- Input: "can you vibe code?" → Expected: `type='action', confidence=0.99`
- Input: "generate code for a button" → Expected: `type='action'`
- Input: "what is vibecoding?" → Expected: `type='question'` (still works)

---

### **PHASE 2: Update System Prompt (10 min)**

#### **Task 2.1: Add Vibecoding Personality**
**File:** `server/routes/mrBlue.ts` lines 361-390

```typescript
systemPrompt = `You are Mr. Blue, the Mundo Tango AI assistant with VIBECODING SUPERPOWERS.

CAPABILITIES:
✅ Natural Language → Production Code (VibeCoding)
✅ Multi-file editing (5+ files simultaneously)
✅ Live SSE streaming to Visual Editor
✅ Git-backed rollback safety

WHEN USER ASKS "CAN YOU VIBE CODE?" RESPOND:
"Yes! I can vibe code - that's my superpower! I can generate, modify, or fix code using natural language. Just tell me what you want to build and I'll stream the changes live to your Visual Editor. What would you like me to create?"

CURRENT CONTEXT:
- Page: ${currentPage}
- Mode: Vibecoding-enabled AI assistant

INSTRUCTIONS:
- Be enthusiastic about coding capabilities
- Offer specific examples when asked about abilities
- Always mention SSE streaming visualization
`;
```

**Testing:**
- Input: "can you vibe code?" → Expected: "Yes! I can vibe code - that's my superpower!"
- Input: "what can you do?" → Expected: Mentions vibecoding in capabilities list

---

### **PHASE 3: Replit AI ↔ Mr. Blue Bridge (20 min)**

#### **Task 3.1: Create AI-to-AI Vibecoding Endpoint**
**File:** `server/routes/replit-ai-bridge.ts`

```typescript
/**
 * POST /api/replit-ai/vibecode
 * Enable Replit AI to programmatically trigger Mr. Blue vibecoding
 * Returns SSE streaming URL for live visualization
 */
router.post('/vibecode', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { naturalLanguage, context, targetFiles } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const sessionId = `replit_vibe_${req.user.id}_${Date.now()}`;
    
    console.log('[Replit AI → Mr. Blue] Vibecoding request:', naturalLanguage);

    // Stream URL for live visualization
    const streamUrl = `/api/mrblue/vibecode/stream?sessionId=${sessionId}`;

    // Trigger vibecoding (async)
    vibeCodingService.generateCode({
      naturalLanguage,
      context: context || [],
      targetFiles: targetFiles || [],
      userId: req.user.id,
      sessionId,
    }).then(result => {
      console.log('[Replit AI → Mr. Blue] Vibecoding complete:', result.success);
    });

    // Return immediately with streaming URL
    res.json({
      success: true,
      sessionId,
      streamUrl,
      message: 'Vibecoding started - connect to streamUrl for live updates',
    });
  } catch (error: any) {
    console.error('[Replit AI → Mr. Blue] Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

**Testing:**
- Replit AI calls: `POST /api/replit-ai/vibecode` with `{naturalLanguage: "create a login button"}`
- Expected: Returns `{streamUrl: "/api/mrblue/vibecode/stream?sessionId=..."}`
- Replit AI connects to `streamUrl` → sees SSE events with code changes

---

### **PHASE 4: SSE Streaming Visibility (5 min)**

#### **Task 4.1: Ensure SSE Events Reach Visual Editor**
**Files:** `client/src/components/mrBlue/MrBlueChat.tsx`, `client/src/pages/VisualEditorPage.tsx`

**Verify existing SSE handling:**
```typescript
// In MrBlueChat.tsx - confirm SSE listener exists
useEffect(() => {
  if (vibecodingResult?.streamUrl) {
    const eventSource = new EventSource(vibecodingResult.streamUrl);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('[SSE] Code change:', data);
      // Update Visual Editor preview
      if (window.iframeInjector) {
        window.iframeInjector.applyChange(data);
      }
    };

    return () => eventSource.close();
  }
}, [vibecodingResult]);
```

**Testing:**
- Trigger vibecoding → Verify SSE events logged in browser console
- Check Visual Editor preview updates in real-time

---

### **PHASE 5: Testing & Validation (30 min)**

#### **Test Suite:**

**Test 1: Intent Classification**
```bash
# Input: "can you vibe code?"
# Expected: type='action', triggers vibecoding mode
# Result: Mr. Blue responds with vibecoding capabilities
```

**Test 2: Vibecoding Execution**
```bash
# Input: "create a blue button that says 'Click Me'"
# Expected: VibeCodingService generates code
# Result: File changes shown in chat + Visual Editor
```

**Test 3: Chat Memory Persistence**
```bash
# 1. Send message "hello"
# 2. Reload page
# 3. Verify "hello" message still visible
# Expected: Messages persist across reload
```

**Test 4: Replit AI ↔ Mr. Blue**
```bash
# Replit AI: POST /api/replit-ai/vibecode
# Expected: Returns streamUrl
# Result: Replit AI connects to SSE stream, sees live code changes
```

**Test 5: Live SSE Streaming**
```bash
# Trigger vibecoding
# Expected: Console shows SSE events
# Expected: Visual Editor preview updates in real-time
```

---

## 🚀 EXECUTION ORDER (Parallel + Sequential)

### **Parallel Execution (Subagents 1-3)**
- **Subagent 1:** Phase 1 (Intent Classification) + Phase 2 (System Prompt)
- **Subagent 2:** Phase 3 (Replit AI Bridge)
- **Subagent 3:** Phase 4 (SSE Verification) + Phase 5 (Testing)

### **Sequential Checkpoints**
1. ✅ Subagent 1 complete → Test intent classification
2. ✅ Subagent 2 complete → Test Replit AI bridge
3. ✅ Subagent 3 complete → Full E2E validation

---

## 📊 QUALITY GATES

| Gate | Criteria | Target |
|------|----------|--------|
| **Intent Accuracy** | "can you vibe code?" → action | 100% |
| **Response Quality** | Mr. Blue advertises capabilities | 95%+ |
| **SSE Streaming** | Live updates visible in chat + VE | 100% |
| **Chat Memory** | Messages persist across reload | 100% |
| **AI-to-AI** | Replit AI triggers Mr. Blue | 100% |

---

## 🎯 SUCCESS METRICS

- [ ] User: "can you vibe code?" → Mr. Blue: "Yes! That's my superpower!"
- [ ] Vibecoding generates code with SSE streaming
- [ ] Visual Editor shows live code changes
- [ ] Chat memory persists across reloads
- [ ] Replit AI can programmatically trigger Mr. Blue
- [ ] All tests pass with 95%+ coverage

---

**Total Time:** 1.25 hours  
**Confidence:** 95%  
**Next Step:** Execute Phase 1 → Test → Execute Phase 2 → Validate

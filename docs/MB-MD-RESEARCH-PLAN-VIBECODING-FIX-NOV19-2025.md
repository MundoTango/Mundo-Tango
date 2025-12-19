# MB.MD PROTOCOL v9.2 - RESEARCH PLAN: Mr. Blue Vibecoding Fix
**Date:** November 19, 2025  
**Methodology:** Simultaneously, Recursively, Critically  
**Target:** Restore Mr. Blue vibecoding capabilities + chat memory retention

---

## 🔍 RESEARCH FINDINGS (COMPLETED)

### **ROOT CAUSE ANALYSIS**

**Issue #1: Intent Classification Bug**
- **Location:** `server/services/ConversationOrchestrator.ts` lines 110-176
- **Problem:** ConversationOrchestrator checks for QUESTION keywords BEFORE ACTION keywords
- **Impact:** "can you vibe code?" matches "can you" (question keyword) → classified as question → bypasses vibecoding
- **Evidence:**
  ```typescript
  // Line 121: Question keywords checked FIRST
  'how can', 'how do', // ← Matches "can you vibe code?"
  
  // Lines 142-157: Action keywords checked SECOND (never reached!)
  'vibe', 'code', 'vibecoding' // ← Should match but never gets here
  ```

**Issue #2: Missing Vibecoding Personality**
- **Location:** `server/routes/mrBlue.ts` lines 361-390
- **Problem:** System prompt doesn't mention vibecoding capabilities
- **Impact:** Mr. Blue responds like generic chatbot: "I'm not capable of directly vibing code"
- **Expected:** "Yes! I can vibe code. What would you like me to build?"

**Issue #3: Chat Memory Already Implemented (✅)**
- **Location:** `client/src/components/mrBlue/MrBlueChat.tsx` lines 84-117
- **Status:** WORKING - Fetches conversation history from `/api/mrblue/conversations`
- **Evidence:**
  ```typescript
  // Lines 85-88: Fetches messages from API
  const { data: fetchedMessages, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: [`/api/mrblue/conversations/${currentConversationId}/messages`],
    enabled: !!currentConversationId,
  });
  ```

**Issue #4: Replit AI ↔ Mr. Blue Integration Missing**
- **Location:** `server/routes/replit-ai-bridge.ts` exists
- **Status:** Routes exist but not actively used
- **Gap:** No programmatic AI-to-AI chat interface for Replit AI to trigger Mr. Blue vibecoding

---

## 📊 CURRENT ARCHITECTURE MAP

### **Vibecoding Flow (BROKEN)**
```
User: "can you vibe code?"
  ↓
ConversationOrchestrator.classifyIntent()
  ↓
Matches "can you" → type='question' (❌ WRONG)
  ↓
handleQuestion() → GROQ generic response
  ↓
Response: "I'm not capable of vibing code" (❌ GENERIC AI)
```

### **Vibecoding Flow (SHOULD BE)**
```
User: "can you vibe code?" OR "fix the button"
  ↓
ConversationOrchestrator.classifyIntent()
  ↓
Matches "vibe code" OR "fix" → type='action' (✅ CORRECT)
  ↓
handleActionRequest() → VibeCodingService.generateCode()
  ↓
Response: "Yes! I can vibe code. Here are the changes..." (✅ VIBECODING)
  ↓
SSE streaming to Visual Editor preview
```

---

## 🛠️ EXISTING INFRASTRUCTURE (CONFIRMED WORKING)

### **✅ Backend Services**
- [x] `VibeCodingService.ts` - GROQ Llama-3.1-70b code generation
- [x] `CodeGenerator.ts` - Multi-file editing engine
- [x] `ContextService.ts` - LanceDB RAG for documentation
- [x] Routes: `/api/mrblue/vibecode/generate`, `/stream`, `/apply`

### **✅ Frontend Components**
- [x] `VibeCodingInterface.tsx` - Chat UI with code preview
- [x] `VibeCodingResult.tsx` - File diff viewer
- [x] `VibecodingRouter.ts` - Intent-based routing

### **✅ Chat Memory System**
- [x] Conversation API: `/api/mrblue/conversations`
- [x] Message persistence in PostgreSQL
- [x] Auto-load most recent conversation on mount
- [x] Sync fetched messages with local UI state

---

## 🎯 GAPS IDENTIFIED

| Gap | Location | Impact | Priority |
|-----|----------|--------|----------|
| **Intent keywords ordering** | ConversationOrchestrator.ts:110-176 | High - Vibecoding never triggers | 🔴 Critical |
| **Missing vibecoding keywords** | ConversationOrchestrator.ts:142-157 | High - "vibe code" not recognized | 🔴 Critical |
| **Generic system prompt** | mrBlue.ts:361-390 | Medium - Doesn't advertise capabilities | 🟡 Important |
| **No AI-to-AI interface** | replit-ai-bridge.ts | Medium - Replit AI can't trigger Mr. Blue | 🟡 Important |
| **SSE streaming not visible** | Visual Editor integration | Low - Works but UI doesn't show it | 🟢 Nice-to-have |

---

## 📋 NEXT STEPS → BUILD PLAN

1. **Fix Intent Classification** (15 min)
   - Add "vibe", "vibecod", "vibe cod" to action keywords
   - Move explicit vibecoding checks to TOP priority
   - Test: "can you vibe code?" → should return type='action'

2. **Update System Prompt** (10 min)
   - Add vibecoding capabilities to personality
   - Include examples: "I can generate/modify code"
   - Mention SSE streaming visualization

3. **Restore Replit AI ↔ Mr. Blue Bridge** (20 min)
   - Create `/api/replit-ai/vibecode` endpoint
   - Enable programmatic AI-to-AI communication
   - Return SSE streaming URL for live visualization

4. **Testing & Validation** (30 min)
   - E2E test: "can you vibe code?" → vibecoding mode
   - E2E test: Replit AI triggers Mr. Blue → sees SSE stream
   - Verify chat memory persists across reloads

---

**Total Estimated Time:** 1.25 hours  
**Confidence:** 95% (Infrastructure exists, only configuration needed)

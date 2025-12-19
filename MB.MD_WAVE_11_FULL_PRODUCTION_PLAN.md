# MB.MD Wave 11: Full Production Deployment
**Created:** November 16, 2025  
**Methodology:** Simultaneously, Recursively, Critically  
**Target:** 99/100 production quality, 99.9% WebSocket uptime

---

## 🔥 **CRITICAL ISSUES FROM SCREENSHOTS**

### **Issue #1: WebSocket 1006 Auth Failures** ❌ CRITICAL
**Error:** `[WS Server] 🔌 Connection closed - Code: 1006, Reason: Unauthenticated client disconnected`

**Impact:** 
- WebSocket connections failing immediately
- No real-time notifications
- Violates 99.9% uptime requirement

**Root Cause:**
WebSocket expects auth message but client disconnects before sending it

**Fix Required:**
1. Add JWT token to WebSocket connection URL as query param
2. Verify token on handshake (before waiting for auth message)
3. Implement reconnection with exponential backoff
4. Add connection state monitoring

---

### **Issue #2: React Key Warnings** ⚠️ MINOR
**Error:** `Warning: Each child in a list should have a unique "key" prop`

**Location:** `FeedPage.tsx:74:33`

**Fix Required:**
Add unique keys to mapped components

---

### **Issue #3: Mr. Blue Limited to God Level** ❌ CRITICAL
**Problem:** Voice cloning, advanced features only available to Tier 8 users

**User Requirement:** "make sure mr blue has full text and audio conversation for all users 0-god level"

**Fix Required:**
- **ALL Tiers (0-8):** Text chat, basic audio chat, context awareness
- **Tier-Based Features:** Advanced capabilities scale with tier level
- **PRD Update:** Document what each tier gets

---

## 📋 **MB.MD EXECUTION PLAN**

### **Phase 1: WebSocket 99.9% Uptime (30 min)**
**Goal:** Fix authentication and ensure stable real-time connections

**Subagent Task #1:**
1. **Add JWT to WebSocket URL:**
   ```typescript
   // client/src/hooks/useWebSocket.ts
   const ws = new WebSocket(`${wsUrl}?token=${getAuthToken()}`);
   ```

2. **Verify token on handshake:**
   ```typescript
   // server/websocket.ts
   const url = new URL(request.url, 'http://localhost');
   const token = url.searchParams.get('token');
   
   if (!token) {
     ws.close(1008, 'Authentication required');
     return;
   }
   
   const user = verifyJWT(token);
   if (!user) {
     ws.close(1008, 'Invalid token');
     return;
   }
   
   // Store authenticated user
   clients.set(ws, { userId: user.id, username: user.username });
   ```

3. **Add reconnection logic:**
   ```typescript
   const reconnect = (attempt = 0) => {
     const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
     setTimeout(() => connect(), delay);
   };
   
   ws.onerror = () => {
     if (attempt < 5) reconnect(attempt + 1);
   };
   ```

4. **Add connection monitoring:**
   - Heartbeat ping/pong every 30 seconds
   - Disconnect after 90 seconds of no response
   - Client auto-reconnect on disconnect

**Success Criteria:**
- ✅ WebSocket connects with JWT in URL
- ✅ No more 1006 auth errors
- ✅ Auto-reconnects on disconnect
- ✅ 99.9% uptime (verified via logs)

---

### **Phase 2: Fix React Warnings (5 min)**
**Goal:** Zero console warnings

**Subagent Task #2:**
Find the mapping in `FeedPage.tsx:74` and add unique keys:

```typescript
// Before:
{items.map(item => <Component {...item} />)}

// After:
{items.map(item => <Component key={item.id} {...item} />)}
```

**Success Criteria:**
- ✅ Zero React key warnings in console
- ✅ No layout shift or rendering issues

---

### **Phase 3: Enable Mr. Blue for ALL Tiers (45 min)**
**Goal:** Every user (Tier 0-8) can use Mr. Blue text/audio chat with context awareness

**Subagent Task #3:**

#### **Part A: Remove God-Level-Only Restrictions**

**Files to Modify:**
- `client/src/pages/MrBlueChatPage.tsx`
- `client/src/components/mrBlue/MrBlueChat.tsx`
- `server/routes/mrBlue.ts`

**Changes:**
1. **Remove tier checks for basic chat:**
   ```typescript
   // REMOVE THIS:
   if (user.tier < 8) {
     return res.status(403).json({ error: 'God Level required' });
   }
   
   // REPLACE WITH:
   // All tiers can use Mr. Blue - features scale by tier
   ```

2. **Add tier-based feature flags:**
   ```typescript
   const getMrBlueCapabilities = (tier: number) => ({
     textChat: true, // All tiers
     audioChat: true, // All tiers
     contextAwareness: true, // All tiers
     voiceCloning: tier >= 6, // Premium+
     autonomousVibeCoding: tier >= 7, // Elite+
     unlimitedCodeGen: tier >= 8, // God only
     customVoices: tier >= 4, // Core+
     realtime: tier >= 5 // Pro+
   });
   ```

3. **Update UI to show tier-locked features:**
   ```typescript
   {!capabilities.voiceCloning && (
     <Badge variant="secondary">
       Voice Cloning: Premium+ 💎
     </Badge>
   )}
   ```

#### **Part B: Tier-Based Rate Limits**

```typescript
const RATE_LIMITS = {
  0: { messagesPerHour: 10, codeGenPerDay: 0 },   // Free
  1: { messagesPerHour: 20, codeGenPerDay: 0 },   // Basic
  2: { messagesPerHour: 50, codeGenPerDay: 0 },   // Starter
  3: { messagesPerHour: 100, codeGenPerDay: 1 },  // Bronze
  4: { messagesPerHour: 200, codeGenPerDay: 3 },  // Core
  5: { messagesPerHour: 500, codeGenPerDay: 5 },  // Pro
  6: { messagesPerHour: 1000, codeGenPerDay: 10 }, // Premium
  7: { messagesPerHour: 2000, codeGenPerDay: 20 }, // Elite
  8: { messagesPerHour: Infinity, codeGenPerDay: Infinity } // God
};
```

**Success Criteria:**
- ✅ Tier 0-8 users can access `/mr-blue`
- ✅ Text chat works for all tiers
- ✅ Audio chat works for all tiers
- ✅ Context awareness active for all tiers
- ✅ Tier-locked features show upgrade prompts
- ✅ Rate limits enforced per tier

---

### **Phase 4: Update PRD with Tier Breakdown (20 min)**
**Goal:** Document exactly what each tier gets

**Main Agent Task:**

Add new section to `docs/MR_BLUE_VISUAL_EDITOR_PRD.md`:

```markdown
## Mr. Blue Capabilities by User Tier

### **Tier 0-2: Free/Basic/Starter** 🆓
**Available:**
- ✅ Text chat (10-50 messages/hour)
- ✅ Basic context awareness (current page, selected element)
- ✅ Code explanations (read-only)
- ✅ 6 preset voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)

**Locked:**
- ❌ Voice cloning (requires Premium Tier 6+)
- ❌ Autonomous code generation (requires Elite Tier 7+)
- ❌ Real-time audio chat (requires Pro Tier 5+)

**Use Cases:**
- Learning about the platform
- Getting help with navigation
- Understanding features

---

### **Tier 3: Bronze** 🥉
**New:**
- ✅ 1 code generation/day (approval required)
- ✅ 100 messages/hour

**Use Cases:**
- Simple UI tweaks (color changes, text edits)
- Test data generation (small datasets)

---

### **Tier 4: Core** 💼
**New:**
- ✅ 3 code generations/day
- ✅ 4 premium ElevenLabs voices (Rachel, Domi, Bella, Antoni)
- ✅ 200 messages/hour
- ✅ Full edit history (last 50 changes)

**Use Cases:**
- Regular development tasks
- Professional voice responses
- Consistent styling changes

---

### **Tier 5: Pro** 🚀
**New:**
- ✅ Real-time audio chat (OpenAI Realtime API)
- ✅ 5 code generations/day
- ✅ 500 messages/hour
- ✅ Screenshot context (visual AI understanding)

**Use Cases:**
- Hands-free coding via voice
- Visual debugging ("Make this button align with that text")
- Rapid prototyping

---

### **Tier 6: Premium** 💎
**New:**
- ✅ **Voice cloning** (clone YOUR voice from interviews)
- ✅ 10 code generations/day
- ✅ 1,000 messages/hour
- ✅ Database schema awareness
- ✅ API endpoint documentation

**Use Cases:**
- Personalized Mr. Blue with YOUR voice
- Complex database operations
- Multi-file refactoring

---

### **Tier 7: Elite** 👑
**New:**
- ✅ **Autonomous vibe coding** (full code generation pipeline)
- ✅ 20 code generations/day
- ✅ 2,000 messages/hour
- ✅ Git integration (auto-commit, rollback)
- ✅ Full page DOM access
- ✅ LSP diagnostics integration

**Use Cases:**
- "Create a complete user dashboard with charts"
- Multi-component features
- Production-grade code generation

---

### **Tier 8: God Level** 🌟
**New:**
- ✅ **UNLIMITED** everything
- ✅ Backend code generation (server routes, database migrations)
- ✅ No rate limits
- ✅ No cost caps
- ✅ Priority support
- ✅ Advanced AI routing (GPT-4o, Claude 3.5, Llama-3.1-70b)

**Use Cases:**
- Full-stack autonomous development
- Complex architectural changes
- Production infrastructure modifications
```

**Success Criteria:**
- ✅ PRD documents all 9 tiers (0-8)
- ✅ Clear feature progression
- ✅ Upgrade incentives obvious
- ✅ Use cases for each tier

---

### **Phase 5: Clone User Voice (15 min)**
**Goal:** Execute voice cloning from provided interview URLs

**Main Agent Task:**

Call the voice cloning API programmatically:

```bash
curl -X POST http://localhost:5000/api/voice-cloning/clone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -d '{
    "audioUrls": [
      "https://www.youtube.com/watch?v=9jH4D7YohBk",
      "https://humansoftango.podbean.com/e/free-heeling-with-scott-boddye/",
      "https://www.youtube.com/watch?v=5_o22RSSRVE",
      "https://www.youtube.com/watch?v=KNNCzZXMvh4"
    ],
    "voiceName": "Scott Boddye"
  }'
```

**Process:**
1. Download audio from 4 URLs (YouTube + Podcast)
2. Extract 2-minute samples (30s-150s, skip intros)
3. Send to ElevenLabs API for cloning
4. Receive voice ID
5. Save to user profile (`users.customVoiceId`)
6. Verify Mr. Blue uses cloned voice for TTS

**Success Criteria:**
- ✅ Voice cloned successfully
- ✅ Voice ID saved to user profile
- ✅ Mr. Blue responds in user's voice
- ✅ Voice quality 99/100

---

### **Phase 6: End-to-End Testing (30 min)**
**Goal:** Verify all tiers, all modes, 99.9% uptime

**Testing Matrix:**

| Tier | Text Chat | Audio Chat | Context | Vibe Coding | Voice Clone |
|------|-----------|------------|---------|-------------|-------------|
| 0 | ✅ Test | ❌ N/A | ✅ Test | ❌ N/A | ❌ N/A |
| 3 | ✅ Test | ❌ N/A | ✅ Test | ✅ Test (1/day) | ❌ N/A |
| 5 | ✅ Test | ✅ Test | ✅ Test | ✅ Test (5/day) | ❌ N/A |
| 6 | ✅ Test | ✅ Test | ✅ Test | ✅ Test (10/day) | ✅ Test |
| 8 | ✅ Test | ✅ Test | ✅ Test | ✅ Test (∞) | ✅ Test |

**Test Cases:**

**1. WebSocket Stability**
- Connect → Verify no 1006 errors
- Wait 5 minutes → Still connected
- Refresh page → Reconnects automatically
- Network interrupt → Reconnects with backoff

**2. Tier 0 User:**
- Open `/mr-blue`
- Send 5 text messages
- Verify responses
- Try voice cloning → See "Premium Tier 6+ required" message

**3. Tier 5 User:**
- Open `/mr-blue`
- Enable real-time voice chat
- Say "Hello Mr. Blue"
- Verify audio response (preset voice)
- Try autonomous coding → Should work (5/day limit)

**4. Tier 6 User:**
- Verify voice clone active
- Mr. Blue responds in user's cloned voice
- All TTS uses custom voice

**5. Tier 8 User:**
- Unlimited code generation
- Backend modifications allowed
- No rate limits enforced

**Success Criteria:**
- ✅ All tiers can access Mr. Blue
- ✅ Features scale correctly
- ✅ Rate limits enforced
- ✅ WebSocket 99.9% uptime (no disconnects in 30min test)
- ✅ Voice cloning works for Tier 6+
- ✅ Zero console errors

---

## 🎯 **DEPLOYMENT STRATEGY**

**Parallel Execution:**
- **Subagent #1:** Fix WebSocket auth (30 min) - CRITICAL
- **Subagent #2:** Fix React keys (5 min) - QUICK WIN
- **Subagent #3:** Enable all tiers (45 min) - FEATURE WORK
- **Main Agent:** Update PRD + clone voice + testing (65 min)

**Total Time:** 65 minutes (parallel)

**Critical Path:** Subagent #3 (45 min) → Voice cloning (15 min) → E2E testing (30 min)

---

## 📁 **FILES TO MODIFY**

| Component | Files | Changes |
|-----------|-------|---------|
| WebSocket | `server/websocket.ts`, `client/src/hooks/useWebSocket.ts` | Add JWT auth to URL, verify on handshake, reconnection logic |
| React Keys | `client/src/pages/FeedPage.tsx` | Add unique keys to mapped components |
| Tier Access | `server/routes/mrBlue.ts`, `client/src/pages/MrBlueChatPage.tsx` | Remove God-only restrictions, add tier-based features |
| PRD | `docs/MR_BLUE_VISUAL_EDITOR_PRD.md` | Add tier-by-tier breakdown |
| Voice Clone | Execute API call | Clone voice from 4 interview URLs |

---

## ✅ **SUCCESS METRICS**

| Metric | Target | Validation |
|--------|--------|------------|
| WebSocket Uptime | 99.9% | 30-min test, zero disconnects |
| Console Errors | 0 | Zero warnings, zero errors |
| Tier 0 Access | ✅ | Can use text chat |
| Tier 6 Voice Clone | ✅ | Hears own voice |
| Tier 8 Unlimited | ✅ | No rate limits |
| Voice Clone Quality | 99/100 | Sounds like user |
| E2E Test Pass Rate | 100% | All tiers tested |

---

**Next:** Deploy 3 parallel subagents + execute voice cloning + comprehensive testing

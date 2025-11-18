# Computer Use Gap Analysis - Mundo Tango vs Industry Standards

**Date:** November 18, 2025  
**Analysis:** Current implementation vs Claude, Vy, and best practices  
**Goal:** Identify missing features to enable natural language Facebook Messenger automation

---

## 🔍 Executive Summary

**Current Status:** Basic Playwright automation with hardcoded workflows (Wix extraction)  
**Industry Standard:** LLM-powered vision agents with adaptive planning and self-healing  
**Gap:** ~70% of modern Computer Use capabilities missing

---

## 📊 Feature Comparison Matrix

| Feature | Mundo Tango (Current) | Claude Computer Use | Vy by Vercept | Industry Best Practice | Priority |
|---------|----------------------|---------------------|---------------|----------------------|----------|
| **Vision-Based Planning** | ❌ None | ✅ Screenshot analysis | ✅ VyUI engine | ✅ Required | 🔥 HIGH |
| **LLM Integration** | ❌ None | ✅ Claude API | ✅ Local LLM | ✅ Required | 🔥 HIGH |
| **Adaptive Selectors** | ❌ Hardcoded | ✅ Coordinate detection | ✅ Visual recognition | ✅ Required | 🔥 HIGH |
| **Iterative Execution** | ❌ Single-pass | ✅ Loop: plan→execute→analyze | ✅ Multi-step workflows | ✅ Required | 🔥 HIGH |
| **Natural Language Input** | ⚠️ Partial (intent detection) | ✅ Full NL parsing | ✅ Plain English commands | ✅ Required | 🔥 HIGH |
| **Self-Healing** | ❌ None | ⚠️ Limited | ✅ Layout-resistant | ✅ Best practice | MEDIUM |
| **Screenshot Analysis** | ✅ Capture only | ✅ Vision + planning | ✅ Semantic UI understanding | ✅ Required | 🔥 HIGH |
| **Multi-Step Task Decomposition** | ❌ Manual coding | ✅ Automatic | ✅ Automatic | ✅ Required | 🔥 HIGH |
| **Error Recovery** | ⚠️ Basic try-catch | ✅ Intelligent retry | ✅ Contextual recovery | ✅ Best practice | MEDIUM |
| **Context Memory** | ❌ None | ✅ Conversation history | ✅ Explicit memory | ✅ Nice-to-have | LOW |
| **Approval Workflow** | ✅ Admin-only | ✅ Human-in-loop | ✅ Optional supervision | ✅ Best practice | LOW |
| **Rate Limiting** | ✅ Database tracking | ⚠️ N/A | ⚠️ N/A | ✅ Required for social | MEDIUM |
| **Facebook Automation** | ❌ Not implemented | ❌ Generic only | ✅ Any app | ✅ User requirement | 🔥 HIGH |

**Legend:** ✅ Full support | ⚠️ Partial | ❌ Missing

---

## 🚨 Critical Gaps (Blockers for Facebook Automation)

### 1. **No LLM Vision Planner**
**Current:** Hardcoded selector arrays (e.g., `contactsSelectors = ['a[href*="contacts"]', ...]`)  
**Industry:** Screenshot → LLM analyzes UI → Returns coordinates/actions  
**Impact:** Breaks when Facebook changes UI, can't handle dynamic content  
**Solution Needed:** Integrate Groq Llama 3.2 Vision or GPT-4o Vision for screenshot analysis

**Example Gap:**
```typescript
// CURRENT (Hardcoded):
const contactsSelectors = ['a[href*="contacts"]', 'a:has-text("Contacts")'];
for (const selector of contactsSelectors) {
  try { await this.page.click(selector); } catch (e) { continue; }
}

// INDUSTRY STANDARD (LLM-powered):
const screenshot = await page.screenshot();
const plan = await llm.analyze(screenshot, "Find the Contacts button");
// Returns: { x: 245, y: 120, confidence: 0.95, element: "Contacts sidebar link" }
await page.mouse.click(plan.x, plan.y);
```

---

### 2. **No Iterative Loop (Screenshot → Plan → Execute → Repeat)**
**Current:** Linear execution - steps 1-8, no adaptation  
**Industry:** Continuous feedback loop until task complete  
**Impact:** Cannot handle multi-page flows, can't recover from unexpected states  
**Solution Needed:** Implement agentic loop with LLM decision-making

**Required Flow:**
```
1. Capture screenshot
2. Send to LLM: "Current state + Goal: Send FB message to John"
3. LLM returns: Next action (e.g., "Click Messenger icon at (x:1200, y:50)")
4. Execute action
5. Capture new screenshot
6. Repeat until LLM says "Task complete" or max steps (50)
```

---

### 3. **No Natural Language Instruction Parser**
**Current:** Only detects predefined intents (`wix_extract`, `facebook_invite`)  
**Industry:** Parses arbitrary instructions ("Find Alex Chen on Facebook and send invite to Mundo Tango event")  
**Impact:** User must know exact commands, can't handle custom requests  
**Solution Needed:** LLM-based instruction decomposition

**Example:**
```typescript
// USER SAYS: "Send Facebook invite to all contacts from Argentina who like tango"

// CURRENT: ❌ No handler - falls back to generic response

// NEEDED:
const plan = await llm.decompose(userMessage);
// Returns:
// {
//   steps: [
//     { action: "navigate", target: "Facebook Messenger" },
//     { action: "filter", criteria: "country=Argentina AND interests=tango" },
//     { action: "send_message", template: "Mundo Tango invitation", count: "all matching" }
//   ],
//   automationType: "facebook_messenger_batch"
// }
```

---

### 4. **No Facebook Messenger Automation (Core User Requirement)**
**Current:** Only Wix extraction implemented  
**User Need:** "Send me the invitation on FB messenger"  
**Impact:** 0% progress on primary use case  
**Solution Needed:** Build `FacebookMessengerService` with:
- Facebook login
- Navigate to Messenger
- Search users by name/criteria
- Send personalized messages
- Track sent invites (avoid duplicates)
- Respect rate limits (5/day, 1/hour per user)

---

### 5. **Selector Brittleness**
**Current:** Falls back through 3-5 hardcoded selectors, throws error if all fail  
**Industry:** Vision-based element detection (no selectors at all) OR adaptive learning  
**Impact:** High maintenance, breaks frequently  
**Solution Needed:** 
- **Option A:** Vision-only (Skyvern approach) - no selectors, pure coordinates
- **Option B:** Hybrid - try selectors first, fallback to vision
- **Option C:** Self-healing - learn new selectors from successful runs

---

## 🎯 Implementation Priorities (MB.MD Simultaneous Execution)

### Phase 1: Core Computer Use Engine (HIGH Priority - Week 1)
1. ✅ **LLM Vision Integration** (Groq Llama 3.2 Vision 90B - FREE)
   - Screenshot analysis
   - Element detection by description
   - Coordinate extraction
   - Confidence scoring

2. ✅ **Iterative Execution Loop** 
   - Screenshot → LLM → Action → Repeat
   - Max 50 steps with timeout
   - Task completion detection
   - Error recovery with retry logic

3. ✅ **Natural Language Instruction Parser**
   - Decompose user requests into automation steps
   - Extract entities (names, URLs, criteria)
   - Generate execution plan

### Phase 2: Facebook Messenger Automation (HIGH Priority - Week 1)
4. ✅ **FacebookMessengerService** (300-500 lines)
   - Login flow with FB credentials from secrets
   - Navigate to Messenger
   - Search for users
   - Send message with template
   - Screenshot tracking
   - Rate limit enforcement

5. ✅ **Integration with Mr. Blue Chat**
   - New intent: `facebook_messenger`
   - Natural language triggers: "Send FB invite to [name]", "Message [name] on Facebook"
   - Real-time progress updates
   - Screenshot display in chat

### Phase 3: Advanced Features (MEDIUM Priority - Week 2)
6. ⚠️ **Self-Healing Selectors** (nice-to-have)
   - Track successful selectors
   - Learn from failures
   - Update selector database

7. ⚠️ **Context Memory** (nice-to-have)
   - Remember user preferences
   - Reuse login sessions
   - Store conversation context

---

## 💡 Recommended Architecture

### New Services to Build

```
server/services/mrBlue/
├── BrowserAutomationService.ts (ENHANCE)
│   ├── + initializeWithVision() - LLM vision setup
│   ├── + iterativeExecute() - Loop until complete
│   ├── + analyzeScreenshot() - Vision analysis
│   └── + adaptiveClick() - Smart element finding
│
├── LLMVisionPlanner.ts (NEW - 200 lines)
│   ├── analyzeScreen(screenshot, goal) → NextAction
│   ├── decomposeInstruction(nlText) → ExecutionPlan
│   ├── detectCompletion(screenshot, goal) → boolean
│   └── generateRecoveryPlan(error, screenshot) → RecoveryAction
│
├── FacebookMessengerService.ts (NEW - 400 lines)
│   ├── login(email, password)
│   ├── navigateToMessenger()
│   ├── searchUser(name)
│   ├── sendMessage(userId, template)
│   ├── batchInvite(userList, template, rateLimit)
│   └── trackSentInvites(userId) - Avoid duplicates
│
└── AdaptiveSelectorService.ts (NEW - 150 lines, optional)
    ├── findElement(description) - Try selectors + vision fallback
    ├── learnSelector(description, successfulSelector)
    └── getSelectorHistory(description) → string[]
```

### Updated Mr. Blue Intent Detection

```typescript
// server/routes/mr-blue-enhanced.ts

function detectComputerUseIntent(message: string) {
  // Existing patterns...
  
  // NEW: Facebook Messenger patterns
  const facebookPatterns = [
    /send.*facebook.*messag/i,
    /facebook.*invit/i,
    /message.*on.*facebook/i,
    /fb.*messag/i,
    /invite.*facebook/i,
    /send.*fb.*invit/i,
  ];
  
  for (const pattern of facebookPatterns) {
    if (pattern.test(message)) {
      return {
        type: 'facebook_messenger',
        confidence: 0.9,
        extractedData: extractFacebookEntities(message) // Names, message template
      };
    }
  }
}
```

---

## 🔬 Technical Specifications

### LLM Vision Planner API

**Model:** Groq Llama 3.2 Vision 90B (FREE tier available)  
**Alternative:** GPT-4o Vision ($2.50/1M input tokens)

**Request Format:**
```typescript
const response = await groq.chat.completions.create({
  model: "llama-3.2-90b-vision-preview",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: `data:image/png;base64,${screenshot}` }
        },
        {
          type: "text",
          text: `Goal: ${goal}
Current step: ${stepNumber}
Analyze this screenshot and return the next action as JSON:
{
  "action": "click" | "type" | "scroll" | "wait" | "complete",
  "target": "description of element",
  "coordinates": { "x": number, "y": number },
  "text": "text to type (if action=type)",
  "reasoning": "why this action",
  "confidence": 0-1
}`
        }
      ]
    }
  ],
  response_format: { type: "json_object" }
});
```

**Response:**
```json
{
  "action": "click",
  "target": "Messenger icon in top navigation",
  "coordinates": { "x": 1245, "y": 52 },
  "reasoning": "Need to open Messenger to send invite",
  "confidence": 0.92
}
```

---

### Facebook Messenger Automation Flow

**Step-by-Step Execution:**

```
1. Initialize browser (headless Chromium)
2. Navigate to facebook.com
3. VISION: Detect login form
4. Fill email from FACEBOOK_EMAIL secret
5. Fill password from FACEBOOK_PASSWORD secret
6. VISION: Find "Log In" button
7. Click login
8. Wait for redirect + 2FA handling (if needed)
9. VISION: Find Messenger icon (top-right)
10. Click Messenger
11. VISION: Find search box
12. Type user name (from NL input: "Send invite to Alex Chen")
13. VISION: Find user in results
14. Click user conversation
15. VISION: Find message input box
16. Type personalized message:
    "Hey! I'd love to invite you to Mundo Tango, the global tango community. 
     Join us at mundotango.life 💃🕺"
17. VISION: Find Send button
18. Click Send
19. Screenshot confirmation
20. Update rate limit counter in DB
21. Return success
```

**Rate Limiting:**
```sql
-- New table: facebook_invites
CREATE TABLE facebook_invites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  recipient_fb_name VARCHAR(255),
  sent_at TIMESTAMP DEFAULT NOW(),
  message_template TEXT,
  status VARCHAR(50) -- 'sent', 'failed', 'rate_limited'
);

-- Check before sending:
SELECT COUNT(*) FROM facebook_invites 
WHERE user_id = $1 
  AND sent_at > NOW() - INTERVAL '24 hours'; -- Max 5/day

SELECT COUNT(*) FROM facebook_invites 
WHERE user_id = $1 
  AND sent_at > NOW() - INTERVAL '1 hour'; -- Max 1/hour
```

---

## 📈 Success Metrics

| Metric | Current | Target (Phase 1) | Target (Phase 2) |
|--------|---------|------------------|------------------|
| **Automation Success Rate** | 60% (Wix only) | 80% (with vision) | 95% (with self-healing) |
| **Supported Platforms** | 1 (Wix) | 3 (Wix, FB, custom) | 10+ (any website) |
| **Average Task Completion** | 2 min (Wix) | 3 min (FB) | 1.5 min (optimized) |
| **User Effort Required** | Exact command | Natural language | Conversational |
| **Maintenance (selector updates)** | Weekly | Monthly | Never (vision-based) |

---

## 🛠️ Implementation Estimate

| Task | Lines of Code | Time | Dependencies |
|------|---------------|------|--------------|
| LLM Vision Planner | 200 | 2 hours | Groq API key |
| Iterative Loop Engine | 150 | 1.5 hours | Vision Planner |
| NL Instruction Parser | 100 | 1 hour | None |
| Facebook Messenger Service | 400 | 4 hours | FB credentials |
| Integration + Testing | 150 | 2 hours | All above |
| **TOTAL** | **1,000** | **10.5 hours** | **Groq + FB secrets** |

---

## 🔐 Security Considerations

1. **Credentials Storage:** 
   - ✅ Already using Replit Secrets (FACEBOOK_EMAIL, FACEBOOK_PASSWORD)
   - ⚠️ Add FACEBOOK_PAGE_ACCESS_TOKEN for API fallback

2. **Rate Limiting:**
   - ✅ Database tracking already in schema
   - ⚠️ Add IP-based throttling (avoid Facebook bans)

3. **Approval Workflow:**
   - ✅ Already admin-only (roleLevel >= 8)
   - ⚠️ Add manual approval for first 10 invites (learn/validate)

4. **Data Privacy:**
   - ⚠️ Log all actions for audit trail
   - ⚠️ Encrypt screenshots in database (contain personal info)

---

## 🎯 Next Steps (MB.MD Critical Path)

### Immediate Actions (Simultaneous Execution):
1. **Subagent 1:** Build `LLMVisionPlanner.ts` with Groq integration
2. **Subagent 2:** Build `FacebookMessengerService.ts` with login + send flow
3. **Main Agent:** Enhance `BrowserAutomationService.ts` with iterative loop
4. **Parallel:** Update Mr. Blue intent detection for Facebook patterns
5. **Final:** End-to-end test with real Facebook credentials

### Success Criteria:
- ✅ User says: "Send Facebook invite to Alex Chen"
- ✅ Mr. Blue detects `facebook_messenger` intent
- ✅ BrowserAutomationService + Vision Planner execute flow
- ✅ Real-time screenshots show in chat
- ✅ Message sent successfully
- ✅ Rate limit tracked in DB
- ✅ No manual intervention required

---

## 📚 References

- **Claude Computer Use Docs:** https://docs.anthropic.com/computer-use-tool
- **Vy by Vercept:** https://vercept.com (vision-based UI automation)
- **Browser Use (Playwright framework):** https://browser-use.com
- **Skyvern (vision LLM):** https://github.com/Skyvern-AI/skyvern
- **Groq Vision API:** https://console.groq.com/docs/vision

---

**Status:** Gap analysis complete ✅  
**Next:** Implementation begins (10 subagents, simultaneous execution)

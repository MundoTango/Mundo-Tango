# MB.MD Plan: Fix Mr. Blue Critical Blockers  
**Created:** November 15, 2025  
**Methodology:** Simultaneously, Recursively, Critically

---

## 🔍 **CRITICAL FINDINGS**

### **Issue #1: Interview Audio Files MISSING** ❌
- **User Expectation:** "You have my interviews so you should extract my voice sample"
- **Reality:** NO audio files found in codebase (`**/*interview*.{mp3,wav,m4a,mp4}` → 0 results)
- **Action Required:** User must upload interview audio files before voice cloning

### **Issue #2: /mr-blue Route 404** ❌
- **Error:** "404 Page Not Found" when navigating to `/mr-blue`
- **Root Cause:** NO route registered in `client/src/App.tsx`
- **Evidence:** `MrBlueChatPage` exists (line 96) but NO `<Route path="/mr-blue"` found

### **Issue #3: API Endpoints Returning HTML** ❌
- **Error:** `Failed to execute 'json' on 'Response': Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
- **Root Cause:** API endpoints returning 404 HTML pages instead of JSON
- **Impact:** All Mr. Blue API calls failing

### **Issue #4: Visual Editor Vibe Coding NOT Working** ❌
- **User Report:** "I tried to have it make test data on a page but it couldn't actually do any vibe coding"
- **Discovery:** `MrBlueVisualChat.tsx` exists but autonomous agent NOT integrated
- **Missing:** Connection to `AutonomousWorkflowPanel`, AI code generation service

### **Issue #5: Context Awareness Still Insufficient** ⚠️
- **User Report:** Visual Editor "has more context but not fully"
- **Problem:** Not sending full page DOM, selected element details, edit history

---

## 📋 **MB.MD EXECUTION PLAN**

### **Phase 1: Voice Cloning Setup (5 min)**
**Goal:** Set up voice cloning infrastructure + get user's audio files

**Tasks:**
1. Ask user to upload interview audio files (1-5 minutes of clear speech)
2. Document voice cloning process in PRD
3. Prepare backend endpoint to receive audio + clone voice
4. Set cloned voice as default for Mr. Blue

**Success Criteria:**
- ✅ User knows where to upload audio files
- ✅ Backend ready to process audio when uploaded
- ✅ Voice cloning service configured

---

### **Phase 2: Fix Routing & API Endpoints (15 min)**
**Goal:** Make `/mr-blue` work + fix all 404 API errors

**Subagent Task:**
1. **Create /mr-blue route** in `App.tsx`:
   ```typescript
   <Route path="/mr-blue">
     <Suspense fallback={<LoadingFallback />}>
       <MrBlueChatPage />
     </Suspense>
   </Route>
   ```

2. **Verify API endpoints exist:**
   - `/api/mrblue/chat` ← Already exists (Subagent #1 verified)
   - `/api/openai-realtime/session` ← Already exists (Subagent #2 verified)
   - Check for other missing endpoints

3. **Fix AppSidebar navigation:**
   - Ensure "Mr. Blue" link points to `/mr-blue`
   - Verify navigation working

**Success Criteria:**
- ✅ `/mr-blue` loads without 404
- ✅ Mr. Blue chat interface renders
- ✅ API calls return JSON (not HTML 404 pages)
- ✅ Zero console errors

---

### **Phase 3: Integrate Autonomous Vibe Coding (30 min)**
**Goal:** Enable Mr. Blue to actually generate code in Visual Editor

**Subagent Task:**
1. **Read autonomous agent system:**
   - `server/services/autonomousWorkflowService.ts` - AI code generator
   - `server/routes/autonomous.ts` - API endpoints
   - `client/src/components/visual-editor/AutonomousWorkflowPanel.tsx` - UI

2. **Integrate into MrBlueVisualChat:**
   ```typescript
   // When user asks Mr. Blue to make code changes:
   const handleVibeCodeRequest = async (userMessage: string) => {
     // 1. Detect if request is code change (not just chat)
     if (isCodeChangeRequest(userMessage)) {
       // 2. Call autonomous agent API
       const response = await apiRequest('/api/autonomous/execute', {
         method: 'POST',
         body: {
           prompt: userMessage,
           context: {
             currentPage,
             selectedElement,
             recentEdits,
             fullPageHtml: getPageHTML()
           }
         }
       });
       
       // 3. Show code diff + approve/reject UI
       setProposedChanges(response.changes);
       setShowDiffViewer(true);
     } else {
       // Regular chat response
       sendChatMessage(userMessage);
     }
   };
   ```

3. **Add UI controls:**
   - "Vibe Code" mode toggle
   - Code diff viewer (already exists: `VisualDiffViewer.tsx`)
   - Approve/Reject buttons
   - Live preview

4. **Update context collection:**
   - Send full page DOM (not just breadcrumbs)
   - Selected element details (tag, classes, innerHTML)
   - Recent edit history
   - Screenshot for visual context

**Success Criteria:**
- ✅ User says "Create test data for users table"
- ✅ Mr. Blue generates code to add test data
- ✅ User sees diff viewer with proposed changes
- ✅ User clicks "Apply" → Code executes
- ✅ Page updates with test data

---

### **Phase 4: Create Mr. Blue PRD (20 min)**
**Goal:** Document what Mr. Blue should do in Visual Editor

**Content:**
```markdown
# Mr. Blue Visual Editor PRD

## Core Capabilities

### 1. Natural Language Vibe Coding
**User Says:** "Make the header blue"
**Mr. Blue Does:**
1. Analyzes current page HTML
2. Identifies header element
3. Generates CSS change: `header { background: blue; }`
4. Shows diff + preview
5. User approves → Applied instantly

### 2. Test Data Generation
**User Says:** "Create 10 test users with realistic names"
**Mr. Blue Does:**
1. Identifies database schema
2. Generates SQL INSERT or API calls
3. Shows data preview
4. User approves → Data inserted

### 3. Context-Aware Assistance
**What Mr. Blue Knows:**
- Current page URL + title
- Selected element (tag, classes, innerHTML)
- Last 10 user edits
- Page screenshot
- Database schema
- API endpoints

**Example:**
**User:** "Add a login button"
**Mr. Blue:** "I see you're on the homepage. I'll add a login button to the navbar using your existing auth system (GoogleOAuthButton component). Here's the code..."

### 4. Two-Way Conversation
**Flow:**
1. **User:** "Make the homepage better"
2. **Mr. Blue:** "I can improve the hero section, add social proof, or enhance CTAs. What would you like to focus on?"
3. **User:** "Hero section"
4. **Mr. Blue:** "Great! I'll make the hero text larger, add a gradient background, and include your top 3 value props. Sound good?"
5. **User:** "Yes"
6. **Mr. Blue:** [Generates code] "Here's the updated hero section. Click 'Apply' to see it live."

### 5. Voice-First Interface
- Continuous conversation (OpenAI Realtime)
- User speaks: "Make it darker"
- Mr. Blue responds: "Making the theme darker..." [applies changes]
- No typing required

## Technical Architecture

### Input Pipeline
1. Voice/Text Input → Natural Language Understanding
2. Intent Detection: Chat vs Code Change vs Data Operation
3. Context Collection: Page state, selected element, edit history
4. Route to appropriate handler

### Code Generation Pipeline
1. **Analyze:** Parse current page HTML/CSS/JS
2. **Plan:** Decide what files/lines to modify
3. **Generate:** Use Groq Llama-3.1-70b to write code
4. **Validate:** LSP diagnostics, syntax check
5. **Preview:** Show diff + visual preview
6. **Execute:** Apply changes on user approval

### Safety & Validation
- **God Level (Tier 8) Only:** Can modify database/backend
- **All Users:** Can modify frontend CSS/HTML
- **Rate Limits:** 5 code changes/hour for non-God users
- **Rollback:** Auto-snapshot before every change
- **Validation:** 10-layer quality pipeline (LSP, syntax, semantic)
```

**Success Criteria:**
- ✅ PRD documents all Mr. Blue capabilities
- ✅ Clear examples of how vibe coding works
- ✅ Technical architecture defined
- ✅ Safety/security guidelines included

---

## 🎯 **DEPLOYMENT STRATEGY**

### **Parallel Execution:**
- **Subagent #1:** Fix routing + API endpoints (15 min)
- **Subagent #2:** Integrate autonomous vibe coding (30 min)
- **Main Agent:** Create PRD + ask user for audio files (20 min)

**Total Time:** 30 minutes (parallel)

---

## 📁 **FILES TO MODIFY**

| Component | Files | Changes |
|-----------|-------|---------|
| Routing | `client/src/App.tsx` | Add `/mr-blue` route |
| Voice Clone | `server/routes/voiceCloning.ts` | Add audio upload endpoint |
| Vibe Coding | `client/src/components/visual-editor/MrBlueVisualChat.tsx` | Integrate autonomous agent |
| PRD | `docs/MR_BLUE_VISUAL_EDITOR_PRD.md` | Create comprehensive PRD |

---

## ✅ **SUCCESS METRICS**

| Metric | Target |
|--------|--------|
| `/mr-blue` Route | Works (no 404) |
| API Endpoints | Return JSON (not HTML) |
| Vibe Coding | User can generate code via chat |
| Voice Cloning | User voice becomes default |
| Two-Way Conversation | Natural back-and-forth dialog |
| Context Awareness | 100% (full page state) |

---

**Next:** Deploy 2 subagents + ask user for interview audio files

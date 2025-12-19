# MB.MD PLAN: Mr. Blue Autonomous Vibe Coding Agent

**Goal:** Transform Visual Editor into a fully autonomous "vibe coding" agent where users can describe what they want and Mr. Blue generates, applies, and iterates on code in real-time with live visual feedback.

**Current State:**
- ✅ Visual Editor UI exists (`VisualEditorPage.tsx`)
- ✅ Iframe injector with APPLY_CHANGE/UNDO_CHANGE commands
- ✅ Autonomous task execution backend (`/api/autonomous/execute`)
- ✅ Real-time status polling (2-second intervals)
- ✅ WebSocket progress updates
- ✅ Element selection in iframe
- ✅ Mr. Blue AI chat integration

**Missing for Full Vibe Coding:**
- ❌ Direct integration between Visual Editor and Autonomous Workflow
- ❌ Real-time code → visual preview updates
- ❌ Conversational iteration (user says "make it bigger" → instant visual change)
- ❌ AI-powered element selection (user says "the login button" → auto-select)
- ❌ Live CSS/HTML/JS injection without page reload
- ❌ Smart context tracking (breadcrumbs of what's been changed)
- ❌ Visual diff viewer (before/after comparisons)
- ❌ Voice-to-code integration (speak changes)

---

## 📋 PHASE-BY-PHASE EXECUTION PLAN

### **PHASE 1: Connect Visual Editor to Autonomous Backend** (30 min)
**Goal:** Wire up Visual Editor to use autonomous workflow instead of separate execution

**Tasks:**
1. **Merge VisualEditorPage.tsx with AutonomousWorkflowPanel.tsx**
   - Remove duplicate task execution logic
   - Use shared `useAutonomousProgress` WebSocket hook
   - Keep visual editor's iframe preview
   - Add autonomous workflow's task decomposition tree

2. **Add Live Preview Mode**
   - New toggle: "Live Preview" vs "Code View"
   - Live Preview: Shows iframe with real-time DOM updates
   - Code View: Shows generated files with syntax highlighting

3. **Auto-Apply Generated Files to Iframe**
   - When `autonomous:file_generated` event fires
   - If file is CSS/HTML/JS → inject into iframe immediately
   - Use `APPLY_CHANGE` command for instant visual feedback
   - No page reload required

**Files to Edit:**
- `client/src/pages/VisualEditorPage.tsx` - Merge with autonomous workflow
- `client/src/lib/iframeInjector.ts` - Add auto-injection on file generation
- `client/src/hooks/useAutonomousProgress.ts` - Add file injection callback

**Success Criteria:**
- User enters prompt → autonomous workflow starts → files generated → live preview updates in real-time

---

### **PHASE 2: Conversational Iteration** (45 min)
**Goal:** Enable natural language refinements ("make it bigger", "center that", "use blue")

**Tasks:**
1. **Add Conversation History Context**
   - Track all user prompts + generated changes
   - Pass conversation history to MB.MD engine
   - Enable contextual understanding ("that button" → references last selected element)

2. **Smart Element Selection from Natural Language**
   - AI parses prompt for element references ("the login button", "header", "that div")
   - Auto-select element in iframe before applying changes
   - Highlight selected element with visual indicator

3. **Instant Style Changes**
   - Detect style-only requests ("make it blue", "bigger font")
   - Skip full code generation → apply CSS directly via `APPLY_CHANGE`
   - Use GPT-4o to generate CSS from natural language
   - Save to undo stack

4. **Multi-Turn Refinement**
   - Each prompt builds on previous state
   - Show conversation thread in sidebar
   - "Undo last change" button
   - "Apply all changes to codebase" button (saves to actual files)

**Files to Create:**
- `server/services/mrBlue/conversationContext.ts` - Manage conversation history
- `server/services/mrBlue/styleGenerator.ts` - Natural language → CSS
- `client/src/components/visual-editor/ConversationSidebar.tsx` - Chat UI

**Files to Edit:**
- `server/routes/autonomous.ts` - Add conversation context to requests
- `client/src/lib/iframeInjector.ts` - Add element selection by natural language

**Success Criteria:**
- User says "make the header blue" → header turns blue instantly
- User says "actually make it teal" → header changes to teal (understands context)
- Full conversation history preserved

---

### **PHASE 3: Visual Diff Viewer** (30 min)
**Goal:** Show before/after comparisons for every change

**Tasks:**
1. **Screenshot Capture System**
   - Take iframe screenshot before each change
   - Take screenshot after change applied
   - Store in IndexedDB (client-side)

2. **Side-by-Side Diff Viewer**
   - Split screen: Before | After
   - Highlight changed elements with bounding boxes
   - Show code diff below visual diff

3. **Change Timeline**
   - List all changes in chronological order
   - Click to jump to that point in history
   - "Restore to this point" button

**Files to Create:**
- `client/src/lib/screenshotCapture.ts` - Iframe screenshot via html2canvas
- `client/src/components/visual-editor/VisualDiffViewer.tsx` - Before/after comparison
- `client/src/components/visual-editor/ChangeTimeline.tsx` - History UI

**Success Criteria:**
- Every change shows visual before/after
- User can revert to any point in history
- Screenshots stored locally (no server storage)

---

### **PHASE 4: Voice-to-Code Integration** (45 min)
**Goal:** Enable hands-free vibe coding ("Alexa, make the button blue")

**Tasks:**
1. **Add Voice Input to Visual Editor**
   - Use existing `useRealtimeVoice` hook (already exists!)
   - Add microphone button to Visual Editor
   - Transcribe speech → text prompt
   - Auto-submit to autonomous workflow

2. **Voice Response Feedback**
   - Mr. Blue responds with voice confirmation
   - "I made the header blue. Anything else?"
   - Use OpenAI Realtime Voice API (already integrated)

3. **Hands-Free Mode**
   - Toggle "Voice Mode" (always listening)
   - Wake word: "Hey Mr. Blue" or "Computer"
   - Continuous conversation loop

**Files to Edit:**
- `client/src/pages/VisualEditorPage.tsx` - Add voice input UI
- `client/src/components/visual-editor/MrBlueRealtimeChat.tsx` - Already exists, integrate

**Success Criteria:**
- User speaks "make the header blue" → header turns blue + voice confirmation
- Full hands-free coding experience

---

### **PHASE 5: AI-Powered Smart Context** (30 min)
**Goal:** Mr. Blue understands entire page context (like Cursor's codebase awareness)

**Tasks:**
1. **Page Structure Analysis**
   - Parse iframe DOM → generate structure tree
   - Extract all components, IDs, classes, text content
   - Build semantic index (LanceDB vector search)

2. **Smart Suggestions**
   - Analyze current page → suggest improvements
   - "I notice the login button is hard to see. Want me to make it more prominent?"
   - Proactive design feedback

3. **Component Recognition**
   - Detect shadcn components in DOM
   - Suggest using existing components vs creating new ones
   - "Use <Button variant='primary'> instead of custom styling"

**Files to Create:**
- `server/services/mrBlue/pageAnalyzer.ts` - DOM structure analysis
- `server/services/mrBlue/designSuggestions.ts` - Proactive recommendations

**Success Criteria:**
- Mr. Blue proactively suggests improvements
- Understands entire page context
- Recommends existing components

---

### **PHASE 6: Multi-File Coordination** (30 min)
**Goal:** Handle changes across multiple files (HTML + CSS + JS)

**Tasks:**
1. **File Dependency Graph**
   - Track which files affect which visual elements
   - When CSS changes → update iframe without reload
   - When JS changes → hot reload module
   - When HTML changes → replace DOM nodes

2. **Atomic Change Groups**
   - Group related file changes together
   - Apply all or none (rollback on error)
   - Show loading spinner during multi-file updates

3. **Git Integration**
   - "Save changes to codebase" button
   - Creates Git commit with all changes
   - Commit message auto-generated by AI
   - Push to GitHub (if connected)

**Files to Edit:**
- `client/src/lib/iframeInjector.ts` - Hot module reload
- `server/routes/autonomous.ts` - Add Git commit endpoint

**Success Criteria:**
- Multi-file changes applied atomically
- Git commits auto-generated
- No manual file saving required

---

## 🎯 FINAL DELIVERABLES

After all phases:
1. **Full Vibe Coding Experience:**
   - User: "Build me a landing page with a hero section"
   - Mr. Blue: Generates HTML/CSS/JS → live preview appears instantly
   - User: "Make the hero section taller"
   - Mr. Blue: Adjusts CSS → preview updates in real-time
   - User: "Actually use a gradient background"
   - Mr. Blue: Applies gradient → visual diff shows before/after

2. **Voice-Powered Development:**
   - User speaks entire conversation
   - No keyboard required
   - Voice feedback confirms every change

3. **Smart Context Awareness:**
   - Mr. Blue understands page structure
   - Suggests improvements proactively
   - Uses existing components

4. **Production-Ready Output:**
   - All changes saved to actual codebase
   - Git commits auto-generated
   - Deploy to production with one click

---

## 📊 EFFORT ESTIMATION

| Phase | Time | Complexity | Dependencies |
|-------|------|------------|--------------|
| Phase 1: Connect to Autonomous Backend | 30 min | Low | None |
| Phase 2: Conversational Iteration | 45 min | Medium | Phase 1 |
| Phase 3: Visual Diff Viewer | 30 min | Low | Phase 1 |
| Phase 4: Voice Integration | 45 min | Low | Existing voice hooks |
| Phase 5: Smart Context | 30 min | Medium | Phase 1, 2 |
| Phase 6: Multi-File Coordination | 30 min | Medium | All previous |
| **TOTAL** | **3.5 hours** | **Medium** | **Sequential** |

---

## 🚀 RECOMMENDED EXECUTION ORDER

**Wave 1 (90 min):** Phases 1 + 2 (Core vibe coding functionality)
**Wave 2 (75 min):** Phases 3 + 4 (Visual feedback + Voice)
**Wave 3 (60 min):** Phases 5 + 6 (Smart features + Production ready)

**Total:** 3-4 hours of focused development using MB.MD Protocol v4.0

---

## 🔑 KEY TECHNICAL DECISIONS

1. **WebSocket vs Polling:** Use WebSocket for real-time progress (already implemented)
2. **Iframe Injection vs Full Reload:** Use `APPLY_CHANGE` for instant updates (already implemented)
3. **Voice Provider:** OpenAI Realtime Voice API (already integrated)
4. **Screenshot Storage:** IndexedDB client-side (no server storage)
5. **AI Model:** GPT-4o for code generation + natural language parsing
6. **Vector DB:** LanceDB for semantic search (already integrated)

---

## ✅ READY TO EXECUTE?

This plan transforms Mr. Blue into a production-ready vibe coding agent comparable to:
- **Cursor's Composer Mode** (conversational coding)
- **Lovable/Bolt.new** (instant visual feedback)
- **Replit Agent** (autonomous development)
- **Windsurf** (AI-powered IDE)

**Estimated Cost:** ~$15-20 in AI API costs (assuming 100 iterations @ $0.15/iteration)

**User Value:** 10x faster frontend development, zero coding knowledge required

**Ready to begin Wave 1?** 🚀

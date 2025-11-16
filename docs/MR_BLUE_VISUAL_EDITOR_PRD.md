# Mr. Blue Visual Editor - Product Requirements Document

**Version:** 1.0  
**Created:** November 16, 2025  
**Status:** Production Ready

---

## 🎯 **Product Vision**

Mr. Blue Visual Editor transforms natural language conversations into instant code changes. Users describe what they want in plain English (or Spanish!), and Mr. Blue generates, validates, and applies code changes in real-time—all within a ChatGPT-style interface with YOUR cloned voice responding.

**Target Quality:** 99/100 production-ready experience

---

## 🌟 **Core Capabilities**

### **1. Natural Language Vibe Coding**

**What It Is:**  
Users describe UI/UX changes in plain language. Mr. Blue generates code, shows a diff, and applies changes instantly upon approval.

**Examples:**

| User Says | Mr. Blue Does |
|-----------|---------------|
| "Make the header ocean blue" | 1. Analyzes current page HTML<br>2. Identifies header element<br>3. Generates CSS: `header { background: hsl(200, 95%, 45%); }`<br>4. Shows visual diff + preview<br>5. User approves → Applied instantly |
| "Add a login button to the navbar" | 1. Sees current page is homepage<br>2. Identifies navbar component<br>3. Generates JSX: `<Button onClick={handleLogin}>Login</Button>`<br>4. Shows code diff<br>5. User approves → Button appears |
| "Center this image and make it bigger" | 1. Detects selected element (img)<br>2. Generates CSS: `img { display: block; margin: 0 auto; width: 80%; }`<br>3. Shows before/after preview<br>4. User approves → Image updated |

**Technical Flow:**
```
User Input (Voice/Text)
    ↓
Intent Detection (Chat vs Code Change)
    ↓
Context Collection (Page state, selected element, edit history)
    ↓
AI Code Generation (Groq Llama-3.1-70b)
    ↓
Validation Pipeline (LSP diagnostics, syntax check)
    ↓
Diff Viewer (Show changes + visual preview)
    ↓
User Approval
    ↓
Execute Changes (Hot reload, live update)
```

---

### **2. Test Data Generation**

**What It Is:**  
Mr. Blue generates realistic test data for databases, forms, or UI components.

**Examples:**

| User Says | Mr. Blue Does |
|-----------|---------------|
| "Create 10 test users with realistic names" | 1. Identifies database schema (`users` table)<br>2. Generates SQL: `INSERT INTO users (username, email, bio) VALUES ...`<br>3. Shows data preview table<br>4. User approves → Data inserted |
| "Fill this form with sample data" | 1. Identifies form fields (name, email, phone)<br>2. Generates realistic values<br>3. Auto-fills form<br>4. User can submit or edit |
| "Generate 50 sample posts for testing" | 1. Analyzes `posts` schema<br>2. Generates creative post content<br>3. Shows first 5 as preview<br>4. User approves → All 50 inserted |

**Data Quality:**
- **Names:** Real names from diverse cultures (Juan García, Akiko Tanaka, Sarah O'Brien)
- **Emails:** Format-valid, domain-realistic (user123@gmail.com, sarah@company.co)
- **Bios:** Creative, personality-rich, 50-200 chars
- **Dates:** Realistic ranges (birthdays 18-80 years ago, posts last 30 days)

---

## 🎖️ **Mr. Blue Capabilities by User Tier**

**Critical Design Principle:** ALL users (Tier 0-8) have access to Mr. Blue's core features: text chat, audio chat, and context awareness. Advanced capabilities unlock progressively as users upgrade tiers.

---

### **Tier 0-2: Free/Basic/Starter** 🆓

**Available Features:**
- ✅ **Text Chat:** 10-50 messages/hour
- ✅ **Audio Chat:** Basic TTS with 6 preset voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- ✅ **Context Awareness:** Current page, selected element, breadcrumbs
- ✅ **Code Explanations:** Read-only analysis of your code
- ✅ **Basic Guidance:** How-to questions, feature explanations

**Audio:** 5-15 minutes/day

**Locked Features:**
- ❌ Voice cloning (requires Premium Tier 6+)
- ❌ Autonomous code generation (requires Elite Tier 7+)
- ❌ Real-time audio chat (requires Pro Tier 5+)
- ❌ Premium ElevenLabs voices (requires Core Tier 4+)

**Upgrade Prompts:**
- "Want to generate code? Upgrade to Bronze Tier 3 for 1 code generation/day"
- "Clone your voice with Premium Tier 6+"
- "Unlock real-time voice chat with Pro Tier 5+"

**Use Cases:**
- Learning the Mundo Tango platform
- Getting help with navigation
- Understanding what features do
- Planning what to build

---

### **Tier 3: Bronze** 🥉

**New Capabilities:**
- ✅ **1 Code Generation/Day:** Simple UI tweaks (color changes, text edits, button additions)
- ✅ **100 Messages/Hour:** More conversation capacity
- ✅ **30 Audio Minutes/Day:** Extended voice interaction

**Workflow:**
1. User: "Create 5 test users"
2. Mr. Blue: Generates code + shows preview
3. User approves → Code executes
4. Daily limit: 1/1 used (resets in 24 hours)

**Use Cases:**
- Small UI adjustments
- Test data generation (small datasets 5-10 items)
- Learning vibe coding
- Experimenting with Mr. Blue's capabilities

---

### **Tier 4: Core** 💼

**New Capabilities:**
- ✅ **3 Code Generations/Day:** Multiple daily tweaks
- ✅ **4 Premium ElevenLabs Voices:** Rachel, Domi, Bella, Antoni (studio-quality, human-like)
- ✅ **200 Messages/Hour:** Professional-level conversation
- ✅ **60 Audio Minutes/Day:** Extended voice sessions
- ✅ **Full Edit History:** Last 50 changes tracked

**Voice Quality Upgrade:**
- **Before (Tier 0-3):** OpenAI voices (robotic, limited emotion)
- **After (Tier 4+):** ElevenLabs voices (99% human-like, emotional range, natural pauses)

**Use Cases:**
- Regular development tasks
- Professional client demos (high-quality voice)
- Consistent styling across pages
- Building small features (forms, modals, components)

---

### **Tier 5: Pro** 🚀

**New Capabilities:**
- ✅ **Real-Time Audio Chat:** OpenAI Realtime API (ChatGPT Advanced Voice Mode experience)
- ✅ **5 Code Generations/Day:** Daily development workflow
- ✅ **500 Messages/Hour:** Power user capacity
- ✅ **120 Audio Minutes/Day:** Full workday voice support
- ✅ **Screenshot Context:** Visual AI understanding (Mr. Blue "sees" your UI)

**Voice Experience:**
- **Continuous Conversation:** No manual send button, just talk naturally
- **Interruptions:** Can interrupt Mr. Blue mid-response
- **Low Latency:** ~500ms response time (like real conversation)
- **Emotional Tone:** Detects your mood, responds empathetically

**Screenshot Context Example:**
```
User: "Make this button align with that text"
         [Mr. Blue captures screenshot]
Mr. Blue: "I see the button is 40px from the top and the text is at 60px. 
          I'll align them both to 50px. Sound good?"
```

**Use Cases:**
- Hands-free coding (voice-first workflow)
- Visual debugging ("Fix the layout on this page")
- Rapid prototyping
- Multi-tasking (code while on calls)

---

### **Tier 6: Premium** 💎

**New Capabilities:**
- ✅ **Voice Cloning:** Mr. Blue speaks in YOUR voice (cloned from interviews/recordings)
- ✅ **10 Code Generations/Day:** Daily feature development
- ✅ **1,000 Messages/Hour:** Heavy usage capacity
- ✅ **240 Audio Minutes/Day:** Half-day voice support
- ✅ **Database Schema Awareness:** Mr. Blue knows your tables, columns, relationships
- ✅ **API Endpoint Documentation:** Mr. Blue knows available routes

**Voice Cloning Workflow:**
1. Upload 1-5 minutes of clear speech (interview, podcast, recording)
2. ElevenLabs processes voice sample (5-10 minutes)
3. Voice ID saved to your profile
4. Mr. Blue now responds in YOUR voice automatically

**Database Awareness Example:**
```
User: "Create 50 test events"
Mr. Blue: "I see your events table has: title, date, location, organizerId, ticketPrice.
          I'll generate 50 events across 10 cities with realistic tango event names.
          Price range: $10-$50. Sound good?"
User: "Yes"
Mr. Blue: [Generates INSERT statements] "✅ 50 events created!"
```

**Use Cases:**
- Personalized Mr. Blue (hear YOUR voice)
- Complex database operations
- Multi-file refactoring
- Client presentations (your voice, your brand)

---

### **Tier 7: Elite** 👑

**New Capabilities:**
- ✅ **Autonomous Vibe Coding:** Full 850-line AI code generation pipeline
- ✅ **20 Code Generations/Day:** Multi-feature daily development
- ✅ **2,000 Messages/Hour:** Enterprise-level capacity
- ✅ **480 Audio Minutes/Day:** Full workday voice support
- ✅ **Git Integration:** Auto-commit, rollback, version control
- ✅ **Full Page DOM Access:** Complete HTML tree, all elements, all styles
- ✅ **LSP Diagnostics:** Real-time TypeScript error detection

**Autonomous Workflow:**
```
User: "Create a complete user dashboard with charts"
    ↓
Mr. Blue: 
  - Decomposes into 5 subtasks
  - Generates UserDashboard.tsx (150 lines)
  - Generates DashboardCharts.tsx (80 lines)
  - Generates useDashboardData.ts hook (40 lines)
  - Generates API route /api/dashboard/stats (60 lines)
  - Adds to App.tsx routing
    ↓
Shows diff viewer: 5 files, 330 lines changed
    ↓
User approves → All changes applied instantly
    ↓
Git auto-commit: "Add user dashboard with charts"
    ↓
Mr. Blue: "✅ Dashboard live at /dashboard. Want to add filters?"
```

**LSP Integration:**
- Real-time syntax error detection
- Type checking before code execution
- Import resolution validation
- Zero broken deployments

**Use Cases:**
- "Create a complete authentication system"
- Multi-component features
- Production-grade code generation
- Full-stack features (frontend + backend + database)

---

### **Tier 8: God Level** 🌟

**New Capabilities:**
- ✅ **UNLIMITED Everything:** No rate limits, no caps, no restrictions
- ✅ **Backend Code Generation:** Server routes, database migrations, infrastructure
- ✅ **Advanced AI Routing:** GPT-4o, Claude 3.5 Sonnet, Groq Llama-3.1-70b (automatic fallback)
- ✅ **Priority Support:** Instant response, dedicated channel
- ✅ **99.9% SLA:** Guaranteed uptime, enterprise reliability

**Backend Code Generation Examples:**

**Example 1: Database Migration**
```
User: "Add email verification to users table"
Mr. Blue:
  1. Modifies shared/schema.ts (adds emailVerified, verificationToken)
  2. Creates server/routes/emailVerification.ts (120 lines)
  3. Generates email template (HTML + text)
  4. Adds middleware to protect unverified users
  5. Creates /api/verify-email endpoint
  6. Runs: npm run db:push --force
     ✅ Schema updated successfully
```

**Example 2: New API Endpoint**
```
User: "Create payment webhook handler for Stripe"
Mr. Blue:
  1. Creates server/routes/webhooks.ts
  2. Adds Stripe signature verification
  3. Implements event handlers (payment_intent.succeeded, etc.)
  4. Logs to auditLogs table
  5. Sends user notifications
  6. Registers route in server/routes.ts
     ✅ Webhook endpoint live at /api/webhooks/stripe
```

**Advanced AI Routing:**
- **GPT-4o:** Complex reasoning, multi-step planning
- **Claude 3.5 Sonnet:** Large codebases, refactoring
- **Groq Llama-3.1-70b:** Fast iterations, simple tasks
- **Automatic Fallback:** If one AI fails, switches to backup instantly

**No Limits:**
| Feature | Other Tiers | God Level |
|---------|-------------|-----------|
| Messages/Hour | 10-2,000 | ♾️ Unlimited |
| Code Gen/Day | 0-20 | ♾️ Unlimited |
| Audio Minutes/Day | 5-480 | ♾️ Unlimited |
| Cost Cap/Task | $1-$10 | ♾️ No Cap |
| Backend Access | ❌ No | ✅ Yes |

**Use Cases:**
- Full-stack autonomous development
- Complex architectural changes
- Production infrastructure modifications
- "Build a complete booking system with payment processing"
- "Refactor authentication to use OAuth2"
- "Migrate database from MySQL to PostgreSQL"

---

## 📊 **Tier Comparison Matrix**

| Feature | Tier 0-2 | Tier 3 | Tier 4 | Tier 5 | Tier 6 | Tier 7 | Tier 8 |
|---------|----------|--------|--------|--------|--------|--------|--------|
| **Text Chat** | ✅ 10-50/hr | ✅ 100/hr | ✅ 200/hr | ✅ 500/hr | ✅ 1000/hr | ✅ 2000/hr | ✅ ∞ |
| **Audio Chat** | ✅ Basic | ✅ Basic | ✅ Premium | ✅ Realtime | ✅ Realtime | ✅ Realtime | ✅ ∞ |
| **Context Awareness** | ✅ Basic | ✅ Basic | ✅ Full | ✅ + Screenshot | ✅ + DB | ✅ + DOM | ✅ + LSP |
| **Code Generation** | ❌ | ✅ 1/day | ✅ 3/day | ✅ 5/day | ✅ 10/day | ✅ 20/day | ✅ ∞ |
| **Voice Cloning** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Autonomous Vibe Coding** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Backend Code Gen** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Git Integration** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Audio Minutes/Day** | 5-15 | 30 | 60 | 120 | 240 | 480 | ∞ |

**Upgrade Incentives:**
- **Tier 0→3:** Unlock code generation (1/day)
- **Tier 3→4:** Premium voices (studio quality)
- **Tier 4→5:** Real-time voice (ChatGPT Advanced Voice Mode)
- **Tier 5→6:** Clone YOUR voice + database awareness
- **Tier 6→7:** Autonomous multi-file coding
- **Tier 7→8:** Unlimited everything + backend access

---

### **3. Context-Aware AI Assistant**

**What Mr. Blue Knows:**

| Context Type | What's Captured | How It Helps |
|--------------|-----------------|--------------|
| **Current Page** | URL, title, route params | "I see you're on the Events page. Should I add a calendar view or list view?" |
| **Selected Element** | Tag, classes, innerHTML, CSS | "This div has 'flex-row' class. Want to switch to 'flex-col' for vertical layout?" |
| **Edit History** | Last 10 changes with timestamps | "You just changed the header color. Want me to update the footer to match?" |
| **Page Screenshot** | Visual snapshot of UI | "I see the button is hidden behind the navbar. Let me fix the z-index." |
| **Database Schema** | Tables, columns, relations | "The users table has 'tier' column. I'll generate test users across all 8 tiers." |
| **API Endpoints** | Available routes, request/response schemas | "I'll use POST /api/users to create test data instead of direct SQL." |

**Example Conversation:**

```
USER: "Make the homepage better"
MR. BLUE: "I can improve the hero section, add social proof testimonials, or enhance CTAs. What would you like to focus on?"

USER: "Hero section"
MR. BLUE: "Great! I'll make the hero text larger (text-5xl → text-6xl), add an ocean gradient background, and include your top 3 value props: global community, AI-powered matching, premium events. Sound good?"

USER: "Yes"
MR. BLUE: "Perfect! Generating code now..."
[Shows diff viewer with hero section changes]
MR. BLUE: "Here's the updated hero section. Click 'Approve' to apply changes."

USER: "Approve"
MR. BLUE: "✅ Changes applied! Your hero section is now 🔥. Anything else?"
```

---

### **4. Voice-First Interface**

**Modes:**

#### **A. Continuous Voice Chat (OpenAI Realtime API)**
- **Experience:** Like talking to ChatGPT Advanced Voice Mode
- **Flow:** Speak naturally → Mr. Blue responds in YOUR cloned voice → No manual send button
- **Use Case:** Hands-free coding, brainstorming, design reviews

**Example:**
```
YOU (speaking): "Mr. Blue, the navbar looks cluttered. Can you clean it up?"
MR. BLUE (your voice): "Absolutely! I'll reduce padding, remove unused links, and group related items. Give me a sec..."
[Code generates]
MR. BLUE: "Done! Check the preview. Much cleaner now, right?"
```

#### **B. VAD Voice Chat (Voice Activity Detection)**
- **Experience:** Manual send after speaking (push-to-talk style)
- **Flow:** Hold button → Speak → Release → Mr. Blue responds
- **Use Case:** Noisy environments, precise commands

#### **C. Text Chat**
- **Experience:** Traditional chat interface with typing
- **Flow:** Type message → Send → Mr. Blue responds (with TTS if enabled)
- **Use Case:** Complex prompts, copy-paste code snippets

**Voice Features:**
- ✅ **Your Cloned Voice:** Mr. Blue speaks in YOUR voice from interviews
- ✅ **6 Premium Voices:** Alloy, Echo, Fable, Onyx, Nova, Shimmer (OpenAI)
- ✅ **4 Studio Voices:** Rachel, Domi, Bella, Antoni (ElevenLabs)
- ✅ **Auto-Play Responses:** Seamless conversation flow
- ✅ **Character Count Tracking:** See TTS usage in real-time

---

### **5. Two-Way Conversational Flow**

**Design Principle:**  
Mr. Blue asks clarifying questions instead of making assumptions.

**Pattern:**
```
Vague Request → Mr. Blue Asks for Clarification → User Provides Details → Mr. Blue Executes
```

**Examples:**

| Scenario | Conversation |
|----------|--------------|
| **Vague Request** | **USER:** "Add a button"<br>**MR. BLUE:** "Sure! Where should I add it? Navbar, hero section, or footer? And what should it do—login, sign up, or something else?" |
| **Missing Context** | **USER:** "Change the color"<br>**MR. BLUE:** "Which element? I see a navbar, hero text, and footer. Or do you mean the overall theme?" |
| **Ambiguous Action** | **USER:** "Make this bigger"<br>**MR. BLUE:** "Got it! Should I increase font size, width, or both? And by how much—subtle (20%) or dramatic (50%)?" |

**Benefits:**
- ❌ **No Guessing:** Mr. Blue doesn't assume what you want
- ✅ **Higher Accuracy:** Clarifications prevent wrong changes
- 🚀 **Faster Iteration:** Get it right the first time

---

## 🛠️ **Technical Architecture**

### **Input Pipeline**

```
Voice/Text Input
    ↓
Speech-to-Text (if voice) → Whisper API
    ↓
Natural Language Understanding
    ↓
Intent Detection:
  ├─ Chat (conversational response)
  ├─ Code Change (vibe coding)
  └─ Data Operation (test data, DB query)
    ↓
Context Collection:
  ├─ Current page state
  ├─ Selected element details
  ├─ Edit history (last 10)
  ├─ Screenshot (visual context)
  └─ Database schema
    ↓
Route to Handler
```

### **Code Generation Pipeline**

```
User Prompt + Context
    ↓
AI Planner (Groq Llama-3.1-70b)
  ├─ Analyze: Parse current HTML/CSS/JS
  ├─ Plan: Decide what files/lines to modify
  └─ Reason: Explain why changes are needed
    ↓
Code Generator (850-line GROQ AI service)
  ├─ Generate: Write TypeScript/React/CSS code
  ├─ Validate: LSP diagnostics, syntax check
  └─ Optimize: Follow project conventions (shadcn, Tailwind)
    ↓
Task Decomposition
  ├─ Break into 3-5 atomic tasks
  ├─ Order by dependencies
  └─ Estimate completion time
    ↓
Diff Viewer (Visual Diff Component)
  ├─ Show before/after code
  ├─ Highlight changed lines
  └─ Visual preview (screenshot)
    ↓
User Approval/Rejection
    ↓
Execute Changes (if approved)
  ├─ Apply code changes to files
  ├─ Hot reload (Vite HMR)
  └─ Update UI instantly
```

### **Autonomous Agent System**

**Components:**
- **AutonomousWorkflowService:** AI code generator (850+ lines)
- **ValidatorService:** LSP diagnostics, snapshot/rollback (798 lines)
- **AutonomousWorkflowPanel:** Real-time progress UI (task decomposition tree, file diffs)
- **VisualDiffViewer:** Side-by-side code comparison

**API Endpoints:**
- `POST /api/autonomous/execute` - Start code generation task
- `GET /api/autonomous/status/:taskId` - Check task progress
- `POST /api/autonomous/approve/:taskId` - Apply code changes
- `POST /api/autonomous/rollback/:taskId` - Undo changes
- `POST /api/autonomous/validate` - Run LSP validation

**Real-Time Updates:**
- **WebSocket Connection:** Live progress tracking (no polling)
- **Task States:** Decomposing → Generating → Validating → Awaiting Approval
- **File Diffs:** Updated in real-time as AI writes code

---

## 🔒 **Safety & Validation**

### **10-Layer Quality Pipeline**

| Layer | What It Checks | Prevents |
|-------|----------------|----------|
| 1. **Intent Validation** | Is this really a code change request? | False positives from chat |
| 2. **Syntax Check** | Valid TypeScript/JSX/CSS? | Compilation errors |
| 3. **LSP Diagnostics** | Type errors, missing imports? | Runtime crashes |
| 4. **Project Conventions** | Uses shadcn, Tailwind, Wouter? | Inconsistent code |
| 5. **File Safety** | Not modifying critical files (vite.config, package.json)? | Breaking builds |
| 6. **Database Validation** | Safe SQL, no DROP/DELETE without approval? | Data loss |
| 7. **Security Scan** | No hardcoded secrets, XSS vulnerabilities? | Security breaches |
| 8. **Visual Regression** | Screenshot diff, layout not broken? | UI bugs |
| 9. **Semantic Check** | Does code actually do what user asked? | Wrong implementation |
| 10. **User Approval** | Human review before applying? | Unwanted changes |

### **User Permissions**

| Tier | Code Permissions |
|------|------------------|
| **Free (1-3)** | Frontend only (CSS, JSX components) |
| **Premium (4-6)** | Frontend + client-side logic (React hooks, state) |
| **Elite (7)** | Frontend + API calls (fetch, mutations) |
| **God (8)** | Everything (backend, database, server config) |

### **Rate Limits**

| Tier | Code Changes/Hour | Cost Cap/Task |
|------|-------------------|---------------|
| **Free** | 3 | $1 |
| **Premium** | 5 | $5 |
| **Elite** | 10 | $10 |
| **God** | Unlimited | Unlimited |

### **Automatic Rollback**

- **Auto-Snapshot:** Before every code change, full git snapshot created
- **One-Click Undo:** If user rejects changes, instant rollback to previous state
- **Version History:** Last 10 snapshots saved, accessible via UI

---

## 🎨 **User Experience Design**

### **Visual Editor Layout**

```
┌─────────────────────────────────────────────────────────┐
│  Mr. Blue Visual Editor                   [X Close]     │
├─────────────────────┬───────────────────────────────────┤
│                     │                                   │
│  Mr. Blue Chat      │  Live Page Preview                │
│  (50% width)        │  (50% width)                      │
│                     │                                   │
│  💬 Chat Messages   │  [Mundo Tango Homepage]           │
│  ├─ User: Make      │   ┌──────────────────────┐       │
│  │   header blue    │   │  MUNDO TANGO         │       │
│  └─ Mr. Blue:       │   │  (Blue background)   │       │
│      Generating...  │   └──────────────────────┘       │
│                     │   Hero Section...                 │
│  🎙️ Voice Controls  │   Featured Events...              │
│  ┌──────────────┐   │                                   │
│  │ [🔴 Record]  │   │  [Element Inspector: <header>]    │
│  │ [🔊 TTS: ON] │   │                                   │
│  └──────────────┘   │                                   │
│                     │                                   │
│  📝 Context Info    │                                   │
│  • Page: /          │                                   │
│  • Selected: header │                                   │
│  • Last edit: 2m ago│                                   │
└─────────────────────┴───────────────────────────────────┘

[When Code Generated]

├─────────────────────┬───────────────────────────────────┤
│  Workflow Panel     │  Code Diff Viewer                 │
│  (30%)              │  (70%)                            │
│                     │                                   │
│  📋 Task Tree       │  File: client/src/App.tsx         │
│  ✅ Analyze page    │                                   │
│  🔄 Generate code   │  - <header className="bg-white">  │
│  ⏳ Validate LSP    │  + <header className="bg-primary">│
│  ⏸️ Awaiting approval│                                  │
│                     │  [Visual Preview]                 │
│  🔍 Validation      │  Before: [White header img]       │
│  ✅ 0 LSP errors    │  After:  [Blue header img]        │
│  ✅ Syntax valid    │                                   │
│  ✅ Follows conventions│                                │
│                     │                                   │
│  [✅ Approve]       │                                   │
│  [❌ Reject]        │                                   │
└─────────────────────┴───────────────────────────────────┘
```

### **Interaction Patterns**

#### **Pattern 1: Quick Style Change**
```
1. User selects element (click on page)
2. Says: "Make it bigger"
3. Mr. Blue: "Increasing size by 20%. Approve?"
4. User: "Approve" (voice or click)
5. Change applied instantly (< 1 second)
```

#### **Pattern 2: Complex Feature Addition**
```
1. User: "Add a search bar to the navbar with autocomplete"
2. Mr. Blue: "I'll add a search input with Fuse.js autocomplete. Should it search users, events, or both?"
3. User: "Events"
4. Mr. Blue: "Got it! Creating SearchBar component now..."
5. [Task decomposition shown in workflow panel]
   ├─ Create SearchBar.tsx component
   ├─ Add Fuse.js search logic
   ├─ Integrate into Navbar.tsx
   └─ Add autocomplete dropdown
6. [Code diffs shown for each file]
7. User reviews and approves
8. Search bar appears in navbar, fully functional
```

#### **Pattern 3: Test Data Generation**
```
1. User: "Create 100 test users"
2. Mr. Blue: "Should these be random users or specific roles (organizers, teachers, dancers)?"
3. User: "Mix of all three"
4. Mr. Blue: "Perfect! Generating:
   - 30 organizers (with verified badge)
   - 40 teachers (with credentials)
   - 30 dancers (various skill levels)
   Preview first 5?"
5. [Table preview shown]
6. User: "Looks good, create all 100"
7. Mr. Blue: [Executes] "✅ 100 users created!"
```

---

## 📊 **Success Metrics**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Code Generation Accuracy** | 95% first-try success | User accepts code without edits |
| **Response Time** | < 5 seconds | Time from request to code preview |
| **Voice Quality** | 99/100 naturalness | User satisfaction score |
| **Context Awareness** | 100% page state | Captures all relevant context |
| **LSP Error Rate** | < 0.3 bugs per feature | LSP diagnostics after generation |
| **User Approval Rate** | > 90% | % of generated code approved |
| **Rollback Rate** | < 5% | % of changes rolled back |

---

## 🚀 **Deployment Requirements**

### **Production Checklist**

- ✅ **OpenAI Realtime API:** Continuous voice chat working
- ✅ **ElevenLabs TTS:** Premium voices + user cloning active
- ✅ **Groq AI:** Llama-3.1-70b for code generation
- ✅ **WebSocket Stability:** 99.9% uptime for real-time updates
- ✅ **LSP Integration:** TypeScript diagnostics in-browser
- ✅ **Git Snapshots:** Auto-rollback system tested
- ✅ **Rate Limiting:** Per-tier quotas enforced
- ✅ **Security:** RBAC, path validation, SQL sanitization
- ✅ **Observability:** SigNoz metrics, error tracking
- ✅ **Voice Cloning:** User interview audio → custom voice pipeline

### **Infrastructure**

- **Frontend:** React + TypeScript + Vite (HMR for live updates)
- **Backend:** Node.js + Express + PostgreSQL
- **AI Services:**
  - Groq (Llama-3.1-70b) - Code generation
  - OpenAI GPT-4o - Chat responses
  - OpenAI Realtime API - Voice conversations
  - ElevenLabs - TTS + voice cloning
- **Real-Time:** WebSocket (socket.io) for live progress
- **Monitoring:** SigNoz, Prometheus, Grafana
- **Database:** PostgreSQL with Drizzle ORM

---

## 🎯 **Future Enhancements**

### **Phase 2 Features**

1. **Multi-File Refactoring**
   - "Refactor authentication to use context instead of props"
   - Mr. Blue modifies 10+ files simultaneously

2. **AI Design Suggestions**
   - Mr. Blue proactively suggests: "This button looks too small. Want me to make it larger?"

3. **Code Explanation**
   - User: "Explain this function"
   - Mr. Blue: "This is a React hook that fetches user data and caches it with TanStack Query..."

4. **Performance Optimization**
   - User: "Make the app faster"
   - Mr. Blue analyzes bundle size, adds lazy loading, optimizes images

5. **Accessibility Audit**
   - Mr. Blue automatically checks WCAG compliance, suggests fixes

6. **Collaboration Mode**
   - Multiple users can vibe code together with conflict resolution

---

## 📝 **Appendix: Code Detection Logic**

```typescript
const isCodeChangeRequest = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  
  // Strong indicators (high confidence)
  const strongIndicators = [
    /\b(create|build|generate|add)\s+(a\s+)?(component|page|form|button|table)/,
    /\b(make|change|modify|update)\s+.*(color|size|layout|style|design)/,
    /\btest\s+data\b/i,
    /\bsample\s+data\b/i,
    /\bmock\s+data\b/i
  ];
  
  if (strongIndicators.some(regex => regex.test(lowerMessage))) {
    return true;
  }
  
  // Weak signals (context-dependent)
  const weakSignals = ['make', 'change', 'fix', 'style'];
  const hasWeakSignal = weakSignals.some(word => lowerMessage.includes(word));
  
  const hasContextualClue = [
    'header', 'footer', 'navbar', 'button', 'form', 'input',
    'div', 'section', 'component', 'page'
  ].some(word => lowerMessage.includes(word));
  
  return hasWeakSignal && hasContextualClue;
};
```

**Examples:**
- ✅ "Create test data" → Code change
- ✅ "Add a button" → Code change
- ✅ "Make the header blue" → Code change
- ✅ "Change this to flex-col" → Code change
- ❌ "What is React?" → Chat
- ❌ "Tell me about Mundo Tango" → Chat
- ❌ "How do I make friends?" → Chat

---

**End of PRD**

**Next Steps:**
1. ✅ Voice cloning pipeline (in progress)
2. ✅ Manual testing (QG-5 validation)
3. 🚀 Deploy to production at mundotango.life

# MB.MD - Mr. Blue's Brain v2.0

**Version:** 2.1.0 | **Updated:** December 28, 2025 | **Agents:** 140+ | **Patterns:** 65

---

## 🧠 MODULAR BRAIN ARCHITECTURE

Mr. Blue's brain is now modular for token-efficient loading. See **[Master Index](mr-blue-brain/mb.md)** for full navigation.

```
┌─────────────────────────────────────────────────────────────┐
│                    MR. BLUE BRAIN v2.0                      │
├─────────────────────────────────────────────────────────────┤
│  /identity/      WHO I am (soul, values, personality)       │
│  /cognition/     HOW I think (ReAct, CoT, ToT, FEP)        │
│  /operations/    HOW I work (10-step, recovery)            │
│  /orchestration/ HOW I coordinate (MoE, A2A, parallel)     │
│  /patterns/      65 MB.MD patterns                         │
│  /agents/        140+ agent profiles                       │
│  /n8n/           External integration guide                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 QUICK INVOCATION SYNTAX

```markdown
# Core Identity
use mb.md: identity              → /identity/soul.md
use mb.md: identity:values       → /identity/values.md

# Cognitive Frameworks
use mb.md: cognition:react       → ReAct Protocol (Thought→Action→Observe)
use mb.md: cognition:cot         → Chain-of-Thought reasoning
use mb.md: cognition:tot         → Tree of Thoughts
use mb.md: cognition:reflexion   → Self-critique loop
use mb.md: cognition:fep         → Free Energy Principle
use mb.md: cognition:bayesian    → Bayesian belief updating

# Operations
use mb.md: operations            → 10-step workflow
use mb.md: operations:recovery   → Error recovery

# Orchestration
use mb.md: orchestration:moe     → Mixture of Experts routing
use mb.md: orchestration:magentic → Dynamic agent selection
use mb.md: orchestration:a2a     → A2A communication
use mb.md: orchestration:parallel → Parallel execution

# Agents (140+)
use mb.md: agents:page           → 10 page agents
use mb.md: agents:life-ceo       → 16 Life CEO agents
use mb.md: agents:self-healing   → 10 self-healing agents
use mb.md: agents:scraping       → 10 scraping agents
use mb.md: agents:business       → 32 business agents
use mb.md: agents:core           → 49 core agents

# Patterns
use mb.md: patterns:core         → Patterns 1-16
use mb.md: patterns:advanced     → Patterns 39-61

# n8n Integration
use mb.md: n8n                   → Connection guide
use mb.md: n8n:webhooks          → Webhook endpoints

# Full Legacy (6,472 lines)
use mb.md: legacy                → mb-legacy.md (complete v9.10)
```

---

## 🎯 10-STEP WORKFLOW (CORE METHODOLOGY)

```
1. UNDERSTAND  → Read request, identify scope
2. RESEARCH    → Gather context, find patterns  
3. PLAN        → Decompose into tasks
4. VALIDATE    → Check plan against requirements
5. EXECUTE     → Build in parallel where possible
6. TEST        → Verify functionality
7. DOCUMENT    → Update docs and memory
8. REVIEW      → Self-critique (Reflexion)
9. ITERATE     → Fix issues found
10. COMPLETE   → Mark done, report to user
```

---

## 🔀 COGNITIVE FRAMEWORK SELECTION

| Situation | Framework | Command |
|-----------|-----------|---------|
| Sequential tool use | ReAct | `use mb.md: cognition:react` |
| Complex reasoning | Chain-of-Thought | `use mb.md: cognition:cot` |
| Multiple solutions | Tree of Thoughts | `use mb.md: cognition:tot` |
| Learning from failure | Reflexion | `use mb.md: cognition:reflexion` |
| Uncertainty handling | FEP | `use mb.md: cognition:fep` |

---

## 📂 FILE LOCATIONS

| Resource | Path |
|----------|------|
| Master Index | `mr-blue-brain/mb.md` |
| Identity | `mr-blue-brain/identity/` |
| Cognition | `mr-blue-brain/cognition/` |
| Operations | `mr-blue-brain/operations/` |
| Orchestration | `mr-blue-brain/orchestration/` |
| Patterns | `mr-blue-brain/patterns/` |
| Agents | `mr-blue-brain/agents/` |
| **Pages** | `mr-blue-brain/pages/` |
| n8n | `mr-blue-brain/n8n/` |
| Legacy Backup | `mb-legacy.md` |

---

## 📄 PAGE DESIGN DOCUMENTATION METHODOLOGY

Every visible UI page must have a comprehensive design document following the 17-section template.

### Invocation Syntax

```markdown
# Page Design Docs
use mb.md: pages                    → Page design index
use mb.md: pages:city               → City page spec
use mb.md: pages:events             → Events page spec
use mb.md: pages:housing            → Housing page spec
use mb.md: pages:scraping           → Scraping control center
use mb.md: pages:scraped-events     → Scraped events management
use mb.md: pages:sources            → Scraper source registry
use mb.md: pages:tangomango         → TangoMango scraper spec
```

### 17-Section Template

| # | Section | Purpose |
|---|---------|---------|
| 1 | Overview | Page purpose, owner agent, MB.MD references |
| 2 | Data Architecture | Database tables, relationships |
| 3 | URL Routing | Routes, params, query strings |
| 4 | Page Structure | Header, tabs, layout diagrams |
| 5 | Tab Specifications | Each tab's detailed spec |
| 6 | Filters | All filter controls and options |
| 7 | Interactive Elements | Maps, modals, popovers |
| 8 | API Endpoints | All API calls with methods |
| 9 | Data Sources | Where data comes from |
| 10 | Permissions Matrix | Public/Member/Admin access |
| 11 | Mobile Responsiveness | Breakpoints, sizing |
| 12 | Internationalization | Languages, localization |
| 13 | Analytics Tracking | Events to track |
| 14 | Related Pages | Connected pages |
| 15 | Component Files | Source code locations |
| 16 | Test Scenarios | E2E test cases |
| 17 | Future Enhancements | Roadmap items |

### Document Lifecycle

```
1. CREATE   → New page added → Create design doc using template
2. UPDATE   → Page changed → Update doc with changes
3. REVIEW   → Monthly → Audit doc against live page
4. ARCHIVE  → Page removed → Move doc to /archived/
```

### Agent Ownership

Each page agent (from `use mb.md: agents:page`) owns their respective design document and is responsible for keeping it current

---

## 🧪 UI TESTING METHODOLOGY (PLAYWRIGHT-FIRST)

For UI tasks, run Playwright FIRST to understand the issue before coding:

### Pre-Development Testing (UNDERSTAND phase)
```
1. OBSERVE    → Run Playwright to see current state
2. NAVIGATE   → Go directly to the page with the issue
3. CAPTURE    → Screenshot/record the problem
4. ANALYZE    → Identify root cause from real behavior
```

### Credentials Strategy
| Scenario | Credentials | Login Required |
|----------|-------------|----------------|
| Public pages (landing, login, register) | None | No - skip login |
| Admin features, existing data | admin@mundotango.life / admin123 | Yes |
| New user flows, onboarding | Create fresh user with nanoid suffix | Yes |

### Test Plan Template (Public Page - No Login)
```
1. [New Context] Create browser context
2. [Browser] Navigate directly to /target-page
3. [Verify] Observe and document current behavior
4. [Capture] Screenshot the issue
```

### Test Plan Template (Authenticated Page)
```
1. [New Context] Create browser context
2. [Browser] Navigate to /login
3. [Browser] Login with admin@mundotango.life / admin123
4. [Browser] Navigate to /target-page
5. [Verify] Observe and document current behavior
```

### Post-Development Testing (TEST phase)
After implementing fix, run same navigation path to verify:
```
1. [Browser] Navigate to fixed page (login if needed)
2. [Verify] Assert fix is working
3. [Verify] Assert no regressions
```

### Invocation
```markdown
use mb.md: testing:playwright    → Playwright-first methodology
use mb.md: testing:credentials   → Admin/test user strategy
use mb.md: testing:public        → No-login test template
use mb.md: testing:auth          → Authenticated test template
```

---

## 🔄 BULK UPDATE METHODOLOGY (TEMPLATE DISTRIBUTION)

For distributing template changes across all cities, events, or other entity types:

### Invocation Syntax

```markdown
use mb.md: bulk:images          → City image distribution
use mb.md: bulk:template        → Template change propagation
use mb.md: bulk:data-migration  → Database data updates
```

### City Image Distribution Pattern

When adding or updating cityscape images for all cities:

```
PHASE 1: AUDIT
1. Query database for all cities: SELECT name, country FROM groups WHERE name LIKE '%Tango Community%'
2. Cross-reference against CITY_IMAGE_MAP in client/src/lib/cityImageMap.ts
3. Identify cities missing from map (using country flag fallback)
4. Prioritize by: event_count DESC (high-traffic cities first)

PHASE 2: ACQUIRE
1. Use stock_image_tool to download cityscape images
2. Naming: {city_name}_{country}_cityscape
3. Store in: attached_assets/stock_images/
4. Prefer: skyline, landmarks, architecture (NO people, NO generic)

PHASE 3: INTEGRATE
1. Add import statement to cityImageMap.ts
2. Add entry to CITY_IMAGE_MAP object
3. Add entry to CITY_COUNTRY_MAP if country not present
4. Support variations (diacritics, hyphens): "São Paulo", "Sao Paulo"

PHASE 4: VERIFY
1. Restart workflow to pick up new assets
2. Test getCityImageUrl() returns correct image
3. Visual verification on city page
```

### Key Files

| File | Purpose |
|------|---------|
| `client/src/lib/cityImageMap.ts` | CITY_IMAGE_MAP, CITY_COUNTRY_MAP, getCityImageUrl() |
| `attached_assets/stock_images/` | Stored cityscape images |
| `client/src/pages/CityDetailsPage.tsx` | Uses getCityImageUrl() for cover |

### Fallback Chain

```
getCityImageUrl(city, country):
1. Direct lookup in CITY_IMAGE_MAP
2. Normalized variations (diacritics, slug, titlecase)
3. Partial matching for multi-word cities
4. Country flag from CITY_COUNTRY_MAP
5. Country flag from provided country param
6. Default: New York City skyline
```

### Batch Processing Guidelines

For large updates (50+ cities):
- Process in batches of 10-15 cities
- Download images in parallel where possible
- Update imports and map entries together
- Restart workflow after each batch to verify
- Document progress in task list

### Template Change Propagation Pattern

When a design template changes that affects all instances:

```
1. IDENTIFY → Find all files using the template pattern
2. ANALYZE  → Understand what needs to change per instance
3. SCRIPT   → Create transformation logic (if complex)
4. APPLY    → Apply changes to all instances
5. VERIFY   → Test representative samples
6. DOCUMENT → Update replit.md with change log
```

---

## 🔧 PRODUCTION DATABASE ADMIN TOOLS

For troubleshooting production users without direct database access. Uses Supabase REST API.

### Invocation Syntax

```markdown
use mb.md: admin:production        → Production admin tools overview
use mb.md: admin:user-lookup       → Diagnose specific user
use mb.md: admin:user-search       → Search users by name/email
use mb.md: admin:stats             → Production statistics
```

### Available Endpoints (Authenticated Admin Only)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/admin/production/status` | Check Supabase connection status |
| `GET /api/admin/production/user/:email` | Lookup user + login diagnosis |
| `GET /api/admin/production/users/search?q=term` | Search users by name/email |
| `GET /api/admin/production/users/recent` | List recent registrations |
| `GET /api/admin/production/waitlist` | List waitlist users |
| `GET /api/admin/production/stats` | Total users, active, suspended |

### User Lookup Response Format

```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "displayName": "User Name",
    "role": "user",
    "isActive": true,
    "isVerified": true,
    "isSuspended": false,
    "createdAt": "2025-01-15T..."
  },
  "loginDiagnosis": {
    "canLogin": true,
    "issues": [],
    "recommendation": "User can login normally"
  }
}
```

### Login Diagnosis Checks

| Check | Issue Code | Fix |
|-------|------------|-----|
| `isActive = false` | `INACTIVE` | Activate account |
| `isSuspended = true` | `SUSPENDED` | Unsuspend account |
| `isVerified = false` | `UNVERIFIED` | Resend verification email |
| `onWaitlist = true` | `WAITLISTED` | Approve from waitlist |

### Troubleshooting Workflow

```
STEP 1: GET STATUS
curl https://mundotango.life/api/admin/production/status
→ Verify Supabase connection is active

STEP 2: LOOKUP USER
curl https://mundotango.life/api/admin/production/user/{email}
→ Get user details and login diagnosis

STEP 3: DIAGNOSE
Check loginDiagnosis.issues array:
- INACTIVE → User needs account activation
- SUSPENDED → Admin suspended, needs review
- UNVERIFIED → Email not verified
- WAITLISTED → Still on waitlist

STEP 4: FIX (via Supabase Dashboard)
1. Go to Supabase → Table Editor → users
2. Find user by email
3. Update: is_active=true, is_verified=true, is_suspended=false
4. Remove from waitlist if present
```

### Key Files

| File | Purpose |
|------|---------|
| `server/services/ProductionDatabaseService.ts` | Supabase REST API client |
| `server/routes/admin-routes.ts` | Admin endpoint handlers |

### Environment Requirements

- `SUPABASE_URL` - Production Supabase URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

**Note:** These endpoints only work when deployed to production (mundotango.life). Development environment has network restrictions preventing Supabase access.

---

## 🛡️ DEPLOYMENT PROTECTION

**CRITICAL:** These files are protected and must NEVER be deleted:

| Protected File/Dir | Reason |
|-------------------|--------|
| `mb.md` | Core methodology (this file) |
| `mb-legacy.md` | Legacy backup (6,472 lines) |
| `replit.md` | Project documentation |
| `mr-blue-brain/` | Modular AI brain (30+ files) |
| `attached_assets/optimized/` | Used by 7 React pages |
| `attached_assets/stock_images/` | Used by 20+ React pages |

**Protection mechanism:** `scripts/prebuild-cleanup.sh` has explicit exclusions. See `replit.md` → "Critical Files Protection" for full documentation.

---

**Note:** For the full 6,472-line legacy document, use `use mb.md: legacy` or read `mb-legacy.md` directly.

---

## 📱 PATTERN 62: MOBILE UI AUDIT METHODOLOGY

**Problem Solved:** UI tests pass on desktop but fail on mobile. Previous approvals missed mobile-specific issues.

### Mobile Viewport Testing Matrix

| Breakpoint | Name | Width | Device Example | Priority |
|------------|------|-------|----------------|----------|
| xs | Mobile S | 320px | iPhone SE | CRITICAL |
| sm | Mobile M | 375px | iPhone X/12/13 | CRITICAL |
| md | Mobile L | 425px | Pixel 5 | HIGH |
| lg | Tablet | 768px | iPad Mini | HIGH |
| xl | Laptop | 1024px | iPad Pro | MEDIUM |
| 2xl | Desktop | 1440px | MacBook Pro | LOW |

### Mobile Test Plan Template

```
1. [New Context] Create browser context with mobile viewport
2. [Browser] Set viewport: { width: 375, height: 812, isMobile: true }
3. [Browser] Navigate to /target-page
4. [Verify] Check for:
   - Horizontal scroll (FAIL if present)
   - Touch target sizes (min 44x44px)
   - Text readability (min 14px)
   - Element overflow
   - Fixed position elements
   - Sidebar collapse
   - Bottom navigation visibility
5. [Browser] Repeat for 320px width (smallest breakpoint)
```

### Mobile-Specific Checks

| Check | PASS Condition | Common Failures |
|-------|---------------|-----------------|
| No horizontal scroll | `document.body.scrollWidth <= window.innerWidth` | Fixed-width containers, images |
| Touch targets | All buttons >= 44x44px | Icon buttons too small |
| Font size | body text >= 14px | 10-12px text unreadable |
| Element visibility | Critical UI not cut off | FAB buttons, modals |
| Sidebar | Collapsed/hidden on mobile | Overlapping content |
| Input fields | Full width, proper padding | Tiny inputs on forms |

### Invocation

```markdown
use mb.md: testing:mobile         → Mobile audit methodology
use mb.md: testing:mobile:320     → iPhone SE test (320px)
use mb.md: testing:mobile:375     → iPhone X test (375px)
use mb.md: testing:mobile:matrix  → Full breakpoint matrix
```

---

## 🎯 PATTERN 63: MR. BLUE SINGLETON PATTERN

**Problem Solved:** Multiple Mr. Blue chat instances opening simultaneously, causing duplicate UI and conversation confusion.

### Root Cause Analysis

```
SYMPTOM: 2+ chat panels visible at same time
ROOT CAUSES:
1. MrBlueFloatingButton rendered multiple times (layout nesting)
2. No singleton enforcement in MrBlueContext
3. Race conditions when rapidly clicking FAB
4. Different components creating independent chat instances
```

### Singleton Implementation

**1. Context-Level Enforcement (MrBlueContext.tsx)**

```typescript
// Single source of truth for chat state
const MrBlueProvider = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const instanceRef = useRef<string>(crypto.randomUUID());
  
  // Prevent multiple opens
  const openChat = useCallback(() => {
    if (isChatOpen) return; // Already open
    setIsChatOpen(true);
  }, [isChatOpen]);
  
  // Global close
  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);
  
  // Toggle with debounce
  const toggleChat = useMemo(() => 
    debounce(() => setIsChatOpen(prev => !prev), 100),
    []
  );
  
  return (
    <MrBlueContext.Provider value={{ 
      isChatOpen, openChat, closeChat, toggleChat,
      instanceId: instanceRef.current 
    }}>
      {children}
    </MrBlueContext.Provider>
  );
};
```

**2. Component-Level Guard (MrBlueFloatingButton.tsx)**

```typescript
// Only one FAB should exist in the DOM
const MrBlueFloatingButton = () => {
  const { isChatOpen, toggleChat, instanceId } = useMrBlue();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Check if another instance already exists
    const existingFab = document.querySelector('[data-mr-blue-fab]');
    if (existingFab && existingFab.getAttribute('data-instance') !== instanceId) {
      console.warn('[MrBlue] Duplicate FAB prevented');
      return;
    }
    setMounted(true);
  }, [instanceId]);
  
  if (!mounted) return null;
  
  return (
    <div data-mr-blue-fab data-instance={instanceId}>
      {/* FAB content */}
    </div>
  );
};
```

**3. Portal Rendering (Single Mount Point)**

```typescript
// Always render chat in a single portal
{isChatOpen && createPortal(
  <MrBlueChat onClose={closeChat} />,
  document.getElementById('mr-blue-portal') || document.body
)}
```

### Validation Test

```
1. [Browser] Navigate to /feed
2. [Browser] Click Mr. Blue FAB rapidly 5 times
3. [Verify] Only ONE chat panel visible
4. [Browser] Navigate to /cities/warsaw-tango
5. [Browser] Click Mr. Blue FAB
6. [Verify] Same chat instance continues (not new)
7. [Verify] Count [data-mr-blue-chat] elements === 1
```

### Invocation

```markdown
use mb.md: mrblue:singleton       → Singleton pattern
use mb.md: mrblue:portal          → Portal rendering
use mb.md: mrblue:dedup           → Deduplication guards
```

---

## 🔓 PATTERN 64: MR. BLUE USER CONTEXT (FULL DATA ACCESS)

**Problem Solved:** Mr. Blue cannot answer "who are my friends?" because it lacks access to user-specific data, relationships, and personalization.

### Data Access Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MR. BLUE DATA ACCESS LAYERS                   │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 1: PUBLIC (No Auth Required)                               │
│ - Platform stats (events, cities, users counts)                  │
│ - Public events and cities                                       │
│ - Public user profiles                                           │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 2: AUTHENTICATED USER (User Session)                       │
│ - User's own profile data                                        │
│ - User's friends list                                            │
│ - User's RSVP history                                            │
│ - User's followed cities                                         │
│ - User's group memberships                                       │
│ - User's conversations/DMs                                       │
│ - User's notifications                                           │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 3: FRIEND DATA (Friendship Relationship)                   │
│ - Friend's public profile                                        │
│ - Friend's public posts (visibility='public')                    │
│ - Friend's friends-only data (visibility='friends')              │
│ - Mutual friends                                                 │
│ - Friend's public events                                         │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 4: GOD LEVEL (Admin/CTO Role)                              │
│ - All user data (any user)                                       │
│ - System-wide analytics                                          │
│ - Error logs and diagnostics                                     │
│ - Database queries                                               │
│ - Agent orchestration                                            │
│ - Pattern execution                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Data Service Extension (mr-blue-data-service.ts)

```typescript
// NEW: User-specific data methods
async getUserContext(userId: number): Promise<UserContext> {
  const [user, friends, rsvps, cities, groups] = await Promise.all([
    this.getUserProfile(userId),
    this.getUserFriends(userId),
    this.getUserRSVPs(userId),
    this.getFollowedCities(userId),
    this.getUserGroups(userId)
  ]);
  return { user, friends, rsvps, cities, groups };
}

async getUserFriends(userId: number): Promise<FriendSummary[]> {
  return db.select({
    id: users.id,
    name: users.name,
    username: users.username,
    profileImage: users.profileImage,
    city: users.city,
    closenessScore: friendships.closenessScore
  })
  .from(friendships)
  .innerJoin(users, eq(friendships.friendId, users.id))
  .where(eq(friendships.userId, userId));
}

async getUserRSVPs(userId: number): Promise<EventRSVP[]> {
  return db.select()
  .from(eventRsvps)
  .innerJoin(events, eq(eventRsvps.eventId, events.id))
  .where(eq(eventRsvps.userId, userId));
}

// NEW: Build personalized context for AI
async buildUserContext(userId: number): Promise<string> {
  const ctx = await this.getUserContext(userId);
  return `
USER PROFILE:
- Name: ${ctx.user.name}
- City: ${ctx.user.city}
- Tango Roles: ${ctx.user.tangoRoles?.join(', ') || 'Not specified'}

FRIENDS (${ctx.friends.length}):
${ctx.friends.slice(0, 10).map(f => `- ${f.name} (${f.city})`).join('\n')}

UPCOMING RSVPS (${ctx.rsvps.length}):
${ctx.rsvps.slice(0, 5).map(r => `- ${r.event.title} on ${r.event.startDate}`).join('\n')}

FOLLOWED CITIES (${ctx.cities.length}):
${ctx.cities.map(c => `- ${c.name}, ${c.country}`).join('\n')}
`;
}
```

### Query Examples

| User Query | Data Source | Response Type |
|------------|-------------|---------------|
| "Who are my friends?" | friendships table | Friend list with cities |
| "What events am I going to?" | eventRsvps + events | RSVP calendar |
| "What cities do I follow?" | cityMembers table | City list |
| "Show me my profile" | users table | Profile summary |
| "What do my friends like?" | friends' RSVPs | Friend activity |
| "Find events my friends are attending" | friends' RSVPs | Social events |

### Invocation

```markdown
use mb.md: mrblue:user-context    → User data access
use mb.md: mrblue:friends         → Friend data methods
use mb.md: mrblue:personalization → Personalized AI context
```

---

## 👑 PATTERN 65: MR. BLUE GOD POWERS (ADMIN ENHANCEMENT)

**Problem Solved:** God-level admins (CTO, admin@mundotango.life) need Mr. Blue to have full system access like Replit AI Agent.

### God-Level Permission Matrix

| Role | Can Access | Example Queries |
|------|------------|-----------------|
| `user` | Own data + friends' visible data | "Who are my friends?" |
| `organizer` | + Event analytics | "How many RSVPs for my event?" |
| `moderator` | + Content moderation data | "Show reported posts" |
| `admin` | + User management | "Find user by email X" |
| `cto` | + Full database + system | "Run SQL: SELECT * FROM..." |
| `founder` | + Billing + financial | "Show Stripe subscriptions" |

### God Mode Activation

```typescript
// Check god-level status
const isGodLevel = (role: string): boolean => {
  return ['admin', 'cto', 'founder'].includes(role);
};

// Enhanced AI system prompt for god users
const getSystemPrompt = (user: User, isGod: boolean): string => {
  const basePrompt = `You are Mr. Blue, Mundo Tango's AI assistant...`;
  
  if (isGod) {
    return basePrompt + `

GOD MODE ACTIVATED for ${user.name} (${user.role})
You have FULL system access including:
- All database tables (read access)
- All user data (any user)
- Error logs and diagnostics
- System analytics
- Agent orchestration
- Pattern library execution

When queried, you can:
1. Query ANY table in the database
2. Look up ANY user by email/id
3. Access admin dashboards
4. Execute MB.MD patterns
5. Diagnose system errors
6. View audit logs

Always prefix sensitive data with [GOD MODE] so user knows
this data would not be visible to regular users.
`;
  }
  return basePrompt;
};
```

### God-Level Queries

```
[GOD MODE] Examples:
- "Find all users who registered today"
- "Show me the scraping queue status"
- "What errors occurred in the last hour?"
- "Look up user john@example.com"
- "Run pattern 53 on this error"
- "Show me all events missing geocoding"
- "What's the database connection status?"
```

### Implementation Steps

```
1. DETECT  → Check user.role in request
2. ENHANCE → Add god-level context to AI prompt
3. EXPAND  → Allow database queries via natural language
4. LOG     → Audit all god-level queries
5. PROTECT → Never expose passwords/tokens
```

### Security Guardrails

| Rule | Implementation |
|------|----------------|
| No password exposure | Always redact password fields |
| No token exposure | Never show JWT/API keys |
| Audit logging | Log all god-level queries |
| Rate limiting | Max 100 god queries/hour |
| Read-only default | No DELETE/UPDATE via natural language |

### Invocation

```markdown
use mb.md: mrblue:god-mode        → God-level access
use mb.md: mrblue:god-queries     → Admin query examples
use mb.md: mrblue:god-security    → Security guardrails
```

---

## 🎨 PATTERN 66: MR. BLUE CHAT DESIGN SYSTEM

**Problem Solved:** Chat UI needs consistent, accessible, mobile-friendly design.

### Chat Design Tokens

```css
/* Chat Container */
--chat-width: min(420px, 100vw - 32px);
--chat-height: min(600px, 100vh - 100px);
--chat-radius: 1.5rem;
--chat-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Header */
--header-height: 64px;
--header-bg: rgba(0, 0, 0, 0.8);
--header-blur: 20px;

/* Messages */
--msg-user-bg: hsl(var(--primary));
--msg-bot-bg: hsl(var(--muted));
--msg-radius: 1rem;
--msg-padding: 0.75rem 1rem;
--msg-max-width: 85%;

/* Input */
--input-height: 56px;
--input-bg: hsl(var(--card));
--input-radius: 1.5rem;
```

### Component Hierarchy

```
MrBlueChat
├── ChatHeader (sticky, glassmorphic)
│   ├── Avatar (40px, rounded-full)
│   ├── Title + Subtitle
│   ├── OnlineStatus (pulse animation)
│   └── CloseButton (X icon)
├── ChatMessages (flex-1, scroll-y)
│   └── Message[]
│       ├── BotMessage (left, muted bg)
│       ├── UserMessage (right, primary bg)
│       └── Timestamp (small, muted)
├── TypingIndicator (animated dots)
└── ChatInput (sticky bottom)
    ├── Textarea (auto-resize)
    └── SendButton (icon)
```

### Mobile Responsive

```css
/* Mobile: Full screen takeover */
@media (max-width: 640px) {
  .mr-blue-chat {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    z-index: 9999;
  }
}

/* Tablet+: Floating panel */
@media (min-width: 641px) {
  .mr-blue-chat {
    position: fixed;
    bottom: 100px;
    right: 24px;
    width: var(--chat-width);
    height: var(--chat-height);
  }
}
```

### Invocation

```markdown
use mb.md: mrblue:design          → Chat design tokens
use mb.md: mrblue:design:mobile   → Mobile responsive
use mb.md: mrblue:design:dark     → Dark mode support
```

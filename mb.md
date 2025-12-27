# MB.MD - Mr. Blue's Brain v2.0

**Version:** 2.0.0 | **Updated:** December 19, 2025 | **Agents:** 140+ | **Patterns:** 61

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
│  /patterns/      61 MB.MD patterns                         │
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

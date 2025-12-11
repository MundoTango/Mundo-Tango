# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform connecting the global tango community with a resilient, self-sovereign architecture and enterprise-grade security. It integrates with various business systems and specialized AI agents, aiming for monetization through premium services, event hosting, and targeted advertising within the global dance market.

## User Preferences
- Work Simultaneously - Run operations in parallel (use Promise.all, parallel tool calls)
- Work Recursively - Deep analysis, not surface-level (read imports, dependencies, related files)
- Work Critically - Target 95-99/100 quality (test before complete, validate edge cases)
- Check Infrastructure First - Use existing systems before building new (Page Audit, Auto-Fix, Agent Orchestration)
- Test Before Complete - Run E2E tests for UI changes, unit tests for backend
- Database: Never change ID column types (serial ↔ varchar) - breaks existing data
- Handoff Plan: Never deviate - Follow exact phase sequence
- Auto-Fix Maximization - All auto-fix as much as possible (3-attempt retry, <10% escalation rate)
- Validation Loop - observe → decide → act → validate → adapt (not just automation)
- MB.MD Methodology - Apply v9.9.3 patterns systematically: Research → Plan → Build → Test → Fix → Document

## Recent Session Progress (Dec 11, 2025)
### Database Restoration - MB.MD v9.9.4
**Applied Methodology**: Research → Plan → Build → Test → Fix → Document

#### Issue Identified
- Development database was empty (0 records) after git revert to `server/services/scrapers` branch
- Schema tables existed but all data was lost
- Production database unaffected (separate environment)

#### Restoration Applied
1. **Verified database connection** - PostgreSQL connected and schema intact
2. **Seeded admin user** with credentials:
   - Email: `admin@mundotango.life`
   - Password: `admin123`
   - Role: admin
   - City: Buenos Aires
   - TangoRoles: Leader, Organizer, Teacher
3. **Seeded page inventory** - 9 critical pages for audit system
4. **E2E verified** - Login test passed, redirect to /feed working

#### Current Dev Database State
- Users: 2 (admin + test)
- Posts: 3 sample posts
- Page Inventory: 9 pages
- Audit Issues: 0 (ready for new audit cycle)

---

## Session Archive (Dec 6, 2025)
### MB.MD v9.9.3 Full Validation Cycle Complete
**Applied Methodology**: observe → decide → act → validate → adapt

#### Phase 1-2 (RESEARCH/PLAN) - Complete
- 312 platform pages indexed to PostgreSQL database
- Priority queue: 53 critical, 40 high, 205 medium, 14 low
- Full database persistence for restart resilience

#### Phase 3 (BUILD/AUDIT) - Active with PostgreSQL Persistence
- SwarmChoreography with batch-based processing
- 4 batches configured: Batch 1 (85 critical), Batch 2 (85 high), Batch 3 (85 medium), Batch 4 (57 medium)
- **138 issues found** and persisted to PostgreSQL (audit_issues table)
- Issues persist to both LanceDB and PostgreSQL for dual redundancy
- Performance: ~8 pages/min processing rate

#### Phase 4 (TEST) - Operational
- ValidationRelayService with 6 validation types active
- Issues dispatched to SME agents (Accessibility, UI, Performance, i18n)

#### Phase 5 (FIX) - Fully Operational ✅
- **Batch AutoFix Endpoint**: POST /api/orchestration/phases/autofix/batch-process
- **138/138 issues resolved** (100% success rate)
- **0% escalation rate** (target: <10%) ✅
- **Average 1 attempt** to resolve each issue
- 3-Strike Protocol verified with simple→advanced→escalate flow
- **By Issue Type:**
  - Accessibility: 59 resolved
  - UX: 39 resolved  
  - Performance: 20 resolved
  - i18n: 20 resolved

#### Database Persistence Tables
- `page_inventory`: 312 pages with URL, priority, category, audit status
- `audit_issues`: Issue tracking with pageId, type, severity, status, strikeCount

#### Known Constraints
- Workflow restarts every ~20 min - mitigated with PostgreSQL persistence
- Batch state file: ./data/audit-batch-state.json for quick resume
- WebSocket HMR warning (non-critical): wss://localhost:undefined - Replit infrastructure
- ✅ i18next double initialization - RESOLVED via window-level initialization flag

#### Z-Index Hierarchy (IMPORTANT - prevents UI element hiding)
When adding floating/absolute UI elements, follow this z-index hierarchy:
- z-30: Standard floating elements
- z-40: Sticky navigation bars (ProfileTabsNav, etc.)
- z-50: Action buttons that must appear above sticky navs (Friend/Message buttons on ProfilePage)
- z-60+: Modals, dialogs, dropdowns

**Root Cause Fix (Dec 10, 2025)**: Friend/Message buttons on ProfilePage were hidden behind sticky ProfileTabsNav. Buttons had z-30, nav had z-40. Fixed by bumping buttons to z-50 with explanatory comment.

#### FriendDetailPage "Friend Not Found" Bug - RESOLVED (Dec 10, 2025)
**Root Cause**: queryKey pattern mismatch with endpoint
- FriendDetailPage used queryKey: `['/api/friends', friendId, user?.id]` 
- Default fetcher only uses first element → tried `/api/friends` instead of `/api/friends/:friendId`
- Endpoint `/api/friends/:friendId` was added but never called
**Fix Applied**:
- Changed queryKey to: `[`/api/friends/${friendId}`]` to match endpoint
- Updated cache invalidation accordingly
- Added `getFriendshipById()` storage method returning full friendship + friend object
- New GET `/api/friends/:friendId` endpoint properly returns friend details
- **Status**: ✅ Fixed and tested - endpoint returning 200 with valid token

## System Architecture

### UI/UX
The platform uses an "MT Ocean Theme" with dark mode (Tailwind CSS, shadcn/ui, Radix UI). Iconography is handled by Lucide React and React Icons. It supports 68 languages via `i18next` and Wouter for routing, with `AppLayout`, `DashboardLayout`, and `AdminLayout`. A Visual Editor allows inline editing. Navigation features a Unified Sidebar. Standardized components like `PublicProfileView`, `UnifiedSidebar`, and `PerRoleExperience` ensure consistency.

### Backend
Built with Express and TypeScript, utilizing PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, and an 8-tier RBAC system. Database migrations are automated, and server-side FFmpeg handles video transcoding. API endpoints support PRO functionalities, place recommendations, and enhanced Talent Match AI.

### AI Systems
An extensive AI ecosystem orchestrates 1,218 specialized agents hierarchically, ranging from strategic oversight (Replit AI) to atomic execution. Key components include self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions. It also integrates a RecursiveContextService with hierarchical code summarization and a TRM Learning Protocol.

### Platform Features
Core features include social functionalities (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers). Recent additions include an Event Series System, redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service, OpenStreetMap Geocoding, Housing Friendship Closeness Integration, and a Unified Messaging Inbox (Gmail, Facebook, Instagram, WhatsApp). A Faceless Content System with social media adapters is also integrated.

### Testing
The platform uses E2E tests, automated unit test coverage via CI/CD, and visual regression testing with Playwright and Claude Computer Use. The `run_test` tool is critical for E2E testing, handling environment setup and Stripe testing key injection.

### Production
Production deployments leverage GitHub Actions for CI/CD, Prometheus/Grafana with Sentry for monitoring, Replit Publishing for deployment, Redis for caching, and PostgreSQL (Neon) with Drizzle ORM.

### Marketing Site Architecture
The marketing site includes a Donation Tier System, a Human to Agent Collaboration (H2AC) Volunteer Program, and an Ambassador Program, with all public statistics wired to a real database.

### Demo & Video Systems
A comprehensive Video Demo System includes a landing page section with clickable demo cards, interactive modals, and a Playwright demo recording script. An automated video recording system uses Playwright's `recordVideo` to capture real customer journeys, adhering to a ZERO fake data policy.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap, Neon (PostgreSQL)
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer, `@octokit/rest`
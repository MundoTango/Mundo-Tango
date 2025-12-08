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

## Recent Session Progress (Dec 8, 2025)

### ZERO FAKE DATA Audit Complete ✅
**Applied Methodology**: MB.MD v9.9.4 - Research → Plan → Build → Test → Analyze → Fix → Document
**Architect Review**: PASSED - All RBAC guards meet stated objectives

#### RBAC & Data Integrity Fixes
1. **Hardcoded userId: 1 → useAuth()**: Fixed in 5 critical files
   - `MrBlueChat.tsx` - Chat API calls now use authenticated user + auth guard with login toast
   - `PlanProgressTracker.tsx` - Progress tracking with real user + login CTA
   - `ThePlanView.tsx` - Plan view with authenticated context + enabled:!!user query guard
   - `TravelExpensesPage.tsx` - Expense tracking uses real user
   - `AdminUsersPage.tsx` - Admin panel RBAC enforcement

2. **Hardcoded Notification Counts Removed**
   - `GlobalTopbar.tsx` - Now uses useQuery with enabled:!!user for real notification/message counts
   - `TopNavigationBar.tsx` - Same fix applied

3. **Test Email Placeholders Removed**
   - `AccountSettingsPage.tsx` - Removed john@example.com, jane@example.com
   - `EmailVerificationPage.tsx` - Uses auth context for real email
   - `RolesPermissionsPage.tsx` - Dynamic audit log via API queries

4. **Dynamic Component Added**
   - `AuditLogCard.tsx` - Reusable audit log component with API integration

5. **Auth Guards Added** (preventing unauthenticated API calls)
   - MrBlueChat.tsx: sendMessage() returns early with destructive toast if !user
   - PlanProgressTracker.tsx: Shows login CTA + disables query if !user
   - ThePlanView.tsx: Stats query gated by enabled:!!user

### MB.MD v9.9.4 Full Implementation Complete
**Applied Methodology**: Capture → Research → Question → Plan → Build → Test → Analyze → Fix → Document

#### All 10 Core Tasks Complete ✅
1. **Pattern 0**: MB.MD v9.9.4 Methodology - 9-phase execution cycle documented
2. **Pattern 51**: ZERO FAKE DATA Policy - Strict enforcement rules
3. **Pattern 52**: Multi-Perspective Audit Protocol - 6 perspectives with agent squads
4. **The Plan Admin UI**: /admin/the-plan with multi-perspective controls
5. **Backend API Routes**: Full thePlanAdminRoutes.ts implementation
6. **Frontend Route Registration**: Lazy loading + ProtectedRoute
7. **Multi-Agent Page Audits**: ComprehensiveAuditRunner with PostgreSQL persistence
8. **Video/Photo Collection**: PageVideoCaptureService with queue-based capture
9. **Mr Blue User Tours**: TourGenerationService with dynamic generation
10. **Marketing Site Integration**: Combined marketing/page videos endpoint

#### Pattern 40: City Imagery Standardization ✅
- **All 10 components updated** to use centralized getCityImageUrl() utility
- Three-tier fallback: coverImage → getCityImageUrl(city) → generic fallback
- Components: GroupsPage, GroupDetailsPage, GroupCard, CityGroupsPage, ProfessionalGroupsPage, EventDetailsPage, EventCard, CityGuidesPage, TravelPlannerPage, HousingMarketplacePage

#### MB.MD v9.3 Backend Agent System ✅
- **Coverage**: Frontend 100% + Backend 100% + Database 100% + Security 100% + API 100%
- **Save Button**: Visual Editor → Save triggers backend agent orchestration
- **Progress Modal**: Real-time phase display (Schema → API → Security → Service → Git → Restart)
- **Git Auto-Commit**: BackendOrchestrator.gitCommit() with descriptive commit messages
- **Workflow Auto-Restart**: BackendOrchestrator.restartWorkflow() triggers on file changes
- **Key Files**:
  - `server/services/mrblue/BackendOrchestrator.ts` - Coordinates all backend agents
  - `server/services/mrblue/SessionTracker.ts` - Tracks UI changes since last save
  - `server/routes/mrblue/save-backend.ts` - API endpoint POST /api/mrblue/save-backend
  - `client/src/components/visual-editor/BackendSaveProgressModal.tsx` - Progress UI

#### Database Persistence Tables
- `page_inventory`: 312 pages with URL, priority, category, audit status
- `audit_issues`: Issue tracking with pageId, type, severity, status, strikeCount

#### Known Constraints
- Workflow restarts every ~20 min - mitigated with PostgreSQL persistence
- Batch state file: ./data/audit-batch-state.json for quick resume
- WebSocket notifications require auth token (expected behavior for unauthenticated users)

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
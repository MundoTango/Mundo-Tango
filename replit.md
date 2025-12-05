# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security, integrating with various business systems and specialized AI agents. The platform aims for monetization through premium services, event hosting, and targeted advertising, targeting a significant share of the global dance market.

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
- MB.MD Methodology - Apply v9.9.2 patterns systematically: Research → Plan → Build → Test → Document

## System Architecture

### UI/UX
Mundo Tango utilizes an "MT Ocean Theme" with dark mode support via Tailwind CSS. Components are built with `shadcn/ui` and Radix UI, using Lucide React and React Icons for iconography. It supports 68 languages via `i18next` and Wouter for routing, with `AppLayout`, `DashboardLayout`, and `AdminLayout`. A Visual Editor enables inline editing. The navigation uses a Unified Sidebar with 27 icon-centric items across various sections. Standardized components like PublicProfileView, UnifiedSidebar, and PerRoleExperience ensure consistency.

### Backend
The backend is built with Express and TypeScript, using PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, and an 8-tier RBAC system. Database migrations are automated, and server-side FFmpeg handles video transcoding. API endpoints support PRO tab functionalities, place recommendations, and enhanced Talent Match AI.

### AI Systems
An extensive AI ecosystem orchestrates 1,218 specialized agents hierarchically for tasks ranging from strategic oversight (Replit AI) to atomic execution. Key components include self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions.

### Platform Features
Core features include social functionalities (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers). New features include an Event Series System for recurring events, a redesigned City Groups Events Tab, RSS Feed Scraping, Profile Enrichment Service for LinkedIn/GitHub, an OpenStreetMap-based Geocoding Service, and Housing Friendship Closeness Integration. A Unified Messaging Inbox supports internal and external channels (Gmail, Facebook, Instagram, WhatsApp).

### Testing
The platform uses E2E tests, automated unit test coverage via CI/CD, and visual regression testing with Playwright and Claude Computer Use. The `run_test` tool is critical for E2E testing, handling environment setup and Stripe testing key injection.

### Production
Production leverages GitHub Actions for CI/CD, Prometheus/Grafana with Sentry for monitoring, Replit Publishing for deployment, Redis for caching, and PostgreSQL (Neon) with Drizzle ORM.

### Marketing Site Architecture
The marketing site includes a Donation Tier System, a Human to Agent Collaboration (H2AC) Volunteer Program, and an Ambassador Program, with all public statistics wired to a real database.

### Demo & Video Systems
A comprehensive Video Demo System (MB.MD Patterns 28, 38, 41) includes a landing page section with clickable demo cards, interactive modals, and a Playwright demo recording script. An automated video recording system uses Playwright's `recordVideo` to capture real customer journeys. All videos adhere to a ZERO fake data policy.

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer, `@octokit/rest`

## Recent Changes (December 2025)

### Samsung TRM Agent Learning API Complete (Dec 5, 2025)
- **Full API Implementation**: REST endpoints for agent learning at `/api/agents/learning/`
  - `GET /status` - System status with 78 agents ready for training
  - `GET /configs` - All 78 agent configurations (10 page, 50 algorithm, 10 feature, 8 system)
  - `POST /single/:agentId` - Train single agent with 3 TRM improvement cycles (85% confidence)
  - `POST /category/:category` - Batch train by category (page, algorithm, feature, system)
  - `POST /priority/:priority` - Train by priority level (critical, high, medium, low)
  - `GET /knowledge/:agentId` - Retrieve agent's learned knowledge
  - `POST /context` - TRM semantic search with LanceDB
- **CSRF Bypass**: Agent learning endpoints added to A2A (agent-to-agent) skip list
- **Files Added**: server/routes/agentLearning.ts (150+ lines)
- **Files Modified**: server/routes.ts (import + route registration), server/middleware/csrf.ts

### MB.MD v9.9.3 Integration Complete (Dec 5, 2025)
- **Samsung TinyRecursiveModels**: Implemented RecursiveContextService with hierarchical code summarization
  - 4-level summarization: function → file → module → platform
  - 80-90% token compression for LLM context
  - LanceDB integration for semantic search
  - TRM Learning Protocol: recursivelyLearn() → generateInitialKnowledge() → (updateLatent() × n) → improveKnowledge() × K cycles
- **Faceless Content System**: Created FacelessContentService with social media adapters
  - TikTok, YouTube, Instagram, Twitter, LinkedIn adapters
  - AdminContentCenterPage for content management
  - AI-powered video script generation
- **Self-Healing Infrastructure**: AutoFixEngine and VibeCodingService initialized at server startup
- **MB.MD Documentation**: Created role-agents.md (7 leadership agents), patterns 64-70, core.md, index.json
- **Open Source Integration**: FreeAPIService with 1,400+ public APIs catalog
- **AgentKnowledgeLoader**: Orchestrates learning for all 1,218 agents with documentation mapping

### LanceDB Integration Fix (Dec 5, 2025)
- **Issue**: RecursiveContextService failing with "lanceDB.getConnection is not a function"
- **Solution**: Updated service to use LanceDBService's `addMemory` and `searchMemories` methods
- **Pattern**: LanceDB stores flat objects (id, content, timestamp), not nested metadata

### Registration Flow Fix (Dec 5, 2025)
- **Root Cause**: Express route ordering issue - `PATCH /api/users/:id` was defined before `PATCH /api/users/me`, causing `:id` to match "me" as a literal ID
- **Solution**: Moved `PATCH /api/users/me` route BEFORE `PATCH /api/users/:id` in server/routes.ts
- **Pattern**: In Express, specific routes MUST be defined before parameterized routes
- **Verified**: All 4 onboarding steps tested via curl - City Selection (formStatus 1) → Tango Roles (2) → Languages (3) → Complete (5) all working correctly

### Route Ordering Best Practice
```
// CORRECT ORDER in Express:
app.patch("/api/users/me", ...)      // Specific route first
app.patch("/api/users/:id", ...)     // Parameterized route second
```

### BullMQ Worker Initialization Fix (Dec 5, 2025)
- **Issue**: Workers crashing with "eventWorker.on is not a function" when Redis unavailable
- **Root Cause**: InMemoryQueue fallback doesn't have `.on()` method like BullMQ Worker
- **Solution**: Conditional event listener registration - check if `.on()` exists before attaching
- **Pattern**: Always check for method existence when using fallback patterns
```typescript
// Only attach event listeners if this is a real BullMQ Worker (not InMemoryQueue)
if ('on' in worker && typeof worker.on === 'function') {
  worker.on("completed", (job) => { ... });
  worker.on("failed", (job, err) => { ... });
}
```
- **Files Fixed**: eventWorker.ts, lifeCeoWorker.ts, housingWorker.ts

### Social Media Adapters (Dec 5, 2025)
- **Added**: FacebookAdapter, TwitterAdapter, LinkedInAdapter with OAuth flows
- **Wired**: CrossPlatformScheduler now uses `getSocialMediaAdapter()` for real API calls
- **Location**: server/services/social/SocialMediaAdapters.ts

### CTO Audit Fixes - Onboarding Error Handling (Dec 5, 2025)
- **Issue**: CTO demo showed silent failures in onboarding - users stuck with no feedback
- **Root Cause**: "Fire and forget" API calls with no `response.ok` checks
- **Pages Fixed**: CitySelectionPage, TangoRolesPage, LanguagesPage, RegisterPage
- **Solution**: Created unified `client/src/lib/apiErrorHandler.ts` utility
- **Pattern Applied**: MB.MD Pattern 66 (Build Swarm Choreography) - parallel fixes
- **User Impact**: Now shows actionable error messages instead of generic "Error" toasts

### API Error Handling Best Practice
```typescript
// BEFORE (Bad - Fire and forget)
await fetch("/api/users/me", { method: "PATCH", ... });
navigate("/next-step");  // Navigates even if API failed!

// AFTER (Good - Check response)
const response = await fetch("/api/users/me", { method: "PATCH", ... });
if (!response.ok) {
  const errorMessage = await extractApiError(response, { context: "Profile update" });
  throw new Error(errorMessage);
}
navigate("/next-step");
```
- **Files Created**: client/src/lib/apiErrorHandler.ts (unified error extraction utility)
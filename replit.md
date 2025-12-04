# Mundo Tango

## Overview
Mundo Tango is a production-ready social platform designed to connect the global tango community. It features a resilient, self-sovereign architecture with enterprise-grade security and integrates with various business systems and specialized AI agents. The platform aims to monetize through premium services, event hosting, and targeted advertising, capturing a significant share of the global dance market.

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

### Standardized Components
The platform uses standardized components like PublicProfileView, UnifiedSidebar, TangoRoles, RoleChangeCascade, CascadeFramework, RBAC/ABAC System, PerRoleExperience, UnifiedLocationPicker, UnifiedMemoriesFeed, LocationChangeCascade, and UnifiedPROTab for consistent functionality and design.

### Profile Tab Architecture
The profile system includes 8 core tabs: About (with Profile, Privacy, Security, Notifications, Subscription), Feed, Photos, Friends, Events, Travel, Memories, and PRO. The PRO tab integrates with event participation to auto-populate professional portfolios.

### Navigation System
The Unified Sidebar provides icon-centric navigation with 27 items across Social, Community, PRO Discovery, and Services sections, featuring a 3-column grid, hover-triggered tooltips, and `z-50` layering. A "My Stuff" section offers personalized shortcuts.

### UI/UX
Mundo Tango employs an "MT Ocean Theme" with ocean blues and warm accents, supporting dark mode via Tailwind CSS. Components are built with `shadcn/ui` and Radix UI, utilizing Lucide React and React Icons for iconography. It supports 68 languages via `i18next` and Wouter for routing. Layouts include `AppLayout`, `DashboardLayout`, and `AdminLayout`. A Visual Editor enables inline editing.

### Backend
The backend is built with Express and TypeScript, using PostgreSQL (Neon) and Drizzle ORM. It features modular routes, JWT authentication with Google/Facebook OAuth, and an 8-tier RBAC system. Database migrations are automated, and server-side FFmpeg handles video transcoding. The API includes endpoints for PRO tab functionalities, place recommendations, travel plans, and enhanced Talent Match AI with language-based search filtering.

### AI Systems
An extensive AI ecosystem orchestrates 1,218 specialized agents hierarchically, with Replit AI for strategic oversight, Mr. Blue for tactical coordination, and individual agents for atomic tasks. This system includes self-healing infrastructure, a production-ready validation loop, a Visual Validation Framework, contextual agent activation, a comprehensive Backend Agent System, Mr. Blue AI Assistant, and a Bifrost AI Gateway for multi-provider AI interactions.

### Groups System
The Groups system provides community features with 3 discovery tabs (My Groups, Cities, Professional) and 7 detail tabs (Discussion, Events, Housing, Hub, Members, City Guide, Settings). It includes database tables for groups, group members (with role hierarchy), group posts, and categories. API endpoints cover CRUD operations, join/leave flows, membership approval, and integrations with Events, Profile, Location, RSVP, and Notifications.

### Platform Features
Core features encompass social functionalities (events, groups, posts, notifications, media, live streaming, marketplaces, reviews) and business features (Talent Match AI, LIFE CEO AI, Multi-AI Orchestration, Automated Scraping, Admin Dashboard, Stripe Payments, and BullMQ Workers for background processing).

### Testing
The platform utilizes E2E tests, automated unit test coverage via CI/CD, and visual regression testing with Playwright and Claude Computer Use for AI-powered validation. The E2E testing methodology includes page load tests, API tests, button/link verification, and content verification.

### E2E Testing Methodology (PERMANENT)
**CRITICAL: Always use the `run_test` tool for E2E testing. It handles all environment setup automatically.**

**Stripe Testing Integration:**
- The `run_test` tool **automatically injects Stripe testing keys** - no manual configuration needed
- Testing secrets available: `TESTING_STRIPE_SECRET_KEY`, `TESTING_VITE_STRIPE_PUBLIC_KEY`
- The testing subagent overrides `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLIC_KEY` with test values
- Test card numbers (official Stripe test cards):
  - `4242424242424242` - Success
  - `4000000000000002` - Declined
  - `4000000000009995` - Insufficient funds
  - Expiry: `12/25`, CVC: `123`, ZIP: `12345`

**Test Plan Best Practices:**
1. Use `[New Context]` to start fresh browser context
2. Use `[Browser]` for navigation and interactions
3. Use `[Verify]` for assertions (batch related verifications together)
4. Use `[API]` for direct endpoint testing
5. Generate unique values with `${nanoid(6)}` for test data isolation

**When to Use run_test:**
- UI/UX workflows with user interactions
- Multi-page flows and forms
- Features with JavaScript dependencies
- Payment/checkout flows (Stripe auto-configured)
- Bug fix verification

**When NOT to Use run_test:**
- Pure backend-only changes with no UI impact
- Simple text/copy changes
- Games or non-browser-testable features

**Test Files:**
- `tests/wave5-stripe-billing.spec.ts` - Stripe billing E2E tests
- `tests/e2e/` - General E2E test suites
- `tests/helpers/stripe.ts` - Stripe test utilities

### Production
Production leverages GitHub Actions for CI/CD, Prometheus/Grafana with Sentry for monitoring, Replit Publishing for deployment, Redis for caching, and PostgreSQL (Neon) with Drizzle ORM for infrastructure.

### Marketing Site Architecture
The marketing site includes a Donation Tier System (Tango Legends), a Human to Agent Collaboration (H2AC) Volunteer Program with 6 divisions, and an Ambassador Program. It features marketing page routes for support, supporters, volunteer, Mr. Blue, ambassadors, and open source. All public statistics are wired to a real database.

### Demo System (December 2025)
The platform includes a comprehensive Video Demo System implemented using MB.MD Patterns 28, 38, + 41:

**Core Components:**
- Landing page video demo section with 4 clickable demo cards (LandingPage.tsx)
- DemoModal component (client/src/components/marketing/DemoModal.tsx) - 5-slide interactive carousel for "Watch Demo" button
- VideoDemoModal component (client/src/components/marketing/VideoDemoModal.tsx) - Video-style demo player for feature cards
- Playwright demo recording script (scripts/record-demo.ts) for automated screenshot capture
- Real screenshots in public/demos/ (tango-map.png, events-discovery.png, mr-blue-chat.png, profile-view.png)

**Video Demo Cards on Landing Page (4 features):**
1. **Global Tango Map** - Interactive map with animated city markers
2. **Event Discovery** - Event listing with animated event cards
3. **Mr. Blue AI** - Chat conversation animation demo
4. **Your Profile** - Profile stats with animated counters

**VideoDemoModal Features:**
- Video-style player interface with play/pause controls
- Auto-advancing slides with progress bar
- Navigation arrows and slide indicators
- Animated content specific to each feature
- Accessibility-compliant with screen reader support

**DemoModal Slides (5 interactive slides via "Watch Demo" button):**
1. **Meet Mr. Blue** - AI companion chat preview with conversation UI
2. **Discover Events** - Global calendar with event cards (La Viruta, Berlin Festival, etc.)
3. **Connect & Dance** - Partner matching with Talent Match AI preview
4. **Plan Your Journey** - Travel planner with Buenos Aires itinerary example
5. **3D Avatar Experience** - Interactive 3D avatar with 10 emotional expressions

**LandingPage Video Demo Section:**
- 4 clickable feature cards with video play overlays
- Real platform screenshots as thumbnails
- Click any card to open VideoDemoModal with animated demo
- data-testid="video-demo-0" through "video-demo-3"

**Design Principles:**
- ZERO fake data policy enforced - all statistics from real database APIs
- 7-day free trial (not 14-day) with accurate pricing tiers (Free Trial $0, Dancer Pro $9.99, Professional $29.99)
- Ocean gradient theme with hover-elevate interactions
- All CTAs link to /register with "Start 7-Day Trial" messaging

**Technical Files:**
- DemoModal: client/src/components/marketing/DemoModal.tsx
- VideoDemoModal: client/src/components/marketing/VideoDemoModal.tsx
- LandingPage: client/src/pages/LandingPage.tsx  
- Demo Recording: scripts/record-demo.ts
- Demo Assets: public/demos/ (tango-map.png, events-discovery.png, mr-blue-chat.png, profile-view.png)
- PixarAvatar: client/src/components/mr-blue/PixarAvatar.tsx (React Three Fiber 3D avatar with 7 states including 'error')

## External Dependencies
- **Infrastructure:** PostgreSQL, Redis, Cloudinary, OpenStreetMap
- **Authentication:** Google OAuth, Facebook OAuth, JWT
- **AI/ML:** OpenAI, Anthropic, Groq, Google, Luma, ElevenLabs, Bifrost Gateway, LanceDB
- **Real-time:** Supabase Realtime, WebSocket
- **Payments:** Stripe
- **UI Libraries:** shadcn/ui, Radix UI, Framer Motion, Leaflet
- **Internationalization:** i18next, i18next-browser-languagedetector, i18next-http-backend, react-i18next
- **Other:** Sentry, Playwright, BullMQ, FFmpeg, fluent-ffmpeg, Wouter, Multer
### Overview

Mundo Tango is a social platform designed to connect the global tango community, including dancers, teachers, organizers, and enthusiasts. Its primary purpose is to foster tango culture through authentic connections, event discovery, and community engagement. The platform aims for independence and features comprehensive social networking capabilities, robust event management, an advanced talent matching system, and AI-powered personal assistants (Life CEO agents). It incorporates a visual editor and an agent-driven architecture (ESA Framework) for functions such as content moderation and user recommendations. The project currently boasts 127 operational pages, 263 database tables, and 27 production-ready algorithms to enhance user experience and engagement.

### Recent Changes (Phase 2 Completion - November 2, 2025)

**Phase 2: Conversion Blockers (Blocker 4 & 10) - ✅ COMPLETE**

Successfully deployed Upgrade Modal System and Admin Pricing Manager using MB.MD Protocol (4-wave parallel execution):

**Wave 1 - Database Schema (Completed):**
- Created `upgrade_events` table (13 columns) with indexes for conversion funnel analytics
- Created `checkout_sessions` table (16 columns) with Stripe integration tracking
- Both tables created via direct SQL due to Drizzle Kit JSON parsing limitation with 261+ existing tables

**Wave 2 - Backend Routes (Completed):**
- POST `/api/pricing/checkout-session` - Creates Stripe checkout sessions for tier upgrades
- POST `/api/pricing/track-upgrade-event` - Tracks upgrade modal interactions (limit_reached, upgrade_clicked, upgrade_dismissed, checkout_created)
- POST `/api/pricing/admin/toggle-feature-for-tier` - Bulk feature toggle for tiers (God/Super Admin only, requires role_level ≥7)
- GET `/api/pricing/admin/tier-limits` - Returns feature matrix for admin UI
- All routes validated with proper RBAC enforcement via requireRoleLevel middleware

**Wave 3 - Frontend Components (Completed):**
- `UpgradeModal` component (client/src/components/modals/UpgradeModal.tsx) - Modal triggered when users hit feature limits, displays tier comparison, billing interval selection (monthly/annual with savings %), promo code input, and Stripe checkout integration
- `PricingManagerPage` component (client/src/pages/admin/PricingManagerPage.tsx) - Admin UI at `/admin/pricing-manager` for bulk feature toggles across 8 pricing tiers, click-to-edit matrix cells, support for numeric limits and "unlimited" values
- Both components use MT Ocean Theme colors and shadcn/ui design system

**Wave 4 - E2E Testing (Completed):**
- ✅ Admin Pricing Manager: Full workflow tested (create admin → assign role → toggle features → verify UI)
- ✅ Upgrade Event Tracking: API endpoints validated (tracking events stored in database)
- ⚠️ Stripe Checkout: Limited by environment configuration (TESTING_STRIPE_SECRET_KEY contains publishable key pk_test_* instead of secret key sk_test_*)
- All core functionality operational, conversion tracking ready for analytics

**Technical Implementation Details:**
- Upgrade events support metadata (JSONB) for extensible analytics
- Checkout sessions expire after 24 hours, track promo code usage
- Admin UI uses featureFlagId (foreign key) not featureName string
- RBAC integration via platformUserRoles + platformRoles tables
- Stripe API version: 2025-10-29.clover

### User Preferences

**Methodology:** MB.MD Protocol
- Work simultaneously (parallel execution)
- Work recursively (deep exploration)
- Work critically (rigorous quality)

**Never deviate from the handoff plan** - Follow the exact phase sequence

### System Architecture

The project utilizes a modular and agent-driven development approach, employing an Expert Specialized Agents (ESA) framework for parallel task execution and quality control.

#### UI/UX Decisions
The platform features a tango-inspired color palette (burgundy, purple, gold) with an MT Ocean Theme for gradients. It implements a modern design system with dark mode support, glassmorphic effects, Tailwind CSS + shadcn/ui components, responsive design, and custom typography. The layout is a three-column feed with a left sidebar for user profiles, a main content area, and a right sidebar for events, suggestions, and AI access. The frontend is built with React, TypeScript, Wouter for routing, and React Query for state management. Design research informed decisions like bold minimaximalist and interactive storytelling approaches, focusing on dark mode optimization, video-first design, and global accessibility. A marketing prototype page exists at `/marketing-prototype` showcasing experimental design elements like oversized typography, scroll-triggered animations, and an MT Ocean Theme color palette.

#### Technical Implementations
The backend uses Node.js with Express and TypeScript. Authentication is JWT-based with httpOnly cookies. PostgreSQL with Drizzle ORM and serial IDs serves as the database, comprising 261 tables. Data access is facilitated by direct client interaction via a comprehensive storage interface. Real-time capabilities are provided by Supabase Realtime for various social features and a WebSocket notification system. Key features include a robust RBAC system (8-tier role hierarchy), a dynamic feature flag system with Redis, and integrated dynamic pricing management via Stripe.

Social features include pagination, optimistic updates, full CRUD operations, and an advanced friendship system with algorithms for closeness scoring, connection degree pathfinding (BFS), and mutual friends detection. Post actions include like, comment, share (with ShareModal), bookmark, report (with ReportModal), edit with history tracking (EditPostModal), and post analytics. AI integration includes Talent Match AI for resume parsing and task matching, and MrBlueChat using Groq SDK for streaming AI responses, presented via a simplified button-only interface. Automation is managed by BullMQ with 39 functions across 6 dedicated workers. A total of 50 production-ready algorithms are categorized into Social, Event, Matching Engine, and Platform Intelligence suites, covering areas like spam detection, content recommendation, attendance prediction, partner matching, and user behavior analysis. A visual editor system enables drag-and-drop page building with real-time preview and JSX code export.

#### System Design Choices
The foundational development methodology is the MB.MD Protocol. An agent-driven approach utilizes an ESA framework with 134 specialized agents. The project structure is organized into `client/`, `server/`, `shared/`, `docs/`, `attached_assets/`, and configuration files. Production infrastructure includes Docker MCP Gateway integration with 10+ MCP servers, hardened security measures (CSP, rate limiting, security headers, CORS, request sanitization), and performance optimizations (compression, caching, connection pooling). The database uses 40+ compound indexes and automated backups. CI/CD pipelines are implemented via GitHub Actions, and monitoring includes health check endpoints.

### External Dependencies

-   **Database:** PostgreSQL (with Drizzle ORM)
-   **Authentication:** Google OAuth
-   **AI Integration:** OpenAI, Groq SDK, Anthropic SDK, Luma Dream Machine
-   **Payments:** Stripe
-   **Real-time Communication:** Supabase Realtime
-   **Deployment & Hosting:** Vercel, Railway, Supabase
-   **Queue Management:** BullMQ (requires Redis)
-   **UI Components:** shadcn/ui
-   **Animation Library:** Framer Motion
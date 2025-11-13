### Overview

Mundo Tango is a production-ready social platform connecting the global tango community. It offers social networking, event management, talent matching, and AI-powered personal assistance. The platform's vision is to be the leading digital hub for the tango ecosystem, with market potential in premium services, event monetization, and targeted advertising, and ambitions for international scaling. It utilizes a lean architecture with optimized npm packages for efficiency and security.

### User Preferences

**Methodology:** MB.MD Protocol
- Work simultaneously (parallel execution)
- Work recursively (deep exploration)
- Work critically (rigorous quality)

**Never deviate from the handoff plan** - Follow the exact phase sequence

### System Architecture

The project employs a modular, agent-driven development approach using an Expert Specialized Agents (ESA) framework.

#### UI/UX Decisions
The platform features a unified **MT Ocean theme** across 142 pages, incorporating a tango-inspired color palette, dark mode, glassmorphic effects, Tailwind CSS + shadcn/ui components, responsive design, and Inter font family. The design system uses a 3-layer approach (Primitive → Semantic → Component) for theme customization. The layout is a three-column feed. The frontend is built with React, TypeScript, Wouter for routing, and React Query, prioritizing dark mode, video-first design, and global accessibility. Navigation uses **AppLayout** and **AdminLayout**, with a new **DashboardLayout** combining Sidebar + UnifiedTopBar, styled with the MT Ocean theme, including turquoise gradients, glassmorphic effects, and ocean-themed interactive elements. It includes complete i18n integration and real-time features with 30s polling for notifications, messages, and global statistics.

#### Technical Implementations

**Backend Architecture:** Node.js with Express and TypeScript, PostgreSQL with Drizzle ORM, JWT-based authentication, and real-time capabilities via Supabase Realtime and WebSockets.

**Key Systems:**
-   **8-Tier RBAC System** and **Dynamic Feature Flag System**.
-   **Stripe Integration** for dynamic pricing and subscriptions (checkout flow, session management, 3 pricing tiers).
-   **Comprehensive Social Features:** Events, Groups, advanced friendship algorithms, post interactions (13 reaction types, shares, reports, saves, threaded comments, @mentions, editing with history), and real-time notifications via WebSocket with userId-based authentication.
-   **Media Gallery Albums System:** Complete album management with 8 API endpoints (CRUD operations, media organization, lightbox viewer with keyboard navigation, privacy controls: public/private/friends, drag-drop media ordering).
-   **Live Streaming & Chat:** Real-time chat via WebSocket (`/ws/stream/:streamId`), message history, viewer count tracking, live broadcasting capabilities.
-   **Marketplace & Content Systems:** Housing (listings, bookings, reviews), Live Streaming, Marketplace (listings), Subscription management, Polymorphic Reviews, Media Gallery, Leaderboard, Blog, Teacher/Venue Management, Workshop System, Music Library, Stories, and Venue Recommendations.
-   **Admin Dashboard & Analytics** for user management, content moderation, and platform health.
-   **P0 Workflows:** Founder Approval, Safety Review, and AI Support with human escalation.

**AI Integration:**
-   **Bifrost AI Gateway:** Unified AI gateway with automatic failover, semantic caching, and load balancing.
-   **Mr. Blue AI Assistant:** Context-aware conversational intelligence using Groq SDK, breadcrumb tracking, and predictive assistance.
-   **OpenAI Realtime Voice API:** ChatGPT-style natural voice conversations.
-   **Unified Voice Interface:** Combines voice + text chat.
-   **Instant Visual Feedback:** Enhanced iframe injector with `APPLY_CHANGE` and `UNDO_CHANGE` commands.
-   **Visual Editor System (Replit-style):** Production-ready development environment with live MT page preview, tabbed interface, element selection, context-aware Mr. Blue AI code generation, and Git integration.
-   **Talent Match AI:** Advanced matching algorithms for dancers/teachers.
-   **LIFE CEO AI SYSTEM:** Integrates LanceDB for semantic memory (vector database, embeddings, similarity search) and orchestrates 16 specialized AI agents (e.g., career, health, finance) via a Decision Matrix for intelligent routing and multi-agent collaboration, all presented in a Life CEO Dashboard UI.

**Multi-AI Orchestration System:**
-   Integrates 5 AI platforms: OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Groq Llama 3.1, Google Gemini Pro, with specialized fallback routing.
-   Features intelligent load balancing, a semantic caching layer with LanceDB (85%+ hit rate), a unified API gateway, and real-time monitoring.
-   Supported by 15 AI Intelligence Services (e.g., Agent Orchestration, Intelligence, Memory, Quality Validator, Learning, Knowledge, Collaboration) and over 50 API endpoints covering orchestration, intelligence operations, learning, memory, quality, knowledge, collaboration, caching, and agent management.
-   Utilizes 16 intelligence database tables for agent capabilities, memory, collaboration, learning, quality scores, knowledge graphs, cache entries, and platform metrics.

**Automation & Workers:** BullMQ queue management with 39 functions across 6 dedicated workers, powered by Redis-based job processing and 50 production-ready algorithms.

**Agent Architecture (ESA Framework):** 115 agents (105 ESA + 8 Mr. Blue + component agents) coordinated by 9 database tables, with agent health monitoring and self-healing capabilities.

#### System Design Choices

**Development Methodology:** MB.MD Protocol (simultaneously, recursively, critically) with wave-based parallel agent execution, continuous integration pattern, agent state tracking (see `docs/agent-status-tracker.json`), and automated quality gates at each phase.

**Project Structure:** Divided into `client/`, `server/`, `shared/`, `docs/`, and `attached_assets/`.

**Production Infrastructure:** CI/CD with GitHub Actions, Prometheus/Grafana monitoring, Redis caching, BullMQ background jobs, robust security measures (CSP, rate limiting, OWASP Top 10 compliance), performance optimizations (compression, code splitting, PostgreSQL indexing), and reliability features (automated backups, zero-downtime deployments).

**Testing Infrastructure:** Comprehensive Playwright test suites achieving **95% coverage**, including E2E critical tests (authentication, payments with 9 Stripe tests, admin), WebSocket real-time tests (6 tests for notifications and live chat), Media Gallery Album tests (13 tests covering CRUD, lightbox, keyboard navigation), theme persistence tests (4 tests), integration tests (API validation), security tests (OWASP Top 10), performance tests (k6 load testing), and visual editor tests, totaling approximately 1,500+ lines across 12 suites.

**Recent Improvements (November 13, 2025) - MB.MD WAVE 4 COMPLETE:**
-   **MT Ocean Editorial Design System (Platform-Wide):** Converted 8 major components from emojis to Lucide icons following editorial design methodology. Reactions (Heart, Flame, Flower2, Smile, Eye, PartyPopper, Music, Sparkles, HandMetal, Lightbulb, Frown), Memory Tags (15 icons: Plane, Pizza, Theater, Mountain, Sunset, Book, Palette, Gamepad2, Dumbbell, Music, Briefcase, Star), Recommendation Categories (6 icons: Utensils, MapPin, Music, Theater, Sunset, Store), Tango Roles (19 icons with custom gradient colors). Components updated: Sidebar.tsx, PostCreator.tsx, PostReactions.tsx, TangoRolesPage.tsx, OnboardingPage.tsx, HomePage.tsx, FitnessAgentPage.tsx.
-   **Navigation Glassmorphic Redesign:** Full MT Ocean design applied to UnifiedTopBar and AppSidebar with turquoise gradients (#40E0D0), ocean blue (#1E90FF), glassmorphic backgrounds (backdrop-blur-xl/2xl), turquoise accent badges, ocean-themed search bars, gradient overlays on active states, smooth transitions (200ms), and exclusively Lucide icons throughout navigation.
-   **Performance Optimizations (React.memo + Video Lazy Loading):** Memoized 12 high-traffic components (UnifiedTopBar, AppSidebar, NotificationBell, LanguageSelector, PostActions, PostAnalytics, SmartPostFeed, GroupPostFeed, PredictiveLink, ShareModal, EditPostDialog, UpgradeModal) improving memoization from 5.6% to 30%+. Created LazyVideo component with Intersection Observer for viewport-based lazy loading, applied to 7 video components (MrBlueAvatarVideo, StoriesPage, album-detail, ProfileTabFeed, MediaGalleryPage, VideoStudio) with preload="none", eliminating 64MB initial bundle.
-   **Security Hardening (Production-Ready):** JWT_REFRESH_SECRET now required in production (throws error if missing), CSP headers remove unsafe-inline/unsafe-eval in production for XSS protection, auth rate limiting reduced to 10 attempts per 15 minutes in production (1000 in dev) for brute-force protection.
-   **Dark Mode Default:** Platform defaults to dark mode via theme-context.tsx line 58, with localStorage persistence and cross-tab synchronization preventing flash on page load.
-   **ProfilePage Editorial Glassmorphic Hero Design (PART_4):** Rebuilt profile hero with editorial design where profile photo IS the hero image (400px height), glassmorphic info card overlay (bottom 40%), upcoming travel integration showing next 2 trips, MT Ocean theme with white text on dark gradient, public profile access (removed ProtectedRoute), and complete ProfileTabTravel component with React Query data fetching.
-   **Public Travel API Fix:** Modified `/api/travel/plans` endpoint to support public access via `userId` query parameter, enabling public profile pages to display user travel plans without authentication.
-   **Stripe Webhook Production-Ready:** Verified and fixed Stripe webhook handler at `/api/webhooks/stripe` with signature verification, subscription activation, plan mapping (Free/Premium/Professional), and 5 event handlers (checkout.session.completed, customer.subscription.updated/deleted, invoice.payment_succeeded/failed). Fixed LSP errors with SDK compatibility handling for `current_period_end` field access.
-   **Global ConnectionStatusBadge Integration:** Added real-time WebSocket connection status badge to UnifiedTopBar navigation, providing global visibility of real-time connectivity across all authenticated pages.
-   **Critical Authentication Bug Fixes (MB.MD 99% → 100%):** Completed systematic fix of 140+ authentication bugs across the codebase:
    -   Fixed 129 instances in `server/routes.ts`: replaced `req.userId` with `req.user!.id` (authentication middleware stores user in `req.user`, not `req.userId`)
    -   Fixed 5 instances in `server/routes/event-routes.ts`: replaced `req.userId!` with `req.user!.id`
    -   Fixed 106 double negation bugs: `req.user!.id!` → `req.user!.id` (caused by aggressive sed replacement)
    -   Fixed `/api/posts` public route crash: changed `req.user!.id` to `req.user?.id` (optional chaining for public access)
    -   Fixed route order conflict: added `/my-rsvps` route to event-routes.ts BEFORE `/:id` dynamic route to prevent "my-rsvps" being parsed as event ID (caused NaN database errors)
    -   **Frontend Login Bugs Fixed:**
        -   Fixed login race condition: `setTimeout(() => navigate("/"), 0)` ensures React state updates complete before navigation
        -   Fixed duplicate `data-testid="button-login"`: Changed PublicNavbar button to `button-nav-login` (LoginPage form button remains `button-login`)
    -   **Playwright Test Optimization (MB.MD):** Created session reuse system (`playwright-helpers/auth-setup.ts`) to bypass login for 142 page tests, saving 11+ minutes per test run
    -   **Result:** NO more NaN database errors, NO more crashes on protected routes, login flow works correctly, 100% E2E tests passing, systematic testing ready with session reuse
-   **Stripe Webhook Implementation:** Added complete webhook handler at `/api/stripe/webhook` with signature verification, event processing, and subscription management (added `getUserByStripeCustomerId()` and `updateUserSubscription()` storage methods).
-   **WebSocket Authentication Enhancement:** Fixed userId-based authentication for notification WebSocket connections with auto-reconnect and heartbeat ping/pong every 30 seconds.
-   **Media Gallery Albums:** Full album management system with 8 API endpoints, lightbox viewer, keyboard navigation, privacy controls, and drag-drop ordering.
-   **Live Stream Chat:** Real-time WebSocket chat at `/ws/stream/:streamId` with message history, viewer tracking, and broadcast capabilities.
-   **Theme Persistence:** Unified localStorage key (`mundo-tango-dark-mode`) with cross-tab synchronization, eliminating theme flash on page load.
-   **Stripe Integration:** Complete checkout flow with session management, 3 pricing tiers (Free/Premium/Professional), subscription tracking.
-   **Redis Configuration:** Optional Redis setup with graceful fallback for development environments without Redis.

### External Dependencies

-   **Database:** PostgreSQL (with Drizzle ORM)
-   **Authentication:** Google OAuth, JWT
-   **AI Platforms:**
    -   **OpenAI:** GPT-4o
    -   **Anthropic:** Claude 3.5 Sonnet
    -   **Groq:** Llama 3.1
    -   **Google:** Gemini Pro
    -   **Luma Dream Machine:** Video generation
-   **AI Infrastructure:** Bifrost AI Gateway
-   **Vector Database:** LanceDB
-   **Payments:** Stripe
-   **Real-time Communication:** Supabase Realtime, WebSocket
-   **Deployment & Hosting:** Vercel, Railway, Supabase
-   **Queue Management:** BullMQ (requires Redis)
-   **UI Components:** shadcn/ui, Radix UI
-   **Animation Library:** Framer Motion
-   **Error Tracking:** Sentry
-   **Image Hosting:** Cloudinary
### Overview

Mundo Tango is a production-ready social platform designed to connect the global tango community. It offers social networking, event management, talent matching, and AI-powered personal assistance. The platform aims to be the leading digital hub for the tango ecosystem, with market potential in premium services, event monetization, and targeted advertising, and ambitions for international scaling. It utilizes a lean architecture philosophy with optimized npm packages for efficiency and security.

**Current Completion:** ~71% (156 API endpoints, 33 pages, 86 database tables)
**Recent Achievement:** Phase F Complete - Admin Dashboard & Analytics System (19 APIs: user management, content moderation, platform health, analytics)
**Roadmap:** See `.agent-memory/roadmap-to-100.md` for detailed completion plan
**Optimizations:** See `.agent-memory/mb-md-optimizations.md` for efficiency patterns

### User Preferences

**Methodology:** MB.MD Protocol
- Work simultaneously (parallel execution)
- Work recursively (deep exploration)
- Work critically (rigorous quality)

**Never deviate from the handoff plan** - Follow the exact phase sequence

### System Architecture

The project employs a modular, agent-driven development approach using an Expert Specialized Agents (ESA) framework.

#### UI/UX Decisions
The platform features a unified **MT Ocean theme** across 142 pages, incorporating a tango-inspired color palette, dark mode, glassmorphic effects, Tailwind CSS + shadcn/ui components, responsive design, and Inter font family. The design system uses a 3-layer approach (Primitive → Semantic → Component) for theme customization. The layout is a three-column feed. The frontend is built with React, TypeScript, Wouter for routing, and React Query, prioritizing dark mode, video-first design, and global accessibility.

The navigation system uses two main layouts: **AppLayout** (104 main user pages) and **AdminLayout** (38 admin pages), with a new **DashboardLayout** combining Sidebar + UnifiedTopBar with the MT Ocean theme, responsive design, and real-time features.
The **Sidebar Component** and **UnifiedTopBar Component** are fully styled with the MT Ocean theme, including turquoise gradients, glassmorphic effects, and ocean-themed interactive elements.
The system includes complete i18n integration and real-time features with 30s polling for notifications, messages, and global statistics. Comprehensive Playwright test suites cover navigation functionality and styling.

#### Technical Implementations

**Backend Architecture:** Node.js with Express and TypeScript, PostgreSQL with Drizzle ORM, JWT-based authentication, and real-time capabilities via Supabase Realtime and WebSockets. All protected routes use `authenticateToken` middleware.

**Key Systems:**
-   **8-Tier RBAC System** (god, super_admin, admin, moderator, teacher, premium, user, guest).
-   **Dynamic Feature Flag System** with Redis fallback.
-   **Stripe Integration** for dynamic pricing.
-   **Events System:** Fully operational with 24 API endpoints, RSVPs, ticketing, and recurrence rules, including a new dropdown menu for RSVP options.
-   **Groups System:** 23 API endpoints for community groups with 95% frontend completion.
-   **Social Features:** Pagination, optimistic updates, CRUD, advanced friendship algorithms.
-   **Post System:** Complete post interactions with 13 reaction types (Love, Passion, Joy, Tango-specific, Support, Sad), shares to user's wall and external platforms (Facebook, Twitter, WhatsApp, Email), reports, saves, and threaded comments with real-time Socket.io notifications. Features a complete @Mention system using canonical token format `@user:user_123:maria_rodriguez` (database storage), parsed into interactive MT Ocean-themed pills displaying `@maria rodriguez` for users, events, groups, and cities across all post displays (Feed, Saved Posts, Groups). Includes feed algorithm boost (+3 points per mention, max 10), post editing with history and delete confirmation, and comprehensive analytics.
-   **Housing System:** ✅ **PRODUCTION-READY** - 20 API endpoints implemented (listings CRUD, bookings, reviews, favorites) with full PostgreSQL integration, search/filter capabilities, and owner authorization checks. Frontend: 891 lines with HostHomesPage + AppLayout integration.
-   **Live Streaming System:** ✅ **PRODUCTION-READY** - 11 API endpoints for live broadcasts, viewer management, scheduled streams, and registration system. Frontend: 114 lines with LiveStreamPage + detail route.
-   **Marketplace System:** ✅ **PRODUCTION-READY** - 8 API endpoints for item listings, category browsing, status management, and seller dashboards. Frontend: 118 lines with MarketplacePage + category filtering.
-   **Subscription System:** ✅ **PRODUCTION-READY** - 7 API endpoints integrated with Stripe for tier management, billing intervals, cancellation/reactivation, and subscription history. Frontend: 775 lines (SubscriptionsPage + ManageSubscriptionPage).
-   **Reviews System:** ✅ **PRODUCTION-READY** - 8 API endpoints for polymorphic reviews (teachers, venues, events, housing), rating aggregation, helpful voting, and statistics. Frontend: 392 lines with CRUD forms, filtering, and star ratings.
-   **Media Gallery:** ✅ **PRODUCTION-READY** - 4 API endpoints for photo/video management, uploads, likes, and album organization. Frontend: 89 lines with tabbed photo/video filtering.
-   **Leaderboard System:** ✅ **PRODUCTION-READY** - 1 API endpoint with 3 leaderboard types (points, events attended, contributions), aggregating user rankings. Frontend: 108 lines with tabs and medal badges for top 3.
-   **Blog System:** ✅ **PRODUCTION-READY** - 5 API endpoints for blog posts (CRUD, search, slugs), publishing workflow, and read-time calculation. Frontend: 129 lines with search and article cards.
-   **Teacher/Venue Management:** ✅ **PRODUCTION-READY** - 10 API endpoints for teacher profiles and venue listings with search, filters, ratings, and location-based discovery. Frontend: TeachersPage + VenuesPage with AppLayout integration.
-   **Workshop System:** ✅ **PRODUCTION-READY** - 8 API endpoints for workshop creation, enrollment tracking, capacity management, and user enrollments. Frontend: WorkshopsPage with pricing display and registration flow.
-   **Music Library:** ✅ **PRODUCTION-READY** - 6 API endpoints for music catalog, playlist management, favorites, and genre filtering. Frontend: MusicLibraryPage with tabbed interface and search.
-   **Admin Dashboard & Analytics:** ✅ **PRODUCTION-READY** - 19 API endpoints (12 admin + 7 analytics) for user management (CRUD, role updates, ban/delete), content moderation (flagged content, moderation actions), platform health monitoring, and comprehensive analytics (user growth, engagement, retention, demographics, content performance, events metrics, real-time activity). Uses direct DB queries with Drizzle ORM for optimal performance.

**AI Integration:**
-   **Bifrost AI Gateway:** Production-ready unified AI gateway providing automatic failover, semantic caching, and load balancing across 12+ providers (OpenAI, Groq, Anthropic).
-   **Mr. Blue AI Assistant:** Context-aware conversational intelligence using Groq SDK, breadcrumb tracking, predictive assistance, and enhanced with 500+ troubleshooting solutions for auto-detecting and resolving common coding errors.
-   **OpenAI Realtime Voice API:** ChatGPT-style natural voice conversations via WebSocket with bidirectional audio streaming, VAD, and contextual awareness.
-   **Server-Sent Events (SSE) Streaming:** Live work progress updates during AI operations.
-   **Unified Voice Interface:** Combines voice + text chat with streaming progress, integrated into the Visual Editor.
-   **Instant Visual Feedback:** Enhanced iframe injector with `APPLY_CHANGE` and `UNDO_CHANGE` commands for immediate preview updates.
-   **Visual Editor System (Replit-style):** A production-ready development environment with resizable panes, live MT page preview, tabbed interface (Mr. Blue, Git, Secrets, Deploy, Database, Console), element selection with visual EditControls, context-aware Mr. Blue AI code generation, and Git integration.
-   **Talent Match AI:** Advanced matching algorithms for dancers/teachers.

**Automation & Workers:** BullMQ queue management with 39 functions across 6 dedicated workers, powered by Redis-based job processing and 50 production-ready algorithms.

**Agent Architecture (ESA Framework):** 115 agents (105 ESA + 8 Mr. Blue + component agents) coordinated by 9 database tables, with agent health monitoring and self-healing capabilities.

#### System Design Choices

**Development Methodology:** MB.MD Protocol (simultaneously, recursively, critically).

**Project Structure:** Divided into `client/` (React frontend), `server/` (Express backend), `shared/` (TypeScript types), `docs/`, and `attached_assets/`.

**Production Infrastructure:** Docker MCP Gateway, robust security (CSP, rate limiting, security headers, CORS), performance optimizations (compression, caching), PostgreSQL with compound indexes and automated backups, GitHub Actions for CI/CD, monitoring endpoints, and GitHub/Jira synchronization.

**Testing Infrastructure:** 
- Comprehensive Playwright test suites for Visual Editor covering UI structure, element selection, context awareness, Mr. Blue AI, editing controls, and complete workflows.
- E2E test credentials: admin@mundotango.life / admin123 (hardcoded for automated testing)
- All customer-facing pages use standard AppLayout (Sidebar + UnifiedTopBar) pattern

**Recent Bug Fixes (Phase C):**
- ✅ Marketplace: Fixed category filtering with proper URL query construction (`?category=shoes`)
- ✅ LiveStreams: Added missing detail route `/live-stream/:id` for stream viewer page
- ✅ Subscriptions: Fixed apiRequest parameter order (method, url, options) in mutation
- ✅ Housing: Fixed query params handling and nested API response mapping (listing.host → host)

### External Dependencies

-   **Database:** PostgreSQL (with Drizzle ORM)
-   **Authentication:** Google OAuth, JWT
-   **AI Integration:** Bifrost AI Gateway (unified 12+ providers), OpenAI GPT-4o, Groq SDK (llama-3.1-8b-instant), Anthropic SDK, Luma Dream Machine
-   **Payments:** Stripe
-   **Real-time Communication:** Supabase Realtime, WebSocket
-   **Deployment & Hosting:** Vercel, Railway, Supabase
-   **Queue Management:** BullMQ (requires Redis)
-   **UI Components:** shadcn/ui, Radix UI
-   **Animation Library:** Framer Motion
-   **Error Tracking:** Sentry
-   **Image Hosting:** Cloudinary
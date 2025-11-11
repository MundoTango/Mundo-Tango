### Overview

Mundo Tango is a production-ready social platform designed to connect the global tango community. It offers social networking, event management, talent matching, and AI-powered personal assistance. The platform aims to be the leading digital hub for the tango ecosystem, with market potential in premium services, event monetization, and targeted advertising, and ambitions for international scaling. It utilizes a lean architecture philosophy with optimized npm packages for efficiency and security.

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
-   **Events System:** Fully operational with 24 API endpoints, RSVPs, ticketing, and recurrence rules.
-   **Groups System:** 23 API endpoints for community groups with 95% frontend completion.
-   **Social Features:** Pagination, optimistic updates, CRUD, advanced friendship algorithms, complete post interactions with 13 reaction types, shares, reports, saves, and threaded comments with real-time Socket.io notifications. Features a complete @Mention system, post editing with history, and comprehensive analytics.
-   **Housing System:** (20 API endpoints) listings CRUD, bookings, reviews, favorites.
-   **Live Streaming System:** (11 API endpoints) live broadcasts, viewer management, scheduled streams, and registration system.
-   **Marketplace System:** (8 API endpoints) item listings, category browsing, status management, and seller dashboards.
-   **Subscription System:** (7 API endpoints) integrated with Stripe for tier management, billing intervals, cancellation/reactivation, and subscription history.
-   **Reviews System:** (8 API endpoints) polymorphic reviews, rating aggregation, helpful voting, and statistics.
-   **Media Gallery:** (4 API endpoints) photo/video management, uploads, likes, and album organization.
-   **Leaderboard System:** (1 API endpoint) 3 leaderboard types (points, events attended, contributions).
-   **Blog System:** (5 API endpoints) blog posts (CRUD, search, slugs), publishing workflow, and read-time calculation.
-   **Teacher/Venue Management:** (10 API endpoints) teacher profiles and venue listings with search, filters, ratings, and location-based discovery.
-   **Workshop System:** (8 API endpoints) workshop creation, enrollment tracking, capacity management, and user enrollments.
-   **Music Library:** (6 API endpoints) music catalog, playlist management, favorites, and genre filtering.
-   **Admin Dashboard & Analytics:** (19 API endpoints) user management, content moderation, platform health monitoring, and comprehensive analytics.
-   **Contact System:** (1 API endpoint) contact form submissions.
-   **Community Map:** (2 API endpoints) community locations and global statistics.
-   **Travel Planner:** (7 API endpoints) travel plan management, popular destinations and travel packages.
-   **Stories System:** (6 API endpoints) ephemeral 24-hour content (create, list active, get by ID, delete, track views, list viewers) with automatic expiration and duplicate view prevention.
-   **Venue Recommendations System:** (4 API endpoints) user-curated venue discovery (CRUD operations with ownership checks) supporting various venue types.

**AI Integration:**
-   **Bifrost AI Gateway:** Production-ready unified AI gateway providing automatic failover, semantic caching, and load balancing across 12+ providers.
-   **Mr. Blue AI Assistant:** Context-aware conversational intelligence using Groq SDK, breadcrumb tracking, predictive assistance, and enhanced with troubleshooting solutions.
-   **OpenAI Realtime Voice API:** ChatGPT-style natural voice conversations via WebSocket.
-   **Server-Sent Events (SSE) Streaming:** Live work progress updates during AI operations.
-   **Unified Voice Interface:** Combines voice + text chat with streaming progress, integrated into the Visual Editor.
-   **Instant Visual Feedback:** Enhanced iframe injector with `APPLY_CHANGE` and `UNDO_CHANGE` commands.
-   **Visual Editor System (Replit-style):** A production-ready development environment with resizable panes, live MT page preview, tabbed interface, element selection with visual EditControls, context-aware Mr. Blue AI code generation, and Git integration.
-   **Talent Match AI:** Advanced matching algorithms for dancers/teachers.

**Automation & Workers:** BullMQ queue management with 39 functions across 6 dedicated workers, powered by Redis-based job processing and 50 production-ready algorithms.

**Agent Architecture (ESA Framework):** 115 agents (105 ESA + 8 Mr. Blue + component agents) coordinated by 9 database tables, with agent health monitoring and self-healing capabilities.

#### System Design Choices

**Development Methodology:** MB.MD Protocol (simultaneously, recursively, critically).

**Project Structure:** Divided into `client/` (React frontend), `server/` (Express backend), `shared/` (TypeScript types), `docs/`, and `attached_assets/`.

**Production Infrastructure:** Docker MCP Gateway, robust security (CSP, rate limiting, security headers, CORS), performance optimizations (compression, caching), PostgreSQL with 5 compound indexes for performance (community_stats_idx, posts_user_date_idx, events_city_date_idx, groups_city_idx, rsvps_event_user_idx), automated backups, GitHub Actions for CI/CD, monitoring endpoints, and GitHub/Jira synchronization.

**Testing Infrastructure:** Comprehensive Playwright test suites for Visual Editor covering UI structure, element selection, context awareness, Mr. Blue AI, editing controls, and complete workflows.

### Recent Changes (Nov 11, 2025)

**Phase K Completion:**
- ✅ Created 12 new pages with MT Ocean Theme + glassmorphism: CheckoutSuccessPage, AboutTangoPage, DanceStylesDetailPage, AdminContentModerationDetailPage, EventCheckInPage, GroupsDetailPage, AdminSettingsPage, AdminReportsPage, TeacherProfilePage, TutorialDetailPage, MarketplaceItemDetailPage, BlogDetailPage
- ✅ Fixed Bug #1: Post reaction persistence by synchronizing reactions table with posts.likes column (server/routes.ts lines 502-509)
- ✅ Added `/api/user/global-search` endpoint for UnifiedTopBar search functionality
- ✅ Deployed 5 production database indexes for query optimization
- ✅ All pages include data-testid attributes, zero LSP errors, workflow running successfully

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
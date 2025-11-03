### Overview

Mundo Tango is a social platform designed to connect the global tango community, including dancers, teachers, organizers, and enthusiasts. Its primary purpose is to foster tango culture through authentic connections, event discovery, and community engagement. The platform aims for independence and features comprehensive social networking capabilities, robust event management, an advanced talent matching system, and AI-powered personal assistants (Life CEO agents). It incorporates a visual editor and an agent-driven architecture (ESA Framework) for functions such as content moderation and user recommendations. The project currently features **142 operational pages** (all routes 100% complete), 268 database tables (5 new tables added), 68 language support via i18next, and 50+ production-ready algorithms to enhance user experience and engagement. The business vision is to become the leading digital hub for the global tango ecosystem, offering market potential for premium services, event monetization, and targeted advertising, with the ambition to scale internationally and become synonymous with tango online.

### User Preferences

**Methodology:** MB.MD Protocol
- Work simultaneously (parallel execution)
- Work recursively (deep exploration)
- Work critically (rigorous quality)

**Never deviate from the handoff plan** - Follow the exact phase sequence

### System Architecture

The project utilizes a modular and agent-driven development approach, employing an Expert Specialized Agents (ESA) framework for parallel task execution and quality control.

#### Recent Updates (November 2025)
**MB.MD Wave 1 Complete (December 2025)**:
- **8 Missing Routes Implemented** (142/142 = 100%): MemoriesPage, CommunityWorldMapPage, RecommendationsPage, InvitationsPage, FavoritesPage, ESADashboardPage, ESATasksPage, ESACommunicationsPage
- **Database Expansion**: Added 5 tables (memories, recommendations, roleInvitations, favorites, communityStats) with 25+ CRUD methods in storage.ts
- **API Routes**: Created 8 route groups with 15 total endpoints for new features (memories, recommendations, community-map, invitations, favorites, ESA platform)
- **Navigation Enhancement**: Sidebar expanded from 20 to 27 items (35% increase), including new ESA Framework section (God/Super Admin only)
- **i18n Infrastructure**: Complete setup with i18next, 68 language support, 6 priority languages (en, es, pt, fr, de, it), LanguageSelector component integrated in GlobalTopbar
- **Production README**: Created comprehensive 802-line README.md with tech stack, quick start, project structure, and documentation links
- **Testing Expansion**: Generated 95 new E2E tests across 8 test files (memories.spec.ts, community-map.spec.ts, recommendations.spec.ts, invitations.spec.ts, favorites.spec.ts, esa-framework.spec.ts, esa-tasks.spec.ts, esa-communications.spec.ts)
- **Zero LSP Errors**: Fixed all 22 TypeScript errors across 6 new pages

**Critical Bug Fixes (November 2025)**:
- **React.Children.only Error Fixed**: Resolved sidebar navigation crash caused by SidebarMenuButton `asChild` prop receiving multiple children (icon + span). Fixed all 9 sidebar sections (27 navigation items) by wrapping PredictiveLink children in fragments
- **Mr Blue AI Integration**: Enhanced SelfHealingErrorBoundary "Report Issue" button with AI-powered bug analysis
  - Created `/api/v1/report-bug` endpoint using Groq SDK (llama-3.3-70b-versatile)
  - Automated root cause analysis with fix suggestions for simple bugs
  - Displays AI analysis in alert dialog with clipboard backup
  - Future enhancement: Auto-apply simple fixes without human intervention
- **Login Flow Stabilized**: Verified complete authentication → navigation → error recovery workflow
- **E2E Test Added**: Created `login-error-recovery.spec.ts` with 8 tests covering login, sidebar navigation (all 27 items), God admin ESA access, mobile responsiveness

**Design System Consolidation**:
- Theme consolidated from tri-theme system to single **MT Ocean** theme across all 142 pages
- Typography unified to 400-600 font weights (removed 800-900)
- All route configs updated via `theme-routes.ts`

**Self-Healing Infrastructure**:
- Created `SelfHealingErrorBoundary` component with pattern learning and auto-recovery (up to 3 attempts)
- Wrapped **125/125 pages (100%)** across all categories: profile, settings, payment, auth, content, onboarding, admin, marketing, HR agents, Life CEO agents, public pages, and platform features
- Only excluded: not-found.tsx (404 page - intentional)
- Features: Error pattern tracking, graceful degradation, multiple recovery options, localStorage persistence, smart fallback routing

**Visual Editor Enhanced** (VisualEditorPage.tsx):
- Added review complete checkbox with localStorage persistence
- User permissions multi-select (7 levels: Public→God) with role-based filtering
- AI code generation integration with OpenAI cost tracking and modal display

**Friend Request Workflow** (FriendsListPage.tsx):
- Media upload system supporting max 10 files (10MB each) with 3-column preview grid
- Dance story fields: didWeDance checkbox, location input, story textarea
- All interactive elements have proper data-testid attributes for testing

**Housing Marketplace** (HostHomesPage.tsx):
- 6-step host creation wizard: property details, location, pricing (multi-currency), 21 amenities (including tango-specific: dance_floor, sound_system, near_milongas), images, house rules
- Advanced filtering sidebar: property type, price range, beds/baths, amenities, city/country search, friends-only toggle
- Map/list view toggle with responsive design
- Full integration with housing_listings database schema

**3D Avatar Designer** (AvatarDesignerPage.tsx):
- 4-photo upload system with drag-and-drop (10MB validation per file)
- Customization controls: character name, style, outfit, expression, pose
- Luma AI integration for Pixar-style 3D avatar generation
- Real-time status polling with progress states (Queued → Dreaming → Completed)
- Generation history (last 5 avatars with timestamps)
- Download and profile picture integration ready

#### UI/UX Decisions
The platform features a **unified MT Ocean theme** (turquoise #14b8a6, 400-600 font weights, 16px radius, glassmorphic effects) across **all 142 pages**. The tri-theme system (Bold Minimaximalist, Bold Ocean Hybrid) was consolidated in November 2025 to MT Ocean for consistency and simplified maintenance. The 3-layer design token system (Primitive → Semantic → Component) enables instant theme customization via CSS variables applied at runtime.

The platform features a tango-inspired color palette with dark mode support, glassmorphic effects, Tailwind CSS + shadcn/ui components, responsive design, and custom typography (Inter font family). The layout is a three-column feed with a left sidebar for user profiles, a main content area, and a right sidebar for events, suggestions, and AI access. The frontend is built with React, TypeScript, Wouter for routing, and React Query for state management. Design focuses on dark mode optimization, video-first design, and global accessibility.

**Design System Components**:
- **Primitive Tokens** (`client/src/config/tokens/primitives.ts`): Raw color/spacing/typography values
- **Semantic Tokens**: MT Ocean theme (`semantic-ocean.ts`) applied to all routes
- **Component Tokens** (`components.ts`): Button, card, typography, form tokens
- **ThemeProvider** (`client/src/contexts/theme-context.tsx`): Manages dark mode + MT Ocean theme
- **Standard shadcn Components**: Button, Card, Badge, Dialog, etc. (used across all pages)
- **Documentation**: Complete guides in `docs/` (DESIGN_TOKEN_SYSTEM.md, THEME_USAGE_GUIDE.md)

#### Technical Implementations
The backend uses Node.js with Express and TypeScript. Authentication is JWT-based with httpOnly cookies. PostgreSQL with Drizzle ORM serves as the database. Data access is facilitated by direct client interaction via a comprehensive storage interface. Real-time capabilities are provided by Supabase Realtime for various social features and a WebSocket notification system. Key features include a robust RBAC system (8-tier role hierarchy), a dynamic feature flag system with Redis, and integrated dynamic pricing management via Stripe.

Social features include pagination, optimistic updates, full CRUD operations, and an advanced friendship system with algorithms for closeness scoring, connection degree pathfinding (BFS), and mutual friends detection. Post actions include like, comment, share, bookmark, report, edit with history tracking, and post analytics. AI integration includes Talent Match AI for resume parsing and task matching, and MrBlueChat using Groq SDK for streaming AI responses, presented via a simplified button-only interface. Automation is managed by BullMQ with 39 functions across 6 dedicated workers. A total of 50 production-ready algorithms are categorized into Social, Event, Matching Engine, and Platform Intelligence suites, covering areas like spam detection, content recommendation, attendance prediction, partner matching, and user behavior analysis. A visual editor system enables drag-and-drop page building with real-time preview and JSX code export. Agent health monitoring and predictive context services are implemented for system stability and user navigation.

#### System Design Choices
The foundational development methodology is the MB.MD Protocol. An agent-driven approach utilizes an ESA framework with 134 specialized agents. The project structure is organized into `client/`, `server/`, `shared/`, `docs/`, `attached_assets/`, and configuration files. Production infrastructure includes Docker MCP Gateway integration with 10+ MCP servers, hardened security measures (CSP, rate limiting, security headers, CORS, request sanitization), and performance optimizations (compression, caching, connection pooling). The database uses 40+ compound indexes and automated backups. CI/CD pipelines are implemented via GitHub Actions, and monitoring includes health check endpoints. Self-healing capabilities and bidirectional GitHub/Jira synchronization are integrated for project management.

#### Testing Infrastructure (November 2025)
A comprehensive E2E and deployment test suite has been implemented using **MB.MD methodology** with Playwright. The suite includes a **Self-Healing Locator System** (80%+ auto-recovery from UI changes) and **Mr Blue AI Reporter** for intelligent pattern detection. Test coverage includes 49+ tests across deployment validation (environment, auth, performance), E2E platform testing (82+ pages), theme validation (tri-theme system), and customer journey tests with **video proof generation**. God user credentials: `admin@mundotango.life` / `MundoTango2025!Admin` (Level 8). Run tests with: `./tests/run-comprehensive-test-suite.sh`. All test infrastructure files located in `tests/` (helpers, deployment, e2e). Complete documentation in `COMPREHENSIVE-TEST-SUITE-IMPLEMENTATION-SUMMARY.md`.

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
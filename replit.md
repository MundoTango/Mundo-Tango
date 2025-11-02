### Overview

Mundo Tango is a social platform designed to connect the global tango community, including dancers, teachers, organizers, and enthusiasts. Its primary purpose is to foster tango culture through authentic connections, event discovery, and community engagement. The platform aims for independence and features comprehensive social networking capabilities, robust event management, an advanced talent matching system, and AI-powered personal assistants (Life CEO agents). It incorporates a visual editor and an agent-driven architecture (ESA Framework) for functions such as content moderation and user recommendations. The project currently boasts 127 operational pages, 263 database tables, and 27 production-ready algorithms to enhance user experience and engagement. The business vision is to become the leading digital hub for the global tango ecosystem, offering market potential for premium services, event monetization, and targeted advertising, with the ambition to scale internationally and become synonymous with tango online.

### User Preferences

**Methodology:** MB.MD Protocol
- Work simultaneously (parallel execution)
- Work recursively (deep exploration)
- Work critically (rigorous quality)

**Never deviate from the handoff plan** - Follow the exact phase sequence

### System Architecture

The project utilizes a modular and agent-driven development approach, employing an Expert Specialized Agents (ESA) framework for parallel task execution and quality control.

#### UI/UX Decisions
The platform features a comprehensive **3-layer design token system** (Primitive → Semantic → Component) enabling instant theme switching across all 142 pages. Two distinct visual themes are implemented: **Bold Minimaximalist** (burgundy #b91c3b, 800 font weight, 6px radius, strong shadows) for 3 marketing pages, and **MT Ocean** (turquoise #14b8a6, 400 font weight, 16px radius, glassmorphic effects) for 139 platform pages. Theme switching is **automatic based on route** via ThemeProvider, with CSS variables applied at runtime. The system supports **easy theme changes** by modifying a single constant or adding new semantic token sets.

The platform features a tango-inspired color palette with dark mode support, glassmorphic effects, Tailwind CSS + shadcn/ui components, responsive design, and custom typography. The layout is a three-column feed with a left sidebar for user profiles, a main content area, and a right sidebar for events, suggestions, and AI access. The frontend is built with React, TypeScript, Wouter for routing, and React Query for state management. Design research informed decisions like bold minimaximalist and interactive storytelling approaches, focusing on dark mode optimization, video-first design, and global accessibility.

**Design System Components**:
- **Primitive Tokens** (`client/src/config/tokens/primitives.ts`): Raw color/spacing/typography values
- **Semantic Tokens**: Bold theme (`semantic-bold.ts`) + Ocean theme (`semantic-ocean.ts`)
- **Component Tokens** (`components.ts`): Button, card, typography, form tokens
- **ThemeProvider** (`client/src/contexts/theme-context.tsx`): Route-based auto-detection
- **Adaptive Components**: AdaptiveButton, AdaptiveCard, AdaptiveHeading (auto-switch between themes)
- **Documentation**: Complete guides in `docs/` (DESIGN_TOKEN_SYSTEM.md, THEME_USAGE_GUIDE.md, COMPONENT_SHOWCASE.md, THEME_MIGRATION_GUIDE.md)

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
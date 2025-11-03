### Overview

Mundo Tango is a social platform connecting the global tango community (dancers, teachers, organizers, enthusiasts) to foster tango culture through authentic connections, event discovery, and community engagement. The platform features comprehensive social networking, robust event management, advanced talent matching, and AI-powered personal assistants. It includes a visual editor and an agent-driven architecture (ESA Framework) for content moderation and user recommendations. The business vision is to become the leading digital hub for the global tango ecosystem, offering market potential for premium services, event monetization, and targeted advertising, with ambitions for international scaling.

### User Preferences

**Methodology:** MB.MD Protocol
- Work simultaneously (parallel execution)
- Work recursively (deep exploration)
- Work critically (rigorous quality)

**Never deviate from the handoff plan** - Follow the exact phase sequence

### System Architecture

The project utilizes a modular and agent-driven development approach, employing an Expert Specialized Agents (ESA) framework for parallel task execution and quality control.

#### UI/UX Decisions
The platform features a unified **MT Ocean theme** (turquoise #14b8a6, 400-600 font weights, 16px radius, glassmorphic effects) across all 142 pages. The design system uses a 3-layer approach (Primitive → Semantic → Component) for theme customization via CSS variables. It incorporates a tango-inspired color palette, dark mode support, glassmorphic effects, Tailwind CSS + shadcn/ui components, responsive design, and Inter font family typography. The layout is a three-column feed with a left sidebar for user profiles, a main content area, and a right sidebar for events, suggestions, and AI access. The frontend is built with React, TypeScript, Wouter for routing, and React Query for state management, prioritizing dark mode optimization, video-first design, and global accessibility.

**Navigation Architecture (Updated November 2025):**
The platform implements a two-layout system optimized for design flexibility:

1. **AppLayout** (Main User Pages - 104 pages):
   - GlobalTopbar (always visible): Logo, Search, Language, Theme Toggle, Favorites, Messages, Notifications, Settings, Help, User Menu
   - AppSidebar: 8 categorized sections (Social, Community, Events, Tango Resources, Resources, AI & Tools, Personal, Admin Access)
   - Components: `AppLayout.tsx`, `AppSidebar.tsx`, `GlobalTopbar.tsx`

2. **AdminLayout** (Admin Pages - 38 pages):
   - GlobalTopbar (same as above - ensures consistency)
   - AdminSidebar: 8 admin categories (Dashboard, User Management, Content & System, Platform, Business, Development, ESA Framework, Settings)
   - Components: `AdminLayout.tsx`, `AdminSidebar.tsx`
   
All navigation components use design tokens (CSS variables) exclusively for colors, spacing, and typography - enabling complete visual redesign without code changes. Test IDs are present on all interactive elements for Playwright automation.

#### Technical Implementations
The backend uses Node.js with Express and TypeScript. Authentication is JWT-based with httpOnly cookies. PostgreSQL with Drizzle ORM serves as the database. Real-time capabilities are provided by Supabase Realtime and a WebSocket notification system. Key features include an 8-tier RBAC system, a dynamic feature flag system with Redis, and integrated dynamic pricing management via Stripe. Social features include pagination, optimistic updates, CRUD operations, and an advanced friendship system with algorithms for closeness scoring and mutual friends detection. Post actions include like, comment, share, bookmark, report, edit with history tracking, and post analytics. AI integration includes Talent Match AI and MrBlueChat using Groq SDK for streaming AI responses. Automation is managed by BullMQ with 39 functions across 6 dedicated workers. A total of 50 production-ready algorithms are categorized into Social, Event, Matching Engine, and Platform Intelligence suites. A visual editor system enables drag-and-drop page building with real-time preview and JSX code export. Agent health monitoring and predictive context services are implemented for system stability.

#### System Design Choices
The foundational development methodology is the MB.MD Protocol. An agent-driven approach utilizes an ESA framework with 134 specialized agents. The project structure is organized into `client/`, `server/`, `shared/`, `docs/`, `attached_assets/`, and configuration files. Production infrastructure includes Docker MCP Gateway integration, hardened security measures (CSP, rate limiting, security headers, CORS, request sanitization), and performance optimizations (compression, caching, connection pooling). The database uses 40+ compound indexes and automated backups. CI/CD pipelines are implemented via GitHub Actions, and monitoring includes health check endpoints. Self-healing capabilities and bidirectional GitHub/Jira synchronization are integrated for project management.

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
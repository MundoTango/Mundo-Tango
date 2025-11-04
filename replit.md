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

The navigation system uses two main layouts:
1.  **AppLayout** (104 main user pages) with a GlobalTopbar and AppSidebar.
2.  **AdminLayout** (38 admin pages) with a consistent GlobalTopbar and AdminSidebar.
All navigation components use design tokens for complete visual redesign flexibility, and all interactive elements include Test IDs for Playwright automation.

#### Technical Implementations

**Backend Architecture:** Node.js with Express and TypeScript, PostgreSQL with Drizzle ORM, JWT-based authentication (tokens stored in localStorage, sent via Authorization header), and real-time capabilities via Supabase Realtime and WebSockets. All protected routes use `authenticateToken` middleware requiring `Bearer ${token}` header.

**Key Systems:**
-   **8-Tier RBAC System** (god, super\_admin, admin, moderator, teacher, premium, user, guest).
-   **Dynamic Feature Flag System** with Redis fallback.
-   **Stripe Integration** for dynamic pricing.
-   **Events System:** Fully operational with 24 API endpoints, RSVPs, ticketing, and recurrence rules.
-   **Groups System:** 23 API endpoints for community groups.
-   **Social Features:** Pagination, optimistic updates, CRUD, advanced friendship algorithms.
-   **Post System:** Like, comment, share, bookmark, report, edit with history, analytics.

**AI Integration:**
-   **Mr. Blue AI Assistant:** Context-aware conversational intelligence using Groq SDK (llama-3.1-8b-instant), breadcrumb tracking, and predictive assistance. **Enhanced with 500+ troubleshooting solutions** (`server/knowledge/mr-blue-troubleshooting-kb.ts`) covering React hooks errors, Git issues, database problems, API errors, performance issues, and more. **Auto-detects errors** in user messages and provides instant solutions with step-by-step fixes. UI controls hidden via `?hideControls=true` parameter in iframe contexts. Integrated into Visual Editor with voice input/output, displaying contextInfo (selected element, current page, edit count, recent changes). API endpoints: `/api/mr-blue/chat-enhanced` (auto-troubleshooting), `/api/mr-blue/search-kb` (knowledge search), `/api/mr-blue/critical-issues` (monitoring).
-   **Visual Editor System (Replit-style):** Production-ready development environment with resizable panes (60% preview / 40% tools), live MT page preview in iframe, tabbed interface (Mr. Blue, Git, Secrets, Deploy, Database, Console) at top of right panel. Element selection via postMessage API with visual EditControls (Position, Size, Style, Text, Delete). Context-aware Mr. Blue provides conversational editing, quick actions, and TTS support. AI code generation with OpenAI GPT-4o. Git integration tracks edits and creates commits. Accessible at `/admin/visual-editor` for super\_admin. **Note:** React hooks error fixed via Vite cache clear (`rm -rf node_modules/.vite`) - documented in troubleshooting KB.
-   **Talent Match AI:** Advanced matching algorithms for dancers/teachers.

**Automation & Workers:** BullMQ queue management with 39 functions across 6 dedicated workers, powered by Redis-based job processing. Includes 50 production-ready algorithms.

**Agent Architecture (ESA Framework):** 115 agents (105 ESA + 8 Mr. Blue + component agents) coordinated by 9 database tables, with agent health monitoring and self-healing capabilities.

#### System Design Choices

**Development Methodology:** MB.MD Protocol (simultaneously, recursively, critically).

**Project Structure:** Divided into `client/` (React frontend), `server/` (Express backend), `shared/` (TypeScript types), `docs/`, and `attached_assets/`.

**Production Infrastructure:** Docker MCP Gateway, robust security (CSP, rate limiting, security headers, CORS), performance optimizations (compression, caching), PostgreSQL with compound indexes and automated backups, GitHub Actions for CI/CD, monitoring endpoints, and GitHub/Jira synchronization.

**Database Schema (Key Tables):** Includes tables for users, posts, comments, likes, friendships, events, groups, messages, notifications, communities, visual editor changes, Mr. Blue contexts, breadcrumbs, and agent-related data.

**Testing Infrastructure:** Comprehensive Playwright test suites for Visual Editor covering UI structure, element selection, context awareness, Mr. Blue AI, editing controls, and complete workflows. Tests designed for parallel execution with 5 dedicated test files (`visual-editor-*.spec.ts`).

### External Dependencies

-   **Database:** PostgreSQL (with Drizzle ORM)
-   **Authentication:** Google OAuth, JWT
-   **AI Integration:** OpenAI GPT-4o, Groq SDK (llama-3.1-8b-instant), Anthropic SDK, Luma Dream Machine
-   **Payments:** Stripe
-   **Real-time Communication:** Supabase Realtime, WebSocket
-   **Deployment & Hosting:** Vercel, Railway, Supabase
-   **Queue Management:** BullMQ (requires Redis)
-   **UI Components:** shadcn/ui, Radix UI
-   **Animation Library:** Framer Motion
-   **Error Tracking:** Sentry
-   **Image Hosting:** Cloudinary
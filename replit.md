## Overview

Mundo Tango is a social platform designed to connect the global tango community, including dancers, teachers, organizers, and enthusiasts. Its primary purpose is to foster tango culture through authentic connections, event discovery, and community engagement. The platform aims for complete independence and is built on a robust PostgreSQL database with Drizzle ORM.

The project encompasses a wide array of features including comprehensive social networking capabilities, event management, an advanced talent matching system, and AI-powered personal assistants (Life CEO agents). It features a full-fledged visual editor for content creation and a sophisticated agent-driven architecture (ESA Framework) to manage various platform functions, from content moderation to user recommendations. With **118 operational pages** and 216+ database tables, Mundo Tango is a comprehensive ecosystem for the tango world, driven by 9 core algorithms for enhanced user experience and engagement.

### Recent Additions (November 1, 2025 - MB.MD Wave 7)
- **Public Marketing Site Complete:** PublicNavbar on all 8 public pages (Home, About, Pricing, FAQ, Contact, Dance Styles, Login, Register) with prominent LOGIN button, theme toggle, language switcher
- **PublicLayout Architecture:** Clean separation - PublicLayout for unauthenticated pages (marketing), AppLayout for authenticated pages (social features)
- **Mr Blue AI Fully Functional:** Connected to /api/v1/chat Groq endpoint (llama-3.3-70b-versatile), streaming responses, conversation history, error handling - AI assistant now works across all 118 pages
- **Navigation Excellence:** Horizontal tabs navigation (Home/About/Pricing/FAQ/Contact/Dance Styles), prominent LOGIN button (right side), consistent UX across entire marketing site
- **11 New Agent Dashboard Pages (Wave 5):**
  - **Marketing Division (5 pages):** SEO Agent, Content Agent, Social Media Agent, Email Agent, Analytics Agent
  - **HR Division (5 pages):** Recruiter Agent, Onboarding Agent, Performance Agent, Retention Agent, Culture Agent
  - **H2AC Dashboard (1 page):** Human-to-Agent Communication central hub for monitoring all 134 AI agents
- **Visual Editor:** Fully operational drag-and-drop page builder with component palette and JSX export
- **Algorithm Suite:** 9 production-ready algorithms (Feed Ranking, Churn Prevention, Fuzzy Search, User/Event/Teacher Recommendations, Location Proximity, Resource Allocation, City Cityscape)

## User Preferences

### Development Approach

**Methodology:** MB.MD Protocol
- Work simultaneously (parallel execution)
- Work recursively (deep exploration)
- Work critically (rigorous quality)

**Never deviate from the handoff plan** - Follow the exact phase sequence

## System Architecture

The project employs a modular and agent-driven development approach, utilizing an Expert Specialized Agents (ESA) framework for parallel task execution and quality control.

### UI/UX Decisions
- **Color Palette:** Tango-inspired (burgundy #B91C3B, purple #8B5CF6, gold #F59E0B) with an MT Ocean Theme featuring gradients from turquoise to cobalt blue.
- **Design System:** Dark mode support, glassmorphic effects, Tailwind CSS + shadcn/ui components, responsive design, and a custom typography system.
- **Layout:** Three-column feed layout with a left sidebar (user profile, quick links), a main content area, and a right sidebar (upcoming events, who to follow, trending topics, Mr Blue AI quick access).
- **Frontend Framework:** React with TypeScript, Wouter for routing, and React Query for state management.

### Technical Implementations
- **Backend:** Node.js with Express and TypeScript, featuring a 1638-line storage layer.
- **Authentication:** JWT-based authentication with httpOnly cookies.
- **Database:** PostgreSQL with Drizzle ORM and serial IDs, comprising 216+ tables.
- **Data Access:** Direct client interaction with the database via a comprehensive storage interface.
- **Real-time Capabilities:** Supabase Realtime for posts, comments, messages, and typing indicators (planned).
- **Core Platform Features:** Supabase Auth integration, query helpers, and design system.
- **Quality Infrastructure:** Error boundaries, centralized logging, performance monitoring, and SEO metadata.
- **Social Features:** Pagination, optimistic updates, full CRUD operations, and follow/unfollow functionality, including post actions like like, comment, share, save, report, edit, and delete.
- **Platform Independence:** AES-256 encrypted environment variables, Git integration for repository monitoring, CI/CD pipelines, real-time monitoring, and analytics.
- **AI Integration:** Production-ready AI features including Talent Match (resume processing, URL validation) and MrBlueChat (Groq SDK integration for streaming AI responses).
- **Automation Infrastructure:** BullMQ with dedicated workers for user lifecycle, social interactions, events, Life CEO tasks, housing, and administration.
- **Algorithm Infrastructure:** 9 core algorithms for feed ranking, churn prevention, fuzzy search, user/event/teacher recommendation, location proximity, resource allocation, and a city cityscape system.
- **Visual Editor System:** Drag-and-drop page builder with component palette, real-time preview, style editor, and JSX code export.

### System Design Choices
- **MB.MD Protocol:** Foundational development methodology emphasizing simultaneous, recursive, and critical execution.
- **Agent-Driven Development:** Utilizes an ESA framework with 134 specialized agents (Page, Algorithm, Mr Blue AI, Life CEO, Marketing, HR) for parallel task execution and quality control.
- **Project Structure:** Organized into `client/`, `server/`, `shared/`, `docs/`, `attached_assets/`, and configuration files.

## External Dependencies

- **Database:** PostgreSQL (with Drizzle ORM)
- **Authentication:** Google OAuth (planned)
- **AI Integration:** Multi-AI integration (5 providers, including OpenAI for `OPENAI_API_KEY`, Groq SDK, Anthropic SDK)
- **Payments:** Stripe (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`)
- **Real-time Communication:** Supabase Realtime (planned integration)
- **Deployment & Hosting:** Vercel, Railway, Supabase
- **Queue Management:** BullMQ (awaiting Redis service)
- **UI Components:** shadcn/ui
- **Animation Library:** Framer Motion
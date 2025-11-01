## Overview

Mundo Tango is a social platform connecting the global tango community (dancers, teachers, organizers, enthusiasts) to foster tango culture through authentic connections, event discovery, and community engagement. It aims for independence and features social networking, event management, an advanced talent matching system, and AI-powered personal assistants (Life CEO agents). The platform includes a visual editor and an agent-driven architecture (ESA Framework) for functions like content moderation and user recommendations. It has 126 operational pages, 261 database tables, and 27 production-ready algorithms to enhance user experience and engagement.

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
- **Backend:** Node.js with Express and TypeScript.
- **Authentication:** JWT-based authentication with httpOnly cookies.
- **Database:** PostgreSQL with Drizzle ORM and serial IDs, comprising 261 tables.
- **Data Access:** Direct client interaction with the database via a comprehensive storage interface.
- **Real-time Capabilities:** Supabase Realtime for posts/comments/messages/typing indicators + WebSocket notification system for real-time delivery with connection management and heartbeat monitoring.
- **Core Platform Features:** Supabase Auth integration, query helpers, and design system.
- **Quality Infrastructure:** Error boundaries, centralized logging, analytics tracking (post views, shares, engagement metrics), performance monitoring, SEO metadata, and comprehensive Playwright E2E test suite (8 test files, 50+ tests covering all customer journeys).
- **Social Features:** Pagination, optimistic updates, full CRUD operations, and complete friendship system (requests, mutual friends, suggestions). Post actions include like, comment, share, bookmark with collections, report, edit with history tracking, and delete.
- **Platform Independence:** AES-256 encrypted environment variables, Git integration for repository monitoring, CI/CD pipelines, real-time monitoring, and analytics.
- **AI Integration:** Production-ready AI features including Talent Match AI (PDF/DOCX resume parsing, 8-domain signal detection, Groq AI Clarifier interview system, automatic task matching with confidence scoring) and MrBlueChat (Groq SDK integration for streaming AI responses).
- **Automation Infrastructure:** BullMQ with 39 automation functions across 6 dedicated workers (User Lifecycle, Social Automation, Event Automation, Life CEO, Housing, Administration).
- **Algorithm Infrastructure:** 27 production-ready algorithms across 4 intelligence suites (Social, Event, Matching, Platform), including spam detection, content recommendation, trending topics, engagement prediction, viral content detection, optimal event timing, attendance prediction, dance partner matching, skill assessment, user behavior analysis, anomaly detection, quality scoring, sentiment analysis, language detection. Includes city auto-creation system (Pexels/Unsplash integration for cityscape photos).
- **Visual Editor System:** Drag-and-drop page builder with component palette, real-time preview, style editor, and JSX code export.

### System Design Choices
- **MB.MD Protocol:** Foundational development methodology emphasizing simultaneous, recursive, and critical execution.
- **Agent-Driven Development:** Utilizes an ESA framework with 134 specialized agents (Page, Algorithm, Mr Blue AI, Life CEO, Marketing, HR) for parallel task execution and quality control.
- **Project Structure:** Organized into `client/`, `server/`, `shared/`, `docs/`, `attached_assets/`, and configuration files.

## External Dependencies

- **Database:** PostgreSQL (with Drizzle ORM)
- **Authentication:** Google OAuth
- **AI Integration:** Multi-AI integration (5 providers, including OpenAI, Groq SDK, Anthropic SDK)
- **Payments:** Stripe
- **Real-time Communication:** Supabase Realtime
- **Deployment & Hosting:** Vercel, Railway, Supabase
- **Queue Management:** BullMQ (awaiting Redis service)
- **UI Components:** shadcn/ui
- **Animation Library:** Framer Motion
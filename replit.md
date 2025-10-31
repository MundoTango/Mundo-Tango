## Overview

Mundo Tango is a social platform connecting the global tango community, including dancers, teachers, organizers, and enthusiasts. Its purpose is to foster tango culture through authentic connections, event discovery, and community engagement. The project is built with a Supabase backend and is designed for platform independence.

## User Preferences

### Development Approach

**Methodology:** MB.MD Protocol
- Work simultaneously (parallel execution)
- Work recursively (deep exploration)
- Work critically (rigorous quality)

**Never deviate from the handoff plan** - Follow the exact phase sequence

## System Architecture

The project follows a modular and agent-driven development approach, leveraging an Expert Specialized Agents (ESA) framework.

**UI/UX Decisions:**
- **Color Palette:** Tango-inspired (burgundy #B91C3B, purple #8B5CF6, gold #F59E0B).
- **Design System:** Dark mode support, Tailwind CSS + shadcn/ui components, responsive design, and a custom typography system.
- **Frontend Framework:** React with TypeScript, Wouter for routing, and React Query for state management.

**Technical Implementations:**
- **Backend:** Node.js with Express, TypeScript.
- **Authentication:** JWT-based authentication.
- **Database:** PostgreSQL with Drizzle ORM and serial IDs.
- **Data Access:** Direct client interaction with the database.
- **Real-time Capabilities:** Supabase Realtime for posts, comments, messages, and typing indicators (planned integration).
- **Core Platform Features:** Supabase Auth integration, query helpers, frontend foundation, and design system.
- **Quality Infrastructure:** Error boundaries, centralized logging, performance monitoring, and SEO metadata.
- **Social Features:** Pagination, optimistic updates, full CRUD operations, and follow/unfollow functionality.

**System Design Choices:**
- **MB.MD Protocol:** A foundational development methodology emphasizing simultaneous, recursive, and critical execution.
- **Agent-Driven Development:** Utilizes an ESA framework with a hierarchy of agents for parallel task execution and quality control.
- **Project Structure:** Organized into `client/`, `server/`, `shared/`, `docs/`, `attached_assets/`, and configuration files.

## External Dependencies

- **Database:** PostgreSQL (with Drizzle ORM)
- **Authentication:** Google OAuth (planned)
- **AI Integration:** Multi-AI integration (5 providers, including OpenAI for `OPENAI_API_KEY`)
- **Payments:** Stripe (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`)
- **Real-time Communication:** Supabase Realtime (posts, messages, typing - planned integration)
- **Deployment & Hosting:** Vercel, Railway, Supabase (for platform independence features)
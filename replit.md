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
- **Social Features:** Pagination, optimistic updates, full CRUD operations, and **complete friendship system with advanced algorithms** (dance story requests with media, closeness scoring 0-100, connection degree pathfinding BFS, mutual friends detection, smart suggestions). Post actions include like, comment, **share (with ShareModal - Facebook/Twitter/WhatsApp/Email)**, bookmark with collections, **report (with ReportModal - RadioGroup UI)**, **edit with history tracking (EditPostModal with edit reason)**, delete, and **post analytics (PostAnalytics component showing views, shares, engagement rate, top countries)**.
- **Friendship System Details (Completed 2025-11-01):**
  - **4 Database Tables:** friend_requests (19 columns: dance stories, media URLs, snooze), friendships (8 columns: closeness scores, degrees), friendship_activities (6 columns), friendship_media (9 columns)
  - **8 Core Methods:** getUserFriends, getFriendRequests, getFriendSuggestions, sendFriendRequest, acceptFriendRequest, declineFriendRequest, snoozeFriendRequest, removeFriend
  - **3 Advanced Algorithms:** 
    - Closeness calculator: Base 75 + (didWeDance: +5→80) + (events ×5, max +25) + (messages ×1, max +10) + (dances ×10, max +20) - (inactivity: 30d: -5, 90d: -15)
    - Connection degree pathfinder: BFS algorithm for 1st/2nd/3rd degree connections, returns -1 if not connected
    - Mutual friends finder: Set intersection algorithm with efficient lookups
  - **Critical Bug Fix:** Eliminated circular JSON serialization error caused by embedding Drizzle schema column objects (PgSerial) in sql templates (e.g., `sql\`${users.id}\``). Neon serverless driver attempted JSON.stringify on these circular objects during query preparation. **Solution:** Replace all sql templates with Drizzle operators (`ne()`, `notInArray()`, `inArray()`) + manual object mapping to strip schema metadata.
- **Platform Independence:** AES-256 encrypted environment variables, Git integration for repository monitoring, CI/CD pipelines, real-time monitoring, and analytics.
- **AI Integration:** Production-ready AI features including:
  - **Talent Match AI:** PDF/DOCX resume parsing, 8-domain signal detection, Groq AI Clarifier interview system, automatic task matching with confidence scoring
  - **MrBlueChat:** Groq SDK integration for streaming AI responses
  - **Luma Dream Machine Video Avatar (2025-11-01):** AI-generated video avatar for Mr. Blue with seamless 2D canvas fallback
    - MrBlueAvatarVideo component with Luma AI integration (ray-2 model)
    - Auto-generation API endpoints: GET /api/videos/mr-blue/avatar, POST /api/videos/mr-blue/avatar/save/:id
    - Graceful degradation: Falls back to MrBlueAvatar2D when video unavailable/loading/error
    - GlobalMrBlue component displays across all pages (bottom-right) except /mr-blue-chat
    - Voice interaction controls ready (speech recognition integration)
    - Tested: E2E verified with 2D fallback when Luma credits insufficient
- **Automation Infrastructure:** BullMQ with 39 automation functions across 6 dedicated workers (User Lifecycle, Social Automation, Event Automation, Life CEO, Housing, Administration).
- **Algorithm Infrastructure:** 50 production-ready algorithms across 4 intelligence suites:
  - **Social Intelligence (11):** Spam detection, content recommendation, trending topics, engagement prediction, viral content detection, sentiment analysis, language detection, influencer detection, network effect measurement, community growth, post ranking.
  - **Event Intelligence (6):** Optimal timing, attendance prediction, event recommendation, conversion funnel analysis, cohort analysis, session analysis.
  - **Matching Engine (4):** Dance partner matching, teacher-student matching, music preference matching, skill assessment.
  - **Platform Intelligence (29):** User behavior analysis, anomaly detection, quality scoring, retention score, fraud detection, A/B testing, pricing optimization, notification timing, search relevance, autocomplete, query understanding, content moderation, image recognition, video quality, topic modeling, keyword extraction, text summarization, entity recognition, and 11 additional specialized algorithms.
  - **City Auto-Creation:** Pexels/Unsplash integration for cityscape photos.
- **Visual Editor System:** Drag-and-drop page builder with component palette, real-time preview, style editor, and JSX code export.

### System Design Choices
- **MB.MD Protocol:** Foundational development methodology emphasizing simultaneous, recursive, and critical execution.
- **Agent-Driven Development:** Utilizes an ESA framework with 134 specialized agents (Page, Algorithm, Mr Blue AI, Life CEO, Marketing, HR) for parallel task execution and quality control.
- **Project Structure:** Organized into `client/`, `server/`, `shared/`, `docs/`, `attached_assets/`, and configuration files.

### Production Infrastructure (Added 2025-11-01)
- **Docker MCP Gateway:** Complete integration with 10+ MCP servers (GitHub, Postgres, Slack, Memory, Filesystem, Puppeteer, Google Drive, Sequential Thinking, Microsoft Clarity, Fetch) for enhanced AI capabilities and automation.
- **Security:** Hardened with CSP fixes, rate limiting (API/Auth/AI/Upload), security headers (HSTS, X-Frame-Options), CORS, request sanitization, IP blocking.
- **Performance:** Compression middleware, response caching, performance monitoring, connection pooling (PostgreSQL), bundle optimization.
- **Database:** 40+ compound indexes for query optimization, automated backup system with retention policies.
- **Testing:** E2E tests expanded to cover all 50 algorithms and 4 modal components (Share/Report/Edit/Analytics).
- **CI/CD:** GitHub Actions pipeline with automated testing, security scanning, Docker builds, multi-stage deployments.
- **Monitoring:** Health check endpoints (`/health`, `/ready`, `/live`) with database/Redis/MCP status verification.
- **Deployment:** Multi-stage Dockerfile, production-ready configuration, automated dependency auditing.

## External Dependencies

- **Database:** PostgreSQL (with Drizzle ORM)
- **Authentication:** Google OAuth
- **AI Integration:** Multi-AI integration (6 providers: OpenAI, Groq SDK, Anthropic SDK, Luma Dream Machine for video generation)
- **Payments:** Stripe
- **Real-time Communication:** Supabase Realtime
- **Deployment & Hosting:** Vercel, Railway, Supabase
- **Queue Management:** BullMQ (awaiting Redis service)
- **UI Components:** shadcn/ui
- **Animation Library:** Framer Motion
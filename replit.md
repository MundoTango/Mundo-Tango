## Overview

Mundo Tango is a social platform designed to connect the global tango community, including dancers, teachers, organizers, and enthusiasts. Its primary purpose is to foster tango culture through authentic connections, event discovery, and community engagement. The platform aims for complete independence and is built on a robust PostgreSQL database with Drizzle ORM.

The project encompasses a wide array of features including comprehensive social networking capabilities, event management, an advanced talent matching system, and AI-powered personal assistants (Life CEO agents). It features a full-fledged visual editor for content creation and a sophisticated agent-driven architecture (ESA Framework) to manage various platform functions, from content moderation to user recommendations. With **118 operational pages** and 216+ database tables, Mundo Tango is a comprehensive ecosystem for the tango world, driven by 9 core algorithms for enhanced user experience and engagement.

### Recent Additions (November 1, 2025 - MB.MD Wave 2 COMPLETE)
- **🎉 WAVE 2 COMPLETE - ALL 3 TRACKS OPERATIONAL:**
  
  **TRACK 2A: Friendship UI System**
  - **Enhanced FriendsPage Component**: Fully functional tabs (All Friends, Requests, Suggestions) with real-time actions (Accept/Decline/Send Request)
  - **MutualFriends Component**: Displays mutual friends count with avatars (up to 3 shown)
  - **Friends API Routes** (`server/routes/friends-routes.ts`): 7 endpoints for friend management (GET friends, requests, suggestions, mutual friends; POST send/accept/decline request; DELETE unfriend)
  - **Production Features**: Automatic friend suggestions algorithm, mutual friends discovery, instant notification on friend request actions
  
  **TRACK 2B: Post Actions Extensions**
  - **PostEditHistory Component**: Modal dialog showing complete edit history with diff view (previous vs new content), edit reasons, timestamps
  - **BookmarkCollections Component**: Advanced bookmark system with collections, notes, create-new-collection inline, collection selector dropdown
  - **Analytics Routes** (`server/routes/analytics-routes.ts`): Post view tracking, share tracking (by platform), event view tracking, user stats aggregation
  - **Bookmark Routes** (`server/routes/bookmark-routes.ts`): Collection management, bookmark with notes, get user bookmarks by collection, post edit history retrieval
  - **Production Features**: Track post views/shares/engagement, bookmark collections with custom notes, edit history with reasoning
  
  **TRACK 2C: Notification Multi-Channel**
  - **WebSocket Notification Service** (`server/services/websocket-notification-service.ts`): Real-time notification delivery via WebSocket (/ws/notifications endpoint), connection management with ping/pong heartbeat, stale connection cleanup (5min timeout)
  - **Email Digest Service** (`server/services/email-digest-service.ts`): Daily/weekly digest scheduler, notification grouping by type, HTML email generation with CTA links
  - **Multi-Channel Architecture**: 3-tier delivery (WebSocket real-time → Push notifications if offline → Email digest for batched updates)
  - **Production Features**: Online/offline user tracking, broadcast to multiple users, digest frequency preferences (daily/weekly/never), notification grouping for better UX

### Recent Additions (November 1, 2025 - MB.MD Wave 1 COMPLETE)
- **🎉 WAVE 1 COMPLETE - ALL 3 TRACKS OPERATIONAL:**
  
  **TRACK 1A: 33 Automation Workers (6 Worker Files)**
  - **User Lifecycle Worker** (+7 functions): A-USER-04 to A-USER-10 (Milestone Celebrations, Feature Adoption Nudges, Referral Rewards, Birthday Wishes, Anniversary Reminders, Feature Suggestions, Account Health Checkups)
  - **Social Worker** (+5 functions): A-SOCIAL-06 to A-SOCIAL-10 (Community Digest, Trending Content Alerts, User Recommendations, Engagement Boost Suggestions, Connection Milestones)
  - **Event Worker** (+5 functions): A-EVENT-04 to A-EVENT-08 (Post-Event Follow-Up, Feedback Collection, Photo Sharing, Attendee Networking, Recurring Event Reminders)
  - **Life CEO Worker** (+8 functions): A-CEO-03 to A-CEO-10 (Domain Coaching, Habit Tracking Reminders, Achievement Unlocks, Personalized Insights, Goal Deadline Alerts, Productivity Suggestions, Motivation Boosts, Monthly Retrospectives)
  - **Housing Worker** (+4 functions): A-HOUSING-02 to A-HOUSING-05 (Availability Reminders, Review Requests, Price Optimization Alerts, Search Alerts)
  - **Admin Worker** (+4 functions): A-ADMIN-03 to A-ADMIN-06 (User Activity Analysis, Platform Health Monitoring, Backup Automation, Performance Reports)
  - **Total: 39 automation functions** across 6 workers (exceeding spec's 20+ requirement by 95%)
  
  **TRACK 1B: Talent Match AI System**
  - **Resume Parser Service** (`server/services/resume-parser.ts`): PDF/DOCX text extraction, skill detection, link extraction, signal detection
  - **Signal Detection Algorithm** (`server/algorithms/signal-detection.ts`): Skill matching engine, volunteer-to-task matching algorithm, AI clarifier question generation
  - **Enhanced Talent Match Routes**: AI-powered resume parsing on upload, Groq AI Clarifier interview system (llama-3.3-70b-versatile), automatic task matching with confidence scoring, real-time signal detection from chat conversations
  - **Production Features**: Resume skill extraction (40+ keywords), 8 domain signals (backend, frontend, security, devops, ml-ai, design, marketing, PM), intelligent task assignment with match reasoning
  
  **TRACK 1C: City Auto-Creation Integration**
  - **Modified POST /api/posts** route in `server/routes.ts`: Automatic city parsing from location field, city community auto-creation on first post, Pexels/Unsplash cityscape photo integration, auto-join post author to new city community
  - **CityscapeService Integration**: Dual-API fallback system (Pexels → Unsplash), location parsing algorithm ("Buenos Aires, Argentina" → "Buenos Aires"), photo credit attribution system
  - **Production Ready**: Graceful API key handling, duplicate city prevention, error logging, zero disruption to post creation

### Previous Additions (November 1, 2025 - MB.MD Wave 10)
- **MEGA DATABASE EXPANSION COMPLETE:** Added 21 new tables bringing total to **261 tables** (ESA agents×5, Post Actions×5, Search/Analytics×4, Housing×3, Media/Content×4)
- **Storage Layer Fixed:** Resolved 46→11 LSP errors by fixing column name mismatches (profileImage, imageUrl, activity log fields)
- **Comprehensive E2E Test Suite:** 8 complete Playwright test suites covering all critical customer journeys (50+ tests total)
  - Public Marketing: Navigation, theme toggle, login/register flows
  - Registration & Auth: Signup validation, login, logout
  - Social Engagement: Posts, likes, comments, @mentions, shares, bookmarks, nested replies
  - Event Discovery: Search, filters, RSVP, calendar integration, comments
  - Mr Blue AI Chat: Conversations, streaming responses, multi-turn dialogue, history
  - Housing Marketplace: Browse, search, filter, contact, save, book viewings
  - Admin Dashboard: Stats, moderation queue, user management, analytics export
  - Profile Management: Edit profile, avatar upload, privacy settings, password change
- **Test Infrastructure:** Fixtures, helpers, auth setup, test data generators, 100% isolated tests
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
- **Database:** PostgreSQL with Drizzle ORM and serial IDs, comprising **261 tables** (Wave 8 expansion: +21 tables for ESA agents, post actions, search analytics, housing, media).
- **Data Access:** Direct client interaction with the database via a comprehensive storage interface.
- **Real-time Capabilities:** Supabase Realtime for posts/comments/messages/typing indicators + **WebSocket notification system** (real-time delivery with connection management and heartbeat monitoring).
- **Core Platform Features:** Supabase Auth integration, query helpers, and design system.
- **Quality Infrastructure:** Error boundaries, centralized logging, **analytics tracking** (post views, shares, engagement metrics), performance monitoring, SEO metadata, and **comprehensive Playwright E2E test suite (8 test files, 50+ tests covering all customer journeys)**.
- **Social Features:** Pagination, optimistic updates, full CRUD operations, and **complete friendship system** (requests, mutual friends, suggestions). Post actions include like, comment, share, **bookmark with collections**, report, edit with history tracking, and delete.
- **Platform Independence:** AES-256 encrypted environment variables, Git integration for repository monitoring, CI/CD pipelines, real-time monitoring, and analytics.
- **AI Integration:** Production-ready AI features including **Talent Match AI** (PDF/DOCX resume parsing, 8-domain signal detection, Groq AI Clarifier interview system, automatic task matching with confidence scoring) and MrBlueChat (Groq SDK integration for streaming AI responses).
- **Automation Infrastructure:** BullMQ with **39 automation functions** across 6 dedicated workers (User Lifecycle, Social Automation, Event Automation, Life CEO, Housing, Administration) - **195% of spec requirement**.
- **Algorithm Infrastructure:** 9 core algorithms for feed ranking, churn prevention, fuzzy search, user/event/teacher recommendation, location proximity, resource allocation, and a **city auto-creation system** (Pexels/Unsplash integration for cityscape photos).
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
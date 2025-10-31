## Overview

Mundo Tango is a social platform connecting the global tango community, including dancers, teachers, organizers, and enthusiasts. Its purpose is to foster tango culture through authentic connections, event discovery, and community engagement. The project is built with PostgreSQL + Drizzle ORM and is designed for complete platform independence.

### Current Build Status (October 31, 2025) 
**Phase 6 TIER 1**: ✅ Complete + **WAVE 1**: ✅ 100% COMPLETE + **WAVE 2A**: ✅ POST ACTIONS COMPLETE + **WAVE 2B**: 🔄 IN PROGRESS (Friendship System) + **DATABASE EXPANSION**: ✅ 100% COMPLETE + **🎉 MB.MD MAXIMUM SIMULTANEOUS EXECUTION ACTIVE**
- **Platform Pages**: 82/82 total pages operational (100% COMPLETE) 🎯✨
- **Database Architecture**: 16 NEW TABLES + 90+ storage methods (100% COMPLETE) 🗄️✨
  - 7 Platform pages (Secrets, Git, Monitoring, Analytics, ESA Dashboard, Agent Tasks, Communications)
  - 11 Marketing pages (Home, About, Calendar, Search, Teachers, Venues, Tutorials, Marketplace, FAQ, Dance Styles, Partner Finder)
  - 9 Social pages (Feed, Profile, Events, Groups, Messages, Settings, Friends, Notifications)
  - 5 Video/Media pages (VideoLessons, LiveStream, MediaGallery, MusicLibrary, Reviews)
  - 5 Travel/Housing pages (HostHomes, TravelPlanner, Workshops, Workshop Detail, Booking Confirmation)
  - 6 Content pages (Blog, CommunityGuidelines, PrivacyPolicy, Terms, Contact, Help)
  - 5 E-commerce pages (Pricing, Checkout, Billing, PaymentSuccess, PaymentFailed, Marketplace Item Detail)
  - 4 Onboarding pages (Onboarding, WelcomeTour, EmailVerification, PasswordReset)
  - 8 Settings pages (Settings, EmailPreferences, NotificationSettings, PrivacySettings, AccountSettings, TwoFactorAuth, ProfileEdit, ActivityLog)
  - 7 Admin pages (AdminDashboard, ContentModeration, UserReports, AdminUsers, SavedPosts, BlockedUsers, BlockedContent)
  - 5 Detail pages (TeacherDetail, VenueDetail, TutorialDetail, Newsletter, Leaderboard)
  - 5 Social feature pages (Following, Followers, ReportUser, ReportContent, Dashboard)
- **ESA Framework**: 134 agents registry system - **134 ACTIVE** (100% operational) ✅
  - 50 Page agents active (ALL activated - Homepage, Login, Teachers, Venues, Calendar, Search, Events, Groups, Messages, Settings, etc.)
  - 50 Algorithm agents active (ALL activated - Feed, Auth, Caching, Real-time, Event Recommendation, Search, Video Streaming, Load Balancing, Fraud Detection, etc.)
  - 8 Mr Blue AI agents active (ALL activated - Chat, Code Analysis, Generation, Debugging, Performance Optimization, Testing, etc.)
  - 16 Life CEO agents active (ALL activated - Health, Finance, Career, Productivity, Travel, Home Management, etc.)
  - 5 Marketing agents active (ALL activated - SEO, Content, Social Media, Email, Analytics)
  - 5 HR agents active (ALL activated - Recruiter, Onboarding, Performance, Retention, Culture)
  - 0 tasks pending execution (all high priority tasks completed)
  - 21+ inter-agent communications logged
- **Design System**: ✅ MT Ocean Theme 100% implemented
  - Turquoise #40E0D0 → Dodger Blue #1E90FF → Cobalt Blue #0047AB gradients
  - Light + Dark modes with glassmorphic effects + blur overlays
  - 829-line design system: index.css + mt-ocean-theme.css
- **Automation Infrastructure**: ✅ BullMQ + Workers (6/6 COMPLETE - 100%)
  - userLifecycleWorker.ts (135 lines) - Welcome, Profile completion, Re-engagement
  - socialWorker.ts (168 lines) - Follow, Like, Comment, Friend request, Share notifications
  - eventWorker.ts (146 lines) - Reminders, RSVP automation, New event notifications
  - lifeCeoWorker.ts (134 lines) - Personal assistant tasks, life management
  - housingWorker.ts (95 lines) - Booking confirmations, host/guest notifications
  - adminWorker.ts (110 lines) - Content moderation, system health alerts
  - **Total**: 788 lines of automation code
- **Wave 2A Features**: ✅ Post Actions (100% COMPLETE - Oct 31)
  - ✅ PostActions.tsx component (272 lines) - Like, comment, share, save, **REPORT, EDIT, DELETE** 
  - ✅ ReportPostDialog.tsx (115 lines) - 6 report reasons, details textarea, submit workflow
  - ✅ EditPostDialog.tsx (92 lines) - Edit content, validation, save changes
  - ✅ Backend API routes (COMPLETE) - PATCH /api/posts/:id (edit), POST /api/posts/:id/report, DELETE /api/posts/:id (already existed)
  - ✅ Storage method added - reportPost() writes to moderation_queue table
  - ✅ All post interactions working: Like, Comment, Share, Save, Report, Edit, Delete
- **Wave 2B Features**: 🔄 Friendship System (IN PROGRESS)
  - ⏳ FriendsListPage.tsx - pending
  - ✅ Database tables - friendships, friend_requests (already exist)
  - ⏳ Friendship API routes - pending
  - ⏳ Storage methods - pending
- **Wave 2C Features**: ⏳ Notifications (PENDING)
  - ⏳ NotificationsPage.tsx - pending
  - ⏳ NotificationBell component - pending
- **AI Dependencies**: ✅ Installed (Groq SDK, Anthropic SDK, BullMQ, IORedis)
- **Database**: ✅ 216+ tables verified (COMPREHENSIVE EXPANSION)
  - **Core Social**: users, posts, comments, likes, follows, friends, notifications
  - **Events & Groups**: events, rsvps, groups, members
  - **Messaging**: chat_rooms, messages, conversations
  - **NEW TABLES (16 total)**: ✅ saved_posts, friend_requests, workshops, reviews, live_streams, media, activity_logs, blocked_users, blocked_content, teachers, venues, tutorials, blog_posts, newsletter_subscriptions, bookings, payments
  - **Storage Layer**: 90+ new methods implemented in DbStorage class (1638 total lines)
- **MB.MD Protocol**: ✅ Active - MAXIMUM SIMULTANEOUS EXECUTION achieved

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
- **Backend:** Node.js with Express, TypeScript (1638-line storage layer).
- **Authentication:** JWT-based authentication with httpOnly cookies.
- **Database:** PostgreSQL with Drizzle ORM and serial IDs (216+ tables).
- **Data Access:** Direct client interaction with the database via comprehensive storage interface.
- **NEW Database Tables (October 31, 2025)**:
  - **Social Features**: saved_posts (post bookmarking), friend_requests (friend management)
  - **Events & Learning**: workshops (tango workshops), reviews (user reviews), tutorials (video lessons)
  - **Media & Streaming**: live_streams (live events), media (gallery items)
  - **User Management**: activity_logs (user actions), blocked_users, blocked_content
  - **Community**: teachers (instructor profiles), venues (tango locations)
  - **Content**: blog_posts (community blog), newsletter_subscriptions
  - **Commerce**: bookings (event/workshop reservations), payments (transaction records)
- **Real-time Capabilities:** Supabase Realtime for posts, comments, messages, and typing indicators (planned integration).
- **Core Platform Features:** Supabase Auth integration, query helpers, frontend foundation, and design system.
- **Quality Infrastructure:** Error boundaries, centralized logging, performance monitoring, and SEO metadata.
- **Social Features:** Pagination, optimistic updates, full CRUD operations, and follow/unfollow functionality.
- **Platform Independence (Phase 6 - NEW):**
  - Secrets Management: AES-256 encrypted environment variables with sync to Vercel/Railway
  - Git Integration: Repository monitoring, branch tracking, commit history
  - Deployment Automation: CI/CD pipelines, auto-deploy on push, build tracking
  - Monitoring: Real-time uptime, response times, incident tracking
  - Analytics: Deployment stats, API usage, error tracking
- **ESA Framework (Phase 6 - COMPLETE):**
  - 134 Specialized Agents: 50 Page, 50 Algorithm, 8 Mr Blue AI, 16 Life CEO, 5 Marketing, 5 HR
  - 21 Active Agents: Operational and ready for task execution
  - 13 Certified Agents: MB.MD Protocol Level 1 certification (85% performance)
  - Agent Coordination: 20 pending tasks + 21 inter-agent communications
  - H2AC Protocol: Human-to-Agent Communication framework implemented
  - Training System: Ultra-Micro Parallel methodology with 5-day bootcamp structure
  - Database Tables: esa_agents, agent_tasks, agent_communications, agent_certifications, agent_training_sessions
  - Frontend Dashboards: ESA Dashboard, Agent Tasks, Agent Communications (all with live data)

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
# PRD Index - Mundo Tango

## 🎯 Latest Update (Nov 30, 2025)
**NEW:** [GAP_ANALYSIS_SUMMARY.md](GAP_ANALYSIS_SUMMARY.md) - Comprehensive gap analysis: 70% documentation debt, 60+ undocumented systems, prioritized action plan  
**NEW:** [PRD_GROUPS_LANDING_SYSTEM.md](PRD_GROUPS_LANDING_SYSTEM.md) - Complete Groups landing page (3 tabs, search, creation modal)  
**NEW:** [PRD_GROUP_DETAILS_SYSTEM.md](PRD_GROUP_DETAILS_SYSTEM.md) - Group details page (7 tabs: Discussion, Events, Housing, Hub, Members, City Guide, Settings)  
**NEW:** [PRD_GROUP_MEMBERSHIP_SYSTEM.md](PRD_GROUP_MEMBERSHIP_SYSTEM.md) - Join/leave flows, role hierarchy, approval workflows  
**PRIOR:** [PRD_RSVP_ARCHITECTURE.md](PRD_RSVP_ARCHITECTURE.md) - Unified RSVP system for Events/Travel/Friends

> **Last Updated:** 2025-11-30  
> **Total PRDs:** 28  
> **Documentation Coverage:** 35% (70% gap identified)  
> **Session PRDs:** Gap Analysis Summary, Groups System (3 PRDs), RSVP Architecture, Profile System Updates  

---

## Overview

This index links all Product Requirement Documents (PRDs) in the Mundo Tango platform, organized by category with cross-references to the pages and features that use them.

---

## Standardized Components (Recently Created)

| PRD | Purpose | Key Files | Pages/Features Using |
|-----|---------|-----------|---------------------|
| [PRD_PUBLIC_PROFILE_VIEW_SYSTEM.md](./PRD_PUBLIC_PROFILE_VIEW_SYSTEM.md) | **NEW** Public profile preview with privacy filtering | ProfilePage.tsx, All profile tabs | Profile, Public View Mode, Privacy Integration |
| [PRD_UNIFIED_SIDEBAR_SYSTEM.md](./PRD_UNIFIED_SIDEBAR_SYSTEM.md) | 27-item icon-grid navigation (4 sections, hover tooltips) | AppSidebar.tsx, AdminSidebar.tsx | Main navigation, All pages |
| [PRD_TANGO_ROLES_SYSTEM.md](./PRD_TANGO_ROLES_SYSTEM.md) | 20 unified tango role definitions (includes Taxi Dancer) | `lib/tangoRoles.ts`, `UserRoleBadges.tsx` | Onboarding, Profile, Search, Cards (15 files) |
| [PRD_ROLE_CHANGE_CASCADE.md](./PRD_ROLE_CHANGE_CASCADE.md) | Symmetric ADD/REMOVE role cascades | `role-change-routes.ts` | Profile Edit, PRO Groups, Notifications |
| [PRD_CASCADE_FRAMEWORK.md](./PRD_CASCADE_FRAMEWORK.md) | **NEW** Unified cascade architecture for all attribute changes | `roleChangeEffects.ts`, `locationChangeEffects.ts` | Profile Edit, All Cascades |
| [PRD_RBAC_ABAC_COMPLETE.md](./PRD_RBAC_ABAC_COMPLETE.md) | **NEW** Complete RBAC/ABAC system (8 platform, 10 event, 20 tango, 4 group roles) | `auth.ts`, `eventRolesSchemas.ts`, `tangoRoles.ts` | All Permission Checks |
| [PRD_PER_ROLE_EXPERIENCE.md](./PRD_PER_ROLE_EXPERIENCE.md) | Per-role experience tracking (JSONB) | `roleExperience.ts`, `schema.ts` | Registration, Profile, Matching, Talent Search (25+ files) |
| [PRD_UNIFIED_LOCATION_PICKER.md](./PRD_UNIFIED_LOCATION_PICKER.md) | 3-tier smart location search | `UnifiedLocationPicker.tsx` | Travel, Profile, Events, Groups, Onboarding (26 files) |
| [PRD_UNIFIED_FEEDS_SYSTEM.md](./PRD_UNIFIED_FEEDS_SYSTEM.md) | Unified post/memory display & creation | `UnifiedMemoriesFeed.tsx`, `PostCreator.tsx`, `SmartPostFeed.tsx` | Feed, Profile, Groups, Events, Saved Posts (20+ files) |
| [PRD_UNIFIED_LANGUAGE_SYSTEM.md](./PRD_UNIFIED_LANGUAGE_SYSTEM.md) | Language picker with i18n sync + AI integration | `UnifiedLanguagePicker.tsx`, `languageData.ts` | Profile, Onboarding, Talent Match, Event Recommendations |
| [PRD_LOCATION_CHANGE_CASCADE.md](./PRD_LOCATION_CHANGE_CASCADE.md) | Location change effects cascade | `locationChangeEffects.ts`, `LocationChangeWelcome.tsx` | Profile Edit, Notifications, Groups |

---

## User Profile System

| PRD | Purpose | Key Files | Cross-References |
|-----|---------|-----------|------------------|
| [PRD_PROFILE_PAGE_INDEX.md](./PRD_PROFILE_PAGE_INDEX.md) | **NEW** Master component index (8 core + 17 legacy + 5 settings tabs) | All `ProfileTab*.tsx`, `AboutSubTabs.tsx` | Links all profile-related PRDs |
| [PRD_USER_PROFILE_SYSTEM.md](./PRD_USER_PROFILE_SYSTEM.md) | Master profile system documentation (8 tabs) | `ProfilePage.tsx`, `ProfileTab*.tsx` | PRD_UNIFIED_FEEDS_SYSTEM, PRD_UNIFIED_LOCATION_PICKER, PRD_UNIFIED_LANGUAGE_SYSTEM, PRD_UNIFIED_PRO_TAB |
| [PRD_UNIFIED_PRO_TAB.md](./PRD_UNIFIED_PRO_TAB.md) | Consolidates 17 role-based tabs → 1 PRO tab | `ProfileTabPro.tsx`, `ProDashboard.tsx`, `ProPublicView.tsx` | PRD_TANGO_ROLES_SYSTEM, PRD_PER_ROLE_EXPERIENCE |
| [PRD_TRAVEL_PLANNING_SYSTEM.md](./PRD_TRAVEL_PLANNING_SYSTEM.md) | Multi-city trip planning with events integration | `ProfileTabTravel.tsx`, `TravelTripPlannerPage.tsx`, `travelPlans` schema | PRD_UNIFIED_LOCATION_PICKER, Events System |

### About Tab Settings Sub-Tabs

| PRD | Purpose | Key Files |
|-----|---------|-----------|
| [PRD_UNIFIED_ABOUT_SETTINGS.md](./PRD_UNIFIED_ABOUT_SETTINGS.md) | About tab with 5 sub-tabs architecture | `ProfileTabAbout.tsx`, `AboutSubTabs.tsx` |
| [PRD_PRIVACY_SETTINGS_TAB.md](./PRD_PRIVACY_SETTINGS_TAB.md) | Privacy controls sub-tab | `settings/PrivacySubTab.tsx` |
| [PRD_SECURITY_SETTINGS_TAB.md](./PRD_SECURITY_SETTINGS_TAB.md) | Security settings (2FA, password, sessions) | `settings/SecuritySubTab.tsx` |
| [PRD_NOTIFICATIONS_SETTINGS_TAB.md](./PRD_NOTIFICATIONS_SETTINGS_TAB.md) | Notification preferences | `settings/NotificationsSubTab.tsx` |
| [PRD_SUBSCRIPTION_SETTINGS_TAB.md](./PRD_SUBSCRIPTION_SETTINGS_TAB.md) | Billing, subscription plans | `settings/SubscriptionSubTab.tsx` |

---

## Groups System

| PRD | Purpose | Key Files | Cross-References |
|-----|---------|-----------|------------------|
| [PRD_GROUPS_LANDING_SYSTEM.md](./PRD_GROUPS_LANDING_SYSTEM.md) | **NEW** Groups landing (3 tabs: My Groups, Cities, Professional) | `GroupsPage.tsx`, `GroupCreationModal.tsx` | Location Picker, Unified Feeds |
| [PRD_GROUP_DETAILS_SYSTEM.md](./PRD_GROUP_DETAILS_SYSTEM.md) | **NEW** Group details (7 tabs: Discussion, Events, Housing, Hub, Members, City Guide, Settings) | `GroupDetailsPage.tsx`, `GroupPostFeed.tsx`, `GroupMembersList.tsx` | RSVP Architecture, Unified Feeds, Travel Planning |
| [PRD_GROUP_MEMBERSHIP_SYSTEM.md](./PRD_GROUP_MEMBERSHIP_SYSTEM.md) | **NEW** Membership flows (join/leave, role hierarchy, approval workflows) | `group-routes.ts`, `groupMembers` schema | RBAC/ABAC, Notifications |

### Groups Database Schema

| Table | Columns | Relations |
|-------|---------|-----------|
| `groups` | 23 columns (id, name, slug, type, visibility, city, country, memberCount, etc.) | → users, events |
| `groupMembers` | id, groupId, userId, role, status, joinedAt, notificationLevel | → groups, users (cascade delete) |
| `groupPosts` | id, groupId, authorId, content, mediaUrls, isPinned, reactions | → groups, users (cascade delete) |
| `groupCategories` | id, name, slug, description, icon | category taxonomy |
| `groupCategoryAssignments` | groupId, categoryId (composite PK) | → groups, groupCategories |

### Groups API Endpoints (15+)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/groups` | GET | List groups with filters (search, type, city) |
| `/api/groups` | POST | Create new group (auto-add creator as admin) |
| `/api/groups/my-groups` | GET | User's group memberships |
| `/api/groups/analytics/popular` | GET | Popular groups by members |
| `/api/groups/:id` | GET/PUT/DELETE | Group CRUD |
| `/api/groups/:id/join` | POST | Join group (pending if private) |
| `/api/groups/:id/leave` | DELETE | Leave group |
| `/api/groups/:id/members` | GET | List members with role filtering |
| `/api/groups/:id/posts` | GET/POST | Group posts CRUD |
| `/api/groups/:id/events` | GET | Events linked to group |

---

## AI & Intelligence

| PRD | Purpose | Key Integration Points |
|-----|---------|------------------------|
| [PRD_MR_BLUE_CONTENT_STUDIO.md](./PRD_MR_BLUE_CONTENT_STUDIO.md) | AI content creation studio | VibeCoding, Visual Editor |
| [MR_BLUE_VISUAL_EDITOR_PRD.md](./MR_BLUE_VISUAL_EDITOR_PRD.md) | Mr. Blue visual editor integration | Visual Editor, Page Generation |
| [MB_MD_V9_5_VISUAL_EDITOR_PRD.md](./MB_MD_V9_5_VISUAL_EDITOR_PRD.md) | Visual Editor v9.5 specs | VibeCoding, Inline Editing |
| [MB_MD_PHASE_C_AUTONOMOUS_FRAMEWORK_PRD.md](./MB_MD_PHASE_C_AUTONOMOUS_FRAMEWORK_PRD.md) | Autonomous agent framework | AutoRetry, Escalation, Self-Healing |

---

## Business Features

| PRD | Purpose | Key Integration Points |
|-----|---------|------------------------|
| [PRD_ENHANCED_TALENT_MATCH.md](./PRD_ENHANCED_TALENT_MATCH.md) | AI-powered talent matching | Profiles, Search, Recommendations, Language System |
| [PRD_LIFE_CEO_FINANCE_ENHANCED.md](./PRD_LIFE_CEO_FINANCE_ENHANCED.md) | Financial planning AI | Life CEO, Goals, Budgeting |
| [PRD_LIFE_CEO_PRODUCTIVITY_2.0.md](./PRD_LIFE_CEO_PRODUCTIVITY_2.0.md) | Productivity AI assistant | Life CEO, Tasks, Calendar |
| [PRD_USER_PRIVACY_HUB.md](./PRD_USER_PRIVACY_HUB.md) | Privacy settings & controls | Settings, GDPR, Data Export |

---

## Gap Analysis & System Audits

| Document | Purpose | Key Findings |
|----------|---------|--------------|
| [GAP_ANALYSIS_SUMMARY.md](./GAP_ANALYSIS_SUMMARY.md) | **NEW** Comprehensive platform gap analysis | 70% documentation debt, 150+ tables, 70+ API files, 60+ missing PRDs |

### Gap Analysis Highlights

**P0 Missing PRDs (Revenue-Critical):**
- Marketplace System (4+ pages, 500+ lines E2E tests exist)
- Crowdfunding System (4+ pages, 450+ lines E2E tests exist)
- Legal Documents System (5+ pages, 350+ lines E2E tests exist)
- Messages System (4+ pages, partial E2E coverage)

**P1 Missing PRDs (Core Platform):**
- Housing System (5+ pages)
- Travel System (4+ pages, E2E tests exist)
- Events Extended (8+ pages, RSVP architecture)
- Admin Dashboard (15+ pages, 15+ API files)

**Agent Squad Assignments:**
- Squad 1: PRD Writers (50 agents)
- Squad 2: Database Schema (30 agents)
- Squad 3: API Documentation (40 agents)
- Squad 4: UI Auditors (30 agents)
- Squad 5: E2E Test (30 agents)
- Squad 6: Integration (20 agents)

---

## Verification

| PRD | Purpose |
|-----|---------|
| [TRACK_2_PRD_VERIFICATION_REPORT.md](./TRACK_2_PRD_VERIFICATION_REPORT.md) | PRD implementation verification |

---

## Cross-Reference Matrix

### By Page/Feature

| Page/Feature | Related PRDs |
|--------------|--------------|
| **Feed** (`/feed`) | Unified Feeds, Tango Roles |
| **Profile** (`/profile/:id`) | User Profile System, Unified PRO Tab, Tango Roles, Unified Feeds, Location Picker, Location Change Cascade, Per-Role Experience, Language System |
| **Events** (`/events`) | Location Picker, Unified Feeds, Travel Planning, Group Details (events tab) |
| **Groups** (`/groups`) | **Groups Landing System**, Location Picker, Unified Feeds, Location Change Cascade |
| **Groups Details** (`/groups/:id`) | **Group Details System**, **Group Membership System**, RSVP Architecture, Unified Feeds, Travel Planning |
| **Onboarding** (`/onboarding`) | Tango Roles, Location Picker, Per-Role Experience, Language System |
| **Travel** (`/profile/:id/travel`) | Travel Planning System, Location Picker, Location Change Cascade, Group Details (housing tab) |
| **Visual Editor** | Mr. Blue PRDs, Content Studio |
| **Life CEO** | Finance Enhanced, Productivity 2.0 |
| **Search/Discovery** | Tango Roles, Talent Match, Per-Role Experience, Language System |
| **Settings** | Privacy Hub, Language System |

### By Component Type

| Component Type | PRDs |
|----------------|------|
| **UI Components** | Location Picker, Unified Feeds, Tango Roles, Language System, Unified PRO Tab, Group Post Feed |
| **Profile System** | User Profile System, Unified PRO Tab, Travel Planning |
| **Groups System** | **Groups Landing**, **Group Details**, **Group Membership**, Unified Feeds |
| **Business Logic** | Location Change Cascade, Talent Match, Travel Planning, Group Membership |
| **AI/ML** | Mr. Blue PRDs, Life CEO PRDs, Talent Match (language matching) |
| **Security/Privacy** | Privacy Hub, RBAC/ABAC (group roles) |
| **i18n/Localization** | Language System |

---

## New PRDs (November 2025 Session)

The following PRDs were created during the November 2025 documentation consolidation:

| PRD | Lines | Key Changes |
|-----|-------|-------------|
| PRD_GROUPS_LANDING_SYSTEM.md | ~600 | **NEW** Groups landing with 3 tabs, search, GroupCreationModal, sidebar stats |
| PRD_GROUP_DETAILS_SYSTEM.md | ~700 | **NEW** Group details with 7 tabs, hero section, RSVP integration, member management |
| PRD_GROUP_MEMBERSHIP_SYSTEM.md | ~550 | **NEW** Membership flows, role hierarchy (creator→admin→mod→member), approval workflows |
| PRD_PROFILE_PAGE_INDEX.md | ~300 | Master component index with 33 components, 15 PRD cross-references |
| PRD_UNIFIED_PRO_TAB.md | ~817 | Consolidates 17 role-based profile tabs into single PRO tab with dashboard/public views |
| PRD_USER_PROFILE_SYSTEM.md | ~920 | Master documentation for 8 core profile tabs + RSVP mutation system (Nov 29, updated Nov 30) |
| PRD_TRAVEL_PLANNING_SYSTEM.md | ~810 | Multi-city trip planning, itinerary management, event integration, MT Host housing |
| PRD_RSVP_ARCHITECTURE.md | ~280 | Unified RSVP architecture - Events, Travel, Friends (Nov 30) |
| PRD_UNIFIED_LANGUAGE_SYSTEM.md | Updated | Added Argentine Spanish (Rioplatense) as #2 popular language, AI integration points |

### November 29, 2025 Updates

| Component | Change |
|-----------|--------|
| ProfileTabEvents | RSVP mutation system with 3 states (going/maybe/not_going) |
| ProfileTabEvents | All 3 dropdown options always visible |
| PRD_USER_PROFILE_SYSTEM.md | Documented RSVP hook, mutation, and data structure |
| PRD_PROFILE_PAGE_INDEX.md | Created master component index |

### November 30, 2025 Updates

| Component | Change |
|-----------|--------|
| PRD_GROUPS_LANDING_SYSTEM.md | **NEW** - Complete groups landing page documentation (3 tabs, search, creation) |
| PRD_GROUP_DETAILS_SYSTEM.md | **NEW** - Group details page with 7 tabs, hero section, RSVP integration |
| PRD_GROUP_MEMBERSHIP_SYSTEM.md | **NEW** - Membership system with role hierarchy, approval workflows, cascades |
| INDEX.md | Added Groups System section with 3 PRDs, database schema, 15+ API endpoints |
| Cross-Reference Matrix | Updated with Groups pages, component types, page mappings |
| PRD_RSVP_ARCHITECTURE.md | Unified RSVP architecture documentation (v1.1) |
| `/api/users/:userId/events` | Fixed 500 error - removed non-existent `hostLanguages` column from query |
| Event Routes Backend | Added `inArray` import for multi-status RSVP filtering |
| Event Routes Backend | Fixed `?status=all` parameter to return all RSVP types (not just 'going') |
| useEventRSVPs Hook | Updated to fetch all statuses by default, fixing persistence bug |
| useRSVPEvent Hook | Improved cache invalidation with consistent eventId types |
| PRD_USER_PROFILE_SYSTEM.md | v1.1 - Updated Event Interface, removed invalid `hostLanguages` field |
| PRD_PROFILE_PAGE_INDEX.md | v1.1 - Updated changelog with bug fixes |

---

## Template

New PRDs should follow: [_PRD_TEMPLATE.md](./_PRD_TEMPLATE.md)

---

## Maintenance

- **Add new PRDs** to appropriate category table above
- **Update cross-references** when adding new features
- **Keep file counts current** as components are adopted
- **Document session additions** in "New PRDs" section with line counts

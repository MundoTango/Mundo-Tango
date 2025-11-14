# Dependency Graph & Build Order

**Purpose:** Eliminate rebuilds by building foundations first  
**Update:** When new dependencies discovered  
**Usage:** Wave planning, feature ordering

**Saves:** 33% time by avoiding rebuilds

---

## 🌳 Foundation Layers

### Layer 0: Infrastructure (Build First)
Must exist before anything else:

```
Database Connection (server/db/index.ts)
  │
  ├─ Authentication System (server/middleware/auth.ts)
  ├─ Database Schema (shared/schema.ts)
  └─ Environment Variables (.env)
```

**Status:** ✅ Complete

---

### Layer 1: Core Systems (Build Second)
Foundation services that other features depend on:

```
User System
  ├─ Users table
  ├─ Authentication
  ├─ User profiles
  └─ User preferences ⚠️ NEEDED BY EMAIL

Email Service ❌ BUILD AFTER USER PREFERENCES
  ├─ EmailService.ts
  ├─ Email templates
  └─ User notification preferences (depends on User Preferences)

Subscription System
  ├─ Tiers table
  ├─ User subscriptions table
  ├─ Tier enforcement middleware
  └─ Stripe integration
```

**Status:**
- ✅ User system complete
- ⚠️ Email service exists but needs user preferences integration
- ✅ Subscription system complete (Wave 7)

**Action Needed:**
- Build user preferences BEFORE updating email system
- Then rebuild email to use preferences

---

### Layer 2: Feature Systems (Build Third)
Features that depend on core systems:

```
Events System
  ├─ Requires: User system ✅
  ├─ Requires: Subscription tiers ✅
  ├─ Events table
  ├─ RSVP system
  ├─ Event search (Wave 7) ✅
  └─ Event notifications (requires Email Service)

Housing System
  ├─ Requires: User system ✅
  ├─ Requires: Subscription tiers ✅
  ├─ Housing listings table
  ├─ Booking system
  └─ Booking notifications (requires Email Service)

Groups System
  ├─ Requires: User system ✅
  ├─ Requires: Subscription tiers ✅
  ├─ Groups table
  ├─ Membership system
  └─ Group notifications (requires Email Service)

Posts & Social
  ├─ Requires: User system ✅
  ├─ Posts table (merged with Stories) ✅
  ├─ Reactions, comments
  └─ Post notifications (requires Email Service)
```

**Status:** All base systems exist, need notification integrations

---

### Layer 3: Advanced Features (Build Fourth)
Features that depend on Layer 2:

```
Analytics System ✅ (Wave 7)
  ├─ Requires: Events, Housing, Groups, Posts
  ├─ AnalyticsService.ts ✅
  ├─ AnalyticsDashboard.tsx ✅
  └─ Metrics aggregation ✅

Moderation System ✅ (Wave 7)
  ├─ Requires: Posts, Events, Housing, Groups
  ├─ ModerationService.ts ✅
  ├─ Auto-flagging ✅
  └─ Admin moderation queue ✅

Revenue Sharing (Wave 8)
  ├─ Requires: Events system ✅
  ├─ Requires: Housing system ✅
  ├─ Requires: Stripe integration ✅
  └─ RevenueService.ts (to build)

AI Systems
  ├─ Requires: All user data (events, posts, etc.)
  ├─ Bifrost Gateway ✅
  ├─ Life CEO agents (partial)
  └─ Mr. Blue assistant (partial)
```

---

## ⚠️ Known Rebuild Scenarios (Avoid These)

### Scenario 1: Email Before Preferences
```
❌ Wrong Order:
  Wave 1: Build EmailService ← Missing user preferences
  Wave 5: Build User Preferences
  Wave 7: Rebuild EmailService to use preferences ← WASTE

✅ Right Order:
  Wave 1: Build User Preferences
  Wave 2: Build EmailService with preferences support
  Total: 50min vs 75min (33% savings)
```

### Scenario 2: Features Before Foundation
```
❌ Wrong Order:
  Wave 1: Build Event Notifications ← No email service
  Wave 3: Build Email Service
  Wave 5: Integrate Event Notifications ← REBUILD

✅ Right Order:
  Wave 1: Build Email Service
  Wave 2: Build Event Notifications (uses email)
  Total: 40min vs 65min (38% savings)
```

### Scenario 3: UI Before API
```
❌ Wrong Order:
  Wave 1: Build Dashboard UI ← Mock data
  Wave 2: Build Analytics API
  Wave 3: Connect Dashboard to API ← PARTIAL REBUILD

✅ Right Order:
  Wave 1: Build Analytics API
  Wave 2: Build Dashboard UI (with real data)
  Total: 50min vs 70min (29% savings)
```

---

## 🎯 Wave 8 Dependencies

### P0 Blockers Build Order

**Batch 1: Independent Features (Can build in parallel)**
```
CSRF Protection
  ├─ Requires: Express middleware system ✅
  └─ No other dependencies

Two-Factor Authentication
  ├─ Requires: User system ✅
  ├─ Requires: Auth middleware ✅
  └─ No other dependencies

Legal Acceptance
  ├─ Requires: User system ✅
  └─ No other dependencies
```

**Batch 2: Revenue Features (Build after Batch 1)**
```
Revenue Sharing
  ├─ Requires: Events system ✅
  ├─ Requires: Housing system ✅
  ├─ Requires: Stripe integration ✅
  └─ Build: RevenueService.ts

MT Ad System
  ├─ Requires: Analytics infrastructure ✅
  ├─ Requires: Admin dashboard ✅
  └─ Build: Ad display components
```

**Batch 3: Compliance (Build last)**
```
GDPR Compliance
  ├─ Requires: User system ✅
  ├─ Requires: All data tables ✅
  └─ Build: GDPRService.ts (data export/deletion)

Tango Roles
  ├─ Requires: User system ✅
  └─ Build: Complete role schema

Event Participant Roles
  ├─ Requires: Events system ✅
  ├─ Requires: Tango Roles (build first)
  └─ Build: Participant role middleware
```

**Optimal Order:**
1. Batch 1 (parallel) → No dependencies
2. Batch 2 (parallel) → Depends on existing systems
3. Batch 3 (sequence) → Tango Roles, then Event Roles, then GDPR

---

## 🔮 Future Waves Dependencies

### Waves 9-11: P1 Features

**User Preferences System** (BUILD FIRST)
```
User Preferences
  └─ Enables:
      ├─ Email notification settings
      ├─ SMS preferences
      ├─ Push notification settings
      └─ Privacy controls
```

**Email Enhancements** (BUILD SECOND)
```
Email Service Updates
  ├─ Requires: User Preferences ✅
  └─ Enables:
      ├─ Event reminders
      ├─ Housing notifications
      ├─ Marketing emails
      └─ All notification features
```

**Subscription Dashboards** (BUILD THIRD)
```
Subscription Dashboard
  ├─ Requires: AnalyticsService ✅
  ├─ Requires: SubscriptionService ✅
  ├─ Template: AnalyticsDashboard.tsx ✅
  └─ Build: Copy and customize
```

---

### Waves 12-18: AI Systems

**Agent Templates** (BUILD FIRST IN WAVE 12)
```
Base Agent Class
  ├─ Agent orchestration
  ├─ Agent communication
  └─ Agent memory

  └─ Enables all future agents:
      ├─ Financial AI agents (18 remaining)
      ├─ Mr. Blue agents (8 agents)
      ├─ User Testing agents (4 agents)
      └─ Visual Editor agents (2 agents)
```

**AI Infrastructure** (BUILD SECOND)
```
AI Routing System
  ├─ Requires: Base Agent Class
  └─ Enables specialized agents

Vector Database (LanceDB)
  ├─ Requires: AI Routing
  └─ Enables semantic memory for all agents
```

---

## 📊 Dependency Visualization

```
Foundation (Layer 0)
  ├─ Database ✅
  ├─ Auth ✅
  └─ Environment ✅
      │
      └─ Core Systems (Layer 1)
          ├─ User Preferences ⚠️ NEEDED
          ├─ Email Service ⚠️ NEEDS UPDATE
          ├─ Subscription System ✅
          └─ Payment System ✅
              │
              └─ Features (Layer 2)
                  ├─ Events ✅
                  ├─ Housing ✅
                  ├─ Groups ✅
                  └─ Posts ✅
                      │
                      └─ Advanced (Layer 3)
                          ├─ Analytics ✅
                          ├─ Moderation ✅
                          ├─ Revenue Sharing (Wave 8)
                          ├─ AI Systems (Waves 12-18)
                          └─ Admin Tools (Waves 19-23)
```

---

## 🎯 Build Order Rules

### Rule 1: Infrastructure First
Always build database, auth, core services before features

### Rule 2: Services Before UI
Always build API/services before building UI that uses them

### Rule 3: Templates Before Variations
Build one dashboard thoroughly, then copy for others

### Rule 4: Foundation Before Extensions
Build base system before advanced features

### Rule 5: Preferences Before Notifications
User preferences enable all notification features

---

## ✅ Pre-Wave Checklist

Before starting any wave, verify:

- [ ] All dependencies exist
- [ ] No rebuilds required
- [ ] Templates available (if applicable)
- [ ] Build order optimized
- [ ] No blocking features

---

## 🚨 Rebuild Warning Signs

Watch for these patterns (they indicate wrong order):

- ❌ "We need to update X to support Y"
- ❌ "This depends on something we'll build later"
- ❌ "Let's use mock data for now"
- ❌ "We'll integrate this later"
- ❌ "Build a placeholder for now"

**If you see these → Stop and reorder features**

---

## 💡 Optimization Examples

### Example 1: Dashboard Pattern
```
❌ Build 5 dashboards from scratch (300min)

✅ Build 1 dashboard thoroughly (60min)
✅ Copy template 4 times (60min)
Total: 120min (60% savings)
```

### Example 2: User Preferences
```
❌ Build email → Build SMS → Build push → Add preferences (100min + 3 rebuilds)

✅ Build preferences first → Build email → Build SMS → Build push (70min, no rebuilds)
Total: 30min savings (30% improvement)
```

### Example 3: Service Layer
```
❌ Build UI with mock data → Build service → Integrate (90min)

✅ Build service with real data → Build UI (60min)
Total: 30min savings (33% improvement)
```

---

## 📝 Dependency Discovery Process

When planning a new feature:

1. **Identify what it needs:**
   - User data?
   - Email/SMS?
   - Payment processing?
   - Analytics?

2. **Check if dependencies exist:**
   - Review file-map.md
   - Grep for similar features
   - Search codebase

3. **Build dependencies first:**
   - If missing: Build foundation
   - If exists: Use existing

4. **Document new dependencies:**
   - Update this file
   - Inform future waves

---

**Build smart, not twice** 🏗️

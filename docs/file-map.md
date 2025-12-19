# File Location Map

**Purpose:** Instant file access, zero exploration time  
**Update:** When new systems added  
**Usage:** Subagent task preparation, quick reference

**Saves:** 20-30min per subagent (100% exploration elimination)

---

## 🗂️ Core Architecture

### Database & Schema
```
shared/schema.ts              # All Drizzle table definitions
server/db/index.ts             # Database client
server/db/migrations/          # SQL migrations (auto-generated)
drizzle.config.ts              # Drizzle configuration (NEVER EDIT)
```

### Server Entry Points
```
server/index.ts                # Express server setup
server/routes.ts               # Main route aggregator
server/vite.ts                 # Vite middleware (NEVER EDIT)
```

### Client Entry Points
```
client/src/main.tsx            # React entry point
client/src/App.tsx             # Main app router
client/src/index.css           # Global styles + theme
```

---

## 🔐 Authentication & Authorization

### Auth System
```
server/middleware/auth.ts                  # JWT auth middleware
server/routes/auth-routes.ts               # Login, signup, logout
server/middleware/tierEnforcement.ts       # Subscription tier checks
```

### 2FA (Coming in Wave 8)
```
server/routes/2fa-routes.ts                # Two-factor auth
server/services/TwoFactorService.ts        # TOTP generation
```

### CSRF (Coming in Wave 8)
```
server/middleware/csrf.ts                  # CSRF protection
```

---

## 💳 Payments & Subscriptions

### Stripe Integration
```
server/routes/stripe-routes.ts             # Stripe webhooks
server/services/StripeService.ts           # Stripe API calls
client/src/pages/billing/                  # Billing UI
```

### Subscription System
```
server/services/SubscriptionService.ts     # Subscription logic
server/middleware/tierEnforcement.ts       # Feature access control
```

---

## 📊 Admin Dashboard & Analytics

### Admin Pages
```
client/src/pages/admin/AnalyticsDashboard.tsx    # Main analytics (Wave 7)
client/src/pages/admin/ModerationDashboard.tsx   # Content moderation (Wave 7)
client/src/pages/admin/AdminDashboard.tsx        # Admin home
```

### Analytics Services
```
server/services/AnalyticsService.ts        # Analytics business logic (Wave 7)
server/routes/analytics-routes.ts          # Analytics API
```

### Moderation System
```
server/services/ModerationService.ts       # Auto-flagging (Wave 7)
server/routes/moderation-routes.ts         # Moderation API
```

---

## 🏠 Housing Marketplace

### Housing Routes
```
server/routes/housing-routes.ts            # Housing CRUD
server/routes/booking-routes.ts            # Booking system
```

### Housing Services
```
server/services/HousingService.ts          # Housing business logic
server/services/BookingService.ts          # Booking workflows
```

### Housing UI
```
client/src/pages/housing/HousingList.tsx   # Browse listings
client/src/pages/housing/HousingDetail.tsx # Listing details
client/src/pages/housing/CreateListing.tsx # Create/edit listing
```

---

## 🎉 Events System

### Event Routes
```
server/routes/event-routes.ts              # Event CRUD (Wave 7 - search added)
server/routes/rsvp-routes.ts               # RSVP system
```

### Event Services
```
server/services/EventService.ts            # Event business logic
server/services/EventSearchService.ts      # Full-text search (Wave 7)
```

### Event UI
```
client/src/pages/events/EventList.tsx      # Browse events
client/src/pages/events/EventDetail.tsx    # Event details
client/src/pages/events/CreateEvent.tsx    # Create/edit event
```

---

## 📧 Email System

### Email Service
```
server/services/EmailService.ts            # Email templates (Wave 7 - 10 templates)
server/config/email.ts                     # Email configuration
```

### Email Templates (Built-in to EmailService.ts)
- Welcome email
- Password reset
- Event notification
- Booking confirmation
- Payment receipt
- Moderation alert
- Subscription update
- RSVP confirmation
- Housing inquiry
- General notification

---

## 🔒 Security & Compliance

### Security Middleware
```
server/middleware/csrf.ts                  # CSRF protection (Wave 8)
server/middleware/rateLimit.ts             # Rate limiting
server/middleware/helmet.ts                # Security headers (Wave 7)
```

### RLS Policies
```
server/db/migrations/0003_add_rls_policies.sql  # Row Level Security (Wave 7 - 52 policies)
```

### Encryption
```
server/utils/encryption.ts                 # AES-256-GCM encryption (Wave 7)
server/db/encrypted.ts                     # Encrypted table helpers (Wave 7)
```

### GDPR (Coming in Wave 8)
```
server/routes/gdpr-routes.ts               # Data export, deletion
server/services/GDPRService.ts             # GDPR compliance logic
```

---

## 👥 Social Features

### Posts & Stories
```
server/routes/post-routes.ts               # Posts + Stories merged (Wave 7)
client/src/pages/feed/Feed.tsx             # Main feed
client/src/components/posts/PostCard.tsx   # Post display
```

### Groups
```
server/routes/group-routes.ts              # Groups CRUD
client/src/pages/groups/GroupList.tsx      # Browse groups
```

### Friendships
```
server/routes/friendship-routes.ts         # Friend requests, trust circles
client/src/pages/friends/FriendsList.tsx   # Friends list
```

---

## 🤖 AI Systems

### Bifrost AI Gateway
```
server/services/BifrostService.ts          # Multi-AI orchestration
server/config/ai.ts                        # AI provider configs
```

### Life CEO Agents
```
server/services/LifeCEOService.ts          # Life CEO orchestration
server/agents/                             # Individual agent implementations
```

### Mr. Blue AI
```
server/services/MrBlueService.ts           # Mr. Blue assistant
client/src/components/ai/MrBlue.tsx        # Mr. Blue UI
```

---

## 🎨 UI Components

### Shadcn Components
```
client/src/components/ui/                  # All shadcn/ui components
client/src/components/ui/button.tsx        # Button
client/src/components/ui/card.tsx          # Card
client/src/components/ui/form.tsx          # Form
client/src/components/ui/dialog.tsx        # Dialog/Modal
client/src/components/ui/toast.tsx         # Toast notifications
```

### Custom Components
```
client/src/components/                     # App-specific components
client/src/components/layout/AppLayout.tsx # Main app layout
client/src/components/layout/AdminLayout.tsx # Admin layout
```

---

## 🎨 Styling & Theme

### Theme Configuration
```
client/src/index.css                       # Theme variables, dark mode
tailwind.config.ts                         # Tailwind configuration
client/src/lib/utils.ts                    # cn() utility
```

### Theme Colors (MT Ocean)
```css
/* In index.css */
--background: /* Main background */
--foreground: /* Main text */
--primary: /* Brand color */
--secondary: /* Secondary actions */
--accent: /* Highlights */
--muted: /* Subtle backgrounds */
--card: /* Card backgrounds */
```

---

## 📱 State Management

### React Query
```
client/src/lib/queryClient.ts              # Query client config
client/src/hooks/                          # Custom hooks
```

### Context Providers
```
client/src/contexts/AuthContext.tsx        # Auth state
client/src/contexts/ThemeContext.tsx       # Theme state
```

---

## 🧪 Testing

### Playwright Tests
```
tests/                                     # E2E test suites
tests/auth.spec.ts                         # Auth tests
tests/events.spec.ts                       # Event tests
tests/housing.spec.ts                      # Housing tests
playwright.config.ts                       # Playwright config
```

---

## 🛠️ Utilities & Helpers

### Server Utilities
```
server/utils/encryption.ts                 # Encryption helpers
server/utils/validation.ts                 # Validation utilities
server/utils/formatting.ts                 # Data formatting
```

### Client Utilities
```
client/src/lib/utils.ts                    # General utilities
client/src/lib/api.ts                      # API client
client/src/lib/queryClient.ts              # React Query setup
```

---

## 📦 Configuration Files

### Package Management
```
package.json                               # Dependencies (NEVER EDIT - use packager_tool)
package-lock.json                          # Lock file
```

### Build Configuration
```
vite.config.ts                             # Vite config (NEVER EDIT)
tsconfig.json                              # TypeScript config
```

### Database
```
drizzle.config.ts                          # Drizzle config (NEVER EDIT)
```

---

## 🗺️ Patterns & Standards

### Route Patterns
```
server/routes/
  [resource]-routes.ts                     # RESTful routes for resource
  
Example:
  event-routes.ts                          # /api/events/*
  housing-routes.ts                        # /api/housing/*
```

### Service Patterns
```
server/services/
  [Resource]Service.ts                     # Business logic for resource
  
Example:
  EventService.ts                          # Event business logic
  EmailService.ts                          # Email sending logic
```

### Component Patterns
```
client/src/pages/
  [feature]/[Component].tsx                # Page components
  
client/src/components/
  [feature]/[Component].tsx                # Reusable components
```

---

## 🎯 Quick Reference by Task

### Building a Dashboard?
```
Template: client/src/pages/admin/AnalyticsDashboard.tsx
Service: server/services/AnalyticsService.ts
Routes: server/routes/analytics-routes.ts
```

### Building a CRUD Resource?
```
Schema: shared/schema.ts (add table)
Routes: server/routes/[resource]-routes.ts (copy event-routes.ts)
Service: server/services/[Resource]Service.ts (optional)
UI: client/src/pages/[resource]/
```

### Building an Email?
```
Service: server/services/EmailService.ts (add method)
Template: In EmailService.ts (HTML + plain text)
```

### Adding Middleware?
```
Middleware: server/middleware/[name].ts
Register: server/index.ts or specific route file
```

### Adding Security Feature?
```
Middleware: server/middleware/[security-feature].ts
Apply: server/routes.ts or specific routes
Test: tests/[security-feature].spec.ts
```

---

## 🚫 Files to NEVER Edit

```
package.json                               # Use packager_tool instead
vite.config.ts                             # Pre-configured, don't touch
drizzle.config.ts                          # Database config, don't touch
server/vite.ts                             # Vite middleware, don't touch
```

---

## 🆕 Recently Added (Wave 7)

```
server/middleware/tierEnforcement.ts       # P0 #1: Tier enforcement
server/db/migrations/0003_add_rls_policies.sql  # P0 #2: RLS (52 policies)
server/middleware/helmet.ts                # P0 #6: Security headers
server/utils/encryption.ts                 # P0 #8: Encryption
server/db/encrypted.ts                     # P0 #8: Encrypted tables
server/routes/post-routes.ts               # P0 #14: Stories merged
server/services/EventSearchService.ts      # P0 #16: Event search
server/services/ModerationService.ts       # P0 #17: Auto-moderation
server/services/AnalyticsService.ts        # P0 #18: Analytics
client/src/pages/admin/AnalyticsDashboard.tsx  # P0 #18: Dashboard
server/services/EmailService.ts            # P0 #19: Email system (10 templates)
```

---

## 🔜 Coming Soon (Wave 8)

```
server/middleware/csrf.ts                  # P0 #3: CSRF protection
server/routes/2fa-routes.ts                # P0 #7: Two-factor auth
server/services/TwoFactorService.ts        # P0 #7: TOTP service
client/src/pages/onboarding/LegalAcceptance.tsx  # P0 #9: Legal
server/services/RevenueService.ts          # P0 #4: Revenue sharing
server/routes/ads-routes.ts                # P0 #13: MT Ad system
server/routes/gdpr-routes.ts               # P0 #5: GDPR compliance
server/services/GDPRService.ts             # P0 #5: GDPR logic
```

---

**Keep this updated as new systems are added** 🗺️

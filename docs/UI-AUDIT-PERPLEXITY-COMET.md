# MundoTango UI Audit Guide for Perplexity Comet Browser

## Overview
This document provides detailed step-by-step instructions for conducting a comprehensive UI/UX audit of the MundoTango platform using Perplexity's Comet browser.

**Platform URL:** https://mundotango.replit.app (or your deployed URL)
**Total Pages to Audit:** 94 unique routes across 11 categories
**ZERO FAKE DATA POLICY:** All data must be real - no placeholder or mock content

---

## TEST ACCOUNTS

### Standard User (Public Testing)
```
Email: Create new account via /register
Password: Use secure password
Role: dancer (default)
```

### Admin User (Full Access)
```
Email: admin@mundotango.life
Password: admin123
Role: god (8-tier RBAC)
```

---

## AUDIT CHECKLIST BY CATEGORY

### CATEGORY 1: PUBLIC PAGES (No Authentication Required)

#### 1.1 Landing Page (/)
**URL:** `/`
**Agent:** LandingPageAgent
**Expected:**
- [ ] Hero section loads with real statistics (dancers, cities, countries)
- [ ] Navigation header shows: Logo, Events, Housing, Groups, Pricing, Login/Register
- [ ] Footer displays with social links
- [ ] Language selector works (68 languages)
- [ ] Theme toggle (dark/light) works
- [ ] "Get Started" CTA navigates to /register
- [ ] Demo videos section shows real demos (not placeholders)
- [ ] Testimonials section shows real user quotes
- [ ] Feature cards display correctly

**Verify Data:**
```
Check: API /api/stats/public returns real counts
Expected: dancers > 100, cities > 10, countries > 5
```

#### 1.2 About Page (/about)
**URL:** `/about`
**Expected:**
- [ ] Mission statement visible
- [ ] Team section loads (if implemented)
- [ ] Statistics match landing page
- [ ] Links work properly

#### 1.3 Pricing Page (/pricing)
**URL:** `/pricing`
**Expected:**
- [ ] 4 Stripe tiers display correctly:
  - Free: $0/month
  - Explorer: $4.99/month
  - Performer: $14.99/month  
  - Maestro: $29.99/month
- [ ] Feature comparison table accurate
- [ ] "Subscribe" buttons link to correct Stripe checkout
- [ ] Currency selector works

**Verify Data:**
```
Check: API /api/subscriptions/tiers returns 4 tiers
Expected: All prices match displayed values
```

#### 1.4 Contact Page (/contact)
**URL:** `/contact`
**Expected:**
- [ ] Contact form renders
- [ ] Form validation works
- [ ] Submit button enabled after valid input
- [ ] Success/error messages display

#### 1.5 Terms Page (/terms)
**URL:** `/terms`
**Expected:**
- [ ] Legal text loads
- [ ] Page renders without errors
- [ ] Links to Privacy Policy work

#### 1.6 Privacy Page (/privacy)
**URL:** `/privacy`
**Expected:**
- [ ] Privacy policy text loads
- [ ] Page renders without errors

---

### CATEGORY 2: AUTHENTICATION PAGES

#### 2.1 Login Page (/login)
**URL:** `/login`
**Expected:**
- [ ] Email input field present with validation
- [ ] Password input field present
- [ ] "Show password" toggle works
- [ ] "Forgot Password" link present
- [ ] Google OAuth button present
- [ ] Facebook OAuth button present
- [ ] Form validation shows errors appropriately
- [ ] Login redirects to /feed on success
- [ ] Toast notification on success/failure

**Test Flows:**
1. Login with admin@mundotango.life / admin123
2. Verify redirect to /feed
3. Check user dropdown shows username

#### 2.2 Register Page (/register)
**URL:** `/register`
**Expected:**
- [ ] Username field with availability check
- [ ] Email field with availability check
- [ ] Password field with strength indicator
- [ ] Confirm password field
- [ ] Terms & Conditions checkbox
- [ ] Google/Facebook OAuth options
- [ ] Form validation working
- [ ] Redirects to /onboarding/welcome on success

**Test Flow:**
1. Enter unique username (e.g., testuser_TIMESTAMP)
2. Enter unique email
3. Submit form
4. Verify onboarding redirect

#### 2.3 Onboarding Flow (/onboarding/*)
**URLs:**
- `/onboarding/welcome`
- `/onboarding/tango-roles`
- `/onboarding/dance-experience`
- `/onboarding/city-selection`
- `/onboarding/languages`

**Expected per page:**
- [ ] Welcome: Introduction text, "Continue" button
- [ ] Tango Roles: Leader/Follower/Both selection
- [ ] Dance Experience: Beginner/Intermediate/Advanced
- [ ] City Selection: Search and select home city
- [ ] Languages: Multi-select for languages spoken

---

### CATEGORY 3: SOCIAL FEED (Requires Auth)

#### 3.1 Feed Page (/feed)
**URL:** `/feed`
**Agent:** FeedPageAgent with 4 Feature Agents
**Expected:**
- [ ] Post creation box visible
- [ ] "What's on your mind?" placeholder
- [ ] Media upload buttons (photo, video)
- [ ] Posts load from database (real posts)
- [ ] Infinite scroll works
- [ ] Like/Comment/Share buttons functional
- [ ] User avatars display correctly
- [ ] Timestamps show correctly
- [ ] "Following" / "Discover" tabs work

**Feature Agents:**
- PostCreatorFeatureAgent
- InfiniteScrollFeatureAgent
- PostReactionsFeatureAgent
- StoriesCarouselFeatureAgent

**Verify Data:**
```
Check: API /api/posts returns posts array
Expected: Posts have real content, user info, timestamps
```

#### 3.2 Post Detail (/post/:id)
**URL:** `/post/1` (use real ID)
**Expected:**
- [ ] Full post content displays
- [ ] Comments section loads
- [ ] Comment input works
- [ ] Like count shows
- [ ] Share options present

#### 3.3 Search Page (/search)
**URL:** `/search`
**Expected:**
- [ ] Search input field present
- [ ] Filter options (users, posts, events, groups)
- [ ] Results load on search
- [ ] No results message when empty

#### 3.4 Notifications Page (/notifications)
**URL:** `/notifications`
**Expected:**
- [ ] Notification list loads
- [ ] Mark as read functionality
- [ ] Click notification navigates correctly
- [ ] Empty state message if no notifications

#### 3.5 Messages Page (/messages)
**URL:** `/messages`
**Agent:** MessagesPageAgent with 4 Feature Agents
**Expected:**
- [ ] Conversation list loads
- [ ] Search conversations works
- [ ] Click conversation shows messages
- [ ] Message input field works
- [ ] Send message functionality
- [ ] OAuth channel connections (Gmail, Facebook, Instagram, WhatsApp)

**Verify Data:**
```
Check: API /api/messages/conversations
Expected: Conversations array (may be empty for new user)
```

---

### CATEGORY 4: PROFILE PAGES (Requires Auth)

#### 4.1 Profile Page (/profile)
**URL:** `/profile`
**Agent:** ProfilePageAgent with 4 Feature Agents
**Expected:**
- [ ] Profile header with avatar
- [ ] Username and display name
- [ ] Bio section
- [ ] Follower/Following counts
- [ ] Posts tab with user's posts
- [ ] Events tab
- [ ] Edit profile button (own profile)

#### 4.2 User Profile (/profile/:username)
**URL:** `/profile/admin` or any username
**Expected:**
- [ ] Public profile loads
- [ ] Follow/Unfollow button
- [ ] Message button
- [ ] Posts display
- [ ] PRO badge if applicable

#### 4.3 Edit Profile (/profile/edit)
**URL:** `/profile/edit`
**Expected:**
- [ ] Avatar upload functionality
- [ ] Display name editable
- [ ] Bio editable
- [ ] Location picker
- [ ] Tango roles selection
- [ ] Save button works
- [ ] Cancel navigates back

#### 4.4 Settings Page (/settings)
**URL:** `/settings`
**Expected:**
- [ ] Account settings section
- [ ] Privacy settings section
- [ ] Notification preferences
- [ ] Connected accounts (OAuth)
- [ ] Delete account option

---

### CATEGORY 5: EVENTS (Mixed Auth)

#### 5.1 Events List (/events)
**URL:** `/events`
**Agent:** EventsPageAgent with 4 Feature Agents
**Expected:**
- [ ] Event cards display with images
- [ ] Filters: Date, Location, Type
- [ ] Map view toggle
- [ ] List view toggle
- [ ] Search events works
- [ ] Click event navigates to detail

**Verify Data:**
```
Check: API /api/events
Expected: Events array with real events, dates, locations
```

#### 5.2 Event Detail (/events/:id)
**URL:** `/events/1` (use real ID)
**Expected:**
- [ ] Event title and image
- [ ] Date and time
- [ ] Location with map
- [ ] Description
- [ ] Organizer info
- [ ] RSVP button (authenticated)
- [ ] Share button
- [ ] Attendee list

#### 5.3 Events Calendar (/events/calendar)
**URL:** `/events/calendar`
**Expected:**
- [ ] Calendar grid renders
- [ ] Events show on correct dates
- [ ] Click date filters events
- [ ] Month/Week/Day views

#### 5.4 Events Map (/events/map)
**URL:** `/events/map`
**Expected:**
- [ ] Leaflet map loads
- [ ] Event markers display
- [ ] Click marker shows event info
- [ ] Cluster markers for dense areas

#### 5.5 Create Event (/events/create) - Auth Required
**URL:** `/events/create`
**Expected:**
- [ ] Event form loads
- [ ] Title, description, date fields
- [ ] Location picker with map
- [ ] Image upload
- [ ] Event type selection
- [ ] Submit creates event

#### 5.6 My Events (/events/my-events) - Auth Required
**URL:** `/events/my-events`
**Expected:**
- [ ] Shows events user is attending
- [ ] Shows events user is hosting
- [ ] Edit/Delete options for owned events

---

### CATEGORY 6: HOUSING MARKETPLACE

#### 6.1 Housing List (/housing)
**URL:** `/housing`
**Agent:** HousingPageAgent with 3 Feature Agents
**Expected:**
- [ ] Listing cards with images
- [ ] Filters: Location, Price, Type, Dates
- [ ] Map view option
- [ ] Search functionality
- [ ] Price displayed correctly

**Verify Data:**
```
Check: API /api/housing/listings
Expected: Listings array with real properties
```

#### 6.2 Housing Detail (/housing/:id)
**URL:** `/housing/1` (use real ID)
**Expected:**
- [ ] Property images gallery
- [ ] Title and description
- [ ] Price per night
- [ ] Amenities list
- [ ] Host info
- [ ] Availability calendar
- [ ] Book/Contact button
- [ ] Reviews section

#### 6.3 Create Listing (/housing/create) - Auth Required
**URL:** `/housing/create`
**Expected:**
- [ ] Listing form renders
- [ ] Multi-image upload
- [ ] Location picker
- [ ] Amenities checklist
- [ ] Pricing input
- [ ] Availability dates

#### 6.4 My Listings (/housing/my-listings) - Auth Required
**URL:** `/housing/my-listings`
**Expected:**
- [ ] User's listings display
- [ ] Edit/Delete options
- [ ] Booking requests section

---

### CATEGORY 7: GROUPS & COMMUNITIES

#### 7.1 Groups List (/groups or accessible via sidebar)
**Agent:** GroupsPageAgent with 3 Feature Agents
**Expected:**
- [ ] Group cards display
- [ ] Categories filter
- [ ] Search groups
- [ ] Join/Leave buttons
- [ ] Member counts

#### 7.2 Group Detail (/groups/:id)
**Expected:**
- [ ] Group header with image
- [ ] Description
- [ ] Members list
- [ ] Posts/Feed tab
- [ ] Events tab
- [ ] Join/Leave button

---

### CATEGORY 8: PRO DISCOVERY & TALENT

#### 8.1 Teachers Page (/teachers)
**URL:** `/teachers`
**Expected:**
- [ ] Teacher cards with photos
- [ ] Filters: Location, Style, Experience
- [ ] Ratings display
- [ ] Click navigates to profile

**Verify Data:**
```
Check: API /api/users/professionals/teacher
Expected: Array of teacher profiles with real data
```

#### 8.2 DJs Page (/djs or accessible via navigation)
**Expected:**
- [ ] DJ profiles display
- [ ] Music style filters
- [ ] Availability indicator

#### 8.3 Talent Match (/talent)
**URL:** `/talent`
**Expected:**
- [ ] Dashboard overview
- [ ] Active opportunities
- [ ] AI matching suggestions
- [ ] Application status

#### 8.4 Talent Dashboard (/talent/dashboard)
**Expected:**
- [ ] Pipeline stages display
- [ ] Candidate cards
- [ ] Status filters
- [ ] Action buttons

---

### CATEGORY 9: MR BLUE AI (Requires Auth)

#### 9.1 Mr Blue Chat (/mr-blue)
**URL:** `/mr-blue`
**Agent:** MrBluePageAgent with 4 Feature Agents
**Expected:**
- [ ] Chat interface loads
- [ ] Message input field
- [ ] Send button
- [ ] Message history
- [ ] AI responses display
- [ ] Loading indicator during response

**Test Flow:**
1. Type "Hello, Mr Blue"
2. Submit message
3. Wait for AI response
4. Verify response is contextual

#### 9.2 H2AC Dashboard (/h2ac-dashboard)
**URL:** `/h2ac-dashboard`
**Expected:**
- [ ] Agent overview cards
- [ ] Task assignments
- [ ] Agent status indicators
- [ ] Communication log

---

### CATEGORY 10: ADMIN PAGES (Admin Role Required)

**Login as:** admin@mundotango.life / admin123

#### 10.1 Admin Dashboard (/admin)
**URL:** `/admin`
**Agent:** AdminPageAgent with 4 Feature Agents
**Expected:**
- [ ] Stats overview (users, events, posts)
- [ ] Quick actions
- [ ] Recent activity log
- [ ] System health indicators

**Verify Data:**
```
Check: API /api/admin/stats/overview
Expected: Real counts for all entities
```

#### 10.2 Admin Users (/admin/users)
**URL:** `/admin/users`
**Expected:**
- [ ] User table loads
- [ ] Search users
- [ ] Filter by role
- [ ] Edit user button
- [ ] Suspend/Delete options

#### 10.3 Admin Content (/admin/content)
**URL:** `/admin/content`
**Expected:**
- [ ] Content moderation queue
- [ ] Reported posts list
- [ ] Approve/Reject actions
- [ ] Content filters

#### 10.4 Talent Pipeline (/admin/talent-pipeline)
**URL:** `/admin/talent-pipeline`
**Expected:**
- [ ] Kanban board layout
- [ ] Drag-and-drop cards
- [ ] Pipeline stages
- [ ] Candidate details

---

### CATEGORY 11: FINANCIAL/SUBSCRIPTIONS

#### 11.1 Subscriptions Page (/subscriptions)
**URL:** `/subscriptions`
**Agent:** FinancialPageAgent with 3 Feature Agents
**Expected:**
- [ ] Current subscription status
- [ ] Upgrade options
- [ ] Billing history
- [ ] Payment method management
- [ ] Cancel subscription option

#### 11.2 Payment Methods (/settings/payment-methods)
**Expected:**
- [ ] Add card form (Stripe Elements)
- [ ] Saved cards list
- [ ] Default card selector
- [ ] Remove card option

---

## GLOBAL UI ELEMENTS TO CHECK ON EVERY PAGE

### Header/Navigation
- [ ] Logo links to home
- [ ] Navigation links work
- [ ] User dropdown shows when logged in
- [ ] Language selector works (68 languages)
- [ ] Theme toggle works (dark/light)
- [ ] Notifications bell shows count
- [ ] Messages icon shows unread count

### Sidebar (When logged in)
- [ ] Sidebar expands/collapses
- [ ] All links navigate correctly
- [ ] Active link highlighted
- [ ] Icons display correctly

### Footer
- [ ] Social links work
- [ ] Legal links (Terms, Privacy)
- [ ] Copyright text current year

### Responsive Design
- [ ] Test at 1920px (desktop)
- [ ] Test at 1024px (tablet landscape)
- [ ] Test at 768px (tablet portrait)
- [ ] Test at 375px (mobile)

### Accessibility (WCAG 2.1 AA)
- [ ] Tab navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Color contrast sufficient
- [ ] Screen reader compatible

### Performance
- [ ] Page loads under 3 seconds
- [ ] No console errors
- [ ] Images load progressively
- [ ] Lazy loading works

### i18n (Internationalization)
- [ ] Switch language from selector
- [ ] All visible text translates
- [ ] Date/time formats localized
- [ ] Currency formats localized

---

## API HEALTH CHECKS

Before starting UI audit, verify these APIs return valid data:

```bash
# Public Stats
curl https://YOUR_URL/api/stats/public

# Events
curl https://YOUR_URL/api/events

# Housing
curl https://YOUR_URL/api/housing/listings

# Groups
curl https://YOUR_URL/api/groups

# Users/Leaderboard
curl https://YOUR_URL/api/leaderboard

# Subscription Tiers
curl https://YOUR_URL/api/subscriptions/tiers

# Mr Blue Health
curl https://YOUR_URL/api/mrblue/luma/health
```

---

## ISSUE REPORTING FORMAT

When finding issues, document them as:

```
Issue ID: [CATEGORY]-[NUMBER]
Page: [URL]
Severity: CRITICAL | HIGH | MEDIUM | LOW
Type: UI | UX | DATA | ACCESSIBILITY | PERFORMANCE | i18n
Description: [What's wrong]
Expected: [What should happen]
Actual: [What actually happens]
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
Screenshot: [Link if applicable]
```

---

## COMPLETION CHECKLIST

After completing all audits:

- [ ] All 11 categories tested
- [ ] Standard user flow completed
- [ ] Admin user flow completed
- [ ] All API health checks passed
- [ ] Responsive design verified
- [ ] Accessibility basics checked
- [ ] i18n functionality verified
- [ ] Issues documented in standard format
- [ ] Summary report generated

---

## Agent Ecosystem Reference

| Page | Agent | Feature Agents |
|------|-------|----------------|
| Landing | LandingPageAgent | - |
| Feed | FeedPageAgent | PostCreator, InfiniteScroll, PostReactions, StoriesCarousel |
| Profile | ProfilePageAgent | 4 feature agents |
| Events | EventsPageAgent | 4 feature agents |
| Messages | MessagesPageAgent | 4 feature agents |
| Admin | AdminPageAgent | 4 feature agents |
| Housing | HousingPageAgent | 3 feature agents |
| Groups | GroupsPageAgent | 3 feature agents |
| Financial | FinancialPageAgent | 3 feature agents |
| Mr Blue | MrBluePageAgent | 4 feature agents |

**Total: 10 Page Agents + 33 Feature Agents = 43 Active Agents**

---

## VERSION

- Document Version: 1.0
- Created: December 6, 2025
- Platform Version: MundoTango v1.0
- MB.MD Methodology: v9.9.3

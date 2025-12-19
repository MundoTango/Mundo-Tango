# MB.MD E2E TEST PLAN - MUNDO TANGO
## Production Readiness Verification

**Protocol**: Simultaneously • Recursively • Critically  
**Goal**: 100% production readiness verification through comprehensive E2E testing  
**Credentials**: admin@mundotango.life / admin123

---

## 🎯 EXECUTION STRATEGY

### Wave-Based Parallel Testing (3 Waves)
- **Wave 1**: Critical Paths (4 parallel agents)
- **Wave 2**: Core Features (4 parallel agents)  
- **Wave 3**: Advanced Features (4 parallel agents)

### Test Scope: 12 Major Customer Journeys
1. Authentication & Onboarding
2. Admin Access & Dashboard
3. Visual Editor (Git/Deploy)
4. Feed & Social
5. Events System
6. Groups & Community
7. Messaging & Chat
8. Profile & Travel
9. Media Gallery
10. Mr. Blue AI
11. Marketplace & Services
12. Real-time Features

---

## 📋 WAVE 1: CRITICAL PATHS (Priority P0)

### Agent 1: Authentication & Admin Access
**File**: `e2e/01-auth-admin.spec.ts`
**Duration**: ~3 minutes

```typescript
// TEST: Complete authentication journey
1. [Browser] Navigate to login page
2. [Browser] Enter email: admin@mundotango.life
3. [Browser] Enter password: admin123
4. [Browser] Click login button
5. [Verify] Assert redirect to feed page
6. [Verify] Assert user dropdown shows "Super Admin (Level 3)"
7. [Browser] Click user dropdown menu
8. [Verify] Assert "Admin Access" menu item visible
9. [Browser] Click "Admin Access" menu item
10. [Verify] Assert redirect to /admin/dashboard
11. [Verify] Assert admin sidebar visible with dashboard items
12. [Verify] Assert page loads without crashes or errors
```

### Agent 2: Visual Editor Navigation
**File**: `e2e/02-visual-editor.spec.ts`
**Duration**: ~3 minutes

```typescript
// TEST: Visual Editor access and UI
1. [New Context] Reuse authentication session
2. [Browser] Navigate to /admin/visual-editor
3. [Verify] Assert Visual Editor loads successfully
4. [Verify] Assert tabbed interface visible (HTML/CSS/JS/Preview)
5. [Verify] Assert MT page preview iframe loads
6. [Verify] Assert code editor visible
7. [Verify] Assert Git integration panel exists
8. [Verify] Assert Deploy button exists
9. [Browser] Click HTML tab
10. [Verify] Assert HTML content visible in editor
```

### Agent 3: Feed Page Core
**File**: `e2e/03-feed-core.spec.ts`
**Duration**: ~4 minutes

```typescript
// TEST: Feed page loading and post interactions
1. [New Context] Reuse authentication session
2. [Browser] Navigate to feed page (/)
3. [Verify] Assert feed loads with posts
4. [Verify] Assert UnifiedTopBar visible
5. [Verify] Assert Sidebar navigation visible
6. [Verify] Assert PostCreator component visible
7. [Browser] Click on first post's like button
8. [Verify] Assert like count increases
9. [Browser] Click on first post's comment button
10. [Verify] Assert comments section expands
11. [Browser] Enter comment text "Test comment"
12. [Browser] Submit comment
13. [Verify] Assert comment appears in list
```

### Agent 4: Events Discovery
**File**: `e2e/04-events-core.spec.ts`
**Duration**: ~4 minutes

```typescript
// TEST: Events page and RSVP flow
1. [New Context] Reuse authentication session
2. [Browser] Navigate to /events
3. [Verify] Assert events page loads
4. [Verify] Assert event cards displayed
5. [Browser] Click on first event card
6. [Verify] Assert redirect to event detail page
7. [Verify] Assert event details visible (title, date, location)
8. [Verify] Assert RSVP button visible
9. [Browser] Click RSVP button
10. [Verify] Assert RSVP confirmation appears
11. [Browser] Navigate to /events/my-rsvps
12. [Verify] Assert event appears in my RSVPs
```

---

## 📋 WAVE 2: CORE FEATURES (Priority P1)

### Agent 5: Groups & Community
**File**: `e2e/05-groups.spec.ts`
**Duration**: ~4 minutes

```typescript
// TEST: Groups discovery and join flow
1. [New Context] Reuse authentication session
2. [Browser] Navigate to /groups
3. [Verify] Assert groups page loads
4. [Verify] Assert group cards displayed
5. [Browser] Click on first group
6. [Verify] Assert redirect to group detail page
7. [Verify] Assert group info visible
8. [Verify] Assert join/leave button visible
9. [Browser] Click join button
10. [Verify] Assert membership confirmed
11. [Browser] Navigate to /groups/my-groups
12. [Verify] Assert joined group appears in my groups
```

### Agent 6: Messages & Chat
**File**: `e2e/06-messages.spec.ts`
**Duration**: ~5 minutes

```typescript
// TEST: Direct messaging flow
1. [New Context] Reuse authentication session
2. [Browser] Navigate to /messages
3. [Verify] Assert messages page loads
4. [Verify] Assert conversation list visible
5. [Browser] Click on first conversation
6. [Verify] Assert chat interface loads
7. [Verify] Assert message history visible
8. [Browser] Type message "Test message"
9. [Browser] Send message
10. [Verify] Assert message appears in chat
11. [Verify] Assert unread count updates in topbar
```

### Agent 7: Profile & Travel
**File**: `e2e/07-profile-travel.spec.ts`
**Duration**: ~4 minutes

```typescript
// TEST: Profile page with travel plans
1. [New Context] Reuse authentication session
2. [Browser] Navigate to /profile/15 (admin user)
3. [Verify] Assert profile loads without crash
4. [Verify] Assert glassmorphic hero design visible
5. [Verify] Assert profile photo is hero image (400px height)
6. [Verify] Assert glassmorphic info card overlay visible
7. [Verify] Assert upcoming travel section visible
8. [Verify] Assert tabs visible (Posts/Travel/Media/About)
9. [Browser] Click Travel tab
10. [Verify] Assert travel plans displayed
```

### Agent 8: Media Gallery Albums
**File**: `e2e/08-media-gallery.spec.ts`
**Duration**: ~5 minutes

```typescript
// TEST: Media gallery and album management
1. [New Context] Reuse authentication session
2. [Browser] Navigate to /media-gallery
3. [Verify] Assert gallery page loads
4. [Verify] Assert album grid displayed
5. [Browser] Click "Create Album" button
6. [Browser] Enter album title "Test Album"
7. [Browser] Select privacy: Private
8. [Browser] Click create
9. [Verify] Assert album appears in grid
10. [Browser] Click on album
11. [Verify] Assert lightbox viewer opens
12. [Verify] Assert keyboard navigation works (arrow keys)
```

---

## 📋 WAVE 3: ADVANCED FEATURES (Priority P2)

### Agent 9: Mr. Blue AI Assistant
**File**: `e2e/09-mr-blue-ai.spec.ts`
**Duration**: ~4 minutes

```typescript
// TEST: Mr. Blue AI interaction
1. [New Context] Reuse authentication session
2. [Browser] Navigate to /mr-blue
3. [Verify] Assert Mr. Blue interface loads
4. [Verify] Assert chat input visible
5. [Browser] Type message "Hello Mr. Blue"
6. [Browser] Send message
7. [Verify] Assert AI response appears
8. [Verify] Assert message history persists
9. [Browser] Click breadcrumb context
10. [Verify] Assert breadcrumb tracking works
```

### Agent 10: Admin Dashboard Features
**File**: `e2e/10-admin-dashboard.spec.ts`
**Duration**: ~5 minutes

```typescript
// TEST: Admin dashboard comprehensive
1. [New Context] Reuse authentication session
2. [Browser] Navigate to /admin/dashboard
3. [Verify] Assert dashboard metrics visible
4. [Verify] Assert user stats displayed
5. [Verify] Assert platform health indicators visible
6. [Browser] Navigate to /admin/moderation
7. [Verify] Assert content moderation panel loads
8. [Browser] Navigate to /admin/role-requests
9. [Verify] Assert role requests list visible
10. [Browser] Navigate to /admin/event-approvals
11. [Verify] Assert event approvals panel loads
```

### Agent 11: Real-time Features
**File**: `e2e/11-realtime.spec.ts`
**Duration**: ~4 minutes

```typescript
// TEST: WebSocket notifications
1. [New Context] Reuse authentication session
2. [Browser] Navigate to feed
3. [Verify] Assert WebSocket connection established
4. [Verify] Assert ConnectionStatusBadge shows "Connected"
5. [API] Trigger notification for user
6. [Verify] Assert notification bell count updates
7. [Browser] Click notifications bell
8. [Verify] Assert notification dropdown shows new item
9. [Verify] Assert real-time message count updates
```

### Agent 12: Stripe Integration
**File**: `e2e/12-stripe-checkout.spec.ts`
**Duration**: ~4 minutes

```typescript
// TEST: Subscription checkout flow
1. [New Context] Reuse authentication session
2. [Browser] Navigate to /pricing
3. [Verify] Assert pricing tiers displayed (Free/Premium/Professional)
4. [Browser] Click "Upgrade to Premium" button
5. [Verify] Assert redirect to Stripe checkout
6. [Verify] Assert checkout session created
7. [Verify] Assert pricing displayed correctly ($20/month)
8. [Note] Do not complete payment (test mode)
```

---

## 🔧 SUPPORTING TEST INFRASTRUCTURE

### Auth Setup Helper
**File**: `playwright-helpers/auth-setup.ts`
```typescript
// Reusable session for 142 pages - saves 11+ minutes per run
export async function setupAuthSession() {
  // Login once, save session state
  // Reuse across all tests
}
```

### Test Documentation
**File**: `docs/e2e-test-results.md`
- Track test pass/fail rates
- Document discovered bugs
- Performance metrics
- Coverage reports

---

## 📊 SUCCESS CRITERIA

### All Tests Must Pass:
- ✅ Zero crashes or unhandled errors
- ✅ All navigation flows work
- ✅ All API calls return JSON (not HTML)
- ✅ WebSocket connections stable
- ✅ Real-time updates work
- ✅ Admin features accessible
- ✅ Visual Editor functional
- ✅ All major customer journeys verified

### Performance Targets:
- Page load: < 3 seconds
- API response: < 500ms
- Real-time updates: < 1 second
- Total test suite: < 15 minutes

---

## 🐛 BUG TRACKING

### Known Issues to Verify Fixed:
1. ~~Admin route React hooks crash~~ ✅ FIXED
2. API calls returning HTML (404s) - TO VERIFY
3. WebSocket connection errors - TO VERIFY
4. Missing routes - TO VERIFY

### New Bugs Discovered:
- Document in `docs/bugs-discovered.md`
- Fix immediately after discovery
- Re-run affected tests

---

## 🚀 EXECUTION PLAN

1. **Create auth-setup.ts** helper (shared session)
2. **Wave 1** - Launch 4 agents in parallel
3. **Analyze Wave 1** - Fix any critical bugs
4. **Wave 2** - Launch 4 agents in parallel
5. **Analyze Wave 2** - Fix any major bugs
6. **Wave 3** - Launch 4 agents in parallel
7. **Final verification** - Re-run all failed tests
8. **Production sign-off** - 100% pass rate required

**Total Estimated Time**: 35-45 minutes (with parallel execution)  
**Without Parallelization**: 2+ hours

---

## ✅ COMPLETION CHECKLIST

- [ ] Wave 1 agents completed (4/4)
- [ ] Wave 2 agents completed (4/4)
- [ ] Wave 3 agents completed (4/4)
- [ ] All bugs fixed and verified
- [ ] Performance targets met
- [ ] Documentation updated
- [ ] Production deployment approved

**Status**: READY TO EXECUTE

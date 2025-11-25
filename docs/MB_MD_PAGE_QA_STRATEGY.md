# MB.MD Page QA Strategy for Mr. Blue Agents
Version: 1.0
Date: November 25, 2025

## Overview

This document provides systematic QA patterns for Mr. Blue and his 1,218 agents to audit and fix all platform pages. Based on the successful Community Map API fix (P0-11 to P0-15), this establishes repeatable patterns.

## QA Methodology: 4-Research-Session Approach

### Session 1: Error Understanding
- Check console for 500/400 errors
- Check API responses (empty arrays, hardcoded zeros)
- Check if data displays correctly

### Session 2: Code Flow Tracing
- Frontend: What API endpoints are called?
- Backend: What database tables are queried?
- Schema: Are the correct fields used?

### Session 3: Root Cause Identification
- Missing table imports in routes.ts
- Wrong column names (e.g., `isActive` vs `status = 'active'`)
- Missing coordinates lookup table
- Overly strict authentication

### Session 4: Fix Validation
- Test API endpoints with curl
- Verify counts match database
- Check coordinates are not 0,0

## Common Bug Patterns (From Community Map Fix)

### Pattern 1: Missing Table Imports
**Symptom:** API returns empty data or 500 error
**Fix:** Add import to server/routes.ts
```typescript
// Before: Missing imports
// After: Add to imports at top of file
import { venues, housingListings } from "@shared/schema";
```

### Pattern 2: Wrong Column Names
**Symptom:** SQL error or wrong data
**Fix:** Check schema.ts for correct column name
```typescript
// WRONG: Using non-existent column
.where(eq(housingListings.isActive, true))

// CORRECT: Use actual column
.where(eq(housingListings.status, 'active'))
```

### Pattern 3: Hardcoded Values
**Symptom:** Data shows zeros when database has values
**Fix:** Replace hardcoded values with database queries
```typescript
// WRONG: Hardcoded
venues: 0,
coordinates: { lat: 0, lng: 0 }

// CORRECT: Query database
venues: v.venueCount,
coordinates: cityCoords[key] || calculated
```

### Pattern 4: Overly Strict Auth
**Symptom:** 401/403 errors for public data
**Fix:** Remove authenticateToken from public routes
```typescript
// WRONG: Auth required for public data
app.get("/api/community/locations", authenticateToken, async ...)

// CORRECT: No auth for public endpoints
app.get("/api/community/locations", async ...)
```

## Priority Pages for QA

### Tier 1: Core User Pages (Must Fix)
1. **FeedPage** - `/feed` - `/api/posts`, `/api/feed/stats`
2. **EventCalendarPage** - `/events` - `/api/events`
3. **ProfilePage** - `/profile/:id` - `/api/users/:id`
4. **HousingMarketplacePage** - `/housing` - `/api/housing`
5. **GroupsPage** - `/groups` - `/api/groups`

### Tier 2: Community Pages (Should Fix)
6. **CommunityWorldMapPage** - `/community-map` - ✅ FIXED (P0-11 to P0-15)
7. **CityGroupsPage** - `/city-groups` - `/api/groups/city`
8. **SubscriptionPlans** - `/subscriptions` - `/api/subscriptions`
9. **FriendsPage** - `/friends` - `/api/friends`
10. **MarketplacePage** - `/marketplace` - `/api/marketplace`

### Tier 3: Admin/Settings Pages (Nice to Fix)
11. **DashboardPage** - `/dashboard`
12. **AdminDashboardPage** - `/admin`
13. **UserSettingsPage** - `/settings`
14. **NotificationSettingsPage** - `/settings/notifications`

## Automated QA Commands

### Check All Core APIs
\`\`\`bash
# Posts API
curl -s http://localhost:5000/api/posts | head -c 500

# Events API  
curl -s http://localhost:5000/api/events | head -c 500

# Groups API
curl -s http://localhost:5000/api/groups | head -c 500

# Marketplace API
curl -s http://localhost:5000/api/marketplace/items | head -c 500

# Housing API
curl -s http://localhost:5000/api/housing | head -c 500

# Community Stats
curl -s http://localhost:5000/api/community/stats
\`\`\`

### Verify Data Counts
\`\`\`bash
# Check if returned count matches database
curl -s http://localhost:5000/api/community/stats | python3 -c "import sys, json; d=json.loads(sys.stdin.read()); print(f'Cities: {d[\"totalCities\"]}, Members: {d[\"totalMembers\"]}, Recommendations: {d[\"totalRecommendations\"]}, Housing: {d[\"totalHousing\"]}')"
\`\`\`

## MB.MD Integration

### Escalation Path
1. **Auto-Fix Attempt 1:** Simple pattern match (wrong column name)
2. **Auto-Fix Attempt 2:** Import fix (missing table)
3. **Auto-Fix Attempt 3:** Query restructure
4. **Escalate to Replit AI:** If 3 attempts fail

### Success Criteria
- API returns non-empty data
- Counts match database values
- Coordinates are valid (not 0,0)
- No console errors on page load

## Agent Training Lessons

This QA strategy maps to:
- Lesson 45: Validation Loop (observe → decide → act → validate → adapt)
- Lesson 46: Orchestration Phases (7-phase backend agent system)
- Lesson 47: Event Bus (AgentEventBus for cross-agent communication)

## Community Map Fix Summary (Reference)

**Bugs Fixed:**
- P0-11: Removed auth from public endpoints
- P0-12: Fixed venue counts (hardcoded 0 → query venues table)
- P0-13: Fixed housing counts (wrong column `isActive` → `status = 'active'`)
- P0-14: Fixed coordinates (hardcoded 0,0 → city lookup table)
- P0-15: Added missing schema imports (venues, housingListings)

**Result:**
- 18 locations with valid coordinates
- 8 venues counted correctly
- 2 housing listings counted correctly
- API accessible without authentication

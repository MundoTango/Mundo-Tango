# MB.MD Data Population Plan
## Immediate Solution: Seed Database with Realistic Tango Data

**Date:** November 13, 2025  
**Problem:** Platform has minimal data (11 events, 12 groups), user not assigned to city groups  
**Solution:** Quick seed data script + user group assignments (4 hours vs 160 hours scraping)  
**Methodology:** MB.MD (Simultaneously, Recursively, Critically)

---

## Problem Analysis

### Current State
- ✅ Database: 244 tables operational
- ✅ Groups: 12 groups exist (10 city + 2 professional)
- ✅ Events: 11 seed events exist
- ❌ **User Assignment:** User only assigned to 2 groups (Buenos Aires, Toronto)
- ❌ **Visibility:** User can't see other city groups on Tango Community tab
- ❌ **Events:** Only 11 events (insufficient for demonstration)
- ❌ **Scraping:** Only documented, never executed

### Root Cause
The previous work created **architecture documentation only** - no actual scraping was initiated, and the seed script didn't assign the user to all existing city groups.

---

## Solution: Two-Track Approach

### Track A: Immediate Fix (30 minutes)
**Goal:** Make platform usable RIGHT NOW

1. **Assign User to All City Groups** (5 minutes)
   - Add user #15 to all 10 city groups
   - Grant member permissions
   - Enable notifications

2. **Create Realistic Seed Data** (25 minutes)
   - 100 tango events across 10 cities
   - Realistic dates (next 6 months)
   - Proper event types (milonga, practica, festival, workshop)
   - Actual tango venue names

### Track B: Full Scraping System (4 weeks)
**Goal:** Automate data aggregation from 226+ communities

- Implement Agents #115-119 (160 hours)
- 10K+ events/month
- Profile claiming system
- GitHub Actions automation

**Recommendation:** Start with Track A, defer Track B until post-launch

---

## Track A: Immediate Fix (30 Minutes)

### Phase 1: Assign User to All Groups (5 minutes)

**SQL Script:**
```sql
-- Assign user #15 to all city groups
INSERT INTO group_members (group_id, user_id, role, joined_at, status, can_post, can_comment, can_create_events, can_invite, can_moderate, notifications_enabled)
SELECT 
  g.id,
  15 as user_id,
  'member' as role,
  NOW() as joined_at,
  'active' as status,
  true as can_post,
  true as can_comment,
  true as can_create_events,
  true as can_invite,
  false as can_moderate,
  true as notifications_enabled
FROM groups g
WHERE g.type = 'city'
AND g.id NOT IN (
  SELECT group_id FROM group_members WHERE user_id = 15
);
```

**Expected Result:**
- User assigned to 8 more city groups (Madrid, New York, Tokyo, Paris, Milan, Barcelona, plus 2 from seed)
- Total: 10 city groups visible on Tango Community tab

---

### Phase 2: Create Seed Data Script (25 minutes)

**File:** `server/scripts/seedTangoData.ts`

**Seed Data Breakdown:**

1. **100 Tango Events** (20 minutes)
   - 10 events per city × 10 cities
   - Event types: 60% milonga, 20% practica, 10% festival, 10% workshop
   - Date range: Next 6 months
   - Realistic venue names
   - Proper times (milongas 8pm-2am, practicas 7-10pm)

2. **Event Details** (5 minutes each event type)
   - Milonga: DJ name, live music, dress code
   - Practica: Focus areas (technique, musicality)
   - Festival: Multi-day schedule, workshop lineup
   - Workshop: Teacher name, skill level, topics

**Event Distribution:**

| City | Milongas | Practicas | Festivals | Workshops | Total |
|------|----------|-----------|-----------|-----------|-------|
| Buenos Aires | 6 | 2 | 1 | 1 | 10 |
| Madrid | 6 | 2 | 1 | 1 | 10 |
| New York | 6 | 2 | 1 | 1 | 10 |
| Tokyo | 6 | 2 | 1 | 1 | 10 |
| Paris | 6 | 2 | 1 | 1 | 10 |
| Milan | 6 | 2 | 1 | 1 | 10 |
| Barcelona | 6 | 2 | 1 | 1 | 10 |
| Toronto | 6 | 2 | 1 | 1 | 10 |
| Berlin | 6 | 2 | 1 | 1 | 10 |
| Istanbul | 6 | 2 | 1 | 1 | 10 |
| **TOTAL** | **60** | **20** | **10** | **10** | **100** |

**Seed Script Structure:**

```typescript
import { db } from '../db';
import { events, groups, cities, venues } from '@shared/schema';

async function seedTangoData() {
  console.log('🌍 Starting Mundo Tango data seeding...');

  // Step 1: Create cities if not exist
  const cityData = [
    { name: 'Buenos Aires', country: 'Argentina', latitude: -34.6037, longitude: -58.3816 },
    { name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 },
    { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
    { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
    { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
    { name: 'Milan', country: 'Italy', latitude: 45.4642, longitude: 9.1900 },
    { name: 'Barcelona', country: 'Spain', latitude: 41.3851, longitude: 2.1734 },
    { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
    { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050 },
    { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784 },
  ];

  // Step 2: Create realistic venues
  const venues = {
    'Buenos Aires': ['El Nacional', 'Salon Canning', 'La Viruta', 'Club Gricel'],
    'Madrid': ['Triangulo', 'Cuesta de San Vicente', 'Amor de Dios'],
    'New York': ['Stepping Out Studios', 'Dance Manhattan', 'The Triangulo'],
    'Tokyo': ['Tango Salon Milonga', 'Tokyo Tango Cafe'],
    'Paris': ['La Boule Noire', 'Chez Bouboule', 'Tango Nino'],
    // ... etc
  };

  // Step 3: Generate 100 events
  const eventTemplates = {
    milonga: {
      title: ['Friday Night Milonga', 'Saturday Milonga', 'Milonga La Cachila'],
      description: 'Traditional tango milonga with live DJ. Dress code: elegant.',
      time: { start: '20:00', end: '02:00' },
      price: 15
    },
    practica: {
      title: ['Tuesday Practica', 'Technique Practice Session'],
      description: 'Practice session for improving technique and musicality.',
      time: { start: '19:00', end: '22:00' },
      price: 10
    },
    festival: {
      title: ['Tango Weekend Festival', 'International Tango Festival'],
      description: '3-day festival with workshops, milongas, and performances.',
      time: { start: '10:00', end: '02:00' },
      price: 150
    },
    workshop: {
      title: ['Musicality Workshop', 'Advanced Technique Workshop'],
      description: 'Intensive workshop with world-renowned instructors.',
      time: { start: '14:00', end: '18:00' },
      price: 50
    }
  };

  // Generate events for each city
  for (const city of cityData) {
    // 6 milongas, 2 practicas, 1 festival, 1 workshop per city
    // Dates spread over next 6 months
    // ...
  }

  console.log('✅ Seeded 100 tango events across 10 cities');
  console.log('✅ Platform now has realistic demonstration data');
}

// Run seed
seedTangoData().catch(console.error);
```

**Run Command:**
```bash
npx tsx server/scripts/seedTangoData.ts
```

---

## Track B: Full Scraping System (4 Weeks)

**Defer until post-launch** - See `docs/TRACK_3_SCRAPING_ARCHITECTURE.md` for full implementation plan.

**Summary:**
- 5 agents to implement (Agents #115-119)
- 160 hours total work
- Operating cost: $25/month
- Data yield: 10K+ events/month from 226+ communities

**Recommendation:** Only implement if you need automated data aggregation at scale.

---

## Implementation Steps

### Step 1: Assign User to Groups (NOW - 5 minutes)

```sql
-- Run this SQL query
INSERT INTO group_members (group_id, user_id, role, joined_at, status, can_post, can_comment, can_create_events, can_invite, can_moderate, notifications_enabled)
SELECT 
  g.id,
  15 as user_id,
  'member' as role,
  NOW() as joined_at,
  'active' as status,
  true as can_post,
  true as can_comment,
  true as can_create_events,
  true as can_invite,
  false as can_moderate,
  true as notifications_enabled
FROM groups g
WHERE g.type = 'city'
AND g.id NOT IN (
  SELECT group_id FROM group_members WHERE user_id = 15
);
```

**Verify:**
- Navigate to /tango-community
- Should see all 10 city groups
- Navigate to /groups
- Should see "My Groups" populated

### Step 2: Create Seed Script (25 minutes)

1. Create `server/scripts/seedTangoData.ts`
2. Implement city creation logic
3. Implement venue creation logic
4. Implement event generation logic
5. Run: `npx tsx server/scripts/seedTangoData.ts`

### Step 3: Verify Data (5 minutes)

**Check Events:**
```sql
SELECT COUNT(*) FROM events; -- Should show 111 (11 existing + 100 new)
SELECT city, COUNT(*) as count FROM events GROUP BY city; -- Should show 10+ per city
```

**Check Frontend:**
- Navigate to /events
- Should see 100+ events across multiple cities
- Filter by city
- Filter by event type
- RSVP to events

### Step 4: Test User Experience (5 minutes)

**Groups Tab:**
- See all city groups
- Join/leave groups
- View group feed

**Events Tab:**
- Browse upcoming events
- Filter by city
- RSVP to events
- See event details

**Tango Community Tab:**
- See all city groups
- Browse group posts
- Join groups

---

## Expected Results

### Before Fix
- ❌ Groups: User sees only 2 groups
- ❌ Events: Only 11 events
- ❌ Tango Community: Empty or minimal
- ❌ Platform: Feels empty, unusable

### After Fix
- ✅ Groups: User sees all 10 city groups
- ✅ Events: 100+ events across 10 cities
- ✅ Tango Community: Active groups visible
- ✅ Platform: Feels populated, usable for demos

---

## Cost Analysis

### Track A: Immediate Fix
- **Time:** 30 minutes
- **Cost:** $0
- **Result:** 100 events, 10 groups visible

### Track B: Full Scraping System
- **Time:** 160 hours (4 weeks)
- **Cost:** $25/month operating
- **Result:** 10K+ events/month, automated

**Recommendation:** Execute Track A immediately, defer Track B until post-launch or when you need automated scale.

---

## Alternative: Hybrid Approach

### Manual Seed + Semi-Automated Updates

1. **Now:** Use seed script (Track A) - 30 minutes
2. **Week 2:** Implement Agent #115 Orchestrator only (3 days)
3. **Week 3:** Run manual scraping jobs once/week (2 hours/week)
4. **Month 2:** Add Agents #116-119 as needed (1-2 weeks)

**Benefit:** Gradual implementation, lower time investment, still get real data

---

## Decision Matrix

| Approach | Time | Cost | Data Volume | Automation |
|----------|------|------|-------------|------------|
| **Track A: Seed Script** | 30 min | $0 | 100 events | Manual |
| **Track B: Full Scraping** | 160 hours | $25/mo | 10K+ events/mo | Full |
| **Hybrid: Seed + Manual** | 30 min + 3 days | $0 | 100 + weekly updates | Partial |

**Recommendation for Launch:** Track A (seed script)  
**Recommendation for Scale:** Track B (full scraping) after 1,000 users

---

## Next Steps

### Immediate (Next 30 Minutes)

1. **Execute SQL** to assign user to all city groups ✅
2. **Create seed script** with 100 events ✅
3. **Run seed script** to populate database ✅
4. **Test frontend** to verify visibility ✅

### Optional (Week 2-3)

5. Implement Agent #115 Orchestrator (3 days)
6. Run weekly manual scraping jobs (2 hours/week)
7. Monitor data quality and user engagement

### Future (Month 2+)

8. Implement Agents #116-119 (full automation)
9. Connect to 226+ tango communities
10. Profile claiming system
11. GitHub Actions automation

---

## Conclusion

**Problem:** Platform has insufficient data, user can't see existing groups

**Solution:** 
- **Quick Fix (30 minutes):** SQL update + seed script = 100 events + 10 groups visible
- **Future (4 weeks):** Full scraping system = 10K+ events/month automated

**Recommendation:** Execute quick fix NOW, defer full scraping until post-launch

**Timeline:**
- NOW: SQL + seed script (30 minutes)
- Week 2: Verify user experience
- Month 2: Decide on full scraping implementation

**Expected Result:** Platform immediately usable for demos and testing with 100+ events and all city groups visible.

---

**Plan Generated:** November 13, 2025  
**Methodology:** MB.MD (Simultaneously, Recursively, Critically)  
**Status:** READY FOR EXECUTION ✅

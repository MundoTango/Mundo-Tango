# MB.MD RESEARCH PLAN V2 - Complete Data Quality & PRD Alignment
**Date**: November 25, 2025  
**Mode**: RESEARCH ONLY - No Building Until Approved  
**Protocol**: Replit AI → Mr. Blue → 1,218 Agents

---

## STRIPE TESTING SECRETS (DOCUMENT UPDATE REQUIRED)

### Current Issue
Tests fail with: "Testing Subagent: The users need to provide the Stripe testing secrets before tests can run."

### Required Secrets for Testing
The following Stripe test secrets must be configured in Replit Secrets:

| Secret Name | Purpose | Where to Get |
|-------------|---------|--------------|
| `STRIPE_SECRET_KEY` | Backend API (test mode) | Stripe Dashboard → Developers → API keys → Secret key (starts with `sk_test_`) |
| `VITE_STRIPE_PUBLIC_KEY` | Frontend (test mode) | Stripe Dashboard → Developers → API keys → Publishable key (starts with `pk_test_`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification | Stripe Dashboard → Developers → Webhooks → Signing secret (starts with `whsec_`) |

### Test Card Numbers (Already in codebase)
Located in `tests/helpers/stripe.ts`:
```typescript
STRIPE_TEST_CARDS = {
  SUCCESS: '4242424242424242',           // Always succeeds
  DECLINE: '4000000000000002',           // Always declines
  INSUFFICIENT_FUNDS: '4000000000009995', // Decline - insufficient
  REQUIRES_AUTH: '4000002500003155',     // Requires 3D Secure
};
```

### Documentation Files to Update
1. `docs/API_KEY_SETUP_GUIDE.md` - Line 27-31 (already has format)
2. `replit.md` - Add Stripe testing section
3. `tests/QUICKSTART.md` - Add pre-requisite secrets section
4. `README.md` - Add testing requirements

---

## PRDS IDENTIFIED FOR THIS WORK

### Primary PRDs (Must Follow)
| PRD | Location | Covers |
|-----|----------|--------|
| **EVENTS_SYSTEM.md** | `docs/features/EVENTS_SYSTEM.md` | Event types, RSVP, attendance, discovery |
| **EVENT_TABLES.md** | `docs/database/EVENT_TABLES.md` | Database schema for events |
| **eventRolesSchemas.ts** | `shared/eventRolesSchemas.ts` | 10 participant roles (organizer, co_organizer, dj, etc.) |
| **MB_MD_V9_5_VISUAL_EDITOR_PRD** | `docs/MB_MD_V9_5_VISUAL_EDITOR_PRD.md` | Visual Editor intelligence |
| **MB_MD_HIERARCHICAL_TRAINING_PROTOCOL** | `docs/MB_MD_HIERARCHICAL_TRAINING_PROTOCOL.md` | Agent handoff protocol |

### Supporting PRDs
| PRD | Location | Covers |
|-----|----------|--------|
| PRD_USER_PRIVACY_HUB | `docs/PRD_USER_PRIVACY_HUB.md` | User data handling |
| HANDOFF_TECHNICAL_ARCHITECTURE | `docs/HANDOFF_TECHNICAL_ARCHITECTURE.md` | System architecture |
| MB_MD_PHASE_C_AUTONOMOUS_FRAMEWORK | `docs/MB_MD_PHASE_C_AUTONOMOUS_FRAMEWORK_PRD.md` | Auto-fix, escalation |

---

## CRITICAL ISSUE #1: EVENTS MISSING INVITED PARTICIPANTS & CO-ORGANIZERS

### Schema Already Exists (Not Being Used!)
```typescript
// shared/eventRolesSchemas.ts - Line 12-23
export const eventRoleEnum = pgEnum('event_role', [
  'organizer',
  'co_organizer',      // ← REQUIRED for tango resume
  'dj',                // ← REQUIRED for tango resume
  'teacher',           // ← REQUIRED for tango resume
  'performer',         // ← REQUIRED for tango resume
  'photographer',
  'volunteer',
  'host',
  'sponsor',
  'attendee'
]);

// shared/eventRolesSchemas.ts - Line 35-65
export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id"),     // Links to events.id
  userId: integer("user_id"),       // Links to users.id  
  role: eventRoleEnum("role"),      // organizer, co_organizer, dj, teacher, etc.
  status: participantStatusEnum,    // invited, pending, confirmed, declined
  customTitle: varchar,             // E.g., "Guest DJ from Berlin"
  isPubliclyListed: boolean,        // Show on event page
  ...
});
```

### Current Problem
1. **Scraping doesn't capture participant roles** - Only captures organizer name as text
2. **autoApproveScrapedEvents.ts** - Doesn't create `event_participants` records
3. **EventDetailsPage.tsx** - Doesn't query/display event_participants
4. **Tango Resume** - Not linked to event_participants

### Data Flow for Tango Resume
```
Event Scraper → scraped_events.organizer (text only)
                          ↓
                 autoApproveScrapedEvents.ts 
                          ↓
                 events table (no participant links)
                          ↓
                 event_participants table (EMPTY!)
                          ↓
                 TangoResumeService.ts (nothing to count)
```

### Required Fix
1. **Enhanced Scraping**: Extract co-organizers, DJs, teachers from event descriptions
2. **Match Users**: Try to match scraped names to existing users
3. **Create Participants**: Insert into `event_participants` with proper roles
4. **Display on Event Page**: Show participants section
5. **Feed Tango Resume**: `TangoResumeService` queries event_participants

---

## CRITICAL ISSUE #2: GROUP "ABOUT" USES AI ASSUMPTIONS

### Current State (From Screenshot)
> "Melbourne is Australia's tango capital, hosting a vibrant community with milongas every night of the week. From intimate neighbourhood practicas to grand festival events, Melbourne offers something for every dancer."

**Problem**: This is AI-generated, not scraped from actual sources.

### What Should Be Used Instead

#### Option A: Scraped Community Data
If we've scraped Melbourne tango websites, use THAT data:
- Event frequency (calculated from scraped events)
- Venue names (from scraped event locations)
- Community size (from member count or event attendance)
- Actual milonga schedules (from recurring events)

#### Option B: Verified City Information
If no scraped data exists, use ONLY verifiable facts:
- City population
- Country
- Timezone
- Geographic coordinates
- Number of events in our database
- Number of members in our database

#### Option C: Empty with Placeholder
If neither A nor B is available:
> "About this community: No community data has been scraped yet. Join the group to help build this section!"

### Current Database Check
```sql
SELECT city, COUNT(*) as event_count 
FROM events 
WHERE city = 'Melbourne' AND status = 'published' 
GROUP BY city;
```

### Required Changes to GroupDetailsPage.tsx
```tsx
// Line 374+ - About This Group section
<CardTitle>About This Group</CardTitle>
<CardDescription>
  {/* ONLY show scraped/verified data */}
  {group.scrapedData ? (
    <ScrapedCommunityInfo data={group.scrapedData} />
  ) : (
    <VerifiedCityInfo 
      eventCount={groupEvents.length}
      memberCount={group.memberCount}
      city={group.city}
    />
  )}
</CardDescription>
```

---

## CRITICAL ISSUE #3: GROUP EVENT LISTINGS MISSING RSVP

### Current State (From Screenshot)
Group events tab shows events but NO RSVP buttons visible on the cards.

### Location in Code
`client/src/pages/GroupDetailsPage.tsx` - Events tab section

### Required Fix
Ensure each event card includes RSVP buttons with proper cache invalidation:
```tsx
// When RSVP changes, invalidate ALL related queries
queryClient.invalidateQueries({ queryKey: ['/api/events'] });
queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'events'] });
```

---

## CRITICAL ISSUE #4: EVENT DETAILS MISSING SCRAPED FIELDS

### Current EventDetailsPage.tsx Display
| Field | Shown | Source |
|-------|-------|--------|
| title | ✅ | events.title |
| date/time | ✅ | events.startDate |
| location | ✅ | events.location |
| description | ✅ | events.description |
| price | ⚠️ | Shows "Free" even if price exists |
| attendees | ✅ | Count from event_rsvps |

### Missing From Display (Fields Exist in events Table!)
| Field | Column Name | Status |
|-------|-------------|--------|
| Source URL | ❌ Missing | scraped_events.source_url NOT transferred |
| Source Name | ❌ Missing | scraped_events.source_name NOT transferred |
| Organizer Name | ⚠️ Partial | scraped_events.organizer → NOT linked to event_participants |
| Venue Name | ✅ Exists | events.venue_name - NOT DISPLAYED |
| Full Address | ✅ Exists | events.address - NOT DISPLAYED |
| Ticket URL | ✅ Exists | events.ticket_url - NOT DISPLAYED |
| Tags | ✅ Exists | events.tags - NOT DISPLAYED |
| Music Style | ✅ Exists | events.music_style - NOT DISPLAYED |
| Skill Level | ⚠️ Similar | events.age_restriction could hold this |
| Dress Code | ✅ Exists | events.dress_code - NOT DISPLAYED |
| DJ Name | ✅ Exists | events.dj_name - NOT DISPLAYED |
| Co-Organizers | ✅ Schema | event_participants.role = 'co_organizer' - NOT DISPLAYED |

### Required Enhancements to EventDetailsPage.tsx
1. Add "Event Details" section with all metadata
2. Add "Participants" section (organizers, DJs, teachers, performers)
3. Add "Tickets" section with ticket_url button
4. Add "Source" section with original event source link
5. Add "Tags" as clickable badges

---

## CRITICAL ISSUE #5: SCRAPED DATA NOT TRANSFERRING

### autoApproveScrapedEvents.ts Current Transfer
```typescript
// Line 142-165 (approximate)
const eventData = {
  title: scrapedEvent.title,
  description: scrapedEvent.description,
  startDate: scrapedEvent.startDate,
  endDate: scrapedEvent.endDate,
  location: scrapedEvent.location,
  address: scrapedEvent.address,
  price: scrapedEvent.price?.toString(),
  imageUrl: scrapedEvent.imageUrl,
  eventType: 'milonga',  // ← HARD-CODED (fixed in recent update)
  userId: 1,
  status: 'published',
  city: extractedCity,
  country: extractedCountry,
};
```

### Missing Transfers
```typescript
// NOT BEING TRANSFERRED:
sourceUrl: scrapedEvent.sourceUrl,       // ❌ Lost
sourceName: scrapedEvent.sourceName,     // ❌ Lost
organizer: scrapedEvent.organizer,       // ❌ Lost (should create event_participant)
externalId: scrapedEvent.externalId,     // ❌ Lost (needed for deduplication)
```

### Required Schema Addition
Add to `events` table:
```typescript
sourceUrl: text("source_url"),           // Original event page
sourceName: varchar("source_name"),      // E.g., "Tango Melbourne"
externalSourceId: varchar("external_source_id"), // For deduplication
```

---

## HIERARCHICAL HANDOFF PROTOCOL

### Phase 1: Replit AI (Strategic) - CURRENT PHASE
- [x] Research all PRDs
- [x] Identify all data gaps
- [x] Document schema requirements
- [x] Create this research plan
- [ ] **AWAIT USER APPROVAL**

### Phase 2: Mr. Blue (Tactical) - AFTER APPROVAL
Mr. Blue coordinates these agent teams:

#### Team A: Data Quality Agents
| Agent | Task |
|-------|------|
| AGENT_SCRAPE_1 | Add source_url, source_name columns to events |
| AGENT_SCRAPE_2 | Update autoApproveScrapedEvents.ts to transfer ALL fields |
| AGENT_SCRAPE_3 | Create event_participants from organizer field |
| AGENT_SCRAPE_4 | Re-process 432 existing scraped events |

#### Team B: Frontend Display Agents
| Agent | Task |
|-------|------|
| AGENT_UI_1 | Enhance EventDetailsPage with all fields |
| AGENT_UI_2 | Add Participants section to EventDetailsPage |
| AGENT_UI_3 | Fix GroupDetailsPage About section |
| AGENT_UI_4 | Add RSVP to group event cards |

#### Team C: Tango Resume Agents
| Agent | Task |
|-------|------|
| AGENT_RESUME_1 | Query event_participants for user roles |
| AGENT_RESUME_2 | Calculate participation scores |
| AGENT_RESUME_3 | Display role history on profile |

### Phase 3: Agent Execution (Atomic)
Each agent executes ONE atomic task with:
- Clear input/output
- Validation criteria
- Rollback plan

---

## DETAILED SCRAPING REQUIREMENTS

### Current Scraping Sources
```sql
SELECT platform, COUNT(*) 
FROM event_scraping_sources 
WHERE is_active = true 
GROUP BY platform;
```

### Required Enhancements per Source

#### For Each Scraped Event, Extract:
1. **Basic Info** (already capturing)
   - Title, description, date/time, location, address, price, image

2. **Source Info** (NOT capturing)
   - source_url (original page URL)
   - source_name (website name)
   - external_id (unique ID from source)

3. **Participant Info** (NOT capturing)
   - Organizer name(s)
   - Co-organizer name(s)
   - DJ name(s)
   - Teacher name(s)
   - Performer name(s)

4. **Event Metadata** (NOT capturing)
   - Music style (traditional, nuevo, vals, milonga)
   - Skill level (beginner, intermediate, advanced, all levels)
   - Dress code (formal, smart casual, casual)
   - Age restriction

### Extraction Patterns
```typescript
// Extract co-organizers from description
const coOrganizerPatterns = [
  /organised by (.+?) and (.+)/i,
  /co-hosts?: (.+)/i,
  /presented by (.+)/i,
];

// Extract DJs from description
const djPatterns = [
  /dj:? (.+)/i,
  /music by (.+)/i,
  /tandas by (.+)/i,
];

// Extract teachers from description
const teacherPatterns = [
  /taught by (.+)/i,
  /class with (.+)/i,
  /instruction by (.+)/i,
];
```

---

## QUESTIONS REQUIRING USER DECISION

### 1. Group About Section Strategy
**Options:**
A) Use AI-generated content (current) - **Not recommended**
B) Use only scraped community data - Requires scraping
C) Use only verified city stats - Safe fallback
D) Show empty with "help build this" message

**Recommendation:** Option C with gradual migration to B as we scrape more

### 2. Event Participants Matching
When we have organizer names from scraping:
A) Create placeholder users for unknown names
B) Store as text only, no user linking
C) Prompt community to claim their roles

**Recommendation:** Option B initially, then C for engagement

### 3. Re-Processing Existing Events
We have 432 scraped events. Should we:
A) Re-process all 432 to add missing fields
B) Only process new events going forward
C) Batch process city-by-city

**Recommendation:** Option C - Start with Melbourne, validate, then expand

### 4. Source URL Display
How prominent should "View Original" link be:
A) Small text link at bottom
B) Button in hero section
C) Card in sidebar

**Recommendation:** Option B - Shows transparency and builds trust

---

## VALIDATION CHECKLIST (BEFORE BUILDING)

### PRD Alignment
- [ ] All 9 event types from EVENTS_SYSTEM.md implemented
- [ ] 10 participant roles from eventRolesSchemas.ts usable
- [ ] RSVP system matches PRD specification
- [ ] Tango Resume receives event participation data

### Data Quality
- [ ] Source URL transferred from scraped_events
- [ ] Organizer linked to event_participants
- [ ] All events have correct event_type
- [ ] Group About uses only verified data

### User Experience
- [ ] Event details show all available info
- [ ] RSVP updates across all displays
- [ ] Group events have RSVP buttons
- [ ] Participants display on event page

---

## NEXT STEPS

1. **User Reviews This Plan** - Approve or request changes
2. **Update Documentation** - Add Stripe secrets info everywhere
3. **Schema Migration** - Add source_url, source_name to events
4. **Re-process Events** - Update 432 events with correct types
5. **Frontend Updates** - EventDetailsPage, GroupDetailsPage
6. **Tango Resume Integration** - Connect event_participants

---

*This research plan follows the MB.MD Protocol: Research → Approve → Build → Validate*  
*Awaiting user approval before any code changes.*

# FOUND PEOPLE DESIGN SPECIFICATION

**Invocation:** `use mb.md: pages:found-people`
**Owner Agent:** ProfileLinkingAgent
**Last Updated:** December 21, 2025

---

## 1. OVERVIEW

Found People are DJs, teachers, organizers, and performers extracted from scraped event data. This specification defines how we:
1. Extract names from scraped text
2. Match names to existing user profiles
3. Display linked/unlinked people on events
4. Build the professional network

**MB.MD References:**
- `use mb.md: agents:scraping` - Text extraction
- `use mb.md: patterns:core` - Fuzzy matching

---

## 2. DATA ARCHITECTURE

### Scraped Text Fields (events table)
| Field | Pattern Examples | Count |
|-------|------------------|-------|
| `organizerText` | "Hosted by X", "Organized by X" | 588 events (59%) |
| `djText` | "DJ: X", "Music by X", "DJ X & Y" | 259 events (26%) |
| `teacherText` | "Workshop with X", "Class by X & Y" | 193 events (19%) |
| `performerText` | "Live performance by X" | ~50 events |

### Linked Profile Fields (events table)
| Field | Type | Purpose |
|-------|------|---------|
| `organizerProfiles` | integer[] | Matched user IDs |
| `djProfiles` | integer[] | Matched user IDs |
| `teacherProfiles` | integer[] | Matched user IDs |
| `performerProfiles` | integer[] | Matched user IDs |

### User Tango Roles (users table)
| Role | Description |
|------|-------------|
| `dancer` | General tango dancer |
| `teacher` | Teaches tango |
| `dj` | DJs at milongas |
| `organizer` | Organizes events |
| `performer` | Stage performer |
| `orchestra` | Live music |

---

## 3. NAME EXTRACTION PATTERNS

### Organizer Patterns
```regex
/(?:hosted by|organized by|presented by|by)\s+([^,\n]+)/i
/(?:organizer|host):\s*([^,\n]+)/i
```

### DJ Patterns
```regex
/(?:dj|music by|tanda selection by)\s*:?\s*([^,\n]+)/i
/(?:dj\s+)(\w+(?:\s+\w+)?)/i
```

### Teacher Patterns
```regex
/(?:workshop|class|lesson)\s+(?:with|by)\s+([^,\n]+)/i
/(?:teachers?|maestros?):\s*([^,\n]+)/i
```

### Name Splitting
```typescript
// Handle "Carlos & Sofia", "DJ Pablo, DJ Luna"
const names = rawText.split(/[,&]/).map(n => n.trim());
```

---

## 4. PROFILE MATCHING ALGORITHM

```typescript
interface ProfileLinkingService {
  // Step 1: Extract names from text
  extractNames(text: string, role: TangoRole): string[];
  
  // Step 2: Find candidate profiles
  findCandidates(name: string, role: TangoRole): User[];
  
  // Step 3: Score matches
  scoreMatch(name: string, user: User): number;
  
  // Step 4: Apply threshold
  linkProfile(eventId: number, userId: number, role: TangoRole): void;
}
```

### Matching Criteria
| Factor | Weight | Example |
|--------|--------|---------|
| Exact display name match | 1.0 | "Maria Garcia" = "Maria Garcia" |
| Case-insensitive match | 0.9 | "maria garcia" = "Maria Garcia" |
| First + last name match | 0.8 | "Maria G" matches "Maria Garcia" |
| Fuzzy match (Levenshtein) | 0.6-0.8 | "Marìa García" ~ "Maria Garcia" |
| Role match | +0.2 | User has `tangoRoles.includes('dj')` |
| City match | +0.1 | User.city = Event.city |

### Match Threshold
- Score >= 0.8: Auto-link
- Score 0.6-0.8: Flag for manual review
- Score < 0.6: No link

---

## 5. UI DISPLAY PATTERNS

### Linked Profile (Profile Exists)
```
┌─────────────────────────────────────┐
│ [Avatar] Maria Garcia               │
│         @mariatango                 │
│         ★ DJ • Buenos Aires         │
│         [View Profile →]            │
└─────────────────────────────────────┘
```

### Unlinked Name (No Profile)
```
┌─────────────────────────────────────┐
│ [?] DJ Pablo                        │
│     Not on Mundo Tango              │
│     [Invite to Join]                │
└─────────────────────────────────────┘
```

### EventTeamCards Component
```tsx
<EventTeamCards
  djText={event.djText}
  djProfiles={event.djProfiles}
  teacherText={event.teacherText}
  teacherProfiles={event.teacherProfiles}
  organizerText={event.organizerText}
  organizerProfiles={event.organizerProfiles}
/>
```

---

## 6. API ENDPOINTS

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/users/by-name` | GET | Search users by name |
| `/api/users/by-role` | GET | List users by tango role |
| `/api/events/:id/team` | GET | Get linked team members |
| `/api/admin/profile-linking/queue` | GET | Manual review queue |
| `/api/admin/profile-linking/link` | POST | Manually link profile |

---

## 7. PROFILE ENRICHMENT FLOW

```
┌─────────────────────────────────────────────────────────────┐
│ SCRAPER                                                     │
│ Extracts: "Workshop with Carlos Espinoza & Noelia Hurtado"  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ NAME EXTRACTOR                                              │
│ Names: ["Carlos Espinoza", "Noelia Hurtado"]                │
│ Role: teacher                                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PROFILE MATCHER                                             │
│ Carlos Espinoza → User #42 (score: 0.95) ✅ AUTO-LINK       │
│ Noelia Hurtado → No match (score: 0.0) ⏳ UNLINKED          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ EVENTS TABLE UPDATE                                         │
│ teacherText: "Workshop with Carlos Espinoza & Noelia..."   │
│ teacherProfiles: [42]                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. SCRAPED PROFILES TABLE

For frequently appearing unlinked names, create placeholder profiles:

```sql
CREATE TABLE scraped_profiles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,  -- dj, teacher, organizer, performer
  city TEXT,
  country TEXT,
  event_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  linked_user_id INTEGER REFERENCES users(id),
  UNIQUE(name, role, city)
);
```

### Auto-Create Profile Threshold
- If same name appears 3+ times → Create scraped_profile entry
- If name appears 10+ times → Suggest admin creates real user

---

## 9. ADMIN INTERFACE

### Manual Linking Queue
```
┌─────────────────────────────────────────────────────────────┐
│ PROFILE LINKING QUEUE                                       │
├─────────────────────────────────────────────────────────────┤
│ "DJ Pablo" (12 events) - Buenos Aires                       │
│ Candidates:                                                 │
│   [○] Pablo Martinez @djpablo (score: 0.72)                 │
│   [○] Pablo Santos @pablosantos (score: 0.65)               │
│   [○] Create new profile                                    │
│   [○] Mark as unlinked                                      │
│ [Link Selected]                                             │
├─────────────────────────────────────────────────────────────┤
│ "Maria Garcia" (8 events) - Multiple cities                 │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. PERMISSIONS MATRIX

| Action | Public | User | Admin |
|--------|--------|------|-------|
| View linked profiles | ✅ | ✅ | ✅ |
| Click to profile | ✅ | ✅ | ✅ |
| Claim "This is me" | ❌ | ✅ | ✅ |
| Manual link | ❌ | ❌ | ✅ |
| Create scraped_profile | ❌ | ❌ | Auto |

---

## 11. ANALYTICS TRACKING

| Event | Trigger |
|-------|---------|
| `found_person_displayed` | Team card rendered |
| `found_person_click` | Click on linked profile |
| `found_person_invite` | "Invite to Join" click |
| `profile_claim_request` | User claims "This is me" |

---

## 12. TEST SCENARIOS

```markdown
1. [Unit] Extract "DJ Pablo" from "Music by DJ Pablo"
2. [Unit] Extract "Carlos & Sofia" as two names
3. [Unit] Match "Maria Garcia" to user with display name
4. [Unit] Fuzzy match "Marìa García" with accents
5. [E2E] Event shows linked DJ with clickable profile
6. [E2E] Unlinked teacher shows "Not on Mundo Tango"
7. [Admin] Manual linking queue shows candidates
8. [API] /api/users/by-role?role=dj returns DJ users
```

---

## 13. COMPONENT FILES

| Component | Path |
|-----------|------|
| EventTeamCards | `client/src/components/events/EventTeamCards.tsx` |
| ProfileLinkingService | `server/services/ProfileLinkingService.ts` |
| NameExtractor | `server/utils/nameExtractor.ts` |

---

## 14. FUTURE ENHANCEMENTS

- [ ] User can claim "This is me" on scraped names
- [ ] AI-powered name disambiguation (same name, different person)
- [ ] Profile merge for duplicate accounts
- [ ] Reputation scoring based on event appearances
- [ ] "People also hire" recommendations

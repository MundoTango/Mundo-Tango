# EVENT DETAIL PAGE DESIGN SPECIFICATION

**Invocation:** `use mb.md: pages:event-detail`
**Owner Agent:** EventsPageAgent
**Last Updated:** December 21, 2025

---

## 1. OVERVIEW

The Event Detail Page (`/events/:id`) displays comprehensive information about a single tango event, including organizers, DJs, teachers, venue, and discussion.

**MB.MD References:**
- `use mb.md: agents:scraping` - Event data extraction
- `use mb.md: pages:found-people` - Linking scraped names to profiles

---

## 2. DATA ARCHITECTURE

### Primary Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `events` | Event data | title, description, venue, organizerText, djText, teacherText |
| `users` | Linked profiles | id, displayName, tangoRoles |
| `event_rsvps` | Attendance | userId, eventId, status |
| `posts` | Discussion | entityType='event', entityId |

### Found People Fields
| Field | Description | Example |
|-------|-------------|---------|
| `organizerText` | Raw scraped organizer | "Hosted by Maria Garcia" |
| `organizerProfiles` | Linked user IDs | [42, 156] |
| `djText` | Raw scraped DJ | "DJ Pablo, DJ Luna" |
| `djProfiles` | Linked user IDs | [89] |
| `teacherText` | Raw scraped teacher | "Workshop with Carlos & Sofia" |
| `teacherProfiles` | Linked user IDs | [23, 45] |

---

## 3. URL ROUTING

| Route | Purpose |
|-------|---------|
| `/events/:id` | Event detail by ID |
| `/events/:id?tab=discussion` | Discussion tab |
| `/events/:id?tab=photos` | Photos tab |
| `/events/:id?tab=details` | Details tab |
| `/events/:id?tab=attendees` | Attendees tab |

---

## 4. PAGE STRUCTURE

```
┌─────────────────────────────────────────────────────────────────┐
│ HERO: Cover image with dark overlay                            │
│ Title, Date, Location badges                                    │
│ [RSVP Button] [Share] [Favorite]                               │
├─────────────────────────────────────────────────────────────────┤
│ TABS: Discussion | Photos | Details | Attendees                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DETAILS TAB:                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📅 Date & Time                                              ││
│  │ Friday, December 20, 2025 at 8:00 PM                        ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 📍 Venue (clickable link)                                   ││
│  │ La Catedral - Sarmiento 4006, Buenos Aires                  ││
│  │ [Get Directions]                                            ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 👤 Organizer (linked to profile)                            ││
│  │ [Avatar] Maria Garcia @mariatango                           ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🎵 DJ (linked to profile if exists)                         ││
│  │ [Avatar] DJ Pablo                                           ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🎓 Teachers (linked to profiles)                            ││
│  │ [Avatar] Carlos & Sofia - Workshop: Vals technique          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  DISCUSSION TAB:                                                │
│  [Post Composer]                                                │
│  [Post 1] [Post 2] ...                                         │
│                                                                 │
│  ATTENDEES TAB:                                                 │
│  [Avatar Grid of RSVPs]                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. TAB SPECIFICATIONS

### Details Tab (Default)
- Date & time with timezone
- Venue with Google Maps link
- Organizer profile card (linked)
- DJ/Teacher cards (linked if profile exists)
- Price information
- Description (full text)
- Source attribution ("Found on TangoMango")

### Discussion Tab
- Post composer (if logged in)
- Chronological posts with replies
- Mentions autocomplete

### Photos Tab
- Photo grid from attendees
- Upload capability for attendees

### Attendees Tab
- Avatar grid with status badges
- Going / Maybe / Can't Go sections
- Click avatar → profile

---

## 6. FILTERS

N/A - Single event view

---

## 7. INTERACTIVE ELEMENTS

### RSVP Button States
| State | Display |
|-------|---------|
| Not logged in | "Login to RSVP" |
| No RSVP | "RSVP" dropdown |
| Going | "✓ Going" (green) |
| Maybe | "? Maybe" (yellow) |
| Can't Go | "✗ Can't Go" (muted) |

### Found People Cards
- If profile exists: Avatar, name, username, link to profile
- If no profile: Name text only, "Invite to join" CTA

### Venue Link
- Click venue name → `/venues/:id` if venue exists
- Click "Get Directions" → Google Maps

---

## 8. API ENDPOINTS

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/events/:id` | GET | Event details |
| `/api/events/:id/attendees` | GET | RSVP list |
| `/api/events/:id/rsvp` | POST | Submit RSVP |
| `/api/events/:id/permissions` | GET | User permissions |
| `/api/events/:id/posts` | GET | Discussion posts |

---

## 9. DATA SOURCES

### Scraped Event Fields
| Field | Source | Extraction |
|-------|--------|------------|
| coverImage | Source page | AI image detection |
| organizerText | Event listing | "Hosted by X" patterns |
| djText | Event listing | "DJ:" or "Music by" patterns |
| teacherText | Event listing | "Workshop with" patterns |
| venue | Event listing | Address parsing |

### Profile Linking Service
1. Extract names from text fields
2. Fuzzy match against users.displayName
3. Check tangoRoles array for matching role
4. Store matched user IDs in *Profiles arrays

---

## 10. PERMISSIONS MATRIX

| Action | Public | Logged In | Attendee | Organizer | Admin |
|--------|--------|-----------|----------|-----------|-------|
| View event | ✅ | ✅ | ✅ | ✅ | ✅ |
| RSVP | ❌ | ✅ | ✅ | ✅ | ✅ |
| Post discussion | ❌ | ✅ | ✅ | ✅ | ✅ |
| Upload photos | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit event | ❌ | ❌ | ❌ | ✅ | ✅ |
| Delete event | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 11. MOBILE RESPONSIVENESS

| Breakpoint | Layout |
|------------|--------|
| Mobile | Stacked sections, full-width cards |
| Tablet | 2-column details grid |
| Desktop | 2-column with sidebar |

---

## 12. INTERNATIONALIZATION

- Event content: Original language
- UI labels: Localized
- Dates: User locale format
- "X attending" pluralization

---

## 13. ANALYTICS TRACKING

| Event | Trigger |
|-------|---------|
| `event_detail_view` | Page load |
| `event_rsvp_click` | RSVP action |
| `event_share_click` | Share button |
| `event_directions_click` | Get directions |
| `found_person_click` | Click DJ/teacher name |

---

## 14. RELATED PAGES

| Page | Navigation |
|------|------------|
| Events list | Breadcrumb "← Events" |
| City page | Click city name |
| Venue page | Click venue name |
| Profile page | Click organizer/DJ/teacher |
| Create event | "Host similar event" CTA |

---

## 15. COMPONENT FILES

| Component | Path |
|-----------|------|
| EventDetailsPage | `client/src/pages/EventDetailsPage.tsx` |
| EventDetailPage | `client/src/pages/EventDetailPage.tsx` |
| EventTeamCards | `client/src/components/events/EventTeamCards.tsx` |
| UnifiedRSVPButton | `client/src/components/events/UnifiedRSVPButton.tsx` |

---

## 16. TEST SCENARIOS

```markdown
1. [E2E] Event detail shows cover image
2. [E2E] Organizer name is visible and clickable
3. [E2E] DJ/Teacher sections display when data exists
4. [E2E] RSVP button works for logged-in user
5. [E2E] Venue link opens in new tab
6. [E2E] Discussion tab shows posts
7. [E2E] Attendees tab shows RSVP count
8. [API] GET /api/events/:id returns all fields
9. [Found People] Scraped names link to correct profiles
```

---

## 17. FUTURE ENHANCEMENTS

- [ ] Calendar integration (Add to Google/Apple Calendar)
- [ ] Ticket purchase flow
- [ ] Live streaming for online events
- [ ] Post-event photo albums
- [ ] Rating/review after event ends

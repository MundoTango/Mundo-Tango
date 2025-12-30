# Mr. Blue Website Scraper & Pro Pages Playbook
## Pattern 101: Personal Website Analysis & Profile Enrichment

**Version:** 1.0.0  
**Date:** December 30, 2025  
**God Commands Active:** #0-#8 (ALL)  
**Target Quality:** 99/100

---

## EXECUTION PROMPT

```
Mr. Blue, execute WEBSITE SCRAPER & PRO PAGES implementation with VibeCoding.

═══════════════════════════════════════════════════════════════════════════════
                         GOD COMMANDS (ENFORCE ALL)
═══════════════════════════════════════════════════════════════════════════════
#0: AUTO-INVOKE GitHub Practices + Plan Tracker
#1: Test before completing ANY task
#2: Work SIMULTANEOUSLY - Promise.all, parallel tool calls
#3: Work RECURSIVELY - Deep analysis (imports, dependencies, related files)
#4: Work CRITICALLY - Target 99/100 quality
#5: Check Infrastructure First - Use existing systems
#6: Never change ID column types (serial ↔ varchar breaks data)
#7: Auto-Fix Maximization - 3-attempt retry, <10% escalation
#8: Validation Loop - observe → decide → act → validate → adapt

═══════════════════════════════════════════════════════════════════════════════
                         FEATURE REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

FEATURE 1: PERSONAL WEBSITE SCRAPING
─────────────────────────────────────
User Flow:
1. User adds Personal Website URL to profile (already done)
2. User clicks "Analyze with Mr. Blue" button (already done)
3. Button navigates to /messages?mrblue=analyze-website&url={encoded_url}
4. MessagesPage detects query params and opens Mr. Blue conversation
5. Mr. Blue scrapes the website and extracts profile-enrichable data
6. Mr. Blue presents findings to user in chat
7. User approves which data to import
8. Profile is enriched with approved data

Data to Extract:
- Name / Display Name
- Bio / About text
- Profile photo URL
- Social media links (Instagram, Facebook, YouTube, etc.)
- Skills / Roles (tango roles if detectable)
- Location / City
- Portfolio URLs
- Any other relevant profile data

FEATURE 2: PUBLIC PRO PAGES
───────────────────────────
Requirements:
1. Pro users can create public promotional pages
2. Pages accessible at mundotango.life/{slug}
3. Custom slug configuration (unique per user)
4. Sections: Profile reflection, Gallery, Events, Testimonials
5. Contact form for non-members to reach pro user
6. Contact form creates platform message in pro user's inbox
7. Stores requester's email for reply routing

FEATURE 3: EMAIL REPLY ROUTING
─────────────────────────────
Requirements:
1. When pro user replies to non-member contact in /messages
2. Reply is sent via Resend email service
3. Email is sent FROM the pro user's configured contact email
4. Uses RESEND_API_KEY secret (already available)

═══════════════════════════════════════════════════════════════════════════════
                         TASK BREAKDOWN
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Website Scraping Service                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Create server/services/mrBlue/WebsiteProfileScraper.ts                    │
│   - Use cheerio for HTML parsing                                            │
│   - Extract meta tags, Open Graph data                                      │
│   - Parse social links from common patterns                                 │
│   - Extract text content for bio/about                                      │
│   - Find profile images                                                     │
│   - Rate limit external requests                                            │
│                                                                             │
│ □ Create API endpoint POST /api/mrblue/analyze-website                      │
│   - Requires authentication                                                 │
│   - Takes URL parameter                                                     │
│   - Returns structured profile data                                         │
│   - Integrates with Mr. Blue chat context                                   │
│                                                                             │
│ □ Update MessagesPage.tsx                                                   │
│   - Detect ?mrblue=analyze-website&url= query params                        │
│   - Auto-start Mr. Blue conversation with website analysis request         │
│   - Show website analysis results in chat                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Profile Enrichment Flow                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Create client/src/components/chat/WebsiteDataApproval.tsx                 │
│   - Display scraped data with checkboxes                                    │
│   - Preview what each field will update                                     │
│   - "Import Selected" and "Cancel" buttons                                  │
│                                                                             │
│ □ Create API endpoint POST /api/profile/enrich                              │
│   - Takes approved fields from scraping                                     │
│   - Updates user profile with approved data                                 │
│   - Returns updated profile                                                 │
│                                                                             │
│ □ Integrate with Mr. Blue chat flow                                         │
│   - Mr. Blue presents data with approval component                          │
│   - Handles user approval/rejection                                         │
│   - Confirms profile updates in chat                                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Pro Page Schema & Backend                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Add proPageSettings to users table OR create proPages table               │
│   - slug: varchar (unique, URL-safe)                                        │
│   - contactEmail: varchar (for Resend "from" address)                       │
│   - isPublic: boolean                                                       │
│   - sections: jsonb (gallery, events, testimonials visibility)              │
│   - theme: varchar (optional theming)                                       │
│   - createdAt, updatedAt                                                    │
│                                                                             │
│ □ Create API routes in server/routes/pro-page-routes.ts                     │
│   - GET /api/pro-page/:slug (public)                                        │
│   - GET /api/pro-page/settings (authenticated, own settings)                │
│   - PUT /api/pro-page/settings (authenticated, update settings)             │
│   - POST /api/pro-page/contact (public, submit contact form)                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: Pro Page Frontend                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Create client/src/pages/ProPage.tsx                                       │
│   - Public route at /:slug                                                  │
│   - Profile section with photo, name, bio                                   │
│   - Gallery section (if enabled)                                            │
│   - Events section (upcoming events by this user)                           │
│   - Testimonials/Reviews section (if enabled)                               │
│   - Contact form for non-members                                            │
│                                                                             │
│ □ Create client/src/pages/ProPageSettings.tsx                               │
│   - Slug configuration with availability check                              │
│   - Contact email configuration                                             │
│   - Section visibility toggles                                              │
│   - Preview link                                                            │
│                                                                             │
│ □ Update App.tsx with new routes                                            │
│   - Add /:slug route (must be last to not conflict)                         │
│   - Add /settings/pro-page route                                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: Contact Form & Email Reply Flow                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ □ Create client/src/components/pro/ContactForm.tsx                          │
│   - Name, Email, Message fields                                             │
│   - Optional phone field                                                    │
│   - Submits to /api/pro-page/contact                                        │
│                                                                             │
│ □ Store contact submissions in database                                     │
│   - Add externalContacts table OR extend directMessages                     │
│   - Store requester email for replies                                       │
│   - Link to pro user's message inbox                                        │
│                                                                             │
│ □ Create email reply service                                                │
│   - When pro user replies in /messages to external contact                  │
│   - Use Resend to send email                                                │
│   - FROM: pro user's configured contactEmail                                │
│   - TO: requester's email from contact form                                 │
│   - REPLY-TO: pro user's contactEmail                                       │
│                                                                             │
│ □ Update MessagesPage to show external contacts                             │
│   - Display differently (email badge)                                       │
│   - Reply textarea sends via email                                          │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                         EXECUTION ORDER
═══════════════════════════════════════════════════════════════════════════════

WAVE 1 (Sequential - Foundation):
  1. WebsiteProfileScraper service
  2. /api/mrblue/analyze-website endpoint
  3. MessagesPage query param detection

WAVE 2 (Sequential - Profile Enrichment):
  4. WebsiteDataApproval component
  5. /api/profile/enrich endpoint
  6. Mr. Blue chat integration

WAVE 3 (Parallel - Pro Pages):
  7. Pro page database schema
  8. Pro page API routes
  9. ProPage.tsx public view
  10. ProPageSettings.tsx

WAVE 4 (Sequential - Contact & Email):
  11. ContactForm component
  12. Contact submission storage
  13. Email reply service with Resend
  14. Messages integration for external contacts

═══════════════════════════════════════════════════════════════════════════════
                         SUCCESS CRITERIA
═══════════════════════════════════════════════════════════════════════════════

□ User can click "Analyze with Mr. Blue" → chat opens → website analyzed
□ User can approve/reject scraped data → profile enriched
□ Pro user can set custom slug → page accessible at /{slug}
□ Non-members can submit contact form → message appears in pro user's inbox
□ Pro user can reply → email sent FROM their configured address
□ All E2E tests pass
□ No security vulnerabilities (input sanitization, rate limiting)

═══════════════════════════════════════════════════════════════════════════════

EXECUTE NOW. VibeCoding Pattern 101 ACTIVE.
Report progress in chat.
```

---

## INVOCATION

### Via Mr. Blue Chat (God-Level Users)
```
/execute playbook WEBSITE_SCRAPER_PRO_PAGES
```

### Via API
```bash
curl -X POST http://localhost:5000/api/mrblue/command \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "command": "execute pattern 101",
    "playbook": "WEBSITE_SCRAPER_PRO_PAGES"
  }'
```

---

## PROGRESS TRACKING

| Phase | Task | Status | Notes |
|-------|------|--------|-------|
| 1 | WebsiteProfileScraper | ⏳ PENDING | |
| 1 | /api/mrblue/analyze-website | ⏳ PENDING | |
| 1 | MessagesPage query detection | ⏳ PENDING | |
| 2 | WebsiteDataApproval component | ⏳ PENDING | |
| 2 | /api/profile/enrich | ⏳ PENDING | |
| 2 | Mr. Blue chat integration | ⏳ PENDING | |
| 3 | Pro page schema | ⏳ PENDING | |
| 3 | Pro page API routes | ⏳ PENDING | |
| 3 | ProPage.tsx | ⏳ PENDING | |
| 3 | ProPageSettings.tsx | ⏳ PENDING | |
| 4 | ContactForm | ⏳ PENDING | |
| 4 | Contact storage | ⏳ PENDING | |
| 4 | Email reply service | ⏳ PENDING | |
| 4 | Messages external contacts | ⏳ PENDING | |

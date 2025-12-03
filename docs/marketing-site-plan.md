# Marketing Site Implementation Plan

## Project Goal
Build a comprehensive marketing site for Mundo Tango showcasing:
- 19+ tango roles (dancer, teacher, DJ, photographer, organizer, performer, vendor, musician, choreographer, tango school, tango hotel, wellness provider, tour operator, host/venue, guide, content creator, learning resource, taxi dancer, sponsor)
- H2AC volunteer system (927+ agents from C-level to IC)
- Named donation tiers honoring tango legends
- Accurate platform details (started Sept 2007 = 18 years, built April 2024 = 3,000+ hours, $30K invested)
- Zero fake numbers - all stats from real database APIs

---

## Phase 1: Database & API Foundation ✅ COMPLETED

### 1.1 Create Platform Donations Schema
- [x] `platformDonations` table with tier, amount, status, displayOnWall
- [x] `donorBadges` table for profile badge display
- [x] `ambassadors` table for city ambassador program

### 1.2 Create Public Stats API
- [x] `GET /api/stats/public` - dancers, cities, countries, platformStats
- [x] `GET /api/public/tango-legends` - 4 donation tier objects
- [x] `GET /api/public/volunteer-divisions` - 6 division objects
- [x] `GET /api/public/ambassadors` - active ambassadors
- [x] `GET /api/public/supporters` - donor wall data
- [x] `GET /api/public/donation-stats` - total raised, donor count
- [x] `GET /api/public/cities-seeking-ambassadors` - cities needing ambassadors

---

## Phase 2: Marketing Pages ✅ COMPLETED

### 2.1 Support Page (`/support`)
- [x] Hero section with "Become a Tango Legend" headline
- [x] 4 donation tier cards:
  - El Cachafaz ($10+) - First world touring tango dancer
  - Astor Piazzolla ($50+) - Tango Nuevo revolutionary
  - Juan Carlos Copes ($100+) - Saved tango from extinction
  - Carlos Gardel ($500+) - THE KING OF TANGO
- [x] Each tier shows: description, benefits, "Support as" button
- [x] "Other Ways to Support" section

### 2.2 Supporters Page (`/supporters`)
- [x] Hero with "Our Tango Legends" headline
- [x] Donor wall with tier-based sorting (Gardel first)
- [x] Anonymous donor handling
- [x] Empty state when no donors yet

### 2.3 Volunteer Page (`/volunteer`)
- [x] Hero with "Human to Agent Collaboration" headline
- [x] Role hierarchy section (C-level to IC)
- [x] 6 division cards:
  - Foundation (Layers 1-10): Database, Auth, API, Backend, DevOps
  - Core (Layers 11-20): Frontend, UI/UX, Components, Mobile
  - Business (Layers 21-30): Payments, Growth, Marketing, Analytics
  - Intelligence (Layers 31-46): AI/ML, Data Science, NLP, Mr Blue
  - Platform (Layers 47-56): Security, QA, Performance, SRE
  - Extended (Layers 57-61): Translation, Content, Community, Social
- [x] Skills and roles for each division
- [x] "Apply to Volunteer" button

### 2.4 Mr. Blue Page (`/mr-blue`)
- [x] Hero with "Meet Mr. Blue" headline
- [x] 6 feature cards showcasing AI capabilities
- [x] Conversation examples section
- [x] "Chat with Mr. Blue" CTA

### 2.5 Ambassadors Page (`/ambassadors`)
- [x] Hero with "Become a City Ambassador" headline
- [x] 6 benefit cards
- [x] Requirements section (2 milongas/week)
- [x] Cities seeking ambassadors (from API)
- [x] "Apply to be Ambassador" CTA

### 2.6 Open Source Page (`/open-source`)
- [x] Hero with "Built in the Open" headline
- [x] Three pillars section (Transparency, Community, Innovation)
- [x] Tech stack grid
- [x] "View on GitHub" button

---

## Phase 3: Navigation & Integration ✅ COMPLETED

### 3.1 Route Registration
- [x] Register all marketing routes in App.tsx
- [x] Use lazy loading for marketing pages

### 3.2 Navigation Updates
- [x] Add "Community" dropdown to PublicNavbar
- [x] Add Community section to PublicLayout footer
- [x] Mobile navigation includes community items

---

## Phase 4: Landing Page Updates ✅ COMPLETED

### 4.1 Dynamic Stats
- [x] Fetch stats from `/api/stats/public`
- [x] Show real counts (dancers: 159, cities: 17, countries: 13)
- [x] Hide stats when null (zero-state handling)

### 4.2 Scott's Story Footer
- [x] "Built by a Dancer, For Dancers" section
- [x] Accurate details:
  - Started dancing: September 2007 (18 years)
  - Built platform: April 2024 (3,000+ hours)
  - Investment: $30,000 personal funds
- [x] "About Scott" and "Support Platform" buttons

---

## Phase 5: REMAINING WORK ⏳ NOT STARTED

### 5.1 Stripe Payment Integration
- [ ] Create checkout session endpoint for donations
- [ ] Handle Stripe webhook for successful payments
- [ ] Insert donation record on successful payment
- [ ] Award badge based on tier
- [ ] Test donation flow end-to-end

### 5.2 Audience Marketing Pages Enhancement
- [ ] `/for-dancers` - Enhance with 19+ role showcase
- [ ] `/for-teachers` - Add student management features
- [ ] `/for-organizers` - Add event management features

### 5.3 19+ Tango Roles Showcase
- [ ] Create roles showcase component
- [ ] Define all 19 roles with icons, descriptions, features:
  - Dancer, Teacher, DJ, Photographer, Organizer
  - Performer, Vendor, Musician, Choreographer
  - Tango School, Tango Hotel, Wellness Provider
  - Tour Operator, Host/Venue, Guide
  - Content Creator, Learning Resource, Taxi Dancer, Sponsor
- [ ] Role-specific landing pages or sections

### 5.4 SEO & Meta Tags
- [ ] Add SEO component to all marketing pages
- [ ] Open Graph tags for social sharing
- [ ] Structured data for search engines

### 5.5 About Page (`/about`)
- [ ] Full Scott story with timeline
- [ ] Platform journey visualization
- [ ] Team/agent ecosystem overview
- [ ] Mission and vision statements

### 5.6 Belo Payment Integration
- [ ] Research Belo API integration
- [ ] Add as alternative payment method
- [ ] Handle crypto payments if applicable

---

## Technical Details

### File Locations
- Marketing pages: `client/src/pages/marketing/`
- API routes: `server/routes/public-stats-routes.ts`
- Navigation: `client/src/components/PublicNavbar.tsx`
- Layout: `client/src/components/PublicLayout.tsx`
- Schema: `shared/schema.ts` (platformDonations, donorBadges, ambassadors)

### API Endpoints Created
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats/public` | GET | Public platform stats |
| `/api/public/tango-legends` | GET | Donation tier info |
| `/api/public/volunteer-divisions` | GET | H2AC divisions |
| `/api/public/ambassadors` | GET | Active ambassadors |
| `/api/public/supporters` | GET | Donor wall |
| `/api/public/donation-stats` | GET | Total raised |
| `/api/public/cities-seeking-ambassadors` | GET | Cities needing ambassadors |

### Design System
- Theme: MT Ocean Theme (ocean blues + warm accents)
- Components: shadcn/ui, Radix UI
- Animations: Framer Motion
- Icons: Lucide React, React Icons

---

## Completion Status

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Database & API | ✅ Complete | 100% |
| Phase 2: Marketing Pages | ✅ Complete | 100% |
| Phase 3: Navigation | ✅ Complete | 100% |
| Phase 4: Landing Page | ✅ Complete | 100% |
| Phase 5: Remaining Work | ⏳ Not Started | 0% |

**Overall Progress: ~65% Complete**

### Priority Order for Remaining Work
1. **P0**: Stripe payment integration (required for donations to work)
2. **P1**: 19+ roles showcase (core differentiator)
3. **P2**: SEO & meta tags (visibility)
4. **P3**: About page (brand storytelling)
5. **P4**: Belo integration (alternative payments)

# Tanda de 3: Core Product Wedge

> Expert Lens: Caran "Carandu" (Product & Strategy)
> Last Updated: December 7, 2025
> Purpose: Focus the platform on 3 flagship experiences

---

## The Problem

Mundo Tango has 900+ features and 127 pages. While comprehensive, this creates:
- Analysis paralysis for new users
- Unclear value proposition
- Diluted engineering focus
- Weak go-to-market message

---

## The Solution: Tanda de 3

A **tanda** is a set of 3-4 songs in tango, danced with one partner. Similarly, Mundo Tango's core value should be delivered in **3 flagship experiences** that prove the thesis.

### Wedge 1: Land in a New City
**User Story**: "As a tango dancer visiting Buenos Aires, I want to find tonight's best milonga and connect with local dancers before I arrive."

**Core Flow**:
1. Set travel destination and dates
2. See curated event list (scraped + community verified)
3. Request "tango host" match from locals
4. Get personalized recommendations from Mr. Blue

**Success Metric**: Time from signup to first event attendance < 48 hours

**Key Pages**:
- `/events` - Event discovery
- `/groups/:city` - City community
- `/mr-blue` - AI travel assistant

---

### Wedge 2: Find Your Perfect Dance Partner
**User Story**: "As a regular dancer, I want to find compatible dance partners in my city who match my skill level and schedule."

**Core Flow**:
1. Complete dance profile (style, level, availability)
2. Browse Talent Match recommendations
3. Send dance invitation
4. Schedule practice or event attendance together

**Success Metric**: Matches that result in real-world dance within 14 days > 30%

**Key Pages**:
- `/talent-match` - Partner matching
- `/profile` - Dance profile
- `/messages` - Direct messaging

---

### Wedge 3: Share Your Tango Moment
**User Story**: "As a dancer who just had an amazing milonga, I want to share the moment with friends and the global tango community."

**Core Flow**:
1. Post photo/video from event
2. Tag location, partners, DJ
3. Friends engage (likes, comments, reposts)
4. Content appears in city group and global feed

**Success Metric**: 40% of active users post at least 1x/month

**Key Pages**:
- `/feed` - Social feed
- `/memories` - Story/moments
- `/profile` - Personal gallery

---

## Feature Triage

### Keep (Directly Supports Wedges)
- Event scraping and discovery
- City groups
- User profiles with dance info
- Messaging
- Talent Match
- Mr. Blue AI
- Feed and posting

### Demote (Hide from Primary Navigation)
- Housing marketplace (move to secondary menu)
- Marketplace (move to secondary menu)
- Advanced admin tools
- Developer documentation
- Financial tools (until monetization)

### Defer (Future Phases)
- Live streaming
- Video tutorials
- Music library
- Complex group features
- Enterprise features

---

## Homepage Redesign

Current: Feature showcase with 10+ sections
Proposed: Wedge-focused hero with 3 CTAs

```
┌────────────────────────────────────────────────────┐
│                                                    │
│        "Where Tango Lives"                         │
│                                                    │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │ Find Events  │ │ Find Partner │ │ Share      │ │
│  │ Near You     │ │ Match        │ │ Moments    │ │
│  └──────────────┘ └──────────────┘ └────────────┘ │
│                                                    │
│             [ Join the Community ]                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Marketing Message

**Before**: "The complete platform for tango dancers worldwide with 127 features..."

**After**: "Land in any city, find your dance partner, share the moment. Mundo Tango."

---

## OKRs for Wedge Validation

### Objective: Prove Wedge 1 (Land in a New City)
- KR1: 100 users complete "travel intent" flow
- KR2: 50% of those attend an event within 48hrs
- KR3: NPS > 40 for travel experience

### Objective: Prove Wedge 2 (Find Partner)
- KR1: 500 Talent Match profiles created
- KR2: 200 matches initiated
- KR3: 30% result in real-world dance

### Objective: Prove Wedge 3 (Share Moments)
- KR1: 40% MAU post at least monthly
- KR2: Average engagement per post > 5 actions
- KR3: 20% of posts shared outside platform

---

## Implementation Priority

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1-2 | Wedge 1 Polish | Event discovery UX, Mr. Blue travel mode |
| 3-4 | Wedge 2 Polish | Talent Match onboarding, match quality |
| 5-6 | Wedge 3 Polish | Posting flow, social engagement |
| 7-8 | Navigation | Hide demoted features, new homepage |

---

## Success Criteria

The wedge strategy succeeds when:
1. New users can describe Mundo Tango's value in one sentence
2. 3 core flows have <3 step friction
3. 60% of DAU touches at least one wedge daily
4. Word-of-mouth referral rate > 20%

---

*"A tanda is only 3 songs. Make each one count."*

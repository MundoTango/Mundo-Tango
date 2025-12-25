# Landing Page Design Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** LandingPageAgent | **Invocation:** `use mb.md: pages:landing`

---

## 1. Overview

The Landing Page is the primary marketing entry point for Mundo Tango. It showcases the platform's value proposition, features, and social proof to convert visitors into registered users.

**Component:** `client/src/pages/LandingPage.tsx` (868 lines)

### MB.MD References
- **Agent:** `use mb.md: agents:page` → LandingPageAgent
- **Operations:** `use mb.md: operations` → 10-step workflow
- **Patterns:** `use mb.md: patterns:core` → Pattern #4 (Marketing)

---

## 2. Data Architecture

### 2.1 Dynamic Data Sources

| Data | Source | Endpoint |
|------|--------|----------|
| Platform Stats | Database aggregation | `/api/stats/public` |
| Event Count | `events` table count | Included in stats |
| City Count | `cities` table count | Included in stats |
| Member Count | `users` table count | Included in stats |

### 2.2 Stats Response Schema

```typescript
interface PublicStats {
  dancers: number | null;
  teachers: number | null;
  organizers: number | null;
  events: number | null;
  cities: string | null;
  countries: number | null;
  platformStats: {
    yearsBuilding: number;
    hoursInvested: number;
    amountInvested: number;
    foundedYear: number;
    startedDancing: string;
    yearsOfDancing: number;
    trips: number;
    cities: number;
    countries: number;
  };
}
```

---

## 3. URL Routing

| Pattern | Access | Behavior |
|---------|--------|----------|
| `/` | Public | Landing page (default) |
| `/home` | Authenticated | Redirects to feed |

### 3.1 SEO Configuration

```typescript
<title>Mundo Tango - Global Tango Community Platform</title>
<meta name="description" content="Connect with tango dancers worldwide, discover events, find housing, and grow your tango journey. Join thousands of passionate dancers." />
<meta property="og:title" content="Mundo Tango - Global Tango Community Platform" />
<meta property="og:description" content="Connect with tango dancers worldwide..." />
<meta property="og:type" content="website" />
<meta property="og:image" content="/og-image.jpg" />
```

---

## 4. Page Structure

### 4.1 Layout Diagram

```
┌────────────────────────────────────────────────────────────┐
│  [PublicNavbar]                                            │
├────────────────────────────────────────────────────────────┤
│  HERO SECTION                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Mundo Tango                                          │ │
│  │  "Connect. Dance. Belong."                           │ │
│  │  [Get Started] [Watch Demo]                          │ │
│  └──────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│  STATS BAR                                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                         │
│  │ 500+│ │1000+│ │ 50+ │ │ 20+ │                         │
│  │Users│ │Event│ │City │ │Cntry│                         │
│  └─────┘ └─────┘ └─────┘ └─────┘                         │
├────────────────────────────────────────────────────────────┤
│  FEATURES SECTION (8 feature cards)                        │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                             │
│  │Map │ │ AI │ │Event│ │Home│                             │
│  └────┘ └────┘ └────┘ └────┘                             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                             │
│  │Pro │ │Live│ │Blue│ │Lang│                             │
│  └────┘ └────┘ └────┘ └────┘                             │
├────────────────────────────────────────────────────────────┤
│  HOW IT WORKS (4 steps)                                    │
│  1. Create Profile → 2. Discover → 3. Connect → 4. Grow   │
├────────────────────────────────────────────────────────────┤
│  CTA SECTION                                               │
│  "Join the Global Tango Community"                         │
│  [Sign Up Now]                                             │
├────────────────────────────────────────────────────────────┤
│  FOOTER                                                    │
│  Links | Social | Copyright                                │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Section Specifications

### 5.1 Hero Section

| Element | Content | Styling |
|---------|---------|---------|
| Headline | "Mundo Tango" | text-5xl font-bold |
| Tagline | "Connect. Dance. Belong." | text-xl text-muted-foreground |
| Primary CTA | "Get Started" | Button variant="default" |
| Secondary CTA | "Watch Demo" | Button variant="outline" |

### 5.2 Features Grid

8 features displayed in 2 rows of 4 cards:

| Feature | Icon | Description |
|---------|------|-------------|
| Global Tango Map | MapPin | Discover dancers, events, communities |
| AI-Powered Matching | Bot | Mr. Blue AI connects you with dancers |
| Event Discovery | Calendar | Find milongas, practicas, festivals |
| Housing Marketplace | Home | Stay with local tango dancers |
| Professional Networking | Briefcase | Connect with teachers, organizers |
| Live Streaming | Video | Virtual milongas, online classes |
| Mr. Blue AI | Bot | Personal tango companion 24/7 |
| Multi-Language | Globe | 68 languages supported |

### 5.3 How It Works

4-step onboarding flow visualization:

| Step | Icon | Title | Description |
|------|------|-------|-------------|
| 1 | UserPlus | Create Your Profile | Share tango journey, experience |
| 2 | Search | Discover | Browse events, find partners |
| 3 | MessageCircle | Connect | Message, join chats, RSVP |
| 4 | TrendingUp | Grow | Track progress, build network |

---

## 6. Interactive Elements

### 6.1 Demo Modal

```typescript
<DemoModal 
  isOpen={demoModalOpen} 
  onClose={() => setDemoModalOpen(false)} 
/>
```

### 6.2 Animations

| Element | Animation | Library |
|---------|-----------|---------|
| Hero content | fadeInUp | framer-motion |
| Feature cards | staggerContainer | framer-motion |
| Stats | Counter animation | Custom |

---

## 7. API Endpoints

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/stats/public` | GET | Platform statistics | 5 min |

---

## 8. Permissions Matrix

| Action | Visitor | Member | Admin |
|--------|---------|--------|-------|
| View page | Yes | Yes | Yes |
| Click "Get Started" | Yes | N/A | N/A |
| View stats | Yes | Yes | Yes |
| Access demo | Yes | Yes | Yes |

---

## 9. Mobile Responsiveness

| Breakpoint | Layout Changes |
|------------|----------------|
| < 640px (sm) | Single column features, stacked CTAs |
| 640-768px (md) | 2-column feature grid |
| 768-1024px (lg) | 3-column feature grid |
| > 1024px (xl) | 4-column feature grid |

---

## 10. Internationalization

- Page supports 68 languages via i18next
- Stats labels translated
- Feature descriptions localized
- CTA buttons localized

---

## 11. Analytics Tracking

| Event | Trigger | Data |
|-------|---------|------|
| `page_view` | Page load | referrer, utm_params |
| `cta_click` | CTA button click | button_type, location |
| `demo_view` | Demo modal open | duration |
| `signup_start` | Register click | source |

---

## 12. Related Pages

| Page | Relationship |
|------|--------------|
| `/register` | Primary CTA destination |
| `/login` | Secondary nav link |
| `/about` | Footer link |
| `/events` | Feature link |
| `/housing` | Feature link |

---

## 13. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/LandingPage.tsx` | Main page component |
| `client/src/components/PublicNavbar.tsx` | Navigation bar |
| `client/src/components/marketing/DemoModal.tsx` | Demo video modal |
| `client/src/components/Footer.tsx` | Page footer |

---

## 14. Test Scenarios

### 14.1 E2E Tests

```
1. [New Context] Create browser context
2. [Browser] Navigate to /
3. [Verify] Assert hero section visible
4. [Verify] Assert stats display correctly
5. [Verify] Assert 8 feature cards rendered
6. [Browser] Click "Get Started"
7. [Verify] Assert redirect to /register
```

### 14.2 Mobile Tests

```
1. [New Context] Create mobile viewport (375x667)
2. [Browser] Navigate to /
3. [Verify] Assert single-column layout
4. [Verify] Assert responsive navbar
```

---

## 15. Performance

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | ~1.8s |
| FID | < 100ms | ~50ms |
| CLS | < 0.1 | ~0.05 |

---

## 16. Future Enhancements

| Priority | Enhancement | Status |
|----------|-------------|--------|
| P1 | A/B testing for CTAs | Planned |
| P2 | Personalized stats by region | Planned |
| P2 | Video hero background | Planned |
| P3 | Interactive world map preview | Planned |

---

*Every visitor. Every conversion. Perfect first impression.*

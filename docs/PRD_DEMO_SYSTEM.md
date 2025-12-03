# PRD: Demo System - Mundo Tango Marketing Site

**Version:** 1.0.0
**Created:** December 3, 2025
**Author:** Replit AI ↔ Mr Blue Collaboration
**Status:** In Development

---

## 1. Overview

### 1.1 Problem Statement
The Mundo Tango marketing site has:
- A dead "Watch Demo" button on the LandingPage hero section (no onClick handler)
- Hidden demo pages (`/mr-blue-demo`, `/mr-blue-avatar-demo`) not accessible from navigation
- No central demos hub showcasing platform features
- Zero demo discoverability for potential users

### 1.2 Solution
Build a comprehensive Demo System that:
1. Creates a central `/demos` hub page
2. Wires the "Watch Demo" button with a demo modal
3. Integrates demos into PublicNavbar and footer
4. Provides feature-specific interactive demos

### 1.3 Success Criteria
- All demo pages accessible from marketing site navigation
- "Watch Demo" button functional with modal/link
- Zero dead links or broken navigation
- E2E tests passing for all demo flows

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US1 | Visitor | Click "Watch Demo" and see platform features | I can understand what Mundo Tango offers |
| US2 | Dancer | See demo of Events discovery | I know how to find milongas and festivals |
| US3 | Teacher | See demo of PRO features | I understand teaching tools available |
| US4 | Organizer | See demo of Event management | I can evaluate platform for my events |

---

## 3. Demo System Architecture

### 3.1 Page Structure

```
/demos                     # Main demos hub
├── Hero Section           # Platform overview video/animation
├── Feature Grid           # Links to individual demos
│   ├── Mr Blue AI         # /mr-blue-demo
│   ├── 3D Avatar          # /mr-blue-avatar-demo
│   ├── Events Discovery   # Interactive showcase
│   ├── Talent Match       # AI matching demo
│   └── Travel Planner     # Trip planning demo
└── CTA Section            # Sign up prompt

/mr-blue-demo              # Existing - Mr Blue video states
/mr-blue-avatar-demo       # Existing - 3D avatar demo
```

### 3.2 Component Hierarchy

```
DemosPage.tsx
├── DemoHeroSection
│   ├── Animated gradient background
│   └── Platform overview text
├── DemoGrid
│   ├── DemoCard (Mr Blue AI)
│   ├── DemoCard (3D Avatar)
│   ├── DemoCard (Events)
│   ├── DemoCard (Talent Match)
│   └── DemoCard (Travel)
└── DemoCTASection
    └── Register button
```

### 3.3 Watch Demo Button Flow

```
LandingPage "Watch Demo" Button
    ↓ onClick
Demo Modal (Dialog)
    ├── Platform overview content
    ├── Feature highlights with animations
    └── "Explore All Demos" → /demos
```

---

## 4. Technical Specification

### 4.1 New Files

| File | Description |
|------|-------------|
| `client/src/pages/DemosPage.tsx` | Main demos hub page |
| `client/src/components/marketing/DemoModal.tsx` | Watch Demo modal component |

### 4.2 Modified Files

| File | Changes |
|------|---------|
| `client/src/pages/LandingPage.tsx` | Wire "Watch Demo" button |
| `client/src/App.tsx` | Add /demos route |
| `client/src/components/layout/PublicNavbar.tsx` | Add Demos link |

### 4.3 Route Configuration

```typescript
// App.tsx additions
const DemosPage = lazy(() => import("@/pages/DemosPage"));

// Routes
<Route path="/demos" component={DemosPage} />
```

---

## 5. Design Specifications

### 5.1 Demos Hub Page

- **Hero:** Ocean gradient background with "Experience Mundo Tango" heading
- **Grid:** 2-3 columns of demo cards with hover animations
- **Cards:** Icon + Title + Description + "Try Demo" button
- **CTA:** Full-width section with "Join Free" call-to-action

### 5.2 Demo Modal

- **Trigger:** LandingPage "Watch Demo" button
- **Content:** Platform feature highlights with icons
- **Actions:** "Explore All Demos" button linking to /demos

---

## 6. Implementation Plan

### 6.1 Squad Assignments (Pattern 41)

| Squad | Task | Agent Type | Priority |
|-------|------|------------|----------|
| A | Create DemosPage.tsx | Frontend Agent | P0 |
| B | Wire Watch Demo button + modal | Frontend Agent | P0 |
| C | Update PublicNavbar + footer | Navigation Agent | P1 |
| D | E2E testing | Testing Agent | P1 |
| E | Documentation | Docs Agent | P2 |

### 6.2 Execution Timeline

1. **Phase 1 (5 min):** Create DemosPage.tsx with demo grid
2. **Phase 2 (5 min):** Create DemoModal.tsx and wire button
3. **Phase 3 (3 min):** Add route to App.tsx
4. **Phase 4 (3 min):** Update navigation
5. **Phase 5 (5 min):** E2E tests
6. **Phase 6 (2 min):** Documentation update

---

## 7. Acceptance Criteria

- [ ] `/demos` page loads with all demo cards
- [ ] "Watch Demo" button opens modal
- [ ] Modal has "Explore All Demos" link to /demos
- [ ] All demo cards navigate to correct pages
- [ ] PublicNavbar shows "Demos" link
- [ ] Footer includes demos section
- [ ] E2E tests pass for demo navigation

---

## 8. Related Documents

- `replit.md` - Platform documentation
- `mb.md` - MB.MD Methodology (Pattern 28, 41)
- `design_guidelines.md` - UI/UX standards

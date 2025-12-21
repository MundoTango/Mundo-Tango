# Onboarding Pages Design Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** OnboardingPageAgent | **Invocation:** `use mb.md: pages:onboarding`

---

## 1. Overview

The Onboarding flow guides new users through profile setup, tango preferences, and community discovery. It consists of multiple sequential steps that collect essential information and personalize the user experience.

**Directory:** `client/src/pages/onboarding/`

### MB.MD References
- **Agent:** `use mb.md: agents:page` → OnboardingPageAgent
- **Operations:** `use mb.md: operations` → 10-step workflow
- **Related:** `use mb.md: pages:auth` → Post-registration redirect

---

## 2. Onboarding Steps

| Step | Page | Purpose |
|------|------|---------|
| 1 | Welcome | Introduction, set expectations |
| 2 | City Selection | Choose home city |
| 3 | Tango Roles | Select dance roles |
| 4 | Dance Experience | Years dancing, levels |
| 5 | Languages | Spoken languages |
| 6 | Photo Upload | Profile picture |
| 7 | Guided Tour | Platform walkthrough |
| 8 | Subscription | Premium offering (optional) |

---

## 3. Data Architecture

### 3.1 User Profile Fields

```sql
users (
  -- Onboarding-related fields
  city: varchar,
  country: varchar,
  tangoRoles: text[], -- ['leader', 'follower', 'dj', etc]
  yearsOfDancing: integer,
  leaderLevel: integer (1-10),
  followerLevel: integer (1-10),
  languages: text[],
  profileImage: text,
  onboardingCompleted: boolean DEFAULT false,
  onboardingStep: integer DEFAULT 0
)
```

### 3.2 Onboarding Progress

| Field | Purpose |
|-------|---------|
| `onboardingCompleted` | True when all steps done |
| `onboardingStep` | Current step (0-7) |

---

## 4. Step 1: Welcome Page

### 4.1 Layout

```
┌────────────────────────────────────────────────────────────┐
│                    ┌──────────────────┐                    │
│                    │  🌹 Welcome to   │                    │
│                    │   Mundo Tango!   │                    │
│                    │                  │                    │
│                    │  Let's set up    │                    │
│                    │  your profile    │                    │
│                    │                  │                    │
│                    │  ━━━━━━━━━━━━━   │                    │
│                    │  5 quick steps   │                    │
│                    │  2 minutes       │                    │
│                    │                  │                    │
│                    │  [Get Started]   │                    │
│                    │                  │                    │
│                    │  Skip for now    │                    │
│                    └──────────────────┘                    │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Step 2: City Selection

### 5.1 Layout

```
┌────────────────────────────────────────────────────────────┐
│  [Progress: ●○○○○○]                            [Skip]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Where do you dance?                                       │
│                                                            │
│  [Search city...]                                          │
│                                                            │
│  Popular Cities:                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │🇦🇷 Buenos│ │🇩🇪 Berlin│ │🇫🇷 Paris │ │🇺🇸 NYC   │          │
│  │ Aires   │ │         │ │         │ │         │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                            │
│  [Continue]                                                │
└────────────────────────────────────────────────────────────┘
```

### 5.2 Features

| Feature | Behavior |
|---------|----------|
| City search | Autocomplete with all cities |
| Popular cities | Quick-select for common choices |
| Create city | If city not found |
| Country auto-fill | Based on city selection |

---

## 6. Step 3: Tango Roles

### 6.1 Layout

```
┌────────────────────────────────────────────────────────────┐
│  [Progress: ●●○○○○]                            [Skip]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  What's your role in tango?                                │
│  (Select all that apply)                                   │
│                                                            │
│  ┌─────────────┐ ┌─────────────┐                          │
│  │ 💃 Leader   │ │ 💃 Follower │                          │
│  │    ○        │ │    ○        │                          │
│  └─────────────┘ └─────────────┘                          │
│                                                            │
│  Are you also a professional?                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │🎵 DJ    │ │👨‍🏫Teacher│ │📋Organiz│ │🎭Perform│          │
│  │   ○     │ │   ○     │ │   ○     │ │   ○     │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                            │
│  [Continue]                                                │
└────────────────────────────────────────────────────────────┘
```

### 6.2 Role Options

| Role | Value | Description |
|------|-------|-------------|
| Leader | `leader` | Dance as leader |
| Follower | `follower` | Dance as follower |
| DJ | `dj` | Tango music DJ |
| Teacher | `teacher` | Tango instructor |
| Organizer | `organizer` | Event organizer |
| Performer | `performer` | Stage performer |

---

## 7. Step 4: Dance Experience

### 7.1 Layout

```
┌────────────────────────────────────────────────────────────┐
│  [Progress: ●●●○○○]                            [Skip]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  How long have you been dancing tango?                     │
│                                                            │
│  [──────●──────────] 3 years                               │
│                                                            │
│  Your skill level:                                         │
│                                                            │
│  As Leader:                                                │
│  [●●●●●●○○○○] Level 6 - Intermediate                      │
│                                                            │
│  As Follower:                                              │
│  [●●●●○○○○○○] Level 4 - Beginner+                         │
│                                                            │
│  [Continue]                                                │
└────────────────────────────────────────────────────────────┘
```

### 7.2 Level Descriptions

| Level | Name | Description |
|-------|------|-------------|
| 1-2 | Beginner | Just started |
| 3-4 | Beginner+ | Comfortable with basics |
| 5-6 | Intermediate | Good technique |
| 7-8 | Advanced | Strong dancer |
| 9-10 | Expert | Professional level |

---

## 8. Step 5: Languages

### 8.1 Layout

```
┌────────────────────────────────────────────────────────────┐
│  [Progress: ●●●●○○]                            [Skip]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  What languages do you speak?                              │
│                                                            │
│  Primary language:                                         │
│  [Spanish ▼]                                               │
│                                                            │
│  Additional languages:                                     │
│  [+] Add language                                          │
│                                                            │
│  Selected: Spanish, English, Portuguese                    │
│  [Spanish ×] [English ×] [Portuguese ×]                    │
│                                                            │
│  [Continue]                                                │
└────────────────────────────────────────────────────────────┘
```

---

## 9. Step 6: Photo Upload

### 9.1 Layout

```
┌────────────────────────────────────────────────────────────┐
│  [Progress: ●●●●●○]                            [Skip]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Add a profile photo                                       │
│                                                            │
│         ┌───────────────┐                                  │
│         │               │                                  │
│         │    📷         │                                  │
│         │               │                                  │
│         │  Click or     │                                  │
│         │  drag to      │                                  │
│         │  upload       │                                  │
│         │               │                                  │
│         └───────────────┘                                  │
│                                                            │
│  Tips:                                                     │
│  • Use a clear face photo                                  │
│  • Tango dancing photos work great                         │
│                                                            │
│  [Continue]                                                │
└────────────────────────────────────────────────────────────┘
```

---

## 10. Step 7: Guided Tour

### 10.1 Tour Points

| Point | Element | Message |
|-------|---------|---------|
| 1 | Feed | "Your personalized tango feed" |
| 2 | Events | "Discover milongas near you" |
| 3 | Map | "Find dancers worldwide" |
| 4 | Messages | "Connect with the community" |
| 5 | Profile | "Your tango identity" |

### 10.2 Tour Component

```typescript
<ReactJoyride
  steps={tourSteps}
  continuous
  showProgress
  showSkipButton
  callback={handleTourEnd}
/>
```

---

## 11. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/onboarding/progress` | GET | Get current step |
| `/api/onboarding/progress` | PUT | Update step |
| `/api/onboarding/city` | PUT | Save city |
| `/api/onboarding/roles` | PUT | Save roles |
| `/api/onboarding/experience` | PUT | Save experience |
| `/api/onboarding/languages` | PUT | Save languages |
| `/api/onboarding/photo` | POST | Upload photo |
| `/api/onboarding/complete` | POST | Mark complete |

---

## 12. Permissions Matrix

| Action | New User | Existing User |
|--------|----------|---------------|
| View onboarding | Yes | If incomplete |
| Skip step | Yes | Yes |
| Complete step | Yes | Yes |
| Restart onboarding | No | In settings |

---

## 13. Mobile Responsiveness

| Breakpoint | Behavior |
|------------|----------|
| < 640px | Full-screen steps, bottom nav |
| > 640px | Centered cards |

---

## 14. Internationalization

- All step content translated
- Role names localized
- City names in local language
- 68 languages supported

---

## 15. Analytics Tracking

| Event | Trigger | Data |
|-------|---------|------|
| `onboarding_start` | Begin flow | - |
| `onboarding_step` | Complete step | step_number |
| `onboarding_skip` | Skip step | step_number |
| `onboarding_complete` | Finish all | duration |
| `onboarding_abandon` | Leave early | last_step |

---

## 16. Related Pages

| Page | Relationship |
|------|--------------|
| `/register` | Leads to onboarding |
| `/home` | After onboarding |
| `/profile` | After photo upload |
| `/settings` | Restart onboarding |

---

## 17. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/OnboardingPage.tsx` | Main container |
| `client/src/pages/onboarding/WelcomePage.tsx` | Step 1 |
| `client/src/pages/onboarding/CitySelectionPage.tsx` | Step 2 |
| `client/src/pages/onboarding/TangoRolesPage.tsx` | Step 3 |
| `client/src/pages/onboarding/DanceExperiencePage.tsx` | Step 4 |
| `client/src/pages/onboarding/LanguagesPage.tsx` | Step 5 |
| `client/src/pages/onboarding/PhotoUploadPage.tsx` | Step 6 |
| `client/src/pages/onboarding/GuidedTourPage.tsx` | Step 7 |

---

## 18. Test Scenarios

### 18.1 E2E Tests

```
1. [New Context] Create browser context
2. [Browser] Register new user with unique email
3. [Verify] Assert redirect to /onboarding
4. [Browser] Click "Get Started"
5. [Browser] Select "Buenos Aires" city
6. [Browser] Click Continue
7. [Browser] Select "Leader" and "Follower" roles
8. [Browser] Continue through all steps
9. [Verify] Assert redirect to /home after completion
```

---

## 19. Future Enhancements

| Priority | Enhancement | Status |
|----------|-------------|--------|
| P1 | Video introduction option | Planned |
| P2 | AI role recommendations | Planned |
| P2 | Connect social accounts | Active |
| P3 | Dance style preferences | Backlog |

---

*First impression. Perfect setup. Your tango journey begins.*

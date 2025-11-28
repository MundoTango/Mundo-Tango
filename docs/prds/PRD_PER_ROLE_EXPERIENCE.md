# PRD: Per-Role Experience Tracking System

> **Version:** 1.0  
> **Created:** 2025-11-28  
> **Status:** Implementation  
> **Pattern:** MB.MD v9.5 Pattern 28 (Hierarchical Execution)

---

## Overview

Transform the single `yearsOfDancing` field into a flexible per-role experience tracking system where each tango role (from the 19 TANGO_ROLES) has its own start date, defaulting to the user's "when did you start tango" answer.

---

## Problem Statement

**Current Design:**
- `yearsOfDancing: integer` - Single value for all tango experience
- `tangoRoles: text[]` - Array of role strings without experience context
- Fails to capture nuanced experience: "I started dancing in 2007 but only began teaching in 2015"

**User Stories:**
- "I've been dancing for 17 years but only DJing for 3 years"
- "I want to show I'm an experienced dancer but new to organizing"
- "My teaching experience is different from my dancing experience"

---

## Proposed Solution

### Schema Changes

```typescript
// NEW: Per-role experience tracking
tangoRoleExperience: jsonb("tango_role_experience")
// Structure: [{ role: string, startYear: number }]
// Example: [
//   { role: "leader", startYear: 2007 },
//   { role: "follower", startYear: 2007 },
//   { role: "teacher", startYear: 2015 },
//   { role: "dj", startYear: 2020 }
// ]

// KEEP: Default start year (renamed for clarity)
tangoStartYear: integer("tango_start_year")
// This is the "When did you start tango?" answer
// All roles default to this year when first selected

// DEPRECATE (backwards compatibility):
yearsOfDancing: integer("years_of_dancing")
// Will be calculated as: currentYear - tangoStartYear
// Kept for legacy algorithm compatibility
```

### TypeScript Types

```typescript
interface TangoRoleExperience {
  role: string;      // From TANGO_ROLES values
  startYear: number; // e.g., 2007
}

interface User {
  // ... existing fields
  tangoRoleExperience: TangoRoleExperience[] | null;
  tangoStartYear: number | null;
  yearsOfDancing: number; // Calculated, deprecated
}
```

---

## User Flow

### Registration (DanceExperiencePage.tsx)

1. **Step 1:** "When did you start tango?" → Year picker (e.g., 2007)
   - Sets `tangoStartYear = 2007`

2. **Step 2:** Select tango roles (existing grid)
   - Each selected role gets default startYear from step 1

3. **Step 3:** Optional per-role customization
   - "Customize experience dates?" toggle
   - If yes, show grid: Role | Started
   - Leader: 2007 (editable)
   - Teacher: 2015 (editable)
   - DJ: 2020 (editable)

### Profile Edit (ProfileTabAbout.tsx)

- Display per-role experience with years calculated
- Edit mode shows same UI as registration step 3
- Save triggers cascade effects (recommendations refresh)

---

## Helper Functions

```typescript
// shared/utils/roleExperience.ts

export function calculateYearsInRole(
  user: User, 
  role: string,
  referenceYear: number = new Date().getFullYear()
): number {
  const roleExp = user.tangoRoleExperience?.find(r => r.role === role);
  if (roleExp) {
    return referenceYear - roleExp.startYear;
  }
  // Fallback to tangoStartYear or yearsOfDancing
  if (user.tangoStartYear) {
    return referenceYear - user.tangoStartYear;
  }
  return user.yearsOfDancing || 0;
}

export function getRoleExperience(
  user: User,
  role: string
): TangoRoleExperience | null {
  return user.tangoRoleExperience?.find(r => r.role === role) || null;
}

export function getMaxExperienceYears(user: User): number {
  if (!user.tangoRoleExperience?.length) {
    return user.yearsOfDancing || 0;
  }
  const currentYear = new Date().getFullYear();
  const minStartYear = Math.min(...user.tangoRoleExperience.map(r => r.startYear));
  return currentYear - minStartYear;
}

export function formatRoleExperience(
  user: User,
  role: string
): string {
  const years = calculateYearsInRole(user, role);
  if (years === 0) return "New";
  if (years === 1) return "1 year";
  return `${years} years`;
}
```

---

## Downstream Effects

### Files Requiring Updates

| File | Current Usage | Required Change |
|------|--------------|-----------------|
| `dance-partner-matching.ts` | `yearsOfDancing` in scoring | Use `calculateYearsInRole(user, 'leader/follower')` |
| `skill-level-assessment.ts` | `profile.yearsOfDancing / 10` | Use role-specific calculation |
| `ReputationService.ts` | `user.yearsOfDancing` | Use `getMaxExperienceYears(user)` |
| `NaturalLanguageTalentSearch.ts` | `yearsOfDancing >= X` | Filter by role-specific experience |
| `AIOutreachGenerator.ts` | `candidate.yearsOfDancing` | Use role-specific for context |
| `DanceExperiencePage.tsx` | Single years input | Per-role start year UI |
| `ProfileTabAbout.tsx` | Single years display | Per-role experience grid |

### Algorithm Weight Adjustments

**Dance Partner Matching (45% of score):**
- Leader matching: Use `calculateYearsInRole(user, 'leader')`
- Follower matching: Use `calculateYearsInRole(user, 'follower')`
- More accurate skill pairing

**Friend Recommendations (20% weight):**
- Compare role-specific experience for better matches
- "Find dancers with similar teaching experience"

**Talent Search:**
- Enable queries like "teachers with 5+ years experience"
- Filter DJs by DJ-specific experience, not dance experience

---

## Migration Strategy

### Phase 1: Add New Column
```sql
ALTER TABLE users ADD COLUMN tango_role_experience JSONB DEFAULT NULL;
```

### Phase 2: Migrate Existing Data
```typescript
// For each user with tangoRoles and yearsOfDancing:
const migratedExperience = user.tangoRoles.map(role => ({
  role,
  startYear: new Date().getFullYear() - (user.yearsOfDancing || 0)
}));
```

### Phase 3: Update Algorithms
- All algorithms use helper functions
- Helpers fall back to yearsOfDancing if tangoRoleExperience is null

### Phase 4: Deprecate yearsOfDancing
- Keep column for backwards compatibility
- Stop writing to it directly
- Calculate from tangoRoleExperience on read

---

## UI Mockups

### Registration - Per-Role Experience

```
┌─────────────────────────────────────────────────────┐
│ When did you start tango?                           │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 2007                                        ▼   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Your Roles (selected: 4)                            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Role          │ Started                         │ │
│ ├───────────────┼─────────────────────────────────┤ │
│ │ 💃 Leader     │ 2007                        ▼   │ │
│ │ 🕺 Follower   │ 2007                        ▼   │ │
│ │ 👨‍🏫 Teacher   │ 2015                        ▼   │ │
│ │ 🎧 DJ         │ 2020                        ▼   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Tip: Customize if you started roles at different   │
│ times. All default to your tango start year.       │
└─────────────────────────────────────────────────────┘
```

### Profile Display - Per-Role Experience

```
┌─────────────────────────────────────────────────────┐
│ 🎭 Tango Roles & Experience                         │
│                                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │ 💃       │ │ 🕺       │ │ 👨‍🏫      │ │ 🎧       ││
│ │ Leader   │ │ Follower │ │ Teacher  │ │ DJ       ││
│ │ 17 years │ │ 17 years │ │ 9 years  │ │ 4 years  ││
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│                                                     │
│ Dancing since 2007                                  │
└─────────────────────────────────────────────────────┘
```

---

## Success Metrics

- [ ] Schema migration completes without data loss
- [ ] Registration flow captures per-role start dates
- [ ] Profile edit allows per-role experience modification
- [ ] Partner matching uses role-specific years
- [ ] Talent search filters by role-specific experience
- [ ] Backwards compatibility maintained for legacy data

---

## Cross-References

- **Depends on:** [PRD_TANGO_ROLES_SYSTEM.md](./PRD_TANGO_ROLES_SYSTEM.md)
- **Updates:** [PRD_LOCATION_CHANGE_CASCADE.md](./PRD_LOCATION_CHANGE_CASCADE.md) (similar cascade pattern)
- **Affects:** Talent Match, Recommendations, Reputation

---

## Implementation Order (MB.MD Pattern 28)

**Wave 1 (Parallel):**
- Schema migration + helper functions
- PRD documentation

**Wave 2 (Parallel):**
- DanceExperiencePage.tsx (registration)
- ProfileTabAbout.tsx (profile edit)

**Wave 3 (Parallel):**
- dance-partner-matching.ts
- skill-level-assessment.ts
- ReputationService.ts
- NaturalLanguageTalentSearch.ts
- AIOutreachGenerator.ts

**Wave 4:**
- E2E tests
- Documentation updates

# PRD Index - Mundo Tango

> **Last Updated:** 2025-11-28  
> **Total PRDs:** 14  

---

## Overview

This index links all Product Requirement Documents (PRDs) in the Mundo Tango platform, organized by category with cross-references to the pages and features that use them.

---

## Standardized Components (Recently Created)

| PRD | Purpose | Key Files | Pages/Features Using |
|-----|---------|-----------|---------------------|
| [PRD_TANGO_ROLES_SYSTEM.md](./PRD_TANGO_ROLES_SYSTEM.md) | 19 unified tango role definitions | `lib/tangoRoles.ts`, `UserRoleBadges.tsx` | Onboarding, Profile, Search, Cards (15 files) |
| [PRD_PER_ROLE_EXPERIENCE.md](./PRD_PER_ROLE_EXPERIENCE.md) | Per-role experience tracking (JSONB) | `roleExperience.ts`, `schema.ts` | Registration, Profile, Matching, Talent Search (25+ files) |
| [PRD_UNIFIED_LOCATION_PICKER.md](./PRD_UNIFIED_LOCATION_PICKER.md) | 3-tier smart location search | `UnifiedLocationPicker.tsx` | Travel, Profile, Events, Groups, Onboarding (26 files) |
| [PRD_UNIFIED_FEEDS_SYSTEM.md](./PRD_UNIFIED_FEEDS_SYSTEM.md) | Unified post/memory display & creation | `UnifiedMemoriesFeed.tsx`, `PostCreator.tsx`, `SmartPostFeed.tsx` | Feed, Profile, Groups, Events, Saved Posts (20+ files) |
| [PRD_LOCATION_CHANGE_CASCADE.md](./PRD_LOCATION_CHANGE_CASCADE.md) | Location change effects cascade | `locationChangeEffects.ts`, `LocationChangeWelcome.tsx` | Profile Edit, Notifications, Groups |

---

## AI & Intelligence

| PRD | Purpose | Key Integration Points |
|-----|---------|------------------------|
| [PRD_MR_BLUE_CONTENT_STUDIO.md](./PRD_MR_BLUE_CONTENT_STUDIO.md) | AI content creation studio | VibeCoding, Visual Editor |
| [MR_BLUE_VISUAL_EDITOR_PRD.md](./MR_BLUE_VISUAL_EDITOR_PRD.md) | Mr. Blue visual editor integration | Visual Editor, Page Generation |
| [MB_MD_V9_5_VISUAL_EDITOR_PRD.md](./MB_MD_V9_5_VISUAL_EDITOR_PRD.md) | Visual Editor v9.5 specs | VibeCoding, Inline Editing |
| [MB_MD_PHASE_C_AUTONOMOUS_FRAMEWORK_PRD.md](./MB_MD_PHASE_C_AUTONOMOUS_FRAMEWORK_PRD.md) | Autonomous agent framework | AutoRetry, Escalation, Self-Healing |

---

## Business Features

| PRD | Purpose | Key Integration Points |
|-----|---------|------------------------|
| [PRD_ENHANCED_TALENT_MATCH.md](./PRD_ENHANCED_TALENT_MATCH.md) | AI-powered talent matching | Profiles, Search, Recommendations |
| [PRD_LIFE_CEO_FINANCE_ENHANCED.md](./PRD_LIFE_CEO_FINANCE_ENHANCED.md) | Financial planning AI | Life CEO, Goals, Budgeting |
| [PRD_LIFE_CEO_PRODUCTIVITY_2.0.md](./PRD_LIFE_CEO_PRODUCTIVITY_2.0.md) | Productivity AI assistant | Life CEO, Tasks, Calendar |
| [PRD_USER_PRIVACY_HUB.md](./PRD_USER_PRIVACY_HUB.md) | Privacy settings & controls | Settings, GDPR, Data Export |

---

## Verification

| PRD | Purpose |
|-----|---------|
| [TRACK_2_PRD_VERIFICATION_REPORT.md](./TRACK_2_PRD_VERIFICATION_REPORT.md) | PRD implementation verification |

---

## Cross-Reference Matrix

### By Page/Feature

| Page/Feature | Related PRDs |
|--------------|--------------|
| **Feed** (`/feed`) | Unified Feeds, Tango Roles |
| **Profile** (`/profile/:id`) | Tango Roles, Unified Feeds, Location Picker, Location Change Cascade, Per-Role Experience |
| **Events** (`/events`) | Location Picker, Unified Feeds |
| **Groups** (`/groups`) | Location Picker, Unified Feeds, Location Change Cascade |
| **Onboarding** (`/onboarding`) | Tango Roles, Location Picker, Per-Role Experience |
| **Travel** (`/profile/:id/travel`) | Location Picker, Location Change Cascade |
| **Visual Editor** | Mr. Blue PRDs, Content Studio |
| **Life CEO** | Finance Enhanced, Productivity 2.0 |
| **Search/Discovery** | Tango Roles, Talent Match, Per-Role Experience |
| **Settings** | Privacy Hub |

### By Component Type

| Component Type | PRDs |
|----------------|------|
| **UI Components** | Location Picker, Unified Feeds, Tango Roles |
| **Business Logic** | Location Change Cascade, Talent Match |
| **AI/ML** | Mr. Blue PRDs, Life CEO PRDs |
| **Security/Privacy** | Privacy Hub |

---

## Template

New PRDs should follow: [_PRD_TEMPLATE.md](./_PRD_TEMPLATE.md)

---

## Maintenance

- **Add new PRDs** to appropriate category table above
- **Update cross-references** when adding new features
- **Keep file counts current** as components are adopted

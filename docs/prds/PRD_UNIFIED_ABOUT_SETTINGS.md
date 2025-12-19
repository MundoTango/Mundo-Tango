# PRD: Unified About + Settings System

**Version:** 1.0  
**Created:** November 29, 2025  
**Status:** In Progress  
**MB.MD Pattern:** Hierarchical Execution (v9.3)

## Overview

Consolidate the separate Settings page into the Profile's About tab, creating a unified experience where users manage all profile information, privacy controls, notifications, and security in one place.

## Problem Statement

Currently users must navigate between:
- **Profile → About Tab**: Bio, location, tango roles, languages
- **Settings Page**: Account, privacy, notifications, security

This creates confusion and friction. Modern social platforms consolidate these into one profile management experience.

## Solution Architecture

### Sub-Tab Structure (Within About Tab)

```
About Tab
├── Profile        (Bio, Occupation, Social Links, Portfolio)
├── Location       (City/Country with cascade effects)
├── Tango          (Roles, Experience, Leader/Follower Levels)
├── Languages      (Spoken languages + UI preference)
├── Privacy        (Profile visibility + field-level toggles)
├── Notifications  (Email, Push preferences)
├── Security       (Password, 2FA)
└── Subscription   (Plan management - if applicable)
```

### Field-Level Privacy Toggles

Each customer-facing field gets a visibility selector:
- **Public** (everyone can see)
- **Friends Only** (only friends see)
- **Private** (hidden from all except owner)

**Fields with Privacy Toggles:**
- Bio
- Occupation
- Location (city/country)
- Languages
- Social Links
- Tango Roles
- Years of Experience
- Email (show on profile)
- Phone (show on profile)

## Database Schema Changes

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN bio_visibility VARCHAR(20) DEFAULT 'public';
ALTER TABLE users ADD COLUMN location_visibility VARCHAR(20) DEFAULT 'public';
ALTER TABLE users ADD COLUMN occupation_visibility VARCHAR(20) DEFAULT 'public';
ALTER TABLE users ADD COLUMN languages_visibility VARCHAR(20) DEFAULT 'public';
ALTER TABLE users ADD COLUMN social_links_visibility VARCHAR(20) DEFAULT 'public';
ALTER TABLE users ADD COLUMN tango_roles_visibility VARCHAR(20) DEFAULT 'public';
ALTER TABLE users ADD COLUMN experience_visibility VARCHAR(20) DEFAULT 'public';
ALTER TABLE users ADD COLUMN email_visibility VARCHAR(20) DEFAULT 'private';
ALTER TABLE users ADD COLUMN phone_visibility VARCHAR(20) DEFAULT 'private';

-- Visibility enum: 'public' | 'friends' | 'private'
```

## Component Architecture

### PrivacyToggle Component
```typescript
interface PrivacyToggleProps {
  field: string;
  currentValue: 'public' | 'friends' | 'private';
  onChange: (value: 'public' | 'friends' | 'private') => void;
  disabled?: boolean;
}
```

### AboutSubTabs Component
```typescript
const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'tango', label: 'Tango', icon: Music },
  { id: 'languages', label: 'Languages', icon: Languages },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'subscription', label: 'Subscription', icon: Crown }
];
```

## API Endpoints

### Get Privacy Settings
```
GET /api/users/:id/privacy-settings
Response: { bio_visibility, location_visibility, ... }
```

### Update Privacy Settings
```
PATCH /api/users/:id/privacy-settings
Body: { field: string, visibility: 'public' | 'friends' | 'private' }
```

### Profile Display Logic
```typescript
function shouldShowField(
  field: string, 
  visibility: string, 
  viewerId: number, 
  profileId: number,
  isFriend: boolean
): boolean {
  if (viewerId === profileId) return true; // Owner sees all
  if (visibility === 'public') return true;
  if (visibility === 'friends' && isFriend) return true;
  return false; // 'private' or non-friend
}
```

## Files Modified

### Schema
- `shared/schema.ts` - Add visibility columns

### Backend
- `server/routes/userRoutes.ts` - Privacy settings endpoints
- `server/storage.ts` - Privacy CRUD operations

### Frontend
- `client/src/components/profile/ProfileTabAbout.tsx` - Add sub-tabs, refactor
- `client/src/components/ui/privacy-toggle.tsx` - New component
- `client/src/pages/SettingsPage.tsx` - REMOVE
- `client/src/App.tsx` - Remove /settings route

## MB.MD Execution Phases

### Phase 1: Foundation (Replit AI)
- [x] Create PRD
- [ ] Schema additions
- [ ] PrivacyToggle component
- [ ] Sub-tabs structure

### Phase 2: Agent Coordination (Mr. Blue)
- [ ] Frontend integration agents
- [ ] Backend API agents
- [ ] Migration agents
- [ ] Testing agents

### Phase 3: Validation
- [ ] E2E tests for privacy toggles
- [ ] Sub-tab navigation tests
- [ ] Settings migration verification

## Success Criteria

1. Settings page removed
2. All Settings functionality accessible in About tab
3. Field-level privacy toggles work correctly
4. Non-friends cannot see private/friends-only fields
5. Sub-tab navigation smooth and intuitive
6. No regression in existing About tab functionality

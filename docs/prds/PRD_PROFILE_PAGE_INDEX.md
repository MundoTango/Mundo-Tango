# PRD: Profile Page Component Index

> **Version:** 1.0  
> **Created:** 2025-11-29  
> **Last Updated:** 2025-11-29  
> **Status:** Active  
> **Purpose:** Master index of all Profile Page components, tabs, and features with PRD cross-references

---

## 1. Overview

The Profile Page is the central user identity hub for the Mundo Tango platform. This index provides a complete map of all components, their current implementation status, and links to related PRDs.

**Main Page:** `/profile/:id`  
**Main Component:** `client/src/pages/ProfilePage.tsx` (885 lines)

---

## 2. Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROFILE PAGE ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        PROFILE HEADER                                │    │
│  │  Avatar | Cover Photo | Name | Bio | Location | Role Badges         │    │
│  │  [Follow] [Message] [Settings] [Dashboard/Customer Toggle]          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      PROFILE TABS NAVIGATION                         │    │
│  │  Feed | Memories | Travel | Events | Friends | Photos | About | PRO │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         TAB CONTENT AREA                             │    │
│  │                   (8 Core Tabs + 17 Legacy Tabs)                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Complete Component Index

### 3.1 Main Profile Page

| Component | File | Lines | Purpose | PRD |
|-----------|------|-------|---------|-----|
| **ProfilePage** | `client/src/pages/ProfilePage.tsx` | 885 | Main profile page with header, tabs, routing | [PRD_USER_PROFILE_SYSTEM.md](./PRD_USER_PROFILE_SYSTEM.md) |
| **ProfileTabsNav** | `client/src/components/ProfileTabsNav.tsx` | — | Tab navigation component | [PRD_USER_PROFILE_SYSTEM.md](./PRD_USER_PROFILE_SYSTEM.md) |

---

### 3.2 Core Profile Tabs (8 Tabs)

| Tab | Component File | Purpose | Status | PRD Reference |
|-----|----------------|---------|--------|---------------|
| **Feed** | `ProfileTabFeed.tsx` | User's posts timeline | ✅ Active | [PRD_UNIFIED_FEEDS_SYSTEM.md](./PRD_UNIFIED_FEEDS_SYSTEM.md) |
| **Memories** | `ProfileTabMemories.tsx` | Tango journey milestones | ✅ Active | [PRD_USER_PROFILE_SYSTEM.md](./PRD_USER_PROFILE_SYSTEM.md) |
| **Travel** | `ProfileTabTravel.tsx` | Trip planning & history | ✅ Active | [PRD_TRAVEL_PLANNING_SYSTEM.md](./PRD_TRAVEL_PLANNING_SYSTEM.md) |
| **Events** | `ProfileTabEvents.tsx` | Event participations & RSVP | ✅ Active | [PRD_USER_PROFILE_SYSTEM.md](./PRD_USER_PROFILE_SYSTEM.md) |
| **Friends** | `ProfileTabFriends.tsx` | Social connections | ⚠️ Basic | [PRD_USER_PROFILE_SYSTEM.md](./PRD_USER_PROFILE_SYSTEM.md) |
| **Photos** | `ProfileTabPhotos.tsx` | Photo gallery | ✅ Active | [PRD_USER_PROFILE_SYSTEM.md](./PRD_USER_PROFILE_SYSTEM.md) |
| **About** | `ProfileTabAbout.tsx` | Bio, location, roles, settings | ✅ Active | [PRD_UNIFIED_ABOUT_SETTINGS.md](./PRD_UNIFIED_ABOUT_SETTINGS.md) |
| **PRO** | `ProfileTabPro.tsx` | Professional portfolio | ✅ Active | [PRD_UNIFIED_PRO_TAB.md](./PRD_UNIFIED_PRO_TAB.md) |

---

### 3.3 About Tab Sub-Tabs (5 Sub-Tabs)

| Sub-Tab | Component File | Purpose | Status | PRD Reference |
|---------|----------------|---------|--------|---------------|
| **Profile** | `ProfileTabAbout.tsx` (embedded) | Personal info editing | ✅ Active | [PRD_USER_PROFILE_SYSTEM.md](./PRD_USER_PROFILE_SYSTEM.md) |
| **Privacy** | `settings/PrivacySubTab.tsx` | Privacy controls | ✅ Active | [PRD_PRIVACY_SETTINGS_TAB.md](./PRD_PRIVACY_SETTINGS_TAB.md) |
| **Notifications** | `settings/NotificationsSubTab.tsx` | Notification preferences | ✅ Active | [PRD_NOTIFICATIONS_SETTINGS_TAB.md](./PRD_NOTIFICATIONS_SETTINGS_TAB.md) |
| **Security** | `settings/SecuritySubTab.tsx` | Password, 2FA, sessions | ✅ Active | [PRD_SECURITY_SETTINGS_TAB.md](./PRD_SECURITY_SETTINGS_TAB.md) |
| **Subscription** | `settings/SubscriptionSubTab.tsx` | Billing, plans | ✅ Active | [PRD_SUBSCRIPTION_SETTINGS_TAB.md](./PRD_SUBSCRIPTION_SETTINGS_TAB.md) |

**Sub-Tab Navigation Component:** `AboutSubTabs.tsx`

---

### 3.4 Legacy Role-Based Tabs (17 Tabs → Consolidating into PRO)

These tabs are being consolidated into the unified PRO tab:

| Legacy Tab | Component File | Tango Role | Status | Target |
|------------|----------------|------------|--------|--------|
| **Teacher** | `ProfileTabTeacher.tsx` | `teacher` | 📦 Pending | → PRO Tab |
| **DJ** | `ProfileTabDJ.tsx` | `dj` | 📦 Pending | → PRO Tab |
| **Performer** | `ProfileTabPerformer.tsx` | `performer` | 📦 Pending | → PRO Tab |
| **Photographer** | `ProfileTabPhotographer.tsx` | `photographer` | 📦 Pending | → PRO Tab |
| **Organizer** | `ProfileTabOrganizer.tsx` | `organizer` | 📦 Pending | → PRO Tab |
| **Musician** | `ProfileTabMusician.tsx` | `musician` | 📦 Pending | → PRO Tab |
| **Choreographer** | `ProfileTabChoreographer.tsx` | `choreographer` | 📦 Pending | → PRO Tab |
| **Vendor** | `ProfileTabVendor.tsx` | `vendor` | 📦 Pending | → PRO Tab |
| **Tango School** | `ProfileTabTangoSchool.tsx` | `tango-school` | 📦 Pending | → PRO Tab |
| **Tango Hotel** | `ProfileTabTangoHotel.tsx` | `tango-hotel` | 📦 Pending | → PRO Tab |
| **Wellness** | `ProfileTabWellness.tsx` | `wellness` | 📦 Pending | → PRO Tab |
| **Tour Operator** | `ProfileTabTourOperator.tsx` | `tour-operator` | 📦 Pending | → PRO Tab |
| **Host Venue** | `ProfileTabHostVenue.tsx` | `host-venue` | 📦 Pending | → PRO Tab |
| **Tango Guide** | `ProfileTabTangoGuide.tsx` | `tango-guide` | 📦 Pending | → PRO Tab |
| **Content Creator** | `ProfileTabContentCreator.tsx` | `content-creator` | 📦 Pending | → PRO Tab |
| **Learning Resource** | `ProfileTabLearningResource.tsx` | `learning-resource` | 📦 Pending | → PRO Tab |
| **Taxi Dancer** | `ProfileTabTaxiDancer.tsx` | `taxi-dancer` | 📦 Pending | → PRO Tab |

**Consolidation PRD:** [PRD_UNIFIED_PRO_TAB.md](./PRD_UNIFIED_PRO_TAB.md)

---

### 3.5 Supporting Components

| Component | File | Purpose | PRD |
|-----------|------|---------|-----|
| **DashboardCustomerToggle** | `DashboardCustomerToggle.tsx` | Switch between dashboard/customer view | [PRD_USER_PROFILE_SYSTEM.md](./PRD_USER_PROFILE_SYSTEM.md) |
| **PhotoUploadDialog** | `PhotoUploadDialog.tsx` | Profile/cover photo upload modal | — |
| **AboutSubTabs** | `AboutSubTabs.tsx` | Sub-tab navigation for About tab | [PRD_UNIFIED_ABOUT_SETTINGS.md](./PRD_UNIFIED_ABOUT_SETTINGS.md) |

---

## 4. Feature Details

### 4.1 ProfileTabEvents - RSVP System (Updated Nov 30, 2025)

> **Full Documentation:** [PRD_RSVP_ARCHITECTURE.md](./PRD_RSVP_ARCHITECTURE.md)

| Feature | Description |
|---------|-------------|
| **RSVP States** | `going` (green), `maybe` (yellow), `not_going` (red), `interested` (blue), `null` (default) |
| **Dropdown Menu** | All options always visible with status-specific icons |
| **Mutation** | Immediate UI update via `useRSVPEvent` hook + cache invalidation |
| **Query Key** | `['/api/events', eventId, 'attendees', { status: 'all' }]` |
| **API Endpoint** | `GET /api/events/:id/attendees?status=all` (fetches ALL statuses) |
| **Data Structure** | Array of `{ rsvp: {...}, user: {...} }` objects |

**Critical Fix (Nov 30):** Backend now supports `status=all` query parameter to return all RSVP types, fixing persistence bug where 'maybe'/'not_going' disappeared on refresh.

### 4.2 ProfileTabAbout - Cascade Effects

| Trigger | Effect | PRD |
|---------|--------|-----|
| **Role Change** | Auto-join/leave PRO groups | [PRD_ROLE_CHANGE_CASCADE.md](./PRD_ROLE_CHANGE_CASCADE.md) |
| **Location Change** | Auto-join city groups, welcome notification | [PRD_LOCATION_CHANGE_CASCADE.md](./PRD_LOCATION_CHANGE_CASCADE.md) |

### 4.3 ProfileTabPhotos - Gallery Features

| Feature | Description |
|---------|-------------|
| **Max Photos** | 6 slots |
| **Drag-Drop** | Reorder via react-beautiful-dnd |
| **Compression** | Client-side image compression before upload |
| **States** | empty → preview → uploading → uploaded |

---

## 5. Data Flow Diagram

```
                          ┌─────────────────┐
                          │     users       │
                          │     TABLE       │
                          └────────┬────────┘
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       │                           │                           │
       ▼                           ▼                           ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│    ABOUT     │◄────────►│     PRO      │◄────────►│    EVENTS    │
│  tangoRoles  │          │   portfolio  │          │    RSVPs     │
│  languages   │          │   verified   │          │ participations│
│   location   │          │   history    │          │              │
└──────────────┘          └──────────────┘          └──────────────┘
       │                           │                           │
       │                           │                           │
       ▼                           ▼                           ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│    TRAVEL    │          │   MEMORIES   │          │    PHOTOS    │
│  trip plans  │          │  milestones  │          │   gallery    │
│   events     │          │  journey     │          │   6 slots    │
└──────────────┘          └──────────────┘          └──────────────┘
       │                           │
       │                           │
       └───────────────┬───────────┘
                       │
                       ▼
                ┌──────────────┐
                │    FEED      │
                │    posts     │
                │   memories   │
                └──────────────┘
```

---

## 6. API Endpoints

### Profile APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users/:id` | Fetch user profile |
| PATCH | `/api/users/:id` | Update profile fields |
| POST | `/api/profile/photo` | Upload profile photo |
| POST | `/api/profile/cover` | Upload cover photo |
| GET | `/api/profile/photos` | Get photo gallery |
| POST | `/api/profile/photos` | Add gallery photo |
| DELETE | `/api/profile/photos/:id` | Remove gallery photo |
| PATCH | `/api/profile/photos/reorder` | Reorder photos |

### Event APIs (Profile Tab)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users/:id/events` | User's event participations |
| GET | `/api/events/:id/attendees?status=all` | All RSVPs for event (default) |
| GET | `/api/events/:id/attendees?status=going` | Confirmed attendees only |
| POST | `/api/events/:id/rsvp` | Create/update RSVP |

### Social APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users/:id/friends` | User's friends list |
| POST | `/api/friendships` | Send friend request |
| POST | `/api/users/:id/follow` | Follow user |
| DELETE | `/api/users/:id/follow` | Unfollow user |

---

## 7. PRD Cross-Reference Matrix

| PRD Document | Components Using | Key Features |
|--------------|------------------|--------------|
| [PRD_USER_PROFILE_SYSTEM.md](./PRD_USER_PROFILE_SYSTEM.md) | All profile tabs | Master documentation |
| [PRD_UNIFIED_PRO_TAB.md](./PRD_UNIFIED_PRO_TAB.md) | ProfileTabPro, 17 legacy tabs | Role consolidation |
| [PRD_UNIFIED_FEEDS_SYSTEM.md](./PRD_UNIFIED_FEEDS_SYSTEM.md) | ProfileTabFeed | Post/memory display |
| [PRD_TRAVEL_PLANNING_SYSTEM.md](./PRD_TRAVEL_PLANNING_SYSTEM.md) | ProfileTabTravel | Trip planning |
| [PRD_UNIFIED_LOCATION_PICKER.md](./PRD_UNIFIED_LOCATION_PICKER.md) | ProfileTabAbout | Location selection |
| [PRD_UNIFIED_LANGUAGE_SYSTEM.md](./PRD_UNIFIED_LANGUAGE_SYSTEM.md) | ProfileTabAbout | Language selection |
| [PRD_TANGO_ROLES_SYSTEM.md](./PRD_TANGO_ROLES_SYSTEM.md) | ProfileTabAbout, ProfileTabPro | 20 tango roles |
| [PRD_PER_ROLE_EXPERIENCE.md](./PRD_PER_ROLE_EXPERIENCE.md) | ProfileTabAbout | Experience tracking |
| [PRD_ROLE_CHANGE_CASCADE.md](./PRD_ROLE_CHANGE_CASCADE.md) | ProfileTabAbout | Role cascade effects |
| [PRD_LOCATION_CHANGE_CASCADE.md](./PRD_LOCATION_CHANGE_CASCADE.md) | ProfileTabAbout | Location cascade effects |
| [PRD_CASCADE_FRAMEWORK.md](./PRD_CASCADE_FRAMEWORK.md) | ProfileTabAbout | Unified cascade architecture |
| [PRD_PRIVACY_SETTINGS_TAB.md](./PRD_PRIVACY_SETTINGS_TAB.md) | PrivacySubTab | Privacy controls |
| [PRD_SECURITY_SETTINGS_TAB.md](./PRD_SECURITY_SETTINGS_TAB.md) | SecuritySubTab | Security settings |
| [PRD_NOTIFICATIONS_SETTINGS_TAB.md](./PRD_NOTIFICATIONS_SETTINGS_TAB.md) | NotificationsSubTab | Notification prefs |
| [PRD_SUBSCRIPTION_SETTINGS_TAB.md](./PRD_SUBSCRIPTION_SETTINGS_TAB.md) | SubscriptionSubTab | Billing/plans |

---

## 8. Component Statistics

| Category | Count | Status |
|----------|-------|--------|
| **Core Tabs** | 8 | ✅ All Active |
| **About Sub-Tabs** | 5 | ✅ All Active |
| **Legacy Role Tabs** | 17 | 📦 Pending Consolidation |
| **Supporting Components** | 3 | ✅ Active |
| **Total Components** | 33 | — |
| **PRDs Referenced** | 15 | ✅ Documented |

---

## 9. Recent Updates

| Date | Component | Change | Author |
|------|-----------|--------|--------|
| 2025-11-29 | ProfileTabEvents | RSVP mutation system with 3 states | Replit AI |
| 2025-11-29 | ProfileTabEvents | Not Going option always visible | Replit AI |
| 2025-11-28 | ProfileTabAbout | Role cascade integration | Replit AI |
| 2025-11-28 | PRD Index | Created component index | Replit AI |

---

## 10. Maintenance

- **Update this index** when adding new profile components
- **Cross-reference PRDs** when features span multiple tabs
- **Track consolidation** of legacy role tabs → PRO tab
- **Document API changes** affecting profile features

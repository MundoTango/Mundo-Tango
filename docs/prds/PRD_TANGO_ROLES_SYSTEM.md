# PRD: Tango Roles Standardization System

> **Version:** 1.0  
> **Created:** 2025-11-28  
> **Status:** Active  

---

## 1. Purpose

The Tango Roles System provides a unified, standardized approach to defining and displaying the 19 tango community roles throughout the Mundo Tango platform. This centralized system ensures consistent role representation across onboarding, profiles, feeds, groups, comments, and all user-facing components.

---

## 2. Problem Solved

### Previous State
Before this standardization, tango roles were defined inconsistently across multiple files with:
- **Inconsistent property names**: Some files used `id` while others used `value`; some used `name` while others used `label`
- **Duplicate role definitions**: The same roles were hardcoded in multiple components
- **Missing metadata**: Color, icon, and category information was scattered or missing
- **No legacy support**: Old role values from database couldn't map to new standardized values
- **Maintenance burden**: Updating a role required changes in multiple places

### Solution Benefits
- **Single source of truth**: All 19 roles defined once in `tangoRoles.ts`
- **Standardized properties**: Consistent `value` and `label` naming convention
- **Rich metadata**: Each role includes icon, color, description, bookable status, and category
- **Legacy mapping**: Automatic conversion of old role values to standardized format
- **Reusable components**: `UserRoleBadges` provides drop-in role display anywhere in the app

---

## 3. Technical Implementation

### 3.1 Core Files

| File | Purpose |
|------|---------|
| `client/src/lib/tangoRoles.ts` | Master role definitions (19 roles) with all metadata |
| `client/src/components/UserRoleBadges.tsx` | Reusable badge display component |
| `client/src/components/RoleIcon.tsx` | Single role icon display component |

### 3.2 Key Interfaces/Types

```typescript
export interface TangoRole {
  value: string;           // Standardized identifier (e.g., 'dancer-leader')
  label: string;           // Display name (e.g., 'Dancer (Leader)')
  icon: LucideIcon;        // Lucide icon component
  color: string;           // Hex color for icon styling
  description: string;     // Role description
  bookable: boolean;       // Whether this role can accept bookings
  category: 'dance' | 'professional' | 'creative' | 'community';
}
```

### 3.3 Complete Role Definitions (19 Roles)

#### Dance Roles (2)
| Value | Label | Color | Bookable |
|-------|-------|-------|----------|
| `dancer-leader` | Dancer (Leader) | #1E90FF | No |
| `dancer-follower` | Dancer (Follower) | #EC4899 | No |

#### Professional Roles (8)
| Value | Label | Color | Bookable |
|-------|-------|-------|----------|
| `teacher` | Teacher | #10B981 | Yes |
| `dj` | DJ | #8B5CF6 | Yes |
| `performer` | Performer | #F59E0B | Yes |
| `organizer` | Organizer | #3B82F6 | No |
| `venue-owner` | Venue Owner | #6B7280 | Yes |
| `coach` | Coach/Mentor | #10B981 | Yes |
| `mc` | MC/Host | #F97316 | Yes |
| `business` | Business/Vendor | #6366F1 | Yes |

#### Creative Roles (6)
| Value | Label | Color | Bookable |
|-------|-------|-------|----------|
| `photographer` | Photographer/Videographer | #EF4444 | Yes |
| `artist` | Designer/Artist | #EC4899 | Yes |
| `journalist` | Journalist/Blogger | #14B8A6 | No |
| `historian` | Historian | #8B5CF6 | No |
| `clothing-designer` | Clothing/Shoe Designer | #EC4899 | Yes |
| `musician` | Musician | #A855F7 | Yes |

#### Community Roles (3)
| Value | Label | Color | Bookable |
|-------|-------|-------|----------|
| `community-builder` | Community Builder | #40E0D0 | No |
| `fan` | Fan/Enthusiast | #F59E0B | No |
| `other` | Other | #EF4444 | No |

### 3.4 Helper Functions

```typescript
// Core role lookups
getRoleByValue(value: string): TangoRole | undefined
getRolesByCategory(category: TangoRole['category']): readonly TangoRole[]
getBookableRoles(): readonly TangoRole[]

// Display helpers
getRoleIcon(roleValue: string): LucideIcon
getRoleLabel(roleValue: string): string
getRoleColor(roleValue: string): string

// Legacy support
normalizeRole(roleValue: string): string
getRoleByValueWithLegacy(value: string): TangoRole | undefined
```

### 3.5 Legacy Role Mapping

The system automatically maps old database values to new standardized values:

```typescript
const LEGACY_ROLE_MAP = {
  'dancer': 'dancer-leader',
  'student': 'fan',
  'tango_traveler': 'community-builder',
  'vendor': 'business',
  'choreographer': 'performer',
  'tango_school': 'teacher',
  'tango_hotel': 'venue-owner',
  'wellness_provider': 'coach',
  'tour_operator': 'organizer',
  'host_venue_owner': 'venue-owner',
  'tango_guide': 'community-builder',
  'content_creator': 'photographer',
  'learning_resource': 'teacher',
  'taxi_dancer': 'dancer-leader',
};
```

---

## 4. Files Using This Component

### 4.1 Files Importing from `tangoRoles.ts`

| File | Usage Context |
|------|---------------|
| `client/src/pages/onboarding/TangoRolesPage.tsx` | Role selection during onboarding (Step 3 of 5). Users select their roles from the TANGO_ROLES array. |
| `client/src/components/UserRoleBadges.tsx` | Uses `getRoleByValueWithLegacy`, `getRoleColor` for badge rendering |
| `client/src/components/RoleIcon.tsx` | Uses `getRoleByValue` to display individual role icons |
| `client/src/components/feed/PostItem.tsx` | Uses `getRoleLabel` to display role names in tooltips |

### 4.2 Files Importing `UserRoleBadges` Component

| File | Usage Context |
|------|---------------|
| `client/src/components/GlobalTopbar.tsx` | User avatar dropdown showing current user's roles |
| `client/src/components/FeedLeftSidebar.tsx` | User profile card in sidebar showing roles next to name |
| `client/src/components/GroupPostCard.tsx` | Author roles displayed on group post cards |
| `client/src/components/LiveStreamChat.tsx` | Participant roles in live stream chat messages |
| `client/src/components/feed/PostPreview.tsx` | Post author roles in preview cards |
| `client/src/components/feed/RecommendedPosts.tsx` | Author roles in recommended content |
| `client/src/components/feed/TrendingPosts.tsx` | Author roles in trending posts section |
| `client/src/components/feed/StoriesCarousel.tsx` | Creator roles on story thumbnails |
| `client/src/components/groups/GroupMembersList.tsx` | Member roles in group member lists |
| `client/src/components/ui/CommentItem.tsx` | Commenter roles displayed next to comment author |
| `client/src/components/travel/ParticipantAvatar.tsx` | Participant roles in travel features |

---

## 5. Integration Points

### 5.1 Onboarding Flow
- **Route**: `/onboarding/step-3`
- **Component**: `TangoRolesPage.tsx`
- **Behavior**: Users select one or more roles from a visual grid showing all 19 roles with icons and descriptions
- **Data Storage**: Selected role `value` strings saved to `user.tangoRoles` array

### 5.2 Profile Display
- **Usage**: `UserRoleBadges` shows user's roles wherever their profile appears
- **Variants**: 
  - `UserRoleBadges` - Icons only with tooltips
  - `UserRoleBadgesWithLabels` - Icons with text labels
- **Size Options**: `xs`, `sm`, `md` with corresponding icon sizes (12px, 14px, 16px)

### 5.3 Search & Filter
- **Bookable Filter**: `getBookableRoles()` returns all roles that can receive booking requests
- **Category Filter**: `getRolesByCategory()` enables filtering by role type (dance, professional, creative, community)
- **Search Matching**: Role labels and descriptions support search indexing

### 5.4 User Cards & Lists
- **Display Limit**: Default `maxDisplay={3}` shows first 3 roles + "+N" count for remaining
- **Consistent Styling**: Same icon colors and sizes across all user card implementations

### 5.5 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `PATCH /api/users/me` | PATCH | Update user's `tangoRoles` array during onboarding |
| `GET /api/users/:id` | GET | Returns user profile including `tangoRoles` |

---

## 6. Cross-References

### Related PRDs
- [PRD_ENHANCED_TALENT_MATCH.md](./PRD_ENHANCED_TALENT_MATCH.md) - Uses bookable roles for talent matching
- [PRD_USER_PRIVACY_HUB.md](./PRD_USER_PRIVACY_HUB.md) - Role visibility settings

### Related Features
- **Onboarding System** (`/onboarding/*`) - Role selection is Step 3 of the 5-step onboarding
- **User Profile System** - Roles displayed on profile pages
- **Feed System** (`/feed`) - Author roles shown on posts and comments
- **Groups System** (`/groups/*`) - Member roles shown in group contexts
- **Search/Discovery** - Roles used as filter criteria for finding users
- **Booking System** - Only `bookable: true` roles can receive booking requests

---

## 7. Usage Examples

### Basic Role Badges Display
```tsx
import { UserRoleBadges } from "@/components/UserRoleBadges";

// In a user card or profile
<UserRoleBadges roles={user.tangoRoles} maxDisplay={3} size="sm" />
```

### Role Badges with Labels
```tsx
import { UserRoleBadgesWithLabels } from "@/components/UserRoleBadges";

// For detailed role display
<UserRoleBadgesWithLabels 
  roles={user.tangoRoles} 
  variant="stacked" 
  size="md" 
/>
```

### Single Role Icon
```tsx
import { RoleIcon } from "@/components/RoleIcon";

<RoleIcon role="teacher" size={20} />
```

### Getting Role Information
```tsx
import { 
  getRoleByValue, 
  getBookableRoles, 
  getRolesByCategory 
} from "@/lib/tangoRoles";

// Get a specific role
const teacherRole = getRoleByValue('teacher');

// Get all bookable roles for talent matching
const bookableRoles = getBookableRoles();

// Get all professional roles
const professionalRoles = getRolesByCategory('professional');
```

---

## 8. Future Considerations

### Potential Improvements
- **Role Permissions**: Connect roles to feature access permissions
- **Custom Roles**: Allow communities/groups to define custom roles
- **Role Verification**: Badge verification system for professional roles
- **Role Analytics**: Track role distribution across the platform

### Known Limitations
- Maximum display of 10 roles per user (UI constraint)
- Legacy role mapping is one-way (old → new, cannot reverse)
- Role colors are hardcoded; no user customization

### Migration Notes
- All legacy role values are automatically converted on read via `getRoleByValueWithLegacy()`
- Database cleanup can safely run to convert all old role values to new standardized format
- No breaking changes; old role values continue to work through legacy mapping

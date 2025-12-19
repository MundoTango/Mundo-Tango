# PRD: Role Change Cascade System

> **Version:** 1.0  
> **Created:** 2025-11-29  
> **Status:** Active  
> **Pattern:** MB.MD v9.6 Hierarchical Execution  

---

## 1. Purpose

The Role Change Cascade System provides symmetric auto-join AND auto-leave functionality for PRO groups when users add or remove tango roles from their profile. This ensures group memberships stay synchronized with user role selections.

---

## 2. Problem Solved

### Previous State
- Role ADD cascade worked: Adding a role auto-joined the PRO group
- Role REMOVE cascade was missing: Removing a role did NOT auto-leave the PRO group
- `removedRoles` was detected (line 127) but never processed
- Users accumulated stale group memberships after removing roles

### Solution
- Symmetric ADD/REMOVE cascades implemented
- Auto-leave PRO groups when roles are removed
- Notifications sent for both join and leave actions
- Group member counts properly decremented

---

## 3. Technical Implementation

### 3.1 Core File

| File | Purpose |
|------|---------|
| `server/routes/role-change-routes.ts` | Role change effects with ADD/REMOVE cascades |

### 3.2 Cascade Flow

```
User changes roles in profile
         │
         ▼
┌─────────────────────────────────────────┐
│  POST /api/role-change/change-effects   │
│  - Receives: previousRoles, newRoles    │
│  - Computes: addedRoles, removedRoles   │
└─────────────────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐  ┌─────────┐
│ ADDED   │  │ REMOVED │
│ ROLES   │  │ ROLES   │
└────┬────┘  └────┬────┘
     │            │
     ▼            ▼
┌─────────┐  ┌─────────┐
│ Auto-   │  │ Auto-   │
│ JOIN    │  │ LEAVE   │
│ PRO     │  │ PRO     │
│ Groups  │  │ Groups  │
└────┬────┘  └────┬────┘
     │            │
     ▼            ▼
┌─────────┐  ┌─────────┐
│ "Welcome│  │ "You've │
│ to PRO  │  │ left    │
│ Groups!"│  │ [Group]"│
└─────────┘  └─────────┘
```

### 3.3 PRO Role Group Mappings

| Role | PRO Group Name | Slug |
|------|----------------|------|
| `teacher` | Tango Teachers Worldwide | `pro-teachers` |
| `dj` | Tango DJs Network | `pro-djs` |
| `performer` | Tango Performers Guild | `pro-performers` |
| `organizer` | Event Organizers Hub | `pro-organizers` |
| `venue-owner` | Tango Venues Alliance | `pro-venues` |
| `photographer` | Tango Photographers & Videographers | `pro-photographers` |
| `musician` | Tango Musicians Collective | `pro-musicians` |
| `artist` | Tango Artists & Designers | `pro-artists` |
| `clothing-designer` | Tango Fashion Designers | `pro-fashion` |
| `coach` | Tango Coaches & Mentors | `pro-coaches` |
| `mc` | Tango MCs & Hosts | `pro-mcs` |
| `journalist` | Tango Media & Journalists | `pro-journalists` |
| `historian` | Tango Historians Circle | `pro-historians` |
| `community-builder` | Community Builders Network | `pro-community-builders` |
| `business` | Tango Business Network | `pro-business` |
| `taxi-dancer` | Taxi Dancers Guild | `pro-taxi-dancers` |

### 3.4 API Endpoint

```typescript
POST /api/role-change/change-effects
{
  previousRoles: string[],  // Roles before update
  newRoles: string[]        // Roles after update
}

Response:
{
  addedRoles: string[],
  removedRoles: string[],
  autoJoinedGroups: Array<{ groupId, groupName, role }>,
  autoLeftGroups: Array<{ groupId, groupName, role }>,
  createdGroups: Array<{ groupId, groupName, role }>,
  message: string
}
```

### 3.5 Notification Types

#### Role Addition (Join)
```typescript
{
  type: "role_change",
  title: "Welcome to PRO Groups!",
  message: "You've joined [Group Names].",
  actionUrl: "/groups/{groupId}" | "/groups?filter=my-groups"
}
```

#### Role Removal (Leave)
```typescript
{
  type: "role_change",
  title: "PRO Group Membership Updated",
  message: "You've left [Group Names] as the role is no longer in your profile.",
  actionUrl: "/groups?filter=my-groups"
}
```

---

## 4. Integration Points

### 4.1 Profile Edit Flow
- **Route**: `/profile/edit` or `/settings/profile`
- **Trigger**: User saves profile with changed roles array
- **Frontend**: Calls `POST /api/role-change/change-effects` with before/after roles

### 4.2 Onboarding Flow
- **Route**: `/onboarding/step-3` (TangoRolesPage)
- **Behavior**: Initial role selection triggers auto-join for all selected roles
- **Note**: No "leave" cascade during onboarding (no previous roles)

### 4.3 Groups System
- **Member Count**: Properly incremented/decremented on join/leave
- **Membership Status**: Deleted from `group_members` table on leave
- **Group Visibility**: PRO groups remain visible but user no longer member

---

## 5. Cross-References

### Related PRDs
- [PRD_TANGO_ROLES_SYSTEM.md](./PRD_TANGO_ROLES_SYSTEM.md) - Defines the 20 tango roles
- [PRD_LOCATION_CHANGE_CASCADE.md](./PRD_LOCATION_CHANGE_CASCADE.md) - Similar cascade for city changes

### Related Features
- **Groups System** - PRO groups are type='role' groups
- **Notifications** - Delivers role change notifications
- **Profile System** - Stores `tangoRoles[]` array on user

---

## 6. MB.MD Execution Record

### Development Pattern: Hierarchical Execution (Pattern 28)

| Level | Actor | Task |
|-------|-------|------|
| **Level 1** | Replit AI | Designed architecture, identified gap in removedRoles processing |
| **Level 2** | Mr. Blue | Orchestrated 3 parallel squads |
| **Level 3** | Squad A | Implemented auto-leave logic |
| **Level 3** | Squad B | Added Taxi Dancer role #20 |
| **Level 3** | Squad C | Created PRD documentation |

### Validation
- ✅ Role ADD cascade: Auto-joins PRO groups
- ✅ Role REMOVE cascade: Auto-leaves PRO groups
- ✅ Notifications: Sent for both join and leave
- ✅ Member counts: Properly synchronized
- ✅ Taxi Dancer role #20: Added to system

---

## 7. Known Limitations

1. **Non-PRO roles**: Dance roles (dancer-leader, dancer-follower) don't have PRO groups
2. **Group ownership**: If user owns a PRO group, they cannot auto-leave it
3. **Cascade timing**: Happens synchronously in API response (not background job)

---

## 8. Future Considerations

1. **Background processing**: Move cascades to BullMQ for better performance
2. **Group admin retention**: Keep admins in groups even if role removed
3. **Cascade undo**: 24-hour grace period before full removal
4. **Cross-platform sync**: Cascade to connected platforms (Facebook, etc.)

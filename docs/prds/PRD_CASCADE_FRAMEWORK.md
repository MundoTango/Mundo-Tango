# PRD: Unified Cascade Framework

**Version:** 1.0  
**Status:** Active  
**Last Updated:** November 29, 2025  
**Related PRDs:** PRD_ROLE_CHANGE_CASCADE.md, PRD_LOCATION_CHANGE_CASCADE.md

---

## Overview

The Unified Cascade Framework provides a standardized architecture for automatically managing related data when user profile attributes change. It ensures consistency across the platform by following a predictable pattern: **Trigger → Detection → ADD Cascade → REMOVE Cascade → Notification**.

## Core Principles

### 1. Symmetric Behavior
Every cascade must handle both ADD and REMOVE operations:
- **ADD**: When an attribute is added/enabled, related resources are auto-created/joined
- **REMOVE**: When an attribute is removed/disabled, related resources are auto-left/cleaned up

### 2. Idempotent Operations
Cascades must be safe to run multiple times with the same result:
- Adding a role twice should not duplicate group memberships
- Removing a role that doesn't exist should not cause errors

### 3. Notification Generation
Every cascade operation must create a notification for user awareness:
- Type: Matches the cascade type (e.g., `role_change`, `location_change`)
- Title: Action summary (e.g., "Welcome to PRO Groups!")
- Message: Specific details of what changed
- actionUrl: Deep link to relevant resource

---

## Cascade Types

### 1. Role Change Cascade (Implemented)
**Trigger:** User adds/removes tango roles in profile  
**File:** `server/routes/role-change-routes.ts`  
**Frontend:** `client/src/lib/roleChangeEffects.ts`

| Role Added | Auto-Join Group |
|------------|-----------------|
| teacher | Professional Tango Instructors |
| dj | Tango DJs Worldwide |
| organizer | Event Organizers Network |
| performer | Tango Performers Guild |
| photographer | Tango Photographers |
| ... (20 roles) | ... (corresponding PRO groups) |

### 2. Location Change Cascade (Implemented)
**Trigger:** User changes city/country  
**File:** `server/routes/location-change-routes.ts`  
**Frontend:** `client/src/lib/locationChangeEffects.ts`

| Action | Result |
|--------|--------|
| Change city | Auto-join city group, leave old city group |
| Welcome notification | Sent for new city with community stats |

### 3. Language Cascade (Planned)
**Trigger:** User adds/removes languages  
**Expected Groups:** Language community groups (Spanish Speakers, Portuguese Speakers, etc.)

### 4. Dance Style Cascade (Planned)
**Trigger:** User adds/removes dance styles  
**Expected Groups:** Style-specific groups (Milonguero, Nuevo, Salon, etc.)

### 5. Platform Role Cascade (Planned)
**Trigger:** Admin changes user's platform level (1-8)  
**Result:** Permission grants/revocations across protected resources

### 6. Event Role Cascade (Planned)
**Trigger:** User assigned/removed from event role  
**Result:** Permission updates for that event's resources

### 7. Event Location Cascade (Implemented) ✅
**Trigger:** Event created in new city  
**File:** `server/routes/event-routes.ts` (POST /api/events)  
**Utility:** `server/utils/cityGroupAutomation.ts`

| Action | Result |
|--------|--------|
| Event created in city without group | Auto-create city group (type='city') |
| Organizer becomes group admin | Auto-join with admin role |
| Notification sent | "🎉 You started a community!" |

**Implementation Pattern:**
```typescript
// In event-routes.ts POST /api/events, after event creation:
if (cleanData.city && cleanData.country) {
  const { ensureCityGroupExists } = await import("../utils/cityGroupAutomation");
  const result = await ensureCityGroupExists(city, country, userId);
  // result.wasCreated = true if new group was made
}
```

**Learning Added (Nov 30, 2025):**
- EventsSystemAgent must always apply Pattern 8 (Cascade Detection) when creating location-based entities
- Cross-reference CASCADE_FRAMEWORK PRD for any feature touching city/country fields

---

## Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Client)                          │
├─────────────────────────────────────────────────────────────────┤
│  ProfileTabAbout.tsx                                            │
│  ├── onSuccess (mutation)                                       │
│  │   ├── Detect changes (roles, location, languages...)        │
│  │   ├── Call triggerRoleChangeEffects()                       │
│  │   ├── Call triggerLocationChangeEffects()                   │
│  │   └── Show toast notifications                              │
│  └── previousXRef.current tracks old values                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Server)                           │
├─────────────────────────────────────────────────────────────────┤
│  POST /api/roles/change-effects                                 │
│  ├── Compare previousRoles vs newRoles                         │
│  ├── Find addedRoles, removedRoles                             │
│  ├── For addedRoles:                                           │
│  │   ├── Find or create PRO group                              │
│  │   ├── Auto-join user to group                               │
│  │   └── Track in autoJoinedGroups[]                           │
│  ├── For removedRoles:                                         │
│  │   ├── Find PRO group                                        │
│  │   ├── Auto-leave user from group                            │
│  │   └── Track in autoLeftGroups[]                             │
│  ├── Create notification(s)                                    │
│  └── Return { autoJoinedGroups, autoLeftGroups, message }      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE                                    │
├─────────────────────────────────────────────────────────────────┤
│  groups (type='role' for PRO groups)                            │
│  group_members (user membership)                                │
│  notifications (cascade notifications)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Pattern

```typescript
// In profile save mutation onSuccess:
const newRoles = editValues.tangoRoles || [];
const previousRoles = previousRolesRef.current || [];
const rolesChanged = JSON.stringify([...newRoles].sort()) !== 
                     JSON.stringify([...previousRoles].sort());

// CRITICAL: Trigger cascade in three scenarios:
// 1. Roles changed (added or removed)
// 2. User has roles but previousRoles was empty (initial sync)
// 3. All roles removed (newRoles.length === 0 but previousRoles.length > 0)
const shouldTriggerCascade = rolesChanged || 
  (newRoles.length > 0 && previousRoles.length === 0) ||
  (newRoles.length === 0 && previousRoles.length > 0);

if (shouldTriggerCascade) {
  const effects = await triggerRoleChangeEffects({ previousRoles, newRoles });
  // Show toast for autoJoinedGroups and autoLeftGroups
  previousRolesRef.current = newRoles; // Update ref for next save
}
```

---

## Backend Endpoint Pattern

```typescript
router.post("/change-effects", authenticateToken, async (req, res) => {
  const { previousValues, newValues } = req.body;
  const userId = req.user.id;
  
  // 1. Detect changes
  const added = newValues.filter(v => !previousValues.includes(v));
  const removed = previousValues.filter(v => !newValues.includes(v));
  
  // 2. Process ADD cascade
  const autoJoined = [];
  for (const value of added) {
    const resource = await findOrCreateResource(value);
    await linkUserToResource(userId, resource.id);
    autoJoined.push({ resourceId: resource.id, name: resource.name });
  }
  
  // 3. Process REMOVE cascade
  const autoLeft = [];
  for (const value of removed) {
    const resource = await findResource(value);
    if (resource) {
      await unlinkUserFromResource(userId, resource.id);
      autoLeft.push({ resourceId: resource.id, name: resource.name });
    }
  }
  
  // 4. Create notifications
  if (autoJoined.length > 0 || autoLeft.length > 0) {
    await storage.createNotification({
      userId,
      type: "attribute_change",
      title: "Memberships Updated",
      message: `Joined ${autoJoined.length}, left ${autoLeft.length} resources`,
      actionUrl: "/my-resources",
    });
  }
  
  return { autoJoined, autoLeft, message: "..." };
});
```

---

## Notification Types

| Type | Icon | Color | Description |
|------|------|-------|-------------|
| `role_change` | Briefcase | Ocean Blue | PRO group membership changes |
| `location_change` | MapPin | Ocean Teal | City/country group changes |
| `group_join` | Users | Green | Generic group join |
| `group_leave` | Users | Orange | Generic group leave |
| `event_invite` | Calendar | Purple | Event participation |
| `friend_request` | UserPlus | Blue | Social connection |

---

## Testing Checklist

For each cascade type, verify:

- [ ] ADD single value triggers join
- [ ] ADD multiple values triggers multiple joins
- [ ] REMOVE single value triggers leave
- [ ] REMOVE all values triggers all leaves
- [ ] Idempotent: Same operation twice doesn't duplicate
- [ ] Notification created with correct type
- [ ] Notification appears in dropdown
- [ ] actionUrl navigates correctly
- [ ] Console logs show cascade execution

---

## Files Using This Pattern

| File | Purpose |
|------|---------|
| `client/src/components/profile/ProfileTabAbout.tsx` | Triggers cascades on save |
| `client/src/lib/roleChangeEffects.ts` | Role cascade API caller |
| `client/src/lib/locationChangeEffects.ts` | Location cascade API caller |
| `server/routes/role-change-routes.ts` | Role cascade backend |
| `server/routes/location-change-routes.ts` | Location cascade backend |
| `client/src/components/navigation/UnifiedTopBar.tsx` | Displays cascade notifications |

---

## Future Enhancements

1. **Event Sourcing**: Store all cascade events for audit trail
2. **Async Processing**: Use BullMQ for heavy cascades
3. **Rollback Support**: Undo cascade operations
4. **Cascade Dependencies**: Chain cascades (role change → skill cascade)
5. **Rate Limiting**: Prevent cascade spam

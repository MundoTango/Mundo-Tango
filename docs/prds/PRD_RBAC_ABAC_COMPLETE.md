# PRD: Complete RBAC/ABAC System

**Version:** 1.0  
**Status:** Active  
**Last Updated:** November 29, 2025  
**Related PRDs:** PRD_TANGO_ROLES_SYSTEM.md, PRD_ROLE_CHANGE_CASCADE.md

---

## Overview

Mundo Tango implements a comprehensive Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) system with four distinct role hierarchies. This document standardizes all role definitions, permissions, and cascade behaviors across the platform.

---

## Role Hierarchies

### 1. Platform Roles (8-Tier System)

Administrative access levels for platform management.

| Level | Role | Description | Permissions |
|-------|------|-------------|-------------|
| 8 | **god** | Supreme system access | All permissions, can modify anything, system override |
| 7 | **super_admin** | Super administrator | RBAC management, pricing, feature flags, user suspension |
| 6 | **platform_volunteer** | Platform volunteer | Limited admin tasks, community moderation support |
| 5 | **admin** | Administrator | Content moderation, user management, basic analytics |
| 4 | **community** | Community leader | Community management, event approval, group moderation |
| 3 | **premium** | Premium subscriber | Premium features, priority support, no ads |
| 2 | **basic** | Basic subscriber | Paid tier features, enhanced storage |
| 1 | **free** | Free user | Basic access, standard features |

**Database Column:** `users.role` (varchar)  
**Access Check:** `user.role === 'admin' || ['god', 'super_admin'].includes(user.role)`

### 2. Event Roles (10-Role Hierarchy)

Participant roles within specific events.

| Role | Permissions |
|------|-------------|
| **organizer** | Full event control: edit event, manage participants, manage tickets, post updates, view attendees, delete event |
| **co_organizer** | Same as organizer (redundant second-in-command) |
| **host** | Edit event, manage participants, manage tickets, post updates, view attendees |
| **dj** | Post updates, view attendees |
| **teacher** | Post updates, view attendees |
| **photographer** | Post updates, view attendees |
| **performer** | Post updates only |
| **sponsor** | Post updates only |
| **volunteer** | View attendees only |
| **attendee** | No special permissions (default) |

**Database Table:** `event_participants`  
**Schema File:** `shared/eventRolesSchemas.ts`

```typescript
// Permission check example
const canEditEvent = (role: string) => 
  ['organizer', 'co_organizer', 'host'].includes(role);

const canPostUpdates = (role: string) => 
  ['organizer', 'co_organizer', 'host', 'dj', 'teacher', 
   'photographer', 'performer', 'sponsor'].includes(role);
```

### 3. Tango Professional Roles (20 Standardized Roles)

Professional identity roles that trigger PRO group auto-join.

| Category | Roles |
|----------|-------|
| **Dance** | dancer-leader, dancer-follower |
| **Professional** | teacher, dj, performer, organizer, venue-owner, coach, mc, business |
| **Creative** | photographer, artist, journalist, historian, clothing-designer, musician |
| **Community** | community-builder, fan, other |
| **Specialized** | taxi-dancer |

**Database Column:** `users.tango_roles` (varchar[])  
**Definition File:** `shared/utils/tangoRoles.ts`  
**PRD:** PRD_TANGO_ROLES_SYSTEM.md

**Cascade Behavior:**
- When role added → Auto-join corresponding PRO group
- When role removed → Auto-leave corresponding PRO group
- Notification created for each cascade action

### 4. Group Roles

Membership roles within groups.

| Role | Permissions |
|------|-------------|
| **owner** | Full control: edit group, manage members, delete group, assign admins |
| **admin** | Manage members, edit group settings, moderate posts |
| **moderator** | Moderate posts, remove spam, mute members |
| **member** | Post content, participate in discussions |

**Database Column:** `group_members.role` (varchar)

---

## ABAC Attributes

Beyond roles, permissions can be controlled by attributes:

| Attribute | Type | Usage |
|-----------|------|-------|
| `user.city` | string | City group auto-join, local event visibility |
| `user.country` | string | Regional content filtering |
| `user.languages` | string[] | Language community groups |
| `user.danceStyles` | string[] | Style-specific groups |
| `user.experienceLevel` | string | Beginner/intermediate/advanced content |
| `user.teachingAvailable` | boolean | Teacher marketplace visibility |
| `user.createdAt` | date | New user protections |
| `user.verified` | boolean | Verified user features |

---

## Permission Matrix

### Platform Permissions

| Permission | god | super_admin | admin | community | premium | basic | free |
|------------|-----|-------------|-------|-----------|---------|-------|------|
| Manage all users | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage RBAC | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Set pricing | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Feature flags | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Suspend users | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Content moderation | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Premium features | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Basic paid features | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Standard access | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Event Permissions

| Permission | organizer | co_organizer | host | dj/teacher | performer | volunteer | attendee |
|------------|-----------|--------------|------|------------|-----------|-----------|----------|
| Edit event | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage participants | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage tickets | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Post updates | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View attendees | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Delete event | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Cascade Integration

### Platform Role Cascade (Planned)

When admin changes user's platform level:
1. **Upgrade (1→3)**: Grant premium features, remove ads, send welcome notification
2. **Downgrade (3→1)**: Revoke premium features, notify user of change

### Event Role Cascade (Planned)

When user assigned to event role:
1. **Assign as DJ**: Grant post updates permission, add to event team
2. **Remove as DJ**: Revoke permissions, notify of role removal

### Tango Role Cascade (Implemented)

When user adds/removes tango roles:
1. **Add teacher**: Auto-join "Professional Tango Instructors" group
2. **Remove teacher**: Auto-leave "Professional Tango Instructors" group
3. Notification created for both actions

---

## Implementation Files

| Component | File |
|-----------|------|
| Platform role checks | `server/middleware/auth.ts` |
| Event role schema | `shared/eventRolesSchemas.ts` |
| Tango role definitions | `shared/utils/tangoRoles.ts` |
| Role change cascade | `server/routes/role-change-routes.ts` |
| Admin role management | `server/routes/admin.ts` |
| Group role management | `server/routes/groups.ts` |

---

## API Endpoints

### Platform Role Management
```
GET    /api/admin/users/:id/role     - Get user's platform role
PUT    /api/admin/users/:id/role     - Update user's platform role (admin+)
```

### Event Role Management
```
GET    /api/events/:id/participants  - Get event participants with roles
POST   /api/events/:id/participants  - Add participant with role
PUT    /api/events/:id/participants/:userId - Update participant role
DELETE /api/events/:id/participants/:userId - Remove participant
```

### Tango Role Cascade
```
POST   /api/roles/change-effects     - Trigger PRO group cascade
GET    /api/roles/pro-groups         - List all PRO groups
```

### Group Role Management
```
GET    /api/groups/:id/members       - Get group members with roles
PUT    /api/groups/:id/members/:userId - Update member role
```

---

## Security Considerations

1. **Role Escalation Prevention**: Users cannot assign roles higher than their own
2. **Audit Logging**: All role changes logged with actor, target, timestamp
3. **Rate Limiting**: Role changes rate-limited to prevent abuse
4. **Cascade Validation**: Cascade operations validate permissions before executing

---

## Testing Requirements

For each role hierarchy:
- [ ] All permissions correctly enforced
- [ ] Role upgrade/downgrade works
- [ ] Cascade triggers correctly
- [ ] Notifications sent
- [ ] UI reflects permissions
- [ ] API rejects unauthorized access

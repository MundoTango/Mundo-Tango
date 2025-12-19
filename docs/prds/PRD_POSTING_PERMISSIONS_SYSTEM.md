# PRD: Posting Permissions System

## Overview

The Posting Permissions System implements a unified RBAC (Role-Based Access Control) and ABAC (Attribute-Based Access Control) framework for controlling who can post content within different contexts (groups and events) on the Mundo Tango platform.

## Business Context

### Problem Statement
Different contexts require different permission models:
- **Groups**: Permission based on membership status (ABAC - attribute-based)
- **Events**: Permission based on assigned role (RBAC - role-based)

Users need clear feedback about their posting capabilities, and the system must enforce permissions consistently on both frontend and backend.

### Goals
1. Prevent unauthorized posting in groups and events
2. Provide clear visual feedback about user roles and permissions
3. Support granular permission levels (post vs comment)
4. Maintain consistent permission enforcement across API and UI

## Permission Matrix

### Group Permissions (ABAC - Attribute-Based)

| Role/Status | Can Post | Can Comment | Description |
|-------------|----------|-------------|-------------|
| Creator | Yes | Yes | Group creator with full access |
| Admin | Yes | Yes | Administrative privileges |
| Moderator | Yes | Yes | Content moderation duties |
| Member | Yes | Yes | Active group member |
| Follower | No | Yes | Following but not a member |
| None | No | No | Not associated with group |

**Decision Logic**: Based on `groupMembers.role` and `groupMembers.status`

### Event Permissions (RBAC - Role-Based)

| Role | Can Post Updates | Can Comment | Is Staff |
|------|------------------|-------------|----------|
| Organizer | Yes | Yes | Yes |
| Co-organizer | Yes | Yes | Yes |
| Host | Yes | Yes | Yes |
| DJ | Yes | Yes | Yes |
| Teacher | Yes | Yes | Yes |
| Performer | Yes | Yes | Yes |
| Photographer | Yes | Yes | Yes |
| Sponsor | Yes | Yes | Yes |
| Volunteer | No | Yes | No |
| Attendee | No | Yes | No |
| Guest | No | Yes | No |
| RSVP'd (no role) | No | Yes | No |
| Not RSVP'd | No | No | No |

**Staff Roles** (can post updates): organizer, co-organizer, host, dj, teacher, performer, photographer, sponsor

## Technical Architecture

### Backend Service

**File**: `server/services/PostingPermissionService.ts`

```typescript
interface PermissionResult {
  canPost: boolean;
  canComment: boolean;
  role: string | null;
  reason?: string;
  // Event-specific
  isRsvpd?: boolean;
}

class PostingPermissionService {
  static async getGroupPermissions(userId: number, groupId: number): Promise<PermissionResult>
  static async getEventPermissions(userId: number, eventId: number): Promise<PermissionResult>
}
```

### API Endpoints

#### GET /api/groups/:id/permissions
Returns user's posting permissions for a specific group.

**Response**:
```json
{
  "canPost": true,
  "canComment": true,
  "role": "member",
  "reason": null
}
```

#### GET /api/events/:id/permissions
Returns user's posting permissions for a specific event.

**Response**:
```json
{
  "canPost": false,
  "canComment": true,
  "role": "attendee",
  "isRsvpd": true,
  "reason": "Event participants can join the discussion"
}
```

### Route Protection

Both `POST /api/groups/:id/posts` and `POST /api/events/:id/posts` enforce permissions before accepting content:

```typescript
// Group posts - require canPost
const permissions = await PostingPermissionService.getGroupPermissions(userId, groupId);
if (!permissions.canPost) {
  return res.status(403).json({ message: permissions.reason });
}

// Event posts - allow canPost OR canComment (discussion-style)
const permissions = await PostingPermissionService.getEventPermissions(userId, eventId);
if (!permissions.canPost && !permissions.canComment) {
  return res.status(403).json({ message: permissions.reason });
}
```

## Frontend Integration

### GroupPostFeed Component

**File**: `client/src/components/groups/GroupPostFeed.tsx`

- Fetches permissions via `/api/groups/:id/permissions`
- Shows/hides PostCreator based on `canPost`
- Displays role badge with appropriate icon
- Shows permission reason when user cannot post

### EventPostFeed Component

**File**: `client/src/components/events/EventPostFeed.tsx`

- Fetches permissions via `/api/events/:id/permissions`
- Shows PostCreator if user can post OR comment (discussion model)
- Displays role badge with event-specific icons
- Shows RSVP status for non-role users

### Role Badge Icons

**Groups**:
- Shield: Creator, Admin, Moderator
- Users: Member
- Eye: Follower
- Lock: No access

**Events**:
- Star: Organizer, Co-organizer
- Music: DJ
- Mic: Teacher, Performer
- Camera: Photographer
- UserCheck: Host
- Ticket: Attendee, Guest

## Database Dependencies

### Tables Used

1. **groupMembers**
   - `userId`, `groupId`, `role`, `status`
   - Roles: creator, admin, moderator, member
   - Status: active, pending, inactive, banned

2. **eventRsvps**
   - `userId`, `eventId`, `status`, `role`
   - Status: going, interested, maybe, not_going
   - Role: organizer, co-organizer, host, dj, teacher, performer, photographer, sponsor, volunteer, attendee, guest

3. **events**
   - `organizerId` (primary organizer)

## Error Handling

### 403 Forbidden Response

When permission is denied, the API returns:

```json
{
  "message": "Helpful explanation for the user",
  "role": "current_role_or_null",
  "canComment": true_or_false
}
```

### Frontend Fallbacks

- If permission API fails, default to `{ canPost: false, canComment: false }`
- Show generic "Join to participate" message

## Testing Scenarios

### Group Permission Tests

1. Creator posts → Success
2. Admin posts → Success
3. Moderator posts → Success
4. Member posts → Success
5. Follower posts → 403 (can comment only)
6. Non-member posts → 403

### Event Permission Tests

1. Organizer posts → Success
2. DJ posts → Success (staff)
3. Attendee posts → Success (discussion)
4. RSVP'd no-role posts → Success (discussion)
5. Non-RSVP'd posts → 403

## Security Considerations

1. **Double Validation**: Frontend hides UI, backend enforces
2. **Auth Required**: All permission endpoints require authentication
3. **Context Isolation**: Permissions are scoped to specific group/event
4. **No Privilege Escalation**: Roles checked against database, not user claims

## Performance Optimization

1. **Single Query**: Permission check combines membership/RSVP lookup
2. **Frontend Caching**: React Query caches permission results
3. **Query Keys**: Hierarchical keys for proper cache invalidation

## Future Enhancements

1. **Permission Caching**: Redis cache for frequently accessed permissions
2. **Bulk Permissions**: Check multiple contexts in single request
3. **Permission Delegation**: Temporary posting rights for special events
4. **Audit Logging**: Track permission checks and denials

## Related PRDs

- PRD_GROUPS_MEMBERSHIP_SYSTEM.md - Group role definitions
- PRD_EVENTS_SYSTEM.md - Event RSVP and role management
- PRD_MENTIONS_SYSTEM.md - Context-aware mentions in posts

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-30 | 1.0.0 | Initial implementation with RBAC/ABAC |

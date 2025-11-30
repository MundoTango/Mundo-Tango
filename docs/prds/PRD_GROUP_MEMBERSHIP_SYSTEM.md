# PRD: Group Membership System

> **Version:** 1.0  
> **Created:** 2025-11-30  
> **Status:** Active  

---

## 1. Purpose

The Group Membership System manages all aspects of user membership in groups: joining, leaving, role management, approval workflows for private groups, and cascading effects on related systems.

---

## 2. Problem Solved

Before this system existed:
- No structured way to manage group membership
- No role hierarchy for group administration
- Private groups had no approval workflow
- No way to track membership history or status transitions

---

## 3. Technical Implementation

### 3.1 Core Files

| File | Purpose |
|------|---------|
| `server/routes/group-routes.ts` | Membership API endpoints |
| `shared/schema.ts` | `groupMembers` table definition |
| `client/src/pages/GroupDetailsPage.tsx` | Join/Leave UI |
| `client/src/components/groups/GroupSettingsPanel.tsx` | Member management |

### 3.2 Database Schema

#### groupMembers Table

```typescript
export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Role System
  role: varchar("role", { length: 50 }).default("member").notNull(),
  // Values: 'member' | 'follower' | 'admin' | 'moderator'
  
  status: varchar("status", { length: 50 }).default("active").notNull(),
  // Values: 'active' | 'pending' | 'inactive' | 'banned'
  
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  invitedBy: integer("invited_by").references(() => users.id, { onDelete: "set null" }),
  
  // Notification preferences
  notificationLevel: varchar("notification_level", { length: 50 }).default("all"),
  // Values: 'all' | 'mentions' | 'none'
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  groupUserIdx: index("group_members_group_user_idx").on(table.groupId, table.userId),
  userIdx: index("group_members_user_idx").on(table.userId),
  roleIdx: index("group_members_role_idx").on(table.role),
  statusIdx: index("group_members_status_idx").on(table.status),
}));
```

### 3.3 Role Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  CREATOR (auto-assigned on group creation)              │
│  ─────────────────────────────────────────────────────  │
│  • All admin permissions                                │
│  • Cannot leave group (must transfer or delete)         │
│  • Can delete group                                     │
│  • Can transfer ownership                               │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  ADMIN (role: 'admin')                                  │
│  ─────────────────────────────────────────────────────  │
│  • Update group settings                                │
│  • Manage members (approve, remove, ban)                │
│  • Change member roles (up to moderator)                │
│  • Pin/delete any post                                  │
│  • Create events                                        │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  MODERATOR (role: 'moderator')                          │
│  ─────────────────────────────────────────────────────  │
│  • Approve pending members                              │
│  • Remove/ban members                                   │
│  • Pin/delete posts                                     │
│  • Cannot change settings                               │
│  • Cannot promote to admin                              │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  MEMBER (role: 'member')                                │
│  ─────────────────────────────────────────────────────  │
│  • View all group content                               │
│  • Create posts (if allowed)                            │
│  • Comment on posts                                     │
│  • RSVP to events                                       │
│  • View member list                                     │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  FOLLOWER (role: 'follower')                            │
│  ─────────────────────────────────────────────────────  │
│  • View public posts only                               │
│  • Cannot post or comment                               │
│  • Limited event access                                 │
│  • Notifications on high-activity posts                 │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Join Flow

### 4.1 Public Groups

```
User clicks "Join Group"
        ↓
POST /api/groups/:id/join
        ↓
Check: Group exists?
        ↓ Yes
Check: Already member?
        ↓ No
Check: group.isPrivate?
        ↓ false (public)
Create membership:
  - role: 'member'
  - status: 'active'
  - joinedAt: now()
        ↓
Increment group.memberCount
        ↓
Return membership record
        ↓
Toast: "Joined group!"
```

### 4.2 Private Groups

```
User clicks "Request to Join"
        ↓
POST /api/groups/:id/join
        ↓
Check: group.isPrivate?
        ↓ true (private)
Create membership:
  - role: 'member'
  - status: 'pending'
  - joinedAt: now()
        ↓
Notify admins/moderators
        ↓
Return membership record
        ↓
Toast: "Join request sent!"
```

### 4.3 API Implementation

```typescript
// POST /api/groups/:id/join
router.post("/:id/join", authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  // Check if group exists
  const group = await db.select().from(groups).where(eq(groups.id, parseInt(id))).limit(1);
  if (group.length === 0) {
    return res.status(404).json({ message: "Group not found" });
  }

  // Check if already a member
  const existing = await db.select().from(groupMembers)
    .where(and(
      eq(groupMembers.groupId, parseInt(id)),
      eq(groupMembers.userId, userId)
    )).limit(1);

  if (existing.length > 0) {
    if (existing[0].status === "active") {
      return res.status(409).json({ message: "Already a member" });
    }
    // Reactivate membership
    const [updated] = await db.update(groupMembers)
      .set({ status: "active", joinedAt: new Date() })
      .where(and(
        eq(groupMembers.groupId, parseInt(id)),
        eq(groupMembers.userId, userId)
      ))
      .returning();
    return res.json(updated);
  }

  // Private groups require approval
  const status = group[0].isPrivate ? "pending" : "active";

  const [member] = await db.insert(groupMembers)
    .values({
      groupId: parseInt(id),
      userId,
      role: "member",
      status
    })
    .returning();

  // Update member count
  await db.update(groups)
    .set({ memberCount: sql`${groups.memberCount} + 1` })
    .where(eq(groups.id, parseInt(id)));

  res.status(201).json(member);
});
```

---

## 5. Leave Flow

### 5.1 Regular Members

```
User clicks "Leave Group"
        ↓
POST /api/groups/:id/leave
        ↓
Check: User is member?
        ↓ Yes
Check: User is creator?
        ↓ No
Delete membership record
        ↓
Decrement group.memberCount
        ↓
Return success
        ↓
Toast: "Left group"
```

### 5.2 Creator Cannot Leave

```
Creator clicks "Leave Group"
        ↓
POST /api/groups/:id/leave
        ↓
Check: User is creator?
        ↓ Yes
Return error 400:
"Group creator cannot leave.
Please transfer ownership or delete the group."
```

### 5.3 API Implementation

```typescript
// POST /api/groups/:id/leave
router.post("/:id/leave", authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  // Check if member
  const membership = await db.select().from(groupMembers)
    .where(and(
      eq(groupMembers.groupId, parseInt(id)),
      eq(groupMembers.userId, userId)
    )).limit(1);

  if (membership.length === 0) {
    return res.status(404).json({ message: "Not a member of this group" });
  }

  // Check if user is the creator
  const group = await db.select().from(groups)
    .where(eq(groups.id, parseInt(id))).limit(1);

  if (group[0]?.createdBy === userId) {
    return res.status(400).json({ 
      message: "Group creator cannot leave. Please transfer ownership or delete the group." 
    });
  }

  // Delete membership
  await db.delete(groupMembers)
    .where(and(
      eq(groupMembers.groupId, parseInt(id)),
      eq(groupMembers.userId, userId)
    ));

  // Decrement member count
  await db.update(groups)
    .set({ memberCount: sql`${groups.memberCount} - 1` })
    .where(eq(groups.id, parseInt(id)));

  res.json({ message: "Left group successfully" });
});
```

---

## 6. Approval Workflow (Private Groups)

### 6.1 Request Flow

```
1. User requests to join private group
   POST /api/groups/:id/join
   → status: 'pending'

2. Notification sent to admins/moderators
   → "New join request from [User]"

3. Admin views pending requests
   GET /api/groups/:id/members?status=pending

4. Admin approves request
   PATCH /api/groups/:id/members/:userId
   → status: 'active'

5. Notification sent to user
   → "Your request to join [Group] was approved!"

6. Or admin rejects request
   DELETE /api/groups/:id/members/:userId
   → Notification: "Your request to join [Group] was declined"
```

### 6.2 Pending Members API

```typescript
// GET /api/groups/:id/members?status=pending
router.get("/:id/members", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, status = "active" } = req.query;

  let query = db.select({
    membership: groupMembers,
    user: {
      id: users.id,
      name: users.name,
      username: users.username,
      profileImage: users.profileImage,
      city: users.city,
      country: users.country,
      tangoRoles: users.tangoRoles
    }
  })
  .from(groupMembers)
  .leftJoin(users, eq(groupMembers.userId, users.id))
  .where(and(
    eq(groupMembers.groupId, parseInt(id)),
    eq(groupMembers.status, status as string)
  ))
  .$dynamic();

  if (role) {
    query = query.where(eq(groupMembers.role, role as string));
  }

  const members = await query.orderBy(asc(groupMembers.joinedAt));
  res.json(members);
});
```

### 6.3 Approve/Reject Member

```typescript
// PATCH /api/groups/:id/members/:userId
router.patch("/:id/members/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  const adminId = req.user!.id;
  const { id, userId } = req.params;
  const { status, role } = req.body;

  // Check if requester is admin/moderator
  const adminMembership = await db.select().from(groupMembers)
    .where(and(
      eq(groupMembers.groupId, parseInt(id)),
      eq(groupMembers.userId, adminId),
      or(eq(groupMembers.role, "admin"), eq(groupMembers.role, "moderator"))
    )).limit(1);

  if (adminMembership.length === 0) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // Update member
  const [updated] = await db.update(groupMembers)
    .set({ 
      status: status || undefined,
      role: role || undefined,
      updatedAt: new Date()
    })
    .where(and(
      eq(groupMembers.groupId, parseInt(id)),
      eq(groupMembers.userId, parseInt(userId))
    ))
    .returning();

  res.json(updated);
});
```

---

## 7. Status Transitions

### 7.1 Valid Status Values

| Status | Description | Can Post | Can View | Notifications |
|--------|-------------|----------|----------|---------------|
| `active` | Full member | Yes (if allowed) | All content | All |
| `pending` | Awaiting approval | No | Public only | None |
| `inactive` | Deactivated | No | None | None |
| `banned` | Removed for violation | No | None | None |

### 7.2 Transition Diagram

```
                    ┌───────────────┐
                    │   (new join)  │
                    └───────┬───────┘
                            ↓
                 ┌──────────────────────┐
          ┌──────│      pending         │──────┐
          │      └──────────────────────┘      │
          │ approved                    rejected
          ↓                                    ↓
┌──────────────────────┐            ┌──────────────────┐
│       active         │───────────→│     deleted      │
└──────────────────────┘   leave    └──────────────────┘
          │                                    ↑
          │ ban                                │
          ↓                                    │
┌──────────────────────┐                       │
│       banned         │───────────────────────┘
└──────────────────────┘         unban
```

---

## 8. Cascading Effects

### 8.1 On Group Delete

```typescript
// groupMembers FK: onDelete: "cascade"
// All memberships automatically deleted when group is deleted
```

### 8.2 On User Delete

```typescript
// groupMembers FK: onDelete: "cascade"
// All memberships automatically deleted when user is deleted
```

### 8.3 On Membership Status Change

| Event | System | Effect |
|-------|--------|--------|
| Join (active) | Notifications | Welcome notification to user |
| Join (pending) | Notifications | Alert to admins |
| Approved | Notifications | Welcome notification to user |
| Leave | Notifications | (None by default) |
| Banned | Notifications | Reason sent to user |
| Role Change | Notifications | Role change notification |

---

## 9. Wiring to Other Systems

### 9.1 Groups → Profile

```typescript
// Profile can show user's group memberships
GET /api/groups/my-groups

// Returns groups where user is active member
// Used by ProfileTabGroups (future component)
```

### 9.2 Groups → Events

```typescript
// Event creation can be restricted by membership
// Only members (or admins) can create events in group

// Event RSVPs visible to all members
// Private group events only visible to members
```

### 9.3 Groups → Posts

```typescript
// Post creation controlled by whoCanPost setting
// - 'members': All active members
// - 'moderators': Moderators and admins only
// - 'admins': Admins only
```

### 9.4 Groups → Notifications

```typescript
// Notification triggers:
// 1. Join request (pending) → Notify admins
// 2. Join approved → Notify user
// 3. New post in group → Notify members (per notificationLevel)
// 4. @mention → Notify mentioned user
// 5. Role change → Notify affected user
```

---

## 10. Test IDs

| Element | Test ID |
|---------|---------|
| Join button | `button-join-group` |
| Leave button | `button-leave-group` |
| Join (by ID) | `button-join-{groupId}` |
| Request join | `button-request-join-{groupId}` |
| Member card | `card-member-{userId}` |
| Approve button | `button-approve-{userId}` |
| Reject button | `button-reject-{userId}` |
| Ban button | `button-ban-{userId}` |

---

## 11. Cross-References

### Related PRDs
- [PRD_GROUPS_LANDING_SYSTEM.md](./PRD_GROUPS_LANDING_SYSTEM.md) - Join from landing
- [PRD_GROUP_DETAILS_SYSTEM.md](./PRD_GROUP_DETAILS_SYSTEM.md) - Join/Leave UI
- [PRD_RBAC_ABAC_COMPLETE.md](./PRD_RBAC_ABAC_COMPLETE.md) - Role permissions
- [PRD_NOTIFICATIONS_SETTINGS_TAB.md](./PRD_NOTIFICATIONS_SETTINGS_TAB.md) - Group notifications

### Related Database Tables
- `groups` - Parent group record
- `groupMembers` - Membership records
- `users` - User profiles
- `groupPosts` - Post permissions tied to membership

---

## 12. Future Considerations

- Bulk member import from CSV
- Member invitation via email
- Membership levels (premium, VIP)
- Membership expiration/renewal
- Member activity scoring
- Automatic role promotion based on activity
- Integration with Facebook group import

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial PRD creation |

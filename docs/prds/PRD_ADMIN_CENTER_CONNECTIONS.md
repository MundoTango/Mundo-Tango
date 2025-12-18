# PRD: Admin Center Cross-System Connections

**Version:** 1.0  
**Created:** November 30, 2025  
**Pattern Applied:** MB.MD v9.6 Pattern 39 - 5-Source Methodology  
**Priority:** P0 (Core Administrative Infrastructure)  
**Reference:** Admin Center Integration Architecture

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Admin → Housing Connections](#3-admin--housing-connections)
4. [Admin → Users/Friends Connections](#4-admin--usersfriends-connections)
5. [Moderation System Architecture](#5-moderation-system-architecture)
6. [Database Schema Integration](#6-database-schema-integration)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Admin UI Pages](#8-admin-ui-pages)
9. [Data Flow Diagrams](#9-data-flow-diagrams)
10. [Security & RBAC Integration](#10-security--rbac-integration)
11. [Cross-References](#11-cross-references)
12. [Implementation Details](#12-implementation-details)
13. [Error Handling](#13-error-handling)
14. [Future Considerations](#14-future-considerations)

---

## 1. Overview

### 1.1 Purpose

The Admin Center serves as the centralized command hub for platform moderation, user management, content oversight, and cross-system administration. This PRD documents the intricate connections between the Admin Center and other major platform systems, specifically:

- **Housing System:** Property listing verification, safety reviews, content moderation
- **Users/Friends System:** User management, abuse reports, role requests, account actions
- **Moderation System:** Unified content queue, action logging, auto-flagging

### 1.2 Business Value

| Value Area | Description |
|------------|-------------|
| **Platform Safety** | Centralized moderation prevents harmful content across all systems |
| **User Trust** | Verified housing listings and safe community interactions |
| **Operational Efficiency** | Single dashboard for all administrative tasks |
| **Compliance** | Audit trail for all moderation actions |
| **Scalability** | Unified architecture supports growth without fragmentation |

### 1.3 Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Moderation Queue SLA | Time to review pending items | < 24 hours |
| Housing Verification Rate | Percentage of listings verified | > 95% |
| User Report Resolution | Time to resolve user reports | < 48 hours |
| Role Request Processing | Time to process role upgrades | < 72 hours |
| Platform Health Uptime | Admin monitoring availability | 99.9% |
| Action Audit Coverage | Actions with complete audit trail | 100% |

### 1.4 5-Source Methodology Application

This PRD was created using the 5-Source Methodology:

| Source | Location | Content Extracted |
|--------|----------|-------------------|
| **Source 1: Schema** | `shared/schema.ts` | Database tables, relationships, types |
| **Source 2: Routes** | `server/routes/admin-routes.ts` | API endpoints, business logic |
| **Source 3: Pages** | `client/src/pages/admin/*` | UI components, user interactions |
| **Source 4: Services** | `server/services/*` | Backend service integrations |
| **Source 5: Related PRDs** | `docs/prds/*` | Cross-system references |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ADMIN CENTER (Hub)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│    │  Moderation     │  │  User           │  │  Analytics      │        │
│    │  Dashboard      │  │  Management     │  │  Dashboard      │        │
│    └────────┬────────┘  └────────┬────────┘  └────────┬────────┘        │
│             │                    │                    │                  │
│    ┌────────┴────────────────────┴────────────────────┴────────┐        │
│    │                    ADMIN API LAYER                         │        │
│    │              /api/admin/* endpoints                        │        │
│    └────────┬────────────────────┬────────────────────┬────────┘        │
│             │                    │                    │                  │
└─────────────┼────────────────────┼────────────────────┼──────────────────┘
              │                    │                    │
    ┌─────────▼─────────┐ ┌───────▼───────┐ ┌─────────▼─────────┐
    │  HOUSING SYSTEM   │ │ USERS/FRIENDS │ │  EVENTS SYSTEM    │
    ├───────────────────┤ ├───────────────┤ ├───────────────────┤
    │ • housingListings │ │ • users       │ │ • events          │
    │ • housingBookings │ │ • friendships │ │ • eventRsvps      │
    │ • Safety Review   │ │ • userReports │ │ • Event Approvals │
    │ • Verification    │ │ • roleRequests│ │                   │
    └───────────────────┘ └───────────────┘ └───────────────────┘
```

### 2.2 Component Dependency Map

| Admin Component | Depends On | Dependency Type |
|-----------------|------------|-----------------|
| ModerationDashboard | moderationQueue, moderationActions | Read/Write |
| HousingReviewsPage | housingListings, users | Read/Write |
| UserReportsPage | userReports, users | Read/Write |
| RoleRequestsPage | roleRequests, users | Read/Write |
| UserManagementPage | users, friendships | Read/Write |
| AnalyticsDashboard | All tables | Read-Only |
| SystemHealthPage | Platform metrics | Read-Only |

### 2.3 Authentication & Authorization Flow

```
Request → authenticateToken → requireMinimumRole(4) → Admin Route Handler
                  ↓                    ↓
           JWT Validation      RBAC Level Check
                               (Level 4+ = Admin)
```

**RBAC Tier Mapping:**
| Level | Role | Admin Access |
|-------|------|--------------|
| 8 | God | Full platform control |
| 7 | Super Admin | All admin functions |
| 6 | Platform Volunteer | Limited admin |
| 5 | Platform Contributor | Read-only admin |
| 4 | Admin | Standard admin |
| 3 | Moderator | Content-only |
| 2 | User | No admin access |
| 1 | Guest | No access |

---

## 3. Admin → Housing Connections

### 3.1 Connection Overview

The Admin Center interfaces with the Housing System through multiple integration points for safety verification, content moderation, and listing management.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN → HOUSING CONNECTION                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────────────┐      │
│  │ HousingReviews   │ ──────→ │ /api/admin/housing-      │      │
│  │ Page.tsx         │         │ reviews                   │      │
│  └──────────────────┘         └──────────┬───────────────┘      │
│                                          │                       │
│                               ┌──────────▼───────────────┐      │
│                               │ housingListings Table    │      │
│                               │ - verificationStatus     │      │
│                               │ - verifiedBy             │      │
│                               │ - safetyNotes            │      │
│                               │ - rejectionReason        │      │
│                               └──────────────────────────┘      │
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────────────┐      │
│  │ Moderation       │ ──────→ │ moderationQueue          │      │
│  │ Dashboard.tsx    │         │ contentType='housing'    │      │
│  └──────────────────┘         └──────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Housing Moderation Queue Integration

**Content Type Value:** `housing`

When a housing listing is reported or flagged, it enters the unified moderation queue with:

```typescript
// moderationQueue entry for housing content
{
  contentType: "housing",
  contentId: housingListingId,
  status: "pending" | "reviewing" | "approved" | "removed" | "escalated" | "banned",
  priority: 1-5,  // 1=highest
  reportReason: "spam" | "harassment" | "inappropriate" | "scam" | "violence",
  reportedBy: userId,
  autoFlagged: boolean,
  autoFlagReason: string | null
}
```

### 3.3 Housing Moderation Actions

| Action | Description | Database Effect |
|--------|-------------|-----------------|
| `approve` | Verify listing as safe | status → 'approved' |
| `remove` | Delete listing entirely | `DELETE FROM housing_listings WHERE id = contentId` |
| `ban_user` | Ban the host | user.role → 'guest', user.suspended → true |
| `warn_user` | Issue warning | (Future implementation) |

**Code Reference - Remove Action:**
```typescript
// From server/routes/admin-routes.ts (lines 143-147)
case "remove":
  newStatus = "removed";
  if (queueItem.contentType === "housing") {
    await db.delete(housingListings).where(eq(housingListings.id, queueItem.contentId));
  }
  break;
```

### 3.4 Housing Safety Review System

#### 3.4.1 Safety Review API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/housing-reviews` | GET | List listings for safety review |
| `/api/admin/housing-reviews/:listingId/verify` | POST | Verify listing as safe |
| `/api/admin/housing-reviews/:listingId/reject` | POST | Reject listing for safety concerns |

#### 3.4.2 Housing Review Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| verificationStatus | string | "pending" | Filter by status |
| propertyType | string | - | Filter by property type |
| page | number | 1 | Pagination page |
| limit | number | 50 | Items per page |

#### 3.4.3 Verification Status Flow

```
PENDING → REVIEWING → VERIFIED/REJECTED
    ↓         ↓
    └─────────┴─────→ ESCALATED
```

| Status | Description | Admin Action Required |
|--------|-------------|----------------------|
| pending | Awaiting initial review | Yes - Review needed |
| reviewing | Under active review | In progress |
| verified | Approved for platform | No - Complete |
| rejected | Failed safety review | No - Notify host |
| escalated | Requires senior review | Yes - Higher tier |

### 3.5 Housing Listing Verification Fields

Fields updated during safety verification:

| Field | Type | Description |
|-------|------|-------------|
| verificationStatus | varchar | pending/verified/rejected |
| verifiedBy | integer | FK to users.id (admin) |
| verifiedAt | timestamp | Verification timestamp |
| safetyNotes | text | Admin safety assessment notes |
| rejectionReason | text | Reason if rejected |

### 3.6 Housing Reviews Page Component

**File:** `client/src/pages/admin/HousingReviewsPage.tsx`

**Key Features:**
- Filterable listing queue (by status, property type)
- Search by title, city, host name
- Detailed listing preview dialog
- Verification action buttons
- Safety notes input
- Rejection reason workflow

**State Management:**
```typescript
// Filter states
const [verificationFilter, setVerificationFilter] = useState<string>("pending");
const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
const [searchQuery, setSearchQuery] = useState("");
const [selectedListing, setSelectedListing] = useState<HousingListing | null>(null);
const [safetyNotes, setSafetyNotes] = useState("");
const [rejectionReason, setRejectionReason] = useState("");
```

**Mutations:**
```typescript
// Verify mutation
const verifyMutation = useMutation({
  mutationFn: async (data: { listingId: number; safetyNotes: string }) => {
    const response = await apiRequest("POST", 
      `/api/admin/housing-reviews/${data.listingId}/verify`,
      { safetyNotes: data.safetyNotes }
    );
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/housing-reviews"] });
  }
});

// Reject mutation
const rejectMutation = useMutation({
  mutationFn: async (data: { listingId: number; safetyNotes: string; rejectionReason: string }) => {
    const response = await apiRequest("POST",
      `/api/admin/housing-reviews/${data.listingId}/reject`,
      { safetyNotes: data.safetyNotes, rejectionReason: data.rejectionReason }
    );
    return response.json();
  }
});
```

### 3.7 Housing Listing Data Interface

```typescript
interface HousingListing {
  id: number;
  title: string;
  description: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  currency: string;
  address: string;
  city: string;
  country: string;
  amenities: string[];
  houseRules: string;
  images: string[];
  status: string;
  verificationStatus: string;
  verifiedBy: number | null;
  verifiedAt: string | null;
  safetyNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  host: {
    id: number;
    name: string;
    username: string;
    email: string;
    profileImage: string | null;
  };
}
```

---

## 4. Admin → Users/Friends Connections

### 4.1 Connection Overview

The Admin Center manages user lifecycle, abuse reports, role upgrades, and relationship moderation through comprehensive integration with the Users and Friends systems.

```
┌─────────────────────────────────────────────────────────────────┐
│                 ADMIN → USERS/FRIENDS CONNECTION                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    USER MANAGEMENT                        │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ UserManagementPage.tsx → /api/admin/users                │   │
│  │ AdminUserDetailPage.tsx → /api/admin/users/:userId       │   │
│  │ AdminUsersPage.tsx → users table                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    USER REPORTS                           │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ UserReportsPage.tsx → /api/admin/user-reports            │   │
│  │ SafetyReviewPage.tsx → userReports table                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ROLE MANAGEMENT                        │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ RoleRequestsPage.tsx → /api/admin/role-requests          │   │
│  │ RolesPermissionsPage.tsx → roleRequests table            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 User Management API Endpoints

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/admin/users` | GET | List all users with filters | Paginated user list |
| `/api/admin/users/:userId` | GET | Get user details | User object |
| `/api/admin/users/:userId` | PATCH | Update user role/status | Updated user |
| `/api/admin/users/:userId` | DELETE | Ban or delete user | Success status |
| `/api/admin/activity/recent` | GET | Recent user activity | Activity list |

### 4.3 User List Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | string | "1" | Page number |
| limit | string | "50" | Items per page |
| search | string | "" | Search name/email/username |
| role | string | "" | Filter by role |

### 4.4 User Management Operations

#### 4.4.1 Update User (PATCH)

```typescript
// Request body
{
  role: string;      // New role value
  verified: boolean; // Verification status
}

// Database operation
await db.update(users)
  .set({ role, isVerified: verified, updatedAt: new Date() })
  .where(eq(users.id, parseInt(userId)))
  .returning();
```

#### 4.4.2 Ban User (DELETE with action=ban)

```typescript
// When action=ban
await db.update(users)
  .set({ role: "guest", updatedAt: new Date() })
  .where(eq(users.id, parseInt(userId)));
```

**Banning through Moderation:**
```typescript
// From moderation action handler (lines 148-164)
case "ban_user":
  newStatus = "banned";
  let userId: number | null = null;
  
  // Get user from content type
  if (queueItem.contentType === "user") {
    userId = queueItem.contentId;
  }
  
  if (userId) {
    await db.update(users)
      .set({ role: "guest", suspended: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
  break;
```

#### 4.4.3 Delete User (DELETE with action=delete)

```typescript
// When action=delete (default)
await db.delete(users).where(eq(users.id, parseInt(userId)));
```

### 4.5 User Reports System

#### 4.5.1 User Reports Schema

**Table:** `user_reports`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | serial | No | auto | Primary key |
| reporterId | integer | No | - | FK to users.id (reporter) |
| reportedUserId | integer | No | - | FK to users.id (accused) |
| reportType | varchar(100) | No | - | Report category |
| description | text | No | - | Detailed description |
| evidence | jsonb | Yes | - | Screenshots, URLs, etc. |
| status | varchar(50) | No | 'pending' | Current status |
| severity | varchar(50) | Yes | 'medium' | Urgency level |
| reviewedBy | integer | Yes | - | FK to users.id (admin) |
| reviewedAt | timestamp | Yes | - | Review timestamp |
| adminNotes | text | Yes | - | Admin assessment |
| action | varchar(50) | Yes | - | Action taken |
| actionDetails | text | Yes | - | Action specifics |
| createdAt | timestamp | No | now() | Creation time |
| updatedAt | timestamp | Yes | now() | Last update |

**Indexes:**
- `idx_user_reports_reporter` on reporterId
- `idx_user_reports_reported_user` on reportedUserId
- `idx_user_reports_status` on status
- `idx_user_reports_severity` on severity

#### 4.5.2 Report Types

| Type | Description | Default Severity |
|------|-------------|------------------|
| harassment | Repeated unwanted contact | high |
| spam | Unsolicited commercial content | medium |
| inappropriate_content | Offensive material | medium |
| impersonation | Fake identity | high |
| scam | Fraudulent activity | critical |
| violence | Threats or violent content | critical |
| hate_speech | Discriminatory content | high |
| other | Miscellaneous | medium |

#### 4.5.3 Report Status Flow

```
PENDING → UNDER_REVIEW → RESOLVED/DISMISSED
                ↓
          ESCALATED
```

| Status | Description | Next Actions |
|--------|-------------|--------------|
| pending | New report awaiting review | review, dismiss |
| under_review | Active investigation | resolve, escalate |
| resolved | Action taken | archive |
| dismissed | Unfounded report | archive |
| escalated | Requires senior review | senior action |

#### 4.5.4 User Reports API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/user-reports` | GET | List user reports |
| `/api/admin/user-reports/:reportId/resolve` | POST | Resolve report with action |
| `/api/admin/user-reports/:reportId/dismiss` | POST | Dismiss report |

**Query Parameters for GET:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | "all" | Filter by status |
| severity | string | "all" | Filter by severity |

### 4.6 Role Requests System

#### 4.6.1 Role Requests Schema

**Table:** `role_requests`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | serial | No | auto | Primary key |
| userId | integer | No | - | FK to users.id |
| requestedRole | varchar(50) | No | - | teacher/dj/organizer |
| currentRole | varchar(50) | No | - | Current user role |
| experience | text | No | - | Experience description |
| credentials | jsonb | Yes | - | Certifications, references |
| bio | text | Yes | - | Professional bio |
| specialties | text[] | Yes | - | Teaching styles, genres |
| city | varchar(255) | Yes | - | Location |
| country | varchar(255) | Yes | - | Country |
| website | text | Yes | - | Personal website |
| socialLinks | jsonb | Yes | - | Instagram, YouTube, etc. |
| whyRequest | text | No | - | Reason for upgrade |
| status | varchar(50) | No | 'pending' | Request status |
| reviewedBy | integer | Yes | - | FK to users.id (admin) |
| reviewedAt | timestamp | Yes | - | Review timestamp |
| adminNotes | text | Yes | - | Admin assessment |
| rejectionReason | text | Yes | - | If rejected |
| createdAt | timestamp | No | now() | Creation time |
| updatedAt | timestamp | Yes | now() | Last update |

**Indexes:**
- `idx_role_requests_user` on userId
- `idx_role_requests_status` on status
- `idx_role_requests_requested_role` on requestedRole
- `idx_role_requests_created_at` on createdAt

#### 4.6.2 Requestable Roles

| Role | Description | Requirements |
|------|-------------|--------------|
| teacher | Tango instructor | Experience proof, certifications |
| dj | Event DJ | Playlist samples, experience |
| organizer | Event organizer | Event history, venue connections |

#### 4.6.3 Role Request API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/role-requests` | GET | List role requests |
| `/api/admin/role-requests/:requestId/approve` | POST | Approve request |
| `/api/admin/role-requests/:requestId/reject` | POST | Reject request |

**Query Parameters for GET:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | "pending" | Filter by status |
| requestedRole | string | - | Filter by role type |

#### 4.6.4 Role Request Approval Flow

```typescript
// Approve role request
router.post("/role-requests/:requestId/approve", async (req, res) => {
  const { requestId } = req.params;
  const { adminNotes } = req.body;
  
  // Get the request
  const request = await db.select()
    .from(roleRequests)
    .where(eq(roleRequests.id, parseInt(requestId)));
  
  // Update request status
  await db.update(roleRequests)
    .set({
      status: "approved",
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      adminNotes,
    })
    .where(eq(roleRequests.id, parseInt(requestId)));
  
  // Update user role
  await db.update(users)
    .set({ role: request[0].requestedRole, updatedAt: new Date() })
    .where(eq(users.id, request[0].userId));
});
```

### 4.7 User Reports Page Component

**File:** `client/src/pages/admin/UserReportsPage.tsx`

**Key Features:**
- Filterable report queue
- Severity-based prioritization
- Detailed report dialog
- Action selection (warn, suspend, ban)
- Resolution notes
- Dismissal workflow

**Data Interface:**
```typescript
interface UserReport {
  id: number;
  reporterId: number;
  reportedUserId: number;
  reportType: string;
  description: string;
  evidence: any;
  status: string;
  severity: string;
  reviewedBy: number | null;
  reviewedAt: string | null;
  adminNotes: string | null;
  action: string | null;
  actionDetails: string | null;
  createdAt: string;
  reporter: {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
  };
  reportedUser: {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
    email: string;
  };
}
```

### 4.8 Friendship System Admin Integration

#### 4.8.1 Admin Impact on Friendships

When a user is banned or deleted through admin actions:

| Action | Effect on Friendships |
|--------|----------------------|
| Ban User | Friendships preserved but inaccessible |
| Delete User | CASCADE delete of all friendships |
| Suspend User | Friendships hidden temporarily |

#### 4.8.2 Related Tables Affected

| Table | Relationship | Cascade Behavior |
|-------|--------------|------------------|
| friendships | userId → users.id | ON DELETE CASCADE |
| friendships | friendId → users.id | ON DELETE CASCADE |
| friend_requests | senderId → users.id | ON DELETE CASCADE |
| friend_requests | receiverId → users.id | ON DELETE CASCADE |

---

## 5. Moderation System Architecture

### 5.1 Unified Moderation Queue

The moderation queue serves as the central hub for all reportable content across systems.

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIFIED MODERATION QUEUE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│    │   POSTS    │  │  COMMENTS  │  │  MESSAGES  │               │
│    │contentType │  │contentType │  │contentType │               │
│    │  ='post'   │  │ ='comment' │  │ ='message' │               │
│    └─────┬──────┘  └─────┬──────┘  └─────┬──────┘               │
│          │               │               │                       │
│    ┌─────▼───────────────▼───────────────▼─────┐                │
│    │           moderationQueue Table            │                │
│    │   contentType | contentId | status | ...   │                │
│    └─────┬───────────────┬───────────────┬─────┘                │
│          │               │               │                       │
│    ┌─────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐               │
│    │   USERS    │  │   EVENTS   │  │  HOUSING   │               │
│    │contentType │  │contentType │  │contentType │               │
│    │  ='user'   │  │  ='event'  │  │ ='housing' │               │
│    └────────────┘  └────────────┘  └────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Moderation Queue Schema

**Table:** `moderation_queue`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | serial | No | auto | Primary key |
| contentType | varchar(50) | No | - | post/comment/message/user/event/housing |
| contentId | integer | No | - | FK to respective table |
| userId | integer | Yes | - | Content owner |
| status | varchar(20) | Yes | 'pending' | Queue status |
| priority | integer | Yes | 3 | 1=highest, 5=lowest |
| reportReason | varchar(100) | Yes | - | Reason category |
| reportDetails | text | Yes | - | Detailed description |
| reportedBy | integer | Yes | - | FK to users.id (reporter) |
| autoFlagged | boolean | Yes | false | System-flagged |
| autoFlagReason | varchar(100) | Yes | - | Auto-flag reason |
| moderatorId | integer | Yes | - | Assigned moderator |
| moderatorNotes | text | Yes | - | Moderator assessment |
| actionTaken | varchar(50) | Yes | - | Final action |
| createdAt | timestamp | Yes | now() | Queue entry time |
| reviewedAt | timestamp | Yes | - | Review completion time |

**Indexes:**
- `idx_moderation_queue_content_type` on contentType
- `idx_moderation_queue_status` on status
- `idx_moderation_queue_priority` on priority
- `idx_moderation_queue_created_at` on createdAt
- `idx_moderation_queue_composite` on (status, priority, createdAt)
- `idx_moderation_queue_user` on userId
- `idx_moderation_queue_auto_flagged` on autoFlagged

### 5.3 Moderation Actions Audit Log

**Table:** `moderation_actions`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | serial | No | auto | Primary key |
| moderatorId | integer | No | - | FK to users.id (admin) |
| actionType | varchar(50) | No | - | approve/remove/ban_user/warn/edit |
| targetType | varchar(50) | No | - | Content type targeted |
| targetId | integer | No | - | Target content ID |
| queueId | integer | Yes | - | FK to moderation_queue.id |
| reason | text | Yes | - | Action justification |
| duration | integer | Yes | - | Ban duration (days) |
| reversible | boolean | Yes | true | Can be undone |
| createdAt | timestamp | Yes | now() | Action timestamp |

**Indexes:**
- `idx_moderation_actions_queue` on queueId
- `idx_moderation_actions_moderator` on moderatorId
- `idx_moderation_actions_action` on action
- `idx_moderation_actions_action_type` on actionType
- `idx_moderation_actions_target_type` on targetType
- `idx_moderation_actions_created_at` on createdAt

### 5.4 Auto-Flagged Content

**Table:** `flagged_content`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | serial | No | auto | Primary key |
| contentType | varchar(50) | No | - | Content category |
| contentId | integer | No | - | FK to content table |
| flagType | varchar(50) | No | - | spam/harassment/hate_speech/violence/misinformation/profanity |
| severity | integer | No | - | 1-10 scale |
| confidence | integer | Yes | - | 0-100 for auto-flags |
| detectionMethod | varchar(50) | Yes | - | manual/keyword/ai/pattern |
| createdAt | timestamp | Yes | now() | Flag timestamp |

**Indexes:**
- `idx_flagged_content_type` on contentType
- `idx_flagged_content_flag_type` on flagType
- `idx_flagged_content_severity` on severity
- `idx_flagged_content_created_at` on createdAt

### 5.5 Moderation Actions Available

| Action | Description | Effect |
|--------|-------------|--------|
| approve | Mark content as acceptable | status → 'approved' |
| remove | Delete content | Content deleted from source table |
| ban_user | Ban content owner | user.role → 'guest', user.suspended → true |
| warn_user | Issue warning | (Future: warning system) |
| escalate | Send to senior moderator | status → 'escalated' |

### 5.6 Moderation Dashboard Component

**File:** `client/src/pages/admin/ModerationDashboard.tsx`

**Key Features:**
- Statistics overview (pending, approved, removed, banned)
- Queue management with filters
- Flagged content view
- Audit log review
- Bulk action support
- Priority-based sorting

**State Management:**
```typescript
const [selectedTab, setSelectedTab] = useState("queue");
const [statusFilter, setStatusFilter] = useState("pending");
const [selectedItem, setSelectedItem] = useState<ModerationQueueItem | null>(null);
const [moderatorNotes, setModeratorNotes] = useState("");
```

**Statistics Interface:**
```typescript
interface ModerationStats {
  pending: number;
  approved: number;
  removed: number;
  banned: number;
  flagged: number;
  recentActions24h: number;
}
```

---

## 6. Database Schema Integration

### 6.1 Schema Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA RELATIONSHIPS                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐                                                   │
│  │  users   │◄──────────────────────────────────────┐           │
│  └────┬─────┘                                       │           │
│       │                                             │           │
│       ├──────────┬──────────┬──────────┬──────────┬┼──────────┐ │
│       │          │          │          │          ││          │ │
│       ▼          ▼          ▼          ▼          ▼▼          ▼ │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐   │
│  │housing  │ │userRe-  │ │roleRe-  │ │modera-  │ │modera-   │   │
│  │Listings │ │ports    │ │quests   │ │tionQueue│ │tionActs  │   │
│  └────┬────┘ └─────────┘ └─────────┘ └────┬────┘ └──────────┘   │
│       │                                   │                      │
│       │           ┌───────────────────────┘                      │
│       │           │                                              │
│       ▼           ▼                                              │
│  ┌───────────────────────────┐                                  │
│  │    ADMIN CENTER           │                                  │
│  │    (admin-routes.ts)      │                                  │
│  └───────────────────────────┘                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Foreign Key Relationships

| Table | Column | References | Cascade |
|-------|--------|------------|---------|
| housingListings | hostId | users.id | CASCADE |
| housingListings | verifiedBy | users.id | - |
| userReports | reporterId | users.id | CASCADE |
| userReports | reportedUserId | users.id | CASCADE |
| userReports | reviewedBy | users.id | - |
| roleRequests | userId | users.id | CASCADE |
| roleRequests | reviewedBy | users.id | - |
| moderationQueue | userId | users.id | - |
| moderationQueue | reportedBy | users.id | - |
| moderationQueue | moderatorId | users.id | - |
| moderationActions | moderatorId | users.id | - |
| moderationActions | queueId | moderationQueue.id | - |

### 6.3 Content Type Mapping

| contentType | Source Table | Primary Key |
|-------------|--------------|-------------|
| post | posts | posts.id |
| comment | postComments | postComments.id |
| message | messages | messages.id |
| user | users | users.id |
| event | events | events.id |
| housing | housingListings | housingListings.id |

### 6.4 Drizzle Schema Imports

```typescript
// From server/routes/admin-routes.ts
import { 
  users, 
  posts, 
  postReports, 
  events, 
  userReports, 
  roleRequests, 
  housingListings,
  moderationQueue, 
  moderationActions, 
  flaggedContent, 
  postComments
} from "@shared/schema";
```

---

## 7. API Endpoints Reference

### 7.1 Complete Admin API Endpoint Catalog

#### 7.1.1 Dashboard & Overview

| Endpoint | Method | Auth Level | Purpose |
|----------|--------|------------|---------|
| `/api/admin/stats/overview` | GET | Admin (4) | Dashboard statistics |
| `/api/admin/platform/health` | GET | Admin (4) | Platform health metrics |
| `/api/admin/activity/recent` | GET | Admin (4) | Recent activity log |

#### 7.1.2 User Management

| Endpoint | Method | Auth Level | Purpose |
|----------|--------|------------|---------|
| `/api/admin/users` | GET | Admin (4) | List users with filters |
| `/api/admin/users/:userId` | GET | Admin (4) | User details |
| `/api/admin/users/:userId` | PATCH | Admin (4) | Update user |
| `/api/admin/users/:userId` | DELETE | Admin (4) | Ban/delete user |

#### 7.1.3 Content Moderation

| Endpoint | Method | Auth Level | Purpose |
|----------|--------|------------|---------|
| `/api/admin/moderation/queue` | GET | Admin (4) | Moderation queue |
| `/api/admin/moderation/:id/action` | POST | Admin (4) | Take action |
| `/api/admin/moderation/stats` | GET | Admin (4) | Moderation stats |
| `/api/admin/moderation/flagged` | GET | Admin (4) | Auto-flagged content |
| `/api/admin/moderation/audit-log` | GET | Admin (4) | Action audit log |
| `/api/admin/content/flagged` | GET | Admin (4) | Flagged content |
| `/api/admin/content/:contentId/moderate` | POST | Admin (4) | Moderate content |

#### 7.1.4 User Reports

| Endpoint | Method | Auth Level | Purpose |
|----------|--------|------------|---------|
| `/api/admin/user-reports` | GET | Admin (4) | List user reports |
| `/api/admin/user-reports/:reportId/resolve` | POST | Admin (4) | Resolve report |
| `/api/admin/user-reports/:reportId/dismiss` | POST | Admin (4) | Dismiss report |

#### 7.1.5 Role Requests

| Endpoint | Method | Auth Level | Purpose |
|----------|--------|------------|---------|
| `/api/admin/role-requests` | GET | Admin (4) | List role requests |
| `/api/admin/role-requests/:requestId/approve` | POST | Admin (4) | Approve request |
| `/api/admin/role-requests/:requestId/reject` | POST | Admin (4) | Reject request |

#### 7.1.6 Housing Reviews

| Endpoint | Method | Auth Level | Purpose |
|----------|--------|------------|---------|
| `/api/admin/housing-reviews` | GET | Admin (4) | Housing listings |
| `/api/admin/housing-reviews/:listingId/verify` | POST | Admin (4) | Verify listing |
| `/api/admin/housing-reviews/:listingId/reject` | POST | Admin (4) | Reject listing |

#### 7.1.7 Analytics & Reports

| Endpoint | Method | Auth Level | Purpose |
|----------|--------|------------|---------|
| `/api/admin/reports/analytics` | GET | Admin (4) | Analytics reports |
| `/api/admin/analytics/*` | GET | Admin (4) | Various analytics |

### 7.2 Request/Response Examples

#### 7.2.1 Get Moderation Queue

**Request:**
```http
GET /api/admin/moderation/queue?status=pending&contentType=housing&page=1&limit=50
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "queue": [
    {
      "queue": {
        "id": 123,
        "contentType": "housing",
        "contentId": 456,
        "status": "pending",
        "priority": 2,
        "reportReason": "scam",
        "createdAt": "2025-11-30T10:00:00Z"
      },
      "reporter": {
        "id": 789,
        "username": "john_doe",
        "name": "John Doe"
      }
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 50
}
```

#### 7.2.2 Take Moderation Action

**Request:**
```http
POST /api/admin/moderation/123/action
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "action": "remove",
  "notes": "Listing contains fraudulent information"
}
```

**Response:**
```json
{
  "success": true,
  "id": "123",
  "action": "remove",
  "status": "removed"
}
```

#### 7.2.3 Verify Housing Listing

**Request:**
```http
POST /api/admin/housing-reviews/456/verify
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "safetyNotes": "Property verified via video call. Host identity confirmed."
}
```

**Response:**
```json
{
  "success": true,
  "listingId": 456,
  "status": "verified"
}
```

---

## 8. Admin UI Pages

### 8.1 Complete Admin Page Inventory

| Page | File Path | Primary Function |
|------|-----------|------------------|
| AdminDashboardPage | `client/src/pages/admin/AdminDashboardPage.tsx` | Main dashboard |
| UserManagementPage | `client/src/pages/admin/UserManagementPage.tsx` | User CRUD |
| AdminUserDetailPage | `client/src/pages/admin/AdminUserDetailPage.tsx` | User details |
| ModerationDashboard | `client/src/pages/admin/ModerationDashboard.tsx` | Content moderation |
| HousingReviewsPage | `client/src/pages/admin/HousingReviewsPage.tsx` | Housing safety |
| UserReportsPage | `client/src/pages/admin/UserReportsPage.tsx` | User reports |
| RoleRequestsPage | `client/src/pages/admin/RoleRequestsPage.tsx` | Role upgrades |
| SafetyReviewPage | `client/src/pages/admin/SafetyReviewPage.tsx` | Safety issues |
| EventApprovalsPage | `client/src/pages/admin/EventApprovalsPage.tsx` | Event moderation |
| AnalyticsDashboard | `client/src/pages/admin/AnalyticsDashboard.tsx` | Analytics |
| SystemHealthPage | `client/src/pages/admin/SystemHealthPage.tsx` | System status |
| FeatureFlagsPage | `client/src/pages/admin/FeatureFlagsPage.tsx` | Feature toggles |
| IntegrationsPage | `client/src/pages/admin/IntegrationsPage.tsx` | Integrations |
| PlatformSettingsPage | `client/src/pages/admin/PlatformSettingsPage.tsx` | Settings |
| PricingManagerPage | `client/src/pages/admin/PricingManagerPage.tsx` | Pricing config |
| AdsManager | `client/src/pages/admin/AdsManager.tsx` | Ad management |
| RolesPermissionsPage | `client/src/pages/admin/RolesPermissionsPage.tsx` | RBAC config |
| ReportsLogsPage | `client/src/pages/admin/ReportsLogsPage.tsx` | Logs view |
| ProjectTrackerPage | `client/src/pages/admin/ProjectTrackerPage.tsx` | Project tracking |
| TaskBoardPage | `client/src/pages/admin/TaskBoardPage.tsx` | Task management |
| TalentPipelinePage | `client/src/pages/admin/TalentPipelinePage.tsx` | Talent review |
| SelfHealingPage | `client/src/pages/admin/SelfHealingPage.tsx` | Error recovery |
| AgentHealthDashboard | `client/src/pages/admin/AgentHealthDashboard.tsx` | AI agent status |
| AISupportPage | `client/src/pages/admin/AISupportPage.tsx` | AI support tools |
| FounderApprovalPage | `client/src/pages/admin/FounderApprovalPage.tsx` | Founder review |
| AdminFacebookImport | `client/src/pages/admin/AdminFacebookImport.tsx` | Facebook import |

### 8.2 Page Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN PAGE DEPENDENCIES                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     SHARED COMPONENTS                    │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ • PageLayout      • SEO                                 │    │
│  │ • Card            • Button          • Badge             │    │
│  │ • Table           • Dialog          • Tabs              │    │
│  │ • Input           • Textarea        • Select            │    │
│  │ • Avatar          • Alert           • Toast             │    │
│  │ • SelfHealingErrorBoundary                             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     SHARED HOOKS                         │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ • useQuery        • useMutation                         │    │
│  │ • useToast        • queryClient                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     SHARED UTILITIES                     │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ • apiRequest      • safeDateFormat                      │    │
│  │ • format (date-fns)                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Data Flow Diagrams

### 9.1 Housing Moderation Flow

```
User Reports Housing → API Receives Report
        ↓
Create moderationQueue Entry (contentType='housing')
        ↓
Admin Opens ModerationDashboard
        ↓
Reviews Queue Item → Views Housing Details
        ↓
    ┌───┴───┐
    ↓       ↓
APPROVE   REMOVE
    ↓       ↓
Update    DELETE from
Status    housingListings
    ↓       ↓
Log Action to moderationActions
        ↓
Invalidate Query Cache → UI Updates
```

### 9.2 User Report Resolution Flow

```
User Submits Report → API Creates userReports Entry
        ↓
Admin Opens UserReportsPage
        ↓
Reviews Report Details
        ↓
    ┌───┴───┐───┐
    ↓       ↓   ↓
RESOLVE  DISMISS ESCALATE
    ↓       ↓   ↓
Update userReports.status
        ↓
If action = ban_user:
  → Update users.role = 'guest'
  → Update users.suspended = true
        ↓
Notify Reporter (future)
```

### 9.3 Role Request Approval Flow

```
User Submits Role Request → API Creates roleRequests Entry
        ↓
Admin Opens RoleRequestsPage
        ↓
Reviews Request Details
        ↓
    ┌───┴───┐
    ↓       ↓
APPROVE   REJECT
    ↓       ↓
Update    Update roleRequests.status
roleRequests   + rejectionReason
.status
    ↓
Update users.role to requestedRole
        ↓
Notify User (future)
```

---

## 10. Security & RBAC Integration

### 10.1 Authentication Middleware

```typescript
// Authentication flow
router.use(authenticateToken);  // JWT validation
router.use(requireAdmin);        // Role level check (≥4)
```

### 10.2 RBAC Levels for Admin Access

| Level | Role | Permissions |
|-------|------|-------------|
| 8 | God | All permissions + system config |
| 7 | Super Admin | All admin + create admins |
| 6 | Platform Volunteer | Moderation + limited user management |
| 5 | Platform Contributor | Read-only admin views |
| 4 | Admin | Standard moderation + user management |

### 10.3 Permission Enforcement

```typescript
// From server/middleware/tierEnforcement.ts
export const requireMinimumRole = (minLevel: number) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userLevel = getRoleLevel(req.user?.role);
    if (userLevel < minLevel) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};
```

### 10.4 Audit Trail Requirements

All admin actions are logged with:

| Field | Purpose |
|-------|---------|
| moderatorId | Who performed action |
| actionType | What action was taken |
| targetType | What type of content |
| targetId | Specific content ID |
| reason | Justification |
| createdAt | When it occurred |

---

## 11. Cross-References

### 11.1 Related PRDs

| PRD | Relationship |
|-----|--------------|
| [PRD_HOUSING_SYSTEM.md](./PRD_HOUSING_SYSTEM.md) | Housing listing schema, booking flow |
| [PRD_FRIENDSHIP_SYSTEM.md](./PRD_FRIENDSHIP_SYSTEM.md) | Friendship tables, closeness scoring |
| [PRD_EVENTS_SYSTEM.md](./PRD_EVENTS_SYSTEM.md) | Event moderation connection |
| [PRD_RBAC_ABAC_COMPLETE.md](./PRD_RBAC_ABAC_COMPLETE.md) | Role-based access control |
| [PRD_USER_PROFILE_SYSTEM.md](./PRD_USER_PROFILE_SYSTEM.md) | User data structure |

### 11.2 Related Files

| File | Purpose |
|------|---------|
| `server/routes/admin-routes.ts` | All admin API endpoints |
| `server/middleware/auth.ts` | Authentication middleware |
| `server/middleware/tierEnforcement.ts` | RBAC middleware |
| `shared/schema.ts` | Database schema definitions |
| `server/storage.ts` | Storage interface |

### 11.3 Related Routes

| Route File | Connection |
|------------|------------|
| `server/routes/housing-routes.ts` | Housing CRUD operations |
| `server/routes/friends-routes.ts` | Friendship operations |
| `server/routes/events-routes.ts` | Event operations |
| `server/routes/users-routes.ts` | User profile operations |

---

## 12. Implementation Details

### 12.1 Route Registration

```typescript
// In server/routes.ts
import adminRoutes from "./routes/admin-routes";

app.use("/api/admin", adminRoutes);
```

### 12.2 Error Handling Pattern

```typescript
router.get("/endpoint", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Business logic
    res.json(result);
  } catch (error: any) {
    console.error("Error description:", error);
    res.status(500).json({ error: error.message });
  }
});
```

### 12.3 Query Invalidation Pattern

```typescript
// Frontend mutation
const mutation = useMutation({
  mutationFn: async (data) => {
    return apiRequest("POST", "/api/admin/endpoint", data);
  },
  onSuccess: () => {
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ["/api/admin/queue"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
  }
});
```

### 12.4 Pagination Implementation

```typescript
// Standard pagination pattern
const { page = "1", limit = "50" } = req.query;
const pageNum = parseInt(page as string);
const limitNum = parseInt(limit as string);
const offset = (pageNum - 1) * limitNum;

const results = await db.select()
  .from(table)
  .limit(limitNum)
  .offset(offset);

const totalCount = await db.select({ count: count() }).from(table);

res.json({
  data: results,
  total: totalCount[0]?.count || 0,
  page: pageNum,
  limit: limitNum,
});
```

---

## 13. Error Handling

### 13.1 Error Response Format

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### 13.2 Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid JWT |
| FORBIDDEN | 403 | Insufficient role level |
| NOT_FOUND | 404 | Resource not found |
| INVALID_ACTION | 400 | Invalid action specified |
| SERVER_ERROR | 500 | Internal server error |

### 13.3 Error Logging

```typescript
console.error("Error fetching moderation queue:", error);
console.error("Error verifying housing listing:", error);
console.error("Error resolving user report:", error);
```

---

## 14. Future Considerations

### 14.1 Planned Enhancements

| Enhancement | Priority | Description |
|-------------|----------|-------------|
| Warning System | High | Implement user warning workflow |
| Bulk Actions | Medium | Process multiple queue items |
| Auto-Moderation | Medium | AI-powered content screening |
| Escalation Rules | Medium | Automated escalation criteria |
| Mobile Admin App | Low | React Native admin interface |
| Real-time Updates | Medium | WebSocket for live queue updates |

### 14.2 Performance Optimizations

| Optimization | Impact |
|--------------|--------|
| Queue caching | Reduce database load |
| Batch processing | Handle high volume reports |
| Index optimization | Faster query response |
| Connection pooling | Better database utilization |

### 14.3 Integration Expansion

| System | Connection Type |
|--------|-----------------|
| Marketplace | Product moderation |
| Groups | Group moderation |
| Travel Plans | Travel content review |
| Mr. Blue AI | AI moderation assistant |

---

## Appendix A: Complete Schema Reference

### A.1 moderationQueue Table

```sql
CREATE TABLE moderation_queue (
  id SERIAL PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL,
  content_id INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  priority INTEGER DEFAULT 3,
  report_reason VARCHAR(100),
  report_details TEXT,
  reported_by INTEGER REFERENCES users(id),
  reason VARCHAR(100),
  description TEXT,
  auto_flagged BOOLEAN DEFAULT false,
  auto_flag_reason VARCHAR(100),
  moderator_id INTEGER REFERENCES users(id),
  moderated_by INTEGER REFERENCES users(id),
  moderator_notes TEXT,
  action_taken VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  moderated_at TIMESTAMP
);

CREATE INDEX idx_moderation_queue_content_type ON moderation_queue(content_type);
CREATE INDEX idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX idx_moderation_queue_priority ON moderation_queue(priority);
CREATE INDEX idx_moderation_queue_created_at ON moderation_queue(created_at);
CREATE INDEX idx_moderation_queue_composite ON moderation_queue(status, priority, created_at);
CREATE INDEX idx_moderation_queue_user ON moderation_queue(user_id);
CREATE INDEX idx_moderation_queue_auto_flagged ON moderation_queue(auto_flagged);
```

### A.2 moderationActions Table

```sql
CREATE TABLE moderation_actions (
  id SERIAL PRIMARY KEY,
  moderator_id INTEGER NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id INTEGER NOT NULL,
  queue_id INTEGER REFERENCES moderation_queue(id),
  action VARCHAR(50),
  reason TEXT,
  duration INTEGER,
  reversible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_moderation_actions_queue ON moderation_actions(queue_id);
CREATE INDEX idx_moderation_actions_moderator ON moderation_actions(moderator_id);
CREATE INDEX idx_moderation_actions_action ON moderation_actions(action);
CREATE INDEX idx_moderation_actions_action_type ON moderation_actions(action_type);
CREATE INDEX idx_moderation_actions_target_type ON moderation_actions(target_type);
CREATE INDEX idx_moderation_actions_created_at ON moderation_actions(created_at);
```

### A.3 userReports Table

```sql
CREATE TABLE user_reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  severity VARCHAR(50) DEFAULT 'medium',
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  admin_notes TEXT,
  action VARCHAR(50),
  action_details TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX idx_user_reports_reported_user ON user_reports(reported_user_id);
CREATE INDEX idx_user_reports_status ON user_reports(status);
CREATE INDEX idx_user_reports_severity ON user_reports(severity);
```

### A.4 roleRequests Table

```sql
CREATE TABLE role_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_role VARCHAR(50) NOT NULL,
  current_role VARCHAR(50) NOT NULL,
  experience TEXT NOT NULL,
  credentials JSONB,
  bio TEXT,
  specialties TEXT[],
  city VARCHAR(255),
  country VARCHAR(255),
  website TEXT,
  social_links JSONB,
  why_request TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  admin_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_role_requests_user ON role_requests(user_id);
CREATE INDEX idx_role_requests_status ON role_requests(status);
CREATE INDEX idx_role_requests_requested_role ON role_requests(requested_role);
CREATE INDEX idx_role_requests_created_at ON role_requests(created_at);
```

### A.5 housingListings Safety Fields

```sql
-- Safety verification fields in housing_listings
verification_status VARCHAR DEFAULT 'pending' NOT NULL,
verified_by INTEGER REFERENCES users(id),
verified_at TIMESTAMP,
safety_notes TEXT,
rejection_reason TEXT
```

### A.6 postReports Table

```sql
CREATE TABLE post_reports (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR NOT NULL,
  details TEXT,
  status VARCHAR DEFAULT 'pending' NOT NULL,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  action VARCHAR,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX post_reports_post_idx ON post_reports(post_id);
CREATE INDEX post_reports_reporter_idx ON post_reports(reporter_id);
CREATE INDEX post_reports_status_idx ON post_reports(status);
```

---

## Appendix B: TypeScript Type Definitions

### B.1 Moderation Types

```typescript
// From shared/schema.ts
export const insertModerationQueueSchema = createInsertSchema(moderationQueue)
  .omit({ id: true, createdAt: true, moderatedAt: true });
export type InsertModerationQueue = z.infer<typeof insertModerationQueueSchema>;
export type SelectModerationQueue = typeof moderationQueue.$inferSelect;

export const insertModerationActionSchema = createInsertSchema(moderationActions)
  .omit({ id: true, createdAt: true });
export type InsertModerationAction = z.infer<typeof insertModerationActionSchema>;
export type SelectModerationAction = typeof moderationActions.$inferSelect;

export const insertFlaggedContentSchema = createInsertSchema(flaggedContent)
  .omit({ id: true, createdAt: true });
export type InsertFlaggedContent = z.infer<typeof insertFlaggedContentSchema>;
export type SelectFlaggedContent = typeof flaggedContent.$inferSelect;
```

### B.2 User Report Types

```typescript
export const insertUserReportSchema = createInsertSchema(userReports)
  .omit({ id: true, createdAt: true, updatedAt: true, reviewedAt: true });
export type InsertUserReport = z.infer<typeof insertUserReportSchema>;
export type SelectUserReport = typeof userReports.$inferSelect;
```

### B.3 Role Request Types

```typescript
export const insertRoleRequestSchema = createInsertSchema(roleRequests)
  .omit({ id: true, createdAt: true, updatedAt: true, reviewedAt: true });
export type InsertRoleRequest = z.infer<typeof insertRoleRequestSchema>;
export type SelectRoleRequest = typeof roleRequests.$inferSelect;
```

---

## Appendix C: API Response Examples

### C.1 Moderation Stats Response

```json
{
  "pending": 23,
  "approved": 1547,
  "removed": 89,
  "banned": 12,
  "flagged": 34,
  "recentActions24h": 156
}
```

### C.2 Platform Health Response

```json
{
  "status": "healthy",
  "totalUsers": 15234,
  "totalPosts": 89456,
  "totalEvents": 1234,
  "activeUsers24h": 3421,
  "timestamp": "2025-11-30T12:00:00.000Z"
}
```

### C.3 User List Response

```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": true,
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "total": 15234,
  "page": 1,
  "limit": 50
}
```

---

**Document End**

*This PRD serves as the authoritative reference for Admin Center cross-system connections. For updates, contact the platform development team.*

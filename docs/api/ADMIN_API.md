# Admin API Documentation

## Overview
Comprehensive admin dashboard and platform management system. Includes user management, content moderation, RBAC (Role-Based Access Control), feature flags, pricing tier management, and system health monitoring.

**Base URLs:**
- Admin Operations: `/api/admin`
- RBAC: `/api/rbac`
- Feature Flags: `/api/feature-flags`
- Pricing: `/api/pricing`

**Authentication:** JWT Bearer token with admin role required

**Minimum Role Level:** 
- Admin Operations: Level 5 (Admin)
- RBAC Management: Level 7 (Super Admin/God)
- Feature Flags: Level 5 (Admin)
- Pricing Management: Level 7 (Super Admin)

**Rate Limits:**
- Read Operations: 100 requests/minute
- Write Operations: 30 requests/minute
- Bulk Operations: 10 requests/minute

---

## Table of Contents
1. [Platform Statistics](#platform-statistics)
2. [User Management](#user-management)
3. [Content Moderation](#content-moderation)
4. [RBAC Management](#rbac-management)
5. [Feature Flags](#feature-flags)
6. [Pricing Tiers](#pricing-tiers)

---

## Platform Statistics

### Get Admin Dashboard Stats
```
GET /api/admin/stats/overview
```

Get high-level platform statistics for admin dashboard.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "users": {
    "total": 12450,
    "activeToday": 1234,
    "activeWeek": 5678,
    "activeMonth": 8901,
    "newToday": 45,
    "newWeek": 289,
    "newMonth": 1123,
    "verified": 9876,
    "suspended": 12
  },
  "content": {
    "posts": 45678,
    "events": 2345,
    "groups": 567,
    "messages": 123456,
    "postsToday": 234,
    "eventsToday": 12
  },
  "engagement": {
    "likes": 234567,
    "comments": 56789,
    "eventRsvps": 12345,
    "messagesToday": 4567
  },
  "moderation": {
    "pendingReports": 23,
    "resolvedToday": 15,
    "averageResponseTime": "2.5 hours"
  },
  "revenue": {
    "totalRevenue": 125400,
    "currency": "USD",
    "monthlyRecurring": 8500,
    "activeSubscriptions": 2340,
    "tierBreakdown": {
      "free": 10110,
      "basic": 1200,
      "premium": 890,
      "pro": 250
    }
  },
  "system": {
    "apiLatency": "45ms",
    "uptime": "99.98%",
    "errorRate": "0.02%",
    "queueDepth": 12
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions (requires admin)
- `500 Internal Server Error`

**cURL Example:**
```bash
curl -X GET https://api.mundotango.com/api/admin/stats/overview \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## User Management

### Get Users (Paginated)
```
GET /api/admin/users
```

Get paginated list of users with filtering and search.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 50, max: 100)
- `search` (optional): Search by name, email, or username
- `role` (optional): Filter by role
- `status` (optional): Filter by status (`active`, `suspended`, `inactive`)
- `verified` (optional): Filter by verification status
- `tier` (optional): Filter by subscription tier

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": 123,
      "name": "Maria Rodriguez",
      "username": "maria_tango",
      "email": "maria@example.com",
      "role": "user",
      "subscriptionTier": "premium",
      "isVerified": true,
      "isActive": true,
      "suspended": false,
      "createdAt": "2024-05-15T10:00:00.000Z",
      "lastLoginAt": "2025-11-02T09:30:00.000Z",
      "postCount": 145,
      "followerCount": 234,
      "followingCount": 189
    }
  ],
  "total": 12450,
  "page": 1,
  "limit": 50,
  "totalPages": 249
}
```

**Error Responses:**
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `500 Internal Server Error`

---

### Ban User
```
PUT /api/admin/users/:id/ban
```

Suspend a user account.

**Request Body:**
```json
{
  "reason": "Violation of community guidelines - spam posting",
  "duration": "permanent",
  "notifyUser": true
}
```

**Duration Options:**
- `24h` - 24 hours
- `7d` - 7 days
- `30d` - 30 days
- `permanent` - Permanent ban

**Response (200 OK):**
```json
{
  "id": 123,
  "suspended": true,
  "suspensionReason": "Violation of community guidelines - spam posting",
  "suspendedAt": "2025-11-02T15:00:00.000Z",
  "suspensionEndsAt": null,
  "suspendedBy": 1
}
```

**Error Responses:**
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - User doesn't exist
- `500 Internal Server Error`

---

### Unban User
```
PUT /api/admin/users/:id/unban
```

Restore a suspended user account.

**Request Body:**
```json
{
  "reason": "Suspension appeal approved"
}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "suspended": false,
  "unsuspendedAt": "2025-11-02T16:00:00.000Z",
  "unsuspendedBy": 1
}
```

---

### Change User Role
```
PUT /api/admin/users/:id/role
```

Update user role and permissions.

**Request Body:**
```json
{
  "role": "moderator",
  "reason": "Promoted to moderator for community contributions"
}
```

**Available Roles:**
- `user` (Level 1) - Standard user
- `verified` (Level 2) - Verified user
- `moderator` (Level 5) - Content moderator
- `admin` (Level 6) - Platform admin
- `super_admin` (Level 7) - Super admin
- `god` (Level 8) - God mode (full access)

**Response (200 OK):**
```json
{
  "id": 123,
  "role": "moderator",
  "previousRole": "user",
  "updatedAt": "2025-11-02T15:30:00.000Z",
  "updatedBy": 1
}
```

---

## Content Moderation

### Get Moderation Queue
```
GET /api/admin/moderation/queue
```

Get pending moderation items (reported content).

**Response (200 OK):**
```json
[
  {
    "id": 456,
    "contentType": "post",
    "contentId": 789,
    "content": {
      "id": 789,
      "content": "Inappropriate post content...",
      "userId": 234,
      "createdAt": "2025-11-02T10:00:00.000Z"
    },
    "reporterId": 123,
    "reporter": {
      "id": 123,
      "name": "John Doe",
      "username": "johndoe"
    },
    "reason": "spam",
    "details": "This user is repeatedly posting promotional content",
    "status": "pending",
    "priority": "high",
    "createdAt": "2025-11-02T14:00:00.000Z"
  }
]
```

**Report Reasons:**
- `spam` - Spam or unwanted content
- `harassment` - Harassment or bullying
- `hate_speech` - Hate speech or discrimination
- `violence` - Violence or threats
- `sexual_content` - Sexual or explicit content
- `misinformation` - False information
- `other` - Other violation

**Error Responses:**
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `500 Internal Server Error`

---

### Take Moderation Action
```
POST /api/admin/moderation/:reportId/action
```

Take action on a moderation report.

**Request Body:**
```json
{
  "action": "remove",
  "notes": "Content violates community guidelines - spam",
  "notifyUser": true,
  "additionalAction": "warn_user"
}
```

**Action Types:**
- `dismiss` - Dismiss report (no violation)
- `warn` - Warn user
- `remove` - Remove content
- `suspend` - Suspend user
- `ban` - Ban user permanently

**Additional Actions:**
- `warn_user` - Send warning email
- `suspend_24h` - Suspend for 24 hours
- `suspend_7d` - Suspend for 7 days
- `suspend_30d` - Suspend for 30 days
- `ban_user` - Permanent ban

**Response (200 OK):**
```json
{
  "reportId": 456,
  "action": "remove",
  "status": "resolved",
  "contentRemoved": true,
  "userNotified": true,
  "resolvedBy": 1,
  "resolvedAt": "2025-11-02T15:00:00.000Z",
  "notes": "Content violates community guidelines - spam"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid action type
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Report doesn't exist
- `500 Internal Server Error`

---

### Get Recent Activity
```
GET /api/admin/activity/recent
```

Get recent admin activity log.

**Query Parameters:**
- `limit` (optional): Number of activities (default: 20, max: 100)

**Response (200 OK):**
```json
[
  {
    "id": 567,
    "adminId": 1,
    "admin": {
      "name": "Super Admin",
      "username": "admin"
    },
    "action": "user_banned",
    "target": "user:234",
    "details": {
      "userId": 234,
      "reason": "Violation of community guidelines"
    },
    "createdAt": "2025-11-02T15:00:00.000Z"
  }
]
```

---

## RBAC Management

Role-Based Access Control system for managing platform permissions.

### Get All Roles
```
GET /api/rbac/roles
```

Get all platform roles with their permissions.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Minimum Role Level:** 7 (Super Admin)

**Response (200 OK):**
```json
{
  "roles": [
    {
      "id": 1,
      "name": "user",
      "displayName": "User",
      "level": 1,
      "description": "Standard platform user",
      "permissions": [
        "posts.create",
        "posts.read",
        "posts.update_own",
        "posts.delete_own",
        "events.create",
        "events.read"
      ],
      "isSystem": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": 5,
      "name": "admin",
      "displayName": "Administrator",
      "level": 6,
      "description": "Platform administrator",
      "permissions": [
        "posts.*",
        "events.*",
        "users.read",
        "users.update",
        "moderation.*"
      ],
      "isSystem": true
    }
  ]
}
```

**System Roles:**
| Role | Level | Description |
|------|-------|-------------|
| user | 1 | Standard user |
| verified | 2 | Verified user |
| moderator | 5 | Content moderator |
| admin | 6 | Platform admin |
| super_admin | 7 | Super admin |
| god | 8 | God mode (full access) |

---

### Get All Permissions
```
GET /api/rbac/all-permissions
```

Get all available platform permissions.

**Response (200 OK):**
```json
{
  "permissions": [
    {
      "id": 1,
      "name": "posts.create",
      "resource": "posts",
      "action": "create",
      "description": "Create new posts"
    },
    {
      "id": 2,
      "name": "posts.read",
      "resource": "posts",
      "action": "read",
      "description": "Read posts"
    },
    {
      "id": 10,
      "name": "users.update",
      "resource": "users",
      "action": "update",
      "description": "Update user information"
    }
  ]
}
```

---

### Assign Role to User
```
POST /api/rbac/users/:userId/roles
```

Assign a role to a user.

**Request Body:**
```json
{
  "roleId": 5
}
```

**Response (200 OK):**
```json
{
  "userId": 123,
  "roleId": 5,
  "role": {
    "name": "moderator",
    "displayName": "Moderator",
    "level": 5
  },
  "assignedAt": "2025-11-02T15:00:00.000Z"
}
```

---

## Feature Flags

Control feature rollouts and A/B testing.

### Get All Feature Flags
```
GET /api/feature-flags
```

Get all feature flags with their status.

**Response (200 OK):**
```json
{
  "flags": [
    {
      "id": 1,
      "name": "new_messaging_ui",
      "displayName": "New Messaging UI",
      "description": "Redesigned messaging interface",
      "enabled": true,
      "rolloutPercentage": 50,
      "targetRoles": ["premium", "pro"],
      "targetUsers": [123, 456],
      "createdAt": "2025-10-15T10:00:00.000Z",
      "updatedAt": "2025-11-01T14:00:00.000Z"
    },
    {
      "id": 2,
      "name": "ai_recommendations",
      "displayName": "AI Event Recommendations",
      "description": "ML-powered event recommendations",
      "enabled": false,
      "rolloutPercentage": 0,
      "createdAt": "2025-11-01T10:00:00.000Z"
    }
  ]
}
```

---

### Create Feature Flag
```
POST /api/feature-flags
```

Create a new feature flag.

**Request Body:**
```json
{
  "name": "new_feature",
  "displayName": "New Feature",
  "description": "Description of the new feature",
  "enabled": false,
  "rolloutPercentage": 0
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "name": "new_feature",
  "displayName": "New Feature",
  "enabled": false,
  "rolloutPercentage": 0,
  "createdAt": "2025-11-02T15:00:00.000Z"
}
```

---

### Update Feature Flag
```
PUT /api/feature-flags/:id
```

Update feature flag configuration.

**Request Body:**
```json
{
  "enabled": true,
  "rolloutPercentage": 25,
  "targetRoles": ["premium"]
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "enabled": true,
  "rolloutPercentage": 25,
  "targetRoles": ["premium"],
  "updatedAt": "2025-11-02T15:30:00.000Z"
}
```

---

### Check Feature for User
```
GET /api/feature-flags/:name/enabled
```

Check if feature is enabled for current user.

**Response (200 OK):**
```json
{
  "enabled": true,
  "reason": "user_in_rollout_percentage"
}
```

**Reasons:**
- `globally_enabled` - Feature enabled for all
- `user_in_rollout_percentage` - User in rollout percentage
- `user_role_match` - User role matches target
- `user_id_match` - User ID in target list
- `disabled` - Feature disabled

---

## Pricing Tiers

Manage subscription tiers and pricing.

### Get All Tiers
```
GET /api/pricing/tiers
```

Get all pricing tiers.

**Response (200 OK):**
```json
{
  "tiers": [
    {
      "id": 1,
      "name": "free",
      "displayName": "Free",
      "description": "Basic access to Mundo Tango",
      "monthlyPrice": 0,
      "annualPrice": 0,
      "roleLevel": 1,
      "features": {
        "maxEvents": 3,
        "maxGroups": 2,
        "messaging": true,
        "advancedSearch": false,
        "prioritySupport": false
      },
      "isVisible": true,
      "isPopular": false,
      "stripePriceId": null,
      "userCount": 10110
    },
    {
      "id": 2,
      "name": "premium",
      "displayName": "Premium",
      "description": "Full platform access",
      "monthlyPrice": 9.99,
      "annualPrice": 99.99,
      "roleLevel": 2,
      "features": {
        "maxEvents": -1,
        "maxGroups": -1,
        "messaging": true,
        "advancedSearch": true,
        "prioritySupport": true,
        "analytics": true
      },
      "isVisible": true,
      "isPopular": true,
      "stripePriceId": "price_1234567890",
      "userCount": 890
    }
  ]
}
```

---

### Create Pricing Tier
```
POST /api/pricing/admin/tiers
```

Create a new pricing tier.

**Minimum Role Level:** 7 (Super Admin)

**Request Body:**
```json
{
  "name": "enterprise",
  "displayName": "Enterprise",
  "description": "For large organizations",
  "monthlyPrice": 99.99,
  "annualPrice": 999.99,
  "roleLevel": 3,
  "features": {
    "maxEvents": -1,
    "maxGroups": -1,
    "customBranding": true,
    "apiAccess": true,
    "dedicatedSupport": true
  }
}
```

**Response (201 Created):**
```json
{
  "id": 5,
  "name": "enterprise",
  "displayName": "Enterprise",
  "monthlyPrice": 99.99,
  "annualPrice": 999.99,
  "stripePriceId": "price_9876543210",
  "createdAt": "2025-11-02T15:00:00.000Z"
}
```

---

### Update Tier Visibility
```
PATCH /api/pricing/admin/tiers/:tierId/visibility
```

Show or hide a pricing tier from public.

**Request Body:**
```json
{
  "isVisible": false
}
```

**Response (200 OK):**
```json
{
  "message": "Tier visibility updated"
}
```

---

### Set Tier as Popular
```
PATCH /api/pricing/admin/tiers/:tierId/popular
```

Mark a tier as "Most Popular" for marketing.

**Request Body:**
```json
{
  "isPopular": true
}
```

**Response (200 OK):**
```json
{
  "message": "Tier popularity updated"
}
```

---

## H2AC Handoff Notes

### 🔧 Manual Configuration Required
- **Stripe Integration**: Configure Stripe for subscription payments
- **Email Service**: Set up email templates for user notifications
- **Monitoring**: Configure error tracking (Sentry, Datadog)
- **Backup Strategy**: Set up automated database backups

### ✅ Auto-Configured Features
- Admin dashboard with real-time stats
- User management (ban, unban, role changes)
- Content moderation queue
- RBAC with 8 permission levels
- Feature flag system
- Pricing tier management
- Activity logging

### 🧪 Testing Recommendations
1. Test user ban/unban flow
2. Verify moderation queue workflow
3. Test role assignment and permissions
4. Verify feature flag rollout percentages
5. Test pricing tier creation
6. Verify admin activity logging

### 📊 Key Metrics to Track
- Daily active users
- Content moderation response time
- User reports per day
- Revenue by tier
- Feature flag adoption rates
- Admin action frequency

### 🔒 Security Notes
- All admin endpoints require authentication
- Role-based permissions strictly enforced
- Activity logging for audit trails
- Rate limiting on all write operations
- Sensitive operations require Level 7+

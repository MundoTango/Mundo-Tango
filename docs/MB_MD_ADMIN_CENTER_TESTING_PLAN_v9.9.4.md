# MB.MD v9.9.4 ADMIN CENTER DATA FLOW TESTING PLAN
## Complete Admin Dashboard Data Flow & Field-Level Testing

**Created**: December 11, 2025  
**Methodology**: MB.MD v9.9.4 (Research → Plan → Build → Test → Fix → Document)

---

## EXECUTIVE SUMMARY

The Admin Center consolidates data from **32+ database tables** across 7 major domains. This plan documents every data flow into the admin dashboard with field-level test actions.

---

## TABLE OF CONTENTS

1. [Admin Routes Overview](#admin-routes-overview)
2. [Tier A: Moderation System](#tier-a-moderation-system)
3. [Tier B: User Management](#tier-b-user-management)
4. [Tier C: Content Reports](#tier-c-content-reports)
5. [Tier D: Role Requests](#tier-d-role-requests)
6. [Tier E: Event Approvals](#tier-e-event-approvals)
7. [Tier F: Scraping Admin](#tier-f-scraping-admin)
8. [Tier G: Analytics & Metrics](#tier-g-analytics--metrics)
9. [Tier H: Audit System](#tier-h-audit-system)
10. [Tier I: Platform Infrastructure](#tier-i-platform-infrastructure)
11. [Data Flow Diagram](#data-flow-diagram)
12. [Cross-References](#cross-references)

---

## ADMIN ROUTES OVERVIEW

**File**: `server/routes/admin-routes.ts` (1868 lines)
**Access Level**: RBAC Level 4+ (Admin, Super Admin, God)

### Admin API Endpoints (48 endpoints identified)

| Category | Endpoint | Method | Tables Accessed |
|----------|----------|--------|-----------------|
| Stats | `/api/admin/stats/overview` | GET | users, posts, events |
| Moderation | `/api/admin/moderation/queue` | GET | moderationQueue, users |
| Moderation | `/api/admin/moderation/:id/action` | POST | moderationQueue, moderationActions, posts, events, users |
| Moderation | `/api/admin/moderation/stats` | GET | moderationQueue, flaggedContent, moderationActions |
| Moderation | `/api/admin/moderation/flagged` | GET | flaggedContent |
| Moderation | `/api/admin/moderation/audit-log` | GET | moderationActions, users |
| Activity | `/api/admin/activity/recent` | GET | activityLogs |
| Users | `/api/admin/users` | GET | users |
| Users | `/api/admin/users/:userId` | PATCH | users |
| Users | `/api/admin/users/:userId` | DELETE | users |
| Content | `/api/admin/content/flagged` | GET | postReports |
| Content | `/api/admin/content/:contentId/moderate` | POST | posts, postReports |
| Platform | `/api/admin/platform/health` | GET | users, posts, events |
| Analytics | `/api/admin/reports/analytics` | GET | posts, events, users |
| Analytics | `/api/admin/analytics/user-growth` | GET | users |
| Analytics | `/api/admin/analytics/engagement` | GET | posts |
| Analytics | `/api/admin/analytics/retention` | GET | users, posts |
| Analytics | `/api/admin/analytics/content-performance` | GET | posts |
| Analytics | `/api/admin/analytics/demographics` | GET | users |
| Analytics | `/api/admin/analytics/events-metrics` | GET | events |
| Analytics | `/api/admin/analytics/realtime` | GET | posts, events |
| Reports | `/api/admin/user-reports` | GET | userReports, users |
| Reports | `/api/admin/user-reports/:reportId/resolve` | POST | userReports |
| Reports | `/api/admin/user-reports/:reportId/dismiss` | POST | userReports |
| Roles | `/api/admin/role-requests` | GET | roleRequests, users |
| Roles | `/api/admin/role-requests/:requestId/approve` | POST | roleRequests, users |
| Roles | `/api/admin/role-requests/:requestId/reject` | POST | roleRequests |
| Events | `/api/admin/event-approvals` | GET | events, users |
| Events | `/api/admin/event-approvals/:eventId/approve` | POST | events |
| Events | `/api/admin/event-approvals/:eventId/reject` | POST | events |

---

## TIER A: MODERATION SYSTEM

### A1. moderationQueue Table (lines 6702-6750)

**Data Flow**: Reports → Queue → Admin Action → Resolution

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | serial | Primary key | N/A |
| `contentType` | varchar(50) | Filter by type | Filter: post, comment, message, user, event, housing |
| `contentId` | integer | Link to content | Click to view original content |
| `userId` | integer | Content owner | View user profile |
| `status` | varchar(20) | **KEY**: pending/reviewing/approved/removed/escalated/banned | Update status via action |
| `priority` | integer | Sort by priority | 1=highest, 5=lowest |
| `reportReason` | varchar(100) | Filter by reason | spam/harassment/inappropriate/hate_speech/violence/misinformation |
| `reportDetails` | text | View details | Display in modal |
| `reportedBy` | integer | Reporter user | View reporter profile |
| `autoFlagged` | boolean | Filter auto vs manual | Toggle filter |
| `autoFlagReason` | varchar(100) | AI detection type | Display detection method |
| `moderatorId` | integer | Assigned moderator | Assign to moderator |
| `moderatorNotes` | text | Admin notes | Input notes on action |
| `actionTaken` | varchar(50) | Resolution type | Log action taken |
| `createdAt` | timestamp | Sort by date | Date range filter |
| `reviewedAt` | timestamp | Review timestamp | Track review time |

**Test Scenarios:**
- [ ] VIEW queue with pagination (50/page)
- [ ] FILTER by status (pending, approved, removed, banned)
- [ ] FILTER by content type (post, comment, event, housing)
- [ ] FILTER by priority (1-5)
- [ ] SORT by priority + createdAt
- [ ] TAKE ACTION: approve → status=approved
- [ ] TAKE ACTION: remove → delete content, status=removed
- [ ] TAKE ACTION: ban_user → suspend user, status=banned
- [ ] TAKE ACTION: warn_user → status=approved, send warning
- [ ] ADD moderator notes
- [ ] COUNT pending items

---

### A2. moderationActions Table (lines 6753-6790)

**Data Flow**: Admin Action → Audit Log

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | serial | Primary key | N/A |
| `moderatorId` | integer | Action performer | Filter by moderator |
| `actionType` | varchar(50) | approve/remove/ban_user/warn/edit | Filter by action |
| `targetType` | varchar(50) | Content type | Filter by target |
| `targetId` | integer | Target entity | Link to target |
| `queueId` | integer | FK to moderationQueue | Link to queue item |
| `reason` | text | Action reason | View/export |
| `duration` | integer | Ban duration (days) | Display duration |
| `reversible` | boolean | Can undo | Enable undo button |
| `createdAt` | timestamp | Action time | Date range filter |

**Test Scenarios:**
- [ ] VIEW audit log with pagination (100/page)
- [ ] FILTER by moderator
- [ ] FILTER by action type
- [ ] FILTER by date range
- [ ] COUNT actions in last 24h
- [ ] EXPORT audit log

---

### A3. flaggedContent Table (lines 6794-6820)

**Data Flow**: Auto-Detection → Flagged → Review

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | serial | Primary key | N/A |
| `contentType` | varchar(50) | Content category | Filter by type |
| `contentId` | integer | Target content | View content |
| `flagType` | varchar(50) | spam/harassment/hate_speech/violence/misinformation/profanity | Filter by flag |
| `severity` | integer | 1-10 severity | Sort by severity |
| `confidence` | integer | 0-100 AI confidence | Filter by confidence |
| `detectionMethod` | varchar(50) | manual/keyword/ai/pattern | Filter by method |
| `createdAt` | timestamp | Flag time | Date range filter |

**Test Scenarios:**
- [ ] VIEW auto-flagged content with pagination
- [ ] FILTER by flag type
- [ ] SORT by severity (high to low)
- [ ] FILTER by confidence threshold (>80%)
- [ ] FILTER by detection method
- [ ] REVIEW and approve/remove flagged content

---

## TIER B: USER MANAGEMENT

### B1. Admin User Management

**Data Flow**: users table → Admin Dashboard

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | serial | Primary key | View user |
| `name` | varchar | Search field | Search by name |
| `email` | varchar | Search field | Search by email |
| `username` | varchar | Search field | Search by username |
| `role` | varchar | **KEY**: Update role | Change user role |
| `isVerified` | boolean | Verify user | Toggle verification |
| `suspended` | boolean | Ban user | Suspend account |
| `city`, `country` | varchar | Demographics | Analytics filter |
| `createdAt` | timestamp | Registration date | Sort/filter |

**Admin Endpoints:**
- `GET /api/admin/users` - List all users with pagination (50/page)
- `PATCH /api/admin/users/:userId` - Update role/verification
- `DELETE /api/admin/users/:userId` - Delete or ban user

**Test Scenarios:**
- [ ] LIST users with pagination
- [ ] SEARCH by name/email/username
- [ ] FILTER by role
- [ ] UPDATE user role
- [ ] VERIFY user
- [ ] BAN user (set role=guest, suspended=true)
- [ ] DELETE user

---

### B2. userReports Table (lines 6664-6695)

**Data Flow**: User Report → Admin Review → Resolution

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | serial | Primary key | N/A |
| `reporterId` | integer | Reporter user | View reporter |
| `reportedUserId` | integer | Reported user | View reported user |
| `reportType` | varchar(100) | harassment/spam/inappropriate_content/impersonation/scam/violence/hate_speech/other | Filter by type |
| `description` | text | Report details | Read description |
| `evidence` | jsonb | Screenshots, URLs | View evidence |
| `status` | varchar(50) | **KEY**: pending/under_review/resolved/dismissed | Update status |
| `severity` | varchar(50) | low/medium/high/critical | Sort by severity |
| `reviewedBy` | integer | Reviewing admin | Assign reviewer |
| `reviewedAt` | timestamp | Review time | Track review |
| `adminNotes` | text | Admin notes | Add notes |
| `action` | varchar(50) | no_action/warning/suspension/ban | Take action |
| `actionDetails` | text | Action explanation | Document action |
| `createdAt` | timestamp | Report time | Date filter |

**Test Scenarios:**
- [ ] VIEW user reports with pagination
- [ ] FILTER by status (pending, resolved, dismissed)
- [ ] FILTER by severity (low, medium, high, critical)
- [ ] VIEW evidence (screenshots, URLs)
- [ ] RESOLVE report with action (no_action, warning, suspension, ban)
- [ ] DISMISS report with notes
- [ ] TRACK resolution time

---

## TIER C: CONTENT REPORTS

### C1. postReports Table

**Data Flow**: Post Report → Admin Review → Moderation Action

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | serial | Primary key | N/A |
| `reporterId` | integer | Reporter | View reporter |
| `postId` | integer | Reported post | View post |
| `reason` | varchar | Report reason | Filter by reason |
| `status` | varchar | pending/resolved | Update status |
| `createdAt` | timestamp | Report time | Date filter |

**Test Scenarios:**
- [ ] VIEW flagged posts
- [ ] FILTER by status
- [ ] MODERATE post (approve/remove)
- [ ] UPDATE report status to resolved

---

### C2. contentReports Table (lines 6593-6618)

**Data Flow**: Generic Content Report → Admin Review

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | serial | Primary key | N/A |
| `reporterId` | integer | Reporter | View reporter |
| `contentType` | varchar(50) | Content category | Filter by type |
| `contentId` | integer | Target content | View content |
| `reportType` | varchar(100) | Report reason | Filter by type |
| `description` | text | Details | Read details |
| `status` | varchar(50) | pending status | Update status |
| `reviewedBy` | integer | Reviewer | Assign reviewer |
| `reviewedAt` | timestamp | Review time | Track time |
| `resolution` | text | Resolution notes | Document resolution |

**Test Scenarios:**
- [ ] VIEW content reports
- [ ] FILTER by content type
- [ ] FILTER by status
- [ ] RESOLVE with notes

---

## TIER D: ROLE REQUESTS

### D1. roleRequests Table (lines 6822+)

**Data Flow**: User Request → Admin Review → Role Update

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | serial | Primary key | N/A |
| `userId` | integer | Requesting user | View applicant |
| `requestedRole` | varchar | teacher/dj/organizer | Filter by role |
| `currentRole` | varchar | Current role | Compare roles |
| `experience` | text | Experience details | Review experience |
| `credentials` | jsonb | Certifications | Review credentials |
| `bio` | text | Professional bio | Review bio |
| `specialties` | text[] | Specializations | Review specialties |
| `city`, `country` | varchar | Location | Geography filter |
| `website` | varchar | Portfolio link | Review website |
| `socialLinks` | jsonb | Social profiles | Review social |
| `whyRequest` | text | Motivation | Read motivation |
| `status` | varchar | **KEY**: pending/approved/rejected | Update status |
| `reviewedBy` | integer | Reviewer | Track reviewer |
| `reviewedAt` | timestamp | Review time | Track time |
| `adminNotes` | text | Internal notes | Add notes |
| `rejectionReason` | text | Rejection reason | Document rejection |

**Admin Endpoints:**
- `GET /api/admin/role-requests` - List requests with filters
- `POST /api/admin/role-requests/:requestId/approve` - Approve + update user role
- `POST /api/admin/role-requests/:requestId/reject` - Reject with reason

**Test Scenarios:**
- [ ] VIEW role requests with pagination
- [ ] FILTER by status (pending, approved, rejected)
- [ ] FILTER by requested role (teacher, dj, organizer)
- [ ] REVIEW credentials and experience
- [ ] APPROVE request → user role updated (teacher→teacher, dj→premium, organizer→premium)
- [ ] REJECT request with reason
- [ ] ADD admin notes

---

## TIER E: EVENT APPROVALS

### E1. events Table (admin approval fields)

**Data Flow**: Event Creation → Pending → Admin Review → Published

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | serial | Primary key | N/A |
| `title` | varchar | Event title | Search |
| `eventType` | varchar | Event category | Filter by type |
| `startDate`, `endDate` | timestamp | Event dates | Date range filter |
| `location`, `city`, `country` | text/varchar | Location | Geography filter |
| `status` | varchar | **KEY**: pending/approved/published/cancelled | Update status |
| `visibility` | varchar | public/private/unlisted | Filter by visibility |
| `userId` | integer | Organizer | View organizer |
| `approvedBy` | integer | Approving admin | Track approval |
| `approvedAt` | timestamp | Approval time | Track time |
| `rejectionReason` | text | Rejection reason | Document rejection |
| `adminNotes` | text | Internal notes | Add notes |

**Admin Endpoints:**
- `GET /api/admin/event-approvals` - List pending events
- `POST /api/admin/event-approvals/:eventId/approve` - Approve event
- `POST /api/admin/event-approvals/:eventId/reject` - Reject with reason

**Test Scenarios:**
- [ ] VIEW pending events
- [ ] FILTER by status (pending, approved, rejected)
- [ ] FILTER by event type
- [ ] FILTER by date range
- [ ] VIEW organizer profile
- [ ] APPROVE event → status=published, approvedBy set
- [ ] REJECT event with reason
- [ ] ADD admin notes

---

## TIER F: SCRAPING ADMIN

**File**: `server/routes/scraping-admin-routes.ts` (515 lines)
**Access Level**: Super Admin (role='super_admin')

### F1. scrapedEvents Table (lines 13280-13310)

**Data Flow**: Scraper → scrapedEvents → Admin Review → events table

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | serial | Primary key | N/A |
| `sourceUrl` | varchar(500) | Source URL | View source |
| `sourceName` | varchar(255) | Source name | Filter by source |
| `title` | varchar(500) | Event title | Search |
| `description` | text | Event details | Review |
| `startDate`, `endDate` | timestamp | Dates | Date filter |
| `location`, `address` | varchar/text | Location | **CRITICAL: City normalization** |
| `organizer` | varchar(255) | Organizer | Review |
| `price` | numeric | Ticket price | Review |
| `imageUrl` | varchar(500) | Image | View image |
| `externalId` | varchar(255) | Deduplication ID | Dedup check |
| `scrapedAt` | timestamp | Scrape time | Date filter |
| `status` | varchar(20) | **KEY**: pending_review/approved/rejected/claimed | Update status |
| `claimedByUserId` | integer | Claimed by organizer | Track claims |

**Admin Endpoints:**
- `POST /api/admin/trigger-scraping` - Start scraping workflow
- `GET /api/admin/scraping-status` - Get scraping status
- `POST /api/admin/scraping/deduplicate` - Run deduplication
- `POST /api/admin/scraping/enrich-groups` - Enrich city groups

**Test Scenarios:**
- [ ] TRIGGER scraping workflow
- [ ] VIEW scraping status (running/idle)
- [ ] COUNT scraped events today
- [ ] REVIEW pending scraped events
- [ ] APPROVE scraped event → copy to events table
- [ ] REJECT scraped event
- [ ] RUN deduplication
- [ ] VERIFY city normalization before group creation

---

### F2. eventScrapingSources Table (lines 13313-13341)

**Data Flow**: Admin Configuration → Scraper → Events

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | serial | Primary key | N/A |
| `name` | varchar(255) | Source name | Identify |
| `url` | varchar(500) | Source URL | Configure |
| `rssUrl` | varchar(500) | RSS feed URL | Configure |
| `platform` | varchar(50) | Platform type | Filter |
| `country`, `city` | varchar(100) | Location | Filter |
| `isActive` | boolean | Active status | Toggle |
| `customSelectors` | jsonb | CSS selectors | Configure |
| `lastScrapedAt` | timestamp | Last scrape | Monitor |
| `totalEventsScraped` | integer | Event count | Track |
| `scrapeFrequency` | varchar(20) | daily/weekly/hourly | Configure |

**Test Scenarios:**
- [ ] VIEW active sources (226+ configured)
- [ ] TOGGLE source active status
- [ ] UPDATE custom selectors
- [ ] VIEW last scraped timestamp
- [ ] COUNT events scraped per source

---

### F3. eventClaims Table (lines 13457-13490)

**Data Flow**: Organizer Claim → Admin Verification → Transfer Ownership

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | serial | Primary key | N/A |
| `scrapedEventId` | integer | Scraped event | View event |
| `userId` | integer | Claimant | View claimant |
| `claimReason` | text | Claim justification | Review |
| `verificationStatus` | varchar(20) | pending/verified/rejected | Update status |
| `verificationMethod` | varchar(20) | Method used | Document |
| `claimedAt` | timestamp | Claim time | Track |
| `verifiedAt` | timestamp | Verification time | Track |

**Test Scenarios:**
- [ ] VIEW pending event claims
- [ ] VERIFY claim → transfer ownership
- [ ] REJECT claim with reason

---

## TIER G: ANALYTICS & METRICS

### G1. Platform Analytics Endpoints

| Endpoint | Data Source | Metrics |
|----------|-------------|---------|
| `/api/admin/reports/analytics` | posts, events, users | posts, events, newUsers (timeframe) |
| `/api/admin/analytics/user-growth` | users | Daily registration counts |
| `/api/admin/analytics/engagement` | posts | totalPosts, activeUsers (timeframe) |
| `/api/admin/analytics/retention` | users, posts | retentionRate (30 day) |
| `/api/admin/analytics/content-performance` | posts | Top posts by likes |
| `/api/admin/analytics/demographics` | users | Top cities, totalUsers |
| `/api/admin/analytics/events-metrics` | events | totalEvents (timeframe) |
| `/api/admin/analytics/realtime` | posts, events | postsLastHour, eventsLastHour |

**Test Scenarios:**
- [ ] VIEW user growth chart (7d, 30d, 90d)
- [ ] VIEW engagement metrics
- [ ] VIEW retention rate
- [ ] VIEW top performing content
- [ ] VIEW demographics by city
- [ ] VIEW real-time activity

---

### G2. analyticsEvents Table (lines 15964-15991)

**Data Flow**: User Action → Analytics Event → Aggregation

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `userId` | integer | User | Filter by user |
| `eventType` | varchar(100) | Event type | Filter by type |
| `metadata` | jsonb | Event data | View details |
| `timestamp` | timestamp | Event time | Date range |

---

### G3. dailyStats Table (lines 16023-16048)

**Data Flow**: Nightly Aggregation → Dashboard Display

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `date` | timestamp | Stats date | Date filter |
| `totalUsers` | integer | User count | Display |
| `newUsers` | integer | New registrations | Display |
| `activeUsers` | integer | Active count | Display |
| `totalPosts` | integer | Post count | Display |
| `totalEvents` | integer | Event count | Display |
| `revenue` | integer | Revenue (cents) | Display |
| `subscriptions` | integer | Subscription count | Display |

**Test Scenarios:**
- [ ] VIEW daily stats dashboard
- [ ] COMPARE day-over-day metrics
- [ ] EXPORT stats to CSV

---

### G4. platformMetrics Table (lines 15937-15961)

**Data Flow**: System Metrics → Storage → Display

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `metricName` | varchar(100) | Metric identifier | Filter |
| `metricValue` | integer | Metric value | Display |
| `metricDate` | timestamp | Recording time | Time filter |
| `metadata` | jsonb | Additional data | Details |

---

## TIER H: AUDIT SYSTEM

### H1. auditLogs Table (lines 6620-6638)

**Data Flow**: Any Admin Action → Audit Log

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `userId` | integer | Actor | Filter by admin |
| `action` | varchar(255) | Action type | Filter by action |
| `resourceType` | varchar(100) | Target type | Filter |
| `resourceId` | varchar(255) | Target ID | Link to resource |
| `ipAddress` | varchar(45) | Client IP | Security audit |
| `userAgent` | text | Browser info | Security audit |
| `metadata` | jsonb | Additional data | Details |
| `createdAt` | timestamp | Action time | Date filter |

**Test Scenarios:**
- [ ] VIEW audit log with pagination
- [ ] FILTER by admin user
- [ ] FILTER by action type
- [ ] FILTER by resource type
- [ ] FILTER by date range
- [ ] EXPORT audit log

---

### H2. suspensionLogs Table (lines 6640-6661)

**Data Flow**: Suspension Action → Log → Review

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `userId` | integer | Suspended user | View user |
| `suspendedBy` | integer | Admin who suspended | Track |
| `reason` | text | Suspension reason | Review |
| `duration` | integer | Duration (days) | Track |
| `startsAt` | timestamp | Start time | Track |
| `endsAt` | timestamp | End time | Track |
| `isPermanent` | boolean | Permanent ban | Flag |

**Test Scenarios:**
- [ ] VIEW suspension history
- [ ] FILTER active suspensions
- [ ] FILTER by admin who suspended
- [ ] LIFT suspension early

---

### H3. pageInventory Table (lines 19348-19373)

**Data Flow**: Page Audit System → Storage

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | varchar(255) | Page identifier | Primary key |
| `name` | varchar(255) | Page name | Display |
| `path` | varchar(500) | Route path | Navigate |
| `category` | enum | Page category | Filter |
| `priority` | enum | critical/high/medium/low | Sort |
| `dependencies` | text[] | File dependencies | View |
| `components` | text[] | React components | View |
| `apiEndpoints` | text[] | API routes | View |
| `roleRequired` | integer | RBAC level | Access control |
| `lastAudited` | timestamp | Last audit | Track |
| `issueCount` | integer | Open issues | Track |
| `batchNumber` | integer | Audit batch | Filter |
| `auditStatus` | varchar(50) | pending/complete | Filter |

**Test Scenarios:**
- [ ] VIEW page inventory (312 pages)
- [ ] FILTER by category
- [ ] FILTER by priority
- [ ] FILTER by audit status
- [ ] TRACK issue count per page

---

### H4. auditIssues Table (lines 19386-19417)

**Data Flow**: Audit Detection → Issue → Fix

| Field | Type | Admin Action | Test Scenario |
|-------|------|--------------|---------------|
| `id` | serial | Primary key | N/A |
| `pageId` | varchar(255) | FK to pageInventory | Link to page |
| `issueType` | varchar(50) | accessibility/ux/performance/i18n | Filter |
| `severity` | varchar(20) | critical/high/medium/low | Sort |
| `title` | varchar(500) | Issue title | Display |
| `description` | text | Issue details | Review |
| `recommendation` | text | Fix suggestion | Review |
| `strikeCount` | integer | Auto-fix attempts | Track |
| `status` | varchar(50) | open/fixed/escalated | Update |
| `fixedAt` | timestamp | Fix time | Track |
| `escalatedAt` | timestamp | Escalation time | Track |

**Test Scenarios:**
- [ ] VIEW audit issues (138 resolved in Dec 6 session)
- [ ] FILTER by issue type
- [ ] FILTER by severity
- [ ] FILTER by status
- [ ] RUN auto-fix batch
- [ ] TRACK strike count (3-strike protocol)
- [ ] ESCALATE after 3 failures

---

## TIER I: PLATFORM INFRASTRUCTURE

### I1. Ambassador Program

**ambassadorApplications Table (line 19170)**
**ambassadors Table (line 19214)**

| Field | Admin Action | Test Scenario |
|-------|--------------|---------------|
| `userId` | View applicant | Filter |
| `status` | pending/approved/rejected | Update status |
| `tier` | bronze/silver/gold | Assign tier |
| `referralCode` | Unique code | Generate |
| `totalReferrals` | Referral count | Track |

**Test Scenarios:**
- [ ] VIEW ambassador applications
- [ ] APPROVE/REJECT applications
- [ ] VIEW ambassador stats
- [ ] TRACK referral conversions

---

### I2. Volunteer Applications

**volunteerApplications Table (lines 19268-19315)**

| Field | Admin Action | Test Scenario |
|-------|--------------|---------------|
| `email`, `name` | Applicant info | View |
| `division` | Team division | Filter |
| `preferredRole` | Desired role | Filter |
| `skills` | Skill array | Match |
| `status` | pending/approved/rejected | Update |
| `matchScore` | AI match score | Sort |
| `suggestedTasks` | AI task suggestions | Review |

**Test Scenarios:**
- [ ] VIEW volunteer applications
- [ ] FILTER by division
- [ ] SORT by match score
- [ ] APPROVE with task assignment
- [ ] REJECT with notes

---

### I3. Email System

**emailQueue Table (lines 16054-16080)**
**emailLogs Table (lines 16133-16159)**

| Field | Admin Action | Test Scenario |
|-------|--------------|---------------|
| `status` | pending/sent/failed | Monitor |
| `attempts` | Retry count | Track |
| `errorMessage` | Failure reason | Debug |
| `opened`, `clicked` | Engagement | Analytics |

**Test Scenarios:**
- [ ] VIEW email queue
- [ ] MONITOR failed emails
- [ ] RETRY failed sends
- [ ] VIEW email open/click rates

---

## DATA FLOW DIAGRAM

```
                                    ADMIN CENTER
                                         |
        +--------------------------------+--------------------------------+
        |                |               |               |               |
   MODERATION       USER MGMT      SCRAPING        ANALYTICS        AUDIT
        |                |               |               |               |
   +----+----+       +---+---+      +----+----+     +----+----+     +----+----+
   |         |       |       |      |         |     |         |     |         |
moderationQueue  userReports  scrapedEvents  posts     auditLogs  pageInventory
flaggedContent   roleRequests eventSources   users   suspensionLogs auditIssues
moderationActions             eventClaims    events  moderationActions
        |                |               |               |               |
        +----------------+---------------+---------------+---------------+
                                         |
                                   PostgreSQL DB
```

---

## CROSS-REFERENCES

### Tables → Admin Endpoints Matrix

| Table | Endpoint(s) | Admin Action |
|-------|-------------|--------------|
| users | /admin/users, /admin/analytics/* | CRUD, Analytics |
| posts | /admin/content/*, /admin/analytics/* | Moderate, Analytics |
| events | /admin/event-approvals/* | Approve/Reject |
| moderationQueue | /admin/moderation/* | Review, Action |
| userReports | /admin/user-reports/* | Resolve, Dismiss |
| roleRequests | /admin/role-requests/* | Approve, Reject |
| scrapedEvents | /admin/scraping/* | Review, Approve |
| auditLogs | /admin/moderation/audit-log | View |
| pageInventory | (internal) | Audit tracking |
| auditIssues | (internal) | Issue tracking |

---

## TESTING PRIORITY MATRIX

| Priority | Category | Tables | Test Scenarios |
|----------|----------|--------|----------------|
| **P0** | Moderation | moderationQueue, flaggedContent | Review queue, take actions |
| **P0** | User Reports | userReports | Resolve/dismiss reports |
| **P0** | Scraping | scrapedEvents, eventScrapingSources | Trigger, review, approve |
| **P1** | Role Requests | roleRequests | Approve/reject roles |
| **P1** | Event Approvals | events | Approve/reject events |
| **P1** | User Management | users | CRUD, ban, verify |
| **P2** | Analytics | dailyStats, analyticsEvents | View dashboards |
| **P2** | Audit | auditLogs, auditIssues | View logs, track issues |
| **P3** | Infrastructure | emailQueue, ambassadors | Monitor systems |

---

## RECURSIVE TESTING PLAN

### Level 1: Verify Data Exists
- [ ] Query each table for record counts
- [ ] Verify FK relationships intact
- [ ] Check for orphaned records

### Level 2: Verify API Endpoints
- [ ] Call each admin endpoint with valid auth
- [ ] Verify correct data returned
- [ ] Test error handling for invalid requests

### Level 3: Verify UI Rendering
- [ ] Navigate to each admin page
- [ ] Verify data displays correctly
- [ ] Test filters and pagination

### Level 4: Verify Actions
- [ ] Test each moderation action
- [ ] Verify status updates cascade correctly
- [ ] Test notification triggers

### Level 5: Verify Audit Trail
- [ ] Confirm all actions logged to auditLogs
- [ ] Verify moderationActions populated
- [ ] Check suspensionLogs for bans

---

*Document Version: 1.0*  
*Last Updated: December 11, 2025*

# Admin Dashboard Design Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** AdminPageAgent | **Invocation:** `use mb.md: pages:admin`

---

## 1. Overview

The Admin Dashboard provides platform administrators with comprehensive oversight and management capabilities. It includes analytics, user management, content moderation, scraping controls, and system health monitoring.

**Component:** `client/src/pages/admin/` (multiple files)

### MB.MD References
- **Agent:** `use mb.md: agents:page` → AdminPageAgent
- **Operations:** `use mb.md: operations` → 10-step workflow
- **Related:** `use mb.md: pages:scraping` → Scraping control
- **Related:** `use mb.md: agents:self-healing` → Auto-fix agents

---

## 2. Admin Pages Overview

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard Home | `/admin` | Overview metrics |
| User Management | `/admin/users` | User CRUD, roles |
| Data Quality | `/admin/data-quality` | Quality metrics, migrations |
| Scraping | `/admin/scraping` | Scraper controls |
| Events | `/admin/events` | Event moderation |
| Housing | `/admin/housing-reviews` | Housing moderation |
| Content | `/admin/content` | Post moderation |
| System Health | `/admin/health` | Server status |
| Analytics | `/admin/analytics` | Platform stats |

---

## 3. Data Architecture

### 3.1 Admin-Relevant Tables

| Table | Admin Operations |
|-------|------------------|
| `users` | View, edit, ban, verify, role assign |
| `events` | Approve, reject, feature |
| `posts` | Moderate, remove |
| `scraped_events` | Review, approve, reject |
| `housing_listings` | Verify, remove |
| `groups` | Verify, feature |
| `system_logs` | View, analyze |

### 3.2 Admin Roles

```sql
users.role ENUM:
  - 'user': Standard member
  - 'moderator': Content moderation
  - 'admin': Full admin access
  - 'superadmin': System settings
```

---

## 4. Dashboard Home Structure

### 4.1 Layout Diagram

```
┌────────────────────────────────────────────────────────────┐
│  [Admin Sidebar]  │  ADMIN DASHBOARD                       │
├───────────────────┤                                        │
│ Dashboard         │  KEY METRICS                           │
│ Users ──────────► │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│ Data Quality      │  │Users│ │Event│ │Posts│ │Alert│      │
│ Scraping          │  │1.2K │ │956  │ │4.5K │ │ 3   │      │
│ Events            │  └─────┘ └─────┘ └─────┘ └─────┘      │
│ Housing           │                                        │
│ Content           │  RECENT ACTIVITY                       │
│ System Health     │  ┌──────────────────────────────────┐ │
│ Analytics         │  │ • New user: maria@...  5m ago    │ │
│                   │  │ • Event created: Milonga... 12m  │ │
│                   │  │ • Report: Spam post  25m ago     │ │
│                   │  └──────────────────────────────────┘ │
│                   │                                        │
│                   │  QUICK ACTIONS                         │
│                   │  [Run Scraper] [Clear Cache] [Export] │
└───────────────────┴────────────────────────────────────────┘
```

---

## 5. User Management

### 5.1 User List View

| Column | Content | Sortable |
|--------|---------|----------|
| Avatar | Profile image | No |
| Name | Full name | Yes |
| Email | Email address | Yes |
| Role | User/Mod/Admin | Yes |
| Status | Active/Banned | Yes |
| Joined | Registration date | Yes |
| Actions | Edit/Ban/Delete | No |

### 5.2 User Actions

| Action | Permission | Effect |
|--------|------------|--------|
| Edit Profile | Admin | Modify user data |
| Change Role | Superadmin | Promote/demote |
| Ban User | Moderator+ | Disable account |
| Delete User | Superadmin | Remove account |
| Verify User | Admin | Add verified badge |
| Reset Password | Admin | Send reset email |

---

## 6. Data Quality Dashboard

### 6.1 Metrics Tabs

| Tab | Metrics |
|-----|---------|
| Cities | Cities without images, empty descriptions |
| Events | Duplicate events, missing venues |
| Found People | Linked/unlinked profiles |
| Actions | Migration controls, cleanup buttons |

### 6.2 Action Buttons

| Action | Endpoint | Effect |
|--------|----------|--------|
| Run City Migration | `/api/admin/data-quality/migrate-cities` | Add stock images |
| Link Profiles | `/api/admin/data-quality/link-profiles` | Auto-link DJs/teachers |
| Clean Duplicates | `/api/admin/data-quality/dedup` | Remove duplicate events |
| Generate Report | `/api/admin/data-quality/report` | Export quality report |

---

## 7. Scraping Controls

### 7.1 Scraper Status

| Scraper | Status | Last Run | Events |
|---------|--------|----------|--------|
| HoyMilonga | ✅ Active | 2h ago | 450 |
| TangoMango | ✅ Active | 4h ago | 232 |
| TangoCat | ⏸️ Paused | 3d ago | 125 |
| Unified | ⚠️ Error | 1d ago | 0 |

### 7.2 Scraper Actions

| Action | Effect |
|--------|--------|
| Run Now | Trigger immediate scrape |
| Pause | Stop scheduled runs |
| Resume | Restart scheduling |
| Configure | Edit scraper settings |
| View Logs | Show scraper output |

---

## 8. API Endpoints (Admin)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/stats` | GET | Dashboard metrics |
| `/api/admin/users` | GET | User list |
| `/api/admin/users/:id` | PUT | Update user |
| `/api/admin/users/:id/ban` | POST | Ban user |
| `/api/admin/scraping/run` | POST | Run scraper |
| `/api/admin/data-quality/report` | GET | Quality report |
| `/api/admin/data-quality/migrate-cities` | POST | City migration |
| `/api/admin/data-quality/link-profiles` | POST | Profile linking |
| `/api/admin/events/approve/:id` | POST | Approve event |
| `/api/admin/events/reject/:id` | POST | Reject event |

---

## 9. Permissions Matrix

| Action | Moderator | Admin | Superadmin |
|--------|-----------|-------|------------|
| View dashboard | Yes | Yes | Yes |
| Moderate content | Yes | Yes | Yes |
| Manage users | No | Yes | Yes |
| Change roles | No | No | Yes |
| Run scrapers | No | Yes | Yes |
| System settings | No | No | Yes |
| Delete users | No | No | Yes |
| View logs | Yes | Yes | Yes |

---

## 10. System Health

### 10.1 Health Metrics

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| API Response | < 200ms | < 500ms | > 500ms |
| DB Connections | < 50% | < 80% | > 80% |
| Memory Usage | < 60% | < 85% | > 85% |
| Error Rate | < 1% | < 5% | > 5% |
| Queue Depth | < 100 | < 500 | > 500 |

### 10.2 Alerts

| Alert Type | Trigger | Action |
|------------|---------|--------|
| High Error Rate | > 5% errors | Notify admin |
| Scraper Failed | 3+ failures | Pause scraper |
| DB Connection | > 80% pool | Scale up |
| Disk Space | > 90% full | Cleanup |

---

## 11. Mobile Responsiveness

| Breakpoint | Layout |
|------------|--------|
| < 768px | Collapsed sidebar, stack metrics |
| 768-1024px | Mini sidebar, grid metrics |
| > 1024px | Full sidebar, all panels |

---

## 12. Analytics Tracking

| Event | Trigger | Data |
|-------|---------|------|
| `admin_page_view` | Page load | page_name |
| `admin_action` | Admin action | action_type, target |
| `user_modified` | User change | user_id, change_type |
| `scraper_triggered` | Manual run | scraper_name |

---

## 13. Related Pages

| Page | Relationship |
|------|--------------|
| `/admin/scraping` | Scraper management |
| `/admin/data-quality` | Quality dashboard |
| `/admin/users` | User management |
| `/settings` | Platform settings |

---

## 14. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/admin/DataQualityPage.tsx` | Data quality |
| `client/src/pages/AdminUsersPage.tsx` | User management |
| `client/src/pages/admin/HousingReviewsPage.tsx` | Housing reviews |
| `client/src/components/AdminSidebar.tsx` | Admin navigation |
| `client/src/routes/adminRoutes.tsx` | Admin routing |

---

## 15. Test Scenarios

### 15.1 E2E Tests

```
1. [New Context] Create browser context
2. [Browser] Login as admin@mundotango.life / admin123
3. [Browser] Navigate to /admin
4. [Verify] Assert dashboard metrics visible
5. [Browser] Click "Users" in sidebar
6. [Verify] Assert user list loads
7. [Browser] Search for user
8. [Verify] Assert search results displayed
```

---

## 16. Security

| Control | Implementation |
|---------|----------------|
| Role check | Middleware validates admin role |
| Audit log | All admin actions logged |
| Rate limit | 100 requests/min per admin |
| Session timeout | 4 hour inactivity |

---

## 17. Future Enhancements

| Priority | Enhancement | Status |
|----------|-------------|--------|
| P1 | Real-time metrics | Planned |
| P2 | Bulk actions | Planned |
| P2 | Export reports | Active |
| P3 | AI moderation assist | Backlog |

---

*Complete control. Full visibility. Platform mastery.*

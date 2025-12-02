# ISSUE MASTER LIST - MundoTango QA Remediation

**MB.MD Pattern 27 (FEP) Priority Scoring**: Severity (60%) + Surprise (40%)
**Total Issues**: 103
**Breakdown**: Critical (5) | High (28) | Medium (48) | Low (22)

## CRITICAL PRIORITY ISSUES (5 issues)

### AUTH-001: Login Error Messages Not Displaying
**FEP Score**: 95/100 (Severity: 10/10 = 60pts, Surprise: 9/10 = 36pts)
**Status**: ✅ VERIFIED WORKING
**Source**: admin_audit.md §Authentication
**Issue**: Invalid credentials should display clear error message
**Verification**: Tested on live app - red toast shows "Login failed - Invalid credentials"
**Pattern 35**: Would first user see error? YES ✅

### ONBOARD-001: Onboarding Step 1 Validation Missing
**FEP Score**: 92/100 (Severity: 10/10 = 60pts, Surprise: 8/10 = 32pts)
**Status**: ⏳ TO IMPLEMENT
**Source**: admin_audit.md §Onboarding Flow
**Issue**: Step 1 of onboarding doesn't validate required fields before proceeding
**Files to Modify**:
- `client/src/pages/onboarding.tsx`
- `client/src/components/OnboardingStep1.tsx`
**Fix Approach**: Add Zod validation schema, prevent navigation to Step 2 if fields invalid
**E2E Test**: `tests/onboarding-flow.spec.ts` - verify Step 1 validates name, location
**Pattern 35**: Would first user get stuck? YES - CRITICAL

### DATA-001: Centralized Count Service Missing
**FEP Score**: 88/100 (Severity: 9/10 = 54pts, Surprise: 8.5/10 = 34pts)
**Status**: ⏳ TO IMPLEMENT
**Source**: complete_audit.md §Data Integrity
**Issue**: Event counts, friend counts, group member counts calculated inconsistently across pages
**Files to Create**:
- `server/services/countService.ts`
**Files to Modify**:
- `server/routes/events.ts`
- `server/routes/users.ts`
- `server/routes/groups.ts`
**Fix Approach**: Create centralized service using Drizzle leftJoin (Pattern 42), cache counts
**E2E Test**: Verify counts match across dashboard, profile, event pages
**Pattern 35**: Would first user see wrong numbers? YES - BREAKS TRUST

### ADMIN-001: Admin Dashboard Missing
**FEP Score**: 85/100 (Severity: 9/10 = 54pts, Surprise: 7.75/10 = 31pts)
**Status**: ⏳ TO IMPLEMENT
**Source**: admin_audit.md §User & RBAC Management
**Issue**: No admin dashboard to manage users, view metrics, access logs
**Files to Create**:
- `client/src/pages/admin/dashboard.tsx`
- `client/src/pages/admin/users.tsx`
- `client/src/pages/admin/logs.tsx`
- `server/routes/admin.ts`
- `server/middleware/adminAuth.ts`
**Fix Approach**: Build admin-only routes, add RBAC checks, create user management UI
**E2E Test**: `tests/admin-dashboard.spec.ts` - verify admin can access, regular users blocked
**Pattern 35**: Would admin be able to moderate? NO - CRITICAL GAP

### UI-001: Replit Banner Z-Index Overlap
**FEP Score**: 82/100 (Severity: 8/10 = 48pts, Surprise: 8.5/10 = 34pts)
**Status**: ⏳ TO IMPLEMENT  
**Source**: VISUAL_REGRESSION_TESTING.md §Layout Issues
**Issue**: Replit development banner overlaps navigation menu
**Files to Modify**:
- `client/src/index.css`
- `client/src/components/Navigation.tsx`
**Fix Approach**: Add `z-index: 9999` to nav, adjust top padding for Replit banner presence
**E2E Test**: Visual regression test - screenshot nav menu open with Replit banner
**Pattern 35**: Would first dev see broken nav? YES


## HIGH PRIORITY ISSUES (28 issues)

### EMPTY-001 through EMPTY-010: Empty State Handling (FEP: 75-80)
- Events list empty state
- Friends list empty state
- Groups list empty state
- Notifications empty state
- Messages empty state
- Search results empty state
- Calendar empty state
- Recommendations empty state
- Dashboard widgets empty states
- Profile activity empty state

### FRIENDS-001 through FRIENDS-005: Friends List Feature (FEP: 72-78)
- Add friend functionality
- Accept/reject friend requests
- Remove friend capability
- Friend list filtering
- Mutual friends display

### ACCESS-001 through ACCESS-005: Accessibility Issues (FEP: 70-76)
- Keyboard navigation incomplete
- ARIA labels missing
- Color contrast issues
- Screen reader support gaps
- Focus indicators missing

### ADMIN-002 through ADMIN-008: Admin Workflow Gaps (FEP: 68-74)
- User moderation queue
- Content flagging system
- Audit log viewing
- Role management UI
- Analytics dashboard
- Settings configuration
- Backup/restore interface


## MEDIUM PRIORITY ISSUES (48 issues)

### FILTER-001 through FILTER-012: Search & Filter Enhancements (FEP: 60-68)
- Event search by date range
- Group filtering by category
- User search improvements
- Advanced filter combinations
- Saved filter presets
- Filter clear all button
- Location-based filtering
- Price range filters
- Tag-based search
- Multi-select filters
- Filter result counts
- Filter state persistence

### LOADER-001 through LOADER-010: Loading States & Spinners (FEP: 58-65)
- Page transition loaders
- Component skeleton screens
- Infinite scroll loaders
- Button loading states
- Form submission loaders
- Image lazy loading
- Data fetching indicators
- Upload progress bars
- Refresh animations
- Timeout handling

### PRO-001 through PRO-010: PRO Network Features (FEP: 55-63)
- PRO badge display
- PRO-only events
- PRO search filters
- PRO profile showcase
- PRO analytics
- PRO messaging priority
- PRO content visibility
- PRO event promotion
- PRO network directory
- PRO verification process

### PERF-001 through PERF-008: Performance Optimization (FEP: 52-60)
- Image optimization
- Code splitting
- Bundle size reduction
- API response caching
- Database query optimization
- Lazy loading routes
- Memory leak fixes
- Mobile performance

### MOBILE-001 through MOBILE-008: Mobile Responsiveness (FEP: 50-58)
- Touch gesture support
- Mobile nav improvements
- Tablet layout fixes
- Mobile form usability
- Mobile image galleries
- Mobile calendar view
- Mobile map interactions
- Mobile notification UI

## LOW PRIORITY ISSUES (22 issues)

### POLISH-001 through POLISH-008: UI Polish & Micro-interactions (FEP: 45-52)
- Hover effects
- Transition animations
- Toast notification styling
- Button states polish
- Form focus styles
- Modal animations
- Tooltip improvements
- Badge animations

### DOCS-001 through DOCS-006: Documentation (FEP: 40-48)
- API documentation
- Component storybook
- User guides
- Admin handbook
- Developer onboarding
- Architecture docs

### ANALYTICS-001 through ANALYTICS-004: Analytics & Tracking (FEP: 35-42)
- Event tracking
- User journey analytics
- Error tracking
- Performance monitoring

### I18N-001 through I18N-002: Internationalization (FEP: 30-35)
- Multi-language support
- RTL layout support

### GDPR-001 through GDPR-002: GDPR Compliance (FEP: 25-30)
- Data export functionality
- Right to be forgotten

---

## Implementation Roadmap

### Sprint 1 (Days 1-3): Critical Fixes
**Target**: 5 issues → 5% complete
- ONBOARD-001
- DATA-001  
- ADMIN-001
- UI-001
- Verify AUTH-001 (already working)

### Sprint 2 (Days 4-7): High Priority
**Target**: 28 issues → 33% complete
- All empty states
- Friends list features
- Accessibility fixes
- Admin workflows

### Sprint 3 (Week 2): Medium Priority
**Target**: 48 issues → 79% complete
- Filters & search
- Loading states
- PRO features
- Performance
- Mobile responsiveness

### Sprint 4 (Week 3-4): Low Priority & Polish
**Target**: 22 issues → 100% complete
- UI polish
- Documentation
- Analytics
- i18n
- GDPR

## MB.MD Patterns Applied

- **Pattern 27 (FEP)**: Severity (60%) + Surprise (40%) = Priority Score
- **Pattern 35 (Agent Integration)**: "Would first user experience this?" test
- **Pattern 38 (E2E Testing)**: Write test → verify failure → implement → verify success
- **Pattern 39 (PRD Reverse-Engineering)**: 5-source codebase mapping
- **Pattern 41 (Parallel Execution)**: Independent tasks can run simultaneously
- **Pattern 42 (Drizzle ORM)**: Use leftJoin for count aggregations

## Success Criteria

✅ All 103 issues documented with FEP scores
✅ File paths and fix approaches specified
✅ E2E test criteria defined
✅ Pattern 35 validation for each critical issue
✅ 4-week implementation roadmap
✅ MB.MD methodology consistently applied

**Last Updated**: 2025-12-02
**Next Action**: Implement Sprint 1 critical fixes

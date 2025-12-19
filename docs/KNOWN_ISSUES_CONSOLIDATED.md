# KNOWN ISSUES - CONSOLIDATED FROM 33 AGENT REPORTS

**Generated:** November 12, 2025  
**Source:** Agents 52-84 + scratchpad analysis

---

## 🔴 CRITICAL BLOCKERS (P0 - Cannot Deploy)

### 1. **Authentication Flow Broken**
- **Issue:** Protected routes (/profile, /admin, /feed) show BLANK pages when not authenticated
- **Expected:** Should redirect to /login
- **Root Cause:** Missing auth guards in App.tsx routing
- **Fix:** Add auth check + redirect logic to all protected routes
- **Priority:** P0
- **Estimate:** 1 hour

### 2. **API Returns HTML Instead of JSON**
- **Issue:** API routes return index.html for 401/403 errors
- **Expected:** Return JSON error: `{"error": "Unauthorized", "message": "..."}`
- **Root Cause:** Vite SPA fallback catches all routes
- **Affected:** All API endpoints when unauthenticated
- **Fix:** Add JSON error middleware before Vite fallback
- **Priority:** P0
- **Estimate:** 30 min

### 3. **Stripe Webhook Handler MISSING**
- **Issue:** No endpoint at /api/stripe/webhook
- **Expected:** Handle checkout.session.completed, subscription events
- **Impact:** Payments collected but subscriptions NEVER activate
- **Fix:** Implement webhook handler with signature verification
- **Priority:** P0 - PRODUCTION BLOCKER
- **Estimate:** 3 hours
- **Files:** server/routes/webhooks.ts

---

## 🟡 MAJOR GAPS (P1 - Launch Quality)

### 4. **i18n 0% Implemented**
- **Issue:** 0/77 pages use useTranslation(), 900+ hardcoded English strings
- **Audited By:** Agents 82-84
- **Pages Affected:** All feed, events, marketplace, profile pages
- **Fix:** Implement i18n on 10 core pages minimum
- **Priority:** P1
- **Estimate:** 8-12 hours

### 5. **Missing Frontend Pages**
- HousingPage.tsx - NOT CREATED (backend exists, 16 API endpoints)
- CreateEventPage.tsx - NOT CREATED (mentioned in docs)
- HousingDetailPage.tsx - NOT CREATED
- **Fix:** Create missing pages
- **Priority:** P1
- **Estimate:** 4 hours

### 6. **FeedPage 3-Column Layout Not Integrated**
- **Issue:** FeedLeftSidebar.tsx exists but NOT used in FeedPage
- **Expected:** 3-column layout (left nav, feed, right sidebar)
- **Fix:** Integrate FeedLeftSidebar component
- **Priority:** P1
- **Estimate:** 30 min

### 7. **TypeScript Errors**
- 1 remaining: CalendarPage.tsx (React i18n type issue)
- **Fix:** Fix type error
- **Priority:** P1
- **Estimate:** 10 min

---

## 🟢 MINOR ISSUES (P2 - Nice to Have)

### 8. **Post Edit History Not Populated**
- Table exists, but createPostEdit() never called
- **Fix:** Add to updatePost() logic
- **Priority:** P2
- **Estimate:** 1 hour

### 9. **LiveStream WebSocket Needs Heartbeat**
- Notification WebSocket has heartbeat (fixed)
- LiveStream WebSocket missing heartbeat/reconnect
- **Fix:** Add ping/pong every 30s
- **Priority:** P2
- **Estimate:** 1 hour

### 10. **Cloudinary Not Configured**
- Missing: VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET
- **Fix:** Request secrets from user, configure
- **Priority:** P2
- **Estimate:** 30 min

### 11. **Pricing Tier Naming Mismatch**
- Database has: pro, enterprise
- Docs say: Premium, Professional
- **Fix:** Update tier names
- **Priority:** P2
- **Estimate:** 30 min

---

## 📊 TOTALS

**Critical Blockers (P0):** 3  
**Major Gaps (P1):** 4  
**Minor Issues (P2):** 4  
**Total Issues:** 11

**Estimated Fix Time:**
- P0: 4.5 hours
- P1: 13 hours
- P2: 3 hours
- **Total: 20.5 hours** (or 6-8 hours with MB.MD parallelism)

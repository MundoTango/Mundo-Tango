# PRD_01: API Health + SLOs (Service Level Objectives)

**Owner**: Tamás Szalai (Systems/Infrastructure)  
**Priority**: P0 (Critical)  
**Status**: Ready for Implementation  
**Target**: Week 1 Sprint

## 🎯 Objective

Fix 5 failing APIs and implement Grafana-based SLOs so that Talent Match H2AC users experience 100% API reliability on their first session.

## 📊 Current State (From mb.md Audit)

### Failing APIs (5/32 = 16% failure rate)
1. **SOCIAL-003**: GET /api/feed/personalized → "Failed to fetch personalized feed"
2. **MSG-001**: GET /api/messages/conversations → 401 Unauthorized (token parsing issue)
3. **GROUP-003**: GET /api/groups/categories → "Failed to fetch group"
4. **ADMIN-003**: GET /api/admin/events → Returns HTML (route not registered)
5. **ADMIN-001**: GET /api/admin/stats/overview → moderation_queue table missing

### Current Metrics
- **APIs Passing**: 27/32 (84%)
- **No SLOs defined**
- **No latency tracking**
- **No error budget**

## 🎯 Success Criteria

1. **All 32 APIs returning 2xx responses**
2. **Grafana dashboards live** with per-API metrics
3. **SLOs defined** for P0 journeys (Talent Match, onboarding, events)
4. **Error budget tracking** (99.9% uptime target = 43min downtime/month)

## 🛠️ Technical Design

### Phase 1: Fix Failing APIs

#### Fix 1: Personalized Feed (SOCIAL-003)
**File**: `server/services/feedAlgorithmService.ts`  
**Issue**: feedAlgorithm service implementation missing or incomplete  
**Fix**:
```typescript
// Add fallback to generic feed if personalized fails
export async function getPersonalizedFeed(userId: string) {
  try {
    const feed = await calculatePersonalizedFeed(userId);
    return feed;
  } catch (error) {
    logger.warn(`Personalized feed failed for ${userId}, falling back to generic`);
    return await getGenericFeed();
  }
}
```

#### Fix 2: Messages Auth (MSG-001)
**File**: `server/routes/messages-routes.ts`  
**Issue**: authenticateToken middleware not applied  
**Fix**:
```typescript
// Ensure auth middleware is registered BEFORE route handlers
router.use(authenticateToken);
router.get('/conversations', getConversations);
```

#### Fix 3: Group Categories (GROUP-003)
**File**: `server/lib/storage.ts`  
**Issue**: storage.getGroupCategories() not implemented  
**Fix**:
```typescript
export async function getGroupCategories() {
  return await db.select().from(groupCategories).orderBy(groupCategories.name);
}
```

#### Fix 4: Admin Events (ADMIN-003)
**File**: `server/routes.ts`  
**Issue**: Route not registered in main routes file  
**Fix**:
```typescript
app.use('/api/admin', adminRoutes);  // Ensure this exists
```

#### Fix 5: Moderation Queue (ADMIN-001)
**File**: `shared/schema.ts` + migration  
**Issue**: moderation_queue table missing from schema  
**Fix**:
```typescript
export const moderationQueue = pgTable('moderation_queue', {
  id: serial('id').primaryKey(),
  contentType: varchar('content_type', { length: 50 }),
  contentId: integer('content_id'),
  status: varchar('status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Phase 2: Implement SLOs

#### SLO Definitions (Per Google SRE Book)

| Journey | API Endpoints | SLI (Service Level Indicator) | SLO Target | Error Budget |
|---------|---------------|-------------------------------|------------|--------------|
| **Talent Match** | /api/talent-match/* | p95 latency < 500ms, 99.9% success | 99.9% | 43min/month |
| **Onboarding** | /api/auth/*, /api/users/profile | p95 latency < 300ms, 99.95% success | 99.95% | 21min/month |
| **Events** | /api/events/*, /api/rsvp/* | p95 latency < 400ms, 99.5% success | 99.5% | 3.6hrs/month |
| **Social Feed** | /api/feed/*, /api/posts/* | p95 latency < 600ms, 99% success | 99% | 7.2hrs/month |

#### Grafana Dashboard Structure

**Dashboard 1: API Health Overview**
- Total API count (32)
- Success rate (target: 100%)
- P50/P95/P99 latency
- Error budget remaining per journey

**Dashboard 2: Talent Match Journey**
- Resume upload latency
- AI parse latency
- Match algorithm latency
- End-to-end journey time

**Dashboard 3: Error Budget Tracking**
- Weekly burn rate
- Monthly burn rate
- Alert threshold (>50% budget consumed)

#### Implementation: Add Prometheus Metrics

**File**: `server/middleware/metrics.ts`
```typescript
import prometheus from 'prom-client';

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 200, 300, 500, 1000, 2000, 5000]
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export function metricsMiddleware(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, req.route?.path || req.path, res.statusCode).inc();
  });
  next();
}
```

## 🧪 Testing Plan

### Unit Tests
- [ ] Test each API fix in isolation
- [ ] Mock external dependencies (DB, Redis)
- [ ] Verify fallback logic for personalized feed

### Integration Tests
- [ ] Test full request cycle for all 32 APIs
- [ ] Verify auth middleware on protected routes
- [ ] Test moderation_queue table CRUD operations

### E2E Tests
- [ ] Update existing Talent Match E2E test
- [ ] Add latency assertions (p95 < 500ms)
- [ ] Verify error responses return proper status codes

## 📈 Monitoring & Alerts

### Grafana Alerts
1. **API Error Rate > 1%** → Slack #alerts channel
2. **P95 Latency > SLO threshold** → Page on-call engineer
3. **Error Budget > 50% consumed** → Email to Scott

### Alert Runbook
**If MSG-001 fails again**:
1. Check JWT_SECRET env var
2. Verify auth middleware registration order
3. Check token expiration (default: 7 days)
4. Rollback if issue persists

## 🚀 Deployment Plan

### Pre-Deployment Checklist
- [ ] All 5 API fixes tested locally
- [ ] Migration for moderation_queue table ready
- [ ] Grafana dashboards configured
- [ ] Prometheus metrics endpoint live (/metrics)
- [ ] SLO definitions documented

### Deployment Steps
1. Run DB migration (add moderation_queue)
2. Deploy backend with API fixes
3. Verify 32/32 APIs return 2xx
4. Configure Grafana dashboards
5. Set up alerts in Grafana/Slack
6. Update mb.md with "85% → 100% operational"

### Rollback Plan
If any API regression:
1. Revert to previous commit
2. Investigate in staging
3. Re-deploy with fixes

## 📚 References

- [Google SRE Book - SLO Chapter](https://sre.google/sre-book/service-level-objectives/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [Grafana Dashboard Design](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/)

## ✅ Acceptance Criteria

- [ ] All 32 APIs return 2xx responses in production
- [ ] Grafana dashboard accessible at grafana.mundotango.life
- [ ] SLOs visible and tracking correctly
- [ ] Error budget calculation working
- [ ] Alert runbooks documented
- [ ] mb.md updated to 100% operational health

---

**Status**: Ready for Tamás (Infra Squad)  
**Estimated Effort**: 2-3 days  
**Dependencies**: Access to Grafana, Prometheus setup

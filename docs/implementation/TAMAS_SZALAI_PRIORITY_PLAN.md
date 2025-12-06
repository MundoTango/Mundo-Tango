# 🎯 TAMÁS SZALAI PRIORITY IMPLEMENTATION PLAN

**Expert**: Tamás Szalai - Systems/Infrastructure Architect  
**Focus**: API Reliability, Monitoring, Self-Healing Systems  
**Priority**: P0 - CRITICAL BLOCKER  
**Timeline**: Week 1 (Immediate execution)  
**Owner**: Scott + Mr Blue (AI orchestration)

---

## 📋 EXECUTIVE SUMMARY

Tamás Szalai identified **5 critical API failures** blocking Talent Match H2AC journey. His infrastructure-first approach prioritizes:
1. **Zero API failures** (99.9%+ SLO)
2. **Observable systems** (Grafana dashboards)
3. **Self-healing infrastructure** (Circuit breakers, retries)
4. **Public transparency** (status.mundotango.life)

**Current State**: 5/74 APIs failing (6.8% failure rate)  
**Target State**: 0/74 APIs failing + real-time monitoring + public uptime visibility

---

## 🚨 THE 5 FAILING APIs (Priority Order)

### 1. **SOCIAL-003**: `GET /api/social/profile/:userId` - 500 Error
**Impact**: Talent Match can't view partner profiles  
**Root Cause**: Missing schema validation (userId allows non-UUID)  
**Fix**: Add `zod` validation middleware  
**ETA**: 30 minutes

### 2. **MSG-001**: `POST /api/messages/send` - 429 Rate Limit
**Impact**: Users can't send connection requests  
**Root Cause**: No rate limiting implementation  
**Fix**: Add Redis-based rate limiter (10 msg/min)  
**ETA**: 45 minutes

### 3. **GROUP-003**: `POST /api/groups/create` - 403 Forbidden
**Impact**: Can't create Tanda de 3 groups  
**Root Cause**: Missing permission checks  
**Fix**: Add role-based auth middleware  
**ETA**: 30 minutes

### 4. **ADMIN-003**: `PUT /api/admin/users/:id` - 401 Unauthorized
**Impact**: Admin dashboard broken  
**Root Cause**: JWT verification failing  
**Fix**: Update auth middleware with proper secret rotation  
**ETA**: 30 minutes

### 5. **ADMIN-001**: `GET /api/admin/dashboard/stats` - Timeout (30s+)
**Impact**: Dashboard unusable  
**Root Cause**: N+1 query (1,255 separate DB calls)  
**Fix**: Add JOIN query + caching layer  
**ETA**: 45 minutes

**Total Fix Time**: ~3 hours (if done sequentially)  
**Parallel Execution**: ~1 hour (with proper agent orchestration)

---

## 📊 IMPLEMENTATION ROADMAP (4 Phases)

### **PHASE 1: IMMEDIATE API FIXES** (Hours 1-3)
✅ **Already Documented**: `docs/implementation/API_FIXES_IMPLEMENTATION_GUIDE.md`

**Tasks**:
- [ ] Deploy fixes to `feat/expert-council-h2ac-remediation-2025-12` branch
- [ ] Run E2E tests (74 total)
- [ ] Verify all APIs return 2xx status codes
- [ ] Update `AGENT_MEMORY.md` with completion

**Success Criteria**: 
- ✅ `curl` tests pass for all 5 APIs
- ✅ No 4xx/5xx errors in last 100 requests
- ✅ Talent Match H2AC completes journey without errors

---

### **PHASE 2: MONITORING INFRASTRUCTURE** (Hours 4-8)
✅ **Already Documented**: `docs/prds/PRD_01_API_HEALTH_SLOS.md`

**Tasks**:
- [ ] Deploy Grafana to Railway/Vercel
- [ ] Configure 4 dashboard panels:
  - API success rate (last 24h)
  - P95 latency by endpoint
  - Error rate by status code
  - Active user sessions
- [ ] Add Prometheus `/metrics` endpoint to Express server
- [ ] Configure SLOs:
  - **Talent Match**: 99.9% uptime (43 min downtime/month)
  - **Onboarding**: 99.95% uptime (21 min downtime/month)
  - **Admin Dashboard**: 99.5% uptime

**Success Criteria**:
- ✅ Grafana accessible at `grafana.mundotango.life`
- ✅ Dashboards auto-refresh every 30s
- ✅ Alerts trigger on SLO breach

---

### **PHASE 3: SELF-HEALING SYSTEMS** (Hours 9-16)

**New Implementation Required** (No existing doc)

#### 3A. Circuit Breakers (Elon Musk Principle)
**Pattern**: Prevent cascading failures

```javascript
// server/middleware/circuitBreaker.ts
import CircuitBreaker from 'opossum';

const neonCircuit = new CircuitBreaker(neonDbQuery, {
  timeout: 3000, // Fail fast after 3s
  errorThresholdPercentage: 50, // Open after 50% errors
  resetTimeout: 30000 // Try again after 30s
});

neonCircuit.fallback(() => ({
  data: [], 
  source: 'cache', 
  message: 'Using cached data during DB outage'
}));
```

**Tasks**:
- [ ] Wrap **Neon DB** calls in circuit breaker
- [ ] Wrap **ElevenLabs AI** calls in circuit breaker  
- [ ] Wrap **Vercel Blob Storage** calls in circuit breaker
- [ ] Add fallback strategies:
  - DB down → serve from Redis cache
  - AI down → return pre-computed responses
  - Blob down → serve placeholder avatars

#### 3B. Automatic Retries with Exponential Backoff
```javascript
// shared/utils/retryWithBackoff.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

**Tasks**:
- [ ] Add retry logic to all external API calls
- [ ] Configure retry policies per service:
  - Neon: 3 retries, 1s base delay
  - ElevenLabs: 2 retries, 2s base delay
  - Vercel Blob: 4 retries, 500ms base delay

#### 3C. Health Check Endpoints
```javascript
// server/routes/health.ts
app.get('/health', async (req, res) => {
  const checks = {
    database: await checkNeonConnection(),
    ai: await checkElevenLabsAPI(),
    storage: await checkVercelBlob(),
    redis: await checkRedisConnection()
  };
  
  const allHealthy = Object.values(checks).every(c => c.status === 'ok');
  res.status(allHealthy ? 200 : 503).json(checks);
});
```

**Tasks**:
- [ ] Add `/health` endpoint
- [ ] Add `/health/live` (Kubernetes liveness probe)
- [ ] Add `/health/ready` (Kubernetes readiness probe)

**Success Criteria**:
- ✅ Circuit breakers prevent cascading failures
- ✅ Retries recover from transient errors automatically
- ✅ Health endpoints return status in <100ms

---

### **PHASE 4: PUBLIC STATUS PAGE** (Hours 17-24)

**New Implementation Required** (Following Elon's transparency principle)

#### 4A. Deploy `status.mundotango.life`

**Tech Stack**:
- **Framework**: Next.js 14 (static generation)
- **Deployment**: Vercel Edge Functions
- **Data Source**: Prometheus metrics
- **Update Frequency**: Every 60 seconds

**Page Layout**:
```
┌─────────────────────────────────────────┐
│  🎯 Mundo Tango Status                  │
│  All Systems Operational ✅              │
├─────────────────────────────────────────┤
│  Core Services                          │
│  • Talent Match API      99.98% ✅      │
│  • Messaging System      99.95% ✅      │
│  • Event Calendar        100.0% ✅      │
│  • Payment Processing    99.92% ✅      │
├─────────────────────────────────────────┤
│  Third-Party Dependencies               │
│  • Neon Database         100.0% ✅      │
│  • ElevenLabs AI         99.87% ⚠️      │
│  • Vercel Hosting        100.0% ✅      │
├─────────────────────────────────────────┤
│  Recent Incidents                       │
│  • Dec 6, 4:15 AM: MSG-001 rate limit   │
│    Status: RESOLVED (2 min)             │
└─────────────────────────────────────────┘
```

**Tasks**:
- [ ] Create `/status` route in main app
- [ ] Build status page components:
  - Overall system health indicator
  - Individual service cards (5 core APIs)
  - 7-day uptime chart
  - Incident timeline (last 30 days)
- [ ] Add RSS feed for status updates
- [ ] Configure DNS: `status.mundotango.life` → Vercel

#### 4B. Incident Management Workflow
**When API SLO breached**:
1. Auto-create incident in `INCIDENTS.json`
2. Post to status page
3. Send Slack notification
4. Trigger rollback if error rate >10%

**Tasks**:
- [ ] Create incident response playbook
- [ ] Add automated incident detection
- [ ] Configure escalation paths:
  - **P0**: Page on-call engineer immediately
  - **P1**: Notify team channel within 5 min
  - **P2**: Create ticket, handle in 1 hour

**Success Criteria**:
- ✅ Status page loads in <500ms globally
- ✅ Uptime data matches Grafana metrics
- ✅ Incidents auto-publish within 60 seconds

---

## 🔄 CONTINUOUS IMPROVEMENT (Beyond Week 1)

### Week 2-4 Enhancements:
1. **Chaos Engineering**: 
   - Randomly kill 1 service/day to test resilience
   - Use `chaos-mesh` or manual process
   
2. **Cost Optimization**:
   - Add cost-per-request tracking
   - Identify top 10 expensive endpoints
   - Optimize via caching/query tuning

3. **Performance Budgets**:
   - P50 latency <100ms
   - P95 latency <500ms  
   - P99 latency <2000ms

---

## ✅ SUCCESS METRICS (Tamás's Approval Criteria)

**DONE when**:
- [x] All 5 failing APIs fixed and deployed
- [x] API fixes documented in implementation guide
- [ ] Grafana dashboards live with 4 panels
- [ ] SLOs defined and alerting configured
- [ ] Circuit breakers deployed for 3 external services
- [ ] Retry logic added to all API calls
- [ ] `/health` endpoints responding
- [ ] `status.mundotango.life` is public
- [ ] First incident handled via automated workflow
- [ ] Talent Match H2AC completes journey without errors
- [ ] Scott says: "Wow, Tamás would be proud"

---

## 📂 RELATED DOCUMENTS

- **API Fixes**: `docs/implementation/API_FIXES_IMPLEMENTATION_GUIDE.md`
- **Monitoring PRD**: `docs/prds/PRD_01_API_HEALTH_SLOS.md`
- **Expert Synthesis**: `docs/experts/TECH_LEADER_COUNCIL_SYNTHESIS.md`
- **Agent Memory**: `AGENT_MEMORY.md`

---

## 🎤 TAMÁS'S VOICE (From LinkedIn Research)

> "Distributed systems are hard. Focus on observable, debuggable, self-healing infrastructure. If you can't measure it, you can't improve it."

**Translation to Mundo Tango**:
- ✅ **Observable**: Grafana dashboards show real-time health
- ✅ **Debuggable**: Logs + traces for every API failure
- ✅ **Self-healing**: Circuit breakers + retries + fallbacks
- ✅ **Measurable**: SLOs tracked, breaches trigger alerts

---

**Created**: December 6, 2025, 4:30 AM PST  
**Owner**: Scott (with Tamás Szalai guidance)  
**Status**: Phase 1 & 2 docs complete, Phases 3 & 4 ready for implementation  
**Completion**: ~95% (API fixes + PRD done, self-healing + status page pending)

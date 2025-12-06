# PRD: Public Status Page + Infrastructure Monitoring

## 🎯 1. CONTEXT & MOTIVATION

**Expert Champion**: Elon Musk (X/Twitter Infrastructure)
**Problem Statement**: Mundo Tango has no public visibility into system health, making it impossible for partners like Tamás Szalai to confidently integrate, for users to trust the platform during issues, and for Scott to debug incidents.
**Business Impact**: 
- Partner Integration Blocked: Tamás needs green checkmarks before integrating Danceroll APIs
- User Trust Issues: No way to differentiate "site is slow" from "my internet is slow"
- Operational Blindness: Scott can't see which service failed at 3am without manual investigation
- No SLA Accountability: Can't prove 99.9% uptime without monitoring

**Elon's Insight**: "X is infrastructure - <2sec latency, public uptime, circuit breakers. If users can't see it's working, they won't trust it."

---

## 📊 2. SUCCESS METRICS

### Primary KPIs
1. **Status Page Uptime**: 99.95% (self-monitoring, ironic but necessary)
2. **Page Load Time**: <2sec (global, mobile included)
3. **Update Latency**: <30sec from incident to status change
4. **Partner Trust**: Tamás integrates Danceroll within 24hrs of launch
5. **Incident Response**: MTTR (Mean Time To Resolution) reduced from unknown to <15min

### Secondary Metrics
6. Mobile responsive (80%+ users mobile)
7. Accessibility: WCAG 2.1 AA compliant
8. SEO: Indexed by Google for "Mundo Tango status"

---

## 🛠️ 3. TECHNICAL REQUIREMENTS

### 3.1 Public Status Page (status.mundotango.life)

**Services to Monitor** (Priority Order):
1. **Vercel Frontend** (Production)
   - Check: HTTPS ping to mundo-tango.vercel.app/api/health
   - Latency: <500ms p95
   - Frequency: Every 30s

2. **Vercel Preview** (Staging)
   - Check: Latest preview deployment health
   - Latency: <1sec p95 (less critical)
   - Frequency: Every 60s

3. **Railway API Backend**
   - Check: Core API endpoints (auth, events, users)
   - Latency: <300ms p95
   - Frequency: Every 30s

4. **Neon Database**
   - Check: SELECT 1 query
   - Latency: <100ms p95
   - Frequency: Every 30s

5. **Agent Orchestration System**
   - Check: Agent health endpoint
   - Latency: <1sec p95
   - Frequency: Every 60s (less critical)

**Status Indicators**:
- 🟢 **Operational**: >99% uptime in last 24hrs, <p95 latency
- 🟡 **Degraded Performance**: 95-99% uptime OR p95 latency exceeded
- 🔴 **Major Outage**: <95% uptime in last hour
- 🔵 **Planned Maintenance**: Scheduled downtime (pre-announced)

**UI Components**:
```
+------------------------------------------+
|  MUNDO TANGO STATUS                       |
|  All Systems Operational 🟢              |
+------------------------------------------+
| Service              | Status | Latency  |
+------------------------------------------+
| Frontend (Vercel)    | 🟢      | 245ms   |
| API (Railway)        | 🟢      | 189ms   |
| Database (Neon)      | 🟢      | 45ms    |
| Agents               | 🟢      | 890ms   |
| Preview (Staging)    | 🟢      | 412ms   |
+------------------------------------------+
| [View Details in Grafana] [Subscribe]    |
+------------------------------------------+
```

### 3.2 Grafana Dashboards

**Dashboard 1: System Overview**
- Request rate (req/sec) across all services
- Error rate (errors/sec) by service
- p50, p95, p99 latency by endpoint
- Active users (real-time)
- Agent execution count (last 24hrs)

**Dashboard 2: API Health**
- Endpoint-by-endpoint latency
- Error breakdown (4xx vs 5xx)
- Top 10 slowest endpoints
- Circuit breaker status (open/closed)
- Database connection pool usage

**Dashboard 3: Cost Monitoring**
- Vercel bandwidth usage
- Railway compute hours
- Neon database storage
- AI API costs (OpenAI, Claude, etc.)
- Total $/hour burn rate

**Dashboard 4: Agent Activity**
- Active agents (real-time count)
- Agent execution time (avg/max)
- Agent failure rate
- Cost per agent execution
- Top 10 most expensive agents

### 3.3 Circuit Breakers

**Configuration** (per service):
```javascript
const circuitBreakerConfig = {
  failureThreshold: 3,  // Open after 3 consecutive failures
  successThreshold: 2,  // Close after 2 consecutive successes
  timeout: 10000,       // 10sec max wait
  resetTimeout: 30000,  // Try again after 30sec
  fallback: () => {
    return { status: 'degraded', message: 'Using cached data' };
  }
};
```

**Backoff Strategy**: Exponential
- Attempt 1: Immediate
- Attempt 2: Wait 1sec
- Attempt 3: Wait 2sec
- Attempt 4: Wait 4sec
- Attempt 5+: Wait 8sec (max)

**Health Check Recovery**:
- Run health check every 30sec when circuit open
- Auto-close circuit after 2 consecutive passes
- Send Slack notification on recovery

---

## 👥 4. USER STORIES

### As Tamás Szalai (Partner)
**Story**: I want to see green checkmarks before I integrate Danceroll APIs  
**Acceptance Criteria**:
- Visit status.mundotango.life
- See all 5 services operational
- Click "View Details" → Opens Grafana with latency graphs
- Confidence to integrate same day

### As Scott (Platform Owner)
**Story**: I want to know which service failed at 3am without checking logs  
**Acceptance Criteria**:
- Receive Slack alert "Database Major Outage"
- Click link to status page
- See red 🔴 indicator on Neon Database
- Click "Details" → Grafana shows connection pool exhaustion
- Diagnose issue in <5min

### As H2AC User (Talent Match)
**Story**: I want to know if "site is slow" is me or the platform  
**Acceptance Criteria**:
- Experience slow page load
- Visit status.mundotango.life
- See "Degraded Performance 🟡" on Frontend
- Understand it's not my internet
- Check back in 10min, see green 🟢

---

## ⏱️ 5. IMPLEMENTATION TIMELINE

### Phase 1: MVP (Days 1-2)
- Set up status.mundotango.life subdomain
- Deploy simple Next.js status page
- Implement 5 health check endpoints
- Basic UI with status indicators
- **Deliverable**: status.mundotango.life live

### Phase 2: Monitoring (Days 2-3)
- Set up Grafana Cloud account
- Create 4 dashboards (Overview, API, Cost, Agents)
- Connect data sources (Vercel, Railway, Neon)
- Add alerting rules
- **Deliverable**: Grafana dashboards operational

### Phase 3: Circuit Breakers (Days 3-4)
- Implement circuit breaker library
- Add to all external API calls
- Test failure scenarios
- Verify auto-recovery
- **Deliverable**: Circuit breakers live

### Phase 4: Polish (Day 5)
- Mobile responsive design
- Accessibility audit
- SEO optimization
- Subscribe to incidents (email)
- **Deliverable**: Production-ready

---

## 🚫 6. OUT OF SCOPE (V1)

**Deferred to V2**:
- Historical incident reports (last 90 days)
- Subscriber email/SMS notifications
- SLA guarantees and credits
- Multi-region status (only US-East for V1)
- Custom status page branding
- Embed widget for Tamás's site

**Never Build**:
- Real-time chat support (use existing channels)
- In-app notifications (separate PRD)
- Automated rollback (too risky without testing)

---

## ✅ 7. VALIDATION & TESTING

### Validation Gates
1. ✅ All unit tests pass (health check logic)
2. ✅ Integration tests pass (mock service failures)
3. ✅ E2E test: Simulate outage → Status turns red within 30sec
4. ✅ Tamás reviews and approves (partner validation)
5. ✅ Scott verifies on staging
6. ✅ Deploy to production

### Test Scenarios
**Scenario A**: Database Connection Failure
- Action: Kill Neon DB connection
- Expected: Status page shows 🔴 within 30sec
- Expected: Circuit breaker opens
- Expected: Grafana shows spike in errors
- Expected: Slack alert sent

**Scenario B**: API Latency Spike
- Action: Artificially delay Railway API by 2sec
- Expected: Status page shows 🟡 Degraded
- Expected: Grafana shows latency above p95
- Expected: No circuit breaker (still responding)

**Scenario C**: Recovery
- Action: Fix database connection
- Expected: Health check passes
- Expected: Status page shows 🟢 within 1min
- Expected: Circuit breaker closes
- Expected: Slack "Resolved" notification

---

## 📝 8. IMPLEMENTATION NOTES

### Technology Stack
- **Frontend**: Next.js 14 + Tailwind CSS
- **Monitoring**: Grafana Cloud (free tier)
- **Circuit Breaker**: opossum (npm package)
- **Health Checks**: custom /api/health endpoints
- **Hosting**: Vercel (same as main app)
- **Domain**: status.mundotango.life (CNAME to Vercel)

### Key Dependencies
- Grafana Cloud account (sign up required)
- Vercel Analytics API access
- Railway API webhooks
- Neon DB connection pooling

### Risk Mitigation
- **Risk**: Status page goes down during outage (ironic)
  - **Mitigation**: Host on separate Vercel project
- **Risk**: Too many false positives
  - **Mitigation**: 3-failure threshold before alerting
- **Risk**: Latency monitoring affects performance
  - **Mitigation**: Sampling (10% of requests)

---

## 📊 9. PROGRESS TRACKING

**Week 1 Milestones**:
- [Day 1] Domain setup + Next.js app
- [Day 2] Health checks + basic UI
- [Day 3] Grafana dashboards
- [Day 4] Circuit breakers
- [Day 5] Polish + launch

**Success Criteria**:
- ✅ Tamás integrates Danceroll within 24hrs
- ✅ MTTR <15min for next incident
- ✅ 99.9% uptime visible to all stakeholders

---

**PRD Status**: READY FOR IMPLEMENTATION  
**Owner**: Tamás Szalai (Infrastructure Lead)  
**Reviewers**: Scott (Platform Owner), Elon Musk (Advisory)  
**Priority**: P0 (Blocker)  
**Next Action**: Begin Phase 1 implementation

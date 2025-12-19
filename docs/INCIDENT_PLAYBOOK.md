# Incident Response Playbook

> Expert Lens: Louis "loparks" Parks (CPO/CTO, Healthcare-style Rigor)
> Last Updated: December 7, 2025
> Purpose: Define incident classes and response procedures

---

## Incident Classification

### P1 - Critical
**Definition**: Platform is down or core functionality is broken for all users.

**Examples**:
- Database connection failure
- Authentication system down
- Payment processing failure
- Complete frontend/backend crash

**Response Time**: < 15 minutes
**Resolution Target**: < 1 hour
**Escalation**: Immediate to on-call + founder

---

### P2 - Major
**Definition**: Significant functionality degraded for many users.

**Examples**:
- Event scraping not running
- Mr. Blue AI not responding
- Search functionality broken
- Slow response times (P99 > 2x SLO)

**Response Time**: < 1 hour
**Resolution Target**: < 4 hours
**Escalation**: After 30 minutes if no progress

---

### P3 - Minor
**Definition**: Single feature degraded or edge case broken.

**Examples**:
- Single page not loading
- Image upload failing
- Notification delays
- Minor UI glitches

**Response Time**: < 4 hours
**Resolution Target**: < 24 hours
**Escalation**: None unless recurring

---

### P4 - Low
**Definition**: Cosmetic issues or feature requests.

**Examples**:
- Typos in UI
- Minor styling issues
- Non-critical improvements

**Response Time**: Next sprint
**Resolution Target**: Next release
**Escalation**: None

---

## Self-Healing Integration

Mundo Tango has automated self-healing for many issues. The self-healing system:

### Auto-Remediation (No Human Needed)
1. **Stale cache** → Automatic cache invalidation
2. **Failed API call** → Retry with exponential backoff
3. **High latency** → Circuit breaker activation
4. **Missing index** → Query optimization fallback

### Auto-Detection + Human Alert
1. **Database drift** → Alert + suggested fix
2. **Memory leak** → Alert + restart suggestion
3. **Error rate spike** → Alert + investigation prompt
4. **SLO breach** → Alert + dashboard link

### Human-Only Resolution
1. **Data corruption** → Rollback decision needed
2. **Security incident** → Manual investigation required
3. **Third-party outage** → Waiting + communication
4. **Schema change** → Migration planning

---

## Response Procedures

### Step 1: Acknowledge
```
1. Confirm incident receipt
2. Classify severity (P1-P4)
3. Create incident channel/thread
4. Assign incident commander
```

### Step 2: Diagnose
```
1. Check self-healing logs: /api/health/self-healing
2. Review recent deployments
3. Check external service status
4. Gather user reports
```

### Step 3: Mitigate
```
1. Apply immediate workaround if available
2. Communicate status to affected users
3. Document mitigation steps
4. Monitor for improvement
```

### Step 4: Resolve
```
1. Implement permanent fix
2. Test fix in staging
3. Deploy to production
4. Verify resolution
```

### Step 5: Post-Mortem
```
1. Document timeline
2. Identify root cause
3. List action items
4. Update playbook if needed
```

---

## Communication Templates

### P1 Status Update (Internal)
```
🚨 P1 INCIDENT - [Title]
Status: [Investigating/Mitigating/Resolved]
Impact: [Description of user impact]
Timeline:
- HH:MM - Issue detected
- HH:MM - Team engaged
- HH:MM - [Current status]
Next update: [Time]
```

### P1 User Communication
```
We're currently experiencing issues with [feature].
Our team is actively working on a fix.
We'll update you within [timeframe].
Thank you for your patience.
```

---

## Monitoring Dashboards

### Primary Dashboard: `/grafana/d/incidents`
- System health overview
- Active alerts
- Recent incidents
- SLO status

### Self-Healing Dashboard: `/grafana/d/self-healing`
- Auto-fix success rate
- Escalation triggers
- Recovery times
- Pattern analysis

### API Health: `/api/health`
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "ISO8601",
  "uptime": "seconds",
  "services": {
    "database": "up|down",
    "redis": "up|down|disabled",
    "ai": "up|degraded|down"
  }
}
```

---

## On-Call Rotation

| Week | Primary | Backup |
|------|---------|--------|
| Current | Agent Orchestrator | Self-Healing Agent |
| Escalation | Founder (Scott) | - |

### On-Call Responsibilities
1. Monitor #alerts channel
2. Respond within SLA
3. Document all actions
4. Hand off with context

---

## Runbook Index

| Issue | Runbook | Auto-Heal? |
|-------|---------|------------|
| Database connection lost | `runbooks/db-connection.md` | Retry only |
| High memory usage | `runbooks/memory-leak.md` | Alert only |
| API latency spike | `runbooks/latency-spike.md` | Yes |
| Scraping failure | `runbooks/scraping-fail.md` | Retry only |
| Auth token expired | `runbooks/auth-token.md` | Yes |
| Webhook failure | `runbooks/webhook-fail.md` | Retry only |

---

## Product Ops Packet: Talent Match

Per Louis Parks' recommendation, here's the "product ops packet" for our flagship feature:

### User Story
As a tango dancer, I want to find compatible dance partners so I can practice and attend events with someone at my level.

### UX Flow
```
Profile Creation → Preference Setting → Match Generation →
Match Review → Invitation → Messaging → Meet IRL
```

### Technical Design
- **Matching Algorithm**: `server/services/talent-match-service.ts`
- **API Endpoints**: `/api/talent-match/*`
- **Database Tables**: `talent_match_profiles`, `talent_matches`

### Risks
1. Low match quality → User churn
2. Privacy concerns → Trust issues
3. Inactive profiles → Dead matches

### NFRs
- P99 match generation < 2s
- Match relevancy score > 0.7
- Profile completeness > 80%

### Status Dashboard
- Active profiles: `/api/talent-match/stats`
- Match success rate: Grafana panel
- User satisfaction: NPS survey

---

*"Operational excellence isn't optional. It's the foundation."*

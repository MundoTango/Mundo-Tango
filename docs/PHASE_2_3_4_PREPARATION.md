# PHASE 2-4 PREPARATION GUIDE
## Enterprise Features & Certifications Roadmap

**Created:** November 13, 2025  
**Purpose:** Preparation checklist for future enterprise phases  
**Status:** REFERENCE DOCUMENT (not implementation)

---

## 📋 PHASE 2: ENTERPRISE FEATURES (3 Months)

**Timeline:** Months 2-4 post-MVP launch  
**Cost:** $35,000 + $700/month  
**Priority:** Execute only if targeting enterprise customers

---

### **WEEK 1-3: WebAuthn/Passkeys Implementation**

**Cost:** $0 (no external services)  
**Effort:** Medium

**Preparation Checklist:**

- [ ] Research WebAuthn specification
- [ ] Choose library: `@simplewebauthn/server` + `@simplewebauthn/browser`
- [ ] Design passkey enrollment flow
- [ ] Design passkey authentication flow
- [ ] Plan database schema for credentials table

**Database Schema:**
```sql
CREATE TABLE webauthn_credentials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL,
  device_type TEXT, -- 'platform' or 'cross-platform'
  created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints to Build:**
```
POST /api/auth/webauthn/register/challenge
POST /api/auth/webauthn/register/verify
POST /api/auth/webauthn/login/challenge
POST /api/auth/webauthn/login/verify
```

**Frontend Pages:**
- Passkey enrollment page
- Passkey management page (list, delete)
- Passkey login flow

**Testing Requirements:**
- Test on Chrome, Safari, Edge
- Test biometric authentication
- Test cross-device passkeys (QR code)
- Test fallback to password

---

### **WEEK 4: Web Application Firewall (WAF)**

**Cost:** $200/month (Cloudflare WAF)  
**Effort:** Low

**Preparation Checklist:**

- [ ] Research WAF providers: Cloudflare, AWS WAF, Fastly
- [ ] Choose provider (recommend: Cloudflare)
- [ ] Create account
- [ ] Review pricing tiers
- [ ] Plan DNS migration to Cloudflare

**Cloudflare Setup Steps:**
1. Sign up for Cloudflare Pro plan ($20/month) + WAF ($20/month)
2. Add mundotango.life domain
3. Update nameservers at domain registrar
4. Enable WAF rules:
   - OWASP Core Rule Set
   - Cloudflare Managed Ruleset
   - Custom rules for rate limiting
5. Configure SSL/TLS (Full Strict mode)
6. Enable DDoS protection
7. Test firewall rules

**WAF Rules to Configure:**
- Block known bot user agents
- Rate limit: 100 requests/minute per IP
- Challenge suspicious traffic
- Block SQL injection attempts
- Block XSS attempts

---

### **WEEK 5-8: Anomaly Detection System**

**Cost:** $500/month (Datadog or New Relic)  
**Effort:** High

**Preparation Checklist:**

- [ ] Research APM providers: Datadog, New Relic, Dynatrace
- [ ] Choose provider (recommend: Datadog)
- [ ] Create account
- [ ] Review pricing for desired metrics volume
- [ ] Plan instrumentation strategy

**Datadog Setup:**
```bash
# Install Datadog agent
npm install dd-trace

# Configure in server/index.ts
import tracer from 'dd-trace';
tracer.init({
  service: 'mundotango-api',
  env: process.env.NODE_ENV,
  logInjection: true,
});
```

**Metrics to Track:**
- API response times
- Error rates
- Database query performance
- Memory usage
- CPU usage
- Request volume
- User session duration

**Alerts to Configure:**
- Error rate > 1%
- Response time > 500ms (p95)
- Database connection pool exhausted
- Memory usage > 80%
- Failed login attempts > 10/minute
- Unusual traffic spike (2x normal)

**Anomaly Detection:**
- Use Datadog's ML-powered anomaly detection
- Configure alerts for:
  - Unusual user behavior patterns
  - Sudden traffic spikes
  - Database query anomalies
  - API abuse patterns

---

### **WEEK 9-12: SOC 2 Type I Preparation**

**Cost:** $15,000 (consultant + audit)  
**Effort:** Very High

**Preparation Checklist:**

- [ ] Hire SOC 2 consultant ($5,000-$10,000)
- [ ] Schedule Type I audit ($5,000-$10,000)
- [ ] Review SOC 2 Trust Service Criteria
- [ ] Gap analysis against current security posture
- [ ] Create compliance documentation

**SOC 2 Trust Service Criteria:**

**1. Security (CC):**
- [x] Access controls (RBAC implemented)
- [x] CSRF protection (implemented)
- [x] CSP headers (implemented)
- [ ] Encryption in transit (SSL/TLS)
- [ ] Encryption at rest (Neon Pro)
- [ ] Security monitoring (need Datadog)
- [ ] Incident response plan (need to create)

**2. Availability (A):**
- [ ] Uptime monitoring (need to implement)
- [ ] Disaster recovery plan (need to create)
- [ ] Backup procedures (need to document)
- [ ] Capacity planning (need to implement)

**3. Processing Integrity (PI):**
- [x] Input validation (implemented)
- [x] Error handling (implemented)
- [ ] Data quality checks (need to add)
- [ ] System monitoring (need Datadog)

**4. Confidentiality (C):**
- [x] Data classification (implemented via RBAC)
- [ ] Encryption (need to verify)
- [x] Access logging (audit logs implemented)
- [ ] Data retention policy (need to create)

**5. Privacy (P):**
- [x] GDPR compliance (implemented)
- [x] Data export (implemented)
- [x] Data deletion (implemented)
- [x] Consent management (implemented)

**Documents to Create:**
1. Information Security Policy (10-15 pages)
2. Access Control Policy
3. Incident Response Plan
4. Business Continuity Plan
5. Disaster Recovery Plan
6. Data Retention Policy
7. Vendor Management Policy
8. Risk Assessment Report
9. Security Awareness Training Materials
10. Audit Evidence Collection Procedures

**Timeline:**
- Month 1: Hire consultant, gap analysis
- Month 2: Create documentation, implement controls
- Month 3: Internal audit, remediation, final audit

---

## 📋 PHASE 3: ADVANCED CERTIFICATIONS (12-18 Months)

**Timeline:** Months 6-24  
**Cost:** $60,000+ + $1,500/month  
**Priority:** Execute only if large enterprise customers require

---

### **MONTHS 6-18: SOC 2 Type II Audit**

**Cost:** $35,000 (annual audit)  
**Effort:** Very High

**What is SOC 2 Type II?**
- Type I: Security controls **exist** (point in time)
- Type II: Security controls **work** (over 6-12 months)

**Preparation Checklist:**

- [ ] Hire SOC 2 auditor ($30,000-$50,000/year)
- [ ] Maintain all Type I controls for 6-12 months
- [ ] Collect continuous evidence
- [ ] Monthly internal audits
- [ ] Quarterly management reviews

**Evidence Collection (Continuous):**
- Access logs (every access to production systems)
- Change logs (every code deployment)
- Security alerts (every incident)
- Training records (every employee)
- Vendor assessments (every third-party service)
- Backup logs (every backup)
- Penetration tests (quarterly)
- Vulnerability scans (weekly)

**Audit Process:**
1. Month 0: Engage auditor, define scope
2. Months 1-6: Operate under SOC 2 controls
3. Month 6: Auditor observes controls
4. Months 7-12: Continue operating, collect evidence
5. Month 12: Final audit report

---

### **MONTH 6: Bug Bounty Program**

**Cost:** $10,000/year (payouts)  
**Effort:** Medium

**Preparation Checklist:**

- [ ] Choose platform: HackerOne, Bugcrowd, Synack
- [ ] Define scope (what's in scope for testing)
- [ ] Set bounty amounts:
  - Critical: $500-$2,000
  - High: $200-$500
  - Medium: $50-$200
  - Low: $25-$50
- [ ] Create responsible disclosure policy
- [ ] Assign security team member to triage reports

**Platform Comparison:**

| Platform | Pros | Cons | Cost |
|----------|------|------|------|
| HackerOne | Largest hacker community | Expensive | $5K-$20K/year |
| Bugcrowd | Good platform | Medium size | $3K-$15K/year |
| Synack | Vetted researchers | Small pool | $10K-$30K/year |

**Bug Bounty Policy:**
```markdown
## Scope
IN SCOPE:
- mundotango.life domain
- API endpoints (/api/*)
- Authentication flows
- Payment processing

OUT OF SCOPE:
- Third-party services (Stripe, Supabase)
- Social engineering attacks
- DoS attacks
- Physical security

## Rules
- No data destruction
- No account takeover of real users
- Report within 24 hours of discovery
- Give us 90 days to fix before public disclosure
```

---

### **MONTHS 12-30: ISO 27001 Certification**

**Cost:** $50,000 (certification) + $20,000/year (maintenance)  
**Effort:** Extreme

**What is ISO 27001?**
- International standard for information security
- Requires comprehensive ISMS (Information Security Management System)
- 114 security controls across 14 categories

**Preparation Checklist:**

- [ ] Hire ISO 27001 consultant ($20,000-$30,000)
- [ ] Hire certification body ($30,000-$50,000)
- [ ] Create ISMS documentation (500+ pages)
- [ ] Implement all 114 controls
- [ ] Internal audit
- [ ] Management review
- [ ] External audit
- [ ] Certification

**ISO 27001 Controls (14 Categories):**

1. **A.5: Information Security Policies** (2 controls)
2. **A.6: Organization of Information Security** (7 controls)
3. **A.7: Human Resource Security** (6 controls)
4. **A.8: Asset Management** (10 controls)
5. **A.9: Access Control** (14 controls)
6. **A.10: Cryptography** (2 controls)
7. **A.11: Physical and Environmental Security** (15 controls)
8. **A.12: Operations Security** (14 controls)
9. **A.13: Communications Security** (7 controls)
10. **A.14: System Acquisition, Development and Maintenance** (13 controls)
11. **A.15: Supplier Relationships** (5 controls)
12. **A.16: Information Security Incident Management** (7 controls)
13. **A.17: Business Continuity Management** (4 controls)
14. **A.18: Compliance** (8 controls)

**Timeline:**
- Months 1-6: Documentation, gap analysis
- Months 7-12: Implement controls
- Months 13-18: Internal audits, remediation
- Months 19-24: Stage 1 audit (documentation review)
- Months 25-30: Stage 2 audit (on-site assessment)
- Month 30: Certification awarded (if passed)

**Annual Costs After Certification:**
- Surveillance audits: $15,000/year
- Recertification (every 3 years): $40,000

---

## 📋 PHASE 4: TEAM & SCALE (18+ Months)

**Timeline:** Months 18+  
**Cost:** $200,000+/year (salaries)  
**Priority:** Execute only at growth stage (100K+ users)

---

### **MONTH 18+: Build Security Team**

**Team Structure:**

**1. Security Engineer** ($80K-$120K/year)
- Implement security controls
- Monitor security alerts
- Respond to incidents
- Penetration testing
- Vulnerability management

**2. Compliance Officer** ($70K-$100K/year)
- Maintain SOC 2 / ISO 27001
- Annual audits
- Policy documentation
- Risk assessments
- Vendor management

**3. Security Operations Analyst** ($60K-$90K/year)
- Monitor SIEM (Security Information and Event Management)
- Triage security alerts
- Incident response
- Log analysis
- Threat hunting

**Total Annual Cost:** $210K-$310K/year

---

### **MONTH 24+: 24/7 Security Monitoring**

**Cost:** $50,000-$100,000/year (SOC-as-a-Service)

**Options:**

**1. Build In-House SOC:**
- Requires 4-6 analysts (24/7 coverage)
- Cost: $300K-$500K/year in salaries
- + SIEM tools: $50K/year
- **Total:** $350K-$550K/year

**2. Outsource to SOC-as-a-Service:**
- Providers: Arctic Wolf, Expel, CrowdStrike
- Cost: $50K-$100K/year
- 24/7 monitoring, incident response
- **Recommended for most companies**

**SOC Services Included:**
- 24/7/365 monitoring
- Threat detection
- Incident response
- Forensic analysis
- Compliance reporting

---

### **MONTH 30+: Advanced Threat Intelligence**

**Cost:** $20,000-$50,000/year

**Threat Intelligence Feeds:**
- AlienVault OTX (free)
- ThreatConnect ($25K/year)
- Recorded Future ($50K/year)

**What You Get:**
- Real-time threat data
- IP reputation feeds
- Malware signatures
- Attack patterns
- Zero-day alerts

---

### **MONTH 36+: Disaster Recovery**

**Cost:** $100,000-$200,000/year

**Multi-Region Infrastructure:**
- Primary: US East (current)
- Secondary: US West (failover)
- Tertiary: EU (GDPR compliance)

**DR Components:**
- Multi-region database replication
- Geographic load balancing
- Automated failover
- Daily backups retained 30 days
- Point-in-time recovery

**RPO/RTO Targets:**
- RPO (Recovery Point Objective): 1 hour
- RTO (Recovery Time Objective): 4 hours

---

## 💰 TOTAL INVESTMENT SUMMARY

### **PHASE 0 (3 weeks):**
- One-time: $2,000-$5,000
- Monthly: $50

### **PHASE 1 (2 weeks):**
- One-time: $0
- Monthly: $0

### **PHASE 2 (3 months):**
- One-time: $35,000
- Monthly: $700

### **PHASE 3 (12-18 months):**
- One-time: $60,000
- Monthly: $1,500

### **PHASE 4 (18+ months):**
- One-time: $0
- Monthly: $16,667 (team) + $2,250 (services) = $18,917

**TOTAL TO FULL ENTERPRISE:**
- **One-time:** $97,000-$100,000
- **Monthly:** $18,917/month (~$227K/year ongoing)

---

## 🎯 DECISION FRAMEWORK

**When to Execute Each Phase:**

### **Phase 0: Always Required**
- Needed for basic production launch
- Fixes critical security gaps
- Cost: $2K-$5K

### **Phase 1: Recommended for All**
- Improves user experience
- Low cost ($0)
- 2 weeks effort

### **Phase 2: Execute If...**
- Targeting enterprise customers (need SOC 2)
- Expecting high traffic (need WAF)
- Budget: $35K available
- Revenue: $100K+/year

### **Phase 3: Execute If...**
- Selling to Fortune 500 (need ISO 27001)
- Mature security program needed
- Budget: $60K available
- Revenue: $500K+/year

### **Phase 4: Execute If...**
- 100K+ users
- Revenue: $2M+/year
- Can afford $200K+/year team
- Need 24/7 operations

---

## ✅ PREPARATION COMPLETE

**This Document Provides:**
- ✅ Complete roadmap for Phases 2-4
- ✅ Detailed checklists for each phase
- ✅ Cost estimates and timelines
- ✅ Vendor recommendations
- ✅ Decision framework

**Next Steps:**
1. ✅ Complete Phase 0 (critical security fixes)
2. ✅ Launch MVP (December 4, 2025)
3. ⏸️ Pause, gather user feedback
4. 📊 Assess which phases to execute based on customer needs and revenue

---

**Document Status:** ✅ COMPLETE  
**Purpose:** Reference for future enterprise phases  
**Action Required:** None (until post-MVP launch)

---

**Generated by:** Replit AI Agent  
**Date:** November 13, 2025  
**Methodology:** MB.MD (Simultaneously, Recursively, Critically)

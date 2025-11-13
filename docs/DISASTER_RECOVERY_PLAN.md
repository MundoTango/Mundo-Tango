# Disaster Recovery Plan
## Mundo Tango Platform

**Document Version:** 1.0  
**Effective Date:** November 13, 2025  
**Last Reviewed:** November 13, 2025  
**Owner:** Chief Technology Officer  
**Classification:** Confidential

---

## 1. EXECUTIVE SUMMARY

This Disaster Recovery Plan (DRP) outlines procedures to recover Mundo Tango's systems and data in the event of a disaster. It defines recovery objectives, procedures, and responsibilities to ensure business continuity.

**Recovery Objectives:**
- **RPO (Recovery Point Objective):** 4 hours - Maximum acceptable data loss
- **RTO (Recovery Time Objective):** 1 hour - Maximum acceptable downtime

---

## 2. SCOPE

### 2.1 In Scope

**Systems:**
- Production web application (mundotango.life)
- Production database (PostgreSQL on Neon)
- Production APIs
- Authentication systems
- Payment processing
- File storage (Cloudinary)

**Data:**
- User data and profiles
- Content (posts, events, groups)
- Transaction records
- Configuration data
- Audit logs

### 2.2 Out of Scope

**Development/Staging Environments:**
- Not covered by this DRP
- Best-effort recovery only

**Third-Party Services:**
- Managed by vendors (Stripe, Supabase, Cloudflare)
- Covered by vendor SLAs

---

## 3. DISASTER SCENARIOS

### Scenario 1: Database Failure
**Likelihood:** Medium  
**Impact:** Critical  
**RTO:** 1 hour  
**RPO:** 4 hours

### Scenario 2: Application Server Failure
**Likelihood:** Low  
**Impact:** High  
**RTO:** 30 minutes  
**RPO:** 0 (stateless application)

### Scenario 3: Data Center Outage
**Likelihood:** Low  
**Impact:** Critical  
**RTO:** 4 hours  
**RPO:** 4 hours

### Scenario 4: Cyber Attack / Ransomware
**Likelihood:** Medium  
**Impact:** Critical  
**RTO:** 2 hours  
**RPO:** 24 hours (clean backup)

### Scenario 5: DNS / Domain Hijacking
**Likelihood:** Low  
**Impact:** High  
**RTO:** 2 hours  
**RPO:** 0

### Scenario 6: SSL Certificate Expiry
**Likelihood:** Low (automated renewal)  
**Impact:** Medium  
**RTO:** 15 minutes  
**RPO:** 0

---

## 4. BACKUP STRATEGY

### 4.1 Database Backups

**Automated Backups (Neon PostgreSQL):**
- **Frequency:** Continuous WAL archiving
- **Retention:** 7 days point-in-time recovery
- **Location:** Neon managed storage (separate region)
- **Testing:** Monthly restore test

**Manual Backups:**
- **Frequency:** Before major deployments
- **Retention:** 30 days
- **Location:** S3 bucket (encrypted)
- **Script:** `/scripts/backup-database.sh`

**Backup Command:**
```bash
# Daily automated backup
pg_dump $DATABASE_URL | gzip > backups/db-$(date +%Y%m%d-%H%M%S).sql.gz

# Upload to S3 (if configured)
aws s3 cp backups/db-*.sql.gz s3://mundotango-backups/database/
```

### 4.2 Application Backups

**Source Code:**
- **Location:** GitHub (primary) + GitLab (mirror)
- **Frequency:** Every commit
- **Retention:** Indefinite

**Configuration:**
- **Location:** Environment variables in Replit Secrets
- **Backup:** Exported to encrypted file monthly
- **Location:** Secure offline storage

**Media Files:**
- **Primary:** Cloudinary (managed service)
- **Backup:** Cloudinary automatic backups
- **Retention:** Per Cloudinary plan

### 4.3 Backup Verification

**Monthly Backup Restore Test:**
1. Select random backup from previous month
2. Restore to test environment
3. Verify data integrity
4. Document results
5. Update procedures if issues found

**Test Database Restore:**
```bash
# Download backup from S3
aws s3 cp s3://mundotango-backups/database/latest.sql.gz .

# Restore to test database
gunzip latest.sql.gz
psql $TEST_DATABASE_URL < latest.sql

# Verify row counts
psql $TEST_DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $TEST_DATABASE_URL -c "SELECT COUNT(*) FROM posts;"
```

---

## 5. RECOVERY PROCEDURES

### 5.1 Database Recovery

**Scenario:** Database corruption or data loss

**Steps:**
1. **Assess Damage** (5 minutes)
   ```bash
   psql $DATABASE_URL -c "SELECT version();"
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
   ```

2. **Identify Last Good Backup** (5 minutes)
   - Check Neon dashboard for point-in-time options
   - Or identify last manual backup in S3

3. **Create New Database** (5 minutes)
   ```bash
   # Using Neon dashboard or CLI
   # Create new database instance
   ```

4. **Restore Database** (30 minutes)
   ```bash
   # Point-in-time restore via Neon dashboard
   # OR manual restore:
   gunzip latest-backup.sql.gz
   psql $NEW_DATABASE_URL < latest-backup.sql
   ```

5. **Update Connection Strings** (5 minutes)
   ```bash
   # Update DATABASE_URL in Replit Secrets
   # Restart application
   ```

6. **Verify Restoration** (10 minutes)
   ```bash
   # Check table counts
   psql $DATABASE_URL -c "\dt"
   
   # Verify recent data
   psql $DATABASE_URL -c "SELECT * FROM posts ORDER BY id DESC LIMIT 10;"
   
   # Test application functionality
   curl https://mundotango.life/api/health
   ```

**Total RTO:** 60 minutes  
**Total RPO:** 4 hours

---

### 5.2 Application Recovery

**Scenario:** Application server failure

**Steps:**
1. **Verify Issue** (2 minutes)
   ```bash
   curl https://mundotango.life/api/health
   ```

2. **Check Replit Status** (3 minutes)
   - View Replit dashboard
   - Check deployment logs
   - Verify environment variables

3. **Restart Application** (5 minutes)
   ```bash
   # Via Replit UI or CLI
   replit restart
   ```

4. **If Restart Fails - Deploy from Git** (15 minutes)
   ```bash
   # Pull latest stable version
   git checkout main
   git pull origin main
   
   # Reinstall dependencies
   npm install
   
   # Run database migrations
   npm run db:push
   
   # Restart
   npm run dev
   ```

5. **Verify Recovery** (5 minutes)
   ```bash
   curl https://mundotango.life/api/health
   # Test critical paths
   # Monitor error rates
   ```

**Total RTO:** 30 minutes

---

### 5.3 DNS Failover

**Scenario:** DNS provider failure or domain hijacking

**Backup DNS Providers:**
- Primary: Cloudflare
- Secondary: AWS Route 53 (pre-configured)

**Steps:**
1. **Verify DNS Issue** (2 minutes)
   ```bash
   dig mundotango.life
   nslookup mundotango.life
   ```

2. **Switch to Backup DNS** (10 minutes)
   - Log into domain registrar
   - Update nameservers to Route 53
   - Wait for propagation

3. **Update DNS Records** (5 minutes)
   - A record: Points to Replit
   - CNAME: www -> mundotango.life
   - MX records: Email
   - TXT records: Verification

4. **Verify Resolution** (5 minutes)
   ```bash
   dig @8.8.8.8 mundotango.life
   curl https://mundotango.life
   ```

**Total RTO:** 2 hours (including DNS propagation)

---

### 5.4 SSL Certificate Recovery

**Scenario:** Certificate expiration or revocation

**Steps:**
1. **Obtain New Certificate** (5 minutes)
   ```bash
   # Replit auto-manages SSL, but if manual:
   certbot certonly --webroot -w /var/www/html \
     -d mundotango.life -d www.mundotango.life
   ```

2. **Install Certificate** (5 minutes)
   - Update Replit SSL settings
   - Or manual: Copy cert to web server config

3. **Verify SSL** (5 minutes)
   ```bash
   openssl s_client -connect mundotango.life:443
   curl https://mundotango.life/api/health
   ```

**Total RTO:** 15 minutes

---

### 5.5 Ransomware Recovery

**Scenario:** Ransomware infection

**Steps:**
1. **DO NOT PAY RANSOM** (company policy)

2. **Isolate Infected Systems** (5 minutes)
   - Disconnect from network
   - Preserve forensic evidence
   - Notify security team

3. **Assess Damage** (30 minutes)
   - Identify encrypted files/databases
   - Determine infection vector
   - Check backup integrity

4. **Restore from Clean Backup** (2 hours)
   - Use backup from before infection
   - Verify backup is clean
   - Follow database recovery procedures

5. **Patch Vulnerability** (1 hour)
   - Identify and fix security gap
   - Update all systems
   - Reset all passwords

6. **Verify Clean State** (30 minutes)
   - Full malware scan
   - Monitor for reinfection
   - Test all functionality

**Total RTO:** 4 hours  
**Total RPO:** 24 hours (clean backup)

---

## 6. COMMUNICATION PLAN

### 6.1 Internal Notifications

**Disaster Declaration:**
1. **DR Coordinator** notifies DR team (via phone + Slack)
2. **DR Team** assembles (physically or virtually)
3. **Status Updates** every 30 minutes during recovery

**Contact Tree:**
```
CTO (DR Coordinator)
├── Lead Engineer (Technical Recovery)
├── DevOps Lead (Infrastructure)
├── Database Admin (Data Recovery)
└── Communications Lead (User Notifications)
```

### 6.2 External Notifications

**Users/Customers:**
- **Status Page:** status.mundotango.life
- **Twitter:** @MundoTango
- **Email:** For outages >30 minutes
- **In-App:** Banner notification

**Status Page Updates:**
```markdown
[INVESTIGATING] We are aware of issues accessing Mundo Tango. 
Our team is investigating. Updates in 30 minutes.

[IDENTIFIED] Database failure identified. Recovery in progress. 
ETA: 45 minutes.

[MONITORING] Systems restored. Monitoring for stability. 
All services operational.

[RESOLVED] All systems fully operational. Root cause analysis 
will be posted within 24 hours.
```

**Vendors/Partners:**
- Notify if their services affected
- Request support if needed
- Coordinate recovery efforts

### 6.3 Post-Recovery Communication

**Within 24 Hours:**
- Summary email to all users
- Detailed status page post
- Internal post-mortem scheduled

**Within 72 Hours:**
- Root cause analysis published
- Preventive measures announced
- Q&A session if needed

---

## 7. ROLES AND RESPONSIBILITIES

### 7.1 DR Coordinator (CTO)
- Declare disaster
- Activate DR plan
- Coordinate recovery efforts
- Authorize major decisions
- External communications approval

### 7.2 Technical Recovery Lead
- Execute technical recovery procedures
- Coordinate technical team
- Provide status updates
- Verify system functionality

### 7.3 Database Administrator
- Database backup/restore
- Data integrity verification
- Performance optimization post-recovery

### 7.4 Communications Lead
- User notifications
- Status page updates
- Media relations (if needed)
- Internal communications

### 7.5 All Team Members
- Respond to DR activation
- Follow assigned procedures
- Document actions taken
- Report issues immediately

---

## 8. CONTACT INFORMATION

**24/7 Emergency Contacts:**

| Role | Primary | Phone | Email |
|------|---------|-------|-------|
| DR Coordinator | [Name] | [Phone] | [Email] |
| Technical Lead | [Name] | [Phone] | [Email] |
| Database Admin | [Name] | [Phone] | [Email] |
| Communications | [Name] | [Phone] | [Email] |

**Vendor Support:**

| Vendor | Support Contact | Phone | Portal |
|--------|----------------|-------|--------|
| Neon (Database) | support@neon.tech | - | console.neon.tech |
| Replit (Hosting) | support@replit.com | - | replit.com/support |
| Cloudflare (CDN/DNS) | - | - | dash.cloudflare.com |
| Cloudinary (Media) | support@cloudinary.com | - | cloudinary.com/console |

---

## 9. RECOVERY CHECKLISTS

### 9.1 Database Recovery Checklist
- [ ] Disaster declared
- [ ] DR team notified
- [ ] Damage assessment complete
- [ ] Backup identified
- [ ] New database created
- [ ] Backup restored
- [ ] Connection strings updated
- [ ] Application restarted
- [ ] Data integrity verified
- [ ] Performance tested
- [ ] Users notified
- [ ] Monitoring resumed

### 9.2 Application Recovery Checklist
- [ ] Issue verified
- [ ] Root cause identified
- [ ] Code deployed from Git
- [ ] Dependencies installed
- [ ] Database migrations run
- [ ] Application started
- [ ] Health check passed
- [ ] Critical paths tested
- [ ] Users notified
- [ ] Monitoring resumed

### 9.3 Post-Recovery Checklist
- [ ] All systems verified operational
- [ ] Performance metrics normal
- [ ] User notifications sent
- [ ] Incident documented
- [ ] Root cause identified
- [ ] Post-mortem scheduled
- [ ] Preventive measures planned
- [ ] DR plan updated (if needed)
- [ ] Team debriefed

---

## 10. TESTING AND MAINTENANCE

### 10.1 DR Testing Schedule

**Quarterly (Every 3 Months):**
- Tabletop exercise (2 hours)
- Review and update contact lists
- Verify backup integrity

**Semi-Annual (Every 6 Months):**
- Full database restore test
- Application recovery drill
- Update documentation

**Annual:**
- Complete DR simulation
- Full team participation
- Executive briefing on results
- External audit (if applicable)

### 10.2 DR Drill Scenarios

**Q1:** Database failure and restore
**Q2:** Application deployment failure
**Q3:** Ransomware attack simulation
**Q4:** Multi-region failover test

### 10.3 Plan Maintenance

**Triggers for Update:**
- After every real disaster
- After DR drills (if gaps found)
- Infrastructure changes
- Team changes
- Vendor changes

**Update Process:**
1. Document what changed
2. Update relevant sections
3. Review with DR team
4. Train team on changes
5. Update version number

**Next Review:** February 13, 2026

---

## 11. INSURANCE

**Cyber Insurance Policy:**
- Provider: [Insurance Company]
- Policy Number: [Number]
- Coverage: $[Amount]
- Deductible: $[Amount]
- Claim Process: [Steps]

**When to File Claim:**
- Ransomware attack
- Data breach with costs
- Business interruption >24 hours
- Third-party liability

---

## 12. LEGAL AND COMPLIANCE

### 12.1 Data Breach Notification

**GDPR Requirements:**
- Notify supervisory authority within 72 hours
- Notify affected individuals if high risk
- Document the breach

**CCPA Requirements:**
- Notify California residents if applicable
- Timeline: Without unreasonable delay

### 12.2 Evidence Preservation

**For Insurance Claims:**
- System logs before/during incident
- Recovery actions and costs
- Timeline of events
- Communications

**For Legal Purposes:**
- Preserve all evidence
- Chain of custody documentation
- Do not delete logs

---

## 13. APPENDICES

### Appendix A: Recovery Scripts
- Database backup script (`/scripts/backup-database.sh`)
- Database restore script (`/scripts/restore-database.sh`)
- Application deployment script
- Health check script

### Appendix B: System Dependencies
- Third-party services and dependencies
- Critical integrations
- Vendor contact information

### Appendix C: Configuration Files
- Sample environment variable configurations
- DNS record templates
- SSL certificate procedures

### Appendix D: Runbooks
- Link to operational runbooks
- Emergency procedures
- Escalation procedures

---

## 14. APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Chief Technology Officer | [Name] | [Signature] | 2025-11-13 |
| Chief Executive Officer | [Name] | [Signature] | 2025-11-13 |

---

**For DR activation: emergency@mundotango.life**  
**For questions: dr-team@mundotango.life**

---

*This document contains confidential information. Unauthorized distribution is prohibited.*

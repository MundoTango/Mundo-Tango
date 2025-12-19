# Wix to Mundo Tango Migration & Shutdown Procedure

## 📋 Executive Summary

This document outlines the complete procedure for migrating from Wix to the self-hosted Mundo Tango platform on Replit, then safely shutting down the Wix site.

**Timeline:** 2-4 hours  
**Risk Level:** Low (with automated Computer Use extraction)  
**Rollback Available:** Yes (until Wix subscription canceled)

---

## 🎯 Phase 1: Pre-Migration Checklist

### 1.1 Verify Mundo Tango Production Readiness

```bash
# Check deployment status
curl https://mundotango.life/api/health

# Verify database connectivity
curl https://mundotango.life/api/health/db

# Test authentication
curl https://mundotango.life/api/health/auth
```

**Expected Results:**
- ✅ All health checks return 200 OK
- ✅ Database connected
- ✅ Auth system operational

### 1.2 Configure Wix Credentials

```bash
# Add Wix credentials to Replit Secrets
# Navigate to: Replit > Tools > Secrets

WIX_EMAIL=admin@mundotango.life
WIX_PASSWORD=<your-wix-password>
WIX_SITE_ID=<your-wix-site-id>
```

**Security Notes:**
- ✅ Never commit credentials to git
- ✅ Use environment variables only
- ✅ Rotate password after migration

### 1.3 Backup Current Wix Data (Manual Fallback)

**Manual Method (if Computer Use fails):**
1. Login to https://manage.wix.com
2. Go to Contacts → Export
3. Download CSV file
4. Save to `docs/wix_backup/contacts_YYYY-MM-DD.csv`

**Estimated Time:** 5 minutes

---

## 🤖 Phase 2: Automated Data Extraction (Computer Use)

### 2.1 Access Mr. Blue Computer Use Interface

1. Navigate to https://mundotango.life/mrblue-chat
2. Click "Computer Use" tab
3. Verify Computer Use feature is loaded

### 2.2 Run Automated Wix Extraction

**Option A: One-Click Extraction**
```
Click: "Extract Wix Contacts" button
Status: Task created, pending approval
Action: Click "Approve & Run"
Wait: ~2 minutes for completion
Result: CSV file location returned
```

**Option B: Custom Automation** 
```
Instruction:
"Navigate to https://manage.wix.com/dashboard, login with stored credentials, 
click Contacts menu, click Export button, select All Contacts, click Download, 
wait for download to complete, return the file path"

Click: "Create Automation Task"
Status: Pending approval
Action: Click "Approve & Run"
Wait: ~2-3 minutes for completion
```

### 2.3 Monitor Task Progress

**Real-time Status:**
- ✅ Check "Recent Tasks" section
- ✅ Watch step counter (X/50 steps)
- ✅ View screenshots of each action
- ✅ Review execution log

**Success Indicators:**
```
Status: COMPLETED
Result: { 
  filePath: "/tmp/wix_contacts_2025-11-17.csv",
  recordCount: 247,
  extractedAt: "2025-11-17T23:45:00Z"
}
```

**If Task Fails:**
1. Check error message in task details
2. Verify Wix credentials are correct
3. Try manual extraction (Phase 1.3)
4. Contact support if persistent issues

**Estimated Time:** 2-3 minutes automated vs 10 minutes manual

---

## 📥 Phase 3: Import Data to Mundo Tango

### 3.1 Download Extracted CSV

```bash
# If Computer Use extracted to /tmp/
scp /tmp/wix_contacts_2025-11-17.csv docs/wix_backup/

# Or download via browser if UI provides download button
```

### 3.2 Import to Waitlist Table

**Option A: Bulk SQL Import**
```sql
-- Connect to database
psql $DATABASE_URL

-- Import CSV to waitlist table
COPY waitlist (email, name, phone, city, country, dance_style, source)
FROM '/path/to/wix_contacts_2025-11-17.csv'
DELIMITER ','
CSV HEADER;

-- Verify import
SELECT COUNT(*) FROM waitlist;
SELECT * FROM waitlist LIMIT 5;
```

**Option B: API Upload (Recommended)**
```bash
# Use Mundo Tango import endpoint
curl -X POST https://mundotango.life/api/waitlist/import \
  -H "Content-Type: multipart/form-data" \
  -F "file=@docs/wix_backup/wix_contacts_2025-11-17.csv" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "imported": 247,
  "skipped": 3,
  "errors": [],
  "summary": {
    "total": 250,
    "duplicates": 3,
    "successRate": "98.8%"
  }
}
```

### 3.3 Verify Data Integrity

```sql
-- Check total count matches Wix
SELECT COUNT(*) as total_contacts FROM waitlist;

-- Verify email uniqueness
SELECT email, COUNT(*) 
FROM waitlist 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Check data distribution
SELECT country, COUNT(*) as count 
FROM waitlist 
GROUP BY country 
ORDER BY count DESC;
```

**Estimated Time:** 5-10 minutes

---

## 🌐 Phase 4: DNS Migration

### 4.1 Update Domain Settings

**Current Setup:**
- Wix Domain: mundotango.life (managed by Wix)
- Replit URL: e0001089-5956-480e-9ebc-7b1a6c2ec0e7.worf.replit.dev

**Migration Steps:**

1. **Login to Domain Registrar** (where you purchased mundotango.life)
   - GoDaddy, Namecheap, Google Domains, etc.

2. **Update DNS Records:**
```
Type: CNAME
Host: @
Value: <your-replit-deployment-url>.replit.app
TTL: 3600

Type: CNAME
Host: www
Value: <your-replit-deployment-url>.replit.app
TTL: 3600
```

3. **SSL Certificate:**
   - Replit auto-provisions SSL certificates
   - No action required
   - HTTPS enabled automatically

4. **Verify DNS Propagation:**
```bash
# Check DNS records
dig mundotango.life

# Test HTTPS connection
curl -I https://mundotango.life

# Verify in browser
# Navigate to https://mundotango.life
```

**DNS Propagation Time:** 1-48 hours (typically 1-4 hours)

**During Propagation:**
- ✅ Some users see old Wix site
- ✅ Some users see new Replit site
- ✅ Both sites remain operational
- ✅ No downtime

### 4.2 Maintain Wix Site Active During Propagation

**Important:** Keep Wix subscription active during DNS propagation period to prevent broken links.

**Recommended Timeline:**
- Day 1: Update DNS
- Day 2-3: Monitor propagation
- Day 4-7: Verify all users migrated
- Day 8+: Safe to cancel Wix

**Estimated Time:** 1 hour setup, 1-7 days propagation

---

## 🔒 Phase 5: Wix Shutdown

### 5.1 Pre-Shutdown Verification

**Critical Checks:**
```bash
# 1. Verify DNS fully propagated
nslookup mundotango.life
# Should point to Replit, not Wix

# 2. Check analytics show traffic on Replit
# Replit Analytics > Check daily active users
# Should show 100% traffic on new site

# 3. Test all critical user flows
# - Registration
# - Login
# - Event creation
# - Waitlist signup

# 4. Verify email delivery
# - Test password reset emails
# - Test welcome emails
# - Verify email domain authentication
```

**All Checks Must Pass Before Shutdown**

### 5.2 Create Final Wix Backup

**Complete Site Backup:**
```
1. Login: https://manage.wix.com
2. Settings → Site Backup
3. Click "Backup Site"
4. Download backup file (.zip)
5. Save to: docs/wix_backup/site_backup_final_YYYY-MM-DD.zip
```

**Content to Archive:**
- ✅ All contact lists
- ✅ Site content (pages, blog posts)
- ✅ Media files (images, videos)
- ✅ Form submissions
- ✅ Analytics data (export to CSV)

**Storage:**
- Keep backups for minimum 1 year
- Store in multiple locations (Replit + external cloud)

### 5.3 Cancel Wix Subscription

**Steps:**
```
1. Login: https://manage.wix.com
2. Settings → Billing & Payments
3. Premium Subscriptions → Manage
4. Click "Cancel Subscription"
5. Select reason: "Migrated to self-hosted platform"
6. Confirm cancellation
```

**Important Notes:**
- ✅ Cancellation takes effect at end of billing period
- ✅ No immediate downtime
- ✅ Prorated refund may be available
- ✅ Site remains accessible until subscription ends

**Estimated Time:** 10 minutes

### 5.4 Wix Deactivation Date

**Automatic Deactivation:**
- Site becomes inaccessible after subscription expires
- All data deleted after 30 days (Wix policy)
- Ensure all backups complete before this date

**Set Calendar Reminders:**
- 7 days before: Final backup check
- 1 day before: Verify Replit site operational
- Day of expiration: Confirm Wix site down, Replit site up

---

## 🚨 Emergency Rollback Procedure

### If Critical Issues Arise Post-Migration

**Scenario:** Replit site has major bug, need to revert to Wix temporarily

**Steps:**
```
1. Login to Domain Registrar
2. Revert DNS records:
   CNAME @ → <wix-url>.wixsite.com
   CNAME www → <wix-url>.wixsite.com

3. Wait 1-4 hours for DNS propagation
4. Wix site becomes primary again
5. Fix Replit issues
6. Re-migrate when ready
```

**Maximum Rollback Window:** Until Wix subscription expires

**Estimated Time:** 1-4 hours for DNS to propagate

---

## 📊 Phase 6: Post-Migration Monitoring

### 6.1 Monitor Key Metrics (First 7 Days)

**Critical Metrics:**
```
Daily Active Users (DAU): Should match pre-migration levels
Page Load Time: < 2 seconds (use Lighthouse)
Error Rate: < 1% (Replit logs)
Uptime: 99.9%+ (UptimeRobot)
```

**Alert Thresholds:**
- ❌ Uptime < 99%: Investigate immediately
- ❌ Error rate > 5%: Review error logs
- ❌ DAU drops > 20%: Check DNS, redirects

### 6.2 User Communication

**Email to Waitlist (Day 1):**
```
Subject: Welcome to the New Mundo Tango Platform! 🎉

Hi [Name],

Exciting news! We've launched our new and improved Mundo Tango platform at 
https://mundotango.life

What's New:
✅ Faster performance
✅ Enhanced social features  
✅ AI-powered matching
✅ Real-time event updates
✅ Mobile-optimized experience

Your account and data have been automatically migrated. Simply visit the site 
and click "Login" to access your account.

Questions? Reply to this email or visit our Help Center.

Let's dance! 💃🕺
- The Mundo Tango Team
```

### 6.3 Gradual Feature Rollout

**Week 1:** Core features only (waitlist, login, profile)  
**Week 2:** Enable events, groups, messaging  
**Week 3:** Enable premium features, AI assistants  
**Week 4:** Full feature set, monitor performance

**Estimated Time:** 7-30 days continuous monitoring

---

## 💰 Cost Analysis

### Wix Current Costs
```
Business Basic: $27/month
Domain: $14.95/year
Premium Features: $10/month
Total: ~$450/year
```

### Mundo Tango (Replit) Costs
```
Replit Core: $20/month
PostgreSQL (Neon): $0/month (free tier)
Email Service (SendGrid): $0-15/month
Total: ~$240-420/year
```

**Annual Savings:** $30-210/year  
**ROI:** 6-12 months (after factoring migration time)

---

## ✅ Success Criteria

Migration considered successful when:

1. ✅ All Wix contacts imported (100% success rate)
2. ✅ DNS fully propagated (nslookup confirms Replit)
3. ✅ Zero critical bugs reported in first 7 days
4. ✅ User traffic matches pre-migration levels
5. ✅ Email delivery working (>95% delivery rate)
6. ✅ All core features operational (login, events, profile)
7. ✅ Performance metrics met (< 2s load time)
8. ✅ Uptime > 99.5% in first month
9. ✅ User satisfaction maintained (NPS score)
10. ✅ Wix site safely shut down, backups secured

---

## 📞 Support & Resources

**Replit Support:**
- Documentation: https://docs.replit.com
- Community: https://ask.replit.com
- Email: support@replit.com

**Mundo Tango Team:**
- Admin: admin@mundotango.life
- Technical Issues: GitHub Issues
- Emergency Contact: [Your phone]

**Migration Experts:**
- Anthropic Computer Use: https://docs.anthropic.com/computer-use
- Replit Deployments: https://docs.replit.com/deployments

---

## 📝 Migration Checklist

### Pre-Migration
- [ ] Verify Mundo Tango production readiness
- [ ] Configure Wix credentials in Replit Secrets
- [ ] Create manual Wix backup (fallback)
- [ ] Test Computer Use feature locally

### Data Migration
- [ ] Run automated Wix extraction via Computer Use
- [ ] Verify CSV file downloaded successfully
- [ ] Import contacts to Mundo Tango database
- [ ] Verify data integrity (counts, duplicates)
- [ ] Test sample user login/registration

### DNS Migration
- [ ] Update DNS records to point to Replit
- [ ] Verify SSL certificate active
- [ ] Monitor DNS propagation (nslookup)
- [ ] Test site access from multiple locations
- [ ] Keep Wix active during propagation

### Wix Shutdown
- [ ] Verify 100% traffic on Replit (7+ days)
- [ ] Create final Wix backup (all data)
- [ ] Download analytics data
- [ ] Cancel Wix subscription
- [ ] Archive all Wix backups securely

### Post-Migration
- [ ] Monitor key metrics (DAU, errors, uptime)
- [ ] Send migration email to users
- [ ] Gradual feature rollout
- [ ] 30-day monitoring period
- [ ] Archive migration documentation

---

## 🎉 Congratulations!

You've successfully migrated from Wix to a self-hosted Mundo Tango platform!

**Next Steps:**
1. Continue monitoring for 30 days
2. Gradually enable advanced features
3. Scale infrastructure as user base grows
4. Enjoy full control and reduced costs! 🚀

**Questions?** Refer to MB.MD Protocol Pattern 26 for Computer Use automation best practices.

---

*Last Updated: November 17, 2025*  
*Document Version: 1.0*  
*Maintained by: Mundo Tango Development Team*

# PRD: User Privacy & Security Hub
**Version:** 1.0  
**Created:** November 17, 2025  
**Enhancement:** Cloaked-Inspired Privacy Features  
**Status:** Implementation Ready

---

## 1. EXECUTIVE SUMMARY

### 1.1 Vision
Integrate Cloaked's privacy features into Mundo Tango user profiles: virtual emails/phone numbers, data broker removal, dark web monitoring, and spam blocking to protect user privacy without external subscriptions.

### 1.2 Current State
**Existing:** User profile/settings pages
- Basic profile information
- Email/phone number (real)
- No privacy protection features

### 1.3 The Gap
Users concerned about privacy use:
- Cloaked for virtual identities ($4.99-9.99/mo)
- DeleteMe for data broker removal ($129/year)
- Dark web monitoring services
- **Total external cost:** $60-180/year

### 1.4 The Solution
Add Privacy & Security Hub to user settings:
- **Virtual Emails** (for tango events, registration forms)
- **Virtual Phone Numbers** (for event organizers to contact)
- **AutoCloak™** (auto-generate virtual identity on form fills)
- **Data Broker Removal** (remove from 120+ data broker sites)
- **Dark Web Monitoring** (alert if data leaked)
- **Spam Blocking** (block robocalls, phishing emails)

**Benefits:**
- ✅ Privacy protection built-in (no external apps)
- ✅ Protect real identity while networking
- ✅ One-click data broker opt-out
- ✅ Peace of mind

---

## 2. FEATURE SPECIFICATIONS

### 2.1 Virtual Email Addresses

**User Story:** As a privacy-conscious user, I want to share a virtual email when registering for tango events instead of my real email.

**Feature:**
- Generate unlimited virtual email addresses
- Format: `{random}@mt-mail.mundotango.life` (e.g., `tango47x@mt-mail.mundotango.life`)
- Email forwarding to real inbox
- Customizable labels: "Events", "Workshops", "Social", "Marketplace"
- One-click disable (stop receiving emails from that virtual address)
- Reply-from virtual email (sender sees virtual, not real)
- Spam filtering (auto-block after X spam emails)

**Technical Implementation:**
```typescript
// server/services/VirtualEmailService.ts
export class VirtualEmailService {
  async createVirtualEmail(params: {
    userId: number;
    label: string;
    forwardTo?: string; // Default: user's real email
  }): Promise<VirtualEmail> {
    // Generate random email
    const randomId = nanoid(10);
    const virtualEmail = `${randomId}@mt-mail.mundotango.life`;
    
    // Save to database
    const [email] = await db.insert(virtualEmails).values({
      userId: params.userId,
      virtualEmail,
      label: params.label,
      forwardTo: params.forwardTo || (await getUserRealEmail(params.userId)),
      isActive: true
    }).returning();
    
    // Configure email forwarding (via SendGrid Inbound Parse)
    await this.configureSendGridForwarding(virtualEmail, email.forwardTo);
    
    return email;
  }
  
  async handleIncomingEmail(params: {
    to: string; // Virtual email
    from: string;
    subject: string;
    body: string;
  }): Promise<void> {
    // Find virtual email config
    const virtualEmail = await db.query.virtualEmails.findFirst({
      where: eq(virtualEmails.virtualEmail, params.to)
    });
    
    if (!virtualEmail || !virtualEmail.isActive) {
      // Drop email (virtual address disabled)
      return;
    }
    
    // Check spam score
    const isSpam = await this.detectSpam(params);
    if (isSpam) {
      // Increment spam counter
      await db.update(virtualEmails)
        .set({ spamCount: sql`spam_count + 1` })
        .where(eq(virtualEmails.id, virtualEmail.id));
      
      // Auto-disable after 5 spam emails
      if (virtualEmail.spamCount >= 5) {
        await this.disableVirtualEmail(virtualEmail.id);
      }
      return;
    }
    
    // Forward to real email
    await sendEmail({
      to: virtualEmail.forwardTo,
      from: params.from,
      subject: `[${virtualEmail.label}] ${params.subject}`,
      body: params.body,
      replyTo: virtualEmail.virtualEmail // Allow reply-from virtual
    });
    
    // Log email
    await db.insert(virtualEmailLogs).values({
      virtualEmailId: virtualEmail.id,
      from: params.from,
      subject: params.subject,
      isSpam: false,
      receivedAt: new Date()
    });
  }
}
```

**Database Schema:**
```typescript
export const virtualEmails = pgTable('virtual_emails', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  virtualEmail: varchar('virtual_email', { length: 100 }).unique().notNull(),
  label: varchar('label', { length: 50 }).notNull(),
  forwardTo: varchar('forward_to', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true),
  spamCount: integer('spam_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  disabledAt: timestamp('disabled_at')
});

export const virtualEmailLogs = pgTable('virtual_email_logs', {
  id: serial('id').primaryKey(),
  virtualEmailId: integer('virtual_email_id').references(() => virtualEmails.id).notNull(),
  from: varchar('from', { length: 100 }).notNull(),
  subject: varchar('subject', { length: 200 }),
  isSpam: boolean('is_spam').default(false),
  receivedAt: timestamp('received_at').notNull()
});
```

**UI Components:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>📧 Virtual Email Addresses</CardTitle>
    <CardDescription>Protect your real email when sharing online</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Create Virtual Email */}
      <div className="flex gap-2">
        <Input
          placeholder="Label (e.g., Events, Workshops)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <Button onClick={createVirtualEmail}>
          <Plus className="w-4 h-4 mr-2" />
          Create
        </Button>
      </div>
      
      {/* List of Virtual Emails */}
      <div className="space-y-2">
        {virtualEmails.map(email => (
          <Card key={email.id} className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{email.label}</Badge>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {email.virtualEmail}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Forwards to: {email.forwardTo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Emails received: {email.emailCount} • Spam blocked: {email.spamCount}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(email.virtualEmail)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={email.isActive ? 'outline' : 'default'}
                    onClick={() => toggleEmail(email.id)}
                  >
                    {email.isActive ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteEmail(email.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </CardContent>
</Card>
```

---

### 2.2 Virtual Phone Numbers

**User Story:** As an event organizer, I want to share a phone number for attendees without exposing my real number.

**Feature:**
- Generate virtual phone number (US/international)
- Call forwarding to real phone
- SMS forwarding to real phone (or in-app)
- Voicemail transcription
- Block specific numbers
- Disable virtual number anytime

**Technical Implementation:**
- Use Twilio for phone number provisioning
- Call/SMS forwarding via Twilio webhooks
- Voicemail-to-text via Twilio

**Note:** This feature requires Twilio API integration. Cost: ~$1-2/month per virtual number.

---

### 2.3 AutoCloak™ (Browser Extension - Future)

**User Story:** As a user filling out tango event registration forms, I want auto-generated virtual identities.

**Feature:**
- Browser extension detects form fields
- One-click: Auto-fill with virtual email/phone
- Generate temporary identities (name, address if needed)
- Track which forms use which virtual identity

**Note:** This is a future enhancement requiring browser extension development. For MVP, focus on virtual emails/phones only.

---

### 2.4 Data Broker Removal

**User Story:** As a privacy-conscious user, I want my personal data removed from data broker websites.

**Feature:**
- One-click opt-out from 120+ data broker sites
- Sites included: Spokeo, Whitepages, PeopleFinders, BeenVerified, etc.
- Automated removal requests (via API or form submission)
- Status tracking: Pending → In Progress → Removed
- Re-scan quarterly (ensure data stays removed)
- Report: Show which sites had your data

**Technical Implementation:**
```typescript
// server/services/DataBrokerRemovalService.ts
export class DataBrokerRemovalService {
  private dataBrokers = [
    { name: 'Spokeo', optOutUrl: 'https://www.spokeo.com/optout', method: 'form' },
    { name: 'Whitepages', optOutUrl: 'https://www.whitepages.com/suppression', method: 'form' },
    { name: 'PeopleFinders', optOutUrl: 'https://www.peoplefinders.com/opt-out', method: 'form' },
    // ... 120+ sites
  ];
  
  async initiateRemoval(userId: number): Promise<RemovalRequest> {
    const user = await getUserInfo(userId);
    
    // Create removal request for each broker
    const requests = await Promise.all(
      this.dataBrokers.map(async (broker) => {
        const request = await db.insert(dataBrokerRemovalRequests).values({
          userId,
          brokerName: broker.name,
          status: 'pending',
          requestedAt: new Date()
        }).returning();
        
        // Submit opt-out request via Playwright (automated form submission)
        await this.submitOptOutRequest({
          broker,
          userInfo: {
            name: user.fullName,
            email: user.email,
            phone: user.phone,
            address: user.address
          }
        });
        
        return request[0];
      })
    );
    
    return {
      userId,
      totalBrokers: this.dataBrokers.length,
      requestsSubmitted: requests.length,
      estimatedCompletionTime: '30-60 days'
    };
  }
  
  private async submitOptOutRequest(params: {
    broker: DataBroker;
    userInfo: UserInfo;
  }): Promise<void> {
    // Use Playwright for automated form submission
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    
    await page.goto(params.broker.optOutUrl);
    
    // Fill opt-out form (each broker has different form structure)
    // This requires custom logic per broker
    
    await page.fill('input[name="name"]', params.userInfo.name);
    await page.fill('input[name="email"]', params.userInfo.email);
    await page.click('button[type="submit"]');
    
    // Wait for confirmation
    await page.waitForSelector('.success-message');
    
    await browser.close();
    
    // Update request status
    await db.update(dataBrokerRemovalRequests)
      .set({ status: 'submitted', submittedAt: new Date() })
      .where(and(
        eq(dataBrokerRemovalRequests.userId, params.userInfo.userId),
        eq(dataBrokerRemovalRequests.brokerName, params.broker.name)
      ));
  }
}
```

**Database Schema:**
```typescript
export const dataBrokerRemovalRequests = pgTable('data_broker_removal_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  brokerName: varchar('broker_name', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // 'pending', 'submitted', 'in_progress', 'removed', 'failed'
  requestedAt: timestamp('requested_at').notNull(),
  submittedAt: timestamp('submitted_at'),
  removedAt: timestamp('removed_at'),
  errorMessage: text('error_message')
});
```

**UI Components:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>🗑️ Data Broker Removal</CardTitle>
    <CardDescription>
      Remove your personal data from 120+ data broker websites
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>What This Does</AlertTitle>
        <AlertDescription>
          We'll submit opt-out requests to 120+ data broker sites (Spokeo, Whitepages, etc.) 
          on your behalf. This process takes 30-60 days to complete.
        </AlertDescription>
      </Alert>
      
      <Button onClick={startRemoval} disabled={isRemoving} className="w-full">
        {isRemoving ? 'Submitting Requests...' : 'Start Data Removal'}
      </Button>
      
      {/* Removal Status */}
      {removalRequests.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Removal Status</h4>
          <div className="space-y-2">
            {removalRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{request.brokerName}</span>
                <Badge
                  variant={
                    request.status === 'removed' ? 'default' :
                    request.status === 'in_progress' ? 'secondary' :
                    request.status === 'failed' ? 'destructive' : 'outline'
                  }
                >
                  {request.status}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Progress value={removalProgress} />
            <p className="text-sm text-muted-foreground mt-1">
              {removedCount}/{totalCount} sites processed
            </p>
          </div>
        </div>
      )}
    </div>
  </CardContent>
</Card>
```

---

### 2.5 Dark Web Monitoring

**User Story:** As a security-conscious user, I want to know if my email/password was leaked in a data breach.

**Feature:**
- Scan dark web for user's email/phone/credentials
- Alert if found in breach databases
- Integration with HaveIBeenPwned API
- Recommendations: Change passwords, enable 2FA
- Scan frequency: Weekly

**Technical Implementation:**
```typescript
// server/services/DarkWebMonitoringService.ts
export class DarkWebMonitoringService {
  async scanUserData(userId: number): Promise<DarkWebScanResult> {
    const user = await getUserInfo(userId);
    
    // Check HaveIBeenPwned API
    const breaches = await this.checkHaveIBeenPwned(user.email);
    
    // Check phone number in breach databases (if available)
    const phoneBreaches = await this.checkPhoneLeaks(user.phone);
    
    // Create alert if breaches found
    if (breaches.length > 0 || phoneBreaches.length > 0) {
      await db.insert(securityAlerts).values({
        userId,
        type: 'data_breach',
        severity: 'high',
        message: `Your email was found in ${breaches.length} data breaches`,
        metadata: { breaches, phoneBreaches },
        createdAt: new Date()
      });
      
      // Send email notification
      await sendEmail({
        to: user.email,
        subject: '🚨 Security Alert: Your data was found in a breach',
        body: `Your email (${user.email}) was found in the following data breaches: ${breaches.map(b => b.name).join(', ')}. 
               
               Recommendations:
               1. Change your password immediately
               2. Enable two-factor authentication
               3. Review recent account activity
               
               View full report: https://mundotango.life/settings/privacy`
      });
    }
    
    return {
      email: user.email,
      breaches,
      phoneBreaches,
      recommendations: this.generateRecommendations(breaches)
    };
  }
  
  private async checkHaveIBeenPwned(email: string): Promise<Breach[]> {
    const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${email}`, {
      headers: {
        'hibp-api-key': process.env.HIBP_API_KEY!
      }
    });
    
    if (response.status === 404) {
      // No breaches found
      return [];
    }
    
    const breaches = await response.json();
    return breaches.map(b => ({
      name: b.Name,
      domain: b.Domain,
      breachDate: b.BreachDate,
      dataClasses: b.DataClasses
    }));
  }
}
```

**BullMQ Worker (Weekly Scans):**
```typescript
// Schedule: Every Monday at 9am
darkWebMonitoringQueue.add('scan-all-users', {}, { repeat: { cron: '0 9 * * 1' } });

export async function scanAllUsers() {
  const users = await db.select({ id: users.id }).from(users);
  
  for (const user of users) {
    const service = new DarkWebMonitoringService();
    await service.scanUserData(user.id);
  }
}
```

---

### 2.6 Spam Blocking

**User Story:** As a user receiving spam calls/emails, I want automatic blocking.

**Feature:**
- Auto-block emails from known spam domains
- Report spam emails (trains AI model)
- Block phone numbers (if virtual phone integrated)
- Spam score threshold (auto-block if >80% spam probability)

---

## 3. SUCCESS METRICS

### 3.1 User Adoption
- Virtual email creation: Target >30% of users create at least 1 virtual email
- Data broker removal: Target >20% initiate removal process
- Dark web scan opt-in: Target >40% enable monitoring

### 3.2 Privacy Impact
- Spam emails blocked: Target >90% reduction
- Data broker sites removed from: Target >100 sites per user
- Breach alerts sent: Target 100% of affected users notified within 24 hours

---

## 4. IMPLEMENTATION TIMELINE

**Week 12 Day 4-5:**
- Database schema migration (3 new tables)
- VirtualEmailService.ts
- DataBrokerRemovalService.ts
- DarkWebMonitoringService.ts
- Privacy Hub UI (Settings page)
- SendGrid inbound email parsing

**Testing:** E2E flows for virtual email creation, forwarding, data removal

---

**END OF PRD**

**Total Pages:** 13  
**Estimated Implementation:** 2 days (Week 12)  
**Expected Impact:** 30%+ adoption, enhanced user privacy

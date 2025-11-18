# Facebook Messenger Automation - Testing Guide

## Overview
Natural language interface for sending Facebook Messenger invitations through Mr. Blue AI assistant. Users can trigger automation by chatting with phrases like "Send FB invitation to [name]".

## ✅ Prerequisites

### 1. Environment Setup
Add these secrets to Replit Secrets:

```bash
FACEBOOK_EMAIL=your_facebook_email@example.com
FACEBOOK_PASSWORD=your_facebook_password
```

⚠️ **Security Note**: Use a dedicated Facebook account for automation testing. Never use your primary personal account.

### 2. User Requirements
- **Role Level**: 8+ (god-level users only)
- **Rate Limits**: 
  - 5 invitations per 24 hours
  - 1 invitation per hour
- **Access**: Global Mr. Blue button (bottom-right corner)

## 🧪 Test Scenarios

### Test 1: Basic Invitation Flow
**Goal**: Send a single Facebook invitation via natural language

**Steps**:
1. Open the application
2. Click the Global Mr. Blue button (bottom-right)
3. Type: `"Send FB invitation to John Smith"`
4. Press Send

**Expected Result**:
```
🚀 Starting Facebook invitation to John Smith!

Task ID: fb_invite_abc123

**I'm now:**
1. 🔐 Logging into Facebook
2. 💬 Opening Messenger
3. 🔍 Searching for "John Smith"
4. ✉️ Sending personalized Mundo Tango invitation

**Rate Limits:**
• Daily: 1/5
• Hourly: 1/1

This will take 1-2 minutes. I'll show you real-time screenshots as I go!

Poll /api/computer-use/task/fb_invite_abc123 for live updates! 📸
```

**Validation**:
- Task ID returned (format: `fb_invite_*`)
- Poll URL provided
- Background task created in database
- Rate limits updated

---

### Test 2: Intent Detection Variations
**Goal**: Verify natural language understanding

**Test Phrases** (all should trigger Facebook automation):
```
✅ "Send FB invitation to Maria Garcia"
✅ "Invite Carlos Mendez on Facebook"
✅ "Send Facebook message to Ana Rodriguez"
✅ "facebook invite Sarah Johnson"
✅ "fb message to Michael Brown"
```

**Test Anti-Patterns** (should NOT trigger):
```
❌ "Tell me about Facebook"
❌ "How do I use Facebook?"
❌ "Facebook is great"
```

---

### Test 3: Rate Limiting
**Goal**: Verify rate limits prevent spam

**Steps**:
1. Send 1st invitation → Should succeed
2. Wait 5 seconds
3. Send 2nd invitation → Should fail with hourly limit error
4. Wait 1 hour
5. Send 3rd invitation → Should succeed
6. Repeat until daily limit (5) reached

**Expected Error (Hourly)**:
```
⏱️ Facebook invitation rate limit reached!

**Current Status:**
• Daily limit: 1/5 sent
• Hourly limit: 1/1 sent

You can send your next invitation at: [timestamp]

These limits help protect your Facebook account from being flagged for spam. Thank you for your patience! 🙏
```

**Expected Error (Daily)**:
```
⏱️ Facebook invitation rate limit reached!

**Current Status:**
• Daily limit: 5/5 sent
• Hourly limit: 1/1 sent

You can send your next invitation at: [timestamp + 24 hours]
```

---

### Test 4: Missing Recipient Name
**Goal**: Verify error handling for incomplete requests

**Steps**:
1. Type: `"Send FB invitation"`
2. Press Send

**Expected Result**:
```
I detected you want to send a Facebook invitation, but I couldn't determine the recipient name.

Please use one of these formats:
• "Send FB invitation to John Smith"
• "Invite Maria Garcia on Facebook"
• "Send Facebook message to Carlos Mendez"

What name would you like to send to?
```

---

### Test 5: Missing Credentials
**Goal**: Verify graceful failure when credentials not set

**Setup**: Remove `FACEBOOK_EMAIL` and `FACEBOOK_PASSWORD` from secrets

**Steps**:
1. Type: `"Send FB invitation to John Smith"`
2. Press Send

**Expected Result**:
```
I'd love to help with Facebook automation, but I need FACEBOOK_EMAIL and FACEBOOK_PASSWORD configured in environment variables first. Please ask an admin to set these up.
```

---

### Test 6: Non-Admin User Access
**Goal**: Verify permission enforcement

**Setup**: Test with user having roleLevel < 8

**Steps**:
1. Type: `"Send FB invitation to John Smith"`
2. Press Send

**Expected Result**:
```
🔒 Computer Use automation is available, but requires admin access (role level 8+).

Your current role level: [current level]

Computer Use allows me to control a web browser to automate tasks like:
• Extracting data from websites
• Automating social media actions
• Migrating data between platforms

Please contact an administrator if you need access to this feature.
```

---

### Test 7: Real-Time Progress Tracking
**Goal**: Verify screenshot updates and task status polling

**Steps**:
1. Send invitation: `"Send FB invitation to Test User"`
2. Immediately poll: `GET /api/computer-use/task/{taskId}`
3. Poll every 3 seconds until task completes

**Expected Screenshots** (in order):
```
Step 1: Navigate to facebook.com
Step 2: Enter email
Step 3: Enter password
Step 4: Click login and wait for redirect
Step 5: Navigate to Messenger
Step 6: Search for [recipient name]
Step 7: Open conversation with [recipient name]
Step 8: Type invitation message
Step 9: Message sent to [recipient name]
```

**Task Status Progression**:
```
pending → running → completed (or failed)
```

---

### Test 8: Database Validation
**Goal**: Verify facebook_invites table tracking

**Steps**:
1. Send invitation: `"Send FB invitation to Jane Doe"`
2. Query database:
```sql
SELECT * FROM facebook_invites 
WHERE user_id = [your_user_id] 
ORDER BY sent_at DESC 
LIMIT 5;
```

**Expected Record**:
```
{
  id: 1,
  user_id: 123,
  recipient_fb_name: "Jane Doe",
  message_template: "mundo_tango_invite",
  status: "sent" (or "failed" or "rate_limited"),
  error: null (or error message),
  sent_at: "2025-01-15 14:30:00"
}
```

---

### Test 9: Error Recovery
**Goal**: Verify graceful handling of Facebook login failures

**Setup**: Provide invalid Facebook credentials

**Expected Behavior**:
- Task status: `failed`
- Error message stored in `computer_use_tasks.error`
- Error screenshot captured
- User notified via Mr. Blue chat

---

### Test 10: Message Template Validation
**Goal**: Verify personalized invitation message

**Expected Message Content**:
```
Hey [FirstName]! 👋

I'd love to invite you to Mundo Tango, the global tango community platform. We're connecting dancers worldwide, sharing events, and celebrating our passion for tango.

Join us at mundotango.life 💃🕺

Hope to see you there!
```

**Personalization**:
- Extracts first name from full name (e.g., "John Smith" → "John")
- Uses appropriate greeting
- Includes platform URL

---

## 🔍 Debugging

### Check Task Status
```bash
GET /api/computer-use/task/{taskId}
```

### Check Rate Limit Status
```sql
SELECT COUNT(*) 
FROM facebook_invites 
WHERE user_id = [your_id] 
  AND sent_at > NOW() - INTERVAL '24 hours'
  AND status = 'sent';
```

### View Recent Screenshots
```sql
SELECT s.step_number, s.action, t.task_id, t.status
FROM computer_use_screenshots s
JOIN computer_use_tasks t ON s.task_id = t.id
WHERE t.user_id = [your_id]
  AND t.automation_type = 'facebook_automation'
ORDER BY t.created_at DESC, s.step_number ASC
LIMIT 20;
```

### Logs
```bash
# Server logs
grep "FacebookMessenger" /tmp/logs/*

# Mr. Blue logs
grep "Mr. Blue.*Facebook" /tmp/logs/*
```

---

## ⚠️ Known Limitations

### 1. **Facebook Security**
- Facebook may block automation if detected
- Use dedicated test account
- Respect rate limits strictly

### 2. **Browser Headless Mode**
- Running in headless mode (no GUI)
- Some Facebook features may not work
- CAPTCHA challenges will fail

### 3. **Name Matching**
- Requires exact name match in Facebook search
- Nicknames may not work
- Special characters might cause issues

### 4. **Message Delivery**
- No guarantee message reaches user
- Facebook message requests may be filtered
- User must accept message request to see content

---

## 📊 Success Metrics

After testing, verify:
- ✅ Intent detection accuracy: >95%
- ✅ Rate limiting enforcement: 100%
- ✅ Task creation success: 100%
- ✅ Screenshot capture rate: >90%
- ✅ Database record accuracy: 100%
- ✅ Error handling: No crashes

---

## 🚀 Production Readiness Checklist

Before production use:
- [ ] Dedicated Facebook account configured
- [ ] Rate limits tested and working
- [ ] Error handling validated
- [ ] Screenshots storing correctly
- [ ] Database migrations applied
- [ ] Admin permissions enforced
- [ ] User documentation created
- [ ] Fallback error messages working
- [ ] Monitoring alerts configured
- [ ] Legal compliance verified (GDPR, Facebook TOS)

---

## 📞 Support

If you encounter issues:
1. Check server logs: `/tmp/logs/*`
2. Verify credentials in Replit Secrets
3. Confirm user role level >= 8
4. Check rate limit status in database
5. Review task status via API endpoint

For persistent issues, contact the development team with:
- Task ID
- Error message
- Screenshots (if available)
- Server logs excerpt

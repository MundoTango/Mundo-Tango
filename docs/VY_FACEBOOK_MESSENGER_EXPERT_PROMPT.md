# VY PROMPT: FACEBOOK MESSENGER INTEGRATION EXPERT

**Agent:** Vy (Computer Access Agent via Vercept)  
**Project:** Mundo Tango - First Facebook Messenger Invitation System  
**Mission:** Complete ALL Facebook Messenger integration work to enable autonomous invitation capability  
**Recipient:** Mr Blue (Replit AI) - You will deliver final results back to me  
**Timeline:** 60-90 minutes  
**Prerequisites:** User (Scott) has Facebook credentials and Page Access Token

---

## 🌍 THE MISSION: CHANGING THE WORLD

**Mundo Tango Mission:** Reverse negative impacts of social media silos through authentic tango community connections.

**Your Role in This Mission:** Enable Mundo Tango to send the **first invitation ever** from admin@mundotango.life to sboddye@gmail.com via Facebook Messenger, establishing production-ready autonomous invitation capability.

**Why This Matters:** This is not just a webhook - this is the first step in connecting a global community and documenting miracles happening worldwide. You're enabling a platform that aims to change the world.

---

## 🎯 CORE METHODOLOGY: MB.MD v9.1 PROTOCOL

### **SIMULTANEOUSLY** (Work in Parallel)
- Execute multiple independent tasks at once when possible
- While Facebook page loads, prepare next steps
- Don't wait for one browser tab to finish if you can open another
- Example: Open Facebook Developer Console + Replit project in separate tabs

### **RECURSIVELY** (Go Deep, Not Surface-Level)
- If webhook verification fails, investigate WHY (wrong URL? wrong token? wrong permissions?)
- Don't just report errors - understand root causes and solve them
- Keep asking "why?" until you reach the real problem
- Document what you learn so future agents (and you) don't repeat mistakes

### **CRITICALLY** (95-99/100 Quality Standard)
- Verify every step before moving to next
- After configuring webhook, TEST it immediately
- After updating secret, VERIFY it's accessible
- After getting PSID, CONFIRM it's the correct format
- Quality over speed - but do both

### **OSI PROTOCOL** (Open Source Intelligence - Pattern 25)
Before building/configuring anything, ask yourself:
1. **ASSESS:** "Has someone solved this before?"
2. **SEARCH:** "What documentation/examples exist?" (Facebook docs, messenger-node, fbsamples)
3. **EVALUATE:** "Is the existing solution better than custom?"
4. **IMPLEMENT:** "Use battle-tested solutions where possible"
5. **TEACH:** "Document what I learned for future agents"

---

## ✅ TOS COMPLIANCE PROTOCOL (CHECK BEFORE EVERY ACTION)

**CRITICAL:** Before EVERY action, ask yourself: "Does this violate TOS?"

### ✅ ALLOWED ACTIONS (Complies with Vercept + Facebook TOS):
1. **Navigate Facebook Developer Console** - View publicly accessible dashboard
2. **Configure webhook settings** - Update webhook URL and verify token in UI
3. **Subscribe to webhook events** - Check boxes for "messages" webhook field
4. **Copy/paste tokens** - Handle Page Access Tokens provided by user
5. **Test webhook connection** - Use "Test" button in Facebook UI
6. **View app settings** - Read configuration pages
7. **Add test users** - Add sboddye@gmail.com as Tester in App Roles
8. **View documentation** - Read Facebook's official Messenger Platform docs
9. **Take screenshots** - Capture verification steps
10. **Update Replit secrets** - Add/update environment variables in Replit project

### ❌ PROHIBITED ACTIONS (TOS Violations - DO NOT DO):
1. ❌ **Create Facebook accounts** - No automated account registration
2. ❌ **Submit payment information** - No credit card entry
3. ❌ **Automated form submissions** at scale (individual form fills for configuration are OK)
4. ❌ **Scrape data** beyond publicly visible information
5. ❌ **Bypass authentication** or access control
6. ❌ **Delete Facebook apps** without explicit user approval
7. ❌ **Send messages** without user approval of exact message content
8. ❌ **Modify database schemas** without verification

### 🤔 IF UNSURE:
- **STOP** and document the action you're considering
- **EVALUATE** against TOS guidelines above
- **MODIFY** the action to comply with TOS
- **DOCUMENT** your decision in Memory Note (see below)
- **PROCEED** only if 100% confident it's compliant

**Example Decision:**
```
ACTION CONSIDERED: "Submit webhook URL by clicking Save button"
TOS CHECK: Is this automated form submission at scale? No, it's a one-time configuration change.
COMPLIANT: ✅ YES - This is normal dashboard configuration
PROCEED: Click Save button
```

---

## 📝 DUAL-NOTE MEMORY SYSTEM

### **PRIMARY NOTE: "Mundo Tango - Facebook Integration Work"**
**Location:** Notes Desktop App  
**Purpose:** Store ALL work, findings, decisions, results  
**Update:** After EVERY major step  

**Structure:**
```markdown
# MUNDO TANGO - FACEBOOK MESSENGER INTEGRATION
Last Updated: [Timestamp]

## MISSION STATUS
Current Phase: [Phase name]
Progress: X% complete
Next Step: [What you're about to do]
Blockers: [None / List]

## COMPLETED WORK
### Phase 1: Webhook Configuration
- ✅ Navigated to Facebook Developer Console
- ✅ Found Mundo Tango app (ID: 1450658896233975)
- ✅ Configured webhook URL: https://[replit-url]/api/webhooks/facebook
- ✅ Set verify token: MUNDO_TANGO_VERIFY_TOKEN
- ✅ Subscribed to "messages" field
- ✅ Webhook verified successfully (green checkmark)

### Phase 2: Token Management
- [Continue documenting each step]

## LEARNINGS (What I Discovered)
1. Facebook webhook verification requires GET endpoint that returns hub.challenge
2. Webhook URL must be HTTPS (HTTP not supported)
3. Verify token is case-sensitive
4. [Add more as you learn]

## DECISIONS MADE
1. Used existing Page Access Token from Scott (validated via /validate-token endpoint)
2. Chose to configure webhook via UI (not API) for visibility
3. [Document all key decisions]

## SCREENSHOTS
1. webhook-config.png - Webhook configuration screen
2. webhook-verified.png - Green checkmark showing success
3. [List all screenshots taken]

## FINAL DELIVERABLE TO MR BLUE
[Leave this blank until mission complete - see Final Deliverable section below]
```

### **SECONDARY NOTE: "Vy Memory - FB Integration"**
**Location:** Notes Desktop App (separate note)  
**Purpose:** Persistent memory across sessions - NEVER FORGET  
**Update:** Continuously as you learn  

**Structure:**
```markdown
# VY MEMORY - FACEBOOK INTEGRATION KNOWLEDGE BASE
Never Forget - Persistent Memory

## CRITICAL FACTS
- Replit Project: https://replit.com/@admin3304/MundoTango
- Facebook App ID: 1450658896233975
- Webhook Endpoint: /api/webhooks/facebook
- Verify Token: MUNDO_TANGO_VERIFY_TOKEN
- First Invite Target: sboddye@gmail.com

## SECRETS USED (Never show values, only names)
- FACEBOOK_PAGE_ACCESS_TOKEN (in Replit)
- FACEBOOK_VERIFY_TOKEN (in Replit)
- FACEBOOK_PAGE_ID (in Replit)

## WHAT WORKED
1. Webhook URL format: https://[replit-dev-domain]/api/webhooks/facebook
2. GET endpoint for verification responds with hub.challenge
3. POST endpoint for messages captures PSID from webhookEvent.sender.id
4. [Add more successful patterns]

## WHAT FAILED (And Why)
1. Initial attempt: [Problem] - Root cause: [Reason] - Solution: [Fix]
2. [Document all failures for learning]

## TOS COMPLIANCE DECISIONS
1. Action: Configure webhook via UI - Compliant: YES - Reason: One-time config change
2. Action: Add test user via App Roles - Compliant: YES - Reason: Facebook-provided feature
3. [Document all TOS checks]

## PATTERNS LEARNED
1. Facebook Developer Console structure: Apps → Products → Webhooks
2. Webhook verification flow: GET request → check token → return challenge
3. Message webhook flow: POST request → extract PSID → respond 200 OK
4. [Add patterns as discovered]

## NEVER FORGET
- Always verify webhook after configuration (use Test button)
- Always add test users to App Roles before sending messages
- Always check token permissions before using
- [Critical lessons learned]
```

---

## 🎯 YOUR COMPLETE MISSION PHASES

### **PHASE 1: INITIAL ASSESSMENT (10 min)**

#### Step 1.1: Understand Current State
1. **Read** this entire prompt (you're doing this now!)
2. **Open** Replit project: https://replit.com/@admin3304/MundoTango
3. **Check** what secrets already exist (click "Tools" → "Secrets" in Replit)
4. **Document** in Primary Note what you found

**TOS CHECK:** ✅ Reading and viewing = compliant

#### Step 1.2: Learn About Mundo Tango
1. **Read** docs/FACEBOOK_MESSENGER_KNOWLEDGE_BASE.md in Replit project
2. **Read** docs/FACEBOOK_OPEN_SOURCE_INTELLIGENCE.md in Replit project
3. **Understand** the messenger-node SDK approach (97% code reduction!)
4. **Document** key learnings in Memory Note

**TOS CHECK:** ✅ Reading documentation = compliant

#### Step 1.3: Set Up Your Workspace
1. **Open** Facebook Developer Console: https://developers.facebook.com/apps/1450658896233975
2. **Verify** user (Scott) is logged in
3. **Open** Replit project in another tab/window
4. **Create** Primary Note in Notes Desktop App
5. **Create** Memory Note in Notes Desktop App

**TOS CHECK:** ✅ Navigating logged-in dashboards = compliant

**DELIVERABLE:** Both Notes created, workspace ready, current state documented

---

### **PHASE 2: WEBHOOK CONFIGURATION (20 min)**

#### Step 2.1: Navigate to Webhook Settings
1. **Go to** Facebook Developer Console: https://developers.facebook.com/apps/1450658896233975
2. **Find** Products in left sidebar
3. **Look for** Messenger or Webhooks product
4. **Click** to configure

**If you don't see Webhooks:**
- Click "Add Product" or "+"
- Find "Webhooks" in product list
- Click "Set Up" or "Configure"

**TOS CHECK:** ✅ Navigating dashboard = compliant

#### Step 2.2: Get Replit Webhook URL
1. **Go to** Replit project: https://replit.com/@admin3304/MundoTango
2. **Find** the development URL (usually shown in webview or as REPLIT_DEV_DOMAIN)
3. **Copy** the full URL (e.g., https://e0001089-5956-480e-9ebc-7b1a6c2ec0e7-00-3cydblgjeyjzl.worf.replit.dev)
4. **Add** /api/webhooks/facebook to the end
5. **Full webhook URL:** https://[replit-domain]/api/webhooks/facebook

**TOS CHECK:** ✅ Copying URLs = compliant

**Document in Primary Note:**
```
Webhook URL: https://[exact-url-here]/api/webhooks/facebook
```

#### Step 2.3: Configure Webhook in Facebook
1. **In Facebook Developer Console**, find "Callback URL" field
2. **Paste** your webhook URL: https://[replit-domain]/api/webhooks/facebook
3. **In "Verify Token" field**, enter: `MUNDO_TANGO_VERIFY_TOKEN`
4. **Click** "Verify and Save" button

**Expected Result:** Green checkmark ✅ showing webhook verified successfully

**If verification fails:**
- **STOP** and investigate (don't just report failure)
- Check: Is Replit server running? (workflow should be running)
- Check: Is URL correct? (no typos, correct endpoint)
- Check: Is verify token correct? (case-sensitive)
- **Document** the problem in Primary Note
- **Fix** the issue
- **Retry** verification

**TOS CHECK:** ✅ Filling configuration form = compliant (one-time setup)

**Document in Primary Note:**
```
Webhook Configuration:
- URL: [exact URL]
- Verify Token: MUNDO_TANGO_VERIFY_TOKEN
- Status: ✅ VERIFIED / ❌ FAILED (if failed, document why)
```

**Take Screenshot:** webhook-verification-success.png

#### Step 2.4: Subscribe to Messages Webhook
1. **In Facebook Developer Console**, find "Webhook Fields" section
2. **Check the box** for "messages" field
3. **Click** "Save" or "Subscribe"
4. **Verify** "messages" shows as subscribed

**TOS CHECK:** ✅ Checking boxes in UI = compliant

**Document in Primary Note:**
```
Subscribed Webhook Fields:
- ✅ messages
```

**Take Screenshot:** webhook-subscriptions.png

**DELIVERABLE:** Webhook configured, verified, and subscribed to messages

---

### **PHASE 3: SECRET MANAGEMENT (15 min)**

#### Step 3.1: Verify Existing Secrets
1. **Go to** Replit project: https://replit.com/@admin3304/MundoTango
2. **Click** "Tools" → "Secrets" in left sidebar
3. **Check** which Facebook secrets exist:
   - FACEBOOK_PAGE_ACCESS_TOKEN
   - FACEBOOK_VERIFY_TOKEN
   - FACEBOOK_PAGE_ID
   - FACEBOOK_EMAIL
   - FACEBOOK_PASSWORD

**Document in Memory Note (names only, never values):**
```
Existing Secrets:
- FACEBOOK_PAGE_ACCESS_TOKEN: [EXISTS / MISSING]
- FACEBOOK_VERIFY_TOKEN: [EXISTS / MISSING]
- FACEBOOK_PAGE_ID: [EXISTS / MISSING]
```

**TOS CHECK:** ✅ Viewing secret names (not values) = compliant

#### Step 3.2: Add Missing Secrets (if any)
**Only if secret is missing:**

1. **For FACEBOOK_VERIFY_TOKEN:**
   - Click "Add new secret"
   - Name: `FACEBOOK_VERIFY_TOKEN`
   - Value: `MUNDO_TANGO_VERIFY_TOKEN`
   - Click "Add secret"

2. **For FACEBOOK_PAGE_ID:**
   - If missing, ask Mr Blue (Replit AI) to provide it
   - Add as new secret

**TOS CHECK:** ✅ Adding environment variables in Replit = compliant

**Document in Primary Note:**
```
Secrets Added:
- FACEBOOK_VERIFY_TOKEN: ✅ Added (value: MUNDO_TANGO_VERIFY_TOKEN)
- [List any others]
```

#### Step 3.3: Verify Page Access Token
1. **In Replit**, ask Mr Blue to run this command in Shell:
   ```bash
   curl -X GET "https://graph.facebook.com/v18.0/me?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}"
   ```

2. **Expected Response:**
   ```json
   {
     "name": "Mundo Tango",
     "id": "[page-id]"
   }
   ```

3. **If response shows error:**
   - Token is invalid or expired
   - Ask Scott to provide fresh Page Access Token
   - **STOP** this phase until valid token provided

**TOS CHECK:** ✅ API call to verify token = compliant (read-only)

**Document in Primary Note:**
```
Token Validation:
- Status: ✅ VALID / ❌ INVALID
- Page Name: Mundo Tango
- Page ID: [id-from-response]
```

**DELIVERABLE:** All secrets verified/added, token validated

---

### **PHASE 4: TEST WEBHOOK CONNECTION (15 min)**

#### Step 4.1: Ask Scott to Send Test Message
**In Primary Note, add:**
```
WAITING FOR USER ACTION:
Scott, please:
1. Open Facebook Messenger
2. Search for @mundotango1 (Mundo Tango page)
3. Send message: "test"
4. Wait for me to confirm PSID captured
```

**Then wait for Mr Blue to relay Scott's action**

**TOS CHECK:** ✅ Asking user to send message = compliant

#### Step 4.2: Monitor Replit Console for PSID
1. **In Replit**, view the console/logs (bottom panel)
2. **Look for** this output when Scott sends message:
   ```
   🎉 [Facebook Webhook] MESSAGE RECEIVED!
   ═══════════════════════════════════════════
   Sender PSID: 1234567890123456
   Message: test
   ═══════════════════════════════════════════
   ```

3. **Copy** the PSID (e.g., `1234567890123456`)

**If no output appears:**
- **Check** Replit workflow is running (should show "Start application: RUNNING")
- **Check** webhook is configured correctly
- **Check** Scott sent message to correct page (@mundotango1)
- **Ask Mr Blue** to help debug

**TOS CHECK:** ✅ Viewing console logs = compliant

**Document in Primary Note:**
```
Test Message Results:
- Scott sent: "test"
- PSID captured: [1234567890123456]
- Timestamp: [when message received]
- Status: ✅ SUCCESS
```

**DELIVERABLE:** PSID successfully captured from webhook

---

### **PHASE 5: ADD TEST USER (10 min)**

#### Step 5.1: Navigate to App Roles
1. **In Facebook Developer Console**, find "Roles" in left sidebar
2. **Click** "Roles"
3. **Find** "Testers" section

**TOS CHECK:** ✅ Navigating dashboard = compliant

#### Step 5.2: Add sboddye@gmail.com as Tester
1. **Click** "Add Testers" button
2. **Enter** email: `sboddye@gmail.com`
3. **Click** "Submit" or "Add"
4. **Verify** sboddye@gmail.com appears in Testers list

**Expected Result:** Email shows as "Pending" (user must accept)

**TOS CHECK:** ✅ Adding test user via Facebook UI = compliant (intended feature)

**Document in Primary Note:**
```
Test User Added:
- Email: sboddye@gmail.com
- Status: Pending acceptance
- Purpose: Receive first Mundo Tango invitation
```

**Take Screenshot:** test-user-added.png

**DELIVERABLE:** sboddye@gmail.com added as Tester

---

### **PHASE 6: PREPARE INVITATION MESSAGE (15 min)**

#### Step 6.1: Review AI Invitation Generator
1. **In Replit**, read: `server/services/facebook/AIInviteGenerator.ts`
2. **Understand** how personalized invitations work
3. **Note** the context-aware approach (kept as unique value)

**TOS CHECK:** ✅ Reading source code = compliant

#### Step 6.2: Ask Mr Blue to Generate Test Invitation
**In Primary Note, add:**
```
REQUEST FOR MR BLUE:
Please generate a test invitation for sboddye@gmail.com using AIInviteGenerator.
Target length: 100-150 words
Include: Scott's voice, platform stats, authentic Mundo Tango mission
```

**Wait for Mr Blue to provide message**

#### Step 6.3: Review and Approve Message
1. **Read** the generated invitation message
2. **Check** it includes:
   - Personalized greeting
   - Scott's authentic voice
   - Mundo Tango mission (reverse social media negative impacts)
   - Platform stats (if available)
   - Call to action (join the community)

**TOS CHECK:** ✅ Reviewing AI-generated content = compliant

**Document in Primary Note:**
```
Generated Invitation Message:
[Paste full message here]

Review:
- Length: [word count]
- Tone: Authentic/Professional/Casual
- Mission mentioned: YES/NO
- Approval: ✅ APPROVED / ❌ NEEDS REVISION
```

**DELIVERABLE:** Invitation message reviewed and approved (or revised)

---

### **PHASE 7: SEND FIRST INVITATION (10 min)**

#### Step 7.1: Get Approval from Mr Blue
**In Primary Note, add:**
```
READY TO SEND INVITATION:
To: sboddye@gmail.com
PSID: [captured-psid]
Message: [approved-message]

WAITING FOR APPROVAL:
Mr Blue, please confirm:
1. Message approved ✅
2. PSID correct ✅
3. Ready to send ✅
```

**Wait for Mr Blue confirmation**

**TOS CHECK:** ✅ Getting approval before sending = compliant

#### Step 7.2: Ask Mr Blue to Send Invitation
**Once approved:**
```
REQUEST FOR MR BLUE:
Please run this command in Replit Shell:

npx tsx scripts/send-invitation-direct.ts \
  ${FACEBOOK_PAGE_ACCESS_TOKEN} \
  [captured-psid]

This will send the approved invitation to sboddye@gmail.com.
```

**TOS CHECK:** ✅ Asking Mr Blue to execute command = compliant (user approval obtained)

#### Step 7.3: Verify Send Success
1. **Check** Mr Blue's response for success/error
2. **If successful**, look for messageId in response
3. **If error**, document error code and investigate

**Document in Primary Note:**
```
Invitation Send Results:
- Status: ✅ SUCCESS / ❌ FAILED
- Message ID: [facebook-message-id]
- Recipient PSID: [psid]
- Timestamp: [when sent]
- Error (if any): [error details]
```

**Take Screenshot:** invitation-sent-confirmation.png (if possible)

**DELIVERABLE:** First Mundo Tango invitation sent successfully!

---

### **PHASE 8: FINAL VERIFICATION (10 min)**

#### Step 8.1: Create Verification Checklist
**In Primary Note, add:**
```
FINAL VERIFICATION CHECKLIST:

Webhook Configuration:
- ✅ Webhook URL configured in Facebook
- ✅ Verify token set correctly
- ✅ Webhook verified (green checkmark)
- ✅ Subscribed to "messages" field
- ✅ Test message received from Scott
- ✅ PSID captured successfully

Secret Management:
- ✅ FACEBOOK_PAGE_ACCESS_TOKEN exists
- ✅ FACEBOOK_VERIFY_TOKEN exists
- ✅ FACEBOOK_PAGE_ID exists
- ✅ Token validated via /me endpoint

Test User:
- ✅ sboddye@gmail.com added as Tester
- ✅ Status: Pending acceptance

Invitation:
- ✅ Message generated by AIInviteGenerator
- ✅ Message reviewed and approved
- ✅ Invitation sent successfully
- ✅ Message ID received from Facebook
- ✅ No errors in send response

Screenshots Taken:
- ✅ webhook-verification-success.png
- ✅ webhook-subscriptions.png
- ✅ test-user-added.png
- ✅ invitation-sent-confirmation.png
```

**TOS CHECK:** ✅ Creating verification checklist = compliant

#### Step 8.2: Update Memory Note with Final Learnings
**In Memory Note, add section:**
```
FINAL LEARNINGS FROM THIS MISSION:

What Worked Perfectly:
1. [List successful approaches]
2. [Patterns to reuse]

What Was Challenging:
1. [Problems encountered]
2. [How you solved them]

What You'd Do Differently Next Time:
1. [Improvements for future missions]

Critical Knowledge for Future Agents:
1. Facebook webhook verification requires HTTPS
2. PSID is captured from webhookEvent.sender.id
3. [Add more critical facts]
```

**DELIVERABLE:** Complete verification checklist, updated Memory Note

---

## 📊 FINAL DELIVERABLE TO MR BLUE

**In Primary Note, create this section:**

```markdown
═══════════════════════════════════════════════════════════
FINAL DELIVERABLE TO MR BLUE (REPLIT AI)
═══════════════════════════════════════════════════════════

## MISSION STATUS: ✅ COMPLETE / ⚠️ PARTIAL / ❌ BLOCKED

## EXECUTIVE SUMMARY
Total Time: [X minutes]
Phases Completed: [X/8]
Success Rate: [X%]
Quality Score: [95-99/100]

## WHAT WAS ACCOMPLISHED

### Webhook Configuration (Phase 2)
✅ Webhook URL configured: https://[replit-url]/api/webhooks/facebook
✅ Verify token set: MUNDO_TANGO_VERIFY_TOKEN
✅ Webhook verified successfully (green checkmark)
✅ Subscribed to "messages" field
✅ Screenshot: webhook-verification-success.png

### Secret Management (Phase 3)
✅ FACEBOOK_PAGE_ACCESS_TOKEN: Verified valid
✅ FACEBOOK_VERIFY_TOKEN: Added/verified
✅ FACEBOOK_PAGE_ID: [page-id]
✅ Token validation test passed

### Webhook Testing (Phase 4)
✅ Scott sent test message to @mundotango1
✅ PSID captured: [1234567890123456]
✅ Webhook POST endpoint working correctly
✅ Console logs showing message receipt

### Test User Setup (Phase 5)
✅ sboddye@gmail.com added as Tester
✅ Status: Pending acceptance
✅ Screenshot: test-user-added.png

### Invitation Generation (Phase 6)
✅ AIInviteGenerator reviewed
✅ Test invitation generated for sboddye@gmail.com
✅ Message approved (100-150 words, Scott's voice)
✅ Mission messaging included

### First Invitation Sent (Phase 7)
✅ Invitation sent successfully
✅ Message ID: [facebook-message-id]
✅ Recipient PSID: [psid]
✅ No errors in response
✅ Screenshot: invitation-sent-confirmation.png

## WHAT I LEARNED (For Future Agents)

### Technical Discoveries:
1. Facebook webhook verification flow: GET → validate token → return challenge
2. PSID capture location: webhookEvent.sender.id
3. Webhook URL must be HTTPS (Replit provides this automatically)
4. Verify token is case-sensitive

### Process Insights:
1. Always verify webhook immediately after configuration
2. Test message before sending real invitations
3. Add test users to App Roles before sending
4. Use messenger-node SDK for 97% code reduction (already implemented)

### TOS Compliance Decisions:
1. All actions taken were compliant with Vercept + Facebook TOS
2. No automated form submissions at scale (only one-time configuration)
3. User approval obtained before sending invitation
4. No prohibited actions taken

## SCREENSHOTS PROVIDED
1. webhook-verification-success.png - Green checkmark showing webhook verified
2. webhook-subscriptions.png - Messages field subscribed
3. test-user-added.png - sboddye@gmail.com in Testers list
4. invitation-sent-confirmation.png - Success message from send

## BLOCKERS ENCOUNTERED (If Any)
[List any issues that required Mr Blue intervention]
[OR: None - mission completed autonomously]

## RECOMMENDATIONS FOR MR BLUE

### Immediate Next Steps:
1. Verify invitation received in sboddye@gmail.com's Messenger
2. Monitor webhook for additional messages
3. Prepare for scaled invitations (rate limiting already implemented)

### Production Readiness:
✅ Webhook configured and tested
✅ PSID capture working
✅ Invitation sending working
✅ Rate limiting in place (5 invites/day, 1/hour per user)
⚠️ Consider: Monitoring dashboard for webhook health
⚠️ Consider: Alert system for failed invitation sends

### Future Improvements:
1. Add webhook health check endpoint
2. Create admin dashboard for invitation monitoring
3. Implement invitation response tracking
4. Add analytics for message open rates (if Facebook provides)

## SECRETS LOCATION
All secrets stored in Replit project: https://replit.com/@admin3304/MundoTango
- FACEBOOK_PAGE_ACCESS_TOKEN (valid, tested)
- FACEBOOK_VERIFY_TOKEN (MUNDO_TANGO_VERIFY_TOKEN)
- FACEBOOK_PAGE_ID ([page-id])

## DOCUMENTATION CREATED
1. Primary Note: "Mundo Tango - Facebook Integration Work" (this document)
2. Memory Note: "Vy Memory - FB Integration" (persistent knowledge base)
3. All learnings captured for future agents

## COMPLIANCE VERIFICATION
✅ All TOS compliance checks passed
✅ No prohibited actions taken
✅ User approval obtained for critical actions (sending invitation)
✅ No automated abuse or ToS violations

## MISSION IMPACT
🎉 **First Mundo Tango invitation sent via Facebook Messenger!**
🎯 Target: sboddye@gmail.com
📊 Platform ready for autonomous invitations
🌍 One step closer to reversing social media's negative impacts

═══════════════════════════════════════════════════════════
END OF DELIVERABLE - MISSION COMPLETE
═══════════════════════════════════════════════════════════

Mr Blue, the Facebook Messenger integration is ready for production.
You now have:
- Working webhook (verified and tested)
- Valid Page Access Token
- First invitation sent successfully
- All documentation for future work

Next steps are in your hands! 🚀
```

---

## 🚨 ERROR HANDLING & TROUBLESHOOTING

### **If Webhook Verification Fails:**

**Problem:** Facebook shows red X instead of green checkmark

**Troubleshooting Steps:**
1. **Check** Replit workflow is running (bottom panel shows "Start application: RUNNING")
2. **Verify** webhook URL has no typos
3. **Verify** verify token is exactly: `MUNDO_TANGO_VERIFY_TOKEN` (case-sensitive)
4. **Test** webhook GET endpoint manually:
   ```
   https://[replit-url]/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=MUNDO_TANGO_VERIFY_TOKEN&hub.challenge=test123
   ```
   Should return: `test123`
5. **Check** Replit console for errors
6. **Document** the problem in Primary Note
7. **Ask** Mr Blue for help if still failing

**TOS CHECK:** ✅ Troubleshooting = compliant

---

### **If PSID Not Captured:**

**Problem:** Scott sent message but console shows nothing

**Troubleshooting Steps:**
1. **Verify** Scott messaged the correct page (@mundotango1)
2. **Check** webhook is subscribed to "messages" field
3. **Check** Replit console/logs for any errors
4. **Verify** webhook POST endpoint is working:
   - Look for route: `router.post("/facebook", ...)`
   - Check server/routes/webhooks.ts exists
5. **Ask** Mr Blue to check webhook code

**TOS CHECK:** ✅ Troubleshooting = compliant

---

### **If Invitation Send Fails:**

**Problem:** Error when sending invitation

**Common Errors:**
- **#368 (Blocked):** User blocked the page → Cannot send, skip this user
- **#551 (User not found):** PSID invalid → Verify PSID is correct
- **#200 (Permission denied):** Token lacks permissions → Get fresh token with `pages_messaging` permission

**Troubleshooting Steps:**
1. **Check** error code in response
2. **Google** the error code: "Facebook Messenger error #368"
3. **Document** error and solution in Memory Note
4. **Ask** Mr Blue if you need token refreshed

**TOS CHECK:** ✅ Troubleshooting = compliant

---

## 🎯 SUCCESS CRITERIA

**Mission is considered COMPLETE when:**

✅ **All 8 Phases Completed:**
1. Initial Assessment ✅
2. Webhook Configuration ✅
3. Secret Management ✅
4. Test Webhook Connection ✅
5. Add Test User ✅
6. Prepare Invitation ✅
7. Send First Invitation ✅
8. Final Verification ✅

✅ **Technical Verification:**
- Webhook verified (green checkmark in Facebook)
- PSID captured from test message
- Invitation sent successfully (messageId received)
- All secrets exist and validated

✅ **Documentation Complete:**
- Primary Note has all phases documented
- Memory Note has all learnings captured
- Final Deliverable section completed
- Screenshots taken and referenced

✅ **Quality Standard Met:**
- 95-99/100 quality score
- No TOS violations
- No blockers remaining
- All verification checks passed

✅ **Deliverable to Mr Blue:**
- Final report created in Primary Note
- All learnings documented
- Next steps recommended
- Screenshots provided

---

## 🌟 REMEMBER: YOU'RE NOT JUST CONFIGURING A WEBHOOK

**You're enabling a mission to change the world.**

Every action you take is documented in Scott's journey - this will be in his book about building Mundo Tango. Work with:
- **Pride** in the mission
- **Precision** in execution (95-99/100 quality)
- **Persistence** in problem-solving (recursive, not surface-level)
- **Parallelism** in workflow (simultaneous execution)
- **Prudence** in compliance (TOS checks before every action)

**Make every action count. Document everything. Learn continuously. Deliver excellence.**

🚀 **LET'S ENABLE THE FIRST MUNDO TANGO INVITATION AND CHANGE THE WORLD!** 🌍

---

**Estimated Total Time:** 60-90 minutes  
**Difficulty:** Medium (requires attention to detail, TOS compliance, documentation)  
**Success Rate:** Very High (with proper TOS checks and systematic approach)  
**Impact:** WORLD-CHANGING (enables Mundo Tango's mission to reverse social media negative impacts)

---

## 📞 SUPPORT CONTACTS

**If You Need Help:**
- **Mr Blue (Replit AI):** Available in Replit project chat for technical questions
- **Scott Boddye:** Available for Facebook credentials, approvals, clarifications
- **Facebook Developer Support:** https://developers.facebook.com/support/ (for Facebook-specific issues)
- **Vercept Support:** For Vy-specific technical issues

**Never stuck - always ask for help when needed!**

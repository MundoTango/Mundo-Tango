# MB.MD-VY: Vercept Execution Protocol
**Version:** 1.0 (Derived from MB.MD v8.2)  
**Created:** November 17, 2025  
**Purpose:** Guide Vy (Vercept AI) to complete Facebook token refresh mission  
**Mission:** Enable Mundo Tango platform to send first invite via Facebook Messenger

---

## 🌍 THE MISSION

**Mundo Tango** is Scott's mission to reverse the negative impacts of social media silos and change the world. This Facebook integration is the first step in connecting authentic communities globally.

**Your Role:** Help refresh Facebook token and complete the invite system so Scott can send the first invitation to sboddye@gmail.com, marking the beginning of Mundo Tango's journey.

---

## 🎯 CORE METHODOLOGY: SIMULTANEOUSLY, RECURSIVELY, CRITICALLY

### SIMULTANEOUSLY
- Execute multiple tasks in parallel when possible
- Don't wait for one task to finish if you can start another
- Example: While waiting for Facebook page to load, prepare next steps

### RECURSIVELY  
- Go deep, not surface-level
- If token validation fails, investigate WHY (expired? wrong permissions? wrong app?)
- Don't just report errors - understand and solve them

### CRITICALLY
- Verify every step before moving to next
- After updating Replit secret, TEST it immediately
- After generating token, VERIFY it's the full token (not truncated)
- Quality standard: 95-99/100

---

## ✅ VERIFICATION PROTOCOL (MANDATORY CHECKPOINTS)

**NEVER proceed to next phase without verifying current phase:**

### Checkpoint 1: Token Generation
- ✅ Token copied to clipboard (100+ characters)
- ✅ Token starts with EAA or EAAG
- ✅ No spaces or line breaks in token
- **VERIFY:** Paste into text editor and count characters (should be ~180+ chars)

### Checkpoint 2: Replit Secret Update
- ✅ Secret exists in Replit with name FACEBOOK_PAGE_ACCESS_TOKEN
- ✅ Secret shows masked value (dots)
- **VERIFY:** Ask Replit AI to confirm secret exists (don't ask for value, just existence)

### Checkpoint 3: Token Validation
- ✅ Validation endpoint returns 200 OK
- ✅ Response shows "isValid": true
- ✅ appId matches Mundo Tango app
- **VERIFY:** Read the full JSON response, don't just check status code

### Checkpoint 4: Invite Generation
- ✅ Message generated for sboddye@gmail.com
- ✅ Message is 100-150 words
- ✅ Message includes Scott's authentic voice
- ✅ Message includes platform stats (226+ events, 95 cities)
- **VERIFY:** Read entire message before approving

### Checkpoint 5: Send Success
- ✅ Facebook returns messageId
- ✅ No error codes (especially not #368, #551)
- ✅ Rate limit usage <75%
- **VERIFY:** Confirm messageId is returned in response

### Checkpoint 6: E2E Test Pass
- ✅ Playwright test completes without errors
- ✅ Screenshots show invite in Messenger
- ✅ Screenshots show Mundo Tango platform
- ✅ Screenshots show logged-in state
- **VERIFY:** Open /tmp/screenshots/ and review all images

---

## 🔮 SELF-HEALING FIRST

**If something fails, FIX IT before reporting:**

### Common Issues & Auto-Fixes

**Problem:** Token appears truncated when pasted
- **Auto-Fix:** Clear clipboard, re-copy from Facebook, verify full length
- **Verify:** Count characters in text editor

**Problem:** Replit secret update doesn't take effect
- **Auto-Fix:** Restart workflow (npm run dev), wait 5 seconds, retry validation
- **Verify:** Check logs for "token not configured" error disappears

**Problem:** Validation returns 400 or 401
- **Auto-Fix:** Check if token is for correct Facebook Page (not User token)
- **Verify:** Token should be "Page Access Token" not "User Access Token"

**Problem:** Mundo Tango app doesn't exist in Facebook Developers
- **Auto-Fix:** Create new app (Business type), add Messenger product, generate token
- **Verify:** App appears in dashboard with Messenger enabled

**Problem:** Playwright test fails to find elements
- **Auto-Fix:** Run test in headed mode to see what's happening visually
- **Verify:** Check if Facebook requires 2FA (may need manual intervention)

**ONLY report to Scott if:**
- Issue requires Facebook credentials you don't have
- Facebook requires 2FA and manual code entry
- Replit AI encounters error it can't solve after 3 attempts

---

## 📊 PROGRESS TRACKING

**Report progress to Scott every 5 minutes:**

```
🔄 PROGRESS UPDATE: X% COMPLETE

Current Phase: [Token Generation / Secret Update / Validation / etc.]
Status: [In Progress / Blocked / Complete]
Next Step: [What you're about to do]
ETA: [X minutes remaining]

Issues: [None / List any blockers]
Auto-Fixed: [Any issues you resolved yourself]
```

**Progress Milestones:**
- 0% - Starting
- 20% - Facebook token generated
- 40% - Replit secret updated
- 60% - Token validated successfully
- 70% - Invite message generated
- 80% - sboddye added as Tester
- 95% - Invite sent to Facebook
- 100% - E2E test passed, screenshots verified

---

## 🎯 THE PLAN: CONSTANT LEARNING

**After each task, ask yourself:**

1. **What did I learn?**
   - Example: "Facebook tokens expire every 60 days - need to set reminder"
   - Example: "Replit secrets require workflow restart to take effect"

2. **What could go wrong next time?**
   - Example: "Token might have wrong permissions - check scopes first"
   - Example: "Clipboard might truncate long tokens - always paste into editor first"

3. **How can I do this faster next time?**
   - Example: "Save Facebook Developers URL as bookmark"
   - Example: "Create script to automate token validation"

**Log learnings** by asking Replit AI to save them:
```
"Log this learning to Scott's Journey Recording system: [your insight]"
```

---

## 🤝 HUMAN CONFIRMATION POINTS

**You MUST get Scott's approval for:**

### CRITICAL DECISIONS (Stop and Ask)
- ❌ Creating new Facebook app (if Mundo Tango doesn't exist)
- ❌ Sending invite message (show message first, wait for approval)
- ❌ Running destructive operations (deleting anything)

### AUTO-PROCEED (No Approval Needed)
- ✅ Copying token from Facebook
- ✅ Updating Replit secret
- ✅ Running validation tests
- ✅ Generating invite message (just SHOW it, don't send)
- ✅ Running Playwright tests
- ✅ Taking screenshots

**When in doubt: Show Scott what you're about to do, wait for "proceed" or "go ahead"**

---

## 🔒 SAFETY PROTOCOLS

### What You're ALLOWED to Do
- ✅ Navigate to Facebook Developers Console (developers.facebook.com)
- ✅ Generate new Page Access Token for Mundo Tango page
- ✅ Copy and paste tokens into Replit Secrets
- ✅ Run read-only API calls (validation, verification)
- ✅ Interact with Replit AI to execute commands
- ✅ Run automated tests
- ✅ Take screenshots for verification

### What You're NOT ALLOWED to Do
- ❌ Delete any Facebook apps or pages
- ❌ Change app settings without Scott's approval
- ❌ Send messages to anyone except sboddye@gmail.com (and only after approval)
- ❌ Share tokens publicly or in insecure channels
- ❌ Create new Facebook pages
- ❌ Modify database schemas

**If asked to do something not allowed: Stop and ask Scott first**

---

## 📖 SCOTT'S JOURNEY RECORDING

**After completion, tell Replit AI to record:**

```
Record this journey entry:

Title: "First Facebook Messenger Invite - Vy Automation"
Category: milestone
Content: "Successfully automated Facebook token refresh using Vy (Vercept). 
Generated token, updated Replit secrets, validated connection, generated AI 
invite for sboddye@gmail.com, ran E2E tests. All phases complete.

Learnings: [list what you learned]
Challenges: [list any issues you overcame]
Time: [total time taken]
Screenshots: /tmp/screenshots/"

Tags: facebook, automation, vercept, milestone, messenger-integration
Significance: 9/10
```

This will be saved for Scott's book about building Mundo Tango.

---

## ⚡ OPTIMIZATION PROTOCOL

### Speed
- Use keyboard shortcuts when possible
- Don't read entire pages - scan for what you need
- Use CMD+F to find text quickly
- Open multiple tabs if needed (but don't lose track)

### Efficiency
- Copy-paste long URLs instead of typing
- Use autofill for forms when available
- Bookmark frequently-used pages
- Keep Replit and Facebook Developers in separate tabs

### Memory
- Don't keep unnecessary tabs open
- Close completed tasks
- Clear clipboard after sensitive operations
- Take screenshots instead of trying to remember

### Cost
- This mission uses free Vy tier
- Replit AI usage is already paid for
- No additional costs expected

---

## 🚨 ERROR HANDLING

### When Things Go Wrong

**Level 1 Errors (Auto-Fix):**
- Token validation fails → Re-copy token, check for spaces
- Replit secret not updating → Restart workflow
- Page won't load → Refresh, clear cache
- **Action:** Fix it yourself, log the fix, continue

**Level 2 Errors (Retry 3x):**
- API returns unexpected error → Retry with different approach
- Playwright test flaky → Run again in headed mode
- Replit AI not responding → Refresh page, retry
- **Action:** Try 3 different approaches before escalating

**Level 3 Errors (Ask Scott):**
- Facebook requires 2FA and you need code
- Credentials needed (password for sboddye@gmail.com)
- App doesn't exist and you need to create it
- **Action:** Stop, report to Scott with context, wait for guidance

**Error Report Template:**
```
🚨 NEED HELP - Level 3 Error

Task: [what you were doing]
Error: [exact error message]
What I tried: [3 things you attempted]
What I need: [specific help needed from Scott]
Impact: [can you continue other tasks or completely blocked?]
```

---

## 🎬 FINAL DELIVERABLE

**Before reporting "100% Complete", verify ALL of these:**

1. ✅ Facebook Page Access Token is valid (tested via /validate-token endpoint)
2. ✅ Token stored in Replit secret FACEBOOK_PAGE_ACCESS_TOKEN
3. ✅ Connection test passed (Facebook /me endpoint returns page info)
4. ✅ Rate limit usage <75% (checked via headers)
5. ✅ Invite message generated for sboddye@gmail.com (100-150 words, Scott's voice)
6. ✅ Scott approved the invite message
7. ✅ sboddye@gmail.com added as Tester in Facebook App
8. ✅ Invite sent successfully (messageId returned)
9. ✅ Playwright E2E test passed (all 3 parts: A, B, C)
10. ✅ Screenshots exist in /tmp/screenshots/ showing:
    - Facebook Messenger with invite received
    - Mundo Tango platform landing page
    - Logged-in dashboard with scott@boddye.com
    - Progress bar visible at bottom of screen

**Then provide this summary to Scott:**

```
✅ MISSION COMPLETE - 100%

Total Time: [X minutes]
Phases Completed: 6/6
Tests Passed: All
Issues Auto-Fixed: [number]
Screenshots: [number] files in /tmp/screenshots/

Journey Recorded: ✅
Learnings Logged: ✅
Ready for Production: ✅

Next Steps: Scott can now send invites to real users!
```

---

## 🌟 SUCCESS MANTRA

**Remember:**
1. **Work simultaneously** (parallel tasks when possible)
2. **Work recursively** (go deep, understand root causes)
3. **Work critically** (verify everything, 95-99/100 quality)
4. **Self-heal first** (fix issues before reporting)
5. **Verify at checkpoints** (never skip validation)
6. **Record the journey** (log learnings for Scott's book)
7. **Get approval for critical actions** (sending messages, creating apps)
8. **Optimize everything** (speed, efficiency, memory, cost)

**You're not just refreshing a token - you're enabling Mundo Tango's mission to change the world. Make it count! 🌍**

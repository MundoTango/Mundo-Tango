# 🚨 SEND FIRST MUNDO TANGO INVITATION - IMMEDIATE ACTION REQUIRED

**Status:** All code ready, 1 blocker found  
**Time to fix:** 5 minutes  
**Root cause:** Facebook Page Access Token expired Nov 12, 2025

---

## ❌ BLOCKER IDENTIFIED

```
Error validating access token: Session has expired on Wednesday, 12-Nov-25 00:00:00 PST.
The current time is Monday, 17-Nov-25 13:38:53 PST.
```

**Your `FACEBOOK_PAGE_ACCESS_TOKEN` in Replit Secrets is expired.**

---

## ✅ THE FIX (5 Minutes)

### **Option A: Graph API Explorer (Easiest)**

1. **Go to:** https://developers.facebook.com/tools/explorer/

2. **Select Mundo Tango app:**
   - Top right: "Meta App" dropdown → "Mundo Tango"

3. **Get Page Token:**
   - Click "Generate Access Token" dropdown
   - Select "Get Page Access Token"
   - Choose "@mundotango1" page
   - Check these permissions:
     ✅ pages_messaging
     ✅ pages_manage_metadata  
     ✅ pages_read_engagement
   - Click "Generate Access Token"

4. **Copy the token** (starts with `EAAX...`)

5. **Update Replit Secret:**
   - Go to Replit Secrets panel (🔐 icon in left sidebar)
   - Find `FACEBOOK_PAGE_ACCESS_TOKEN`
   - Click Edit (✏️ icon)
   - Paste new token
   - Click "Save"

6. **Done!** Token is now valid for 60-90 days.

---

### **Option B: Quick Script (If you prefer automation)**

I can create a script to exchange a short token for a long-lived one, but you still need to get the short token from Graph Explorer first (Steps 1-4 above).

---

## 🚀 ONCE TOKEN IS UPDATED (30 seconds)

### **Method 1: If you know your PSID**

```bash
# Add your PSID to secrets:
# Key: SCOTT_FACEBOOK_PSID
# Value: <your psid>

# Then run:
npx tsx scripts/send-first-invitation.ts
```

### **Method 2: If you don't know your PSID (recommended)**

```bash
# Step 1: Send "Hello" to @mundotango1 on Facebook
# Go to: https://www.facebook.com/mundotango1
# Click "Send Message"
# Type: "Hello"
# Send

# Step 2: Check Replit console logs for your PSID
# It will show: [Webhook] Message received: { sender: 'XXXXXXXXX', ... }
# The number is your PSID

# Step 3: Add PSID to Replit Secrets
# Key: SCOTT_FACEBOOK_PSID
# Value: <the number from step 2>

# Step 4: Send invitation
npx tsx scripts/send-first-invitation.ts
```

---

## 📊 WHAT YOU'LL RECEIVE

Once sent, you'll get in Facebook Messenger:

**Message 1: Personalized AI Invitation**
```
¡Hola Scott! 🎵

This is Scott from Mundo Tango - I'm building something incredible 
and I want YOU to be part of it.

**What is Mundo Tango?**
The world's first AI-powered global tango community platform. 
Think "The Anti-Facebook" - authentic connections, not algorithms 
for ad revenue.

[... full invitation text ...]

Con abrazo,
Scott Boddye
Founder, Mundo Tango
admin@mundotango.life
```

**Message 2: Rich Template with Buttons**
- Image: Tango dancers
- Button 1: "Create Account" → mundotango.life/register
- Button 2: "Learn More" → mundotango.life  
- Button 3: "Ask Me Anything" → Start conversation

---

## 🎯 COMPLETE CHECKLIST

Before running `send-first-invitation.ts`:

- [ ] Valid `FACEBOOK_PAGE_ACCESS_TOKEN` in Replit Secrets (NOT expired)
- [ ] `SCOTT_FACEBOOK_PSID` in Replit Secrets (or complete Method 2 above)
- [ ] Workflow running (check top-right of Replit)

Then:
```bash
npx tsx scripts/send-first-invitation.ts
```

---

## 🆘 IF IT STILL DOESN'T WORK

Run diagnostics:
```bash
# Test token validity:
npx tsx scripts/get-scott-psid.ts

# Check environment:
env | grep FACEBOOK
```

---

## ⏱️ TIME ESTIMATES

- Get new token (Option A): 3 minutes
- Get your PSID (Method 2): 2 minutes
- Send invitation: 30 seconds

**Total: ~5 minutes to first send** 🚀

---

**Let's send this invitation and make history!** 🎉

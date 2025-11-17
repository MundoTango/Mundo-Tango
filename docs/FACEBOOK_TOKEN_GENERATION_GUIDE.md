# Facebook Page Access Token - Step-by-Step Guide
**For:** Mundo Tango Facebook Messenger Integration  
**Goal:** Generate valid 60-90 day token to send first invitation

---

## 🎯 QUICK START (5 Minutes)

### **Critical Understanding**
- **App ID:** 1450658896233975 (Mundo Tango)
- **Page ID:** 344494235403137 (@mundotango1)
- **Current Status:** Token expired Nov 12, 2025
- **Blocker:** Messenger product not visible in app (app configuration issue)

---

## 📋 METHOD 1: Graph API Explorer (RECOMMENDED - When Messenger Product is Added)

### **Step 1: Navigate to Graph API Explorer**
```
https://developers.facebook.com/tools/explorer/
```

### **Step 2: Select Mundo Tango App**
- Top right dropdown: Select **"Mundo Tango"** (App ID: 1450658896233975)
- Click **"Get User Access Token"** dropdown
- Select **"Get Page Access Token"**

### **Step 3: Select @mundotango1 Page**
- A list of your pages will appear
- Select **"@mundotango1"** (Page ID: 344494235403137)

### **Step 4: Grant Permissions**
Check these permissions:
- ✅ `pages_messaging` - Send/receive messages
- ✅ `pages_manage_metadata` - Subscribe webhooks
- ✅ `pages_read_engagement` - Read user data

**Click "Generate Access Token"**

### **Step 5: Copy the Token**
- Token will appear in "Access Token" field
- Starts with `EAAX...`
- Copy it immediately (it expires in 1 hour!)

### **Step 6: Exchange for Long-Lived Token**
```bash
# Paste the short token when prompted
npx tsx scripts/exchange-facebook-token.ts
```

This will:
- Validate the short token
- Exchange for 60-90 day token
- Save to Replit Secrets automatically
- Show expiration date

**✅ DONE!** You now have a valid token for 60-90 days.

---

## 🚨 METHOD 2: Manual Token Exchange (If Graph Explorer Fails)

### **Step 1: Get Short-Lived Token**
Use Graph API Explorer (Method 1, Steps 1-5)

### **Step 2: Exchange Via curl**
```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?\
  grant_type=fb_exchange_token&\
  client_id=1450658896233975&\
  client_secret=YOUR_APP_SECRET&\
  fb_exchange_token=SHORT_LIVED_TOKEN"
```

**Replace:**
- `YOUR_APP_SECRET`: Get from https://developers.facebook.com/apps/1450658896233975/settings/basic/
- `SHORT_LIVED_TOKEN`: The token from Graph Explorer

### **Step 3: Extract Long-Lived Token**
Response will be:
```json
{
  "access_token": "EAAX...",
  "token_type": "bearer"
}
```

### **Step 4: Add to Replit Secrets**
1. Go to Replit Secrets panel (🔐 icon)
2. Add new secret:
   - Key: `FACEBOOK_PAGE_ACCESS_TOKEN`
   - Value: `EAAX...` (the long-lived token)
3. Click "Add Secret"

---

## ⚠️ TROUBLESHOOTING

### **Error: "Invalid Scopes: manage_pages, pages_show_list"**

**Root Cause:** Messenger product not added to app

**Solution:**
1. Go to: https://developers.facebook.com/apps/1450658896233975/add/
2. Look for **"Messenger"** tile
3. Click **"Set Up"**

**If Messenger tile is missing:**
- App type might be "Consumer" instead of "Business"
- Messenger use case not configured
- Contact Facebook Developer Support

---

### **Error: "Session has expired"**

**Cause:** Token is older than expiration date

**Solution:** Generate new token (repeat Method 1)

---

### **Error: "Invalid OAuth 2.0 Access Token"**

**Causes:**
1. Token copied incorrectly (missing characters)
2. Token from wrong app/page
3. Permissions not granted

**Solution:**
- Regenerate token carefully
- Verify app/page selection
- Check all 3 permissions are checked

---

### **Error: "(#200) Requires pages_messaging permission"**

**Cause:** Permission not granted during token generation

**Solution:**
- Regenerate token
- Ensure `pages_messaging` is checked BEFORE clicking Generate

---

## 🔍 VERIFY TOKEN IS VALID

### **Option 1: Use Validation Script**
```bash
npx tsx scripts/facebook-validate-token.ts
```

### **Option 2: Manual curl**
```bash
curl -X GET "https://graph.facebook.com/v18.0/me?\
  access_token=YOUR_TOKEN"
```

Should return:
```json
{
  "name": "@mundotango1",
  "id": "344494235403137"
}
```

---

## 📊 TOKEN TYPES EXPLAINED

| Type | Lifespan | Use | How to Get |
|------|----------|-----|------------|
| **User Access** | 1-2 hours | Personal FB actions | Facebook Login |
| **Page Access (short)** | 1 hour | Quick testing | Graph API Explorer |
| **Page Access (long)** | 60-90 days | **PRODUCTION** ✅ | Exchange short token |
| **Permanent** | Never expires | Enterprise only | Special request |

**For Mundo Tango:** We need **Page Access (long)**

---

## 🎯 READY TO SEND FIRST INVITATION?

Once token is valid:

```bash
# Set Scott's PSID (he needs to message @mundotango1 first to get it)
# Then run:
npx tsx scripts/send-first-invitation.ts
```

This will send:
1. Personalized invitation text
2. Rich template with buttons
3. Auto-track delivery

---

## 🆘 STILL STUCK?

### **Check These:**

1. **App Status:**
   ```
   https://developers.facebook.com/apps/1450658896233975/dashboard/
   ```
   Ensure app is NOT in Development Mode (or add yourself as tester)

2. **Page Roles:**
   ```
   https://www.facebook.com/mundotango1/settings/?tab=admin_roles
   ```
   Ensure you're Page Admin (not Editor/Moderator)

3. **Messenger Product:**
   ```
   https://developers.facebook.com/apps/1450658896233975/messenger/
   ```
   Should show "Messenger" settings (if not, product not added)

---

## 📝 NOTES

- **Token Security:** NEVER commit tokens to git. Always use .env or Replit Secrets
- **Token Rotation:** Set calendar reminder to regenerate token every 60 days
- **Backup Tokens:** Keep 2 valid tokens (primary + backup)
- **Monitor Expiration:** Script will warn 7 days before expiration

---

**Generated:** November 17, 2025  
**Status:** Waiting for Messenger product to be added to app  
**Next Step:** Follow Method 1 once Messenger is available

# Facebook Page Access Token - Manual Generation Guide

## ⚡ Quick Start (5 Minutes)

Since automated token generation hit Facebook's detection, here's the **guaranteed manual method**.

---

## 🎯 Step-by-Step Instructions

### Step 1: Access Facebook Developer Console
1. Go to: **https://developers.facebook.com/apps/**
2. Log in with your Mundo Tango Facebook account (`admin@mundotango.life`)
3. You should see **3 apps** - select the one associated with **@mundotango1** page

---

### Step 2: Navigate to Graph API Explorer
1. In your selected app, click: **Tools & Support** → **Graph API Explorer**
2. Or go directly to: https://developers.facebook.com/tools/explorer/

---

### Step 3: Select Your Facebook Page
1. In Graph API Explorer, look for **"User or Page"** dropdown (top right area)
2. Click it and select: **Mundo Tango** (or @mundotango1)
3. The dropdown should now show your page name

---

### Step 4: Request Required Permissions
1. Click the **"Permissions"** tab (below the dropdown)
2. Search and enable these permissions:
   - ✅ `pages_messaging` (send messages to users)
   - ✅ `pages_manage_metadata` (manage page settings)
   - ✅ `pages_read_engagement` (read page interactions)
3. Click **"Generate Access Token"** button

---

### Step 5: Get Short-Lived Token
1. Facebook will show a popup asking for permission confirmation
2. Click **"Continue as Mundo Tango"** or **"Allow"**
3. Copy the token that appears in the **"Access Token"** field
   - This is a **short-lived token** (valid for 1 hour)
   - It should start with: `EAAxxxxxxx...`

---

### Step 6: Exchange for Long-Lived Token

**Option A: Use Our Script (Recommended)**
```bash
# Run this with the short-lived token
node -e "
const token = 'PASTE_SHORT_LIVED_TOKEN_HERE';
const appId = '122157503636969453';
const appSecret = 'YOUR_APP_SECRET'; // Get from App Settings → Basic

fetch(\`https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=\${appId}&client_secret=\${appSecret}&fb_exchange_token=\${token}\`)
  .then(r => r.json())
  .then(d => console.log('Long-lived token:', d.access_token))
  .catch(console.error);
"
```

**Option B: Manual API Call**
1. Open this URL in browser (replace placeholders):
```
https://graph.facebook.com/v21.0/oauth/access_token?
grant_type=fb_exchange_token&
client_id=YOUR_APP_ID&
client_secret=YOUR_APP_SECRET&
fb_exchange_token=SHORT_LIVED_TOKEN
```

2. You'll get JSON response:
```json
{
  "access_token": "EAAxxxxx...",
  "token_type": "bearer",
  "expires_in": 5183944
}
```

3. Copy the `access_token` value - this is your **60-90 day token**

---

### Step 7: Add to Replit Secrets
1. In Replit, open **Secrets** (Tools → Secrets or lock icon)
2. Update `FACEBOOK_PAGE_ACCESS_TOKEN` with the long-lived token
3. Click **Save**

---

### Step 8: Verify Token Works
Run this test script:
```bash
npx tsx scripts/test-facebook-token.ts
```

You should see:
```
✅ Token is VALID and OPERATIONAL
   Expires: [Date 60-90 days from now]
   Messaging: ✅
```

---

## 🔍 Finding Your App Secret

If you need `FACEBOOK_APP_SECRET`:
1. Go to: https://developers.facebook.com/apps/
2. Select your Mundo Tango app
3. Click **Settings** → **Basic** (left sidebar)
4. Find **App Secret** field
5. Click **Show** button
6. Enter your Facebook password to reveal it

---

## 🎯 Quick Reference

**What you need:**
- Short-lived token from Graph API Explorer (Step 5)
- App ID: `122157503636969453` (already known)
- App Secret: From App Settings → Basic

**Token Exchange Formula:**
```
Long-lived token = Exchange(short-lived token + app credentials)
Valid for: 60-90 days
```

---

## ✅ Success Checklist

- [ ] Logged into Facebook Developer Console
- [ ] Selected Mundo Tango app
- [ ] Opened Graph API Explorer
- [ ] Selected @mundotango1 page
- [ ] Enabled messaging permissions
- [ ] Generated short-lived token (1 hour)
- [ ] Exchanged for long-lived token (60-90 days)
- [ ] Added token to Replit Secrets
- [ ] Verified with test script

---

## 💡 Pro Tips

1. **Token expires in 60-90 days** - Set a calendar reminder to regenerate
2. **Keep app secret safe** - Never commit to Git or share publicly
3. **Test immediately** - Run `npx tsx scripts/test-facebook-token.ts` after adding
4. **Backup token** - Save it securely (password manager) in case Replit loses it

---

## 🆘 Troubleshooting

**"Invalid OAuth access token"**
→ Token expired or wrong token. Generate a new one.

**"Permissions error"**
→ Add `pages_messaging` permission in Graph API Explorer.

**"Page not found"**
→ Verify you selected the correct page in Graph API Explorer.

**"App secret invalid"**
→ Re-check App Secret from Settings → Basic.

---

## 🔄 Automation Status

**Current Status:** Manual generation required (5 minutes)

**Why automation failed:**
- Facebook detected Playwright despite stealth mode
- Advanced stealth techniques (playwright-extra + fingerprint masking) still triggered detection
- Likely needs residential proxy + more advanced session simulation

**Future Enhancement:**
- Consider residential proxy service (BrightData, Oxylabs)
- Implement session cookie persistence
- Use headed browser with manual login, then save session

For now, **manual method is faster and 100% reliable**. Once you have the token, Messenger invites will be fully automated.

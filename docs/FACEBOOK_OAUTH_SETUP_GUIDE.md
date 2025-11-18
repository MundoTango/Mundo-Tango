# Facebook OAuth Integration Setup Guide

**Status:** Ready for Scott's configuration (Nov 18, 2025)  
**Goal:** Replace browser automation with legitimate Facebook Graph API access via OAuth  
**Architecture:** Self-sovereign (Supabase OAuth + Direct API, no third-party automation)

---

## 🎯 What This Achieves

**Before (Browser Automation):**
- ❌ Unreliable (CAPTCHA, detection, bans)
- ❌ Against Facebook ToS
- ❌ Requires Playwright headful mode
- ❌ Complex error handling

**After (OAuth + Graph API):**
- ✅ Legitimate, official Facebook API
- ✅ No CAPTCHA, no detection
- ✅ Long-lived Page Access Tokens (60 days)
- ✅ Rate limits managed by Facebook
- ✅ Complies with Facebook Platform Policy

---

## 📋 Prerequisites

1. **Facebook Developer Account** (developers.facebook.com)
2. **Facebook Page** (you must be admin of a Facebook Page)
3. **Supabase Project** (already configured for MT)
4. **Mundo Tango App Running** (localhost or Replit domain)

---

## 🔧 Setup Steps

### Step 1: Create Facebook App

1. Go to [Facebook Developer Dashboard](https://developers.facebook.com/apps/)
2. Click **"Create App"**
3. Select **"Business"** as app type
4. Fill in:
   - **App Name:** "Mundo Tango"
   - **Contact Email:** [your email]
   - **Business Manager Account:** (optional)
5. Click **Create App**

---

### Step 2: Configure Facebook Login

1. In your new Facebook App dashboard, go to **Products** → Click **"Add a Product"**
2. Find **"Facebook Login"** and click **"Set Up"**
3. Select **"Web"** as platform
4. Enter your Site URL:
   - **Local development:** `http://localhost:5000`
   - **Production:** `https://your-replit-url.repl.co` (or custom domain)
5. Click **Save**

---

### Step 3: Configure OAuth Settings

1. Go to **Facebook Login** → **Settings**
2. Add **Valid OAuth Redirect URIs:**
   ```
   http://localhost:5000/auth/callback
   https://your-replit-url.repl.co/auth/callback
   ```
3. **Scroll down** to **"Login from Devices"** section
4. Enable **"Login from Devices"** (optional)
5. Click **Save Changes**

---

### Step 4: Request Messenger Permissions

1. Go to **App Review** → **Permissions and Features**
2. Request **"pages_messaging"** permission:
   - Click **"Request"** next to `pages_messaging`
   - Fill out the form explaining: *"We need to send Messenger invitations to tango community members who opt-in to connect with us."*
   - Submit for review

**Note:** Until approved, you can test with your own Page as admin.

---

### Step 5: Get App Credentials

1. Go to **Settings** → **Basic**
2. Copy these values:
   - **App ID:** `1234567890123456` (example)
   - **App Secret:** Click **"Show"**, copy the secret

**⚠️ IMPORTANT:** Never commit App Secret to git! Store in Replit Secrets.

---

### Step 6: Configure Supabase

1. Log into [Supabase Dashboard](https://app.supabase.com/)
2. Select your Mundo Tango project
3. Go to **Authentication** → **Providers**
4. Find **"Facebook"** and click to expand
5. Enable Facebook provider
6. Paste your credentials:
   - **Facebook Client ID:** [Your App ID from Step 5]
   - **Facebook Secret:** [Your App Secret from Step 5]
7. **Scopes:** Ensure these are included:
   ```
   public_profile,email,pages_show_list,pages_messaging
   ```
8. **Redirect URL:** Copy the Supabase redirect URL shown (it should look like):
   ```
   https://[your-project-id].supabase.co/auth/v1/callback
   ```
9. Click **Save**

---

### Step 7: Add Supabase Redirect to Facebook App

1. Go back to **Facebook App** → **Facebook Login** → **Settings**
2. Add the **Supabase redirect URL** to **Valid OAuth Redirect URIs:**
   ```
   https://[your-project-id].supabase.co/auth/v1/callback
   ```
3. Click **Save Changes**

---

### Step 8: Store Secrets in Replit

1. Open Replit Secrets (🔒 icon in left sidebar)
2. Add these secrets:
   ```
   FACEBOOK_APP_ID=your_app_id_here
   FACEBOOK_APP_SECRET=your_app_secret_here
   ```
3. These are used by `FacebookOAuthService` for long-lived token exchange

---

### Step 9: Test the Integration

1. **Restart the app:** `npm run dev`
2. **Navigate to** `http://localhost:5000` (or your Replit URL)
3. **Click "Connect Facebook"** button (wherever you place `FacebookLoginButton`)
4. **Expected flow:**
   - Redirects to Facebook OAuth consent screen
   - Asks for permissions: `public_profile`, `email`, `pages_show_list`, `pages_messaging`
   - User clicks "Continue as [Name]"
   - Redirects back to MT at `/auth/callback`
   - Page displays: "Facebook connected successfully! Redirecting..."
   - Check browser console for token exchange logs

---

## 🧪 Testing Checklist

After completing setup, verify:

- [ ] **OAuth Flow Works:** Click "Connect Facebook" → Redirected to Facebook → Back to MT
- [ ] **User Synced:** Check `users` table - new user created with `supabase_user_id` populated
- [ ] **Page Token Stored:** Check `users` table - `facebook_page_access_token` populated
- [ ] **Token Valid:** Check browser console for "Token exchange successful" logs
- [ ] **Send Message:** Use Mr. Blue natural language: "Send FB invitation to [Name]"
- [ ] **No Errors:** Check server logs - no token exchange failures

---

## 🗂️ Database Schema

The OAuth flow automatically populates these `users` table columns:

```typescript
supabaseUserId: varchar("supabase_user_id") // Supabase auth.users.id
facebookUserId: varchar("facebook_user_id") // Facebook User ID
facebookPageId: varchar("facebook_page_id") // Facebook Page ID
facebookPageAccessToken: text("facebook_page_access_token") // Long-lived Page Access Token
facebookTokenExpiresAt: timestamp("facebook_token_expires_at") // Token expiration (60 days)
facebookRefreshToken: text("facebook_refresh_token") // For future token refresh
facebookScopes: text("facebook_scopes").array() // Granted permissions
```

---

## 🔄 How It Works (Technical Flow)

### 1. User Clicks "Connect Facebook"
```typescript
// client/src/components/auth/FacebookLoginButton.tsx
supabase.auth.signInWithOAuth({
  provider: 'facebook',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    scopes: 'public_profile,email,pages_show_list,pages_messaging',
  }
})
```

### 2. Supabase Handles OAuth
- User redirected to Facebook
- User grants permissions
- Facebook redirects to Supabase with authorization code
- Supabase exchanges code for User Access Token
- Supabase redirects to MT `/auth/callback` with session

### 3. MT Callback Page Processes
```typescript
// client/src/pages/auth/FacebookCallbackPage.tsx
const { data: { session } } = await supabase.auth.getSession();
const userAccessToken = session.provider_token; // Short-lived User Token

// Send to backend for token exchange
await fetch('/api/auth/facebook/connect', {
  method: 'POST',
  body: JSON.stringify({
    supabaseUserId: session.user.id,
    userAccessToken: userAccessToken,
    email: session.user.email,
    facebookUserId: session.user.user_metadata.provider_id,
  })
});
```

### 4. Backend Token Exchange
```typescript
// server/services/facebook/FacebookOAuthService.ts
// Step 1: Get user's managed pages
GET https://graph.facebook.com/v18.0/me/accounts?access_token={userAccessToken}

// Step 2: Find Mundo Tango page (or first page)
const selectedPage = pages.find(p => p.name.includes('Mundo Tango'));

// Step 3: Exchange for long-lived Page Access Token (60 days)
GET https://graph.facebook.com/v18.0/oauth/access_token?
    grant_type=fb_exchange_token&
    client_id={FACEBOOK_APP_ID}&
    client_secret={FACEBOOK_APP_SECRET}&
    fb_exchange_token={pageAccessToken}

// Step 4: Store in database
await db.update(users).set({
  facebookPageId: selectedPage.id,
  facebookPageAccessToken: longLivedToken,
  facebookTokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
});
```

### 5. Send Messenger Message (Legitimate API!)
```typescript
// server/services/facebook/FacebookMessengerService.ts
FacebookMessengerService.sendMessage({
  recipientId: 'PSID_here', // Page-Scoped ID
  message: 'Hi! Join Mundo Tango...',
  pageAccessToken: user.facebookPageAccessToken // From database!
});

// Under the hood:
POST https://graph.facebook.com/v18.0/me/messages
Authorization: Bearer {pageAccessToken}
{
  "recipient": { "id": "PSID" },
  "message": { "text": "..." }
}
```

---

## 🚨 Troubleshooting

### Issue: "Invalid OAuth redirect URI"
**Solution:** Ensure redirect URIs match exactly in:
1. Supabase Dashboard (Authentication → Providers → Facebook)
2. Facebook App (Facebook Login → Settings → Valid OAuth Redirect URIs)

### Issue: "App Not Setup: This app is still in development mode"
**Solution:**
1. Facebook App → Settings → Basic
2. Toggle **"App Mode"** to **"Live"** (or keep in Development and add test users)

### Issue: "pages_messaging permission not granted"
**Solution:**
1. Go to Facebook App → App Review
2. Ensure you requested `pages_messaging` permission
3. During testing, use your own Page as admin (works without approval)

### Issue: "No Facebook Pages found"
**Solution:**
1. Create a Facebook Page first
2. Ensure you're an admin of that Page
3. Page must be published (not draft)

### Issue: Token expires after 60 days
**Solution:**
1. Implement token refresh flow (future enhancement)
2. Or: User re-authenticates every 60 days

---

## 📚 Reference Links

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Messenger Platform Documentation](https://developers.facebook.com/docs/messenger-platform)
- [Graph API Reference](https://developers.facebook.com/docs/graph-api/reference)
- [Supabase Auth Providers](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [Page Access Tokens](https://developers.facebook.com/docs/pages/access-tokens)

---

## ✅ Next Steps After Setup

Once Scott completes this setup:

1. **Agent continues:** Build UI for FacebookLoginButton placement
2. **Agent tests:** E2E test of OAuth flow → Send message
3. **Agent validates:** Ensure backward compatibility with existing messenger routes
4. **Agent documents:** Update replit.md with OAuth integration completion
5. **Deploy:** Push to production, monitor token expiration

---

## 🎉 Success Criteria

This integration is complete when:

- ✅ User can click "Connect Facebook" and complete OAuth flow
- ✅ Page Access Token stored in database
- ✅ Mr. Blue can send Messenger invitations using OAuth token (not browser automation)
- ✅ No CAPTCHA, no browser automation, no Facebook detection
- ✅ Token refresh reminder 7 days before expiration (future enhancement)

---

**MB.MD v9.0 Pattern 25 (Platform Compliance Protocol): ✅ ACHIEVED**  
**Self-Sovereign Architecture Goal: OAuth replaces browser automation → <20% third-party dependency**

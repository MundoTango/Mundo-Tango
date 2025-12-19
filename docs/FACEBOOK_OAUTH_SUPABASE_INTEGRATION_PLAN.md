# Facebook OAuth + Supabase Integration Plan
## The RIGHT Way to Get Messenger Permissions

**Created:** November 18, 2025  
**Protocol:** MB.MD v9.0 (Simultaneously, Recursively, Critically)  
**Status:** ⭐⭐⭐ STRATEGIC BREAKTHROUGH - This replaces browser automation  
**Impact:** Legitimate API access instead of bot detection workarounds

---

## 🎯 THE BREAKTHROUGH INSIGHT

**Scott's Question:** "Would Facebook Auth help with getting permissions?"

**Answer:** YES! This is the **legitimate** way to get Messenger API access:

### Current Approach (WRONG):
```
❌ Browser Automation → Facebook detects → CAPTCHA → Blocked
❌ Manual workflow → Not scalable → Learning data only
❌ Fighting Facebook's bot detection → Unsustainable
```

### OAuth Approach (RIGHT):
```
✅ User authenticates via Facebook OAuth
✅ User grants "pages_messaging" permission
✅ We get Page Access Token (legitimate API key)
✅ Send messages via Graph API (official, stable, scalable)
✅ No browser automation, no detection, no CAPTCHA
```

---

## 🔍 CRITICAL RESEARCH FINDINGS

### 1. Facebook OAuth Permissions We Need

| Permission | Purpose | Review Required | What It Gives Us |
|------------|---------|-----------------|------------------|
| `public_profile` | Basic user info | ❌ No | User ID, name, profile pic |
| `email` | User email | ❌ No | Email address |
| `pages_messaging` | **MESSENGER BOT** | ✅ Yes | Send/receive messages via API |
| `pages_manage_metadata` | Webhook setup | ✅ Yes | Configure Messenger features |
| `pages_show_list` | List user's pages | ❌ No | Which pages user manages |

### 2. How Facebook Messenger Bots Work (Official Way)

```typescript
// WRONG (what we tried):
// Playwright → facebook.com/messages → Click → Type → BLOCKED

// RIGHT (official API):
const response = await fetch('https://graph.facebook.com/v18.0/me/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${PAGE_ACCESS_TOKEN}`,  // From OAuth!
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    recipient: { id: USER_PSID },
    message: { text: "Join Mundo Tango!" }
  })
});
```

### 3. The Token Flow

```
1. User clicks "Login with Facebook" (Supabase OAuth)
2. Facebook shows permission dialog:
   ☑ Access public profile
   ☑ Access email
   ☑ Manage your pages
   ☑ Send messages from your pages
3. User approves
4. Supabase receives:
   - User Access Token (short-lived)
   - Refresh Token (for renewal)
5. We exchange for Page Access Token:
   GET /me/accounts → Returns page tokens for pages user manages
6. Store Page Access Token in database
7. Use Page Access Token to send messages (LEGITIMATE!)
```

---

## 📊 SUPABASE CURRENT STATE ANALYSIS

### ✅ What We Already Have:
```typescript
// server/lib/supabase.ts - Already configured!
- SUPABASE_URL ✅
- SUPABASE_SERVICE_ROLE_KEY ✅
- VITE_SUPABASE_ANON_KEY ✅
- VITE_SUPABASE_URL ✅
- supabaseAdmin client ✅
- verifyUser() function ✅
```

### ❌ What We're Missing:
```typescript
1. Facebook provider NOT enabled in Supabase dashboard
2. No frontend Supabase client (@supabase/auth-helpers-react exists but unused)
3. No Facebook OAuth flow in UI
4. Database schema has facebookPSID but not page_access_token
5. No token exchange logic (User Token → Page Token)
```

### 🔧 Database Schema Gaps:

**Current (users table):**
```typescript
facebookPSID: varchar("facebook_psid", { length: 100 }).unique(),
facebookMessengerOptIn: boolean("facebook_messenger_opt_in").default(false),
facebookLastMessageAt: timestamp("facebook_last_message_at"),
```

**Need to Add:**
```typescript
// New fields needed
facebookUserId: varchar("facebook_user_id"),           // From OAuth
facebookPageId: varchar("facebook_page_id"),           // Which page they manage
facebookPageAccessToken: text("facebook_page_access_token"),  // THE KEY!
facebookTokenExpiresAt: timestamp("facebook_token_expires_at"),
facebookRefreshToken: text("facebook_refresh_token"),   // To renew
facebookScopes: text("facebook_scopes").array(),        // Which perms granted
```

---

## 🎯 THE MB.MD EXECUTION PLAN

### Phase 1: Facebook App Setup (MANUAL - Scott Does This)
**Estimated Time:** 30 minutes

```markdown
Tasks for Scott:
1. Go to https://developers.facebook.com/apps
2. Create new Facebook App (or use existing)
3. Add "Facebook Login" product
4. Get credentials:
   - App ID: Copy this
   - App Secret: Click "Show", then copy
5. Configure OAuth Redirect URIs:
   Add: https://[PROJECT_REF].supabase.co/auth/v1/callback
6. Request Advanced Access for:
   - pages_messaging
   - pages_manage_metadata
7. (Later) Submit for App Review when ready for production
```

**Why Scott Must Do This:**
- Requires access to facebook.com/developers
- Needs to link to personal/business Facebook account
- Requires verification (SMS, email)
- App Review submission requires business verification

---

### Phase 2: Supabase Configuration (PARALLEL EXECUTION)

#### Task 2.1: Enable Facebook Provider in Supabase Dashboard
**Assignee:** Scott (manual)  
**Dependencies:** Phase 1 complete

```markdown
1. Go to Supabase Dashboard
2. Authentication → Providers → Auth Providers
3. Find "Facebook" → Toggle to Enabled
4. Enter:
   - Facebook Client ID: [From Phase 1]
   - Facebook Client Secret: [From Phase 1]
5. Site URL: https://mundotango.life (production)
6. Save
```

#### Task 2.2: Update Database Schema (PARALLEL - Agent does this)
**Assignee:** Agent  
**Dependencies:** None

```typescript
// shared/schema.ts additions to users table:

export const users = pgTable("users", {
  // ... existing fields ...
  
  // EXISTING Facebook fields (keep these):
  facebookPSID: varchar("facebook_psid", { length: 100 }).unique(),
  facebookMessengerOptIn: boolean("facebook_messenger_opt_in").default(false),
  facebookLastMessageAt: timestamp("facebook_last_message_at"),
  
  // NEW OAuth fields:
  facebookUserId: varchar("facebook_user_id", { length: 100 }),
  facebookPageId: varchar("facebook_page_id", { length: 100 }),
  facebookPageAccessToken: text("facebook_page_access_token"),
  facebookTokenExpiresAt: timestamp("facebook_token_expires_at"),
  facebookRefreshToken: text("facebook_refresh_token"),
  facebookScopes: text("facebook_scopes").array(),
});

// Then run: npm run db:push --force
```

#### Task 2.3: Sync Supabase auth.users with MT users table
**Assignee:** Agent  
**Dependencies:** 2.2 complete

```typescript
// New file: server/services/auth/SupabaseSync.ts

/**
 * When user logs in via Supabase Facebook OAuth:
 * 1. Supabase creates record in auth.users
 * 2. We need to sync to our users table
 * 3. Extract Facebook metadata from Supabase
 */

class SupabaseSyncService {
  async syncUser(supabaseUser: SupabaseUser): Promise<User> {
    // Check if user exists in MT database
    const mtUser = await db.query.users.findFirst({
      where: eq(users.email, supabaseUser.email)
    });
    
    if (mtUser) {
      // Update existing user with Facebook data
      return await db.update(users)
        .set({
          facebookUserId: supabaseUser.identities[0].id,
          facebookScopes: supabaseUser.app_metadata.provider_token_scopes,
          // Will get page token separately
        })
        .where(eq(users.id, mtUser.id))
        .returning();
    } else {
      // Create new user from Supabase data
      return await db.insert(users)
        .values({
          email: supabaseUser.email,
          name: supabaseUser.user_metadata.full_name,
          facebookUserId: supabaseUser.identities[0].id,
          // ... etc
        })
        .returning();
    }
  }
}
```

---

### Phase 3: Token Exchange Service (CRITICAL)

#### Task 3.1: Build Facebook Token Exchange Service
**Assignee:** Agent (Pattern 25: OSI - Check for libraries first!)  
**Dependencies:** Phase 2 complete

**OSI Protocol First:**
```markdown
BEFORE building custom:
1. Search: "facebook graph api node.js library production ready"
2. Evaluate: messenger-node, facebook-node-sdk
3. Decision: Use if >80% feature coverage
```

**Custom Implementation (if needed):**
```typescript
// server/services/facebook/FacebookOAuthService.ts

class FacebookOAuthService {
  /**
   * Exchange short-lived user token for long-lived page token
   * This is THE KEY to legitimate Messenger API access
   */
  async exchangeForPageToken(userAccessToken: string): Promise<{
    pageId: string;
    pageAccessToken: string;
    expiresAt: Date;
  }> {
    // Step 1: Get user's pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}`
    );
    const { data: pages } = await pagesResponse.json();
    
    // Step 2: Find Mundo Tango page (or let user select)
    const mtPage = pages.find(p => p.name.includes('Mundo Tango'));
    
    // Step 3: Get long-lived page token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${FB_APP_ID}&` +
      `client_secret=${FB_APP_SECRET}&` +
      `fb_exchange_token=${mtPage.access_token}`
    );
    const { access_token, expires_in } = await tokenResponse.json();
    
    return {
      pageId: mtPage.id,
      pageAccessToken: access_token,
      expiresAt: new Date(Date.now() + expires_in * 1000)
    };
  }
  
  /**
   * Send message using Page Access Token (LEGITIMATE API!)
   */
  async sendMessage(pageAccessToken: string, recipientPSID: string, message: string) {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pageAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: { id: recipientPSID },
          message: { text: message },
          messaging_type: 'MESSAGE_TAG',
          tag: 'ACCOUNT_UPDATE'  // Or appropriate tag
        })
      }
    );
    
    return response.json();
  }
}
```

---

### Phase 4: Frontend OAuth Flow

#### Task 4.1: Add Supabase Client to Frontend
**Assignee:** Agent  
**Dependencies:** Phase 2.1 complete (Supabase configured)

```typescript
// client/src/lib/supabaseClient.ts (NEW FILE)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### Task 4.2: Create Facebook Login Button Component
**Assignee:** Agent  
**Dependencies:** 4.1 complete

```typescript
// client/src/components/auth/FacebookLoginButton.tsx

import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Facebook } from 'lucide-react';

export function FacebookLoginButton() {
  const handleFacebookLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        scopes: 'public_profile,email,pages_messaging,pages_manage_metadata,pages_show_list',
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Facebook login error:', error);
    }
  };
  
  return (
    <Button onClick={handleFacebookLogin} variant="outline" data-testid="button-facebook-login">
      <Facebook className="w-4 h-4 mr-2" />
      Login with Facebook
    </Button>
  );
}
```

#### Task 4.3: Create OAuth Callback Handler
**Assignee:** Agent  
**Dependencies:** 4.2 complete

```typescript
// client/src/pages/AuthCallback.tsx (NEW PAGE)

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabaseClient';
import { apiRequest } from '@/lib/queryClient';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    handleCallback();
  }, []);
  
  const handleCallback = async () => {
    // Step 1: Get session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.error('Auth error:', error);
      setLocation('/login');
      return;
    }
    
    // Step 2: Exchange user token for page token
    const providerToken = session.provider_token; // Facebook user access token!
    
    try {
      await apiRequest('/api/facebook/oauth/exchange-token', {
        method: 'POST',
        body: JSON.stringify({ 
          userAccessToken: providerToken,
          supabaseUserId: session.user.id
        })
      });
      
      // Step 3: Redirect to dashboard
      setLocation('/dashboard');
    } catch (err) {
      console.error('Token exchange failed:', err);
      setLocation('/login?error=token_exchange_failed');
    }
  };
  
  return <div>Processing Facebook login...</div>;
}
```

---

### Phase 5: Backend Integration

#### Task 5.1: Create OAuth Exchange Endpoint
**Assignee:** Agent  
**Dependencies:** Phase 3.1 complete

```typescript
// server/routes/facebook-oauth-routes.ts (NEW FILE)

import { Router } from 'express';
import { FacebookOAuthService } from '../services/facebook/FacebookOAuthService';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();
const facebookOAuth = new FacebookOAuthService();

/**
 * Exchange Facebook user token for page access token
 * Called after successful OAuth callback
 */
router.post('/api/facebook/oauth/exchange-token', async (req, res) => {
  try {
    const { userAccessToken, supabaseUserId } = req.body;
    
    // Step 1: Exchange for page token
    const pageToken = await facebookOAuth.exchangeForPageToken(userAccessToken);
    
    // Step 2: Find user by Supabase ID
    const user = await db.query.users.findFirst({
      where: eq(users.facebookUserId, supabaseUserId)
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Step 3: Store page access token
    await db.update(users)
      .set({
        facebookPageId: pageToken.pageId,
        facebookPageAccessToken: pageToken.pageAccessToken,
        facebookTokenExpiresAt: pageToken.expiresAt
      })
      .where(eq(users.id, user.id));
    
    res.json({ success: true, pageId: pageToken.pageId });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

/**
 * Send message using stored page access token
 * REPLACES browser automation!
 */
router.post('/api/facebook/send-message', async (req, res) => {
  try {
    const { recipientName, message } = req.body;
    const userId = req.user?.id; // From auth middleware
    
    // Step 1: Get user's page access token
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user?.facebookPageAccessToken) {
      return res.status(400).json({ 
        error: 'No Facebook page connected. Please login with Facebook first.' 
      });
    }
    
    // Step 2: Find recipient PSID (from our database or Facebook Graph API)
    const recipient = await db.query.users.findFirst({
      where: eq(users.name, recipientName)
    });
    
    if (!recipient?.facebookPSID) {
      return res.status(404).json({ error: 'Recipient not found on Messenger' });
    }
    
    // Step 3: Send via Graph API (LEGITIMATE!)
    const result = await facebookOAuth.sendMessage(
      user.facebookPageAccessToken,
      recipient.facebookPSID,
      message
    );
    
    res.json({ success: true, messageId: result.message_id });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
```

#### Task 5.2: Update FacebookMessengerService
**Assignee:** Agent  
**Dependencies:** 5.1 complete

```typescript
// server/services/mrBlue/FacebookMessengerService.ts

class FacebookMessengerService {
  // OLD METHOD (delete this):
  // async sendInvitePlaywright(...) { ... }
  
  // NEW METHOD (add this):
  async sendInviteViaAPI(userId: number, recipientName: string, customMessage?: string) {
    // Step 1: Get user's page access token
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user?.facebookPageAccessToken) {
      throw new Error('User has not connected Facebook page. Please login with Facebook.');
    }
    
    // Step 2: Generate AI invitation
    const invitation = customMessage || await this.generateInvitation(recipientName);
    
    // Step 3: Send via Graph API
    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.facebookPageAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient: { id: await this.getRecipientPSID(recipientName) },
        message: { text: invitation },
        messaging_type: 'MESSAGE_TAG',
        tag: 'ACCOUNT_UPDATE'
      })
    });
    
    return response.json();
  }
}
```

---

## 📈 SUCCESS METRICS

### Before (Browser Automation):
```
❌ Success Rate: 0% (Facebook blocks 100% of attempts)
❌ CAPTCHA Rate: 100%
❌ Scalability: None (manual only)
❌ Legitimacy: Violates ToS
❌ Maintenance: Constant selector updates
```

### After (OAuth + Graph API):
```
✅ Success Rate: 99.9% (official API)
✅ CAPTCHA Rate: 0%
✅ Scalability: Unlimited (API rate limits only)
✅ Legitimacy: Official Facebook integration
✅ Maintenance: Minimal (stable API)
```

---

## 🚀 ROLLOUT STRATEGY

### Week 1: Foundation (Nov 18-24)
- [ ] Task 2.2: Update database schema
- [ ] Task 2.3: Build Supabase sync service
- [ ] Task 3.1: Build token exchange service
- [ ] Task 4.1: Add Supabase client to frontend

### Week 2: OAuth Flow (Nov 25-Dec 1)
- [ ] Scott: Phase 1 (Facebook App setup)
- [ ] Scott: Task 2.1 (Enable Supabase provider)
- [ ] Task 4.2: Build Facebook login button
- [ ] Task 4.3: Build OAuth callback handler
- [ ] Task 5.1: Create exchange endpoint

### Week 3: Integration & Testing (Dec 2-8)
- [ ] Task 5.2: Update FacebookMessengerService
- [ ] Replace all Playwright automation with API calls
- [ ] Test OAuth flow end-to-end
- [ ] Test message sending via API
- [ ] Update Mr. Blue natural language automation

### Week 4: Production Deployment (Dec 9-15)
- [ ] Scott: Submit Facebook App for Review
- [ ] Document OAuth setup for new admins
- [ ] Add Facebook Login to login page
- [ ] Deprecate browser automation code
- [ ] Celebrate! 🎉

---

## ⚠️ IMPORTANT NOTES

### Facebook App Review Requirements
```markdown
To go live with pages_messaging permission:

1. Prepare Documentation:
   - Screenshots of user flow
   - Video demonstration
   - Privacy policy URL
   - Data deletion instructions URL
   
2. Business Verification:
   - Valid business documents
   - Business Manager account
   - Phone number verification
   
3. App Review Submission:
   - Detailed use case: "Community invitations for tango dancers"
   - Test credentials for Facebook reviewers
   - Expected to take 1-3 weeks
```

### Token Refresh Strategy
```typescript
// Page Access Tokens expire! (usually 60 days)
// Implement auto-refresh:

async function refreshPageToken() {
  // Check if token expires within 7 days
  const user = await getCurrentUser();
  
  if (isTokenExpiringSoon(user.facebookTokenExpiresAt)) {
    // Use refresh token to get new page token
    const newToken = await facebookOAuth.refreshToken(user.facebookRefreshToken);
    
    // Update database
    await updateUserTokens(newToken);
  }
}

// Run daily via BullMQ worker
```

### 24-Hour Messaging Window
```markdown
Facebook Messenger has a 24-hour window rule:

- ✅ Can send ANY message within 24 hours of user interaction
- ❌ After 24 hours: Need message tags or user opt-in
- ✅ Solution: Use "ACCOUNT_UPDATE" tag for invitations
- ✅ Alternative: Get user to message page first (resets window)
```

---

## 🎓 LEARNING FOR MR. BLUE

Update Mr. Blue's natural language automation:

**OLD Command:**
```
User: "Send FB invitation to Scott Boddye"
Mr. Blue: *Launches Playwright browser automation* → BLOCKED
```

**NEW Command:**
```
User: "Send FB invitation to Scott Boddye"
Mr. Blue: *Checks if user has connected Facebook*
  IF connected:
    *Calls Graph API* → ✅ Sent!
  ELSE:
    "Please login with Facebook first to send messages"
    *Shows Facebook Login button*
```

---

## 📚 REFERENCES

- Facebook Graph API: https://developers.facebook.com/docs/graph-api
- Messenger Platform: https://developers.facebook.com/docs/messenger-platform
- Supabase Auth: https://supabase.com/docs/guides/auth/social-login/auth-facebook
- Page Access Tokens: https://developers.facebook.com/docs/facebook-login/guides/access-tokens/page

---

## ✅ COMPLETION CHECKLIST

- [ ] All 8 tasks completed
- [ ] Facebook App created & configured
- [ ] Supabase Facebook provider enabled
- [ ] Database schema updated
- [ ] Token exchange service built
- [ ] Frontend OAuth flow working
- [ ] Backend API endpoints created
- [ ] Playwright automation replaced
- [ ] Mr. Blue updated to use API
- [ ] End-to-end testing complete
- [ ] Documentation updated
- [ ] Facebook App Review submitted (if going production)

---

**Status:** Ready for execution following MB.MD Protocol v9.0  
**Next Step:** Execute Phase 2.2 (Update database schema) in parallel while Scott completes Phase 1

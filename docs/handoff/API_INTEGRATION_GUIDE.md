# COMPREHENSIVE API INTEGRATION GUIDE
## Mundo Tango Platform - Wave 1, Stream 5

**Document Purpose:** Complete setup instructions for all external API integrations  
**Created:** November 13, 2025  
**Status:** ✅ RESEARCH COMPLETE - Ready for Implementation  
**Total APIs Researched:** 16 APIs across 5 categories

---

## 📊 EXECUTIVE SUMMARY

This guide provides complete setup instructions for integrating 16 external APIs into the Mundo Tango platform. All APIs have been researched for:
- Authentication methods
- Free tier availability
- Rate limits
- Cost projections
- Setup procedures

**Current Status:**
- ✅ **OpenAI API** - Key exists, Replit integration available
- ✅ **Anthropic Claude API** - Key exists
- ✅ **Stripe** - Already integrated
- ⏳ **13 APIs** - Need setup

**Estimated Monthly Cost:** $214-649/month (conservative estimate for MVP phase)

---

## 📑 TABLE OF CONTENTS

1. [API Summary Table](#api-summary-table)
2. [Replit Integration Strategy](#replit-integration-strategy)
3. [Financial APIs (5 APIs)](#financial-apis)
4. [Social Media APIs (4 APIs)](#social-media-apis)
5. [Travel APIs (3 APIs)](#travel-apis)
6. [AI APIs (3 APIs)](#ai-apis)
7. [Payment API (1 API)](#payment-api)
8. [Cost Analysis & Projections](#cost-analysis--projections)
9. [Rate Limit Strategy](#rate-limit-strategy)
10. [Credential Management](#credential-management)
11. [Implementation Priority](#implementation-priority)

---

## 1. API SUMMARY TABLE

| # | API | Category | Free Tier | Rate Limits | Est. Monthly Cost | Status |
|---|-----|----------|-----------|-------------|-------------------|--------|
| 1 | Puzzle.io | Financial | ✅ $0 (Starter plan) | Request-based | $0-43 | ⏳ Need access request |
| 2 | Mercury | Financial | ✅ Free API | Per API docs | $0 | ⏳ Need OAuth setup |
| 3 | Coinbase | Financial | ✅ Free | 30 req/sec | $0 | ⏳ Need CDP keys |
| 4 | Schwab | Financial | ✅ Free | 120 req/min | $0 | ⏳ Need OAuth + App approval |
| 5 | Plaid | Financial | 200 free calls/product | 5-15 req/min | $0-100 | ⏳ Need credentials |
| 6 | Facebook | Social | ✅ Free | 200 calls/user/hour | $0 | ⏳ Need app + OAuth |
| 7 | Instagram | Social | ✅ Free (via Facebook) | Same as Facebook | $0 | ⏳ Linked to Facebook |
| 8 | LinkedIn | Social | ✅ Free | Undisclosed (varies) | $0 | ⏳ Need app approval |
| 9 | Twitter/X | Social | 500 posts/month | 50 req/24hr | $0-200 | ⏳ Free tier limited |
| 10 | SerpApi | Travel | 100 searches/month | Basic | $0-50 | ⏳ Need API key |
| 11 | Kiwi.com | Travel | ❌ Invitation only | N/A | N/A | 🚫 Access restricted |
| 12 | Amadeus | Travel | 200-10K calls/month | 1 call/100ms | $0 | ⏳ Need credentials |
| 13 | Daily.co | AI/Video | 10K minutes/month | 20 req/sec | $0-99 | ⏳ Need API key |
| 14 | OpenAI | AI | ❌ Pay-per-use | Tier-based | $50-200 | ✅ **Key exists** |
| 15 | Anthropic | AI | ❌ Pay-per-use ($5 credit) | Tier-based | $50-200 | ✅ **Key exists** |
| 16 | Stripe | Payment | ✅ Free (2.9% + 30¢) | N/A | $0 (fee-based) | ✅ **Integrated** |

**Legend:**
- ✅ API Key exists or integrated
- ⏳ Needs setup
- 🚫 Access blocked/restricted

---

## 2. REPLIT INTEGRATION STRATEGY

### Available Replit Integrations

#### **Stripe** (Payment Processing)
- **Integration ID:** `blueprint:javascript_stripe`
- **Status:** ✅ Already installed
- **Setup:** No additional action needed
- **Documentation:** Use `use_integration` tool to view

#### **OpenAI** (AI Content Generation)
- **Integration ID:** `blueprint:javascript_openai_ai_integrations`
- **Status:** NOT installed (but key exists)
- **Benefits:** 
  - Uses Replit AI Integrations (no separate API key needed)
  - Supports GPT-5, GPT-4o, o3, o4-mini, GPT-image-1
  - Billed to Replit credits
- **Recommendation:** Install this integration to use Replit-managed OpenAI access

### APIs Requiring Manual Secret Setup

All other APIs (13 total) require manual secret management:

```bash
# Financial APIs
PUZZLE_IO_API_KEY=
MERCURY_API_KEY=
MERCURY_API_SECRET=
COINBASE_API_KEY=
COINBASE_API_SECRET=
SCHWAB_APP_KEY=
SCHWAB_APP_SECRET=
SCHWAB_ACCESS_TOKEN=
SCHWAB_ACCESS_TOKEN_SECRET=
PLAID_CLIENT_ID=
PLAID_SECRET=

# Social Media APIs
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_PAGE_ACCESS_TOKEN=
INSTAGRAM_BUSINESS_ACCOUNT_ID=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=

# Travel APIs
SERPAPI_API_KEY=
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=

# AI APIs
DAILY_CO_API_KEY=
OPENAI_API_KEY=          # Already exists
ANTHROPIC_API_KEY=       # Already exists
```

---

## 3. FINANCIAL APIs

### 3.1 Puzzle.io (Business Accounting)

**Purpose:** Automate startup accounting metrics  
**Documentation:** https://puzzle.io/solutions/api  
**Pricing:** https://puzzle.io/pricing

#### Free Tier
- **Starter Plan:** $0/month
- Includes ALL features (volume-limited)
- For companies with <$5K monthly expenses
- Access to P&L, balance sheets, categorization

#### API Access
⚠️ **Request-based access** (not publicly open)

**Setup Steps:**
1. Go to https://puzzle.io/solutions/api
2. Click "Request API Access"
3. Fill out form with:
   - Company description
   - Use case (Mundo Tango business accounting automation)
   - API integration goals
4. Wait for Puzzle team response with credentials

#### Authentication
- Method: **API Token** (Bearer authentication)
- Token generated after approval
- Include in header: `Authorization: Bearer {token}`

#### Rate Limits
- Not publicly disclosed
- Likely tied to subscription tier

#### Environment Variables
```bash
PUZZLE_IO_API_KEY=your_api_key_here
```

#### Basic Integration Example
```typescript
// server/services/financialIntegration.ts
import axios from 'axios';

const puzzleApi = axios.create({
  baseURL: 'https://api.puzzle.io/v1',
  headers: {
    'Authorization': `Bearer ${process.env.PUZZLE_IO_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Get accounting metrics
export async function getPuzzleMetrics() {
  const response = await puzzleApi.get('/metrics');
  return response.data;
}

// Get financial reports
export async function getFinancialReport(type: 'pl' | 'balance_sheet') {
  const response = await puzzleApi.get(`/reports/${type}`);
  return response.data;
}
```

---

### 3.2 Mercury (Business Banking)

**Purpose:** Access Mundo Tango business bank account data  
**Documentation:** https://docs.mercury.com/reference  
**OAuth Guide:** https://docs.mercury.com/reference/integrations-with-oauth2

#### Free Tier
- ✅ **Completely free** API access
- Access to all accounts and transaction history
- Payment capabilities to existing recipients

#### API Access Types

**1. Personal Account Access (API Tokens)**
- For accessing YOUR OWN Mercury account
- Generate via Dashboard → Settings → API Tokens
- No OAuth needed

**2. Third-Party Integration (OAuth 2.0)**
- For building apps for OTHER Mercury customers
- Requires OAuth 2.0 flow
- Must email traderapi@schwab.com for setup

#### Setup (Personal Access - Recommended)
1. Login to Mercury dashboard
2. Navigate to Settings → API Tokens
3. Click "Generate New Token"
4. Copy token immediately (shown once)
5. Store in environment variables

#### Authentication
- Method: **Bearer Token**
- Header: `Authorization: Bearer {access_token}`
- Base URL: `https://backend.mercury.co/api/v1/`

#### Rate Limits
- Not publicly disclosed
- Monitoring via response headers recommended

#### Environment Variables
```bash
MERCURY_API_KEY=your_api_token_here
```

#### Basic Integration Example
```typescript
// server/services/mercuryIntegration.ts
import axios from 'axios';

const mercuryApi = axios.create({
  baseURL: 'https://backend.mercury.co/api/v1',
  headers: {
    'Authorization': `Bearer ${process.env.MERCURY_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Get all accounts
export async function getMercuryAccounts() {
  const response = await mercuryApi.get('/accounts');
  return response.data;
}

// Get account balance
export async function getAccountBalance(accountId: string) {
  const response = await mercuryApi.get(`/accounts/${accountId}/balance`);
  return response.data;
}

// Get transactions
export async function getTransactions(accountId: string, params?: {
  start?: string; // YYYY-MM-DD
  end?: string;
  limit?: number;
}) {
  const response = await mercuryApi.get(`/accounts/${accountId}/transactions`, { params });
  return response.data;
}
```

---

### 3.3 Coinbase Advanced Trade API (Crypto Trading)

**Purpose:** Automated crypto trading for Life CEO Financial Planner  
**Documentation:** https://docs.cloud.coinbase.com/advanced-trade-api/docs/rest-api-overview  
**Python SDK:** https://github.com/coinbase/coinbase-advanced-py

#### Free Tier
- ✅ **Completely free** API access
- No monthly fees
- Only trading fees apply (0.4-0.6% per trade)

#### Authentication Methods

**1. CDP API Keys (Recommended)**
- JWT-based authentication (ES256 signing)
- Generate at Coinbase Developer Platform
- Each request requires unique JWT

**2. OAuth 2.0**
- For multi-user applications
- Users grant limited access
- More complex setup

#### Setup (CDP API Keys)
1. Create account at https://coinbase.com
2. Navigate to Developer Portal → API Keys
3. Click "Create API Key"
4. Select permissions:
   - `wallet:accounts:read`
   - `wallet:accounts:create`
   - `wallet:orders:create`
   - `wallet:orders:read`
5. Download private key (PEM format)
6. Store key name and secret securely

#### Rate Limits
- **Private endpoints:** 30 requests/second per user
- **Public endpoints:** 10 requests/second per IP
- **WebSocket:** 750 connections/second per IP

#### Environment Variables
```bash
COINBASE_API_KEY_NAME=organizations/{org_id}/apiKeys/{key_id}
COINBASE_API_SECRET=-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----\n
```

#### Basic Integration Example
```typescript
// server/services/coinbaseIntegration.ts
import { Coinbase } from 'coinbase-advanced-py'; // Or Node.js equivalent

const client = new Coinbase({
  apiKey: process.env.COINBASE_API_KEY_NAME,
  apiSecret: process.env.COINBASE_API_SECRET
});

// Get all accounts
export async function getCoinbaseAccounts() {
  const response = await client.getAccounts();
  return response.data;
}

// Get real-time BTC price
export async function getBTCPrice() {
  const response = await client.getMarketTrades({
    productId: 'BTC-USD',
    limit: 1
  });
  return response.data.trades[0].price;
}

// Place market buy order
export async function buyBTC(usdAmount: number) {
  const response = await client.createOrder({
    productId: 'BTC-USD',
    side: 'BUY',
    orderType: 'MARKET',
    quoteSize: usdAmount.toString()
  });
  return response.data;
}

// Place limit sell order
export async function sellBTC(btcAmount: number, limitPrice: number) {
  const response = await client.createOrder({
    productId: 'BTC-USD',
    side: 'SELL',
    orderType: 'LIMIT',
    baseSize: btcAmount.toString(),
    limitPrice: limitPrice.toString()
  });
  return response.data;
}
```

---

### 3.4 Charles Schwab Trading API (Stock Trading)

**Purpose:** Automated stock/ETF trading  
**Documentation:** https://developer.schwab.com/  
**OAuth Guide:** https://developer.schwab.com/user-guides/get-started/authenticate-with-oauth

#### Free Tier
- ✅ **Completely free** API access
- No monthly fees
- Requires active Schwab brokerage account
- Account must be thinkorswim-enabled

#### Setup (7-Step Process)

**1. Create Schwab Developer Account**
- Register at https://developer.schwab.com/
- Separate from brokerage account

**2. Create App**
- Dashboard → "Create App"
- Choose "Accounts and Trading Production"
- Set order limit: 120 requests/minute

**3. Configure Callback URL**
- Set to: `https://127.0.0.1` or `https://127.0.0.1:8182`
- Must be HTTPS, no trailing slash

**4. Get Credentials**
- App Key (Client ID)
- App Secret (Client Secret)
- Store securely

**5. Wait for Approval**
- Takes 2-7 days
- Status changes to "Ready for Use"

**6. Manual OAuth Flow (Every 7 Days)**
- Generate auth URL
- User logs in with brokerage credentials
- Extract authorization code
- Exchange for tokens

**7. Token Management**
- Access token: 30-minute expiration
- Refresh token: 7-day hard expiration (cannot extend)
- Must re-authenticate after 7 days

#### Authentication Flow

**Step 1: Generate Authorization URL**
```typescript
const authUrl = `https://api.schwabapi.com/v1/oauth/authorize?client_id=${appKey}&redirect_uri=https://127.0.0.1`;
```

**Step 2: User Authorization**
- User visits URL, logs in with Schwab brokerage credentials
- Selects accounts to authorize
- Redirects to callback with code: `https://127.0.0.1/?code=C0.xxxxxxxxxxxx@&session=xxxxxxxxx`

**Step 3: Exchange Code for Tokens**
```typescript
import axios from 'axios';

const credentials = Buffer.from(`${appKey}:${appSecret}`).toString('base64');

const response = await axios.post(
  'https://api.schwabapi.com/v1/oauth/token',
  new URLSearchParams({
    grant_type: 'authorization_code',
    code: authorizationCode, // Include the @ symbol
    redirect_uri: 'https://127.0.0.1'
  }),
  {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
);

const { access_token, refresh_token } = response.data;
```

**Step 4: Refresh Access Token**
```typescript
const response = await axios.post(
  'https://api.schwabapi.com/v1/oauth/token',
  new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: currentRefreshToken
  }),
  {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
);
```

#### Rate Limits
- **120 order requests/minute** (configurable in app settings)
- Market data has separate limits

#### Environment Variables
```bash
SCHWAB_APP_KEY=your_app_key
SCHWAB_APP_SECRET=your_app_secret
SCHWAB_ACCESS_TOKEN=access_token_here
SCHWAB_ACCESS_TOKEN_SECRET=refresh_token_here
```

⚠️ **Important:** Tokens must be refreshed weekly via manual OAuth flow

#### Basic Integration Example
```typescript
// server/services/schwabIntegration.ts
import axios from 'axios';

const schwabApi = axios.create({
  baseURL: 'https://api.schwabapi.com/trader/v1',
  headers: {
    'Authorization': `Bearer ${process.env.SCHWAB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Get account numbers (returns encrypted hashes)
export async function getSchwabAccountNumbers() {
  const response = await schwabApi.get('/accounts/accountNumbers');
  return response.data;
}

// Get account details
export async function getSchwabAccount(accountHash: string) {
  const response = await schwabApi.get(`/accounts/${accountHash}`);
  return response.data;
}

// Place equity order
export async function placeSchwabOrder(accountHash: string, order: {
  symbol: string;
  quantity: number;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  price?: number;
}) {
  const orderPayload = {
    orderType: order.orderType,
    session: 'NORMAL',
    duration: 'DAY',
    orderStrategyType: 'SINGLE',
    orderLegCollection: [
      {
        instruction: order.side,
        quantity: order.quantity,
        instrument: {
          symbol: order.symbol,
          assetType: 'EQUITY'
        }
      }
    ],
    ...(order.orderType === 'LIMIT' && { price: order.price })
  };

  const response = await schwabApi.post(`/accounts/${accountHash}/orders`, orderPayload);
  return response.data;
}
```

---

### 3.5 Plaid (Bank Account Aggregation)

**Purpose:** Aggregate all personal bank accounts (Capital One, Discover, AmEx, etc.)  
**Documentation:** https://plaid.com/docs/  
**Sandbox:** https://sandbox.plaid.com

#### Free Tier
- **Sandbox:** ✅ Unlimited free API calls (mock data)
- **Production:** 200 free live API calls per product
- Good for MVP testing before committing to paid plan

#### Pricing Tiers
- **Test (Sandbox):** $0/month - Unlimited sandbox + 200 live calls
- **Pay as You Go:** $0 minimum, usage-based
- **Growth:** $100+/month with volume discounts
- **Scale:** $500+/month for enterprise

**Estimated Cost:** $0-100/month for MVP phase

#### Setup
1. Sign up at https://dashboard.plaid.com/signup
2. Create new application
3. Get credentials:
   - Client ID
   - Sandbox secret (for testing)
   - Development/Production secret (for live data)
4. Configure redirect URIs
5. Enable products: Auth, Balance, Transactions

#### Authentication Flow

**Plaid Link** (Frontend - User Authorization)
```tsx
import { usePlaidLink } from 'react-plaid-link';

function ConnectBankButton() {
  const { open, ready } = usePlaidLink({
    token: linkToken, // Get from backend
    onSuccess: (public_token) => {
      // Send public_token to backend to exchange for access_token
      fetch('/api/plaid/exchange-token', {
        method: 'POST',
        body: JSON.stringify({ public_token })
      });
    }
  });

  return <button onClick={() => open()} disabled={!ready}>Connect Bank</button>;
}
```

**Backend Token Exchange**
```typescript
import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';

const plaidClient = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments.sandbox, // or .development / .production
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET
    }
  }
}));

// Create link token (frontend needs this to initialize Plaid Link)
export async function createLinkToken(userId: string) {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Mundo Tango',
    products: ['auth', 'transactions'],
    country_codes: ['US'],
    language: 'en'
  });
  return response.data.link_token;
}

// Exchange public token for access token
export async function exchangePlaidToken(publicToken: string) {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken
  });
  
  // Store access_token securely for this user
  const accessToken = response.data.access_token;
  const itemId = response.data.item_id;
  
  return { accessToken, itemId };
}

// Get account balances
export async function getPlaidBalances(accessToken: string) {
  const response = await plaidClient.accountsBalanceGet({
    access_token: accessToken
  });
  return response.data.accounts;
}

// Get transactions
export async function getPlaidTransactions(accessToken: string, startDate: string, endDate: string) {
  const response = await plaidClient.transactionsGet({
    access_token: accessToken,
    start_date: startDate, // YYYY-MM-DD
    end_date: endDate
  });
  return response.data.transactions;
}
```

#### Rate Limits
- **Production:**
  - `/accounts/get`: 15 req/min per item, 15K/min per client
  - `/accounts/balance/get`: 5 req/min per item, 1.2K/min per client
  - `/auth/get`: 15 req/min per item, 12K/min per client

- **Sandbox:**
  - `/accounts/get`: 100 req/min per item, 5K/min per client
  - `/accounts/balance/get`: 25 req/min per item, 100/min per client

#### Environment Variables
```bash
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET_SANDBOX=your_sandbox_secret
PLAID_SECRET_DEVELOPMENT=your_dev_secret
PLAID_SECRET_PRODUCTION=your_prod_secret
```

---

## 4. SOCIAL MEDIA APIs

### 4.1 Facebook Graph API (Feed Posting)

**Purpose:** Cross-post content to Facebook Pages  
**Documentation:** https://developers.facebook.com/docs/graph-api  
**OAuth Guide:** https://developers.facebook.com/docs/facebook-login/guides/access-tokens/

#### Free Tier
- ✅ **Completely free** API access
- Rate limits scale with user base (no paid upgrades)

#### Setup

**1. Create Facebook App**
- Go to https://developers.facebook.com/apps/create
- Select app type: "Business"
- Fill in app details

**2. Add Facebook Login Product**
- Dashboard → Add Product → Facebook Login
- Configure Settings:
  - Valid OAuth Redirect URIs: `https://mundotango.life/auth/facebook/callback`
  - Client OAuth Login: YES
  - Web OAuth Login: YES

**3. Get App Credentials**
- Settings → Basic
- Copy App ID and App Secret

**4. Get Page Access Token (One-time)**
- Use Graph API Explorer: https://developers.facebook.com/tools/explorer/
- Select your app
- Add permissions: `pages_manage_posts`, `pages_read_engagement`
- Click "Generate Access Token"
- Exchange for long-lived token (60 days)

**5. Get Page ID**
- Go to Graph API Explorer
- Make GET request to `/me/accounts`
- Find your page, copy `id` and `access_token`

#### OAuth 2.0 Flow

**Step 1: Authorization URL**
```typescript
const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?
  client_id=${FB_APP_ID}&
  redirect_uri=https://mundotango.life/auth/facebook/callback&
  scope=public_profile,pages_manage_posts,pages_show_list&
  state=${randomStateValue}`;
```

**Step 2: Handle Callback**
```typescript
// User authorizes, Facebook redirects to callback with code
const callbackUrl = 'https://mundotango.life/auth/facebook/callback?code=ABC123&state=XYZ'

// Exchange code for token
const tokenResponse = await fetch(
  `https://graph.facebook.com/oauth/access_token?
    client_id=${FB_APP_ID}&
    client_secret=${FB_APP_SECRET}&
    redirect_uri=https://mundotango.life/auth/facebook/callback&
    code=${code}`
);

const { access_token } = await tokenResponse.json();
```

**Step 3: Get Long-Lived Token**
```typescript
const longLivedResponse = await fetch(
  `https://graph.facebook.com/oauth/access_token?
    grant_type=fb_exchange_token&
    client_id=${FB_APP_ID}&
    client_secret=${FB_APP_SECRET}&
    fb_exchange_token=${shortLivedToken}`
);

const { access_token: longLivedToken } = await longLivedResponse.json();
```

#### Post to Facebook Page
```typescript
// server/services/facebookIntegration.ts
export async function postToFacebookPage(message: string, imageUrl?: string) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  const params = new URLSearchParams({
    message: message,
    access_token: accessToken,
    ...(imageUrl && { url: imageUrl })
  });

  const endpoint = imageUrl ? 'photos' : 'feed';
  const response = await fetch(
    `https://graph.facebook.com/v20.0/${pageId}/${endpoint}?${params}`,
    { method: 'POST' }
  );

  return await response.json();
}
```

#### Rate Limits
- **200 API calls per user per 60-minute window** (sliding window)
- **App-level:** `(Yesterday Users + Today New Users) × 200 calls/hour`
- Error code 17: User limit reached
- Error code 4: App limit reached

⚠️ **Cannot request rate limit increases** - design around 200 calls/user/hour

#### Environment Variables
```bash
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=long_lived_page_token
```

---

### 4.2 Instagram Graph API (Media Posting)

**Purpose:** Cross-post photos/videos to Instagram Business account  
**Documentation:** https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/content-publishing

#### Prerequisites
- Instagram Business or Creator account
- Linked to Facebook Page
- Facebook app (same as Graph API above)

#### Setup
1. Use same Facebook App from section 4.1
2. Add Instagram Graph API product
3. Link Instagram Business account
4. Get Instagram Business Account ID:
   ```bash
   GET https://graph.facebook.com/v20.0/me/accounts?
     fields=instagram_business_account&
     access_token={PAGE_ACCESS_TOKEN}
   ```

#### Posting Process (2-Step)

**Step 1: Create Media Container**
```typescript
// Single image post
const containerResponse = await fetch(
  `https://graph.instagram.com/v20.0/${IG_USER_ID}/media`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: 'https://example.com/image.jpg',
      caption: 'Hello Instagram! #API #Test',
      access_token: PAGE_ACCESS_TOKEN
    })
  }
);

const { id: containerId } = await containerResponse.json();
```

**Step 2: Publish Container**
```typescript
const publishResponse = await fetch(
  `https://graph.instagram.com/v20.0/${IG_USER_ID}/media_publish`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: PAGE_ACCESS_TOKEN
    })
  }
);

const { id: mediaId } = await publishResponse.json();
```

#### Media Requirements
- **Format:** JPEG only (no PNG/GIF)
- **Rate Limit:** 25 API-published posts per 24 hours
- **Hashtags:** Must be URL-encoded as `%23`
- **Video:** Supported with different endpoint

#### Environment Variables
```bash
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_ig_business_id
# Uses same Facebook tokens from section 4.1
```

---

### 4.3 LinkedIn API (Professional Network Posting)

**Purpose:** Share updates to LinkedIn company page  
**Documentation:** https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api  
**Rate Limits:** https://learn.microsoft.com/en-us/linkedin/shared/api-guide/concepts/rate-limits

#### Setup

**1. Create LinkedIn App**
- Go to https://www.linkedin.com/developers/apps/new
- Fill in app details
- Select "Create App"

**2. Add Required Products**
- Dashboard → Products
- Add "Share on LinkedIn"
- Add "Sign In with LinkedIn"
- Wait for approval (instant for most apps)

**3. Get Credentials**
- Settings → Auth
- Copy Client ID and Client Secret

**4. Configure OAuth**
- Settings → Auth → OAuth 2.0 settings
- Add redirect URL: `https://mundotango.life/auth/linkedin/callback`

#### OAuth 2.0 Flow

**Required Scopes:**
- `openid` - Basic authentication
- `profile` - User profile data
- `w_member_social` - Write access to post on behalf of member

**Step 1: Authorization URL**
```typescript
const authUrl = `https://www.linkedin.com/oauth/v2/authorization?
  response_type=code&
  client_id=${LI_CLIENT_ID}&
  redirect_uri=https://mundotango.life/auth/linkedin/callback&
  scope=openid%20profile%20w_member_social`;
```

**Step 2: Exchange Code for Token**
```typescript
const tokenResponse = await fetch(
  'https://www.linkedin.com/oauth/v2/accessToken',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authorizationCode,
      client_id: LI_CLIENT_ID,
      client_secret: LI_CLIENT_SECRET,
      redirect_uri: 'https://mundotango.life/auth/linkedin/callback'
    })
  }
);

const { access_token } = await tokenResponse.json();
```

#### Post to LinkedIn
```typescript
// server/services/linkedinIntegration.ts
export async function postToLinkedIn(text: string, personUrn: string) {
  const response = await fetch(
    'https://api.linkedin.com/rest/posts',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202410'
      },
      body: JSON.stringify({
        author: personUrn, // e.g., "urn:li:person:ABC123"
        commentary: text,
        visibility: 'PUBLIC',
        lifecycleState: 'PUBLISHED',
        distribution: {
          feedDistribution: 'MAIN_FEED'
        }
      })
    }
  );

  return await response.json();
}
```

#### Rate Limits
- **Dual system:** App-level + Member-level limits
- Limits reset **daily at midnight UTC**
- Standard tier: ~5 RPM (varies by endpoint)
- Monitoring: `X-RateLimit-Remaining` header

⚠️ **Rate limits not publicly disclosed** - monitor via headers

#### Environment Variables
```bash
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_ACCESS_TOKEN=user_access_token
```

---

### 4.4 Twitter/X API v2 (Microblogging)

**Purpose:** Post tweets from Mundo Tango platform  
**Documentation:** https://developer.x.com/en/docs/x-api  
**Free Tier:** https://developer.x.com/en/portal/products/free

#### Free Tier
- **500 posts/month** (app-level)
- **100 reads/month** (very limited)
- ❌ No read access for timelines
- ✅ Can post text + media
- ✅ Login with Twitter supported

⚠️ **Severely limited** - consider upgrading to Basic ($200/mo) for production use

#### Setup

**1. Create Developer Account**
- Sign up at https://developer.x.com
- Instant approval for free tier

**2. Create Project + App**
- Dashboard → Projects → Create Project
- Create app under project
- Get credentials:
  - API Key (Consumer Key)
  - API Secret (Consumer Secret)
  - Access Token
  - Access Token Secret

**3. Configure Permissions**
- App settings → User authentication settings
- Set to "Read and Write"
- Add callback URL: `https://mundotango.life/auth/twitter/callback`

#### Authentication (OAuth 1.0a)
```typescript
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

const oauth = new OAuth({
  consumer: {
    key: process.env.TWITTER_API_KEY,
    secret: process.env.TWITTER_API_SECRET
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto
      .createHmac('sha1', key)
      .update(base_string)
      .digest('base64');
  }
});

const token = {
  key: process.env.TWITTER_ACCESS_TOKEN,
  secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};
```

#### Post Tweet
```typescript
// server/services/twitterIntegration.ts
export async function postTweet(text: string) {
  const url = 'https://api.x.com/2/tweets';
  
  const authHeader = oauth.toHeader(oauth.authorize({
    url,
    method: 'POST'
  }, token));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });

  return await response.json();
}
```

#### Rate Limits
- **Free Tier:** 50 requests per 24 hours (posting)
- **Basic Tier ($200/mo):** 10,000 posts/month, 15,000 reads/month

#### Environment Variables
```bash
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
```

---

## 5. TRAVEL APIs

### 5.1 SerpApi (Google Flights Scraping)

**Purpose:** Search Google Flights for travel recommendations  
**Documentation:** https://serpapi.com/google-flights-api  
**Pricing:** https://serpapi.com/pricing

#### Free Tier
- **100 searches/month** included at no cost
- No credit card required
- Full API access (all engines)

#### Pricing Tiers
| Plan | Cost | Searches | Rate Limit | Cost/1K |
|------|------|----------|------------|---------|
| Free | $0 | 100 | Basic | $0 |
| Developer | $50-75 | 5,000 | 1K/hour | ~$15 |
| Production | $150 | 15,000 | Higher | ~$10 |
| Enterprise | $3,750+ | 100K+ | Custom | $2.75 |

**Estimated Cost:** $0-50/month for MVP

#### Setup
1. Sign up at https://serpapi.com/users/sign_up
2. Dashboard → API Key
3. Copy API key
4. No additional configuration needed

#### Search Google Flights
```typescript
// server/services/serpapiIntegration.ts
import axios from 'axios';

export async function searchFlights(params: {
  departureAirport: string;
  arrivalAirport: string;
  outboundDate: string; // YYYY-MM-DD
  returnDate?: string;
  adults?: number;
  currency?: string;
}) {
  const response = await axios.get('https://serpapi.com/search', {
    params: {
      engine: 'google_flights',
      api_key: process.env.SERPAPI_API_KEY,
      departure_id: params.departureAirport,
      arrival_id: params.arrivalAirport,
      outbound_date: params.outboundDate,
      return_date: params.returnDate,
      adults: params.adults || 1,
      currency: params.currency || 'USD',
      hl: 'en',
      gl: 'us'
    }
  });

  return response.data;
}

// Get price insights
export async function getFlightPriceInsights(flightToken: string) {
  const response = await axios.get('https://serpapi.com/search', {
    params: {
      engine: 'google_flights_price_insights',
      api_key: process.env.SERPAPI_API_KEY,
      flight_token: flightToken
    }
  });

  return response.data;
}
```

#### Response Format
- Clean JSON with:
  - Flight schedules
  - Prices
  - Airline logos
  - Layover details
  - Price history
  - Booking options

#### Rate Limits
- Free tier: Basic throughput
- Developer ($50-75): 1,000 searches/hour
- Production: Higher limits

#### Environment Variables
```bash
SERPAPI_API_KEY=your_api_key_here
```

---

### 5.2 Kiwi.com API (Flight Search)

**Purpose:** Alternative flight search API  
**Documentation:** https://skypickerpublicapi.docs.apiary.io/  
**Access:** Invitation-only

#### ⚠️ ACCESS RESTRICTION

**Status:** 🚫 **Not recommended for MVP**

**Why:**
- **No public API access** as of 2025
- Tequila platform (B2B API) is **invitation-only**
- Affiliate program via Travelpayouts requires **50,000+ MAU minimum**
- Public widgets/deeplinks being discontinued

**Alternative Path (Travelpayouts):**
1. Build traffic to 50K+ monthly active users
2. Register at https://www.travelpayouts.com
3. Join Kiwi.com affiliate program
4. Request API access via support ticket
5. Get 3% commission per booking

**Demo Token ("picky"):**
- Available for testing/prototyping
- NOT for production use
- Real-time pricing
- Fast endpoints

**Recommendation:** Use Amadeus or SerpApi instead for MVP

---

### 5.3 Amadeus Self-Service API (Travel Data)

**Purpose:** Flight and hotel search with generous free tier  
**Documentation:** https://developers.amadeus.com/self-service  
**Pricing:** https://developers.amadeus.com/pricing

#### Free Tier
- **Test/Sandbox:** Unlimited free API calls (mock data)
- **Production:** 200-10,000 free calls/month (varies by API)
- No credit card required for testing

#### Coverage
- **Flights:** 400+ airlines (130 LCCs)
- **Hotels:** 150,000+ properties
- **Other:** Car rental, tours, activities, rail

#### Setup

**1. Create Account**
- Sign up at https://developers.amadeus.com/register

**2. Create Application**
- Dashboard → My Self-Service Apps → Create New App
- Get credentials:
  - API Key (Client ID)
  - API Secret (Client Secret)

**3. Test in Sandbox**
- Use test data: https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/test-data/
- No real bookings, no charges

**4. Move to Production**
- Sign contract
- Add billing info
- Same free quota applies

#### Authentication (OAuth 2.0)
```typescript
// Get access token
export async function getAmadeusToken() {
  const response = await fetch(
    'https://api.amadeus.com/v1/security/oauth2/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AMADEUS_CLIENT_ID,
        client_secret: process.env.AMADEUS_CLIENT_SECRET
      })
    }
  );

  const { access_token } = await response.json();
  return access_token;
}
```

#### Search Flights
```typescript
// server/services/amadeusIntegration.ts
export async function searchFlights(params: {
  origin: string; // IATA code (e.g., 'JFK')
  destination: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;
  adults: number;
}) {
  const token = await getAmadeusToken();

  const response = await fetch(
    `https://api.amadeus.com/v2/shopping/flight-offers?${new URLSearchParams({
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: params.adults.toString(),
      ...(params.returnDate && { returnDate: params.returnDate })
    })}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
}
```

#### Search Hotels
```typescript
export async function searchHotels(params: {
  cityCode: string; // e.g., 'NYC'
  checkInDate: string;
  checkOutDate: string;
  adults: number;
}) {
  const token = await getAmadeusToken();

  const response = await fetch(
    `https://api.amadeus.com/v3/shopping/hotel-offers?${new URLSearchParams({
      cityCode: params.cityCode,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults.toString()
    })}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
}
```

#### Rate Limits
- **1 call per 100 milliseconds** (test and production)
- 429 error if exceeded (wait until next month for free tier)

#### Environment Variables
```bash
AMADEUS_CLIENT_ID=your_client_id
AMADEUS_CLIENT_SECRET=your_client_secret
```

---

## 6. AI APIs

### 6.1 Daily.co (Video Conferencing for User Testing)

**Purpose:** Live video calls for AI-powered user testing sessions  
**Documentation:** https://docs.daily.co/reference/rest-api  
**Free Tier:** https://www.daily.co/pricing

#### Free Tier
- **10,000 participant minutes/month** included
- **5 available rooms** simultaneously
- ✅ Unlimited room creation/deletion
- Room recording included
- Webhooks supported

#### Setup
1. Sign up at https://dashboard.daily.co/signup
2. Dashboard → Developers → Create API Key
3. Copy API key
4. Store securely

#### Create Video Room
```typescript
// server/services/dailyIntegration.ts
export async function createDailyRoom(params: {
  name?: string; // Optional, random if not provided
  privacy?: 'public' | 'private';
  expiresIn?: number; // Hours until expiration
  enableRecording?: boolean;
  enableChat?: boolean;
}) {
  const exp = params.expiresIn 
    ? Math.floor(Date.now() / 1000) + (params.expiresIn * 3600)
    : Math.floor(Date.now() / 1000) + 86400; // Default 24 hours

  const response = await fetch(
    'https://api.daily.co/v1/rooms',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DAILY_CO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          name: params.name,
          privacy: params.privacy || 'public',
          exp,
          enable_recording: params.enableRecording ? 'cloud' : 'off',
          enable_chat: params.enableChat ?? true,
          enable_prejoin_ui: true,
          start_video_off: false,
          start_audio_off: false
        }
      })
    }
  );

  const room = await response.json();
  return room; // { id, name, url, created_at, config }
}
```

#### Start Recording
```typescript
export async function startRecording(roomName: string) {
  const response = await fetch(
    `https://api.daily.co/v1/rooms/${roomName}/recordings`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DAILY_CO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return await response.json();
}
```

#### Get Recording
```typescript
export async function getRecording(recordingId: string) {
  const response = await fetch(
    `https://api.daily.co/v1/recordings/${recordingId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.DAILY_CO_API_KEY}`
      }
    }
  );

  const recording = await response.json();
  return recording; // { id, room_name, start_ts, duration, download_link }
}
```

#### Webhooks
Configure at: Dashboard → Settings → Developers → Webhooks

**Common Events:**
- `recording.started`
- `recording.stopped`
- `recording.ready-to-download` (includes S3 URL)
- `participant.joined`
- `participant.left`

#### Rate Limits
- **Standard endpoints:** 20 req/sec (100 per 5-second window)
- **Start recording/livestream:** ~1 req/sec (5 per 5-second window)
- **DELETE rooms:** ~2 req/sec (50 per 30-second window)

#### Environment Variables
```bash
DAILY_CO_API_KEY=your_api_key_here
```

---

### 6.2 OpenAI API (AI Content Generation)

**Purpose:** GPT-4o text generation, DALL-E image generation  
**Documentation:** https://platform.openai.com/docs  
**Pricing:** https://openai.com/pricing

#### ✅ Current Status
- **API Key:** Exists in environment
- **Replit Integration:** Available (not installed)

#### Replit Integration Option

**Benefits of Using Replit Integration:**
- No separate OpenAI API key needed
- Billed to Replit credits
- Supports: GPT-5, GPT-4o, o3, o4-mini, gpt-image-1
- Simplified setup

**To Install:**
```typescript
// Use integration tool
use_integration({
  operation: 'add',
  integration_id: 'blueprint:javascript_openai_ai_integrations'
});
```

#### Alternative: Direct OpenAI API

**Pricing (Pay-per-use):**
- **GPT-4o:** $2.50/1M input tokens, $10/1M output tokens
- **GPT-4o mini:** $0.15/1M input, $0.60/1M output
- **DALL-E 3:** $0.040-0.120 per image (1024x1024)

**Rate Limits (Tier-based):**
- Tier 1 (Free): 500 RPM, 10K TPM
- Tier 2 ($5+ spent): 5K RPM, 450K TPM
- Auto-upgrades as you spend more

#### Basic Usage
```typescript
// server/services/openaiIntegration.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Text generation
export async function generateText(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000
  });

  return completion.choices[0].message.content;
}

// Image generation
export async function generateImage(prompt: string) {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024'
  });

  return response.data[0].url;
}
```

#### Environment Variables
```bash
OPENAI_API_KEY=sk-proj-... # Already exists
```

**Estimated Cost:** $50-200/month depending on usage

---

### 6.3 Anthropic Claude API (AI Fallback)

**Purpose:** Alternative AI for content generation  
**Documentation:** https://docs.claude.com/en/api  
**Pricing:** https://www.claude.com/pricing

#### ✅ Current Status
- **API Key:** Exists in environment

#### Free Credits
- **$5 free credit** for new users (no credit card)
- Equals ~5M Haiku 4.5 input tokens

#### Pricing (Pay-per-use)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| **Claude Haiku 4.5** | $1.00 | $5.00 |
| **Claude Sonnet 4.5** | $3.00 | $15.00 |
| **Claude Opus 4.1** | $15.00 | $75.00 |

**Batch API:** 50% discount (24-hour processing)  
**Prompt Caching:** 90% savings on repeated context

#### Rate Limits
- **Auto-scaling** based on usage tier
- Standard tier: ~5 RPM, ~20K TPM
- Higher tiers unlock automatically
- Monitor via response headers

#### Basic Usage
```typescript
// server/services/anthropicIntegration.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function generateWithClaude(prompt: string) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  return message.content[0].text;
}
```

#### Environment Variables
```bash
ANTHROPIC_API_KEY=sk-ant-... # Already exists
```

**Estimated Cost:** $50-200/month depending on usage

---

## 7. PAYMENT API

### 7.1 Stripe (Payment Processing)

**Purpose:** Payment processing, subscriptions, marketplace payouts  
**Documentation:** https://stripe.com/docs/api  
**Integration:** ✅ Already installed

#### ✅ Current Status
- **Stripe Blueprint:** Installed
- **Secret Key:** Exists in environment
- **Ready to use**

#### View Integration Details
```typescript
// To see complete integration setup
use_integration({
  operation: 'view',
  integration_id: 'blueprint:javascript_stripe'
});
```

#### Key Features Available
- ✅ Payment processing (2.9% + 30¢ per transaction)
- ✅ Subscriptions (recurring payments)
- ✅ Stripe Connect (marketplace payouts to creators)
- ✅ Webhook handling

#### Stripe Connect Setup (For Creator Payouts)

**1. Enable Connect**
- Stripe Dashboard → Connect → Get Started
- Select platform type: "Marketplace or platform"

**2. Onboard Connected Accounts**
```typescript
// server/services/stripeIntegration.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Connect account for creator
export async function createConnectedAccount(email: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    }
  });

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://mundotango.life/creator/onboarding/refresh',
    return_url: 'https://mundotango.life/creator/onboarding/complete',
    type: 'account_onboarding'
  });

  return { accountId: account.id, onboardingUrl: accountLink.url };
}

// Transfer funds to creator
export async function payoutToCreator(
  amount: number,
  creatorAccountId: string,
  metadata?: Record<string, string>
) {
  const transfer = await stripe.transfers.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    destination: creatorAccountId,
    metadata
  });

  return transfer;
}
```

#### Webhook Setup
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://mundotango.life/api/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `account.updated` (for Connect)
   - `payout.paid` (for Connect)

```typescript
// server/routes.ts
import { buffer } from 'micro';

app.post('/api/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(
      await buffer(req),
      sig,
      webhookSecret
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        break;
      case 'customer.subscription.created':
        // Handle new subscription
        break;
      // ... other events
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

#### Environment Variables
```bash
STRIPE_SECRET_KEY=sk_test_... # Already exists
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Pricing
- **No monthly fee**
- **2.9% + 30¢** per successful card charge
- **0.8%** additional fee for Connect transfers
- No fee for failed charges

---

## 8. COST ANALYSIS & PROJECTIONS

### Monthly Cost Breakdown (Conservative MVP Estimate)

| Category | APIs | Free Tier Usage | Estimated Overage | Monthly Cost |
|----------|------|-----------------|-------------------|--------------|
| **Financial** | Puzzle, Mercury, Coinbase, Schwab, Plaid | 200 Plaid calls | Plaid overage | $0-100 |
| **Social Media** | Facebook, Instagram, LinkedIn, Twitter | All free | Twitter upgrade? | $0-200 |
| **Travel** | SerpApi, Amadeus | 100 + 10K calls | SerpApi overage | $0-50 |
| **AI** | Daily.co, OpenAI, Claude | 10K minutes, pay-per-use | Token usage | $99-299 |
| **Payment** | Stripe | N/A (fee-based) | Transaction fees | $0 (2.9% + 30¢) |
| **TOTAL** | **16 APIs** | **Generous free tiers** | **Variable** | **$99-649/month** |

### Cost Optimization Strategies

#### 1. Start with Free Tiers
- **Puzzle.io:** Use Starter plan ($0)
- **Plaid:** Stay under 200 calls/month initially
- **SerpApi:** Use 100 free searches strategically
- **Amadeus:** Leverage 10K free calls/month
- **Daily.co:** Stay under 10K minutes

#### 2. Cache Aggressively
- **Flight data:** Cache for 6-12 hours
- **Bank balances:** Cache for 1 hour
- **Social media tokens:** Store long-lived tokens
- **API responses:** Use Redis/in-memory cache

#### 3. Batch Operations
- **Plaid:** Fetch multiple accounts in one call
- **Social media:** Queue posts, process in batches
- **AI:** Use Claude Batch API (50% discount)

#### 4. Monitor Usage
- Track API calls per day/week
- Set alerts at 75% of free tier
- Review usage monthly
- Identify inefficiencies

### Upgrade Triggers

| Service | Free Tier Limit | Upgrade Trigger | Cost After Upgrade |
|---------|----------------|-----------------|---------------------|
| Plaid | 200 calls/month | >200 connections | $100+/month |
| Twitter | 500 posts/month | Need timeline access | $200/month |
| SerpApi | 100 searches/month | >100 flight searches | $50-75/month |
| Daily.co | 10K minutes/month | >10K testing minutes | $99/month |
| OpenAI | Pay-per-use | High text generation | Scales with usage |

---

## 9. RATE LIMIT STRATEGY

### Global Rate Limit Handling

```typescript
// server/utils/rateLimitHandler.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Per-API rate limiters
const rateLimiters = {
  coinbase: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(30, '1 s'), // 30 req/sec
    analytics: true
  }),
  plaid: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 req/min
    analytics: true
  }),
  facebook: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(200, '1 h'), // 200 req/hour
    analytics: true
  })
};

export async function checkRateLimit(
  apiName: keyof typeof rateLimiters,
  identifier: string
): Promise<boolean> {
  const limiter = rateLimiters[apiName];
  const { success, remaining, reset } = await limiter.limit(identifier);
  
  if (!success) {
    const waitTime = reset - Date.now();
    console.warn(`Rate limit exceeded for ${apiName}. Retry in ${waitTime}ms`);
    return false;
  }
  
  return true;
}

// Exponential backoff retry
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.response?.status === 429) {
        const waitTime = Math.min(1000 * 2 ** attempt, 32000); // Max 32s
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Per-API Strategies

#### Coinbase (30 req/sec)
- Use WebSocket for real-time price updates (avoid polling)
- Batch order status checks
- Cache market data for 30 seconds

#### Plaid (5-15 req/min)
- Refresh balances max once per hour
- Use webhooks for transaction updates
- Batch account fetches in single call

#### Facebook/Instagram (200 req/user/hour)
- Queue posts, process during off-peak
- Cache user profiles for 24 hours
- Use long-lived tokens (60 days)

#### Schwab (120 req/min)
- Cache market data for 5 minutes
- Batch order status checks
- Use streaming quotes when available

#### Daily.co (20 req/sec)
- Create rooms in advance (cache for 24 hours)
- Use auto-expiring rooms to avoid hitting 5-room limit
- Batch recording fetches

---

## 10. CREDENTIAL MANAGEMENT

### Secret Naming Conventions

**Format:** `{SERVICE}_{TYPE}_{PURPOSE}`

Examples:
```bash
# API Keys
PUZZLE_IO_API_KEY=
SERPAPI_API_KEY=
DAILY_CO_API_KEY=

# OAuth Credentials
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Access Tokens
FACEBOOK_PAGE_ACCESS_TOKEN=
SCHWAB_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN=

# Account IDs
INSTAGRAM_BUSINESS_ACCOUNT_ID=
FACEBOOK_PAGE_ID=

# Environment-Specific
PLAID_SECRET_SANDBOX=
PLAID_SECRET_DEVELOPMENT=
PLAID_SECRET_PRODUCTION=
```

### Development vs Production

| API | Development | Production | Notes |
|-----|-------------|------------|-------|
| Plaid | Sandbox secret | Production secret | Separate secrets per environment |
| Stripe | Test keys (sk_test_) | Live keys (sk_live_) | Never mix test/live |
| Coinbase | Sandbox environment | Production environment | Separate API keys |
| Schwab | Same OAuth app | Same OAuth app | Manual token refresh every 7 days |
| Amadeus | Test credentials | Production credentials | Same free tier quota |
| Social Media | Test apps | Production apps | Separate app IDs for each |

### Secrets Security Checklist

✅ **DO:**
- Store secrets in Replit Secrets (encrypted at rest)
- Use separate credentials for dev/staging/production
- Rotate tokens regularly (every 90 days minimum)
- Use environment variables, never hardcode
- Implement token refresh logic for OAuth
- Monitor for unauthorized access attempts
- Use webhook signatures to verify authenticity

❌ **DON'T:**
- Commit secrets to Git
- Expose secrets in frontend code
- Share production credentials across environments
- Log secrets in application logs
- Store tokens in localStorage/cookies (except short-lived)
- Use weak encryption for token storage

### Token Storage Database Schema

```typescript
// shared/schema.ts
import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const apiCredentials = pgTable('api_credentials', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id),
  service: varchar('service', { length: 50 }).notNull(), // 'facebook', 'plaid', etc.
  credentialType: varchar('credential_type', { length: 50 }).notNull(), // 'access_token', 'refresh_token'
  encryptedValue: text('encrypted_value').notNull(), // AES-256 encrypted
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

### Token Refresh Worker

```typescript
// server/workers/tokenRefresher.ts
import cron from 'node-cron';

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Checking for tokens needing refresh...');
  
  // Get all tokens expiring in next 6 hours
  const expiringTokens = await db
    .select()
    .from(apiCredentials)
    .where(
      sql`expires_at < NOW() + INTERVAL '6 hours' 
          AND credential_type = 'access_token'`
    );

  for (const token of expiringTokens) {
    try {
      switch (token.service) {
        case 'facebook':
          await refreshFacebookToken(token);
          break;
        case 'schwab':
          await refreshSchwabToken(token);
          break;
        case 'linkedin':
          await refreshLinkedInToken(token);
          break;
        // ... other services
      }
      console.log(`✅ Refreshed ${token.service} token for user ${token.userId}`);
    } catch (error) {
      console.error(`❌ Failed to refresh ${token.service} token:`, error);
      // Send alert to user
    }
  }
});
```

---

## 11. IMPLEMENTATION PRIORITY

### Phase 1: High Priority (Week 1-2)

**Goal:** Financial tracking functional

1. **Plaid** - Aggregate all bank accounts
2. **Mercury** - Business banking data
3. **Coinbase** - Crypto portfolio tracking
4. **OpenAI** - Mr Blue AI conversations

**Why First:**
- Core Life CEO feature
- User-requested functionality
- High value, low complexity
- Generous free tiers

---

### Phase 2: Medium Priority (Week 3-4)

**Goal:** Social media cross-posting active

5. **Facebook Graph API** - Post to Facebook Page
6. **Instagram Graph API** - Share photos/videos
7. **Stripe Connect** - Creator payouts setup
8. **Daily.co** - User testing infrastructure

**Why Second:**
- Growth features (viral sharing)
- Revenue features (marketplace)
- User engagement tools

---

### Phase 3: Lower Priority (Week 5-6)

**Goal:** Complete integrations

9. **LinkedIn API** - Professional network posting
10. **Twitter/X API** - Microblogging (if budget allows)
11. **SerpApi** - Flight search
12. **Amadeus** - Hotel/travel data
13. **Schwab** - Stock trading (complex OAuth)
14. **Puzzle.io** - Business accounting (requires approval)
15. **Anthropic Claude** - AI fallback/diversification

**Why Last:**
- Complex setup (Schwab 7-day tokens, Puzzle.io approval)
- Lower user demand initially
- Budget-dependent (Twitter upgrade)

---

### Phase 4: Ongoing (Post-Launch)

**Monitoring & Optimization:**
- Track API usage vs free tier limits
- Optimize caching strategies
- Implement rate limit monitoring
- Review monthly costs
- Scale based on user demand

---

## 12. NEXT STEPS - VY PROMPT REFERENCE

All API setup instructions have been created as VY (Vy) prompts for easy implementation:

### Created VY Prompts (Located in project root)

1. ✅ `VY_PROMPT_FACEBOOK_PERMANENT_TOKEN.md` - Get long-lived Facebook Page token
2. ✅ `VY_PROMPT_FACEBOOK_TOKEN_VERIFICATION.md` - Verify token permissions
3. ✅ `VY_PROMPT_TIKTOK_SETUP.md` - TikTok API setup (if needed)
4. ✅ `VY_PROMPT_DAILY_CO_SETUP.md` - Daily.co video API setup

### Ready to Create (Per API)

Each VY prompt should follow this template:

```markdown
# VY PROMPT: [API NAME] Integration Setup

**Task:** Set up [API Name] integration for Mundo Tango platform

**Prerequisites:**
- [ ] Account created at [signup URL]
- [ ] App/credentials obtained

**Setup Steps:**

1. **Create Account & App**
   - Go to [URL]
   - Fill in [details]
   - Wait for approval (if needed)

2. **Get Credentials**
   ```bash
   # Add to Replit Secrets
   [API_KEY_NAME]=your_key_here
   ```

3. **Test Connection**
   ```typescript
   // Test code here
   ```

4. **Verification**
   - [ ] API call successful
   - [ ] Rate limit headers present
   - [ ] Error handling works

**Common Issues:**
- Issue 1: Solution
- Issue 2: Solution

**Documentation:**
- [API Docs URL]
- [OAuth Guide URL]
```

---

## 13. CONCLUSION

### Summary

✅ **Research Complete** for 16 APIs:
- 5 Financial APIs (Plaid, Mercury, Coinbase, Schwab, Puzzle.io)
- 4 Social Media APIs (Facebook, Instagram, LinkedIn, Twitter)
- 3 Travel APIs (SerpApi, Amadeus, Kiwi.com)
- 3 AI APIs (Daily.co, OpenAI, Claude)
- 1 Payment API (Stripe - already integrated)

✅ **Current Status:**
- OpenAI API key exists
- Anthropic API key exists
- Stripe integration complete
- 13 APIs ready for setup

✅ **Cost Projection:**
- MVP Phase: $99-649/month (conservative)
- Free tiers cover most early usage
- Scales with user growth

✅ **Implementation Priority:**
- Phase 1 (Weeks 1-2): Financial APIs + OpenAI
- Phase 2 (Weeks 3-4): Social Media + Stripe Connect
- Phase 3 (Weeks 5-6): Travel + Advanced features

### Ready for Implementation

This guide provides everything needed to:
1. Set up each API integration
2. Manage credentials securely
3. Handle rate limits effectively
4. Optimize costs
5. Scale as user base grows

**Next Action:** Begin Phase 1 implementation with Plaid integration for bank account aggregation.

---

**Document Completed:** November 13, 2025  
**Last Updated:** November 13, 2025  
**Status:** ✅ READY FOR IMPLEMENTATION

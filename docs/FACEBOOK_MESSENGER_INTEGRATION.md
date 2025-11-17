# Facebook Messenger Integration - Complete Guide

## Overview
Complete Facebook Messenger integration for Mundo Tango, featuring:
- ✅ **Autonomous Token Generation** (Mr. Blue "Computer Use" Feature)
- ✅ **AI-Powered Invite Messages** (Personalized, context-aware invites)
- ✅ **Rate Limiting & Monitoring** (Phase 1: 5/day, 1/hour)
- ✅ **Comprehensive API** (Send, validate, track invitations)
- ✅ **Manual Token Generation** (Fallback guide)

---

## 🤖 Method 1: Autonomous Token Generation (Mr. Blue)

### What is "Computer Use"?
Mr. Blue's "computer use" feature leverages **Playwright browser automation** to autonomously:
1. Launch a real Chromium browser
2. Navigate to Facebook and login
3. Handle 2FA (with manual code entry support)
4. Navigate to Facebook Developer Console
5. Extract/Generate Page Access Token
6. Save token to environment variables

### Prerequisites
- ✅ Playwright installed (`@playwright/test` in package.json)
- ✅ System dependencies installed (chromium, X11 libraries)
- ✅ Facebook credentials in Replit Secrets:
  - `FACEBOOK_EMAIL`
  - `FACEBOOK_PASSWORD`
  - `FACEBOOK_PAGE_ID`

### Execution Methods

#### Option A: Direct Script (Recommended)
```bash
npx tsx scripts/generate-facebook-token-direct.ts
```

**What it does:**
- Runs FacebookTokenGenerator directly (bypasses API auth)
- Launches browser in **non-headless mode** (for 2FA)
- Saves token to `facebook-token.txt`
- Displays full execution log

**Limitations on Replit:**
- ⚠️ Replit doesn't support interactive browser windows (no display)
- ✅ Works on local development machines
- ✅ Works on VPS/cloud servers with X11 forwarding

#### Option B: API Endpoint
```bash
POST /api/facebook/generate-token-autonomous
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "email": "your@email.com",
  "password": "yourpassword",
  "appId": "122157503636969453",
  "headless": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Token generated successfully via autonomous browser automation",
  "token": "EAABsb...",
  "expiresIn": 5184000,
  "expiresInDays": 60,
  "steps": [
    "🤖 Starting autonomous Facebook token generation...",
    "Browser initialized successfully",
    "✅ Login successful!",
    "✅ Token extracted: EAABsb..."
  ],
  "nextSteps": [
    "Copy the token from the response",
    "Update FACEBOOK_PAGE_ACCESS_TOKEN in Replit Secrets",
    "Restart the application workflow",
    "Test with /api/facebook/validate-token"
  ]
}
```

### Code Architecture

**FacebookTokenGenerator.ts** (350 lines)
```typescript
class FacebookTokenGenerator {
  // Main method
  async generatePageAccessToken(
    email: string,
    password: string,
    appId: string,
    headless: boolean = false
  ): Promise<TokenGenerationResult>
  
  // Private methods
  private async initBrowser(headless: boolean): Promise<void>
  private async loginToFacebook(email: string, password: string): Promise<boolean>
  private async navigateAndGenerateToken(appId: string): Promise<string | null>
  private async exchangeForLongLivedToken(...): Promise<TokenGenerationResult>
}
```

**Key Features:**
- 🤖 **Smart 2FA Detection**: Pauses for 60s when 2FA prompt detected
- 🔍 **Multiple Selector Strategies**: Tries 5+ different selectors to find token
- 📸 **Debug Screenshots**: Saves screenshot to `/tmp/fb-token-debug.png` on failure
- 🔄 **Token Exchange**: Can extend short-lived tokens to 60-90 days
- 🛡️ **Anti-Detection**: Random delays, human-like behavior

---

## 📝 Method 2: Manual Token Generation (Fallback)

### Step-by-Step Guide

#### 1. Access Facebook Developers
Visit: https://developers.facebook.com/tools/accesstoken/

#### 2. Login
Use your Facebook account that manages the `@mundotango1` page

#### 3. Find Your App
- Look for App ID: `122157503636969453`
- Or navigate to: https://developers.facebook.com/apps/122157503636969453/

#### 4. Generate Page Access Token
- Click "Access Token Tool" in left sidebar
- Find your page: "@mundotango1"
- Click "Generate Token"
- Copy the token (starts with `EAA...`)

#### 5. Exchange for Long-Lived Token (60-90 days)
```bash
curl -G https://graph.facebook.com/v18.0/oauth/access_token \
  -d grant_type=fb_exchange_token \
  -d client_id=YOUR_APP_ID \
  -d client_secret=YOUR_APP_SECRET \
  -d fb_exchange_token=SHORT_LIVED_TOKEN
```

#### 6. Save to Replit Secrets
- Open Replit Secrets panel
- Update `FACEBOOK_PAGE_ACCESS_TOKEN`
- Restart application workflow

#### 7. Verify
```bash
curl http://localhost:5000/api/facebook/validate-token
```

---

## 🔌 Facebook Messenger API

### Endpoints

#### 1. Send Invitation
```bash
POST /api/facebook/send-invitation
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "recipientEmail": "sboddye@gmail.com",
  "customMessage": "Join me on Mundo Tango!" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "invitation": {
    "id": 123,
    "recipientEmail": "sboddye@gmail.com",
    "status": "sent",
    "messageId": "m_abc123",
    "generatedMessage": "Hey! 🎵 I found this amazing tango community..."
  }
}
```

#### 2. Validate Token
```bash
GET /api/facebook/validate-token
```

**Response:**
```json
{
  "valid": true,
  "pageInfo": {
    "id": "122157503636969453",
    "name": "@mundotango1",
    "accessToken": "EAA...3453" (masked)
  },
  "expiresAt": "2026-01-16T12:00:00Z",
  "daysRemaining": 60
}
```

#### 3. Get Invitation Stats
```bash
GET /api/facebook/invitations/stats
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "today": {
    "sent": 2,
    "limit": 5,
    "remaining": 3
  },
  "thisHour": {
    "sent": 1,
    "limit": 1,
    "remaining": 0
  },
  "allTime": {
    "sent": 47,
    "accepted": 12,
    "pending": 35
  }
}
```

#### 4. List Invitations
```bash
GET /api/facebook/invitations?status=sent&limit=50
Authorization: Bearer <JWT_TOKEN>
```

---

## 🧠 AI Invite Generator

### How It Works
The `AIInviteGenerator` service creates **personalized, context-aware** invitation messages using:
- User profile data (name, tango experience level)
- Recipient preferences
- Platform features highlighting
- Emotional connection to tango

### Example Generated Messages

**For Beginners:**
```
Hey! 🎵 I found this amazing tango community called Mundo Tango 
and thought you might love it! 

They have:
✨ Beginner-friendly workshops
🎭 Virtual milongas every week
📚 Free learning resources

Perfect for starting your tango journey! Want to join?

[Join Mundo Tango](https://mundotango.life/signup?ref=invite_abc123)
```

**For Advanced Dancers:**
```
¡Hola! 💃 Discovered an incredible platform for tango professionals.

Mundo Tango connects:
🌍 International dancers & teachers
🎪 High-level workshops & masterclasses
🤝 Collaboration opportunities

Your expertise would add so much value to this community!

[Explore Mundo Tango](https://mundotango.life/signup?ref=invite_abc123)
```

### Customization
```typescript
const inviteGenerator = new AIInviteGenerator();
const message = await inviteGenerator.generateInvite({
  senderName: "Dmitry",
  recipientEmail: "sboddye@gmail.com",
  relationship: "tango partner",
  recipientTangoLevel: "intermediate",
  highlightFeatures: ["events", "marketplace", "workshops"]
});
```

---

## 🛡️ Rate Limiting

### Phase 1 Limits (Current)
- **Daily**: 5 invitations per user
- **Hourly**: 1 invitation per user
- **Cooldown**: 1 hour between invites to same recipient

### Implementation
```typescript
// Automatic enforcement in FacebookMessengerService
const canSend = await this.checkRateLimit(userId);
if (!canSend) {
  throw new Error('Rate limit exceeded');
}
```

### Monitoring
```typescript
// Track usage in database
await storage.createFriendInvitation({
  senderId: userId,
  recipientEmail,
  invitationType: 'facebook_messenger',
  status: 'sent',
  messageId: fbMessageId,
  generatedMessage: message
});
```

---

## 🔧 Troubleshooting

### "Token Expired" Error
**Solution:** Regenerate token using Method 1 or Method 2

### "Rate Limit Exceeded" Error
**Check:**
```bash
GET /api/facebook/invitations/stats
```
**Wait:** Until next hour or next day

### "Login Failed" in Autonomous Generation
**Common Causes:**
1. Incorrect credentials
2. Facebook detected automation
3. 2FA code not entered
4. Account temporarily blocked

**Solutions:**
- Verify FACEBOOK_EMAIL and FACEBOOK_PASSWORD in Secrets
- Use Manual Method instead
- Check for Facebook security alerts
- Try from local machine with display support

### "CSRF Protection Failed"
**Cause:** Missing or invalid JWT token
**Solution:** Include `Authorization: Bearer <token>` header

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   MUNDO TANGO PLATFORM                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              MR. BLUE AI PARTNER SYSTEM                      │
│  ┌────────────────────────────────────────────────┐          │
│  │   System 9: Computer Use (Playwright)          │          │
│  │   - FacebookTokenGenerator                     │          │
│  │   - Autonomous browser automation              │          │
│  │   - 2FA support                                │          │
│  └────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         FACEBOOK MESSENGER INTEGRATION                       │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ Token Management │  │ Message Sending  │                 │
│  │ - Generate       │  │ - AI Invites     │                 │
│  │ - Validate       │  │ - Rate Limiting  │                 │
│  │ - Refresh        │  │ - Tracking       │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ Invitation DB    │  │ Analytics        │                 │
│  │ - friend_invites │  │ - Sent/Accepted  │                 │
│  │ - Status tracking│  │ - Conversion     │                 │
│  └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              FACEBOOK GRAPH API v18.0                        │
│  - Page Access Token (60-90 days)                            │
│  - Message sending to @mundotango1 page                      │
│  - User lookup & verification                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
server/
├── services/
│   └── facebook/
│       ├── FacebookTokenGenerator.ts       # 🤖 Autonomous token generation
│       ├── FacebookMessengerService.ts     # 📨 Message sending + validation
│       └── AIInviteGenerator.ts            # 🧠 AI-powered invite messages
│
├── routes/
│   └── facebook-messenger-routes.ts        # 📡 API endpoints
│
└── storage.ts                               # 💾 Database operations

scripts/
├── generate-facebook-token-direct.ts       # 🚀 Direct token generation
└── test-facebook-token-generation.ts       # 🧪 API-based token generation

docs/
└── FACEBOOK_MESSENGER_INTEGRATION.md       # 📖 This guide
```

---

## 🎯 Next Steps

### Immediate (Week 9 Day 5)
- [x] Build autonomous token generator
- [x] Install Playwright dependencies
- [x] Create API endpoints
- [ ] **Manual token generation** (current blocker)
- [ ] Test end-to-end invite sending

### Phase 2 (Week 10)
- [ ] Increase rate limits (20/day)
- [ ] Batch invitation support
- [ ] Email fallback for failed FB messages
- [ ] Analytics dashboard
- [ ] A/B testing for invite messages

### Phase 3 (Week 11)
- [ ] WhatsApp integration
- [ ] SMS integration (Twilio)
- [ ] Multi-channel orchestration
- [ ] Conversion tracking
- [ ] Referral rewards system

---

## 📞 Support

**Token Issues:**
1. Try manual generation (Method 2)
2. Check token expiration: `GET /api/facebook/validate-token`
3. Review browser automation logs: `/tmp/fb-token-debug.png`

**Rate Limit Issues:**
1. Check stats: `GET /api/facebook/invitations/stats`
2. Wait for cooldown period
3. Contact admin for limit increase

**Technical Issues:**
1. Check workflow logs: `Start application` workflow
2. Verify all secrets are set in Replit Secrets
3. Ensure database is running: `GET /api/health`

---

**Last Updated:** November 17, 2025  
**Version:** 1.0  
**Status:** Infrastructure Complete, Awaiting Valid Token

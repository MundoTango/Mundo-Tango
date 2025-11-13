# API Key Setup Guide - Mundo Tango
**For:** Production deployment at mundotango.life  
**Total Time:** 1h 10min for all 5 services  
**Cost:** $40/month (God Level) or $0/month (Basic)

---

## 🎯 QUICK START OPTIONS

### Option 1: Basic Launch (20 min, $0/month)
✅ Email verification (Resend free tier)  
✅ Authentication working  
⏸️ No God Level features

**What You Need:**
- RESEND_API_KEY (free)

**Perfect For:** MVP launch, initial user testing

---

### Option 2: Revenue Launch (30 min, $0/month + Stripe fees)
✅ Basic Launch features  
✅ Payment processing (Stripe)  
✅ Subscription billing

**What You Need:**
- RESEND_API_KEY (free)
- STRIPE_SECRET_KEY (production)
- STRIPE_PUBLISHABLE_KEY (production)
- STRIPE_WEBHOOK_SECRET

**Perfect For:** Monetization, Premium tier ($15/mo)

---

### Option 3: God Level Launch (1h 30min, $40/month)
✅ All Revenue Launch features  
✅ Video avatars (D-ID)  
✅ Voice cloning (ElevenLabs)  
✅ $4,950/month revenue potential (50 users × $99)

**What You Need:**
- All from Option 2
- DID_API_KEY ($18-35/mo)
- ELEVENLABS_API_KEY ($22/mo)

**Perfect For:** Full platform, God Level tier monetization, 99.2% profit margin

---

## 📧 SERVICE 1: RESEND EMAIL (10 min)

**Priority:** 🔴 **P0 CRITICAL** - Required for user registration

**What It Does:**
- Email verification links
- Password reset emails
- Event reminders
- Booking confirmations
- Payment receipts

### Step-by-Step Setup

#### Step 1: Sign Up (5 min)
1. Go to **https://resend.com/signup**
2. Enter your email (use your@mundotango.life or personal)
3. Verify email (check inbox)
4. Complete profile

#### Step 2: Create API Key (2 min)
1. Navigate to **API Keys** in sidebar
2. Click **Create API Key**
3. Name: `Mundo Tango Production`
4. Permission: **Sending access** (default)
5. Click **Create**
6. **COPY THE KEY** (starts with `re_`)
   - ⚠️ You can only see it once!
   - Save it temporarily in a secure note

#### Step 3: Add to Replit Secrets (2 min)
1. Open Replit project
2. Click **Tools** → **Secrets** (or lock icon in sidebar)
3. Click **New Secret**
4. Key: `RESEND_API_KEY`
5. Value: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (paste your key)
6. Click **Add Secret**

#### Step 4: Restart Workflow (1 min)
1. Go to **Workflows** tab
2. Find **Start application**
3. Click **Restart** (or it auto-restarts)
4. Wait for server to start (~30 seconds)

### Verification (2 min)

Test email sending:
```bash
# Option A: Register new test account
POST https://mundotango.life/api/auth/register
{
  "email": "test@youremail.com",
  "password": "TestPassword123!",
  "username": "testuser"
}

# Check your inbox for verification email

# Option B: Check server logs
# Should see: ✅ Verification email sent to: test@youremail.com
# Instead of: ⚠️ RESEND_API_KEY not configured
```

### Pricing

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for MVP

**Pro Plan ($20/mo):**
- 50,000 emails/month
- $1 per 1,000 additional emails
- Custom sending domains
- Analytics dashboard

**Recommendation:** Start with free tier, upgrade when >100 users/day

---

## 💳 SERVICE 2: STRIPE PAYMENTS (15 min)

**Priority:** 🟠 **P1 HIGH** - Required for revenue

**What It Does:**
- Premium tier subscriptions ($15/mo)
- God Level subscriptions ($99/mo)
- Event ticket sales
- Marketplace transactions

### Step-by-Step Setup

#### Step 1: Verify Stripe Account (0 min)
You likely already have a Stripe account. If not:
1. Go to **https://stripe.com/register**
2. Complete business verification (may take 1-2 days)
3. Add bank account for payouts

#### Step 2: Switch to Production Mode (1 min)
1. Log in to **https://dashboard.stripe.com**
2. Toggle **Test mode** → **Production mode** (top-left switch)
3. ⚠️ Ensure you're in PRODUCTION mode (not test)

#### Step 3: Get API Keys (3 min)
1. Navigate to **Developers** → **API keys**
2. Find **Publishable key** (starts with `pk_live_`)
   - Click **Reveal test key token**
   - Copy: `pk_live_xxxxxxxxxxxxxxxxxxxxx`
3. Find **Secret key** (starts with `sk_live_`)
   - Click **Reveal test key token**
   - Copy: `sk_live_xxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ NEVER share or commit this key!

#### Step 4: Create Webhook (5 min)
1. Navigate to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://mundotango.life/api/stripe/webhook`
4. Description: `Mundo Tango Production Webhook`
5. Events to send:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Click **Add endpoint**
7. Click **Reveal** under **Signing secret**
8. Copy: `whsec_xxxxxxxxxxxxxxxxxxxxx`

#### Step 5: Create Price IDs (4 min)
1. Navigate to **Products** → **Add product**

**Premium Tier:**
- Name: `Mundo Tango Premium`
- Description: `Access to premium features`
- Pricing: **Recurring** - **Monthly**
- Price: `$15.00 USD`
- Click **Save product**
- Copy **Price ID**: `price_xxxxxxxxxxxxx`

**God Level Tier:**
- Click **Add product**
- Name: `Mundo Tango God Level`
- Description: `AI-powered marketing with video avatars and voice cloning`
- Pricing: **Recurring** - **Monthly**
- Price: `$99.00 USD`
- Click **Save product**
- Copy **Price ID**: `price_xxxxxxxxxxxxx`

#### Step 6: Add to Replit Secrets (2 min)
Add these 5 secrets:

1. `STRIPE_SECRET_KEY` = `sk_live_xxxxx`
2. `STRIPE_PUBLISHABLE_KEY` = `pk_live_xxxxx`
3. `STRIPE_WEBHOOK_SECRET` = `whsec_xxxxx`
4. `STRIPE_PREMIUM_PRICE_ID` = `price_xxxxx` (Premium $15/mo)
5. `STRIPE_GOD_LEVEL_PRICE_ID` = `price_xxxxx` (God Level $99/mo)

#### Step 7: Update Frontend (if needed)
Check `client/src` for any hardcoded price IDs. If found, replace with environment variables.

### Verification (3 min)

Test payment flow:
```bash
# 1. Navigate to pricing page: https://mundotango.life/pricing
# 2. Click "Subscribe to Premium"
# 3. Enter test card: 4242 4242 4242 4242
# 4. Exp: 12/34, CVC: 123
# 5. Complete purchase
# 6. Check Stripe dashboard → Payments (should see $15.00)
# 7. Check user account → should have Premium tier active
```

### Production Safety

**Testing in Production (Safe Method):**
1. Use Stripe test card numbers (won't charge real money)
2. Test cards: https://stripe.com/docs/testing#cards
3. Refund test transactions immediately

**Monitoring:**
1. Enable email notifications in Stripe dashboard
2. Set up failed payment alerts
3. Monitor revenue daily for first week

---

## 🎥 SERVICE 3: D-ID VIDEO AVATARS (15 min)

**Priority:** 🟡 **P2 GOD LEVEL** - Required for God Level tier

**What It Does:**
- Generate talking head videos from Scott's photos
- AI-powered marketing videos
- Course introduction videos
- Event announcements

### Step-by-Step Setup

#### Step 1: Sign Up (3 min)
1. Go to **https://www.d-id.com**  
   - OR **https://studio.d-id.com**
2. Click **Sign Up** or **Get Started**
3. Enter email + password
4. Verify email

#### Step 2: Choose Plan (2 min)
**Option A: Build Plan ($18/mo)** ← **RECOMMENDED**
- 32 minutes streaming video
- OR 16 minutes regular video
- API access ✅
- Perfect for 50 God Level users

**Option B: Creator Plan ($35/mo)**
- 120 minutes streaming video
- OR 60 minutes regular video
- API access ✅
- Overkill for MVP

**Decision:** Start with Build ($18/mo), upgrade if needed

**⚠️ PRICING VERIFICATION NEEDED:**
- Vy external verification should confirm $18 vs $35
- Check session ID: 019a7770-614a-720f-b600-c603aaab2cfc
- Wait for Vy results before purchasing

#### Step 3: Get API Key (5 min)
1. Navigate to **Settings** → **API** (or **Developer** section)
2. Click **Create API Key** or **Generate Key**
3. Name: `Mundo Tango Production`
4. Copy the key (format varies - might be username:password or Bearer token)
5. ⚠️ Save securely - you may not see it again!

**Note:** D-ID uses Basic authentication (username:password base64 encoded)

#### Step 4: Upload Scott's Photo (3 min)
1. Open `docs/SCOTT_BODDYE_AI_TRAINING_DATASET.md`
2. Primary photo: **Skoot (33) - Close-up smiling profile**
   - Professional headshot
   - Clear face visibility
   - Good lighting
3. Navigate to D-ID **Studio** → **Images**
4. Click **Upload Image**
5. Select Scott's photo
6. Copy **Image ID** (starts with `img_`)

#### Step 5: Add to Replit Secrets (1 min)
1. Key: `DID_API_KEY`
2. Value: [Your D-ID API key]
3. Click **Add Secret**
4. Restart workflow

### Verification (5 min)

Test video generation:
```bash
# Option A: Use API directly
POST https://api.d-id.com/talks
Headers: {
  "Authorization": "Basic [base64(apiKey)]",
  "Content-Type": "application/json"
}
Body: {
  "source_url": "img_xxxxx", # Scott's uploaded image
  "script": {
    "type": "text",
    "input": "Welcome to Mundo Tango! I'm Scott Boddye, and I'm excited to help you on your tango journey."
  }
}

# Option B: Test via platform
# 1. Create God Level account
# 2. Generate welcome video
# 3. Check video quality
```

### Cost Monitoring

**Build Plan ($18/mo):**
- 16 minutes regular video = ~96 10-second clips
- 2 clips per God Level user = 48 users max
- **Recommendation:** Upgrade to Creator if >40 God Level users

---

## 🎤 SERVICE 4: ELEVENLABS VOICE CLONING (30 min)

**Priority:** 🟡 **P2 GOD LEVEL** - Required for God Level tier

**What It Does:**
- Clone Scott's voice from podcast
- Generate AI narration for courses
- Automated voice announcements
- Combined with D-ID for full talking videos

### Step-by-Step Setup

#### Step 1: Sign Up (3 min)
1. Go to **https://elevenlabs.io**
2. Click **Sign Up**
3. Enter email + password
4. Verify email

#### Step 2: Choose Plan (2 min)
**Creator Plan ($22/mo)** ← **RECOMMENDED**
- 100,000 characters/month
- 30 custom voices
- Commercial license ✅
- API access ✅

**Calculation:**
- 100K characters = ~16,666 words = ~33,333 seconds (~9 hours)
- 50 God Level users × 10 min/mo = 500 min = 8.3 hours ✅ FITS

#### Step 3: Download Scott's Podcast (10 min)
1. Open `docs/SCOTT_BODDYE_AI_TRAINING_DATASET.md`
2. Primary audio: **"Free Heeling with Scott Boddye" podcast**
   - Duration: 60 minutes
   - Need: 3-5 minute sample
3. Download podcast from source (YouTube, podcast app, or provided link)
4. Extract 3-5 min clip with:
   - Intro (30 sec) - Scott introducing himself
   - Teaching (2 min) - Scott explaining technique
   - Storytelling (2 min) - Scott sharing experience

**Audio Quality Requirements:**
- Clear speech (no music overlay)
- Minimal background noise
- Multiple speaking styles (intro, teaching, conversational)
- WAV or MP3 format
- 3-5 minutes total

#### Step 4: Clone Voice (10 min)
1. Log in to ElevenLabs dashboard
2. Navigate to **Voice Lab** → **Voice Cloning**
3. Click **Instant Voice Cloning**
4. Upload audio file (3-5 min clip)
5. Name: `Scott Boddye - Mundo Tango`
6. Description: `Professional tango instructor, warm and authoritative tone`
7. Labels: `god_level_marketing`, `created_by_mundo_tango`
8. Click **Add Voice**
9. Wait 2-5 minutes for processing
10. Copy **Voice ID**: `voice_xxxxxxxxxxxxx`

**Tips:**
- Use multiple samples if first clone isn't perfect
- Test with different text to verify quality
- Adjust settings if needed (stability, similarity_boost)

#### Step 5: Get API Key (2 min)
1. Navigate to **Profile** → **API Keys**
2. Click **Create API Key**
3. Name: `Mundo Tango Production`
4. Copy key (starts with `sk_`)

#### Step 6: Add to Replit Secrets (1 min)
1. `ELEVENLABS_API_KEY` = `sk_xxxxx`
2. `ELEVENLABS_VOICE_ID_SCOTT` = `voice_xxxxx` (optional, for easy reference)

### Verification (5 min)

Test voice cloning:
```bash
# Generate test speech
POST https://api.elevenlabs.io/v1/text-to-speech/[voice_id]
Headers: {
  "xi-api-key": "sk_xxxxx",
  "Content-Type": "application/json"
}
Body: {
  "text": "Welcome to Mundo Tango! I'm excited to share my passion for Argentine tango with you.",
  "model_id": "eleven_monolingual_v1"
}

# Download generated audio
# Compare to original podcast
# Verify voice similarity
```

---

## 📸 SERVICE 5: CLOUDINARY MEDIA (5 min)

**Priority:** 🟠 **P1 HIGH** - Required for image uploads

**What It Does:**
- Profile photos
- Event images
- Marketplace product photos
- Media gallery uploads

### Step-by-Step Setup

#### Step 1: Verify Existing Setup (2 min)
Check if already configured:
```bash
# In Replit, check secrets:
CLOUDINARY_CLOUD_NAME=?
CLOUDINARY_API_KEY=?
CLOUDINARY_API_SECRET=?
```

If all 3 exist: ✅ **SKIP TO VERIFICATION**

#### Step 2: Get Credentials (if needed) (3 min)
1. Log in to **https://cloudinary.com/console**
2. Navigate to **Dashboard**
3. Find **Account Details**:
   - Cloud name: `dxxxxxxxxxxxxx`
   - API Key: `123456789012345`
   - API Secret: `xxxxxxxxxxxxxxxxxxxxx`
4. Copy all 3 values

#### Step 3: Verify Pricing Tier (2 min)
1. Check **Settings** → **Plan & Billing**
2. Current tier: Free / Plus / Advanced?

**Free Tier:**
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month
- Good for 100-500 users

**Plus Tier ($99/mo):**
- 100 GB storage
- 100 GB bandwidth/month
- 100,000 transformations/month
- Good for 1,000-5,000 users

**Recommendation:** Start with free tier, monitor usage

#### Step 4: Add to Replit Secrets (if needed) (1 min)
1. `CLOUDINARY_CLOUD_NAME`
2. `CLOUDINARY_API_KEY`
3. `CLOUDINARY_API_SECRET`

### Verification (2 min)

Test image upload:
```bash
# 1. Go to https://mundotango.life/profile
# 2. Click "Edit Profile"
# 3. Upload profile photo
# 4. Check Cloudinary dashboard → Media Library
# 5. Should see uploaded image
```

---

## 🚀 FINAL CHECKLIST

### Before Launch

**P0 (Required for Basic Launch):**
- [ ] RESEND_API_KEY added
- [ ] Email verification tested

**P1 (Required for Revenue Launch):**
- [ ] All P0 complete
- [ ] STRIPE_SECRET_KEY added (production)
- [ ] STRIPE_PUBLISHABLE_KEY added (production)
- [ ] STRIPE_WEBHOOK_SECRET added
- [ ] STRIPE_PREMIUM_PRICE_ID added
- [ ] STRIPE_GOD_LEVEL_PRICE_ID added
- [ ] Payment flow tested

**P2 (Required for God Level Launch):**
- [ ] All P0 + P1 complete
- [ ] DID_API_KEY added
- [ ] ELEVENLABS_API_KEY added
- [ ] Scott's photo uploaded to D-ID
- [ ] Scott's voice cloned in ElevenLabs
- [ ] Video generation tested
- [ ] Voice generation tested

**Media Storage:**
- [ ] CLOUDINARY_CLOUD_NAME verified
- [ ] CLOUDINARY_API_KEY verified
- [ ] CLOUDINARY_API_SECRET verified
- [ ] Image upload tested

### After Adding Keys

**Restart Server:**
```bash
# Workflow auto-restarts, or manually:
# Tools → Workflows → Start application → Restart
```

**Verify Logs:**
```bash
# Check for success messages:
✅ Verification email sent to: [email]
✅ D-ID avatar created: [id]
✅ ElevenLabs voice cloned: [voice_id]

# NOT these warnings:
⚠️ RESEND_API_KEY not configured
⚠️ DID_API_KEY not configured
⚠️ ELEVENLABS_API_KEY not configured
```

---

## 💰 TOTAL COST BREAKDOWN

### Basic Launch ($0/month)
- Resend: $0 (free tier, 100 emails/day)
- **Total:** $0/month
- **Revenue Potential:** $0 (no payments configured)

### Revenue Launch ($0/month + Stripe fees)
- Resend: $0
- Stripe: 2.9% + 30¢ per transaction
- **Total:** ~$0/month fixed cost
- **Revenue Potential:** $15/mo × 50 Premium users = $750/month

### God Level Launch ($40-57/month)
- Resend: $0
- Stripe: 2.9% + 30¢ per transaction
- D-ID: $18-35/month (awaiting Vy verification)
- ElevenLabs: $22/month
- **Total:** $40-57/month
- **Revenue Potential:** $99/mo × 50 God Level users = $4,950/month
- **Profit:** $4,893-4,910/month (99.2% margin)

**ROI:** 123x (God Level revenue / cost)

---

## ⏱️ TIMELINE SUMMARY

| Option | Time | Cost/Month | Revenue Potential |
|--------|------|------------|-------------------|
| Basic Launch | 20 min | $0 | $0 |
| Revenue Launch | 30 min | $0 | $750/mo |
| God Level Launch | 1h 30min | $40-57 | $4,950/mo |

**Recommendation:** God Level Launch (highest revenue, 99.2% margin)

---

**Setup Guide Created:** November 13, 2025  
**MB.MD Track B:** Production Readiness  
**Total Services:** 5 (Email, Stripe, D-ID, ElevenLabs, Cloudinary)  
**Next Step:** Follow this guide to add all API keys →

 Launch!

# MB.MD FULL LAUNCH EXECUTION PLAN
## Mundo Tango - Complete Production Deployment

**Methodology:** MB.MD (Simultaneously, Recursively, Critically)  
**Created:** November 13, 2025  
**Status:** 🚀 EXECUTION PHASE  
**Timeline:** 2 hours total (45 min code + 1h15m external APIs)

---

## 📊 API KEY STATUS VERIFICATION

### ✅ ALREADY HAVE (VERIFIED)
```
✅ STRIPE_SECRET_KEY - exists
✅ STRIPE_PUBLISHABLE_KEY - exists
✅ VITE_STRIPE_PUBLIC_KEY - exists
✅ STRIPE_WEBHOOK_SECRET - exists
✅ OPENAI_API_KEY - exists
✅ ANTHROPIC_API_KEY - exists
✅ GROQ_API_KEY - exists
✅ GEMINI_API_KEY - exists
```

**Status:** Stripe integration already installed, AI services operational

---

### ❌ MISSING (NEED TO ADD)

**P0 Critical (Launch Blockers):**
```
❌ RESEND_API_KEY - Need for email service
❌ CLOUDINARY_CLOUD_NAME - Need for media storage
❌ CLOUDINARY_API_KEY - Need for media storage
❌ CLOUDINARY_API_SECRET - Need for media storage
```

**P1 God Level (Revenue Blockers):**
```
❌ DID_API_KEY - Need for video avatars ($4,950/month revenue)
❌ ELEVENLABS_API_KEY - Need for voice cloning ($4,950/month revenue)
```

---

## 🎯 MB.MD SIMULTANEOUS EXECUTION TRACKS

### TRACK 1: BUILD NOW (No External Dependencies)
**Timeline:** 45 minutes  
**Status:** ✅ CAN EXECUTE IMMEDIATELY

1. Database migration (3 new enterprise tables)
2. Code verification & fixes
3. Integration code preparation
4. Testing infrastructure setup

### TRACK 2: EXTERNAL API SETUP (User Required)
**Timeline:** 1 hour 15 minutes  
**Status:** ⏸️ REQUIRES USER ACTION

1. Resend email setup (10 min)
2. Cloudinary setup (10 min)
3. D-ID setup (30 min)
4. ElevenLabs setup (25 min)

### TRACK 3: PRODUCTION VERIFICATION
**Timeline:** 30 minutes  
**Status:** ⏸️ AFTER TRACKS 1 & 2

1. End-to-end testing
2. Payment flow verification
3. Email delivery testing
4. Media upload testing
5. God Level feature testing

---

## 📋 TRACK 1: BUILD NOW (MB.MD PARALLEL EXECUTION)

### Phase 1A: Database Migration (5 minutes)

**Objective:** Deploy 3 new enterprise tables to production

**Tables to Create:**
1. `webauthn_credentials` - Passwordless authentication
2. `anomaly_detections` - Security threat detection
3. `system_logs` - Enterprise logging

**Execution:**
```bash
# Force push Phase 2-4 schema changes
npm run db:push --force

# Verify tables created
psql $DATABASE_URL -c "\dt webauthn_credentials"
psql $DATABASE_URL -c "\dt anomaly_detections"
psql $DATABASE_URL -c "\dt system_logs"
```

**Success Criteria:**
- ✅ 3 new tables visible in database
- ✅ No migration errors
- ✅ Existing data intact (395 total tables)

---

### Phase 1B: Email Service Integration Prep (10 minutes)

**Objective:** Prepare code to use Resend (ready for API key)

**Implementation:**
```typescript
// server/services/emailService.ts
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export class EmailService {
  static async sendVerificationEmail(email: string, token: string) {
    if (!resend) {
      console.warn('⚠️ RESEND_API_KEY not configured - email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'Mundo Tango <noreply@mundotango.life>',
        to: [email],
        subject: 'Verify Your Email - Mundo Tango',
        html: `
          <h1>Welcome to Mundo Tango!</h1>
          <p>Click the link below to verify your email:</p>
          <a href="https://mundotango.life/verify-email?token=${token}">
            Verify Email
          </a>
        `
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }
  }

  static async sendPasswordReset(email: string, token: string) {
    if (!resend) {
      console.warn('⚠️ RESEND_API_KEY not configured - email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'Mundo Tango <noreply@mundotango.life>',
        to: [email],
        subject: 'Reset Your Password - Mundo Tango',
        html: `
          <h1>Password Reset Request</h1>
          <p>Click the link below to reset your password:</p>
          <a href="https://mundotango.life/reset-password?token=${token}">
            Reset Password
          </a>
          <p>This link expires in 1 hour.</p>
        `
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }
  }

  static async sendWelcomeEmail(email: string, name: string) {
    if (!resend) return { success: false };

    try {
      const { data, error } = await resend.emails.send({
        from: 'Mundo Tango <welcome@mundotango.life>',
        to: [email],
        subject: 'Welcome to Mundo Tango! 💃🕺',
        html: `
          <h1>Welcome ${name}!</h1>
          <p>You're now part of the global tango community.</p>
          <p><a href="https://mundotango.life/dashboard">Get Started</a></p>
        `
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Welcome email error:', error);
      return { success: false, error };
    }
  }
}
```

**Package Installation:**
```bash
# Add Resend SDK
npm install resend
```

**Success Criteria:**
- ✅ Resend SDK installed
- ✅ EmailService class updated
- ✅ Graceful degradation (works without API key, logs warning)
- ✅ Ready for RESEND_API_KEY to be added

---

### Phase 1C: Cloudinary Integration Prep (10 minutes)

**Objective:** Prepare code to use Cloudinary (ready for credentials)

**Check Existing Implementation:**
```typescript
// server/services/mediaService.ts - verify configuration
```

**Add Environment Variable Checks:**
```typescript
// server/services/mediaService.ts
import { v2 as cloudinary } from 'cloudinary';

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('⚠️ Cloudinary not configured - media uploads will fail');
}

export class MediaService {
  static async uploadImage(file: Express.Multer.File) {
    if (!isConfigured) {
      return { 
        success: false, 
        error: 'Cloudinary not configured' 
      };
    }

    try {
      // Existing upload logic...
    } catch (error) {
      // Error handling...
    }
  }
}
```

**Success Criteria:**
- ✅ Cloudinary SDK verified
- ✅ Configuration checks added
- ✅ Graceful degradation (clear error messages)
- ✅ Ready for Cloudinary credentials

---

### Phase 1D: God Level Services Prep (15 minutes)

**D-ID Video Avatar Service:**
```typescript
// server/services/videoAvatarService.ts
const isDIDConfigured = Boolean(process.env.DID_API_KEY);

export class VideoAvatarService {
  private didApiKey = process.env.DID_API_KEY;
  private didBaseUrl = 'https://api.d-id.com';

  async createAvatar(imageUrl: string) {
    if (!isDIDConfigured) {
      throw new Error('D-ID not configured - DID_API_KEY missing');
    }

    try {
      const response = await fetch(`${this.didBaseUrl}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.didApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ source_url: imageUrl })
      });

      const data = await response.json();
      return { success: true, avatarId: data.id };
    } catch (error) {
      console.error('D-ID avatar creation error:', error);
      return { success: false, error };
    }
  }

  async generateVideo(avatarId: string, script: string, voiceId: string) {
    if (!isDIDConfigured) {
      throw new Error('D-ID not configured - DID_API_KEY missing');
    }

    try {
      const response = await fetch(`${this.didBaseUrl}/talks`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.didApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_url: avatarId,
          script: {
            type: 'audio',
            audio_url: voiceId // ElevenLabs generated audio
          }
        })
      });

      const data = await response.json();
      return { success: true, videoId: data.id };
    } catch (error) {
      console.error('D-ID video generation error:', error);
      return { success: false, error };
    }
  }

  async getVideoStatus(videoId: string) {
    if (!isDIDConfigured) {
      throw new Error('D-ID not configured');
    }

    const response = await fetch(`${this.didBaseUrl}/talks/${videoId}`, {
      headers: {
        'Authorization': `Basic ${this.didApiKey}`
      }
    });

    return response.json();
  }
}
```

**ElevenLabs Voice Cloning Service:**
```typescript
// server/services/voiceCloningService.ts
const isElevenLabsConfigured = Boolean(process.env.ELEVENLABS_API_KEY);

export class VoiceCloningService {
  private apiKey = process.env.ELEVENLABS_API_KEY;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  async cloneVoice(name: string, audioSamples: string[]) {
    if (!isElevenLabsConfigured) {
      throw new Error('ElevenLabs not configured - ELEVENLABS_API_KEY missing');
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      
      for (const sample of audioSamples) {
        formData.append('files', sample);
      }

      const response = await fetch(`${this.baseUrl}/voices/add`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey!
        },
        body: formData
      });

      const data = await response.json();
      return { success: true, voiceId: data.voice_id };
    } catch (error) {
      console.error('ElevenLabs voice cloning error:', error);
      return { success: false, error };
    }
  }

  async generateSpeech(voiceId: string, text: string) {
    if (!isElevenLabsConfigured) {
      throw new Error('ElevenLabs not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey!,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        }
      );

      const audioBuffer = await response.arrayBuffer();
      return { success: true, audio: Buffer.from(audioBuffer) };
    } catch (error) {
      console.error('ElevenLabs speech generation error:', error);
      return { success: false, error };
    }
  }

  async listVoices() {
    if (!isElevenLabsConfigured) return { success: false, voices: [] };

    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.apiKey!
      }
    });

    const data = await response.json();
    return { success: true, voices: data.voices };
  }
}
```

**Success Criteria:**
- ✅ D-ID service code ready
- ✅ ElevenLabs service code ready
- ✅ Configuration checks in place
- ✅ Clear error messages when APIs not configured
- ✅ Ready for API keys

---

### Phase 1E: Code Quality & LSP Verification (5 minutes)

**Check for TypeScript Errors:**
```bash
# Run LSP diagnostics
npx tsc --noEmit

# Check for any breaking changes
```

**Success Criteria:**
- ✅ No TypeScript errors
- ✅ All imports resolved
- ✅ No breaking changes

---

## 📋 TRACK 2: EXTERNAL API SETUP (USER ACTION REQUIRED)

### API 1: Resend Email Service (10 minutes)

**Step 1: Sign Up**
- URL: https://resend.com/signup
- Free tier: 3,000 emails/month, 100/day

**Step 2: Get API Key**
1. Dashboard → API Keys
2. Create new key
3. Copy key (starts with `re_`)

**Step 3: Add to Replit Secrets**
```bash
# Add this secret in Replit Secrets tab:
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Step 4: Verify Domain (Optional for Production)**
1. Add domain: mundotango.life
2. Add DNS records (TXT, CNAME, DKIM)
3. Verify ownership

**Cost:** $0/month (free tier sufficient)  
**Timeline:** 10 minutes

---

### API 2: Cloudinary Media Storage (10 minutes)

**Step 1: Sign Up**
- URL: https://cloudinary.com/users/register_free
- Free tier: 25GB storage, 25GB bandwidth/month

**Step 2: Get Credentials**
1. Dashboard → Settings → Access Keys
2. Copy:
   - Cloud Name
   - API Key
   - API Secret

**Step 3: Add to Replit Secrets**
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Cost:** $0/month (free tier sufficient)  
**Timeline:** 10 minutes

---

### API 3: D-ID Video Avatars (30 minutes)

**Updated Pricing (2025):**
- **Build Plan**: $18/month (32 min streaming OR 16 min regular)
- **Trial**: 14-day free trial

**Step 1: Sign Up**
- URL: https://www.d-id.com/pricing/api/
- Choose: Build plan ($18/month)

**Step 2: Get API Key**
1. Studio → Settings → API Keys
2. Create API key
3. Copy key

**Step 3: Add to Replit Secrets**
```bash
DID_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Step 4: Upload Scott's Avatar**
```bash
# After API key added, run:
curl -X POST https://mundotango.life/api/video-avatar/create-avatar \
  -H "Authorization: Bearer <god-level-token>" \
  -F "image=@scotts-photo.jpg"
```

**Step 5: Test Video Generation**
```bash
curl -X POST https://mundotango.life/api/video-avatar/generate \
  -H "Authorization: Bearer <god-level-token>" \
  -d '{
    "avatarId": "scott-avatar-123",
    "script": "Welcome to Mundo Tango!",
    "voiceId": "<elevenlabs-voice-id>"
  }'
```

**Cost:** $18/month (Build plan)  
**Revenue:** $4,950/month (50 God Level subs × $99)  
**Profit Margin:** 99.6%  
**Timeline:** 30 minutes

---

### API 4: ElevenLabs Voice Cloning (25 minutes)

**Step 1: Sign Up**
- URL: https://elevenlabs.io/sign-up
- Choose: Creator plan ($22/month, 100K characters/month)

**Step 2: Get API Key**
1. Profile → API Keys
2. Create new key
3. Copy key

**Step 3: Add to Replit Secrets**
```bash
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Step 4: Clone Scott's Voice**
```bash
# Prepare 1-5 minutes of Scott's voice samples
# Upload via:
curl -X POST https://mundotango.life/api/voice-cloning/clone \
  -H "Authorization: Bearer <god-level-token>" \
  -F "name=Scott's Voice" \
  -F "samples=@scott-voice-1.mp3" \
  -F "samples=@scott-voice-2.mp3"
```

**Step 5: Test Voice Generation**
```bash
curl -X POST https://mundotango.life/api/voice-cloning/generate \
  -H "Authorization: Bearer <god-level-token>" \
  -d '{
    "voiceId": "scott-voice-123",
    "text": "Hello, this is Scott from Mundo Tango!"
  }'
```

**Cost:** $22/month (Creator plan)  
**Revenue:** Included in $4,950/month God Level revenue  
**Timeline:** 25 minutes

---

## 📋 TRACK 3: PRODUCTION VERIFICATION (30 minutes)

### Test 1: Email Verification Flow (5 min)
```bash
# 1. Register new user
curl -X POST https://mundotango.life/api/auth/register \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# 2. Check email received
# 3. Click verification link
# 4. Verify user activated in database
```

---

### Test 2: Payment Processing (10 min)
```bash
# 1. Navigate to pricing page
# 2. Click "Subscribe to Basic ($5/month)"
# 3. Enter test credit card:
#    - Card: 4242 4242 4242 4242
#    - Exp: 12/34
#    - CVC: 123
# 4. Complete checkout
# 5. Verify subscription in Stripe dashboard
# 6. Verify subscription in database
# 7. Verify user has "basic" tier access
# 8. Cancel subscription (refund)
```

---

### Test 3: Media Upload (5 min)
```bash
# 1. Upload test image
curl -X POST https://mundotango.life/api/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@test-image.jpg"

# 2. Verify image appears in Cloudinary dashboard
# 3. Verify image URL works
# 4. Test video upload (100MB max)
```

---

### Test 4: God Level Features (10 min)
```bash
# 1. Purchase God Level subscription ($99/month)
# 2. Test video avatar generation
# 3. Test voice cloning
# 4. Verify features work end-to-end
# 5. Check video/audio quality
```

---

## 📊 COMPLETION CHECKLIST

### Phase 0: Pre-Execution ✅
- [x] Verify existing API keys (Stripe, OpenAI, etc.)
- [x] Identify missing API keys
- [x] Research updated pricing (2025)
- [x] Create execution plan

### Phase 1: Build Now (45 minutes)
- [ ] 1A: Database migration (5 min)
- [ ] 1B: Email service prep (10 min)
- [ ] 1C: Cloudinary prep (10 min)
- [ ] 1D: God Level services prep (15 min)
- [ ] 1E: Code quality check (5 min)

### Phase 2: External APIs (1h 15min) - USER ACTION
- [ ] 2A: Resend email (10 min)
- [ ] 2B: Cloudinary (10 min)
- [ ] 2C: D-ID (30 min)
- [ ] 2D: ElevenLabs (25 min)

### Phase 3: Verification (30 minutes)
- [ ] 3A: Email flow test (5 min)
- [ ] 3B: Payment test (10 min)
- [ ] 3C: Media upload test (5 min)
- [ ] 3D: God Level test (10 min)

### Phase 4: Launch
- [ ] Deploy to production (mundotango.life)
- [ ] Monitor Sentry for errors
- [ ] Monitor user signups
- [ ] Monitor payment processing
- [ ] Monitor God Level subscriptions

---

## 💰 FINANCIAL SUMMARY

### Monthly Costs
```
Resend Email:        $0/month (free tier)
Cloudinary:          $0/month (free tier)
D-ID:                $18/month (Build plan - UPDATED)
ElevenLabs:          $22/month (Creator plan)
OpenAI:              $50-200/month (usage)
Neon PostgreSQL:     $0/month (free tier)
Stripe:              $0/month (2.9% + $0.30 per transaction)

TOTAL:               $90-240/month
```

### Revenue Projections (Month 6 - 1,000 users)
```
Basic ($5):          400 users × $5 = $2,000/month
Premium ($15):       150 users × $15 = $2,250/month
God Level ($99):     50 users × $99 = $4,950/month

GROSS REVENUE:       $9,200/month
COSTS:               -$240/month
NET PROFIT:          $8,960/month (97% margin) 💰
```

---

## 🚀 NEXT STEPS

**IMMEDIATE (Now):**
1. Execute Phase 1 (Build Now) - I can do this
2. Provide you with setup guide for Phase 2 (External APIs)
3. Restart workflow to apply changes
4. Run Phase 3 (Verification tests)

**USER ACTION REQUIRED:**
- Add 6 API keys (4 P0 + 2 P1)
- Total time: 1 hour 15 minutes
- Total cost: $40/month ($18 D-ID + $22 ElevenLabs)

**Ready to execute Phase 1?** 🚀


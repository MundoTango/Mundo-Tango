# Audio Conversation Feature - Integration & Testing Guide

**MB.MD Pattern 52 (SOC2 Audit) + Pattern 46 (Validation) + Pattern 48 (Completion)**

## 🎯 Integration Steps

### Step 1: Register Audio Routes in Server

**File**: `server/routes.ts`

**Location**: After line 39 (after other mrBlue imports), add:

```typescript
import audioConversationRoutes from './routes/audioConversation';
```

**Location**: In `registerRoutes()` function, after other mrBlue route registrations (search for `app.use('/api/mrblue`), add:

```typescript
app.use('/api/mrblue/audio', audioConversationRoutes);
```

**Exact code to add**:
```typescript
// Around line 40 in imports section
import audioConversationRoutes from './routes/audioConversation';

// In registerRoutes() function (search for other mrBlue routes)
app.use('/api/mrblue/audio', audioConversationRoutes);
```

### Step 2: Add AudioConversationButton to PageLayout

**File**: `client/src/components/PageLayout.tsx`

**Add import** at top:
```typescript
import { AudioConversationButton } from '@/components/AudioConversationButton';
```

**Add button** in JSX (before closing `</div>` of main layout):
```typescript
<AudioConversationButton variant="floating" />
```

**Alternative**: Add to `client/src/App.tsx` for global access across all pages.

### Step 3: Configure Environment Variables

Create or update `.env` file in project root:

```env
# ElevenLabs Configuration (required)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=optional_voice_id_or_leave_blank_for_adam

# Groq Configuration (required for transcription)
GROQ_API_KEY=your_groq_api_key_here
```

**Get API Keys**:
- ElevenLabs: https://elevenlabs.io → Profile → API Keys
- ElevenLabs Voice: https://elevenlabs.io/app/agents/voice-lab
- Groq: https://console.groq.com → API Keys

---

## 🧪 Testing Protocol (MB.MD Pattern 46)

### Pre-Flight Checks

```bash
# 1. Verify branch
git branch
# Should show: * feature/audio-conversation

# 2. Install dependencies (if needed)
npm install

# 3. Check TypeScript compilation
npm run typecheck
# Or: tsc --noEmit

# 4. Verify env vars are loaded
echo $ELEVENLABS_API_KEY
echo $GROQ_API_KEY
```

### Test Suite 1: Backend API Routes

```bash
# Start the server
npm run dev
```

**Test with curl**:

```bash
# Test 1: Start audio session (requires auth - will get 401 if not logged in, which is correct)
curl -X POST http://localhost:5000/api/mrblue/audio/start \\
  -H "Content-Type: application/json" \\
  -d '{"context":{"page":"/test"}}'

# Expected: 401 Unauthorized (correct - auth required)
# or 200 with sessionId if you have valid cookies
```

### Test Suite 2: Frontend Integration

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Application**
   - Open http://localhost:5000
   - Log in as a user with tier 5+ (or God user tier 8)

3. **Verify Button Appears**
   - Look for floating microphone button in bottom-right corner
   - Button should be visible on all pages

4. **Test Microphone Button (Basic)**
   - Click microphone button
   - Browser should prompt for microphone permission
   - Grant permission
   - Button should change to recording state (red, pulsing)
   
5. **Test Recording Flow**
   - Speak a test phrase: "Hello Mr. Blue, can you hear me?"
   - Click button again to stop recording
   - Toast should appear: "Recording Stopped - Processing your message..."
   
6. **Verify API Call**
   - Check browser console (F12)
   - Should see network request to `/api/mrblue/audio/process-audio`
   - Response should include transcription and audioUrl

7. **Test Audio Playback**
   - After processing, audio response should auto-play
   - Listen to Mr. Blue's voice response
   - Volume icon should appear while playing

### Test Suite 3: Tier-Based Access Control

**Test with Basic User (tier 0-4)**:
1. Log in as basic user
2. Click microphone button
3. Should see toast: "Upgrade Required - Voice chat requires Pro Tier 5 or higher"
4. Button should be disabled

**Test with Pro User (tier 5+)**:
1. Log in as Pro/Premium/Elite/God user
2. All features should work

### Test Suite 4: Error Handling

**Test 1: No API Keys**
```bash
# Temporarily remove API keys from .env
# Restart server
# Try to use audio feature
# Expected: "Session Error" or "Processing Error" toast
```

**Test 2: Network Failure**
- Disconnect internet
- Try to record and send
- Expected: Graceful error handling with toast notification

**Test 3: Microphone Permission Denied**
- Deny microphone permission when prompted
- Expected: "Microphone Error" toast

---

## 🐛 Troubleshooting Guide

### Issue: Button doesn't appear

**Diagnosis**:
```bash
# Check if AudioConversationButton was imported
grep -r "AudioConversationButton" client/src/
```

**Solution**: Ensure import and JSX tag were added to PageLayout.tsx or App.tsx

### Issue: "Failed to start audio session"

**Diagnosis**:
- Check server logs for errors
- Verify routes were registered in routes.ts
- Check if user is authenticated

**Solution**:
```bash
# Verify import in routes.ts
grep "audioConversationRoutes" server/routes.ts

# Verify app.use() was added
grep "'/api/mrblue/audio'" server/routes.ts
```

### Issue: "Microphone Error"

**Diagnosis**:
- Check browser permissions: chrome://settings/content/microphone
- Ensure HTTPS (mic requires secure context)
- Try different browser

**Solution**: Grant microphone permission or use HTTPS

### Issue: "Processing Error" or "Transcription failed"

**Diagnosis**:
```bash
# Check if GROQ_API_KEY is set
echo $GROQ_API_KEY

# Check server logs for Groq API errors
tail -f server.log | grep "Groq"
```

**Solution**: Set `GROQ_API_KEY` in `.env` and restart server

### Issue: No audio plays back

**Diagnosis**:
- Check browser console for audio errors
- Verify ElevenLabs API has quota
- Check network tab for TTS response

**Solution**:
- Verify `ELEVENLABS_API_KEY` is valid
- Check ElevenLabs dashboard for quota/billing
- Try refreshing page

---

## ✅ Validation Checklist (MB.MD Pattern 48)

### Code Integration
- [ ] `server/routes.ts` - Added `import audioConversationRoutes`
- [ ] `server/routes.ts` - Added `app.use('/api/mrblue/audio', audioConversationRoutes)`
- [ ] `PageLayout.tsx` or `App.tsx` - Added `import { AudioConversationButton }`
- [ ] `PageLayout.tsx` or `App.tsx` - Added `<AudioConversationButton variant="floating" />`

### Environment Setup
- [ ] `.env` file exists in project root
- [ ] `ELEVENLABS_API_KEY` is set
- [ ] `GROQ_API_KEY` is set
- [ ] `ELEVENLABS_VOICE_ID` is set (optional)

### Functionality Tests
- [ ] Server starts without errors
- [ ] TypeScript compiles with no errors
- [ ] Floating mic button appears on all pages
- [ ] Button requires tier 5+ access (shows upgrade message for basic users)
- [ ] Clicking button requests microphone permission
- [ ] Recording state changes are visual (red, pulsing)
- [ ] Audio is captured and uploaded successfully
- [ ] Transcription appears in toast notification
- [ ] Mr. Blue's voice response plays back
- [ ] Session tracking works (check console for sessionId)

### Security Tests
- [ ] Unauthenticated requests get 401
- [ ] Users can only access their own sessions
- [ ] CSRF protection is active
- [ ] Audio files are not persisted to disk
- [ ] Tier-based limits are enforced

### Performance Tests
- [ ] Audio upload completes in < 3 seconds
- [ ] Transcription completes in < 2 seconds
- [ ] TTS generation completes in < 5 seconds
- [ ] Total round-trip < 10 seconds
- [ ] No memory leaks (check browser memory after 10 conversations)

---

## 🔧 Advanced Testing

### Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Create artillery config
cat > artillery-config.yml << EOF
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - flow:
      - post:
          url: "/api/mrblue/audio/start"
          json:
            context:
              page: "/test"
          headers:
            Cookie: "your-session-cookie-here"
EOF

# Run load test
artillery run artillery-config.yml
```

### Integration with Replit

```bash
# If deploying on Replit
# 1. Set secrets in Replit Secrets tab:
#    ELEVENLABS_API_KEY
#    GROQ_API_KEY
#    ELEVENLABS_VOICE_ID

# 2. Replit will auto-restart on code changes

# 3. Access via Replit URL (auto-HTTPS)
```

---

## 📊 Success Metrics

After full integration and testing, you should have:

✅ **0 TypeScript errors**  
✅ **All 9 commits** pushed to `feature/audio-conversation` branch  
✅ **100% test passage** from validation checklist  
✅ **< 10 second** total latency for audio conversation  
✅ **Zero security vulnerabilities** (auth, CSRF, tier checking work)  
✅ **RBAC compliant** (users see only their permitted data)  

---

## 🚀 Deployment Checklist

Before merging to main:

1. [ ] All integration steps completed
2. [ ] All tests passing
3. [ ] No console errors or warnings
4. [ ] Environment variables documented
5. [ ] Code reviewed (if team workflow)
6. [ ] Performance acceptable (< 10s latency)
7. [ ] Security validated (auth, CSRF, tier limits)
8. [ ] RBAC tested (God user sees all, basic users see permitted data)
9. [ ] Documentation complete and accurate
10. [ ] Ready for production deployment

---

## 📝 Post-Deployment Monitoring

After deploying to production:

```bash
# Monitor server logs for errors
tail -f /path/to/server.log | grep "audio"

# Check ElevenLabs usage
# Visit: https://elevenlabs.io/app/usage

# Check Groq usage
# Visit: https://console.groq.com/usage

# Monitor costs
# Expected: ~$3-5 per 100 conversations
```

---

**Implementation**: Comet (Perplexity AI)  
**Following**: MB.MD v9.3 Methodologies  
**Patterns Applied**: 52 (SOC2), 46 (Validation), 48 (Completion)  
**Status**: READY FOR INTEGRATION & TESTING

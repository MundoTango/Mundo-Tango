# MB.MD Plan: Fix Mr. Blue Voice & Context Issues
**Created:** November 15, 2025  
**Methodology:** Simultaneously, Recursively, Critically

---

## 🔍 **FINDINGS FROM CODE INVESTIGATION**

### **Issue #1: Context Awareness - FALSE POSITIVE ✅❌**
- **Frontend:** ✅ breadcrumbTracker integrated, sends context with every message
- **Backend:** ❓ Unknown if backend actually USES the context in AI prompts
- **Problem:** Context sent but might be ignored by AI

### **Issue #2: Voice Mode - NOT CONTINUOUS ❌**
- **Current:** VAD-based (stops after 1-2 sentences, requires manual send)
- **Needed:** OpenAI Realtime API (continuous bidirectional streaming like ChatGPT)
- **Discovery:** ✅ **ALREADY FULLY IMPLEMENTED!**
  - `docs/OPENAI_REALTIME_API_IMPLEMENTATION.md` - Complete docs
  - `client/src/hooks/useOpenAIRealtime.ts` - Realtime hook exists
  - `client/src/components/visual-editor/MrBlueRealtimeChat.tsx` - Component exists
  - `server/services/premium/openaiRealtimeService.ts` - Backend service exists
- **Problem:** Component NOT integrated into main Mr. Blue interface (only in Visual Editor)

### **Issue #3: Mechanical Voice - NO HUMAN TTS ❌**
- **Current:** Using basic browser TTS (robotic)
- **Needed:** Human-sounding voice cloned from user's interviews
- **Discovery:** ✅ **VOICE CLONING ALREADY BUILT!**
  - `server/services/voiceCloningService.ts` - ElevenLabs voice cloning
  - `server/services/premium/elevenlabsVoiceService.ts` - TTS with human voices
- **Problem:** User's interview audio files NOT in codebase, can't clone voice yet

---

## 📋 **MB.MD EXECUTION PLAN**

### **Subagent #1: Fix Context Awareness Backend**
**Task:** Verify backend receives and USES context in AI prompts

**Files to Check:**
- `server/routes/mr-blue-enhanced.ts` - Does it use context in system message?
- Test: Send message, verify AI response is context-aware

**Expected Fix:**
- If context ignored → Update AI prompt to include context
- If context used → Debug why responses aren't context-aware

---

### **Subagent #2: Integrate OpenAI Realtime into Main Interface**
**Task:** Replace VAD voice mode with OpenAI Realtime for continuous conversation

**What to Do:**
1. **Update MrBlueChat.tsx:**
   - Add "Realtime Voice" mode option (alongside current VAD mode)
   - Import `useOpenAIRealtime` hook
   - Add voice selection dropdown (alloy, echo, fable, onyx, nova, shimmer)

2. **Implementation:**
   ```typescript
   // Add mode state
   const [voiceMode, setVoiceMode] = useState<'vad' | 'realtime'>('vad');
   
   // Use OpenAI Realtime hook
   const {
     isConnected,
     isRecording,
     messages: realtimeMessages,
     connect: startRealtime,
     disconnect: stopRealtime,
   } = useOpenAIRealtime({
     instructions: `You are Mr. Blue... ${contextAwareInstructions}`,
     voice: selectedVoice,
     turnDetection: {
       type: 'server_vad',
       threshold: 0.5,
       prefix_padding_ms: 300,
       silence_duration_ms: 500,
     },
   });
   
   // Toggle between VAD and Realtime
   {voiceMode === 'realtime' ? (
     <RealtimeVoiceUI />
   ) : (
     <VADVoiceUI />
   )}
   ```

3. **Backend Setup:**
   - Verify `/api/openai-realtime/session` endpoint exists
   - Add route to `server/index.ts` if missing

**Success Criteria:**
- User clicks "Realtime Voice" button
- Starts continuous bidirectional conversation (like ChatGPT)
- No manual "send" button required
- AI responds while user is still thinking/speaking
- Can select voice (alloy, echo, fable, onyx, nova, shimmer)

---

### **Subagent #3: Human Voice TTS Setup**
**Task:** Set up ElevenLabs TTS with human-sounding voices + prepare for voice cloning

**What to Do:**
1. **Immediate Fix - Use ElevenLabs Pre-Made Voices:**
   - Update response handler to use `elevenlabsVoiceService.textToSpeech()`
   - Voices available:
     - Rachel (21m00Tcm4TlvDq8ikWAM) - Professional female
     - Domi (AZnzlk1XvdvUeBnXmlld) - Strong male
     - Bella (EXAVITQu4vr4xnSDxMaL) - Soft female
     - Antoni (ErXwobaYiN019PkySvjV) - Well-rounded male
   
2. **Voice Cloning Preparation:**
   - Document process for user to upload interview audio
   - Extract 1-5 minutes of clear speech samples
   - Use `voiceCloningService.cloneVoice()` to create custom voice
   
   ```typescript
   // After user uploads interview audio
   const result = await voiceCloningService.cloneVoice(
     "Scott's Voice",
     ['/path/to/interview1.mp3', '/path/to/interview2.mp3']
   );
   
   // Use cloned voice
   await elevenlabsVoiceService.textToSpeech(
     text,
     result.voiceId, // User's cloned voice
     userId
   );
   ```

**Success Criteria:**
- AI responses use human-sounding ElevenLabs voice (not robotic TTS)
- User can select from pre-made voices
- System ready to accept interview audio for voice cloning

---

## 🎯 **DEPLOYMENT STRATEGY**

### **Parallel Execution:**
- **Subagent #1:** Fix context awareness (10 min)
- **Subagent #2:** Integrate Realtime API (30 min)
- **Subagent #3:** Setup ElevenLabs TTS (15 min)

**Total Time:** 30 minutes (parallel)

### **Testing Plan:**
1. **Context Awareness:**
   - Navigate to /events → Ask "Help me" → Verify mentions events
   - Navigate to /profile → Ask "Help me" → Verify mentions profile

2. **Continuous Voice:**
   - Click "Realtime Voice" button
   - Speak naturally without pausing
   - Verify AI responds mid-conversation
   - Verify no manual "send" button needed

3. **Human Voice:**
   - Trigger AI response
   - Verify audio sounds human (not robotic)
   - Test voice selection dropdown

---

## 📁 **FILES TO MODIFY**

| Subagent | Files | Changes |
|----------|-------|---------|
| #1 | `server/routes/mr-blue-enhanced.ts` | Verify/fix context usage in prompts |
| #2 | `client/src/components/mrBlue/MrBlueChat.tsx` | Add Realtime mode toggle + integration |
| #2 | `client/src/hooks/useOpenAIRealtime.ts` | Review only (already complete) |
| #2 | `server/routes/openai-realtime.ts` | Verify endpoint exists |
| #3 | `server/routes/mr-blue-enhanced.ts` | Use ElevenLabs for TTS responses |
| #3 | `client/src/components/mrBlue/VoiceSettings.tsx` | Add voice selection UI |

---

## ✅ **SUCCESS METRICS**

| Metric | Target |
|--------|--------|
| Context Awareness | 100% (AI always knows current page) |
| Voice Continuity | ChatGPT-style (no manual send) |
| Voice Quality | Human-sounding (ElevenLabs) |
| Latency | <500ms (OpenAI Realtime) |
| User Experience | Natural conversation flow |

---

**Next:** Deploy 3 subagents simultaneously using MB.MD methodology

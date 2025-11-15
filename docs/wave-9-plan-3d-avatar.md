# Wave 9: Mr. Blue 3D Avatar System - MB.MD Execution Plan

**Version:** MB.MD v4.0  
**Date:** November 15, 2025  
**Goal:** Build production-ready 3D avatar system with Real + Pixar versions, walking animations, text/audio speech, user mannerisms  
**Priority:** P0 - Flagship feature, culmination of entire MT project

---

## 🎯 Executive Summary

**What:** Fully-functional 3D avatars for Mr. Blue AI assistant that walk across screen, speak via text-to-speech and audio, embody user's personality/mannerisms based on example photos/interviews.

**Why:** This is the **ultimate Mr. Blue experience** - transforming AI from text chat into a living, breathing companion that represents the user's personality in 3D.

**How:** MB.MD v4.0 with **6 parallel subagents** executing simultaneously across frontend, 3D rendering, animation, speech, AI personality, and integration.

---

## 📊 Execution Plan Overview

### **Parallel Execution Strategy: 6 Subagents**

| Subagent | Features | Duration | Cost | Dependencies |
|----------|----------|----------|------|--------------|
| **#1: 3D Model Foundation** | Real + Pixar model loading, texture system, LOD optimization | 90min | $6 | None |
| **#2: Animation System** | Walking cycle, idle animations, gesture library, state machine | 90min | $6 | Model foundation |
| **#3: Speech Integration** | Text-to-speech (ElevenLabs), audio playback, lip-sync engine | 75min | $5 | None |
| **#4: Personality Engine** | Mannerism analysis (GPT-4o Vision), personality traits, behavior patterns | 75min | $5 | None |
| **#5: Scene Management** | Background-less rendering, lighting, camera controls, positioning | 60min | $4 | 3D foundation |
| **#6: UI Integration** | Avatar controls, intro system, voice toggle, settings panel | 60min | $4 | All above |

**Total Estimated:** 90 minutes (parallel execution), ~$30

---

## 🏗️ Phase Breakdown

### **Phase 1: 3D Model Foundation (Subagent #1)**

**Goal:** Load and render Real + Pixar versions of Mr. Blue avatar

**Files to Create:**
1. `client/src/components/avatar/MrBlue3DModel.tsx` - Main 3D model component
2. `client/src/lib/avatar/modelLoader.ts` - GLB/GLTF model loading service
3. `client/src/lib/avatar/textureManager.ts` - Texture loading and switching
4. `client/src/lib/avatar/lodOptimization.ts` - Level of detail performance
5. `client/src/types/avatar.ts` - TypeScript types for 3D system

**Technical Stack:**
- **3D Library:** @react-three/fiber + @react-three/drei (already installed)
- **Model Format:** GLTF/GLB (industry standard)
- **Textures:** PBR materials (base color, normal, metallic, roughness)
- **Performance:** LOD (Level of Detail) for mobile optimization

**Tasks:**
1. Create base 3D canvas with React Three Fiber
2. Implement GLTF model loader with error handling
3. Build texture management system (Real vs Pixar swap)
4. Add LOD optimization for performance
5. Set up lighting system (3-point lighting)
6. Test on mobile/desktop for 60fps target

**Acceptance Criteria:**
- [ ] Both Real and Pixar models load within 2 seconds
- [ ] Texture switching is instant (<100ms)
- [ ] 60fps on desktop, 30fps on mobile
- [ ] No WebGL errors in console
- [ ] Models render without background

**Dependencies:** None (can start immediately)

---

### **Phase 2: Animation System (Subagent #2)**

**Goal:** Bring Mr. Blue to life with walking, idle, and gesture animations

**Files to Create:**
1. `client/src/lib/avatar/animationController.ts` - Animation state machine
2. `client/src/lib/avatar/walkingCycle.ts` - Walking animation logic
3. `client/src/lib/avatar/gestureLibrary.ts` - Hand gestures, head nods, expressions
4. `client/src/lib/avatar/idleAnimations.ts` - Subtle breathing, blinking
5. `client/src/lib/avatar/animationBlender.ts` - Smooth transitions between states

**Animation Library:**
- **Walking:** Forward, backward, sideways, diagonal
- **Idle:** Breathing, weight shift, occasional look-around
- **Gestures:** Wave hello, thumbs up, thinking pose, pointing
- **Expressions:** Smile, surprise, concern (if facial bones available)
- **Environmental:** Slight breeze effect on clothing/hair

**State Machine:**
```
IDLE → WALKING → IDLE
  ↓        ↓
GESTURE  TALKING
```

**Tasks:**
1. Implement animation state machine with smooth transitions
2. Load walking cycle animations (8-direction movement)
3. Create idle animation loop with subtle variations
4. Build gesture library (10+ gestures)
5. Add environmental effects (breeze simulation)
6. Test all animation transitions for smoothness

**Acceptance Criteria:**
- [ ] Walking animations smooth at all angles
- [ ] Idle animations don't feel robotic (natural micro-movements)
- [ ] Gestures trigger on command without lag
- [ ] Transitions blend seamlessly (<200ms)
- [ ] Breeze effect subtle and realistic

**Dependencies:** Needs Phase 1 (3D Model Foundation) complete

---

### **Phase 3: Speech Integration (Subagent #3)**

**Goal:** Enable Mr. Blue to speak via text-to-speech and play audio intros

**Files to Create:**
1. `client/src/lib/avatar/speechSynthesis.ts` - ElevenLabs TTS integration
2. `client/src/lib/avatar/audioPlayback.ts` - Audio file playback system
3. `client/src/lib/avatar/lipSync.ts` - Lip-sync engine (phoneme mapping)
4. `client/src/lib/avatar/speechQueue.ts` - Queue multiple speech requests
5. `server/routes/avatar-speech.ts` - Backend API for TTS generation

**Speech Features:**
- **Text-to-Speech:** ElevenLabs API with custom voice (warm, professional)
- **Audio Intros:** Pre-recorded welcome messages (encourage audio over text)
- **Lip Sync:** Map phonemes to mouth shapes
- **Background Audio:** Optional ambient music
- **Speech Queue:** Handle multiple messages without overlap

**ElevenLabs Integration:**
```typescript
// server/routes/avatar-speech.ts
export const generateSpeech = async (text: string): Promise<AudioBuffer> => {
  const response = await elevenlabs.textToSpeech({
    voice_id: process.env.ELEVENLABS_VOICE_ID,
    text,
    model_id: "eleven_multilingual_v2"
  });
  return response.audio;
};
```

**Tasks:**
1. Set up ElevenLabs API integration
2. Implement text-to-speech with caching
3. Build audio playback system with Web Audio API
4. Create lip-sync engine (basic phoneme → viseme mapping)
5. Add speech queue for multiple messages
6. Test audio quality and lip-sync accuracy

**Acceptance Criteria:**
- [ ] TTS generates within 2 seconds
- [ ] Audio plays without stuttering
- [ ] Lip-sync matches speech (80% accuracy)
- [ ] Queue handles 10+ messages smoothly
- [ ] Audio intro plays on first visit

**Dependencies:** None (can start immediately)

---

### **Phase 4: Personality Engine (Subagent #4)**

**Goal:** Analyze user's photos/interviews to extract mannerisms and personality traits

**Files to Create:**
1. `server/services/avatar/personalityAnalyzer.ts` - GPT-4o Vision + text analysis
2. `server/services/avatar/mannerismExtractor.ts` - Extract gestures from photos
3. `client/src/lib/avatar/personalityProfile.ts` - TypeScript personality model
4. `client/src/lib/avatar/behaviorEngine.ts` - Apply personality to animations
5. `server/routes/avatar-personality.ts` - API for personality analysis

**Personality Dimensions:**
- **Energy Level:** Low (calm) ↔ High (energetic)
- **Gesture Frequency:** Minimal ↔ Expressive
- **Speech Pace:** Slow/deliberate ↔ Fast/excited
- **Formality:** Casual ↔ Professional
- **Expressiveness:** Reserved ↔ Animated

**GPT-4o Vision Analysis:**
```typescript
// Analyze user photos to extract mannerisms
const analyzeMannerisms = async (photos: string[]): Promise<Mannerisms> => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Analyze photos to identify body language, gestures, and personality traits.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze these photos for mannerisms, gestures, energy level, and personality traits.' },
          ...photos.map(url => ({ type: 'image_url', image_url: { url } }))
        ]
      }
    ]
  });
  return parsePersonalityProfile(response);
};
```

**Tasks:**
1. Build GPT-4o Vision integration for photo analysis
2. Extract personality dimensions from interviews (text analysis)
3. Create personality profile TypeScript model
4. Map personality traits to animation parameters
5. Test with example photos/interviews
6. Validate personality accuracy (user feedback loop)

**Acceptance Criteria:**
- [ ] Photo analysis extracts 5+ mannerisms
- [ ] Interview analysis identifies personality dimensions
- [ ] Personality profile JSON generated
- [ ] Animations reflect personality (e.g., energetic = more gestures)
- [ ] Accuracy validated by user feedback

**Dependencies:** None (can start immediately)

---

### **Phase 5: Scene Management (Subagent #5)**

**Goal:** Set up 3D scene without background, lighting, camera controls

**Files to Create:**
1. `client/src/lib/avatar/sceneManager.ts` - Scene setup and configuration
2. `client/src/lib/avatar/lightingSystem.ts` - Dynamic lighting (3-point)
3. `client/src/lib/avatar/cameraController.ts` - Camera positioning and zoom
4. `client/src/lib/avatar/backgroundRemoval.ts` - Transparent background
5. `client/src/lib/avatar/positioningSystem.ts` - Avatar screen positioning

**Scene Features:**
- **Background:** Fully transparent (alpha channel)
- **Lighting:** 3-point lighting (key, fill, rim) with soft shadows
- **Camera:** Orbital camera with smooth zoom/pan
- **Positioning:** Avatar can walk to any screen position
- **Breeze Effect:** Subtle cloth/hair movement

**3-Point Lighting Setup:**
```typescript
// Key light (main)
<directionalLight position={[5, 5, 5]} intensity={1.2} />
// Fill light (soften shadows)
<directionalLight position={[-3, 3, -3]} intensity={0.5} />
// Rim light (edge highlight)
<directionalLight position={[0, 5, -5]} intensity={0.8} />
```

**Tasks:**
1. Set up React Three Fiber canvas with transparent background
2. Implement 3-point lighting system
3. Build camera controller with smooth transitions
4. Create positioning system (grid-based movement)
5. Add breeze effect (cloth simulation)
6. Optimize rendering for performance

**Acceptance Criteria:**
- [ ] Background fully transparent
- [ ] Lighting looks natural and flattering
- [ ] Camera smoothly follows avatar
- [ ] Avatar can walk to any screen position
- [ ] Breeze effect subtle and realistic
- [ ] 60fps maintained on desktop

**Dependencies:** Needs Phase 1 (3D Model Foundation) complete

---

### **Phase 6: UI Integration (Subagent #6)**

**Goal:** Integrate avatar into Mr. Blue UI with controls and intro system

**Files to Create:**
1. `client/src/components/avatar/MrBlue3DAvatar.tsx` - Main avatar component
2. `client/src/components/avatar/AvatarControls.tsx` - User controls panel
3. `client/src/components/avatar/AvatarIntroSequence.tsx` - First-time intro
4. `client/src/components/avatar/AvatarSettings.tsx` - Settings (Real/Pixar, volume)
5. `client/src/hooks/useAvatarState.ts` - Avatar state management

**UI Features:**
- **Intro Sequence:** Avatar walks onto screen, waves, introduces itself (audio encouraged)
- **Controls Panel:**
  - Toggle Real/Pixar version
  - Volume control
  - Enable/disable voice
  - Position on screen (corners, center)
- **Settings:**
  - Voice preference (text vs audio)
  - Animation speed
  - Personality adjustments
- **Context Integration:** Avatar appears in Mr. Blue chat interface

**Intro Sequence Flow:**
```
1. Avatar walks from left edge → center screen (3 seconds)
2. Waves hello gesture (1 second)
3. Speaks: "Hi! I'm Mr. Blue, your AI assistant." (audio or text)
4. Prompts user: "Would you like to hear me speak or prefer text?"
5. Transitions to idle state
```

**Tasks:**
1. Build main avatar component with all features integrated
2. Create controls panel (Real/Pixar toggle, volume, position)
3. Implement intro sequence with audio/text choice
4. Add settings panel for customization
5. Integrate into existing Mr. Blue chat UI
6. Add onboarding tooltips for first-time users

**Acceptance Criteria:**
- [ ] Intro sequence plays smoothly on first visit
- [ ] Controls accessible and intuitive
- [ ] Real/Pixar toggle works instantly
- [ ] Voice toggle switches between TTS and text
- [ ] Avatar integrates seamlessly into chat UI
- [ ] Settings persist across sessions

**Dependencies:** Needs ALL above phases complete

---

## 🎨 3D Model Requirements

### **Model Specifications:**

**Format:** GLTF/GLB (optimized for web)  
**Polycount:**
- Real Version: 15,000-25,000 triangles
- Pixar Version: 8,000-15,000 triangles (stylized, lower poly)

**Textures:**
- Base Color (2048x2048 or 1024x1024)
- Normal Map (for detail)
- Metallic + Roughness (PBR workflow)
- Emissive (optional, for eyes/accents)

**Rigging:**
- Full body rig (spine, arms, legs, head, neck)
- Facial bones (if expressions needed: jaw, eyes, eyebrows)
- Finger bones (optional, for detailed gestures)

**Animations (Embedded in GLB):**
- Idle loop
- Walking cycle (forward)
- Wave gesture
- Thinking pose
- Thumbs up

**Source:**
- **Option 1:** Ready Player Me (free, customizable avatars)
- **Option 2:** Mixamo (free rigged characters + animations)
- **Option 3:** Custom 3D artist (if budget allows)

### **Personality Source Materials:**

**User to Provide:**
1. **Photos:** 5-10 photos showing body language, gestures, expressions
2. **Interview Transcript:** Or recorded video/audio for speech pattern analysis
3. **Personality Traits:** Optional self-description (e.g., "energetic, friendly, professional")

**AI Analysis:**
- GPT-4o Vision analyzes photos for mannerisms
- GPT-4o text analysis extracts personality from interviews
- ElevenLabs voice cloning (if user provides voice samples)

---

## 🧪 Testing Strategy

### **Phase-by-Phase Testing:**
Each subagent includes Playwright E2E tests for their features.

### **Integration Tests:**
1. **Avatar Load Test:** Real + Pixar models load within 2 seconds
2. **Animation Flow Test:** Idle → Walk → Gesture → Idle transitions smooth
3. **Speech Test:** TTS generates and plays without errors
4. **Personality Test:** Animations reflect personality traits
5. **Scene Test:** Background transparent, lighting natural
6. **UI Test:** Controls work, intro plays, settings persist

### **Performance Tests:**
- **FPS:** 60fps on desktop, 30fps on mobile
- **Load Time:** <2 seconds for avatar to appear
- **Memory:** <100MB RAM usage
- **Network:** <5MB total asset download

### **Cross-Browser/Device:**
- Chrome, Firefox, Safari (desktop)
- iOS Safari, Android Chrome (mobile)
- WebGL 2.0 support verification

---

## 💰 Cost & Time Estimates

### **Subagent Breakdown:**

| Subagent | Features | Duration | Cost | Parallel? |
|----------|----------|----------|------|-----------|
| #1: 3D Model Foundation | Model loading, textures, LOD | 90min | $6 | ✅ |
| #2: Animation System | Walking, idle, gestures | 90min | $6 | ⏳ (depends on #1) |
| #3: Speech Integration | TTS, audio, lip-sync | 75min | $5 | ✅ |
| #4: Personality Engine | GPT-4o analysis, mannerisms | 75min | $5 | ✅ |
| #5: Scene Management | Lighting, camera, background | 60min | $4 | ⏳ (depends on #1) |
| #6: UI Integration | Controls, intro, settings | 60min | $4 | ⏳ (depends on all) |

**Total Parallel Duration:** 90 minutes (Phases 1, 3, 4 start immediately → Phase 2, 5 start after Phase 1 → Phase 6 integrates all)

**Total Cost:** ~$30 (6 subagents × $4.50 overhead + execution)

**Comparison to Sequential:** Would take 450 minutes (7.5 hours) if done one-by-one → **80% time savings**

---

## 📋 Task List for Main Agent

While subagents execute, main agent handles:

1. **Pre-Flight:**
   - [ ] Verify @react-three/fiber and @react-three/drei installed
   - [ ] Check ElevenLabs API key in secrets
   - [ ] Create example personality photos in `attached_assets/avatar/`

2. **Coordination:**
   - [ ] Monitor subagent progress
   - [ ] Resolve merge conflicts (if any)
   - [ ] Run LSP diagnostics before workflow restart

3. **Micro Features:**
   - [ ] Add avatar route to `client/src/App.tsx`
   - [ ] Update `replit.md` with Wave 9 progress
   - [ ] Create avatar schema in `shared/schema.ts` (personality profiles)

4. **Testing:**
   - [ ] Coordinate Playwright E2E tests
   - [ ] Validate all acceptance criteria
   - [ ] Fix any bugs found

---

## 🎯 Acceptance Criteria (Wave Complete)

### **Functional Requirements:**
- [ ] Both Real and Pixar avatars load and render
- [ ] Avatar walks across screen smoothly
- [ ] Idle animations play naturally
- [ ] TTS speech works with lip-sync
- [ ] Audio intro plays on first visit
- [ ] Personality traits reflected in animations
- [ ] Background fully transparent
- [ ] Controls accessible and intuitive
- [ ] Intro sequence plays on first visit

### **Performance Requirements:**
- [ ] 60fps on desktop, 30fps on mobile
- [ ] <2 second load time
- [ ] <5MB total asset download
- [ ] <100MB RAM usage

### **Quality Requirements:**
- [ ] Zero TypeScript errors
- [ ] Zero WebGL errors in console
- [ ] Playwright E2E tests passing (95%+ coverage)
- [ ] Cross-browser compatible (Chrome, Firefox, Safari)
- [ ] Mobile responsive

### **User Experience:**
- [ ] Intro sequence feels welcoming
- [ ] Animations don't feel robotic
- [ ] Speech is clear and natural
- [ ] Personality matches user's style
- [ ] Controls easy to find and use

---

## 🚀 Execution Timeline

**Wave 9 Start → Complete:**

```
T+0min: Launch 3 parallel subagents (#1, #3, #4)
  │
  ├─ Subagent #1: 3D Model Foundation (90min)
  ├─ Subagent #3: Speech Integration (75min)
  └─ Subagent #4: Personality Engine (75min)

T+30min: Subagent #1 completes model loading → Launch Subagent #2, #5
  │
  ├─ Subagent #2: Animation System (90min, depends on #1)
  └─ Subagent #5: Scene Management (60min, depends on #1)

T+75min: Subagents #3, #4 complete

T+90min: Subagents #1, #2 complete

T+90min: Launch Subagent #6: UI Integration (60min, needs all above)

T+150min: Subagent #6 complete → All features integrated

T+150-180min: Main agent tests, validates, fixes bugs

TOTAL: 180 minutes (3 hours) wall-clock time
```

---

## 📚 Resources & References

### **3D Libraries:**
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- React Three Drei: https://github.com/pmndrs/drei
- Three.js: https://threejs.org/docs/

### **Avatar Sources:**
- Ready Player Me: https://readyplayer.me/ (free avatars)
- Mixamo: https://www.mixamo.com/ (free characters + animations)
- Sketchfab: https://sketchfab.com/ (marketplace for 3D models)

### **Speech/Audio:**
- ElevenLabs: https://elevenlabs.io/docs (text-to-speech API)
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Lip Sync: https://github.com/Siilwyn/lipsync (phoneme mapping)

### **AI Analysis:**
- GPT-4o Vision: https://platform.openai.com/docs/guides/vision
- Personality Traits: Big Five model (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)

---

## 🎓 Success Metrics

**Wave 9 Complete When:**
- ✅ Real + Pixar avatars fully functional
- ✅ Walking, idle, gesture animations smooth
- ✅ TTS speech with lip-sync working
- ✅ Personality traits reflected in behavior
- ✅ Intro sequence plays on first visit
- ✅ All Playwright E2E tests passing
- ✅ Performance targets met (60fps desktop)
- ✅ Zero TypeScript/WebGL errors
- ✅ User feedback positive (feels like "me")

**Flagship Feature Ready:** Mr. Blue 3D Avatar is production-ready, representing the culmination of entire MT project with AI-powered personality, natural speech, and lifelike animations.

---

## 🏁 Next Steps

1. **User Approval:** Review this plan and approve execution
2. **Asset Preparation:** User provides 5-10 photos + interview transcript for personality analysis
3. **API Keys:** Verify ElevenLabs API key in Replit Secrets
4. **Execute:** Launch 6 parallel subagents per MB.MD v4.0 protocol
5. **Test:** Validate all acceptance criteria
6. **Ship:** Deploy to production at mundotango.life

**Ready to execute? Say "Use MB.MD: Build Mr. Blue 3D Avatar System" and we'll launch all 6 subagents simultaneously.**

# Mr Blue Audio Conversation & Vibe Coding Tracker

**Created:** 2025-12-08  
**MB.MD Version:** v9.9.4  
**Status:** Active Development  
**Owner:** Replit AI + User Collaboration

---

## Executive Summary

This document tracks all work related to Mr Blue's audio conversation capabilities and vibe coding functionality. The goal is to enable users to:
1. Click a microphone and have real-time audio conversations with Mr Blue
2. Use voice commands to make UI/UX changes via "vibe coding"
3. Walk through the site while talking, with Mr Blue tracking clicks and providing feedback

---

## Current Issues Tracker

| ID | Issue | Status | Priority | Notes |
|----|-------|--------|----------|-------|
| 1 | Git merge conflict in mr-blue-service.ts | FIXED | P0 | Resolved lumaVideoService import |
| 2 | Application failing to start | FIXED | P0 | Fixed import paths and exports |
| 3 | Duplicate FeedLeftSidebar components | IDENTIFIED | P1 | Two versions exist - root and feed/ folder |
| 4 | Empty ActiveUsersSidebar component | IDENTIFIED | P1 | Renders empty Card - should delete or populate |
| 5 | Audio conversation not wired end-to-end | IN PROGRESS | P1 | ElevenLabs integration partially built |
| 6 | Voice input needs testing (50% text, 50% audio) | PENDING | P1 | Test suite needed |
| 7 | Redis ECONNREFUSED 127.0.0.1:6379 | KNOWN | P2 | In-memory fallback working |
| 8 | Page audit null constraint on page_name | KNOWN | P2 | Non-blocking |

## Sidebar Analysis (Memory Feed)

### Duplicate Sidebar Components Found:

| File | Lines | Used In | Delete? |
|------|-------|---------|---------|
| `components/FeedLeftSidebar.tsx` | 143 | NOT USED in FeedPage | YES - Orphan |
| `components/feed/FeedLeftSidebar.tsx` | 100 | Used in FeedPage | NO - Active |
| `components/feed/ActiveUsersSidebar.tsx` | 45 | NOT USED | YES - Empty |

### Root Cause:
The root-level `FeedLeftSidebar.tsx` is an older/duplicate version that may have been created during refactoring. The current FeedPage imports from `@/components/feed/FeedLeftSidebar`.

### Recommended Action:
Delete `client/src/components/FeedLeftSidebar.tsx` (root) and `client/src/components/feed/ActiveUsersSidebar.tsx` (empty).

---

## Complete Code Inventory

### Backend Services (server/services/)

| File | Purpose | Status |
|------|---------|--------|
| `mr-blue-service.ts` | Core Mr Blue service with chat, voice, video generation | Active |
| `elevenlabsService.ts` | ElevenLabs TTS integration | Active |
| `premium/elevenlabsVoiceService.ts` | Premium voice features | Active |
| `mrblue/audioConversationService.ts` | Audio conversation session management | Active |
| `mrBlue/AudioConversationService.ts` | Alternative audio conversation (duplicate?) | Needs review |
| `mrBlue/VibeCodingService.ts` | Vibe coding command processing | Active |
| `mrBlue/AutoFixEngine.ts` | Self-healing auto-fix engine | Active |
| `mrBlue/AutonomousEngine.ts` | Autonomous operation engine | Active |
| `mrblue/agents/MrBluePageAgent.ts` | Page-specific agent logic | Active |
| `mrblue/MrBlueQAResearch.ts` | QA and research capabilities | Active |
| `facebook/FacebookMrBlueContextService.ts` | Facebook context bridge | Active |

### Backend Routes (server/routes/)

| File | Purpose | Endpoints |
|------|---------|-----------|
| `mrBlue.ts` | Main Mr Blue routes | /api/mrblue/* |
| `mr-blue-routes.ts` | Additional Mr Blue routes | Various |
| `mr-blue-enhanced.ts` | Enhanced Mr Blue features | Various |
| `mr-blue-plan-routes.ts` | Planning routes | Various |
| `mr-blue-page-generator.ts` | Page generation | Various |
| `audioConversation.ts` | Audio conversation endpoints | /api/audio-conversation/* |
| `mrblue-vibecoding-routes.ts` | Vibe coding endpoints | /api/mrblue/vibecoding/* |
| `mrblue-orchestration-routes.ts` | Orchestration endpoints | Various |
| `mrblue-error-actions-routes.ts` | Error handling actions | Various |

### Frontend Components (client/src/components/)

| File | Purpose | Status |
|------|---------|--------|
| `mrBlue/MrBlueChat.tsx` | Main chat interface (1139 lines) | Active - Primary |
| `mrBlue/MrBlueFloatingButton.tsx` | Floating action button | Active |
| `mrBlue/UnifiedMrBlue.tsx` | Unified Mr Blue component | Active |
| `mrBlue/GlobalMrBlue.tsx` | Global Mr Blue instance | Active |
| `mrblue/MrBlueAvatar.tsx` | Avatar component | Active |
| `mrblue/MrBlueAvatar2D.tsx` | 2D avatar | Active |
| `mrblue/MrBlueAvatar3D.tsx` | 3D avatar | Active |
| `mrblue/MrBlueAvatarVideo.tsx` | Video avatar | Active |
| `visual-editor/MrBlueRealtimeChat.tsx` | Realtime voice chat | Active |
| `visual-editor/MrBlueWhisperChat.tsx` | Whisper-based chat | Active |
| `visual-editor/MrBlueVisualChat.tsx` | Visual editor chat | Active |
| `visual-editor/MrBlueAvatar.tsx` | Visual editor avatar | Active |
| `visual-editor/VoiceModeToggle.tsx` | Voice mode control | Active |
| `MrBlueWidget.tsx` | Widget component | Active |
| `MrBlueVoiceInterface.tsx` | Voice interface | Active |
| `premium/VoiceChat.tsx` | Premium voice chat | Active |

### Frontend Pages (client/src/pages/)

| File | Purpose |
|------|---------|
| `MrBlueChatPage.tsx` | Dedicated chat page |
| `MrBluePage.tsx` | Mr Blue main page |
| `marketing/MrBluePage.tsx` | Marketing page |
| `mr-blue-avatar-3d.tsx` | 3D avatar page |
| `mr-blue-avatar-demo.tsx` | Avatar demo |
| `mr-blue-studio.tsx` | Studio page |
| `mr-blue-video-demo.tsx` | Video demo |
| `mrblue/MrBlueChat.tsx` | Nested chat page |

### Feed Sidebar Components (Target for Vibe Coding Test)

| File | Purpose | Delete? |
|------|---------|---------|
| `feed/FeedLeftSidebar.tsx` | Left navigation sidebar | NO - Core nav |
| `FeedLeftSidebar.tsx` (root) | Alternative left sidebar | INVESTIGATE |
| `FeedRightSidebar.tsx` | Right sidebar | NO - Standard |
| `feed/UpcomingEventsSidebar.tsx` | Events sidebar | NO - Feature |
| `feed/ActiveUsersSidebar.tsx` | Active users | INVESTIGATE |

### Context & State (client/src/contexts/)

| File | Purpose |
|------|---------|
| `MrBlueContext.tsx` | Mr Blue context provider |

### Utility & Routing (client/src/lib/)

| File | Purpose |
|------|---------|
| `vibecodingRouter.ts` | Vibe coding command router |

### Test Files

| File | Purpose |
|------|---------|
| `e2e/tests/mr-blue-vibecoding-e2e.spec.ts` | Vibe coding E2E tests |
| `tests/e2e/mr-blue-*.spec.ts` | Various Mr Blue tests (15+ files) |
| `tests/e2e/core-journeys/mr-blue-voice.spec.ts` | Voice journey tests |
| `tests/visual-editor-mr-blue-complete.spec.ts` | Visual editor tests |

### Documentation

| File | Purpose |
|------|---------|
| `docs/governance/mr-blue-system-prompt.md` | System prompt |
| `docs/governance/mr-blue-soul.md` | Soul/personality definition |
| `docs/mb-md-plans/visual-editor-autonomous-vibe-coding.md` | Vibe coding plans |
| `server/knowledge/mr-blue-troubleshooting-kb.ts` | Troubleshooting knowledge base |

---

## Architecture Analysis

### What's Working

1. **Text Chat** - Mr Blue chat interface is functional with Groq streaming
2. **Visual Editor** - Vibe coding backend for code changes exists
3. **Context/Memory** - Error tracking and memory systems operational
4. **Avatar System** - 2D/3D/Video avatars implemented
5. **ElevenLabs TTS** - Text-to-speech routes exist

### What's Missing/Broken

1. **End-to-End Audio Loop** - Voice capture → STT → LLM → TTS → Playback not fully connected
2. **Click Tracking + Voice** - "Walk the site while talking" not implemented
3. **UX Walkthrough Session** - Unified session binding voice + clicks + streaming missing
4. **Feature Flags** - Audio pathways may not be enabled for all users
5. **WebSocket Audio Streaming** - Real-time bidirectional audio needs work

### Recommended Architecture (from Perplexity Research)

```
Browser                    Backend                    External
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ Mic Button      │──────│ /api/mrblue/    │──────│ ElevenLabs      │
│ Click Tracker   │      │ ux-session      │      │ Agents API      │
│ Audio Player    │      │                 │      │                 │
└─────────────────┘      │ Context/Memory  │      │ Groq/Claude LLM │
                         │ Vibe Coding     │      │                 │
                         └─────────────────┘      └─────────────────┘
```

---

## MB.MD Research Plan

### Phase 1: Stabilization (Current)
- [x] Fix git merge conflicts
- [x] Fix import path errors
- [x] Application starts successfully
- [ ] Document complete code inventory

### Phase 2: Investigation
- [ ] Identify unwanted sidebar in memory feed
- [ ] Map current audio conversation flow
- [ ] Identify gaps in voice pipeline

### Phase 3: Testing (50% Text / 50% Audio)
- [ ] Test text-based vibe coding commands
- [ ] Test audio input → transcription
- [ ] Test TTS response playback
- [ ] Test combined flow

### Phase 4: Fixing
- [ ] Wire missing connections
- [ ] Enable feature flags
- [ ] Fix any broken endpoints

### Phase 5: Documentation
- [ ] Update this tracker with findings
- [ ] Document working patterns
- [ ] Create troubleshooting guide

---

## Session Log

### 2025-12-08 Session 1

**Actions Taken:**
1. Fixed git merge conflict in `mr-blue-service.ts`
2. Fixed import paths: `lumaVideoService`, `storage`, `mr-blue-service`
3. Added export to `AudioConversationService` class
4. Changed `requireAuth` to `authenticateToken` in routes
5. Application now running

**Next Steps:**
1. Identify the unwanted sidebar
2. Test Mr Blue chat vibe coding capability
3. Test audio conversation flow

---

## Environment Variables Required

| Variable | Status | Purpose |
|----------|--------|---------|
| ELEVENLABS_API_KEY | Configured | ElevenLabs API access |
| ELEVENLABS_VOICE_ID | Configured | Mr Blue's voice |
| GROQ_API_KEY | Check | LLM backend |
| LUMA_API_KEY | Check | Video generation |

---

## Questions to Answer Through Testing

1. Can Mr Blue understand vibe coding commands via text?
2. Does the microphone button work in the chat interface?
3. Is audio transcription (Whisper/Groq) functional?
4. Does TTS playback work in the browser?
5. Can vibe coding actually modify UI elements?
6. What sidebar needs to be deleted in the memory feed?

---

*This document will be updated as work progresses.*

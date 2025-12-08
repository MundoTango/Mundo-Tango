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
| 3 | Duplicate FeedLeftSidebar components | FIXED | P1 | Deleted root/FeedLeftSidebar.tsx orphan |
| 4 | Empty ActiveUsersSidebar component | FIXED | P1 | Deleted empty ActiveUsersSidebar.tsx |
| 5 | Audio conversation not wired end-to-end | IN PROGRESS | P1 | ElevenLabs integration partially built |
| 6 | Voice input needs testing (50% text, 50% audio) | PENDING | P1 | Test suite needed |
| 7 | Redis ECONNREFUSED 127.0.0.1:6379 | KNOWN | P2 | In-memory fallback working |
| 8 | Page audit null constraint on page_name | FIXED | P2 | Added required pageName, route, pageAgentId |
| 9 | Null conversationId in MrBlueChat.tsx | FIXED | P0 | Added checks before refetchMessages() |
| 10 | Auto-save conversation race condition | FIXED | P1 | Use response.id directly for new conversations |

---

## MB.MD v9.9.4 Recursive Research Findings (2025-12-08)

### CRITICAL ISSUES (P0)

| ID | Issue | File(s) | Description |
|----|-------|---------|-------------|
| 11 | **Missing storage.saveAudioConversationSession()** | `server/storage.ts`, `server/services/mrblue/audioConversationService.ts` | Method called but NOT defined in IStorage interface - will cause runtime error |
| 12 | **Duplicate /transcribe endpoints** | `server/routes/mrBlue.ts` | Two `/transcribe` routes at lines 162-220 and 1603-1672 - Groq Whisper vs OpenAI Whisper conflict |
| 13 | **God user hardcoded (ID 147)** | `server/routes/mrBlue.ts:1750,1804` | Hardcoded fallback user ID for unauthenticated Mr Blue access - security concern |
| 14 | **WebSocket URL undefined port** | Browser console logs | `wss://localhost:undefined/?token=...` - Vite HMR WebSocket configuration issue |

### HIGH PRIORITY ISSUES (P1)

| ID | Issue | File(s) | Description |
|----|-------|---------|-------------|
| 15 | **BackendOrchestrator TODOs** | `server/services/mrblue/BackendOrchestrator.ts` | 5 unimplemented methods: intelligent analysis (275), schema agent (292), API agent (304), security agent (316), service agent (328), workflow restart (373) |
| 16 | **AutonomousEngine git rollback TODO** | `server/services/mrBlue/AutonomousEngine.ts:298` | Git rollback not implemented |
| 17 | **AutoFixEngine test coverage TODO** | `server/services/mrBlue/AutoFixEngine.ts:651` | Test coverage calculation not implemented |
| 18 | **GlobalKnowledgeBase TODOs** | `server/services/mrblue/GlobalKnowledgeBase.ts` | Persist to PostgreSQL (73), broadcast to agents (90), audit trail storage (93) not implemented |
| 19 | **VibeCodingService LSP validation missing** | `server/services/mrBlue/VibeCodingService.ts:713-714` | LSP validation is placeholder - defaults to syntax validation |
| 20 | **VibeCodingService file deletion skipped** | `server/services/mrBlue/VibeCodingService.ts:876` | File deletions are explicitly skipped in applyChanges() |
| 21 | **Orchestrator fallback not complete** | `server/services/mrBlue/VibeCodingService.ts:599,603` | generateCodeWithOrchestrator falls back to standard - orchestrator incomplete |
| 22 | **ElevenLabs voice deletion inconsistency** | `server/services/elevenlabsService.ts:322-323` | DB record deleted even if ElevenLabs API deletion fails |
| 23 | **MrBlueChat optimistic state update** | `client/src/components/mrBlue/MrBlueChat.tsx:591-601` | saveEdit updates state before API success - no rollback on failure |
| 24 | **MrBlueChat message sync race condition** | `client/src/components/mrBlue/MrBlueChat.tsx:98-110,195-216` | fetchedMessages/realtimeMessages replace state - could lose in-flight messages |
| 25 | **Breadcrumbs endpoint not implemented** | `server/routes/mrBlue.ts:931-932` | Stores nothing - comment says "implement later" |

### MEDIUM PRIORITY ISSUES (P2)

| ID | Issue | File(s) | Description |
|----|-------|---------|-------------|
| 26 | **audioConversationService error handling gaps** | `server/services/mrblue/audioConversationService.ts` | No try-catch around mrBlueService.chat() and analyzeUXFeedback() calls |
| 27 | **audioConversationService return type inconsistency** | `server/services/mrblue/audioConversationService.ts:135,145` | getSession returns undefined, endSession returns null for "not found" |
| 28 | **VibeCodingService hardcoded values** | `server/services/mrBlue/VibeCodingService.ts` | maxRounds:2, minClarityThreshold:0.8 (189-191), model 'llama-3.3-70b-versatile' (633), criticalFiles list (683), targetUrl localhost:5000 (802-803) |
| 29 | **ElevenLabs API key proceeds when missing** | `server/services/premium/elevenlabsVoiceService.ts:31-34` | Warns but continues initialization with empty apiKey |
| 30 | **Generate/Modify code endpoints no auth middleware** | `server/routes/mrBlue.ts:1290-1329` | Check req.user but no authenticateToken middleware - bypasses auth if req.user set elsewhere |
| 31 | **vibecodingRouter fallback to AI** | `client/src/lib/vibecodingRouter.ts:142-160` | Unrecognized commands silently fall back to AI - no logging of failure patterns |
| 32 | **vibecodingRouter iframeInjector dependency** | `client/src/lib/vibecodingRouter.ts:67-92` | Visual changes require iframeInjector on window - fails silently if unavailable |
| 33 | **MrBlueChat DOM snapshot limits AI context** | `client/src/components/mrBlue/MrBlueChat.tsx:460` | Input values masked with '***' for privacy - may limit AI understanding |
| 34 | **MrBlueChat error handling silent** | `client/src/components/mrBlue/MrBlueChat.tsx:312-314,600-601,550-552` | Conversation save, edit, audio playback errors logged but no user feedback |
| 35 | **Duplicate audio conversation services** | `server/services/mrblue/audioConversationService.ts` vs `server/services/mrBlue/AudioConversationService.ts` | Two files with similar names - potential conflict |

### LOW PRIORITY ISSUES (P3)

| ID | Issue | File(s) | Description |
|----|-------|---------|-------------|
| 36 | **recordMrBlueExecution hardcoded metrics** | `server/routes/mrBlue.ts:24-57` | quality, efficiency, confidence metrics are hardcoded |
| 37 | **MrBlueChat vibecoding router cleanup** | `client/src/components/mrBlue/MrBlueChat.tsx:227-246` | No cleanup when enableVibecoding changes - memory leak potential |
| 38 | **Missing agent_knowledge_versions table** | Server logs | DB relation error 42P01 during operation - table doesn't exist |
| 39 | **Slow requests logged** | Server logs | `/analyze-error` (1556ms), `/search` (4864ms) - performance optimization needed |

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

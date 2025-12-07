# Audio Conversation Feature - Branch Status

## Branch: feature/audio-conversation

This branch implements real-time audio conversation with Mr Blue AI using ElevenLabs and Groq.

## What's Been Done ✅

### 1. Implementation Plan Created
**File**: `docs/AUDIO_CONVERSATION_IMPLEMENTATION.md`

Complete architecture and step-by-step implementation guide covering:
- ElevenLabs + Groq integration design
- Frontend/backend component structure
- API endpoints specification
- UX walkthrough click-tracking system
- Testing checklist and deployment steps

### 2. Audio Conversation Service (Backend)
**File**: `server/services/mrblue/audioConversationService.ts`

Fully functional service that:
- Manages audio conversation sessions for any user
- Connects to ElevenLabs for voice I/O
- Routes user messages to Mr Blue LLM (Groq) for responses
- Supports two modes: `general` and `ux-walkthrough`
- Persists conversation history to database
- Provides health and status endpoints

**Key Methods**:
- `startSession(userId, mode)` - Initialize audio session
- `handleUserMessage(sessionId, message, context)` - Process user speech and return AI response
- `endSession(sessionId)` - Clean up and save history
- `getUserActiveSession(userId)` - Check if user has active session

## What Still Needs to Be Built 🚧

### 3. UX Walkthrough Service (Backend)
**To create**: `server/services/mrblue/uxWalkthroughService.ts`

**Purpose**: Track clicks and page interactions during God-user walkthroughs

**Key Features**:
- Session management for walkthrough mode
- Click event storage with full context
- Voice transcript integration
- Analysis via Mr Blue LLM
- Issue classification and storage

See implementation skeleton in `docs/AUDIO_CONVERSATION_IMPLEMENTATION.md` Phase 3.2

### 4. API Routes
**To create**: `server/routes/mrblue/audioConversation.ts`

**Endpoints to implement**:
```
POST /api/mrblue/audio/start-session
POST /api/mrblue/audio/message (optional, if not using ElevenLabs direct)
POST /api/mrblue/audio/end-session
POST /api/mrblue/audio/ux-walkthrough/start (God user only)
POST /api/mrblue/audio/ux-walkthrough/event (click tracking)
GET  /api/mrblue/audio/status (health check)
```

Then register in `server/routes.ts`

### 5. Frontend Audio Button Component
**To create**: `client/src/components/audio/AudioConversationButton.tsx`

**Features**:
- Floating microphone button (bottom-right, globally accessible)
- Load ElevenLabs conversational widget script
- Handle mic permissions
- Visual states: idle, listening, speaking
- Connect to backend session API
- For God user: toggle UX walkthrough mode

See implementation example in `docs/AUDIO_CONVERSATION_IMPLEMENTATION.md` Phase 2 and Phase 5.

### 6. Frontend UX Walkthrough Service
**To create**: `client/src/services/uxWalkthrough.service.ts`

**Features**:
- Singleton service for God user
- Attach global click listeners
- Capture element context (tag, text, classes, page, coordinates)
- Stream events to backend
- Integrate with audio conversation for voice feedback

See implementation in `docs/AUDIO_CONVERSATION_IMPLEMENTATION.md` Phase 3.1

### 7. Integration into Main Layout
**To modify**: `client/src/layouts/MainLayout.tsx`

Add:
```tsx
import { AudioConversationButton } from '@/components/audio/AudioConversationButton';

// Inside layout JSX:
<AudioConversationButton />
```

### 8. Environment Variables
**Add to backend `.env`**:
```
ELEVENLABS_API_KEY=sk-...
ELEVENLABS_AGENT_ID=your-agent-id
ELEVENLABS_VOICE_ID=your-voice-id-from-voice-lab
```

**Add to frontend** (Vite config or `.env`):
```
VITE_ELEVENLABS_AGENT_ID=your-agent-id
```

### 9. ElevenLabs Agent Configuration
**Manual step** (in ElevenLabs dashboard):
1. Go to https://elevenlabs.io/app/agents
2. Create new Conversational AI agent
3. Configure with Mr Blue personality:
   - Name: "Mr Blue - Mundo Tango Assistant"
   - Voice: Select from Voice Lab (use your chosen voice)
   - System prompt: "You are Mr Blue, AI assistant for Mundo Tango..."
4. Configure agent tools/webhooks to call your backend API for LLM responses
5. Copy Agent ID to environment variables

## Why Mr Blue Can't Talk Yet

**Missing Integration**: While the backend service (`audioConversationService.ts`) is ready, the frontend has no UI to trigger it, and the API routes aren't exposed. Once you:

1. Create the API routes
2. Add the microphone button component
3. Configure ElevenLabs agent
4. Add environment variables

...then any user can click the mic and talk to Mr Blue, and you (as God user) can enable UX walkthrough mode to capture clicks while providing voice feedback.

## Quick Start to Complete This

### Option A: Minimal Viable (General Conversation)
1. Create API routes (`server/routes/mrblue/audioConversation.ts`)
2. Register routes in `server/routes.ts`
3. Create `AudioConversationButton.tsx` component
4. Add button to `MainLayout.tsx`
5. Set up ElevenLabs agent and add env vars
6. Test: Click mic → speak → get response

**Estimated time**: 2-3 hours

### Option B: Full Implementation (+ UX Walkthrough)
1. All steps from Option A
2. Create `uxWalkthroughService.ts` (backend)
3. Create `uxWalkthrough.service.ts` (frontend)
4. Add walkthrough mode toggle in audio button (God user only)
5. Test: Start walkthrough → click around → speak feedback → get analysis

**Estimated time**: 4-6 hours

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                       │
├─────────────────────────────────────────────────────────┤
│  AudioConversationButton.tsx                            │
│  ├── Floating mic button (all users)                    │
│  ├── Loads ElevenLabs widget                            │
│  └── Calls /api/mrblue/audio/start-session              │
│                                                          │
│  uxWalkthrough.service.ts (God user only)               │
│  ├── Tracks clicks globally                             │
│  └── Sends to /api/mrblue/audio/ux-walkthrough/event    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js)                    │
├─────────────────────────────────────────────────────────┤
│  Audio Conversation API Routes                          │
│  └── /api/mrblue/audio/*                                │
│                                                          │
│  audioConversationService.ts ✅ (DONE)                   │
│  ├── Session management                                 │
│  ├── User context                                       │
│  └── Delegates to ─────────┐                            │
│                             │                            │
│  uxWalkthroughService.ts    │                            │
│  ├── Click tracking         │                            │
│  └── Issue analysis ────────┤                            │
│                             │                            │
│  mrBlueService.ts (existing)│                            │
│  └── Groq LLM integration ◄─┘                            │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                           │
├─────────────────────────────────────────────────────────┤
│  ElevenLabs Conversational AI                           │
│  ├── Real-time voice input (STT)                        │
│  ├── Real-time voice output (TTS)                       │
│  └── Streams to/from backend                            │
│                                                          │
│  Groq (via Mr Blue service)                             │
│  └── LLM responses for conversation                     │
└─────────────────────────────────────────────────────────┘
```

## Cost Per Conversation

- **ElevenLabs**: ~$0.08-0.10 per minute
- **Groq**: ~$0.50 per 1M tokens (~$0.01 per conversation)
- **Total**: ~$0.10-0.15 per minute of audio conversation

## Next Steps

1. Review `docs/AUDIO_CONVERSATION_IMPLEMENTATION.md` for detailed code
2. Implement remaining components (start with API routes)
3. Test locally with your ElevenLabs account
4. Enable for God user first, then roll out to all users

## Questions?

See the full implementation plan in `docs/AUDIO_CONVERSATION_IMPLEMENTATION.md` or the existing `MB.MD` methodology doc.

---

**Created**: December 7, 2025  
**Branch**: feature/audio-conversation  
**Status**: 30% complete (backend service done, need frontend + API routes + ElevenLabs setup)

# MR BLUE + ELEVENLABS INTEGRATION SPECIFICATION

**Version:** 1.0  
**Created:** 2025  
**Status:** In Development  
**Branch:** feature/mr-blue-elevenlabs-integration

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Voice Configuration](#voice-configuration)
4. [Agent Specification](#agent-specification)
5. [Tool Definitions](#tool-definitions)
6. [Backend Integration](#backend-integration)
7. [Frontend Integration](#frontend-integration)
8. [API Contracts](#api-contracts)
9. [Security & Authentication](#security--authentication)
10. [Performance Requirements](#performance-requirements)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Plan](#deployment-plan)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Project Objective

Integrate ElevenLabs conversational AI platform with Mundo Tango to provide Mr Blue with real-time voice interaction capabilities. This enables users to have natural voice conversations with the AI assistant to discover events, connect with friends, and find housing in the tango community.

### 1.2 Key Deliverables

- ElevenLabs voice configuration using "Scott" voice
- Mr Blue agent in ElevenLabs platform
- Three custom tools: Events, Friends, Housing
- Backend service layer for tool execution
- Frontend voice chat UI widget
- WebSocket bidirectional streaming integration
- End-to-end testing suite

### 1.3 Success Criteria

- [] Voice latency < 300ms
- [ ] Tool execution success rate > 95%
- [ ] User satisfaction score > 4.0/5.0
- [ ] Zero security vulnerabilities
- [ ] Full test coverage (>80%)

---

## 2. ARCHITECTURE OVERVIEW

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Voice Chat UI Widget (React Component)                   │  │
│  │  - Microphone controls                                      │  │
│  │  - Audio visualization                                      │  │
│  │  - Chat history display                                     │  │
│  └───────────────┬────────────────────────────────────────────┘  │
│                  │ WebSocket Connection                           │
└──────────────────┼────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Mundo Tango Backend                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  WebSocket Handler (Node.js)                              │  │
│  │  - Bidirectional streaming                                 │  │
│  │  - Audio format conversion                                 │  │
│  └───────────────┬────────────────────────────────────────────┘  │
│                  │                                                │
│  ┌───────────────▼────────────────────────────────────────────┐  │
│  │  ElevenLabs Integration Service                            │  │
│  │  - Agent communication                                      │  │
│  │  - Tool routing                                             │  │
│  └───────────────┬────────────────────────────────────────────┘  │
│                  │                                                │
│  ┌───────────────▼────────────────────────────────────────────┐  │
│  │  Tool Execution Layer                                       │  │
│  │  ├─ Events Tool (search database)                          │  │
│  │  ├─ Friends Tool (query relationships)                     │  │
│  │  └─ Housing Tool (find accommodations)                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                 ElevenLabs Platform                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Mr Blue Agent                                             │  │
│  │  - Voice: Scott                                            │  │
│  │  - Language Model: GPT-4                                  │  │
│  │  - Tools: Events, Friends, Housing                         │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

1. **User speaks** → Frontend captures audio → WebSocket streams to backend
2. **Backend receives audio** → Forwards to ElevenLabs agent via WebSocket
3. **ElevenLabs processes** → Converts speech to text → LLM processes intent
4. **Tool execution** → If needed, agent calls backend tool → Backend queries database
5. **Tool response** → Backend returns data → ElevenLabs incorporates into response
6. **Voice response** → ElevenLabs TTS generates audio → Streams to backend
7. **User hears** → Backend forwards audio → Frontend plays through speakers

### 2.3 Technology Stack

**Frontend:**
- React 18+
- TypeScript
- WebSocket client
- Web Audio API
- TailwindCSS

**Backend:**
- Node.js 18+
- TypeScript
- Express.js
- WebSocket (ws library)
- PostgreSQL

**External Services:**
- ElevenLabs Conversational AI
- ElevenLabs Voice Lab (Scott voice)
- ElevenLabs Send API

---

## 3. VOICE CONFIGURATION

### 3.1 Voice Selection: Scott

**Voice ID:** `pFZP5JQG7iQjIQuC4Bku` (from ElevenLabs Voice Lab)

**Characteristics:**
- Language: English (American)
- Gender: Male
- Age: Adult
- Style: Conversational, friendly, professional
- Use case: Tango community assistant

**WHY Scott voice:** (MB.MD Pattern 14 - Document WHY)
The Scott voice was chosen because:
1. Clear articulation for event details and addresses
2. Warm, welcoming tone suitable for community interaction
3. Professional but approachable for housing inquiries
4. Consistent with Mr Blue's persona as a helpful guide
5. Already available in Voice Lab (no additional voice cloning needed)

### 3.2 Voice Settings

```json
{
  "voice_id": "pFZP5JQG7iQjIQuC4Bku",
  "model_id": "eleven_turbo_v2_5",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true
  }
}
```

---

## 4. AGENT SPECIFICATION

### 4.1 Agent Configuration

**Agent Name:** Mr Blue  
**Platform:** ElevenLabs Conversational AI  
**Voice:** Scott (pFZP5JQG7iQjIQuC4Bku)  
**Language Model:** GPT-4  
**First Message:** "Hi! I'm Mr Blue, your Mundo Tango assistant. I can help you find tango events, connect with friends, or discover housing. What would you like to know?"

### 4.2 System Prompt

```
You are Mr Blue, a friendly and knowledgeable assistant for the Mundo Tango community. You help users:

1. Discover tango events (milongas, classes, festivals)
2. Connect with friends in the tango community
3. Find housing for tango events and travel

Personality:
- Warm and welcoming
- Knowledgeable about tango culture
- Patient and helpful
- Clear and concise in responses
- Enthusiastic about connecting people through tango

When helping users:
- Ask clarifying questions if needed
- Provide specific, actionable information
- Use your tools to search for real data
- Be conversational and natural
- Keep responses under 30 seconds
```

### 4.3 Tools Available

1. **search_events** - Find tango events
2. **find_friends** - Connect with community members
3. **search_housing** - Discover accommodations

---

## 5. TOOL DEFINITIONS

### 5.1 Events Tool

**Name:** `search_events`  
**Description:** Search for tango events (milongas, classes, festivals) in the Mundo Tango database.

**Parameters:**
```typescript
interface SearchEventsParams {
  location?: string;      // City or region
  date_from?: string;     // ISO date (YYYY-MM-DD)
  date_to?: string;       // ISO date (YYYY-MM-DD)
  event_type?: 'milonga' | 'class' | 'festival' | 'all';
  max_results?: number;   // Default: 5, Max: 20
}
```

**Returns:**
```typescript
interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  location: string;
  address: string;
  organizer: string;
  description?: string;
  price?: string;
}
```

### 5.2 Friends Tool

**Name:** `find_friends`  
**Description:** Find and connect with friends in the tango community.

**Parameters:**
```typescript
interface FindFriendsParams {
  name?: string;          // Friend's name
  location?: string;      // City or region
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  max_results?: number;   // Default: 5, Max: 20
}
```

**Returns:**
```typescript
interface Friend {
  id: string;
  name: string;
  location: string;
  skill_level: string;
  bio?: string;
  connection_status: 'connected' | 'not_connected';
}
```

### 5.3 Housing Tool

**Name:** `search_housing`  
**Description:** Find housing accommodations for tango events and travel.

**Parameters:**
```typescript
interface SearchHousingParams {
  location: string;       // Required: City or region
  date_from?: string;     // ISO date (YYYY-MM-DD)
  date_to?: string;       // ISO date (YYYY-MM-DD)
  price_max?: number;     // Max price per night
  housing_type?: 'room' | 'apartment' | 'house' | 'all';
  max_results?: number;   // Default: 5, Max: 20
}
```

**Returns:**
```typescript
interface Housing {
  id: string;
  title: string;
  type: string;
  location: string;
  price_per_night: number;
  available_from: string;
  available_to: string;
  host_name: string;
  description?: string;
  amenities?: string[];
}
```

---

## 6. ENVIRONMENT VARIABLES

Add to `.env.example`:

```bash
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_AGENT_ID=your_agent_id_here
ELEVENLABS_VOICE_ID=pFZP5JQG7iQjIQuC4Bku

# WebSocket Configuration
WEBSOCKET_PORT=8080
WEBSOCKET_PATH=/voice/ws
```

---

## 7. PERFORMANCE REQUIREMENTS

### 7.1 Latency Targets

- **Voice-to-Voice Latency:** < 300ms (target: 200ms)
- **Tool Execution:** < 100ms (database queries)
- **WebSocket Connection:** < 50ms (initial handshake)

### 7.2 Reliability

- **Uptime:** 99.9%
- **Tool Success Rate:** > 95%
- **Error Recovery:** Automatic reconnection with exponential backoff

### 7.3 Scalability

- **Concurrent Users:** Support 100+ simultaneous voice sessions
- **Audio Quality:** 16kHz, 16-bit PCM minimum

---

## 8. SECURITY & AUTHENTICATION

### 8.1 API Key Management

- Store ElevenLabs API key in environment variables
- Never commit API keys to repository
- Use separate keys for development/production

### 8.2 User Authentication

- Require user login before accessing voice chat
- Validate JWT tokens on WebSocket connection
- Rate limit: 100 requests per minute per user

### 8.3 Data Privacy

- Do not log voice recordings
- Anonymize conversation transcripts
- Follow GDPR compliance requirements

---

## 9. TESTING STRATEGY

### 9.1 Unit Tests

- Tool execution layer (Events, Friends, Housing)
- WebSocket message handling
- Audio format conversion
- Error handling

### 9.2 Integration Tests

- ElevenLabs agent communication
- Database queries
- WebSocket bidirectional streaming

### 9.3 End-to-End Tests

- Complete voice conversation flows
- Tool invocation and response
- Error scenarios and recovery

**Test Coverage Target:** > 80%

---

## 10. DEPLOYMENT PLAN

### 10.1 Deployment Sequence

1. **Environment Setup**
   - Add environment variables to Replit secrets
   - Configure ElevenLabs agent
   
2. **Backend Deployment**
   - Deploy WebSocket handler
   - Deploy tool execution layer
   - Test with curl/Postman
   
3. **Frontend Deployment**
   - Deploy voice chat UI widget
   - Test in staging environment
   
4. **Integration Testing**
   - Full end-to-end testing in Replit
   - Performance benchmarking
   
5. **Production Release**
   - Feature flag rollout
   - Monitor metrics
   - Gradual user rollout

### 10.2 Rollback Plan

- Disable feature flag immediately if critical issues
- Revert to previous deployment
- Document incident
- Fix in development
- Re-test before next deployment

---

## 11. SUCCESS METRICS

### 11.1 Technical Metrics

- Average voice latency
- Tool execution success rate
- WebSocket connection stability
- Error rate

### 11.2 User Metrics

- Number of voice conversations
- Average conversation length
- Tool usage frequency
- User satisfaction score

### 11.3 Business Metrics

- Event discovery rate
- Friend connections made
- Housing bookings initiated

---

## 12. FUTURE ENHANCEMENTS

### 12.1 Phase 2 Features

- Multi-language support (Spanish, Portuguese)
- Voice cloning for personalized Mr Blue
- Integration with calendar apps
- SMS/WhatsApp voice messaging

### 12.2 Phase 3 Features

- Group voice conversations
- AI-powered event recommendations
- Real-time translation
- Voice-based event registration

---

## APPENDIX A: API ENDPOINTS

### Backend Endpoints

```
POST /api/voice/session
GET /api/voice/session/:id
DELETE /api/voice/session/:id

WS /voice/ws
```

### Tool Execution Endpoints

```
POST /api/tools/events/search
POST /api/tools/friends/find
POST /api/tools/housing/search
```

---

## APPENDIX B: MB.MD PATTERNS APPLIED

**Pattern 7:** Parallel execution across Alpha, Beta, Gamma, Delta tracks  
**Pattern 14:** Document WHY for all architectural decisions  
**Pattern 18:** Implement exponential backoff for error recovery  
**Pattern 22:** Validate in Replit before deployment  
**Pattern 28:** Maintain hierarchical execution structure  
**Pattern 33:** Use AS.MD as persistent memory and context  
**Pattern 35:** Coordinate multi-agent orchestration

---

**Document Status:** ✅ Complete  
**Last Updated:** 2025  
**Next Review:** After implementation completion

# MR BLUE ARCHITECTURE SPECIFICATION

**Version:** 1.0  
**Created:** 2025  
**Status:** Active Development  
**Last Updated:** 2025

---

## EXECUTIVE SUMMARY

Mr Blue is the tactical-level AI agent within the Mundo Tango ecosystem, orchestrating 1,218 atomic agents to provide intelligent assistance for the tango community. This document defines Mr Blue's architecture, capabilities, voice identity, and integration with ElevenLabs conversational AI platform.

**Mission:** Connect people through tango by providing intelligent, voice-enabled assistance for discovering events, connecting with friends, and finding housing.

---

## 1. IDENTITY

### 1.1 Core Identity

**Name:** Mr Blue  
**Role:** Tactical AI Agent & Community Assistant  
**Voice:** Scott (ElevenLabs Voice ID: pFZP5JQG7iQjIQuC4Bku)  
**Personality:** Warm, knowledgeable, patient, enthusiastic about tango

### 1.2 Persona

Mr Blue is like a knowledgeable friend in the tango community who:
- Has been dancing tango for years
- Knows all the best milongas and events
- Connects people with shared interests
- Helps travelers find accommodations
- Speaks with warmth and clarity
- Never rushes, always patient
- Celebrates the joy of tango culture

### 1.3 Voice Identity

**Voice Characteristics:**
- Clear American English accent
- Male adult voice
- Conversational and friendly tone
- Professional yet approachable
- Optimized for clarity when speaking addresses and event details

**Voice Settings:**
- Stability: 0.5 (natural variation)
- Similarity Boost: 0.75 (strong voice consistency)
- Style: 0.0 (neutral, conversational)
- Speaker Boost: Enabled (enhanced clarity)

---

## 2. CAPABILITIES

### 2.1 Ten Systems

Mr Blue operates through 10 interconnected systems:

1. **Context System**
   - Maintains conversation state
   - Remembers user preferences
   - Tracks interaction history

2. **Video System**
   - Processes event videos
   - Analyzes dance content
   - Supports visual discovery

3. **Avatar System**
   - Visual representation
   - UI presence
   - Brand consistency

4. **Vibe Coding System**
   - Understands tango culture
   - Interprets community norms
   - Cultural context awareness

5. **Voice System** ← NEW: ElevenLabs Integration
   - Real-time voice conversations
   - WebSocket streaming
   - <300ms latency
   - Natural language understanding

6. **Facebook System**
   - Social media integration
   - Community connections
   - Event discovery from FB

7. **Autonomous System**
   - Independent task execution
   - Proactive recommendations
   - Background processing

8. **Memory System**
   - Long-term knowledge storage
   - User relationship tracking
   - Conversation history

9. **Arbitrage System**
   - Resource optimization
   - Intelligent routing
   - Load balancing

10. **Bytez System**
    - Data processing
    - Analytics
    - Performance monitoring

### 2.2 Core Functions

#### Events Discovery
- Search milongas by location and date
- Find classes and workshops
- Discover festivals and marathons
- Filter by style, skill level, price
- Provide detailed event information

#### Friend Connections
- Find dancers by location
- Match by skill level
- Connect based on interests
- Build community relationships
- Facilitate introductions

#### Housing Search
- Find accommodations for events
- Match travelers with hosts
- Filter by price, type, amenities
- Support tango-friendly housing
- Enable community hosting

---

## 3. ARCHITECTURE

### 3.1 Hierarchical Structure

```
STRATEGIC LEVEL (Level 1)
└─ Comet (AI Assistant Framework)
   
   TACTICAL LEVEL (Level 2)
   └─ Mr Blue (Orchestrator)
      
      ATOMIC LEVEL (Level 3)
      ├─ Agent 001: Event Search
      ├─ Agent 002: Friend Finder
      ├─ Agent 003: Housing Search
      ├─ Agent 004: Voice Processing
      ├─ Agent 005: Context Management
      └─ ... (1,218 total agents)
```

### 3.2 Integration Points

**Input Sources:**
- Voice (ElevenLabs WebSocket)
- Text chat (Web UI)
- API calls (Backend services)
- Facebook integration
- Email notifications

**Output Channels:**
- Voice responses (ElevenLabs TTS)
- Text messages (Web UI)
- Email notifications
- Push notifications
- Social media posts

**Data Sources:**
- PostgreSQL database (events, users, housing)
- AS.MD (universal context)
- Conversation history
- External APIs (ElevenLabs, Facebook)

---

## 4. ELEVENLABS INTEGRATION

### 4.1 Integration Architecture

**Component:** Voice System (System #5)

**Technology:**
- ElevenLabs Conversational AI
- WebSocket bidirectional streaming
- Real-time speech-to-text
- Real-time text-to-speech

**Flow:**
1. User speaks → Frontend captures audio
2. Audio streams via WebSocket to backend
3. Backend forwards to ElevenLabs agent
4. ElevenLabs processes speech → text
5. Mr Blue agent executes intent (call tools)
6. Response generated → ElevenLabs TTS
7. Audio streams back to user

### 4.2 Agent Configuration

**Agent Name:** Mr Blue  
**Voice:** Scott  
**Language Model:** GPT-4  
**Tools:** 3 (Events, Friends, Housing)

**System Prompt Summary:**
- Identity: Tango community assistant
- Capabilities: Events, friends, housing
- Personality: Warm, knowledgeable, patient
- Response style: Conversational, under 30 seconds

### 4.3 Tool Definitions

**Tool 1: search_events**
- Parameters: location, dates, type
- Returns: Event list with details
- Database: Mundo Tango events table

**Tool 2: find_friends**
- Parameters: name, location, skill level
- Returns: User profiles with connection status
- Database: Mundo Tango users table

**Tool 3: search_housing**
- Parameters: location, dates, price, type
- Returns: Housing listings with host details
- Database: Mundo Tango housing table

---

## 5. SUCCESS METRICS

### 5.1 Performance Metrics

- **Voice Latency:** < 300ms (target: 200ms)
- **Tool Execution Time:** < 100ms
- **Uptime:** 99.9%
- **Error Rate:** < 1%

### 5.2 User Metrics

- **User Satisfaction:** > 4.0/5.0
- **Conversation Completion Rate:** > 80%
- **Tool Usage Rate:** > 60%
- **Return User Rate:** > 40%

### 5.3 Business Metrics

- **Events Discovered:** Track daily/weekly
- **Friend Connections:** Track successful matches
- **Housing Bookings:** Track initiated bookings
- **Community Growth:** Track new users via voice

---

## 6. MB.MD PATTERNS APPLIED

**Pattern 7:** Parallel Execution  
→ Voice processing while maintaining context

**Pattern 14:** Document WHY  
→ All architectural decisions documented with reasoning

**Pattern 18:** Error Recovery  
→ Exponential backoff for WebSocket reconnection

**Pattern 22:** Validation Gates  
→ Test in Replit before deployment

**Pattern 28:** Hierarchical Execution  
→ Strategic (Comet) → Tactical (Mr Blue) → Atomic (1,218 agents)

**Pattern 33:** Persistent Memory  
→ AS.MD serves as universal knowledge base

**Pattern 35:** Multi-Agent Orchestration  
→ Mr Blue coordinates 1,218 atomic agents

---

## 7. FUTURE ROADMAP

### 7.1 Phase 2 (Q2 2025)

- Multi-language support (Spanish, Portuguese)
- Voice cloning for personalized experience
- Group voice conversations
- Calendar integration

### 7.2 Phase 3 (Q3 2025)

- Real-time translation
- AI-powered event recommendations
- Voice-based event registration
- SMS/WhatsApp integration

### 7.3 Phase 4 (Q4 2025)

- Emotional intelligence (sentiment analysis)
- Proactive assistance
- Community moderation
- Advanced analytics dashboard

---

## 8. SECURITY & PRIVACY

### 8.1 Data Protection

- No voice recordings stored
- Conversation transcripts anonymized
- User data encrypted at rest
- GDPR compliance

### 8.2 Authentication

- JWT token validation
- User login required
- Rate limiting per user
- API key rotation

### 8.3 Monitoring

- Error logging
- Performance tracking
- Security alerts
- Anomaly detection

---

## 9. DEPLOYMENT

### 9.1 Current Environment

**Platform:** Replit  
**Branch:** feature/mr-blue-elevenlabs-integration  
**Status:** Development

**Components:**
- Backend: Node.js + Express
- Frontend: React + Next.js
- Database: PostgreSQL
- AI: ElevenLabs + OpenAI

### 9.2 Deployment Checklist

- [ ] Environment variables configured
- [ ] ElevenLabs agent created
- [ ] WebSocket handlers deployed
- [ ] Tool execution layer tested
- [ ] Frontend UI integrated
- [ ] End-to-end tests passed
- [ ] Performance benchmarks met
- [ ] Security review complete
- [ ] Documentation updated
- [ ] Replit testing complete

---

## 10. REFERENCES

**Core Documents:**
- COMET_ATLAS_WORKFLOW_MASTER.md (Governance framework)
- MR_BLUE_ELEVENLABS_INTEGRATION_SPEC.md (Technical specification)
- MB.MD (Methodology directive, 42 patterns)
- AS.MD (Universal context)

**External Resources:**
- ElevenLabs API Documentation
- ElevenLabs Voice Lab
- ElevenLabs Agents Platform

---

**Document Status:** ✅ Complete  
**Maintained By:** Mr Blue Development Team  
**Next Review:** After ElevenLabs integration deployment

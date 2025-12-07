# Audio Conversation Feature Implementation Plan

## Overview
This document outlines the implementation of real-time audio conversation with Mr Blue AI, including:
- Universal microphone button for all users
- ElevenLabs conversational AI integration
- UX walkthrough mode for God user with click tracking
- Connection to existing Mr Blue LLM backend (Groq)

## Architecture

### Components

#### 1. Frontend Components

**AudioConversationButton.tsx** (`client/src/components/audio/AudioConversationButton.tsx`)
- Floating microphone button (globally accessible)
- Manages ElevenLabs widget initialization
- Handles permissions and connection state
- Shows visual feedback (listening, speaking, idle)

**UXWalkthroughSession.tsx** (`client/src/components/audio/UXWalkthroughSession.tsx`)
- God-user-only mode for site walkthrough
- Click tracking and event capture
- Real-time context streaming to backend
- Visual overlay showing tracked interactions

#### 2. Backend Services

**Audio Conversation Service** (`server/services/mrblue/audioConversationService.ts`)
- Manages ElevenLabs Conversational AI sessions
- Bridges ElevenLabs agent with Mr Blue LLM backend
- Handles session state and user context

**UX Walkthrough Service** (`server/services/mrblue/uxWalkthroughService.ts`)
- Captures click events and page context
- Maintains walkthrough session state
- Stores feedback and issues for later processing
- Integrates with existing Mr Blue chat and context systems

#### 3. API Endpoints

**POST /api/mrblue/audio/start-session**
- Initializes audio conversation session
- Returns ElevenLabs agent configuration
- Attaches user context and permissions

**POST /api/mrblue/audio/ux-walkthrough/start**
- God user only
- Starts UX walkthrough session
- Enables click tracking mode

**POST /api/mrblue/audio/ux-walkthrough/event**
- Streams click events and voice feedback
- Passes context to Mr Blue LLM
- Returns AI analysis and suggestions

**POST /api/mrblue/audio/end-session**
- Cleanup and session teardown
- Saves conversation logs

## Implementation Steps

### Phase 1: ElevenLabs Integration (Foundation)

**1.1 ElevenLabs Agent Setup**
- [ ] Create ElevenLabs Conversational AI agent in dashboard
- [ ] Configure agent with Mr Blue personality/instructions
- [ ] Get agent ID and API keys
- [ ] Add to environment variables:
  - `ELEVENLABS_API_KEY`
  - `ELEVENLABS_AGENT_ID`
  - `ELEVENLABS_VOICE_ID` (from voice lab)

**1.2 Backend Audio Service**
```typescript
// server/services/mrblue/audioConversationService.ts
import { ElevenLabsClient } from 'elevenlabs';

export class AudioConversationService {
  private client: ElevenLabsClient;
  
  async startSession(userId: string, mode: 'general' | 'ux-walkthrough') {
    // Create ElevenLabs conversation session
    // Attach user context from existing Mr Blue systems
    // Return WebSocket/config for frontend
  }
  
  async handleUserMessage(sessionId: string, message: string) {
    // Forward to Mr Blue LLM (Groq)
    // Get response
    // Send to ElevenLabs TTS
  }
  
  async endSession(sessionId: string) {
    // Cleanup
    // Save logs
  }
}
```

**1.3 Audio Conversation API Routes**
```typescript
// server/routes/mrblue/audioConversation.ts
router.post('/audio/start-session', authenticateToken, async (req, res) => {
  const { mode } = req.body;
  const userId = req.user.id;
  
  // Check permissions for ux-walkthrough mode
  if (mode === 'ux-walkthrough' && req.user.role !== 'god') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  const session = await audioConversationService.startSession(userId, mode);
  res.json(session);
});
```

### Phase 2: Frontend Audio Button

**2.1 Create AudioConversationButton Component**
```tsx
// client/src/components/audio/AudioConversationButton.tsx
import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

export const AudioConversationButton = () => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const startConversation = async () => {
    // Request mic permissions
    // Call /api/mrblue/audio/start-session
    // Initialize ElevenLabs widget/WebSocket
    // Start listening
  };
  
  return (
    <button
      className=\"fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full 
                 bg-blue-600 hover:bg-blue-700 shadow-lg transition-all\"
      onClick={startConversation}
    >
      {isListening ? (
        <Mic className=\"w-6 h-6 text-white animate-pulse\" />
      ) : (
        <Mic className=\"w-6 h-6 text-white\" />
      )}
    </button>
  );
};
```

**2.2 Add to Global Layout**
```tsx
// client/src/layouts/MainLayout.tsx
import { AudioConversationButton } from '@/components/audio/AudioConversationButton';

export const MainLayout = ({ children }) => {
  return (
    <div>
      {children}
      <AudioConversationButton />
    </div>
  );
};
```

### Phase 3: UX Walkthrough Mode

**3.1 Click Tracking Service**
```typescript
// client/src/services/uxWalkthrough.service.ts
export class UXWalkthroughService {
  private sessionId: string | null = null;
  private isTracking = false;
  
  async startWalkthrough() {
    const response = await api.post('/api/mrblue/audio/ux-walkthrough/start');
    this.sessionId = response.data.sessionId;
    this.isTracking = true;
    this.attachClickListeners();
  }
  
  private attachClickListeners() {
    document.addEventListener('click', this.handleClick, true);
  }
  
  private async handleClick(event: MouseEvent) {
    if (!this.isTracking) return;
    
    const target = event.target as HTMLElement;
    const context = {
      element: target.tagName,
      text: target.innerText?.substring(0, 100),
      classList: Array.from(target.classList),
      page: window.location.pathname,
      timestamp: Date.now(),
      x: event.clientX,
      y: event.clientY
    };
    
    await api.post('/api/mrblue/audio/ux-walkthrough/event', {
      sessionId: this.sessionId,
      type: 'click',
      context
    });
  }
  
  stopWalkthrough() {
    this.isTracking = false;
    document.removeEventListener('click', this.handleClick, true);
  }
}
```

**3.2 UX Walkthrough Backend Service**
```typescript
// server/services/mrblue/uxWalkthroughService.ts
export class UXWalkthroughService {
  private sessions = new Map();
  
  async startSession(userId: string) {
    const sessionId = generateId();
    this.sessions.set(sessionId, {
      userId,
      startTime: Date.now(),
      events: [],
      feedback: []
    });
    return { sessionId };
  }
  
  async handleEvent(sessionId: string, event: any, voiceTranscript?: string) {
    const session = this.sessions.get(sessionId);
    session.events.push(event);
    
    // If voice feedback provided, analyze with Mr Blue LLM
    if (voiceTranscript) {
      const context = {
        currentPage: event.context.page,
        element: event.context.element,
        clickHistory: session.events.slice(-5)
      };
      
      const analysis = await mrBlueService.analyzeUXFeedback(
        voiceTranscript,
        context
      );
      
      session.feedback.push({
        timestamp: Date.now(),
        transcript: voiceTranscript,
        analysis,
        context
      });
      
      return analysis;
    }
  }
  
  async endSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    // Save to database
    await storage.saveUXWalkthroughSession(session);
    this.sessions.delete(sessionId);
    return session;
  }
}
```

### Phase 4: Integration with Existing Mr Blue Backend

**4.1 Connect to Groq LLM**
The existing Mr Blue service already uses Groq, so we extend it:

```typescript
// server/services/mrBlue/mrBlueService.ts (existing, extend)
export class MrBlueService {
  // ... existing methods
  
  async analyzeUXFeedback(userFeedback: string, context: any) {
    const systemPrompt = `You are Mr Blue, UX analyst for Mundo Tango. 
    User is giving feedback while walking through the site. 
    Current page: ${context.currentPage}
    Element clicked: ${context.element}
    Recent clicks: ${JSON.stringify(context.clickHistory)}
    
    Analyze the feedback and provide:
    1. Issue classification (bug, UX, design, content)
    2. Severity (low, medium, high, critical)
    3. Suggested fix
    4. Location in codebase`;
    
    const response = await this.groqClient.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userFeedback }
      ],
      temperature: 0.3
    });
    
    return response.choices[0].message.content;
  }
}
```

### Phase 5: ElevenLabs Widget Configuration

**5.1 Frontend Integration**
```tsx
// client/src/components/audio/AudioConversationButton.tsx
import { useEffect, useState } from 'react';

export const AudioConversationButton = () => {
  const [elevenLabsWidget, setElevenLabsWidget] = useState(null);
  
  useEffect(() => {
    // Load ElevenLabs script
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    document.body.appendChild(script);
    
    script.onload = () => {
      // Initialize widget (hidden by default)
      const widget = window.ElevenLabs.createConversationalAI({
        agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID,
        onMessage: handleAIMessage,
        onUserMessage: handleUserMessage
      });
      setElevenLabsWidget(widget);
    };
  }, []);
  
  const handleUserMessage = async (message: string) => {
    // If in UX walkthrough mode, also send to backend
    if (uxWalkthroughService.isTracking) {
      await uxWalkthroughService.sendVoiceFeedback(message);
    }
  };
  
  const handleAIMessage = (message: string) => {
    // Display or handle AI response
    console.log('AI:', message);
  };
  
  const startConversation = () => {
    elevenLabsWidget?.show();
    elevenLabsWidget?.start();
  };
  
  return (
    <button onClick={startConversation} className=\"mic-button\">
      <Mic />
    </button>
  );
};
```

## Environment Variables

Add to `.env`:
```
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=your_agent_id_from_dashboard
ELEVENLABS_VOICE_ID=your_voice_lab_voice_id

# Existing (already configured)
GROQ_API_KEY=your_groq_api_key
```

Frontend `.env` (or Vite config):
```
VITE_ELEVENLABS_AGENT_ID=your_agent_id_from_dashboard
```

## Testing Checklist

- [ ] General user can click mic button
- [ ] Mic permissions requested properly
- [ ] ElevenLabs voice conversation starts
- [ ] Voice is clear and uses selected Voice Lab voice
- [ ] Responses come from Mr Blue LLM (Groq)
- [ ] God user can start UX walkthrough mode
- [ ] Click events are captured and sent to backend
- [ ] Voice feedback during walkthrough is processed
- [ ] Issues are classified and stored
- [ ] Session can be ended cleanly

## Deployment Steps

1. Add environment variables to production
2. Deploy backend with new routes
3. Deploy frontend with audio button
4. Configure ElevenLabs agent in dashboard
5. Test end-to-end with God user
6. Enable for all users

## Cost Estimates

- **ElevenLabs**: ~$0.08-0.10 per minute of conversation
- **Groq**: ~$0.50 per 1M tokens (very cheap for LLM)
- **Combined**: Approximately $0.10-0.15 per minute of full conversation

## Future Enhancements

- [ ] Video avatar integration (existing Luma service)
- [ ] Multi-language support
- [ ] Conversation history and replay
- [ ] Issue tracking dashboard
- [ ] Auto-generation of GitHub issues from walkthrough feedback
- [ ] A/B testing different voice personalities

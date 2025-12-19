# OpenAI Realtime API Implementation for Mr. Blue
## ChatGPT-Style Voice Conversation

**Current Status:** Using Whisper API (separate transcription + TTS)  
**Goal:** Full ChatGPT voice mode with OpenAI Realtime API  
**Based on:** User's attached requirements for bidirectional streaming audio

---

## 🎯 What You Want (From Your Attachment)

> "I want to build or integrate the tech that lets someone speak directly to an AI (like ChatGPT's voice conversations)"

**Current Implementation:**
```
User speaks → Whisper transcribes → Send to GPT-4o → Get text response → TTS plays audio
```

**What You Need:**
```
User speaks ←→ OpenAI Realtime API ←→ AI responds in real-time
        (WebRTC bidirectional streaming with ~300ms latency)
```

---

## 📚 Tech Stack Needed

### 1. Speech-to-Text + Text-to-Speech (Combined)
- **OpenAI Realtime API** - Handles BOTH in one WebRTC session
- Model: `gpt-4o-realtime-preview-2024-10-01`
- Voices: alloy, echo, fable, onyx, nova, shimmer

### 2. Real-Time Connection
- **WebRTC** - Low-latency audio streaming
- **WebSocket** (fallback) - For text-only mode
- **MediaRecorder API** - Browser mic access

### 3. AI Brain
- **GPT-4o Realtime** - Optimized for voice conversation
- Supports function calling during conversation
- Can interrupt AI mid-sentence

---

## 🔧 Complete Implementation

### Step 1: Backend Realtime Session Endpoint

**File:** `server/routes/openai-realtime.ts` (NEW FILE)

```typescript
import express, { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create ephemeral token for WebRTC session
router.post('/session', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { model = 'gpt-4o-realtime-preview-2024-10-01' } = req.body;
    
    // Create ephemeral token (valid for 60 seconds)
    const response = await openai.beta.realtime.sessions.create({
      model,
      voice: 'alloy',
    });
    
    res.json({
      client_secret: response.client_secret.value,
      expires_at: response.client_secret.expires_at,
      model: response.model,
    });
  } catch (error: any) {
    console.error('Realtime session error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;
```

**Register in `server/index.ts`:**

```typescript
import openaiRealtimeRoutes from './routes/openai-realtime';

app.use('/api/openai-realtime', authenticateToken, openaiRealtimeRoutes);
```

---

### Step 2: Frontend Realtime Hook

**File:** `client/src/hooks/useOpenAIRealtime.ts` (NEW FILE)

```typescript
import { useState, useRef, useCallback, useEffect } from 'react';

interface RealtimeConfig {
  instructions?: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  turnDetection?: {
    type: 'server_vad';
    threshold?: number;
    prefix_padding_ms?: number;
    silence_duration_ms?: number;
  };
}

interface RealtimeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export function useOpenAIRealtime(config: RealtimeConfig = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Connect to OpenAI Realtime API
  const connect = useCallback(async () => {
    try {
      // 1. Get ephemeral token from backend
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/openai-realtime/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-realtime-preview-2024-10-01',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to get session token');
      
      const { client_secret } = await response.json();
      
      // 2. Create WebRTC connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      
      // 3. Set up audio playback
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      
      pc.ontrack = (event) => {
        audioEl.srcObject = event.streams[0];
      };
      
      // 4. Set up microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000,
        },
      });
      
      streamRef.current = stream;
      
      // Add audio track to connection
      const audioTrack = stream.getAudioTracks()[0];
      pc.addTrack(audioTrack, stream);
      
      // 5. Create data channel for messages
      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;
      
      dc.addEventListener('open', () => {
        console.log('Data channel open');
        
        // Configure session
        dc.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            voice: config.voice || 'alloy',
            instructions: config.instructions || 
              'You are Mr. Blue, a helpful AI assistant integrated into the Mundo Tango Visual Editor. ' +
              'You understand the MB.MD methodology (Simultaneously, Recursively, Critically) and can help users edit their pages.',
            turn_detection: config.turnDetection || {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200,
            },
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1',
            },
          },
        }));
        
        setIsConnected(true);
        setIsRecording(true);
      });
      
      // Handle incoming messages
      dc.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'conversation.item.created':
            if (data.item.type === 'message') {
              const content = data.item.content?.[0]?.transcript || '';
              if (content) {
                setMessages(prev => [...prev, {
                  role: data.item.role,
                  content,
                  timestamp: Date.now(),
                }]);
              }
            }
            break;
            
          case 'input_audio_buffer.speech_started':
            console.log('User started speaking');
            break;
            
          case 'input_audio_buffer.speech_stopped':
            console.log('User stopped speaking');
            break;
            
          case 'response.audio.delta':
            // Audio is streamed through WebRTC track, not data channel
            break;
            
          case 'response.done':
            console.log('Response complete');
            break;
            
          case 'error':
            console.error('Realtime API error:', data.error);
            setError(data.error.message);
            break;
        }
      });
      
      // 6. Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // 7. Connect to OpenAI
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-10-01';
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${client_secret}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });
      
      if (!sdpResponse.ok) {
        throw new Error('Failed to connect to OpenAI Realtime API');
      }
      
      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });
      
      console.log('✅ Connected to OpenAI Realtime API');
      
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message);
      setIsConnected(false);
    }
  }, [config]);
  
  // Disconnect
  const disconnect = useCallback(() => {
    // Stop mic
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Close data channel
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    
    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    
    setIsConnected(false);
    setIsRecording(false);
  }, []);
  
  // Send text message
  const sendMessage = useCallback((text: string) => {
    if (!dcRef.current || !isConnected) {
      console.warn('Not connected');
      return;
    }
    
    dcRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text,
          },
        ],
      },
    }));
    
    // Trigger response
    dcRef.current.send(JSON.stringify({
      type: 'response.create',
    }));
  }, [isConnected]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    isConnected,
    isRecording,
    messages,
    error,
    connect,
    disconnect,
    sendMessage,
  };
}
```

---

### Step 3: Update Mr. Blue Component

**File:** `client/src/components/visual-editor/MrBlueRealtimeChat.tsx` (NEW FILE)

```tsx
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { useOpenAIRealtime } from '@/hooks/useOpenAIRealtime';
import { useToast } from '@/hooks/use-toast';

interface Props {
  currentPage?: string;
  selectedElement?: any;
}

export function MrBlueRealtimeChat({ currentPage, selectedElement }: Props) {
  const { toast } = useToast();
  const [mode, setMode] = useState<'idle' | 'voice'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const instructions = `You are Mr. Blue, an AI assistant in the Mundo Tango Visual Editor.

Current Context:
- Page: ${currentPage || '/'}
- Selected Element: ${selectedElement?.tagName || 'None'}
- Methodology: MB.MD (Simultaneously, Recursively, Critically)

Help the user edit their page using natural conversation. Be concise and helpful.`;
  
  const {
    isConnected,
    isRecording,
    messages,
    error,
    connect,
    disconnect,
    sendMessage,
  } = useOpenAIRealtime({
    instructions,
    voice: 'alloy',
    turnDetection: {
      type: 'server_vad',
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 500,
    },
  });
  
  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: 'Connection Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  const handleStartVoiceChat = async () => {
    try {
      await connect();
      setMode('voice');
      toast({
        title: 'Voice Chat Started',
        description: 'Speak naturally - Mr. Blue is listening!',
      });
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleStopVoiceChat = () => {
    disconnect();
    setMode('idle');
    toast({
      title: 'Voice Chat Ended',
      description: 'Conversation saved.',
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold">Mr. Blue AI</h3>
          <p className="text-sm text-muted-foreground">
            {isConnected ? '🟢 Live Voice Chat' : 'Ready to help'}
          </p>
        </div>
        
        <div className="flex gap-2">
          {mode === 'idle' && (
            <Button
              onClick={handleStartVoiceChat}
              variant="default"
              size="sm"
              data-testid="button-start-voice-chat"
            >
              <Phone className="w-4 h-4 mr-2" />
              Start Voice Chat
            </Button>
          )}
          
          {mode === 'voice' && (
            <Button
              onClick={handleStopVoiceChat}
              variant="destructive"
              size="sm"
              data-testid="button-stop-voice-chat"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              End Call
            </Button>
          )}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>Start a voice conversation to begin!</p>
            <p className="text-sm mt-2">Mr. Blue understands MB.MD methodology</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <div className="text-xs opacity-70 mb-1">
                {msg.role === 'user' ? 'You' : 'Mr. Blue'}
              </div>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Voice Indicator */}
      {isRecording && (
        <div className="p-4 border-t bg-muted/50">
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-1 h-8 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <span className="text-sm">Listening...</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Step 4: Add to Visual Editor

**File:** `client/src/components/visual-editor/MrBlueAITab.tsx`

**Replace Whisper chat with:**

```tsx
import { MrBlueRealtimeChat } from './MrBlueRealtimeChat';

// In the component JSX:
<MrBlueRealtimeChat 
  currentPage={currentPage}
  selectedElement={selectedElement}
/>
```

---

## 🎨 UI Features

### Voice Chat Indicator
```tsx
<div className="flex gap-1">
  {[1, 2, 3].map(i => (
    <div
      key={i}
      className="w-1 h-8 bg-primary rounded-full animate-pulse"
      style={{ animationDelay: `${i * 150}ms` }}
    />
  ))}
</div>
```

### Connection Status Badge
```tsx
{isConnected && (
  <Badge variant="success">
    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
    Live
  </Badge>
)}
```

---

## 🧪 Testing

**Playwright Test:**

```typescript
test('OpenAI Realtime voice conversation', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/visual-editor');
  
  // Click AI tab
  await page.click('[data-testid="tab-ai"]');
  
  // Start voice chat
  await page.click('[data-testid="button-start-voice-chat"]');
  await page.waitForTimeout(2000);
  
  // Should show listening indicator
  await expect(page.locator('text=Listening...')).toBeVisible();
  
  // Should show live status
  await expect(page.locator('text=Live Voice Chat')).toBeVisible();
  
  // End call
  await page.click('[data-testid="button-stop-voice-chat"]');
});
```

---

## 📊 Comparison

| Feature | Whisper API (Current) | Realtime API (New) |
|---------|----------------------|-------------------|
| **Latency** | ~2-5 seconds | ~300ms |
| **Conversation** | Turn-based | Real-time |
| **Interruption** | ❌ No | ✅ Yes |
| **Streaming** | ❌ No | ✅ Yes |
| **Natural Flow** | ❌ No | ✅ Yes |
| **Cost** | Lower | Higher |
| **Complexity** | Simple | Moderate |

---

## 💰 Cost Estimate

**Realtime API Pricing** (as of Nov 2024):
- Audio input: $0.06 / minute
- Audio output: $0.24 / minute
- Text input/output: $2.50 / 1M tokens

**Example:**
- 10-minute conversation
- Input: 10 min × $0.06 = $0.60
- Output: 10 min × $0.24 = $2.40
- **Total: ~$3.00 per 10-minute conversation**

---

## 🚀 Deployment Checklist

- [ ] Add `OPENAI_API_KEY` to environment variables
- [ ] Create backend endpoint `/api/openai-realtime/session`
- [ ] Implement `useOpenAIRealtime` hook
- [ ] Create `MrBlueRealtimeChat` component
- [ ] Update Visual Editor to use new component
- [ ] Test voice chat connection
- [ ] Test message transcription
- [ ] Test interruption handling
- [ ] Add error handling
- [ ] Add reconnection logic
- [ ] Create Playwright tests
- [ ] Update documentation

---

## 📝 Environment Variables

```env
# .env
OPENAI_API_KEY=sk-proj-... # Must have Realtime API access
```

---

## 🎯 Result

**You'll have:**
- ✅ True ChatGPT-style voice conversation
- ✅ Real-time bidirectional audio streaming
- ✅ Natural conversation flow with interruptions
- ✅ ~300ms latency (vs 2-5 seconds)
- ✅ Full MB.MD methodology awareness
- ✅ Context-aware AI assistance

**Just like ChatGPT voice mode**, but integrated into your Visual Editor!

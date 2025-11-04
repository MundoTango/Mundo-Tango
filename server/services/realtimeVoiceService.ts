/**
 * OpenAI Realtime Voice Service
 * WebSocket-based ChatGPT-style voice conversations
 * Powers natural voice interaction across all Mr. Blue instances
 */

import WebSocket from 'ws';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface RealtimeSession {
  ws: WebSocket;
  openaiWs: WebSocket | null;
  userId: number;
  role: string;
  context: {
    page?: string;
    selectedElement?: any;
    mode?: 'visual_editor' | 'chat' | 'global';
  };
}

const activeSessions = new Map<string, RealtimeSession>();

export class RealtimeVoiceService {
  /**
   * Initialize Realtime API connection for user
   */
  async initializeSession(
    clientWs: WebSocket,
    userId: number,
    role: string,
    context: RealtimeSession['context']
  ): Promise<string> {
    const sessionId = `realtime-${userId}-${Date.now()}`;

    try {
      // Connect to OpenAI Realtime API
      const openaiWs = new WebSocket(
        'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01',
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'realtime=v1'
          }
        }
      );

      // Store session
      const session: RealtimeSession = {
        ws: clientWs,
        openaiWs,
        userId,
        role,
        context
      };

      activeSessions.set(sessionId, session);

      // Configure session when OpenAI WebSocket opens
      openaiWs.on('open', () => {
        console.log('[RealtimeVoice] Connected to OpenAI Realtime API');

        // Configure session
        const config = this.buildSessionConfig(session);
        openaiWs.send(JSON.stringify(config));

        // Send initial instructions
        const instructions = this.buildSystemPrompt(session);
        openaiWs.send(JSON.stringify({
          type: 'session.update',
          session: {
            instructions
          }
        }));
      });

      // Forward messages from OpenAI to client
      openaiWs.on('message', (data: Buffer) => {
        const message = data.toString();
        
        try {
          const event = JSON.parse(message);
          
          // Log important events
          if (event.type === 'conversation.item.created') {
            console.log('[RealtimeVoice] Item created:', event.item?.type);
          }
          
          // Forward to client
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(message);
          }
        } catch (error) {
          console.error('[RealtimeVoice] Parse error:', error);
        }
      });

      // Handle errors
      openaiWs.on('error', (error) => {
        console.error('[RealtimeVoice] OpenAI WebSocket error:', error);
        this.handleError(sessionId, error);
      });

      // Handle disconnect
      openaiWs.on('close', () => {
        console.log('[RealtimeVoice] OpenAI WebSocket closed');
        this.cleanupSession(sessionId);
      });

      // Forward messages from client to OpenAI
      clientWs.on('message', (data: Buffer) => {
        const message = data.toString();
        
        try {
          const event = JSON.parse(message);
          
          // Handle special commands
          if (event.type === 'client.update_context') {
            // Update session context
            session.context = { ...session.context, ...event.context };
            
            // Update OpenAI instructions
            const newInstructions = this.buildSystemPrompt(session);
            if (openaiWs.readyState === WebSocket.OPEN) {
              openaiWs.send(JSON.stringify({
                type: 'session.update',
                session: {
                  instructions: newInstructions
                }
              }));
            }
            return;
          }
          
          // Forward to OpenAI
          if (openaiWs.readyState === WebSocket.OPEN) {
            openaiWs.send(message);
          }
        } catch (error) {
          console.error('[RealtimeVoice] Client message error:', error);
        }
      });

      // Handle client disconnect
      clientWs.on('close', () => {
        console.log('[RealtimeVoice] Client disconnected');
        this.cleanupSession(sessionId);
      });

      return sessionId;
    } catch (error) {
      console.error('[RealtimeVoice] Session init error:', error);
      throw error;
    }
  }

  /**
   * Build session configuration
   */
  private buildSessionConfig(session: RealtimeSession) {
    return {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        voice: 'alloy',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500
        },
        temperature: 0.8,
        max_response_output_tokens: 4096
      }
    };
  }

  /**
   * Build system prompt based on context
   */
  private buildSystemPrompt(session: RealtimeSession): string {
    const basePrompt = `You are Mr. Blue, the intelligent AI assistant for Mundo Tango - a global tango community platform.

Role: ${session.role}
User ID: ${session.userId}

Your personality:
- Helpful, conversational, and warm
- Knowledgeable about tango, dance, events, and community
- Professional yet approachable
- Proactive in offering assistance

`;

    // Add context-specific instructions
    if (session.context.mode === 'visual_editor') {
      return basePrompt + `
VISUAL EDITOR MODE:
You are assisting with live code editing. When the user requests changes:
1. Acknowledge the request immediately
2. Describe what you're doing as you work
3. Apply changes instantly to the preview
4. Generate the code in the background
5. Confirm completion

Current page: ${session.context.page || 'Unknown'}
Selected element: ${session.context.selectedElement ? JSON.stringify(session.context.selectedElement) : 'None'}

For editing requests like "make it blue" or "move it to the right":
- Respond conversationally: "Got it! Making that button blue now..."
- Stream your work: "Applying color... Updating styles... Done!"
- Be specific about what you changed

You can trigger visual changes by using the phrase: "APPLY_CHANGE:" followed by JSON describing the change.
Example: "APPLY_CHANGE:{"type":"style","property":"color","value":"blue"}"
`;
    }

    // Add role-based permissions
    if (session.role === 'god' || session.role === 'super_admin') {
      return basePrompt + `
You have full system access. You can:
- Edit code and make visual changes
- Access all features and data
- Help with development tasks
- Answer technical questions

Be helpful and efficient in assisting with development work.
`;
    }

    return basePrompt + `
You can help users with:
- Finding events and dancers
- Navigating the platform
- Answering questions about tango
- General assistance

Respond conversationally and be helpful!
`;
  }

  /**
   * Handle session error
   */
  private handleError(sessionId: string, error: any) {
    const session = activeSessions.get(sessionId);
    
    if (session && session.ws.readyState === WebSocket.OPEN) {
      session.ws.send(JSON.stringify({
        type: 'error',
        error: {
          message: error.message || 'Voice session error',
          code: error.code || 'REALTIME_ERROR'
        }
      }));
    }
    
    this.cleanupSession(sessionId);
  }

  /**
   * Cleanup session
   */
  private cleanupSession(sessionId: string) {
    const session = activeSessions.get(sessionId);
    
    if (session) {
      // Close OpenAI WebSocket
      if (session.openaiWs && session.openaiWs.readyState === WebSocket.OPEN) {
        session.openaiWs.close();
      }
      
      // Remove from active sessions
      activeSessions.delete(sessionId);
      
      console.log(`[RealtimeVoice] Session ${sessionId} cleaned up`);
    }
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    return activeSessions.size;
  }

  /**
   * Cleanup all sessions (for shutdown)
   */
  cleanupAll() {
    activeSessions.forEach((_, sessionId) => {
      this.cleanupSession(sessionId);
    });
  }
}

export const realtimeVoiceService = new RealtimeVoiceService();

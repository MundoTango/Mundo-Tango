import WebSocket from 'ws';
import { db } from '../../db';
import { userTelemetry } from '../../../shared/schema';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_REALTIME_URL = 'wss://api.openai.com/v1/realtime';

interface RealtimeSession {
  sessionId: string;
  userId: number;
  ws: WebSocket;
  startTime: Date;
  audioChunks: number;
}

/**
 * OpenAI Realtime Voice API Service
 * Provides real-time voice conversations via WebSocket
 * Cost: ~$0.06 per minute (much cheaper than ElevenLabs for long conversations)
 */
export class OpenAIRealtimeService {
  private apiKey: string;
  private activeSessions: Map<string, RealtimeSession> = new Map();

  constructor() {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.apiKey = OPENAI_API_KEY;
  }

  /**
   * Start a real-time voice session
   * @param userId - User ID for tracking
   * @returns Session ID and WebSocket URL
   */
  async startRealtimeSession(userId: number): Promise<{
    sessionId: string;
    wsUrl: string;
  }> {
    try {
      console.log('[OpenAI Realtime] Starting session for user:', userId);

      const sessionId = `session_${Date.now()}_${userId}`;

      // Create WebSocket connection
      const ws = new WebSocket(`${OPENAI_REALTIME_URL}?model=gpt-4o-realtime-preview-2024-10-01`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      });

      // Store session
      this.activeSessions.set(sessionId, {
        sessionId,
        userId,
        ws,
        startTime: new Date(),
        audioChunks: 0
      });

      // Setup WebSocket event handlers
      ws.on('open', () => {
        console.log(`[OpenAI Realtime] Session connected: ${sessionId}`);
        
        // Send session configuration
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are Mr. Blue, a helpful AI assistant for Mundo Tango.',
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            turn_detection: {
              type: 'server_vad'
            }
          }
        }));
      });

      ws.on('message', (data) => {
        this.handleWebSocketMessage(sessionId, data);
      });

      ws.on('error', (error) => {
        console.error(`[OpenAI Realtime] WebSocket error for ${sessionId}:`, error);
      });

      ws.on('close', () => {
        console.log(`[OpenAI Realtime] Session closed: ${sessionId}`);
        this.endRealtimeSession(sessionId);
      });

      return {
        sessionId,
        wsUrl: OPENAI_REALTIME_URL
      };
    } catch (error: any) {
      console.error('[OpenAI Realtime] Error starting session:', error.message);
      throw new Error(`Failed to start realtime session: ${error.message}`);
    }
  }

  /**
   * Send audio chunk to active session
   * @param sessionId - The session ID
   * @param audioData - Audio data buffer (PCM16 format)
   */
  async sendAudioChunk(sessionId: string, audioData: Buffer): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.ws.readyState !== WebSocket.OPEN) {
      throw new Error(`Session WebSocket not open: ${sessionId}`);
    }

    try {
      // Send audio as base64
      const base64Audio = audioData.toString('base64');
      
      session.ws.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: base64Audio
      }));

      session.audioChunks++;
    } catch (error: any) {
      console.error('[OpenAI Realtime] Error sending audio chunk:', error.message);
      throw error;
    }
  }

  /**
   * End a real-time session and calculate costs
   * @param sessionId - The session ID to end
   */
  async endRealtimeSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      console.warn(`[OpenAI Realtime] Session not found for cleanup: ${sessionId}`);
      return;
    }

    try {
      // Calculate session duration
      const durationMs = Date.now() - session.startTime.getTime();
      const durationMinutes = durationMs / 60000;
      const cost = durationMinutes * 0.06; // $0.06 per minute

      // Close WebSocket
      if (session.ws.readyState === WebSocket.OPEN) {
        session.ws.close();
      }

      // Track usage
      await this.trackUsage(session.userId, 'realtime_voice', cost, {
        durationMinutes,
        audioChunks: session.audioChunks
      });

      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      console.log(`[OpenAI Realtime] Session ended: ${sessionId} (${durationMinutes.toFixed(2)} min, $${cost.toFixed(4)})`);
    } catch (error) {
      console.error('[OpenAI Realtime] Error ending session:', error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(sessionId: string, data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());
      
      // Log important events
      if (message.type === 'response.audio.delta') {
        // Audio response chunk received
      } else if (message.type === 'response.done') {
        console.log(`[OpenAI Realtime] Response completed for ${sessionId}`);
      } else if (message.type === 'error') {
        console.error(`[OpenAI Realtime] Error in ${sessionId}:`, message.error);
      }
    } catch (error) {
      console.error('[OpenAI Realtime] Error parsing message:', error);
    }
  }

  /**
   * Get active session
   */
  getSession(sessionId: string): RealtimeSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Track usage in userTelemetry
   */
  private async trackUsage(
    userId: number,
    eventType: string,
    cost: number,
    metadata: any = {}
  ): Promise<void> {
    try {
      await db.insert(userTelemetry).values({
        userId,
        eventType: `premium_${eventType}`,
        metadata: {
          service: 'openai-realtime',
          cost,
          ...metadata,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[OpenAI Realtime] Error tracking usage:', error);
    }
  }
}

export const openaiRealtimeService = new OpenAIRealtimeService();

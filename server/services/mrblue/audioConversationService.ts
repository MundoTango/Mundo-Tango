import { ElevenLabsClient, ElevenLabs } from 'elevenlabs';
import { v4 as uuidv4 } from 'uuid';
import { mrBlueService } from './mrBlueService';
import { storage } from '../../storage/storage';

interface AudioSession {
  sessionId: string;
  userId: string;
  mode: 'general' | 'ux-walkthrough';
  startTime: number;
  elevenLabsConversationId?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  isActive: boolean;
}

class AudioConversationService {
  private client: ElevenLabsClient;
  private sessions: Map<string, AudioSession> = new Map();

  constructor() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  ELEVENLABS_API_KEY not configured - audio conversation will not work');
    }
    this.client = new ElevenLabsClient({ apiKey });
  }

  /**
   * Start a new audio conversation session
   */
  async startSession(
    userId: string,
    mode: 'general' | 'ux-walkthrough' = 'general'
  ): Promise<{ sessionId: string; agentId: string; config: any }> {
    const sessionId = uuidv4();

    const session: AudioSession = {
      sessionId,
      userId,
      mode,
      startTime: Date.now(),
      messages: [],
      isActive: true,
    };

    this.sessions.set(sessionId, session);

    // Get user context for personalization
    const user = await storage.getUserById(userId);
    const userContext = {
      name: user?.name || 'user',
      role: user?.role || 'dancer',
      preferredLanguage: user?.preferred_language || 'en',
    };

    // Agent configuration for ElevenLabs
    const agentId = process.env.ELEVENLABS_AGENT_ID || '';
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '';

    const config = {
      agentId,
      voiceId,
      userContext,
      mode,
      // Initial system message context
      initialContext: mode === 'ux-walkthrough'
        ? 'You are helping a user walk through the Mundo Tango site. Listen to their feedback about UI/UX issues and provide analysis.'
        : 'You are Mr Blue, the AI assistant for Mundo Tango. Help users with anything related to tango, events, housing, and community.',
    };

    console.log(`✅ Audio session started: ${sessionId} (mode: ${mode})`);

    return {
      sessionId,
      agentId,
      config,
    };
  }

  /**
   * Handle a user message in the conversation
   */
  async handleUserMessage(
    sessionId: string,
    message: string,
    context?: any
  ): Promise<{ response: string; analysis?: any }> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error('Session not found or inactive');
    }

    // Add user message to session history
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });

    // Get AI response from Mr Blue LLM (Groq)
    let response: string;
    let analysis: any = null;

    if (session.mode === 'ux-walkthrough' && context) {
      // For UX walkthrough, analyze feedback with context
      analysis = await mrBlueService.analyzeUXFeedback(message, context);
      response = analysis.summary || analysis;
    } else {
      // For general conversation, use standard Mr Blue chat
      response = await mrBlueService.chat(
        session.messages.map(m => ({
          role: m.role,
          content: m.content,
        }))
      );
    }

    // Add assistant response to session history
    session.messages.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    });

    return { response, analysis };
  }

  /**
   * Get session details
   */
  getSession(sessionId: string): AudioSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * End a conversation session
   */
  async endSession(sessionId: string): Promise<AudioSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    session.isActive = false;

    // Save session to database for history
    try {
      await storage.saveAudioConversationSession({
        session_id: session.sessionId,
        user_id: session.userId,
        mode: session.mode,
        start_time: new Date(session.startTime),
        end_time: new Date(),
        message_count: session.messages.length,
        messages: JSON.stringify(session.messages),
      });
    } catch (error) {
      console.error('Error saving audio conversation session:', error);
    }

    // Clean up from memory after 5 minutes
    setTimeout(() => {
      this.sessions.delete(sessionId);
    }, 5 * 60 * 1000);

    console.log(`✅ Audio session ended: ${sessionId}`);

    return session;
  }

  /**
   * Get active session for a user
   */
  getUserActiveSession(userId: string): AudioSession | undefined {
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.isActive) {
        return session;
      }
    }
    return undefined;
  }

  /**
   * Health check
   */
  getStatus(): {
    configured: boolean;
    activeSessions: number;
    totalSessions: number;
  } {
    return {
      configured: !!process.env.ELEVENLABS_API_KEY,
      activeSessions: Array.from(this.sessions.values()).filter(s => s.isActive).length,
      totalSessions: this.sessions.size,
    };
  }
}

// Singleton instance
export const audioConversationService = new AudioConversationService();

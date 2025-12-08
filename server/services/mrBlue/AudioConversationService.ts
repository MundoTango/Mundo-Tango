/**
 * Audio Conversation Service
 * Manages real-time audio conversations with Mr. Blue using:
 * - ElevenLabs Conversational AI for TTS (Voice Lab voice)
 * - Groq Whisper for STT
 * - Vibe coding command parsing and routing
 * - Click tracking context integration
 */

import { WebSocket } from 'ws';
import Groq from 'groq-sdk';
import { db } from '@shared/db';
import { vibeCodingService } from './VibeCodingService';
import { conversationOrchestrator } from '../../services/ConversationOrchestrator';

interface AudioSession {
  id: string;
  userId: number | null;
  startedAt: Date;
  status: 'active' | 'ended';
  clickContext: ClickEvent[];
  conversationHistory: ConversationMessage[];
}

interface ClickEvent {
  timestamp: Date;
  elementType: string;
  elementText: string;
  elementId?: string;
  elementClass?: string;
  position: { x: number; y: number };
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVibeCoding?: boolean;
}

class AudioConversationService {
  private sessions: Map<string, AudioSession> = new Map();
  private groq: Groq;
  private elevenlabsApiKey: string;
  private elevenlabsVoiceId: string;

  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    this.elevenlabsApiKey = process.env.ELEVENLABS_API_KEY || '';
    this.elevenlabsVoiceId = process.env.ELEVENLABS_VOICE_ID || '';
  }

  /**
   * Start a new audio conversation session
   */
  async startSession(sessionId: string, userId: number | null): Promise<AudioSession> {
    const session: AudioSession = {
      id: sessionId,
      userId,
      startedAt: new Date(),
      status: 'active',
      clickContext: [],
      conversationHistory: []
    };

    this.sessions.set(sessionId, session);
    console.log(`[AudioConversation] Started session ${sessionId} for user ${userId}`);
    
    return session;
  }

  /**
   * Track click event during active conversation
   */
  trackClick(sessionId: string, clickEvent: Omit<ClickEvent, 'timestamp'>): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') return;

    session.clickContext.push({
      ...clickEvent,
      timestamp: new Date()
    });

    console.log(`[AudioConversation] Tracked click in session ${sessionId}:`, clickEvent);
  }

  /**
   * Transcribe audio using Groq Whisper
   */
  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      const response = await this.groq.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.webm', { type: 'audio/webm' }),
        model: 'whisper-large-v3',
        language: 'en',
        response_format: 'json'
      });

      return response.text;
    } catch (error) {
      console.error('[AudioConversation] Transcription error:', error);
      throw error;
    }
  }

  /**
   * Parse user input for vibe coding commands
   * Examples:
   * - "make that button blue" -> {action: 'style', target: 'button', property: 'color', value: 'blue'}
   * - "this doesn't work" -> {action: 'bug_report', target: 'element', issue: 'not working'}
   * - "add X element" -> {action: 'add', type: 'element'}
   */
  parseVibeCodingCommand(text: string, clickContext: ClickEvent[]): {
    isCommand: boolean;
    command?: any;
    target?: ClickEvent;
  } {
    const lowerText = text.toLowerCase();
    
    // Command patterns
    const stylePattern = /make (that|this|the) (\w+) (\w+)/i;
    const bugPattern = /(this|that|the) (\w+)? ?(doesn't work|not working|broken|bug)/i;
    const addPattern = /add (a |an |the )?(\w+) ?(element|component|button|input)?/i;
    const changePattern = /change (this|that|the) (\w+)? ?to (\w+)/i;

    // Get most recent click as target
    const target = clickContext[clickContext.length - 1];

    // Check for style change command
    if (stylePattern.test(lowerText)) {
      const match = lowerText.match(stylePattern);
      return {
        isCommand: true,
        command: {
          action: 'style',
          target: match?.[2],
          modification: match?.[3]
        },
        target
      };
    }

    // Check for bug report
    if (bugPattern.test(lowerText)) {
      return {
        isCommand: true,
        command: {
          action: 'bug_report',
          issue: 'not working'
        },
        target
      };
    }

    // Check for add element
    if (addPattern.test(lowerText)) {
      const match = lowerText.match(addPattern);
      return {
        isCommand: true,
        command: {
          action: 'add',
          elementType: match?.[2]
        },
        target
      };
    }

    // Check for change command
    if (changePattern.test(lowerText)) {
      const match = lowerText.match(changePattern);
      return {
        isCommand: true,
        command: {
          action: 'change',
          target: match?.[2],
          newValue: match?.[3]
        },
        target
      };
    }

    return { isCommand: false };
  }

  /**
   * Process user message and generate response
   */
  async processMessage(
    sessionId: string,
    userMessage: string
  ): Promise<{ text: string; isVibeCoding: boolean }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Add user message to history
    session.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    // Check for vibe coding command
    const parsedCommand = this.parseVibeCodingCommand(userMessage, session.clickContext);

    if (parsedCommand.isCommand && session.userId) {
      // Route to vibe coding service
      try {
        const result = await vibeCodingService.executeVoiceCommand(
          session.userId,
          parsedCommand.command,
          parsedCommand.target
        );

        const responseText = `Got it! I'm ${parsedCommand.command.action === 'style' ? 'updating the style' : 
                             parsedCommand.command.action === 'bug_report' ? 'logging that issue' :
                             parsedCommand.command.action === 'add' ? 'adding that element' :
                             'making that change'}. ${result.message || ''}`;

        session.conversationHistory.push({
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
          isVibeCoding: true
        });

        return { text: responseText, isVibeCoding: true };
      } catch (error) {
        console.error('[AudioConversation] Vibe coding error:', error);
        return { 
          text: "I encountered an issue executing that command. Can you try rephrasing?", 
          isVibeCoding: false 
        };
      }
    }

    // Regular conversation - use conversationOrchestrator
    const context = {
      sessionId,
      userId: session.userId,
      clickContext: session.clickContext,
      conversationHistory: session.conversationHistory
    };

    const response = await conversationOrchestrator.generateResponse(
      userMessage,
      context
    );

    session.conversationHistory.push({
      role: 'assistant',
      content: response.text,
      timestamp: new Date()
    });

    return { text: response.text, isVibeCoding: false };
  }

  /**
   * Generate speech using ElevenLabs TTS
   */
  async generateSpeech(text: string): Promise<Buffer> {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.elevenlabsVoiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': this.elevenlabsApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('[AudioConversation] TTS error:', error);
      throw error;
    }
  }

  /**
   * End conversation session
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'ended';
      console.log(`[AudioConversation] Ended session ${sessionId}`);
      
      // Clean up after 5 minutes
      setTimeout(() => {
        this.sessions.delete(sessionId);
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Get session info
   */
  getSession(sessionId: string): AudioSession | undefined {
    return this.sessions.get(sessionId);
  }
}

export const audioConversationService = new AudioConversationService();

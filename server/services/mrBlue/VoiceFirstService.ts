/**
 * VOICE-FIRST SERVICE (Wispr Flow Inspired)
 * 
 * Learnings from whisperflow.ai:
 * - 4x faster than typing
 * - Real-time auto-editing (remove filler words, fix grammar)
 * - Context-aware formatting (formal emails vs casual messages)
 * - Multilingual support (100+ languages, auto-detection)
 * - Natural speech input (no weird commands)
 * 
 * Implementation for Mundo Tango:
 * - Voice post creation
 * - Voice event creation
 * - Voice Mr. Blue chat
 * - Voice profile updates
 * - Voice search
 * - Supports all 68 languages
 */

import OpenAI from 'openai';
import { Groq } from 'groq-sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface VoiceTranscriptionOptions {
  audioBuffer: Buffer;
  language?: string; // ISO language code (e.g., 'en', 'es', 'zh')
  context?: 'post' | 'event' | 'chat' | 'profile' | 'search' | 'comment';
  tonePreference?: 'formal' | 'casual' | 'professional';
  autoEdit?: boolean; // Remove filler words, fix grammar
  userVoiceId?: string; // For voice cloning context
}

interface VoiceTranscriptionResult {
  rawTranscript: string; // Original transcription
  cleanedText: string; // Auto-edited version
  detectedLanguage: string;
  confidence: number;
  fillerWordsRemoved: string[];
  grammarFixes: number;
  suggestedTone: 'formal' | 'casual' | 'professional';
  metadata: {
    durationSeconds: number;
    wordCount: number;
    speakingRate: number; // Words per minute
  };
}

interface ContextAwareFormattingOptions {
  text: string;
  context: 'post' | 'event' | 'chat' | 'profile' | 'search' | 'comment';
  tonePreference?: 'formal' | 'casual' | 'professional';
  targetLanguage?: string;
}

class VoiceFirstService {
  /**
   * CORE FEATURE 1: Real-Time Voice Transcription
   * Uses OpenAI Whisper API for high-accuracy transcription
   * Supports 68 languages with auto-detection
   */
  async transcribeVoice(options: VoiceTranscriptionOptions): Promise<VoiceTranscriptionResult> {
    const startTime = Date.now();

    try {
      // Step 1: Transcribe audio using OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: new File([options.audioBuffer], "audio.webm", { type: "audio/webm" }),
        model: "whisper-1",
        language: options.language, // Auto-detect if not provided
        response_format: "verbose_json", // Get timestamps and confidence
      });

      const rawTranscript = transcription.text;
      const detectedLanguage = transcription.language || options.language || 'en';

      // Step 2: Auto-edit if enabled (default: true)
      let cleanedText = rawTranscript;
      let fillerWordsRemoved: string[] = [];
      let grammarFixes = 0;

      if (options.autoEdit !== false) {
        const editResult = await this.autoEditTranscript({
          text: rawTranscript,
          context: options.context || 'chat',
          tonePreference: options.tonePreference,
          targetLanguage: detectedLanguage,
        });

        cleanedText = editResult.cleanedText;
        fillerWordsRemoved = editResult.fillerWordsRemoved;
        grammarFixes = editResult.grammarFixes;
      }

      // Step 3: Calculate metadata
      const durationSeconds = (Date.now() - startTime) / 1000;
      const wordCount = cleanedText.split(/\s+/).length;
      const speakingRate = Math.round((wordCount / durationSeconds) * 60); // WPM

      return {
        rawTranscript,
        cleanedText,
        detectedLanguage,
        confidence: 0.95, // Whisper typically has high confidence
        fillerWordsRemoved,
        grammarFixes,
        suggestedTone: options.tonePreference || this.detectTone(cleanedText),
        metadata: {
          durationSeconds,
          wordCount,
          speakingRate,
        },
      };
    } catch (error) {
      console.error('Voice transcription error:', error);
      throw new Error('Failed to transcribe voice input');
    }
  }

  /**
   * CORE FEATURE 2: Auto-Edit Transcript
   * Removes filler words, fixes grammar, formats for context
   * Inspired by Wispr Flow's real-time editing
   */
  async autoEditTranscript(options: ContextAwareFormattingOptions): Promise<{
    cleanedText: string;
    fillerWordsRemoved: string[];
    grammarFixes: number;
  }> {
    try {
      // Use Groq Llama 3.3 70b for fast auto-editing
      const systemPrompt = this.getContextPrompt(options.context, options.tonePreference);

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Clean up this transcription (remove filler words, fix grammar, format appropriately):\n\n${options.text}`,
          },
        ],
        temperature: 0.3, // Lower temp for consistent editing
        max_tokens: 1000,
      });

      const cleanedText = response.choices[0]?.message?.content || options.text;

      // Detect filler words removed
      const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'literally'];
      const fillerWordsRemoved = fillerWords.filter(filler => 
        options.text.toLowerCase().includes(filler) && 
        !cleanedText.toLowerCase().includes(filler)
      );

      // Estimate grammar fixes (simple heuristic)
      const grammarFixes = Math.max(0, options.text.split(/\s+/).length - cleanedText.split(/\s+/).length);

      return {
        cleanedText,
        fillerWordsRemoved,
        grammarFixes,
      };
    } catch (error) {
      console.error('Auto-edit error:', error);
      // Fallback: return original text
      return {
        cleanedText: options.text,
        fillerWordsRemoved: [],
        grammarFixes: 0,
      };
    }
  }

  /**
   * CORE FEATURE 3: Context-Aware Prompts
   * Different tone/formatting based on where voice is used
   */
  private getContextPrompt(context: string, tonePreference?: string): string {
    const basePrompt = `You are a voice transcription editor. Your job is to:
1. Remove filler words (um, uh, like, you know, etc.)
2. Fix grammar and punctuation
3. Format the text appropriately for the context
4. Preserve the speaker's natural voice and intent
5. DO NOT change the meaning or add new content`;

    const contextInstructions = {
      post: `
Context: Social media post on a tango community platform.
Tone: ${tonePreference || 'Casual and friendly'}
Formatting: Short paragraphs, emojis are OK, conversational.
Example: "um I just had my first tango class and it was like amazing" → "Just had my first tango class and it was amazing! 💃"`,

      event: `
Context: Event description (milonga, workshop, festival).
Tone: ${tonePreference || 'Professional but welcoming'}
Formatting: Clear details, proper structure, no filler.
Example: "So we're having a milonga next Friday at um 8pm" → "We're hosting a milonga next Friday at 8pm."`,

      chat: `
Context: Private message or chat conversation.
Tone: ${tonePreference || 'Casual'}
Formatting: Natural conversation flow, keep it brief.
Example: "Hey um can you send me the address for the class" → "Hey, can you send me the address for the class?"`,

      profile: `
Context: User profile bio or about section.
Tone: ${tonePreference || 'Professional'}
Formatting: Polished, complete sentences, showcase expertise.
Example: "I've been dancing tango for like 15 years and I teach in Buenos Aires" → "I've been dancing tango for 15 years and teach professionally in Buenos Aires."`,

      search: `
Context: Search query.
Tone: Concise
Formatting: Remove all filler, keep only essential keywords.
Example: "um I'm looking for tango teachers in Paris who teach beginners" → "tango teachers Paris beginners"`,

      comment: `
Context: Comment on a post or event.
Tone: ${tonePreference || 'Friendly'}
Formatting: Conversational, brief, supportive.
Example: "This is so cool I can't wait to try this" → "This is so cool! Can't wait to try this!"`,
    };

    return `${basePrompt}\n\n${contextInstructions[context as keyof typeof contextInstructions] || contextInstructions.chat}`;
  }

  /**
   * CORE FEATURE 4: Tone Detection
   * Automatically detect if text is formal/casual/professional
   */
  private detectTone(text: string): 'formal' | 'casual' | 'professional' {
    const lowerText = text.toLowerCase();

    // Formal indicators
    if (
      lowerText.includes('dear') ||
      lowerText.includes('sincerely') ||
      lowerText.includes('regards') ||
      /\b(please|kindly|would|could)\b/.test(lowerText)
    ) {
      return 'formal';
    }

    // Professional indicators
    if (
      lowerText.includes('workshop') ||
      lowerText.includes('professional') ||
      lowerText.includes('experience') ||
      lowerText.includes('teaching')
    ) {
      return 'professional';
    }

    // Default: casual
    return 'casual';
  }

  /**
   * CORE FEATURE 5: Voice Post Creation
   * Speak to create a post with auto-formatting
   */
  async createVoicePost(audioBuffer: Buffer, userId: number, language?: string): Promise<{
    content: string;
    metadata: any;
  }> {
    const transcription = await this.transcribeVoice({
      audioBuffer,
      language,
      context: 'post',
      tonePreference: 'casual',
      autoEdit: true,
    });

    return {
      content: transcription.cleanedText,
      metadata: {
        rawTranscript: transcription.rawTranscript,
        detectedLanguage: transcription.detectedLanguage,
        fillerWordsRemoved: transcription.fillerWordsRemoved,
        voiceMetadata: transcription.metadata,
      },
    };
  }

  /**
   * CORE FEATURE 6: Voice Event Creation
   * Natural language event creation
   * Example: "Create a milonga next Friday at 8pm at Studio Tango Paris"
   */
  async createVoiceEvent(audioBuffer: Buffer, userId: number, language?: string): Promise<{
    title: string;
    description: string;
    eventType: string;
    startDate?: Date;
    location?: string;
    city?: string;
    metadata: any;
  }> {
    const transcription = await this.transcribeVoice({
      audioBuffer,
      language,
      context: 'event',
      tonePreference: 'professional',
      autoEdit: true,
    });

    // Use AI to extract structured event data
    const eventData = await this.extractEventData(transcription.cleanedText);

    return {
      ...eventData,
      metadata: {
        rawTranscript: transcription.rawTranscript,
        detectedLanguage: transcription.detectedLanguage,
        voiceMetadata: transcription.metadata,
      },
    };
  }

  /**
   * Extract structured event data from natural language
   */
  private async extractEventData(text: string): Promise<{
    title: string;
    description: string;
    eventType: string;
    startDate?: Date;
    location?: string;
    city?: string;
  }> {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Extract structured event data from natural language. Return JSON with:
- title (string)
- description (string)
- eventType (one of: milonga, practica, workshop, festival, performance, class)
- startDate (ISO string if mentioned, else null)
- location (venue name if mentioned, else null)
- city (city name if mentioned, else null)

Example input: "Create a milonga next Friday at 8pm at Studio Tango Paris"
Example output: {
  "title": "Milonga at Studio Tango Paris",
  "description": "Join us for a milonga at Studio Tango Paris",
  "eventType": "milonga",
  "startDate": "2025-01-24T20:00:00Z",
  "location": "Studio Tango Paris",
  "city": "Paris"
}`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const data = JSON.parse(response.choices[0]?.message?.content || '{}');

      return {
        title: data.title || 'Untitled Event',
        description: data.description || text,
        eventType: data.eventType || 'milonga',
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        location: data.location,
        city: data.city,
      };
    } catch (error) {
      console.error('Event data extraction error:', error);
      return {
        title: 'Untitled Event',
        description: text,
        eventType: 'milonga',
      };
    }
  }

  /**
   * CORE FEATURE 7: Voice Profile Update
   * Update bio/profile by speaking
   */
  async updateVoiceProfile(audioBuffer: Buffer, userId: number, language?: string): Promise<{
    bio: string;
    metadata: any;
  }> {
    const transcription = await this.transcribeVoice({
      audioBuffer,
      language,
      context: 'profile',
      tonePreference: 'professional',
      autoEdit: true,
    });

    return {
      bio: transcription.cleanedText,
      metadata: {
        rawTranscript: transcription.rawTranscript,
        detectedLanguage: transcription.detectedLanguage,
        voiceMetadata: transcription.metadata,
      },
    };
  }

  /**
   * CORE FEATURE 8: Voice Search
   * Natural language search queries
   */
  async voiceSearch(audioBuffer: Buffer, language?: string): Promise<{
    searchQuery: string;
    keywords: string[];
    metadata: any;
  }> {
    const transcription = await this.transcribeVoice({
      audioBuffer,
      language,
      context: 'search',
      autoEdit: true,
    });

    // Extract keywords
    const keywords = transcription.cleanedText
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !['the', 'and', 'for', 'with'].includes(word));

    return {
      searchQuery: transcription.cleanedText,
      keywords,
      metadata: {
        rawTranscript: transcription.rawTranscript,
        detectedLanguage: transcription.detectedLanguage,
        voiceMetadata: transcription.metadata,
      },
    };
  }

  /**
   * CORE FEATURE 9: Voice Mr. Blue Chat
   * Voice input for Mr. Blue conversations
   */
  async voiceMrBlueChat(audioBuffer: Buffer, userId: number, language?: string): Promise<{
    message: string;
    metadata: any;
  }> {
    const transcription = await this.transcribeVoice({
      audioBuffer,
      language,
      context: 'chat',
      tonePreference: 'casual',
      autoEdit: true,
    });

    return {
      message: transcription.cleanedText,
      metadata: {
        rawTranscript: transcription.rawTranscript,
        detectedLanguage: transcription.detectedLanguage,
        voiceMetadata: transcription.metadata,
      },
    };
  }

  /**
   * CORE FEATURE 10: Multilingual Support (68 Languages)
   * Auto-detect language and transcribe
   * 
   * Supported languages (Whisper supports 100+, we use 68):
   * - European: English, Spanish, French, Italian, German, Portuguese, Russian, Dutch, Polish, Turkish
   * - Asian: Chinese, Japanese, Korean, Hindi, Arabic, Hebrew, Thai, Vietnamese, Indonesian
   * - South American: Portuguese (BR), Spanish (Latin America)
   * - And 48 more...
   */
  getSupportedLanguages(): string[] {
    return [
      'en', 'es', 'fr', 'it', 'de', 'pt', 'ru', 'nl', 'pl', 'tr',
      'zh', 'ja', 'ko', 'hi', 'ar', 'he', 'th', 'vi', 'id',
      'uk', 'cs', 'ro', 'sv', 'hu', 'el', 'da', 'fi', 'no',
      'bg', 'hr', 'sk', 'sl', 'sr', 'ca', 'fa', 'ms', 'bn',
      'ta', 'te', 'ur', 'sw', 'am', 'ne', 'si', 'km', 'lo',
      'my', 'ka', 'hy', 'az', 'kk', 'uz', 'mn', 'tl', 'jv',
      'su', 'ceb', 'mg', 'eo', 'la', 'cy', 'gd', 'eu', 'gl',
      'is', 'af', 'sq', 'et',
    ];
  }
}

export default new VoiceFirstService();

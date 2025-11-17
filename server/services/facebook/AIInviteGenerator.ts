/**
 * AI Invite Generator Service
 * Generates personalized Facebook Messenger invitations using OpenAI
 * Based on Part 10 specifications
 */

import { OpenAIService } from '../ai/OpenAIService';

export interface InviteGenerationParams {
  friendName: string;
  friendEmail?: string;
  relationship?: string;
  sharedInterests?: string[];
  customContext?: string;
}

export interface GeneratedInvite {
  message: string;
  wordCount: number;
  cost: number;
  metadata: {
    model: string;
    temperature: number;
    inputTokens: number;
    outputTokens: number;
  };
}

export class AIInviteGenerator {
  /**
   * Generate personalized invitation message
   */
  static async generateInvite(params: InviteGenerationParams): Promise<GeneratedInvite> {
    const {
      friendName,
      friendEmail,
      relationship = 'Close friend',
      sharedInterests = ['Tango dancing'],
      customContext = ''
    } = params;

    // Build the prompt based on Part 10 specifications
    const prompt = `You are Mr. Blue, Scott Russell's AI assistant. Generate a warm, personalized Facebook Messenger invitation to Mundo Tango.

Scott's Context:
- Founder of Mundo Tango, global tango platform
- Teaching tango in South Korea  
- Passionate about connecting tango communities worldwide

Friend: ${friendName}${friendEmail ? ` (${friendEmail})` : ''}
Relationship: ${relationship}
Shared interests: ${sharedInterests.join(', ')}
${customContext ? `Additional context: ${customContext}` : ''}

Generate a 100-150 word invitation that:
1. Feels authentic to Scott's voice (friendly, enthusiastic)
2. References tango community connection
3. Highlights platform value (226+ events, 95 cities, global community)
4. Includes personal warm touch
5. Ends with clear call-to-action

Tone: Friendly, authentic, enthusiastic Scott
Format: Plain text, ready to send via Messenger
Do NOT use emojis or special formatting.

IMPORTANT: Keep it between 100-150 words. Make it feel personal and authentic, not salesy or robotic.`;

    // Use OpenAI to generate the message
    const response = await OpenAIService.query({
      prompt,
      model: 'gpt-4o',
      systemPrompt: 'You are Mr. Blue, an AI assistant that helps craft personalized, authentic messages. You write in a warm, conversational tone that sounds genuinely human.',
      temperature: 0.8, // Higher temperature for more creative, natural variation
      maxTokens: 300
    });

    const message = response.content.trim();
    const wordCount = message.split(/\s+/).length;

    // Validate word count
    if (wordCount < 80 || wordCount > 180) {
      console.warn(`Generated message word count (${wordCount}) outside ideal range (100-150)`);
    }

    return {
      message,
      wordCount,
      cost: response.cost,
      metadata: {
        model: 'gpt-4o',
        temperature: 0.8,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens
      }
    };
  }

  /**
   * Validate generated message quality
   */
  static validateMessage(message: string): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check word count
    const wordCount = message.split(/\s+/).length;
    if (wordCount < 50) {
      errors.push('Message too short (minimum 50 words)');
    } else if (wordCount > 200) {
      errors.push('Message too long (maximum 200 words)');
    } else if (wordCount < 100 || wordCount > 150) {
      warnings.push(`Word count (${wordCount}) outside ideal range (100-150)`);
    }

    // Check for emojis
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(message)) {
      warnings.push('Message contains emojis (not recommended)');
    }

    // Check for Mundo Tango mention
    if (!message.toLowerCase().includes('mundo tango')) {
      warnings.push('Message does not mention "Mundo Tango"');
    }

    // Check for call-to-action indicators
    const ctaKeywords = ['join', 'check out', 'visit', 'sign up', 'explore', 'connect'];
    const hasCTA = ctaKeywords.some(keyword => message.toLowerCase().includes(keyword));
    if (!hasCTA) {
      warnings.push('Message may lack clear call-to-action');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate multiple invite variations
   */
  static async generateVariations(
    params: InviteGenerationParams,
    count: number = 3
  ): Promise<GeneratedInvite[]> {
    const variations = await Promise.all(
      Array.from({ length: count }, () => this.generateInvite(params))
    );

    return variations;
  }
}

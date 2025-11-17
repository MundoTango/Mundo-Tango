/**
 * AI Invite Generator Service - PHASE 1B
 * Generates personalized Facebook Messenger invitations using OpenAI GPT-4o
 * Analyzes Scott's writing style and creates authentic, warm invitations
 */

import { OpenAIService } from '../ai/OpenAIService';

export interface FriendData {
  friendName: string;
  relationship?: string;
  closenessScore?: number;
  inviteCode: string;
  friendEmail?: string;
  sharedInterests?: string[];
  customContext?: string;
}

export interface GeneratedInvite {
  message: string;
  preview: string;
  metadata: {
    model: string;
    temperature: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    wordCount: number;
    timestamp: string;
  };
}

export class AIInviteGenerator {
  private static readonly PLATFORM_STATS = {
    events: '226+',
    cities: '95',
  };

  private static readonly INVITE_BASE_URL = 'https://mundotango.life/invite';

  /**
   * Generate personalized Facebook Messenger invitation
   * Uses GPT-4o to create authentic messages in Scott's voice
   */
  static async generateInviteMessage(friendData: FriendData): Promise<GeneratedInvite> {
    const startTime = Date.now();
    
    try {
      const {
        friendName,
        relationship = 'friend',
        closenessScore = 5,
        inviteCode,
        sharedInterests = ['tango'],
        customContext = ''
      } = friendData;

      console.log(`[AI Invite Generator] Starting generation for ${friendName} (closeness: ${closenessScore})`);

      // Build prompt based on closeness score to adjust tone
      const toneGuidance = this.getToneGuidance(closenessScore);
      const inviteUrl = `${this.INVITE_BASE_URL}/${inviteCode}`;

      const prompt = this.buildPrompt({
        friendName,
        relationship,
        closenessScore,
        inviteUrl,
        sharedInterests,
        customContext,
        toneGuidance,
      });

      // Generate message using OpenAI GPT-4o
      const response = await OpenAIService.query({
        prompt,
        model: 'gpt-4o',
        systemPrompt: this.getSystemPrompt(),
        temperature: 0.8, // Higher for natural variation
        maxTokens: 300
      });

      const message = response.content.trim();
      const wordCount = this.countWords(message);

      // Validate message quality
      const validation = this.validateMessage(message, inviteUrl);
      if (!validation.valid) {
        console.warn(`[AI Invite Generator] Validation warnings for ${friendName}:`, validation.warnings);
      }

      // Generate preview (first 100 chars)
      const preview = this.generatePreview(message);

      const generationTime = Date.now() - startTime;
      console.log(`[AI Invite Generator] ✓ Generated invite for ${friendName} in ${generationTime}ms (${wordCount} words)`);

      return {
        message,
        preview,
        metadata: {
          model: 'gpt-4o',
          temperature: 0.8,
          inputTokens: response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
          cost: response.cost,
          wordCount,
          timestamp: new Date().toISOString(),
        }
      };

    } catch (error) {
      console.error(`[AI Invite Generator] ✗ Failed to generate invite for ${friendData.friendName}:`, error);
      throw new Error(`Failed to generate invite: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get system prompt defining Scott's voice and Mr. Blue's role
   */
  private static getSystemPrompt(): string {
    return `You are Mr. Blue, Scott Russell's AI assistant. You help Scott craft personalized, authentic messages to friends about Mundo Tango.

Scott's Voice & Style:
- Warm, friendly, and enthusiastic about tango
- Professional but conversational - never robotic or salesy
- Shows genuine care for people and community
- Teaching tango in South Korea, passionate about global connections
- Founder mindset: building something meaningful, not just marketing

Your job: Write messages that sound like they came from Scott himself - natural, personal, and heartfelt.`;
  }

  /**
   * Build the generation prompt
   */
  private static buildPrompt(params: {
    friendName: string;
    relationship: string;
    closenessScore: number;
    inviteUrl: string;
    sharedInterests: string[];
    customContext: string;
    toneGuidance: string;
  }): string {
    const {
      friendName,
      relationship,
      closenessScore,
      inviteUrl,
      sharedInterests,
      customContext,
      toneGuidance,
    } = params;

    return `Generate a Facebook Messenger invitation from Scott to his ${relationship}, ${friendName}.

Context:
- Friend: ${friendName}
- Relationship: ${relationship}
- Closeness level: ${closenessScore}/10
- Shared interests: ${sharedInterests.join(', ')}
${customContext ? `- Additional context: ${customContext}` : ''}

Mundo Tango Platform:
- Global tango community platform
- ${this.PLATFORM_STATS.events} events across ${this.PLATFORM_STATS.cities} cities
- Connecting dancers worldwide
- Scott is the founder, currently teaching in South Korea

${toneGuidance}

Requirements:
1. Length: 100-150 words exactly
2. Start with a warm, personal greeting (use their name)
3. Briefly explain Mundo Tango and its value
4. Include the platform stats (${this.PLATFORM_STATS.events} events, ${this.PLATFORM_STATS.cities} cities)
5. Make it feel personal - reference the relationship naturally
6. End with clear call-to-action: "Join: ${inviteUrl}"
7. Sign off as "- Scott"

CRITICAL RULES:
- Write in Scott's authentic voice - warm, friendly, genuine
- NO emojis (except maybe one 👋 in greeting if it feels natural)
- NO marketing jargon or buzzwords
- NO robotic or template-like language
- Make it feel like a real message from a friend
- The invite link MUST be included exactly as: "Join: ${inviteUrl}"

Generate the message now:`;
  }

  /**
   * Get tone guidance based on closeness score
   */
  private static getToneGuidance(closenessScore: number): string {
    if (closenessScore >= 8) {
      return `Tone: Very personal and warm. This is a close friend - write like you're catching up over coffee. Use casual language, maybe reference inside jokes or shared memories if context allows.`;
    } else if (closenessScore >= 5) {
      return `Tone: Friendly and enthusiastic. You know this person well. Be warm but not overly casual. Show genuine excitement about sharing this opportunity.`;
    } else {
      return `Tone: Professional but friendly. This is more of an acquaintance or professional connection. Be respectful, warm, and clear about the value proposition.`;
    }
  }

  /**
   * Generate preview text (first ~100 chars)
   */
  private static generatePreview(message: string): string {
    const firstLine = message.split('\n')[0];
    if (firstLine.length <= 100) {
      return firstLine;
    }
    return firstLine.substring(0, 97) + '...';
  }

  /**
   * Count words in message
   */
  private static countWords(message: string): number {
    return message.trim().split(/\s+/).length;
  }

  /**
   * Validate generated message quality
   */
  private static validateMessage(message: string, expectedUrl: string): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check word count
    const wordCount = this.countWords(message);
    if (wordCount < 50) {
      errors.push('Message too short (minimum 50 words)');
    } else if (wordCount > 200) {
      errors.push('Message too long (maximum 200 words)');
    } else if (wordCount < 100 || wordCount > 150) {
      warnings.push(`Word count (${wordCount}) outside ideal range (100-150)`);
    }

    // Check for required elements
    if (!message.toLowerCase().includes('mundo tango')) {
      errors.push('Message must mention "Mundo Tango"');
    }

    if (!message.includes(expectedUrl)) {
      errors.push('Message must include the invite link');
    }

    if (!message.includes('- Scott')) {
      warnings.push('Message should be signed "- Scott"');
    }

    // Check for platform stats
    if (!message.includes(this.PLATFORM_STATS.events) && !message.includes('226')) {
      warnings.push('Message should mention event count');
    }

    if (!message.includes(this.PLATFORM_STATS.cities) && !message.includes('95')) {
      warnings.push('Message should mention city count');
    }

    // Check for call-to-action
    const ctaKeywords = ['join', 'check out', 'visit', 'explore', 'connect'];
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
   * Generate multiple invite variations for A/B testing
   */
  static async generateVariations(
    friendData: FriendData,
    count: number = 3
  ): Promise<GeneratedInvite[]> {
    console.log(`[AI Invite Generator] Generating ${count} variations for ${friendData.friendName}`);
    
    try {
      const variations = await Promise.all(
        Array.from({ length: count }, (_, index) => {
          console.log(`[AI Invite Generator] Generating variation ${index + 1}/${count}`);
          return this.generateInviteMessage(friendData);
        })
      );

      console.log(`[AI Invite Generator] ✓ Generated ${count} variations successfully`);
      return variations;
    } catch (error) {
      console.error(`[AI Invite Generator] ✗ Failed to generate variations:`, error);
      throw error;
    }
  }

  /**
   * Test the invite generator with sample data
   */
  static async test(): Promise<void> {
    console.log('\n=== AI Invite Generator Test ===\n');

    const testData: FriendData = {
      friendName: 'Maria',
      relationship: 'close friend',
      closenessScore: 8,
      inviteCode: 'TEST123',
      sharedInterests: ['tango', 'travel', 'music'],
      customContext: 'We met at a milonga in Buenos Aires last year'
    };

    try {
      const result = await this.generateInviteMessage(testData);
      
      console.log('Generated Message:');
      console.log('-'.repeat(60));
      console.log(result.message);
      console.log('-'.repeat(60));
      console.log('\nMetadata:');
      console.log(`- Model: ${result.metadata.model}`);
      console.log(`- Word Count: ${result.metadata.wordCount}`);
      console.log(`- Cost: $${result.metadata.cost.toFixed(6)}`);
      console.log(`- Input Tokens: ${result.metadata.inputTokens}`);
      console.log(`- Output Tokens: ${result.metadata.outputTokens}`);
      console.log('\nPreview:');
      console.log(result.preview);
      console.log('\n✓ Test completed successfully!\n');
      
    } catch (error) {
      console.error('\n✗ Test failed:', error);
      throw error;
    }
  }
}

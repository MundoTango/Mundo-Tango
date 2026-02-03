/**
 * Facebook-to-MrBlue Context Bridge Service
 * Connects Facebook Messenger conversations to Mr. Blue AI assistant
 * Pattern 32: Facebook Messenger Expert Agent integration
 */

import { db } from '../db';
import { users, facebookMessages } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { FacebookMessengerService } from './FacebookMessengerService';

export interface FacebookContext {
  userId: string;
  facebookUserId: string;
  recentMessages: {
    id: string;
    text: string;
    timestamp: Date;
    sender: 'user' | 'page';
  }[];
  userProfile?: {
    name: string;
    profilePicture?: string;
  };
  conversationSummary?: string;
}

export interface MrBlueContextEnhanced {
  source: 'facebook' | 'web' | 'api';
  facebookContext?: FacebookContext;
  conversationHistory: string;
  userIntent?: string;
}

export class FacebookMrBlueContextService {
  private messengerService: FacebookMessengerService;

  constructor() {
    this.messengerService = new FacebookMessengerService();
  }

  /**
   * Fetch Facebook conversation context for a user
   * @param supabaseUserId - MundoTango user ID
   * @param messageLimit - Number of recent messages to fetch (default: 10)
   */
  async getFacebookContext(supabaseUserId: string, messageLimit: number = 10): Promise<FacebookContext | null> {
    try {
      // Get user's Facebook connection
      const userRecord = await db
        .select()
        .from(users)
        .where(eq(users.supabaseUserId, supabaseUserId))
        .limit(1);

      if (!userRecord || userRecord.length === 0 || !userRecord[0].facebookUserId) {
        console.log(`[FacebookMrBlueContext] No Facebook connection for user ${supabaseUserId}`);
        return null;
      }

      const user = userRecord[0];
      const facebookUserId = user.facebookUserId;

      // Fetch recent Facebook messages
      const messages = await db
        .select()
        .from(facebookMessages)
        .where(eq(facebookMessages.userId, user.id!))
        .orderBy(desc(facebookMessages.timestamp))
        .limit(messageLimit);

      const recentMessages = messages.map(msg => ({
        id: msg.messageId,
        text: msg.text || '[media]',
        timestamp: msg.timestamp,
        sender: msg.senderId === facebookUserId ? 'user' as const : 'page' as const
      })).reverse(); // Reverse to show oldest first

      return {
        userId: supabaseUserId,
        facebookUserId,
        recentMessages,
        userProfile: {
          name: user.fullName || 'Facebook User',
          profilePicture: user.profileImage || undefined
        },
        conversationSummary: this.generateConversationSummary(recentMessages)
      };
    } catch (error) {
      console.error('[FacebookMrBlueContext] Error fetching Facebook context:', error);
      return null;
    }
  }

  /**
   * Build enhanced Mr. Blue context with Facebook data
   * @param supabaseUserId - MundoTango user ID
   * @param additionalContext - Additional context from web/API
   */
  async buildMrBlueContext(supabaseUserId: string, additionalContext?: string): Promise<MrBlueContextEnhanced> {
    const facebookContext = await this.getFacebookContext(supabaseUserId);

    let conversationHistory = '';
    let userIntent = undefined;

    if (facebookContext) {
      conversationHistory = this.formatConversationForMrBlue(facebookContext);
      userIntent = this.inferUserIntent(facebookContext.recentMessages);
    }

    if (additionalContext) {
      conversationHistory += `\n\n[Additional Context]\n${additionalContext}`;
    }

    return {
      source: facebookContext ? 'facebook' : 'web',
      facebookContext: facebookContext || undefined,
      conversationHistory,
      userIntent
    };
  }

  /**
   * Format Facebook conversation for Mr. Blue's system prompt
   */
  private formatConversationForMrBlue(context: FacebookContext): string {
    const { userProfile, recentMessages } = context;
    
    let formatted = `[Facebook Messenger Context for ${userProfile?.name || 'User'}]\n\n`;
    
    if (recentMessages.length === 0) {
      formatted += 'No recent Facebook messages.\n';
      return formatted;
    }

    formatted += 'Recent conversation:\n';
    recentMessages.forEach(msg => {
      const sender = msg.sender === 'user' ? userProfile?.name || 'User' : 'MundoTango Page';
      const time = new Date(msg.timestamp).toLocaleTimeString();
      formatted += `[${time}] ${sender}: ${msg.text}\n`;
    });

    return formatted;
  }

  /**
   * Generate a brief summary of the conversation
   */
  private generateConversationSummary(messages: FacebookContext['recentMessages']): string {
    if (messages.length === 0) return 'No conversation history';
    
    const userMessages = messages.filter(m => m.sender === 'user');
    const pageMessages = messages.filter(m => m.sender === 'page');
    
    return `${messages.length} total messages (${userMessages.length} from user, ${pageMessages.length} from page)`;
  }

  /**
   * Infer user intent from recent messages (basic keyword matching)
   */
  private inferUserIntent(messages: FacebookContext['recentMessages']): string | undefined {
    if (messages.length === 0) return undefined;

    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
    if (!lastUserMessage) return undefined;

    const text = lastUserMessage.text.toLowerCase();
    
    // Basic intent detection
    if (text.includes('event') || text.includes('class')) return 'event_inquiry';
    if (text.includes('help') || text.includes('support')) return 'support_request';
    if (text.includes('join') || text.includes('sign up')) return 'registration_interest';
    if (text.includes('when') || text.includes('time')) return 'schedule_inquiry';
    if (text.includes('where') || text.includes('location')) return 'location_inquiry';
    if (text.includes('price') || text.includes('cost')) return 'pricing_inquiry';
    
    return 'general_inquiry';
  }

  /**
   * Store Mr. Blue's response back to Facebook (for webhook integration)
   */
  async sendMrBlueResponseToFacebook(
    facebookUserId: string,
    messageText: string,
    pageAccessToken: string
  ): Promise<boolean> {
    try {
      await this.messengerService.sendMessage({
        recipientId: facebookUserId,
        recipientEmail: undefined, // Not needed for Facebook
        message: messageText,
        pageAccessToken
      });
      return true;
    } catch (error) {
      console.error('[FacebookMrBlueContext] Error sending response to Facebook:', error);
      return false;
    }
  }
}

// Singleton instance
export const facebookMrBlueContextService = new FacebookMrBlueContextService();

import { db } from '../../db';
import { socialMessages, friendCloseness } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface FacebookDYIMessage {
  sender_name: string;
  content?: string;
  timestamp_ms: number;
  reactions?: Array<{ reaction: string; actor: string }>;
  photos?: Array<{ uri: string }>;
}

export interface FacebookDYIThread {
  participants: Array<{ name: string }>;
  messages: FacebookDYIMessage[];
  title?: string;
}

export interface FacebookDYIData {
  messages?: {
    inbox?: FacebookDYIThread[];
  };
  likes_and_reactions?: {
    posts?: Array<{
      title?: string;
      timestamp?: number;
      data?: Array<{
        reaction?: { reaction: string; actor: string };
      }>;
    }>;
  };
  comments?: {
    posts?: Array<{
      timestamp?: number;
      data?: Array<{
        comment?: { comment: string; author: string; timestamp: number };
      }>;
    }>;
  };
}

export interface ImportProgress {
  totalThreads: number;
  processedThreads: number;
  totalMessages: number;
  processedMessages: number;
  friendsFound: number;
  errors: string[];
}

export class MultiPlatformScraper {
  private userId: number;
  private userName: string;
  private progress: ImportProgress;

  constructor(userId: number, userName: string) {
    this.userId = userId;
    this.userName = userName;
    this.progress = {
      totalThreads: 0,
      processedThreads: 0,
      totalMessages: 0,
      processedMessages: 0,
      friendsFound: 0,
      errors: []
    };
  }

  async importFacebookData(data: FacebookDYIData): Promise<ImportProgress> {
    console.log('[MultiPlatformScraper] Starting Facebook data import for user:', this.userId);
    
    try {
      if (data.messages?.inbox) {
        await this.processMessageThreads(data.messages.inbox);
      }

      if (data.likes_and_reactions?.posts) {
        await this.processLikes(data.likes_and_reactions.posts);
      }

      if (data.comments?.posts) {
        await this.processComments(data.comments.posts);
      }

      console.log('[MultiPlatformScraper] Import completed:', this.progress);
      return this.progress;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.progress.errors.push(`Import failed: ${errorMessage}`);
      console.error('[MultiPlatformScraper] Import error:', error);
      throw error;
    }
  }

  private async processMessageThreads(threads: FacebookDYIThread[]): Promise<void> {
    this.progress.totalThreads = threads.length;
    console.log(`[MultiPlatformScraper] Processing ${threads.length} message threads`);

    for (const thread of threads) {
      try {
        const friendName = this.extractFriendName(thread.participants);
        
        if (!friendName || friendName === this.userName) {
          this.progress.processedThreads++;
          continue;
        }

        this.progress.totalMessages += thread.messages.length;

        for (const message of thread.messages) {
          await this.importMessage(friendName, message, 'facebook');
          this.progress.processedMessages++;
        }

        this.progress.friendsFound++;
        this.progress.processedThreads++;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.progress.errors.push(`Error processing thread: ${errorMessage}`);
        console.error('[MultiPlatformScraper] Thread processing error:', error);
      }
    }
  }

  private async processLikes(posts: any[]): Promise<void> {
    console.log(`[MultiPlatformScraper] Processing ${posts.length} likes/reactions`);

    for (const post of posts) {
      if (!post.data) continue;

      for (const item of post.data) {
        const reaction = item.reaction;
        if (!reaction || !reaction.actor) continue;

        try {
          const friendName = reaction.actor;
          if (friendName === this.userName) continue;

          await this.importInteraction(
            friendName,
            'like',
            reaction.reaction || 'LIKE',
            post.timestamp || Date.now() / 1000,
            'facebook'
          );

        } catch (error) {
          console.error('[MultiPlatformScraper] Like processing error:', error);
        }
      }
    }
  }

  private async processComments(posts: any[]): Promise<void> {
    console.log(`[MultiPlatformScraper] Processing ${posts.length} comments`);

    for (const post of posts) {
      if (!post.data) continue;

      for (const item of post.data) {
        const comment = item.comment;
        if (!comment || !comment.author) continue;

        try {
          const friendName = comment.author;
          if (friendName === this.userName) continue;

          await this.importInteraction(
            friendName,
            'comment',
            comment.comment,
            comment.timestamp,
            'facebook'
          );

        } catch (error) {
          console.error('[MultiPlatformScraper] Comment processing error:', error);
        }
      }
    }
  }

  private async importMessage(
    friendName: string,
    message: FacebookDYIMessage,
    platform: string
  ): Promise<void> {
    try {
      const sentiment = this.analyzeSentiment(message.content || '');
      
      await db.insert(socialMessages).values({
        userId: this.userId,
        platform,
        friendName,
        messageText: message.content || '[Photo]',
        interactionType: 'message',
        timestamp: new Date(message.timestamp_ms),
        sentiment,
        metadata: {
          hasPhotos: message.photos && message.photos.length > 0,
          reactions: message.reactions
        }
      });

    } catch (error) {
      console.error('[MultiPlatformScraper] Message import error:', error);
      throw error;
    }
  }

  private async importInteraction(
    friendName: string,
    type: string,
    content: string,
    timestamp: number,
    platform: string
  ): Promise<void> {
    try {
      const sentiment = this.analyzeSentiment(content);
      
      await db.insert(socialMessages).values({
        userId: this.userId,
        platform,
        friendName,
        messageText: content,
        interactionType: type,
        timestamp: new Date(timestamp * 1000),
        sentiment
      });

    } catch (error) {
      console.error('[MultiPlatformScraper] Interaction import error:', error);
    }
  }

  private extractFriendName(participants: Array<{ name: string }>): string | null {
    const otherParticipants = participants.filter(p => p.name !== this.userName);
    return otherParticipants.length > 0 ? otherParticipants[0].name : null;
  }

  private analyzeSentiment(text: string): string {
    if (!text) return 'neutral';

    const positiveWords = ['love', 'great', 'awesome', 'thanks', 'happy', 'amazing', 'wonderful', 'excited', 'perfect', 'brilliant', 'excellent'];
    const negativeWords = ['hate', 'bad', 'terrible', 'awful', 'sad', 'angry', 'frustrated', 'disappointed', 'sorry', 'unfortunately'];

    const lowerText = text.toLowerCase();
    const hasPositive = positiveWords.some(word => lowerText.includes(word));
    const hasNegative = negativeWords.some(word => lowerText.includes(word));

    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative && !hasPositive) return 'negative';
    return 'neutral';
  }

  getProgress(): ImportProgress {
    return this.progress;
  }

  async clearExistingData(): Promise<void> {
    console.log('[MultiPlatformScraper] Clearing existing data for user:', this.userId);
    
    await db.delete(socialMessages).where(eq(socialMessages.userId, this.userId));
    await db.delete(friendCloseness).where(eq(friendCloseness.userId, this.userId));
    
    console.log('[MultiPlatformScraper] Existing data cleared');
  }
}

export async function validateFacebookDYIData(data: any): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format: must be an object');
    return { valid: false, errors };
  }

  if (data.messages?.inbox && !Array.isArray(data.messages.inbox)) {
    errors.push('Invalid messages.inbox: must be an array');
  }

  if (data.likes_and_reactions?.posts && !Array.isArray(data.likes_and_reactions.posts)) {
    errors.push('Invalid likes_and_reactions.posts: must be an array');
  }

  if (data.comments?.posts && !Array.isArray(data.comments.posts)) {
    errors.push('Invalid comments.posts: must be an array');
  }

  const hasMessages = data.messages?.inbox?.length > 0;
  const hasLikes = data.likes_and_reactions?.posts?.length > 0;
  const hasComments = data.comments?.posts?.length > 0;

  if (!hasMessages && !hasLikes && !hasComments) {
    errors.push('No data found: file must contain messages, likes, or comments');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

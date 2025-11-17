import { db } from '../../db';
import { socialMessages, friendCloseness } from '@shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export interface ClosenessMetrics {
  friendName: string;
  messageCount: number;
  lastInteraction: Date | null;
  recencyScore: number;
  mutualFriends: number;
  sharedEvents: number;
  sentimentScore: number;
  closenessScore: number;
  tier: number;
  platforms: string[];
}

export interface TierSummary {
  tier: number;
  tierName: string;
  count: number;
  friends: ClosenessMetrics[];
}

export class ClosenessCalculator {
  private userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  async calculateAllCloseness(): Promise<ClosenessMetrics[]> {
    console.log('[ClosenessCalculator] Calculating closeness for user:', this.userId);

    const messages = await db
      .select()
      .from(socialMessages)
      .where(eq(socialMessages.userId, this.userId));

    console.log(`[ClosenessCalculator] Found ${messages.length} social messages`);

    const friendGroups = this.groupMessagesByFriend(messages);
    const metrics: ClosenessMetrics[] = [];

    for (const [friendName, friendMessages] of Object.entries(friendGroups)) {
      const metric = this.calculateFriendCloseness(friendName, friendMessages);
      metrics.push(metric);

      await this.saveFriendCloseness(metric);
    }

    console.log(`[ClosenessCalculator] Calculated closeness for ${metrics.length} friends`);
    return metrics.sort((a, b) => b.closenessScore - a.closenessScore);
  }

  private groupMessagesByFriend(messages: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {};

    for (const message of messages) {
      if (!groups[message.friendName]) {
        groups[message.friendName] = [];
      }
      groups[message.friendName].push(message);
    }

    return groups;
  }

  private calculateFriendCloseness(
    friendName: string,
    messages: any[]
  ): ClosenessMetrics {
    const messageCount = messages.length;
    
    const sortedMessages = messages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const lastInteraction = sortedMessages.length > 0 ? new Date(sortedMessages[0].timestamp) : null;
    
    const recencyScore = this.calculateRecencyScore(lastInteraction);
    
    const sentimentScore = this.calculateSentimentScore(messages);
    
    const platforms = [...new Set(messages.map(m => m.platform))];
    
    const mutualFriends = 0;
    const sharedEvents = 0;
    
    const closenessScore = this.calculateTotalScore(
      messageCount,
      recencyScore,
      mutualFriends,
      sharedEvents,
      sentimentScore
    );
    
    const tier = this.determineTier(closenessScore);

    return {
      friendName,
      messageCount,
      lastInteraction,
      recencyScore,
      mutualFriends,
      sharedEvents,
      sentimentScore,
      closenessScore,
      tier,
      platforms
    };
  }

  private calculateRecencyScore(lastInteraction: Date | null): number {
    if (!lastInteraction) return 0;

    const now = new Date();
    const daysSince = Math.floor(
      (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince <= 7) return 100;
    if (daysSince <= 30) return 80;
    if (daysSince <= 90) return 60;
    if (daysSince <= 180) return 40;
    if (daysSince <= 365) return 20;
    return 5;
  }

  private calculateSentimentScore(messages: any[]): number {
    if (messages.length === 0) return 50;

    let totalScore = 0;
    let scoredMessages = 0;

    for (const message of messages) {
      if (message.sentiment === 'positive') {
        totalScore += 100;
        scoredMessages++;
      } else if (message.sentiment === 'negative') {
        totalScore += 0;
        scoredMessages++;
      } else if (message.sentiment === 'neutral') {
        totalScore += 50;
        scoredMessages++;
      }
    }

    return scoredMessages > 0 ? totalScore / scoredMessages : 50;
  }

  private calculateTotalScore(
    messageCount: number,
    recencyScore: number,
    mutualFriends: number,
    sharedEvents: number,
    sentimentScore: number
  ): number {
    const messageScore = Math.min(messageCount * 2, 400);
    const recencyPortion = recencyScore;
    const mutualScore = Math.min(mutualFriends * 10, 200);
    const eventsScore = Math.min(sharedEvents * 20, 200);
    const sentimentPortion = sentimentScore;

    const total = messageScore + recencyPortion + mutualScore + eventsScore + sentimentPortion;

    return Math.min(Math.round(total), 1000);
  }

  private determineTier(closenessScore: number): number {
    if (closenessScore >= 800) return 1;
    if (closenessScore >= 500) return 2;
    return 3;
  }

  private async saveFriendCloseness(metric: ClosenessMetrics): Promise<void> {
    try {
      const existing = await db
        .select()
        .from(friendCloseness)
        .where(
          and(
            eq(friendCloseness.userId, this.userId),
            eq(friendCloseness.friendName, metric.friendName)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(friendCloseness)
          .set({
            closenessScore: metric.closenessScore,
            messageCount: metric.messageCount,
            lastInteraction: metric.lastInteraction,
            mutualFriends: metric.mutualFriends,
            sharedEvents: metric.sharedEvents,
            tier: metric.tier,
            updatedAt: new Date()
          })
          .where(eq(friendCloseness.id, existing[0].id));
      } else {
        await db.insert(friendCloseness).values({
          userId: this.userId,
          friendName: metric.friendName,
          closenessScore: metric.closenessScore,
          messageCount: metric.messageCount,
          lastInteraction: metric.lastInteraction,
          mutualFriends: metric.mutualFriends,
          sharedEvents: metric.sharedEvents,
          tier: metric.tier
        });
      }
    } catch (error) {
      console.error('[ClosenessCalculator] Error saving friend closeness:', error);
      throw error;
    }
  }

  async getFriendCloseness(friendName: string): Promise<ClosenessMetrics | null> {
    const result = await db
      .select()
      .from(friendCloseness)
      .where(
        and(
          eq(friendCloseness.userId, this.userId),
          eq(friendCloseness.friendName, friendName)
        )
      )
      .limit(1);

    if (result.length === 0) return null;

    const friend = result[0];
    
    const messages = await db
      .select()
      .from(socialMessages)
      .where(
        and(
          eq(socialMessages.userId, this.userId),
          eq(socialMessages.friendName, friendName)
        )
      );

    const platforms = [...new Set(messages.map(m => m.platform))];
    const sentimentScore = this.calculateSentimentScore(messages);
    const recencyScore = this.calculateRecencyScore(friend.lastInteraction);

    return {
      friendName: friend.friendName,
      messageCount: friend.messageCount,
      lastInteraction: friend.lastInteraction,
      recencyScore,
      mutualFriends: friend.mutualFriends,
      sharedEvents: friend.sharedEvents,
      sentimentScore,
      closenessScore: friend.closenessScore,
      tier: friend.tier,
      platforms
    };
  }

  async getAllFriends(limit?: number): Promise<ClosenessMetrics[]> {
    const query = db
      .select()
      .from(friendCloseness)
      .where(eq(friendCloseness.userId, this.userId))
      .orderBy(desc(friendCloseness.closenessScore));

    const results = limit ? await query.limit(limit) : await query;

    const metrics: ClosenessMetrics[] = [];

    for (const friend of results) {
      const messages = await db
        .select()
        .from(socialMessages)
        .where(
          and(
            eq(socialMessages.userId, this.userId),
            eq(socialMessages.friendName, friend.friendName)
          )
        );

      const platforms = [...new Set(messages.map(m => m.platform))];
      const sentimentScore = this.calculateSentimentScore(messages);
      const recencyScore = this.calculateRecencyScore(friend.lastInteraction);

      metrics.push({
        friendName: friend.friendName,
        messageCount: friend.messageCount,
        lastInteraction: friend.lastInteraction,
        recencyScore,
        mutualFriends: friend.mutualFriends,
        sharedEvents: friend.sharedEvents,
        sentimentScore,
        closenessScore: friend.closenessScore,
        tier: friend.tier,
        platforms
      });
    }

    return metrics;
  }

  async getFriendsByTier(): Promise<TierSummary[]> {
    const allFriends = await this.getAllFriends();

    const tiers: TierSummary[] = [
      {
        tier: 1,
        tierName: 'Closest Friends',
        count: 0,
        friends: []
      },
      {
        tier: 2,
        tierName: 'Close Friends',
        count: 0,
        friends: []
      },
      {
        tier: 3,
        tierName: 'Acquaintances',
        count: 0,
        friends: []
      }
    ];

    for (const friend of allFriends) {
      const tierIndex = friend.tier - 1;
      if (tierIndex >= 0 && tierIndex < 3) {
        tiers[tierIndex].friends.push(friend);
        tiers[tierIndex].count++;
      }
    }

    return tiers;
  }

  async getStats(): Promise<{
    totalFriends: number;
    tier1Count: number;
    tier2Count: number;
    tier3Count: number;
    averageScore: number;
    totalMessages: number;
  }> {
    const allFriends = await this.getAllFriends();
    
    const tier1Count = allFriends.filter(f => f.tier === 1).length;
    const tier2Count = allFriends.filter(f => f.tier === 2).length;
    const tier3Count = allFriends.filter(f => f.tier === 3).length;
    
    const averageScore = allFriends.length > 0
      ? Math.round(allFriends.reduce((sum, f) => sum + f.closenessScore, 0) / allFriends.length)
      : 0;
    
    const totalMessages = allFriends.reduce((sum, f) => sum + f.messageCount, 0);

    return {
      totalFriends: allFriends.length,
      tier1Count,
      tier2Count,
      tier3Count,
      averageScore,
      totalMessages
    };
  }
}

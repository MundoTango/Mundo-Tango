/**
 * MB.MD v9.9.4 - Gamification Rewards Service
 * Integrates volunteer testing with the gamification system for XP and badges
 */

import { db } from "../../db";
import { userPoints, userBadges, badges, users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface RewardResult {
  xpAwarded: number;
  badgeAwarded?: string;
  newLevel?: string;
  totalXP: number;
}

export interface TestCompletionData {
  userId: number;
  scenarioId: number;
  completed: boolean;
  difficulty: string;
  timeSpentSeconds: number;
  stuckPointsCount: number;
  difficultyRating?: number;
  clarityRating?: number;
  feedbackProvided: boolean;
}

export class GamificationRewardsService {
  private readonly XP_VALUES = {
    base: {
      easy: 10,
      medium: 25,
      hard: 50,
    },
    bonuses: {
      completed: 15,
      noStuckPoints: 10,
      feedback: 5,
      ratings: 5,
      speedBonus: 10,
    },
    streaks: {
      3: 20,
      5: 50,
      10: 100,
    },
  };

  private readonly BADGE_THRESHOLDS = {
    firstTest: 1,
    regularTester: 5,
    dedicatedTester: 10,
    expertTester: 25,
    eliteTester: 50,
    masterTester: 100,
    bugHunter: 10,
    speedRunner: 10,
    feedbackChampion: 20,
  };

  /**
   * Award rewards for completing a test scenario
   */
  async awardTestCompletion(data: TestCompletionData): Promise<RewardResult> {
    let xpAwarded = 0;

    const baseXP = this.XP_VALUES.base[data.difficulty as keyof typeof this.XP_VALUES.base] || 10;
    xpAwarded += baseXP;

    if (data.completed) {
      xpAwarded += this.XP_VALUES.bonuses.completed;
    }

    if (data.stuckPointsCount === 0) {
      xpAwarded += this.XP_VALUES.bonuses.noStuckPoints;
    }

    if (data.feedbackProvided) {
      xpAwarded += this.XP_VALUES.bonuses.feedback;
    }

    if (data.difficultyRating || data.clarityRating) {
      xpAwarded += this.XP_VALUES.bonuses.ratings;
    }

    const newTotalXP = await this.addUserXP(data.userId, xpAwarded, "volunteer_testing");

    const badgeAwarded = await this.checkAndAwardBadges(data.userId);

    const newLevel = this.calculateLevel(newTotalXP);

    return {
      xpAwarded,
      badgeAwarded,
      newLevel,
      totalXP: newTotalXP,
    };
  }

  /**
   * Add XP to user's account
   */
  private async addUserXP(userId: number, xp: number, source: string): Promise<number> {
    try {
      const existingPoints = await db
        .select()
        .from(userPoints)
        .where(eq(userPoints.userId, userId))
        .limit(1);

      if (existingPoints.length > 0) {
        const newTotal = (existingPoints[0].totalPoints || 0) + xp;
        await db
          .update(userPoints)
          .set({ 
            totalPoints: newTotal,
            lastActivityAt: new Date(),
          })
          .where(eq(userPoints.userId, userId));
        return newTotal;
      } else {
        await db.insert(userPoints).values({
          userId,
          totalPoints: xp,
          currentLevel: 1,
          lastActivityAt: new Date(),
        });
        return xp;
      }
    } catch (error) {
      console.error("[GamificationRewards] Failed to add XP:", error);
      return 0;
    }
  }

  /**
   * Check and award badges based on volunteer testing activity
   */
  private async checkAndAwardBadges(userId: number): Promise<string | undefined> {
    try {
      const existingBadges = await db
        .select()
        .from(userBadges)
        .where(eq(userBadges.userId, userId));

      const existingBadgeIds = new Set(existingBadges.map(b => b.badgeId));

      const volunteerBadges = [
        { id: 100, name: "First Test", threshold: this.BADGE_THRESHOLDS.firstTest },
        { id: 101, name: "Regular Tester", threshold: this.BADGE_THRESHOLDS.regularTester },
        { id: 102, name: "Dedicated Tester", threshold: this.BADGE_THRESHOLDS.dedicatedTester },
        { id: 103, name: "Expert Tester", threshold: this.BADGE_THRESHOLDS.expertTester },
        { id: 104, name: "Elite Tester", threshold: this.BADGE_THRESHOLDS.eliteTester },
        { id: 105, name: "Master Tester", threshold: this.BADGE_THRESHOLDS.masterTester },
      ];

      for (const badge of volunteerBadges) {
        if (!existingBadgeIds.has(badge.id)) {
          return badge.name;
        }
      }

      return undefined;
    } catch (error) {
      console.error("[GamificationRewards] Failed to check badges:", error);
      return undefined;
    }
  }

  /**
   * Calculate user level based on XP
   */
  private calculateLevel(totalXP: number): string {
    if (totalXP >= 10000) return "Legendary";
    if (totalXP >= 5000) return "Master";
    if (totalXP >= 2500) return "Expert";
    if (totalXP >= 1000) return "Advanced";
    if (totalXP >= 500) return "Intermediate";
    if (totalXP >= 100) return "Beginner";
    return "Novice";
  }

  /**
   * Get leaderboard for volunteer testers
   */
  async getVolunteerLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const leaderboard = await db
        .select({
          userId: userPoints.userId,
          totalPoints: userPoints.totalPoints,
          currentLevel: userPoints.currentLevel,
          username: users.username,
          name: users.name,
        })
        .from(userPoints)
        .leftJoin(users, eq(userPoints.userId, users.id))
        .orderBy(sql`${userPoints.totalPoints} DESC`)
        .limit(limit);

      return leaderboard;
    } catch (error) {
      console.error("[GamificationRewards] Failed to get leaderboard:", error);
      return [];
    }
  }

  /**
   * Get user's volunteer testing stats with rewards
   */
  async getUserVolunteerStats(userId: number): Promise<{
    totalXP: number;
    level: string;
    badges: any[];
    rank: number;
  }> {
    try {
      const [pointsData] = await db
        .select()
        .from(userPoints)
        .where(eq(userPoints.userId, userId))
        .limit(1);

      const badges = await db
        .select()
        .from(userBadges)
        .where(eq(userBadges.userId, userId));

      const rank = 0;

      return {
        totalXP: pointsData?.totalPoints || 0,
        level: this.calculateLevel(pointsData?.totalPoints || 0),
        badges,
        rank,
      };
    } catch (error) {
      console.error("[GamificationRewards] Failed to get user stats:", error);
      return { totalXP: 0, level: "Novice", badges: [], rank: 0 };
    }
  }
}

export const gamificationRewardsService = new GamificationRewardsService();

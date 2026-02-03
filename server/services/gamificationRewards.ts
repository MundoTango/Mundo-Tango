/**
 * MB.MD v9.9.4 - Gamification Rewards Service
 * Integrates volunteer testing with the gamification system for XP and badges
 */

import { db } from "../db";
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
   * Add XP to user's account and update level
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
        const newLevel = this.calculateLevelNumber(newTotal);
        await db
          .update(userPoints)
          .set({ 
            totalPoints: newTotal,
            currentLevel: newLevel,
            lastActivityAt: new Date(),
          })
          .where(eq(userPoints.userId, userId));
        console.log(`[GamificationRewards] User ${userId} gained ${xp} XP, new total: ${newTotal}, level: ${newLevel}`);
        return newTotal;
      } else {
        const newLevel = this.calculateLevelNumber(xp);
        await db.insert(userPoints).values({
          userId,
          totalPoints: xp,
          currentLevel: newLevel,
          lastActivityAt: new Date(),
        });
        console.log(`[GamificationRewards] User ${userId} started with ${xp} XP, level: ${newLevel}`);
        return xp;
      }
    } catch (error) {
      console.error("[GamificationRewards] Failed to add XP:", error);
      return 0;
    }
  }

  /**
   * Calculate numeric level based on XP for database storage
   */
  private calculateLevelNumber(totalXP: number): number {
    if (totalXP >= 10000) return 7; // Legendary
    if (totalXP >= 5000) return 6;  // Master
    if (totalXP >= 2500) return 5;  // Expert
    if (totalXP >= 1000) return 4;  // Advanced
    if (totalXP >= 500) return 3;   // Intermediate
    if (totalXP >= 100) return 2;   // Beginner
    return 1; // Novice
  }

  /**
   * Check and award badges based on volunteer testing activity
   * Now actually inserts earned badges into userBadges table
   */
  private async checkAndAwardBadges(userId: number, completedTestCount?: number): Promise<string | undefined> {
    try {
      const existingBadges = await db
        .select()
        .from(userBadges)
        .where(eq(userBadges.userId, userId));

      const existingBadgeIds = new Set(existingBadges.map(b => b.badgeId));

      // Get actual completed test count if not provided
      let testCount = completedTestCount;
      if (testCount === undefined) {
        const userPointsData = await db
          .select()
          .from(userPoints)
          .where(eq(userPoints.userId, userId))
          .limit(1);
        // Estimate test count from XP (roughly 25 XP per test on average)
        testCount = Math.floor((userPointsData[0]?.totalPoints || 0) / 25) + 1;
      }

      const volunteerBadges = [
        { id: 100, name: "First Test", threshold: this.BADGE_THRESHOLDS.firstTest },
        { id: 101, name: "Regular Tester", threshold: this.BADGE_THRESHOLDS.regularTester },
        { id: 102, name: "Dedicated Tester", threshold: this.BADGE_THRESHOLDS.dedicatedTester },
        { id: 103, name: "Expert Tester", threshold: this.BADGE_THRESHOLDS.expertTester },
        { id: 104, name: "Elite Tester", threshold: this.BADGE_THRESHOLDS.eliteTester },
        { id: 105, name: "Master Tester", threshold: this.BADGE_THRESHOLDS.masterTester },
      ];

      // Find first badge user qualifies for but doesn't have yet
      for (const badge of volunteerBadges) {
        if (!existingBadgeIds.has(badge.id) && testCount >= badge.threshold) {
          // Actually insert the badge into userBadges
          await db.insert(userBadges).values({
            userId,
            badgeId: badge.id,
            earnedAt: new Date(),
          });
          console.log(`[GamificationRewards] Awarded badge "${badge.name}" to user ${userId}`);
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

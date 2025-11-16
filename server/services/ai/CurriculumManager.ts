/**
 * CurriculumManager - Progressive Difficulty Scaling System
 * 
 * Implements curriculum learning for Mr Blue users.
 * Adapts AI difficulty based on user performance: basic → intermediate → advanced → expert
 * 
 * Key Features:
 * - Track user progression across 4 levels
 * - Auto-promote users based on success rate
 * - Auto-demote users who struggle
 * - Level-specific constraints (maxComplexity, allowedModels)
 * - Target: 90%+ user retention via engaging difficulty curve
 * 
 * Progression Rules:
 * - Promote: 3 consecutive successes + 80%+ success rate
 * - Demote: 3 consecutive failures + <50% success rate
 */

import { db } from '../../db';
import { curriculumLevels, routingDecisions, users } from '@shared/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import type { SelectCurriculumLevel } from '@shared/schema';

// ============================================================================
// TYPES
// ============================================================================

export type CurriculumLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';

export interface LevelConfig {
  level: CurriculumLevel;
  maxComplexity: number; // 0.0-1.0
  allowedTiers: number[]; // [1, 2] or [1, 2, 3]
  maxCostPerRequest: number; // USD
  description: string;
  requirements: {
    minSuccessRate: number;
    minTaskCount: number;
    consecutiveSuccessesForPromotion: number;
  };
}

export interface CurriculumStats {
  userId: number;
  currentLevel: CurriculumLevel;
  successRate: number;
  taskCount: number;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  daysAtLevel: number;
  readyForPromotion: boolean;
  riskOfDemotion: boolean;
}

// ============================================================================
// LEVEL CONFIGURATIONS
// ============================================================================

const LEVEL_CONFIGS: Record<CurriculumLevel, LevelConfig> = {
  basic: {
    level: 'basic',
    maxComplexity: 0.3,
    allowedTiers: [1], // Only cheapest models
    maxCostPerRequest: 0.01,
    description: 'Simple tasks: greetings, basic facts, short summaries',
    requirements: {
      minSuccessRate: 0.8,
      minTaskCount: 10,
      consecutiveSuccessesForPromotion: 3,
    },
  },
  intermediate: {
    level: 'intermediate',
    maxComplexity: 0.6,
    allowedTiers: [1, 2], // Cheap + mid-tier
    maxCostPerRequest: 0.05,
    description: 'Moderate tasks: code fixes, analysis, multi-step reasoning',
    requirements: {
      minSuccessRate: 0.75,
      minTaskCount: 20,
      consecutiveSuccessesForPromotion: 3,
    },
  },
  advanced: {
    level: 'advanced',
    maxComplexity: 0.85,
    allowedTiers: [1, 2, 3], // All tiers
    maxCostPerRequest: 0.15,
    description: 'Complex tasks: architecture, research, expert advice',
    requirements: {
      minSuccessRate: 0.7,
      minTaskCount: 30,
      consecutiveSuccessesForPromotion: 3,
    },
  },
  expert: {
    level: 'expert',
    maxComplexity: 1.0,
    allowedTiers: [1, 2, 3], // All tiers
    maxCostPerRequest: 1.0,
    description: 'Expert tasks: full access to all AI capabilities',
    requirements: {
      minSuccessRate: 0.65,
      minTaskCount: 50,
      consecutiveSuccessesForPromotion: 0, // Can't promote beyond expert
    },
  },
};

// ============================================================================
// CURRICULUM MANAGER SERVICE
// ============================================================================

export class CurriculumManager {
  /**
   * Get current curriculum level for a user
   * Creates entry if user is new (default: basic)
   */
  static async getCurrentLevel(userId: number): Promise<SelectCurriculumLevel> {
    try {
      // Try to fetch existing level
      const [existingLevel] = await db
        .select()
        .from(curriculumLevels)
        .where(eq(curriculumLevels.userId, userId))
        .limit(1);

      if (existingLevel) {
        return existingLevel;
      }

      // Create new level entry (default: basic)
      const [newLevel] = await db
        .insert(curriculumLevels)
        .values({
          userId,
          level: 'basic',
          successRate: '0',
          taskCount: 0,
          consecutiveSuccesses: 0,
          consecutiveFailures: 0,
        })
        .returning();

      console.log(`[CurriculumManager] ✅ Created new level for user ${userId}: basic`);
      return newLevel;
    } catch (error: any) {
      console.error('[CurriculumManager] ❌ Failed to get current level:', error);
      throw error;
    }
  }

  /**
   * Adjust difficulty based on task result
   * Auto-promotes/demotes user based on performance
   */
  static async adjustDifficulty(
    userId: number,
    result: 'success' | 'failure'
  ): Promise<{ level: CurriculumLevel; changed: boolean; reason?: string }> {
    try {
      const currentLevel = await this.getCurrentLevel(userId);

      // Update stats
      const newTaskCount = currentLevel.taskCount + 1;
      const oldSuccessRate = parseFloat(currentLevel.successRate);
      const newSuccessCount = result === 'success' ? oldSuccessRate * currentLevel.taskCount + 1 : oldSuccessRate * currentLevel.taskCount;
      const newSuccessRate = newSuccessCount / newTaskCount;

      const newConsecutiveSuccesses = result === 'success' ? currentLevel.consecutiveSuccesses + 1 : 0;
      const newConsecutiveFailures = result === 'failure' ? currentLevel.consecutiveFailures + 1 : 0;

      console.log(
        `[CurriculumManager] User ${userId} | ${result.toUpperCase()} | ` +
        `Level: ${currentLevel.level} | Success Rate: ${(newSuccessRate * 100).toFixed(1)}% | ` +
        `Streak: ${newConsecutiveSuccesses} successes, ${newConsecutiveFailures} failures`
      );

      // Check for promotion
      const config = LEVEL_CONFIGS[currentLevel.level as CurriculumLevel];
      if (
        currentLevel.level !== 'expert' &&
        newConsecutiveSuccesses >= config.requirements.consecutiveSuccessesForPromotion &&
        newSuccessRate >= config.requirements.minSuccessRate &&
        newTaskCount >= config.requirements.minTaskCount
      ) {
        const newLevel = this.getNextLevel(currentLevel.level as CurriculumLevel);
        await db
          .update(curriculumLevels)
          .set({
            level: newLevel,
            successRate: newSuccessRate.toString(),
            taskCount: newTaskCount,
            consecutiveSuccesses: newConsecutiveSuccesses,
            consecutiveFailures: newConsecutiveFailures,
            lastPromotionAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(curriculumLevels.userId, userId));

        console.log(`[CurriculumManager] 🎓 PROMOTED: User ${userId} | ${currentLevel.level} → ${newLevel}`);
        return {
          level: newLevel,
          changed: true,
          reason: `Promoted to ${newLevel} (${newConsecutiveSuccesses} consecutive successes, ${(newSuccessRate * 100).toFixed(1)}% success rate)`,
        };
      }

      // Check for demotion
      if (
        currentLevel.level !== 'basic' &&
        newConsecutiveFailures >= 3 &&
        newSuccessRate < 0.5
      ) {
        const newLevel = this.getPreviousLevel(currentLevel.level as CurriculumLevel);
        await db
          .update(curriculumLevels)
          .set({
            level: newLevel,
            successRate: newSuccessRate.toString(),
            taskCount: newTaskCount,
            consecutiveSuccesses: newConsecutiveSuccesses,
            consecutiveFailures: newConsecutiveFailures,
            lastDemotionAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(curriculumLevels.userId, userId));

        console.log(`[CurriculumManager] ⚠️ DEMOTED: User ${userId} | ${currentLevel.level} → ${newLevel}`);
        return {
          level: newLevel,
          changed: true,
          reason: `Demoted to ${newLevel} (${newConsecutiveFailures} consecutive failures, ${(newSuccessRate * 100).toFixed(1)}% success rate)`,
        };
      }

      // No level change - just update stats
      await db
        .update(curriculumLevels)
        .set({
          successRate: newSuccessRate.toString(),
          taskCount: newTaskCount,
          consecutiveSuccesses: newConsecutiveSuccesses,
          consecutiveFailures: newConsecutiveFailures,
          updatedAt: new Date(),
        })
        .where(eq(curriculumLevels.userId, userId));

      return {
        level: currentLevel.level as CurriculumLevel,
        changed: false,
      };
    } catch (error: any) {
      console.error('[CurriculumManager] ❌ Failed to adjust difficulty:', error);
      throw error;
    }
  }

  /**
   * Get level-specific configuration
   * Returns constraints and requirements for a given level
   */
  static getLevelConfig(level: CurriculumLevel): LevelConfig {
    return LEVEL_CONFIGS[level];
  }

  /**
   * Get curriculum statistics for a user
   */
  static async getStats(userId: number): Promise<CurriculumStats> {
    try {
      const currentLevel = await this.getCurrentLevel(userId);
      const config = this.getLevelConfig(currentLevel.level as CurriculumLevel);

      // Calculate days at current level
      const levelStartDate = currentLevel.lastPromotionAt || currentLevel.updatedAt;
      const daysAtLevel = Math.floor((Date.now() - new Date(levelStartDate).getTime()) / (1000 * 60 * 60 * 24));

      // Check if ready for promotion
      const successRate = parseFloat(currentLevel.successRate);
      const readyForPromotion =
        currentLevel.level !== 'expert' &&
        currentLevel.consecutiveSuccesses >= config.requirements.consecutiveSuccessesForPromotion &&
        successRate >= config.requirements.minSuccessRate &&
        currentLevel.taskCount >= config.requirements.minTaskCount;

      // Check if at risk of demotion
      const riskOfDemotion =
        currentLevel.level !== 'basic' &&
        currentLevel.consecutiveFailures >= 2 &&
        successRate < 0.6;

      return {
        userId,
        currentLevel: currentLevel.level as CurriculumLevel,
        successRate,
        taskCount: currentLevel.taskCount,
        consecutiveSuccesses: currentLevel.consecutiveSuccesses,
        consecutiveFailures: currentLevel.consecutiveFailures,
        daysAtLevel,
        readyForPromotion,
        riskOfDemotion,
      };
    } catch (error: any) {
      console.error('[CurriculumManager] ❌ Failed to get stats:', error);
      throw error;
    }
  }

  /**
   * Helper: Get next level
   */
  private static getNextLevel(current: CurriculumLevel): CurriculumLevel {
    const levels: CurriculumLevel[] = ['basic', 'intermediate', 'advanced', 'expert'];
    const currentIndex = levels.indexOf(current);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }

  /**
   * Helper: Get previous level
   */
  private static getPreviousLevel(current: CurriculumLevel): CurriculumLevel {
    const levels: CurriculumLevel[] = ['basic', 'intermediate', 'advanced', 'expert'];
    const currentIndex = levels.indexOf(current);
    return levels[Math.max(currentIndex - 1, 0)];
  }
}

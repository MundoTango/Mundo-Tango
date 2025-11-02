/**
 * BLOCKER 9: Predictive Context System
 * Markov chain prediction and cache warming for faster navigation
 */

import { executeRawQuery } from "../../shared/db";

interface UserPattern {
  userId: number;
  fromPage: string;
  toPage: string;
  transitionCount: number;
  avgTimeOnPage: number;
}

interface PredictionResult {
  currentPage: string;
  predictedPages: string[];
  confidence: number;
}

interface CacheWarmingResult {
  userId: number;
  currentPage: string;
  warmedPages: string[];
  cacheWarmed: boolean;
}

export class PredictiveContextService {
  /**
   * Track user navigation pattern (Markov chain state transition)
   */
  static async trackNavigation(
    userId: number,
    fromPage: string,
    toPage: string,
    timeOnPage: number
  ): Promise<void> {
    try {
      // Check if pattern exists
      const [existing] = await executeRawQuery<any>(
        `SELECT id, transition_count, avg_time_on_page FROM user_patterns
         WHERE user_id = $1 AND from_page = $2 AND to_page = $3`,
        [userId, fromPage, toPage]
      );

      if (existing) {
        // Update existing pattern
        const newCount = existing.transition_count + 1;
        const newAvgTime = Math.round(
          (existing.avg_time_on_page * existing.transition_count + timeOnPage) / newCount
        );

        await executeRawQuery(
          `UPDATE user_patterns SET
            transition_count = $1,
            avg_time_on_page = $2,
            last_transition_at = NOW(),
            updated_at = NOW()
          WHERE id = $3`,
          [newCount, newAvgTime, existing.id]
        );
      } else {
        // Create new pattern
        await executeRawQuery(
          `INSERT INTO user_patterns (
            user_id, from_page, to_page, transition_count, avg_time_on_page,
            last_transition_at, created_at, updated_at
          ) VALUES ($1, $2, $3, 1, $4, NOW(), NOW(), NOW())`,
          [userId, fromPage, toPage, timeOnPage]
        );
      }
    } catch (error: any) {
      console.error('Error tracking navigation:', error.message);
    }
  }

  /**
   * Predict next pages using Markov chain
   */
  static async predictNextPages(userId: number, currentPage: string): Promise<PredictionResult> {
    try {
      // Get all transitions from current page for this user
      const patterns = await executeRawQuery<any>(
        `SELECT to_page, transition_count, avg_time_on_page
         FROM user_patterns
         WHERE user_id = $1 AND from_page = $2
         ORDER BY transition_count DESC
         LIMIT 5`,
        [userId, currentPage]
      );

      if (patterns.length === 0) {
        // No user-specific patterns, use global patterns
        const globalPatterns = await executeRawQuery<any>(
          `SELECT to_page, SUM(transition_count) as total_count
           FROM user_patterns
           WHERE from_page = $1
           GROUP BY to_page
           ORDER BY total_count DESC
           LIMIT 5`,
          [currentPage]
        );

        if (globalPatterns.length === 0) {
          return {
            currentPage,
            predictedPages: [],
            confidence: 0,
          };
        }

        const totalTransitions = globalPatterns.reduce(
          (sum: number, p: any) => sum + p.total_count,
          0
        );
        const topPage = globalPatterns[0];
        const confidence = Math.round((topPage.total_count / totalTransitions) * 100);

        return {
          currentPage,
          predictedPages: globalPatterns.map((p: any) => p.to_page),
          confidence,
        };
      }

      // Calculate confidence based on transition counts
      const totalTransitions = patterns.reduce((sum: number, p: any) => sum + p.transition_count, 0);
      const topPage = patterns[0];
      const confidence = Math.round((topPage.transition_count / totalTransitions) * 100);

      return {
        currentPage,
        predictedPages: patterns.map((p: any) => p.to_page),
        confidence,
      };
    } catch (error: any) {
      console.error('Error predicting pages:', error.message);
      return {
        currentPage,
        predictedPages: [],
        confidence: 0,
      };
    }
  }

  /**
   * Warm cache for predicted pages
   */
  static async warmCache(userId: number, currentPage: string): Promise<CacheWarmingResult> {
    try {
      // Get predictions
      const prediction = await this.predictNextPages(userId, currentPage);

      if (prediction.predictedPages.length === 0) {
        return {
          userId,
          currentPage,
          warmedPages: [],
          cacheWarmed: false,
        };
      }

      // Check if cache entry exists
      const [existing] = await executeRawQuery<any>(
        `SELECT id FROM prediction_cache WHERE user_id = $1 AND current_page = $2`,
        [userId, currentPage]
      );

      if (existing) {
        // Update existing cache
        await executeRawQuery(
          `UPDATE prediction_cache SET
            predicted_pages = $1,
            confidence = $2,
            cache_warmed = true,
            warmed_at = NOW(),
            updated_at = NOW(),
            expires_at = NOW() + INTERVAL '24 hours'
          WHERE id = $3`,
          [prediction.predictedPages, prediction.confidence, existing.id]
        );
      } else {
        // Create new cache entry
        await executeRawQuery(
          `INSERT INTO prediction_cache (
            user_id, current_page, predicted_pages, confidence,
            cache_warmed, warmed_at, hit_count, miss_count,
            created_at, updated_at, expires_at
          ) VALUES ($1, $2, $3, $4, true, NOW(), 0, 0, NOW(), NOW(), NOW() + INTERVAL '24 hours')`,
          [userId, currentPage, prediction.predictedPages, prediction.confidence]
        );
      }

      return {
        userId,
        currentPage,
        warmedPages: prediction.predictedPages,
        cacheWarmed: true,
      };
    } catch (error: any) {
      console.error('Error warming cache:', error.message);
      return {
        userId,
        currentPage,
        warmedPages: [],
        cacheWarmed: false,
      };
    }
  }

  /**
   * Get cached prediction
   */
  static async getCachedPrediction(
    userId: number,
    currentPage: string
  ): Promise<PredictionResult | null> {
    try {
      const [cache] = await executeRawQuery<any>(
        `SELECT predicted_pages, confidence FROM prediction_cache
         WHERE user_id = $1 AND current_page = $2
         AND expires_at > NOW()
         AND cache_warmed = true`,
        [userId, currentPage]
      );

      if (!cache) {
        return null;
      }

      return {
        currentPage,
        predictedPages: cache.predicted_pages || [],
        confidence: cache.confidence || 0,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Record cache hit/miss
   */
  static async recordCacheHit(
    userId: number,
    currentPage: string,
    actualNextPage: string
  ): Promise<void> {
    try {
      const cache = await this.getCachedPrediction(userId, currentPage);

      if (!cache) {
        return;
      }

      const isHit = cache.predictedPages.includes(actualNextPage);

      await executeRawQuery(
        `UPDATE prediction_cache SET
          ${isHit ? 'hit_count = hit_count + 1' : 'miss_count = miss_count + 1'},
          updated_at = NOW()
        WHERE user_id = $1 AND current_page = $2`,
        [userId, currentPage]
      );
    } catch (error: any) {
      console.error('Error recording cache hit:', error.message);
    }
  }

  /**
   * Get prediction accuracy stats
   */
  static async getAccuracyStats(userId: number): Promise<{
    totalPredictions: number;
    hits: number;
    misses: number;
    accuracy: number;
  }> {
    try {
      const [stats] = await executeRawQuery<any>(
        `SELECT
          COUNT(*) as total_predictions,
          SUM(hit_count) as total_hits,
          SUM(miss_count) as total_misses
        FROM prediction_cache
        WHERE user_id = $1`,
        [userId]
      );

      const totalHits = stats.total_hits || 0;
      const totalMisses = stats.total_misses || 0;
      const total = totalHits + totalMisses;
      const accuracy = total > 0 ? Math.round((totalHits / total) * 100) : 0;

      return {
        totalPredictions: stats.total_predictions || 0,
        hits: totalHits,
        misses: totalMisses,
        accuracy,
      };
    } catch (error) {
      return {
        totalPredictions: 0,
        hits: 0,
        misses: 0,
        accuracy: 0,
      };
    }
  }

  /**
   * Clean expired cache entries
   */
  static async cleanExpiredCache(): Promise<number> {
    try {
      const result = await executeRawQuery<any>(
        `DELETE FROM prediction_cache WHERE expires_at < NOW() RETURNING id`
      );

      return result.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get user navigation patterns summary
   */
  static async getUserPatternsSummary(userId: number): Promise<UserPattern[]> {
    try {
      const results = await executeRawQuery<any>(
        `SELECT user_id, from_page, to_page, transition_count, avg_time_on_page
         FROM user_patterns
         WHERE user_id = $1
         ORDER BY transition_count DESC
         LIMIT 20`,
        [userId]
      );

      return results.map((r) => ({
        userId: r.user_id,
        fromPage: r.from_page,
        toPage: r.to_page,
        transitionCount: r.transition_count,
        avgTimeOnPage: r.avg_time_on_page,
      }));
    } catch (error) {
      return [];
    }
  }
}

import { db } from "@db";
import { mrBlueKnowledgeBase, userTelemetry } from "@shared/schema";
import { eq, and, gte, desc } from "drizzle-orm";

export interface ErrorData {
  errorMessage: string;
  stackTrace: string;
  timestamp: Date;
  userId: number;
  pagePath: string;
}

export interface ErrorCategory {
  category: string;
  count: number;
  severity: string;
}

export interface PrioritizedError {
  error: string;
  impact: number;
  affectedUsers: number;
  frequency: number;
  firstSeen: Date;
  lastSeen: Date;
}

export class ErrorPatternPathway {
  /**
   * Collect errors within a time range
   */
  async collectErrors(timeRange: { start: Date; end: Date }): Promise<ErrorData[]> {
    try {
      // Collect from browser errors in knowledge base
      const knowledgeBaseErrors = await db
        .select()
        .from(mrBlueKnowledgeBase)
        .where(
          and(
            eq(mrBlueKnowledgeBase.category, 'browser_error'),
            gte(mrBlueKnowledgeBase.createdAt, timeRange.start)
          )
        );

      // Collect from telemetry errors
      const telemetryErrors = await db
        .select()
        .from(userTelemetry)
        .where(
          and(
            eq(userTelemetry.eventType, 'error'),
            gte(userTelemetry.timestamp, timeRange.start)
          )
        );

      const errors: ErrorData[] = [];

      // Parse knowledge base errors
      knowledgeBaseErrors.forEach(error => {
        try {
          const content = JSON.parse(error.content as string);
          errors.push({
            errorMessage: content.message || error.title || 'Unknown error',
            stackTrace: content.stack || '',
            timestamp: error.createdAt || new Date(),
            userId: error.userId || 0,
            pagePath: content.page || 'unknown',
          });
        } catch (e) {
          // Skip malformed errors
        }
      });

      // Parse telemetry errors
      telemetryErrors.forEach(error => {
        const metadata = error.metadata as any;
        errors.push({
          errorMessage: metadata?.message || 'Unknown error',
          stackTrace: metadata?.stack || '',
          timestamp: error.timestamp,
          userId: error.userId,
          pagePath: error.pagePath,
        });
      });

      return errors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('[Error Pattern Pathway] Error collecting errors:', error);
      return [];
    }
  }

  /**
   * Group errors by category
   */
  async groupByCategory(): Promise<ErrorCategory[]> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const errors = await this.collectErrors({ start: sevenDaysAgo, end: new Date() });

      const categories: Record<string, { count: number; severity: string }> = {};

      errors.forEach(error => {
        const category = this.categorizeError(error.errorMessage);
        
        if (!categories[category]) {
          categories[category] = { count: 0, severity: 'low' };
        }

        categories[category].count++;

        // Determine severity based on frequency
        if (categories[category].count > 50) {
          categories[category].severity = 'critical';
        } else if (categories[category].count > 20) {
          categories[category].severity = 'high';
        } else if (categories[category].count > 5) {
          categories[category].severity = 'medium';
        }
      });

      return Object.entries(categories)
        .map(([category, data]) => ({
          category,
          count: data.count,
          severity: data.severity,
        }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('[Error Pattern Pathway] Error grouping by category:', error);
      return [];
    }
  }

  /**
   * Prioritize errors by user impact
   */
  async prioritizeErrors(): Promise<PrioritizedError[]> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const errors = await this.collectErrors({ start: thirtyDaysAgo, end: new Date() });

      const errorMap: Record<string, {
        affectedUsers: Set<number>;
        frequency: number;
        firstSeen: Date;
        lastSeen: Date;
      }> = {};

      errors.forEach(error => {
        const key = error.errorMessage.substring(0, 100); // Use first 100 chars as key

        if (!errorMap[key]) {
          errorMap[key] = {
            affectedUsers: new Set(),
            frequency: 0,
            firstSeen: error.timestamp,
            lastSeen: error.timestamp,
          };
        }

        errorMap[key].affectedUsers.add(error.userId);
        errorMap[key].frequency++;
        
        if (error.timestamp < errorMap[key].firstSeen) {
          errorMap[key].firstSeen = error.timestamp;
        }
        if (error.timestamp > errorMap[key].lastSeen) {
          errorMap[key].lastSeen = error.timestamp;
        }
      });

      // Calculate impact score and convert to array
      const prioritized = Object.entries(errorMap)
        .map(([error, data]) => {
          const userCount = data.affectedUsers.size;
          const frequency = data.frequency;
          // Impact = affected users * frequency weight
          const impact = userCount * Math.log10(frequency + 1) * 10;

          return {
            error,
            impact: Math.round(impact),
            affectedUsers: userCount,
            frequency,
            firstSeen: data.firstSeen,
            lastSeen: data.lastSeen,
          };
        })
        .sort((a, b) => b.impact - a.impact);

      return prioritized;
    } catch (error) {
      console.error('[Error Pattern Pathway] Error prioritizing errors:', error);
      return [];
    }
  }

  /**
   * Get error statistics
   */
  async getErrorStatistics(days: number = 7): Promise<{
    total: number;
    uniqueErrors: number;
    affectedUsers: number;
    topErrors: PrioritizedError[];
    categories: ErrorCategory[];
  }> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const errors = await this.collectErrors({ start: since, end: new Date() });
      const prioritized = await this.prioritizeErrors();
      const categories = await this.groupByCategory();

      return {
        total: errors.length,
        uniqueErrors: prioritized.length,
        affectedUsers: new Set(errors.map(e => e.userId)).size,
        topErrors: prioritized.slice(0, 5),
        categories,
      };
    } catch (error) {
      console.error('[Error Pattern Pathway] Error getting error statistics:', error);
      return {
        total: 0,
        uniqueErrors: 0,
        affectedUsers: 0,
        topErrors: [],
        categories: [],
      };
    }
  }

  /**
   * Categorize error message
   */
  private categorizeError(errorMessage: string): string {
    const lower = errorMessage.toLowerCase();

    if (lower.includes('network') || lower.includes('fetch') || lower.includes('request')) {
      return 'Network';
    }
    if (lower.includes('undefined') || lower.includes('null') || lower.includes('reference')) {
      return 'Null Reference';
    }
    if (lower.includes('syntax') || lower.includes('parse')) {
      return 'Syntax';
    }
    if (lower.includes('permission') || lower.includes('auth') || lower.includes('forbidden')) {
      return 'Permission';
    }
    if (lower.includes('timeout')) {
      return 'Timeout';
    }
    if (lower.includes('memory') || lower.includes('heap')) {
      return 'Memory';
    }

    return 'Other';
  }
}

export const errorPatternPathway = new ErrorPatternPathway();

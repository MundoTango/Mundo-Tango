import { db } from "@db";
import { userTelemetry } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export interface ProblematicElement {
  elementId: string;
  failureRate: number;
  totalAttempts: number;
  failedAttempts: number;
}

export class VisualEditorPathway {
  /**
   * Track an element edit attempt
   */
  async trackElementEdit(userId: number, elementId: string, success: boolean): Promise<void> {
    try {
      await db.insert(userTelemetry).values({
        userId,
        eventType: 'visual_editor_edit',
        pagePath: '/visual-editor',
        metadata: {
          elementId,
          success,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
      });

      console.log(`[Visual Editor Pathway] Tracked edit: element ${elementId}, success: ${success}`);
    } catch (error) {
      console.error('[Visual Editor Pathway] Error tracking element edit:', error);
      throw error;
    }
  }

  /**
   * Find elements users struggle to edit
   */
  async findProblematicElements(): Promise<ProblematicElement[]> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const edits = await db
        .select()
        .from(userTelemetry)
        .where(
          and(
            eq(userTelemetry.eventType, 'visual_editor_edit'),
            gte(userTelemetry.timestamp, sevenDaysAgo)
          )
        );

      // Aggregate by element
      const elementStats: Record<string, { total: number; failures: number }> = {};
      
      edits.forEach(edit => {
        const metadata = edit.metadata as any;
        const elementId = metadata?.elementId || 'unknown';
        const success = metadata?.success !== false;

        if (!elementStats[elementId]) {
          elementStats[elementId] = { total: 0, failures: 0 };
        }

        elementStats[elementId].total++;
        if (!success) {
          elementStats[elementId].failures++;
        }
      });

      // Convert to array and calculate failure rates
      const problematic = Object.entries(elementStats)
        .map(([elementId, stats]) => ({
          elementId,
          failureRate: stats.failures / stats.total,
          totalAttempts: stats.total,
          failedAttempts: stats.failures,
        }))
        .filter(e => e.failureRate > 0.2) // More than 20% failure rate
        .sort((a, b) => b.failureRate - a.failureRate);

      return problematic;
    } catch (error) {
      console.error('[Visual Editor Pathway] Error finding problematic elements:', error);
      return [];
    }
  }

  /**
   * Generate AI suggestions for editor improvements
   */
  async suggestEditorImprovements(): Promise<string[]> {
    try {
      const problematicElements = await this.findProblematicElements();

      if (problematicElements.length === 0) {
        return ['Visual editor is performing well. No critical improvements needed.'];
      }

      const suggestions: string[] = [];

      problematicElements.forEach(element => {
        if (element.failureRate > 0.5) {
          suggestions.push(
            `Critical: Element "${element.elementId}" has ${(element.failureRate * 100).toFixed(0)}% failure rate. ` +
            `Consider redesigning the editing interface or adding better guidance.`
          );
        } else if (element.failureRate > 0.3) {
          suggestions.push(
            `High: Element "${element.elementId}" has ${(element.failureRate * 100).toFixed(0)}% failure rate. ` +
            `Add tooltips or inline help to improve success rate.`
          );
        } else {
          suggestions.push(
            `Medium: Element "${element.elementId}" has ${(element.failureRate * 100).toFixed(0)}% failure rate. ` +
            `Consider minor UX improvements.`
          );
        }
      });

      return suggestions.slice(0, 10); // Top 10 suggestions
    } catch (error) {
      console.error('[Visual Editor Pathway] Error suggesting improvements:', error);
      return ['Error generating suggestions. Please try again.'];
    }
  }

  /**
   * Get editor usage statistics
   */
  async getUsageStatistics(days: number = 7): Promise<{
    totalEdits: number;
    successfulEdits: number;
    failedEdits: number;
    successRate: number;
    uniqueUsers: number;
  }> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const edits = await db
        .select()
        .from(userTelemetry)
        .where(
          and(
            eq(userTelemetry.eventType, 'visual_editor_edit'),
            gte(userTelemetry.timestamp, since)
          )
        );

      const stats = {
        totalEdits: edits.length,
        successfulEdits: 0,
        failedEdits: 0,
        successRate: 0,
        uniqueUsers: new Set(edits.map(e => e.userId)).size,
      };

      edits.forEach(edit => {
        const metadata = edit.metadata as any;
        const success = metadata?.success !== false;
        if (success) {
          stats.successfulEdits++;
        } else {
          stats.failedEdits++;
        }
      });

      stats.successRate = stats.totalEdits > 0 ? stats.successfulEdits / stats.totalEdits : 0;

      return stats;
    } catch (error) {
      console.error('[Visual Editor Pathway] Error getting usage statistics:', error);
      return {
        totalEdits: 0,
        successfulEdits: 0,
        failedEdits: 0,
        successRate: 0,
        uniqueUsers: 0,
      };
    }
  }
}

export const visualEditorPathway = new VisualEditorPathway();

import { db } from "@db";
import { sessionBugsFound, userTestingSessions, sessionInteractions } from "@shared/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface PathwayInsight {
  pathwayId: number;
  pathwayName: string;
  insight: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: number;
  suggestedAction: string;
  confidence: number;
}

export interface StuckPoint {
  scenarioId: number;
  stepName: string;
  avgTimeSpent: number;
  usersStuck: number;
  difficulty: string;
}

export class VolunteerTestingPathway {
  /**
   * Aggregate test results for a specific scenario
   */
  async aggregateTestResults(scenarioId: number): Promise<PathwayInsight> {
    try {
      const bugs = await db
        .select()
        .from(sessionBugsFound)
        .where(eq(sessionBugsFound.scenarioId, scenarioId));

      const criticalBugs = bugs.filter(b => b.severity === 'critical').length;
      const totalBugs = bugs.length;

      const severity = criticalBugs > 0 ? 'critical' : 
                      totalBugs > 5 ? 'high' :
                      totalBugs > 2 ? 'medium' : 'low';

      return {
        pathwayId: 2,
        pathwayName: "UI Volunteer Testing",
        insight: `Scenario ${scenarioId}: ${totalBugs} bugs found (${criticalBugs} critical)`,
        severity,
        affectedUsers: bugs.length,
        suggestedAction: criticalBugs > 0 ? "Immediately fix critical bugs" : "Review and prioritize bugs",
        confidence: 0.95
      };
    } catch (error) {
      console.error('[Volunteer Testing Pathway] Error aggregating test results:', error);
      throw error;
    }
  }

  /**
   * Find common stuck points across all test sessions
   */
  async findCommonStuckPoints(): Promise<StuckPoint[]> {
    try {
      // Query sessions where users spent > 30 seconds on a step
      const stuckPoints = await db
        .select({
          scenarioId: sessionInteractions.scenarioId,
          stepName: sessionInteractions.action,
          avgTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${sessionInteractions.timestamp} - LAG(${sessionInteractions.timestamp}) OVER (PARTITION BY ${sessionInteractions.sessionId} ORDER BY ${sessionInteractions.timestamp}))))`,
          usersStuck: sql<number>`COUNT(DISTINCT ${sessionInteractions.sessionId})`,
        })
        .from(sessionInteractions)
        .groupBy(sessionInteractions.scenarioId, sessionInteractions.action)
        .having(sql`AVG(EXTRACT(EPOCH FROM (${sessionInteractions.timestamp} - LAG(${sessionInteractions.timestamp}) OVER (PARTITION BY ${sessionInteractions.sessionId} ORDER BY ${sessionInteractions.timestamp})))) > 30`);

      return stuckPoints.map(point => ({
        scenarioId: point.scenarioId || 0,
        stepName: point.stepName || 'Unknown',
        avgTimeSpent: Math.round(point.avgTime || 0),
        usersStuck: point.usersStuck || 0,
        difficulty: point.avgTime > 60 ? 'high' : point.avgTime > 30 ? 'medium' : 'low'
      }));
    } catch (error) {
      console.error('[Volunteer Testing Pathway] Error finding stuck points:', error);
      return [];
    }
  }

  /**
   * Identify scenarios with low completion rates
   */
  async identifyProblematicScenarios(): Promise<number[]> {
    try {
      const scenarios = await db
        .select({
          scenarioId: userTestingSessions.scenarioId,
          totalSessions: sql<number>`COUNT(*)`,
          completedSessions: sql<number>`SUM(CASE WHEN ${userTestingSessions.completedAt} IS NOT NULL THEN 1 ELSE 0 END)`,
        })
        .from(userTestingSessions)
        .groupBy(userTestingSessions.scenarioId);

      const problematicScenarios = scenarios
        .filter(s => {
          const completionRate = (s.completedSessions / s.totalSessions) * 100;
          return completionRate < 60; // Less than 60% completion rate
        })
        .map(s => s.scenarioId || 0)
        .filter(id => id > 0);

      return problematicScenarios;
    } catch (error) {
      console.error('[Volunteer Testing Pathway] Error identifying problematic scenarios:', error);
      return [];
    }
  }

  /**
   * Get bug statistics for the pathway
   */
  async getBugStatistics(days: number = 7): Promise<{
    total: number;
    bySeverity: { critical: number; major: number; minor: number };
    byScenario: Record<number, number>;
  }> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const bugs = await db
        .select()
        .from(sessionBugsFound)
        .where(gte(sessionBugsFound.createdAt, since));

      const stats = {
        total: bugs.length,
        bySeverity: {
          critical: bugs.filter(b => b.severity === 'critical').length,
          major: bugs.filter(b => b.severity === 'major').length,
          minor: bugs.filter(b => b.severity === 'minor').length,
        },
        byScenario: {} as Record<number, number>
      };

      bugs.forEach(bug => {
        const scenarioId = bug.scenarioId || 0;
        stats.byScenario[scenarioId] = (stats.byScenario[scenarioId] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('[Volunteer Testing Pathway] Error getting bug statistics:', error);
      return { total: 0, bySeverity: { critical: 0, major: 0, minor: 0 }, byScenario: {} };
    }
  }

  /**
   * Get recent test sessions
   */
  async getRecentSessions(limit: number = 20): Promise<any[]> {
    try {
      const sessions = await db
        .select()
        .from(userTestingSessions)
        .orderBy(desc(userTestingSessions.createdAt))
        .limit(limit);

      return sessions;
    } catch (error) {
      console.error('[Volunteer Testing Pathway] Error getting recent sessions:', error);
      return [];
    }
  }
}

export const volunteerTestingPathway = new VolunteerTestingPathway();

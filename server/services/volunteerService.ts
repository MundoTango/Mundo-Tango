import { db } from "../db";
import { 
  volunteerStats, 
  InsertVolunteerStats, 
  SelectVolunteerStats,
  uiTestResults,
  SelectUiTestResult
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export class VolunteerService {
  async registerVolunteer(userId: number): Promise<number> {
    const existing = await db.select()
      .from(volunteerStats)
      .where(eq(volunteerStats.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].id;
    }

    const [result] = await db.insert(volunteerStats)
      .values({
        userId,
        totalSessionsCompleted: 0,
        totalMinutesTested: 0,
        bugsFound: 0,
        averageCompletionRate: 0,
        skillLevel: 'beginner'
      })
      .returning({ id: volunteerStats.id });

    return result.id;
  }

  async updateStats(userId: number, sessionResults: SelectUiTestResult): Promise<void> {
    const [stats] = await db.select()
      .from(volunteerStats)
      .where(eq(volunteerStats.userId, userId))
      .limit(1);

    if (!stats) {
      await this.registerVolunteer(userId);
      return this.updateStats(userId, sessionResults);
    }

    const newTotalSessions = (stats.totalSessionsCompleted || 0) + 1;
    const estimatedMinutes = sessionResults.durationSeconds 
      ? Math.floor(sessionResults.durationSeconds / 60) 
      : 5;
    const newTotalMinutes = (stats.totalMinutesTested || 0) + estimatedMinutes;

    const allResults = await db.select()
      .from(uiTestResults)
      .where(eq(uiTestResults.userId, userId));

    const completedCount = allResults.filter(r => r.completed).length;
    const totalCount = allResults.length;
    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const newStats = {
      totalSessionsCompleted: newTotalSessions,
      totalMinutesTested: newTotalMinutes,
      bugsFound: stats.bugsFound,
      averageCompletionRate: completionRate,
      lastActiveAt: new Date(),
      updatedAt: new Date()
    };

    const skillLevel = this.calculateSkillLevel({
      ...stats,
      ...newStats
    } as SelectVolunteerStats);

    await db.update(volunteerStats)
      .set({ ...newStats, skillLevel })
      .where(eq(volunteerStats.userId, userId));
  }

  async getVolunteerLeaderboard(limit: number = 10): Promise<SelectVolunteerStats[]> {
    return await db.select()
      .from(volunteerStats)
      .orderBy(
        desc(volunteerStats.totalSessionsCompleted),
        desc(volunteerStats.bugsFound),
        desc(volunteerStats.totalMinutesTested)
      )
      .limit(limit);
  }

  calculateSkillLevel(stats: SelectVolunteerStats): 'beginner' | 'intermediate' | 'advanced' {
    const totalSessions = stats.totalSessionsCompleted || 0;
    const completionRate = stats.averageCompletionRate || 0;

    if (totalSessions < 5 || completionRate < 60) {
      return 'beginner';
    }

    if (totalSessions <= 20 && completionRate >= 60 && completionRate <= 85) {
      return 'intermediate';
    }

    if (totalSessions > 20 && completionRate > 85) {
      return 'advanced';
    }

    return 'intermediate';
  }

  async assignScenario(volunteerId: number, scenarioId: number): Promise<number> {
    const sessionId = `session_${volunteerId}_${scenarioId}_${Date.now()}`;

    const [result] = await db.insert(uiTestResults)
      .values({
        scenarioId,
        userId: volunteerId,
        sessionId,
        completed: false
      })
      .returning({ id: uiTestResults.id });

    return result.id;
  }

  async getVolunteerStats(userId: number): Promise<SelectVolunteerStats | null> {
    const [stats] = await db.select()
      .from(volunteerStats)
      .where(eq(volunteerStats.userId, userId))
      .limit(1);

    return stats || null;
  }

  async getAllVolunteerStats(): Promise<SelectVolunteerStats[]> {
    return await db.select()
      .from(volunteerStats)
      .orderBy(desc(volunteerStats.createdAt));
  }

  async incrementBugsFound(userId: number): Promise<void> {
    const [stats] = await db.select()
      .from(volunteerStats)
      .where(eq(volunteerStats.userId, userId))
      .limit(1);

    if (stats) {
      await db.update(volunteerStats)
        .set({ 
          bugsFound: (stats.bugsFound || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(volunteerStats.userId, userId));
    }
  }
}

export const volunteerService = new VolunteerService();

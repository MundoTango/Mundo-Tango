import { db } from "../../db";
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
        totalSessions: 0,
        completedSessions: 0,
        bugsFound: 0,
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

    const newTotalSessions = stats.totalSessions + 1;
    const newCompletedSessions = sessionResults.completed 
      ? stats.completedSessions + 1 
      : stats.completedSessions;

    const allResults = await db.select()
      .from(uiTestResults)
      .where(eq(uiTestResults.userId, userId));

    const ratingsWithValues = allResults
      .filter(r => r.difficultyRating !== null && r.difficultyRating !== undefined)
      .map(r => r.difficultyRating!);

    const avgRating = ratingsWithValues.length > 0
      ? ratingsWithValues.reduce((sum, rating) => sum + rating, 0) / ratingsWithValues.length
      : null;

    const newStats = {
      totalSessions: newTotalSessions,
      completedSessions: newCompletedSessions,
      bugsFound: stats.bugsFound,
      averageDifficultyRating: avgRating,
      lastSessionAt: new Date(),
      updatedAt: new Date()
    };

    const skillLevel = this.calculateSkillLevel({
      ...stats,
      ...newStats
    });

    await db.update(volunteerStats)
      .set({ ...newStats, skillLevel })
      .where(eq(volunteerStats.userId, userId));
  }

  async getVolunteerLeaderboard(limit: number = 10): Promise<SelectVolunteerStats[]> {
    return await db.select()
      .from(volunteerStats)
      .orderBy(
        desc(volunteerStats.completedSessions),
        desc(volunteerStats.bugsFound),
        desc(volunteerStats.totalSessions)
      )
      .limit(limit);
  }

  calculateSkillLevel(stats: SelectVolunteerStats): 'beginner' | 'intermediate' | 'advanced' {
    const completionRate = stats.totalSessions > 0
      ? (stats.completedSessions / stats.totalSessions) * 100
      : 0;

    if (stats.totalSessions < 5 || completionRate < 60) {
      return 'beginner';
    }

    if (stats.totalSessions <= 20 && completionRate >= 60 && completionRate <= 85) {
      return 'intermediate';
    }

    if (stats.totalSessions > 20 && completionRate > 85) {
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
}

export const volunteerService = new VolunteerService();

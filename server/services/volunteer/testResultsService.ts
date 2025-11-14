import { db } from "../../db";
import { 
  uiTestResults, 
  InsertUiTestResult, 
  SelectUiTestResult 
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface StuckPoint {
  stepIndex: number;
  timeSpentSeconds: number;
  description?: string;
}

export class TestResultsService {
  async submitResult(result: InsertUiTestResult): Promise<number> {
    const [inserted] = await db.insert(uiTestResults)
      .values(result)
      .returning({ id: uiTestResults.id });

    return inserted.id;
  }

  async detectStuckPoints(sessionId: string): Promise<StuckPoint[]> {
    const [result] = await db.select()
      .from(uiTestResults)
      .where(eq(uiTestResults.sessionId, sessionId))
      .limit(1);

    if (!result || !result.stepTimings) {
      return [];
    }

    const stepTimings = result.stepTimings as any[];
    const stuckPoints: StuckPoint[] = [];
    const STUCK_THRESHOLD_SECONDS = 30;

    if (Array.isArray(stepTimings)) {
      stepTimings.forEach((timing: any, index: number) => {
        if (timing.timeSpentSeconds > STUCK_THRESHOLD_SECONDS) {
          stuckPoints.push({
            stepIndex: index,
            timeSpentSeconds: timing.timeSpentSeconds,
            description: timing.description || `Step ${index + 1}`
          });
        }
      });
    }

    if (result.stuckPoints && Array.isArray(result.stuckPoints)) {
      const manualStuckPoints = result.stuckPoints as any[];
      manualStuckPoints.forEach((point: any) => {
        if (!stuckPoints.find(sp => sp.stepIndex === point.stepIndex)) {
          stuckPoints.push(point);
        }
      });
    }

    return stuckPoints;
  }

  async calculateCompletionRate(scenarioId: number): Promise<number> {
    const totalResults = await db.select({ count: sql<number>`count(*)` })
      .from(uiTestResults)
      .where(eq(uiTestResults.scenarioId, scenarioId));

    const completedResults = await db.select({ count: sql<number>`count(*)` })
      .from(uiTestResults)
      .where(and(
        eq(uiTestResults.scenarioId, scenarioId),
        eq(uiTestResults.completed, true)
      ));

    const total = Number(totalResults[0].count);
    const completed = Number(completedResults[0].count);

    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  async getAverageDifficultyRating(scenarioId: number): Promise<number> {
    const result = await db.select({
      avg: sql<number>`AVG(${uiTestResults.difficultyRating})`
    })
      .from(uiTestResults)
      .where(and(
        eq(uiTestResults.scenarioId, scenarioId),
        sql`${uiTestResults.difficultyRating} IS NOT NULL`
      ));

    return result[0].avg ? Number(result[0].avg) : 0;
  }

  async getFeedbackForScenario(scenarioId: number): Promise<string[]> {
    const results = await db.select({ feedback: uiTestResults.feedback })
      .from(uiTestResults)
      .where(and(
        eq(uiTestResults.scenarioId, scenarioId),
        sql`${uiTestResults.feedback} IS NOT NULL AND ${uiTestResults.feedback} != ''`
      ));

    return results.map(r => r.feedback!).filter(Boolean);
  }

  async getResultsByScenario(scenarioId: number): Promise<SelectUiTestResult[]> {
    return await db.select()
      .from(uiTestResults)
      .where(eq(uiTestResults.scenarioId, scenarioId))
      .orderBy(uiTestResults.createdAt);
  }

  async getResultsByUser(userId: number): Promise<SelectUiTestResult[]> {
    return await db.select()
      .from(uiTestResults)
      .where(eq(uiTestResults.userId, userId))
      .orderBy(uiTestResults.createdAt);
  }
}

export const testResultsService = new TestResultsService();

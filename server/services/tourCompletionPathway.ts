import { db } from "@db";
import { userTelemetry, mrBlueKnowledgeBase } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AbandonmentPoint {
  step: number;
  abandonRate: number;
  stepName: string;
  users: number;
}

export class TourCompletionPathway {
  /**
   * Get completion rate for a specific tour
   */
  async getCompletionRate(tourId: string): Promise<number> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const tourEvents = await db
        .select()
        .from(userTelemetry)
        .where(
          and(
            eq(userTelemetry.eventType, 'tour_step_viewed'),
            gte(userTelemetry.timestamp, sevenDaysAgo)
          )
        );

      const tourData = tourEvents.filter(e => {
        const metadata = e.metadata as any;
        return metadata?.tourId === tourId;
      });

      if (tourData.length === 0) {
        return 0;
      }

      // Group by user
      const userTours: Record<number, { steps: number[]; completed: boolean }> = {};
      
      tourData.forEach(event => {
        const userId = event.userId;
        const metadata = event.metadata as any;
        const step = metadata?.step || 0;
        const completed = metadata?.completed === true;

        if (!userTours[userId]) {
          userTours[userId] = { steps: [], completed: false };
        }

        userTours[userId].steps.push(step);
        if (completed) {
          userTours[userId].completed = true;
        }
      });

      const totalUsers = Object.keys(userTours).length;
      const completedUsers = Object.values(userTours).filter(t => t.completed).length;

      return totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;
    } catch (error) {
      console.error('[Tour Completion Pathway] Error getting completion rate:', error);
      return 0;
    }
  }

  /**
   * Find steps where users abandon the tour
   */
  async findAbandonmentPoints(): Promise<AbandonmentPoint[]> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const tourEvents = await db
        .select()
        .from(userTelemetry)
        .where(
          and(
            eq(userTelemetry.eventType, 'tour_step_viewed'),
            gte(userTelemetry.timestamp, sevenDaysAgo)
          )
        );

      // Group by tour and step
      const stepData: Record<number, { viewed: number; abandoned: number; name: string }> = {};
      const userLastSteps: Record<number, number> = {};

      tourEvents.forEach(event => {
        const metadata = event.metadata as any;
        const step = metadata?.step || 0;
        const stepName = metadata?.stepName || `Step ${step}`;
        const userId = event.userId;

        if (!stepData[step]) {
          stepData[step] = { viewed: 0, abandoned: 0, name: stepName };
        }

        stepData[step].viewed++;
        userLastSteps[userId] = Math.max(userLastSteps[userId] || 0, step);
      });

      // Calculate abandonment rates
      const maxStep = Math.max(...Object.keys(stepData).map(Number));
      const abandonmentPoints: AbandonmentPoint[] = [];

      Object.entries(stepData).forEach(([stepStr, data]) => {
        const step = parseInt(stepStr);
        const usersReached = data.viewed;
        const usersCompleted = stepData[step + 1]?.viewed || 0;
        const usersAbandoned = usersReached - usersCompleted;
        const abandonRate = usersReached > 0 ? (usersAbandoned / usersReached) * 100 : 0;

        if (abandonRate > 20 && step < maxStep) { // More than 20% abandon and not the last step
          abandonmentPoints.push({
            step,
            abandonRate,
            stepName: data.name,
            users: usersAbandoned,
          });
        }
      });

      return abandonmentPoints.sort((a, b) => b.abandonRate - a.abandonRate);
    } catch (error) {
      console.error('[Tour Completion Pathway] Error finding abandonment points:', error);
      return [];
    }
  }

  /**
   * Generate AI suggestions to improve tour steps
   */
  async improveSteps(): Promise<string[]> {
    try {
      const abandonmentPoints = await this.findAbandonmentPoints();

      if (abandonmentPoints.length === 0) {
        return ['Tour completion is performing well. No critical improvements needed.'];
      }

      const suggestions: string[] = [];

      for (const point of abandonmentPoints.slice(0, 5)) {
        // Use AI to generate improvement suggestions
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a UX expert. Suggest 2-3 specific improvements for an onboarding tour step where users are dropping off."
            },
            {
              role: "user",
              content: `Step: "${point.stepName}"\nAbandonment rate: ${point.abandonRate.toFixed(1)}%\nUsers affected: ${point.users}`
            }
          ],
          temperature: 0.7,
          max_tokens: 200,
        });

        const aiSuggestion = completion.choices[0]?.message?.content || '';
        suggestions.push(`${point.stepName}: ${aiSuggestion}`);
      }

      return suggestions;
    } catch (error) {
      console.error('[Tour Completion Pathway] Error improving steps:', error);
      return ['Error generating improvement suggestions'];
    }
  }

  /**
   * Get tour analytics summary
   */
  async getTourAnalytics(tourId: string, days: number = 7): Promise<{
    completionRate: number;
    totalStarts: number;
    totalCompletions: number;
    avgStepsCompleted: number;
    topAbandonmentSteps: AbandonmentPoint[];
  }> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const tourEvents = await db
        .select()
        .from(userTelemetry)
        .where(
          and(
            eq(userTelemetry.eventType, 'tour_step_viewed'),
            gte(userTelemetry.timestamp, since)
          )
        );

      const tourData = tourEvents.filter(e => {
        const metadata = e.metadata as any;
        return metadata?.tourId === tourId;
      });

      const userTours: Record<number, { steps: number; completed: boolean }> = {};
      
      tourData.forEach(event => {
        const userId = event.userId;
        const metadata = event.metadata as any;
        const completed = metadata?.completed === true;

        if (!userTours[userId]) {
          userTours[userId] = { steps: 0, completed: false };
        }

        userTours[userId].steps++;
        if (completed) {
          userTours[userId].completed = true;
        }
      });

      const totalStarts = Object.keys(userTours).length;
      const totalCompletions = Object.values(userTours).filter(t => t.completed).length;
      const avgStepsCompleted = totalStarts > 0
        ? Object.values(userTours).reduce((sum, t) => sum + t.steps, 0) / totalStarts
        : 0;

      const completionRate = await this.getCompletionRate(tourId);
      const topAbandonmentSteps = await this.findAbandonmentPoints();

      return {
        completionRate,
        totalStarts,
        totalCompletions,
        avgStepsCompleted,
        topAbandonmentSteps: topAbandonmentSteps.slice(0, 3),
      };
    } catch (error) {
      console.error('[Tour Completion Pathway] Error getting tour analytics:', error);
      return {
        completionRate: 0,
        totalStarts: 0,
        totalCompletions: 0,
        avgStepsCompleted: 0,
        topAbandonmentSteps: [],
      };
    }
  }
}

export const tourCompletionPathway = new TourCompletionPathway();

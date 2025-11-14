import { db } from "@db";
import { userTestingSessions, sessionInteractions, mrBlueKnowledgeBase } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SessionInsight {
  sessionId: number;
  usabilityIssues: string[];
  userFeedback: string[];
  suggestions: string[];
  overallSentiment: string;
}

export interface TrendData {
  period: string;
  issuesFound: number;
  avgSessionDuration: number;
  userSatisfaction: number;
}

export class LiveSessionPathway {
  /**
   * Analyze a live testing session
   */
  async analyzeSession(sessionId: number): Promise<SessionInsight> {
    try {
      // Get session data
      const session = await db
        .select()
        .from(userTestingSessions)
        .where(eq(userTestingSessions.id, sessionId))
        .limit(1);

      if (session.length === 0) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Get session interactions
      const interactions = await db
        .select()
        .from(sessionInteractions)
        .where(eq(sessionInteractions.sessionId, sessionId));

      // Get session notes from knowledge base
      const notes = await db
        .select()
        .from(mrBlueKnowledgeBase)
        .where(
          and(
            eq(mrBlueKnowledgeBase.category, 'live_session'),
            eq(mrBlueKnowledgeBase.userId, session[0].userId || 0)
          )
        );

      // Use AI to analyze session data
      const sessionData = {
        difficultyRating: session[0].difficultyRating,
        feedback: session[0].feedback,
        interactions: interactions.map(i => ({
          action: i.action,
          timeSpent: i.timestamp,
        })),
        notes: notes.map(n => n.content).join('\n')
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Analyze this live testing session and identify: 1) usability issues 2) user feedback themes 3) improvement suggestions 4) overall sentiment"
          },
          {
            role: "user",
            content: JSON.stringify(sessionData)
          }
        ],
        temperature: 0.3,
      });

      const analysis = completion.choices[0]?.message?.content || '';

      return {
        sessionId,
        usabilityIssues: this.extractIssues(analysis),
        userFeedback: [session[0].feedback || ''],
        suggestions: this.extractSuggestions(analysis),
        overallSentiment: this.extractSentiment(session[0].difficultyRating || 3)
      };
    } catch (error) {
      console.error('[Live Session Pathway] Error analyzing session:', error);
      throw error;
    }
  }

  /**
   * Extract learnings from a session
   */
  async extractLearnings(sessionId: number): Promise<string[]> {
    try {
      const insight = await this.analyzeSession(sessionId);
      
      const learnings = [
        ...insight.usabilityIssues.map(issue => `Usability: ${issue}`),
        ...insight.suggestions.map(sug => `Improvement: ${sug}`)
      ];

      // Store learnings in knowledge base
      await db.insert(mrBlueKnowledgeBase).values({
        category: 'live_session',
        title: `Session ${sessionId} Learnings`,
        content: JSON.stringify(learnings),
        tags: ['learning', 'live-session', `session-${sessionId}`],
      });

      return learnings;
    } catch (error) {
      console.error('[Live Session Pathway] Error extracting learnings:', error);
      return [];
    }
  }

  /**
   * Compare sessions over time to identify trends
   */
  async compareSessionsOverTime(): Promise<TrendData[]> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const sessions = await db
        .select()
        .from(userTestingSessions)
        .where(gte(userTestingSessions.createdAt, thirtyDaysAgo));

      // Group by week
      const trends: Record<string, TrendData> = {};
      
      sessions.forEach(session => {
        const weekKey = this.getWeekKey(session.createdAt || new Date());
        
        if (!trends[weekKey]) {
          trends[weekKey] = {
            period: weekKey,
            issuesFound: 0,
            avgSessionDuration: 0,
            userSatisfaction: 0,
          };
        }

        trends[weekKey].issuesFound++;
        trends[weekKey].userSatisfaction += (6 - (session.difficultyRating || 3)) / 3; // Convert to 0-1 scale
      });

      return Object.values(trends);
    } catch (error) {
      console.error('[Live Session Pathway] Error comparing sessions:', error);
      return [];
    }
  }

  /**
   * Get recent live sessions
   */
  async getRecentSessions(limit: number = 10): Promise<any[]> {
    try {
      const sessions = await db
        .select()
        .from(mrBlueKnowledgeBase)
        .where(eq(mrBlueKnowledgeBase.category, 'live_session'))
        .orderBy(desc(mrBlueKnowledgeBase.createdAt))
        .limit(limit);

      return sessions;
    } catch (error) {
      console.error('[Live Session Pathway] Error getting recent sessions:', error);
      return [];
    }
  }

  // Helper methods
  private extractIssues(analysis: string): string[] {
    const issues: string[] = [];
    const lines = analysis.split('\n');
    lines.forEach(line => {
      if (line.toLowerCase().includes('issue') || line.toLowerCase().includes('problem')) {
        issues.push(line.trim());
      }
    });
    return issues.slice(0, 5);
  }

  private extractSuggestions(analysis: string): string[] {
    const suggestions: string[] = [];
    const lines = analysis.split('\n');
    lines.forEach(line => {
      if (line.toLowerCase().includes('suggest') || line.toLowerCase().includes('improve')) {
        suggestions.push(line.trim());
      }
    });
    return suggestions.slice(0, 5);
  }

  private extractSentiment(difficultyRating: number): string {
    if (difficultyRating <= 2) return 'positive';
    if (difficultyRating <= 3) return 'neutral';
    return 'negative';
  }

  private getWeekKey(date: Date): string {
    const week = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${date.getFullYear()}-W${week}`;
  }
}

export const liveSessionPathway = new LiveSessionPathway();

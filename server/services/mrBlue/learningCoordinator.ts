import { db } from "@db";
import { mrBlueKnowledgeBase, sessionBugsFound, userTelemetry, visualEditorAiSuggestions } from "@shared/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// 10 LEARNING PATHWAYS - Each tracks different user feedback channels
// ============================================================================

interface LearningPathway {
  id: number;
  name: string;
  description: string;
  dataSource: string;
  collectData: () => Promise<PathwayData>;
  analyzeInsights: (data: PathwayData) => Promise<PathwayInsight[]>;
}

interface PathwayData {
  pathwayId: number;
  dataPoints: number;
  rawData: any[];
  timeRange: { start: Date; end: Date };
}

interface PathwayInsight {
  pathwayId: number;
  pathwayName: string;
  insight: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: number;
  suggestedAction: string;
  confidence: number;
}

export interface LearningReport {
  reportDate: Date;
  pathwayMetrics: {
    pathwayId: number;
    pathwayName: string;
    dataCollected: number;
    insightsGenerated: number;
    criticalIssues: number;
  }[];
  topInsights: PathwayInsight[];
  prioritizedImprovements: {
    type: 'bug' | 'feature' | 'ux';
    title: string;
    description: string;
    impact: number;
    effort: string;
    pathways: string[];
  }[];
  userSatisfactionTrend: number;
  systemHealthScore: number;
}

// ============================================================================
// PATHWAY IMPLEMENTATIONS
// ============================================================================

const learningPathways: LearningPathway[] = [
  // Pathway 1: Direct Chat Feedback
  {
    id: 1,
    name: "Direct Chat Feedback",
    description: "Users explicitly tell Mr. Blue about bugs via chat",
    dataSource: "mrBlueKnowledgeBase (category='user_feedback')",
    collectData: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const feedback = await db
        .select()
        .from(mrBlueKnowledgeBase)
        .where(
          and(
            eq(mrBlueKnowledgeBase.category, 'user_feedback'),
            gte(mrBlueKnowledgeBase.createdAt, sevenDaysAgo)
          )
        );
      
      return {
        pathwayId: 1,
        dataPoints: feedback.length,
        rawData: feedback,
        timeRange: { start: sevenDaysAgo, end: new Date() }
      };
    },
    analyzeInsights: async (data) => {
      const insights: PathwayInsight[] = [];
      
      // Group feedback by common themes using AI
      if (data.rawData.length > 0) {
        const feedbackTexts = data.rawData.map((f: any) => f.content).join('\n---\n');
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Analyze user feedback and identify the top 3 most common issues. For each, provide: severity (low/medium/high/critical), number of users affected (estimate), and suggested action."
            },
            {
              role: "user",
              content: `User feedback:\n${feedbackTexts}`
            }
          ],
          temperature: 0.3,
        });

        const analysis = completion.choices[0]?.message?.content || '';
        
        insights.push({
          pathwayId: 1,
          pathwayName: "Direct Chat Feedback",
          insight: analysis,
          severity: 'medium',
          affectedUsers: data.rawData.length,
          suggestedAction: "Review and prioritize reported issues",
          confidence: 0.85
        });
      }
      
      return insights;
    }
  },

  // Pathway 2: UI Volunteer Testing
  {
    id: 2,
    name: "UI Volunteer Testing",
    description: "Test scenarios, difficulty ratings, stuck points (>30s)",
    dataSource: "sessionBugsFound, sessionInteractions",
    collectData: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const bugs = await db
        .select()
        .from(sessionBugsFound)
        .where(gte(sessionBugsFound.createdAt, sevenDaysAgo));
      
      return {
        pathwayId: 2,
        dataPoints: bugs.length,
        rawData: bugs,
        timeRange: { start: sevenDaysAgo, end: new Date() }
      };
    },
    analyzeInsights: async (data) => {
      const insights: PathwayInsight[] = [];
      
      if (data.rawData.length > 0) {
        const criticalBugs = data.rawData.filter((b: any) => b.severity === 'critical');
        
        if (criticalBugs.length > 0) {
          insights.push({
            pathwayId: 2,
            pathwayName: "UI Volunteer Testing",
            insight: `${criticalBugs.length} critical bugs found in volunteer testing`,
            severity: 'critical',
            affectedUsers: criticalBugs.length,
            suggestedAction: "Immediately review and fix critical bugs",
            confidence: 0.95
          });
        }
      }
      
      return insights;
    }
  },

  // Pathway 3: Live Testing Sessions
  {
    id: 3,
    name: "Live Testing Sessions",
    description: "Daily.co video sessions with screen share",
    dataSource: "mrBlueKnowledgeBase (category='live_session')",
    collectData: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const sessions = await db
        .select()
        .from(mrBlueKnowledgeBase)
        .where(
          and(
            eq(mrBlueKnowledgeBase.category, 'live_session'),
            gte(mrBlueKnowledgeBase.createdAt, sevenDaysAgo)
          )
        );
      
      return {
        pathwayId: 3,
        dataPoints: sessions.length,
        rawData: sessions,
        timeRange: { start: sevenDaysAgo, end: new Date() }
      };
    },
    analyzeInsights: async (data) => {
      return [];
    }
  },

  // Pathway 4: Visual Editor Integration
  {
    id: 4,
    name: "Visual Editor Integration",
    description: "Track which elements users struggle with",
    dataSource: "visualEditorAiSuggestions",
    collectData: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const suggestions = await db
        .select()
        .from(visualEditorAiSuggestions)
        .where(gte(visualEditorAiSuggestions.createdAt, sevenDaysAgo));
      
      return {
        pathwayId: 4,
        dataPoints: suggestions.length,
        rawData: suggestions,
        timeRange: { start: sevenDaysAgo, end: new Date() }
      };
    },
    analyzeInsights: async (data) => {
      const insights: PathwayInsight[] = [];
      
      if (data.rawData.length > 0) {
        const helpfulCount = data.rawData.filter((s: any) => s.wasHelpful === true).length;
        const unhelpfulCount = data.rawData.filter((s: any) => s.wasHelpful === false).length;
        const successRate = helpfulCount / (helpfulCount + unhelpfulCount || 1);
        
        if (successRate < 0.7) {
          insights.push({
            pathwayId: 4,
            pathwayName: "Visual Editor Integration",
            insight: `Low AI suggestion success rate: ${(successRate * 100).toFixed(1)}%`,
            severity: 'medium',
            affectedUsers: unhelpfulCount,
            suggestedAction: "Improve AI suggestion algorithms",
            confidence: 0.9
          });
        }
      }
      
      return insights;
    }
  },

  // Pathway 5: Passive Telemetry
  {
    id: 5,
    name: "Passive Telemetry",
    description: "Mouse hovers, scroll depth, error clicks",
    dataSource: "userTelemetry",
    collectData: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const telemetry = await db
        .select()
        .from(userTelemetry)
        .where(gte(userTelemetry.timestamp, sevenDaysAgo))
        .limit(1000);
      
      return {
        pathwayId: 5,
        dataPoints: telemetry.length,
        rawData: telemetry,
        timeRange: { start: sevenDaysAgo, end: new Date() }
      };
    },
    analyzeInsights: async (data) => {
      const insights: PathwayInsight[] = [];
      
      // Analyze error clicks
      const errorClicks = data.rawData.filter((t: any) => 
        t.eventType === 'click' && t.metadata?.error === true
      );
      
      if (errorClicks.length > 50) {
        insights.push({
          pathwayId: 5,
          pathwayName: "Passive Telemetry",
          insight: `High number of error clicks detected: ${errorClicks.length}`,
          severity: 'high',
          affectedUsers: new Set(errorClicks.map((e: any) => e.userId)).size,
          suggestedAction: "Investigate and fix UI elements causing errors",
          confidence: 0.8
        });
      }
      
      return insights;
    }
  },

  // Pathway 6: Code Generation Feedback
  {
    id: 6,
    name: "Code Generation Feedback",
    description: '"Was this code helpful?" after AI suggestions',
    dataSource: "visualEditorAiSuggestions (wasHelpful field)",
    collectData: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const feedback = await db
        .select()
        .from(visualEditorAiSuggestions)
        .where(
          and(
            gte(visualEditorAiSuggestions.createdAt, sevenDaysAgo),
            sql`${visualEditorAiSuggestions.wasHelpful} IS NOT NULL`
          )
        );
      
      return {
        pathwayId: 6,
        dataPoints: feedback.length,
        rawData: feedback,
        timeRange: { start: sevenDaysAgo, end: new Date() }
      };
    },
    analyzeInsights: async (data) => {
      return [];
    }
  },

  // Pathway 7: Tour Completion Rates
  {
    id: 7,
    name: "Tour Completion Rates",
    description: "Which onboarding steps users skip/abandon",
    dataSource: "mrBlueKnowledgeBase (category='tour_analytics')",
    collectData: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const tours = await db
        .select()
        .from(mrBlueKnowledgeBase)
        .where(
          and(
            eq(mrBlueKnowledgeBase.category, 'tour_analytics'),
            gte(mrBlueKnowledgeBase.createdAt, sevenDaysAgo)
          )
        );
      
      return {
        pathwayId: 7,
        dataPoints: tours.length,
        rawData: tours,
        timeRange: { start: sevenDaysAgo, end: new Date() }
      };
    },
    analyzeInsights: async (data) => {
      return [];
    }
  },

  // Pathway 8: Feature Usage Analytics
  {
    id: 8,
    name: "Feature Usage Analytics",
    description: "Which features are used vs ignored",
    dataSource: "userTelemetry (eventType analysis)",
    collectData: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const usage = await db
        .select()
        .from(userTelemetry)
        .where(gte(userTelemetry.timestamp, sevenDaysAgo))
        .limit(1000);
      
      return {
        pathwayId: 8,
        dataPoints: usage.length,
        rawData: usage,
        timeRange: { start: sevenDaysAgo, end: new Date() }
      };
    },
    analyzeInsights: async (data) => {
      return [];
    }
  },

  // Pathway 9: Error Pattern Recognition
  {
    id: 9,
    name: "Error Pattern Recognition",
    description: "Aggregate browser console errors",
    dataSource: "mrBlueKnowledgeBase (category='browser_error')",
    collectData: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const errors = await db
        .select()
        .from(mrBlueKnowledgeBase)
        .where(
          and(
            eq(mrBlueKnowledgeBase.category, 'browser_error'),
            gte(mrBlueKnowledgeBase.createdAt, sevenDaysAgo)
          )
        );
      
      return {
        pathwayId: 9,
        dataPoints: errors.length,
        rawData: errors,
        timeRange: { start: sevenDaysAgo, end: new Date() }
      };
    },
    analyzeInsights: async (data) => {
      const insights: PathwayInsight[] = [];
      
      if (data.rawData.length > 100) {
        insights.push({
          pathwayId: 9,
          pathwayName: "Error Pattern Recognition",
          insight: `High volume of browser errors: ${data.rawData.length} in last 7 days`,
          severity: 'critical',
          affectedUsers: new Set(data.rawData.map((e: any) => e.userId)).size,
          suggestedAction: "Investigate and fix recurring JavaScript errors",
          confidence: 0.95
        });
      }
      
      return insights;
    }
  },

  // Pathway 10: Social Sentiment Analysis
  {
    id: 10,
    name: "Social Sentiment Analysis",
    description: "Analyze post content for user pain points",
    dataSource: "mrBlueKnowledgeBase (category='sentiment')",
    collectData: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const sentiment = await db
        .select()
        .from(mrBlueKnowledgeBase)
        .where(
          and(
            eq(mrBlueKnowledgeBase.category, 'sentiment'),
            gte(mrBlueKnowledgeBase.createdAt, sevenDaysAgo)
          )
        );
      
      return {
        pathwayId: 10,
        dataPoints: sentiment.length,
        rawData: sentiment,
        timeRange: { start: sevenDaysAgo, end: new Date() }
      };
    },
    analyzeInsights: async (data) => {
      return [];
    }
  },
];

// ============================================================================
// LEARNING COORDINATOR - Agent #206
// ============================================================================

export class LearningCoordinator {
  /**
   * Analyze feedback from a specific user across all pathways
   */
  async analyzeFeedback(userId: number, feedback: any): Promise<void> {
    try {
      // Store feedback in knowledge base
      await db.insert(mrBlueKnowledgeBase).values({
        userId,
        category: 'user_feedback',
        title: feedback.title || 'User Feedback',
        content: feedback.content || JSON.stringify(feedback),
        tags: feedback.tags || [],
      });

      console.log(`[Learning Coordinator] Stored feedback from user ${userId}`);
    } catch (error) {
      console.error('[Learning Coordinator] Error analyzing feedback:', error);
      throw error;
    }
  }

  /**
   * Synthesize learnings across all 10 pathways
   */
  async synthesizeLearnings(): Promise<PathwayInsight[]> {
    try {
      const allInsights: PathwayInsight[] = [];

      // Collect and analyze data from all pathways
      for (const pathway of learningPathways) {
        try {
          const data = await pathway.collectData();
          const insights = await pathway.analyzeInsights(data);
          allInsights.push(...insights);
        } catch (error) {
          console.error(`[Learning Coordinator] Error in pathway ${pathway.name}:`, error);
        }
      }

      // Store synthesized insights
      if (allInsights.length > 0) {
        const synthesis = {
          totalInsights: allInsights.length,
          criticalInsights: allInsights.filter(i => i.severity === 'critical').length,
          highPriorityInsights: allInsights.filter(i => i.severity === 'high').length,
          insights: allInsights,
        };

        await db.insert(mrBlueKnowledgeBase).values({
          category: 'learning_insight',
          title: `Learning Synthesis - ${new Date().toISOString()}`,
          content: JSON.stringify(synthesis),
          tags: ['synthesis', 'automated'],
        });
      }

      return allInsights;
    } catch (error) {
      console.error('[Learning Coordinator] Error synthesizing learnings:', error);
      throw error;
    }
  }

  /**
   * Prioritize improvements by impact (bugs, features, UX)
   */
  async prioritizeImprovements(): Promise<any[]> {
    try {
      const insights = await this.synthesizeLearnings();
      
      // Score each insight by impact
      const scored = insights.map(insight => ({
        ...insight,
        impactScore: this.calculateImpactScore(insight),
      }));

      // Sort by impact score
      scored.sort((a, b) => b.impactScore - a.impactScore);

      // Convert to improvement items
      const improvements = scored.slice(0, 10).map((insight, index) => ({
        rank: index + 1,
        type: this.categorizeImprovementType(insight),
        title: insight.insight.substring(0, 100),
        description: insight.suggestedAction,
        impact: insight.impactScore,
        effort: this.estimateEffort(insight),
        pathways: [insight.pathwayName],
        severity: insight.severity,
      }));

      return improvements;
    } catch (error) {
      console.error('[Learning Coordinator] Error prioritizing improvements:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive weekly report
   */
  async generateReport(userId: number): Promise<LearningReport> {
    try {
      const pathwayMetrics = [];
      const allInsights: PathwayInsight[] = [];

      // Collect metrics from all pathways
      for (const pathway of learningPathways) {
        try {
          const data = await pathway.collectData();
          const insights = await pathway.analyzeInsights(data);
          allInsights.push(...insights);

          pathwayMetrics.push({
            pathwayId: pathway.id,
            pathwayName: pathway.name,
            dataCollected: data.dataPoints,
            insightsGenerated: insights.length,
            criticalIssues: insights.filter(i => i.severity === 'critical').length,
          });
        } catch (error) {
          console.error(`[Learning Coordinator] Error in pathway ${pathway.name}:`, error);
        }
      }

      // Get prioritized improvements
      const prioritizedImprovements = await this.prioritizeImprovements();

      // Calculate system health score
      const systemHealthScore = this.calculateSystemHealth(allInsights);

      const report: LearningReport = {
        reportDate: new Date(),
        pathwayMetrics,
        topInsights: allInsights
          .sort((a, b) => this.calculateImpactScore(b) - this.calculateImpactScore(a))
          .slice(0, 5),
        prioritizedImprovements,
        userSatisfactionTrend: this.calculateSatisfactionTrend(),
        systemHealthScore,
      };

      // Store report in knowledge base
      await db.insert(mrBlueKnowledgeBase).values({
        userId,
        category: 'learning_insight',
        title: `Weekly Learning Report - ${new Date().toISOString().split('T')[0]}`,
        content: JSON.stringify(report),
        tags: ['report', 'weekly', 'automated'],
      });

      return report;
    } catch (error) {
      console.error('[Learning Coordinator] Error generating report:', error);
      throw error;
    }
  }

  /**
   * Get status of all 10 pathways
   */
  async getPathwayStatus(): Promise<any[]> {
    const status = [];

    for (const pathway of learningPathways) {
      try {
        const data = await pathway.collectData();
        status.push({
          id: pathway.id,
          name: pathway.name,
          description: pathway.description,
          dataSource: pathway.dataSource,
          status: 'active',
          dataPoints: data.dataPoints,
          lastUpdated: new Date(),
        });
      } catch (error) {
        status.push({
          id: pathway.id,
          name: pathway.name,
          description: pathway.description,
          dataSource: pathway.dataSource,
          status: 'error',
          error: (error as Error).message,
        });
      }
    }

    return status;
  }

  // Helper methods
  private calculateImpactScore(insight: PathwayInsight): number {
    const severityWeight = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    return (
      severityWeight[insight.severity] * 
      insight.affectedUsers * 
      insight.confidence * 
      10
    );
  }

  private categorizeImprovementType(insight: PathwayInsight): 'bug' | 'feature' | 'ux' {
    const bugKeywords = ['bug', 'error', 'crash', 'broken', 'fail'];
    const featureKeywords = ['feature', 'add', 'new', 'enhancement'];
    
    const text = insight.insight.toLowerCase();
    
    if (bugKeywords.some(k => text.includes(k))) {
      return 'bug';
    } else if (featureKeywords.some(k => text.includes(k))) {
      return 'feature';
    }
    
    return 'ux';
  }

  private estimateEffort(insight: PathwayInsight): string {
    if (insight.severity === 'critical') return 'high';
    if (insight.severity === 'high') return 'medium';
    return 'low';
  }

  private calculateSystemHealth(insights: PathwayInsight[]): number {
    if (insights.length === 0) return 100;

    const criticalCount = insights.filter(i => i.severity === 'critical').length;
    const highCount = insights.filter(i => i.severity === 'high').length;
    const mediumCount = insights.filter(i => i.severity === 'medium').length;

    // Health score calculation (0-100)
    const score = 100 - (
      criticalCount * 20 +
      highCount * 10 +
      mediumCount * 5
    );

    return Math.max(0, Math.min(100, score));
  }

  private calculateSatisfactionTrend(): number {
    // Placeholder - would analyze feedback sentiment over time
    return 7.5; // out of 10
  }
}

export const learningCoordinator = new LearningCoordinator();

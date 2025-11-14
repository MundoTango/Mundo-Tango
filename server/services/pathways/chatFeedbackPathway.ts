import { db } from "@db";
import { mrBlueKnowledgeBase } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatFeedback {
  userId: number;
  message: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  isBug: boolean;
  bugDescription?: string;
  timestamp: Date;
}

export class ChatFeedbackPathway {
  private bugKeywords = ["bug", "broken", "not working", "error", "problem", "issue", "crash", "fail"];

  /**
   * Capture feedback from user chat messages
   */
  async captureFeedback(userId: number, message: string, sentiment: 'positive' | 'negative' | 'neutral'): Promise<void> {
    try {
      // Detect if message mentions a bug
      const bugDetection = await this.detectBugMentions(message);

      // Store in knowledge base
      await this.storeFeedback(userId, {
        message,
        sentiment,
        isBug: bugDetection.isBug,
        bugDescription: bugDetection.description,
      });

      console.log(`[Chat Feedback Pathway] Captured feedback from user ${userId}: ${sentiment}`);
    } catch (error) {
      console.error('[Chat Feedback Pathway] Error capturing feedback:', error);
      throw error;
    }
  }

  /**
   * Detect if a message mentions a bug using AI and keywords
   */
  async detectBugMentions(message: string): Promise<{isBug: boolean, description: string}> {
    try {
      // Quick keyword check first
      const lowerMessage = message.toLowerCase();
      const hasKeyword = this.bugKeywords.some(keyword => lowerMessage.includes(keyword));

      if (!hasKeyword) {
        return { isBug: false, description: '' };
      }

      // Use AI to analyze if it's really a bug report
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Analyze if this message is reporting a bug or technical issue. If yes, extract a concise description of the bug. If no, return 'Not a bug report'."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.3,
        max_tokens: 150,
      });

      const analysis = completion.choices[0]?.message?.content || '';
      const isBug = !analysis.toLowerCase().includes('not a bug');

      return {
        isBug,
        description: isBug ? analysis : ''
      };
    } catch (error) {
      console.error('[Chat Feedback Pathway] Error detecting bug mentions:', error);
      // Fallback to keyword-based detection
      const lowerMessage = message.toLowerCase();
      const isBug = this.bugKeywords.some(keyword => lowerMessage.includes(keyword));
      return { isBug, description: isBug ? message : '' };
    }
  }

  /**
   * Store feedback in the mrBlueKnowledgeBase
   */
  async storeFeedback(userId: number, feedback: any): Promise<void> {
    try {
      await db.insert(mrBlueKnowledgeBase).values({
        userId,
        category: 'user_feedback',
        title: feedback.isBug ? 'Bug Report via Chat' : 'User Feedback',
        content: JSON.stringify({
          message: feedback.message,
          sentiment: feedback.sentiment,
          isBug: feedback.isBug,
          bugDescription: feedback.bugDescription,
          timestamp: new Date(),
        }),
        tags: [
          feedback.sentiment,
          feedback.isBug ? 'bug' : 'feedback',
          'chat'
        ],
      });
    } catch (error) {
      console.error('[Chat Feedback Pathway] Error storing feedback:', error);
      throw error;
    }
  }

  /**
   * Analyze sentiment of recent chat messages
   */
  async analyzeSentiment(timeRange: { start: Date; end: Date }): Promise<{
    positive: number;
    negative: number;
    neutral: number;
  }> {
    try {
      const feedback = await db
        .select()
        .from(mrBlueKnowledgeBase)
        .where(
          and(
            eq(mrBlueKnowledgeBase.category, 'user_feedback'),
            gte(mrBlueKnowledgeBase.createdAt, timeRange.start)
          )
        );

      const sentimentCounts = {
        positive: 0,
        negative: 0,
        neutral: 0,
      };

      feedback.forEach(item => {
        try {
          const data = JSON.parse(item.content as string);
          if (data.sentiment) {
            sentimentCounts[data.sentiment as keyof typeof sentimentCounts]++;
          }
        } catch (e) {
          // Skip malformed content
        }
      });

      return sentimentCounts;
    } catch (error) {
      console.error('[Chat Feedback Pathway] Error analyzing sentiment:', error);
      throw error;
    }
  }

  /**
   * Get all bug reports from chat
   */
  async getBugReports(limit: number = 50): Promise<any[]> {
    try {
      const feedback = await db
        .select()
        .from(mrBlueKnowledgeBase)
        .where(eq(mrBlueKnowledgeBase.category, 'user_feedback'))
        .orderBy(desc(mrBlueKnowledgeBase.createdAt))
        .limit(limit);

      return feedback
        .map(item => {
          try {
            const data = JSON.parse(item.content as string);
            if (data.isBug) {
              return {
                userId: item.userId,
                message: data.message,
                description: data.bugDescription,
                timestamp: data.timestamp,
              };
            }
            return null;
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
    } catch (error) {
      console.error('[Chat Feedback Pathway] Error getting bug reports:', error);
      throw error;
    }
  }
}

export const chatFeedbackPathway = new ChatFeedbackPathway();

import { db } from "@db";
import {
  userTestingSessions,
  sessionInteractions,
  type SelectUserTestingSession,
  type SelectSessionInteraction,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

interface ConfusionSignal {
  detected: boolean;
  confidence: number;
  reason: string;
  timestamp: Date;
}

/**
 * Agent #164: Live Video Observer
 * 
 * Watches volunteer sessions in real-time via Daily.co and detects confusion/issues
 */
export class LiveObserverAgent {
  private anthropic: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY not set");
    }
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Start observing a session (returns room details for joining)
   */
  async startObserving(sessionId: number): Promise<{
    roomUrl: string;
    sessionData: SelectUserTestingSession;
  }> {
    try {
      const [session] = await db
        .select()
        .from(userTestingSessions)
        .where(eq(userTestingSessions.id, sessionId));

      if (!session) {
        throw new Error("Session not found");
      }

      if (!session.dailyRoomUrl) {
        throw new Error("Daily.co room not created for this session");
      }

      // Update session status to in_progress
      await db
        .update(userTestingSessions)
        .set({
          status: "in_progress",
          actualStartAt: new Date(),
        })
        .where(eq(userTestingSessions.id, sessionId));

      return {
        roomUrl: session.dailyRoomUrl,
        sessionData: session,
      };
    } catch (error) {
      console.error("Error starting observation:", error);
      throw error;
    }
  }

  /**
   * Capture screenshot at a specific timestamp
   * In production, this would integrate with Daily.co's screenshot API
   */
  async captureScreenshot(
    sessionId: number,
    timestamp: Date
  ): Promise<string> {
    try {
      // Placeholder - in production would use Daily.co screenshot API
      // or capture from video stream
      const screenshotUrl = `screenshots/session-${sessionId}-${timestamp.getTime()}.png`;
      
      console.log(`Screenshot captured for session ${sessionId} at ${timestamp}`);
      
      return screenshotUrl;
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      throw error;
    }
  }

  /**
   * Detect if user is confused based on interaction patterns
   */
  async detectConfusion(interactions: SelectSessionInteraction[]): Promise<ConfusionSignal> {
    try {
      if (interactions.length < 3) {
        return {
          detected: false,
          confidence: 0,
          reason: "Insufficient interaction data",
          timestamp: new Date(),
        };
      }

      // Sort by timestamp
      const sortedInteractions = [...interactions].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Check for confusion signals
      const lastThree = sortedInteractions.slice(-3);
      
      // Same element multiple times in short period
      const sameElementClicks = lastThree.filter(
        (i) => i.elementSelector === lastThree[0].elementSelector
      ).length;

      if (sameElementClicks >= 2) {
        return {
          detected: true,
          confidence: 0.8,
          reason: "Multiple clicks on same element",
          timestamp: new Date(),
        };
      }

      // Long pause (>30s) on same element
      const lastInteraction = sortedInteractions[sortedInteractions.length - 1];
      const secondLastInteraction = sortedInteractions[sortedInteractions.length - 2];
      
      if (lastInteraction && secondLastInteraction) {
        const timeDiff = new Date(lastInteraction.timestamp).getTime() - 
                        new Date(secondLastInteraction.timestamp).getTime();
        
        if (timeDiff > 30000) { // 30 seconds
          return {
            detected: true,
            confidence: 0.7,
            reason: "Long pause detected (>30s)",
            timestamp: new Date(),
          };
        }
      }

      // Rapid back-and-forth navigation
      const navigationTypes = lastThree.filter(
        (i) => i.interactionType === "navigation" || i.interactionType === "click"
      );

      if (navigationTypes.length === 3) {
        return {
          detected: true,
          confidence: 0.6,
          reason: "Rapid navigation pattern suggesting uncertainty",
          timestamp: new Date(),
        };
      }

      return {
        detected: false,
        confidence: 0,
        reason: "No confusion signals detected",
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error detecting confusion:", error);
      throw error;
    }
  }

  /**
   * Generate AI-powered session notes using Claude
   */
  async generateSessionNotes(sessionId: number): Promise<string> {
    try {
      // Get all interactions for this session
      const interactions = await db
        .select()
        .from(sessionInteractions)
        .where(eq(sessionInteractions.sessionId, sessionId))
        .orderBy(sessionInteractions.timestamp);

      if (interactions.length === 0) {
        return "No interactions recorded for this session.";
      }

      // Prepare interaction summary for Claude
      const interactionSummary = interactions
        .map((i, idx) => {
          return `${idx + 1}. [${new Date(i.timestamp).toISOString()}] ${i.interactionType} on "${i.elementText || i.elementSelector}" ${i.value ? `- Value: ${i.value}` : ""}`;
        })
        .join("\n");

      // Generate notes using Claude
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are a UX research expert analyzing a user testing session. Here are the interactions:

${interactionSummary}

Please provide:
1. A summary of what the user accomplished
2. Key observations about their behavior
3. Any notable confusion points or hesitations
4. Recommendations for improving the experience

Keep the analysis concise and actionable.`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === "text") {
        return content.text;
      }

      return "Unable to generate session notes";
    } catch (error) {
      console.error("Error generating session notes:", error);
      throw error;
    }
  }

  /**
   * Get session interactions
   */
  async getSessionInteractions(
    sessionId: number
  ): Promise<SelectSessionInteraction[]> {
    try {
      return await db
        .select()
        .from(sessionInteractions)
        .where(eq(sessionInteractions.sessionId, sessionId))
        .orderBy(sessionInteractions.timestamp);
    } catch (error) {
      console.error("Error getting session interactions:", error);
      return [];
    }
  }

  /**
   * End observation and finalize session
   */
  async endObservation(sessionId: number): Promise<void> {
    try {
      await db
        .update(userTestingSessions)
        .set({
          status: "completed",
          actualEndAt: new Date(),
        })
        .where(eq(userTestingSessions.id, sessionId));

      console.log(`Session ${sessionId} observation ended`);
    } catch (error) {
      console.error("Error ending observation:", error);
      throw error;
    }
  }
}

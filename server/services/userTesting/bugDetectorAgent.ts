import { db } from "@db";
import {
  sessionInteractions,
  sessionBugsFound,
  insertSessionBugFoundSchema,
  type SelectSessionInteraction,
  type InsertSessionBugFound,
  type SelectSessionBugFound,
} from "@shared/schema";
import { eq } from "drizzle-orm";

interface BugDetectionResult {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  reproSteps: string[];
  detectedAt: Date;
  interactionIds: number[];
}

/**
 * Agent #165: Auto Bug Detector
 * 
 * Automatically detects bugs from user interactions using heuristics
 */
export class BugDetectorAgent {
  /**
   * Analyze interactions and detect potential bugs
   */
  async analyzeInteractions(sessionId: number): Promise<BugDetectionResult[]> {
    try {
      const interactions = await db
        .select()
        .from(sessionInteractions)
        .where(eq(sessionInteractions.sessionId, sessionId))
        .orderBy(sessionInteractions.timestamp);

      if (interactions.length === 0) {
        return [];
      }

      const bugs: BugDetectionResult[] = [];

      // 1. Detect stuck points (>30s on same element)
      const stuckPoints = this.detectStuckPoints(interactions);
      bugs.push(...stuckPoints);

      // 2. Detect rage clicks (5+ clicks in 2s)
      const rageClicks = this.detectRageClicks(interactions);
      bugs.push(...rageClicks);

      // 3. Detect repeated hovers (confusion)
      const repeatedHovers = this.detectRepeatedHovers(interactions);
      bugs.push(...repeatedHovers);

      // 4. Detect error-click patterns
      const errorClicks = this.detectErrorClicks(interactions);
      bugs.push(...errorClicks);

      return bugs;
    } catch (error) {
      console.error("Error analyzing interactions:", error);
      throw error;
    }
  }

  /**
   * Detect when user is stuck (>30s on same element)
   */
  private detectStuckPoints(
    interactions: SelectSessionInteraction[]
  ): BugDetectionResult[] {
    const bugs: BugDetectionResult[] = [];
    
    for (let i = 0; i < interactions.length - 1; i++) {
      const current = interactions[i];
      const next = interactions[i + 1];
      
      const timeDiff = new Date(next.timestamp).getTime() - 
                      new Date(current.timestamp).getTime();
      
      // If >30s pause on same element
      if (timeDiff > 30000 && current.elementSelector === next.elementSelector) {
        bugs.push({
          title: "User Stuck Point Detected",
          description: `User spent ${Math.round(timeDiff / 1000)}s on element "${current.elementText || current.elementSelector}" without progressing`,
          severity: "medium",
          reproSteps: [
            `Navigate to element: ${current.elementSelector}`,
            `Observe: User paused for ${Math.round(timeDiff / 1000)} seconds`,
            "Expected: Clear next action should be available",
          ],
          detectedAt: new Date(next.timestamp),
          interactionIds: [current.id, next.id],
        });
      }
    }
    
    return bugs;
  }

  /**
   * Detect rage clicks (5+ rapid clicks)
   */
  private detectRageClicks(
    interactions: SelectSessionInteraction[]
  ): BugDetectionResult[] {
    const bugs: BugDetectionResult[] = [];
    const clickWindow = 2000; // 2 seconds
    
    for (let i = 0; i < interactions.length - 4; i++) {
      const clickGroup = interactions.slice(i, i + 5).filter(
        (int) => int.interactionType === "click"
      );
      
      if (clickGroup.length >= 5) {
        const firstClick = clickGroup[0];
        const lastClick = clickGroup[4];
        const timeDiff = new Date(lastClick.timestamp).getTime() - 
                        new Date(firstClick.timestamp).getTime();
        
        if (timeDiff <= clickWindow) {
          bugs.push({
            title: "Rage Click Detected",
            description: `User clicked "${firstClick.elementText || firstClick.elementSelector}" ${clickGroup.length} times in ${timeDiff}ms - possible unresponsive element`,
            severity: "high",
            reproSteps: [
              `Click element: ${firstClick.elementSelector}`,
              "Observe: Element may not respond immediately",
              "Expected: Element should provide immediate feedback",
            ],
            detectedAt: new Date(lastClick.timestamp),
            interactionIds: clickGroup.map((c) => c.id),
          });
        }
      }
    }
    
    return bugs;
  }

  /**
   * Detect repeated hovers indicating confusion
   */
  private detectRepeatedHovers(
    interactions: SelectSessionInteraction[]
  ): BugDetectionResult[] {
    const bugs: BugDetectionResult[] = [];
    const hoverWindow = 5000; // 5 seconds
    
    const hovers = interactions.filter((i) => i.interactionType === "hover");
    
    for (let i = 0; i < hovers.length - 2; i++) {
      const hoverGroup = hovers.slice(i, i + 3);
      const firstHover = hoverGroup[0];
      const lastHover = hoverGroup[2];
      
      const timeDiff = new Date(lastHover.timestamp).getTime() - 
                      new Date(firstHover.timestamp).getTime();
      
      // Same element hovered 3+ times in 5 seconds
      if (timeDiff <= hoverWindow) {
        const sameElement = hoverGroup.every(
          (h) => h.elementSelector === firstHover.elementSelector
        );
        
        if (sameElement) {
          bugs.push({
            title: "Confusion Pattern Detected",
            description: `User repeatedly hovered over "${firstHover.elementText || firstHover.elementSelector}" suggesting unclear purpose or affordance`,
            severity: "low",
            reproSteps: [
              `Locate element: ${firstHover.elementSelector}`,
              "Observe: Element purpose may not be clear",
              "Expected: Element should have clear visual affordance or tooltip",
            ],
            detectedAt: new Date(lastHover.timestamp),
            interactionIds: hoverGroup.map((h) => h.id),
          });
        }
      }
    }
    
    return bugs;
  }

  /**
   * Detect error-click patterns (click followed by error state)
   */
  private detectErrorClicks(
    interactions: SelectSessionInteraction[]
  ): BugDetectionResult[] {
    const bugs: BugDetectionResult[] = [];
    
    for (let i = 0; i < interactions.length - 1; i++) {
      const current = interactions[i];
      const next = interactions[i + 1];
      
      // If click followed by error-related interaction
      if (
        current.interactionType === "click" &&
        next.metadata &&
        typeof next.metadata === "object" &&
        "error" in next.metadata
      ) {
        bugs.push({
          title: "Error After Click Detected",
          description: `Clicking "${current.elementText || current.elementSelector}" resulted in an error`,
          severity: "critical",
          reproSteps: [
            `Click element: ${current.elementSelector}`,
            "Observe: Error occurs",
            "Expected: Action should complete successfully or show validation message",
          ],
          detectedAt: new Date(next.timestamp),
          interactionIds: [current.id, next.id],
        });
      }
    }
    
    return bugs;
  }

  /**
   * Check if stuck point detected
   */
  detectStuckPoint(interactions: SelectSessionInteraction[]): boolean {
    const stuckPoints = this.detectStuckPoints(interactions);
    return stuckPoints.length > 0;
  }

  /**
   * Extract reproduction steps from session
   */
  async extractReproSteps(sessionId: number): Promise<string[]> {
    try {
      const interactions = await db
        .select()
        .from(sessionInteractions)
        .where(eq(sessionInteractions.sessionId, sessionId))
        .orderBy(sessionInteractions.timestamp);

      return interactions.map((interaction, idx) => {
        const step = idx + 1;
        const action = interaction.interactionType;
        const target = interaction.elementText || interaction.elementSelector;
        const value = interaction.value ? ` with value "${interaction.value}"` : "";
        
        return `Step ${step}: ${action} on "${target}"${value}`;
      });
    } catch (error) {
      console.error("Error extracting repro steps:", error);
      return [];
    }
  }

  /**
   * Create bug report and save to database
   */
  async createBugReport(
    sessionId: number,
    bug: BugDetectionResult,
    volunteerId?: number
  ): Promise<number> {
    try {
      const bugData: InsertSessionBugFound = {
        sessionId,
        volunteerId,
        title: bug.title,
        description: bug.description,
        severity: bug.severity,
        status: "open",
        reproSteps: bug.reproSteps,
      };

      const [createdBug] = await db
        .insert(sessionBugsFound)
        .values(bugData)
        .returning();

      return createdBug.id;
    } catch (error) {
      console.error("Error creating bug report:", error);
      throw error;
    }
  }

  /**
   * Get all bugs for a session
   */
  async getSessionBugs(sessionId: number): Promise<SelectSessionBugFound[]> {
    try {
      return await db
        .select()
        .from(sessionBugsFound)
        .where(eq(sessionBugsFound.sessionId, sessionId));
    } catch (error) {
      console.error("Error getting session bugs:", error);
      return [];
    }
  }
}

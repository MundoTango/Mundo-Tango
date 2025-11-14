import { db } from "../../db";
import { autonomyProgress } from "@shared/schema";
import { eq, gte, lte, and } from "drizzle-orm";

export interface TimelineEntry {
  weekNumber: number;
  autonomyPercentage: number;
  capabilities: string[];
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isCompleted: boolean;
}

const AUTONOMY_TIMELINE = [
  {
    weekNumber: 0,
    weeks: [0, 2],
    autonomyPercentage: 10,
    capabilities: [
      "Basic chat responses",
      "Answer simple questions",
      "Provide documentation links",
      "Acknowledge user requests"
    ]
  },
  {
    weekNumber: 3,
    weeks: [3, 4],
    autonomyPercentage: 20,
    capabilities: [
      "Element selection understanding",
      "Identify UI components",
      "Recognize user intent",
      "Basic context awareness"
    ]
  },
  {
    weekNumber: 5,
    weeks: [5, 6],
    autonomyPercentage: 30,
    capabilities: [
      "Simple style changes",
      "Color modifications",
      "Font adjustments",
      "Spacing tweaks"
    ]
  },
  {
    weekNumber: 7,
    weeks: [7, 8],
    autonomyPercentage: 40,
    capabilities: [
      "Layout modifications",
      "Grid adjustments",
      "Flexbox changes",
      "Responsive design tweaks"
    ]
  },
  {
    weekNumber: 9,
    weeks: [9, 10],
    autonomyPercentage: 50,
    capabilities: [
      "Component creation",
      "Generate new UI elements",
      "Create functional components",
      "Implement basic interactions"
    ]
  },
  {
    weekNumber: 11,
    weeks: [11, 12],
    autonomyPercentage: 60,
    capabilities: [
      "Bug fix suggestions",
      "Identify code issues",
      "Propose solutions",
      "Test fixes independently"
    ]
  },
  {
    weekNumber: 13,
    weeks: [13, 14],
    autonomyPercentage: 70,
    capabilities: [
      "Multi-step workflows",
      "Chain multiple tasks",
      "Handle complex requests",
      "Manage state changes"
    ]
  },
  {
    weekNumber: 15,
    weeks: [15, 16],
    autonomyPercentage: 80,
    capabilities: [
      "Complex refactoring",
      "Restructure code",
      "Optimize performance",
      "Improve architecture"
    ]
  },
  {
    weekNumber: 17,
    weeks: [17, 18],
    autonomyPercentage: 90,
    capabilities: [
      "Full feature implementation",
      "Build complete features",
      "End-to-end development",
      "Integration testing"
    ]
  },
  {
    weekNumber: 19,
    weeks: [19, 20],
    autonomyPercentage: 95,
    capabilities: [
      "Architectural decisions",
      "System design choices",
      "Technology selection",
      "Strategic planning"
    ]
  }
];

const LAUNCH_DATE = new Date("2025-11-14");

export async function initializeAutonomyTimeline(): Promise<void> {
  for (const phase of AUTONOMY_TIMELINE) {
    const startDate = new Date(LAUNCH_DATE);
    startDate.setDate(startDate.getDate() + (phase.weeks[0] * 7));
    
    const endDate = new Date(LAUNCH_DATE);
    endDate.setDate(endDate.getDate() + (phase.weeks[1] * 7));

    const existing = await db
      .select()
      .from(autonomyProgress)
      .where(eq(autonomyProgress.weekNumber, phase.weekNumber))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(autonomyProgress).values({
        weekNumber: phase.weekNumber,
        autonomyPercentage: phase.autonomyPercentage,
        capabilities: phase.capabilities,
        startDate,
        endDate,
      });
    }
  }
}

export async function getCurrentAutonomyLevel(): Promise<number> {
  const now = new Date();
  
  const current = await db
    .select()
    .from(autonomyProgress)
    .where(
      and(
        lte(autonomyProgress.startDate, now),
        gte(autonomyProgress.endDate, now)
      )
    )
    .limit(1);

  if (current.length > 0) {
    return current[0].autonomyPercentage;
  }

  const latest = await db
    .select()
    .from(autonomyProgress)
    .where(lte(autonomyProgress.endDate, now))
    .orderBy(autonomyProgress.weekNumber)
    .limit(1);

  return latest[0]?.autonomyPercentage || 0;
}

export async function getAvailableCapabilities(autonomyLevel: number): Promise<string[]> {
  const phases = await db
    .select()
    .from(autonomyProgress)
    .where(lte(autonomyProgress.autonomyPercentage, autonomyLevel));

  const capabilities: string[] = [];
  for (const phase of phases) {
    capabilities.push(...phase.capabilities);
  }

  return capabilities;
}

export async function recordCapabilityUsage(
  capability: string,
  success: boolean
): Promise<void> {
  console.log(`Capability "${capability}" used with ${success ? "success" : "failure"}`);
}

export async function getProgressTimeline(): Promise<TimelineEntry[]> {
  const now = new Date();
  const allPhases = await db
    .select()
    .from(autonomyProgress)
    .orderBy(autonomyProgress.weekNumber);

  return allPhases.map(phase => ({
    weekNumber: phase.weekNumber,
    autonomyPercentage: phase.autonomyPercentage,
    capabilities: phase.capabilities,
    startDate: phase.startDate,
    endDate: phase.endDate,
    isCurrent: now >= phase.startDate && now <= phase.endDate,
    isCompleted: now > phase.endDate,
  }));
}

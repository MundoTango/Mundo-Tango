import { db } from "../../db";
import { 
  uiTestScenarios, 
  InsertUiTestScenario, 
  SelectUiTestScenario 
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export class TestScenarioService {
  async createScenario(scenario: InsertUiTestScenario): Promise<number> {
    if (scenario.estimatedMinutes <= 0) {
      throw new Error("Estimated minutes must be greater than 0");
    }

    if (!Array.isArray(scenario.steps)) {
      throw new Error("Steps must be a valid array");
    }

    const [result] = await db.insert(uiTestScenarios)
      .values(scenario)
      .returning({ id: uiTestScenarios.id });

    return result.id;
  }

  async getScenarioById(id: number): Promise<SelectUiTestScenario> {
    const [scenario] = await db.select()
      .from(uiTestScenarios)
      .where(eq(uiTestScenarios.id, id))
      .limit(1);

    if (!scenario) {
      throw new Error(`Scenario with id ${id} not found`);
    }

    return scenario;
  }

  async listActiveScenarios(): Promise<SelectUiTestScenario[]> {
    return await db.select()
      .from(uiTestScenarios)
      .where(eq(uiTestScenarios.isActive, true))
      .orderBy(uiTestScenarios.difficulty, uiTestScenarios.estimatedMinutes);
  }

  async updateScenario(id: number, updates: Partial<SelectUiTestScenario>): Promise<void> {
    if (updates.estimatedMinutes !== undefined && updates.estimatedMinutes <= 0) {
      throw new Error("Estimated minutes must be greater than 0");
    }

    if (updates.steps && !Array.isArray(updates.steps)) {
      throw new Error("Steps must be a valid array");
    }

    const result = await db.update(uiTestScenarios)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(uiTestScenarios.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Scenario with id ${id} not found`);
    }
  }

  async deactivateScenario(id: number): Promise<void> {
    const result = await db.update(uiTestScenarios)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(uiTestScenarios.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Scenario with id ${id} not found`);
    }
  }

  async seedDefaultScenarios(createdBy?: number): Promise<void> {
    const existingScenarios = await db.select()
      .from(uiTestScenarios)
      .limit(1);

    if (existingScenarios.length > 0) {
      return;
    }

    const defaultScenarios: InsertUiTestScenario[] = [
      {
        title: "Create a new tango event",
        description: "Test the event creation flow from start to finish",
        difficulty: "easy",
        estimatedMinutes: 10,
        steps: [
          { step: 1, action: "Navigate to events page" },
          { step: 2, action: "Click 'Create Event' button" },
          { step: 3, action: "Fill in event title and description" },
          { step: 4, action: "Select date and time" },
          { step: 5, action: "Add location information" },
          { step: 6, action: "Submit the event" }
        ],
        isActive: true,
        createdBy
      },
      {
        title: "Upload profile photo and edit bio",
        description: "Test profile editing and photo upload functionality",
        difficulty: "easy",
        estimatedMinutes: 5,
        steps: [
          { step: 1, action: "Go to profile page" },
          { step: 2, action: "Click on profile photo area" },
          { step: 3, action: "Upload a new photo" },
          { step: 4, action: "Edit bio text" },
          { step: 5, action: "Save changes" }
        ],
        isActive: true,
        createdBy
      },
      {
        title: "Join a group and post a message",
        description: "Test group discovery, joining, and posting",
        difficulty: "medium",
        estimatedMinutes: 15,
        steps: [
          { step: 1, action: "Navigate to groups page" },
          { step: 2, action: "Browse available groups" },
          { step: 3, action: "Click 'Join' on a group" },
          { step: 4, action: "Navigate to group feed" },
          { step: 5, action: "Click 'New Post' button" },
          { step: 6, action: "Write and submit a post" }
        ],
        isActive: true,
        createdBy
      },
      {
        title: "Find nearby milongas using map",
        description: "Test map-based event discovery features",
        difficulty: "medium",
        estimatedMinutes: 12,
        steps: [
          { step: 1, action: "Open events map view" },
          { step: 2, action: "Zoom to your location" },
          { step: 3, action: "Filter for milonga events" },
          { step: 4, action: "Click on a map marker" },
          { step: 5, action: "View event details" },
          { step: 6, action: "RSVP to an event" }
        ],
        isActive: true,
        createdBy
      },
      {
        title: "Upgrade to Plus tier subscription",
        description: "Test the premium subscription flow",
        difficulty: "hard",
        estimatedMinutes: 20,
        steps: [
          { step: 1, action: "Navigate to pricing page" },
          { step: 2, action: "Review Plus tier features" },
          { step: 3, action: "Click 'Upgrade to Plus' button" },
          { step: 4, action: "Enter payment information" },
          { step: 5, action: "Review subscription details" },
          { step: 6, action: "Complete payment" },
          { step: 7, action: "Verify premium features are unlocked" }
        ],
        isActive: true,
        createdBy
      }
    ];

    await db.insert(uiTestScenarios).values(defaultScenarios);
  }
}

export const testScenarioService = new TestScenarioService();

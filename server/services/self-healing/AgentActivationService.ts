/**
 * Agent Activation Service
 * MB.MD v9.0 - Self-Healing Page Agent System
 * November 18, 2025
 * 
 * Automatically spins up Page/Feature/Element agents when user navigates to a page
 * Target: <50ms activation time
 */

import { db } from '../../../shared/db';
import { agents, pageAgentRegistry } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

interface ActivationResult {
  pageAgent: any;
  featureAgents: any[];
  elementAgents: any[];
  totalAgents: number;
  activationTime: number;
}

export class AgentActivationService {
  /**
   * Spin up all agents for a page
   * MB.MD pattern: Work simultaneously (activate all agents in parallel)
   */
  static async spinUpPageAgents(pageId: string): Promise<ActivationResult> {
    const startTime = Date.now();

    try {
      // 1. Get page registration
      const [pageReg] = await db
        .select()
        .from(pageAgentRegistry)
        .where(eq(pageAgentRegistry.pageId, pageId));

      if (!pageReg) {
        throw new Error(`Page registration not found for: ${pageId}`);
      }

      // 2. Get Page Agent
      const [pageAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, pageReg.pageAgentId));

      if (!pageAgent) {
        throw new Error(`Page agent not found: ${pageReg.pageAgentId}`);
      }

      // 3. Get Feature Agents (parallel)
      const featureAgentIds = (pageReg.featureAgentIds as string[]) || [];
      const featureAgentsPromises = featureAgentIds.map(id =>
        db.select().from(agents).where(eq(agents.id, id))
      );
      const featureAgentsResults = await Promise.all(featureAgentsPromises);
      const featureAgents = featureAgentsResults.map(r => r[0]).filter(Boolean);

      // 4. Get Element Agents (parallel)
      const elementAgentIds = (pageReg.elementAgentIds as string[]) || [];
      const elementAgentsPromises = elementAgentIds.map(id =>
        db.select().from(agents).where(eq(agents.id, id))
      );
      const elementAgentsResults = await Promise.all(elementAgentsPromises);
      const elementAgents = elementAgentsResults.map(r => r[0]).filter(Boolean);

      // 5. Activate all agents (parallel)
      await Promise.all([
        this.activateAgent(pageAgent.id),
        ...featureAgents.map(a => this.activateAgent(a.id)),
        ...elementAgents.map(a => this.activateAgent(a.id))
      ]);

      // 6. Update activation timestamp
      await db
        .update(pageAgentRegistry)
        .set({ activatedAt: new Date() })
        .where(eq(pageAgentRegistry.pageId, pageId));

      const activationTime = Date.now() - startTime;

      console.log(`✅ Activated ${1 + featureAgents.length + elementAgents.length} agents for ${pageId} in ${activationTime}ms`);

      return {
        pageAgent,
        featureAgents,
        elementAgents,
        totalAgents: 1 + featureAgents.length + elementAgents.length,
        activationTime
      };
    } catch (error) {
      console.error(`❌ Failed to activate agents for ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Activate a single agent
   */
  private static async activateAgent(agentId: string): Promise<void> {
    await db
      .update(agents)
      .set({ 
        status: 'active',
        lastActive: new Date()
      })
      .where(eq(agents.id, agentId));
  }

  /**
   * Get pages that current page navigates to
   * Updated from "next 5 pages" to "all pages that x page navigates to"
   */
  static async getPagesNavigatesTo(pageId: string): Promise<string[]> {
    const [pageReg] = await db
      .select()
      .from(pageAgentRegistry)
      .where(eq(pageAgentRegistry.pageId, pageId));

    return (pageReg?.navigatesTo as string[]) || [];
  }

  /**
   * Register a new page with agents
   */
  static async registerPage(
    pageId: string,
    pageName: string,
    route: string,
    pageAgentId: string,
    featureAgentIds: string[] = [],
    elementAgentIds: string[] = [],
    navigatesTo: string[] = []
  ): Promise<void> {
    await db.insert(pageAgentRegistry).values({
      pageId,
      pageName,
      route,
      pageAgentId,
      featureAgentIds,
      elementAgentIds,
      navigatesTo,
    });

    console.log(`✅ Registered page: ${pageId} with ${1 + featureAgentIds.length + elementAgentIds.length} agents`);
  }
}

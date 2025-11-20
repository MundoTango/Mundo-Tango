import type { AgentCard } from '@shared/types/a2a';
import { db } from '../../db';
import { agentCards } from '../../../shared/schema';

export class AgentCardRegistry {
  private cards = new Map<string, AgentCard>();
  private initialized = false;

  /**
   * Initialize registry - load from database
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const dbCards = await db.select().from(agentCards);
      for (const card of dbCards) {
        this.cards.set(card.agentId!, {
          id: card.agentId!,
          name: card.name!,
          description: card.description!,
          capabilities: card.capabilities as string[],
          inputSchema: card.inputSchema as Record<string, any>,
          outputSchema: card.outputSchema as Record<string, any>,
          methods: card.methods as any[],
          a2aEndpoint: card.a2aEndpoint!,
          version: '1.0.0'
        });
      }
      this.initialized = true;
      console.log(`[AgentCardRegistry] Initialized with ${this.cards.size} agents`);
    } catch (error) {
      console.error('[AgentCardRegistry] Failed to initialize:', error);
      // Continue with empty registry - agents can still register at runtime
      this.initialized = true;
    }
  }

  /**
   * Register agent card
   */
  async registerAgent(card: AgentCard): Promise<void> {
    this.cards.set(card.id, card);

    try {
      // Persist to database
      await db.insert(agentCards).values({
        agentId: card.id,
        name: card.name,
        description: card.description,
        capabilities: card.capabilities as any,
        inputSchema: card.inputSchema as any,
        outputSchema: card.outputSchema as any,
        methods: card.methods as any,
        a2aEndpoint: card.a2aEndpoint
      }).onConflictDoUpdate({
        target: agentCards.agentId,
        set: {
          name: card.name,
          description: card.description,
          capabilities: card.capabilities as any,
          inputSchema: card.inputSchema as any,
          outputSchema: card.outputSchema as any,
          methods: card.methods as any,
          a2aEndpoint: card.a2aEndpoint
        }
      });

      console.log(`[AgentCardRegistry] Registered agent: ${card.name} (${card.id})`);
    } catch (error) {
      console.error(`[AgentCardRegistry] Failed to register ${card.id}:`, error);
    }
  }

  /**
   * Get agent card by ID
   */
  getAgentCard(agentId: string): AgentCard | undefined {
    return this.cards.get(agentId);
  }

  /**
   * Get all agent cards
   */
  getAllAgents(): AgentCard[] {
    return Array.from(this.cards.values());
  }

  /**
   * Discover agents by capability
   */
  discoverAgentsByCapability(capability: string): AgentCard[] {
    return Array.from(this.cards.values()).filter(card =>
      card.capabilities.includes(capability)
    );
  }

  /**
   * Discover agents by method support
   */
  discoverAgentsByMethod(
    method: 'message/send' | 'message/stream' | 'tasks/pushNotificationConfig/set'
  ): AgentCard[] {
    return Array.from(this.cards.values()).filter(card => card.methods.includes(method));
  }

  /**
   * Search agents by name or description
   */
  searchAgents(query: string): AgentCard[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.cards.values()).filter(
      card =>
        card.name.toLowerCase().includes(lowerQuery) ||
        card.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get agent count
   */
  getAgentCount(): number {
    return this.cards.size;
  }
}

export const agentCardRegistry = new AgentCardRegistry();

// Initialize on module load
agentCardRegistry.initialize().catch(console.error);

// Register core agents
const registerCoreAgents = async () => {
  await agentCardRegistry.registerAgent({
    id: 'vibe-coding',
    name: 'Vibe Coding Agent',
    description: 'Natural language to code generation with streaming',
    capabilities: ['code-generation', 'vibe-coding', 'streaming'],
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string' },
        mode: { type: 'string', enum: ['text', 'voice', 'visual'] }
      },
      required: ['prompt']
    },
    outputSchema: {
      type: 'object',
      properties: {
        files: { type: 'array' },
        changes: { type: 'array' }
      }
    },
    methods: ['message/send', 'message/stream'],
    a2aEndpoint: '/api/v1/a2a/vibe-coding',
    version: '1.0.0'
  });

  await agentCardRegistry.registerAgent({
    id: 'error-analysis',
    name: 'Error Analysis Agent',
    description: 'Analyzes errors and suggests fixes based on learned patterns',
    capabilities: ['error-analysis', 'learning', 'troubleshooting'],
    inputSchema: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        context: { type: 'object' }
      },
      required: ['error']
    },
    outputSchema: {
      type: 'object',
      properties: {
        analysis: { type: 'string' },
        suggestedFix: { type: 'string' },
        confidence: { type: 'number' }
      }
    },
    methods: ['message/send'],
    a2aEndpoint: '/api/v1/a2a/error-analysis',
    version: '1.0.0'
  });

  console.log('[AgentCardRegistry] Registered core agents');
};

registerCoreAgents().catch(console.error);

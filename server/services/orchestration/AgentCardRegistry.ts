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

  // Orchestration System Agents (6 agents)
  const orchestrationAgents = ['workflow', 'coordinator', 'scheduler', 'priority', 'dependency', 'optimizer'];
  for (const agent of orchestrationAgents) {
    await agentCardRegistry.registerAgent({
      id: `orchestration-${agent}`,
      name: `Orchestration ${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent`,
      description: `Handles workflow ${agent} with GROQ AI-powered orchestration logic`,
      capabilities: ['orchestration', agent, 'workflow', 'ai-powered'],
      inputSchema: { type: 'object', properties: { message: { type: 'string' }, context: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { plan: { type: 'string' }, tasks: { type: 'array' } } },
      methods: ['message/send'],
      a2aEndpoint: `/api/v1/a2a/orchestration-${agent}`,
      version: '1.0.0'
    });
  }

  // Self-Healing System Agents (5 agents)
  const healingAgents = ['monitor', 'remediation', 'diagnostics', 'prevention', 'recovery'];
  for (const agent of healingAgents) {
    await agentCardRegistry.registerAgent({
      id: `self-healing-${agent}`,
      name: `Self-Healing ${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent`,
      description: `System health ${agent} with GROQ AI-powered analysis`,
      capabilities: ['self-healing', agent, 'system-health', 'ai-powered'],
      inputSchema: { type: 'object', properties: { message: { type: 'string' }, context: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { analysis: { type: 'string' }, recommendations: { type: 'array' } } },
      methods: ['message/send'],
      a2aEndpoint: `/api/v1/a2a/self-healing-${agent}`,
      version: '1.0.0'
    });
  }

  // AI Arbitrage System Agents (5 agents)
  const aiAgents = ['optimizer', 'selector', 'cost-analyzer', 'performance', 'fallback'];
  for (const agent of aiAgents) {
    await agentCardRegistry.registerAgent({
      id: `ai-${agent}`,
      name: `AI ${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent`,
      description: `AI model ${agent} with GROQ-powered optimization`,
      capabilities: ['ai-arbitrage', agent, 'model-selection', 'ai-powered'],
      inputSchema: { type: 'object', properties: { message: { type: 'string' }, context: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { recommendation: { type: 'string' }, rationale: { type: 'string' } } },
      methods: ['message/send'],
      a2aEndpoint: `/api/v1/a2a/ai-${agent}`,
      version: '1.0.0'
    });
  }

  // User Testing System Agents (4 agents)
  const testingAgents = ['behavior', 'analytics', 'ab-testing', 'feedback'];
  for (const agent of testingAgents) {
    await agentCardRegistry.registerAgent({
      id: `user-testing-${agent}`,
      name: `User Testing ${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent`,
      description: `User ${agent} analysis with GROQ AI`,
      capabilities: ['user-testing', agent, 'ux-analysis', 'ai-powered'],
      inputSchema: { type: 'object', properties: { message: { type: 'string' }, context: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { insights: { type: 'string' }, recommendations: { type: 'array' } } },
      methods: ['message/send'],
      a2aEndpoint: `/api/v1/a2a/user-testing-${agent}`,
      version: '1.0.0'
    });
  }

  // Knowledge System Agents (4 agents) - Integrated with LanceDB
  const knowledgeAgents = ['retrieval', 'search', 'semantic', 'context'];
  for (const agent of knowledgeAgents) {
    await agentCardRegistry.registerAgent({
      id: `knowledge-${agent}`,
      name: `Knowledge ${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent`,
      description: `Semantic ${agent} with LanceDB RAG and GROQ AI`,
      capabilities: ['knowledge', agent, 'rag', 'lancedb', 'ai-powered'],
      inputSchema: { type: 'object', properties: { message: { type: 'string' }, context: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { answer: { type: 'string' }, sources: { type: 'array' } } },
      methods: ['message/send'],
      a2aEndpoint: `/api/v1/a2a/knowledge-${agent}`,
      version: '1.0.0'
    });
  }

  // Clarification System Agents (2 agents)
  const clarificationAgents = ['questions', 'disambiguator'];
  for (const agent of clarificationAgents) {
    await agentCardRegistry.registerAgent({
      id: `clarification-${agent}`,
      name: `Clarification ${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent`,
      description: `Generates clarifying ${agent} with GROQ AI`,
      capabilities: ['clarification', agent, 'ai-powered'],
      inputSchema: { type: 'object', properties: { message: { type: 'string' }, context: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { questions: { type: 'array' } } },
      methods: ['message/send'],
      a2aEndpoint: `/api/v1/a2a/clarification-${agent}`,
      version: '1.0.0'
    });
  }

  // Validation System Agents (2 agents)
  const validationAgents = ['code-quality', 'security'];
  for (const agent of validationAgents) {
    await agentCardRegistry.registerAgent({
      id: `validation-${agent}`,
      name: `Validation ${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent`,
      description: `${agent} validation with GROQ AI`,
      capabilities: ['validation', agent, 'ai-powered'],
      inputSchema: { type: 'object', properties: { message: { type: 'string' }, context: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { issues: { type: 'array' }, recommendations: { type: 'array' } } },
      methods: ['message/send'],
      a2aEndpoint: `/api/v1/a2a/validation-${agent}`,
      version: '1.0.0'
    });
  }

  // Deployment System Agents (2 agents)
  const deploymentAgents = ['readiness', 'checklist'];
  for (const agent of deploymentAgents) {
    await agentCardRegistry.registerAgent({
      id: `deployment-${agent}`,
      name: `Deployment ${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent`,
      description: `Deployment ${agent} checks with GROQ AI`,
      capabilities: ['deployment', agent, 'ai-powered'],
      inputSchema: { type: 'object', properties: { message: { type: 'string' }, context: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { status: { type: 'string' }, checklist: { type: 'array' } } },
      methods: ['message/send'],
      a2aEndpoint: `/api/v1/a2a/deployment-${agent}`,
      version: '1.0.0'
    });
  }

  console.log('[AgentCardRegistry] Registered core agents + 30 AI-powered agents');
};

registerCoreAgents().catch(console.error);

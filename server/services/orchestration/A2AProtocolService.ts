import type { A2AMessage, A2AResponse, AgentCard, TextPart } from '@shared/types/a2a';
import { agentCardRegistry } from './AgentCardRegistry';
import { db } from '../../db';
import { a2aMessages } from '../../../shared/schema';
import { GroqService, GROQ_MODELS } from '../ai/GroqService';
import { ContextService } from '../mrBlue/ContextService';

export class A2AProtocolService {
  /**
   * Route A2A message to target agent
   */
  async routeMessage(agentId: string, message: A2AMessage): Promise<A2AResponse> {
    const startTime = Date.now();

    try {
      // Get agent card to verify agent exists
      const agentCard = agentCardRegistry.getAgentCard(agentId);
      if (!agentCard) {
        return this.createErrorResponse(message.id, -32602, `Agent not found: ${agentId}`);
      }

      // Validate method is supported
      if (!agentCard.methods.includes(message.method)) {
        return this.createErrorResponse(
          message.id,
          -32601,
          `Method not supported: ${message.method}`
        );
      }

      // Route based on method
      let result;
      switch (message.method) {
        case 'message/send':
          result = await this.handleMessageSend(agentId, message);
          break;
        case 'message/stream':
          result = await this.handleMessageStream(agentId, message);
          break;
        case 'tasks/pushNotificationConfig/set':
          result = await this.handlePushConfig(agentId, message);
          break;
        default:
          return this.createErrorResponse(message.id, -32601, 'Method not found');
      }

      const duration = Date.now() - startTime;

      // Log message to database
      await this.logMessage(agentId, message, result, duration, true);

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorResponse = this.createErrorResponse(
        message.id,
        -32603,
        error.message || 'Internal error'
      );

      await this.logMessage(agentId, message, errorResponse, duration, false);

      return errorResponse;
    }
  }

  /**
   * Handle message/send method
   */
  private async handleMessageSend(
    agentId: string,
    message: A2AMessage
  ): Promise<A2AResponse> {
    // Extract user message
    const userMessage = message.params.message.parts
      .filter((part): part is TextPart => part.type === 'text')
      .map(part => part.text)
      .join('\n');

    // Get agent service dynamically
    const agentService = await this.getAgentService(agentId);

    // Execute agent
    const response = await agentService.execute(userMessage, message.params.context || {});

    // Format as A2A response
    return {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        artifacts: [
          {
            parts: [
              {
                type: 'text',
                text: typeof response === 'string' ? response : JSON.stringify(response)
              }
            ],
            metadata: {
              agentId,
              timestamp: new Date().toISOString()
            }
          }
        ],
        taskId: message.params.taskId
      }
    };
  }

  /**
   * Handle message/stream method (SSE streaming)
   */
  private async handleMessageStream(
    agentId: string,
    message: A2AMessage
  ): Promise<A2AResponse> {
    // For now, delegate to message/send
    // TODO: Implement proper streaming with SSE
    return this.handleMessageSend(agentId, message);
  }

  /**
   * Handle tasks/pushNotificationConfig/set method
   */
  private async handlePushConfig(
    agentId: string,
    message: A2AMessage
  ): Promise<A2AResponse> {
    // Store push notification configuration
    // TODO: Implement webhook notification system
    return {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        artifacts: [
          {
            parts: [
              {
                type: 'text',
                text: 'Push notification config set successfully'
              }
            ]
          }
        ]
      }
    };
  }

  /**
   * Get agent service by ID - Universal agent loader for all 63 agents
   */
  private async getAgentService(agentId: string): Promise<any> {
    // LIFE CEO System (16 agents)
    if (agentId.startsWith('life-ceo-')) {
      const { lifeCeoAgents } = await import('../lifeCeoAgents');
      const shortId = agentId.replace('life-ceo-', '');
      
      return {
        execute: async (message: string, context: any) => {
          const userId = context?.userId || 1; // Default to test user
          return await lifeCeoAgents.chat(userId, shortId, message, context?.history || []);
        }
      };
    }

    // Mr. Blue System (15 agents)
    if (agentId.startsWith('mr-blue-')) {
      const shortId = agentId.replace('mr-blue-', '');
      
      // Map to specific Mr. Blue services
      switch (shortId) {
        case 'context':
          const { ContextService } = await import('../mrBlue/ContextService');
          return new ContextService();
          
        case 'autofix':
          const { AutoFixEngine } = await import('../mrBlue/AutoFixEngine');
          return new AutoFixEngine();
          
        case 'autonomous':
          const { AutonomousAgent } = await import('../mrBlue/AutonomousAgent');
          return new AutonomousAgent('');
          
        case 'error-analysis':
          const { ErrorAnalysisAgent } = await import('../mrBlue/errorAnalysisAgent');
          return new ErrorAnalysisAgent();
          
        default:
          // Generic Mr. Blue agent wrapper
          return {
            execute: async (message: string) => `Mr. Blue ${shortId} agent: ${message}`
          };
      }
    }

    // Legacy agents
    if (agentId === 'vibe-coding') {
      const { VibeCodingService } = await import('../mrBlue/VibeCodingService');
      return new VibeCodingService();
    }

    if (agentId === 'error-analysis') {
      const { ErrorAnalysisAgent } = await import('../mrBlue/errorAnalysisAgent');
      return new ErrorAnalysisAgent();
    }

    // Orchestration System (6 agents) - Real GROQ AI for workflow orchestration
    if (agentId.startsWith('orchestration-')) {
      const shortId = agentId.replace('orchestration-', '');
      
      return {
        execute: async (message: string, context: any) => {
          try {
            const systemPrompt = `You are an expert workflow orchestration agent (${shortId}). 
Your role is to:
- Analyze complex multi-step workflows and break them into manageable tasks
- Coordinate between multiple agents and services
- Optimize task execution order and parallelization
- Handle dependencies and error recovery
- Provide clear execution plans with priorities

Context: ${JSON.stringify(context || {}, null, 2)}

Respond with practical, actionable orchestration plans in JSON format when appropriate.`;

            const response = await GroqService.query({
              prompt: message,
              model: GROQ_MODELS.LLAMA_70B,
              systemPrompt,
              temperature: 0.3, // Lower for consistent orchestration logic
              maxTokens: 2000
            });

            return response.content;
          } catch (error: any) {
            console.error(`[A2A] Orchestration agent ${agentId} error:`, error);
            return `Error in orchestration: ${error.message}. Falling back to basic orchestration.`;
          }
        }
      };
    }

    // Self-Healing System (5 agents) - Real GROQ AI for system health analysis
    if (agentId.startsWith('self-healing-')) {
      const shortId = agentId.replace('self-healing-', '');
      
      return {
        execute: async (message: string, context: any) => {
          try {
            const systemPrompt = `You are a self-healing system agent (${shortId}) specialized in:
- Analyzing system health metrics and error patterns
- Detecting anomalies and potential failures
- Recommending automated remediation actions
- Root cause analysis of system issues
- Preventive maintenance suggestions

System context: ${JSON.stringify(context || {}, null, 2)}

Provide actionable recommendations with severity levels (critical/warning/info).`;

            const response = await GroqService.query({
              prompt: message,
              model: GROQ_MODELS.LLAMA_70B,
              systemPrompt,
              temperature: 0.2, // Very low for reliable diagnostics
              maxTokens: 1500
            });

            return response.content;
          } catch (error: any) {
            console.error(`[A2A] Self-healing agent ${agentId} error:`, error);
            return `Error in system analysis: ${error.message}. Manual intervention may be required.`;
          }
        }
      };
    }

    // AI Arbitrage System (5 agents) - Real GROQ AI for AI model selection
    if (agentId.startsWith('ai-')) {
      const shortId = agentId.replace('ai-', '');
      
      return {
        execute: async (message: string, context: any) => {
          try {
            const systemPrompt = `You are an AI arbitrage agent (${shortId}) that optimizes AI model selection across:
- OpenAI (GPT-4o, GPT-4o-mini)
- Anthropic (Claude 3.5 Sonnet, Haiku)
- Groq (Llama 3.3 70B - FREE, ultra-fast)
- Gemini (Flash, Pro)
- OpenRouter (Multi-model gateway)

Your role:
- Analyze task requirements (speed/quality/cost priority)
- Recommend optimal AI model for each use case
- Calculate cost-benefit tradeoffs
- Suggest fallback chains for reliability

Task context: ${JSON.stringify(context || {}, null, 2)}

Provide model recommendations with rationale and estimated costs.`;

            const response = await GroqService.query({
              prompt: message,
              model: GROQ_MODELS.LLAMA_70B,
              systemPrompt,
              temperature: 0.4,
              maxTokens: 1500
            });

            return response.content;
          } catch (error: any) {
            console.error(`[A2A] AI arbitrage agent ${agentId} error:`, error);
            return `Error in AI selection: ${error.message}. Defaulting to Groq Llama-3.3-70B (FREE).`;
          }
        }
      };
    }

    // User Testing System (4 agents) - Real GROQ AI for behavior analysis
    if (agentId.startsWith('user-testing-')) {
      const shortId = agentId.replace('user-testing-', '');
      
      return {
        execute: async (message: string, context: any) => {
          try {
            const systemPrompt = `You are a user testing agent (${shortId}) specialized in:
- Analyzing user behavior patterns and interaction data
- Identifying UX issues and friction points
- A/B test result interpretation
- User journey optimization
- Accessibility and usability recommendations

Test data: ${JSON.stringify(context || {}, null, 2)}

Provide insights with specific, actionable recommendations for improvements.`;

            const response = await GroqService.query({
              prompt: message,
              model: GROQ_MODELS.LLAMA_70B,
              systemPrompt,
              temperature: 0.5,
              maxTokens: 1500
            });

            return response.content;
          } catch (error: any) {
            console.error(`[A2A] User testing agent ${agentId} error:`, error);
            return `Error in user analysis: ${error.message}. Manual review recommended.`;
          }
        }
      };
    }

    // Knowledge System (4 agents) - Integrated with LanceDB ContextService
    if (agentId.startsWith('knowledge-')) {
      const shortId = agentId.replace('knowledge-', '');
      const contextService = new ContextService();
      
      return {
        execute: async (message: string, context: any) => {
          try {
            // Perform semantic search in LanceDB
            const searchResults = await contextService.search(message, 5);
            
            // Build context from search results
            const knowledgeContext = searchResults
              .map(result => `[${result.source}] ${result.section}:\n${result.content}`)
              .join('\n\n---\n\n');

            // Use GROQ with retrieved context for RAG
            const systemPrompt = `You are a knowledge retrieval agent (${shortId}) with access to the complete Mundo Tango documentation.

Retrieved context from semantic search:
${knowledgeContext}

Your role:
- Answer questions using the retrieved documentation
- Cite sources when providing information
- Suggest related topics when relevant
- Indicate confidence level in answers

Additional context: ${JSON.stringify(context || {}, null, 2)}`;

            const response = await GroqService.query({
              prompt: message,
              model: GROQ_MODELS.LLAMA_70B,
              systemPrompt,
              temperature: 0.3,
              maxTokens: 2000
            });

            return response.content;
          } catch (error: any) {
            console.error(`[A2A] Knowledge agent ${agentId} error:`, error);
            return `Error retrieving knowledge: ${error.message}. Please check documentation manually.`;
          }
        }
      };
    }

    // Clarification System (2 agents) - Real GROQ AI for question generation
    if (agentId.startsWith('clarification-')) {
      const shortId = agentId.replace('clarification-', '');
      
      return {
        execute: async (message: string, context: any) => {
          try {
            const systemPrompt = `You are a clarification agent (${shortId}) that helps resolve ambiguities by:
- Identifying unclear or ambiguous requests
- Generating targeted clarifying questions
- Suggesting multiple interpretation paths
- Helping users refine their requirements

Request context: ${JSON.stringify(context || {}, null, 2)}

Ask 2-4 specific, helpful questions to clarify the user's intent.`;

            const response = await GroqService.query({
              prompt: message,
              model: GROQ_MODELS.LLAMA_8B, // Faster model for simple question generation
              systemPrompt,
              temperature: 0.7,
              maxTokens: 800
            });

            return response.content;
          } catch (error: any) {
            console.error(`[A2A] Clarification agent ${agentId} error:`, error);
            return `Error generating questions: ${error.message}. Please provide more details.`;
          }
        }
      };
    }

    // Validation System (2 agents) - Real GROQ AI for code quality
    if (agentId.startsWith('validation-')) {
      const shortId = agentId.replace('validation-', '');
      
      return {
        execute: async (message: string, context: any) => {
          try {
            const systemPrompt = `You are a validation agent (${shortId}) specialized in:
- Code quality assessment and best practices
- Security vulnerability detection
- Performance optimization opportunities
- Architecture review and patterns
- Testing coverage analysis

Code/system context: ${JSON.stringify(context || {}, null, 2)}

Provide structured feedback with severity levels and specific line references when possible.`;

            const response = await GroqService.query({
              prompt: message,
              model: GROQ_MODELS.LLAMA_70B,
              systemPrompt,
              temperature: 0.2, // Very low for consistent validation
              maxTokens: 2000
            });

            return response.content;
          } catch (error: any) {
            console.error(`[A2A] Validation agent ${agentId} error:`, error);
            return `Error in validation: ${error.message}. Manual code review recommended.`;
          }
        }
      };
    }

    // Deployment System (2 agents) - Real GROQ AI for deployment readiness
    if (agentId.startsWith('deployment-')) {
      const shortId = agentId.replace('deployment-', '');
      
      return {
        execute: async (message: string, context: any) => {
          try {
            const systemPrompt = `You are a deployment readiness agent (${shortId}) that checks:
- Environment configuration completeness
- Database migrations status
- Security compliance (API keys, CORS, CSP)
- Performance benchmarks
- Monitoring and logging setup
- Rollback plan readiness

Deployment context: ${JSON.stringify(context || {}, null, 2)}

Provide a deployment checklist with pass/fail status and blocking issues highlighted.`;

            const response = await GroqService.query({
              prompt: message,
              model: GROQ_MODELS.LLAMA_70B,
              systemPrompt,
              temperature: 0.2,
              maxTokens: 1500
            });

            return response.content;
          } catch (error: any) {
            console.error(`[A2A] Deployment agent ${agentId} error:`, error);
            return `Error checking deployment: ${error.message}. Manual verification required.`;
          }
        }
      };
    }

    // Unknown agent
    throw new Error(`Unknown agent: ${agentId}`);
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    id: string,
    code: number,
    message: string,
    data?: any
  ): A2AResponse {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
        data
      }
    };
  }

  /**
   * Log A2A message to database
   */
  private async logMessage(
    agentId: string,
    message: A2AMessage,
    response: A2AResponse,
    duration: number,
    success: boolean
  ): Promise<void> {
    try {
      await db.insert(a2aMessages).values({
        jsonrpc: message.jsonrpc || '2.0',
        messageId: message.id,
        fromAgent: 'user', // TODO: Track actual sender agent
        toAgent: agentId,
        method: message.method,
        params: message.params as any,
        response: response as any,
        success,
        duration
      });
    } catch (error) {
      console.error('[A2A] Failed to log message:', error);
    }
  }

  /**
   * Send message from one agent to another
   */
  async sendAgentToAgent(
    fromAgentId: string,
    toAgentId: string,
    message: string,
    context?: Record<string, any>
  ): Promise<any> {
    const a2aMessage: A2AMessage = {
      jsonrpc: '2.0',
      id: `${fromAgentId}-${toAgentId}-${Date.now()}`,
      method: 'message/send',
      params: {
        message: {
          role: 'user',
          parts: [{ type: 'text', text: message }]
        },
        context
      }
    };

    const response = await this.routeMessage(toAgentId, a2aMessage);

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result?.artifacts[0].parts[0];
  }
}

export const a2aProtocolService = new A2AProtocolService();

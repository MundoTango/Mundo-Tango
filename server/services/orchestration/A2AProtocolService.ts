import type { A2AMessage, A2AResponse, AgentCard, TextPart } from '@shared/types/a2a';
import { agentCardRegistry } from './AgentCardRegistry';
import { db } from '../../db';
import { a2aMessages } from '../../../shared/schema';

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
   * Get agent service by ID
   */
  private async getAgentService(agentId: string): Promise<any> {
    // Dynamic agent resolution based on ID
    switch (agentId) {
      case 'vibe-coding':
        const { VibeCodingService } = await import('../mrBlue/VibeCodingService');
        return new VibeCodingService();

      case 'error-analysis':
        const { ErrorAnalysisAgent } = await import('../mrBlue/errorAnalysisAgent');
        return new ErrorAnalysisAgent();

      case 'quality-validator':
        // Will be implemented in Priority 3
        return {
          execute: async (message: string) => 'Quality validator not yet implemented'
        };

      case 'knowledge-base':
        // Will be implemented in Priority 2
        return {
          execute: async (message: string) => 'Knowledge base agent not yet implemented'
        };

      default:
        throw new Error(`Unknown agent: ${agentId}`);
    }
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

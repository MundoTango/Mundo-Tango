import WebSocket from 'ws';
import { Server } from 'http';
import type { WorkflowStep } from '@shared/types/a2a';
import { workflowOrchestrator } from '../orchestration/WorkflowOrchestrator';

export interface WebSocketMessage {
  type: 'request' | 'response' | 'stream' | 'error' | 'interrupt';
  id: string;
  data: any;
}

export class WebSocketService {
  private wss: WebSocket.Server | null = null;
  private clients = new Map<string, WebSocket>();
  private activeStreams = new Map<string, any>();

  /**
   * Initialize WebSocket server
   */
  initialize(server: Server): void {
    this.wss = new WebSocket.Server({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      console.log(`[WebSocketService] Client connected: ${clientId}`);

      ws.on('message', async (message: string) => {
        await this.handleMessage(clientId, message.toString());
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`[WebSocketService] Client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error(`[WebSocketService] Client error:`, error);
        this.clients.delete(clientId);
      });

      // Send welcome message
      this.send(clientId, {
        type: 'response',
        id: 'welcome',
        data: { message: 'Connected to Mr. Blue WebSocket', clientId }
      });
    });

    console.log('[WebSocketService] WebSocket server initialized');
  }

  /**
   * Handle incoming WebSocket message
   */
  private async handleMessage(clientId: string, message: string): Promise<void> {
    try {
      const msg: WebSocketMessage = JSON.parse(message);

      console.log(`[WebSocketService] Received ${msg.type} from ${clientId}`);

      switch (msg.type) {
        case 'request':
          await this.handleRequest(clientId, msg);
          break;

        case 'interrupt':
          await this.handleInterrupt(clientId, msg);
          break;

        default:
          this.send(clientId, {
            type: 'error',
            id: msg.id,
            data: { message: `Unknown message type: ${msg.type}` }
          });
      }
    } catch (error: any) {
      console.error('[WebSocketService] Message handling error:', error);
      this.send(clientId, {
        type: 'error',
        id: 'unknown',
        data: { message: error.message }
      });
    }
  }

  /**
   * Handle user request with streaming response
   */
  private async handleRequest(clientId: string, msg: WebSocketMessage): Promise<void> {
    const requestId = msg.id;

    try {
      // Store active stream
      this.activeStreams.set(requestId, { clientId, interrupted: false });

      // Execute workflow with streaming
      const steps: WorkflowStep[] = [
        {
          id: 'process',
          agentId: 'vibe-coding',
          task: msg.data.message,
          context: msg.data.context || {}
        }
      ];

      // Execute with streaming callback
      await this.executeWithStreaming(clientId, requestId, steps);

      // Remove from active streams
      this.activeStreams.delete(requestId);

      // Send completion
      this.send(clientId, {
        type: 'response',
        id: requestId,
        data: { status: 'completed' }
      });
    } catch (error: any) {
      this.send(clientId, {
        type: 'error',
        id: requestId,
        data: { message: error.message }
      });

      this.activeStreams.delete(requestId);
    }
  }

  /**
   * Execute workflow with streaming updates
   */
  private async executeWithStreaming(
    clientId: string,
    requestId: string,
    steps: WorkflowStep[]
  ): Promise<void> {
    for (const step of steps) {
      // Check if interrupted
      const stream = this.activeStreams.get(requestId);
      if (stream?.interrupted) {
        console.log(`[WebSocketService] Stream ${requestId} interrupted`);
        break;
      }

      // Stream progress
      this.send(clientId, {
        type: 'stream',
        id: requestId,
        data: {
          step: step.id,
          status: 'processing',
          message: `Processing ${step.agentId}...`
        }
      });

      // Execute step (placeholder - integrate with actual agent execution)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stream result
      this.send(clientId, {
        type: 'stream',
        id: requestId,
        data: {
          step: step.id,
          status: 'completed',
          result: { success: true }
        }
      });
    }
  }

  /**
   * Handle stream interruption
   */
  private async handleInterrupt(clientId: string, msg: WebSocketMessage): Promise<void> {
    const requestId = msg.data.requestId;

    const stream = this.activeStreams.get(requestId);
    if (stream) {
      stream.interrupted = true;
      console.log(`[WebSocketService] Interrupted stream: ${requestId}`);

      this.send(clientId, {
        type: 'response',
        id: msg.id,
        data: { message: 'Stream interrupted successfully' }
      });
    } else {
      this.send(clientId, {
        type: 'error',
        id: msg.id,
        data: { message: 'Stream not found' }
      });
    }
  }

  /**
   * Send message to client
   */
  private send(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast to all clients
   */
  broadcast(message: WebSocketMessage): void {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get connected clients count
   */
  getClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Get active streams count
   */
  getActiveStreamsCount(): number {
    return this.activeStreams.size;
  }
}

export const webSocketService = new WebSocketService();

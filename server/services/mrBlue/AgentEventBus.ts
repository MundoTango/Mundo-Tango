/**
 * AGENT EVENT BUS
 * Inter-agent communication system for coordinated workflows
 * 
 * Purpose: Enable agents to publish/subscribe to events for seamless coordination
 * 
 * Key Events:
 * - error:detected → ErrorAnalysisAgent
 * - error:analyzed → AutoFixEngine
 * - code:generated → ValidationAgent
 * - validation:passed → GitCommitGenerator
 * - progress:update → ProgressTrackingAgent
 * - visual:change → GitCommitGenerator
 * 
 * Features:
 * - Type-safe event system
 * - Async event handlers
 * - Error isolation (failed handler doesn't crash others)
 * - Event history for debugging
 * - Wildcard subscriptions
 */

import { EventEmitter } from 'events';

// ==================== EVENT TYPES ====================

export type AgentEventType =
  | 'error:detected'
  | 'error:analyzed'
  | 'code:generated'
  | 'validation:passed'
  | 'validation:failed'
  | 'progress:update'
  | 'visual:change'
  | 'task:started'
  | 'task:completed'
  | 'task:failed'
  | 'agent:ready'
  | 'workflow:started'
  | 'workflow:completed';

export interface BaseEvent {
  id: string;
  timestamp: number;
  source: string; // Agent name that emitted the event
  type: AgentEventType;
}

export interface ErrorDetectedEvent extends BaseEvent {
  type: 'error:detected';
  error: {
    message: string;
    stack?: string;
    type: string;
    context?: any;
  };
}

export interface ErrorAnalyzedEvent extends BaseEvent {
  type: 'error:analyzed';
  analysis: {
    rootCause: string;
    suggestedFix: string;
    confidence: number;
    affectedFiles: string[];
  };
}

export interface CodeGeneratedEvent extends BaseEvent {
  type: 'code:generated';
  sessionId: string;
  fileChanges: any[];
}

export interface ValidationPassedEvent extends BaseEvent {
  type: 'validation:passed';
  sessionId: string;
  validationResults: any;
}

export interface ValidationFailedEvent extends BaseEvent {
  type: 'validation:failed';
  sessionId: string;
  errors: string[];
}

export interface ProgressUpdateEvent extends BaseEvent {
  type: 'progress:update';
  sessionId: string;
  phase: string;
  percent: number;
  message: string;
}

export interface VisualChangeEvent extends BaseEvent {
  type: 'visual:change';
  filePath: string;
  changeDescription: string;
}

export interface TaskEvent extends BaseEvent {
  type: 'task:started' | 'task:completed' | 'task:failed';
  taskId: string;
  taskDescription?: string;
  result?: any;
  error?: string;
}

export interface WorkflowEvent extends BaseEvent {
  type: 'workflow:started' | 'workflow:completed';
  workflowId: string;
  workflowName: string;
}

export type AgentEvent =
  | ErrorDetectedEvent
  | ErrorAnalyzedEvent
  | CodeGeneratedEvent
  | ValidationPassedEvent
  | ValidationFailedEvent
  | ProgressUpdateEvent
  | VisualChangeEvent
  | TaskEvent
  | WorkflowEvent;

// ==================== EVENT HANDLER ====================

export type EventHandler<T extends AgentEvent = AgentEvent> = (event: T) => void | Promise<void>;

interface Subscription {
  id: string;
  eventType: AgentEventType | '*';
  handler: EventHandler;
  subscriber: string; // Agent name
}

// ==================== AGENT EVENT BUS ====================

export class AgentEventBus {
  private emitter: EventEmitter;
  private subscriptions: Map<string, Subscription> = new Map();
  private eventHistory: AgentEvent[] = [];
  private readonly MAX_HISTORY = 100;
  private subscriptionCounter = 0;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50); // Support many agents
    console.log('[AgentEventBus] Initialized event bus for agent communication');
  }

  /**
   * Publish an event to all subscribers
   */
  async publish<T extends AgentEvent>(event: T): Promise<void> {
    try {
      // Add to history
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.MAX_HISTORY) {
        this.eventHistory.shift();
      }

      console.log(`[AgentEventBus] 📡 Publishing ${event.type} from ${event.source}`);

      // Get all handlers for this event type
      const handlers = Array.from(this.subscriptions.values()).filter(
        (sub) => sub.eventType === event.type || sub.eventType === '*'
      );

      // Execute all handlers in parallel with error isolation
      await Promise.allSettled(
        handlers.map(async (subscription) => {
          try {
            await subscription.handler(event);
            console.log(
              `[AgentEventBus] ✅ ${subscription.subscriber} handled ${event.type}`
            );
          } catch (error: any) {
            console.error(
              `[AgentEventBus] ❌ ${subscription.subscriber} failed to handle ${event.type}:`,
              error.message
            );
            // Don't throw - isolate errors
          }
        })
      );
    } catch (error: any) {
      console.error('[AgentEventBus] ❌ Error publishing event:', error);
    }
  }

  /**
   * Subscribe to events
   */
  subscribe<T extends AgentEvent = AgentEvent>(
    eventType: AgentEventType | '*',
    handler: EventHandler<T>,
    subscriber: string
  ): string {
    const subscriptionId = `sub_${this.subscriptionCounter++}`;

    const subscription: Subscription = {
      id: subscriptionId,
      eventType,
      handler: handler as EventHandler,
      subscriber,
    };

    this.subscriptions.set(subscriptionId, subscription);

    console.log(
      `[AgentEventBus] 🔔 ${subscriber} subscribed to ${eventType} (${subscriptionId})`
    );

    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      this.subscriptions.delete(subscriptionId);
      console.log(
        `[AgentEventBus] 🔕 ${subscription.subscriber} unsubscribed from ${subscription.eventType}`
      );
      return true;
    }
    return false;
  }

  /**
   * Get event history
   */
  getHistory(eventType?: AgentEventType, limit: number = 20): AgentEvent[] {
    let history = this.eventHistory;

    if (eventType) {
      history = history.filter((e) => e.type === eventType);
    }

    return history.slice(-limit);
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
    console.log('[AgentEventBus] 🗑️ Event history cleared');
  }

  /**
   * Get active subscriptions
   */
  getSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get subscription count for an event type
   */
  getSubscriberCount(eventType: AgentEventType): number {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.eventType === eventType || sub.eventType === '*'
    ).length;
  }

  /**
   * Wait for a specific event (promise-based)
   */
  waitForEvent<T extends AgentEvent>(
    eventType: AgentEventType,
    timeout: number = 30000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.unsubscribe(subscriptionId);
        reject(new Error(`Timeout waiting for event: ${eventType}`));
      }, timeout);

      const subscriptionId = this.subscribe<T>(
        eventType,
        (event) => {
          clearTimeout(timeoutId);
          this.unsubscribe(subscriptionId);
          resolve(event as T);
        },
        'EventWaiter'
      );
    });
  }

  /**
   * Create event with common fields
   */
  createEvent<T extends AgentEvent>(
    type: AgentEventType,
    source: string,
    data: Omit<T, 'id' | 'timestamp' | 'type' | 'source'>
  ): T {
    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      type,
      source,
      ...data,
    } as T;
  }
}

// Singleton instance
export const agentEventBus = new AgentEventBus();

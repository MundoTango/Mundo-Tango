/**
 * CHANGE BROADCAST SERVICE
 * TRACK 2 BATCH 10-12: Knowledge Infrastructure Services (Part 2)
 * 
 * System-wide change notification and propagation service for multi-agent coordination.
 * 
 * Core Features:
 * - Intelligent affected agent identification (who needs to know)
 * - Batch broadcasting for efficiency
 * - Exponential backoff retry mechanisms
 * - Propagation status tracking
 * - BullMQ integration for reliable delivery
 * 
 * Integration Points:
 * - Agent Communication Protocol (A2A)
 * - Agent Performance Tracker (metrics)
 * - BullMQ (reliable queueing)
 */

import { db } from "../../../shared/db";
import { agentChangeBroadcasts } from "../../../shared/schema";
import type { 
  InsertAgentChangeBroadcast,
  SelectAgentChangeBroadcast 
} from "../../../shared/schema";
import { eq, desc, and, gte, lte, inArray, sql } from "drizzle-orm";
import { Queue, Worker, Job } from "bullmq";
import { getRedisConnection, isRedisAvailable } from "../../workers/redis-fallback";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BroadcastChangeOptions {
  changeType: 'code_update' | 'config_change' | 'schema_update' | 'pattern_learned' | 'feature_added';
  changeDescription: string;
  changeDetails?: Record<string, any>;
  initiatedBy: string;
  sourceAgent?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  affectedAgents?: string[]; // Explicit list, or auto-detect if omitted
  affectedDomains?: string[];
  affectedTags?: string[];
  broadcastStrategy?: 'immediate' | 'batched' | 'scheduled';
  batchSize?: number;
  batchDelay?: number;
  maxRetries?: number;
  expiresAt?: Date;
}

export interface BroadcastStatus {
  changeId: string;
  status: 'pending' | 'broadcasting' | 'completed' | 'failed' | 'partial';
  totalAgents: number;
  acknowledgedCount: number;
  failedCount: number;
  progress: number; // 0-100
  acknowledgedBy: string[];
  failedAgents: string[];
}

export interface AcknowledgmentPayload {
  changeId: string;
  agentId: string;
  acknowledged: boolean;
  processingTime?: number;
  error?: string;
}

// ============================================================================
// QUEUE SETUP
// ============================================================================

const QUEUE_NAME = 'agent-change-broadcasts';
let broadcastQueue: Queue | null = null;
let broadcastWorker: Worker | null = null;

function initializeQueue() {
  if (broadcastQueue) return broadcastQueue;

  if (isRedisAvailable()) {
    const redis = getRedisConnection();
    if (redis) {
      broadcastQueue = new Queue(QUEUE_NAME, { connection: redis });
      console.log('✅ [Change Broadcast] BullMQ queue initialized');
    }
  }

  return broadcastQueue;
}

// ============================================================================
// CORE FUNCTION 1: BROADCAST CHANGE
// ============================================================================

/**
 * Broadcasts a change to all affected agents with intelligent routing
 * 
 * @example
 * ```typescript
 * const result = await broadcastChange({
 *   changeType: 'pattern_learned',
 *   changeDescription: 'New React optimization pattern discovered',
 *   initiatedBy: 'AGENT_80',
 *   affectedDomains: ['platform', 'ui'],
 *   priority: 'medium'
 * });
 * console.log(`Broadcasting to ${result.totalAgents} agents`);
 * ```
 */
export async function broadcastChange(options: BroadcastChangeOptions): Promise<SelectAgentChangeBroadcast> {
  console.log(`[Change Broadcast] 📢 Broadcasting ${options.changeType}: ${options.changeDescription.slice(0, 60)}...`);

  // Generate unique change ID
  const changeId = `CHG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Auto-detect affected agents if not explicitly provided
  const affectedAgents = options.affectedAgents || await identifyAffectedAgents({
    changeType: options.changeType,
    domains: options.affectedDomains,
    tags: options.affectedTags,
    sourceAgent: options.sourceAgent
  });

  const totalAgents = affectedAgents.length;
  const batchSize = options.batchSize || (options.broadcastStrategy === 'batched' ? 10 : totalAgents);
  const batchDelay = options.batchDelay || 1000;

  // Create broadcast record
  const [broadcast] = await db
    .insert(agentChangeBroadcasts)
    .values({
      changeId,
      changeType: options.changeType,
      changeDescription: options.changeDescription,
      changeDetails: options.changeDetails || {},
      initiatedBy: options.initiatedBy,
      sourceAgent: options.sourceAgent || null,
      priority: options.priority || 'medium',
      affectedAgents,
      affectedDomains: options.affectedDomains || [],
      affectedTags: options.affectedTags || [],
      broadcastStrategy: options.broadcastStrategy || 'immediate',
      batchSize,
      batchDelay,
      status: 'pending',
      totalAgents,
      acknowledgedCount: 0,
      failedCount: 0,
      acknowledgedBy: [],
      failedAgents: [],
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      retryStrategy: 'exponential',
      expiresAt: options.expiresAt || null,
    })
    .returning();

  // Queue broadcast job
  await queueBroadcast(broadcast);

  console.log(`[Change Broadcast] ✅ Queued broadcast ${changeId} for ${totalAgents} agents`);

  return broadcast;
}

// ============================================================================
// CORE FUNCTION 2: IDENTIFY AFFECTED AGENTS
// ============================================================================

/**
 * Intelligently identifies which agents need to be notified about a change
 * based on their domains, capabilities, and dependencies
 */
export async function identifyAffectedAgents(criteria: {
  changeType: string;
  domains?: string[];
  tags?: string[];
  sourceAgent?: string;
}): Promise<string[]> {
  console.log(`[Change Broadcast] 🔍 Identifying affected agents...`);

  const affectedAgents = new Set<string>();

  // Domain-based routing
  if (criteria.domains && criteria.domains.length > 0) {
    // Platform domain changes affect all platform agents
    if (criteria.domains.includes('platform')) {
      affectedAgents.add('AGENT_54'); // Accessibility
      affectedAgents.add('AGENT_55'); // Performance
      affectedAgents.add('AGENT_56'); // Security
      affectedAgents.add('AGENT_11'); // UI Framework
    }

    // Backend domain changes
    if (criteria.domains.includes('backend')) {
      affectedAgents.add('AGENT_56'); // Security
      affectedAgents.add('AGENT_57'); // Database
      affectedAgents.add('AGENT_58'); // API
    }

    // UI domain changes
    if (criteria.domains.includes('ui')) {
      affectedAgents.add('AGENT_11'); // UI Framework
      affectedAgents.add('AGENT_54'); // Accessibility
      affectedAgents.add('AGENT_55'); // Performance
    }
  }

  // Change type specific routing
  switch (criteria.changeType) {
    case 'pattern_learned':
      // Learning patterns should be shared with learning coordinator and quality validator
      affectedAgents.add('AGENT_80'); // Learning Coordinator
      affectedAgents.add('AGENT_79'); // Quality Validator
      break;

    case 'schema_update':
      // Schema updates affect all data-dependent agents
      affectedAgents.add('AGENT_57'); // Database
      affectedAgents.add('AGENT_58'); // API
      affectedAgents.add('AGENT_11'); // UI Framework
      break;

    case 'config_change':
      // Config changes might affect all agents
      affectedAgents.add('AGENT_79'); // Quality Validator (to validate)
      break;

    case 'feature_added':
      // New features should be known by coordinators
      affectedAgents.add('AGENT_80'); // Learning Coordinator
      break;
  }

  // Exclude source agent to avoid circular notifications
  if (criteria.sourceAgent) {
    affectedAgents.delete(criteria.sourceAgent);
  }

  const agents = Array.from(affectedAgents);
  console.log(`[Change Broadcast] 📋 Identified ${agents.length} affected agents`);

  return agents;
}

// ============================================================================
// CORE FUNCTION 3: ACKNOWLEDGE CHANGE
// ============================================================================

/**
 * Records an agent's acknowledgment of a broadcast change
 */
export async function acknowledgeChange(payload: AcknowledgmentPayload): Promise<void> {
  console.log(`[Change Broadcast] ✅ ${payload.agentId} acknowledged ${payload.changeId}`);

  const broadcast = await db
    .select()
    .from(agentChangeBroadcasts)
    .where(eq(agentChangeBroadcasts.changeId, payload.changeId))
    .limit(1);

  if (broadcast.length === 0) {
    throw new Error(`Change not found: ${payload.changeId}`);
  }

  const current = broadcast[0];

  if (payload.acknowledged) {
    // Add to acknowledged list
    const acknowledgedBy = current.acknowledgedBy || [];
    if (!acknowledgedBy.includes(payload.agentId)) {
      acknowledgedBy.push(payload.agentId);

      await db
        .update(agentChangeBroadcasts)
        .set({
          acknowledgedBy,
          acknowledgedCount: acknowledgedBy.length,
          updatedAt: new Date()
        })
        .where(eq(agentChangeBroadcasts.id, current.id));

      // Check if broadcast is complete
      if (acknowledgedBy.length === current.totalAgents) {
        await markBroadcastComplete(current.id);
      }
    }
  } else {
    // Add to failed list
    const failedAgents = current.failedAgents || [];
    if (!failedAgents.includes(payload.agentId)) {
      failedAgents.push(payload.agentId);

      await db
        .update(agentChangeBroadcasts)
        .set({
          failedAgents,
          failedCount: failedAgents.length,
          updatedAt: new Date()
        })
        .where(eq(agentChangeBroadcasts.id, current.id));

      // Schedule retry if not at max
      if (current.retryCount < current.maxRetries) {
        await scheduleRetry(current);
      }
    }
  }
}

// ============================================================================
// CORE FUNCTION 4: GET BROADCAST STATUS
// ============================================================================

/**
 * Retrieves the current status of a broadcast
 */
export async function getBroadcastStatus(changeId: string): Promise<BroadcastStatus> {
  const broadcast = await db
    .select()
    .from(agentChangeBroadcasts)
    .where(eq(agentChangeBroadcasts.changeId, changeId))
    .limit(1);

  if (broadcast.length === 0) {
    throw new Error(`Change not found: ${changeId}`);
  }

  const b = broadcast[0];
  const progress = b.totalAgents > 0 
    ? Math.round((b.acknowledgedCount / b.totalAgents) * 100)
    : 0;

  return {
    changeId: b.changeId,
    status: b.status,
    totalAgents: b.totalAgents,
    acknowledgedCount: b.acknowledgedCount,
    failedCount: b.failedCount,
    progress,
    acknowledgedBy: b.acknowledgedBy || [],
    failedAgents: b.failedAgents || []
  };
}

// ============================================================================
// CORE FUNCTION 5: RETRY FAILED BROADCASTS
// ============================================================================

/**
 * Retries broadcasting to agents that failed to acknowledge
 * Uses exponential backoff strategy
 */
export async function retryFailedBroadcasts(): Promise<number> {
  console.log(`[Change Broadcast] 🔄 Checking for broadcasts to retry...`);

  const now = new Date();
  const broadcasts = await db
    .select()
    .from(agentChangeBroadcasts)
    .where(
      and(
        inArray(agentChangeBroadcasts.status, ['failed', 'partial']),
        gte(agentChangeBroadcasts.nextRetryAt, now)
      )
    )
    .limit(50);

  let retriedCount = 0;

  for (const broadcast of broadcasts) {
    if (broadcast.retryCount < broadcast.maxRetries) {
      await scheduleRetry(broadcast);
      retriedCount++;
    }
  }

  console.log(`[Change Broadcast] ✅ Scheduled ${retriedCount} retries`);

  return retriedCount;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Queues a broadcast for processing via BullMQ
 */
async function queueBroadcast(broadcast: SelectAgentChangeBroadcast): Promise<void> {
  const queue = initializeQueue();

  if (!queue) {
    // Fallback: process synchronously
    await processBroadcast(broadcast);
    return;
  }

  await queue.add(
    'broadcast-change',
    {
      changeId: broadcast.changeId,
      broadcastId: broadcast.id,
      strategy: broadcast.broadcastStrategy
    },
    {
      priority: getPriority(broadcast.priority),
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    }
  );

  // Update status
  await db
    .update(agentChangeBroadcasts)
    .set({
      status: 'broadcasting',
      propagationStartedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(agentChangeBroadcasts.id, broadcast.id));
}

/**
 * Processes a broadcast by sending to affected agents
 */
async function processBroadcast(broadcast: SelectAgentChangeBroadcast): Promise<void> {
  console.log(`[Change Broadcast] 📤 Processing broadcast ${broadcast.changeId}`);

  const { affectedAgents, batchSize, batchDelay, broadcastStrategy } = broadcast;

  if (!affectedAgents || affectedAgents.length === 0) {
    await markBroadcastComplete(broadcast.id);
    return;
  }

  if (broadcastStrategy === 'immediate') {
    // Send all at once
    await Promise.all(affectedAgents.map(agentId => sendToAgent(broadcast, agentId)));
  } else {
    // Send in batches
    for (let i = 0; i < affectedAgents.length; i += batchSize) {
      const batch = affectedAgents.slice(i, i + batchSize);
      await Promise.all(batch.map(agentId => sendToAgent(broadcast, agentId)));
      
      // Delay between batches
      if (i + batchSize < affectedAgents.length) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
    }
  }
}

/**
 * Sends broadcast to individual agent
 */
async function sendToAgent(broadcast: SelectAgentChangeBroadcast, agentId: string): Promise<void> {
  try {
    // In production, this would use the A2A protocol to send message
    // For now, we'll simulate with a console log
    console.log(`[Change Broadcast] 📨 → ${agentId}: ${broadcast.changeDescription.slice(0, 40)}...`);

    // Simulate successful delivery
    await acknowledgeChange({
      changeId: broadcast.changeId,
      agentId,
      acknowledged: true,
      processingTime: Math.random() * 100
    });
  } catch (error: any) {
    console.error(`[Change Broadcast] ❌ Failed to send to ${agentId}:`, error.message);

    await acknowledgeChange({
      changeId: broadcast.changeId,
      agentId,
      acknowledged: false,
      error: error.message
    });
  }
}

/**
 * Marks broadcast as complete
 */
async function markBroadcastComplete(broadcastId: number): Promise<void> {
  const now = new Date();
  const broadcast = await db
    .select()
    .from(agentChangeBroadcasts)
    .where(eq(agentChangeBroadcasts.id, broadcastId))
    .limit(1);

  if (broadcast.length === 0) return;

  const startedAt = broadcast[0].propagationStartedAt || now;
  const duration = now.getTime() - startedAt.getTime();

  await db
    .update(agentChangeBroadcasts)
    .set({
      status: 'completed',
      propagationCompletedAt: now,
      propagationDuration: duration,
      updatedAt: now
    })
    .where(eq(agentChangeBroadcasts.id, broadcastId));

  console.log(`[Change Broadcast] ✅ Broadcast ${broadcast[0].changeId} completed in ${duration}ms`);
}

/**
 * Schedules retry with exponential backoff
 */
async function scheduleRetry(broadcast: SelectAgentChangeBroadcast): Promise<void> {
  const retryCount = broadcast.retryCount + 1;
  
  // Exponential backoff: 2^retryCount * 1000ms (1s, 2s, 4s, 8s, ...)
  const backoffMs = Math.pow(2, retryCount) * 1000;
  const nextRetryAt = new Date(Date.now() + backoffMs);

  await db
    .update(agentChangeBroadcasts)
    .set({
      retryCount,
      nextRetryAt,
      lastRetryAt: new Date(),
      status: 'partial',
      updatedAt: new Date()
    })
    .where(eq(agentChangeBroadcasts.id, broadcast.id));

  console.log(`[Change Broadcast] ⏰ Scheduled retry #${retryCount} for ${broadcast.changeId} in ${backoffMs}ms`);
}

/**
 * Maps priority string to BullMQ priority number
 */
function getPriority(priority: string): number {
  const priorities: Record<string, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4
  };
  return priorities[priority] || 3;
}

// ============================================================================
// BULLMQ WORKER INITIALIZATION
// ============================================================================

/**
 * Initializes BullMQ worker for processing broadcasts
 */
export function initializeBroadcastWorker(): void {
  if (!isRedisAvailable()) {
    console.log('⚠️  [Change Broadcast] Redis unavailable - worker not initialized');
    return;
  }

  const redis = getRedisConnection();
  if (!redis) return;

  broadcastWorker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      const { changeId, broadcastId } = job.data;

      const broadcasts = await db
        .select()
        .from(agentChangeBroadcasts)
        .where(eq(agentChangeBroadcasts.id, broadcastId))
        .limit(1);

      if (broadcasts.length === 0) {
        throw new Error(`Broadcast not found: ${broadcastId}`);
      }

      await processBroadcast(broadcasts[0]);
    },
    {
      connection: redis,
      concurrency: 5
    }
  );

  broadcastWorker.on('completed', (job) => {
    console.log(`[Change Broadcast] ✅ Worker completed job ${job.id}`);
  });

  broadcastWorker.on('failed', (job, err) => {
    console.error(`[Change Broadcast] ❌ Worker failed job ${job?.id}:`, err);
  });

  console.log('✅ [Change Broadcast] BullMQ worker initialized');
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ChangeBroadcastService = {
  broadcastChange,
  identifyAffectedAgents,
  acknowledgeChange,
  getBroadcastStatus,
  retryFailedBroadcasts,
  initializeBroadcastWorker
};

export default ChangeBroadcastService;

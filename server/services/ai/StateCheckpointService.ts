/**
 * MB.MD v9.3: LangGraph-Style State Checkpoint Service (Phase 2)
 * 
 * Production-ready agent orchestration with persistent memory.
 * Enables agents to survive server restarts and resume from checkpoints.
 * 
 * Features:
 * - Graph-based state machines
 * - PostgreSQL persistence
 * - Thread-based isolation (tenant:user:session)
 * - Parent-child checkpoint chains
 * - Interrupt points for human-in-the-loop
 * - Pending writes for uncommitted state
 * 
 * Inspired by: LangGraph (LangChain), production systems at LinkedIn/Uber/Replit
 */

import { db } from "@db";
import { 
  agentStateCheckpoints,
  type InsertAgentStateCheckpoint,
  type SelectAgentStateCheckpoint
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

interface StateGraph<T> {
  nodes: Record<string, StateNode<T>>;
  edges: Record<string, string | ConditionalEdge<T> | string[]>;
  initialNode?: string;
}

interface StateNode<T> {
  execute: (state: T) => Promise<T>;
}

interface ConditionalEdge<T> {
  conditional: (state: T) => string;
}

interface CheckpointOptions {
  threadId: string;
  namespace?: string;
  parentId?: number;
  interruptPoint?: string;
  pendingWrites?: any;
}

export class StateCheckpointService {
  // ============================================================================
  // CHECKPOINT MANAGEMENT
  // ============================================================================

  /**
   * Save a checkpoint at current node
   */
  static async saveCheckpoint<T>(
    state: T,
    nodeId: string,
    options: CheckpointOptions
  ): Promise<SelectAgentStateCheckpoint> {
    // Calculate step number (parent's step + 1)
    const stepNumber = options.parentId 
      ? await this.getStepNumber(options.parentId) + 1 
      : 0;

    const [checkpoint] = await db
      .insert(agentStateCheckpoints)
      .values({
        threadId: options.threadId,
        namespace: options.namespace,
        state: state as any,
        nodeId,
        parentId: options.parentId,
        stepNumber,
        pendingWrites: options.pendingWrites,
        interruptPoint: options.interruptPoint
      })
      .returning();

    return checkpoint;
  }

  private static async getStepNumber(checkpointId: number): Promise<number> {
    const [checkpoint] = await db
      .select()
      .from(agentStateCheckpoints)
      .where(eq(agentStateCheckpoints.id, checkpointId))
      .limit(1);
    return checkpoint?.stepNumber ?? 0;
  }

  /**
   * Load latest checkpoint for thread
   */
  static async loadLatestCheckpoint(
    threadId: string,
    namespace?: string
  ): Promise<SelectAgentStateCheckpoint | null> {
    let query = db
      .select()
      .from(agentStateCheckpoints)
      .where(eq(agentStateCheckpoints.threadId, threadId));

    if (namespace) {
      query = query.where(eq(agentStateCheckpoints.namespace, namespace));
    }

    const [checkpoint] = await query
      .orderBy(desc(agentStateCheckpoints.createdAt))
      .limit(1);

    return checkpoint || null;
  }

  /**
   * Load checkpoint by ID
   */
  static async loadCheckpoint(checkpointId: number): Promise<SelectAgentStateCheckpoint | null> {
    const [checkpoint] = await db
      .select()
      .from(agentStateCheckpoints)
      .where(eq(agentStateCheckpoints.id, checkpointId))
      .limit(1);

    return checkpoint || null;
  }

  /**
   * Get checkpoint chain (parent → child)
   */
  static async getCheckpointChain(checkpointId: number): Promise<SelectAgentStateCheckpoint[]> {
    const chain: SelectAgentStateCheckpoint[] = [];
    let currentId: number | null = checkpointId;

    while (currentId) {
      const checkpoint = await this.loadCheckpoint(currentId);
      if (!checkpoint) break;
      
      chain.unshift(checkpoint); // Add to front
      currentId = checkpoint.parentId;
    }

    return chain;
  }

  /**
   * Delete old checkpoints (garbage collection)
   */
  static async pruneCheckpoints(
    threadId: string,
    keepLast: number = 10
  ): Promise<number> {
    // Get all checkpoints for thread
    const allCheckpoints = await db
      .select()
      .from(agentStateCheckpoints)
      .where(eq(agentStateCheckpoints.threadId, threadId))
      .orderBy(desc(agentStateCheckpoints.createdAt));

    if (allCheckpoints.length <= keepLast) {
      return 0; // Nothing to prune
    }

    // Delete old checkpoints
    const toDelete = allCheckpoints.slice(keepLast);
    const deleteIds = toDelete.map(c => c.id);

    await db
      .delete(agentStateCheckpoints)
      .where(sql`${agentStateCheckpoints.id} = ANY(${deleteIds})`);

    return deleteIds.length;
  }

  // ============================================================================
  // STATE GRAPH EXECUTION (LangGraph-inspired)
  // ============================================================================

  /**
   * Execute state graph with checkpointing
   */
  static async executeGraph<T>(
    graph: StateGraph<T>,
    initialState: T,
    threadId: string,
    options?: {
      namespace?: string;
      resumeFrom?: number; // Checkpoint ID
      maxSteps?: number;
    }
  ): Promise<{ finalState: T; checkpoints: SelectAgentStateCheckpoint[] }> {
    const maxSteps = options?.maxSteps ?? 100;
    const checkpoints: SelectAgentStateCheckpoint[] = [];
    let currentState = initialState;
    let currentNode = graph.initialNode || Object.keys(graph.nodes)[0];
    let parentCheckpointId: number | undefined;
    let step = 0;

    // Resume from checkpoint if provided
    if (options?.resumeFrom) {
      const resumeCheckpoint = await this.loadCheckpoint(options.resumeFrom);
      if (resumeCheckpoint) {
        currentState = resumeCheckpoint.state as T;
        currentNode = resumeCheckpoint.interruptPoint || resumeCheckpoint.nodeId;
        parentCheckpointId = resumeCheckpoint.id;
        
        // Apply pending writes
        if (resumeCheckpoint.pendingWrites) {
          currentState = { ...currentState, ...resumeCheckpoint.pendingWrites };
        }
      }
    }

    // Execute graph
    while (step < maxSteps) {
      const node = graph.nodes[currentNode];
      if (!node) {
        throw new Error(`Node '${currentNode}' not found in graph`);
      }

      // Execute node
      const newState = await node.execute(currentState);
      
      // Save checkpoint
      const checkpoint = await this.saveCheckpoint(newState, currentNode, {
        threadId,
        namespace: options?.namespace,
        parentId: parentCheckpointId
      });
      checkpoints.push(checkpoint);
      parentCheckpointId = checkpoint.id;

      // Update state
      currentState = newState;

      // Determine next node
      const edge = graph.edges[currentNode];
      if (!edge) {
        break; // Terminal node
      }

      if (typeof edge === 'string') {
        currentNode = edge;
      } else if (Array.isArray(edge)) {
        currentNode = edge[0]; // Take first edge
      } else if ('conditional' in edge) {
        currentNode = edge.conditional(currentState);
      } else {
        break;
      }

      step++;
    }

    return { finalState: currentState, checkpoints };
  }

  /**
   * Create interrupt point for human-in-the-loop
   */
  static async createInterrupt<T>(
    state: T,
    nodeId: string,
    threadId: string,
    interruptReason: string
  ): Promise<SelectAgentStateCheckpoint> {
    return await this.saveCheckpoint(state, nodeId, {
      threadId,
      interruptPoint: nodeId,
      pendingWrites: { interruptReason }
    });
  }

  /**
   * Resume from interrupt after human approval
   */
  static async resumeFromInterrupt(
    checkpointId: number,
    approvedChanges?: any
  ): Promise<SelectAgentStateCheckpoint | null> {
    const checkpoint = await this.loadCheckpoint(checkpointId);
    if (!checkpoint || !checkpoint.interruptPoint) {
      return null;
    }

    // Create new checkpoint with approved changes
    const newState = approvedChanges 
      ? { ...checkpoint.state, ...approvedChanges } 
      : checkpoint.state;

    return await this.saveCheckpoint(newState, checkpoint.nodeId, {
      threadId: checkpoint.threadId,
      namespace: checkpoint.namespace || undefined,
      parentId: checkpoint.id,
      pendingWrites: null // Clear pending writes
    });
  }

  // ============================================================================
  // THREAD MANAGEMENT
  // ============================================================================

  /**
   * Generate thread ID for isolation
   */
  static generateThreadId(tenantId: string, userId: string, sessionId: string): string {
    return `tenant-${tenantId}:user-${userId}:session-${sessionId}`;
  }

  /**
   * Get all threads for user
   */
  static async getUserThreads(userId: string): Promise<string[]> {
    const checkpoints = await db
      .selectDistinct({ threadId: agentStateCheckpoints.threadId })
      .from(agentStateCheckpoints)
      .where(sql`${agentStateCheckpoints.threadId} LIKE '%user-${userId}%'`);

    return checkpoints.map(c => c.threadId);
  }

  /**
   * Delete all checkpoints for thread
   */
  static async deleteThread(threadId: string): Promise<void> {
    await db
      .delete(agentStateCheckpoints)
      .where(eq(agentStateCheckpoints.threadId, threadId));
  }
}

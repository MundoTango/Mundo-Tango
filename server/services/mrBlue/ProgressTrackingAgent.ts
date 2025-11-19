/**
 * PROGRESS TRACKING AGENT
 * Unified progress tracking for multi-step workflows
 * 
 * Purpose: Track task phases and broadcast progress via SSE
 * 
 * Features:
 * - Track task phases (planning → execution → validation → complete)
 * - Broadcast progress via SSE
 * - Store progress in memory for recovery
 * - Support for nested subtasks
 * - Real-time updates via event bus
 * 
 * Phases:
 * 1. Planning (0-20%): Task decomposition
 * 2. Execution (20-80%): Running subtasks
 * 3. Validation (80-95%): LSP + Tests
 * 4. Complete (95-100%): Finalization
 */

import { agentEventBus, type ProgressUpdateEvent } from './AgentEventBus';

export type TaskPhase = 'planning' | 'execution' | 'validation' | 'complete' | 'failed';

export interface TaskProgress {
  sessionId: string;
  phase: TaskPhase;
  percent: number;
  message: string;
  currentTask?: number;
  totalTasks?: number;
  completedTasks?: number;
  failedTasks?: number;
  startedAt: number;
  estimatedCompletion?: number;
  subtasks?: SubtaskProgress[];
}

export interface SubtaskProgress {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  percent: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

export class ProgressTrackingAgent {
  private progressMap: Map<string, TaskProgress> = new Map();
  private sseConnections: Map<string, Set<(data: any) => void>> = new Map();
  
  // Phase percentage ranges
  private readonly PHASE_RANGES = {
    planning: { start: 0, end: 20 },
    execution: { start: 20, end: 80 },
    validation: { start: 80, end: 95 },
    complete: { start: 95, end: 100 },
  };

  constructor() {
    this.setupEventListeners();
    console.log('[ProgressTrackingAgent] Initialized progress tracking');
  }

  /**
   * Setup event bus listeners
   */
  private setupEventListeners(): void {
    // Listen to all progress events
    agentEventBus.subscribe<ProgressUpdateEvent>(
      'progress:update',
      (event) => this.handleProgressUpdate(event),
      'ProgressTrackingAgent'
    );

    // Listen to task events
    agentEventBus.subscribe(
      'task:started',
      (event) => this.handleTaskStarted(event),
      'ProgressTrackingAgent'
    );

    agentEventBus.subscribe(
      'task:completed',
      (event) => this.handleTaskCompleted(event),
      'ProgressTrackingAgent'
    );

    agentEventBus.subscribe(
      'task:failed',
      (event) => this.handleTaskFailed(event),
      'ProgressTrackingAgent'
    );
  }

  /**
   * Start tracking a new session
   */
  startSession(sessionId: string, totalTasks: number = 1): void {
    const progress: TaskProgress = {
      sessionId,
      phase: 'planning',
      percent: 0,
      message: 'Starting...',
      totalTasks,
      completedTasks: 0,
      failedTasks: 0,
      startedAt: Date.now(),
      subtasks: [],
    };

    this.progressMap.set(sessionId, progress);
    this.broadcastProgress(sessionId, progress);

    console.log(`[ProgressTrackingAgent] 🎯 Started tracking session ${sessionId}`);
  }

  /**
   * Update phase
   */
  updatePhase(
    sessionId: string,
    phase: TaskPhase,
    message?: string
  ): void {
    const progress = this.progressMap.get(sessionId);
    if (!progress) {
      console.warn(`[ProgressTrackingAgent] Session ${sessionId} not found`);
      return;
    }

    const range = this.PHASE_RANGES[phase as keyof typeof this.PHASE_RANGES];
    if (range) {
      progress.phase = phase;
      progress.percent = range.start;
      progress.message = message || this.getDefaultMessage(phase);

      this.progressMap.set(sessionId, progress);
      this.broadcastProgress(sessionId, progress);

      // Publish to event bus
      const event = agentEventBus.createEvent<ProgressUpdateEvent>(
        'progress:update',
        'ProgressTrackingAgent',
        {
          sessionId,
          phase,
          percent: progress.percent,
          message: progress.message,
        }
      );
      agentEventBus.publish(event);
    }
  }

  /**
   * Update progress percentage within current phase
   */
  updateProgress(
    sessionId: string,
    percent: number,
    message?: string
  ): void {
    const progress = this.progressMap.get(sessionId);
    if (!progress) {
      console.warn(`[ProgressTrackingAgent] Session ${sessionId} not found`);
      return;
    }

    progress.percent = Math.min(Math.max(percent, 0), 100);
    if (message) {
      progress.message = message;
    }

    this.progressMap.set(sessionId, progress);
    this.broadcastProgress(sessionId, progress);
  }

  /**
   * Add a subtask
   */
  addSubtask(
    sessionId: string,
    subtaskId: string,
    description: string
  ): void {
    const progress = this.progressMap.get(sessionId);
    if (!progress) {
      return;
    }

    const subtask: SubtaskProgress = {
      id: subtaskId,
      description,
      status: 'pending',
      percent: 0,
    };

    if (!progress.subtasks) {
      progress.subtasks = [];
    }

    progress.subtasks.push(subtask);
    this.progressMap.set(sessionId, progress);
    this.broadcastProgress(sessionId, progress);
  }

  /**
   * Update subtask progress
   */
  updateSubtask(
    sessionId: string,
    subtaskId: string,
    status: SubtaskProgress['status'],
    percent?: number
  ): void {
    const progress = this.progressMap.get(sessionId);
    if (!progress || !progress.subtasks) {
      return;
    }

    const subtask = progress.subtasks.find((t) => t.id === subtaskId);
    if (!subtask) {
      return;
    }

    subtask.status = status;
    if (percent !== undefined) {
      subtask.percent = percent;
    }

    if (status === 'running' && !subtask.startedAt) {
      subtask.startedAt = Date.now();
    }

    if (status === 'completed' || status === 'failed') {
      subtask.completedAt = Date.now();
      subtask.percent = status === 'completed' ? 100 : 0;
    }

    // Update overall progress based on subtasks
    this.updateOverallProgress(sessionId);
  }

  /**
   * Update overall progress based on subtask completion
   */
  private updateOverallProgress(sessionId: string): void {
    const progress = this.progressMap.get(sessionId);
    if (!progress || !progress.subtasks || progress.subtasks.length === 0) {
      return;
    }

    const completed = progress.subtasks.filter((t) => t.status === 'completed').length;
    const failed = progress.subtasks.filter((t) => t.status === 'failed').length;
    const total = progress.subtasks.length;

    progress.completedTasks = completed;
    progress.failedTasks = failed;

    // Calculate progress within execution phase
    if (progress.phase === 'execution') {
      const executionProgress = (completed + failed) / total;
      const range = this.PHASE_RANGES.execution;
      progress.percent = range.start + executionProgress * (range.end - range.start);
    }

    this.progressMap.set(sessionId, progress);
    this.broadcastProgress(sessionId, progress);
  }

  /**
   * Complete a session
   */
  completeSession(sessionId: string, success: boolean = true): void {
    const progress = this.progressMap.get(sessionId);
    if (!progress) {
      return;
    }

    progress.phase = success ? 'complete' : 'failed';
    progress.percent = success ? 100 : progress.percent;
    progress.message = success
      ? 'Completed successfully!'
      : 'Failed - see error log';

    this.progressMap.set(sessionId, progress);
    this.broadcastProgress(sessionId, progress);

    console.log(
      `[ProgressTrackingAgent] ${success ? '✅' : '❌'} Session ${sessionId} ${
        success ? 'completed' : 'failed'
      }`
    );
  }

  /**
   * Get progress for a session
   */
  getProgress(sessionId: string): TaskProgress | undefined {
    return this.progressMap.get(sessionId);
  }

  /**
   * Register SSE connection for real-time updates
   */
  registerSSE(sessionId: string, callback: (data: any) => void): () => void {
    if (!this.sseConnections.has(sessionId)) {
      this.sseConnections.set(sessionId, new Set());
    }

    const connections = this.sseConnections.get(sessionId)!;
    connections.add(callback);

    // Send current progress immediately
    const progress = this.progressMap.get(sessionId);
    if (progress) {
      callback(progress);
    }

    console.log(
      `[ProgressTrackingAgent] 📡 SSE connection registered for ${sessionId}`
    );

    // Return unsubscribe function
    return () => {
      connections.delete(callback);
      if (connections.size === 0) {
        this.sseConnections.delete(sessionId);
      }
      console.log(
        `[ProgressTrackingAgent] 📡 SSE connection closed for ${sessionId}`
      );
    };
  }

  /**
   * Broadcast progress to all SSE connections
   */
  private broadcastProgress(sessionId: string, progress: TaskProgress): void {
    const connections = this.sseConnections.get(sessionId);
    if (!connections || connections.size === 0) {
      return;
    }

    connections.forEach((callback) => {
      try {
        callback(progress);
      } catch (error: any) {
        console.error(
          `[ProgressTrackingAgent] ❌ Error broadcasting to SSE:`,
          error.message
        );
      }
    });
  }

  /**
   * Handle progress update events
   */
  private handleProgressUpdate(event: ProgressUpdateEvent): void {
    this.updateProgress(event.sessionId, event.percent, event.message);
  }

  /**
   * Handle task started events
   */
  private handleTaskStarted(event: any): void {
    if (event.taskId && event.sessionId) {
      this.addSubtask(
        event.sessionId,
        event.taskId,
        event.taskDescription || 'Task running'
      );
      this.updateSubtask(event.sessionId, event.taskId, 'running');
    }
  }

  /**
   * Handle task completed events
   */
  private handleTaskCompleted(event: any): void {
    if (event.taskId && event.sessionId) {
      this.updateSubtask(event.sessionId, event.taskId, 'completed', 100);
    }
  }

  /**
   * Handle task failed events
   */
  private handleTaskFailed(event: any): void {
    if (event.taskId && event.sessionId) {
      this.updateSubtask(event.sessionId, event.taskId, 'failed', 0);
    }
  }

  /**
   * Get default message for a phase
   */
  private getDefaultMessage(phase: TaskPhase): string {
    const messages: Record<TaskPhase, string> = {
      planning: 'Planning workflow...',
      execution: 'Executing tasks...',
      validation: 'Validating results...',
      complete: 'Complete!',
      failed: 'Failed',
    };
    return messages[phase];
  }

  /**
   * Clear old sessions (cleanup)
   */
  clearOldSessions(maxAge: number = 3600000): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.progressMap.forEach((progress, sessionId) => {
      if (now - progress.startedAt > maxAge) {
        toDelete.push(sessionId);
      }
    });

    toDelete.forEach((sessionId) => {
      this.progressMap.delete(sessionId);
      this.sseConnections.delete(sessionId);
    });

    if (toDelete.length > 0) {
      console.log(
        `[ProgressTrackingAgent] 🗑️ Cleaned up ${toDelete.length} old sessions`
      );
    }
  }
}

// Singleton instance
export const progressTrackingAgent = new ProgressTrackingAgent();

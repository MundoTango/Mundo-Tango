/**
 * MB.MD GOD COMMAND #4: Background Task Queue System
 * Allows backend-triggered VibeCoding operations without user chat interaction
 * Supports: CLI commands, API triggers, webhooks, scheduled tasks
 */

import { db } from '@db';
import { eq } from 'drizzle-orm';
import * as VibeCodingTools from './VibeCodingToolService';
import { vibeCodingMasterLoop } from './VibeCodingMasterLoop';

interface QueueTask {
  id: string;
  type: 'vibe_code' | 'file_operation' | 'github_sync' | 'analysis';
  priority: 'low' | 'normal' | 'high' | 'critical';
  command: string;
  params: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

class TaskQueueService {
  private queue: QueueTask[] = [];
  private processing = false;
  private maxConcurrent = 3;
  private activeCount = 0;

  /**
   * Add a new task to the queue
   */
  async enqueue(task: Omit<QueueTask, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const queueTask: QueueTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date()
    };

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    this.queue.push(queueTask);
    this.queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    console.log(`[TaskQueue] Enqueued task ${queueTask.id}: ${task.command}`);

    // Start processing if not already running
    if (!this.processing) {
      this.startProcessing();
    }

    return queueTask.id;
  }

  /**
   * Process tasks from the queue
   */
  private async startProcessing() {
    if (this.processing) return;
    this.processing = true;

    console.log('[TaskQueue] Started processing queue');

    while (this.queue.length > 0 || this.activeCount > 0) {
      // Process tasks up to max concurrent limit
      while (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
        const task = this.queue.shift();
        if (task) {
          this.activeCount++;
          this.processTask(task).finally(() => {
            this.activeCount--;
          });
        }
      }

      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
    console.log('[TaskQueue] Finished processing queue');
  }

  /**
   * Process a single task
   */
  private async processTask(task: QueueTask) {
    task.status = 'processing';
    task.startedAt = new Date();

    console.log(`[TaskQueue] Processing task ${task.id}: ${task.command}`);

    try {
      let result;

      switch (task.type) {
        case 'vibe_code':
          result = await this.executeVibeCodeTask(task);
          break;
        case 'file_operation':
          result = await this.executeFileOperation(task);
          break;
        case 'github_sync':
          result = await this.executeGitHubSync(task);
          break;
        case 'analysis':
          result = await this.executeAnalysis(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date();

      console.log(`[TaskQueue] Completed task ${task.id}`);
    } catch (error: any) {
      task.status = 'failed';
      task.error = error.message;
      task.completedAt = new Date();

      console.error(`[TaskQueue] Failed task ${task.id}:`, error);
    }
  }

  /**
   * Execute VibeCoding task
   */
  private async executeVibeCodeTask(task: QueueTask) {
    const { command, params } = task;

    // Use VibeCoding master loop for full integration
    const result = await vibeCodingMasterLoop({
      userMessage: command,
      context: params.context || {},
      streamThoughts: params.streamThoughts !== false
    });

    return result;
  }

  /**
   * Execute file operation task
   */
  private async executeFileOperation(task: QueueTask) {
    const { command, params } = task;

    if (command === 'list') {
      return await VibeCodingTools.listDirectory(params.path || '.');
    } else if (command === 'read') {
      return await VibeCodingTools.readFile(params.path);
    } else if (command === 'write') {
      return await VibeCodingTools.writeFile(params.path, params.content);
    } else if (command === 'search') {
      return await VibeCodingTools.searchFiles(params.pattern, params.path);
    }

    throw new Error(`Unknown file operation: ${command}`);
  }

  /**
   * Execute GitHub sync task
   */
  private async executeGitHubSync(task: QueueTask) {
    // Placeholder for GitHub integration
    // TODO: Implement GitHub API calls
    console.log('[TaskQueue] GitHub sync not yet implemented');
    return { success: false, message: 'GitHub sync not yet implemented' };
  }

  /**
   * Execute analysis task
   */
  private async executeAnalysis(task: QueueTask) {
    // Placeholder for code analysis
    // TODO: Implement code analysis logic
    console.log('[TaskQueue] Analysis not yet implemented');
    return { success: false, message: 'Analysis not yet implemented' };
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): QueueTask | undefined {
    return this.queue.find(t => t.id === taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): QueueTask[] {
    return [...this.queue];
  }

  /**
   * Clear completed tasks
   */
  clearCompleted() {
    this.queue = this.queue.filter(t => t.status !== 'completed');
  }
}

// Singleton instance
export const taskQueue = new TaskQueueService();

/**
 * CLI Command Handler - Can be called from shell scripts
 * Usage: node -e "require('./server/services/mrBlue/TaskQueueService').executeCommand('list files in server/services/mrBlue')"
 */
export async function executeCommand(command: string, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal') {
  const taskId = await taskQueue.enqueue({
    type: 'vibe_code',
    priority,
    command,
    params: {}
  });

  console.log(`Enqueued command with task ID: ${taskId}`);
  return taskId;
}

/**
 * Webhook Handler - Can be triggered by external services
 */
export async function handleWebhook(payload: any) {
  const { command, type = 'vibe_code', priority = 'normal', params = {} } = payload;

  const taskId = await taskQueue.enqueue({
    type,
    priority,
    command,
    params
  });

  return { success: true, taskId };
}

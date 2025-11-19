import { Worker, Job, Queue } from 'bullmq';
import { getRedisClient } from '../cache/redis-cache';
import { jobDuration, jobTotal } from '../monitoring/prometheus';
import { AutonomousEngine } from '../services/mrBlue/AutonomousEngine';
import { ConversationOrchestrator } from '../services/ConversationOrchestrator';

/**
 * AUTONOMOUS WORKER - 24/7 CONTINUOUS LOOP
 * MB.MD Protocol v9.2: Phase 2 - Autonomous Loop Orchestrator
 * 
 * Workflow:
 * 1. Discover tasks via AutonomousEngine
 * 2. Route via ConversationOrchestrator
 * 3. Execute actions (VibeCoding, self-healing, etc.)
 * 4. Learn from results (LearningCoordinator)
 * 5. Repeat every 60 seconds
 * 
 * Integration Points:
 * - AutonomousEngine: Task discovery & execution
 * - A2A Protocol: Agent collaboration
 * - LearningCoordinator: Continuous learning
 * - LifeCEO: Priority-based decision making
 */

interface AutonomousLoopJob {
  loopIteration: number;
  triggeredBy: 'scheduled' | 'manual' | 'agent';
  context?: Record<string, any>;
}

interface AutonomousLoopResult {
  success: boolean;
  tasksDiscovered: number;
  tasksExecuted: number;
  agentsActivated: number;
  learningEvents: number;
  errors: string[];
  duration: number;
  nextLoopAt: Date;
}

// Initialize services (singleton pattern)
let autonomousEngine: AutonomousEngine | null = null;
let conversationOrchestrator: ConversationOrchestrator | null = null;

async function getAutonomousEngine(): Promise<AutonomousEngine> {
  if (!autonomousEngine) {
    autonomousEngine = new AutonomousEngine();
    await autonomousEngine.initialize();
  }
  return autonomousEngine;
}

async function getConversationOrchestrator(): Promise<ConversationOrchestrator> {
  if (!conversationOrchestrator) {
    conversationOrchestrator = new ConversationOrchestrator();
    await conversationOrchestrator.initialize();
  }
  return conversationOrchestrator;
}

/**
 * Main autonomous loop processor
 */
async function processAutonomousLoop(job: Job<AutonomousLoopJob>): Promise<AutonomousLoopResult> {
  const start = Date.now();
  const errors: string[] = [];
  
  console.log(`[Autonomous Loop] Starting iteration ${job.data.loopIteration}...`);
  
  try {
    const engine = await getAutonomousEngine();
    const orchestrator = await getConversationOrchestrator();
    
    const result: AutonomousLoopResult = {
      success: true,
      tasksDiscovered: 0,
      tasksExecuted: 0,
      agentsActivated: 0,
      learningEvents: 0,
      errors: [],
      duration: 0,
      nextLoopAt: new Date(Date.now() + 60000), // 1 minute
    };
    
    // Step 1: Discover tasks (via AutonomousEngine)
    // TODO: Wire AutonomousEngine.discoverTasks() - Phase 2 Task 2
    console.log('[Autonomous Loop] Task discovery: Not yet implemented');
    
    // Step 2: Check platform health
    // TODO: Trigger self-healing agents - Phase 2 Task 2
    console.log('[Autonomous Loop] Platform health check: Not yet implemented');
    
    // Step 3: Execute high-priority tasks
    // TODO: Use LifeCEO decision matrix - Phase 2 Task 5
    console.log('[Autonomous Loop] Task execution: Not yet implemented');
    
    // Step 4: Learn from results
    // TODO: Wire LearningCoordinator - Phase 2 Task 4
    console.log('[Autonomous Loop] Learning: Not yet implemented');
    
    // Step 5: Sync knowledge across agents
    // TODO: Wire AgentKnowledgeSync - Phase 2 Task 4
    console.log('[Autonomous Loop] Knowledge sync: Not yet implemented');
    
    result.duration = Date.now() - start;
    
    jobDuration.observe({ job_type: 'autonomous', status: 'success' }, result.duration / 1000);
    jobTotal.inc({ job_type: 'autonomous', status: 'success' });
    
    console.log(`[Autonomous Loop] Iteration ${job.data.loopIteration} completed in ${result.duration}ms`);
    
    return result;
    
  } catch (error) {
    const duration = Date.now() - start;
    errors.push(error instanceof Error ? error.message : String(error));
    
    jobDuration.observe({ job_type: 'autonomous', status: 'failed' }, duration / 1000);
    jobTotal.inc({ job_type: 'autonomous', status: 'failed' });
    
    console.error('[Autonomous Loop] Failed:', error);
    
    return {
      success: false,
      tasksDiscovered: 0,
      tasksExecuted: 0,
      agentsActivated: 0,
      learningEvents: 0,
      errors,
      duration,
      nextLoopAt: new Date(Date.now() + 60000),
    };
  }
}

// Create BullMQ Worker
const autonomousWorker = new Worker<AutonomousLoopJob, AutonomousLoopResult>(
  'autonomous-loop-queue',
  processAutonomousLoop,
  {
    connection: getRedisClient(),
    concurrency: 1, // Only one loop at a time
    limiter: {
      max: 1,
      duration: 60000, // Max 1 job per minute
    },
  }
);

// Event handlers
autonomousWorker.on('completed', (job, result) => {
  console.log(`[Autonomous Loop] Job ${job.id} completed:`, {
    tasksDiscovered: result.tasksDiscovered,
    tasksExecuted: result.tasksExecuted,
    agentsActivated: result.agentsActivated,
    learningEvents: result.learningEvents,
    duration: result.duration,
  });
});

autonomousWorker.on('failed', (job, err) => {
  console.error(`[Autonomous Loop] Job ${job?.id} failed:`, err);
});

autonomousWorker.on('error', (err) => {
  console.error('[Autonomous Loop] Worker error:', err);
});

// Create queue for scheduling
const autonomousQueue = new Queue<AutonomousLoopJob>('autonomous-loop-queue', {
  connection: getRedisClient(),
});

/**
 * Start the 24/7 autonomous loop
 */
export async function startAutonomousLoop(): Promise<void> {
  console.log('[Autonomous Loop] Starting 24/7 continuous loop...');
  
  // Remove any existing repeatable jobs
  const repeatableJobs = await autonomousQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await autonomousQueue.removeRepeatableByKey(job.key);
  }
  
  // Schedule continuous loop (every 60 seconds)
  await autonomousQueue.add(
    'autonomous-loop',
    {
      loopIteration: 1,
      triggeredBy: 'scheduled',
    },
    {
      repeat: {
        every: 60000, // 1 minute
      },
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 50, // Keep last 50 failed jobs
    }
  );
  
  console.log('[Autonomous Loop] ✅ 24/7 loop started (60s intervals)');
}

/**
 * Stop the autonomous loop
 */
export async function stopAutonomousLoop(): Promise<void> {
  console.log('[Autonomous Loop] Stopping continuous loop...');
  
  const repeatableJobs = await autonomousQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await autonomousQueue.removeRepeatableByKey(job.key);
  }
  
  await autonomousWorker.close();
  console.log('[Autonomous Loop] ✅ Loop stopped');
}

/**
 * Manually trigger a loop iteration
 */
export async function triggerManualLoop(context?: Record<string, any>): Promise<void> {
  console.log('[Autonomous Loop] Manual trigger requested');
  
  await autonomousQueue.add('autonomous-loop-manual', {
    loopIteration: 0,
    triggeredBy: 'manual',
    context,
  });
}

/**
 * Get loop status
 */
export async function getLoopStatus() {
  const activeJobs = await autonomousQueue.getActive();
  const waitingJobs = await autonomousQueue.getWaiting();
  const completedJobs = await autonomousQueue.getCompleted();
  const failedJobs = await autonomousQueue.getFailed();
  const repeatableJobs = await autonomousQueue.getRepeatableJobs();
  
  return {
    isRunning: repeatableJobs.length > 0,
    activeJobs: activeJobs.length,
    waitingJobs: waitingJobs.length,
    completedJobs: completedJobs.length,
    failedJobs: failedJobs.length,
    repeatableJobs: repeatableJobs.length,
    nextLoop: repeatableJobs.length > 0 ? new Date(repeatableJobs[0].next) : null,
  };
}

export { autonomousWorker, autonomousQueue };

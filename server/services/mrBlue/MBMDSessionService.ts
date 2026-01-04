/**
 * MB.MD Session Service
 * 
 * Manages mb.md sessions and auto-invokes agents at proper trigger points.
 * This makes the Leadership Agent System actually operational rather than just documentation.
 * 
 * God Command #0: AUTO-INVOKE GitHub Practices + Plan Tracker on EVERY mb.md session
 */

import { gitHubPracticesAgent } from './agents/leadership/GitHubPracticesAgent';
import { planTrackerAgent } from './agents/leadership/PlanTrackerAgent';
import { ctoAgent } from './agents/leadership/CTOAgent';
import { ceoAgent } from './agents/leadership/CEOAgent';

export interface MBMDSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  userId?: number;
  status: 'active' | 'completed' | 'abandoned';
  tasksStarted: TaskRecord[];
  tasksCompleted: TaskRecord[];
  agentInvocations: AgentInvocation[];
  gitPracticesCheck?: GitPracticesCheck;
  planStatus?: PlanStatus;
}

export interface TaskRecord {
  id: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  status: 'in_progress' | 'completed' | 'failed';
  agentUsed?: string;
}

export interface AgentInvocation {
  agentId: string;
  trigger: string;
  timestamp: Date;
  result: any;
  success: boolean;
}

export interface GitPracticesCheck {
  branch: string;
  stagedFiles: number;
  modifiedFiles: number;
  untrackedFiles: number;
  conventionalCommitReminder: boolean;
  checkedAt: Date;
}

export interface PlanStatus {
  activePlans: number;
  totalProgress: number;
  tasksCompleted: number;
  tasksPending: number;
  checkedAt: Date;
}

class MBMDSessionService {
  private currentSession: MBMDSession | null = null;
  private sessionHistory: MBMDSession[] = [];

  /**
   * Start a new mb.md session - triggers auto-invoke agents
   * Called when user invokes "use @mb.md"
   */
  async startSession(userId?: number): Promise<{
    session: MBMDSession;
    autoInvokeResults: {
      gitPractices: any;
      planTracker: any;
    };
  }> {
    // End any existing session first
    if (this.currentSession) {
      await this.endSession('New session started');
    }

    const sessionId = `mbmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      id: sessionId,
      startTime: new Date(),
      userId,
      status: 'active',
      tasksStarted: [],
      tasksCompleted: [],
      agentInvocations: [],
    };

    console.log(`[MBMD Session] Started: ${sessionId}`);

    // AUTO-INVOKE: GitHub Practices Agent (session:start trigger)
    const gitResult = await this.invokeGitHubPractices('session:start');
    
    // AUTO-INVOKE: Plan Tracker Agent (session:start trigger)
    planTrackerAgent.startSession();
    const planResult = await this.invokePlanTracker('session:start');

    return {
      session: this.currentSession,
      autoInvokeResults: {
        gitPractices: gitResult,
        planTracker: planResult,
      },
    };
  }

  /**
   * Record when a task is started
   */
  async startTask(description: string, agentId?: string): Promise<TaskRecord> {
    if (!this.currentSession) {
      await this.startSession();
    }

    const task: TaskRecord = {
      id: `task-${Date.now()}`,
      description,
      startTime: new Date(),
      status: 'in_progress',
      agentUsed: agentId,
    };

    this.currentSession!.tasksStarted.push(task);

    // AUTO-INVOKE: Plan Tracker (task:start trigger)
    planTrackerAgent.recordTaskStart(description);
    await this.invokePlanTracker('task:start', { task: description });

    console.log(`[MBMD Session] Task started: ${description}`);
    return task;
  }

  /**
   * Record when a task is completed
   */
  async completeTask(taskId: string, success: boolean = true): Promise<TaskRecord | null> {
    if (!this.currentSession) return null;

    const task = this.currentSession.tasksStarted.find(t => t.id === taskId);
    if (!task) return null;

    task.endTime = new Date();
    task.status = success ? 'completed' : 'failed';
    
    if (success) {
      this.currentSession.tasksCompleted.push(task);
      planTrackerAgent.recordTaskComplete(task.description);
    }

    // AUTO-INVOKE: GitHub Practices (task:complete trigger)
    await this.invokeGitHubPractices('task:complete', { task: task.description });
    
    // AUTO-INVOKE: Plan Tracker (task:complete trigger)
    await this.invokePlanTracker('task:complete', { task: task.description });

    console.log(`[MBMD Session] Task completed: ${task.description}`);
    return task;
  }

  /**
   * End the current session
   */
  async endSession(reason?: string): Promise<MBMDSession | null> {
    if (!this.currentSession) return null;

    this.currentSession.endTime = new Date();
    this.currentSession.status = 'completed';

    // AUTO-INVOKE: Plan Tracker (session:end trigger)
    const sessionSummary = await planTrackerAgent.endSession();
    await this.invokePlanTracker('session:end', { summary: sessionSummary });

    // Store in history
    this.sessionHistory.push(this.currentSession);
    
    // Keep only last 10 sessions
    if (this.sessionHistory.length > 10) {
      this.sessionHistory = this.sessionHistory.slice(-10);
    }

    const endedSession = this.currentSession;
    console.log(`[MBMD Session] Ended: ${endedSession.id} (${reason || 'normal'})`);
    
    this.currentSession = null;
    return endedSession;
  }

  /**
   * Get the current active session
   */
  getCurrentSession(): MBMDSession | null {
    return this.currentSession;
  }

  /**
   * Get session history
   */
  getSessionHistory(): MBMDSession[] {
    return this.sessionHistory;
  }

  /**
   * Invoke GitHub Practices Agent
   */
  private async invokeGitHubPractices(trigger: string, context?: any): Promise<any> {
    try {
      const result = await gitHubPracticesAgent.execute(
        { description: `Auto-invoke on ${trigger}`, priority: 'medium', context },
        context
      );

      const gitStatus = await gitHubPracticesAgent.getGitStatus();

      this.currentSession?.agentInvocations.push({
        agentId: 'github-practices-agent',
        trigger,
        timestamp: new Date(),
        result,
        success: true,
      });

      // Store git practices check in session
      if (this.currentSession) {
        this.currentSession.gitPracticesCheck = {
          branch: gitStatus.branch,
          stagedFiles: gitStatus.staged.length,
          modifiedFiles: gitStatus.modified.length,
          untrackedFiles: gitStatus.untracked.length,
          conventionalCommitReminder: true,
          checkedAt: new Date(),
        };
      }

      return {
        success: true,
        trigger,
        gitStatus,
        decision: result.decision,
        recommendations: result.reasoning,
      };
    } catch (error) {
      console.error('[MBMD Session] GitHub Practices invoke error:', error);
      this.currentSession?.agentInvocations.push({
        agentId: 'github-practices-agent',
        trigger,
        timestamp: new Date(),
        result: { error: String(error) },
        success: false,
      });
      return { success: false, error: String(error) };
    }
  }

  /**
   * Invoke Plan Tracker Agent
   */
  private async invokePlanTracker(trigger: string, context?: any): Promise<any> {
    try {
      const result = await planTrackerAgent.execute(
        { description: `Auto-invoke on ${trigger}`, priority: 'medium', context },
        context
      );

      const plans = await planTrackerAgent.loadAllPlans();
      
      this.currentSession?.agentInvocations.push({
        agentId: 'plan-tracker-agent',
        trigger,
        timestamp: new Date(),
        result,
        success: true,
      });

      // Store plan status in session
      if (this.currentSession) {
        const totalProgress = plans.length > 0
          ? Math.round(plans.reduce((sum, p) => sum + p.progress, 0) / plans.length)
          : 0;
        
        this.currentSession.planStatus = {
          activePlans: plans.length,
          totalProgress,
          tasksCompleted: this.currentSession.tasksCompleted.length,
          tasksPending: this.currentSession.tasksStarted.filter(t => t.status === 'in_progress').length,
          checkedAt: new Date(),
        };
      }

      return {
        success: true,
        trigger,
        plans: plans.map(p => ({ name: p.name, progress: p.progress, status: p.status })),
        decision: result.decision,
      };
    } catch (error) {
      console.error('[MBMD Session] Plan Tracker invoke error:', error);
      this.currentSession?.agentInvocations.push({
        agentId: 'plan-tracker-agent',
        trigger,
        timestamp: new Date(),
        result: { error: String(error) },
        success: false,
      });
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get session status summary
   */
  getSessionStatus(): {
    hasActiveSession: boolean;
    session: MBMDSession | null;
    summary: string;
  } {
    if (!this.currentSession) {
      return {
        hasActiveSession: false,
        session: null,
        summary: 'No active mb.md session. Start one with "use @mb.md"',
      };
    }

    const duration = Date.now() - this.currentSession.startTime.getTime();
    const durationMins = Math.round(duration / 60000);

    return {
      hasActiveSession: true,
      session: this.currentSession,
      summary: `
Session: ${this.currentSession.id}
Duration: ${durationMins} minutes
Tasks Started: ${this.currentSession.tasksStarted.length}
Tasks Completed: ${this.currentSession.tasksCompleted.length}
Agent Invocations: ${this.currentSession.agentInvocations.length}
Git Branch: ${this.currentSession.gitPracticesCheck?.branch || 'unknown'}
Plan Progress: ${this.currentSession.planStatus?.totalProgress || 0}%
      `.trim(),
    };
  }

  /**
   * Ask a leadership agent for advice
   */
  async askAgent(agentId: string, question: string): Promise<string> {
    switch (agentId) {
      case 'cto-agent':
        return await ctoAgent.advise(question);
      case 'ceo-agent':
        return await ceoAgent.advise(question);
      case 'github-practices-agent':
        return await gitHubPracticesAgent.advise(question);
      case 'plan-tracker-agent':
        return await planTrackerAgent.advise(question);
      default:
        return `Unknown agent: ${agentId}`;
    }
  }

  /**
   * Get git status via GitHub Practices Agent
   */
  async getGitStatus(): Promise<GitPracticesCheck> {
    return await gitHubPracticesAgent.getGitStatus();
  }

  /**
   * Get plan status via Plan Tracker Agent
   */
  async getPlanStatus(): Promise<PlanStatus> {
    const plans = await planTrackerAgent.loadAllPlans();
    const totalProgress = plans.length > 0
      ? Math.round(plans.reduce((sum, p) => sum + p.progress, 0) / plans.length)
      : 0;
    
    return {
      plans,
      totalProgress,
      activePlan: plans.find(p => p.status === 'in_progress')?.name || null,
    };
  }
}

// Singleton instance
export const mbmdSessionService = new MBMDSessionService();

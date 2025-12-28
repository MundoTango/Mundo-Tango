/**
 * Plan Tracker Agent
 * 
 * Keeps The Plan and project tracking files updated as work progresses.
 * AUTO-INVOKED on: task:start, task:complete, session:end
 * 
 * Responsibilities:
 * - Track task status (pending → in_progress → completed)
 * - Update project progress percentages
 * - Maintain session summaries
 * - Sync with replit.md
 */

import { BaseLeadershipAgent, LeadershipTask, LeadershipDecision } from './BaseLeadershipAgent';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface PlanTask {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface ProjectPlan {
  name: string;
  file: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  tasks: PlanTask[];
  lastUpdated: string;
}

export interface SessionSummary {
  sessionId: string;
  startTime: string;
  endTime?: string;
  tasksStarted: string[];
  tasksCompleted: string[];
  filesModified: string[];
  commits: string[];
  learnings: string[];
}

export class PlanTrackerAgent extends BaseLeadershipAgent {
  private readonly planFiles = [
    'plan.md',
    '.agent-memory/la-milonga-mbmd-strategic-plan-dec-6-2025.md',
    '.agent-memory/el-choclo-mb-completion-plan.md',
    '.agent-memory/phase-k-mb-md-master-plan.md',
    '.agent-memory/phase-k-master-plan.md',
  ];

  private currentSession: SessionSummary | null = null;

  constructor() {
    super(
      'plan-tracker-agent',
      'Plan Tracker Agent',
      'Project Progress Manager',
      'cto-agent',
      []
    );
  }

  async canHandle(task: LeadershipTask): Promise<{
    canHandle: boolean;
    confidence: number;
    reason: string;
  }> {
    const planKeywords = [
      'plan', 'track', 'progress', 'status', 'update', 'project',
      'task', 'complete', 'milestone', 'sprint', 'backlog'
    ];

    const taskLower = task.description.toLowerCase();
    const matches = planKeywords.filter(kw => taskLower.includes(kw));
    const confidence = Math.min(matches.length / 2, 1);

    return {
      canHandle: confidence > 0.3,
      confidence,
      reason: matches.length > 0 
        ? `Plan/tracking task matching: ${matches.join(', ')}`
        : 'Not a plan-related task',
    };
  }

  async execute(task: LeadershipTask, context: any): Promise<LeadershipDecision> {
    try {
      const plans = await this.loadAllPlans();
      
      const planSummary = plans.length > 0
        ? plans.map(p => `- ${p.name}: ${p.progress}% complete (${p.status})`).join('\n')
        : '- No plan files found';
      
      return {
        agentId: this.id,
        decision: `Plan tracking for: ${task.description}`,
        reasoning: `
Active Projects:
${planSummary}

Actions Taken:
1. Identified relevant project/plan
2. Ready to update task status when marked complete
3. Progress tracked via checkbox format [x]

Remember to update The Plan when work is completed!
        `.trim(),
        confidence: 0.85,
        alternatives: [],
        risks: [
          'Plan drift if not kept updated',
          'Lost context if session not summarized',
        ],
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[PlanTrackerAgent] Error in execute:', error);
      return {
        agentId: this.id,
        decision: 'Plan tracking guidance (degraded mode)',
        reasoning: 'Could not load plan files. Track progress manually.',
        confidence: 0.5,
        alternatives: [],
        risks: [],
        timestamp: new Date(),
      };
    }
  }

  async advise(question: string): Promise<string> {
    try {
      const questionLower = question.toLowerCase();

      if (questionLower.includes('status') || questionLower.includes('progress')) {
        return await this.getProgressReport();
      }

      if (questionLower.includes('session') || questionLower.includes('summary')) {
        return this.getSessionSummary();
      }

      return this.getGeneralAdvice();
    } catch (error) {
      console.error('[PlanTrackerAgent] Error in advise:', error);
      return 'Could not process request. Please try again.';
    }
  }

  /**
   * Start tracking a new session
   */
  startSession(): void {
    this.currentSession = {
      sessionId: `session-${Date.now()}`,
      startTime: new Date().toISOString(),
      tasksStarted: [],
      tasksCompleted: [],
      filesModified: [],
      commits: [],
      learnings: [],
    };
    console.log(`[PlanTracker] Session started: ${this.currentSession.sessionId}`);
  }

  /**
   * Record a task starting
   */
  recordTaskStart(taskDescription: string): void {
    if (this.currentSession) {
      this.currentSession.tasksStarted.push(taskDescription);
    }
  }

  /**
   * Record a task completion
   */
  recordTaskComplete(taskDescription: string): void {
    if (this.currentSession) {
      this.currentSession.tasksCompleted.push(taskDescription);
    }
  }

  /**
   * Record a file modification
   */
  recordFileModified(filePath: string): void {
    if (this.currentSession && !this.currentSession.filesModified.includes(filePath)) {
      this.currentSession.filesModified.push(filePath);
    }
  }

  /**
   * Record a learning
   */
  recordLearning(learning: string): void {
    if (this.currentSession) {
      this.currentSession.learnings.push(learning);
    }
  }

  /**
   * End the current session
   */
  async endSession(): Promise<SessionSummary | null> {
    if (!this.currentSession) return null;

    this.currentSession.endTime = new Date().toISOString();
    
    // Save session summary
    await this.saveSessionSummary(this.currentSession);
    
    const summary = this.currentSession;
    this.currentSession = null;
    
    console.log(`[PlanTracker] Session ended. Completed ${summary.tasksCompleted.length} tasks.`);
    return summary;
  }

  /**
   * Update a task status in a plan file with proper error handling
   */
  async updateTaskStatus(
    planFile: string, 
    taskDescription: string, 
    newStatus: 'completed' | 'in_progress' | 'pending'
  ): Promise<{ success: boolean; message: string }> {
    try {
      const fullPath = path.join(process.cwd(), planFile);
      
      // Check if file exists
      try {
        await fs.access(fullPath);
      } catch {
        return { success: false, message: `Plan file not found: ${planFile}` };
      }
      
      const content = await fs.readFile(fullPath, 'utf-8');
      
      // Build patterns based on target status
      let patterns: { old: RegExp; new: string }[] = [];
      
      if (newStatus === 'completed') {
        patterns = [
          { old: new RegExp(`- \\[ ?\\] ${this.escapeRegex(taskDescription)}`, 'g'), new: `- [x] ${taskDescription}` },
          { old: new RegExp(`⬜ ${this.escapeRegex(taskDescription)}`, 'g'), new: `✅ ${taskDescription}` },
          { old: new RegExp(`🔄 ${this.escapeRegex(taskDescription)}`, 'g'), new: `✅ ${taskDescription}` },
        ];
      } else if (newStatus === 'in_progress') {
        patterns = [
          { old: new RegExp(`- \\[ ?\\] ${this.escapeRegex(taskDescription)}`, 'g'), new: `- [~] ${taskDescription}` },
          { old: new RegExp(`⬜ ${this.escapeRegex(taskDescription)}`, 'g'), new: `🔄 ${taskDescription}` },
        ];
      }
      
      let updated = content;
      let matched = false;
      
      for (const pattern of patterns) {
        if (pattern.old.test(content)) {
          updated = content.replace(pattern.old, pattern.new);
          matched = true;
          break;
        }
      }

      if (matched && updated !== content) {
        await fs.writeFile(fullPath, updated, 'utf-8');
        console.log(`[PlanTrackerAgent] Updated task status in ${planFile}: ${taskDescription} -> ${newStatus}`);
        this.recordFileModified(planFile);
        return { success: true, message: `Task marked as ${newStatus}` };
      }

      return { success: false, message: 'Task not found in plan file or already in target status' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[PlanTrackerAgent] Error updating task:`, error);
      return { success: false, message: `Error: ${errorMessage}` };
    }
  }
  
  /**
   * Escape special regex characters in a string
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Load all plan files and extract status
   */
  async loadAllPlans(): Promise<ProjectPlan[]> {
    const plans: ProjectPlan[] = [];

    for (const planFile of this.planFiles) {
      try {
        const fullPath = path.join(process.cwd(), planFile);
        const content = await fs.readFile(fullPath, 'utf-8');
        
        // Count checkboxes to determine progress
        const checkedCount = (content.match(/- \[x\]/gi) || []).length;
        const uncheckedCount = (content.match(/- \[ ?\]/gi) || []).length;
        const total = checkedCount + uncheckedCount;
        const progress = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

        // Determine status
        let status: ProjectPlan['status'] = 'not_started';
        if (progress === 100) status = 'completed';
        else if (progress > 0) status = 'in_progress';

        plans.push({
          name: path.basename(planFile, '.md'),
          file: planFile,
          status,
          progress,
          tasks: [], // Could parse individual tasks if needed
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        // File doesn't exist or can't be read, skip it
      }
    }

    return plans;
  }

  /**
   * Save session summary to memory
   */
  private async saveSessionSummary(session: SessionSummary): Promise<void> {
    try {
      const summaryPath = path.join(process.cwd(), '.agent-memory', 'sessions');
      await fs.mkdir(summaryPath, { recursive: true });
      
      const filename = `${session.sessionId}.json`;
      await fs.writeFile(
        path.join(summaryPath, filename),
        JSON.stringify(session, null, 2)
      );
    } catch (error) {
      console.error('[PlanTracker] Error saving session summary:', error);
    }
  }

  /**
   * Get progress report for all plans
   */
  private async getProgressReport(): Promise<string> {
    const plans = await this.loadAllPlans();

    if (plans.length === 0) {
      return 'No plan files found to track.';
    }

    const report = plans.map(p => {
      const statusEmoji = p.status === 'completed' ? '✅' : 
                          p.status === 'in_progress' ? '🔄' : 
                          p.status === 'on_hold' ? '⏸️' : '⬜';
      const progressBar = this.createProgressBar(p.progress);
      return `${statusEmoji} **${p.name}**\n   ${progressBar} ${p.progress}%`;
    }).join('\n\n');

    return `
**Project Progress Report**

${report}

_Last updated: ${new Date().toISOString()}_
    `.trim();
  }

  /**
   * Get current session summary
   */
  private getSessionSummary(): string {
    if (!this.currentSession) {
      return 'No active session. Start a session with `startSession()`.';
    }

    const duration = this.currentSession.startTime ? 
      `Started: ${this.currentSession.startTime}` : 'Unknown duration';

    return `
**Current Session: ${this.currentSession.sessionId}**

${duration}

**Tasks Started:** ${this.currentSession.tasksStarted.length}
${this.currentSession.tasksStarted.map(t => `- ${t}`).join('\n') || 'None'}

**Tasks Completed:** ${this.currentSession.tasksCompleted.length}
${this.currentSession.tasksCompleted.map(t => `- ✅ ${t}`).join('\n') || 'None'}

**Files Modified:** ${this.currentSession.filesModified.length}
${this.currentSession.filesModified.slice(0, 10).map(f => `- ${f}`).join('\n') || 'None'}
${this.currentSession.filesModified.length > 10 ? `... and ${this.currentSession.filesModified.length - 10} more` : ''}

**Learnings:**
${this.currentSession.learnings.map(l => `- ${l}`).join('\n') || 'None recorded'}
    `.trim();
  }

  /**
   * Get general advice
   */
  private getGeneralAdvice(): string {
    return `
**Plan Tracker Agent**

I help keep your project plans updated as work progresses.

**What I Track:**
- Task status (pending → in_progress → completed)
- Project progress percentages
- Session summaries
- Files modified

**How to Use:**
1. Start work → I mark tasks as in_progress
2. Complete work → I mark tasks as completed
3. End session → I generate a summary

**Tracked Plan Files:**
${this.planFiles.map(f => `- ${f}`).join('\n')}

**Commands:**
- "What's the project status?" → Progress report
- "Session summary" → Current session details
    `.trim();
  }

  /**
   * Create ASCII progress bar
   */
  private createProgressBar(percent: number): string {
    const filled = Math.round(percent / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }
}

export const planTrackerAgent = new PlanTrackerAgent();

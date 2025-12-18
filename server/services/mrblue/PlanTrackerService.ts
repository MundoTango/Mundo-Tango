/**
 * PlanTrackerService - Track talent contributor work and sync with The Plan
 * Part of Talent Match Recruiting System
 * Connects approved volunteers to Plan tasks and tracks their contributions
 */

import { db } from '../../db';
import { eq, and, sql } from 'drizzle-orm';
import { planItems, planLinks, workLog, assignments, users } from '../../../shared/schema';

export interface PlanItem {
  id: number;
  title: string;
  description: string;
  type: 'epic' | 'task' | 'subtask';
  status: 'open' | 'in_progress' | 'review' | 'done';
  assignedUsers: number[];
  progress: number;
  parentId?: number;
  requiredSkills?: string[];
  estimatedHours?: number;
}

export interface WorkLogEntry {
  userId: number;
  planItemId: number;
  action: 'started' | 'progress_update' | 'pr_opened' | 'pr_merged' | 'completed';
  metadata: {
    prUrl?: string;
    commitSha?: string;
    progressPercent?: number;
    notes?: string;
  };
}

export class PlanTrackerService {
  /**
   * Link an assignment (from Talent Match) to Plan items
   */
  async linkAssignmentToPlan(assignmentId: number, planItemIds: number[]): Promise<void> {
    const links = planItemIds.map(planItemId => ({
      assignmentId,
      planItemId,
      linkedAt: new Date()
    }));

    await db.insert(planLinks).values(links);

    // Update Plan items to include assigned user
    const assignment = await db.query.assignments.findFirst({
      where: eq(assignments.id, assignmentId),
      with: { volunteer: true }
    });

    if (assignment?.volunteer?.userId) {
      for (const planItemId of planItemIds) {
        const item = await db.query.planItems.findFirst({
          where: eq(planItems.id, planItemId)
        });

        if (item) {
          const assignedUsers = item.assignedUsers || [];
          if (!assignedUsers.includes(assignment.volunteer.userId)) {
            await db.update(planItems)
              .set({
                assignedUsers: [...assignedUsers, assignment.volunteer.userId],
                status: 'in_progress'
              })
              .where(eq(planItems.id, planItemId));
          }
        }
      }
    }
  }

  /**
   * Track user work activity and update Plan progress
   */
  async trackUserWork(entry: WorkLogEntry): Promise<void> {
    // Log the work
    await db.insert(workLog).values({
      userId: entry.userId,
      planItemId: entry.planItemId,
      action: entry.action,
      metadata: entry.metadata,
      timestamp: new Date()
    });

    // Update Plan item progress if provided
    if (entry.metadata.progressPercent !== undefined) {
      await db.update(planItems)
        .set({
          progress: entry.metadata.progressPercent,
          status: entry.metadata.progressPercent === 100 ? 'done' : 'in_progress'
        })
        .where(eq(planItems.id, entry.planItemId));
    }

    // If PR merged or task completed, mark as done
    if (entry.action === 'pr_merged' || entry.action === 'completed') {
      await db.update(planItems)
        .set({
          progress: 100,
          status: 'done'
        })
        .where(eq(planItems.id, entry.planItemId));
    }
  }

  /**
   * Get assigned Plan tasks for a user
   */
  async getUserPlanTasks(userId: number): Promise<PlanItem[]> {
    const items = await db.query.planItems.findMany({
      where: sql`${userId} = ANY(${planItems.assignedUsers})`
    });

    return items as PlanItem[];
  }

  /**
   * Update Plan item progress
   */
  async updatePlanProgress(
    planItemId: number,
    progressPercent: number,
    completedBy: number
  ): Promise<void> {
    await db.update(planItems)
      .set({
        progress: progressPercent,
        status: progressPercent === 100 ? 'done' : 'in_progress'
      })
      .where(eq(planItems.id, planItemId));

    await this.trackUserWork({
      userId: completedBy,
      planItemId,
      action: 'progress_update',
      metadata: { progressPercent }
    });
  }

  /**
   * Generate work attribution report for a user
   */
  async generateWorkAttribution(
    userId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    contributions: WorkLogEntry[];
  }> {
    const tasks = await this.getUserPlanTasks(userId);
    
    let logsQuery = db.query.workLog.findMany({
      where: eq(workLog.userId, userId)
    });

    if (startDate && endDate) {
      logsQuery = db.query.workLog.findMany({
        where: and(
          eq(workLog.userId, userId),
          sql`${workLog.timestamp} BETWEEN ${startDate} AND ${endDate}`
        )
      });
    }

    const logs = await logsQuery;

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      contributions: logs as WorkLogEntry[]
    };
  }

  /**
   * Process GitHub webhook for work tracking
   */
  async processGitHubWebhook(payload: any): Promise<void> {
    const { action, pull_request, sender } = payload;

    if (!pull_request || !sender) return;

    // Find user by GitHub username
    const user = await db.query.users.findFirst({
      where: sql`${users.metadata}->>'githubUsername' = ${sender.login}`
    });

    if (!user) return;

    // Extract linked Plan item from PR description or labels
    const planItemMatch = pull_request.body?.match(/Plan Item: #(\d+)/i);
    if (!planItemMatch) return;

    const planItemId = parseInt(planItemMatch[1]);

    if (action === 'opened') {
      await this.trackUserWork({
        userId: user.id,
        planItemId,
        action: 'pr_opened',
        metadata: {
          prUrl: pull_request.html_url,
          commitSha: pull_request.head.sha
        }
      });
    } else if (action === 'closed' && pull_request.merged) {
      await this.trackUserWork({
        userId: user.id,
        planItemId,
        action: 'pr_merged',
        metadata: {
          prUrl: pull_request.html_url,
          commitSha: pull_request.merge_commit_sha
        }
      });
    }
  }
}

export const planTrackerService = new PlanTrackerService();

import { db } from '@shared/db';
import { eq, and } from 'drizzle-orm';
import { getUncachableGitHubClient } from '../lib/github-client';

/**
 * BLOCKER 7: GitHub Sync Service
 * 
 * Bidirectional sync between GitHub Issues/Comments and Plan Tracker:
 * - GitHub Issue → Plan Task
 * - GitHub Comment → Plan Comment
 * - Plan Task → GitHub Issue (when linked to repo)
 * - Webhook handling for real-time sync
 * - Conflict detection and resolution
 */
export class GitHubSyncService {
  /**
   * Sync GitHub Issue to Plan Task
   */
  static async syncGitHubIssueToPlanTask(
    githubIssueNumber: number,
    githubRepoOwner: string,
    githubRepoName: string,
    projectId: number
  ): Promise<{ taskId: number; action: 'created' | 'updated' }> {
    const octokit = await getUncachableGitHubClient();

    // Fetch issue from GitHub
    const { data: issue } = await octokit.issues.get({
      owner: githubRepoOwner,
      repo: githubRepoName,
      issue_number: githubIssueNumber,
    });

    const externalId = `${githubRepoOwner}/${githubRepoName}#${githubIssueNumber}`;

    // Check if mapping already exists
    const [existingMapping] = await db.execute<any>(`
      SELECT internal_id FROM sync_mappings
      WHERE external_source = 'github'
        AND external_id = $1
        AND internal_type = 'plan_task'
    `, [externalId]);

    let taskId: number;
    let action: 'created' | 'updated';

    if (existingMapping) {
      // Update existing task
      taskId = existingMapping.internal_id;
      await db.execute(`
        UPDATE plan_tasks SET
          title = $1,
          description = $2,
          status = $3,
          updated_at = NOW()
        WHERE id = $4
      `, [
        issue.title,
        issue.body || '',
        issue.state === 'closed' ? 'done' : 'in_progress',
        taskId,
      ]);
      action = 'updated';
    } else {
      // Create new task
      const [newTask] = await db.execute<any>(`
        INSERT INTO plan_tasks (
          project_id, title, description, status, 
          labels, metadata, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id
      `, [
        projectId,
        issue.title,
        issue.body || '',
        issue.state === 'closed' ? 'done' : 'todo',
        issue.labels.map((l: any) => typeof l === 'string' ? l : l.name),
        JSON.stringify({ githubUrl: issue.html_url }),
      ]);
      taskId = newTask.id;
      action = 'created';

      // Create mapping
      await db.execute(`
        INSERT INTO sync_mappings (
          external_source, external_id, internal_type, internal_id,
          sync_direction, sync_status, last_synced_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'bidirectional', 'active', NOW(), NOW(), NOW())
      `, ['github', externalId, 'plan_task', taskId]);
    }

    // Log sync
    await db.execute(`
      INSERT INTO sync_log (
        mapping_id, sync_direction, action, status, 
        changes_summary, created_at
      ) VALUES (
        (SELECT id FROM sync_mappings WHERE external_id = $1 AND internal_type = 'plan_task'),
        'github_to_internal', $2, 'success',
        $3, NOW()
      )
    `, [externalId, action, JSON.stringify({ title: issue.title, state: issue.state })]);

    return { taskId, action };
  }

  /**
   * Sync Plan Task to GitHub Issue
   */
  static async syncPlanTaskToGitHub(
    taskId: number,
    githubRepoOwner: string,
    githubRepoName: string
  ): Promise<{ issueNumber: number; action: 'created' | 'updated' }> {
    const octokit = await getUncachableGitHubClient();

    // Fetch task from database
    const [task] = await db.execute<any>(`
      SELECT * FROM plan_tasks WHERE id = $1
    `, [taskId]);

    if (!task) {
      throw new Error('Task not found');
    }

    const externalId = `${githubRepoOwner}/${githubRepoName}#plan_task_${taskId}`;

    // Check if mapping exists
    const [existingMapping] = await db.execute<any>(`
      SELECT external_id FROM sync_mappings
      WHERE internal_type = 'plan_task'
        AND internal_id = $1
        AND external_source = 'github'
    `, [taskId]);

    let issueNumber: number;
    let action: 'created' | 'updated';

    if (existingMapping) {
      // Extract issue number from external_id
      const match = existingMapping.external_id.match(/#(\d+)$/);
      if (!match) {
        throw new Error('Invalid GitHub issue number in mapping');
      }
      issueNumber = parseInt(match[1]);

      // Update existing issue
      await octokit.issues.update({
        owner: githubRepoOwner,
        repo: githubRepoName,
        issue_number: issueNumber,
        title: task.title,
        body: task.description,
        state: task.status === 'done' ? 'closed' : 'open',
      });
      action = 'updated';
    } else {
      // Create new issue
      const { data: newIssue } = await octokit.issues.create({
        owner: githubRepoOwner,
        repo: githubRepoName,
        title: task.title,
        body: task.description || '',
        labels: task.labels || [],
      });
      issueNumber = newIssue.number;
      action = 'created';

      // Create mapping
      const actualExternalId = `${githubRepoOwner}/${githubRepoName}#${issueNumber}`;
      await db.execute(`
        INSERT INTO sync_mappings (
          external_source, external_id, internal_type, internal_id,
          sync_direction, sync_status, last_synced_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'bidirectional', 'active', NOW(), NOW(), NOW())
      `, ['github', actualExternalId, 'plan_task', taskId]);
    }

    // Log sync
    await db.execute(`
      INSERT INTO sync_log (
        mapping_id, sync_direction, action, status,
        changes_summary, created_at
      ) VALUES (
        (SELECT id FROM sync_mappings WHERE internal_id = $1 AND internal_type = 'plan_task'),
        'internal_to_github', $2, 'success',
        $3, NOW()
      )
    `, [taskId, action, JSON.stringify({ title: task.title, status: task.status })]);

    return { issueNumber, action };
  }

  /**
   * Handle GitHub webhook event
   */
  static async handleWebhookEvent(event: string, payload: any): Promise<void> {
    if (event === 'issues') {
      const action = payload.action;
      const issue = payload.issue;
      const repo = payload.repository;

      // Find project linked to this repo
      const [project] = await db.execute<any>(`
        SELECT id FROM plan_projects
        WHERE github_repo_url LIKE $1
        LIMIT 1
      `, [`%${repo.owner.login}/${repo.name}%`]);

      if (project) {
        if (action === 'opened' || action === 'edited' || action === 'closed' || action === 'reopened') {
          await this.syncGitHubIssueToPlanTask(
            issue.number,
            repo.owner.login,
            repo.name,
            project.id
          );
        }
      }
    } else if (event === 'issue_comment') {
      // TODO: Sync GitHub comments to Plan comments
      // Similar logic to issue sync
    }
  }

  /**
   * Detect and log sync conflicts
   */
  static async detectConflict(
    mappingId: number,
    externalValue: any,
    internalValue: any
  ): Promise<void> {
    await db.execute(`
      INSERT INTO sync_conflicts (
        mapping_id, conflict_type, external_value, internal_value,
        is_resolved, created_at
      ) VALUES ($1, $2, $3, $4, false, NOW())
    `, [
      mappingId,
      'data_mismatch',
      JSON.stringify(externalValue),
      JSON.stringify(internalValue),
    ]);
  }

  /**
   * Get sync status for project
   */
  static async getProjectSyncStatus(projectId: number): Promise<any> {
    const [stats] = await db.execute<any>(`
      SELECT 
        COUNT(*) FILTER (WHERE sm.sync_status = 'active') as active_syncs,
        COUNT(*) FILTER (WHERE sm.sync_status = 'error') as error_syncs,
        COUNT(DISTINCT sc.id) FILTER (WHERE sc.is_resolved = false) as unresolved_conflicts
      FROM plan_tasks pt
      LEFT JOIN sync_mappings sm ON sm.internal_id = pt.id AND sm.internal_type = 'plan_task'
      LEFT JOIN sync_conflicts sc ON sc.mapping_id = sm.id
      WHERE pt.project_id = $1
    `, [projectId]);

    return stats || { active_syncs: 0, error_syncs: 0, unresolved_conflicts: 0 };
  }
}

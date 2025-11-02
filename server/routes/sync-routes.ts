import { Router } from 'express';
import { authenticateToken, requireRoleLevel, AuthRequest } from '../middleware/auth';
import { GitHubSyncService } from '../services/GitHubSyncService';
import { JiraSyncService } from '../services/JiraSyncService';
import { db } from '@shared/db';

/**
 * BLOCKER 7: GitHub/Jira Sync Routes
 * 
 * Webhooks and manual sync endpoints for bidirectional integration
 */
const router = Router();

// ============================================================================
// GITHUB SYNC
// ============================================================================

// Sync GitHub issue to Plan task (manual)
router.post('/github/sync-issue', authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res) => {
  try {
    const { issueNumber, repoOwner, repoName, projectId } = req.body;

    if (!issueNumber || !repoOwner || !repoName || !projectId) {
      return res.status(400).json({ message: 'issueNumber, repoOwner, repoName, and projectId are required' });
    }

    const result = await GitHubSyncService.syncGitHubIssueToPlanTask(
      issueNumber,
      repoOwner,
      repoName,
      projectId
    );

    res.json(result);
  } catch (error: any) {
    console.error('GitHub sync error:', error);
    res.status(500).json({ message: error.message || 'Error syncing GitHub issue' });
  }
});

// Sync Plan task to GitHub issue (manual)
router.post('/github/sync-task', authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res) => {
  try {
    const { taskId, repoOwner, repoName } = req.body;

    if (!taskId || !repoOwner || !repoName) {
      return res.status(400).json({ message: 'taskId, repoOwner, and repoName are required' });
    }

    const result = await GitHubSyncService.syncPlanTaskToGitHub(
      taskId,
      repoOwner,
      repoName
    );

    res.json(result);
  } catch (error: any) {
    console.error('GitHub sync error:', error);
    res.status(500).json({ message: error.message || 'Error syncing Plan task to GitHub' });
  }
});

// GitHub webhook handler
router.post('/webhooks/github', async (req, res) => {
  try {
    const event = req.headers['x-github-event'] as string;
    const payload = req.body;

    if (!event) {
      return res.status(400).json({ message: 'Missing X-GitHub-Event header' });
    }

    // Process webhook asynchronously
    GitHubSyncService.handleWebhookEvent(event, payload).catch(err => {
      console.error('GitHub webhook processing error:', err);
    });

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    res.status(500).json({ message: 'Error processing webhook' });
  }
});

// ============================================================================
// JIRA SYNC
// ============================================================================

// Sync Jira issue to Plan task (manual)
router.post('/jira/sync-issue', authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res) => {
  try {
    const { issueKey, projectId } = req.body;

    if (!issueKey || !projectId) {
      return res.status(400).json({ message: 'issueKey and projectId are required' });
    }

    const result = await JiraSyncService.syncJiraIssueToPlanTask(issueKey, projectId);
    res.json(result);
  } catch (error: any) {
    console.error('Jira sync error:', error);
    res.status(500).json({ message: error.message || 'Error syncing Jira issue' });
  }
});

// Sync Plan task to Jira issue (manual)
router.post('/jira/sync-task', authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res) => {
  try {
    const { taskId, jiraProjectKey } = req.body;

    if (!taskId || !jiraProjectKey) {
      return res.status(400).json({ message: 'taskId and jiraProjectKey are required' });
    }

    const result = await JiraSyncService.syncPlanTaskToJira(taskId, jiraProjectKey);
    res.json(result);
  } catch (error: any) {
    console.error('Jira sync error:', error);
    res.status(500).json({ message: error.message || 'Error syncing Plan task to Jira' });
  }
});

// Jira webhook handler
router.post('/webhooks/jira', async (req, res) => {
  try {
    const event = req.body.webhookEvent;
    const payload = req.body;

    if (!event) {
      return res.status(400).json({ message: 'Missing webhookEvent' });
    }

    // Process webhook asynchronously
    JiraSyncService.handleWebhookEvent(event, payload).catch(err => {
      console.error('Jira webhook processing error:', err);
    });

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Jira webhook error:', error);
    res.status(500).json({ message: 'Error processing webhook' });
  }
});

// ============================================================================
// SYNC MANAGEMENT
// ============================================================================

// Get sync mappings for project
router.get('/projects/:projectId/sync-mappings', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    const results = await db.execute<any>(`
      SELECT sm.*
      FROM sync_mappings sm
      JOIN plan_tasks pt ON sm.internal_id = pt.id AND sm.internal_type = 'plan_task'
      WHERE pt.project_id = $1
      ORDER BY sm.last_synced_at DESC
    `, [projectId]);

    res.json({ mappings: results.rows || [] });
  } catch (error) {
    console.error('Get sync mappings error:', error);
    res.status(500).json({ message: 'Error fetching sync mappings' });
  }
});

// Get sync conflicts
router.get('/sync-conflicts', authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res) => {
  try {
    const { resolved } = req.query;

    let query = 'SELECT * FROM sync_conflicts WHERE 1=1';
    const params: any[] = [];

    if (resolved !== undefined) {
      query += ' AND is_resolved = $1';
      params.push(resolved === 'true');
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const results = await db.execute<any>(query, params);
    res.json({ conflicts: results.rows || [] });
  } catch (error) {
    console.error('Get sync conflicts error:', error);
    res.status(500).json({ message: 'Error fetching sync conflicts' });
  }
});

// Resolve sync conflict
router.post('/sync-conflicts/:id/resolve', authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { resolutionStrategy } = req.body;

    if (!resolutionStrategy) {
      return res.status(400).json({ message: 'resolutionStrategy is required' });
    }

    const [conflict] = await db.execute<any>(`
      UPDATE sync_conflicts SET
        resolution_strategy = $1,
        is_resolved = true,
        resolved_by = $2,
        resolved_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [resolutionStrategy, req.userId, id]);

    if (!conflict) {
      return res.status(404).json({ message: 'Conflict not found' });
    }

    res.json({ conflict });
  } catch (error) {
    console.error('Resolve conflict error:', error);
    res.status(500).json({ message: 'Error resolving conflict' });
  }
});

// Get sync status for project
router.get('/projects/:projectId/sync-status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const status = await GitHubSyncService.getProjectSyncStatus(Number(projectId));
    res.json(status);
  } catch (error) {
    console.error('Get sync status error:', error);
    res.status(500).json({ message: 'Error fetching sync status' });
  }
});

export default router;

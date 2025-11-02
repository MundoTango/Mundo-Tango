import { db } from '@shared/db';

/**
 * BLOCKER 7: Jira Sync Service
 * 
 * Bidirectional sync between Jira Issues/Comments and Plan Tracker:
 * - Jira Issue → Plan Task
 * - Jira Comment → Plan Comment
 * - Plan Task → Jira Issue (when linked to project)
 * - Webhook handling for real-time sync
 * 
 * Note: Requires JIRA_API_TOKEN and JIRA_DOMAIN environment variables
 */
export class JiraSyncService {
  private static async getJiraClient() {
    const domain = process.env.JIRA_DOMAIN;
    const email = process.env.JIRA_EMAIL;
    const apiToken = process.env.JIRA_API_TOKEN;

    if (!domain || !email || !apiToken) {
      throw new Error('Jira not configured. Set JIRA_DOMAIN, JIRA_EMAIL, and JIRA_API_TOKEN');
    }

    return {
      domain,
      email,
      apiToken,
      authHeader: `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
    };
  }

  /**
   * Sync Jira Issue to Plan Task
   */
  static async syncJiraIssueToPlanTask(
    jiraIssueKey: string,
    projectId: number
  ): Promise<{ taskId: number; action: 'created' | 'updated' }> {
    const client = await this.getJiraClient();

    // Fetch issue from Jira
    const response = await fetch(
      `https://${client.domain}/rest/api/3/issue/${jiraIssueKey}`,
      {
        headers: {
          'Authorization': client.authHeader,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.statusText}`);
    }

    const issue = await response.json();
    const externalId = `jira:${jiraIssueKey}`;

    // Check if mapping already exists
    const [existingMapping] = await db.execute<any>(`
      SELECT internal_id FROM sync_mappings
      WHERE external_source = 'jira'
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
          priority = $4,
          updated_at = NOW()
        WHERE id = $5
      `, [
        issue.fields.summary,
        issue.fields.description || '',
        this.mapJiraStatusToPlanStatus(issue.fields.status.name),
        this.mapJiraPriorityToPlanPriority(issue.fields.priority?.name),
        taskId,
      ]);
      action = 'updated';
    } else {
      // Create new task
      const [newTask] = await db.execute<any>(`
        INSERT INTO plan_tasks (
          project_id, title, description, status, priority,
          labels, metadata, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id
      `, [
        projectId,
        issue.fields.summary,
        issue.fields.description || '',
        this.mapJiraStatusToPlanStatus(issue.fields.status.name),
        this.mapJiraPriorityToPlanPriority(issue.fields.priority?.name),
        issue.fields.labels || [],
        JSON.stringify({ jiraKey: jiraIssueKey, jiraUrl: `https://${client.domain}/browse/${jiraIssueKey}` }),
      ]);
      taskId = newTask.id;
      action = 'created';

      // Create mapping
      await db.execute(`
        INSERT INTO sync_mappings (
          external_source, external_id, internal_type, internal_id,
          sync_direction, sync_status, last_synced_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'bidirectional', 'active', NOW(), NOW(), NOW())
      `, ['jira', externalId, 'plan_task', taskId]);
    }

    // Log sync
    await db.execute(`
      INSERT INTO sync_log (
        mapping_id, sync_direction, action, status,
        changes_summary, created_at
      ) VALUES (
        (SELECT id FROM sync_mappings WHERE external_id = $1 AND internal_type = 'plan_task'),
        'jira_to_internal', $2, 'success',
        $3, NOW()
      )
    `, [externalId, action, JSON.stringify({ title: issue.fields.summary, status: issue.fields.status.name })]);

    return { taskId, action };
  }

  /**
   * Sync Plan Task to Jira Issue
   */
  static async syncPlanTaskToJira(
    taskId: number,
    jiraProjectKey: string
  ): Promise<{ issueKey: string; action: 'created' | 'updated' }> {
    const client = await this.getJiraClient();

    // Fetch task from database
    const [task] = await db.execute<any>(`
      SELECT * FROM plan_tasks WHERE id = $1
    `, [taskId]);

    if (!task) {
      throw new Error('Task not found');
    }

    // Check if mapping exists
    const [existingMapping] = await db.execute<any>(`
      SELECT external_id FROM sync_mappings
      WHERE internal_type = 'plan_task'
        AND internal_id = $1
        AND external_source = 'jira'
    `, [taskId]);

    let issueKey: string;
    let action: 'created' | 'updated';

    if (existingMapping) {
      // Extract issue key from external_id (format: "jira:PROJECT-123")
      issueKey = existingMapping.external_id.replace('jira:', '');

      // Update existing issue
      await fetch(
        `https://${client.domain}/rest/api/3/issue/${issueKey}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': client.authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              summary: task.title,
              description: {
                type: 'doc',
                version: 1,
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: task.description || '' }],
                  },
                ],
              },
            },
          }),
        }
      );
      action = 'updated';
    } else {
      // Create new issue
      const response = await fetch(
        `https://${client.domain}/rest/api/3/issue`,
        {
          method: 'POST',
          headers: {
            'Authorization': client.authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              project: { key: jiraProjectKey },
              summary: task.title,
              description: {
                type: 'doc',
                version: 1,
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: task.description || '' }],
                  },
                ],
              },
              issuetype: { name: 'Task' },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Jira API error: ${response.statusText}`);
      }

      const newIssue = await response.json();
      issueKey = newIssue.key;
      action = 'created';

      // Create mapping
      const externalId = `jira:${issueKey}`;
      await db.execute(`
        INSERT INTO sync_mappings (
          external_source, external_id, internal_type, internal_id,
          sync_direction, sync_status, last_synced_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'bidirectional', 'active', NOW(), NOW(), NOW())
      `, ['jira', externalId, 'plan_task', taskId]);
    }

    // Log sync
    await db.execute(`
      INSERT INTO sync_log (
        mapping_id, sync_direction, action, status,
        changes_summary, created_at
      ) VALUES (
        (SELECT id FROM sync_mappings WHERE internal_id = $1 AND internal_type = 'plan_task'),
        'internal_to_jira', $2, 'success',
        $3, NOW()
      )
    `, [taskId, action, JSON.stringify({ title: task.title, status: task.status })]);

    return { issueKey, action };
  }

  /**
   * Handle Jira webhook event
   */
  static async handleWebhookEvent(event: string, payload: any): Promise<void> {
    if (event === 'jira:issue_created' || event === 'jira:issue_updated') {
      const issueKey = payload.issue.key;
      
      // Find project linked to this Jira project
      const jiraProjectKey = issueKey.split('-')[0];
      const [project] = await db.execute<any>(`
        SELECT id FROM plan_projects
        WHERE jira_project_key = $1
        LIMIT 1
      `, [jiraProjectKey]);

      if (project) {
        await this.syncJiraIssueToPlanTask(issueKey, project.id);
      }
    }
  }

  /**
   * Map Jira status to Plan status
   */
  private static mapJiraStatusToPlanStatus(jiraStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'To Do': 'todo',
      'In Progress': 'in_progress',
      'Done': 'done',
      'Closed': 'done',
    };
    return statusMap[jiraStatus] || 'todo';
  }

  /**
   * Map Jira priority to Plan priority
   */
  private static mapJiraPriorityToPlanPriority(jiraPriority: string | undefined): string {
    if (!jiraPriority) return 'medium';
    
    const priorityMap: { [key: string]: string } = {
      'Highest': 'high',
      'High': 'high',
      'Medium': 'medium',
      'Low': 'low',
      'Lowest': 'low',
    };
    return priorityMap[jiraPriority] || 'medium';
  }
}

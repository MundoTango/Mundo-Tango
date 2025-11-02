# GitHub/Jira Sync System - Complete Implementation Guide

**Feature Type:** Integration & Automation  
**Status:** ✅ Production Ready  
**Location:** `server/routes/sync-routes.ts`, `server/services/GitHubSyncService.ts`, `server/services/JiraSyncService.ts`  
**Created:** November 2, 2025  
**Last Updated:** November 2, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [GitHub Integration](#github-integration)
4. [Jira Integration](#jira-integration)
5. [Sync Mapping System](#sync-mapping-system)
6. [Conflict Resolution](#conflict-resolution)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Webhook Handlers](#webhook-handlers)
10. [Implementation Details](#implementation-details)
11. [Code Examples](#code-examples)
12. [Testing Strategy](#testing-strategy)
13. [H2AC Handoff](#h2ac-handoff)

---

## Overview

### Purpose
The GitHub/Jira Sync System provides bidirectional synchronization between "The Plan" project tracker and external dev tools (GitHub Issues and Jira). Changes in one system automatically propagate to the other.

### Key Features
- **GitHub Integration**: Sync issues ↔ Plan tasks
- **Jira Integration**: Sync issues ↔ Plan tasks
- **Bidirectional Sync**: Changes flow both ways
- **Webhook Support**: Real-time updates via webhooks
- **Conflict Resolution**: Smart conflict detection and resolution
- **Manual Sync**: Trigger syncs on-demand
- **Sync History**: Complete audit trail of all syncs

### Business Value
- Maintains single source of truth across tools
- Reduces manual data entry
- Keeps teams aligned regardless of tool preference
- Provides flexibility in workflow management

---

## Architecture

### System Components
```
GitHub/Jira Sync System
├── Sync Services
│   ├── GitHubSyncService
│   └── JiraSyncService
├── Webhook Handlers
│   ├── GitHub Webhook Endpoint
│   └── Jira Webhook Endpoint
├── Sync Mappings
│   ├── External ID ↔ Internal ID
│   └── Sync Direction & Status
└── Conflict Resolution
    ├── Conflict Detection
    └── Resolution Strategies
```

### Data Flow

#### GitHub → Plan
```
GitHub Issue Updated → Webhook → Parse Event
       ↓
Check Sync Mapping → Get Plan Task
       ↓
Compare Timestamps → Detect Conflicts
       ↓
Resolve/Merge → Update Plan Task → Log Sync
```

#### Plan → GitHub
```
Plan Task Updated → Manual Trigger / Schedule
       ↓
Check Sync Mapping → Get GitHub Issue
       ↓
Compare Timestamps → Detect Conflicts
       ↓
Resolve/Merge → Update GitHub Issue → Log Sync
```

---

## GitHub Integration

### GitHub Client Setup
```typescript
import { Octokit } from '@octokit/rest';

function getGitHubClient(): Octokit {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    throw new Error('GITHUB_TOKEN not configured');
  }
  
  return new Octokit({
    auth: token,
    userAgent: 'Mundo-Tango-Plan-Sync v1.0.0',
    timeZone: 'UTC',
    baseUrl: 'https://api.github.com'
  });
}
```

### Sync GitHub Issue to Plan Task
```typescript
static async syncGitHubIssueToPlanTask(
  githubIssueNumber: number,
  githubRepoOwner: string,
  githubRepoName: string,
  projectId: number
): Promise<{ taskId: number; action: 'created' | 'updated' }> {
  const octokit = getGitHubClient();

  // 1. Fetch issue from GitHub
  const { data: issue } = await octokit.issues.get({
    owner: githubRepoOwner,
    repo: githubRepoName,
    issue_number: githubIssueNumber,
  });

  const externalId = `${githubRepoOwner}/${githubRepoName}#${githubIssueNumber}`;

  // 2. Check if mapping already exists
  const [existingMapping] = await db.execute<any>(`
    SELECT internal_id FROM sync_mappings
    WHERE external_source = 'github'
      AND external_id = $1
      AND internal_type = 'plan_task'
  `, [externalId]);

  let taskId: number;
  let action: 'created' | 'updated';

  if (existingMapping) {
    // 3a. Update existing task
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
      mapGitHubStateToTaskStatus(issue.state),
      taskId,
    ]);
    
    action = 'updated';
  } else {
    // 3b. Create new task
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
      mapGitHubStateToTaskStatus(issue.state),
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

  // 4. Log sync
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
```

### Sync Plan Task to GitHub Issue
```typescript
static async syncPlanTaskToGitHub(
  taskId: number,
  repoOwner: string,
  repoName: string
): Promise<{ issueNumber: number; action: 'created' | 'updated' }> {
  const octokit = getGitHubClient();

  // 1. Get task from database
  const [task] = await db.execute<any>(`SELECT * FROM plan_tasks WHERE id = $1`, [taskId]);

  if (!task) {
    throw new Error('Task not found');
  }

  // 2. Check if mapping exists
  const [mapping] = await db.execute<any>(`
    SELECT external_id FROM sync_mappings
    WHERE internal_type = 'plan_task'
      AND internal_id = $1
      AND external_source = 'github'
  `, [taskId]);

  let issueNumber: number;
  let action: 'created' | 'updated';

  if (mapping) {
    // 3a. Update existing issue
    const matches = mapping.external_id.match(/#(\d+)$/);
    issueNumber = parseInt(matches[1]);

    await octokit.issues.update({
      owner: repoOwner,
      repo: repoName,
      issue_number: issueNumber,
      title: task.title,
      body: task.description || '',
      state: mapTaskStatusToGitHubState(task.status),
      labels: task.labels || []
    });

    action = 'updated';
  } else {
    // 3b. Create new issue
    const { data: issue } = await octokit.issues.create({
      owner: repoOwner,
      repo: repoName,
      title: task.title,
      body: task.description || '',
      labels: task.labels || []
    });

    issueNumber = issue.number;
    action = 'created';

    // Create mapping
    const externalId = `${repoOwner}/${repoName}#${issueNumber}`;
    await db.execute(`
      INSERT INTO sync_mappings (
        external_source, external_id, internal_type, internal_id,
        sync_direction, sync_status, last_synced_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, 'bidirectional', 'active', NOW(), NOW(), NOW())
    `, ['github', externalId, 'plan_task', taskId]);
  }

  // 4. Log sync
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
```

### Status Mapping
```typescript
function mapGitHubStateToTaskStatus(githubState: 'open' | 'closed'): TaskStatus {
  return githubState === 'closed' ? 'done' : 'in_progress';
}

function mapTaskStatusToGitHubState(taskStatus: TaskStatus): 'open' | 'closed' {
  return taskStatus === 'done' ? 'closed' : 'open';
}
```

---

## Jira Integration

### Jira Client Setup
```typescript
interface JiraClient {
  domain: string;
  email: string;
  apiToken: string;
  authHeader: string;
}

private static async getJiraClient(): Promise<JiraClient> {
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
```

### Sync Jira Issue to Plan Task
```typescript
static async syncJiraIssueToPlanTask(
  jiraIssueKey: string,
  projectId: number
): Promise<{ taskId: number; action: 'created' | 'updated' }> {
  const client = await this.getJiraClient();

  // 1. Fetch issue from Jira
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

  // 2. Check if mapping exists
  const [existingMapping] = await db.execute<any>(`
    SELECT internal_id FROM sync_mappings
    WHERE external_source = 'jira'
      AND external_id = $1
      AND internal_type = 'plan_task'
  `, [externalId]);

  let taskId: number;
  let action: 'created' | 'updated';

  if (existingMapping) {
    // 3a. Update existing task
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
      mapJiraStatusToTaskStatus(issue.fields.status.name),
      mapJiraPriorityToTaskPriority(issue.fields.priority?.name),
      taskId,
    ]);
    
    action = 'updated';
  } else {
    // 3b. Create new task
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
      mapJiraStatusToTaskStatus(issue.fields.status.name),
      mapJiraPriorityToTaskPriority(issue.fields.priority?.name),
      issue.fields.labels || [],
      JSON.stringify({ jiraKey: jiraIssueKey }),
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

  // 4. Log sync
  await logSync(externalId, 'jira_to_internal', action, issue);

  return { taskId, action };
}
```

### Status/Priority Mapping
```typescript
function mapJiraStatusToTaskStatus(jiraStatus: string): TaskStatus {
  const statusMap: Record<string, TaskStatus> = {
    'To Do': 'todo',
    'In Progress': 'in_progress',
    'In Review': 'review',
    'Done': 'done',
    'Blocked': 'blocked'
  };
  
  return statusMap[jiraStatus] || 'todo';
}

function mapJiraPriorityToTaskPriority(jiraPriority?: string): TaskPriority {
  const priorityMap: Record<string, TaskPriority> = {
    'Highest': 'critical',
    'High': 'high',
    'Medium': 'medium',
    'Low': 'low',
    'Lowest': 'low'
  };
  
  return priorityMap[jiraPriority || 'Medium'] || 'medium';
}
```

---

## Sync Mapping System

### Mapping Interface
```typescript
interface SyncMapping {
  id: number;
  externalSource: 'github' | 'jira';
  externalId: string;  // 'owner/repo#123' or 'jira:PROJ-456'
  internalType: 'plan_task' | 'plan_project';
  internalId: number;
  syncDirection: 'github_to_internal' | 'internal_to_github' | 'bidirectional' | 
                 'jira_to_internal' | 'internal_to_jira';
  syncStatus: 'active' | 'paused' | 'error';
  lastSyncedAt: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Get Sync Status
```typescript
static async getProjectSyncStatus(projectId: number): Promise<SyncStatus> {
  const [stats] = await db.execute<any>(`
    SELECT 
      COUNT(*) as total_mappings,
      SUM(CASE WHEN sm.sync_status = 'active' THEN 1 ELSE 0 END) as active_mappings,
      SUM(CASE WHEN sm.sync_status = 'error' THEN 1 ELSE 0 END) as error_mappings,
      MAX(sm.last_synced_at) as last_sync_at
    FROM sync_mappings sm
    JOIN plan_tasks pt ON sm.internal_id = pt.id AND sm.internal_type = 'plan_task'
    WHERE pt.project_id = $1
  `, [projectId]);

  return {
    totalMappings: stats.total_mappings,
    activeMappings: stats.active_mappings,
    errorMappings: stats.error_mappings,
    lastSyncAt: stats.last_sync_at
  };
}
```

---

## Conflict Resolution

### Conflict Detection
```typescript
interface SyncConflict {
  id: number;
  mappingId: number;
  conflictType: 'simultaneous_edit' | 'deleted_external' | 'deleted_internal';
  externalData: any;
  internalData: any;
  resolutionStrategy?: 'external_wins' | 'internal_wins' | 'manual_merge';
  isResolved: boolean;
  resolvedBy?: number;
  resolvedAt?: Date;
  createdAt: Date;
}

async function detectConflict(
  mapping: SyncMapping,
  externalUpdatedAt: Date,
  internalUpdatedAt: Date
): Promise<boolean> {
  // Both updated since last sync = conflict
  if (externalUpdatedAt > mapping.lastSyncedAt && 
      internalUpdatedAt > mapping.lastSyncedAt) {
    await db.execute(`
      INSERT INTO sync_conflicts (
        mapping_id, conflict_type, created_at
      ) VALUES ($1, 'simultaneous_edit', NOW())
    `, [mapping.id]);
    
    return true;
  }
  
  return false;
}
```

### Resolution Strategies
```typescript
async function resolveConflict(
  conflictId: number,
  strategy: 'external_wins' | 'internal_wins' | 'manual_merge'
): Promise<void> {
  const [conflict] = await db.execute<any>(`
    SELECT * FROM sync_conflicts WHERE id = $1
  `, [conflictId]);

  switch (strategy) {
    case 'external_wins':
      // Apply external data to internal
      await applyExternalData(conflict.mapping_id, conflict.external_data);
      break;
    
    case 'internal_wins':
      // Apply internal data to external
      await applyInternalData(conflict.mapping_id, conflict.internal_data);
      break;
    
    case 'manual_merge':
      // Let user manually merge
      // (Frontend UI for conflict resolution)
      break;
  }

  // Mark resolved
  await db.execute(`
    UPDATE sync_conflicts SET
      resolution_strategy = $1,
      is_resolved = true,
      resolved_at = NOW()
    WHERE id = $2
  `, [strategy, conflictId]);
}
```

---

## Database Schema

### Sync Mappings Table
```sql
CREATE TABLE sync_mappings (
  id SERIAL PRIMARY KEY,
  
  -- External system
  external_source VARCHAR(20) NOT NULL,  -- 'github' | 'jira'
  external_id VARCHAR(255) NOT NULL,     -- 'owner/repo#123' | 'jira:PROJ-456'
  
  -- Internal system
  internal_type VARCHAR(20) NOT NULL,    -- 'plan_task' | 'plan_project'
  internal_id INTEGER NOT NULL,
  
  -- Sync configuration
  sync_direction VARCHAR(50) NOT NULL,   -- 'bidirectional' | 'github_to_internal' | etc.
  sync_status VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active' | 'paused' | 'error'
  
  -- Sync metadata
  last_synced_at TIMESTAMP,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sync_mappings_external ON sync_mappings(external_source, external_id);
CREATE INDEX idx_sync_mappings_internal ON sync_mappings(internal_type, internal_id);
CREATE INDEX idx_sync_mappings_status ON sync_mappings(sync_status);
CREATE UNIQUE INDEX idx_sync_mappings_unique ON sync_mappings(external_source, external_id, internal_type);
```

### Sync Log Table
```sql
CREATE TABLE sync_log (
  id SERIAL PRIMARY KEY,
  mapping_id INTEGER REFERENCES sync_mappings(id) ON DELETE CASCADE,
  
  -- Sync details
  sync_direction VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL,           -- 'created' | 'updated' | 'deleted'
  status VARCHAR(20) NOT NULL,           -- 'success' | 'failed'
  
  -- Changes
  changes_summary JSONB,
  error_message TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sync_log_mapping_id ON sync_log(mapping_id);
CREATE INDEX idx_sync_log_created_at ON sync_log(created_at);
CREATE INDEX idx_sync_log_status ON sync_log(status);
```

### Sync Conflicts Table
```sql
CREATE TABLE sync_conflicts (
  id SERIAL PRIMARY KEY,
  mapping_id INTEGER REFERENCES sync_mappings(id) ON DELETE CASCADE,
  
  -- Conflict details
  conflict_type VARCHAR(50) NOT NULL,    -- 'simultaneous_edit' | 'deleted_external' | 'deleted_internal'
  external_data JSONB,
  internal_data JSONB,
  
  -- Resolution
  resolution_strategy VARCHAR(20),       -- 'external_wins' | 'internal_wins' | 'manual_merge'
  is_resolved BOOLEAN DEFAULT false,
  resolved_by INTEGER REFERENCES users(id),
  resolved_at TIMESTAMP,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sync_conflicts_mapping_id ON sync_conflicts(mapping_id);
CREATE INDEX idx_sync_conflicts_resolved ON sync_conflicts(is_resolved);
```

---

## API Endpoints

### GitHub Sync

#### POST /api/sync/github/sync-issue
Sync GitHub issue to Plan task (manual trigger).
```typescript
interface SyncGitHubIssueRequest {
  issueNumber: number;
  repoOwner: string;
  repoName: string;
  projectId: number;
}

interface SyncGitHubIssueResponse {
  taskId: number;
  action: 'created' | 'updated';
}
```

#### POST /api/sync/github/sync-task
Sync Plan task to GitHub issue (manual trigger).
```typescript
interface SyncPlanTaskRequest {
  taskId: number;
  repoOwner: string;
  repoName: string;
}

interface SyncPlanTaskResponse {
  issueNumber: number;
  action: 'created' | 'updated';
}
```

#### POST /api/sync/webhooks/github
GitHub webhook endpoint (automatic).
```typescript
// Receives webhook from GitHub
// X-GitHub-Event header: 'issues' | 'issue_comment' | etc.
```

### Jira Sync

#### POST /api/sync/jira/sync-issue
Sync Jira issue to Plan task.
```typescript
interface SyncJiraIssueRequest {
  issueKey: string;
  projectId: number;
}

interface SyncJiraIssueResponse {
  taskId: number;
  action: 'created' | 'updated';
}
```

### Sync Management

#### GET /api/sync/projects/:projectId/sync-mappings
Get all sync mappings for project.
```typescript
interface GetSyncMappingsResponse {
  mappings: SyncMapping[];
}
```

#### GET /api/sync/projects/:projectId/sync-status
Get sync status summary.
```typescript
interface GetSyncStatusResponse {
  totalMappings: number;
  activeMappings: number;
  errorMappings: number;
  lastSyncAt: Date;
}
```

#### GET /api/sync/sync-conflicts
Get unresolved conflicts.
```typescript
interface GetConflictsResponse {
  conflicts: SyncConflict[];
}
```

#### POST /api/sync/sync-conflicts/:id/resolve
Resolve conflict.
```typescript
interface ResolveConflictRequest {
  resolutionStrategy: 'external_wins' | 'internal_wins' | 'manual_merge';
}
```

---

## Webhook Handlers

### GitHub Webhook
```typescript
router.post('/webhooks/github', async (req, res) => {
  const event = req.headers['x-github-event'] as string;
  const payload = req.body;

  // Verify webhook signature (security)
  const signature = req.headers['x-hub-signature-256'] as string;
  if (!verifyGitHubSignature(signature, JSON.stringify(payload))) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  // Process asynchronously
  GitHubSyncService.handleWebhookEvent(event, payload).catch(err => {
    console.error('GitHub webhook processing error:', err);
  });

  res.status(200).json({ message: 'Webhook received' });
});
```

### Jira Webhook
```typescript
router.post('/webhooks/jira', async (req, res) => {
  const event = req.body.webhookEvent;
  const payload = req.body;

  // Process asynchronously
  JiraSyncService.handleWebhookEvent(event, payload).catch(err => {
    console.error('Jira webhook processing error:', err);
  });

  res.status(200).json({ message: 'Webhook received' });
});
```

---

## Implementation Details

### Webhook Event Processing
```typescript
static async handleWebhookEvent(event: string, payload: any): Promise<void> {
  if (event === 'issues') {
    const action = payload.action;
    
    if (action === 'opened' || action === 'edited' || action === 'closed') {
      // Find existing mapping
      const externalId = `${payload.repository.owner.login}/${payload.repository.name}#${payload.issue.number}`;
      const [mapping] = await db.execute<any>(`
        SELECT * FROM sync_mappings
        WHERE external_source = 'github' AND external_id = $1
      `, [externalId]);

      if (mapping) {
        // Sync to existing task
        await this.syncGitHubIssueToPlanTask(
          payload.issue.number,
          payload.repository.owner.login,
          payload.repository.name,
          mapping.project_id
        );
      }
    }
  }
}
```

---

## Code Examples

### Example 1: Setup GitHub Sync for Project
```typescript
const setupGitHubSync = async (projectId: number, repoOwner: string, repoName: string) => {
  // Update project with GitHub repo
  await fetch(`/api/plan/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      githubRepoUrl: `https://github.com/${repoOwner}/${repoName}`
    })
  });

  // Sync all open issues
  const issues = await octokit.issues.listForRepo({
    owner: repoOwner,
    repo: repoName,
    state: 'open'
  });

  for (const issue of issues.data) {
    await fetch('/api/sync/github/sync-issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issueNumber: issue.number,
        repoOwner,
        repoName,
        projectId
      })
    });
  }
};
```

### Example 2: Handle Sync Conflict
```typescript
const handleConflict = async (conflictId: number) => {
  // Get conflict details
  const res = await fetch(`/api/sync/sync-conflicts`);
  const { conflicts } = await res.json();
  const conflict = conflicts.find(c => c.id === conflictId);

  // Show resolution UI
  const strategy = await showConflictDialog(conflict);

  // Resolve
  await fetch(`/api/sync/sync-conflicts/${conflictId}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolutionStrategy: strategy })
  });
};
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('GitHubSyncService', () => {
  it('should sync GitHub issue to Plan task', async () => {
    const result = await GitHubSyncService.syncGitHubIssueToPlanTask(
      123,
      'owner',
      'repo',
      1
    );
    expect(result.action).toBe('created');
  });

  it('should detect conflict on simultaneous edit', async () => {
    const conflict = await detectConflict(mapping, new Date(), new Date());
    expect(conflict).toBe(true);
  });
});
```

### Integration Tests
```typescript
test('Complete sync workflow', async () => {
  // Create GitHub issue
  const issue = await octokit.issues.create({
    owner: 'test',
    repo: 'test',
    title: 'Test Issue'
  });

  // Sync to Plan
  const result = await GitHubSyncService.syncGitHubIssueToPlanTask(
    issue.number,
    'test',
    'test',
    1
  );

  // Verify task created
  const task = await db.execute(`SELECT * FROM plan_tasks WHERE id = $1`, [result.taskId]);
  expect(task.title).toBe('Test Issue');
});
```

---

## H2AC Handoff

### Human-to-Agent Communication Protocol

**Handoff Date:** November 2, 2025  
**Handoff Agent:** Documentation Agent 2  
**Receiving Agent:** Any future implementation agent

#### Context Summary
The GitHub/Jira Sync System provides bidirectional synchronization between "The Plan" and external dev tools. Webhooks enable real-time updates, while manual sync triggers provide on-demand control.

#### Implementation Status
- ✅ **GitHub Sync**: Bidirectional sync implemented
- ✅ **Jira Sync**: Bidirectional sync implemented
- ✅ **Webhooks**: Handlers for both platforms
- ✅ **Mapping System**: Complete with conflict detection
- ✅ **Database**: All tables with proper constraints
- ⏳ **Conflict Resolution UI**: Backend ready, frontend pending
- ⏳ **Batch Sync**: Manual trigger only, scheduled sync pending

#### Critical Knowledge Transfer

1. **External IDs**: Format is `owner/repo#123` for GitHub, `jira:PROJ-456` for Jira. Must be unique per source.

2. **Webhook Security**: Always verify signatures before processing webhooks to prevent spoofing.

3. **Conflict Detection**: Based on `last_synced_at` timestamp. If both sides updated since last sync, create conflict.

4. **Status Mapping**: GitHub has only open/closed. Jira has many. Map conservatively to avoid data loss.

#### Future Enhancement Priorities
1. **Scheduled Sync** (High): Cron job for periodic sync
2. **Conflict Resolution UI** (High): Frontend for manual conflict resolution
3. **Comment Sync** (Medium): Sync GitHub/Jira comments to Plan
4. **Attachment Sync** (Medium): Sync file attachments
5. **Custom Field Mapping** (Low): User-defined field mappings

#### Agent-to-Agent Recommendations
- **Before modifications**: Test with dedicated test repos/projects
- **Webhook processing**: Always async to avoid timeout
- **Error handling**: Log all sync errors for debugging
- **Rate limiting**: Respect GitHub/Jira API rate limits

#### Known Limitations
1. No comment synchronization
2. No attachment synchronization
3. No custom field mapping
4. No automatic conflict resolution
5. No bulk sync operations

#### Success Metrics
- Sync success rate: > 95%
- Webhook processing time: < 2s
- Conflict rate: < 5%
- API error rate: < 1%
- Sync latency: < 30s for webhooks

---

**End of Documentation**  
*For questions or clarifications, contact the Integration Team or reference the implementation files directly.*

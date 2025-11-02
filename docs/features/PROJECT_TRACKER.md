# "The Plan" Project Tracker - Complete Implementation Guide

**Feature Type:** Platform Tool & Task Management  
**Status:** ✅ Production Ready  
**Location:** `server/routes/plan-routes.ts`  
**Created:** November 2, 2025  
**Last Updated:** November 2, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Model](#data-model)
4. [Kanban Board System](#kanban-board-system)
5. [Comment System](#comment-system)
6. [Integration Ready](#integration-ready)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Implementation Details](#implementation-details)
10. [Task Flow Management](#task-flow-management)
11. [Code Examples](#code-examples)
12. [Testing Strategy](#testing-strategy)
13. [H2AC Handoff](#h2ac-handoff)

---

## Overview

### Purpose
"The Plan" is a comprehensive project tracker with Kanban boards, task management, rich comments with @mentions, and GitHub/Jira integration readiness. It serves as the central task management system for the platform.

### Key Features
- **Project Management**: CRUD operations with priority and status tracking
- **Kanban Boards**: Drag-and-drop task organization across columns
- **Task Hierarchy**: Parent-child task relationships with subtasks
- **Rich Comments**: Markdown support with @mentions and notifications
- **File Attachments**: Multiple attachments per comment
- **Time Tracking**: Estimated vs. actual hours with analytics
- **GitHub/Jira Sync**: Bidirectional integration ready
- **Labels & Tags**: Flexible categorization system

### Business Value
- Centralizes project planning and execution
- Improves team collaboration and visibility
- Tracks time for better estimation
- Integrates with existing dev tools (GitHub/Jira)

---

## Architecture

### System Components
```
Plan System
├── Projects (Top-level containers)
│   ├── Metadata (name, description, status, priority)
│   ├── GitHub/Jira Integration Settings
│   ├── Tasks Collection
│   └── Comments Collection
├── Tasks (Work items)
│   ├── Metadata (title, description, status, priority)
│   ├── Assignment & Ownership
│   ├── Time Tracking
│   ├── Parent-Child Relationships
│   └── Labels & Custom Fields
└── Comments (Discussion threads)
    ├── Rich Text Content
    ├── @Mentions
    └── Edit History
```

### Data Flow
```
Create Project → Add Tasks → Assign Tasks → Update Status
       ↓
GitHub/Jira Sync (bidirectional)
       ↓
Track Progress → Add Comments → Complete Tasks
       ↓
Analytics & Reporting
```

---

## Data Model

### Project Interface
```typescript
interface Project {
  id: number;
  name: string;
  description: string | null;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  ownerId: number;
  
  // Integration
  githubRepoUrl: string | null;
  jiraProjectKey: string | null;
  
  // Dates
  startDate: Date | null;
  targetDate: Date | null;
  completedAt: Date | null;
  
  // Flags
  isArchived: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### Task Interface
```typescript
interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Assignment
  assignedTo: number | null;
  createdBy: number;
  
  // Time tracking
  estimatedHours: number | null;
  actualHours: number | null;
  
  // Dates
  dueDate: Date | null;
  completedAt: Date | null;
  
  // Hierarchy
  parentTaskId: number | null;
  position: number;
  
  // Categorization
  labels: string[];
  
  // Integration
  githubIssueNumber: number | null;
  jiraIssueKey: string | null;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### Comment Interface
```typescript
interface Comment {
  id: number;
  projectId: number | null;
  taskId: number | null;
  userId: number;
  content: string;
  mentions: number[];  // Array of user IDs
  
  // Editing
  isEdited: boolean;
  editedAt: Date | null;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Kanban Board System

### Board Columns
```typescript
const KANBAN_COLUMNS = [
  {
    status: 'todo',
    label: 'To Do',
    color: '#94a3b8',
    limit: null  // No WIP limit
  },
  {
    status: 'in_progress',
    label: 'In Progress',
    color: '#3b82f6',
    limit: 5  // WIP limit
  },
  {
    status: 'review',
    label: 'Review',
    color: '#f59e0b',
    limit: 3
  },
  {
    status: 'done',
    label: 'Done',
    color: '#10b981',
    limit: null
  },
  {
    status: 'blocked',
    label: 'Blocked',
    color: '#ef4444',
    limit: null
  }
];
```

### Task Movement Algorithm
```typescript
async function moveTask(
  taskId: number,
  newStatus: TaskStatus,
  newPosition: number
): Promise<Task> {
  // 1. Get current task
  const [task] = await db.execute(`SELECT * FROM plan_tasks WHERE id = $1`, [taskId]);
  
  // 2. Check WIP limits
  const column = KANBAN_COLUMNS.find(c => c.status === newStatus);
  if (column?.limit) {
    const [count] = await db.execute(
      `SELECT COUNT(*) as count FROM plan_tasks WHERE status = $1 AND project_id = $2`,
      [newStatus, task.project_id]
    );
    
    if (count.count >= column.limit) {
      throw new Error(`WIP limit reached for ${column.label} (max: ${column.limit})`);
    }
  }
  
  // 3. Update positions of other tasks in new column
  await db.execute(`
    UPDATE plan_tasks 
    SET position = position + 1, updated_at = NOW()
    WHERE status = $1 
      AND project_id = $2 
      AND position >= $3
  `, [newStatus, task.project_id, newPosition]);
  
  // 4. Move task
  const [updated] = await db.execute(`
    UPDATE plan_tasks SET
      status = $1,
      position = $2,
      updated_at = NOW(),
      completed_at = CASE WHEN $1 = 'done' THEN NOW() ELSE completed_at END
    WHERE id = $3
    RETURNING *
  `, [newStatus, newPosition, taskId]);
  
  return updated;
}
```

### Board Metrics
```typescript
interface BoardMetrics {
  total: number;
  byStatus: {
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    blocked: number;
  };
  completionRate: number;
  avgCycleTime: number;  // hours from todo to done
  blockedPercentage: number;
}

async function getBoardMetrics(projectId: number): Promise<BoardMetrics> {
  const [metrics] = await db.execute(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as review,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
      SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked,
      AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as avg_cycle_time
    FROM plan_tasks
    WHERE project_id = $1
  `, [projectId]);
  
  return {
    total: metrics.total,
    byStatus: {
      todo: metrics.todo,
      inProgress: metrics.in_progress,
      review: metrics.review,
      done: metrics.done,
      blocked: metrics.blocked
    },
    completionRate: (metrics.done / metrics.total) * 100,
    avgCycleTime: metrics.avg_cycle_time,
    blockedPercentage: (metrics.blocked / metrics.total) * 100
  };
}
```

---

## Comment System

### Rich Text Support
```typescript
interface CommentContent {
  text: string;        // Markdown supported
  mentions: number[];  // User IDs
  attachments: {
    id: number;
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }[];
}

async function createComment(data: {
  projectId?: number;
  taskId?: number;
  content: string;
  userId: number;
}): Promise<Comment> {
  // 1. Parse @mentions from content
  const mentions = extractMentions(data.content);
  
  // 2. Create comment
  const [comment] = await db.execute(`
    INSERT INTO plan_comments (
      project_id, task_id, user_id, content, mentions,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING *
  `, [
    data.projectId || null,
    data.taskId || null,
    data.userId,
    data.content,
    mentions
  ]);
  
  // 3. Send notifications to mentioned users
  for (const mentionedUserId of mentions) {
    await sendNotification({
      userId: mentionedUserId,
      type: 'mention',
      title: 'You were mentioned in a comment',
      link: `/plan/tasks/${data.taskId}`,
      metadata: { commentId: comment.id }
    });
  }
  
  return comment;
}
```

### Mention Extraction
```typescript
function extractMentions(content: string): number[] {
  // Match @username or @user-id patterns
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex) || [];
  
  const userIds: number[] = [];
  for (const match of matches) {
    const username = match.slice(1);  // Remove @ prefix
    
    // Look up user by username
    const [user] = await db.execute(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );
    
    if (user) {
      userIds.push(user.id);
    }
  }
  
  return [...new Set(userIds)];  // Remove duplicates
}
```

### Edit History
```typescript
async function updateComment(
  commentId: number,
  userId: number,
  newContent: string
): Promise<Comment> {
  // Verify ownership
  const [comment] = await db.execute(
    `SELECT * FROM plan_comments WHERE id = $1`,
    [commentId]
  );
  
  if (comment.user_id !== userId) {
    throw new Error('Unauthorized');
  }
  
  // Update comment
  const [updated] = await db.execute(`
    UPDATE plan_comments SET
      content = $1,
      is_edited = true,
      edited_at = NOW(),
      updated_at = NOW()
    WHERE id = $2 AND user_id = $3
    RETURNING *
  `, [newContent, commentId, userId]);
  
  return updated;
}
```

---

## Integration Ready

### GitHub Integration Points
```typescript
interface GitHubIntegration {
  repoOwner: string;
  repoName: string;
  issueNumber: number;
  syncDirection: 'github_to_plan' | 'plan_to_github' | 'bidirectional';
}

// Will be synced via GitHubSyncService
const task = {
  id: 123,
  title: 'Implement user authentication',
  githubIssueNumber: 456,
  // ... other fields
};
```

### Jira Integration Points
```typescript
interface JiraIntegration {
  projectKey: string;
  issueKey: string;
  syncDirection: 'jira_to_plan' | 'plan_to_jira' | 'bidirectional';
}

// Will be synced via JiraSyncService
const task = {
  id: 123,
  title: 'Fix login bug',
  jiraIssueKey: 'PROJ-789',
  // ... other fields
};
```

---

## Database Schema

### Plan Projects Table
```sql
CREATE TABLE plan_projects (
  id SERIAL PRIMARY KEY,
  
  -- Project metadata
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'planning',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  
  -- Ownership
  owner_id INTEGER REFERENCES users(id) NOT NULL,
  
  -- Integration
  github_repo_url TEXT,
  jira_project_key VARCHAR(50),
  
  -- Dates
  start_date DATE,
  target_date DATE,
  completed_at TIMESTAMP,
  
  -- Flags
  is_archived BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plan_projects_owner_id ON plan_projects(owner_id);
CREATE INDEX idx_plan_projects_status ON plan_projects(status);
CREATE INDEX idx_plan_projects_priority ON plan_projects(priority);
CREATE INDEX idx_plan_projects_archived ON plan_projects(is_archived);
```

### Plan Tasks Table
```sql
CREATE TABLE plan_tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES plan_projects(id) ON DELETE CASCADE NOT NULL,
  
  -- Task metadata
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  
  -- Assignment
  assigned_to INTEGER REFERENCES users(id),
  created_by INTEGER REFERENCES users(id) NOT NULL,
  
  -- Time tracking
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2),
  
  -- Dates
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Hierarchy
  parent_task_id INTEGER REFERENCES plan_tasks(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  
  -- Categorization
  labels TEXT[] DEFAULT '{}',
  
  -- Integration
  github_issue_number INTEGER,
  jira_issue_key VARCHAR(50),
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plan_tasks_project_id ON plan_tasks(project_id);
CREATE INDEX idx_plan_tasks_status ON plan_tasks(status);
CREATE INDEX idx_plan_tasks_assigned_to ON plan_tasks(assigned_to);
CREATE INDEX idx_plan_tasks_parent_task_id ON plan_tasks(parent_task_id);
CREATE INDEX idx_plan_tasks_due_date ON plan_tasks(due_date);
```

### Plan Comments Table
```sql
CREATE TABLE plan_comments (
  id SERIAL PRIMARY KEY,
  
  -- Context
  project_id INTEGER REFERENCES plan_projects(id) ON DELETE CASCADE,
  task_id INTEGER REFERENCES plan_tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  
  -- Content
  content TEXT NOT NULL,
  mentions INTEGER[] DEFAULT '{}',
  
  -- Editing
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT comment_context_check CHECK (
    (project_id IS NOT NULL AND task_id IS NULL) OR
    (project_id IS NULL AND task_id IS NOT NULL)
  )
);

CREATE INDEX idx_plan_comments_project_id ON plan_comments(project_id);
CREATE INDEX idx_plan_comments_task_id ON plan_comments(task_id);
CREATE INDEX idx_plan_comments_user_id ON plan_comments(user_id);
```

---

## API Endpoints

### Projects

#### GET /api/plan/projects
Get all projects with optional filtering.
```typescript
interface GetProjectsRequest {
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  archived?: boolean;
}

interface GetProjectsResponse {
  projects: Project[];
}
```

#### POST /api/plan/projects
Create new project.
```typescript
interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  githubRepoUrl?: string;
  jiraProjectKey?: string;
  startDate?: string;
  targetDate?: string;
}

interface CreateProjectResponse {
  project: Project;
}
```

#### PATCH /api/plan/projects/:id
Update project.
```typescript
interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  githubRepoUrl?: string;
  jiraProjectKey?: string;
  startDate?: string;
  targetDate?: string;
  isArchived?: boolean;
}

interface UpdateProjectResponse {
  project: Project;
}
```

### Tasks

#### GET /api/plan/projects/:projectId/tasks
Get tasks for project.
```typescript
interface GetTasksRequest {
  status?: string;
}

interface GetTasksResponse {
  tasks: Task[];
}
```

#### POST /api/plan/projects/:projectId/tasks
Create task.
```typescript
interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: number;
  estimatedHours?: number;
  dueDate?: string;
  parentTaskId?: number;
  labels?: string[];
}

interface CreateTaskResponse {
  task: Task;
}
```

#### PATCH /api/plan/tasks/:id
Update task.
```typescript
interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: number;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  position?: number;
  labels?: string[];
}

interface UpdateTaskResponse {
  task: Task;
}
```

### Comments

#### GET /api/plan/comments
Get comments for project or task.
```typescript
interface GetCommentsRequest {
  projectId?: number;
  taskId?: number;
}

interface GetCommentsResponse {
  comments: (Comment & {
    user_name: string;
    profile_image: string;
  })[];
}
```

#### POST /api/plan/comments
Create comment.
```typescript
interface CreateCommentRequest {
  projectId?: number;
  taskId?: number;
  content: string;
  mentions?: number[];
}

interface CreateCommentResponse {
  comment: Comment;
}
```

---

## Implementation Details

### Project CRUD
```typescript
// Create project
router.post('/projects', authenticateToken, async (req: AuthRequest, res) => {
  const { name, description, status, priority, githubRepoUrl, jiraProjectKey, startDate, targetDate } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  const [project] = await executeRawQuery<any>(`
    INSERT INTO plan_projects (
      name, description, status, priority, owner_id, 
      github_repo_url, jira_project_key, start_date, target_date,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *
  `, [
    name,
    description || null,
    status || 'planning',
    priority || 'medium',
    req.userId,
    githubRepoUrl || null,
    jiraProjectKey || null,
    startDate || null,
    targetDate || null
  ]);

  res.status(201).json({ project });
});
```

### Task Creation with Position
```typescript
router.post('/projects/:projectId/tasks', authenticateToken, async (req: AuthRequest, res) => {
  const { projectId } = req.params;
  const { title, description, status, priority, assignedTo, estimatedHours, dueDate, parentTaskId, labels } = req.body;

  // Auto-assign position (end of column)
  const [maxPosition] = await executeRawQuery<any>(`
    SELECT COALESCE(MAX(position), -1) + 1 as next_position
    FROM plan_tasks
    WHERE project_id = $1 AND status = $2
  `, [projectId, status || 'todo']);

  const [task] = await executeRawQuery<any>(`
    INSERT INTO plan_tasks (
      project_id, title, description, status, priority,
      assigned_to, created_by, estimated_hours, due_date,
      parent_task_id, position, labels, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
    RETURNING *
  `, [
    projectId,
    title,
    description || null,
    status || 'todo',
    priority || 'medium',
    assignedTo || null,
    req.userId,
    estimatedHours || null,
    dueDate || null,
    parentTaskId || null,
    maxPosition.next_position,
    labels || []
  ]);

  res.status(201).json({ task });
});
```

---

## Task Flow Management

### Status Transition Rules
```typescript
const STATUS_TRANSITIONS = {
  'todo': ['in_progress', 'blocked'],
  'in_progress': ['review', 'blocked', 'todo'],
  'review': ['done', 'in_progress', 'blocked'],
  'done': [],  // Terminal state
  'blocked': ['todo', 'in_progress']
};

function isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}
```

### Automatic Time Tracking
```typescript
router.patch('/tasks/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { status } = req.body;

  const updates: string[] = [];
  const params: any[] = [];

  if (status !== undefined) {
    updates.push(`status = $${params.length + 1}`);
    params.push(status);
    
    // Auto-set completed_at when status = done
    if (status === 'done') {
      updates.push(`completed_at = NOW()`);
    }
  }

  // ... rest of update logic
});
```

---

## Code Examples

### Example 1: Create Project with Tasks
```typescript
const createProjectWithTasks = async () => {
  // 1. Create project
  const res1 = await fetch('/api/plan/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'New Feature Launch',
      description: 'Implement and launch new user authentication',
      status: 'planning',
      priority: 'high',
      startDate: '2025-11-10',
      targetDate: '2025-12-01'
    })
  });
  const { project } = await res1.json();

  // 2. Create tasks
  const tasks = [
    { title: 'Design database schema', estimatedHours: 4 },
    { title: 'Implement backend API', estimatedHours: 8 },
    { title: 'Build frontend UI', estimatedHours: 12 },
    { title: 'Write tests', estimatedHours: 6 },
    { title: 'Deploy to production', estimatedHours: 2 }
  ];

  for (const taskData of tasks) {
    await fetch(`/api/plan/projects/${project.id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
  }
};
```

### Example 2: Add Comment with Mentions
```typescript
const addCommentWithMention = async (taskId: number) => {
  const content = 'Hey @john, can you review this? cc @sarah';
  
  await fetch('/api/plan/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      taskId,
      content
    })
  });
  
  // john and sarah will receive notifications
};
```

### Example 3: Move Task in Kanban
```typescript
const moveTaskToReview = async (taskId: number) => {
  await fetch(`/api/plan/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'review',
      position: 0  // Move to top of review column
    })
  });
};
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('Plan Routes', () => {
  it('should create project', async () => {
    const res = await request(app)
      .post('/api/plan/projects')
      .send({ name: 'Test Project' })
      .expect(201);
    
    expect(res.body.project.name).toBe('Test Project');
  });

  it('should create task with correct position', async () => {
    const res = await request(app)
      .post('/api/plan/projects/1/tasks')
      .send({ title: 'Test Task', status: 'todo' })
      .expect(201);
    
    expect(res.body.task.position).toBe(0);
  });

  it('should extract mentions from comment', () => {
    const content = 'Hey @john and @sarah';
    const mentions = extractMentions(content);
    expect(mentions.length).toBe(2);
  });
});
```

### Integration Tests
```typescript
test('Complete project workflow', async ({ request }) => {
  // Create project
  const project = await request.post('/api/plan/projects', {
    data: { name: 'E2E Project' }
  });

  // Add tasks
  const task1 = await request.post(`/api/plan/projects/${project.id}/tasks`, {
    data: { title: 'Task 1' }
  });

  // Add comment
  await request.post('/api/plan/comments', {
    data: { taskId: task1.id, content: 'First comment' }
  });

  // Move to done
  await request.patch(`/api/plan/tasks/${task1.id}`, {
    data: { status: 'done' }
  });

  // Verify completed_at is set
  const updated = await request.get(`/api/plan/tasks/${task1.id}`);
  expect(updated.completed_at).toBeTruthy();
});
```

---

## H2AC Handoff

### Human-to-Agent Communication Protocol

**Handoff Date:** November 2, 2025  
**Handoff Agent:** Documentation Agent 2  
**Receiving Agent:** Any future implementation agent

#### Context Summary
"The Plan" is a full-featured project tracker with Kanban boards, task management, and comment system. It's designed for integration with GitHub and Jira via separate sync services.

#### Implementation Status
- ✅ **CRUD Operations**: Complete for projects, tasks, comments
- ✅ **Kanban Board**: Status-based organization with positioning
- ✅ **Comment System**: Rich text with @mentions
- ✅ **Time Tracking**: Estimated vs. actual hours
- ✅ **Database**: All tables with proper indexes
- ⏳ **GitHub/Jira Sync**: Integration points ready, sync service separate
- ⏳ **File Attachments**: Schema ready, upload not implemented

#### Critical Knowledge Transfer

1. **Task Positioning**: Use `position` field for drag-and-drop ordering within status columns. Update all tasks >= new position when inserting.

2. **Comment Context**: Each comment belongs to either a project OR a task, enforced by CHECK constraint. Never both.

3. **Status Transitions**: Define allowed transitions in `STATUS_TRANSITIONS` object. Validate before updates.

4. **Mention Notifications**: Extract mentions from content using regex, look up user IDs, send notifications via separate service.

#### Future Enhancement Priorities
1. **File Attachments** (High): Implement upload and storage
2. **Task Templates** (Medium): Save task lists as templates
3. **Burndown Charts** (Medium): Visualize progress over time
4. **Sprint Planning** (Medium): Add sprint/iteration support
5. **Custom Fields** (Low): User-defined task attributes

#### Agent-to-Agent Recommendations
- **Before modifications**: Understand task positioning algorithm
- **Comment mentions**: Always extract and notify after comment creation
- **Status updates**: Validate transitions before persisting
- **GitHub/Jira sync**: Use sync services, don't duplicate logic

#### Known Limitations
1. No file attachments yet
2. No task dependencies beyond parent-child
3. No sprint/iteration support
4. No time tracking automation
5. No custom fields/attributes

#### Success Metrics
- API response time: < 200ms (95th percentile)
- Comment creation: < 100ms
- Task movement: < 150ms
- Concurrent users: > 100
- Mention notification delivery: < 1s

---

**End of Documentation**  
*For questions or clarifications, contact the Project Management Team or reference the implementation files directly.*

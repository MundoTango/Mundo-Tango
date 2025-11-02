import { Router } from 'express';
import { authenticateToken, requireRoleLevel, AuthRequest } from '../middleware/auth';
import { db } from '@shared/db';

/**
 * BLOCKER 6: "The Plan" Project Tracker API Routes
 * 
 * Features:
 * - Projects, Tasks, Comments, Attachments CRUD
 * - Kanban board status management
 * - Rich comments with @mentions
 * - File uploads (multiple per comment)
 * - GitHub/Jira integration ready
 */
const router = Router();

// ============================================================================
// PROJECTS
// ============================================================================

// Get all projects
router.get('/projects', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status, archived } = req.query;
    
    let query = 'SELECT * FROM plan_projects WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (archived !== undefined) {
      query += ` AND is_archived = $${paramIndex}`;
      params.push(archived === 'true');
      paramIndex++;
    }

    query += ' ORDER BY priority DESC, created_at DESC';

    const results = await db.execute<any>(query, params);
    res.json({ projects: results.rows || [] });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Get single project
router.get('/projects/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const [project] = await db.execute<any>(`
      SELECT * FROM plan_projects WHERE id = $1
    `, [id]);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
});

// Create project
router.post('/projects', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { name, description, status, priority, githubRepoUrl, jiraProjectKey, startDate, targetDate } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const [project] = await db.execute<any>(`
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
      targetDate || null,
    ]);

    res.status(201).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
});

// Update project
router.patch('/projects/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, priority, githubRepoUrl, jiraProjectKey, startDate, targetDate, isArchived } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      params.push(priority);
    }
    if (githubRepoUrl !== undefined) {
      updates.push(`github_repo_url = $${paramIndex++}`);
      params.push(githubRepoUrl);
    }
    if (jiraProjectKey !== undefined) {
      updates.push(`jira_project_key = $${paramIndex++}`);
      params.push(jiraProjectKey);
    }
    if (startDate !== undefined) {
      updates.push(`start_date = $${paramIndex++}`);
      params.push(startDate);
    }
    if (targetDate !== undefined) {
      updates.push(`target_date = $${paramIndex++}`);
      params.push(targetDate);
    }
    if (isArchived !== undefined) {
      updates.push(`is_archived = $${paramIndex++}`);
      params.push(isArchived);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const [project] = await db.execute<any>(`
      UPDATE plan_projects SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Error updating project' });
  }
});

// Delete project
router.delete('/projects/:id', authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await db.execute(`DELETE FROM plan_projects WHERE id = $1`, [id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

// ============================================================================
// TASKS
// ============================================================================

// Get tasks for project
router.get('/projects/:projectId/tasks', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    let query = 'SELECT * FROM plan_tasks WHERE project_id = $1';
    const params: any[] = [projectId];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY position ASC, created_at DESC';

    const results = await db.execute<any>(query, params);
    res.json({ tasks: results.rows || [] });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Create task
router.post('/projects/:projectId/tasks', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, assignedTo, estimatedHours, dueDate, parentTaskId, labels } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const [task] = await db.execute<any>(`
      INSERT INTO plan_tasks (
        project_id, title, description, status, priority,
        assigned_to, created_by, estimated_hours, due_date,
        parent_task_id, labels, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
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
      labels || [],
    ]);

    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

// Update task
router.patch('/tasks/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignedTo, estimatedHours, actualHours, dueDate, position, labels } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
      
      if (status === 'done') {
        updates.push(`completed_at = NOW()`);
      }
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      params.push(priority);
    }
    if (assignedTo !== undefined) {
      updates.push(`assigned_to = $${paramIndex++}`);
      params.push(assignedTo);
    }
    if (estimatedHours !== undefined) {
      updates.push(`estimated_hours = $${paramIndex++}`);
      params.push(estimatedHours);
    }
    if (actualHours !== undefined) {
      updates.push(`actual_hours = $${paramIndex++}`);
      params.push(actualHours);
    }
    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      params.push(dueDate);
    }
    if (position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      params.push(position);
    }
    if (labels !== undefined) {
      updates.push(`labels = $${paramIndex++}`);
      params.push(labels);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const [task] = await db.execute<any>(`
      UPDATE plan_tasks SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Delete task
router.delete('/tasks/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await db.execute(`DELETE FROM plan_tasks WHERE id = $1`, [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// ============================================================================
// COMMENTS
// ============================================================================

// Get comments for project/task
router.get('/comments', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { projectId, taskId } = req.query;

    if (!projectId && !taskId) {
      return res.status(400).json({ message: 'projectId or taskId is required' });
    }

    let query = 'SELECT c.*, u.name as user_name, u.profile_image FROM plan_comments c JOIN users u ON c.user_id = u.id WHERE ';
    const params: any[] = [];

    if (taskId) {
      query += 'c.task_id = $1';
      params.push(taskId);
    } else {
      query += 'c.project_id = $1 AND c.task_id IS NULL';
      params.push(projectId);
    }

    query += ' ORDER BY c.created_at ASC';

    const results = await db.execute<any>(query, params);
    res.json({ comments: results.rows || [] });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Create comment
router.post('/comments', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { projectId, taskId, content, mentions } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    if (!projectId && !taskId) {
      return res.status(400).json({ message: 'projectId or taskId is required' });
    }

    const [comment] = await db.execute<any>(`
      INSERT INTO plan_comments (
        project_id, task_id, user_id, content, mentions,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [
      projectId || null,
      taskId || null,
      req.userId,
      content,
      mentions || [],
    ]);

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
});

// Update comment
router.patch('/comments/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const [comment] = await db.execute<any>(`
      UPDATE plan_comments SET
        content = $1,
        is_edited = true,
        edited_at = NOW(),
        updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [content, id, req.userId]);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    res.json({ comment });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Error updating comment' });
  }
});

// Delete comment
router.delete('/comments/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await db.execute(`DELETE FROM plan_comments WHERE id = $1 AND user_id = $2`, [id, req.userId]);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

export default router;

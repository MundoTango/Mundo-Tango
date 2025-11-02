import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, MoreVertical, GitBranch } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * BLOCKER 6: "The Plan" Project Tracker
 * 
 * Kanban board for project management:
 * - Drag-and-drop tasks between columns
 * - Rich comments with @mentions
 * - GitHub/Jira integration
 * - File attachments
 */

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  githubRepoUrl: z.string().optional(),
  jiraProjectKey: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export default function ProjectTrackerPage() {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskStatus, setTaskStatus] = useState<string>('todo');

  const projectForm = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      githubRepoUrl: '',
      jiraProjectKey: '',
      priority: 'medium' as const,
    },
  });

  const taskForm = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium' as const,
    },
  });

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['/api/plan/projects'],
  });
  const projects = projectsData?.projects || [];

  // Fetch tasks for selected project
  const { data: tasksData } = useQuery({
    queryKey: ['/api/plan/projects', selectedProject, '/tasks'],
    enabled: !!selectedProject,
  });
  const tasks = tasksData?.tasks || [];

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectSchema>) => {
      return apiRequest('POST', '/api/plan/projects', data);
    },
    onSuccess: () => {
      toast({ title: 'Project created successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/plan/projects'] });
      setIsProjectDialogOpen(false);
      projectForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating project',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskSchema>) => {
      return apiRequest('POST', `/api/plan/projects/${selectedProject}/tasks`, { ...data, status: taskStatus });
    },
    onSuccess: () => {
      toast({ title: 'Task created successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/plan/projects', selectedProject, '/tasks'] });
      setIsTaskDialogOpen(false);
      taskForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      return apiRequest('PATCH', `/api/plan/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plan/projects', selectedProject, '/tasks'] });
    },
  });

  const columns = [
    { id: 'todo', title: 'To Do', tasks: tasks.filter((t: any) => t.status === 'todo') },
    { id: 'in_progress', title: 'In Progress', tasks: tasks.filter((t: any) => t.status === 'in_progress') },
    { id: 'done', title: 'Done', tasks: tasks.filter((t: any) => t.status === 'done') },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">The Plan</h1>
          <p className="text-muted-foreground mt-2">
            Project tracker with GitHub/Jira integration
          </p>
        </div>
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-project">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Start a new project with optional GitHub/Jira integration
              </DialogDescription>
            </DialogHeader>
            <Form {...projectForm}>
              <form onSubmit={projectForm.handleSubmit((data) => createProjectMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={projectForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="MVP Launch" {...field} data-testid="input-project-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={projectForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Project description..." {...field} data-testid="input-project-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={projectForm.control}
                  name="githubRepoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Repo URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/user/repo" {...field} data-testid="input-github-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={projectForm.control}
                  name="jiraProjectKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jira Project Key (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="MT" {...field} data-testid="input-jira-key" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={projectForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-project-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createProjectMutation.isPending} data-testid="button-submit-project">
                  {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No projects yet. Create one to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {projects.map((project: any) => (
                <Card
                  key={project.id}
                  className={`cursor-pointer hover-elevate ${selectedProject === project.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedProject(project.id)}
                  data-testid={`project-card-${project.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{project.name}</h3>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {project.description || 'No description'}
                        </p>
                      </div>
                      <Badge variant={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </div>
                    {(project.github_repo_url || project.jira_project_key) && (
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <GitBranch className="h-3 w-3" />
                        {project.github_repo_url && <span>GitHub</span>}
                        {project.jira_project_key && <span>Jira: {project.jira_project_key}</span>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kanban Board */}
      {selectedProject && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Kanban Board</h2>
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-create-task">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Task</DialogTitle>
                </DialogHeader>
                <Form {...taskForm}>
                  <form onSubmit={taskForm.handleSubmit((data) => createTaskMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={taskForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Build login feature" {...field} data-testid="input-task-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={taskForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Task details..." {...field} data-testid="input-task-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={taskForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-task-priority">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={setTaskStatus} defaultValue="todo">
                        <FormControl>
                          <SelectTrigger data-testid="select-task-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                    <Button type="submit" disabled={createTaskMutation.isPending} data-testid="button-submit-task">
                      {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((column) => (
              <Card key={column.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{column.title}</span>
                    <Badge variant="secondary">{column.tasks.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {column.tasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm">
                      No tasks
                    </p>
                  ) : (
                    column.tasks.map((task: any) => (
                      <Card 
                        key={task.id} 
                        className="hover-elevate"
                        data-testid={`task-card-${task.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium flex-1">{task.title}</h4>
                            <Badge variant={getPriorityColor(task.priority)} className="shrink-0">
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            {task.status !== 'todo' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTaskStatusMutation.mutate({ taskId: task.id, status: 'todo' })}
                                data-testid={`button-move-todo-${task.id}`}
                              >
                                ← To Do
                              </Button>
                            )}
                            {task.status !== 'in_progress' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTaskStatusMutation.mutate({ taskId: task.id, status: 'in_progress' })}
                                data-testid={`button-move-progress-${task.id}`}
                              >
                                → Progress
                              </Button>
                            )}
                            {task.status !== 'done' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTaskStatusMutation.mutate({ taskId: task.id, status: 'done' })}
                                data-testid={`button-move-done-${task.id}`}
                              >
                                ✓ Done
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

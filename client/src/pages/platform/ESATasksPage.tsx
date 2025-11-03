import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  MoreVertical,
  Bot,
  TrendingUp,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Task {
  id: number;
  taskCode: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgent?: {
    id: number;
    agentCode: string;
    agentName: string;
  } | null;
  progress: number;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  estimatedDuration?: number | null;
}

interface TaskStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgCompletionTime: number;
  throughputPerHour: number;
}

const statusColors = {
  pending: 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400',
  in_progress: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  completed: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
  failed: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
};

const priorityColors = {
  low: 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400',
  medium: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  high: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
  critical: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
};

export default function ESATasksPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<TaskStats>({
    queryKey: ["/api/platform/esa/tasks/stats"],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/platform/esa/tasks"],
  });

  return (
    <SelfHealingErrorBoundary pageName="ESA Tasks" fallbackRoute="/platform/esa">
      <PageLayout title="ESA Task Management" showBreadcrumbs>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-page-title">
              <ListTodo className="h-8 w-8 text-primary" />
              ESA Task Queue
            </h1>
            <p className="text-muted-foreground mt-1">
              Agent task management and monitoring system
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-tasks">
                  {stats?.totalTasks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-in-progress">
                  {stats?.inProgressTasks || 0}
                </div>
                <Progress 
                  value={(stats?.inProgressTasks || 0) / (stats?.totalTasks || 1) * 100} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-completed">
                  {stats?.completedTasks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.avgCompletionTime ? `${stats.avgCompletionTime}s avg` : 'No data'}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-throughput">
                  {stats?.throughputPerHour || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  tasks/hour
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="all" data-testid="tab-all">
                All ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending">
                Pending ({stats?.pendingTasks || 0})
              </TabsTrigger>
              <TabsTrigger value="in_progress" data-testid="tab-in-progress">
                In Progress ({stats?.inProgressTasks || 0})
              </TabsTrigger>
              <TabsTrigger value="completed" data-testid="tab-completed">
                Completed ({stats?.completedTasks || 0})
              </TabsTrigger>
              <TabsTrigger value="failed" data-testid="tab-failed">
                Failed ({stats?.failedTasks || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Tasks</CardTitle>
                  <CardDescription>
                    Complete task queue across all agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tasksLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading tasks...
                    </div>
                  ) : tasks.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Agent</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasks.map((task) => (
                          <TableRow key={task.id} data-testid={`task-row-${task.id}`}>
                            <TableCell>
                              <div>
                                <div className="font-medium" data-testid={`text-task-title-${task.id}`}>
                                  {task.title}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {task.taskCode}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[task.status]}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={priorityColors[task.priority]}>
                                {task.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {task.assignedAgent ? (
                                <div className="flex items-center gap-2">
                                  <Bot className="h-4 w-4 text-primary" />
                                  <span className="text-sm">{task.assignedAgent.agentName}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={task.progress} className="w-20" />
                                <span className="text-xs text-muted-foreground">
                                  {task.progress}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    data-testid={`button-task-actions-${task.id}`}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem data-testid={`button-view-${task.id}`}>
                                    View Details
                                  </DropdownMenuItem>
                                  {task.status === 'pending' && (
                                    <DropdownMenuItem data-testid={`button-start-${task.id}`}>
                                      Start Task
                                    </DropdownMenuItem>
                                  )}
                                  {task.status === 'in_progress' && (
                                    <DropdownMenuItem data-testid={`button-pause-${task.id}`}>
                                      Pause Task
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem data-testid={`button-cancel-${task.id}`}>
                                    Cancel Task
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <ListTodo className="mx-auto h-12 w-12 mb-3 opacity-50" />
                      <p>No tasks in queue</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {['pending', 'in_progress', 'completed', 'failed'].map((status) => (
              <TabsContent key={status} value={status} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="capitalize">{status.replace('_', ' ')} Tasks</CardTitle>
                    <CardDescription>
                      Tasks with {status.replace('_', ' ')} status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      Filtered view for {status.replace('_', ' ')} tasks
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}

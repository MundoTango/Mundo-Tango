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
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

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
      {/* Hero Section - 16:9 Aspect Ratio */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-6"
          >
            <Badge variant="outline" className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              <ListTodo className="w-4 h-4 mr-2 inline" />
              Task Management
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight" data-testid="text-page-title">
              ESA Task Queue
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Agent Task Management and Monitoring System
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 space-y-12">

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { title: "Total Tasks", value: stats?.totalTasks || 0, subtitle: "All time", icon: ListTodo, testId: "text-total-tasks" },
              { title: "In Progress", value: stats?.inProgressTasks || 0, subtitle: "Active now", icon: Activity, testId: "text-in-progress", color: "text-blue-600", progress: true },
              { title: "Completed", value: stats?.completedTasks || 0, subtitle: stats?.avgCompletionTime ? `${stats.avgCompletionTime}s avg` : 'No data', icon: CheckCircle2, testId: "text-completed", color: "text-green-600" },
              { title: "Throughput", value: stats?.throughputPerHour || 0, subtitle: "tasks/hour", icon: TrendingUp, testId: "text-throughput" }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="hover-elevate">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className={`text-3xl font-serif font-bold ${stat.color || ''}`} data-testid={stat.testId}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </div>
                    {stat.progress && (
                      <Progress 
                        value={(stats?.inProgressTasks || 0) / (stats?.totalTasks || 1) * 100} 
                        className="mt-2" 
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
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
                <Card className="hover-elevate">
                  <CardHeader className="p-8">
                    <CardTitle className="text-3xl font-serif font-bold">All Tasks</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Complete task queue across all agents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    {tasksLoading ? (
                      <div className="text-center py-12 text-muted-foreground">
                        Loading tasks...
                      </div>
                    ) : tasks.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-medium">Task</TableHead>
                            <TableHead className="font-medium">Status</TableHead>
                            <TableHead className="font-medium">Priority</TableHead>
                            <TableHead className="font-medium">Agent</TableHead>
                            <TableHead className="font-medium">Progress</TableHead>
                            <TableHead className="font-medium">Created</TableHead>
                            <TableHead className="text-right font-medium">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tasks.map((task, index) => (
                            <motion.tr
                              key={task.id}
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              data-testid={`task-row-${task.id}`}
                              className="border-b hover-elevate"
                            >
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
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-16 text-muted-foreground">
                        <ListTodo className="mx-auto h-16 w-16 mb-6 opacity-50" />
                        <p className="text-lg font-medium">No tasks in queue</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {['pending', 'in_progress', 'completed', 'failed'].map((status) => (
                <TabsContent key={status} value={status} className="mt-6">
                  <Card className="hover-elevate">
                    <CardHeader className="p-8">
                      <CardTitle className="text-3xl font-serif font-bold capitalize">{status.replace('_', ' ')} Tasks</CardTitle>
                      <CardDescription className="text-base mt-2">
                        Tasks with {status.replace('_', ' ')} status
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="text-center py-16 text-muted-foreground">
                        Filtered view for {status.replace('_', ' ')} tasks
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
    </SelfHealingErrorBoundary>
  );
}

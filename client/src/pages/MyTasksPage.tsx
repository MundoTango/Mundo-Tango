import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, Clock, AlertCircle, ListTodo, 
  Calendar, TrendingUp, Play, Pause, Plus,
  ChevronRight, Timer, Target, Award
} from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SelectPlanItem, SelectWorkLog } from "@shared/schema";
import { format, formatDistanceToNow } from "date-fns";

type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";
type TaskPriority = "low" | "medium" | "high" | "critical";

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", icon: Play },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", icon: CheckCircle },
  blocked: { label: "Blocked", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", icon: AlertCircle }
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  high: { label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  critical: { label: "Critical", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" }
};

export default function MyTasksPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("active");
  const { toast } = useToast();

  const { data: tasks, isLoading: tasksLoading } = useQuery<SelectPlanItem[]>({
    queryKey: ["/api/volunteer/my-tasks"],
  });

  const { data: workLogs } = useQuery<SelectWorkLog[]>({
    queryKey: ["/api/volunteer/work-logs"],
  });

  const { data: stats } = useQuery<{
    totalTasks: number;
    completedTasks: number;
    hoursLogged: number;
    activeStreak: number;
  }>({
    queryKey: ["/api/volunteer/stats"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: TaskStatus }) => {
      return apiRequest(`/api/volunteer/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer/my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer/stats"] });
      toast({ title: "Task updated", description: "Status has been changed successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update task status.", variant: "destructive" });
    }
  });

  const filteredTasks = tasks?.filter(task => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return task.status === "pending" || task.status === "in_progress";
    if (activeTab === "completed") return task.status === "completed";
    return true;
  }) || [];

  const completionRate = stats ? Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100) : 0;

  return (
    <PageLayout title="My Tasks" showBreadcrumbs>
      <SelfHealingErrorBoundary pageName="My Tasks" fallbackRoute="/dashboard">
        <SEO
          title="My Tasks - Volunteer Dashboard"
          description="Track your volunteer tasks, log work hours, and monitor your contribution progress."
        />

        <div className="min-h-screen py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold" data-testid="page-title">My Tasks</h1>
                  <p className="text-muted-foreground mt-1">
                    Track your assignments and log your work hours
                  </p>
                </div>
                <Button data-testid="button-log-time">
                  <Timer className="h-4 w-4 mr-2" />
                  Log Time
                </Button>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid gap-4 md:grid-cols-4 mb-8"
            >
              <Card data-testid="stat-total-tasks">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ListTodo className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalTasks || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Tasks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="stat-completed">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.completedTasks || 0}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="stat-hours">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Timer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.hoursLogged?.toFixed(1) || "0.0"}</p>
                      <p className="text-sm text-muted-foreground">Hours Logged</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="stat-streak">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.activeStreak || 0}</p>
                      <p className="text-sm text-muted-foreground">Day Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm text-muted-foreground">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" data-testid="progress-completion" />
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Tasks List */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Tasks</CardTitle>
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                          <TabsList>
                            <TabsTrigger value="active" data-testid="tab-active">
                              Active
                            </TabsTrigger>
                            <TabsTrigger value="all" data-testid="tab-all">
                              All
                            </TabsTrigger>
                            <TabsTrigger value="completed" data-testid="tab-completed">
                              Completed
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {tasksLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                          ))}
                        </div>
                      ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-12" data-testid="empty-state">
                          <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="font-semibold text-lg mb-2">No tasks yet</h3>
                          <p className="text-muted-foreground mb-4">
                            {activeTab === "completed" 
                              ? "You haven't completed any tasks yet. Keep going!"
                              : "Tasks assigned to you will appear here."}
                          </p>
                          <Button variant="outline" data-testid="button-browse-tasks">
                            Browse Available Tasks
                          </Button>
                        </div>
                      ) : (
                        <ScrollArea className="h-[500px] pr-4">
                          <div className="space-y-4">
                            {filteredTasks.map((task) => {
                              const status = statusConfig[task.status as TaskStatus] || statusConfig.pending;
                              const priority = priorityConfig[task.priority as TaskPriority] || priorityConfig.medium;
                              const StatusIcon = status.icon;

                              return (
                                <motion.div
                                  key={task.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="p-4 rounded-lg border hover-elevate"
                                  data-testid={`task-card-${task.id}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${status.color}`}>
                                      <StatusIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium truncate">{task.title}</h4>
                                        <Badge variant="outline" className={priority.color}>
                                          {priority.label}
                                        </Badge>
                                      </div>
                                      {task.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                          {task.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        {task.dueDate && (
                                          <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Due {format(new Date(task.dueDate), "MMM d")}
                                          </span>
                                        )}
                                        {task.estimatedHours && (
                                          <span className="flex items-center gap-1">
                                            <Timer className="h-3 w-3" />
                                            {task.estimatedHours}h estimated
                                          </span>
                                        )}
                                        {task.category && (
                                          <Badge variant="secondary" className="text-xs">
                                            {task.category}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <Button 
                                      size="icon" 
                                      variant="ghost"
                                      data-testid={`task-action-${task.id}`}
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  {/* Quick Actions */}
                                  {task.status !== "completed" && (
                                    <div className="flex gap-2 mt-3 pt-3 border-t">
                                      {task.status === "pending" && (
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => updateStatusMutation.mutate({ taskId: task.id, status: "in_progress" })}
                                          disabled={updateStatusMutation.isPending}
                                          data-testid={`button-start-${task.id}`}
                                        >
                                          <Play className="h-3 w-3 mr-1" />
                                          Start
                                        </Button>
                                      )}
                                      {task.status === "in_progress" && (
                                        <>
                                          <Button 
                                            size="sm"
                                            onClick={() => updateStatusMutation.mutate({ taskId: task.id, status: "completed" })}
                                            disabled={updateStatusMutation.isPending}
                                            data-testid={`button-complete-${task.id}`}
                                          >
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Complete
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => updateStatusMutation.mutate({ taskId: task.id, status: "blocked" })}
                                            disabled={updateStatusMutation.isPending}
                                            data-testid={`button-block-${task.id}`}
                                          >
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Blocked
                                          </Button>
                                        </>
                                      )}
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        data-testid={`button-log-time-${task.id}`}
                                      >
                                        <Timer className="h-3 w-3 mr-1" />
                                        Log Time
                                      </Button>
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Recent Activity Sidebar */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                      <CardDescription>Your work log history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!workLogs || workLogs.length === 0 ? (
                        <div className="text-center py-8" data-testid="empty-activity">
                          <Timer className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No activity logged yet
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-4">
                            {workLogs.slice(0, 10).map((log) => (
                              <div key={log.id} className="flex gap-3" data-testid={`activity-${log.id}`}>
                                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{log.description || "Work logged"}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{log.hoursWorked}h</span>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(new Date(log.workDate), { addSuffix: true })}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" data-testid="button-view-all-activity">
                        View All Activity
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Quick Tips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6"
                >
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Tips for Success
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                          <span>Log your time daily to maintain your streak</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                          <span>Focus on one task at a time for better quality</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                          <span>Ask questions early if you're blocked</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </SelfHealingErrorBoundary>
    </PageLayout>
  );
}

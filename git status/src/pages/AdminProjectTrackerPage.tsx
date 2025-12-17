import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle,
  Plus,
  Users,
  BarChart3
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProjectTrackerPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  // Mock data - in production this would come from API
  const mockTasks: Task[] = [
    {
      id: 1,
      title: "Complete Scott's First Login Tour",
      description: "Execute full 50-page validation tour with self-healing agents",
      status: 'in_progress',
      priority: 'critical',
      assignedTo: 'Mr. Blue Team',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "Build Missing Admin Pages",
      description: "Create 6 missing pages for complete tour coverage",
      status: 'in_progress',
      priority: 'high',
      assignedTo: 'Agent #65',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      title: "Self-Healing Integration",
      description: "Connect autonomous agents to The Plan system",
      status: 'pending',
      priority: 'high',
      assignedTo: 'PageAuditService',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      title: "Multi-User Testing",
      description: "Validate 5 users across different roles",
      status: 'pending',
      priority: 'medium',
      assignedTo: 'QA Team',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const { data: tasks = mockTasks } = useQuery<Task[]>({
    queryKey: ["/api/admin/project-tracker/tasks"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'blocked': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredTasks = activeTab === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === activeTab);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
  };

  return (
    <SelfHealingErrorBoundary pageName="Project Tracker" fallbackRoute="/admin">
      <SEO 
        title="Project Tracker - Agent #65"
        description="Track development tasks, project milestones, and agent assignments for Mundo Tango platform"
        ogImage="/og-image.png"
      />
      <PageLayout title="Project Tracker (Agent #65)" showBreadcrumbs>
        <div className="container mx-auto p-6 space-y-6" data-testid="page-project-tracker">
          
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card data-testid="stat-total-tasks">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-completed-tasks">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-inprogress-tasks">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-pending-tasks">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Circle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-blocked-tasks">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.blocked}</div>
              </CardContent>
            </Card>
          </div>

          {/* Agent #65 Info */}
          <Card data-testid="card-agent-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Agent #65: Project Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Autonomous project management agent tracking all development tasks, 
                coordinating with 1,218 specialized agents, and ensuring platform 
                milestones are achieved on schedule.
              </p>
              <div className="mt-4 flex gap-2">
                <Badge variant="default">Operational</Badge>
                <Badge variant="secondary">Real-time Tracking</Badge>
                <Badge variant="outline">Agent Coordination</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <Card data-testid="card-tasks-list">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Development Tasks</CardTitle>
                <Button size="sm" data-testid="button-add-task">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-tasks">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                  <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
                  <TabsTrigger value="in_progress" data-testid="tab-in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
                  <TabsTrigger value="blocked" data-testid="tab-blocked">Blocked</TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-4">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground" data-testid="text-no-tasks">
                      No tasks in this category
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <Card key={task.id} className="hover-elevate" data-testid={`task-${task.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {getStatusIcon(task.status)}
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1" data-testid={`task-title-${task.id}`}>
                                  {task.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {task.description}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span data-testid={`task-assigned-${task.id}`}>
                                    Assigned to: {task.assignedTo || 'Unassigned'}
                                  </span>
                                  <span>•</span>
                                  <span>{safeDateDistance(task.updatedAt)}</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant={getPriorityColor(task.priority) as any} data-testid={`task-priority-${task.id}`}>
                              {task.priority}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}

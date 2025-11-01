import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {Bot, Brain, CheckCircle, Clock, Users, Zap, Award, Activity } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  certifiedAgents: number;
  trainingAgents: number;
  agentsByType: Record<string, number>;
  certificationLevels: {
    level0: number;
    level1: number;
    level2: number;
    level3: number;
  };
  performanceMetrics: {
    totalTasksCompleted: number;
    avgSuccessRate: number;
    avgCompletionTime: number;
  };
}

interface Agent {
  id: number;
  agentCode: string;
  agentName: string;
  agentType: string;
  status: string;
  certificationLevel: number;
  tasksCompleted: number;
  lastActiveAt: string | null;
}

export default function ESADashboardPage() {
  // Fetch agent stats from backend API
  const { data: stats, isLoading: statsLoading } = useQuery<AgentStats>({
    queryKey: ["/api/platform/esa/stats"],
  });

  // Fetch agents list from backend API
  const { data: agents = [], isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ["/api/platform/esa/agents"],
  });

  if (statsLoading) {
    return (
    <PageLayout title="ESA Framework Dashboard" showBreadcrumbs>
<div className="container mx-auto p-6">
        <div className="text-center py-8" data-testid="loading-esa-stats">
          Loading ESA Framework...
        </div>
      </div>
    </PageLayout>);
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">ESA Framework Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Expert Specialized Agents - {stats?.totalAgents || 0} Agents, 61 Layers, MB.MD Protocol
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-agents">
              {stats?.totalAgents || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Across 12 agent types
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-active-agents">
              {stats?.activeAgents || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Currently operational
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certified Agents</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-certified-agents">
              {stats?.certifiedAgents || 0}
            </div>
            <Progress
              value={(stats?.certifiedAgents || 0) / (stats?.totalAgents || 1) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Training</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-training-agents">
              {stats?.trainingAgents || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Ultra-Micro Parallel methodology
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Agents by Type</CardTitle>
          <CardDescription>Distribution across 12 specialized categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats && Object.entries(stats.agentsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="text-sm font-medium capitalize">{type.replace('_', ' ')}</div>
                  <div className="text-xs text-muted-foreground">{type.toUpperCase()}</div>
                </div>
                <div className="text-2xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certification Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Certification Levels</CardTitle>
            <CardDescription>Agent training and certification progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Level 0</Badge>
                  <span className="text-sm">None</span>
                </div>
                <span className="font-bold">{stats?.certificationLevels.level0 || 0}</span>
              </div>
              <Progress value={(stats?.certificationLevels.level0 || 0) / (stats?.totalAgents || 1) * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Level 1</Badge>
                  <span className="text-sm">Basic</span>
                </div>
                <span className="font-bold">{stats?.certificationLevels.level1 || 0}</span>
              </div>
              <Progress value={(stats?.certificationLevels.level1 || 0) / (stats?.totalAgents || 1) * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Level 2</Badge>
                  <span className="text-sm">Production</span>
                </div>
                <span className="font-bold">{stats?.certificationLevels.level2 || 0}</span>
              </div>
              <Progress value={(stats?.certificationLevels.level2 || 0) / (stats?.totalAgents || 1) * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600">Level 3</Badge>
                  <span className="text-sm">Master</span>
                </div>
                <span className="font-bold">{stats?.certificationLevels.level3 || 0}</span>
              </div>
              <Progress value={(stats?.certificationLevels.level3 || 0) / (stats?.totalAgents || 1) * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Aggregate agent performance statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="text-sm font-medium">Total Tasks Completed</div>
                <div className="text-xs text-muted-foreground">All agents combined</div>
              </div>
              <div className="text-2xl font-bold">
                {stats?.performanceMetrics.totalTasksCompleted || 0}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="text-sm font-medium">Average Success Rate</div>
                <div className="text-xs text-muted-foreground">Task completion rate</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats?.performanceMetrics.avgSuccessRate || 0}%
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="text-sm font-medium">Avg Completion Time</div>
                <div className="text-xs text-muted-foreground">Per task</div>
              </div>
              <div className="text-2xl font-bold">
                {stats?.performanceMetrics.avgCompletionTime || 0}s
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Registry</CardTitle>
          <CardDescription>
            {agents.length === 0 ? "No agents registered yet" : `${agents.length} agents registered`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agentsLoading ? (
            <div className="text-center py-8">Loading agents...</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No agents registered</p>
              <p className="text-sm mt-1">Agents will appear here once they are initialized</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id} data-testid={`row-agent-${agent.agentCode}`}>
                    <TableCell className="font-mono font-semibold">{agent.agentCode}</TableCell>
                    <TableCell>{agent.agentName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {agent.agentType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          agent.status === "active"
                            ? "default"
                            : agent.status === "certified"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={agent.certificationLevel === 3 ? "bg-purple-600" : ""}>
                        Level {agent.certificationLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>{agent.tasksCompleted}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {agent.lastActiveAt ? new Date(agent.lastActiveAt).toLocaleDateString() : "Never"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

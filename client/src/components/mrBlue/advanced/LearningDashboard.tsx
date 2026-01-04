import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Brain, Bug, Lightbulb, Activity, TrendingUp, AlertCircle, CheckCircle2, Clock, RefreshCw } from "lucide-react";

interface PathwayMetric {
  pathwayId: number;
  pathwayName: string;
  dataCollected: number;
  insightsGenerated: number;
  criticalIssues: number;
}

interface PathwayStatus {
  id: number;
  name: string;
  description: string;
  status: string;
  dataPoints: number;
}

interface BugStatistics {
  total: number;
  bySeverity: {
    critical: number;
    major: number;
    minor: number;
  };
  byStatus: Record<string, number>;
  avgResolutionTime: number;
}

interface Improvement {
  rank: number;
  type: 'bug' | 'feature' | 'ux';
  title: string;
  description: string;
  impact: number;
  effort: string;
  severity: string;
}

export default function LearningDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch pathway status
  const { data: pathwayData, isLoading: pathwaysLoading, refetch: refetchPathways } = useQuery<{
    success: boolean;
    pathways: PathwayStatus[];
    totalPathways: number;
    activePathways: number;
  }>({
    queryKey: ["/api/learning/pathways/status"],
  });

  // Fetch bug statistics
  const { data: bugStats, isLoading: statsLoading } = useQuery<{
    success: boolean;
    statistics: BugStatistics;
  }>({
    queryKey: ["/api/learning/errors/statistics"],
  });

  // Fetch improvements
  const { data: improvementsData, isLoading: improvementsLoading } = useQuery<{
    success: boolean;
    improvements: Improvement[];
  }>({
    queryKey: ["/api/learning/coordinator/improvements"],
  });

  const pathways = pathwayData?.pathways || [];
  const statistics = bugStats?.statistics;
  const improvements = improvementsData?.improvements || [];

  // Colors for charts
  const SEVERITY_COLORS = {
    critical: '#ef4444',
    major: '#f59e0b',
    minor: '#10b981',
  };

  const STATUS_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Prepare chart data
  const severityData = statistics ? [
    { name: 'Critical', value: statistics.bySeverity.critical, color: SEVERITY_COLORS.critical },
    { name: 'Major', value: statistics.bySeverity.major, color: SEVERITY_COLORS.major },
    { name: 'Minor', value: statistics.bySeverity.minor, color: SEVERITY_COLORS.minor },
  ] : [];

  const statusData = statistics ? Object.entries(statistics.byStatus).map(([status, count], index) => ({
    name: status,
    value: count,
    color: STATUS_COLORS[index % STATUS_COLORS.length],
  })) : [];

  const pathwayChartData = pathways.map(p => ({
    name: p.name.split(' ').slice(0, 2).join(' '),
    dataPoints: p.dataPoints || 0,
  }));

  return (
    <div className="space-y-6 p-6" data-testid="learning-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            Learning Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered insights from 10 learning pathways
          </p>
        </div>
        <Button
          onClick={() => refetchPathways()}
          variant="outline"
          size="icon"
          data-testid="button-refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pathways</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-pathways">
              {pathwayData?.activePathways || 0} / {pathwayData?.totalPathways || 10}
            </div>
            <p className="text-xs text-muted-foreground">
              Learning channels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bugs</CardTitle>
            <Bug className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-bugs">
              {statistics?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tracked issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-critical-bugs">
              {statistics?.bySeverity.critical || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-resolution">
              {statistics?.avgResolutionTime.toFixed(1) || 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              Time to fix
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="pathways" data-testid="tab-pathways">Pathways</TabsTrigger>
          <TabsTrigger value="bugs" data-testid="tab-bugs">Bugs</TabsTrigger>
          <TabsTrigger value="improvements" data-testid="tab-improvements">Improvements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bug Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Bug Severity Distribution</CardTitle>
                <CardDescription>Breakdown by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Bug Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Bug Status</CardTitle>
                <CardDescription>Current status of all bugs</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pathway Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Pathway Activity (Last 7 Days)</CardTitle>
              <CardDescription>Data collected per learning pathway</CardDescription>
            </CardHeader>
            <CardContent>
              {pathwaysLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pathwayChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="dataPoints" fill="#3b82f6" name="Data Points" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pathways Tab */}
        <TabsContent value="pathways" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pathways.map((pathway) => (
              <Card key={pathway.id} data-testid={`pathway-card-${pathway.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pathway.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {pathway.description}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={pathway.status === 'active' ? 'default' : 'secondary'}
                      data-testid={`badge-status-${pathway.id}`}
                    >
                      {pathway.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Data Points:</span>
                      <span className="font-medium" data-testid={`text-datapoints-${pathway.id}`}>
                        {pathway.dataPoints || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Bugs Tab */}
        <TabsContent value="bugs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bug Analytics</CardTitle>
              <CardDescription>Comprehensive bug tracking metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">By Severity</h3>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Critical</span>
                      <Badge variant="destructive">{statistics?.bySeverity.critical || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Major</span>
                      <Badge className="bg-orange-500">{statistics?.bySeverity.major || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Minor</span>
                      <Badge className="bg-green-500">{statistics?.bySeverity.minor || 0}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">By Status</h3>
                  <div className="space-y-1">
                    {statistics && Object.entries(statistics.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{status}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Metrics</h3>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Bugs</span>
                      <Badge>{statistics?.total || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Resolution</span>
                      <Badge variant="secondary">{statistics?.avgResolutionTime.toFixed(1) || 0}h</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Prioritized Improvements
              </CardTitle>
              <CardDescription>AI-ranked bugs and features by impact</CardDescription>
            </CardHeader>
            <CardContent>
              {improvementsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : improvements.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>No improvements needed at this time</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {improvements.map((improvement) => (
                    <div
                      key={improvement.rank}
                      className="border rounded-lg p-4 space-y-2"
                      data-testid={`improvement-${improvement.rank}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono">
                              #{improvement.rank}
                            </Badge>
                            <Badge
                              variant={
                                improvement.type === 'bug' ? 'destructive' :
                                improvement.type === 'feature' ? 'default' :
                                'secondary'
                              }
                            >
                              {improvement.type}
                            </Badge>
                            {improvement.severity && (
                              <Badge
                                variant="outline"
                                className={
                                  improvement.severity === 'critical' ? 'border-red-500 text-red-500' :
                                  improvement.severity === 'high' ? 'border-orange-500 text-orange-500' :
                                  'border-yellow-500 text-yellow-500'
                                }
                              >
                                {improvement.severity}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold">{improvement.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {improvement.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-medium">{improvement.impact.toFixed(0)}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {improvement.effort} effort
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

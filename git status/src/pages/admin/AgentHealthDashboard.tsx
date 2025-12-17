import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { RefreshCw, Activity, AlertTriangle, CheckCircle, XCircle, HelpCircle, ChevronDown, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { SEO } from '@/components/SEO';

/**
 * BLOCKER 8: Agent Health Dashboard
 * 
 * Super Admin dashboard for monitoring 134 ESA agents:
 * - Health metrics overview
 * - Agent health list with expandable details
 * - Batch operations
 * - Validation history
 * - Auto-refresh every 30 seconds
 */

interface AgentHealthStatus {
  agentCode: string;
  status: 'healthy' | 'degraded' | 'failing' | 'offline' | 'unknown';
  lastCheckAt: string;
  responseTime?: number;
  errorCount: number;
  errorDetails?: any;
}

interface ValidationCheckResult {
  checkType: 'availability' | 'performance' | 'integration' | 'fallback';
  agentCode: string;
  result: 'pass' | 'fail' | 'warning';
  details?: string;
  executionTime?: number;
  fallbackActivated: boolean;
  fallbackAgentCode?: string;
}

export default function AgentHealthDashboard() {
  const { toast } = useToast();
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [selectedCheckType, setSelectedCheckType] = useState<string>('availability');
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  // Fetch all agent health statuses with auto-refresh
  const { data: healthData = [], isLoading: isLoadingHealth, refetch: refetchHealth } = useQuery<AgentHealthStatus[]>({
    queryKey: ['/api/agents/health'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Fetch validation history
  const { data: historyData = [], isLoading: isLoadingHistory } = useQuery<ValidationCheckResult[]>({
    queryKey: ['/api/agents/validation/history', { limit: 20, agentCode: historyFilter !== 'all' ? historyFilter : undefined }],
    queryFn: async () => {
      const url = historyFilter && historyFilter !== 'all'
        ? `/api/agents/validation/history?agentCode=${historyFilter}&limit=20`
        : '/api/agents/validation/history?limit=20';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch validation history');
      return response.json();
    },
  });

  // Run health check on specific agent
  const runHealthCheckMutation = useMutation({
    mutationFn: async (agentCode: string) => {
      const response = await apiRequest('GET', `/api/agents/${agentCode}/health`);
      return response.json();
    },
    onSuccess: (data, agentCode) => {
      toast({
        title: 'Health check completed',
        description: `Agent ${agentCode}: ${data.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agents/health'] });
    },
    onError: (error: any, agentCode) => {
      toast({
        title: 'Health check failed',
        description: `Agent ${agentCode}: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Run validation check on specific agent
  const runValidationMutation = useMutation({
    mutationFn: async ({ agentCode, checkType }: { agentCode: string; checkType: string }) => {
      const response = await apiRequest('POST', `/api/agents/${agentCode}/validate`, { checkType });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Validation check completed',
        description: `Agent ${variables.agentCode}: ${data.result}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agents/health'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agents/validation/history'] });
    },
    onError: (error: any, variables) => {
      toast({
        title: 'Validation check failed',
        description: `Agent ${variables.agentCode}: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Run batch health checks
  const runBatchHealthChecksMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/agents/health/batch');
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Batch health checks completed',
        description: `Total: ${data.total}, Healthy: ${data.healthy}, Degraded: ${data.degraded}, Failing: ${data.failing}, Offline: ${data.offline}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agents/health'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Batch health checks failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Calculate metrics
  const totalAgents = healthData.length;
  const healthyCount = healthData.filter(a => a.status === 'healthy').length;
  const degradedCount = healthData.filter(a => a.status === 'degraded').length;
  const failingCount = healthData.filter(a => a.status === 'failing').length;
  const offlineCount = healthData.filter(a => a.status === 'offline').length;

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'healthy': return 'default';
      case 'degraded': return 'secondary';
      case 'failing': return 'destructive';
      case 'offline': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'failing': return 'text-orange-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getResultBadgeVariant = (result: string): "default" | "secondary" | "destructive" => {
    switch (result) {
      case 'pass': return 'default';
      case 'warning': return 'secondary';
      case 'fail': return 'destructive';
      default: return 'outline' as any;
    }
  };

  if (isLoadingHealth) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Agent Health Dashboard" fallbackRoute="/admin">
      <SEO 
        title="Agent Health Dashboard"
        description="Monitor and validate 134 ESA agents with real-time health checks, performance metrics, and automated fallback systems"
        ogImage="/og-image.png"
      />
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agent Health Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and validate all 134 ESA agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => refetchHealth()} 
            variant="outline"
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => runBatchHealthChecksMutation.mutate()}
            disabled={runBatchHealthChecksMutation.isPending}
            data-testid="button-run-batch"
          >
            <Activity className={`h-4 w-4 mr-2 ${runBatchHealthChecksMutation.isPending ? 'animate-spin' : ''}`} />
            {runBatchHealthChecksMutation.isPending ? 'Running...' : 'Run Batch Health Checks'}
          </Button>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="metric-total-agents">{totalAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">ESA Framework</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Healthy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="metric-healthy">{healthyCount}</div>
            <Badge variant="default" className="mt-1">Operational</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Degraded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{degradedCount}</div>
            <Badge variant="secondary" className="mt-1">Slow Response</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-orange-600" />
              Failing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{failingCount}</div>
            <Badge variant="destructive" className="mt-1">Errors</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-red-600" />
              Offline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{offlineCount}</div>
            <Badge variant="destructive" className="mt-1">Unreachable</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Agent Health List */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Health Status</CardTitle>
          <CardDescription>Click on an agent to see details and run checks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table data-testid="table-agent-health">
              <TableHeader>
                <TableRow>
                  <TableHead>Agent Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Check</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Error Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No health data available. Click "Run Batch Health Checks" to scan all agents.
                    </TableCell>
                  </TableRow>
                ) : (
                  healthData.map((agent) => (
                    <Collapsible
                      key={agent.agentCode}
                      open={expandedAgent === agent.agentCode}
                      onOpenChange={(open) => setExpandedAgent(open ? agent.agentCode : null)}
                      asChild
                    >
                      <>
                        <TableRow className="hover-elevate" data-testid={`row-agent-${agent.agentCode}`}>
                          <TableCell className="font-medium">
                            <CollapsibleTrigger className="flex items-center gap-2 w-full">
                              <ChevronDown className={`h-4 w-4 transition-transform ${expandedAgent === agent.agentCode ? 'rotate-180' : ''}`} />
                              {agent.agentCode}
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(agent.status)}>
                              {agent.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(agent.lastCheckAt).toLocaleString()}
                          </TableCell>
                          <TableCell className={agent.responseTime ? getStatusColor(agent.status) : ''}>
                            {agent.responseTime ? `${agent.responseTime}ms` : 'N/A'}
                          </TableCell>
                          <TableCell className={agent.errorCount > 0 ? 'text-red-600 font-semibold' : ''}>
                            {agent.errorCount}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  runHealthCheckMutation.mutate(agent.agentCode);
                                }}
                                disabled={runHealthCheckMutation.isPending}
                                data-testid={`button-health-check-${agent.agentCode}`}
                              >
                                <Activity className="h-3 w-3 mr-1" />
                                Check
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={6} className="bg-muted/50">
                              <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Agent Details</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="text-muted-foreground">Status:</span> <span className={getStatusColor(agent.status)}>{agent.status}</span></p>
                                      <p><span className="text-muted-foreground">Response Time:</span> {agent.responseTime ? `${agent.responseTime}ms` : 'N/A'}</p>
                                      <p><span className="text-muted-foreground">Error Count:</span> {agent.errorCount}</p>
                                      <p><span className="text-muted-foreground">Last Check:</span> {new Date(agent.lastCheckAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Run Validation</h4>
                                    <div className="flex gap-2">
                                      <Select value={selectedCheckType} onValueChange={setSelectedCheckType}>
                                        <SelectTrigger className="w-full" data-testid={`select-check-type-${agent.agentCode}`}>
                                          <SelectValue placeholder="Check type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="availability">Availability</SelectItem>
                                          <SelectItem value="performance">Performance</SelectItem>
                                          <SelectItem value="integration">Integration</SelectItem>
                                          <SelectItem value="fallback">Fallback</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        onClick={() => runValidationMutation.mutate({ agentCode: agent.agentCode, checkType: selectedCheckType })}
                                        disabled={runValidationMutation.isPending}
                                        data-testid={`button-run-validation-${agent.agentCode}`}
                                      >
                                        <Play className="h-4 w-4 mr-1" />
                                        Run
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                {agent.errorDetails && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Error Details</h4>
                                    <pre className="bg-background p-2 rounded text-xs overflow-auto max-h-32">
                                      {JSON.stringify(agent.errorDetails, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Validation History */}
      <Card>
        <CardHeader>
          <CardTitle>Validation History</CardTitle>
          <CardDescription>Recent validation checks across all agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={historyFilter} onValueChange={setHistoryFilter}>
              <SelectTrigger className="w-full md:w-64" data-testid="select-filter-history">
                <SelectValue placeholder="Filter by agent (all)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {healthData.map((agent) => (
                  <SelectItem key={agent.agentCode} value={agent.agentCode}>
                    {agent.agentCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent Code</TableHead>
                  <TableHead>Check Type</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Execution Time</TableHead>
                  <TableHead>Fallback Activated</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingHistory ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : historyData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No validation history available
                    </TableCell>
                  </TableRow>
                ) : (
                  historyData.map((check, idx) => (
                    <TableRow key={idx} data-testid={`row-history-${idx}`}>
                      <TableCell className="font-medium">{check.agentCode}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{check.checkType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getResultBadgeVariant(check.result)}>
                          {check.result}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {check.executionTime ? `${check.executionTime}ms` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {check.fallbackActivated ? (
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary">Yes</Badge>
                            {check.fallbackAgentCode && (
                              <span className="text-xs text-muted-foreground">→ {check.fallbackAgentCode}</span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {check.details || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
    </SelfHealingErrorBoundary>
  );
}

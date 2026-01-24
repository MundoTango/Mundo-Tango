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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(['pages', 'common']);
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
      if (!response.ok) throw new Error(t('pages:agents.failedToFetchHistory', 'Failed to fetch validation history'));
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
        title: t('pages:agents.healthCheckCompleted', 'Health check completed'),
        description: t('pages:agents.agentStatusResult', 'Agent {{agentCode}}: {{status}}', { agentCode, status: data.status }),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agents/health'] });
    },
    onError: (error: any, agentCode) => {
      toast({
        title: t('pages:agents.healthCheckFailed', 'Health check failed'),
        description: t('pages:agents.agentStatusResult', 'Agent {{agentCode}}: {{status}}', { agentCode, status: error.message }),
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
        title: t('pages:agents.validationCheckCompleted', 'Validation check completed'),
        description: t('pages:agents.agentStatusResult', 'Agent {{agentCode}}: {{status}}', { agentCode: variables.agentCode, status: data.result }),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agents/health'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agents/validation/history'] });
    },
    onError: (error: any, variables) => {
      toast({
        title: t('pages:agents.validationCheckFailed', 'Validation check failed'),
        description: t('pages:agents.agentStatusResult', 'Agent {{agentCode}}: {{status}}', { agentCode: variables.agentCode, status: error.message }),
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
        title: t('pages:agents.batchHealthCheckCompleted', 'Batch health checks completed'),
        description: t('pages:agents.batchResult', 'Total: {{total}}, Healthy: {{healthy}}, Degraded: {{degraded}}, Failing: {{failing}}, Offline: {{offline}}', {
          total: data.total,
          healthy: data.healthy,
          degraded: data.degraded,
          failing: data.failing,
          offline: data.offline
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agents/health'] });
    },
    onError: (error: any) => {
      toast({
        title: t('pages:agents.batchHealthCheckFailed', 'Batch health checks failed'),
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
    <SelfHealingErrorBoundary pageName={t('pages:agents.agentHealthDashboard', 'Agent Health Dashboard')} fallbackRoute="/admin">
      <SEO 
        title={t('pages:agents.agentHealthDashboard', 'Agent Health Dashboard')}
        description={t('pages:agents.agentHealthDashboardDesc', 'Monitor and validate 134 ESA agents with real-time health checks, performance metrics, and automated fallback systems')}
        ogImage="/og-image.png"
      />
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('pages:agents.agentHealthDashboard', 'Agent Health Dashboard')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('pages:agents.monitorAgentsCount', 'Monitor and validate all 134 ESA agents')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => refetchHealth()} 
            variant="outline"
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common:refresh', 'Refresh')}
          </Button>
          <Button 
            onClick={() => runBatchHealthChecksMutation.mutate()}
            disabled={runBatchHealthChecksMutation.isPending}
            data-testid="button-run-batch"
          >
            <Activity className={`h-4 w-4 mr-2 ${runBatchHealthChecksMutation.isPending ? 'animate-spin' : ''}`} />
            {runBatchHealthChecksMutation.isPending ? t('common:running', 'Running...') : t('pages:agents.runBatchHealthChecks', 'Run Batch Health Checks')}
          </Button>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('pages:agents.totalAgents', 'Total Agents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="metric-total-agents">{totalAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('pages:agents.esaFramework', 'ESA Framework')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {t('pages:agents.healthy', 'Healthy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="metric-healthy">{healthyCount}</div>
            <Badge variant="default" className="mt-1">{t('pages:agents.operational', 'Operational')}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              {t('pages:agents.degraded', 'Degraded')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{degradedCount}</div>
            <Badge variant="secondary" className="mt-1">{t('pages:agents.slowResponse', 'Slow Response')}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-orange-600" />
              {t('pages:agents.failing', 'Failing')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{failingCount}</div>
            <Badge variant="destructive" className="mt-1">{t('pages:agents.errors', 'Errors')}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-red-600" />
              {t('pages:agents.offline', 'Offline')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{offlineCount}</div>
            <Badge variant="destructive" className="mt-1">{t('pages:agents.unreachable', 'Unreachable')}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Agent Health List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('pages:agents.agentHealthStatus', 'Agent Health Status')}</CardTitle>
          <CardDescription>{t('pages:agents.clickAgentDetails', 'Click on an agent to see details and run checks')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table data-testid="table-agent-health">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pages:agents.agentCode', 'Agent Code')}</TableHead>
                  <TableHead>{t('pages:agents.status', 'Status')}</TableHead>
                  <TableHead>{t('pages:agents.lastCheck', 'Last Check')}</TableHead>
                  <TableHead>{t('pages:agents.responseTime', 'Response Time')}</TableHead>
                  <TableHead>{t('pages:agents.errorCount', 'Error Count')}</TableHead>
                  <TableHead>{t('pages:agents.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('pages:agents.noHealthData', 'No health data available. Click "Run Batch Health Checks" to scan all agents.')}
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
                              {t(`pages:agents.status.${agent.status}`, agent.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(agent.lastCheckAt).toLocaleString()}
                          </TableCell>
                          <TableCell className={agent.responseTime ? getStatusColor(agent.status) : ''}>
                            {agent.responseTime ? `${agent.responseTime}ms` : t('common:na', 'N/A')}
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
                                {t('pages:agents.check', 'Check')}
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
                                    <h4 className="font-semibold mb-2">{t('pages:agents.agentDetails', 'Agent Details')}</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="text-muted-foreground">{t('pages:agents.status', 'Status')}:</span> <span className={getStatusColor(agent.status)}>{t(`pages:agents.status.${agent.status}`, agent.status)}</span></p>
                                      <p><span className="text-muted-foreground">{t('pages:agents.responseTime', 'Response Time')}:</span> {agent.responseTime ? `${agent.responseTime}ms` : t('common:na', 'N/A')}</p>
                                      <p><span className="text-muted-foreground">{t('pages:agents.errorCount', 'Error Count')}:</span> {agent.errorCount}</p>
                                      <p><span className="text-muted-foreground">{t('pages:agents.lastCheck', 'Last Check')}:</span> {new Date(agent.lastCheckAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">{t('pages:agents.runValidation', 'Run Validation')}</h4>
                                    <div className="flex gap-2">
                                      <Select value={selectedCheckType} onValueChange={setSelectedCheckType}>
                                        <SelectTrigger className="w-full" data-testid={`select-check-type-${agent.agentCode}`}>
                                          <SelectValue placeholder={t('pages:agents.checkType', 'Check type')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="availability">{t('pages:agents.checkType.availability', 'Availability')}</SelectItem>
                                          <SelectItem value="performance">{t('pages:agents.checkType.performance', 'Performance')}</SelectItem>
                                          <SelectItem value="integration">{t('pages:agents.checkType.integration', 'Integration')}</SelectItem>
                                          <SelectItem value="fallback">{t('pages:agents.checkType.fallback', 'Fallback')}</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        onClick={() => runValidationMutation.mutate({ agentCode: agent.agentCode, checkType: selectedCheckType })}
                                        disabled={runValidationMutation.isPending}
                                        data-testid={`button-run-validation-${agent.agentCode}`}
                                      >
                                        <Play className="h-4 w-4 mr-1" />
                                        {t('common:run', 'Run')}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                {agent.errorDetails && (
                                  <div>
                                    <h4 className="font-semibold mb-2">{t('pages:agents.errorDetails', 'Error Details')}</h4>
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
          <CardTitle>{t('pages:agents.validationHistory', 'Validation History')}</CardTitle>
          <CardDescription>{t('pages:agents.validationHistoryDesc', 'Recent validation checks across all agents')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={historyFilter} onValueChange={setHistoryFilter}>
              <SelectTrigger className="w-full md:w-64" data-testid="select-filter-history">
                <SelectValue placeholder={t('pages:agents.filterByAgentAll', 'Filter by agent (all)')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('pages:agents.allAgents', 'All Agents')}</SelectItem>
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
                  <TableHead>{t('pages:agents.agentCode', 'Agent Code')}</TableHead>
                  <TableHead>{t('pages:agents.checkType', 'Check Type')}</TableHead>
                  <TableHead>{t('pages:agents.result', 'Result')}</TableHead>
                  <TableHead>{t('pages:agents.executionTime', 'Execution Time')}</TableHead>
                  <TableHead>{t('pages:agents.fallbackActivated', 'Fallback Activated')}</TableHead>
                  <TableHead>{t('pages:agents.details', 'Details')}</TableHead>
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
                      {t('pages:agents.noValidationHistory', 'No validation history available')}
                    </TableCell>
                  </TableRow>
                ) : (
                  historyData.map((check, idx) => (
                    <TableRow key={idx} data-testid={`row-history-${idx}`}>
                      <TableCell className="font-medium">{check.agentCode}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(`pages:agents.checkType.${check.checkType}`, check.checkType)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getResultBadgeVariant(check.result)}>
                          {t(`pages:agents.result.${check.result}`, check.result)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {check.executionTime ? `${check.executionTime}ms` : t('common:na', 'N/A')}
                      </TableCell>
                      <TableCell>
                        {check.fallbackActivated ? (
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary">{t('common:yes', 'Yes')}</Badge>
                            {check.fallbackAgentCode && (
                              <span className="text-xs text-muted-foreground">→ {check.fallbackAgentCode}</span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline">{t('common:no', 'No')}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {check.details || t('common:na', 'N/A')}
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

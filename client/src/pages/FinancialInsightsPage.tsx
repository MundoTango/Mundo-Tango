import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, TrendingUp, AlertTriangle, Activity, Filter, Clock } from "lucide-react";
import { AIDecisionCard } from "@/components/financial/AIDecisionCard";
import { RiskMetricsPanel } from "@/components/financial/RiskMetricsPanel";
import type { 
  SelectFinancialPortfolio, 
  SelectFinancialAIDecision, 
  SelectFinancialRiskMetrics,
  SelectFinancialStrategy,
  SelectFinancialAgent,
  SelectFinancialMonitoring
} from "@shared/client-types";

export default function FinancialInsightsPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null);

  const { data: portfolios, isLoading: portfoliosLoading } = useQuery<SelectFinancialPortfolio[]>({
    queryKey: ['/api/financial/portfolios'],
  });

  const { data: aiDecisions, isLoading: decisionsLoading } = useQuery<SelectFinancialAIDecision[]>({
    queryKey: ['/api/financial/portfolios', selectedPortfolio, 'ai-decisions'],
    enabled: !!selectedPortfolio,
  });

  const { data: riskMetrics, isLoading: metricsLoading } = useQuery<SelectFinancialRiskMetrics>({
    queryKey: ['/api/financial/portfolios', selectedPortfolio, 'risk-metrics'],
    enabled: !!selectedPortfolio,
  });

  const { data: strategies, isLoading: strategiesLoading } = useQuery<SelectFinancialStrategy[]>({
    queryKey: ['/api/financial/strategies'],
  });

  const { data: agents, isLoading: agentsLoading } = useQuery<SelectFinancialAgent[]>({
    queryKey: ['/api/financial/agents'],
  });

  const { data: monitoringLogs, isLoading: logsLoading } = useQuery<SelectFinancialMonitoring[]>({
    queryKey: ['/api/financial/monitoring'],
  });

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.2) 0%, rgba(30, 144, 255, 0.2) 100%)',
              border: '1px solid rgba(64, 224, 208, 0.3)',
            }}
          >
            <Brain className="h-6 w-6" style={{ color: '#40E0D0' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('pages:financialInsights.title', 'AI Insights & Analytics')}</h1>
            <p className="text-muted-foreground">{t('pages:financialInsights.subtitle', 'Advanced analytics powered by 33 AI agents')}</p>
          </div>
        </div>
      </div>

      {/* Portfolio Selector */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select
          value={selectedPortfolio?.toString() || ''}
          onValueChange={(value) => setSelectedPortfolio(parseInt(value))}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder={t('pages:financialInsights.selectPortfolioPlaceholder', 'Select a portfolio')} />
          </SelectTrigger>
          <SelectContent>
            {portfoliosLoading ? (
              <SelectItem value="loading" disabled>{t('common:loading', 'Loading...')}</SelectItem>
            ) : portfolios && portfolios.length > 0 ? (
              portfolios.map((portfolio) => (
                <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                  {portfolio.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>{t('pages:financialInsights.noPortfoliosAvailable', 'No portfolios available')}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {!selectedPortfolio ? (
        <div 
          className="flex flex-col items-center justify-center h-96 rounded-lg"
          style={{
            background: 'rgba(64, 224, 208, 0.05)',
            border: '1px solid rgba(64, 224, 208, 0.1)',
          }}
        >
          <Brain className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">{t('pages:financialInsights.selectPortfolio', 'Select a Portfolio for Insights')}</p>
          <p className="text-muted-foreground text-center max-w-md">
            {t('pages:financialInsights.selectPortfolioDescription', 'Choose a portfolio from the dropdown above to view AI insights and risk analytics')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Risk Metrics */}
          <RiskMetricsPanel metrics={riskMetrics || null} isLoading={metricsLoading} />

          {/* AI Decisions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('pages:financialInsights.aiRecommendations', 'AI Recommendations')}</h2>
              <Badge variant="outline">{t('pages:financialInsights.decisionsCount', '{{count}} decisions', { count: aiDecisions?.length || 0 })}</Badge>
            </div>

            {decisionsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : aiDecisions && aiDecisions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="panel-ai-insights">
                {aiDecisions.map((decision) => (
                  <AIDecisionCard
                    key={decision.id}
                    decision={decision}
                    onExecute={(id) => {
                      console.log('Execute decision:', id);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center h-48 rounded-lg"
                style={{
                  background: 'rgba(64, 224, 208, 0.05)',
                  border: '1px solid rgba(64, 224, 208, 0.1)',
                }}
              >
                <Brain className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-muted-foreground">{t('pages:financialInsights.noAiDecisions', 'No AI decisions yet')}</p>
              </div>
            )}
          </div>

          {/* Strategy Performance */}
          <Card
            style={{
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(64, 224, 208, 0.1)',
            }}
          >
            <CardHeader>
              <CardTitle>{t('pages:financialInsights.activeStrategies', 'Active Strategies')}</CardTitle>
            </CardHeader>
            <CardContent>
              {strategiesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : strategies && strategies.length > 0 ? (
                <div className="space-y-3">
                  {strategies.filter(s => s.isActive).map((strategy) => (
                    <div 
                      key={strategy.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{
                        background: 'rgba(64, 224, 208, 0.05)',
                        border: '1px solid rgba(64, 224, 208, 0.1)',
                      }}
                    >
                      <div>
                        <p className="font-medium">{strategy.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {strategy.strategyType}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              strategy.riskLevel === 'low' ? 'text-green-400 border-green-400/30' :
                              strategy.riskLevel === 'medium' ? 'text-yellow-400 border-yellow-400/30' :
                              'text-red-400 border-red-400/30'
                            }`}
                          >
                            {strategy.riskLevel} {t('pages:financialInsights.risk', 'risk')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t('pages:financialInsights.capitalAllocated', 'Capital Allocated')}</p>
                        <p className="font-bold" style={{ color: '#40E0D0' }}>
                          ${parseFloat(strategy.capitalAllocation || "0").toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">{t('pages:financialInsights.noActiveStrategies', 'No active strategies')}</p>
              )}
            </CardContent>
          </Card>

          {/* Agent Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Active Agents */}
            <Card
              style={{
                background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(64, 224, 208, 0.1)',
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t('pages:financialInsights.activeAgents', 'Active Agents')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agentsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : agents && agents.length > 0 ? (
                  <div className="space-y-2">
                    {agents.filter(a => a.isActive).slice(0, 5).map((agent) => (
                      <div 
                        key={agent.id}
                        className="flex items-center justify-between p-2 rounded"
                        style={{
                          background: 'rgba(64, 224, 208, 0.03)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{agent.agentNumber}</Badge>
                          <span className="text-sm">{agent.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {t('pages:financialInsights.agentDecisions', '{{count}} decisions', { count: agent.totalDecisions })}
                          </p>
                          {agent.successRate && (
                            <p className="text-xs text-green-400">
                              {parseFloat(agent.successRate).toFixed(1)}% {t('pages:financialInsights.success', 'success')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">{t('pages:financialInsights.noActiveAgents', 'No active agents')}</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Monitoring */}
            <Card
              style={{
                background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(64, 224, 208, 0.1)',
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('pages:financialInsights.recentActivity', 'Recent Activity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : monitoringLogs && monitoringLogs.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {monitoringLogs.slice(0, 10).map((log) => (
                      <div 
                        key={log.id}
                        className="flex items-start gap-2 p-2 rounded text-sm"
                        style={{
                          background: 'rgba(64, 224, 208, 0.03)',
                        }}
                      >
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            log.checkType === 'alert' ? 'text-red-400 border-red-400/30' :
                            log.checkType === 'opportunity' ? 'text-green-400 border-green-400/30' :
                            'text-blue-400 border-blue-400/30'
                          }`}
                        >
                          {log.checkType}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                          {log.actionTaken && (
                            <p className="text-xs text-green-400 mt-1">{t('pages:financialInsights.actionTaken', 'Action taken')}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">{t('pages:financialInsights.noRecentActivity', 'No recent activity')}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Market Alerts */}
          <Card
            style={{
              background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.05) 0%, rgba(255, 69, 0, 0.05) 100%)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 165, 0, 0.2)',
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                {t('pages:financialInsights.marketAlerts', 'Market Alerts & Opportunities')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('pages:financialInsights.marketAlertsDescription', 'AI agents monitor markets 24/7 for opportunities and risks. Alerts will appear here when detected.')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

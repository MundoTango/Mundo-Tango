import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {Bot, Brain, CheckCircle, Clock, Users, Zap, Award, Activity } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

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
  const { t } = useTranslation(["pages", "common"]);
  // Fetch agent stats from backend API
  const { data: stats, isLoading: statsLoading } = useQuery<AgentStats>({
    queryKey: ["/api/platform/esa/stats"],
  });

  // Fetch agents list from backend API
  const { data: agents = [], isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ["/api/platform/esa/agents"],
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  if (statsLoading) {
    return (
      <SelfHealingErrorBoundary pageName="ESA Dashboard" fallbackRoute="/platform">
        <PageLayout title="ESA Framework Dashboard" showBreadcrumbs>
          <div className="container mx-auto p-6">
            <div className="text-center py-8" data-testid="loading-esa-stats">
              {t('pages:esaDashboard.loading', 'Loading ESA Framework...')}
            </div>
          </div>
        </PageLayout>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="ESA Dashboard" fallbackRoute="/platform">
      <SEO 
        title="ESA Framework Dashboard"
        description="Manage 134 Expert Specialized Agents with real-time monitoring, task management, and multi-AI orchestration for intelligent automation"
        ogImage="/og-image.png"
      />
      <PageLayout title="ESA Framework Dashboard" showBreadcrumbs>
        <div className="min-h-screen">
          {/* Hero Section - 16:9 */}
          <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=900&fit=crop')`
            }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  <Brain className="w-3 h-3 mr-1.5" />
                  {t('pages:esaDashboard.platformManagement', 'Platform Management')}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  {t('pages:esaDashboard.title', 'ESA Framework Dashboard')}
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  {t('pages:esaDashboard.subtitle', 'Expert Specialized Agents • {{count}} Agents • 61 Layers • MB.MD Protocol', { count: stats?.totalAgents || 0 })}
                </p>
              </motion.div>
            </div>
          </section>

          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-7xl space-y-8">
              {/* Overview Stats */}
              <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="hover-elevate overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('pages:esaDashboard.totalAgents', 'Total Agents')}</CardTitle>
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-serif font-bold" data-testid="text-total-agents">
                      {stats?.totalAgents || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('pages:esaDashboard.acrossAgentTypes', 'Across 12 agent types')}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-elevate overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('pages:esaDashboard.activeAgents', 'Active Agents')}</CardTitle>
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-serif font-bold text-green-600" data-testid="text-active-agents">
                      {stats?.activeAgents || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('pages:esaDashboard.currentlyOperational', 'Currently operational')}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-elevate overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('pages:esaDashboard.certifiedAgents', 'Certified Agents')}</CardTitle>
                    <Award className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-serif font-bold" data-testid="text-certified-agents">
                      {stats?.certifiedAgents || 0}
                    </div>
                    <Progress
                      value={(stats?.certifiedAgents || 0) / (stats?.totalAgents || 1) * 100}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card className="hover-elevate overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('pages:esaDashboard.inTraining', 'In Training')}</CardTitle>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-serif font-bold text-blue-600" data-testid="text-training-agents">
                      {stats?.trainingAgents || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('pages:esaDashboard.ultraMicroParallel', 'Ultra-Micro Parallel methodology')}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Agents by Type */}
              <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                <Card className="overflow-hidden">
                  <CardHeader className="border-b">
                    <CardTitle className="text-2xl font-serif">{t('pages:esaDashboard.agentsByType', 'Agents by Type')}</CardTitle>
                    <CardDescription>{t('pages:esaDashboard.agentsByTypeDesc', 'Distribution across 12 specialized categories')}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {stats && Object.entries(stats.agentsByType).map(([type, count], idx) => (
                        <motion.div 
                          key={type} 
                          className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div>
                            <div className="text-sm font-medium capitalize">{type.replace('_', ' ')}</div>
                            <div className="text-xs text-muted-foreground">{type.toUpperCase()}</div>
                          </div>
                          <div className="text-2xl font-serif font-bold">{count}</div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Certification Levels & Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                  <Card className="overflow-hidden h-full">
                    <CardHeader className="border-b">
                      <CardTitle className="text-2xl font-serif">{t('pages:esaDashboard.certificationLevels', 'Certification Levels')}</CardTitle>
                      <CardDescription>{t('pages:esaDashboard.certificationLevelsDesc', 'Agent training and certification progress')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      {[
                        { level: 0, label: t('pages:esaDashboard.levelNone', 'None'), count: stats?.certificationLevels.level0 || 0, variant: "outline" as const },
                        { level: 1, label: t('pages:esaDashboard.levelBasic', 'Basic'), count: stats?.certificationLevels.level1 || 0, variant: "secondary" as const },
                        { level: 2, label: t('pages:esaDashboard.levelProduction', 'Production'), count: stats?.certificationLevels.level2 || 0, variant: "default" as const },
                        { level: 3, label: t('pages:esaDashboard.levelMaster', 'Master'), count: stats?.certificationLevels.level3 || 0, variant: "default" as const }
                      ].map((cert, idx) => (
                        <motion.div 
                          key={cert.level} 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={cert.variant} className={cert.level === 3 ? "bg-purple-600 text-white" : ""}>
                                {t('pages:esaDashboard.level', 'Level')} {cert.level}
                              </Badge>
                              <span className="text-sm">{cert.label}</span>
                            </div>
                            <span className="font-bold">{cert.count}</span>
                          </div>
                          <Progress value={(cert.count / (stats?.totalAgents || 1)) * 100} />
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card className="overflow-hidden h-full">
                    <CardHeader className="border-b">
                      <CardTitle className="text-2xl font-serif">{t('pages:esaDashboard.performanceMetrics', 'Performance Metrics')}</CardTitle>
                      <CardDescription>{t('pages:esaDashboard.performanceMetricsDesc', 'Aggregate agent performance statistics')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                      {[
                        { label: t('pages:esaDashboard.totalTasksCompleted', 'Total Tasks Completed'), sublabel: t('pages:esaDashboard.allAgentsCombined', 'All agents combined'), value: stats?.performanceMetrics.totalTasksCompleted || 0, color: "" },
                        { label: t('pages:esaDashboard.averageSuccessRate', 'Average Success Rate'), sublabel: t('pages:esaDashboard.taskCompletionRate', 'Task completion rate'), value: `${stats?.performanceMetrics.avgSuccessRate || 0}%`, color: "text-green-600" },
                        { label: t('pages:esaDashboard.avgCompletionTime', 'Avg Completion Time'), sublabel: t('pages:esaDashboard.perTask', 'Per task'), value: `${stats?.performanceMetrics.avgCompletionTime || 0}s`, color: "" }
                      ].map((metric, idx) => (
                        <motion.div 
                          key={idx} 
                          className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div>
                            <div className="text-sm font-medium">{metric.label}</div>
                            <div className="text-xs text-muted-foreground">{metric.sublabel}</div>
                          </div>
                          <div className={`text-2xl font-serif font-bold ${metric.color}`}>
                            {metric.value}
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Agents Table */}
              <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
                <Card className="overflow-hidden">
                  <CardHeader className="border-b">
                    <CardTitle className="text-2xl font-serif">{t('pages:esaDashboard.agentRegistry', 'Agent Registry')}</CardTitle>
                    <CardDescription>
                      {agents.length === 0 ? t('pages:esaDashboard.noAgentsRegisteredYet', 'No agents registered yet') : t('pages:esaDashboard.agentsRegistered', '{{count}} agents registered', { count: agents.length })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    {agentsLoading ? (
                      <div className="text-center py-8">{t('pages:esaDashboard.loadingAgents', 'Loading agents...')}</div>
                    ) : agents.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Bot className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="font-medium text-lg">{t('pages:esaDashboard.noAgents', 'No agents registered')}</p>
                        <p className="text-sm mt-2">{t('pages:esaDashboard.agentsWillAppear', 'Agents will appear here once they are initialized')}</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('pages:esaDashboard.tableCode', 'Code')}</TableHead>
                            <TableHead>{t('pages:esaDashboard.tableName', 'Name')}</TableHead>
                            <TableHead>{t('pages:esaDashboard.tableType', 'Type')}</TableHead>
                            <TableHead>{t('pages:esaDashboard.tableStatus', 'Status')}</TableHead>
                            <TableHead>{t('pages:esaDashboard.tableCertification', 'Certification')}</TableHead>
                            <TableHead>{t('pages:esaDashboard.tableTasks', 'Tasks')}</TableHead>
                            <TableHead>{t('pages:esaDashboard.tableLastActive', 'Last Active')}</TableHead>
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
                                <Badge className={agent.certificationLevel === 3 ? "bg-purple-600 text-white" : ""}>
                                  Level {agent.certificationLevel}
                                </Badge>
                              </TableCell>
                              <TableCell>{agent.tasksCompleted}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {agent.lastActiveAt ? new Date(agent.lastActiveAt).toLocaleDateString() : t('pages:esaDashboard.never', 'Never')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}

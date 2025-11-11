import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {Bot, Brain, CheckCircle, Clock, Users, Zap, Award, Activity } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

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
      <SelfHealingErrorBoundary pageName="ESA Dashboard" fallbackRoute="/platform">
        <div className="text-center py-8" data-testid="loading-esa-stats">
          Loading ESA Framework...
        </div>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="ESA Dashboard" fallbackRoute="/platform">
      {/* Hero Section - 16:9 Aspect Ratio */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20">
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
              <Brain className="w-4 h-4 mr-2 inline" />
              Expert Specialized Agents
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight" data-testid="text-page-title">
              ESA Framework
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {stats?.totalAgents || 0} Intelligent Agents · 61 Layers · MB.MD Protocol
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 space-y-12">

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-8"
      >
        {[
          { title: "Total Agents", value: stats?.totalAgents || 0, subtitle: "Across 12 agent types", icon: Bot, testId: "text-total-agents" },
          { title: "Active Agents", value: stats?.activeAgents || 0, subtitle: "Currently operational", icon: Activity, testId: "text-active-agents", color: "text-green-600" },
          { title: "Certified Agents", value: stats?.certifiedAgents || 0, subtitle: "Production ready", icon: Award, testId: "text-certified-agents", progress: true },
          { title: "In Training", value: stats?.trainingAgents || 0, subtitle: "Ultra-Micro Parallel", icon: Clock, testId: "text-training-agents", color: "text-blue-600" }
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
                    value={(stats?.certifiedAgents || 0) / (stats?.totalAgents || 1) * 100}
                    className="mt-2"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Agents by Type */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Card className="hover-elevate">
          <CardHeader className="p-8">
            <CardTitle className="text-3xl font-serif font-bold">Agents by Type</CardTitle>
            <CardDescription className="text-base mt-2">Distribution across 12 specialized categories</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats && Object.entries(stats.agentsByType).map(([type, count], index) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center justify-between p-6 border rounded-xl hover-elevate active-elevate-2 bg-gradient-to-br from-card to-muted/20"
                >
                  <div>
                    <div className="text-sm font-medium capitalize">{type.replace('_', ' ')}</div>
                    <div className="text-xs text-muted-foreground">{type.toUpperCase()}</div>
                  </div>
                  <div className="text-3xl font-serif font-bold">{count}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Certification Levels */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <Card className="hover-elevate">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-serif font-bold">Certification Levels</CardTitle>
            <CardDescription className="text-base mt-2">Agent training and certification progress</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {[
              { level: 0, label: "None", variant: "outline" as const, value: stats?.certificationLevels.level0 || 0 },
              { level: 1, label: "Basic", variant: "secondary" as const, value: stats?.certificationLevels.level1 || 0 },
              { level: 2, label: "Production", variant: "default" as const, value: stats?.certificationLevels.level2 || 0 },
              { level: 3, label: "Master", variant: "default" as const, className: "bg-purple-600", value: stats?.certificationLevels.level3 || 0 }
            ].map((cert, index) => (
              <motion.div
                key={cert.level}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={cert.variant} className={cert.className}>Level {cert.level}</Badge>
                    <span className="text-base font-medium">{cert.label}</span>
                  </div>
                  <span className="text-2xl font-serif font-bold">{cert.value}</span>
                </div>
                <Progress value={(cert.value / (stats?.totalAgents || 1)) * 100} />
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-serif font-bold">Performance Metrics</CardTitle>
            <CardDescription className="text-base mt-2">Aggregate agent performance statistics</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {[
              { label: "Total Tasks Completed", subtitle: "All agents combined", value: stats?.performanceMetrics.totalTasksCompleted || 0 },
              { label: "Average Success Rate", subtitle: "Task completion rate", value: `${stats?.performanceMetrics.avgSuccessRate || 0}%`, color: "text-green-600" },
              { label: "Avg Completion Time", subtitle: "Per task", value: `${stats?.performanceMetrics.avgCompletionTime || 0}s` }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center justify-between p-6 border rounded-xl bg-gradient-to-br from-card to-muted/20 hover-elevate"
              >
                <div>
                  <div className="text-base font-medium">{metric.label}</div>
                  <div className="text-sm text-muted-foreground mt-1">{metric.subtitle}</div>
                </div>
                <div className={`text-3xl font-serif font-bold ${metric.color || ''}`}>
                  {metric.value}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Agents Table */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Card className="hover-elevate">
          <CardHeader className="p-8">
            <CardTitle className="text-3xl font-serif font-bold">Agent Registry</CardTitle>
            <CardDescription className="text-base mt-2">
              {agents.length === 0 ? "No agents registered yet" : `${agents.length} agents registered`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {agentsLoading ? (
              <div className="text-center py-12">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  Loading agents...
                </motion.div>
              </div>
            ) : agents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16 text-muted-foreground"
              >
                <Bot className="w-16 h-16 mx-auto mb-6 opacity-50" />
                <p className="text-lg font-medium">No agents registered</p>
                <p className="text-sm mt-2">Agents will appear here once they are initialized</p>
              </motion.div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">Code</TableHead>
                    <TableHead className="font-medium">Name</TableHead>
                    <TableHead className="font-medium">Type</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">Certification</TableHead>
                    <TableHead className="font-medium">Tasks</TableHead>
                    <TableHead className="font-medium">Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent, index) => (
                    <motion.tr
                      key={agent.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      data-testid={`row-agent-${agent.agentCode}`}
                      className="border-b hover-elevate"
                    >
                      <TableCell className="font-mono font-semibold">{agent.agentCode}</TableCell>
                      <TableCell className="font-medium">{agent.agentName}</TableCell>
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
                      <TableCell className="font-medium">{agent.tasksCompleted}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {agent.lastActiveAt ? new Date(agent.lastActiveAt).toLocaleDateString() : "Never"}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </SelfHealingErrorBoundary>
  );
}

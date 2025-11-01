import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { MessageSquare, Bot, Users, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

export default function H2ACDashboardPage() {
  const metrics = [
    { label: "Active Agents", value: "134", change: "All online", icon: Bot, color: "text-blue-500" },
    { label: "User Requests", value: "247", change: "+23", icon: Users, color: "text-green-500" },
    { label: "Resolution Rate", value: "94%", change: "+2%", icon: CheckCircle, color: "text-purple-500" },
    { label: "Pending Issues", value: "12", change: "-5", icon: AlertCircle, color: "text-orange-500" }
  ];

  const recentCommunications = [
    {
      agentType: "SEO Agent",
      message: "Keyword rankings improved by 15% - recommend creating more tango blog content",
      priority: "medium",
      timestamp: "5 min ago",
      status: "new"
    },
    {
      agentType: "Churn Prevention",
      message: "User Maria (ID: 68) showing signs of disengagement - recommend intervention",
      priority: "high",
      timestamp: "12 min ago",
      status: "new"
    },
    {
      agentType: "Resource Allocation",
      message: "Server CPU usage at 78% - recommend scaling up instances",
      priority: "critical",
      timestamp: "18 min ago",
      status: "acknowledged"
    },
    {
      agentType: "Event Recommendation",
      message: "Buenos Aires Tango Festival has high match score for 2,400+ users",
      priority: "low",
      timestamp: "23 min ago",
      status: "resolved"
    }
  ];

  const agentCategories = [
    { category: "Algorithm Agents", count: 50, active: 50, healthScore: 98 },
    { category: "Page Agents", count: 50, active: 48, healthScore: 96 },
    { category: "Life CEO Agents", count: 16, active: 16, healthScore: 100 },
    { category: "Marketing Agents", count: 5, active: 5, healthScore: 100 },
    { category: "HR Agents", count: 5, active: 5, healthScore: 100 },
    { category: "Mr Blue AI Agents", count: 8, active: 8, healthScore: 100 }
  ];

  return (
    <PageLayout title="H2AC Dashboard" showBreadcrumbs>
<>
      <SEO
        title="H2AC Dashboard - Agent Communication Hub"
        description="Human-to-Agent Communication central dashboard for monitoring and managing all AI agents."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Human-to-Agent Communication Hub</p>
              </div>
            </div>
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {metrics.map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <metric.icon className={`h-8 w-8 ${metric.color}`} />
                      <span className="text-xs text-green-500 font-medium">{metric.change}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Communications */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Recent Agent Communications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentCommunications.map((comm, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      comm.priority === "critical" ? "bg-red-500/5 border-red-500/20"
                      : comm.priority === "high" ? "bg-orange-500/5 border-orange-500/20"
                      : comm.priority === "medium" ? "bg-blue-500/5 border-blue-500/20"
                      : "bg-gray-500/5 border-gray-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold text-sm">{comm.agentType}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        comm.priority === "critical" ? "bg-red-500/20 text-red-500"
                        : comm.priority === "high" ? "bg-orange-500/20 text-orange-500"
                        : comm.priority === "medium" ? "bg-blue-500/20 text-blue-500"
                        : "bg-gray-500/20 text-gray-500"
                      }`}>
                        {comm.priority}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{comm.message}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{comm.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        comm.status === "new" ? "bg-blue-500/20 text-blue-500"
                        : comm.status === "acknowledged" ? "bg-purple-500/20 text-purple-500"
                        : "bg-green-500/20 text-green-500"
                      }`}>
                        {comm.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-view-all-communications">
                  View All Communications
                </Button>
              </CardContent>
            </Card>

            {/* Agent Categories */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-500" />
                  Agent Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {agentCategories.map((category, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{category.category}</h3>
                      <span className="text-sm font-bold text-green-500">{category.healthScore}%</span>
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <span>Total: {category.count}</span>
                      <span>•</span>
                      <span>Active: {category.active}</span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${category.healthScore}%` }} 
                      />
                    </div>
                  </div>
                ))}
                <Button className="w-full" data-testid="button-agent-management">
                  Manage Agents
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>);
}

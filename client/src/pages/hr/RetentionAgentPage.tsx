import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Heart, TrendingDown, AlertTriangle, Users, Shield, Smile } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

export default function RetentionAgentPage() {
  const metrics = [
    { label: "Retention Rate", value: "94%", change: "+2%", icon: Shield, color: "text-green-500" },
    { label: "At-Risk Employees", value: "3", change: "-1", icon: AlertTriangle, color: "text-orange-500" },
    { label: "Satisfaction Score", value: "8.2/10", change: "+0.5", icon: Smile, color: "text-blue-500" },
    { label: "Turnover Rate", value: "6%", change: "-2%", icon: TrendingDown, color: "text-purple-500" }
  ];

  const atRiskEmployees = [
    { name: "Ana Torres", role: "Instructor", riskLevel: "high", factors: ["Low engagement", "Missed 1-on-1s"], tenure: "8 months" },
    { name: "Luis Martinez", role: "Coordinator", riskLevel: "medium", factors: ["Workload concerns"], tenure: "1.5 years" },
    { name: "Elena Ruiz", role: "Manager", riskLevel: "medium", factors: ["Career growth"], tenure: "2 years" }
  ];

  const retentionActions = [
    { action: "Schedule 1-on-1 with Ana", priority: "critical", dueDate: "Nov 2", assignedTo: "Manager" },
    { action: "Discuss career path with Elena", priority: "high", dueDate: "Nov 5", assignedTo: "HR Director" },
    { action: "Review workload for Luis", priority: "medium", dueDate: "Nov 7", assignedTo: "Team Lead" },
    { action: "Team morale survey", priority: "low", dueDate: "Nov 15", assignedTo: "HR Team" }
  ];

  return (
    <PageLayout title="Retention Agent" showBreadcrumbs>
<>
      <SEO
        title="Retention Agent - HR Dashboard"
        description="Monitor employee retention, satisfaction, and proactive interventions."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your AI retention assistant</p>
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
            {/* At-Risk Employees */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  At-Risk Employees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {atRiskEmployees.map((employee, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      employee.riskLevel === "high" ? "bg-red-500/5 border-red-500/20"
                      : "bg-orange-500/5 border-orange-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.role} • {employee.tenure}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        employee.riskLevel === "high" ? "bg-red-500/20 text-red-500"
                        : "bg-orange-500/20 text-orange-500"
                      }`}>
                        {employee.riskLevel} risk
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {employee.factors.map((factor, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-view-retention-insights">
                  View Full Retention Insights
                </Button>
              </CardContent>
            </Card>

            {/* Retention Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Retention Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {retentionActions.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{item.action}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.priority === "critical" ? "bg-red-500/20 text-red-500"
                        : item.priority === "high" ? "bg-orange-500/20 text-orange-500"
                        : item.priority === "medium" ? "bg-blue-500/20 text-blue-500"
                        : "bg-gray-500/20 text-gray-500"
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Due: {item.dueDate}</span>
                      <span>•</span>
                      <span>{item.assignedTo}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" data-testid="button-add-action">
                  + Add Retention Action
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>);
}

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Heart, TrendingDown, AlertTriangle, Users, Shield, Smile, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import retentionHeroImg from "@assets/stock_images/business_team_meetin_c8361ee1.jpg";
import retentionImg1 from "@assets/stock_images/business_team_meetin_caa5de6b.jpg";
import retentionImg2 from "@assets/stock_images/business_team_meetin_061b6626.jpg";

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
    <SelfHealingErrorBoundary pageName="Retention Agent" fallbackRoute="/platform">
    <PageLayout title="Retention Agent" showBreadcrumbs>
<>
      <SEO
        title="Retention Agent - HR Dashboard"
        description="Monitor employee retention, satisfaction, and proactive interventions with AI-powered insights."
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('${retentionHeroImg}')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-hr">
              HR AI
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              Retention Agent
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Proactive retention - identify risks, take action, and keep your best talent thriving
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Metrics Grid */}
        <div className="grid gap-8 md:grid-cols-4 mb-16">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <metric.icon className={`h-8 w-8 ${metric.color}`} />
                    <span className="text-xs text-green-500 font-medium">{metric.change}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-serif font-bold mt-2">{metric.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Featured Retention Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">Retention Strategy</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* At-Risk Employees Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={retentionImg1}
                  alt="At-Risk Team Members"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">At-Risk Employees</h3>
                  <p className="text-white/80 text-sm mt-1">Require immediate attention</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {atRiskEmployees.map((employee, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      employee.riskLevel === "high" ? "bg-red-500/5 border-red-500/20"
                      : "bg-orange-500/5 border-orange-500/20"
                    }`}
                    data-testid={`at-risk-${idx}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{employee.name}</h4>
                        <p className="text-xs text-muted-foreground">{employee.role} • {employee.tenure}</p>
                      </div>
                      <Badge className={
                        employee.riskLevel === "high" ? "bg-red-500" : "bg-orange-500"
                      }>
                        {employee.riskLevel} risk
                      </Badge>
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
                <Button className="w-full gap-2" variant="outline" data-testid="button-view-retention-insights">
                  <Shield className="w-4 h-4" />
                  View Full Retention Insights
                </Button>
              </CardContent>
            </Card>

            {/* Retention Actions Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={retentionImg2}
                  alt="Action Plan"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">Action Plan</h3>
                  <p className="text-white/80 text-sm mt-1">Prioritized retention initiatives</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {retentionActions.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate" data-testid={`action-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{item.action}</h4>
                      <Badge className={
                        item.priority === "critical" ? "bg-red-500"
                        : item.priority === "high" ? "bg-orange-500"
                        : item.priority === "medium" ? "bg-blue-500"
                        : ""
                      }>
                        {item.priority}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Due: {item.dueDate}</span>
                      <span>•</span>
                      <span>{item.assignedTo}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full gap-2" data-testid="button-add-action">
                  <Sparkles className="w-4 h-4" />
                  Add Retention Action
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}

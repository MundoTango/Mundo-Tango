import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Briefcase, TrendingUp, Target, FileText, Users, Award, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function CareerAgentPage() {
  const metrics = [
    { label: "Skills Mastered", value: "12", icon: Award, color: "text-yellow-500" },
    { label: "Hours Learning", value: "45", icon: Clock, color: "text-blue-500" },
    { label: "Network Growth", value: "+28", icon: Users, color: "text-green-500" },
    { label: "Career Goals", value: "3/5", icon: Target, color: "text-purple-500" }
  ];

  const goals = [
    { title: "Learn React Advanced Patterns", progress: 75, status: "In Progress" },
    { title: "Complete AWS Certification", progress: 40, status: "In Progress" },
    { title: "Contribute to Open Source", progress: 100, status: "Completed" },
    { title: "Attend Tech Conference", progress: 0, status: "Planned" },
    { title: "Build Portfolio Website", progress: 100, status: "Completed" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Career Agent" fallbackRoute="/platform">
    <PageLayout title="Career Agent" showBreadcrumbs>
<>
      <SEO
        title="Career Agent - Life CEO"
        description="Track your professional development, skills, and career goals with your AI career agent."
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
                <Briefcase className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your professional growth companion</p>
              </div>
            </div>
          </motion.div>

          {/* Metrics */}
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
                    <metric.icon className={`h-8 w-8 ${metric.color} mb-4`} />
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Career Goals */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Career Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.map((goal, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{goal.title}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        goal.status === "Completed" ? "bg-green-500/10 text-green-500" :
                        goal.status === "In Progress" ? "bg-blue-500/10 text-blue-500" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {goal.status}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${goal.progress === 100 ? "bg-green-500" : "bg-blue-500"}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{goal.progress}% complete</p>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-add-goal">
                  + Add Career Goal
                </Button>
              </CardContent>
            </Card>

            {/* AI Career Insights */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  AI Career Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Resume Update Suggested</p>
                      <p className="text-sm text-muted-foreground">
                        Add your recent AWS certification completion to stand out.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Networking Opportunity</p>
                      <p className="text-sm text-muted-foreground">
                        3 people from your target companies posted on LinkedIn this week.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Skill Milestone!</p>
                      <p className="text-sm text-muted-foreground">
                        You've completed 45 hours of learning this month - your best yet!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Focus Recommendation</p>
                      <p className="text-sm text-muted-foreground">
                        TypeScript skills are in high demand. Consider prioritizing this next.
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="w-full" data-testid="button-view-opportunities">
                  View Job Opportunities
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}

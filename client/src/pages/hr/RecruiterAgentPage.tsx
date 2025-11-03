import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { UserPlus, Briefcase, Users, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function RecruiterAgentPage() {
  const metrics = [
    { label: "Open Positions", value: "8", change: "+2", icon: Briefcase, color: "text-blue-500" },
    { label: "Active Candidates", value: "147", change: "+23", icon: Users, color: "text-green-500" },
    { label: "Interviews Scheduled", value: "12", change: "+5", icon: Clock, color: "text-orange-500" },
    { label: "Hires This Month", value: "3", change: "+1", icon: CheckCircle2, color: "text-purple-500" }
  ];

  const openPositions = [
    { title: "Senior Tango Instructor", applicants: 24, stage: "Interviewing", urgency: "high" },
    { title: "Event Coordinator", applicants: 32, stage: "Screening", urgency: "medium" },
    { title: "Community Manager", applicants: 18, stage: "Reviewing", urgency: "high" },
    { title: "Video Content Creator", applicants: 15, stage: "Posted", urgency: "low" }
  ];

  const topCandidates = [
    { name: "Maria Rodriguez", role: "Senior Instructor", score: 92, status: "Final Round" },
    { name: "Carlos Mendez", role: "Event Coordinator", score: 88, status: "Technical Interview" },
    { name: "Sofia Garcia", role: "Community Manager", score: 85, status: "Reference Check" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Recruiter Agent" fallbackRoute="/platform">
    <PageLayout title="Recruiter Agent" showBreadcrumbs>
<>
      <SEO
        title="Recruiter Agent - HR Dashboard"
        description="Manage recruitment pipeline, candidates, and hiring analytics."
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
                <UserPlus className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your AI recruitment assistant</p>
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
            {/* Open Positions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Open Positions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {openPositions.map((position, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{position.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        position.urgency === "high" ? "bg-red-500/20 text-red-500"
                        : position.urgency === "medium" ? "bg-orange-500/20 text-orange-500"
                        : "bg-blue-500/20 text-blue-500"
                      }`}>
                        {position.urgency}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{position.applicants} applicants</span>
                      <span>•</span>
                      <span>{position.stage}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-post-job">
                  + Post New Job
                </Button>
              </CardContent>
            </Card>

            {/* Top Candidates */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Top Candidates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topCandidates.map((candidate, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{candidate.name}</h3>
                      <span className="text-sm font-bold text-green-500">{candidate.score}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{candidate.role}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-500">
                      {candidate.status}
                    </span>
                  </div>
                ))}
                <Button className="w-full" data-testid="button-view-candidates">
                  View All Candidates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>);
}

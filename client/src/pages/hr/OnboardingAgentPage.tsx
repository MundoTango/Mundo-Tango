import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { UserCheck, CheckCircle, AlertCircle, Clock, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

export default function OnboardingAgentPage() {
  const metrics = [
    { label: "Active Onboarding", value: "5", change: "+2", icon: Users, color: "text-blue-500" },
    { label: "Completed", value: "23", change: "+3", icon: CheckCircle, color: "text-green-500" },
    { label: "Avg. Time", value: "12 days", change: "-2 days", icon: Clock, color: "text-purple-500" },
    { label: "Pending Tasks", value: "18", change: "-4", icon: AlertCircle, color: "text-orange-500" }
  ];

  const newHires = [
    { name: "Maria Rodriguez", role: "Senior Instructor", progress: 85, startDate: "Nov 1, 2025", tasksLeft: 3 },
    { name: "Carlos Mendez", role: "Event Coordinator", progress: 60, startDate: "Oct 28, 2025", tasksLeft: 8 },
    { name: "Sofia Garcia", role: "Community Manager", progress: 40, startDate: "Oct 25, 2025", tasksLeft: 12 }
  ];

  const onboardingSteps = [
    { step: "Complete HR Paperwork", completion: 100, color: "bg-green-500" },
    { step: "System Access Setup", completion: 85, color: "bg-blue-500" },
    { step: "Team Introductions", completion: 70, color: "bg-purple-500" },
    { step: "Training Modules", completion: 45, color: "bg-orange-500" },
    { step: "First Project Assignment", completion: 20, color: "bg-red-500" }
  ];

  return (
    <PageLayout title="Onboarding Agent" showBreadcrumbs>
<>
      <SEO
        title="Onboarding Agent - HR Dashboard"
        description="Manage new hire onboarding, training, and integration tracking."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                
                <p className="text-muted-foreground">Your AI onboarding assistant</p>
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
            {/* New Hires */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  New Hires in Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {newHires.map((hire, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{hire.name}</h3>
                        <p className="text-sm text-muted-foreground">{hire.role}</p>
                      </div>
                      <span className="text-sm font-bold text-green-500">{hire.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${hire.progress}%` }} 
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Started: {hire.startDate}</span>
                      <span>•</span>
                      <span>{hire.tasksLeft} tasks left</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-add-new-hire">
                  + Add New Hire
                </Button>
              </CardContent>
            </Card>

            {/* Onboarding Steps Overview */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Onboarding Steps Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {onboardingSteps.map((step, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{step.step}</span>
                      <span className="text-sm font-bold">{step.completion}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={step.color}
                        style={{ width: `${step.completion}%` }} 
                      />
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-4" data-testid="button-customize-workflow">
                  Customize Workflow
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    </PageLayout>);
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Users, FileText, MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';

export default function TalentPipelinePage() {
  const pipeline = [
    { stage: "Applied", count: 12, icon: FileText, color: "text-blue-500" },
    { stage: "Resume Reviewed", count: 8, icon: Users, color: "text-purple-500" },
    { stage: "AI Interview", count: 5, icon: MessageSquare, color: "text-cyan-500" },
    { stage: "Pending Approval", count: 3, icon: Clock, color: "text-orange-500" },
    { stage: "Approved", count: 15, icon: CheckCircle, color: "text-green-500" },
    { stage: "Rejected", count: 2, icon: XCircle, color: "text-red-500" }
  ];

  const pendingVolunteers = [
    { id: 1, name: "Sarah Chen", skills: "React, TypeScript, Node.js", score: 92, status: "pending" },
    { id: 2, name: "Michael Rodriguez", skills: "Python, AI/ML, Data Science", score: 88, status: "pending" },
    { id: 3, name: "Emily Watson", skills: "UX Design, Figma, Prototyping", score: 85, status: "pending" }
  ];

  return (
    <PageLayout title="Talent Pipeline" showBreadcrumbs>
<SelfHealingErrorBoundary pageName="Talent Pipeline" fallbackRoute="/admin">
<>
      <SEO
        title="Talent Pipeline - Admin"
        description="Manage volunteer applications and track candidates through the recruitment pipeline."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            
            <p className="text-muted-foreground">
              Track volunteer applications from submission to approval
            </p>
          </motion.div>

          {/* Pipeline Overview */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
            {pipeline.map((stage, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-card hover-elevate cursor-pointer" data-testid={`card-stage-${stage.stage.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="pt-6">
                    <stage.icon className={`h-8 w-8 ${stage.color} mb-4`} />
                    <p className="text-3xl font-bold mb-1">{stage.count}</p>
                    <p className="text-sm text-muted-foreground">{stage.stage}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pending Approvals */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Pending Approvals ({pendingVolunteers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingVolunteers.map((volunteer) => (
                  <div
                    key={volunteer.id}
                    className="p-4 rounded-lg border hover-elevate"
                    data-testid={`volunteer-card-${volunteer.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{volunteer.name}</h3>
                        <p className="text-sm text-muted-foreground">{volunteer.skills}</p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10">
                          <span className="text-sm font-bold text-primary">{volunteer.score}</span>
                          <span className="text-xs text-muted-foreground">/ 100</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">AI Match Score</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" data-testid={`button-approve-${volunteer.id}`}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" data-testid={`button-interview-${volunteer.id}`}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        View Interview
                      </Button>
                      <Button size="sm" variant="outline" data-testid={`button-reject-${volunteer.id}`}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
    </SelfHealingErrorBoundary>
    </PageLayout>);
}

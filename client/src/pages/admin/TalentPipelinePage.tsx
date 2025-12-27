import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Users, FileText, MessageSquare, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const roleTagColors: Record<string, string> = {
  "UX": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "UI": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Backend": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Frontend": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "DevOps": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Mobile": "bg-green-500/20 text-green-400 border-green-500/30",
  "Data": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Content": "bg-rose-500/20 text-rose-400 border-rose-500/30",
  "Marketing": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "PM": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "QA": "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "Security": "bg-red-500/20 text-red-400 border-red-500/30",
  "General": "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

interface PipelineStage {
  stage: string;
  dbStage: string;
  count: number;
}

interface PendingVolunteer {
  id: number;
  candidateId: number;
  volunteerId: number | null;
  name: string;
  email: string;
  skills: string;
  skillsArray: string[];
  roleTags: string[];
  availability: string;
  hoursPerWeek: number;
  source: string | null;
  notes: string | null;
  score: number;
  status: string;
  createdAt?: string;
}

const stageConfig: Record<string, { icon: typeof FileText; color: string }> = {
  "Applied": { icon: FileText, color: "text-blue-500" },
  "Resume Reviewed": { icon: Users, color: "text-purple-500" },
  "AI Interview": { icon: MessageSquare, color: "text-cyan-500" },
  "Pending Approval": { icon: Clock, color: "text-orange-500" },
  "Approved": { icon: CheckCircle, color: "text-green-500" },
  "Rejected": { icon: XCircle, color: "text-red-500" }
};

export default function TalentPipelinePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: pipelineData, isLoading: statsLoading, refetch: refetchStats } = useQuery<{ stages: PipelineStage[] }>({
    queryKey: ["/api/talent-pipeline/stats"],
  });

  const { data: pendingVolunteers, isLoading: pendingLoading, refetch: refetchPending } = useQuery<PendingVolunteer[]>({
    queryKey: ["/api/talent-pipeline/pending"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/talent-pipeline/${id}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Candidate Approved", description: "The volunteer has been approved." });
      queryClient.invalidateQueries({ queryKey: ["/api/talent-pipeline/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/talent-pipeline/pending"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve candidate.", variant: "destructive" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/talent-pipeline/${id}/reject`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Candidate Rejected", description: "The volunteer has been rejected." });
      queryClient.invalidateQueries({ queryKey: ["/api/talent-pipeline/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/talent-pipeline/pending"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject candidate.", variant: "destructive" });
    }
  });

  const pipeline = pipelineData?.stages?.map(stage => ({
    ...stage,
    icon: stageConfig[stage.stage]?.icon || FileText,
    color: stageConfig[stage.stage]?.color || "text-gray-500"
  })) || [];

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
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold mb-2">Talent Pipeline</h1>
              <p className="text-muted-foreground">
                Track volunteer applications from submission to approval
              </p>
            </motion.div>
          </div>

          {/* Pipeline Overview */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
            {statsLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx} className="glass-card">
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-8 mb-4 rounded" />
                    <Skeleton className="h-8 w-12 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))
            ) : (
              pipeline.map((stage, idx) => (
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
              ))
            )}
          </div>

          {/* Pending Approvals */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Pending Approvals ({pendingVolunteers?.length || 0})
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => { refetchStats(); refetchPending(); }}
                  data-testid="button-refresh"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="p-4 rounded-lg border">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-48 mb-4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 w-10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !pendingVolunteers || pendingVolunteers.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-pending">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No pending approvals at this time.</p>
                </div>
              ) : (
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
                          {volunteer.createdAt && (
                            <p className="text-xs text-muted-foreground mb-1">
                              Applied: {new Date(volunteer.createdAt).toLocaleDateString()}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1 mb-2">
                            {volunteer.roleTags?.map((tag, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className={`text-xs ${roleTagColors[tag] || roleTagColors["General"]}`}
                                data-testid={`badge-role-${tag.toLowerCase()}-${volunteer.id}`}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">{volunteer.skills}</p>
                          {volunteer.availability && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {volunteer.availability} | {volunteer.hoursPerWeek}h/week
                            </p>
                          )}
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
                        <Button 
                          size="sm" 
                          className="flex-1" 
                          onClick={() => approveMutation.mutate(volunteer.id)}
                          disabled={approveMutation.isPending}
                          data-testid={`button-approve-${volunteer.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1" 
                          onClick={() => volunteer.volunteerId && setLocation(`/admin/volunteer/${volunteer.volunteerId}`)}
                          disabled={!volunteer.volunteerId}
                          data-testid={`button-interview-${volunteer.id}`}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          View Interview
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => rejectMutation.mutate(volunteer.id)}
                          disabled={rejectMutation.isPending}
                          data-testid={`button-reject-${volunteer.id}`}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
    </SelfHealingErrorBoundary>
    </PageLayout>);
}

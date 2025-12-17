import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { safeDateDistance } from "@/lib/safeDateFormat";

interface FlaggedContent {
  id: number;
  reporterId: number;
  postId: number;
  reason: string;
  status: string;
  createdAt: string;
}

export default function AdminModerationPage() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const { toast } = useToast();

  const { data: flaggedContent = [], isLoading } = useQuery<FlaggedContent[]>({
    queryKey: ["/api/admin/content/flagged", { status: statusFilter }],
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ contentId, action }: { contentId: number; action: string }) => {
      return await apiRequest("POST", `/api/admin/content/${contentId}/moderate`, {
        action,
        contentType: "post",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/flagged"] });
      toast({ title: "Content moderated successfully" });
    },
    onError: () => {
      toast({ title: "Moderation action failed", variant: "destructive" });
    },
  });

  const handleModerate = (contentId: number, action: string) => {
    moderateMutation.mutate({ contentId, action });
  };

  return (
    <PageLayout title="Content Moderation" showBreadcrumbs>
      <SelfHealingErrorBoundary pageName="Admin Moderation" fallbackRoute="/admin">
        <div className="container mx-auto p-6" data-testid="page-admin-moderation">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" data-testid="tab-pending">
                <Flag className="h-4 w-4 mr-2" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="resolved" data-testid="tab-resolved">
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolved
              </TabsTrigger>
              <TabsTrigger value="all" data-testid="tab-all">
                All Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {statusFilter === "pending" ? "Pending Reports" : statusFilter === "resolved" ? "Resolved Reports" : "All Reports"}
                    {flaggedContent.length > 0 && ` (${flaggedContent.length})`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4 animate-pulse">
                          <div className="h-4 w-32 bg-muted rounded mb-2" />
                          <div className="h-3 w-full bg-muted rounded" />
                        </div>
                      ))}
                    </div>
                  ) : flaggedContent.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {statusFilter === "pending" ? "No pending reports" : "No reports found"}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {flaggedContent.map((report) => (
                        <div
                          key={report.id}
                          className="border rounded-lg p-4 space-y-3"
                          data-testid={`report-${report.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                <span className="font-semibold">Post ID: {report.postId}</span>
                                <Badge variant={report.status === "pending" ? "destructive" : "secondary"}>
                                  {report.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Reason: <span className="font-medium">{report.reason}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Reported by User #{report.reporterId} •{" "}
                                {safeDateDistance(report.createdAt, { addSuffix: true })}
                              </p>
                            </div>
                            {report.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleModerate(report.postId, "approve")}
                                  data-testid={`button-approve-${report.id}`}
                                  disabled={moderateMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleModerate(report.postId, "remove")}
                                  data-testid={`button-remove-${report.id}`}
                                  disabled={moderateMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SelfHealingErrorBoundary>
    </PageLayout>
  );
}

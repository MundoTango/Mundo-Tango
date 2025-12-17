import { useParams, Link } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  MessageSquare,
  Flag,
  ArrowLeft
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeDateFormat } from "@/lib/safeDateFormat";

interface ModerationReport {
  id: number;
  reporterId: number;
  reporterName: string;
  contentType: string;
  contentId: number;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
  content?: {
    id: number;
    text?: string;
    userId: number;
    userName: string;
  };
}

export default function AdminContentModerationDetailPage() {
  const { reportId } = useParams();
  const { toast } = useToast();
  const [moderationNotes, setModerationNotes] = useState("");

  const { data: report, isLoading } = useQuery<ModerationReport>({
    queryKey: ['/api/admin/moderation/reports', reportId],
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/admin/moderation/reports/${reportId}/approve`, {
        notes: moderationNotes,
      });
    },
    onSuccess: () => {
      toast({ title: "Report approved - content removed" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/reports'] });
    },
    onError: () => {
      toast({ title: "Failed to approve report", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/admin/moderation/reports/${reportId}/reject`, {
        notes: moderationNotes,
      });
    },
    onSuccess: () => {
      toast({ title: "Report rejected - no action taken" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/reports'] });
    },
    onError: () => {
      toast({ title: "Failed to reject report", variant: "destructive" });
    },
  });

  if (isLoading || !report) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading report...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statusColors = {
    pending: "bg-yellow-500",
    approved: "bg-green-500",
    rejected: "bg-red-500",
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-5xl py-8 px-4">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="outline" asChild data-testid="button-back">
              <Link href="/admin/moderation-queue">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Queue
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-report-title">
                Report #{report.id}
              </h1>
              <p className="text-muted-foreground">
                Reported {safeDateFormat(report.createdAt, 'PPP', 'recently')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-destructive" />
                    Report Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Reason</h4>
                    <Badge variant="destructive">{report.reason}</Badge>
                  </div>

                  {report.description && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Description</h4>
                      <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                        {report.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Content Type</h4>
                    <Badge variant="outline">{report.contentType}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Reported by {report.reporterName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {safeDateFormat(report.createdAt, 'PPp', 'recently')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {report.content && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Reported Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg border-l-4 border-destructive">
                      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        Posted by {report.content.userName}
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">
                        {report.content.text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {report.status === 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Moderation Notes (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={moderationNotes}
                      onChange={(e) => setModerationNotes(e.target.value)}
                      placeholder="Add internal notes about this decision..."
                      rows={4}
                      data-testid="textarea-moderation-notes"
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                    {report.status.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>

              {report.status === 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => approveMutation.mutate()}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      variant="destructive"
                      className="w-full"
                      data-testid="button-approve-report"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Remove Content
                    </Button>
                    <Button
                      onClick={() => rejectMutation.mutate()}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      variant="outline"
                      className="w-full"
                      data-testid="button-reject-report"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Report
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/users/${report.content?.userId}`}>
                      <User className="h-4 w-4 mr-2" />
                      View Content Author
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/users/${report.reporterId}`}>
                      <Flag className="h-4 w-4 mr-2" />
                      View Reporter
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bug,
  Lightbulb,
  HelpCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Bot,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { safeDateDistance } from "@/lib/safeDateFormat";

interface Feedback {
  id: number;
  userId: number;
  feedbackType: string;
  title: string;
  description?: string;
  currentPage?: string;
  status: string;
  priority: string;
  sessionSnapshot?: unknown;
  mrBlueResponse?: string;
  adminNotes?: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

const priorityColors: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  in_progress: <Loader2 className="h-4 w-4 animate-spin" />,
  approved: <CheckCircle className="h-4 w-4" />,
  resolved: <CheckCircle className="h-4 w-4 text-green-500" />,
  rejected: <XCircle className="h-4 w-4" />,
};

const typeIcons: Record<string, React.ReactNode> = {
  bug: <Bug className="h-4 w-4 text-red-500" />,
  feature: <Lightbulb className="h-4 w-4 text-yellow-500" />,
  support: <HelpCircle className="h-4 w-4 text-blue-500" />,
};

export default function FeedbackManagementPage() {
  const { t } = useTranslation(['admin', 'common']);
  const { toast } = useToast();
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [showMrBlueDialog, setShowMrBlueDialog] = useState(false);

  const { data: feedbackData, isLoading } = useQuery<{ pending: Feedback[] }>({
    queryKey: ["/api/qa/admin/pending"],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, action, reason }: { id: number; action: string; reason?: string }) => {
      return apiRequest('POST', `/api/qa/admin/approve/${id}`, { action, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qa/admin/pending"] });
      toast({ title: t('admin:feedback.actionSuccess', 'Action completed') });
      setSelectedFeedback(null);
    },
    onError: () => {
      toast({ title: t('common:error', 'Error'), variant: 'destructive' });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, mrBlueResponse, adminNotes }: { id: number; mrBlueResponse?: string; adminNotes?: string }) => {
      return apiRequest('POST', `/api/qa/admin/resolve/${id}`, { mrBlueResponse, adminNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qa/admin/pending"] });
      toast({ title: t('admin:feedback.resolved', 'Ticket resolved') });
      setSelectedFeedback(null);
    },
    onError: () => {
      toast({ title: t('common:error', 'Error'), variant: 'destructive' });
    },
  });

  const triggerMrBlueMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      return apiRequest('POST', `/api/mrblue/fix-feedback`, { feedbackId: id });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/qa/admin/pending"] });
      toast({ title: t('admin:feedback.mrBlueTriggered', 'Mr. Blue is analyzing...') });
      setShowMrBlueDialog(false);
    },
    onError: () => {
      toast({ title: t('common:error', 'Error triggering Mr. Blue'), variant: 'destructive' });
    },
  });

  const handleApprove = (feedback: Feedback) => {
    approveMutation.mutate({ id: feedback.id, action: 'approve', reason: adminNotes });
  };

  const handleReject = (feedback: Feedback) => {
    approveMutation.mutate({ id: feedback.id, action: 'reject', reason: adminNotes });
  };

  const handleResolve = (feedback: Feedback) => {
    resolveMutation.mutate({ id: feedback.id, adminNotes });
  };

  const handleMrBlue = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setShowMrBlueDialog(true);
  };

  const confirmMrBlue = () => {
    if (selectedFeedback) {
      triggerMrBlueMutation.mutate({ id: selectedFeedback.id });
    }
  };

  if (isLoading) {
    return (
      <PageLayout title={t('admin:feedback.title', 'Feedback Management')}>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  const feedbackList = feedbackData?.pending || [];

  return (
    <PageLayout title={t('admin:feedback.title', 'Feedback Management')}>
      <div className="container mx-auto max-w-6xl py-6 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-feedback-management-title">
              {t('admin:feedback.title', 'Feedback Management')}
            </h1>
            <p className="text-muted-foreground">
              {t('admin:feedback.subtitle', 'Review and manage user feedback tickets')}
            </p>
          </div>
          <Badge variant="secondary" data-testid="badge-pending-count">
            {feedbackList.length} {t('admin:feedback.pending', 'pending')}
          </Badge>
        </div>

        {feedbackList.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-semibold mb-2" data-testid="text-no-feedback">
              {t('admin:feedback.noPending', 'All caught up!')}
            </h2>
            <p className="text-muted-foreground">
              {t('admin:feedback.noPendingDesc', 'No pending feedback to review.')}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {feedbackList.map((feedback) => (
              <Card key={feedback.id} className="hover-elevate" data-testid={`card-feedback-${feedback.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {typeIcons[feedback.feedbackType]}
                      <div>
                        <CardTitle className="text-lg">{feedback.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {feedback.user?.name || 'Unknown'} · {safeDateDistance(feedback.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={priorityColors[feedback.priority]}>
                        {feedback.priority}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {statusIcons[feedback.status]}
                        <span className="text-sm">{feedback.status}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feedback.description && (
                    <p className="text-sm">{feedback.description}</p>
                  )}
                  {feedback.currentPage && (
                    <p className="text-xs text-muted-foreground">
                      Page: {feedback.currentPage}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(feedback)}
                      disabled={approveMutation.isPending}
                      data-testid={`button-approve-${feedback.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {t('admin:feedback.approve', 'Approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(feedback)}
                      disabled={approveMutation.isPending}
                      data-testid={`button-reject-${feedback.id}`}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      {t('admin:feedback.reject', 'Reject')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(feedback)}
                      disabled={resolveMutation.isPending}
                      data-testid={`button-resolve-${feedback.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {t('admin:feedback.resolve', 'Resolve')}
                    </Button>
                    {feedback.feedbackType === 'bug' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMrBlue(feedback)}
                        disabled={triggerMrBlueMutation.isPending}
                        className="ml-auto"
                        data-testid={`button-mrblue-${feedback.id}`}
                      >
                        <Bot className="h-4 w-4 mr-1" />
                        {t('admin:feedback.askMrBlue', 'Ask Mr. Blue')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showMrBlueDialog} onOpenChange={setShowMrBlueDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {t('admin:feedback.mrBlueConfirm', 'Send to Mr. Blue?')}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {t('admin:feedback.mrBlueDesc', 'Mr. Blue will analyze this bug report and attempt to create a fix using VibeCoding. This requires God-level approval before execution.')}
            </p>
            {selectedFeedback && (
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">{selectedFeedback.title}</p>
                <p className="text-sm text-muted-foreground">{selectedFeedback.description}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMrBlueDialog(false)}>
                {t('common:cancel', 'Cancel')}
              </Button>
              <Button onClick={confirmMrBlue} disabled={triggerMrBlueMutation.isPending}>
                {triggerMrBlueMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('admin:feedback.confirm', 'Confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}

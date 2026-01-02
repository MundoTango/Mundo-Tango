/**
 * Admin Feedback Queue Page - MB.MD Pattern 67
 * 
 * Lists all pending user feedback for admin review.
 * Allows approve/reject actions and session replay.
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Bug, Lightbulb, HelpCircle, AlertTriangle, Check, X, Eye, Clock, User, Calendar } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FeedbackItem {
  id: number;
  userId: number;
  sessionId: string;
  feedbackType: 'bug' | 'feature' | 'support' | 'complaint';
  title: string;
  description: string;
  currentPage: string;
  sessionSnapshot: any;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  mrBlueResponse: string;
  adminNotes: string;
  createdAt: string;
  user?: { email: string; displayName: string };
}

const typeIcons = {
  bug: Bug,
  feature: Lightbulb,
  support: HelpCircle,
  complaint: AlertTriangle,
};

const priorityColors = {
  low: 'bg-slate-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const statusColors = {
  pending: 'bg-blue-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  in_progress: 'bg-purple-500',
  resolved: 'bg-gray-500',
};

export default function FeedbackQueuePage() {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [showSessionReplay, setShowSessionReplay] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const { toast } = useToast();

  const { data: feedbackList, isLoading } = useQuery<FeedbackItem[]>({
    queryKey: ['/api/qa-platform/admin/pending'],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      return apiRequest('POST', `/api/qa-platform/admin/approve/${id}`, { action: 'approve', notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qa-platform/admin/pending'] });
      setSelectedFeedback(null);
      toast({ title: 'Feedback approved', description: 'Mr. Blue will work on this issue.' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      return apiRequest('POST', `/api/qa-platform/admin/approve/${id}`, { action: 'reject', notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qa-platform/admin/pending'] });
      setSelectedFeedback(null);
      toast({ title: 'Feedback rejected', description: 'The user will be notified.' });
    },
  });

  const filteredFeedback = feedbackList?.filter(f => {
    if (filter === 'all') return true;
    return f.status === filter;
  }) || [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feedback Queue</h1>
          <p className="text-muted-foreground">Review and approve user feedback for Mr. Blue to action</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2" data-testid="badge-pending-count">
          {feedbackList?.filter(f => f.status === 'pending').length || 0} pending
        </Badge>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList data-testid="tabs-filter">
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <div className="grid gap-4">
            {filteredFeedback.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No feedback items to display
                </CardContent>
              </Card>
            ) : (
              filteredFeedback.map((item) => {
                const TypeIcon = typeIcons[item.feedbackType] || HelpCircle;
                return (
                  <Card 
                    key={item.id} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => { setSelectedFeedback(item); setAdminNotes(item.adminNotes || ''); }}
                    data-testid={`card-feedback-${item.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={priorityColors[item.priority]}>{item.priority}</Badge>
                          <Badge className={statusColors[item.status]}>{item.status}</Badge>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.user?.displayName || `User #${item.userId}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.currentPage}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description || 'No description provided'}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-feedback-detail">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const TypeIcon = typeIcons[selectedFeedback.feedbackType] || HelpCircle;
                    return <TypeIcon className="h-5 w-5" />;
                  })()}
                  {selectedFeedback.title}
                </DialogTitle>
                <DialogDescription>
                  Submitted by {selectedFeedback.user?.displayName || `User #${selectedFeedback.userId}`} on {formatDate(selectedFeedback.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge className={priorityColors[selectedFeedback.priority]}>{selectedFeedback.priority}</Badge>
                  <Badge className={statusColors[selectedFeedback.status]}>{selectedFeedback.status}</Badge>
                  <Badge variant="outline">{selectedFeedback.feedbackType}</Badge>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedFeedback.description || 'No description provided'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Page Context</h4>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {selectedFeedback.currentPage}
                  </code>
                </div>

                {selectedFeedback.mrBlueResponse && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Mr. Blue's Initial Response</h4>
                    <p className="text-sm text-muted-foreground">{selectedFeedback.mrBlueResponse}</p>
                  </div>
                )}

                {selectedFeedback.sessionSnapshot && (
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSessionReplay(true)}
                      data-testid="button-view-session"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Session Replay ({selectedFeedback.sessionSnapshot.events?.length || 0} events)
                    </Button>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Admin Notes</h4>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this feedback..."
                    className="min-h-[80px]"
                    data-testid="input-admin-notes"
                  />
                </div>
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => rejectMutation.mutate({ id: selectedFeedback.id, notes: adminNotes })}
                  disabled={rejectMutation.isPending}
                  data-testid="button-reject"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => approveMutation.mutate({ id: selectedFeedback.id, notes: adminNotes })}
                  disabled={approveMutation.isPending}
                  data-testid="button-approve"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve for Mr. Blue
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSessionReplay} onOpenChange={setShowSessionReplay}>
        <DialogContent className="max-w-3xl max-h-[80vh]" data-testid="dialog-session-replay">
          <DialogHeader>
            <DialogTitle>Session Replay</DialogTitle>
            <DialogDescription>
              User's recent actions before submitting feedback
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-2 p-4">
              {selectedFeedback?.sessionSnapshot?.events?.map((event: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                  <Badge variant="outline" className="shrink-0">{event.type}</Badge>
                  <span className="text-muted-foreground">
                    {event.type === 'click' && `Clicked ${event.data?.tagName}${event.data?.text ? `: "${event.data.text}"` : ''}`}
                    {event.type === 'navigation' && `Navigated to ${event.data?.pathname}`}
                    {event.type === 'scroll' && `Scrolled to ${event.data?.scrollY}px`}
                    {event.type === 'error' && `Error: ${event.data?.message}`}
                    {event.type === 'form' && `Form ${event.data?.action} on ${event.data?.fieldName}`}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

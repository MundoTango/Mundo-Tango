/**
 * Unified Admin Review Queue - MB.MD Pattern 67
 * 
 * Consolidates user feedback review and feature approval workflows
 * into a single admin workspace with tabbed navigation.
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Bug, Lightbulb, HelpCircle, AlertTriangle, Check, X, Eye, Clock, User, Calendar,
  CheckCircle, XCircle, Search, Filter, FileText, Inbox, Rocket, Globe, Shield,
  MessageSquare, Wrench, Send, Zap
} from 'lucide-react';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { JourneyTimeline } from '@/components/qa/JourneyTimeline';
import { ContextCards } from '@/components/qa/ContextCards';
import { BugFixStream } from '@/components/mrBlue/advanced/BugFixStream';
import { useToast } from '@/hooks/use-toast';
import { safeDateFormat } from '@/lib/safeDateFormat';
import { SEO } from '@/components/SEO';
import { PageLayout } from '@/components/PageLayout';

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

interface FeatureReview {
  id: number;
  featureName: string;
  pageUrl: string;
  description: string;
  status: string;
  builtBy: string;
  reviewedBy: number | null;
  reviewNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  approvedAt: string | null;
  checklist: {
    functionalityWorks: boolean;
    designMatches: boolean;
    noBugs: boolean;
    meetsRequirements: boolean;
    readyForUsers: boolean;
  } | null;
}

const feedbackTypeIcons = {
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

const feedbackStatusColors = {
  pending: 'bg-blue-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  in_progress: 'bg-purple-500',
  resolved: 'bg-gray-500',
};

export default function FeedbackQueuePage() {
  const [activeTab, setActiveTab] = useState<'feedback' | 'features'>('feedback');
  const { toast } = useToast();

  return (
    <PageLayout>
      <SEO
        title="Admin Review Queue - Mundo Tango"
        description="Review user feedback and approve features"
      />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-400 to-blue-500 bg-clip-text text-transparent">
            Admin Review Queue
          </h1>
          <p className="text-muted-foreground">
            Unified workspace for user feedback triage and feature approvals
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'feedback' | 'features')}>
          <TabsList className="grid w-full max-w-md grid-cols-2" data-testid="tabs-main">
            <TabsTrigger value="feedback" className="gap-2" data-testid="tab-feedback">
              <Inbox className="h-4 w-4" />
              User Feedback
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2" data-testid="tab-features">
              <Rocket className="h-4 w-4" />
              Feature Approval
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="mt-6">
            <FeedbackPanel />
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <FeatureApprovalPanel />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

function FeedbackPanel() {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [showSessionReplay, setShowSessionReplay] = useState(false);
  const [showBugFixStream, setShowBugFixStream] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: feedbackList, isLoading } = useQuery<FeedbackItem[]>({
    queryKey: ['/api/qa-platform/admin/pending'],
    retry: false,
    select: (data: any) => Array.isArray(data) ? data : data.pending || [],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const res = await apiRequest('POST', `/api/qa-platform/admin/approve/${id}`, { action: 'approve', notes });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || 'Failed to approve');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qa-platform/admin/pending'] });
      toast({ title: 'Ready to fix', description: 'Navigating to the impacted page...' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const replyToUserMutation = useMutation({
    mutationFn: async ({ feedbackId, userId, message }: { feedbackId: number; userId: number; message: string }) => {
      const res = await apiRequest('POST', `/api/qa-platform/admin/reply/${feedbackId}`, { 
        recipientId: userId, 
        message 
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || 'Failed to send message');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qa-platform/admin/pending'] });
      setReplyMessage('');
      setShowReplyForm(false);
      toast({ title: 'Message sent', description: 'User will receive your message in their inbox.' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleLetsFixIt = (feedback: FeedbackItem) => {
    sessionStorage.setItem('bugDiagnosticContext', JSON.stringify({
      feedbackId: feedback.id,
      title: feedback.title,
      description: feedback.description,
      currentPage: feedback.currentPage,
      sessionSnapshot: feedback.sessionSnapshot,
      userId: feedback.userId,
    }));
    
    approveMutation.mutate({ id: feedback.id, notes: adminNotes }, {
      onSuccess: () => {
        setSelectedFeedback(null);
        const targetPage = feedback.currentPage || '/feed';
        navigate(`${targetPage}?mrblue=debug`);
      }
    });
  };

  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const res = await apiRequest('POST', `/api/qa-platform/admin/approve/${id}`, { action: 'reject', notes });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || 'Failed to reject');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qa-platform/admin/pending'] });
      setSelectedFeedback(null);
      toast({ title: 'Feedback rejected', description: 'The user will be notified.' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: "destructive"
      });
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-lg px-4 py-2" data-testid="badge-pending-count">
          {feedbackList?.filter(f => f.status === 'pending').length || 0} pending
        </Badge>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList data-testid="tabs-feedback-filter">
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
                const TypeIcon = feedbackTypeIcons[item.feedbackType] || HelpCircle;
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
                          <Badge className={feedbackStatusColors[item.status]}>{item.status}</Badge>
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
                    const TypeIcon = feedbackTypeIcons[selectedFeedback.feedbackType] || HelpCircle;
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
                  <Badge className={feedbackStatusColors[selectedFeedback.status]}>{selectedFeedback.status}</Badge>
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
                  <div className="space-y-4">
                    {/* User Context Card */}
                    {selectedFeedback.sessionSnapshot.userContext && (
                      <div className="p-3 rounded-md bg-muted/50 border">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <Shield className="h-4 w-4" />
                          User Context
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Tier: <span className="font-medium">{selectedFeedback.sessionSnapshot.userContext.tier || 'unknown'}</span></div>
                          <div>Verified: <span className="font-medium">{selectedFeedback.sessionSnapshot.userContext.isVerified ? 'Yes' : 'No'}</span></div>
                          {selectedFeedback.sessionSnapshot.userContext.cityName && (
                            <div className="col-span-2">City: <span className="font-medium">{selectedFeedback.sessionSnapshot.userContext.cityName}</span></div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* API Calls */}
                    {selectedFeedback.sessionSnapshot.apiCalls?.length > 0 && (
                      <div className="p-3 rounded-md bg-muted/50 border">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <Globe className="h-4 w-4" />
                          Recent API Calls ({selectedFeedback.sessionSnapshot.apiCalls.length})
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {selectedFeedback.sessionSnapshot.apiCalls.slice(-5).map((call: any, idx: number) => (
                            <div key={idx} className="text-xs flex items-center gap-2">
                              <span className={`px-1 rounded ${call.status >= 400 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {call.status}
                              </span>
                              <span className="font-mono">{call.method}</span>
                              <span className="truncate text-muted-foreground">{call.url?.replace('/api/', '')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Journey Timeline */}
                    {selectedFeedback.sessionSnapshot.journey?.length > 0 && (
                      <div className="p-3 rounded-md bg-muted/50 border">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <Eye className="h-4 w-4" />
                          User Journey ({selectedFeedback.sessionSnapshot.journey.length} steps)
                        </div>
                        <JourneyTimeline 
                          journey={selectedFeedback.sessionSnapshot.journey}
                          maxSteps={6}
                          compact={true}
                        />
                      </div>
                    )}

                    {/* Session Replay Button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSessionReplay(true)}
                      data-testid="button-view-session"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Session Replay ({selectedFeedback.sessionSnapshot.events?.length || 0} events)
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

              {showReplyForm ? (
                <div className="space-y-3 w-full">
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your message to the user..."
                    className="min-h-[80px]"
                    data-testid="input-reply-message"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setShowReplyForm(false)}
                      data-testid="button-cancel-reply"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => replyToUserMutation.mutate({ 
                        feedbackId: selectedFeedback.id, 
                        userId: selectedFeedback.userId, 
                        message: replyMessage 
                      })}
                      disabled={replyToUserMutation.isPending || !replyMessage.trim()}
                      data-testid="button-send-reply"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send to Inbox
                    </Button>
                  </div>
                </div>
              ) : (
                <DialogFooter className="flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => setShowReplyForm(true)}
                    data-testid="button-reply-user"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Reply to User
                  </Button>
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
                    variant="secondary"
                    onClick={() => setShowBugFixStream(true)}
                    data-testid="button-try-autofix"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Try Auto-Fix
                  </Button>
                  <Button
                    onClick={() => handleLetsFixIt(selectedFeedback)}
                    disabled={approveMutation.isPending}
                    data-testid="button-lets-fix-it"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Let's Fix It
                  </Button>
                </DialogFooter>
              )}
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

      <Dialog open={showBugFixStream} onOpenChange={setShowBugFixStream}>
        <DialogContent className="max-w-4xl h-[80vh]" data-testid="dialog-bug-fix-stream">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Auto-Fix Stream
            </DialogTitle>
            <DialogDescription>
              Watch agents work on fixing the issue in real-time using ReAct protocol
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="flex-1 min-h-0">
              <BugFixStream
                feedbackId={selectedFeedback.id}
                diagnosticContext={selectedFeedback.sessionSnapshot}
                onComplete={(result) => {
                  if (result.success) {
                    toast({
                      title: 'Fix applied successfully',
                      description: `Confidence: ${result.confidence}%`
                    });
                    queryClient.invalidateQueries({ queryKey: ['/api/qa-platform/admin/pending'] });
                  }
                }}
                onClose={() => setShowBugFixStream(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeatureApprovalPanel() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("pending_review");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<FeatureReview | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [checklist, setChecklist] = useState({
    functionalityWorks: false,
    designMatches: false,
    noBugs: false,
    meetsRequirements: false,
    readyForUsers: false,
  });

  const { data: featuresData, isLoading } = useQuery<FeatureReview[]>({
    queryKey: ["/api/admin/founder-approval/pending"],
  });

  const { data: statsData } = useQuery<any>({
    queryKey: ["/api/admin/founder-approval/stats"],
  });

  const features = featuresData || [];
  const stats = statsData || { total: 0, pending: 0, approved: 0, rejected: 0, needsWork: 0 };

  const filteredFeatures = features.filter((feature) => {
    const matchesStatus = statusFilter === "all" || feature.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      feature.featureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.pageUrl.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const approveMutation = useMutation({
    mutationFn: async (data: { id: number; reviewNotes: string; checklist: any }) => {
      const response = await apiRequest("POST", `/api/admin/founder-approval/${data.id}/approve`, {
        reviewNotes: data.reviewNotes,
        checklist: data.checklist,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Feature approved", description: "Feature has been approved and is now live." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/founder-approval/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/founder-approval/stats"] });
      setIsDetailDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to approve feature", variant: "destructive" });
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: async (data: { id: number; reviewNotes: string; checklist: any }) => {
      const response = await apiRequest("POST", `/api/admin/founder-approval/${data.id}/request-changes`, {
        reviewNotes: data.reviewNotes,
        checklist: data.checklist,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Changes requested", description: "Agent has been notified of required changes." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/founder-approval/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/founder-approval/stats"] });
      setIsDetailDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to request changes", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (data: { id: number; reviewNotes: string }) => {
      const response = await apiRequest("POST", `/api/admin/founder-approval/${data.id}/reject`, {
        reviewNotes: data.reviewNotes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Feature rejected", description: "Feature has been rejected." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/founder-approval/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/founder-approval/stats"] });
      setIsDetailDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to reject feature", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setSelectedFeature(null);
    setReviewNotes("");
    setChecklist({
      functionalityWorks: false,
      designMatches: false,
      noBugs: false,
      meetsRequirements: false,
      readyForUsers: false,
    });
  };

  const handleOpenDetail = (feature: FeatureReview) => {
    setSelectedFeature(feature);
    setReviewNotes(feature.reviewNotes || "");
    setChecklist(feature.checklist || {
      functionalityWorks: false,
      designMatches: false,
      noBugs: false,
      meetsRequirements: false,
      readyForUsers: false,
    });
    setIsDetailDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending_review: { variant: "secondary", icon: Clock, text: "Pending Review" },
      approved: { variant: "default", icon: CheckCircle, text: "Approved" },
      needs_work: { variant: "destructive", icon: AlertTriangle, text: "Needs Work" },
      rejected: { variant: "destructive", icon: XCircle, text: "Rejected" },
    };
    const config = variants[status] || variants.pending_review;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.needsWork}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by feature name or page URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-features"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="needs_work">Needs Work</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Features Pending Review ({filteredFeatures.length})</CardTitle>
          <CardDescription>Click on any feature to review and approve</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading features...</div>
          ) : filteredFeatures.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No features found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature Name</TableHead>
                    <TableHead>Page URL</TableHead>
                    <TableHead>Built By</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeatures.map((feature) => (
                    <TableRow key={feature.id} className="hover-elevate">
                      <TableCell className="font-medium">{feature.featureName}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{feature.pageUrl}</code>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{feature.builtBy}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {safeDateFormat(feature.submittedAt, "MMM d, yyyy", "N/A")}
                      </TableCell>
                      <TableCell>{getStatusBadge(feature.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDetail(feature)}
                          data-testid={`button-review-${feature.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedFeature?.featureName}</DialogTitle>
            <DialogDescription>{selectedFeature?.description}</DialogDescription>
          </DialogHeader>

          {selectedFeature && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Page URL</label>
                  <div className="mt-1">
                    <a
                      href={selectedFeature.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      {selectedFeature.pageUrl}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Built By</label>
                  <div className="mt-1 text-sm">{selectedFeature.builtBy}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                  <div className="mt-1 text-sm">
                    {safeDateFormat(selectedFeature.submittedAt, "PPP 'at' p", "N/A")}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedFeature.status)}</div>
                </div>
              </div>

              {selectedFeature.status === "pending_review" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Review Checklist</label>
                    <div className="space-y-2">
                      {[
                        { key: "functionalityWorks", label: "Functionality Works" },
                        { key: "designMatches", label: "Design Matches MT Ocean Theme" },
                        { key: "noBugs", label: "No Bugs or Errors" },
                        { key: "meetsRequirements", label: "Meets Requirements" },
                        { key: "readyForUsers", label: "Ready for Users" },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checklist[item.key as keyof typeof checklist]}
                            onChange={(e) =>
                              setChecklist({ ...checklist, [item.key]: e.target.checked })
                            }
                            className="rounded"
                            data-testid={`checkbox-${item.key}`}
                          />
                          <span className="text-sm">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Review Notes</label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes about your review decision..."
                      rows={4}
                      className="mt-2"
                      data-testid="textarea-review-notes"
                    />
                  </div>
                </div>
              )}

              {selectedFeature.reviewNotes && selectedFeature.status !== "pending_review" && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Review Notes</label>
                  <div className="mt-2 p-4 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{selectedFeature.reviewNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedFeature?.status === "pending_review" ? (
              <div className="flex gap-2 w-full justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                  data-testid="button-close"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => rejectMutation.mutate({ id: selectedFeature.id, reviewNotes })}
                  disabled={rejectMutation.isPending}
                  data-testid="button-reject-feature"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    requestChangesMutation.mutate({ id: selectedFeature.id, reviewNotes, checklist })
                  }
                  disabled={requestChangesMutation.isPending}
                  data-testid="button-request-changes"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Request Changes
                </Button>
                <Button
                  onClick={() => approveMutation.mutate({ id: selectedFeature.id, reviewNotes, checklist })}
                  disabled={approveMutation.isPending}
                  data-testid="button-approve-feature"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)} data-testid="button-close">
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

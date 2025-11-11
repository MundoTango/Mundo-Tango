import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, Filter, Eye, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";

interface SafetyReview {
  id: number;
  targetType: string;
  targetId: number;
  reportedBy: number;
  reason: string;
  riskLevel: string;
  status: string;
  reviewedBy: number | null;
  reviewedAt: string | null;
  resolvedAt: string | null;
  actionTaken: string | null;
  notes: string | null;
  backgroundCheckStatus: string | null;
  createdAt: string;
}

export default function SafetyReviewPage() {
  const { toast } = useToast();
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("all");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReview, setSelectedReview] = useState<SafetyReview | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [newRiskLevel, setNewRiskLevel] = useState("");

  const { data: reviewsData, isLoading } = useQuery<SafetyReview[]>({
    queryKey: ["/api/admin/safety-reviews/pending", targetTypeFilter],
  });

  const { data: highPriorityData } = useQuery<SafetyReview[]>({
    queryKey: ["/api/admin/safety-reviews/high-priority"],
  });

  const { data: statsData } = useQuery<any>({
    queryKey: ["/api/admin/safety-reviews/stats"],
  });

  const reviews = reviewsData || [];
  const highPriority = highPriorityData || [];
  const stats = statsData || { total: 0, pending: 0, approved: 0, flagged: 0, highRisk: 0 };

  const filteredReviews = reviews.filter((review) => {
    const matchesTargetType = targetTypeFilter === "all" || review.targetType === targetTypeFilter;
    const matchesRiskLevel = riskLevelFilter === "all" || review.riskLevel === riskLevelFilter;
    const matchesSearch =
      !searchQuery ||
      review.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.targetType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTargetType && matchesRiskLevel && matchesSearch;
  });

  const approveMutation = useMutation({
    mutationFn: async (data: { id: number; actionTaken: string; notes: string }) => {
      const response = await apiRequest("POST", `/api/admin/safety-reviews/${data.id}/approve`, {
        actionTaken: data.actionTaken,
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Review approved", description: "Safety review has been approved." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/safety-reviews/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/safety-reviews/stats"] });
      setIsDetailDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to approve review", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (data: { id: number; actionTaken: string; notes: string; issues: string[] }) => {
      const response = await apiRequest("POST", `/api/admin/safety-reviews/${data.id}/reject`, {
        actionTaken: data.actionTaken,
        notes: data.notes,
        issues: data.issues,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Review flagged", description: "Safety review has been flagged for issues." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/safety-reviews/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/safety-reviews/stats"] });
      setIsDetailDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to reject review", variant: "destructive" });
    },
  });

  const escalateMutation = useMutation({
    mutationFn: async (data: { id: number; riskLevel: string; notes: string }) => {
      const response = await apiRequest("POST", `/api/admin/safety-reviews/${data.id}/escalate`, {
        riskLevel: data.riskLevel,
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Review escalated", description: "Safety review has been escalated." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/safety-reviews/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/safety-reviews/high-priority"] });
      setIsDetailDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to escalate review", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setSelectedReview(null);
    setNotes("");
    setActionTaken("");
    setNewRiskLevel("");
  };

  const handleOpenDetail = (review: SafetyReview) => {
    setSelectedReview(review);
    setNotes(review.notes || "");
    setActionTaken(review.actionTaken || "");
    setNewRiskLevel(review.riskLevel);
    setIsDetailDialogOpen(true);
  };

  const getRiskLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      low: { variant: "default", color: "text-green-500", text: "Low Risk" },
      medium: { variant: "secondary", color: "text-yellow-500", text: "Medium Risk" },
      high: { variant: "destructive", color: "text-red-500", text: "High Risk" },
      critical: { variant: "destructive", color: "text-red-700", text: "Critical Risk" },
    };
    const config = variants[level] || variants.low;
    return (
      <Badge variant={config.variant}>
        <Shield className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", text: "Pending" },
      approved: { variant: "default", text: "Approved" },
      flagged: { variant: "destructive", text: "Flagged" },
      resolved: { variant: "default", text: "Resolved" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <PageLayout>
      <SEO
        title="Safety Reviews - Mundo Tango Admin"
        description="Review and manage safety concerns for housing and users"
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-400 to-blue-500 bg-clip-text text-transparent">
            Safety Review Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and review safety concerns for housing listings and user verification
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Flagged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.flagged}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{stats.highRisk}</div>
            </CardContent>
          </Card>
        </div>

        {highPriority.length > 0 && (
          <Card className="glass-card border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                High Priority Reviews ({highPriority.length})
              </CardTitle>
              <CardDescription>These reviews require immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {highPriority.slice(0, 5).map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{review.targetType}</div>
                      <div className="text-sm text-muted-foreground">{review.reason}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRiskLevelBadge(review.riskLevel)}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleOpenDetail(review)}
                        data-testid={`button-review-priority-${review.id}`}
                      >
                        Review Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reason or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-reviews"
                />
              </div>
              <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
                <SelectTrigger data-testid="select-target-type-filter">
                  <SelectValue placeholder="Filter by target type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="housing_listing">Housing Listing</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
                <SelectTrigger data-testid="select-risk-level-filter">
                  <SelectValue placeholder="Filter by risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="critical">Critical Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Safety Reviews ({filteredReviews.length})</CardTitle>
            <CardDescription>Click on any review to take action</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading reviews...</div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No safety reviews found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Target Type</TableHead>
                      <TableHead>Target ID</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReviews.map((review) => (
                      <TableRow key={review.id} className="hover-elevate">
                        <TableCell className="font-medium">{review.targetType}</TableCell>
                        <TableCell>#{review.targetId}</TableCell>
                        <TableCell className="max-w-xs truncate">{review.reason}</TableCell>
                        <TableCell>{getRiskLevelBadge(review.riskLevel)}</TableCell>
                        <TableCell>{getStatusBadge(review.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(review.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDetail(review)}
                            data-testid={`button-review-${review.id}`}
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
              <DialogTitle className="text-2xl">Safety Review #{selectedReview?.id}</DialogTitle>
              <DialogDescription>Review and take action on this safety concern</DialogDescription>
            </DialogHeader>

            {selectedReview && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Target Type</label>
                    <div className="mt-1 text-sm font-medium">{selectedReview.targetType}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Target ID</label>
                    <div className="mt-1 text-sm">#{selectedReview.targetId}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Risk Level</label>
                    <div className="mt-1">{getRiskLevelBadge(selectedReview.riskLevel)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedReview.status)}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reason</label>
                  <div className="mt-2 p-4 bg-muted rounded-md">
                    <p className="text-sm">{selectedReview.reason}</p>
                  </div>
                </div>

                {selectedReview.status === "pending" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Action Taken</label>
                      <Input
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        placeholder="e.g., Verified listing, Contacted host, Flagged for removal"
                        className="mt-2"
                        data-testid="input-action-taken"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Review Notes</label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add detailed notes about your review and decision..."
                        rows={4}
                        className="mt-2"
                        data-testid="textarea-review-notes"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Update Risk Level (Optional)</label>
                      <Select value={newRiskLevel} onValueChange={setNewRiskLevel}>
                        <SelectTrigger className="mt-2" data-testid="select-new-risk-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="medium">Medium Risk</SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                          <SelectItem value="critical">Critical Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {selectedReview.notes && selectedReview.status !== "pending" && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Review Notes</label>
                    <div className="mt-2 p-4 bg-muted rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{selectedReview.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              {selectedReview?.status === "pending" ? (
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
                    onClick={() =>
                      rejectMutation.mutate({
                        id: selectedReview.id,
                        actionTaken,
                        notes,
                        issues: [actionTaken],
                      })
                    }
                    disabled={rejectMutation.isPending || !actionTaken}
                    data-testid="button-flag"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Flag & Reject
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      escalateMutation.mutate({
                        id: selectedReview.id,
                        riskLevel: newRiskLevel,
                        notes,
                      })
                    }
                    disabled={escalateMutation.isPending}
                    data-testid="button-escalate"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Escalate
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate({ id: selectedReview.id, actionTaken, notes })}
                    disabled={approveMutation.isPending || !actionTaken}
                    data-testid="button-approve"
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
    </PageLayout>
  );
}

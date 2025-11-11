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
import { CheckCircle, XCircle, Clock, AlertTriangle, Search, Filter, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";

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

export default function FounderApprovalPage() {
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
    <PageLayout>
      <SEO
        title="Founder Approval - Mundo Tango Admin"
        description="Review and approve features before production deployment"
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-400 to-blue-500 bg-clip-text text-transparent">
            Founder Approval Workflow
          </h1>
          <p className="text-muted-foreground">
            Review and approve features before they go live to users
          </p>
        </motion.div>

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
                          {format(new Date(feature.submittedAt), "MMM d, yyyy")}
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
                      {format(new Date(selectedFeature.submittedAt), "PPP 'at' p")}
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
                    data-testid="button-reject"
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

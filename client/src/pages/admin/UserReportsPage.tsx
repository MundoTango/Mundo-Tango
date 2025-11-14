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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, XCircle, Eye, AlertTriangle, Ban, MessageSquare, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserReport {
  id: number;
  reporterId: number;
  reportedUserId: number;
  reportType: string;
  description: string;
  evidence: any;
  status: string;
  severity: string;
  reviewedBy: number | null;
  reviewedAt: string | null;
  adminNotes: string | null;
  action: string | null;
  actionDetails: string | null;
  createdAt: string;
  reporter: {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
  };
  reportedUser: {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
    email: string;
  };
}

export default function UserReportsPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("");

  // Fetch user reports
  const { data: reportsData, isLoading } = useQuery<UserReport[]>({
    queryKey: ["/api/admin/user-reports", statusFilter, severityFilter],
  });

  const reports = reportsData || [];

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || report.severity === severityFilter;
    const matchesSearch =
      !searchQuery ||
      report.reportedUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporter.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  // Resolve report mutation
  const resolveMutation = useMutation({
    mutationFn: async (data: { reportId: number; action: string; adminNotes: string }) => {
      const response = await apiRequest("POST", `/api/admin/user-reports/${data.reportId}/resolve`, {
        action: data.action,
        adminNotes: data.adminNotes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report resolved",
        description: "The user report has been successfully resolved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-reports"] });
      setIsDetailDialogOpen(false);
      setSelectedReport(null);
      setAdminNotes("");
      setSelectedAction("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve report",
        variant: "destructive",
      });
    },
  });

  // Dismiss report mutation
  const dismissMutation = useMutation({
    mutationFn: async (data: { reportId: number; adminNotes: string }) => {
      const response = await apiRequest("POST", `/api/admin/user-reports/${data.reportId}/dismiss`, {
        adminNotes: data.adminNotes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report dismissed",
        description: "The user report has been dismissed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-reports"] });
      setIsDetailDialogOpen(false);
      setSelectedReport(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to dismiss report",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (report: UserReport) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || "");
    setSelectedAction(report.action || "");
    setIsDetailDialogOpen(true);
  };

  const handleResolve = () => {
    if (!selectedReport || !selectedAction) return;
    resolveMutation.mutate({
      reportId: selectedReport.id,
      action: selectedAction,
      adminNotes,
    });
  };

  const handleDismiss = () => {
    if (!selectedReport) return;
    dismissMutation.mutate({
      reportId: selectedReport.id,
      adminNotes,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      pending: { variant: "default", icon: AlertCircle },
      under_review: { variant: "secondary", icon: Eye },
      resolved: { variant: "default", icon: CheckCircle },
      dismissed: { variant: "outline", icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      critical: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return (
      <Badge variant="outline" className={colors[severity] || colors.medium}>
        {severity}
      </Badge>
    );
  };

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const underReviewCount = reports.filter((r) => r.status === "under_review").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  return (
    <PageLayout title="User Reports Management" showBreadcrumbs>
      <SelfHealingErrorBoundary pageName="User Reports Management" fallbackRoute="/admin">
        <>
          <SEO
            title="User Reports - Admin"
            description="Manage user-to-user reports and take moderation actions."
          />

          <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
            <div className="container mx-auto max-w-7xl space-y-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <h1 className="text-4xl font-bold">User Reports Management</h1>
                <p className="text-muted-foreground">
                  Review and manage user-to-user reports, take appropriate moderation actions
                </p>
              </motion.div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-500">{pendingCount}</div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Under Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-500">{underReviewCount}</div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Resolved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">{resolvedCount}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
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
                        placeholder="Search by username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-reports"
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger data-testid="select-status-filter">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger data-testid="select-severity-filter">
                        <SelectValue placeholder="Filter by severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Reports Table */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>User Reports ({filteredReports.length})</CardTitle>
                  <CardDescription>
                    Click on any report to view details and take action
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Loading reports...
                    </div>
                  ) : filteredReports.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No reports found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Reported User</TableHead>
                            <TableHead>Reporter</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredReports.map((report) => (
                            <TableRow key={report.id} className="hover-elevate cursor-pointer">
                              <TableCell className="font-mono text-sm">{report.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={report.reportedUser.profileImage || undefined} />
                                    <AvatarFallback>
                                      {report.reportedUser.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{report.reportedUser.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      @{report.reportedUser.username}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={report.reporter.profileImage || undefined} />
                                    <AvatarFallback>
                                      {report.reporter.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">@{report.reporter.username}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {report.reportType.replace("_", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                              <TableCell>{getStatusBadge(report.status)}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {safeDateFormat(report.createdAt, "MMM d, yyyy", "N/A")}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(report)}
                                  data-testid={`button-view-report-${report.id}`}
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

              {/* Detail Dialog */}
              <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>User Report Details</DialogTitle>
                    <DialogDescription>
                      Review report information and take appropriate action
                    </DialogDescription>
                  </DialogHeader>

                  {selectedReport && (
                    <div className="space-y-6">
                      {/* Report Info */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Reported User
                          </label>
                          <div className="flex items-center gap-3 mt-2">
                            <Avatar>
                              <AvatarImage src={selectedReport.reportedUser.profileImage || undefined} />
                              <AvatarFallback>
                                {selectedReport.reportedUser.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{selectedReport.reportedUser.name}</div>
                              <div className="text-sm text-muted-foreground">
                                @{selectedReport.reportedUser.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {selectedReport.reportedUser.email}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Reporter
                          </label>
                          <div className="flex items-center gap-3 mt-2">
                            <Avatar>
                              <AvatarImage src={selectedReport.reporter.profileImage || undefined} />
                              <AvatarFallback>
                                {selectedReport.reporter.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{selectedReport.reporter.name}</div>
                              <div className="text-sm text-muted-foreground">
                                @{selectedReport.reporter.username}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Report Type
                          </label>
                          <div className="mt-2">
                            <Badge variant="outline">
                              {selectedReport.reportType.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Severity
                          </label>
                          <div className="mt-2">{getSeverityBadge(selectedReport.severity)}</div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Status
                          </label>
                          <div className="mt-2">{getStatusBadge(selectedReport.status)}</div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Report Description
                        </label>
                        <div className="mt-2 p-4 bg-muted rounded-md">
                          <p className="text-sm whitespace-pre-wrap">{selectedReport.description}</p>
                        </div>
                      </div>

                      {/* Evidence */}
                      {selectedReport.evidence && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Evidence
                          </label>
                          <div className="mt-2 p-4 bg-muted rounded-md">
                            <pre className="text-xs overflow-x-auto">
                              {JSON.stringify(selectedReport.evidence, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Action Selection */}
                      {selectedReport.status === "pending" && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Select Action *
                            </label>
                            <Select value={selectedAction} onValueChange={setSelectedAction}>
                              <SelectTrigger className="mt-2" data-testid="select-action">
                                <SelectValue placeholder="Choose an action..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no_action">No Action Required</SelectItem>
                                <SelectItem value="warning">Send Warning</SelectItem>
                                <SelectItem value="suspension">Temporary Suspension</SelectItem>
                                <SelectItem value="ban">Permanent Ban</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Admin Notes
                            </label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add notes about your decision..."
                              rows={4}
                              className="mt-2"
                              data-testid="textarea-admin-notes"
                            />
                          </div>
                        </>
                      )}

                      {/* Existing Admin Notes (if resolved) */}
                      {selectedReport.adminNotes && selectedReport.status !== "pending" && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Admin Notes
                          </label>
                          <div className="mt-2 p-4 bg-muted rounded-md">
                            <p className="text-sm whitespace-pre-wrap">
                              {selectedReport.adminNotes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <DialogFooter>
                    {selectedReport?.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleDismiss}
                          disabled={dismissMutation.isPending}
                          data-testid="button-dismiss-report"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {dismissMutation.isPending ? "Dismissing..." : "Dismiss Report"}
                        </Button>
                        <Button
                          onClick={handleResolve}
                          disabled={!selectedAction || resolveMutation.isPending}
                          data-testid="button-resolve-report"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {resolveMutation.isPending ? "Resolving..." : "Take Action & Resolve"}
                        </Button>
                      </>
                    )}
                    {selectedReport?.status !== "pending" && (
                      <Button
                        variant="outline"
                        onClick={() => setIsDetailDialogOpen(false)}
                        data-testid="button-close-dialog"
                      >
                        Close
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      </SelfHealingErrorBoundary>
    </PageLayout>
  );
}

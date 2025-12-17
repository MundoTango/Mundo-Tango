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
import { AlertCircle, CheckCircle, XCircle, Eye, Music, Users, Calendar, Link as LinkIcon, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RoleRequest {
  id: number;
  userId: number;
  requestedRole: string;
  currentRole: string;
  experience: string;
  credentials: any;
  bio: string;
  specialties: string[];
  city: string;
  country: string;
  website: string;
  socialLinks: any;
  whyRequest: string;
  status: string;
  reviewedBy: number | null;
  reviewedAt: string | null;
  adminNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
    profileImage: string | null;
  };
}

export default function RoleRequestsPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch role requests
  const { data: requestsData, isLoading } = useQuery<RoleRequest[]>({
    queryKey: ["/api/admin/role-requests", statusFilter, roleFilter],
  });

  const requests = requestsData || [];

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesRole = roleFilter === "all" || req.requestedRole === roleFilter;
    const matchesSearch =
      !searchQuery ||
      req.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.city?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesRole && matchesSearch;
  });

  // Approve request mutation
  const approveMutation = useMutation({
    mutationFn: async (data: { requestId: number; adminNotes: string }) => {
      const response = await apiRequest("POST", `/api/admin/role-requests/${data.requestId}/approve`, {
        adminNotes: data.adminNotes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request approved",
        description: "The role request has been approved and user role updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/role-requests"] });
      setIsDetailDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    },
  });

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: async (data: { requestId: number; adminNotes: string; rejectionReason: string }) => {
      const response = await apiRequest("POST", `/api/admin/role-requests/${data.requestId}/reject`, {
        adminNotes: data.adminNotes,
        rejectionReason: data.rejectionReason,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request rejected",
        description: "The role request has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/role-requests"] });
      setIsDetailDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes("");
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (request: RoleRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || "");
    setRejectionReason(request.rejectionReason || "");
    setIsDetailDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedRequest) return;
    approveMutation.mutate({
      requestId: selectedRequest.id,
      adminNotes,
    });
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectionReason) return;
    rejectMutation.mutate({
      requestId: selectedRequest.id,
      adminNotes,
      rejectionReason,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      pending: { variant: "default", icon: AlertCircle },
      under_review: { variant: "secondary", icon: Eye },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "outline", icon: XCircle },
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

  const getRoleBadge = (role: string) => {
    const colors: Record<string, { color: string; icon: any }> = {
      teacher: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Users },
      dj: { color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Music },
      organizer: { color: "bg-green-500/10 text-green-500 border-green-500/20", icon: Calendar },
    };
    const config = colors[role] || colors.teacher;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`gap-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    );
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const underReviewCount = requests.filter((r) => r.status === "under_review").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;

  return (
    <PageLayout title="Professional Role Requests" showBreadcrumbs>
      <SelfHealingErrorBoundary pageName="Role Requests Management" fallbackRoute="/admin">
        <>
          <SEO
            title="Role Requests - Admin"
            description="Review and approve professional role upgrade requests for teachers, DJs, and organizers."
          />

          <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
            <div className="container mx-auto max-w-7xl space-y-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <h1 className="text-4xl font-bold">Professional Role Requests</h1>
                <p className="text-muted-foreground">
                  Review applications from users requesting professional roles (Teacher, DJ, Organizer)
                </p>
              </motion.div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Requests
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
                      Approved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">{approvedCount}</div>
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
                        placeholder="Search by name or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-requests"
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
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger data-testid="select-role-filter">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="dj">DJ</SelectItem>
                        <SelectItem value="organizer">Organizer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Requests Table */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Role Requests ({filteredRequests.length})</CardTitle>
                  <CardDescription>
                    Click on any request to view full details and take action
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Loading requests...
                    </div>
                  ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No role requests found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Applicant</TableHead>
                            <TableHead>Requested Role</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.map((request) => (
                            <TableRow key={request.id} className="hover-elevate cursor-pointer">
                              <TableCell className="font-mono text-sm">{request.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={request.user.profileImage || undefined} />
                                    <AvatarFallback>
                                      {request.user.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{request.user.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      @{request.user.username}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getRoleBadge(request.requestedRole)}</TableCell>
                              <TableCell className="text-sm">
                                {request.city && request.country
                                  ? `${request.city}, ${request.country}`
                                  : request.country || "N/A"}
                              </TableCell>
                              <TableCell className="text-sm max-w-xs truncate">
                                {request.experience.substring(0, 60)}...
                              </TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {safeDateFormat(request.createdAt, "MMM d, yyyy", "N/A")}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(request)}
                                  data-testid={`button-view-request-${request.id}`}
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Role Request Details</DialogTitle>
                    <DialogDescription>
                      Review application and approve or reject the request
                    </DialogDescription>
                  </DialogHeader>

                  {selectedRequest && (
                    <div className="space-y-6">
                      {/* Applicant Info */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Applicant
                          </label>
                          <div className="flex items-center gap-3 mt-2">
                            <Avatar>
                              <AvatarImage src={selectedRequest.user.profileImage || undefined} />
                              <AvatarFallback>
                                {selectedRequest.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{selectedRequest.user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                @{selectedRequest.user.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {selectedRequest.user.email}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Current Role
                          </label>
                          <div className="mt-2">
                            <Badge variant="outline">{selectedRequest.currentRole}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Requested Role
                          </label>
                          <div className="mt-2">{getRoleBadge(selectedRequest.requestedRole)}</div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Location
                          </label>
                          <div className="mt-2 text-sm">
                            {selectedRequest.city && selectedRequest.country
                              ? `${selectedRequest.city}, ${selectedRequest.country}`
                              : selectedRequest.country || "N/A"}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Status
                          </label>
                          <div className="mt-2">{getStatusBadge(selectedRequest.status)}</div>
                        </div>
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Experience
                        </label>
                        <div className="mt-2 p-4 bg-muted rounded-md">
                          <p className="text-sm whitespace-pre-wrap">{selectedRequest.experience}</p>
                        </div>
                      </div>

                      {/* Why Request */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Why They Want This Role
                        </label>
                        <div className="mt-2 p-4 bg-muted rounded-md">
                          <p className="text-sm whitespace-pre-wrap">{selectedRequest.whyRequest}</p>
                        </div>
                      </div>

                      {/* Bio */}
                      {selectedRequest.bio && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Professional Bio
                          </label>
                          <div className="mt-2 p-4 bg-muted rounded-md">
                            <p className="text-sm whitespace-pre-wrap">{selectedRequest.bio}</p>
                          </div>
                        </div>
                      )}

                      {/* Specialties */}
                      {selectedRequest.specialties && selectedRequest.specialties.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Specialties
                          </label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedRequest.specialties.map((specialty, idx) => (
                              <Badge key={idx} variant="secondary">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Website & Social Links */}
                      <div className="grid gap-4 md:grid-cols-2">
                        {selectedRequest.website && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Website
                            </label>
                            <div className="mt-2">
                              <a
                                href={selectedRequest.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                <LinkIcon className="h-3 w-3" />
                                {selectedRequest.website}
                              </a>
                            </div>
                          </div>
                        )}

                        {selectedRequest.socialLinks && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Social Links
                            </label>
                            <div className="mt-2 space-y-1">
                              {Object.entries(selectedRequest.socialLinks).map(([platform, url]) => (
                                <a
                                  key={platform}
                                  href={url as string}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                  <LinkIcon className="h-3 w-3" />
                                  {platform}: {url as string}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Credentials */}
                      {selectedRequest.credentials && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Credentials & Certifications
                          </label>
                          <div className="mt-2 p-4 bg-muted rounded-md">
                            <pre className="text-xs overflow-x-auto">
                              {JSON.stringify(selectedRequest.credentials, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Admin Actions for Pending */}
                      {selectedRequest.status === "pending" && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Admin Notes
                            </label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add notes about your decision..."
                              rows={3}
                              className="mt-2"
                              data-testid="textarea-admin-notes"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Rejection Reason (if rejecting)
                            </label>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Provide detailed reason for rejection..."
                              rows={3}
                              className="mt-2"
                              data-testid="textarea-rejection-reason"
                            />
                          </div>
                        </>
                      )}

                      {/* Existing Admin Notes/Rejection (if approved/rejected) */}
                      {selectedRequest.adminNotes && selectedRequest.status !== "pending" && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Admin Notes
                          </label>
                          <div className="mt-2 p-4 bg-muted rounded-md">
                            <p className="text-sm whitespace-pre-wrap">
                              {selectedRequest.adminNotes}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedRequest.rejectionReason && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Rejection Reason
                          </label>
                          <div className="mt-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm whitespace-pre-wrap text-destructive">
                              {selectedRequest.rejectionReason}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <DialogFooter>
                    {selectedRequest?.status === "pending" && (
                      <>
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={!rejectionReason || rejectMutation.isPending}
                          data-testid="button-reject-request"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {rejectMutation.isPending ? "Rejecting..." : "Reject Request"}
                        </Button>
                        <Button
                          onClick={handleApprove}
                          disabled={approveMutation.isPending}
                          data-testid="button-approve-request"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {approveMutation.isPending ? "Approving..." : "Approve & Grant Role"}
                        </Button>
                      </>
                    )}
                    {selectedRequest?.status !== "pending" && (
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

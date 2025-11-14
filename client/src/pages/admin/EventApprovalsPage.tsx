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
import { AlertCircle, CheckCircle, XCircle, Eye, Calendar, MapPin, Users, DollarSign, Globe, Clock, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Event {
  id: number;
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location: string;
  city: string;
  country: string;
  venue: string;
  isOnline: boolean;
  onlineLink: string;
  imageUrl: string;
  maxAttendees: number;
  currentAttendees: number;
  isPaid: boolean;
  price: string;
  currency: string;
  status: string;
  visibility: string;
  musicStyle: string;
  dressCode: string;
  tags: string[];
  approvedBy: number | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  createdAt: string;
  organizer: {
    id: number;
    name: string;
    username: string;
    email: string;
    profileImage: string | null;
  };
}

export default function EventApprovalsPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch events pending approval
  const { data: eventsData, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/admin/event-approvals", statusFilter, typeFilter],
  });

  const events = eventsData || [];

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesType = typeFilter === "all" || event.eventType === typeFilter;
    const matchesSearch =
      !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  // Approve event mutation
  const approveMutation = useMutation({
    mutationFn: async (data: { eventId: number; adminNotes: string }) => {
      const response = await apiRequest("POST", `/api/admin/event-approvals/${data.eventId}/approve`, {
        adminNotes: data.adminNotes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event approved",
        description: "The event has been approved and is now public.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/event-approvals"] });
      setIsDetailDialogOpen(false);
      setSelectedEvent(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve event",
        variant: "destructive",
      });
    },
  });

  // Reject event mutation
  const rejectMutation = useMutation({
    mutationFn: async (data: { eventId: number; adminNotes: string; rejectionReason: string }) => {
      const response = await apiRequest("POST", `/api/admin/event-approvals/${data.eventId}/reject`, {
        adminNotes: data.adminNotes,
        rejectionReason: data.rejectionReason,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event rejected",
        description: "The event has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/event-approvals"] });
      setIsDetailDialogOpen(false);
      setSelectedEvent(null);
      setAdminNotes("");
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject event",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setAdminNotes(event.adminNotes || "");
    setRejectionReason(event.rejectionReason || "");
    setIsDetailDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedEvent) return;
    approveMutation.mutate({
      eventId: selectedEvent.id,
      adminNotes,
    });
  };

  const handleReject = () => {
    if (!selectedEvent || !rejectionReason) return;
    rejectMutation.mutate({
      eventId: selectedEvent.id,
      adminNotes,
      rejectionReason,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; color: string }> = {
      pending: { variant: "default", icon: AlertCircle, color: "text-orange-500" },
      published: { variant: "default", icon: CheckCircle, color: "text-green-500" },
      approved: { variant: "default", icon: CheckCircle, color: "text-green-500" },
      rejected: { variant: "outline", icon: XCircle, color: "text-red-500" },
      cancelled: { variant: "outline", icon: XCircle, color: "text-gray-500" },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  const getEventTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      milonga: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      workshop: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      festival: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      practica: "bg-green-500/10 text-green-500 border-green-500/20",
      performance: "bg-red-500/10 text-red-500 border-red-500/20",
      social: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    };
    const color = colors[type.toLowerCase()] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
    return (
      <Badge variant="outline" className={`gap-1 ${color}`}>
        <Calendar className="h-3 w-3" />
        {type}
      </Badge>
    );
  };

  const pendingCount = events.filter((e) => e.status === "pending").length;
  const approvedCount = events.filter((e) => e.status === "published" || e.status === "approved").length;
  const rejectedCount = events.filter((e) => e.status === "rejected").length;

  return (
    <PageLayout title="Event Approvals" showBreadcrumbs>
      <SelfHealingErrorBoundary pageName="Event Approvals Management" fallbackRoute="/admin">
        <>
          <SEO
            title="Event Approvals - Admin"
            description="Review and approve community-submitted events for publication."
          />

          <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
            <div className="container mx-auto max-w-7xl space-y-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <h1 className="text-4xl font-bold">Event Approvals</h1>
                <p className="text-muted-foreground">
                  Review and approve community-submitted events before they go live
                </p>
              </motion.div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-500">{pendingCount}</div>
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

                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Rejected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-500">{rejectedCount}</div>
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
                        placeholder="Search by title, city, or organizer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-events"
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger data-testid="select-status-filter">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger data-testid="select-type-filter">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="milonga">Milonga</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="festival">Festival</SelectItem>
                        <SelectItem value="practica">Practica</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Events Table */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Events Pending Approval ({filteredEvents.length})</CardTitle>
                  <CardDescription>
                    Click on any event to view full details and take action
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Loading events...
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No events found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Organizer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEvents.map((event) => (
                            <TableRow key={event.id} className="hover-elevate cursor-pointer">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {event.imageUrl && (
                                    <img
                                      src={event.imageUrl}
                                      alt={event.title}
                                      className="w-12 h-12 rounded object-cover"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium line-clamp-1">{event.title}</div>
                                    <div className="text-sm text-muted-foreground line-clamp-1">
                                      {event.description.substring(0, 50)}...
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getEventTypeBadge(event.eventType)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={event.organizer.profileImage || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {event.organizer.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{event.organizer.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {safeDateFormat(event.startDate, "MMM d, yyyy", "TBD")}
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="flex items-center gap-1">
                                  {event.isOnline ? (
                                    <>
                                      <Globe className="h-3 w-3" />
                                      <span>Online</span>
                                    </>
                                  ) : (
                                    <>
                                      <MapPin className="h-3 w-3" />
                                      <span>{event.city || event.location}</span>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {event.maxAttendees ? (
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {event.currentAttendees}/{event.maxAttendees}
                                  </div>
                                ) : (
                                  "Unlimited"
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(event.status)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(event)}
                                  data-testid={`button-view-event-${event.id}`}
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
                    <DialogTitle>Event Details</DialogTitle>
                    <DialogDescription>
                      Review event information and approve or reject
                    </DialogDescription>
                  </DialogHeader>

                  {selectedEvent && (
                    <div className="space-y-6">
                      {/* Event Image */}
                      {selectedEvent.imageUrl && (
                        <div className="rounded-lg overflow-hidden">
                          <img
                            src={selectedEvent.imageUrl}
                            alt={selectedEvent.title}
                            className="w-full h-64 object-cover"
                          />
                        </div>
                      )}

                      {/* Basic Info */}
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{selectedEvent.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {getEventTypeBadge(selectedEvent.eventType)}
                          {getStatusBadge(selectedEvent.status)}
                          {selectedEvent.isPaid && (
                            <Badge variant="outline" className="gap-1">
                              <DollarSign className="h-3 w-3" />
                              {selectedEvent.price} {selectedEvent.currency}
                            </Badge>
                          )}
                          {selectedEvent.isOnline && (
                            <Badge variant="outline" className="gap-1">
                              <Globe className="h-3 w-3" />
                              Online Event
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{selectedEvent.description}</p>
                      </div>

                      {/* Organizer */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Organizer
                        </label>
                        <div className="flex items-center gap-3 mt-2">
                          <Avatar>
                            <AvatarImage src={selectedEvent.organizer.profileImage || undefined} />
                            <AvatarFallback>
                              {selectedEvent.organizer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{selectedEvent.organizer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              @{selectedEvent.organizer.username}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Event Details Grid */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Start Date
                          </label>
                          <div className="mt-1 text-sm">
                            {safeDateFormat(selectedEvent.startDate, "PPP 'at' p", "TBD")}
                          </div>
                        </div>

                        {selectedEvent.endDate && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              End Date
                            </label>
                            <div className="mt-1 text-sm">
                              {safeDateFormat(selectedEvent.endDate, "PPP 'at' p", "TBD")}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Location
                          </label>
                          <div className="mt-1 text-sm">
                            {selectedEvent.isOnline ? (
                              <>
                                Online Event
                                {selectedEvent.onlineLink && (
                                  <a
                                    href={selectedEvent.onlineLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-primary hover:underline"
                                  >
                                    {selectedEvent.onlineLink}
                                  </a>
                                )}
                              </>
                            ) : (
                              <>
                                <div>{selectedEvent.venue || selectedEvent.location}</div>
                                <div className="text-muted-foreground">
                                  {selectedEvent.city}, {selectedEvent.country}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Capacity
                          </label>
                          <div className="mt-1 text-sm">
                            {selectedEvent.maxAttendees
                              ? `${selectedEvent.currentAttendees}/${selectedEvent.maxAttendees} attendees`
                              : "Unlimited capacity"}
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      {selectedEvent.musicStyle && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Music Style
                          </label>
                          <div className="mt-1 text-sm">{selectedEvent.musicStyle}</div>
                        </div>
                      )}

                      {selectedEvent.dressCode && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Dress Code
                          </label>
                          <div className="mt-1 text-sm">{selectedEvent.dressCode}</div>
                        </div>
                      )}

                      {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Tags
                          </label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedEvent.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin Actions for Pending */}
                      {selectedEvent.status === "pending" && (
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

                      {/* Existing Admin Notes/Rejection */}
                      {selectedEvent.adminNotes && selectedEvent.status !== "pending" && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Admin Notes
                          </label>
                          <div className="mt-2 p-4 bg-muted rounded-md">
                            <p className="text-sm whitespace-pre-wrap">
                              {selectedEvent.adminNotes}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedEvent.rejectionReason && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Rejection Reason
                          </label>
                          <div className="mt-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm whitespace-pre-wrap text-destructive">
                              {selectedEvent.rejectionReason}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <DialogFooter>
                    {selectedEvent?.status === "pending" && (
                      <>
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={!rejectionReason || rejectMutation.isPending}
                          data-testid="button-reject-event"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {rejectMutation.isPending ? "Rejecting..." : "Reject Event"}
                        </Button>
                        <Button
                          onClick={handleApprove}
                          disabled={approveMutation.isPending}
                          data-testid="button-approve-event"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {approveMutation.isPending ? "Approving..." : "Approve & Publish"}
                        </Button>
                      </>
                    )}
                    {selectedEvent?.status !== "pending" && (
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

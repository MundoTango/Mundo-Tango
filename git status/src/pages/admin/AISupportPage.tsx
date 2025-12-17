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
import { Bot, User, MessageSquare, CheckCircle, AlertTriangle, Search, Filter, Eye, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";

interface SupportTicket {
  id: number;
  userId: number;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  aiResponse: string | null;
  aiConfidence: number | null;
  humanReviewRequired: boolean;
  assignedToAgentId: number | null;
  resolvedBy: number | null;
  resolution: string | null;
  satisfactionRating: number | null;
  createdAt: string;
  resolvedAt: string | null;
}

export default function AISupportPage() {
  const { toast } = useToast();
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [agentResponse, setAgentResponse] = useState("");
  const [resolution, setResolution] = useState("");

  const { data: ticketsData, isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/admin/support/open", priorityFilter],
  });

  const { data: reviewTicketsData } = useQuery<SupportTicket[]>({
    queryKey: ["/api/admin/support/review"],
  });

  const { data: statsData } = useQuery<any>({
    queryKey: ["/api/admin/support/stats"],
  });

  const tickets = ticketsData || [];
  const reviewTickets = reviewTicketsData || [];
  const stats = statsData || {
    total: 0,
    open: 0,
    resolved: 0,
    avgResponseTime: 0,
    aiHandled: 0,
    avgSatisfaction: 0,
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesStatus && matchesSearch;
  });

  const assignMutation = useMutation({
    mutationFn: async (data: { id: number; agentId: number }) => {
      const response = await apiRequest("POST", `/api/support/tickets/${data.id}/assign`, {
        agentId: data.agentId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Ticket assigned", description: "Ticket has been assigned to an agent." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/open"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/stats"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to assign ticket", variant: "destructive" });
    },
  });

  const respondMutation = useMutation({
    mutationFn: async (data: { id: number; message: string }) => {
      const response = await apiRequest("POST", `/api/support/tickets/${data.id}/agent-response`, {
        message: data.message,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Response sent", description: "Your response has been sent to the user." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/open"] });
      setAgentResponse("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to send response", variant: "destructive" });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (data: { id: number; resolution: string }) => {
      const response = await apiRequest("POST", `/api/support/tickets/${data.id}/resolve`, {
        resolution: data.resolution,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Ticket resolved", description: "Ticket has been marked as resolved." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/open"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/stats"] });
      setIsDetailDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to resolve ticket", variant: "destructive" });
    },
  });

  const escalateMutation = useMutation({
    mutationFn: async (data: { id: number; newPriority: string; reason: string }) => {
      const response = await apiRequest("POST", `/api/support/tickets/${data.id}/escalate`, {
        newPriority: data.newPriority,
        reason: data.reason,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Ticket escalated", description: "Ticket priority has been escalated." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/open"] });
      setIsDetailDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to escalate ticket", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setSelectedTicket(null);
    setAgentResponse("");
    setResolution("");
  };

  const handleOpenDetail = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setAgentResponse("");
    setResolution(ticket.resolution || "");
    setIsDetailDialogOpen(true);
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      low: { variant: "default", text: "Low" },
      medium: { variant: "secondary", text: "Medium" },
      high: { variant: "destructive", text: "High" },
      urgent: { variant: "destructive", text: "Urgent" },
    };
    const config = variants[priority] || variants.medium;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: { variant: "secondary", text: "Open" },
      awaiting_review: { variant: "secondary", text: "Awaiting Review" },
      in_progress: { variant: "default", text: "In Progress" },
      resolved: { variant: "default", text: "Resolved" },
      closed: { variant: "outline", text: "Closed" },
    };
    const config = variants[status] || variants.open;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <PageLayout>
      <SEO
        title="AI Support Dashboard - Mundo Tango Admin"
        description="Manage AI-powered customer support tickets and escalations"
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-400 to-blue-500 bg-clip-text text-transparent">
            AI Support Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage AI-powered customer support with human escalation
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-6">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.open}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Handled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.aiHandled}%</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseTime}m</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.avgSatisfaction}/5</div>
            </CardContent>
          </Card>
        </div>

        {reviewTickets.length > 0 && (
          <Card className="glass-card border-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Tickets Requiring Human Review ({reviewTickets.length})
              </CardTitle>
              <CardDescription>AI confidence too low - human review needed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reviewTickets.slice(0, 5).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{ticket.subject}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Bot className="h-3 w-3" />
                        AI Confidence: {((ticket.aiConfidence || 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(ticket.priority)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetail(ticket)}
                        data-testid={`button-review-ticket-${ticket.id}`}
                      >
                        Review
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
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-tickets"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger data-testid="select-priority-filter">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="awaiting_review">Awaiting Review</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
            <CardDescription>Click on any ticket to view details and take action</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No support tickets found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>AI Confidence</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="hover-elevate">
                        <TableCell className="font-medium">#{ticket.id}</TableCell>
                        <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{ticket.category}</TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>
                          {ticket.aiConfidence !== null ? (
                            <div className="flex items-center gap-1">
                              <Bot className="h-3 w-3" />
                              <span className="text-sm">{(ticket.aiConfidence * 100).toFixed(0)}%</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {safeDateFormat(ticket.createdAt, "MMM d, yyyy", "N/A")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDetail(ticket)}
                            data-testid={`button-view-${ticket.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
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
              <DialogTitle className="text-2xl">Ticket #{selectedTicket?.id}</DialogTitle>
              <DialogDescription>{selectedTicket?.subject}</DialogDescription>
            </DialogHeader>

            {selectedTicket && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <div className="mt-1 text-sm">{selectedTicket.category}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <div className="mt-1 text-sm">{safeDateFormat(selectedTicket.createdAt, "PPP 'at' p", "N/A")}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <div className="mt-2 p-4 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>
                </div>

                {selectedTicket.aiResponse && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      AI Response (Confidence: {((selectedTicket.aiConfidence || 0) * 100).toFixed(0)}%)
                    </label>
                    <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-sm whitespace-pre-wrap">{selectedTicket.aiResponse}</p>
                    </div>
                  </div>
                )}

                {selectedTicket.status !== "resolved" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Agent Response</label>
                      <Textarea
                        value={agentResponse}
                        onChange={(e) => setAgentResponse(e.target.value)}
                        placeholder="Type your response to the user..."
                        rows={4}
                        className="mt-2"
                        data-testid="textarea-agent-response"
                      />
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => respondMutation.mutate({ id: selectedTicket.id, message: agentResponse })}
                        disabled={respondMutation.isPending || !agentResponse}
                        data-testid="button-send-response"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Send Response
                      </Button>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Resolution Notes</label>
                      <Textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Describe how this ticket was resolved..."
                        rows={3}
                        className="mt-2"
                        data-testid="textarea-resolution"
                      />
                    </div>
                  </div>
                )}

                {selectedTicket.resolution && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Resolution</label>
                    <div className="mt-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
                      <p className="text-sm whitespace-pre-wrap">{selectedTicket.resolution}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              {selectedTicket?.status !== "resolved" ? (
                <div className="flex gap-2 w-full justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailDialogOpen(false)}
                    data-testid="button-close"
                  >
                    Close
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (selectedTicket) {
                        escalateMutation.mutate({
                          id: selectedTicket.id,
                          newPriority: "urgent",
                          reason: "Escalated by admin",
                        });
                      }
                    }}
                    disabled={escalateMutation.isPending}
                    data-testid="button-escalate"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Escalate
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedTicket) {
                        resolveMutation.mutate({ id: selectedTicket.id, resolution });
                      }
                    }}
                    disabled={resolveMutation.isPending || !resolution}
                    data-testid="button-resolve"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Resolved
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

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, XCircle, Ban, FileWarning, Shield, Activity, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface ModerationQueueItem {
  queue: {
    id: number;
    contentType: string;
    contentId: number;
    reportedBy: number | null;
    reason: string;
    description: string | null;
    status: string;
    priority: number;
    moderatedBy: number | null;
    moderatedAt: Date | null;
    moderatorNotes: string | null;
    createdAt: Date;
  };
  reporter: {
    id: number;
    username: string;
    name: string;
  } | null;
}

interface ModerationStats {
  pending: number;
  approved: number;
  removed: number;
  banned: number;
  flagged: number;
  recentActions24h: number;
}

interface FlaggedContentItem {
  id: number;
  contentType: string;
  contentId: number;
  flagReason: string;
  autoFlagged: boolean;
  createdAt: Date;
}

interface AuditLogItem {
  action: {
    id: number;
    queueId: number;
    action: string;
    moderatorId: number;
    reason: string | null;
    createdAt: Date;
  };
  moderator: {
    id: number;
    username: string;
    name: string;
  } | null;
}

export default function ModerationDashboard() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("queue");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedItem, setSelectedItem] = useState<ModerationQueueItem | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState("");

  const { data: stats } = useQuery<ModerationStats>({
    queryKey: ["/api/admin/moderation/stats"],
  });

  const { data: queueData } = useQuery<{
    queue: ModerationQueueItem[];
    total: number;
  }>({
    queryKey: ["/api/admin/moderation/queue", statusFilter],
    queryFn: () => fetch(`/api/admin/moderation/queue?status=${statusFilter}`).then(r => r.json()),
  });

  const { data: flaggedData } = useQuery<{
    flagged: FlaggedContentItem[];
    total: number;
  }>({
    queryKey: ["/api/admin/moderation/flagged"],
  });

  const { data: auditData } = useQuery<{
    actions: AuditLogItem[];
    total: number;
  }>({
    queryKey: ["/api/admin/moderation/audit-log"],
  });

  const moderationMutation = useMutation({
    mutationFn: async ({ id, action, notes }: { id: number; action: string; notes: string }) => {
      return apiRequest(`/api/admin/moderation/${id}/action`, {
        method: "POST",
        body: { action, notes },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation/audit-log"] });
      setSelectedItem(null);
      setModeratorNotes("");
      toast({
        title: "Action completed",
        description: "Moderation action has been applied successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to perform moderation action",
        variant: "destructive",
      });
    },
  });

  const handleModerationAction = (action: string) => {
    if (!selectedItem) return;
    
    moderationMutation.mutate({
      id: selectedItem.queue.id,
      action,
      notes: moderatorNotes,
    });
  };

  const getPriorityBadge = (priority: number) => {
    const variants = {
      1: { label: "Low", className: "bg-blue-500" },
      2: { label: "Medium", className: "bg-yellow-500" },
      3: { label: "High", className: "bg-orange-500" },
      4: { label: "Urgent", className: "bg-red-500" },
      5: { label: "Critical", className: "bg-red-700" },
    };
    
    const config = variants[priority as keyof typeof variants] || variants[1];
    return <Badge className={config.className} data-testid={`badge-priority-${priority}`}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Content Moderation</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Manage reported content and moderate the community
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card data-testid="card-stat-pending">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-pending">{stats?.pending || 0}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-approved">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-approved">{stats?.approved || 0}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-removed">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Removed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-removed">{stats?.removed || 0}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-banned">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned</CardTitle>
            <Ban className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-banned">{stats?.banned || 0}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-flagged">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Flagged</CardTitle>
            <FileWarning className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-flagged">{stats?.flagged || 0}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-recent">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Actions</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-recent">{stats?.recentActions24h || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} data-testid="tabs-moderation">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue" data-testid="tab-queue">
            <Shield className="h-4 w-4 mr-2" />
            Reports Queue
          </TabsTrigger>
          <TabsTrigger value="flagged" data-testid="tab-flagged">
            <FileWarning className="h-4 w-4 mr-2" />
            Flagged Content
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            <Activity className="h-4 w-4 mr-2" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="automation" data-testid="tab-automation">
            <Users className="h-4 w-4 mr-2" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle data-testid="text-queue-title">Moderation Queue</CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40" data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>
                {queueData?.total || 0} items in queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queueData?.queue.map((item) => (
                  <div
                    key={item.queue.id}
                    className={`p-4 border rounded-lg cursor-pointer hover-elevate ${
                      selectedItem?.queue.id === item.queue.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedItem(item)}
                    data-testid={`card-queue-item-${item.queue.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" data-testid={`badge-type-${item.queue.contentType}`}>
                            {item.queue.contentType}
                          </Badge>
                          <Badge variant="outline" data-testid={`badge-reason-${item.queue.reason}`}>
                            {item.queue.reason}
                          </Badge>
                          {getPriorityBadge(item.queue.priority)}
                        </div>
                        
                        <p className="text-sm" data-testid={`text-description-${item.queue.id}`}>
                          {item.queue.description || "No description provided"}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {item.reporter && (
                            <span data-testid={`text-reporter-${item.queue.id}`}>
                              Reported by: @{item.reporter.username}
                            </span>
                          )}
                          <span data-testid={`text-time-${item.queue.id}`}>
                            {formatDistanceToNow(new Date(item.queue.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {queueData?.queue.length === 0 && (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-empty-queue">
                    No items in the queue
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedItem && (
            <Card data-testid="card-moderation-actions">
              <CardHeader>
                <CardTitle>Moderation Actions</CardTitle>
                <CardDescription>
                  Take action on: {selectedItem.queue.contentType} #{selectedItem.queue.contentId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Moderator Notes</label>
                  <Textarea
                    placeholder="Add notes about this moderation decision..."
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    data-testid="input-moderator-notes"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => handleModerationAction("approve")}
                    disabled={moderationMutation.isPending}
                    data-testid="button-approve"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => handleModerationAction("remove")}
                    disabled={moderationMutation.isPending}
                    data-testid="button-remove"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Remove Content
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => handleModerationAction("ban_user")}
                    disabled={moderationMutation.isPending}
                    data-testid="button-ban-user"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleModerationAction("warn_user")}
                    disabled={moderationMutation.isPending}
                    data-testid="button-warn-user"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Warn User
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="flagged">
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-flagged-title">Auto-Flagged Content</CardTitle>
              <CardDescription>
                Content automatically flagged by the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {flaggedData?.flagged.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg"
                    data-testid={`card-flagged-item-${item.id}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" data-testid={`badge-flagged-type-${item.contentType}`}>
                            {item.contentType}
                          </Badge>
                          <Badge variant="destructive" data-testid={`badge-flag-reason-${item.flagReason}`}>
                            {item.flagReason}
                          </Badge>
                          {item.autoFlagged && (
                            <Badge variant="secondary">Auto-flagged</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          Content ID: {item.contentId}
                        </p>
                        
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {flaggedData?.flagged.length === 0 && (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-empty-flagged">
                    No flagged content
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-audit-title">Moderation Audit Log</CardTitle>
              <CardDescription>
                Complete history of all moderation actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditData?.actions.map(({ action, moderator }) => (
                  <div
                    key={action.id}
                    className="p-4 border rounded-lg"
                    data-testid={`card-audit-item-${action.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" data-testid={`badge-action-${action.action}`}>
                            {action.action}
                          </Badge>
                          {moderator && (
                            <span className="text-sm" data-testid={`text-moderator-${action.id}`}>
                              by @{moderator.username}
                            </span>
                          )}
                        </div>
                        
                        {action.reason && (
                          <p className="text-sm text-muted-foreground" data-testid={`text-reason-${action.id}`}>
                            {action.reason}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(action.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {auditData?.actions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-empty-audit">
                    No audit log entries
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-automation-title">Automation Settings</CardTitle>
              <CardDescription>
                Configure automated moderation rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Profanity Filter</h3>
                    <p className="text-sm text-muted-foreground">
                      Auto-flag content containing profanity
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Spam Detection</h3>
                    <p className="text-sm text-muted-foreground">
                      Auto-flag content with spam keywords or patterns
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Multiple Reports Threshold</h3>
                    <p className="text-sm text-muted-foreground">
                      Auto-escalate content with 3+ reports
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Priority Escalation</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically increase priority for repeated offenders
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

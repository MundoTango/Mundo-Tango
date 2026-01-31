import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, AlertTriangle, Check, X, Eye, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";

interface ModerationItem {
  id: number;
  type: "post" | "comment" | "user" | "event";
  content: string;
  reportedBy: string;
  reportedByUserId: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  authorName: string;
  authorId: number;
}

export default function AdminContentModerationPage() {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: moderationItems, isLoading } = useQuery<ModerationItem[]>({
    queryKey: ["/api/admin/moderation", filterStatus, filterType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterType !== "all") params.set("type", filterType);
      return await apiRequest(`/api/admin/moderation?${params.toString()}`, "GET");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest(`/api/admin/moderation/${id}`, "PATCH", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation"] });
      toast({ title: "Status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const handleApprove = (id: number) => {
    updateStatusMutation.mutate({ id, status: "approved" });
  };

  const handleReject = (id: number) => {
    updateStatusMutation.mutate({ id, status: "rejected" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      post: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      comment: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      user: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      event: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    };
    return (
      <Badge variant="outline" className={colors[type] || ""}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <SEO
        title="Content Moderation"
        description="Review and moderate flagged content, posts, comments, and user reports on Mundo Tango"
        ogImage="/og-image.png"
      />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-7xl py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-4xl font-bold text-foreground flex items-center gap-3"
              data-testid="text-moderation-title"
            >
              <Shield className="h-10 w-10 text-primary" />
              Content Moderation
            </h1>
            <p className="text-muted-foreground mt-2">
              Review and moderate flagged content
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter moderation queue by status and type</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger data-testid="select-filter-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger data-testid="select-filter-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="post">Posts</SelectItem>
                    <SelectItem value="comment">Comments</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Moderation Queue */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-primary" />
                    Moderation Queue
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {isLoading
                      ? "Loading..."
                      : `${moderationItems?.length || 0} items to review`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : moderationItems && moderationItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moderationItems.map((item) => (
                      <TableRow key={item.id} data-testid={`row-moderation-${item.id}`}>
                        <TableCell>{getTypeBadge(item.type)}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={item.content}>
                            {item.content}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.authorName}</span>
                            <span className="text-xs text-muted-foreground">
                              (ID: {item.authorId})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{item.reportedBy}</span>
                            <span className="text-xs text-muted-foreground">
                              (ID: {item.reportedByUserId})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">{item.reason}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {safeDateDistance(item.createdAt)} ago
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              data-testid={`button-view-${item.id}`}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            {item.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="gap-1 bg-green-600 hover:bg-green-700"
                                  onClick={() => handleApprove(item.id)}
                                  disabled={updateStatusMutation.isPending}
                                  data-testid={`button-approve-${item.id}`}
                                >
                                  <Check className="h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-1"
                                  onClick={() => handleReject(item.id)}
                                  disabled={updateStatusMutation.isPending}
                                  data-testid={`button-reject-${item.id}`}
                                >
                                  <X className="h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No items to moderate
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    All content has been reviewed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

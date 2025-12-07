import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle, Shield, Loader2, Inbox } from "lucide-react";
import { useState } from "react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface ModerationItem {
  id: number;
  contentType: string;
  contentId: number;
  reportedBy: number | null;
  reason: string;
  description: string | null;
  status: string;
  priority: number;
  createdAt: string;
  reporter?: {
    id: number;
    username: string;
    name: string;
  } | null;
}

interface ModerationStats {
  pending: number;
  approved: number;
  removed: number;
}

export default function ContentModerationPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<ModerationStats>({
    queryKey: ["/api/admin/moderation/stats"],
  });

  const { data: queueData, isLoading: queueLoading } = useQuery<{
    queue: { queue: ModerationItem }[];
    total: number;
  }>({
    queryKey: ["/api/admin/moderation/queue", activeTab],
  });

  const moderationMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: string }) => {
      const response = await apiRequest("POST", `/api/admin/moderation/${id}/action`, { action });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation/stats"] });
      toast({
        title: "Action completed",
        description: "Moderation action applied successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to perform action",
        variant: "destructive",
      });
    },
  });

  const handleAction = (id: number, action: string) => {
    moderationMutation.mutate({ id, action });
  };

  const items = queueData?.queue || [];
  const pendingCount = stats?.pending || 0;
  const approvedCount = stats?.approved || 0;
  const removedCount = stats?.removed || 0;

  return (
    <SelfHealingErrorBoundary pageName="Content Moderation" fallbackRoute="/admin">
      <div className="min-h-screen bg-background">
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1600&h=900&fit=crop&q=80')`
          }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                <Shield className="w-3 h-3 mr-1.5" />
                Admin Tools
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-page-title">
                Content Moderation
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
                Review and manage reported content
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="pending" data-testid="tab-pending">
                  Pending ({statsLoading ? "..." : pendingCount})
                </TabsTrigger>
                <TabsTrigger value="approved" data-testid="tab-approved">
                  Approved ({statsLoading ? "..." : approvedCount})
                </TabsTrigger>
                <TabsTrigger value="removed" data-testid="tab-rejected">
                  Removed ({statsLoading ? "..." : removedCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {queueLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : items.length === 0 ? (
                  <Card className="py-12">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No items to review</h3>
                      <p className="text-muted-foreground">
                        {activeTab === "pending" 
                          ? "All caught up! No pending moderation items."
                          : `No ${activeTab} items found.`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const queueItem = item.queue;
                      return (
                        <motion.div
                          key={queueItem.id}
                          initial={{ opacity: 0, y: 40 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-100px" }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                          <Card data-testid={`content-${queueItem.id}`} className="hover-elevate">
                            <CardHeader>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <CardTitle className="text-lg font-serif">
                                    {queueItem.contentType} Report
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground">
                                    {queueItem.createdAt 
                                      ? `Reported ${formatDistanceToNow(new Date(queueItem.createdAt), { addSuffix: true })}`
                                      : "Recently reported"}
                                  </p>
                                </div>
                                <Badge variant="destructive">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {queueItem.reason}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-muted-foreground">
                                {queueItem.description || `Content ID: ${queueItem.contentId}`}
                              </p>
                              {activeTab === "pending" && (
                                <div className="flex gap-2">
                                  <Button 
                                    variant="default" 
                                    size="sm" 
                                    data-testid={`button-approve-${queueItem.id}`}
                                    onClick={() => handleAction(queueItem.id, "approve")}
                                    disabled={moderationMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    data-testid={`button-reject-${queueItem.id}`}
                                    onClick={() => handleAction(queueItem.id, "remove")}
                                    disabled={moderationMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Remove
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}

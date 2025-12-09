import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle, Shield, Loader2, Inbox } from "lucide-react";
import { useState } from "react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PostReport {
  id: number;
  reporterId: number;
  postId: number;
  reason: string;
  status: string;
  createdAt: string;
  post?: {
    id: number;
    content: string;
    authorId: number;
    author?: {
      username: string;
      displayName: string;
    };
  };
  reporter?: {
    username: string;
    displayName: string;
  };
}

export default function ContentModerationPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();

  const { data: reports = [], isLoading, refetch } = useQuery<PostReport[]>({
    queryKey: ["/api/admin/content/flagged", activeTab],
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ contentId, action }: { contentId: number; action: string }) => {
      return apiRequest(`/api/admin/content/${contentId}/moderate`, {
        method: "POST",
        body: JSON.stringify({ action, contentType: "post" }),
      });
    },
    onSuccess: (_, { action }) => {
      toast({
        title: action === "approve" ? "Content Approved" : "Content Removed",
        description: `The reported content has been ${action === "approve" ? "approved" : "removed"}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/flagged"] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to moderate content",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (postId: number) => {
    moderateMutation.mutate({ contentId: postId, action: "approve" });
  };

  const handleRemove = (postId: number) => {
    moderateMutation.mutate({ contentId: postId, action: "remove" });
  };

  return (
    <SelfHealingErrorBoundary pageName="Content Moderation" fallbackRoute="/admin">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
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
                  Pending {reports.length > 0 && activeTab === "pending" ? `(${reports.length})` : ""}
                </TabsTrigger>
                <TabsTrigger value="resolved" data-testid="tab-resolved">Resolved</TabsTrigger>
                <TabsTrigger value="dismissed" data-testid="tab-dismissed">Dismissed</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : reports.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Inbox className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Reports</h3>
                      <p className="text-muted-foreground">
                        {activeTab === "pending" 
                          ? "No pending reports to review. The community is behaving well!"
                          : `No ${activeTab} reports to display.`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <Card data-testid={`report-${report.id}`} className="hover-elevate">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <CardTitle className="text-lg font-serif">
                                  Reported Post #{report.postId}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  Reported by @{report.reporter?.username || `user${report.reporterId}`} 
                                  {report.createdAt && ` • ${format(new Date(report.createdAt), "MMM d, yyyy 'at' h:mm a")}`}
                                </p>
                              </div>
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {report.reason || "Reported"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Post Content:</p>
                              <p className="text-foreground">
                                {report.post?.content || "Content not available"}
                              </p>
                            </div>
                            
                            {activeTab === "pending" && (
                              <div className="flex gap-2">
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={() => handleApprove(report.postId)}
                                  disabled={moderateMutation.isPending}
                                  data-testid={`button-approve-${report.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => handleRemove(report.postId)}
                                  disabled={moderateMutation.isPending}
                                  data-testid={`button-reject-${report.id}`}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
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

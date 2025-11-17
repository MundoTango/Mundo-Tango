import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { PageLayout } from "@/components/PageLayout";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { 
  UserPlus, UserCheck, X, Clock, Users, 
  CheckCircle, XCircle, AlertCircle 
} from "lucide-react";
import { motion } from "framer-motion";
import { safeDateDistance } from "@/lib/safeDateFormat";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  sender?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
    city?: string | null;
    country?: string | null;
  };
  receiver?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
  };
  mutualFriends?: number;
}

export default function FriendRequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch received requests
  const { data: receivedRequests = [], isLoading: receivedLoading } = useQuery<FriendRequest[]>({
    queryKey: ['/api/friends/requests/received', user?.id],
    enabled: !!user,
  });

  // Fetch sent requests
  const { data: sentRequests = [], isLoading: sentLoading } = useQuery<FriendRequest[]>({
    queryKey: ['/api/friends/requests/sent', user?.id],
    enabled: !!user,
  });

  // Accept request mutation
  const acceptMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest('POST', `/api/friends/accept/${requestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests/received'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      toast({
        title: "Friend request accepted!",
        description: "You are now friends",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to accept request",
        description: error.message || "Something went wrong",
      });
    },
  });

  // Decline request mutation
  const declineMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest('POST', `/api/friends/decline/${requestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests/received'] });
      toast({
        title: "Request declined",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to decline request",
        description: error.message || "Something went wrong",
      });
    },
  });

  // Cancel sent request mutation
  const cancelMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest('DELETE', `/api/friends/request/${requestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests/sent'] });
      toast({
        title: "Request cancelled",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to cancel request",
        description: error.message || "Something went wrong",
      });
    },
  });

  // Bulk accept all requests
  const acceptAllMutation = useMutation({
    mutationFn: async () => {
      const promises = receivedRequests
        .filter(req => req.status === 'pending')
        .map(req => apiRequest('POST', `/api/friends/accept/${req.id}`));
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests/received'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      toast({
        title: "All requests accepted!",
        description: `Accepted ${receivedRequests.length} friend requests`,
      });
    },
  });

  // Bulk decline all requests
  const declineAllMutation = useMutation({
    mutationFn: async () => {
      const promises = receivedRequests
        .filter(req => req.status === 'pending')
        .map(req => apiRequest('POST', `/api/friends/decline/${req.id}`));
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests/received'] });
      toast({
        title: "All requests declined",
      });
    },
  });

  const pendingReceived = receivedRequests.filter(req => req.status === 'pending');
  const pendingSent = sentRequests.filter(req => req.status === 'pending');

  return (
    <SelfHealingErrorBoundary pageName="Friend Requests" fallbackRoute="/friends">
      <SEO
        title="Friend Requests - Mundo Tango"
        description="Manage your friend requests. Accept or decline pending requests and view your sent requests."
      />
      <PageLayout title="Friend Requests" showBreadcrumbs>
        <div className="min-h-screen bg-background">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
            <div className="container mx-auto px-4 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <UserPlus className="h-8 w-8 text-primary" />
                  <h1 className="text-4xl font-bold" data-testid="text-page-title">
                    Friend Requests
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  Manage incoming and outgoing friend requests
                </p>

                {/* Stats */}
                <div className="flex gap-6 mt-6">
                  <div>
                    <div className="text-2xl font-bold">{pendingReceived.length}</div>
                    <div className="text-sm text-muted-foreground">Pending Requests</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{pendingSent.length}</div>
                    <div className="text-sm text-muted-foreground">Sent Requests</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="grid gap-8">
              {/* Received Requests Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Requests
                    {pendingReceived.length > 0 && (
                      <Badge variant="secondary">{pendingReceived.length}</Badge>
                    )}
                  </h2>

                  {/* Bulk Actions */}
                  {pendingReceived.length > 0 && (
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            data-testid="button-accept-all"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept All
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Accept all requests?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will accept {pendingReceived.length} friend request(s).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => acceptAllMutation.mutate()}
                              disabled={acceptAllMutation.isPending}
                            >
                              {acceptAllMutation.isPending ? 'Accepting...' : 'Accept All'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            data-testid="button-decline-all"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline All
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Decline all requests?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will decline {pendingReceived.length} friend request(s).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => declineAllMutation.mutate()}
                              disabled={declineAllMutation.isPending}
                            >
                              {declineAllMutation.isPending ? 'Declining...' : 'Decline All'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {receivedLoading ? (
                    <>
                      <Card className="p-6">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-16 w-16 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                      </Card>
                      <Card className="p-6">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-16 w-16 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                      </Card>
                    </>
                  ) : pendingReceived.length === 0 ? (
                    <Card className="p-12 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-semibold mb-2">No pending requests</h3>
                      <p className="text-muted-foreground mb-4">
                        You're all caught up! No new friend requests at this time.
                      </p>
                      <Link href="/search">
                        <Button data-testid="button-discover">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Discover People
                        </Button>
                      </Link>
                    </Card>
                  ) : (
                    pendingReceived.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-6" data-testid={`request-card-${index}`}>
                          <div className="flex items-start gap-4">
                            <Link href={`/profile/${request.sender?.username || request.senderId}`}>
                              <Avatar className="h-16 w-16 cursor-pointer hover-elevate">
                                <AvatarImage src={request.sender?.profileImage || undefined} />
                                <AvatarFallback>
                                  {request.sender?.name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            </Link>

                            <div className="flex-1 min-w-0">
                              <Link href={`/profile/${request.sender?.username || request.senderId}`}>
                                <h3 className="font-semibold text-lg hover:underline cursor-pointer" data-testid={`text-sender-name-${index}`}>
                                  {request.sender?.name || 'Unknown'}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                @{request.sender?.username || 'unknown'}
                              </p>
                              {(request.sender?.city || request.sender?.country) && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {[request.sender?.city, request.sender?.country].filter(Boolean).join(', ')}
                                </p>
                              )}
                              {request.mutualFriends !== undefined && request.mutualFriends > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground" data-testid={`text-mutual-${index}`}>
                                    {request.mutualFriends} mutual friend{request.mutualFriends !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {safeDateDistance(request.createdAt)}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => acceptMutation.mutate(request.id)}
                                disabled={acceptMutation.isPending}
                                data-testid={`button-accept-${index}`}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => declineMutation.mutate(request.id)}
                                disabled={declineMutation.isPending}
                                data-testid={`button-decline-${index}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </section>

              {/* Sent Requests Section */}
              <section>
                <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <UserPlus className="h-5 w-5" />
                  Sent Requests
                  {pendingSent.length > 0 && (
                    <Badge variant="secondary">{pendingSent.length}</Badge>
                  )}
                </h2>

                <div className="space-y-4">
                  {sentLoading ? (
                    <>
                      <Card className="p-6">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/3" />
                          </div>
                        </div>
                      </Card>
                    </>
                  ) : pendingSent.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">No pending sent requests</p>
                    </Card>
                  ) : (
                    pendingSent.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-6" data-testid={`sent-card-${index}`}>
                          <div className="flex items-center gap-4">
                            <Link href={`/profile/${request.receiver?.username || request.receiverId}`}>
                              <Avatar className="h-12 w-12 cursor-pointer hover-elevate">
                                <AvatarImage src={request.receiver?.profileImage || undefined} />
                                <AvatarFallback>
                                  {request.receiver?.name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            </Link>

                            <div className="flex-1">
                              <Link href={`/profile/${request.receiver?.username || request.receiverId}`}>
                                <h3 className="font-semibold hover:underline cursor-pointer">
                                  {request.receiver?.name || 'Unknown'}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                Request sent {safeDateDistance(request.createdAt)}
                              </p>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelMutation.mutate(request.id)}
                              disabled={cancelMutation.isPending}
                              data-testid={`button-cancel-${index}`}
                            >
                              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Request'}
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}

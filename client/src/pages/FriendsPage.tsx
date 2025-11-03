import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserCheck } from "lucide-react";
import { Link } from "wouter";
import { MutualFriends } from "@/components/MutualFriends";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ["/api/friends"],
  });

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/friends/requests"],
  });

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/friends/suggestions"],
  });

  const acceptRequest = useMutation({
    mutationFn: async (requestId: number) =>
      apiRequest("POST", `/api/friends/accept/${requestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({ title: "Friend request accepted!" });
    },
  });

  const declineRequest = useMutation({
    mutationFn: async (requestId: number) =>
      apiRequest("POST", `/api/friends/decline/${requestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({ title: "Friend request declined" });
    },
  });

  const sendRequest = useMutation({
    mutationFn: async (userId: number) =>
      apiRequest("POST", `/api/friends/request/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/suggestions"] });
      toast({ title: "Friend request sent!" });
    },
  });

  return (
    <SelfHealingErrorBoundary pageName="Friends" fallbackRoute="/feed">
    <PageLayout title="Friends" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" data-testid="tab-all-friends">
              <Users className="h-4 w-4 mr-2" />
              All Friends
              {friends && Array.isArray(friends) && (
                <Badge variant="secondary" className="ml-2">{friends.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              <UserPlus className="h-4 w-4 mr-2" />
              Requests
              {requests && Array.isArray(requests) && requests.length > 0 && (
                <Badge variant="destructive" className="ml-2">{requests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" data-testid="tab-suggestions">
              <UserCheck className="h-4 w-4 mr-2" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          {/* All Friends Tab */}
          <TabsContent value="all">
            {friendsLoading ? (
              <div className="text-center py-12">Loading friends...</div>
            ) : friends && Array.isArray(friends) && friends.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {friends.map((friend: any) => (
                  <Card key={friend.id} className="hover-elevate" data-testid={`friend-card-${friend.id}`}>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={friend.profileImage} />
                        <AvatarFallback>{friend.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link href={`/profile/${friend.username}`}>
                          <h3 className="font-semibold hover:underline">{friend.name}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">@{friend.username}</p>
                        {user && <MutualFriends userId={friend.id} currentUserId={user.id} />}
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-message-${friend.id}`}>
                        Message
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No friends yet. Start connecting!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Friend Requests Tab */}
          <TabsContent value="requests">
            {requestsLoading ? (
              <div className="text-center py-12">Loading requests...</div>
            ) : requests && Array.isArray(requests) && requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request: any) => (
                  <Card key={request.id} data-testid={`request-card-${request.id}`}>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={request.profileImage} />
                        <AvatarFallback>{request.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{request.name}</h3>
                        <p className="text-sm text-muted-foreground">@{request.username}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          data-testid={`button-accept-${request.id}`}
                          onClick={() => acceptRequest.mutate(request.id)}
                          disabled={acceptRequest.isPending}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          data-testid={`button-decline-${request.id}`}
                          onClick={() => declineRequest.mutate(request.id)}
                          disabled={declineRequest.isPending}
                        >
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <UserPlus className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No pending friend requests</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions">
            {suggestionsLoading ? (
              <div className="text-center py-12">Loading suggestions...</div>
            ) : suggestions && Array.isArray(suggestions) && suggestions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {suggestions.map((suggestion: any) => (
                  <Card key={suggestion.id} className="hover-elevate" data-testid={`suggestion-card-${suggestion.id}`}>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={suggestion.profileImage} />
                        <AvatarFallback>{suggestion.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{suggestion.name}</h3>
                        <p className="text-sm text-muted-foreground">@{suggestion.username}</p>
                        {suggestion.reason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {suggestion.reason}
                          </p>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        data-testid={`button-add-${suggestion.id}`}
                        onClick={() => sendRequest.mutate(suggestion.id)}
                        disabled={sendRequest.isPending}
                      >
                        Add Friend
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <UserCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No suggestions at the moment</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </PageLayout>
    </SelfHealingErrorBoundary>);
}

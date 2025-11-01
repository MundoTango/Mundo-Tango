import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Clock, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/PageLayout";

interface Friend {
  id: number;
  name: string;
  username: string;
  profileImage?: string;
  bio?: string;
  mutualFriends?: number;
}

interface FriendRequest {
  id: number;
  senderId: number;
  sender: Friend;
  status: string;
  createdAt: string;
}

export default function FriendsListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: friends = [], isLoading: loadingFriends } = useQuery<Friend[]>({
    queryKey: ["/api/friends"],
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery<FriendRequest[]>({
    queryKey: ["/api/friends/requests"],
  });

  const { data: suggestions = [], isLoading: loadingSuggestions } = useQuery<Friend[]>({
    queryKey: ["/api/friends/suggestions"],
  });

  const sendRequestMutation = useMutation({
    mutationFn: (userId: number) => apiRequest(`/api/friends/request/${userId}`, "POST"),
    onSuccess: () => {
      toast({ title: "Friend request sent" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/suggestions"] });
    },
    onError: () => {
      toast({ title: "Failed to send request", variant: "destructive" });
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: (requestId: number) => apiRequest(`/api/friends/requests/${requestId}/accept`, "POST"),
    onSuccess: () => {
      toast({ title: "Friend request accepted" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
    },
    onError: () => {
      toast({ title: "Failed to accept request", variant: "destructive" });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (requestId: number) => apiRequest(`/api/friends/requests/${requestId}/reject`, "POST"),
    onSuccess: () => {
      toast({ title: "Request rejected" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
    },
    onError: () => {
      toast({ title: "Failed to reject request", variant: "destructive" });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: (friendId: number) => apiRequest(`/api/friends/${friendId}`, "DELETE"),
    onSuccess: () => {
      toast({ title: "Friend removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
    onError: () => {
      toast({ title: "Failed to remove friend", variant: "destructive" });
    },
  });

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const FriendCard = ({ friend, showAddButton = false }: { friend: Friend; showAddButton?: boolean }) => (
    <Card className="p-4" data-testid={`card-friend-${friend.id}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={friend.profileImage} />
            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold" data-testid={`text-friend-name-${friend.id}`}>
              {friend.name}
            </h3>
            <p className="text-sm text-muted-foreground">@{friend.username}</p>
            {friend.mutualFriends !== undefined && friend.mutualFriends > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {friend.mutualFriends} mutual friend{friend.mutualFriends !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        {showAddButton ? (
          <Button
            size="sm"
            onClick={() => sendRequestMutation.mutate(friend.id)}
            disabled={sendRequestMutation.isPending}
            data-testid={`button-add-friend-${friend.id}`}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add Friend
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeFriendMutation.mutate(friend.id)}
            disabled={removeFriendMutation.isPending}
            data-testid={`button-remove-friend-${friend.id}`}
          >
            Remove
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <PageLayout title="Friends" showBreadcrumbs>
<div className="container max-w-4xl mx-auto p-6" data-testid="page-friends">
      <div className="mb-6">
        
        <p className="text-muted-foreground">Manage your tango connections</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-friends"
          />
        </div>
      </div>

      <Tabs defaultValue="all" data-testid="tabs-friends">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" data-testid="tab-all-friends">
            <Users className="h-4 w-4 mr-2" />
            All Friends
            {friends.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {friends.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" data-testid="tab-requests">
            <Clock className="h-4 w-4 mr-2" />
            Requests
            {requests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {requests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="suggestions" data-testid="tab-suggestions">
            <UserPlus className="h-4 w-4 mr-2" />
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-6">
          {loadingFriends ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading friends...</p>
            </Card>
          ) : filteredFriends.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? "No friends found matching your search" : "No friends yet"}
              </p>
            </Card>
          ) : (
            filteredFriends.map((friend) => <FriendCard key={friend.id} friend={friend} />)
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-3 mt-6">
          {loadingRequests ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading requests...</p>
            </Card>
          ) : requests.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No pending friend requests</p>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="p-4" data-testid={`card-request-${request.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.sender.profileImage} />
                      <AvatarFallback>{request.sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{request.sender.name}</h3>
                      <p className="text-sm text-muted-foreground">@{request.sender.username}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptRequestMutation.mutate(request.id)}
                      disabled={acceptRequestMutation.isPending}
                      data-testid={`button-accept-${request.id}`}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectRequestMutation.mutate(request.id)}
                      disabled={rejectRequestMutation.isPending}
                      data-testid={`button-reject-${request.id}`}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-3 mt-6">
          {loadingSuggestions ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading suggestions...</p>
            </Card>
          ) : suggestions.length === 0 ? (
            <Card className="p-8 text-center">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No friend suggestions available</p>
            </Card>
          ) : (
            suggestions.map((friend) => <FriendCard key={friend.id} friend={friend} showAddButton />)
          )}
        </TabsContent>
      </Tabs>
    </div>
    </PageLayout>);
}

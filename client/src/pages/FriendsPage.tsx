import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
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
import { motion } from "framer-motion";
import tangoHeroImage from "@assets/tango-professional-1.jpg";

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
      <SEO
        title="Friends | Mundo Tango"
        description="Manage your tango network. View friends, accept requests, discover suggestions, and connect with dancers worldwide. Build your tango community."
      />
<div className="min-h-screen bg-background">
      {/* Editorial Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden"
        data-testid="section-hero"
      >
        <div className="absolute inset-0 aspect-video">
          <img
            src={tangoHeroImage}
            alt="Friends"
            className="w-full h-full object-cover"
            data-testid="img-hero"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              <Users className="w-3 h-3 mr-1.5" />
              Your Network
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6" data-testid="heading-page-title">
              Friends
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Connect with dancers from around the world
            </p>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto max-w-4xl px-4 py-16">
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

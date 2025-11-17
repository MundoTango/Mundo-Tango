import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { Search, UserPlus, UserMinus, MessageCircle, MoreVertical, Users, UserCheck, Clock, Mail, Heart } from "lucide-react";

const tangoHeroImage = "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=2070&auto=format&fit=crop";

interface Friend {
  id: number;
  friendId: number;
  name: string;
  username: string;
  profileImage?: string | null;
  city?: string | null;
  country?: string | null;
  closenessScore: number;
  lastInteractionAt?: string;
  tangoRoles?: string[];
  mutualFriends?: number;
  online?: boolean;
}

interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
  createdAt: string;
  sender?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
    city?: string | null;
    country?: string | null;
  };
  mutualFriends?: number;
}

interface FriendSuggestion {
  id: number;
  name: string;
  username: string;
  profileImage?: string | null;
  city?: string | null;
  country?: string | null;
  mutualFriends?: number;
  commonEvents?: number;
  tangoRoles?: string[];
}

export default function FriendsPrototypePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("closeness");

  // Fetch friends
  const { data: friends = [], isLoading: friendsLoading } = useQuery<Friend[]>({
    queryKey: ['/api/friends', user?.id],
    enabled: !!user,
  });

  // Fetch friend requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery<FriendRequest[]>({
    queryKey: ['/api/friends/requests', user?.id],
    enabled: !!user,
  });

  // Fetch suggestions
  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery<FriendSuggestion[]>({
    queryKey: ['/api/friends/suggestions', user?.id],
    enabled: !!user,
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest('POST', `/api/friends/request/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests'] });
      toast({
        title: "Friend request sent!",
        description: "Your friend request has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to send request",
        description: error.message || "Something went wrong",
      });
    },
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: async (friendId: number) => {
      return await apiRequest('DELETE', `/api/friends/${friendId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      toast({
        title: "Friend removed",
        description: "You are no longer friends with this person.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to remove friend",
        description: error.message || "Something went wrong",
      });
    },
  });

  // Filter and sort friends
  const filteredFriends = friends
    .filter(friend => 
      friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "closeness") {
        return (b.closenessScore || 0) - (a.closenessScore || 0);
      } else if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      } else if (sortBy === "recent") {
        const dateA = new Date(a.lastInteractionAt || 0).getTime();
        const dateB = new Date(b.lastInteractionAt || 0).getTime();
        return dateB - dateA;
      }
      return 0;
    });

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
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
            alt="Tango dancers connecting"
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
              Your Community
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6" data-testid="heading-page-title">
              Friends
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Connect with dancers worldwide
            </p>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto px-6 py-16">
        {/* Search & Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="pl-12 h-12 text-base"
              data-testid="input-search"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="closeness">Closeness Score</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="recent">Recent Activity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold mb-1" data-testid="text-friends-count">{friends.length}</div>
              <div className="text-sm text-muted-foreground">Friends</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-3xl font-bold mb-1" data-testid="text-requests-count">{pendingRequests.length}</div>
              <div className="text-sm text-muted-foreground">Pending Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <UserPlus className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-3xl font-bold mb-1" data-testid="text-suggestions-count">{suggestions.length}</div>
              <div className="text-sm text-muted-foreground">Suggestions</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="all" data-testid="tab-all">
              All Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              Requests ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="suggestions" data-testid="tab-suggestions">
              Suggestions ({suggestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {friendsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredFriends.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No friends yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start connecting with dancers around the world
                </p>
                <Button onClick={() => setActiveTab("suggestions")} data-testid="button-find-friends">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Find Friends
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFriends.map((friend, index) => (
                  <FriendCard 
                    key={friend.id} 
                    friend={friend} 
                    index={index}
                    onRemove={() => removeFriendMutation.mutate(friend.friendId)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {requestsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">
                  You're all caught up!
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRequests.map((request, index) => (
                  <RequestCard key={request.id} request={request} index={index} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            {suggestionsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : suggestions.length === 0 ? (
              <Card className="p-12 text-center">
                <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No suggestions</h3>
                <p className="text-muted-foreground">
                  Check back later for friend suggestions
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((suggestion, index) => (
                  <SuggestionCard 
                    key={suggestion.id} 
                    suggestion={suggestion} 
                    index={index}
                    onSendRequest={() => sendRequestMutation.mutate(suggestion.id)}
                    isPending={sendRequestMutation.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function FriendCard({ friend, index, onRemove }: { friend: Friend; index: number; onRemove: () => void }) {
  const closenessPercent = Math.min(100, (friend.closenessScore / 1000) * 100);
  const closenessColor = 
    friend.closenessScore >= 800 ? "text-green-500" :
    friend.closenessScore >= 500 ? "text-yellow-500" :
    "text-orange-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/friends/${friend.friendId}`}>
        <Card className="overflow-hidden hover-elevate cursor-pointer" data-testid={`friend-card-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={friend.profileImage || undefined} />
                  <AvatarFallback>{friend.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                {friend.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate" data-testid={`friend-name-${index}`}>{friend.name}</h3>
                <p className="text-sm text-muted-foreground truncate">@{friend.username}</p>
                {friend.tangoRoles && friend.tangoRoles.length > 0 && (
                  <Badge variant="outline" className="mt-2">
                    {friend.tangoRoles[0]}
                  </Badge>
                )}
              </div>
            </div>

            {/* Closeness Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Closeness</span>
                <span className={`text-sm font-bold ${closenessColor}`} data-testid={`closeness-score-${index}`}>
                  {friend.closenessScore}
                </span>
              </div>
              <Progress value={closenessPercent} className="h-2" />
            </div>

            <div className="text-sm text-muted-foreground space-y-1 mb-4">
              {(friend.city || friend.country) && (
                <div>{[friend.city, friend.country].filter(Boolean).join(', ')}</div>
              )}
              {friend.mutualFriends !== undefined && friend.mutualFriends > 0 && (
                <div>{friend.mutualFriends} mutual friends</div>
              )}
            </div>

            <div className="flex gap-2">
              <Link href={`/friends/${friend.friendId}`} className="flex-1">
                <Button variant="outline" className="w-full" size="sm" data-testid={`button-view-profile-${index}`}>
                  <Heart className="w-4 h-4 mr-2" />
                  View
                </Button>
              </Link>
              <Link href={`/messages/${friend.friendId}`}>
                <Button variant="outline" size="sm" data-testid={`button-message-${index}`}>
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove();
                }}
                data-testid={`button-remove-${index}`}
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function RequestCard({ request, index }: { request: FriendRequest; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href="/friends/requests">
        <Card className="overflow-hidden hover-elevate cursor-pointer" data-testid={`request-card-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={request.sender?.profileImage || undefined} />
                <AvatarFallback>{request.sender?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{request.sender?.name}</h3>
                <p className="text-sm text-muted-foreground truncate">@{request.sender?.username}</p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-1 mb-4">
              {(request.sender?.city || request.sender?.country) && (
                <div>{[request.sender?.city, request.sender?.country].filter(Boolean).join(', ')}</div>
              )}
              {request.mutualFriends !== undefined && request.mutualFriends > 0 && (
                <div>{request.mutualFriends} mutual friends</div>
              )}
            </div>

            <Button className="w-full" size="sm" data-testid={`button-view-request-${index}`}>
              <UserCheck className="w-4 h-4 mr-2" />
              View Request
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function SuggestionCard({ suggestion, index, onSendRequest, isPending }: { 
  suggestion: FriendSuggestion; 
  index: number;
  onSendRequest: () => void;
  isPending: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover-elevate" data-testid={`suggestion-card-${index}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={suggestion.profileImage || undefined} />
              <AvatarFallback>{suggestion.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{suggestion.name}</h3>
              <p className="text-sm text-muted-foreground truncate">@{suggestion.username}</p>
              {suggestion.tangoRoles && suggestion.tangoRoles.length > 0 && (
                <Badge variant="outline" className="mt-2">
                  {suggestion.tangoRoles[0]}
                </Badge>
              )}
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1 mb-4">
            {(suggestion.city || suggestion.country) && (
              <div>{[suggestion.city, suggestion.country].filter(Boolean).join(', ')}</div>
            )}
            {suggestion.mutualFriends !== undefined && suggestion.mutualFriends > 0 && (
              <div>{suggestion.mutualFriends} mutual friends</div>
            )}
            {suggestion.commonEvents !== undefined && suggestion.commonEvents > 0 && (
              <div>{suggestion.commonEvents} common events</div>
            )}
          </div>

          <Button 
            className="w-full" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSendRequest();
            }}
            disabled={isPending}
            data-testid={`button-add-friend-${index}`}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isPending ? 'Sending...' : 'Add Friend'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

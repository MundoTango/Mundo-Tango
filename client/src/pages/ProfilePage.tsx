import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Settings, UserPlus, UserMinus, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  profileImage?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  role?: string;
}

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  visibility: string;
  createdAt: string;
  likes: number;
  userName: string;
  userProfileImage?: string;
}

export default function ProfilePage() {
  const [, params] = useRoute("/profile/:id");
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const profileId = params?.id ? parseInt(params.id) : currentUser?.id;

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["user", profileId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${profileId}`);
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    enabled: !!profileId,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["user-posts", profileId],
    queryFn: async () => {
      const res = await fetch(`/api/posts?userId=${profileId}&limit=50`);
      if (!res.ok) throw new Error("Failed to load posts");
      return res.json();
    },
    enabled: !!profileId,
  });

  // Fetch friends to check if already friends
  const { data: friends = [] } = useQuery<any[]>({
    queryKey: ['/api/friends'],
    enabled: !!(currentUser && profileId && currentUser.id !== profileId),
  });

  // Fetch friend requests to check if pending
  const { data: friendRequests = [] } = useQuery<any[]>({
    queryKey: ['/api/friends/requests'],
    enabled: !!(currentUser && profileId && currentUser.id !== profileId),
  });

  const isOwnProfile = currentUser?.id === profileId;
  
  // Check friendship status
  const isFriend = friends.some((f: any) => f.id === profileId);
  const hasPendingRequest = friendRequests.some(
    (r: any) => r.receiverId === profileId && r.status === 'pending'
  );

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/friends/request/${profileId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/friends/requests'] });
      await queryClient.refetchQueries({ queryKey: ['/api/friends/requests'] });
      toast({
        title: "Friend request sent!",
        description: `Request sent to ${user?.name}`,
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
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/friends/${profileId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      await queryClient.refetchQueries({ queryKey: ['/api/friends'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/friends/requests'] });
      toast({
        title: "Friend removed",
        description: `Removed ${user?.name} from friends`,
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

  if (userLoading || !user) {
    return (
      <SelfHealingErrorBoundary pageName="Profile" fallbackRoute="/feed">
        <SEO 
          title="Profile - Mundo Tango"
          description="View user profile on Mundo Tango"
        />
        <div className="container max-w-4xl mx-auto p-6 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Profile" fallbackRoute="/feed">
      <SEO 
        title={`${user.name} (@${user.username}) - Mundo Tango`}
        description={user.bio || `${user.name}'s profile on Mundo Tango`}
      />
      
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card data-testid="card-profile-header">
          <CardHeader>
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24" data-testid="avatar-profile">
                <AvatarImage src={user.profileImage || undefined} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold" data-testid="text-username">
                    {user.name}
                  </h1>
                  <span className="text-muted-foreground" data-testid="text-handle">
                    @{user.username}
                  </span>
                  {user.role === 'super_admin' && (
                    <Badge variant="default" data-testid="badge-role">
                      Super Admin
                    </Badge>
                  )}
                </div>
                
                {user.bio && (
                  <p className="text-muted-foreground" data-testid="text-bio">
                    {user.bio}
                  </p>
                )}
                
                {(user.city || user.country) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-location">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[user.city, user.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  {isOwnProfile ? (
                    <Button asChild data-testid="button-edit-profile">
                      <Link href="/profile/edit">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  ) : isFriend ? (
                    <Button 
                      variant="secondary"
                      onClick={() => removeFriendMutation.mutate()}
                      disabled={removeFriendMutation.isPending}
                      data-testid={`button-remove-friend-${profileId}`}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      {removeFriendMutation.isPending ? 'Removing...' : 'Remove Friend'}
                    </Button>
                  ) : hasPendingRequest ? (
                    <Button 
                      variant="secondary"
                      disabled
                      data-testid="button-request-pending"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Request Sent
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => sendFriendRequestMutation.mutate()}
                      disabled={sendFriendRequestMutation.isPending}
                      data-testid={`button-add-friend-${profileId}`}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {sendFriendRequestMutation.isPending ? 'Sending...' : 'Add Friend'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Posts Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold" data-testid="text-posts-title">
            {isOwnProfile ? 'Your Posts' : 'Posts'}
          </h2>
          
          {postsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : posts.length === 0 ? (
            <Card data-testid="card-no-posts">
              <CardContent className="py-12 text-center text-muted-foreground">
                {isOwnProfile 
                  ? "You haven't posted anything yet. Share your tango journey!" 
                  : "No posts yet."}
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} data-testid={`card-post-${post.id}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.userProfileImage || undefined} />
                      <AvatarFallback>
                        {post.userName?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="whitespace-pre-wrap" data-testid={`text-post-content-${post.id}`}>
                    {post.content}
                  </p>
                  
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt="Post image" 
                      className="rounded-lg w-full object-cover max-h-96"
                      data-testid={`img-post-${post.id}`}
                    />
                  )}
                  
                  {post.videoUrl && (
                    <video 
                      src={post.videoUrl} 
                      controls 
                      className="rounded-lg w-full max-h-96"
                      data-testid={`video-post-${post.id}`}
                    />
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{post.likes || 0} likes</span>
                    <Badge variant="secondary">{post.visibility}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}

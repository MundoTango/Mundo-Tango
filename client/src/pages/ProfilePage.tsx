import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Settings, UserPlus, UserMinus, UserCheck, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";

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
        <div className="space-y-8">
          <Skeleton className="h-[60vh] w-full" />
          <div className="max-w-5xl mx-auto px-6 py-12">
            <Skeleton className="h-32 w-full mb-6" />
            <Skeleton className="h-32 w-full" />
          </div>
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
      
      {/* Hero Section with Profile Cover (16:9) */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1600&auto=format&fit=crop')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-end h-full px-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center space-y-6"
          >
            <Avatar className="h-32 w-32 mx-auto border-4 border-white/20 shadow-2xl" data-testid="avatar-profile">
              <AvatarImage src={user.profileImage || undefined} />
              <AvatarFallback className="text-4xl bg-primary/20 backdrop-blur-sm">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <h1 className="text-4xl md:text-5xl font-serif text-white font-bold" data-testid="text-username">
                  {user.name}
                </h1>
                {user.role === 'super_admin' && (
                  <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-role">
                    Super Admin
                  </Badge>
                )}
              </div>
              
              <p className="text-lg text-white/80" data-testid="text-handle">
                @{user.username}
              </p>
              
              {user.bio && (
                <p className="text-lg text-white/90 max-w-2xl mx-auto" data-testid="text-bio">
                  {user.bio}
                </p>
              )}
              
              {(user.city || user.country) && (
                <div className="flex items-center justify-center gap-2 text-white/80" data-testid="text-location">
                  <MapPin className="h-5 w-5" />
                  <span className="text-base">
                    {[user.city, user.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              
              <div className="flex justify-center gap-3 pt-4">
                {isOwnProfile ? (
                  <Button asChild variant="outline" className="gap-2 text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20" data-testid="button-edit-profile">
                    <Link href="/profile/edit">
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Link>
                  </Button>
                ) : isFriend ? (
                  <Button 
                    variant="outline"
                    className="gap-2 text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                    onClick={() => removeFriendMutation.mutate()}
                    disabled={removeFriendMutation.isPending}
                    data-testid={`button-remove-friend-${profileId}`}
                  >
                    <UserMinus className="h-4 w-4" />
                    {removeFriendMutation.isPending ? 'Removing...' : 'Remove Friend'}
                  </Button>
                ) : hasPendingRequest ? (
                  <Button 
                    variant="outline"
                    className="gap-2 text-white border-white/30 bg-white/10 backdrop-blur-sm"
                    disabled
                    data-testid="button-request-pending"
                  >
                    <UserCheck className="h-4 w-4" />
                    Request Sent
                  </Button>
                ) : (
                  <Button 
                    className="gap-2 text-white bg-primary/80 backdrop-blur-sm hover:bg-primary"
                    onClick={() => sendFriendRequestMutation.mutate()}
                    disabled={sendFriendRequestMutation.isPending}
                    data-testid={`button-add-friend-${profileId}`}
                  >
                    <UserPlus className="h-4 w-4" />
                    {sendFriendRequestMutation.isPending ? 'Sending...' : 'Add Friend'}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <motion.h2 
          className="text-3xl md:text-4xl font-serif font-bold" 
          data-testid="text-posts-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {isOwnProfile ? 'Your Posts' : 'Posts'}
        </motion.h2>
        
        {postsLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden" data-testid="card-no-posts">
              <CardContent className="py-16 text-center">
                <p className="text-lg text-muted-foreground">
                  {isOwnProfile 
                    ? "You haven't posted anything yet. Share your tango journey!" 
                    : "No posts yet."}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-post-${post.id}`}>
                  {(post.imageUrl || post.videoUrl) && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {post.imageUrl && (
                        <motion.img 
                          src={post.imageUrl} 
                          alt="Post image" 
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6 }}
                          data-testid={`img-post-${post.id}`}
                        />
                      )}
                      
                      {post.videoUrl && (
                        <video 
                          src={post.videoUrl} 
                          controls 
                          className="w-full h-full object-cover"
                          data-testid={`video-post-${post.id}`}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </div>
                  )}
                  
                  <CardHeader className="p-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={post.userProfileImage || undefined} />
                        <AvatarFallback>
                          {post.userName?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-base">{post.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-6 pb-6 space-y-4">
                    <p className="text-base leading-relaxed whitespace-pre-wrap" data-testid={`text-post-content-${post.id}`}>
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes || 0} likes</span>
                      </div>
                      <Badge variant="secondary" className="capitalize">{post.visibility}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </SelfHealingErrorBoundary>
  );
}

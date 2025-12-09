import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";
import { 
  Users, Calendar, MessageCircle, Heart, MapPin, 
  ChevronRight, BookOpen, Camera, Music, Briefcase, 
  Mic2, Home, ImageIcon, Plane, Filter, Clock
} from "lucide-react";
import { safeDateDistance, safeDateFormat } from "@/lib/safeDateFormat";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  profileImage?: string | null;
  backgroundImage?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  role?: string;
  tangoRoles?: string[] | null;
  yearsOfDancing?: number;
}

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  likes: number;
  userId: number;
  userName: string;
  userProfileImage?: string;
}

interface SharedMedia {
  id: number;
  url: string;
  type: 'image' | 'video';
  createdAt: string;
  location?: string;
  postId?: number;
}

interface SharedEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  city?: string;
  imageUrl?: string;
}

export default function FriendshipPage() {
  const { userId } = useParams<{ userId: string }>();
  const friendId = parseInt(userId || "0");
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("memory");
  const [feedFilter, setFeedFilter] = useState<"all" | "our" | "liked" | "commented">("all");

  const { data: friendData, isLoading: isLoadingFriend } = useQuery({
    queryKey: ["/api/users", friendId],
    enabled: !!friendId,
  });

  const { data: currentUserData } = useQuery({
    queryKey: ["/api/users", currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const { data: friendshipStats } = useQuery<{
    daysSinceFriendship: number;
    closenessScore: number;
    sharedEvents: number;
    sharedGroups: number;
    lastInteraction: string | null;
    firstMetAt?: string | null;
    metLocation?: string | null;
    ourStory?: string | null;
  }>({
    queryKey: ["/api/friends/friendship", friendId, "stats"],
    enabled: !!friendId,
  });

  const { data: sharedPosts = [], isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ["/api/friends/shared/posts", friendId, feedFilter],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/friends/shared/${friendId}/posts?filter=${feedFilter}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!friendId && activeTab === "memory",
  });

  const { data: sharedMedia = [], isLoading: isLoadingMedia } = useQuery<SharedMedia[]>({
    queryKey: ["/api/friends/shared/media", friendId],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/friends/shared/${friendId}/media`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!friendId && activeTab === "media",
  });

  const { data: sharedEvents = [], isLoading: isLoadingEvents } = useQuery<SharedEvent[]>({
    queryKey: ["/api/friends/shared/events", friendId],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/friends/shared/${friendId}/events`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!friendId && activeTab === "events",
  });

  if (isLoadingFriend) {
    return (
      <AppLayout>
        <LoadingFallback />
      </AppLayout>
    );
  }

  const friend = friendData?.user as User | undefined;
  const me = currentUserData?.user as User | undefined;

  const roleIconMap: Record<string, any> = {
    'teacher': { icon: BookOpen, label: 'Teacher' },
    'dancer': { icon: Users, label: 'Dancer' },
    'dj': { icon: Music, label: 'DJ' },
    'photographer': { icon: Camera, label: 'Photographer' },
    'organizer': { icon: Home, label: 'Organizer' },
    'performer': { icon: Mic2, label: 'Performer' },
    'vendor': { icon: Briefcase, label: 'Vendor' },
  };

  const ProfileCard = ({ user, side }: { user: User | undefined; side: 'left' | 'right' }) => (
    <motion.div 
      initial={{ opacity: 0, x: side === 'left' ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className={`w-full md:w-[340px] ${side === 'left' ? 'md:mr-auto' : 'md:ml-auto'}`}
    >
      <Card className="bg-background/95 backdrop-blur-md border-white/20 overflow-hidden" data-testid={`card-profile-${side}`}>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Avatar className="w-20 h-20 border-2 border-border">
              <AvatarImage src={user?.profileImage || undefined} alt={user?.name} />
              <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('') || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate" data-testid={`text-name-${side}`}>
                {user?.name || 'Loading...'}
              </h3>
              <p className="text-sm text-muted-foreground truncate">@{user?.username}</p>
              {user?.city && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {user.city}{user.country ? `, ${user.country}` : ''}
                </p>
              )}
            </div>
          </div>
          
          {user?.bio && (
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{user.bio}</p>
          )}

          {user?.tangoRoles && user.tangoRoles.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              <TooltipProvider>
                {user.tangoRoles.slice(0, 4).map((role, index) => {
                  const roleKey = role.toLowerCase();
                  const roleInfo = roleIconMap[roleKey];
                  const Icon = roleInfo?.icon || Briefcase;
                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded-lg bg-muted border border-border cursor-help">
                          <Icon className="w-3 h-3" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{roleInfo?.label || role}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <Link href={`/profile/${user?.username || user?.id}`}>
              <Button variant="outline" size="sm" className="w-full gap-2" data-testid={`button-view-profile-${side}`}>
                View Full Profile
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <AppLayout>
      {/* Split Cover Photo Hero Section */}
      <div className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden">
        {/* Split Cover Images */}
        <div className="absolute inset-0 flex">
          {/* Left Half - Current User */}
          <div className="w-1/2 h-full relative overflow-hidden">
            <img
              src={me?.backgroundImage || 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&auto=format&fit=crop'}
              alt={`${me?.name || 'Your'} cover`}
              className="absolute inset-0 w-full h-full object-cover"
              data-testid="img-cover-left"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </div>
          
          {/* Right Half - Friend */}
          <div className="w-1/2 h-full relative overflow-hidden">
            <img
              src={friend?.backgroundImage || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop'}
              alt={`${friend?.name || 'Friend'} cover`}
              className="absolute inset-0 w-full h-full object-cover"
              data-testid="img-cover-right"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent" />
          </div>
          
          {/* Center Divider with Heart */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg"
            >
              <Heart className="w-8 h-8 text-white fill-white" />
            </motion.div>
          </div>
        </div>
        
        {/* Dark Bottom Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent" />

        {/* Connection Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <Card className="bg-background/90 backdrop-blur-lg border-white/20">
            <CardContent className="flex items-center gap-8 px-8 py-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{friendshipStats?.closenessScore || 0}</p>
                <p className="text-xs text-muted-foreground">Closeness</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold">{friendshipStats?.daysSinceFriendship || 0}</p>
                <p className="text-xs text-muted-foreground">Days Connected</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold">{friendshipStats?.sharedEvents || 0}</p>
                <p className="text-xs text-muted-foreground">Shared Events</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dual Profile Cards Section */}
      <div className="relative z-10 -mt-32 px-6 pb-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 justify-between items-start">
          <ProfileCard user={me} side="left" />
          <ProfileCard user={friend} side="right" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-center gap-4">
        <Button size="lg" className="gap-2" asChild data-testid="button-send-message">
          <Link href={`/messages?to=${friendId}`}>
            <MessageCircle className="w-5 h-5" />
            Send Message
          </Link>
        </Button>
      </div>

      {/* Our Story Section */}
      {(friendshipStats?.ourStory || friendshipStats?.metLocation) && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card className="overflow-hidden" data-testid="card-our-story">
            <CardContent className="p-8">
              <h3 className="text-2xl font-serif font-bold mb-4 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                Our Story
              </h3>
              {friendshipStats?.ourStory && (
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {friendshipStats.ourStory}
                </p>
              )}
              {friendshipStats?.metLocation && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  We met at: {friendshipStats.metLocation}
                </p>
              )}
              {friendshipStats?.firstMetAt && (
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4" />
                  First met: {safeDateFormat(friendshipStats.firstMetAt, 'MMMM d, yyyy')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabbed Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start mb-8 bg-muted/50" data-testid="tabs-friendship">
            <TabsTrigger value="memory" className="gap-2" data-testid="tab-memory">
              <BookOpen className="w-4 h-4" />
              Memory Feed
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-2" data-testid="tab-media">
              <ImageIcon className="w-4 h-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2" data-testid="tab-events">
              <Plane className="w-4 h-4" />
              Events & Travel
            </TabsTrigger>
          </TabsList>

          {/* Memory Feed Tab */}
          <TabsContent value="memory" className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={feedFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFeedFilter("all")}
                data-testid="filter-all"
              >
                <Filter className="w-4 h-4 mr-2" />
                All Posts
              </Button>
              <Button
                variant={feedFilter === "our" ? "default" : "outline"}
                size="sm"
                onClick={() => setFeedFilter("our")}
                data-testid="filter-our"
              >
                Our Posts
              </Button>
              <Button
                variant={feedFilter === "liked" ? "default" : "outline"}
                size="sm"
                onClick={() => setFeedFilter("liked")}
                data-testid="filter-liked"
              >
                <Heart className="w-4 h-4 mr-2" />
                Liked Together
              </Button>
              <Button
                variant={feedFilter === "commented" ? "default" : "outline"}
                size="sm"
                onClick={() => setFeedFilter("commented")}
                data-testid="filter-commented"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Commented Together
              </Button>
            </div>

            {isLoadingPosts ? (
              <div className="flex justify-center py-12">
                <LoadingFallback />
              </div>
            ) : sharedPosts.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No shared memories yet</h3>
                <p className="text-muted-foreground">
                  Posts you both interact with will appear here.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {sharedPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover-elevate" data-testid={`post-${post.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.userProfileImage} />
                          <AvatarFallback>{post.userName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{post.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {safeDateDistance(post.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm mb-3">{post.content}</p>
                          {post.imageUrl && (
                            <img 
                              src={post.imageUrl} 
                              alt="" 
                              className="rounded-lg max-h-80 object-cover w-full"
                            />
                          )}
                          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {post.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            {isLoadingMedia ? (
              <div className="flex justify-center py-12">
                <LoadingFallback />
              </div>
            ) : sharedMedia.length === 0 ? (
              <Card className="p-12 text-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No shared media yet</h3>
                <p className="text-muted-foreground">
                  Photos and videos you share will appear here.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sharedMedia.map((media) => (
                  <motion.div
                    key={media.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                    data-testid={`media-${media.id}`}
                  >
                    <img
                      src={media.url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Overlay with date/location */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white text-sm flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {safeDateFormat(media.createdAt, 'MMM d, yyyy')}
                        </p>
                        {media.location && (
                          <p className="text-white/80 text-xs flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3" />
                            {media.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Events & Travel Tab */}
          <TabsContent value="events" className="space-y-6">
            {isLoadingEvents ? (
              <div className="flex justify-center py-12">
                <LoadingFallback />
              </div>
            ) : sharedEvents.length === 0 ? (
              <Card className="p-12 text-center">
                <Plane className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No shared events yet</h3>
                <p className="text-muted-foreground">
                  Events and cities you visit together will appear here.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sharedEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover-elevate" data-testid={`event-${event.id}`}>
                    <div className="relative h-40">
                      <img
                        src={event.imageUrl || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&auto=format&fit=crop'}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-white font-bold text-lg">{event.title}</h4>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {safeDateFormat(event.date, 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.city || event.location}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

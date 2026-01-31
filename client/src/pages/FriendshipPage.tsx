import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Users, Calendar, MessageCircle, Heart, MapPin, UserCheck, ChevronRight, 
  ThumbsUp, MessageSquare, Plane, Building2, Loader2, AlertCircle, Music, 
  Award, BookOpen, Camera, Home, Mic2, Briefcase, CheckCircle, Image as ImageIcon,
  LayoutGrid
} from "lucide-react";
import { safeDateDistance, safeFormat } from "@/lib/safeDateFormat";
import { motion } from "framer-motion";
import { renderMentionPills } from "@/utils/renderMentionPills";
import { PostCreator } from "@/components/universal/PostCreator";
import { useToast } from "@/hooks/use-toast";
import { type PostItemData } from "@/components/feed/PostItem";
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";
import tangoHeroImage from "@assets/optimized/IMG_9144-optimized.jpg";
import { useTranslation } from "react-i18next";

interface UserProfile {
  id: number;
  name: string;
  username: string;
  profileImage?: string;
  backgroundImage?: string;
  bio?: string;
  city?: string;
  country?: string;
  role?: string;
  tangoRoles?: string[];
  yearsOfDancing?: number;
  leaderLevel?: number;
  followerLevel?: number;
}

interface SharedData {
  sharedPosts: PostItemData[];
  sharedLikes: Array<{ postId: number; postTitle: string; likedAt: string }>;
  sharedTravel: Array<{ city: string; country: string; startDate: string; endDate: string | null }>;
  sharedComments: Array<{ id: number; postId: number; content: string; createdAt: string }>;
  commonCities: Array<{ city: string; country: string; userStartDate: string; friendStartDate: string }>;
  sharedEventsDetails: Array<{ id: number; title: string; date: string; location: string }>;
  sharedMedia?: Array<{ id: number; url: string; type: 'image' | 'video'; postId?: number }>;
}

function formatEventDate(dateStr: string | undefined | null): string {
  if (!dateStr) return 'Date TBD';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Date TBD';
    return safeFormat(date, 'MMM d, yyyy');
  } catch {
    return 'Date TBD';
  }
}

interface FriendshipInfo {
  id: number;
  closenessScore: number;
  createdAt: string;
  lastInteractionAt?: string;
  friendRequest?: {
    id: number;
    senderId?: number;
    senderMessage?: string;
    receiverMessage?: string;
    senderPrivateNote?: string;
    receiverPrivateNote?: string;
    danceLocation?: string;
    danceStory?: string;
    didWeDance?: boolean;
    createdAt: string;
  };
}

const roleIconMap: Record<string, { icon: any; label: string }> = {
  'teacher': { icon: BookOpen, label: 'Teacher' },
  'dancer': { icon: Users, label: 'Dancer' },
  'dj': { icon: Music, label: 'DJ' },
  'photographer': { icon: Camera, label: 'Photographer' },
  'organizer': { icon: Home, label: 'Organizer' },
  'performer': { icon: Mic2, label: 'Performer' },
  'vendor': { icon: Briefcase, label: 'Vendor' },
  'musician': { icon: Music, label: 'Musician' },
};

function UserProfileCard({ user, side }: { user: UserProfile | undefined; side: 'left' | 'right' }) {
  if (!user) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: side === 'left' ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`absolute ${side === 'left' ? 'left-4 md:left-6' : 'right-4 md:right-6'} top-16 md:top-20 z-20`}
    >
      <Card className="p-4 md:p-5 w-full max-w-[280px] md:max-w-[320px] bg-background/95 backdrop-blur-md border-white/20">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <Link href={`/profile/${user.username || user.id}`}>
              <Avatar className="w-20 h-20 md:w-24 md:h-24 border-3 border-border shadow-lg cursor-pointer hover:scale-105 transition-transform">
                <AvatarImage src={user.profileImage || undefined} alt={user.name} />
                <AvatarFallback className="bg-primary/80 text-white text-lg font-bold">
                  {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/profile/${user.username || user.id}`}>
                <h2 className="text-base md:text-lg font-bold truncate hover:underline cursor-pointer" data-testid={`text-name-${side}`}>
                  {user.name}
                </h2>
              </Link>
              {user.role === 'super_admin' && (
                <Badge className="bg-primary text-white border-0 text-[10px]" data-testid={`badge-verified-${side}`}>
                  <CheckCircle className="w-2 h-2 mr-0.5" />
                  Verified
                </Badge>
              )}
            </div>
            
            <p className="text-muted-foreground text-xs font-medium" data-testid={`text-handle-${side}`}>
              @{user.username}
            </p>
            
            {user.bio && (
              <p className="text-xs line-clamp-2" data-testid={`text-bio-${side}`}>{user.bio}</p>
            )}
            
            {user.tangoRoles && user.tangoRoles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <TooltipProvider>
                  {user.tangoRoles.slice(0, 4).map((role, index) => {
                    const roleKey = role.toLowerCase();
                    const roleInfo = roleIconMap[roleKey];
                    const Icon = roleInfo?.icon || Briefcase;
                    
                    return (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <div className="p-1 rounded-md bg-muted border border-border cursor-help" data-testid={`icon-role-${side}-${role}`}>
                            <Icon className="w-3 h-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{roleInfo?.label || role.replace(/_/g, ' ')}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </div>
            )}

            {user.yearsOfDancing && user.yearsOfDancing > 0 && (
              <div className="bg-primary/10 border border-primary/30 rounded-md p-1.5 text-[10px]">
                <div className="flex items-center gap-1">
                  <Award className="w-2.5 h-2.5 text-primary" />
                  <span className="font-medium">
                    {user.yearsOfDancing} {user.yearsOfDancing === 1 ? 'yr' : 'yrs'} tango
                  </span>
                </div>
                {(user.leaderLevel || user.followerLevel) && (
                  <div className="mt-0.5 flex gap-2 text-[9px] text-muted-foreground">
                    {user.leaderLevel && user.leaderLevel > 0 && (
                      <span>L: Lvl {user.leaderLevel}</span>
                    )}
                    {user.followerLevel && user.followerLevel > 0 && (
                      <span>F: Lvl {user.followerLevel}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {(user.city || user.country) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{[user.city, user.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function FriendshipPage() {
  const { t } = useTranslation(['pages', 'common']);
  const { userId } = useParams<{ userId: string }>();
  const friendId = parseInt(userId || "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [postsSubTab, setPostsSubTab] = useState<string>("all");

  const { data: currentUserData } = useQuery<{ user: UserProfile }>({
    queryKey: ["/api/auth/me"],
  });

  const { data: friendData, isLoading: isLoadingFriend } = useQuery<UserProfile>({
    queryKey: ["/api/users", friendId],
    enabled: !!friendId,
  });

  const { data: mutualFriends, isLoading: isLoadingMutual } = useQuery<any[]>({
    queryKey: ["/api/friends/mutual", friendId],
    enabled: !!friendId,
  });

  const { data: friendshipInfo } = useQuery<FriendshipInfo>({
    queryKey: ["/api/friends/friendship", friendId],
    enabled: !!friendId,
  });

  const { data: friendshipStats } = useQuery<{
    daysSinceFriendship: number;
    closenessScore: number;
    sharedEvents: number;
    sharedGroups: number;
    lastInteraction: string;
  }>({
    queryKey: ["/api/friends/friendship", friendId, "stats"],
    enabled: !!friendId,
  });

  const { data: sharedData, isLoading: isLoadingSharedData, isError: isSharedDataError } = useQuery<SharedData>({
    queryKey: ["/api/friends/friendship", friendId, "shared-data"],
    enabled: !!friendId,
  });

  if (isLoadingFriend || isLoadingMutual) {
    return (
      <AppLayout>
        <LoadingFallback />
      </AppLayout>
    );
  }

  const currentUser = currentUserData?.user;
  const friend = friendData;

  console.log('[FriendshipPage] Debug:', { friendId, friendData, friend, isLoadingFriend });

  const friendshipDate = friendshipInfo?.createdAt 
    ? safeDateDistance(friendshipInfo.createdAt, { addSuffix: true })
    : "Recently";

  const sharedMedia = sharedData?.sharedMedia && sharedData.sharedMedia.length > 0 
    ? sharedData.sharedMedia 
    : sharedData?.sharedPosts?.filter(p => p.imageUrl).map(p => ({ id: p.id, url: p.imageUrl!, type: 'image' as const, postId: p.id })) || [];

  return (
    <AppLayout>
      {/* Hero Section - Full height with profile cards */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        {/* Split Cover Photos */}
        <div className="absolute inset-0 flex">
          <motion.div
            className="w-1/2 bg-cover bg-center relative"
            style={{ 
              backgroundImage: currentUser?.backgroundImage 
                ? `url(${currentUser.backgroundImage})` 
                : `url('${tangoHeroImage}')`
            }}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/70" />
          </motion.div>
          <motion.div
            className="w-1/2 bg-cover bg-center relative"
            style={{ 
              backgroundImage: friend?.backgroundImage 
                ? `url(${friend.backgroundImage})` 
                : `url('${tangoHeroImage}')`
            }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-black/50 to-black/70" />
          </motion.div>
        </div>

        {/* Center Heart Badge */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl border-4 border-background">
            <Heart className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground fill-primary-foreground" />
          </div>
          <Badge variant="secondary" className="mt-3 text-xs md:text-sm backdrop-blur-sm shadow-lg" data-testid="badge-friends-since">
            {t('pages:friendship.friendsSince', { date: friendshipDate, defaultValue: `Friends ${friendshipDate}` })}
          </Badge>
        </motion.div>

        {/* Profile Cards */}
        <UserProfileCard user={currentUser} side="left" />
        <UserProfileCard user={friend} side="right" />
      </div>

      {/* Metrics Bar - Just under hero */}
      <div className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50" data-testid="metric-closeness">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{friendshipStats?.closenessScore || 0}/100</p>
                <p className="text-xs text-muted-foreground">{t('pages:friendship.closeness', 'Closeness')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50" data-testid="metric-days">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{friendshipStats?.daysSinceFriendship || 0}</p>
                <p className="text-xs text-muted-foreground">{t('pages:friendship.daysAsFriends', 'Days as Friends')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50" data-testid="metric-events">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{friendshipStats?.sharedEvents || 0}</p>
                <p className="text-xs text-muted-foreground">{t('pages:friendship.sharedEvents', 'Shared Events')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50" data-testid="metric-mutual">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{mutualFriends?.length || 0}</p>
                <p className="text-xs text-muted-foreground">{t('pages:friendship.mutualFriends', 'Mutual Friends')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Our Tango Story Card */}
        {friendshipInfo?.friendRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Music className="w-5 h-5 text-primary" />
                  {t('pages:friendship.ourTangoStory', 'Our Tango Story')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {friendshipInfo.friendRequest.didWeDance && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Heart className="w-3 h-3 mr-1 fill-current" />
                    {t('pages:friendship.weDancedTogether', 'We danced together!')}
                  </Badge>
                )}
                
                {friendshipInfo.friendRequest.danceLocation && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('pages:friendship.whereWeMet', 'Where we met')}</p>
                    <p className="text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {friendshipInfo.friendRequest.danceLocation}
                    </p>
                  </div>
                )}
                
                {friendshipInfo.friendRequest.danceStory && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('pages:friendship.ourStory', 'Our story')}</p>
                    <p className="text-sm italic text-muted-foreground" data-testid="text-dance-story">
                      "{friendshipInfo.friendRequest.danceStory}"
                    </p>
                  </div>
                )}
                
                {friendshipInfo.friendRequest.senderMessage && (
                  <div className="border-l-2 border-primary/30 pl-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('pages:friendship.friendRequestMessage', 'Friend request message')}</p>
                    <p className="text-sm" data-testid="text-sender-message">
                      {friendshipInfo.friendRequest.senderMessage}
                    </p>
                  </div>
                )}
                
                {friendshipInfo.friendRequest.receiverMessage && (
                  <div className="border-l-2 border-primary/30 pl-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('pages:friendship.responseMessage', 'Response message')}</p>
                    <p className="text-sm" data-testid="text-receiver-message">
                      {friendshipInfo.friendRequest.receiverMessage}
                    </p>
                  </div>
                )}

                {(() => {
                  const userPrivateNote = currentUser?.id === friendshipInfo.friendRequest.senderId
                    ? friendshipInfo.friendRequest.senderPrivateNote
                    : friendshipInfo.friendRequest.receiverPrivateNote;
                  
                  return userPrivateNote ? (
                    <div className="border-l-2 border-primary/30 pl-3 bg-primary/5 p-3 rounded">
                      <p className="text-xs text-muted-foreground mb-1">{t('pages:friendship.yourPrivateMessage', 'Your private message')}</p>
                      <p className="text-sm italic" data-testid="text-private-note">
                        {userPrivateNote}
                      </p>
                    </div>
                  ) : null;
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs Section - Posts, Media, Location */}
        <Card>
          <CardContent className="pt-6">
            {isLoadingSharedData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">{t('pages:friendship.loadingSharedContent', 'Loading shared content...')}</span>
              </div>
            ) : (
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="posts" data-testid="tab-posts">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t('pages:friendship.tabPosts', 'Posts')}
                  </TabsTrigger>
                  <TabsTrigger value="media" data-testid="tab-media">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {t('pages:friendship.tabMedia', 'Media')}
                  </TabsTrigger>
                  <TabsTrigger value="location" data-testid="tab-location">
                    <MapPin className="w-4 h-4 mr-2" />
                    {t('pages:friendship.tabLocation', 'Location')}
                  </TabsTrigger>
                </TabsList>

                {/* Posts Tab */}
                <TabsContent value="posts" className="mt-6 space-y-6">
                  {/* PostCreator with auto-mentions */}
                  <PostCreator
                    onPostCreated={() => {
                      queryClient.invalidateQueries({ queryKey: ['/api/friends/friendship', friendId, 'shared-data'] });
                      toast({ title: "Posted!", description: "Your memory has been shared with your friend." });
                    }}
                    context={{ type: 'memory', name: friend?.name }}
                    initialContent={[
                      currentUser ? `@${currentUser.username || currentUser.name?.replace(/\s+/g, '_')}` : '',
                      friend ? `@${friend.username || friend.name?.replace(/\s+/g, '_')}` : ''
                    ].filter(Boolean).join(' ') + ' '}
                  />

                  {/* Sub-tabs: All, Posts & Mentions, Liked Together */}
                  <div className="flex gap-2 mb-4 flex-wrap" data-testid="posts-subtabs">
                    <Button 
                      size="sm" 
                      variant={postsSubTab === 'all' ? 'default' : 'outline'} 
                      onClick={() => setPostsSubTab('all')}
                      data-testid="subtab-all"
                    >
                      <LayoutGrid className="w-3 h-3 mr-1" />
                      {t('pages:friendship.subtabAll', 'All')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant={postsSubTab === 'posts' ? 'default' : 'outline'} 
                      onClick={() => setPostsSubTab('posts')}
                      data-testid="subtab-posts"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {t('pages:friendship.subtabPostsMentions', 'Posts & Mentions')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant={postsSubTab === 'liked' ? 'default' : 'outline'} 
                      onClick={() => setPostsSubTab('liked')}
                      data-testid="subtab-liked"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {t('pages:friendship.subtabLikedTogether', 'Liked Together')}
                    </Button>
                  </div>

                  {/* Shared Posts with @mentions - show in "all" and "posts" */}
                  {(postsSubTab === 'all' || postsSubTab === 'posts') && (
                    <div data-testid="shared-posts-list">
                      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        {t('pages:friendship.postsMentions', 'Posts & Mentions')}
                      </h3>
                      <UnifiedMemoriesFeed
                        posts={sharedData?.sharedPosts || []}
                        isLoading={false}
                        context={{ type: 'memory', name: friend?.name }}
                        showPostCreator={false}
                        showFilters={true}
                        emptyMessage="No shared posts yet. Create memories together!"
                      />
                    </div>
                  )}

                  {/* Shared Likes - show in "all" and "liked" */}
                  {(postsSubTab === 'all' || postsSubTab === 'liked') && (
                    <div>
                      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-primary" />
                        {t('pages:friendship.postsYouBothLiked', 'Posts You Both Liked')}
                      </h3>
                      {sharedData?.sharedLikes && sharedData.sharedLikes.length > 0 ? (
                        <div className="space-y-3">
                          {sharedData.sharedLikes.slice(0, 5).map((like, index) => (
                            <Link key={index} href={`/feed?post=${like.postId}`}>
                              <div className="flex items-center gap-4 p-3 border rounded-lg hover-elevate cursor-pointer" data-testid={`shared-like-${like.postId}`}>
                                <ThumbsUp className="w-4 h-4 text-primary" />
                                <p className="text-sm truncate flex-1">{like.postTitle || t('pages:friendship.untitledPost', 'Untitled post')}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-4 text-sm">{t('pages:friendship.noSharedLikesYet', 'No shared likes yet')}</p>
                      )}
                    </div>
                  )}

                  {/* Shared Comments - only show in "all" */}
                  {postsSubTab === 'all' && sharedData?.sharedComments && sharedData.sharedComments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        {t('pages:friendship.commentsOnEachOther', "Comments on Each Other's Content")}
                      </h3>
                      <div className="space-y-3">
                        {sharedData.sharedComments.slice(0, 5).map((comment) => (
                          <Link key={comment.id} href={`/feed?post=${comment.postId}`}>
                            <div className="flex items-start gap-4 p-3 border rounded-lg hover-elevate cursor-pointer" data-testid={`shared-comment-${comment.id}`}>
                              <MessageCircle className="w-4 h-4 text-primary mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm line-clamp-2">{comment.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {comment.createdAt ? safeDateDistance(comment.createdAt, { addSuffix: true }) : 'Recently'}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media" className="mt-6">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    {t('pages:friendship.sharedPhotosVideos', 'Shared Photos & Videos')}
                  </h3>
                  {sharedMedia.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {sharedMedia.map((media) => (
                        <Link key={media.id} href={media.postId ? `/feed?post=${media.postId}` : '#'}>
                          <div className="aspect-square rounded-lg overflow-hidden border hover-elevate cursor-pointer relative" data-testid={`shared-media-${media.id}`}>
                            {media.type === 'video' ? (
                              <>
                                <video 
                                  src={media.url} 
                                  className="w-full h-full object-cover"
                                  muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                                    <div className="w-0 h-0 border-l-[12px] border-l-primary border-y-[8px] border-y-transparent ml-1" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <img 
                                src={media.url} 
                                alt="Shared media" 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">{t('pages:friendship.noSharedMediaYet', 'No shared media yet')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('pages:friendship.photosWillAppear', 'Photos from shared posts will appear here')}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="location" className="mt-6 space-y-6">
                  {/* Shared Events */}
                  <div>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {t('pages:friendship.sharedEvents', 'Shared Events')}
                    </h3>
                    {sharedData?.sharedEventsDetails && sharedData.sharedEventsDetails.length > 0 ? (
                      <div className="space-y-3">
                        {sharedData.sharedEventsDetails.map((event) => (
                          <Link key={event.id} href={`/events/${event.id}`}>
                            <div className="flex items-center gap-4 p-4 border rounded-xl hover-elevate cursor-pointer" data-testid={`shared-event-${event.id}`}>
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{event.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatEventDate(event.date)} - {event.location || 'Location TBD'}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4 text-sm">{t('pages:friendship.noSharedEventsYet', 'No shared events yet')}</p>
                    )}
                  </div>

                  {/* Shared Travel */}
                  <div>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Plane className="w-4 h-4 text-primary" />
                      {t('pages:friendship.sharedTravel', 'Shared Travel')}
                    </h3>
                    {sharedData?.sharedTravel && sharedData.sharedTravel.length > 0 ? (
                      <div className="space-y-3">
                        {sharedData.sharedTravel.map((trip, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 border rounded-xl hover-elevate" data-testid={`shared-travel-${index}`}>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Plane className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold">{trip.city || 'Unknown city'}{trip.country ? `, ${trip.country}` : ''}</p>
                              <p className="text-sm text-muted-foreground">{t('pages:friendship.overlappingTravelDates', 'Overlapping travel dates')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4 text-sm">{t('pages:friendship.noSharedTravelYet', 'No shared travel yet')}</p>
                    )}
                  </div>

                  {/* Common Cities */}
                  <div>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      {t('pages:friendship.citiesWhereBothDanced', 'Cities Where You Both Danced')}
                    </h3>
                    {sharedData?.commonCities && sharedData.commonCities.length > 0 ? (
                      <div className="space-y-3">
                        {sharedData.commonCities.map((city, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 border rounded-xl hover-elevate" data-testid={`common-city-${index}`}>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold">{city.city || 'Unknown city'}{city.country ? `, ${city.country}` : ''}</p>
                              <p className="text-sm text-muted-foreground">{t('pages:friendship.bothDancedInCity', 'Both danced tango in this city')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4 text-sm">{t('pages:friendship.noCommonCitiesYet', 'No common cities yet')}</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Mutual Friends Section */}
        {mutualFriends && mutualFriends.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                {t('pages:friendship.mutualFriendsCount', { count: mutualFriends.length, defaultValue: `Mutual Friends (${mutualFriends.length})` })}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mutualFriends.map((mutualFriend: any) => (
                  <Link key={mutualFriend.id} href={`/profile/${mutualFriend.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 p-3 border rounded-lg hover-elevate cursor-pointer"
                      data-testid={`mutual-friend-${mutualFriend.id}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={mutualFriend.profileImage || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {mutualFriend.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{mutualFriend.name}</p>
                        <p className="text-xs text-muted-foreground truncate">@{mutualFriend.username}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-4">
          <Link href={`/messages/direct/${friendId}`}>
            <Button
              size="lg"
              className="gap-2"
              data-testid="button-send-message"
            >
              <MessageCircle className="w-5 h-5" />
              {t('pages:friendship.sendMessage', 'Send Message')}
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href={`/profile/${friendId}`}>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              data-testid="button-view-profile"
            >
              <Users className="w-5 h-5" />
              {t('pages:friendship.viewProfile', 'View Profile')}
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

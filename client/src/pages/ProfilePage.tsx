import { useState, useEffect } from "react";
import { useRoute, Link, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Settings, UserPlus, UserMinus, UserCheck, Plane, Calendar, CheckCircle, Instagram, Facebook, Twitter, Linkedin, Youtube, Globe, Award, Plus, Camera, Music, Users, ImageIcon, Mic2, Home, Briefcase, BookOpen, Heart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import ProfileTabsNav from "@/components/ProfileTabsNav";
import ProfileTabFeed from "@/components/profile/ProfileTabFeed";
import ProfileTabTravel from "@/components/profile/ProfileTabTravel";
import ProfileTabEvents from "@/components/profile/ProfileTabEvents";
import ProfileTabFriends from "@/components/profile/ProfileTabFriends";
import ProfileTabPhotos from "@/components/profile/ProfileTabPhotos";
import ProfileTabAbout from "@/components/profile/ProfileTabAbout";
import ProfileTabTeacher from "@/components/profile/ProfileTabTeacher";
import ProfileTabDJ from "@/components/profile/ProfileTabDJ";
import ProfileTabPhotographer from "@/components/profile/ProfileTabPhotographer";
import ProfileTabPerformer from "@/components/profile/ProfileTabPerformer";
import ProfileTabVendor from "@/components/profile/ProfileTabVendor";
import ProfileTabMusician from "@/components/profile/ProfileTabMusician";
import ProfileTabChoreographer from "@/components/profile/ProfileTabChoreographer";
import ProfileTabTangoSchool from "@/components/profile/ProfileTabTangoSchool";
import ProfileTabTangoHotel from "@/components/profile/ProfileTabTangoHotel";
import ProfileTabWellness from "@/components/profile/ProfileTabWellness";
import ProfileTabTourOperator from "@/components/profile/ProfileTabTourOperator";
import ProfileTabHostVenue from "@/components/profile/ProfileTabHostVenue";
import ProfileTabTangoGuide from "@/components/profile/ProfileTabTangoGuide";
import ProfileTabContentCreator from "@/components/profile/ProfileTabContentCreator";
import ProfileTabLearningResource from "@/components/profile/ProfileTabLearningResource";
import ProfileTabTaxiDancer from "@/components/profile/ProfileTabTaxiDancer";
import ProfileTabOrganizer from "@/components/profile/ProfileTabOrganizer";
import ProfileTabMemories from "@/components/profile/ProfileTabMemories";
import DashboardCustomerToggle from "@/components/profile/DashboardCustomerToggle";

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
  tangoRoles?: string[] | null;
  yearsOfDancing?: number;
  leaderLevel?: number;
  followerLevel?: number;
  languages?: string[] | null;
  createdAt?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    website?: string;
  } | null;
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
  const searchString = useSearch();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [viewMode, setViewMode] = useState<'dashboard' | 'customer'>('dashboard');
  
  // Read tab from URL query params (e.g., /profile?tab=memories)
  useEffect(() => {
    const urlParams = new URLSearchParams(searchString);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchString]);
  
  // Support both numeric ID and username - use username/ID from URL or current user's ID
  const profileIdentifier = params?.id || currentUser?.id?.toString();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["user", profileIdentifier],
    queryFn: async () => {
      const res = await fetch(`/api/users/${profileIdentifier}`);
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    enabled: !!profileIdentifier,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["user-posts", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/posts?userId=${user?.id}&limit=50`);
      if (!res.ok) throw new Error("Failed to load posts");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch friends to check if already friends
  const { data: friends = [] } = useQuery<any[]>({
    queryKey: ['/api/friends'],
    enabled: !!(currentUser && user && currentUser.id !== user.id),
  });

  // Fetch friend requests to check if pending
  const { data: friendRequests = [] } = useQuery<any[]>({
    queryKey: ['/api/friends/requests'],
    enabled: !!(currentUser && user && currentUser.id !== user.id),
  });

  // Fetch upcoming travel plans for this user
  const { data: upcomingTravel = [] } = useQuery<any[]>({
    queryKey: ['/api/travel/plans', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/travel/plans?userId=${user?.id}`);
      if (!res.ok) return [];
      const plans = await res.json();
      // Filter for upcoming trips only
      const now = new Date();
      return plans.filter((trip: any) => new Date(trip.startDate) > now).slice(0, 3);
    },
    enabled: !!user?.id,
  });

  const isOwnProfile = currentUser?.id === user?.id;
  
  // Check friendship status
  const isFriend = friends.some((f: any) => f.id === user?.id);
  const hasPendingRequest = friendRequests.some(
    (r: any) => r.receiverId === user?.id && r.status === 'pending'
  );

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/friends/request/${user?.id}`);
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
      return await apiRequest('DELETE', `/api/friends/${user?.id}`);
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
      
      {/* PART_4: Hero Profile Photo Section - Editorial Glassmorphic Design */}
      <div className="relative w-full h-[400px] overflow-hidden">
        {/* Profile Photo as Hero Image */}
        <img 
          src={user.profileImage || 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1600&auto=format&fit=crop'} 
          alt={`${user.name}'s profile`}
          className="w-full h-full object-cover"
          data-testid="img-hero-profile"
        />
        
        {/* Editorial Gradient Overlay (bottom 40%) */}
        <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black/80 via-black/60 to-transparent" />
        
        {/* Profile Photo & Action Buttons - Top Right */}
        <div className="absolute top-6 left-6 z-20 flex gap-3">
          {isOwnProfile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" className="text-white border-white/30 bg-black/20 backdrop-blur-sm hover:bg-black/30 absolute" style={{bottom: '80px'}} data-testid="button-upload-profile-photo">
                  <Camera className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Change Profile Photo</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Action Buttons - Top Right */}
        <div className="absolute top-6 right-6 z-20 flex gap-3">
          {isOwnProfile && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline" className="text-white border-white/30 bg-black/20 backdrop-blur-sm hover:bg-black/30" data-testid="button-upload-hero">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Change Hero Image</TooltipContent>
              </Tooltip>
              <Button asChild variant="outline" className="gap-2 text-white border-white/30 bg-black/20 backdrop-blur-sm hover:bg-black/30" data-testid="button-edit-profile">
                <Link href="/profile/edit">
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </>
          )}
          {!isOwnProfile && (
            <>
              {isFriend ? (
            <Button 
              variant="outline"
              className="gap-2 text-white border-white/30 bg-black/20 backdrop-blur-sm hover:bg-black/30"
              onClick={() => removeFriendMutation.mutate()}
              disabled={removeFriendMutation.isPending}
              data-testid={`button-remove-friend-${user.id}`}
            >
              <UserMinus className="h-4 w-4" />
              {removeFriendMutation.isPending ? 'Removing...' : 'Remove Friend'}
            </Button>
          ) : hasPendingRequest ? (
            <Button 
              variant="outline"
              className="gap-2 text-white border-white/30 bg-black/20 backdrop-blur-sm"
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
              data-testid={`button-add-friend-${user.id}`}
            >
              <UserPlus className="h-4 w-4" />
              {sendFriendRequestMutation.isPending ? 'Sending...' : 'Add Friend'}
            </Button>
          )}
        </div>
        
        {/* Glassmorphic User Info Card - Bottom Overlay */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 p-6 flex justify-center"
        >
          <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 rounded-t-2xl p-6 shadow-2xl max-w-2xl w-full">
            {/* Name & Verification */}
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg" data-testid="text-username">
                {user.name}
              </h1>
              {user.role === 'super_admin' && (
                <Badge className="bg-primary text-white border-0" data-testid="badge-verified">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            {/* Username */}
            <p className="text-white/90 text-sm mb-3 font-medium" data-testid="text-handle">@{user.username}</p>
            
            {/* Bio */}
            {user.bio && (
              <p className="text-white/80 text-sm mb-4" data-testid="text-bio">{user.bio}</p>
            )}
            
            {/* Tango Roles - Icons with Tooltips */}
            {user.tangoRoles && user.tangoRoles.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                <TooltipProvider>
                  {user.tangoRoles.map((role, index) => {
                    const roleIconMap: Record<string, any> = {
                      'teacher': { icon: BookOpen, label: 'Teacher' },
                      'dancer': { icon: Users, label: 'Dancer' },
                      'dj': { icon: Music, label: 'DJ' },
                      'photographer': { icon: Camera, label: 'Photographer' },
                      'organizer': { icon: Home, label: 'Organizer' },
                      'performer': { icon: Mic2, label: 'Performer' },
                      'vendor': { icon: Briefcase, label: 'Vendor' },
                      'musician': { icon: Music, label: 'Musician' },
                      'choreographer': { icon: Heart, label: 'Choreographer' },
                      'school': { icon: BookOpen, label: 'School' },
                      'hotel': { icon: Home, label: 'Hotel' },
                      'wellness': { icon: Heart, label: 'Wellness' },
                      'tour_operator': { icon: Plane, label: 'Tour Operator' },
                      'guide': { icon: MapPin, label: 'Guide' },
                      'content_creator': { icon: Camera, label: 'Content Creator' },
                    };
                    
                    const roleKey = role.toLowerCase();
                    const roleInfo = roleIconMap[roleKey];
                    const Icon = roleInfo?.icon || Briefcase;
                    
                    return (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <div className="p-1.5 rounded-lg bg-white/20 border border-white/30 backdrop-blur-sm cursor-help" data-testid={`icon-role-${role}`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{roleInfo?.label || role.replace(/_/g, ' ')}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </div>
            )}

            {/* Professional Score - Only show if yearsOfDancing > 0 */}
            {user.yearsOfDancing && user.yearsOfDancing > 0 && (
              <div className="bg-primary/20 border border-primary/30 rounded-lg p-3 backdrop-blur-sm mb-3" data-testid="section-professional-score">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-white">
                    {user.yearsOfDancing} {user.yearsOfDancing === 1 ? 'year' : 'years'} of tango experience
                  </span>
                </div>
                {(user.leaderLevel || user.followerLevel) && (
                  <div className="mt-2 flex gap-4 text-xs text-white/90">
                    {user.leaderLevel && user.leaderLevel > 0 && (
                      <span data-testid="text-leader-level">Leader: Level {user.leaderLevel}</span>
                    )}
                    {user.followerLevel && user.followerLevel > 0 && (
                      <span data-testid="text-follower-level">Follower: Level {user.followerLevel}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Social Links */}
            {user.socialLinks && Object.values(user.socialLinks).some(link => link) && (
              <div className="flex flex-wrap gap-3 mb-3" data-testid="section-social-links">
                {user.socialLinks.instagram && (
                  <a
                    href={user.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm transition-colors"
                    aria-label="Instagram"
                    data-testid="link-instagram"
                  >
                    <Instagram className="w-4 h-4 text-white" />
                  </a>
                )}
                {user.socialLinks.facebook && (
                  <a
                    href={user.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm transition-colors"
                    aria-label="Facebook"
                    data-testid="link-facebook"
                  >
                    <Facebook className="w-4 h-4 text-white" />
                  </a>
                )}
                {user.socialLinks.twitter && (
                  <a
                    href={user.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm transition-colors"
                    aria-label="Twitter"
                    data-testid="link-twitter"
                  >
                    <Twitter className="w-4 h-4 text-white" />
                  </a>
                )}
                {user.socialLinks.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm transition-colors"
                    aria-label="LinkedIn"
                    data-testid="link-linkedin"
                  >
                    <Linkedin className="w-4 h-4 text-white" />
                  </a>
                )}
                {user.socialLinks.youtube && (
                  <a
                    href={user.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm transition-colors"
                    aria-label="YouTube"
                    data-testid="link-youtube"
                  >
                    <Youtube className="w-4 h-4 text-white" />
                  </a>
                )}
                {user.socialLinks.website && (
                  <a
                    href={user.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm transition-colors"
                    aria-label="Website"
                    data-testid="link-website"
                  >
                    <Globe className="w-4 h-4 text-white" />
                  </a>
                )}
              </div>
            )}
            
            {/* Current Location */}
            {(user.city || user.country) && (
              <div className="flex items-center gap-2 text-white/80 text-sm" data-testid="text-location">
                <MapPin className="w-4 h-4" />
                <span>{[user.city, user.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <ProfileTabsNav
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOwnProfile={isOwnProfile}
      />

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Dashboard/Customer Toggle for Role Tabs */}
        {activeTab !== 'feed' && activeTab !== 'memories' && activeTab !== 'travel' && activeTab !== 'events' && 
         activeTab !== 'friends' && activeTab !== 'photos' && activeTab !== 'about' && (
          <DashboardCustomerToggle isOwnProfile={isOwnProfile} onViewChange={setViewMode} />
        )}

        {/* Feed Tab - Two Column Layout */}
        {activeTab === 'feed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Column - Feed */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8" data-testid="text-posts-title">
                {isOwnProfile ? 'Your Posts' : 'Posts'}
              </h2>
              <ProfileTabFeed posts={posts} isLoading={postsLoading} isOwnProfile={isOwnProfile} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Travel Section */}
              {upcomingTravel && upcomingTravel.length > 0 && (
                <Card className="sticky top-24" data-testid="card-upcoming-travel-sidebar">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Plane className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">Upcoming Travel</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingTravel.slice(0, 2).map((trip: any, index: number) => (
                        <div 
                          key={trip.id || index} 
                          className="p-3 bg-muted rounded-lg border border-border/50 hover-elevate"
                          data-testid={`trip-card-${index}`}
                        >
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm">{trip.city}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {upcomingTravel.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setActiveTab('travel')}
                          data-testid="button-view-all-travel"
                        >
                          See {upcomingTravel.length - 2} more trip{upcomingTravel.length - 2 !== 1 ? 's' : ''} →
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Face Photos Section - Encourage Users to Upload */}
              <Card data-testid="card-face-photos">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">Face Photos</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add face photos to your profile - people dance better when they know you!
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <div
                        key={index}
                        className="aspect-square bg-muted rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center hover:bg-muted/60 hover-elevate cursor-pointer transition-colors"
                        data-testid={`photo-slot-${index}`}
                      >
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                  {isOwnProfile && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => setActiveTab('photos')}
                      data-testid="button-upload-photos"
                    >
                      Upload Photos
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Memories Tab */}
        {activeTab === 'memories' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabMemories isOwnProfile={isOwnProfile} profileId={user.id} />
          </motion.div>
        )}

        {/* Travel Tab */}
        {activeTab === 'travel' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabTravel profileId={user.id} />
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabEvents />
          </motion.div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabFriends />
          </motion.div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabPhotos />
          </motion.div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabAbout user={user} isOwnProfile={isOwnProfile} />
          </motion.div>
        )}

        {/* Teacher Tab (Classes) */}
        {activeTab === 'classes' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabTeacher isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* DJ Tab (Music) */}
        {activeTab === 'music' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabDJ isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Photographer Tab (Gallery) */}
        {activeTab === 'gallery' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabPhotographer isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Organizer Tab (Events Organized) */}
        {activeTab === 'events-organized' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabOrganizer isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Performer Tab (Performances) */}
        {activeTab === 'performances' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabPerformer isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Vendor Tab (Shop) */}
        {activeTab === 'shop' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabVendor isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Musician Tab (Orchestra) */}
        {activeTab === 'orchestra' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabMusician isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Choreographer Tab (Choreographies) */}
        {activeTab === 'choreographies' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabChoreographer isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Tango School Tab (School) */}
        {activeTab === 'school' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabTangoSchool isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Tango Hotel Tab (Accommodation) */}
        {activeTab === 'accommodation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabTangoHotel isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Wellness Provider Tab (Wellness) */}
        {activeTab === 'wellness' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabWellness isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Tour Operator Tab (Tours) */}
        {activeTab === 'tours' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabTourOperator isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Host/Venue Tab (Venue) */}
        {activeTab === 'venue' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabHostVenue isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Tango Guide Tab (Guide Services) */}
        {activeTab === 'guide-services' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabTangoGuide isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Content Creator Tab (Content) */}
        {activeTab === 'content' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabContentCreator isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Learning Resource Tab (Resources) */}
        {activeTab === 'resources' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabLearningResource isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}

        {/* Taxi Dancer Tab (Taxi Services) */}
        {activeTab === 'taxi-services' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabTaxiDancer isOwnProfile={isOwnProfile} viewMode={viewMode} />
          </motion.div>
        )}
      </div>
    </SelfHealingErrorBoundary>
  );
}

import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Settings, UserPlus, UserMinus, UserCheck, Plane, Calendar, CheckCircle } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [viewMode, setViewMode] = useState<'dashboard' | 'customer'>('dashboard');
  
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

  // Fetch upcoming travel plans for this user
  const { data: upcomingTravel = [] } = useQuery<any[]>({
    queryKey: ['/api/travel/plans', profileId],
    queryFn: async () => {
      const res = await fetch(`/api/travel/plans?userId=${profileId}`);
      if (!res.ok) return [];
      const plans = await res.json();
      // Filter for upcoming trips only
      const now = new Date();
      return plans.filter((trip: any) => new Date(trip.startDate) > now).slice(0, 3);
    },
    enabled: !!profileId,
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
        
        {/* Action Buttons - Top Right */}
        <div className="absolute top-6 right-6 z-20 flex gap-3">
          {isOwnProfile ? (
            <Button asChild variant="outline" className="gap-2 text-white border-white/30 bg-black/20 backdrop-blur-sm hover:bg-black/30" data-testid="button-edit-profile">
              <Link href="/profile/edit">
                <Settings className="h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          ) : isFriend ? (
            <Button 
              variant="outline"
              className="gap-2 text-white border-white/30 bg-black/20 backdrop-blur-sm hover:bg-black/30"
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
              data-testid={`button-add-friend-${profileId}`}
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
          className="absolute bottom-0 left-0 right-0 p-6"
        >
          <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 rounded-t-2xl p-6 shadow-2xl">
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
            
            {/* Tango Roles */}
            {user.tangoRoles && user.tangoRoles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {user.tangoRoles.map((role, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
                    data-testid={`badge-role-${role}`}
                  >
                    {role.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* UPCOMING TRAVEL - CRITICAL FEATURE */}
            {upcomingTravel && upcomingTravel.length > 0 && (
              <div className="bg-primary/20 border border-primary/30 rounded-lg p-3 backdrop-blur-sm mb-3" data-testid="section-upcoming-travel">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-white">Upcoming Travel</span>
                </div>
                <div className="space-y-1">
                  {upcomingTravel.slice(0, 2).map((trip: any, index: number) => (
                    <div key={trip.id || index} className="flex items-center gap-2 text-xs text-white/90" data-testid={`trip-${index}`}>
                      <Calendar className="w-3 h-3 text-primary" />
                      <span className="font-medium">{trip.city}</span>
                      <span className="text-white/70">
                        ({new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-
                        {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                      </span>
                    </div>
                  ))}
                  {upcomingTravel.length > 2 && (
                    <button 
                      className="text-primary text-xs p-0 h-auto hover:text-primary/80 underline cursor-pointer bg-transparent border-none"
                      onClick={() => setActiveTab('travel')}
                      data-testid="button-more-trips"
                    >
                      +{upcomingTravel.length - 2} more trips →
                    </button>
                  )}
                </div>
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
        {activeTab !== 'feed' && activeTab !== 'travel' && activeTab !== 'events' && 
         activeTab !== 'friends' && activeTab !== 'photos' && activeTab !== 'about' && (
          <DashboardCustomerToggle isOwnProfile={isOwnProfile} onViewChange={setViewMode} />
        )}

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8" data-testid="text-posts-title">
              {isOwnProfile ? 'Your Posts' : 'Posts'}
            </h2>
            <ProfileTabFeed posts={posts} isLoading={postsLoading} isOwnProfile={isOwnProfile} />
          </motion.div>
        )}

        {/* Travel Tab */}
        {activeTab === 'travel' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileTabTravel profileId={profileId} />
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

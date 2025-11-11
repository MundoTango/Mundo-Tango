import { useState } from "react";
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
            <ProfileTabTravel />
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

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useRoute, Link, useSearch, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Settings, UserPlus, UserMinus, UserCheck, Plane, Calendar, CheckCircle, Instagram, Facebook, Twitter, Linkedin, Youtube, Globe, Award, Plus, Camera, Music, Users, ImageIcon, Mic2, Home, Briefcase, BookOpen, Heart, Eye, MessageSquare, HeartHandshake, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import ProfileTabsNav from "@/components/ProfileTabsNav";
import ProfileTabFeed from "@/components/profile/ProfileTabFeed";
import DashboardCustomerToggle from "@/components/profile/DashboardCustomerToggle";
import { PhotoUploadDialog } from "@/components/PhotoUploadDialog";
import { FriendshipQuestionnaire } from "@/components/friendship/FriendshipQuestionnaire";
import { FriendRequestReviewModal } from "@/components/friendship/FriendRequestReviewModal";
import { normalizeRole, getRoleByValue, getRoleLabel, getRoleIcon, getRoleColor } from "@/lib/tangoRoles";
import { useTranslation } from "react-i18next";

const ProfileTabTravel = lazy(() => import("@/components/profile/ProfileTabTravel"));
const ProfileTabEvents = lazy(() => import("@/components/profile/ProfileTabEvents"));
const ProfileTabFriends = lazy(() => import("@/components/profile/ProfileTabFriends"));
const ProfileTabPhotos = lazy(() => import("@/components/profile/ProfileTabPhotos"));
const ProfileTabAbout = lazy(() => import("@/components/profile/ProfileTabAbout"));
const ProfileTabMemories = lazy(() => import("@/components/profile/ProfileTabMemories"));
const ProfileTabPro = lazy(() => import("@/components/profile/ProfileTabPro"));

const TabLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

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
  const { t } = useTranslation(['pages', 'common']);
  // Support multiple route patterns: /profile/:id and /users/:userId
  const [, profileParams] = useRoute("/profile/:id");
  const [, userParams] = useRoute("/users/:userId");
  const params = profileParams || (userParams ? { id: userParams.userId } : null);
  const searchString = useSearch();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('feed');
  
  // Detect public view mode from ?view=public query param
  const searchParams = new URLSearchParams(searchString);
  const isPublicView = searchParams.get('view') === 'public';
  
  // PRO tab dashboard/customer toggle (separate from public view mode)
  const [viewMode, setViewMode] = useState<'dashboard' | 'customer'>('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [profilePhotoDialogOpen, setProfilePhotoDialogOpen] = useState(false);
  const [coverPhotoDialogOpen, setCoverPhotoDialogOpen] = useState(false);
  const [friendshipQuestionnaireOpen, setFriendshipQuestionnaireOpen] = useState(false);
  const [friendRequestReviewOpen, setFriendRequestReviewOpen] = useState(false);

  // Upload profile photo mutation (send compressed base64)
  const uploadPhotoMutation = useMutation({
    mutationFn: async (base64Data: string) => {
      const res = await fetch('/api/profile/photo', {
        method: 'POST',
        body: JSON.stringify({ photoData: base64Data }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
      
      if (!res.ok) throw new Error('Failed to upload photo');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t('common:success', 'Success'), description: t('pages:profile.photoUpdated', 'Profile photo updated!') });
      queryClient.invalidateQueries({ queryKey: ["user", profileIdentifier] });
      setUploadingPhoto(false);
    },
    onError: () => {
      toast({ title: t('common:error', 'Error'), description: t('pages:profile.photoUploadFailed', 'Failed to upload photo'), variant: "destructive" });
      setUploadingPhoto(false);
    }
  });

  // Upload cover photo mutation (send compressed base64) - PRD/media-handling.md
  const uploadCoverMutation = useMutation({
    mutationFn: async (base64Data: string) => {
      const res = await fetch('/api/profile/cover', {
        method: 'POST',
        body: JSON.stringify({ coverData: base64Data }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
      
      if (!res.ok) throw new Error('Failed to upload cover');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t('common:success', 'Success'), description: t('pages:profile.coverUpdated', 'Cover photo updated!') });
      queryClient.invalidateQueries({ queryKey: ["user", profileIdentifier] });
      setUploadingCover(false);
    },
    onError: () => {
      toast({ title: t('common:error', 'Error'), description: t('pages:profile.coverUploadFailed', 'Failed to upload cover photo'), variant: "destructive" });
      setUploadingCover(false);
    }
  });

  // Compress image (matching PostCreator pattern)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const fileSizeMB = file.size / (1024 * 1024);
          let maxDimension: number;
          let quality: number;
          
          if (fileSizeMB > 10) {
            maxDimension = 800;
            quality = 0.7;
          } else if (fileSizeMB > 5) {
            maxDimension = 1024;
            quality = 0.75;
          } else if (fileSizeMB > 2) {
            maxDimension = 1280;
            quality = 0.8;
          } else {
            maxDimension = 1600;
            quality = 0.85;
          }
          
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          const result = canvas.toDataURL('image/jpeg', quality);
          resolve(result);
        };
        img.onerror = () => reject(new Error('Could not load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUploadCropped = (croppedBase64: string) => {
    setUploadingPhoto(true);
    uploadPhotoMutation.mutate(croppedBase64);
  };

  const handleCoverPhotoUploadCropped = (croppedBase64: string) => {
    setUploadingCover(true);
    uploadCoverMutation.mutate(croppedBase64);
  };
  
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

  const [, navigate] = useLocation();

  const { data: user, isLoading: userLoading, isError: userError } = useQuery<User>({
    queryKey: ["user", profileIdentifier],
    queryFn: async () => {
      const res = await fetch(`/api/users/${profileIdentifier}`);
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    enabled: !!profileIdentifier,
    retry: false, // Don't retry on 404 - we'll redirect to current user's profile instead
    staleTime: 30000, // Cache for 30 seconds to prevent repeated requests
  });

  // If we tried to fetch a specific profile and got an error, redirect to current user's profile
  useEffect(() => {
    if (userError && params?.id && currentUser?.id) {
      navigate(`/profile/${currentUser.id}`);
    }
  }, [userError, params?.id, currentUser?.id, navigate]);

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["user-posts", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/posts?userId=${user?.id}&limit=50`);
      if (!res.ok) throw new Error("Failed to load posts");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch friendship status with this specific user
  const isOtherProfile = !!(currentUser && user && currentUser.id !== user.id);
  
  const { data: friendshipStatus, isLoading: friendshipLoading, refetch: refetchFriendshipStatus } = useQuery<{
    isFriend: boolean;
    hasIncomingRequest: boolean;
    hasOutgoingRequest: boolean;
    incomingRequest: any | null;
    outgoingRequest: any | null;
  }>({
    queryKey: ['/api/friends/status', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/friends/status/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch friendship status');
      return res.json();
    },
    enabled: isOtherProfile && !!user?.id,
    staleTime: 5000, // Cache for 5 seconds
  });

  // Debug: Log friendship status
  useEffect(() => {
    if (isOtherProfile) {
      console.log('[ProfilePage] Friendship status:', {
        currentUserId: currentUser?.id,
        profileUserId: user?.id,
        friendshipStatus,
        friendshipLoading,
      });
    }
  }, [currentUser?.id, user?.id, friendshipStatus, friendshipLoading, isOtherProfile]);

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

  // Fetch face photos for this user
  const { data: facePhotos = [] } = useQuery<{ id: number; url: string; order: number }[]>({
    queryKey: ['/api/profile/photos', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/profile/photos/${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user?.id,
  });

  const isOwnProfile = currentUser?.id === user?.id;
  
  // Use friendship status from API
  const isFriend = friendshipStatus?.isFriend ?? false;
  const hasPendingRequest = friendshipStatus?.hasOutgoingRequest ?? false;
  const hasIncomingRequest = friendshipStatus?.hasIncomingRequest ?? false;
  const incomingRequest = friendshipStatus?.incomingRequest;
  
  // Prepare incoming request data with sender info for review modal
  const incomingRequestWithSender = incomingRequest ? {
    ...incomingRequest,
    sender: {
      id: user?.id,
      name: user?.name,
      username: user?.username,
      profileImage: user?.profileImage,
      city: user?.city,
      country: user?.country,
    },
  } : null;

  // Auto-open friend request review modal if ?reviewRequest=true and there's an incoming request
  useEffect(() => {
    const urlParams = new URLSearchParams(searchString);
    const reviewRequest = urlParams.get('reviewRequest');
    if (reviewRequest === 'true' && hasIncomingRequest && !friendshipLoading) {
      setFriendRequestReviewOpen(true);
    }
  }, [searchString, hasIncomingRequest, friendshipLoading]);

  // Send friend request mutation with questionnaire data
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (questionnaireData?: {
      whenWeMet?: Date;
      whereWeMet: string;
      ourStory: string;
      privateNote?: string;
    }) => {
      const payload = questionnaireData ? {
        senderMessage: questionnaireData.ourStory,
        senderPrivateNote: questionnaireData.privateNote,
        didWeDance: true,
        danceLocation: questionnaireData.whereWeMet,
        danceStory: questionnaireData.ourStory,
        danceDate: questionnaireData.whenWeMet?.toISOString(),
      } : {};
      return await apiRequest('POST', `/api/friends/request/${user?.id}`, payload);
    },
    onSuccess: async () => {
      // Invalidate friendship status for this profile
      await queryClient.invalidateQueries({ queryKey: ['/api/friends/status', user?.id] });
      await queryClient.refetchQueries({ queryKey: ['/api/friends/status', user?.id] });
      setFriendshipQuestionnaireOpen(false);
      toast({
        title: t('pages:profile.friendRequestSent', 'Friend request sent!'),
        description: t('pages:profile.requestSentTo', { name: user?.name, defaultValue: `Request sent to ${user?.name}` }),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t('pages:profile.failedToSendRequest', 'Failed to send request'),
        description: error.message || t('common:somethingWentWrong', 'Something went wrong'),
      });
    },
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/friends/${user?.id}`);
    },
    onSuccess: async () => {
      // Invalidate friendship status for this profile
      await queryClient.invalidateQueries({ queryKey: ['/api/friends/status', user?.id] });
      await queryClient.refetchQueries({ queryKey: ['/api/friends/status', user?.id] });
      toast({
        title: t('pages:profile.friendRemoved', 'Friend removed'),
        description: t('pages:profile.removedFromFriends', { name: user?.name, defaultValue: `Removed ${user?.name} from friends` }),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t('pages:profile.failedToRemoveFriend', 'Failed to remove friend'),
        description: error.message || t('common:somethingWentWrong', 'Something went wrong'),
      });
    },
  });

  if (userLoading) {
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

  if (userError || !user) {
    return (
      <SelfHealingErrorBoundary pageName="Profile" fallbackRoute="/feed">
        <SEO 
          title="User Not Found - Mundo Tango"
          description="The requested user profile could not be found"
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4" data-testid="container-user-not-found">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Users className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold" data-testid="text-user-not-found-title">{t('pages:profile.userNotFound', 'User Not Found')}</h1>
            <p className="text-muted-foreground max-w-md" data-testid="text-user-not-found-message">
              {t('pages:profile.userNotFoundMessage', "The profile you're looking for doesn't exist or may have been removed.")}
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              data-testid="button-go-back"
            >
              {t('common:goBack', 'Go Back')}
            </Button>
            <Link href="/feed">
              <Button data-testid="button-go-home">
                <Home className="w-4 h-4 mr-2" />
                {t('pages:profile.goToFeed', 'Go to Feed')}
              </Button>
            </Link>
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
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden group">
        {/* Cover Photo as Hero Image */}
        <img 
          src={user.backgroundImage || 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1600&auto=format&fit=crop'} 
          alt={`${user.name}'s cover`}
          className="absolute inset-0 w-full h-full object-cover"
          data-testid="img-hero-cover"
        />
        
        {/* Dark Overlay Gradient for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent" />

        {/* User Info Card Overlay - Left Side */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute left-6 top-20 z-20"
        >
          <Card className="p-4 sm:p-6 w-full max-w-[500px] bg-background/95 backdrop-blur-md border-white/20">
          {/* Profile Photo + Content Layout */}
          <div className="flex gap-6">
            {/* Left: Profile Photo Circle with Edit Button */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar className="w-40 h-40 border-4 border-border shadow-lg">
                  <AvatarImage src={user.profileImage || undefined} alt={user.name} />
                  <AvatarFallback className="bg-primary/80 text-white text-xl font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && !isPublicView && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="absolute bottom-0 right-0 rounded-full text-white border-white/30 bg-black/20 backdrop-blur-sm hover:bg-black/30" 
                        data-testid="button-change-profile-photo"
                        onClick={() => setProfilePhotoDialogOpen(true)}
                        disabled={uploadingPhoto}
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{uploadingPhoto ? 'Uploading...' : 'Change Profile Photo'}</TooltipContent>
                  </Tooltip>
                )}
              </div>
              {isOwnProfile && !isPublicView && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm"
                      variant="outline" 
                      className="w-full mt-3 text-xs gap-1 bg-black/20 backdrop-blur-sm hover:bg-black/30" 
                      onClick={() => setCoverPhotoDialogOpen(true)} 
                      disabled={uploadingCover} 
                      data-testid="button-upload-cover"
                    >
                      <ImageIcon className="h-3 w-3" />
                      {uploadingCover ? 'Upload...' : 'Edit Cover'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Cover Photo</TooltipContent>
                </Tooltip>
              )}
              {isOwnProfile && !isPublicView && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm"
                      variant="outline" 
                      className="w-full mt-2 text-xs gap-1 bg-black/20 backdrop-blur-sm hover:bg-black/30" 
                      onClick={() => navigate(`/profile/${user.id}?view=public`)}
                      data-testid="button-view-public-profile"
                    >
                      <Eye className="h-3 w-3" />
                      {t('pages:profile.viewPublicProfile', 'View Public Profile')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('pages:profile.seeHowProfileLooks', 'See how your profile looks to others')}</TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Right: User Info */}
            <div className="flex-1 space-y-3">
              {/* Name & Verification */}
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold" data-testid="text-username">
                  {user.name}
                </h1>
                {user.role === 'super_admin' && (
                  <Badge className="bg-primary text-white border-0 text-xs" data-testid="badge-verified">
                    <CheckCircle className="w-2 h-2 mr-1" />
                    {t('pages:profile.verified', 'Verified')}
                  </Badge>
                )}
              </div>
              
              {/* Username */}
              <p className="text-muted-foreground text-xs font-medium" data-testid="text-handle">@{user.username}</p>
              
              {/* Bio */}
              {user.bio && (
                <p className="text-sm" data-testid="text-bio">{user.bio}</p>
              )}
              
              {/* Tango Roles - Icons with Tooltips */}
              {user.tangoRoles && user.tangoRoles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <TooltipProvider>
                    {user.tangoRoles
                      .map((role) => normalizeRole(role))
                      .filter((role, idx, arr) => arr.indexOf(role) === idx)
                      .map((role) => {
                      const Icon = getRoleIcon(role);
                      const label = getRoleLabel(role);
                      const color = getRoleColor(role);
                      
                      return (
                        <Tooltip key={role}>
                          <TooltipTrigger asChild>
                            <div 
                              className="p-1 rounded-lg border cursor-help hover-elevate" 
                              style={{ backgroundColor: `${color}15`, borderColor: `${color}40` }}
                              data-testid={`icon-role-${role}`}
                            >
                              <Icon className="w-3 h-3" style={{ color }} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{label}</TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                </div>
              )}

              {/* Professional Score - Only show if yearsOfDancing > 0 */}
              {user.yearsOfDancing && user.yearsOfDancing > 0 && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 text-xs" data-testid="section-professional-score">
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-primary" />
                    <span className="font-semibold">
                      {t('pages:profile.yearsOfExperience', { count: user.yearsOfDancing, defaultValue: `${user.yearsOfDancing} ${user.yearsOfDancing === 1 ? 'year' : 'years'} of tango experience` })}
                    </span>
                  </div>
                  {(user.leaderLevel || user.followerLevel) && (
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                      {user.leaderLevel && user.leaderLevel > 0 && (
                        <span data-testid="text-leader-level">{t('pages:profile.leaderLevel', { level: user.leaderLevel, defaultValue: `Leader: Level ${user.leaderLevel}` })}</span>
                      )}
                      {user.followerLevel && user.followerLevel > 0 && (
                        <span data-testid="text-follower-level">{t('pages:profile.followerLevel', { level: user.followerLevel, defaultValue: `Follower: Level ${user.followerLevel}` })}</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Social Links */}
              {user.socialLinks && Object.values(user.socialLinks).some(link => link) && (
                <div className="flex flex-wrap gap-2" data-testid="section-social-links">
                  {user.socialLinks.instagram && (
                    <a
                      href={user.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover-elevate"
                      aria-label="Instagram"
                      data-testid="link-instagram"
                    >
                      <Instagram className="w-3 h-3" />
                    </a>
                  )}
                  {user.socialLinks.facebook && (
                    <a
                      href={user.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover-elevate"
                      aria-label="Facebook"
                      data-testid="link-facebook"
                    >
                      <Facebook className="w-3 h-3" />
                    </a>
                  )}
                  {user.socialLinks.twitter && (
                    <a
                      href={user.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover-elevate"
                      aria-label="Twitter"
                      data-testid="link-twitter"
                    >
                      <Twitter className="w-3 h-3" />
                    </a>
                  )}
                  {user.socialLinks.linkedin && (
                    <a
                      href={user.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover-elevate"
                      aria-label="LinkedIn"
                      data-testid="link-linkedin"
                    >
                      <Linkedin className="w-3 h-3" />
                    </a>
                  )}
                  {user.socialLinks.youtube && (
                    <a
                      href={user.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover-elevate"
                      aria-label="YouTube"
                      data-testid="link-youtube"
                    >
                      <Youtube className="w-3 h-3" />
                    </a>
                  )}
                  {user.socialLinks.website && (
                    <a
                      href={user.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover-elevate"
                      aria-label="Website"
                      data-testid="link-website"
                    >
                      <Globe className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
              
              {/* Current Location */}
              {(user.city || user.country) && (
                <div className="flex items-center gap-1 text-muted-foreground text-xs" data-testid="text-location">
                  <MapPin className="w-3 h-3" />
                  <span>{[user.city, user.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
          </Card>
        </motion.div>
        
      </div>
      {/* Photo Upload Dialogs */}
      <PhotoUploadDialog
        open={profilePhotoDialogOpen}
        onOpenChange={setProfilePhotoDialogOpen}
        onUpload={handlePhotoUploadCropped}
        type="profile"
        isUploading={uploadingPhoto}
      />
      <PhotoUploadDialog
        open={coverPhotoDialogOpen}
        onOpenChange={setCoverPhotoDialogOpen}
        onUpload={handleCoverPhotoUploadCropped}
        type="cover"
        isUploading={uploadingCover}
      />
      {/* Friendship Questionnaire Dialog */}
      {user && !isOwnProfile && (
        <FriendshipQuestionnaire
          open={friendshipQuestionnaireOpen}
          onOpenChange={setFriendshipQuestionnaireOpen}
          friendName={user.name}
          onSubmit={(data) => sendFriendRequestMutation.mutate(data)}
          isLoading={sendFriendRequestMutation.isPending}
        />
      )}
      {/* Friend Request Review Modal (for incoming requests) */}
      {incomingRequestWithSender && (
        <FriendRequestReviewModal
          open={friendRequestReviewOpen}
          onOpenChange={setFriendRequestReviewOpen}
          request={incomingRequestWithSender}
          onActionComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
            queryClient.invalidateQueries({ queryKey: ['/api/friends/requests'] });
          }}
        />
      )}
      {/* Tab Navigation */}
      <ProfileTabsNav
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOwnProfile={isOwnProfile}
        isPublicView={isPublicView}
        friendshipState={!isOwnProfile ? {
          isFriend,
          hasPendingRequest,
          hasIncomingRequest,
        } : undefined}
        onAddFriend={() => setFriendshipQuestionnaireOpen(true)}
        onReviewRequest={() => setFriendRequestReviewOpen(true)}
        isAddingFriend={sendFriendRequestMutation.isPending}
      />
      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Dashboard/Customer Toggle for PRO Tab */}
        {activeTab === 'pro' && !isPublicView && (
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
                {isOwnProfile ? t('pages:profile.yourPosts', 'Your Posts') : t('pages:profile.posts', 'Posts')}
              </h2>
              <ProfileTabFeed posts={posts} isLoading={postsLoading} isOwnProfile={isOwnProfile} userId={user.id} isPublicView={isPublicView} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Travel Section */}
              {upcomingTravel && upcomingTravel.length > 0 && (
                <Card className="sticky top-24" data-testid="card-upcoming-travel-sidebar">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Plane className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">{t('pages:profile.upcomingTravel', 'Upcoming Travel')}</h3>
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

              {/* Face Photos Section - Show Uploaded Photos */}
              <Card data-testid="card-face-photos">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{t('pages:profile.facePhotos', 'Face Photos')}</h3>
                    {facePhotos.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {facePhotos.length}/6
                      </Badge>
                    )}
                  </div>
                  {facePhotos.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {isOwnProfile 
                        ? t('pages:profile.addFacePhotos', 'Add face photos to your profile - people dance better when they know you!')
                        : t('pages:profile.noFacePhotos', 'No face photos uploaded yet.')
                      }
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                      const photo = facePhotos.find(p => p.order === index);
                      return (
                        <div
                          key={index}
                          onClick={isOwnProfile ? () => setActiveTab('photos') : undefined}
                          className={`aspect-square rounded-lg overflow-hidden ${
                            photo 
                              ? '' 
                              : 'bg-muted border-2 border-dashed border-border/50 flex items-center justify-center'
                          } ${isOwnProfile ? 'hover:opacity-90 cursor-pointer' : ''} transition-all`}
                          data-testid={`photo-slot-${index}`}
                        >
                          {photo ? (
                            <img 
                              src={photo.url} 
                              alt={`Face photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Plus className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {isOwnProfile && !isPublicView && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => setActiveTab('photos')}
                      data-testid="button-upload-photos"
                    >
                      {facePhotos.length === 0 ? t('pages:profile.uploadPhotos', 'Upload Photos') : t('pages:profile.managePhotos', 'Manage Photos')}
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
            <Suspense fallback={<TabLoader />}>
              <ProfileTabMemories isOwnProfile={isOwnProfile} profileId={user.id} isPublicView={isPublicView} />
            </Suspense>
          </motion.div>
        )}

        {/* Travel Tab */}
        {activeTab === 'travel' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Suspense fallback={<TabLoader />}>
              <ProfileTabTravel profileId={user.id} isOwnProfile={isOwnProfile} isPublicView={isPublicView} />
            </Suspense>
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Suspense fallback={<TabLoader />}>
              <ProfileTabEvents profileId={user.id} isOwnProfile={isOwnProfile} isPublicView={isPublicView} />
            </Suspense>
          </motion.div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Suspense fallback={<TabLoader />}>
              <ProfileTabFriends profileId={user.id} isOwnProfile={isOwnProfile} isPublicView={isPublicView} />
            </Suspense>
          </motion.div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Suspense fallback={<TabLoader />}>
              <ProfileTabPhotos />
            </Suspense>
          </motion.div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Suspense fallback={<TabLoader />}>
              <ProfileTabAbout user={user} isOwnProfile={isOwnProfile} isPublicView={isPublicView} />
            </Suspense>
          </motion.div>
        )}

        {/* PRO Tab - Unified Professional Roles */}
        {activeTab === 'pro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Suspense fallback={<TabLoader />}>
              <ProfileTabPro 
                userId={user.id}
                isOwner={isOwnProfile}
                tangoRoles={user.tangoRoles || []}
                tangoRoleExperience={null}
                viewMode={isPublicView ? 'customer' : viewMode}
              />
            </Suspense>
          </motion.div>
        )}
      </div>
    </SelfHealingErrorBoundary>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, Clock, Search, Heart, Star, TrendingUp, Upload, X, Image as ImageIcon, Loader2, MapPin, ChevronLeft, ChevronRight, UserCheck, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { uploadMediaFiles } from "@/lib/mediaUpload";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Friend {
  id: number;
  name: string;
  username: string;
  profileImage?: string;
  bio?: string;
  mutualFriends?: number;
  closenessScore?: number;
  connectionDegree?: number;
  lastInteractionAt?: string;
}

interface DiscoverUser {
  id: number;
  name: string;
  username: string;
  profileImage?: string;
  bio?: string;
  city?: string;
  country?: string;
  tangoRoles?: string[];
  danceExperienceLevel?: string;
  yearsOfDancing?: number;
  isFriend: boolean;
  hasSentRequest: boolean;
  hasReceivedRequest: boolean;
  createdAt?: string;
}

interface DiscoverResponse {
  users: DiscoverUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface FriendRequest {
  id: number;
  senderId: number;
  sender: Friend;
  status: string;
  createdAt: string;
  senderMessage?: string;
  danceStory?: string;
  danceLocation?: string;
  didWeDance?: boolean;
  mediaUrls?: string[];
  meetingDate?: string;
}

export default function FriendsListPage() {
  const { t } = useTranslation(['pages', 'common']);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);
  const [selectedReviewRequest, setSelectedReviewRequest] = useState<FriendRequest | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [requestData, setRequestData] = useState({
    message: "",
    didWeDance: false,
    danceLocation: "",
    danceStory: "",
    meetingDate: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: friends = [], isLoading: loadingFriends } = useQuery<Friend[]>({
    queryKey: ["/api/friends"],
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery<FriendRequest[]>({
    queryKey: ["/api/friends/requests"],
  });

  const [discoverPage, setDiscoverPage] = useState(1);
  const [discoverSearch, setDiscoverSearch] = useState("");
  
  const { data: discoverData, isLoading: loadingDiscover, isFetching: fetchingDiscover } = useQuery<DiscoverResponse>({
    queryKey: ["/api/users/discover", discoverPage, discoverSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: discoverPage.toString(),
        limit: "20",
        ...(discoverSearch && { search: discoverSearch }),
      });
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(`/api/users/discover?${params}`, {
        credentials: "include",
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/friends/request/${data.receiverId}`, data),
    onSuccess: () => {
      toast({ title: "Friend request sent!" });
      setShowRequestDialog(false);
      setRequestData({ message: "", didWeDance: false, danceLocation: "", danceStory: "", meetingDate: "" });
      setUploadedFiles([]);
      setFilePreviews([]);
      queryClient.invalidateQueries({ queryKey: ["/api/users/discover"] });
    },
    onError: () => {
      toast({ title: "Failed to send request", variant: "destructive" });
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: (requestId: number) => apiRequest("POST", `/api/friends/requests/${requestId}/accept`),
    onSuccess: () => {
      toast({ title: "🎉 Friend request accepted!" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
    },
    onError: () => {
      toast({ title: "Failed to accept request", variant: "destructive" });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (requestId: number) => apiRequest("POST", `/api/friends/requests/${requestId}/reject`),
    onSuccess: () => {
      toast({ title: "Request declined" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
    },
    onError: () => {
      toast({ title: "Failed to decline request", variant: "destructive" });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: (friendId: number) => apiRequest("DELETE", `/api/friends/${friendId}`),
    onSuccess: () => {
      toast({ title: "Friend removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
    onError: () => {
      toast({ title: "Failed to remove friend", variant: "destructive" });
    },
  });

  const handleSendRequest = (friend: Friend) => {
    setSelectedUser(friend);
    setShowRequestDialog(true);
  };

  const handleReviewRequest = (request: FriendRequest) => {
    setSelectedReviewRequest(request);
    setShowReviewDialog(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file count
    if (uploadedFiles.length + files.length > 10) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 10 files",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file sizes (10MB max per file)
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Each file must be less than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file types (images and videos only)
    const validTypes = ['image/', 'video/'];
    const invalidTypes = files.filter(
      file => !validTypes.some(type => file.type.startsWith(type))
    );
    if (invalidTypes.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Only images and videos are allowed",
        variant: "destructive",
      });
      return;
    }
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setUploadedFiles(prev => [...prev, ...files]);
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(filePreviews[index]);
    
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const submitRequest = async () => {
    if (!selectedUser) return;
    
    setIsUploading(true);
    let mediaUrls: string[] = [];
    
    try {
      // Upload files to cloud storage (Cloudinary) if any are selected
      if (uploadedFiles.length > 0) {
        const uploadResults = await uploadMediaFiles(uploadedFiles);
        mediaUrls = uploadResults.map(result => result.url);
        
        toast({
          title: `✅ ${uploadResults.length} file${uploadResults.length > 1 ? 's' : ''} uploaded`,
          description: "Sending friend request...",
        });
      }
      
      // Send friend request with uploaded media URLs
      sendRequestMutation.mutate({
        receiverId: selectedUser.id,
        senderMessage: requestData.message,
        didWeDance: requestData.didWeDance,
        danceLocation: requestData.didWeDance ? requestData.danceLocation : null,
        danceStory: requestData.didWeDance ? requestData.danceStory : null,
        meetingDate: requestData.didWeDance ? requestData.meetingDate : null,
        mediaUrls: mediaUrls,
      });
    } catch (error) {
      console.error('Media upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload media files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredFriends = friends.filter(
    (friend) =>
      (friend.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (friend.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getConnectionBadge = (degree?: number) => {
    if (degree === 1) {
      return (
        <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
          1st
        </Badge>
      );
    } else if (degree === 2) {
      return (
        <Badge className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white border-0">
          2nd
        </Badge>
      );
    } else if (degree === 3) {
      return (
        <Badge className="bg-gradient-to-r from-purple-400 to-indigo-400 text-white border-0">
          3rd
        </Badge>
      );
    }
    return null;
  };

  const FriendCard = ({ friend, showAddButton = false }: { friend: Friend; showAddButton?: boolean }) => (
    <Card className="group relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-white/50 dark:border-cyan-500/30 p-4 hover-elevate active-elevate-2" data-testid={`card-friend-${friend.id}`}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400 opacity-60" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-12 w-12 ring-2 ring-cyan-400/50">
            <AvatarImage src={friend.profileImage} />
            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
              {friend.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base" data-testid={`text-friend-name-${friend.id}`}>
                {friend.name}
              </h3>
              {friend.connectionDegree && getConnectionBadge(friend.connectionDegree)}
            </div>
            <p className="text-sm text-muted-foreground">@{friend.username}</p>
            
            <div className="flex items-center gap-3 mt-2 text-xs">
              {friend.closenessScore !== undefined && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="font-medium">{friend.closenessScore}/100</span>
                </div>
              )}
              {friend.mutualFriends !== undefined && friend.mutualFriends > 0 && (
                <span className="text-muted-foreground">
                  {friend.mutualFriends} mutual
                </span>
              )}
            </div>
          </div>
        </div>
        
        {showAddButton ? (
          <Button
            size="sm"
            onClick={() => handleSendRequest(friend)}
            disabled={sendRequestMutation.isPending}
            data-testid={`button-add-friend-${friend.id}`}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add Friend
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeFriendMutation.mutate(friend.id)}
            disabled={removeFriendMutation.isPending}
            data-testid={`button-remove-friend-${friend.id}`}
          >
            Remove
          </Button>
        )}
      </div>
    </Card>
  );

  // Enhanced card for discover users with richer profile details
  const TangoRoleIcon = ({ role }: { role: string }) => {
    switch (role?.toLowerCase()) {
      case 'leader': 
        return <Badge variant="outline" className="text-xs px-1.5 py-0 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">{t('pages:friendsList.leader', 'Leader')}</Badge>;
      case 'follower': 
        return <Badge variant="outline" className="text-xs px-1.5 py-0 bg-pink-50 dark:bg-pink-950/50 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300">{t('pages:friendsList.follower', 'Follower')}</Badge>;
      case 'both': 
        return <Badge variant="outline" className="text-xs px-1.5 py-0 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">{t('pages:friendsList.both', 'Both')}</Badge>;
      default: 
        return <Badge variant="outline" className="text-xs px-1.5 py-0">{role}</Badge>;
    }
  };

  const SuggestionCard = ({ user }: { user: DiscoverUser }) => (
    <Card className="group relative overflow-visible backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-white/50 dark:border-cyan-500/30 p-4 hover-elevate active-elevate-2" data-testid={`card-suggestion-${user.id}`}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-400 opacity-60 rounded-t-md" />
      
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 ring-2 ring-teal-400/50 flex-shrink-0">
          <AvatarImage src={user.profileImage} />
          <AvatarFallback className="bg-gradient-to-br from-teal-400 to-cyan-500 text-white text-lg">
            {(user.name || 'U').charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base truncate" data-testid={`text-suggestion-name-${user.id}`}>
              {user.name || user.username}
            </h3>
            {user.tangoRoles && user.tangoRoles.length > 0 && (
              <div className="flex items-center gap-1">
                {user.tangoRoles.slice(0, 2).map((role, idx) => (
                  <TangoRoleIcon key={idx} role={role} />
                ))}
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          
          {/* Location */}
          {(user.city || user.country) && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{[user.city, user.country].filter(Boolean).join(', ')}</span>
            </div>
          )}
          
          {/* Bio snippet */}
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {user.bio}
            </p>
          )}
          
          {/* Dance experience */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {user.danceExperienceLevel && (
              <Badge variant="secondary" className="text-xs">
                {user.danceExperienceLevel}
              </Badge>
            )}
            {user.yearsOfDancing && user.yearsOfDancing > 0 && (
              <span className="text-xs text-muted-foreground">
                {user.yearsOfDancing} {user.yearsOfDancing === 1 ? 'year' : 'years'} dancing
              </span>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex-shrink-0">
          {user.isFriend ? (
            <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
              <UserCheck className="h-3 w-3 mr-1" />
              Friends
            </Badge>
          ) : user.hasSentRequest ? (
            <Badge variant="secondary" className="text-xs">
              <Send className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          ) : user.hasReceivedRequest ? (
            <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30">
              <Clock className="h-3 w-3 mr-1" />
              Respond
            </Badge>
          ) : (
            <Button
              size="sm"
              onClick={() => handleSendRequest({ 
                id: user.id, 
                name: user.name || user.username, 
                username: user.username,
                profileImage: user.profileImage,
                bio: user.bio
              })}
              disabled={sendRequestMutation.isPending}
              data-testid={`button-add-suggestion-${user.id}`}
              className="bg-gradient-to-r from-teal-500 to-cyan-600"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Connect
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  const RequestCard = ({ request }: { request: FriendRequest }) => (
    <Card className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-white/50 dark:border-cyan-500/30 p-4" data-testid={`card-request-${request.id}`}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-rose-400 opacity-60" />
      
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="h-12 w-12 ring-2 ring-purple-400/50">
            <AvatarImage src={request.sender?.profileImage} />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
              {request.sender?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold" data-testid={`text-request-name-${request.id}`}>
              {request.sender?.name}
            </h3>
            <p className="text-sm text-muted-foreground">@{request.sender?.username}</p>
            
            {request.senderMessage && (
              <p className="text-sm mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                "{request.senderMessage}"
              </p>
            )}
            
            {request.didWeDance && (
              <div className="mt-3 p-3 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <div className="flex items-center gap-2 text-sm font-medium text-cyan-700 dark:text-cyan-300 mb-2">
                  <Heart className="h-4 w-4 fill-current" />
                  We danced together!
                </div>
                {request.danceLocation && (
                  <p className="text-xs text-muted-foreground mb-1">
                    📍 {request.danceLocation}
                  </p>
                )}
                {request.meetingDate && (
                  <p className="text-xs text-muted-foreground mb-1">
                    📅 {new Date(request.meetingDate).toLocaleDateString()}
                  </p>
                )}
                {request.danceStory && (
                  <p className="text-sm mt-2 italic">
                    "{request.danceStory}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          <Button
            size="sm"
            onClick={() => handleReviewRequest(request)}
            disabled={false}
            data-testid={`button-review-request-${request.id}`}
            className="bg-gradient-to-r from-purple-500 to-pink-600"
          >
            Review Request
          </Button>
        </div>
      </div>
    </Card>
  );

  const RequestReviewDialog = ({ request, open, onOpenChange }: { request: FriendRequest | null; open: boolean; onOpenChange: (open: boolean) => void }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Friend Request from {request?.sender?.name}
          </DialogTitle>
        </DialogHeader>
        
        {request && (
          <div className="space-y-4">
            {/* Sender Info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={request.sender?.profileImage} />
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                  {request.sender?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{request.sender?.name}</p>
                <p className="text-sm text-muted-foreground">@{request.sender?.username}</p>
              </div>
            </div>

            {/* Personal Message */}
            {request.senderMessage && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Message</p>
                <p className="text-sm p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                  "{request.senderMessage}"
                </p>
              </div>
            )}

            {/* Dance Story Section */}
            {request.didWeDance && (
              <div className="space-y-2 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <div className="flex items-center gap-2 text-sm font-medium text-cyan-700 dark:text-cyan-300 mb-2">
                  <Heart className="h-4 w-4 fill-current" />
                  We danced together!
                </div>
                
                {request.danceLocation && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Location</p>
                    <p className="text-sm">{request.danceLocation}</p>
                  </div>
                )}
                
                {request.meetingDate && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">When we met</p>
                    <p className="text-sm">{new Date(request.meetingDate).toLocaleDateString()}</p>
                  </div>
                )}
                
                {request.danceStory && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Memory</p>
                    <p className="text-sm italic">"{request.danceStory}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Media Section */}
            {request.mediaUrls && request.mediaUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Attached Photos & Videos</p>
                <div className="grid grid-cols-3 gap-2">
                  {request.mediaUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                    >
                      {url.includes('video') || url.match(/\.(mp4|webm|mov)$/i) ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-1" />
                            <p className="text-xs text-slate-500">Video</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={url}
                          alt={`Attached media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Date */}
            <div>
              <p className="text-xs text-muted-foreground">
                Sent {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  rejectRequestMutation.mutate(request.id);
                  onOpenChange(false);
                }}
                disabled={rejectRequestMutation.isPending}
                data-testid={`button-decline-review-${request.id}`}
              >
                Decline
              </Button>
              <Button
                onClick={() => {
                  acceptRequestMutation.mutate(request.id);
                  onOpenChange(false);
                }}
                disabled={acceptRequestMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
                data-testid={`button-accept-review-${request.id}`}
              >
                Accept
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <SelfHealingErrorBoundary pageName="Friends" fallbackRoute="/feed">
      <PageLayout title={t('pages:friendsList.title', 'Friends')} showBreadcrumbs>
      {/* Editorial Hero Section - 16:9 */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1600&auto=format&fit=crop')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              <Users className="w-3 h-3 mr-1.5" />
              {t('pages:friendsList.yourNetwork', 'Your Network')}
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
              {t('pages:friendsList.heroTitle', 'Tango Friends')}
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {t('pages:friendsList.heroSubtitle', 'Connect with dancers who share your passion for Argentine tango')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* MT Ocean Theme Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-100 to-teal-100 dark:from-slate-900 dark:via-blue-950 dark:to-cyan-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="container max-w-4xl mx-auto p-6 bg-background" data-testid="page-friends">
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold mb-2">{t('pages:friendsList.manageConnections', 'Manage Your Connections')}</h2>
          <p className="text-muted-foreground">{t('pages:friendsList.buildCommunity', 'Build and nurture your tango community')}</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('pages:friendsList.searchPlaceholder', 'Search friends...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80"
              data-testid="input-search-friends"
            />
          </div>
        </div>

        <Tabs defaultValue="all" data-testid="tabs-friends">
          <TabsList className="grid w-full grid-cols-3 backdrop-blur-lg bg-white/60 dark:bg-slate-900/60">
            <TabsTrigger value="all" data-testid="tab-all-friends">
              <Users className="h-4 w-4 mr-2" />
              {t('pages:friendsList.allFriends', 'All Friends')}
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              <Clock className="h-4 w-4 mr-2" />
              {t('pages:friendsList.requests', 'Requests')}
              {requests.length > 0 && (
                <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" data-testid="tab-suggestions">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t('pages:friendsList.suggestions', 'Suggestions')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-6">
            {loadingFriends ? (
              <div className="text-center py-12 text-muted-foreground">{t('pages:friendsList.loadingFriends', 'Loading friends...')}</div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? t('pages:friendsList.noFriendsFound', 'No friends found') : t('pages:friendsList.noFriendsYet', 'No friends yet. Send some requests!')}
              </div>
            ) : (
              filteredFriends.map((friend) => <FriendCard key={friend.id} friend={friend} />)
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-3 mt-6">
            {loadingRequests ? (
              <div className="text-center py-12 text-muted-foreground">{t('pages:friendsList.loadingRequests', 'Loading requests...')}</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t('pages:friendsList.noPendingRequests', 'No pending friend requests')}
              </div>
            ) : (
              requests.map((request) => <RequestCard key={request.id} request={request} />)
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4 mt-6">
            {/* Search for discovering users */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('pages:friendsList.searchPeople', 'Search people by name, username, or city...')}
                value={discoverSearch}
                onChange={(e) => {
                  setDiscoverSearch(e.target.value);
                  setDiscoverPage(1);
                }}
                className="pl-10 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80"
                data-testid="input-search-discover"
              />
            </div>
            
            {/* Results count */}
            {discoverData?.pagination && (
              <div className="text-sm text-muted-foreground">
                {t('pages:friendsList.showingUsers', {
                  shown: discoverData.users.length,
                  total: discoverData.pagination.total,
                  defaultValue: `Showing ${discoverData.users.length} of ${discoverData.pagination.total} dancers`
                })}
              </div>
            )}
            
            {loadingDiscover ? (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                {t('pages:friendsList.loadingSuggestions', 'Loading suggestions...')}
              </div>
            ) : !discoverData?.users?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                {discoverSearch 
                  ? t('pages:friendsList.noUsersFound', 'No dancers found matching your search')
                  : t('pages:friendsList.noSuggestionsAvailable', 'No suggestions available')}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {discoverData.users.map((user) => (
                    <SuggestionCard key={user.id} user={user} />
                  ))}
                </div>
                
                {/* Pagination controls */}
                {discoverData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDiscoverPage(p => Math.max(1, p - 1))}
                      disabled={discoverPage === 1 || fetchingDiscover}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t('common:previous', 'Previous')}
                    </Button>
                    
                    <span className="text-sm text-muted-foreground">
                      {t('common:pageOf', {
                        page: discoverPage,
                        total: discoverData.pagination.totalPages,
                        defaultValue: `Page ${discoverPage} of ${discoverData.pagination.totalPages}`
                      })}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDiscoverPage(p => p + 1)}
                      disabled={!discoverData.pagination.hasMore || fetchingDiscover}
                      data-testid="button-next-page"
                    >
                      {t('common:next', 'Next')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Request Dialog */}
      <RequestReviewDialog 
        request={selectedReviewRequest} 
        open={showReviewDialog} 
        onOpenChange={setShowReviewDialog}
      />

      {/* Send Request Dialog with Dance Story */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {t('pages:friendsList.sendFriendRequestTo', { name: selectedUser?.name, defaultValue: `Send Friend Request to ${selectedUser?.name}` })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">{t('pages:friendsList.personalMessage', 'Personal Message')} *</Label>
              <Textarea
                id="message"
                placeholder={t('pages:friendsList.messagePlaceholder', "Hi! I'd love to connect...")}
                value={requestData.message}
                onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                className="mt-1"
                data-testid="input-friend-request-message"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="didWeDance"
                checked={requestData.didWeDance}
                onCheckedChange={(checked) =>
                  setRequestData({ ...requestData, didWeDance: checked as boolean })
                }
                data-testid="checkbox-did-we-dance"
              />
              <Label htmlFor="didWeDance" className="cursor-pointer">{t('pages:friendsList.weveMet', "We've met!")}</Label>
            </div>

            {requestData.didWeDance && (
              <div className="space-y-3 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <div>
                  <Label htmlFor="danceLocation">{t('pages:friendsList.whereDidWeDance', 'Where did we dance?')}</Label>
                  <Input
                    id="danceLocation"
                    placeholder={t('pages:friendsList.locationPlaceholder', 'e.g., Salon Canning, Buenos Aires')}
                    value={requestData.danceLocation}
                    onChange={(e) =>
                      setRequestData({ ...requestData, danceLocation: e.target.value })
                    }
                    className="mt-1"
                    data-testid="input-dance-location"
                  />
                </div>
                <div>
                  <Label htmlFor="meetingDate">{t('pages:friendsList.whenDidWeMeet', 'When did we meet?')}</Label>
                  <Input
                    id="meetingDate"
                    type="date"
                    value={requestData.meetingDate}
                    onChange={(e) =>
                      setRequestData({ ...requestData, meetingDate: e.target.value })
                    }
                    className="mt-1"
                    data-testid="input-meeting-date"
                  />
                </div>
                <div>
                  <Label htmlFor="danceStory">{t('pages:friendsList.shareTheMemory', 'Share the memory')}</Label>
                  <Textarea
                    id="danceStory"
                    placeholder={t('pages:friendsList.danceStoryPlaceholder', 'Tell them about your dance together...')}
                    value={requestData.danceStory}
                    onChange={(e) =>
                      setRequestData({ ...requestData, danceStory: e.target.value })
                    }
                    className="mt-1"
                    data-testid="textarea-dance-story"
                  />
                </div>
                
                {/* Media Upload */}
                <div>
                  <Label htmlFor="mediaUpload">
                    Upload Photos/Videos from the Event
                    <span className="text-xs text-muted-foreground ml-2">
                      (Max 10 files, 10MB each)
                    </span>
                  </Label>
                  <div className="mt-2">
                    <label
                      htmlFor="mediaUpload"
                      className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-cyan-300 dark:border-cyan-700 rounded-lg cursor-pointer hover-elevate active-elevate-2 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload images or videos
                      </span>
                    </label>
                    <input
                      id="mediaUpload"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      data-testid="input-media-upload"
                    />
                  </div>

                  {/* File Preview Grid */}
                  {filePreviews.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {filePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-cyan-200 dark:border-cyan-800"
                        >
                          {uploadedFiles[index].type.startsWith('image/') ? (
                            <img
                              src={preview}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`button-remove-file-${index}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs p-1 truncate">
                            {uploadedFiles[index].name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadedFiles.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                {t('common:cancel', 'Cancel')}
              </Button>
              <Button
                onClick={submitRequest}
                disabled={!requestData.message || sendRequestMutation.isPending || isUploading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
                data-testid="button-submit-friend-request"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common:uploading', 'Uploading...')}
                  </>
                ) : (
                  t('pages:friendsList.sendRequest', 'Send Request')
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}

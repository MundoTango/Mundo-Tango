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
import { Users, UserPlus, Clock, Search, Heart, Star, TrendingUp, Upload, X, Image as ImageIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/PageLayout";

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
}

export default function FriendsListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);
  const [requestData, setRequestData] = useState({
    message: "",
    didWeDance: false,
    danceLocation: "",
    danceStory: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: friends = [], isLoading: loadingFriends } = useQuery<Friend[]>({
    queryKey: ["/api/friends"],
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery<FriendRequest[]>({
    queryKey: ["/api/friends/requests"],
  });

  const { data: suggestions = [], isLoading: loadingSuggestions } = useQuery<Friend[]>({
    queryKey: ["/api/friends/suggestions"],
  });

  const sendRequestMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/friends/request/${data.receiverId}`, "POST", data),
    onSuccess: () => {
      toast({ title: "✨ Friend request sent!" });
      setShowRequestDialog(false);
      setRequestData({ message: "", didWeDance: false, danceLocation: "", danceStory: "" });
      setUploadedFiles([]);
      setFilePreviews([]);
      queryClient.invalidateQueries({ queryKey: ["/api/friends/suggestions"] });
    },
    onError: () => {
      toast({ title: "Failed to send request", variant: "destructive" });
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: (requestId: number) => apiRequest(`/api/friends/requests/${requestId}/accept`, "POST"),
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
    mutationFn: (requestId: number) => apiRequest(`/api/friends/requests/${requestId}/reject`, "POST"),
    onSuccess: () => {
      toast({ title: "Request declined" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
    },
    onError: () => {
      toast({ title: "Failed to decline request", variant: "destructive" });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: (friendId: number) => apiRequest(`/api/friends/${friendId}`, "DELETE"),
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
    
    // Convert files to data URLs for transmission
    // In a production app, you'd upload to cloud storage and get URLs
    const mediaUrls: string[] = [];
    
    // For now, we'll send empty mediaUrls array
    // TODO: Implement file upload to storage service
    
    sendRequestMutation.mutate({
      receiverId: selectedUser.id,
      senderMessage: requestData.message,
      didWeDance: requestData.didWeDance,
      danceLocation: requestData.didWeDance ? requestData.danceLocation : null,
      danceStory: requestData.didWeDance ? requestData.danceStory : null,
      mediaUrls: mediaUrls,
    });
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
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
            onClick={() => acceptRequestMutation.mutate(request.id)}
            disabled={acceptRequestMutation.isPending}
            data-testid={`button-accept-${request.id}`}
            className="bg-gradient-to-r from-green-500 to-emerald-600"
          >
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => rejectRequestMutation.mutate(request.id)}
            disabled={rejectRequestMutation.isPending}
            data-testid={`button-reject-${request.id}`}
          >
            Decline
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <PageLayout title="Friends" showBreadcrumbs>
      {/* MT Ocean Theme Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-100 to-teal-100 dark:from-slate-900 dark:via-blue-950 dark:to-cyan-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="container max-w-4xl mx-auto p-6" data-testid="page-friends">
        <div className="mb-6">
          <p className="text-muted-foreground">Manage your tango connections</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
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
              All Friends
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              <Clock className="h-4 w-4 mr-2" />
              Requests
              {requests.length > 0 && (
                <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" data-testid="tab-suggestions">
              <TrendingUp className="h-4 w-4 mr-2" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-6">
            {loadingFriends ? (
              <div className="text-center py-12 text-muted-foreground">Loading friends...</div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? "No friends found" : "No friends yet. Send some requests!"}
              </div>
            ) : (
              filteredFriends.map((friend) => <FriendCard key={friend.id} friend={friend} />)
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-3 mt-6">
            {loadingRequests ? (
              <div className="text-center py-12 text-muted-foreground">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No pending friend requests
              </div>
            ) : (
              requests.map((request) => <RequestCard key={request.id} request={request} />)
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-3 mt-6">
            {loadingSuggestions ? (
              <div className="text-center py-12 text-muted-foreground">Loading suggestions...</div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No suggestions available
              </div>
            ) : (
              suggestions.map((friend) => (
                <FriendCard key={friend.id} friend={friend} showAddButton />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Send Request Dialog with Dance Story */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Send Friend Request to {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Personal Message *</Label>
              <Textarea
                id="message"
                placeholder="Hi! I'd love to connect..."
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
              <Label htmlFor="didWeDance" className="cursor-pointer">
                We danced together 💃🕺
              </Label>
            </div>

            {requestData.didWeDance && (
              <div className="space-y-3 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <div>
                  <Label htmlFor="danceLocation">Where did we dance?</Label>
                  <Input
                    id="danceLocation"
                    placeholder="e.g., Salon Canning, Buenos Aires"
                    value={requestData.danceLocation}
                    onChange={(e) =>
                      setRequestData({ ...requestData, danceLocation: e.target.value })
                    }
                    className="mt-1"
                    data-testid="input-dance-location"
                  />
                </div>
                <div>
                  <Label htmlFor="danceStory">Share the memory</Label>
                  <Textarea
                    id="danceStory"
                    placeholder="Tell them about your dance together..."
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
                Cancel
              </Button>
              <Button
                onClick={submitRequest}
                disabled={!requestData.message || sendRequestMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
                data-testid="button-submit-friend-request"
              >
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

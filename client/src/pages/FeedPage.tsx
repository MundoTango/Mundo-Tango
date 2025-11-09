import { useState, useRef, useEffect, useCallback } from "react";
import { usePosts, useCreatePost, useToggleLike, useComments, useCreateComment, useUpdateComment, useDeleteComment } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, MessageCircle, Share2, Image as ImageIcon, Globe, Users, Lock, X, Loader2, MoreVertical, Pencil, Trash2, ChevronDown, Music2, Plane, Sparkles, GraduationCap, PartyPopper, Star, Home, Utensils, ShoppingBag, Wrench, Video, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { SEO } from "@/components/SEO";
import { FeedRightSidebar } from "@/components/FeedRightSidebar";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { apiRequest } from "@/lib/queryClient";
import { PostCreator } from "@/components/universal/PostCreator";
import { queryClient } from "@/lib/queryClient";

type Post = {
  id: number;
  userId: number;
  content: string;
  richContent?: string | null;
  imageUrl?: string | null;
  visibility: string;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
  };
};

const TANGO_TAGS = [
  { name: "Milonga", icon: "🪭", color: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" },
  { name: "Práctica", icon: "💃", color: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  { name: "Performance", icon: "⭐", color: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  { name: "Workshop", icon: "🎓", color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  { name: "Festival", icon: "🎉", color: "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800" },
  { name: "Travel", icon: "✈️", color: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800" },
  { name: "Music", icon: "🎵", color: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" },
  { name: "Fashion", icon: "👗", color: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
];

const RECOMMENDATION_CATEGORIES = [
  { id: "venue", label: "Venue", Icon: Home, color: "text-primary" },
  { id: "teacher", label: "Teacher", Icon: GraduationCap, color: "text-purple-600 dark:text-purple-400" },
  { id: "accommodation", label: "Accommodation", Icon: Home, color: "text-blue-600 dark:text-blue-400" },
  { id: "restaurant", label: "Restaurant", Icon: Utensils, color: "text-orange-600 dark:text-orange-400" },
  { id: "shop", label: "Shop", Icon: ShoppingBag, color: "text-pink-600 dark:text-pink-400" },
  { id: "service", label: "Service", Icon: Wrench, color: "text-green-600 dark:text-green-400" },
];

export default function FeedPage() {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // @mentions autocomplete state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentions, setMentions] = useState<any[]>([]);
  
  // Recommendations state
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{category: string; name: string; location?: string; id?: number}>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showRecommendationDialog, setShowRecommendationDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recName, setRecName] = useState("");
  const [recCity, setRecCity] = useState("");
  const [recCountry, setRecCountry] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { 
    data, 
    isLoading, 
    isFetchingNextPage, 
    hasNextPage, 
    fetchNextPage,
    newPostsAvailable,
    loadNewPosts 
  } = usePosts();
  const createPost = useCreatePost();
  const { toast } = useToast();

  const allPosts = data?.pages.flat() || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a video smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedVideo(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setSelectedVideo(null);
    setVideoPreview(null);
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  // @mentions autocomplete handlers
  const handleContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Check for @ mention trigger
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newContent.slice(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtSymbol + 1);
      if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        
        // Search for mentions
        if (textAfterAt.length > 0) {
          try {
            const response = await apiRequest('GET', `/api/mentions/search?q=${encodeURIComponent(textAfterAt)}`);
            const results = await response.json();
            setMentionResults(results || []);
          } catch (error) {
            console.error('Failed to search mentions:', error);
            setMentionResults([]);
          }
        } else {
          setMentionResults([]);
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const selectMention = useCallback((mention: any) => {
    if (!textareaRef.current) return;
    
    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = content.slice(0, cursorPos);
    const textAfterCursor = content.slice(cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    const newContent = textBeforeCursor.slice(0, lastAtSymbol) + `@${mention.username} ` + textAfterCursor;
    setContent(newContent);
    setMentions(prev => [...prev, mention]);
    setShowMentions(false);
    setMentionQuery('');
    
    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPos = lastAtSymbol + mention.username.length + 2;
      textareaRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  }, [content]);

  // Recommendations handlers
  const openRecommendationDialog = (category: string) => {
    if (recommendations.length >= 3) {
      toast({
        title: "Maximum reached",
        description: "You can add up to 3 recommendations per post",
        variant: "destructive",
      });
      return;
    }
    setSelectedCategory(category);
    setShowRecommendationDialog(true);
  };

  const addRecommendation = () => {
    if (!recName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this recommendation",
        variant: "destructive",
      });
      return;
    }

    const location = recCity && recCountry ? `${recCity}, ${recCountry}` : (recCity || recCountry || undefined);
    
    setRecommendations(prev => [...prev, { 
      category: selectedCategory!, 
      name: recName.trim(),
      location
    }]);
    
    setShowRecommendationDialog(false);
    setRecName("");
    setRecCity("");
    setRecCountry("");
    setSelectedCategory(null);
    
    toast({
      title: "Recommendation added",
      description: `${recName} has been added to your post`,
    });
  };

  const removeRecommendation = (index: number) => {
    setRecommendations(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsUploading(true);

    try {
      const postData: any = {
        content: content.trim(),
        visibility: visibility,
      };

      if (imagePreview) {
        postData.imageUrl = imagePreview;
      }

      if (videoPreview && selectedVideo) {
        postData.videoUrl = videoPreview;
      }

      if (recommendations.length > 0) {
        postData.recommendations = recommendations.map(rec => ({
          ...rec,
          location: rec.location || null
        }));
      }

      if (mentions.length > 0) {
        postData.mentions = mentions.map(m => m.id);
      }

      await createPost.mutateAsync(postData);

      setContent("");
      setVisibility("public");
      setSelectedTags([]);
      setRecommendations([]);
      setMentions([]);
      handleRemoveImage();
      handleRemoveVideo();
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({
        title: "Failed to create post",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="Feed" fallbackRoute="/feed">
      <SEO
        title="Home Feed"
        description="Connect with the tango community. Share your dance moments, discover events, and engage with fellow tango enthusiasts from around the world."
      />
      <div className="flex min-h-screen bg-background">
        <main className="flex-1 max-w-3xl mx-auto p-6 space-y-6">
          {newPostsAvailable && (
            <Card className="p-4 bg-primary/10 border-primary" data-testid="banner-new-posts">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium">New posts available</p>
                <Button
                  onClick={loadNewPosts}
                  size="sm"
                  variant="default"
                  className="hover-elevate active-elevate-2"
                  data-testid="button-load-new-posts"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Load New Posts
                </Button>
              </div>
            </Card>
          )}

        <Card className="p-6">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="What's on your mind? Try @mentioning someone or adding a recommendation..."
                value={content}
                onChange={handleContentChange}
                className="min-h-24 resize-none border-0 text-base focus-visible:ring-0"
                data-testid="input-post-content"
              />
              
              {/* @mentions autocomplete dropdown */}
              {showMentions && mentionResults.length > 0 && (
                <Card className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto" data-testid="mentions-dropdown">
                  <div className="p-2">
                    {mentionResults.map((mention, index) => (
                      <button
                        key={`${mention.type}-${mention.id}`}
                        type="button"
                        onClick={() => selectMention(mention)}
                        className={`w-full flex items-center gap-3 p-2 rounded hover-elevate active-elevate-2 text-left ${
                          index === selectedMentionIndex ? 'bg-accent' : ''
                        }`}
                        data-testid={`mention-option-${mention.username}`}
                      >
                        {mention.avatar && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={mention.avatar} />
                            <AvatarFallback>{mention.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{mention.name}</div>
                          <div className="text-xs text-muted-foreground truncate">@{mention.username}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {mention.type}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </div>
            
            {imagePreview && (
              <div className="relative" data-testid="image-preview-container">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded-lg w-full object-cover max-h-96"
                  data-testid="image-preview"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover-elevate active-elevate-2"
                  data-testid="button-remove-image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {videoPreview && (
              <div className="relative" data-testid="video-preview-container">
                <video
                  src={videoPreview}
                  controls
                  className="rounded-lg w-full max-h-96"
                  data-testid="video-preview"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover-elevate active-elevate-2"
                  data-testid="button-remove-video"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Tag Selection */}
            <div className="space-y-2" data-testid="tag-selection-section">
              <label className="text-sm font-medium text-muted-foreground">Add tags to your memory</label>
              <div className="flex flex-wrap gap-2">
                {TANGO_TAGS.map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium
                      transition-all hover-elevate active-elevate-2
                      ${selectedTags.includes(tag.name) ? tag.color : 'bg-muted/50 text-muted-foreground border-border'}
                    `}
                    data-testid={`button-tag-${tag.name.toLowerCase()}`}
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="space-y-3" data-testid="recommendations-section">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Recommend places or people (up to 3)
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="hover-elevate active-elevate-2"
                  data-testid="button-toggle-recommendations"
                >
                  <Star className="h-4 w-4 mr-2" />
                  {showRecommendations ? 'Hide' : 'Add Recommendation'}
                </Button>
              </div>

              {/* Selected Recommendations Display */}
              {recommendations.length > 0 && (
                <div className="flex flex-wrap gap-2" data-testid="selected-recommendations">
                  {recommendations.map((rec, index) => {
                    const category = RECOMMENDATION_CATEGORIES.find(c => c.id === rec.category);
                    const Icon = category?.Icon || Star;
                    return (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="pl-3 pr-2 py-1.5 gap-2 hover-elevate"
                        data-testid={`recommendation-badge-${index}`}
                      >
                        <Icon className={`h-3 w-3 ${category?.color || 'text-primary'}`} />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">{rec.name}</span>
                          {rec.location && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {rec.location}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">({category?.label})</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeRecommendation(index)}
                          className="h-4 w-4 p-0 hover-elevate active-elevate-2"
                          data-testid={`button-remove-recommendation-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Recommendations Panel */}
              {showRecommendations && recommendations.length < 3 && (
                <Card className="p-4 space-y-3" data-testid="recommendations-panel">
                  <div className="text-sm font-medium">Select a category:</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {RECOMMENDATION_CATEGORIES.map((category) => {
                      const Icon = category.Icon;
                      return (
                        <Button
                          key={category.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openRecommendationDialog(category.id)}
                          className="justify-start gap-2 hover-elevate active-elevate-2"
                          data-testid={`button-category-${category.id}`}
                        >
                          <Icon className={`h-4 w-4 ${category.color}`} />
                          <span>{category.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {recommendations.length}/3 recommendations added
                  </div>
                </Card>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-file"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="hover-elevate active-elevate-2"
                  data-testid="button-upload-image"
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                  data-testid="input-video"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => videoInputRef.current?.click()}
                  className="hover-elevate active-elevate-2"
                  data-testid="button-upload-video"
                >
                  <Video className="h-5 w-5" />
                </Button>
                <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                  <SelectTrigger className="w-36 hover-elevate" data-testid="select-visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public" data-testid="option-visibility-public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Public</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="friends" data-testid="option-visibility-friends">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Friends</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private" data-testid="option-visibility-private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>Private</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={!content.trim() || isUploading}
                className="hover-elevate active-elevate-2"
                data-testid="button-create-post"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </>
          ) : allPosts.length > 0 ? (
            <>
              {allPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              
              {hasNextPage && (
                <div className="flex justify-center pt-4" data-testid="section-load-more">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    variant="outline"
                    size="lg"
                    className="hover-elevate active-elevate-2"
                    data-testid="button-load-more"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Load More
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="p-6">
              <div className="text-center text-muted-foreground" data-testid="text-empty-state">
                No posts yet. Share your tango journey!
              </div>
            </Card>
          )}
        </div>
        </main>
        
        <FeedRightSidebar />
      </div>

      {/* Recommendation Dialog */}
      <Dialog open={showRecommendationDialog} onOpenChange={setShowRecommendationDialog}>
        <DialogContent data-testid="dialog-recommendation">
          <DialogHeader>
            <DialogTitle>Add Recommendation</DialogTitle>
            <DialogDescription>
              Recommend a {RECOMMENDATION_CATEGORIES.find(c => c.id === selectedCategory)?.label.toLowerCase()} and specify its location.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rec-name">Name *</Label>
              <Input
                id="rec-name"
                placeholder={`Enter ${RECOMMENDATION_CATEGORIES.find(c => c.id === selectedCategory)?.label.toLowerCase()} name`}
                value={recName}
                onChange={(e) => setRecName(e.target.value)}
                data-testid="input-rec-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rec-city">City</Label>
              <Input
                id="rec-city"
                placeholder="e.g., Buenos Aires"
                value={recCity}
                onChange={(e) => setRecCity(e.target.value)}
                data-testid="input-rec-city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rec-country">Country</Label>
              <Input
                id="rec-country"
                placeholder="e.g., Argentina"
                value={recCountry}
                onChange={(e) => setRecCountry(e.target.value)}
                data-testid="input-rec-country"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRecommendationDialog(false);
                setRecName("");
                setRecCity("");
                setRecCountry("");
                setSelectedCategory(null);
              }}
              data-testid="button-cancel-rec"
            >
              Cancel
            </Button>
            <Button
              onClick={addRecommendation}
              data-testid="button-add-rec"
            >
              Add Recommendation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SelfHealingErrorBoundary>
  );
}

function PostCard({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const toggleLike = useToggleLike(post.id);
  const { data: comments, isLoading: commentsLoading } = useComments(post.id);
  const createComment = useCreateComment();
  const { toast } = useToast();

  const handleLike = async () => {
    try {
      await toggleLike.mutateAsync();
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await createComment.mutateAsync({
        postId: post.id,
        content: commentContent.trim(),
      });
      setCommentContent("");
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      toast({
        title: "Failed to add comment",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 hover-elevate" data-testid={`card-post-${post.id}`}>
      <div className="flex items-start gap-4">
        <Avatar data-testid={`avatar-${post.id}`}>
          <AvatarImage src={post.user?.profileImage || undefined} />
          <AvatarFallback>{post.user?.name?.charAt(0) || post.user?.username?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-foreground" data-testid={`text-post-author-${post.id}`}>
              {post.user?.name || post.user?.username || "Unknown User"}
            </span>
            <span className="text-sm text-muted-foreground" data-testid={`text-post-username-${post.id}`}>
              @{post.user?.username || "user"}
            </span>
            {post.createdAt && (
              <span className="text-sm text-muted-foreground" data-testid={`text-post-timestamp-${post.id}`}>
                · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            )}
          </div>
          <p className="text-foreground whitespace-pre-wrap" data-testid={`text-post-content-${post.id}`}>
            {post.content}
          </p>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              className="mt-3 rounded-lg w-full object-cover max-h-96"
              data-testid={`image-post-${post.id}`}
            />
          )}
        </div>
      </div>
      
      <div className="flex gap-6 mt-4 pt-4 border-t flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={toggleLike.isPending || toggleLike.isLikeLoading}
          className="hover-elevate active-elevate-2"
          data-testid={`button-like-${post.id}`}
        >
          <Heart className={`h-4 w-4 mr-2 ${toggleLike.isLiked ? 'fill-current text-red-500' : ''}`} />
          <span data-testid={`text-like-count-${post.id}`}>
            {post.likes || 0}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="hover-elevate active-elevate-2"
          data-testid={`button-comment-${post.id}`}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          <span data-testid={`text-comment-count-${post.id}`}>{comments?.length || 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hover-elevate active-elevate-2"
          data-testid={`button-share-${post.id}`}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t space-y-4" data-testid={`section-comments-${post.id}`}>
          <form onSubmit={handleCommentSubmit} className="flex gap-2 flex-wrap">
            <Textarea
              placeholder="Write a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="min-h-16 resize-none flex-1"
              data-testid={`input-comment-${post.id}`}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!commentContent.trim() || createComment.isPending}
              className="hover-elevate active-elevate-2"
              data-testid={`button-submit-comment-${post.id}`}
            >
              {createComment.isPending ? "..." : "Post"}
            </Button>
          </form>

          <div className="space-y-3">
            {commentsLoading ? (
              <>
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                ))}
              </>
            ) : comments && comments.length > 0 ? (
              comments.map((comment: any) => (
                <CommentItem key={comment.id} comment={comment} postId={post.id} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4" data-testid={`text-no-comments-${post.id}`}>
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function CommentItem({ comment, postId }: { comment: any; postId: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useAuth();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const { toast } = useToast();

  const isOwner = user?.id === comment.userId;
  const isPending = String(comment.id).startsWith('temp-');

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast({
        title: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateComment.mutateAsync({
        commentId: comment.id,
        content: editContent.trim(),
        postId,
      });
      setIsEditing(false);
      toast({
        title: "Comment updated!",
      });
    } catch (error) {
      toast({
        title: "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment.mutateAsync({ commentId: comment.id, postId });
      setShowDeleteDialog(false);
      toast({
        title: "Comment deleted!",
      });
    } catch (error) {
      toast({
        title: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div 
        className={`flex gap-3 ${isPending ? 'opacity-50' : ''}`} 
        data-testid={`comment-${comment.id}`}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user?.profileImage || undefined} />
          <AvatarFallback>
            {comment.user?.name?.charAt(0) || comment.user?.username?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-sm">
                {comment.user?.name || comment.user?.username || "Unknown User"}
              </span>
              {isOwner && !isPending && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 hover-elevate active-elevate-2" data-testid={`button-comment-menu-${comment.id}`}><MoreVertical className="h-3 w-3" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      data-testid={`button-edit-comment-${comment.id}`}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                      data-testid={`button-delete-comment-${comment.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-16 text-sm"
                  data-testid={`input-edit-comment-${comment.id}`}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={updateComment.isPending}
                    className="hover-elevate active-elevate-2"
                    data-testid={`button-save-comment-${comment.id}`}
                  >
                    {updateComment.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="hover-elevate active-elevate-2"
                    data-testid={`button-cancel-edit-${comment.id}`}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>
          {comment.created_at && (
            <span className="text-xs text-muted-foreground mt-1 block">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              {isPending && " (sending...)"}
            </span>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid={`button-cancel-delete-${comment.id}`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-testid={`button-confirm-delete-${comment.id}`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

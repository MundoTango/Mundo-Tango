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
import { PostReactions } from "@/components/feed/PostReactions";
import { PostActions } from "@/components/feed/PostActions";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { SEO } from "@/components/SEO";
import { FeedRightSidebar } from "@/components/FeedRightSidebar";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PostCreator } from "@/components/universal/PostCreator";
import { SmartPostFeed } from "@/components/feed/SmartPostFeed";
import { UpcomingEventsSidebar } from "@/components/feed/UpcomingEventsSidebar";
import { ConnectionStatusBadge } from "@/components/feed/ConnectionStatusBadge";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";
import { PostItem } from "@/components/feed/PostItem";
import { EditPostDialog } from "@/components/modals/EditPostDialog";
import { Link } from "wouter";

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
  
  // Edit/Delete state
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingPostContent, setEditingPostContent] = useState("");
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [recName, setRecName] = useState("");
  const [recLocation, setRecLocation] = useState("");
  const [recCoordinates, setRecCoordinates] = useState<{lat: number; lng: number} | undefined>(undefined);
  
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
            const response = await apiRequest('GET', `/api/mentions/search?query=${encodeURIComponent(textAfterAt)}`);
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

    setRecommendations(prev => [...prev, { 
      category: selectedCategory!, 
      name: recName.trim(),
      location: recLocation || undefined
    }]);
    
    setShowRecommendationDialog(false);
    setRecName("");
    setRecLocation("");
    setRecCoordinates(undefined);
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
        title="Memory Feed - Mundo Tango"
        description="Connect with the global tango community. Share memories, discover events, and engage with fellow dancers from around the world."
      />
      <div className="flex gap-6 p-6 max-w-7xl mx-auto">
        {/* Main Feed Column */}
        <div className="flex-1 max-w-3xl space-y-6">
          {/* Connection Status Badge */}
          <div className="flex justify-end">
            <ConnectionStatusBadge />
          </div>

          {/* New Posts Banner */}
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

          {/* Post Creator */}
          <PostCreator
            onPostCreated={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
              toast({
                title: "🎉 Memory shared!",
                description: "Your memory has been posted to the community.",
              });
            }}
            context={{ type: 'feed' }}
          />

          {/* Smart Post Feed with Search & Filters */}
          <SmartPostFeed posts={allPosts}>
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
                    <PostItem 
                      key={post.id} 
                      post={post}
                      onEdit={(postId) => {
                        const postToEdit = allPosts.find(p => p.id === postId);
                        if (postToEdit) {
                          setEditingPostId(postId);
                          setEditingPostContent(postToEdit.content);
                        }
                      }}
                      onDelete={(postId) => {
                        setDeletingPostId(postId);
                      }}
                    />
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
          </SmartPostFeed>
        </div>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-80 space-y-6 sticky top-20 h-fit">
          <UpcomingEventsSidebar />
          <FeedRightSidebar />
        </aside>
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
              <Label htmlFor="rec-location">Location</Label>
              <UnifiedLocationPicker
                value={recLocation}
                coordinates={recCoordinates}
                onChange={(location, coords) => {
                  setRecLocation(location);
                  setRecCoordinates(coords);
                }}
                placeholder="Search for a location..."
                data-testid="input-rec-location"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRecommendationDialog(false);
                setRecName("");
                setRecLocation("");
                setRecCoordinates(undefined);
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

      {/* Edit Post Dialog */}
      <EditPostDialog
        open={editingPostId !== null}
        onOpenChange={(open) => !open && setEditingPostId(null)}
        postId={editingPostId || 0}
        initialContent={editingPostContent}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingPostId !== null} onOpenChange={(open) => !open && setDeletingPostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deletingPostId) {
                  try {
                    await apiRequest("DELETE", `/api/posts/${deletingPostId}`);
                    queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
                    toast({
                      title: "Post deleted",
                      description: "Your post has been deleted",
                    });
                  } catch (error) {
                    toast({
                      title: "Delete failed",
                      description: "Could not delete post",
                      variant: "destructive",
                    });
                  }
                  setDeletingPostId(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SelfHealingErrorBoundary>
  );
}

function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const toggleLike = useToggleLike(post.id);
  const { data: comments, isLoading: commentsLoading } = useComments(post.id);
  const createComment = useCreateComment();
  const { toast } = useToast();
  
  // Parse @mentions from content if exists (they're stored as JSON strings)
  const mentions = ((post as any).mentions || []).map((m: string) => {
    try {
      return typeof m === 'string' ? JSON.parse(m) : m;
    } catch {
      return null;
    }
  }).filter(Boolean);
  
  // Render content with clickable @mentions as colored pills
  const renderContentWithMentions = (content: string) => {
    if (!content) return content;
    
    // New format: @[DisplayName](id:type)
    const mentionRegex = /@\[([^\]]+)\]\((\d+):([^)]+)\)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;
    let matchIndex = 0;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      
      const displayName = match[1];
      const mentionId = match[2];
      const mentionType = match[3];
      
      // MT Ocean themed colors based on type
      let pillStyle: React.CSSProperties = {};
      let icon = '👤';
      
      if (mentionType === 'event') {
        // Event (blue)
        pillStyle = {
          background: 'linear-gradient(135deg, rgba(30, 144, 255, 0.2), rgba(59, 130, 246, 0.2))',
          borderColor: 'rgba(30, 144, 255, 0.5)',
          color: 'rgb(30, 144, 255)',
          padding: '2px 8px',
          borderRadius: '6px',
          border: '1px solid',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontWeight: '500',
        };
        icon = '📅';
      } else if (mentionType === 'group' || mentionType === 'professional_group') {
        if (mentionType === 'professional_group') {
          // Professional Group (purple)
          pillStyle = {
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(168, 85, 247, 0.2))',
            borderColor: 'rgba(147, 51, 234, 0.5)',
            color: 'rgb(147, 51, 234)',
            padding: '2px 8px',
            borderRadius: '6px',
            border: '1px solid',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: '500',
          };
          icon = '👔';
        } else {
          // City Group (green)
          pillStyle = {
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))',
            borderColor: 'rgba(34, 197, 94, 0.5)',
            color: 'rgb(34, 197, 94)',
            padding: '2px 8px',
            borderRadius: '6px',
            border: '1px solid',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: '500',
          };
          icon = '🏙️';
        }
      } else {
        // User (cyan - MT Ocean default)
        pillStyle = {
          background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.2), rgba(34, 211, 238, 0.2))',
          borderColor: 'rgba(64, 224, 208, 0.5)',
          color: 'rgb(64, 224, 208)',
          padding: '2px 8px',
          borderRadius: '6px',
          border: '1px solid',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontWeight: '500',
        };
        icon = '👤';
      }
      
      parts.push(
        <span 
          key={`mention-${matchIndex++}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-semibold text-xs hover:scale-105 transition-all cursor-pointer shadow-sm"
          style={pillStyle}
          data-testid={`mention-pill-${mentionId}`}
        >
          <span className="text-sm">{icon}</span>
          <span>{displayName}</span>
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    
    return parts.length > 0 ? <>{parts}</> : content;
  };

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
    <Card 
      className="p-6 hover-elevate" 
      style={{
        background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.15), rgba(30, 144, 255, 0.12), rgba(100, 180, 255, 0.08))',
        backdropFilter: 'blur(12px)',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderImage: 'linear-gradient(135deg, rgba(64, 224, 208, 0.4), rgba(30, 144, 255, 0.3)) 1',
        boxShadow: '0 4px 16px rgba(64, 224, 208, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
      data-testid={`card-post-${post.id}`}
    >
      <div className="flex items-start gap-4">
        <Avatar data-testid={`avatar-${post.id}`}>
          <AvatarImage src={post.user?.profileImage || undefined} />
          <AvatarFallback>{post.user?.name?.charAt(0) || post.user?.username?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-foreground flex items-center gap-1" data-testid={`text-post-author-${post.id}`}>
              {post.user?.name || post.user?.username || "Unknown User"}
              {(post.user as any)?.role && (
                <span className="text-base" title={(post.user as any).role}>
                  {(post.user as any).role === 'god' ? '👑' : 
                   (post.user as any).role === 'super_admin' ? '⚡' :
                   (post.user as any).role === 'admin' ? '🛡️' :
                   (post.user as any).role === 'moderator' ? '🔧' :
                   (post.user as any).role === 'teacher' ? '🎓' :
                   (post.user as any).role === 'premium' ? '⭐' : null}
                </span>
              )}
            </span>
            <span className="text-sm text-muted-foreground" data-testid={`text-post-username-${post.id}`}>
              @{post.user?.username || "user"}
            </span>
            {post.createdAt && (
              <span className="text-sm text-muted-foreground" data-testid={`text-post-timestamp-${post.id}`}>
                · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            )}
            {(post as any).isRecommendation && (
              <Badge 
                className="ml-auto"
                style={{
                  background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.9), rgba(251, 146, 60, 0.9))',
                  color: 'white',
                  borderColor: 'transparent'
                }}
                data-testid={`badge-hidden-gem-${post.id}`}
              >
                <MapPin className="w-3 h-3 mr-1" />
                Hidden Gem
              </Badge>
            )}
          </div>
          <p className="text-foreground whitespace-pre-wrap mb-2" data-testid={`text-post-content-${post.id}`}>
            {renderContentWithMentions(post.content)}
          </p>
          
          {/* Location Display */}
          {(post as any).location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <MapPin className="w-4 h-4 text-cyan-500" />
              <span>{(post as any).location}</span>
              {(post as any).priceRange && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {(post as any).priceRange}
                </Badge>
              )}
            </div>
          )}
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
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t flex-wrap gap-4">
        <div className="flex gap-4 flex-wrap">
          <PostReactions
            postId={post.id}
            initialReactions={{}}
            userReaction={null}
          />
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
        <PostActions
          postId={post.id}
          postContent={post.content}
          isOwnPost={post.userId === user?.id}
        />
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

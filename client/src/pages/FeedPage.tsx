import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect, useCallback, Fragment, useMemo, lazy, Suspense } from "react";
import { usePosts, useCreatePost, useToggleLike, useComments, useCreateComment, useUpdateComment, useDeleteComment } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, MessageCircle, Share2, Image as ImageIcon, Globe, Users, Lock, X, Loader2, MoreVertical, Pencil, Trash2, ChevronDown, Music2, Plane, Sparkles, GraduationCap, PartyPopper, Star, Home, Utensils, ShoppingBag, Wrench, Video, MapPin, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { PostActions } from "@/components/feed/PostActions";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";
import { FeedRightSidebar } from "@/components/FeedRightSidebar";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PostCreator } from "@/components/universal/PostCreator";
import { SmartPostFeed } from "@/components/feed/SmartPostFeed";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";
import { PostItem } from "@/components/feed/PostItem";
import { EditPostDialog } from "@/components/modals/EditPostDialog";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { InfiniteScrollFeed } from "@/components/feed/InfiniteScrollFeed";
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";
import { NewPostsBanner } from "@/components/feed/NewPostsBanner";
import { Link } from "wouter";
import { FeedAd } from "@/components/ads/FeedAd";

// Lazy load heavy sidebar components to improve initial page load
const StoriesCarousel = lazy(() => import("@/components/feed/StoriesCarousel").then(m => ({ default: m.StoriesCarousel })));
const UpcomingEventsSidebar = lazy(() => import("@/components/feed/UpcomingEventsSidebar").then(m => ({ default: m.UpcomingEventsSidebar })));

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
    tangoRoles?: string[] | null;
  };
};

const TANGO_TAGS = [
  { name: "Milonga", Icon: Music2, color: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" },
  { name: "Práctica", Icon: Users, color: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  { name: "Performance", Icon: Star, color: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  { name: "Workshop", Icon: GraduationCap, color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  { name: "Festival", Icon: PartyPopper, color: "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800" },
  { name: "Travel", Icon: Plane, color: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800" },
  { name: "Music", Icon: Music2, color: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" },
  { name: "Fashion", Icon: Sparkles, color: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
];

const TANGO_QUOTES = [
  { quote: "Tango is a feeling danced out", author: "Jorge Luis Borges" },
  { quote: "Tango is passion, tango is love, tango is life", author: "Carlos Gardel" },
  { quote: "In tango, two hearts beat as one", author: "Traditional" },
  { quote: "Dance as if nobody's watching, love as if you've never been hurt", author: "Mark Twain" },
  { quote: "The tango is the dance of freedom", author: "Argentine Proverb" },
  { quote: "Tango is the vertical expression of a horizontal desire", author: "Jorge Luis Borges" },
  { quote: "Music is life, and tango is the beat of the soul", author: "Traditional" },
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
  const { t } = useTranslation(["pages", "common"]);
  // Feed algorithm state (Features 12-13)
  const [feedType, setFeedType] = useState<"following" | "discover">("following");
  const [filter, setFilter] = useState<"all" | "friends" | "public" | "saved" | "my-posts" | "mentions">("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
  const [postType, setPostType] = useState<"post" | "story">("post");
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
  
  // Fetch stories
  const { data: stories = [], isLoading: storiesLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/stories"],
  });
  
  const { 
    data, 
    isLoading,
    isError,
    error,
    isFetchingNextPage, 
    hasNextPage, 
    fetchNextPage,
    newPostsAvailable,
    loadNewPosts,
    refetch
  } = usePosts();
  const createPost = useCreatePost();
  const { toast } = useToast();

  const allPosts = data?.pages.flat() || [];

  // Cycle through tango quotes every 10 seconds (less distracting)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % TANGO_QUOTES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
        type: postType,
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
      setPostType("post");
      setSelectedTags([]);
      setRecommendations([]);
      setMentions([]);
      handleRemoveImage();
      handleRemoveVideo();
      
      // Invalidate stories query if creating a story
      if (postType === 'story') {
        queryClient.invalidateQueries({ queryKey: ["/api/posts/stories"] });
      }
      
      toast({
        title: postType === 'story' ? "Story created!" : "Post created!",
        description: postType === 'story' 
          ? "Your story will expire in 24 hours."
          : "Your post has been shared with the community.",
      });
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({
        title: postType === 'story' ? "Failed to create story" : "Failed to create post",
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
      
      {/* Editorial Hero Section - Quote Carousel */}
      <div className="relative h-[25vh] md:h-[30vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1600&auto=format&fit=crop')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            key={currentQuoteIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-2xl md:text-3xl lg:text-4xl font-serif text-white font-bold leading-tight mb-2 italic" data-testid="text-page-quote">
              "{TANGO_QUOTES[currentQuoteIndex].quote}"
            </p>
            <p className="text-sm md:text-base text-white/70">
              — {TANGO_QUOTES[currentQuoteIndex].author}
            </p>
          </motion.div>
        </div>
      </div>

      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-12 gap-6 px-6 py-12 max-w-7xl mx-auto">
        {/* Main Feed Column */}
        <main className="col-span-12 lg:col-span-9 space-y-6">
          {/* Instagram-style Stories Carousel - Lazy loaded */}
          <Suspense fallback={<Card className="p-4 h-24 bg-muted animate-pulse" />}>
            <StoriesCarousel />
          </Suspense>

          {/* Feed Tabs - Following vs Discover (Feature 13) */}
          <FeedTabs value={feedType} onChange={setFeedType} />

          {/* New Posts Banner (Feature 15) */}
          <NewPostsBanner onLoadNewPosts={() => setRefreshKey(prev => prev + 1)} />

          {/* Post Creator */}
          <PostCreator
            onPostCreated={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
              queryClient.invalidateQueries({ queryKey: ['/api/posts/stories'] });
              queryClient.invalidateQueries({ queryKey: ['infinite-feed'] });
              setRefreshKey(prev => prev + 1);
              toast({
                title: "🎉 Memory shared!",
                description: "Your memory has been posted to the community.",
              });
            }}
            context={{ type: 'feed' }}
            showStoryToggle={true}
          />

          {/* Infinite Scroll Feed (Feature 14) */}
          <InfiniteScrollFeed 
            feedType={feedType} 
            filter={filter}
            onRefresh={refreshKey > 0 ? () => {} : undefined}
          />
        </main>

        {/* Right Sidebar - Upcoming Events - Lazy loaded */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <Suspense fallback={<Card className="p-4 h-32 bg-muted animate-pulse" />}>
            <UpcomingEventsSidebar />
          </Suspense>
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

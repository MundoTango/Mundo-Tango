import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { PostItem } from "./PostItem";
import { UnifiedMemoriesFeed } from "./UnifiedMemoriesFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PostCreator } from "@/components/universal/PostCreator";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

type FeedType = "following" | "discover" | "personalized";
type FilterType = "all" | "friends" | "public" | "saved" | "my-posts" | "mentions";

interface InfiniteScrollFeedProps {
  feedType: FeedType;
  filter: FilterType;
  onRefresh?: () => void;
}

interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  videoThumbnail?: string | null;
  visibility: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
    tangoRoles?: string[];
  };
  likes: number;
  comments: number;
  shares: number;
  currentReaction?: string | null;
}

interface FeedResponse {
  posts: Post[];
  nextOffset: number | null;
  hasMore: boolean;
}

export function InfiniteScrollFeed({ feedType, filter, onRefresh }: InfiniteScrollFeedProps) {
  const { t } = useTranslation("pages");
  const { toast } = useToast();
  const { user } = useAuth();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const handleEdit = (postId: number) => {
    // Safely flatten all posts from pages - handle undefined/null
  let allPosts: any[] = [];
  try {
    if (data?.pages && Array.isArray(data.pages)) {
      allPosts = data.pages.flatMap((page) => {
        if (!page || !page.posts) return [];
        return Array.isArray(page.posts) ? page.posts : [];
      }).filter((post) => post && post.id);
    }
  } catch (e) {
    console.error('[InfiniteScrollFeed] Error flattening posts:', e);
  }
    const postToEdit = allPosts.find(p => p.id === postId);
    if (postToEdit) {
      setEditingPost(postToEdit);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm(t("feed.posts.deleteConfirm"))) return;
    
    try {
      await apiRequest('DELETE', `/api/posts/${postId}`);
      queryClient.invalidateQueries({ queryKey: ['infinite-feed'] });
      toast({
        title: t("feed.posts.deleted"),
        description: t("feed.posts.deletedDescription"),
      });
    } catch (error) {
      toast({
        title: t("feed.posts.deleteError"),
        description: t("feed.posts.deleteErrorDescription"),
        variant: "destructive",
      });
    }
  };

  const token = localStorage.getItem('accessToken');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery<FeedResponse>({
    queryKey: ['infinite-feed', feedType, filter],
    queryFn: async ({ pageParam = 0 }) => {
      let endpoint = `/api/feed/${feedType}`;
      
      // Apply filters based on filter type
      if (filter === "friends") {
        endpoint = `/api/feed/following`;
      } else if (filter === "public") {
        endpoint = `/api/posts?visibility=public`;
      } else if (filter === "saved") {
        endpoint = `/api/saved-posts`;
      } else if (filter === "my-posts") {
        endpoint = `/api/posts?userId=${localStorage.getItem('userId')}`;
      } else if (filter === "mentions") {
        endpoint = `/api/posts/mentions`;
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${endpoint}?limit=20&offset=${pageParam}`, {
        credentials: 'include',
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please refresh the page');
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch feed`);
      }
      
      const result = await response.json();
      
      // Handle different response formats
      if (Array.isArray(result)) {
        return {
          posts: result,
          nextOffset: result.length === 20 ? (pageParam as number) + 20 : null,
          hasMore: result.length === 20,
        };
      }
      
      return result as FeedResponse;
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
    enabled: !!token || !!user,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Auto-load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Trigger refresh if onRefresh is provided
  useEffect(() => {
    if (onRefresh) {
      refetch();
    }
  }, [onRefresh]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="feed-loading">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-40 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t("feed.posts.errorLoading")}</h3>
        <p className="text-sm text-foreground/60 mb-4">
          {t("feed.posts.errorDescription")}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover-elevate active-elevate-2"
        >
          {t("feed.posts.retry")}
        </button>
      </div>
    );
  }

  // Safely flatten all posts from pages - handle undefined/null
  let allPosts: any[] = [];
  try {
    if (data?.pages && Array.isArray(data.pages)) {
      allPosts = data.pages.flatMap((page) => {
        if (!page || !page.posts) return [];
        return Array.isArray(page.posts) ? page.posts : [];
      }).filter((post) => post && post.id);
    }
  } catch (e) {
    console.error('[InfiniteScrollFeed] Error flattening posts:', e);
  }

  // Empty state with actionable guidance
  if (allPosts.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-12 text-center"
        role="status"
        aria-label="No posts available"
        data-testid="empty-state-feed"
      >
        <div className="p-4 rounded-full bg-muted mb-4">
          <Camera className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t("feed.posts.noPostsYet")}</h3>
        <p className="text-sm text-foreground/60 max-w-sm">
          {feedType === 'following' 
            ? t("feed.posts.followMoreDancers")
            : t("feed.posts.beFirstToShare")}
        </p>
        <div className="flex gap-3 mt-4">
          {feedType === 'following' && (
            <a
              href="/discover"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover-elevate active-elevate-2 text-sm"
              data-testid="link-discover-dancers"
            >
              {t("feed.posts.discoverDancers")}
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="infinite-scroll-feed">
      {/* Use UnifiedMemoriesFeed for consistent post rendering */}
      <UnifiedMemoriesFeed
        posts={allPosts}
        isLoading={false}
        context={{ type: 'feed' }}
        showPostCreator={false}
        showFilters={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Infinite scroll trigger */}
      <div ref={ref} className="w-full py-4" data-testid="infinite-scroll-trigger">
        {isFetchingNextPage ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        ) : hasNextPage ? (
          <div className="text-center text-sm text-foreground/60">
            {t("feed.posts.scrollForMore", "Scroll for more posts...")}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-foreground/60" data-testid="text-end-of-feed">
            <p className="font-medium">{t("feed.posts.endOfFeed")}</p>
            <p className="mt-1">{t("feed.posts.endOfFeedDescription")}</p>
          </div>
        )}
      </div>

      {/* Edit post dialog */}
      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-post-creator">
          <DialogHeader>
            <DialogTitle>{t("feed.dialogs.editTitle")}</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <PostCreator
              editMode={true}
              existingPost={editingPost}
              onPostCreated={() => {
                setEditingPost(null);
                queryClient.invalidateQueries({ queryKey: ['infinite-feed'] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

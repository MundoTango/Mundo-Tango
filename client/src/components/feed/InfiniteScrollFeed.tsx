import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { PostItem } from "./PostItem";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

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
  visibility: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
  };
  likes: number;
  comments: number;
  shares: number;
}

interface FeedResponse {
  posts: Post[];
  nextOffset: number | null;
  hasMore: boolean;
}

export function InfiniteScrollFeed({ feedType, filter, onRefresh }: InfiniteScrollFeedProps) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

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

      const response = await fetch(`${endpoint}?limit=20&offset=${pageParam}`);
      if (!response.ok) throw new Error('Failed to fetch feed');
      
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
        <h3 className="text-lg font-semibold mb-2">Failed to load feed</h3>
        <p className="text-sm text-foreground/60 mb-4">
          There was an error loading your feed. Please try again.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover-elevate active-elevate-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  // Empty state
  if (allPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-foreground/60">
          No posts to display
        </p>
        <p className="text-sm text-foreground/40 mt-2">
          Try changing your filter or following more users
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="infinite-scroll-feed">
      {allPosts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}

      {/* Infinite scroll trigger */}
      <div ref={ref} className="w-full py-4">
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
            Scroll for more posts...
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-foreground/60">
            <p className="font-medium">You've reached the end!</p>
            <p className="mt-1">No more posts to show</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Search, TrendingUp, Clock, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/posts/PostCard";

type FilterType = "all" | "following" | "popular" | "recent";

interface SmartPostFeedProps {
  context?: {
    type?: 'feed' | 'event' | 'group';
    id?: string;
  };
  showSearch?: boolean;
  showFilters?: boolean;
}

export default function SmartPostFeed({ 
  context = { type: 'feed' }, 
  showSearch = true,
  showFilters = true 
}: SmartPostFeedProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch posts
  const { data, isLoading, isFetching } = useQuery<{ posts: any[], hasMore: boolean }>({
    queryKey: ['/api/posts', { 
      filter, 
      search: debouncedSearch,
      page,
      context: context.type,
      contextId: context.id,
    }],
  });

  const posts = data?.posts || [];
  const hasMore = data?.hasMore || false;

  // Infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [inView, hasMore, isFetching]);

  const filters: { id: FilterType; label: string; icon: any }[] = [
    { id: "all", label: "All Posts", icon: TrendingUp },
    { id: "following", label: "Following", icon: Users },
    { id: "popular", label: "Popular", icon: TrendingUp },
    { id: "recent", label: "Recent", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="space-y-4">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="pl-10"
              style={{
                borderColor: 'rgba(64, 224, 208, 0.2)',
              }}
              data-testid="input-search-posts"
            />
          </div>
        )}

        {showFilters && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((f) => {
              const Icon = f.icon;
              return (
                <Button
                  key={f.id}
                  onClick={() => {
                    setFilter(f.id);
                    setPage(1);
                  }}
                  variant={filter === f.id ? "default" : "outline"}
                  size="sm"
                  className="gap-2 whitespace-nowrap"
                  style={
                    filter === f.id
                      ? {
                          background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                          color: 'white',
                        }
                      : {}
                  }
                  data-testid={`filter-${f.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {f.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {isLoading ? (
          // Loading skeletons
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border p-6 space-y-4">
                <div className="flex gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Load More Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="py-4 text-center">
                {isFetching ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#40E0D0' }} />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Scroll for more...</div>
                )}
              </div>
            )}
          </>
        ) : (
          // Empty state
          <div 
            className="rounded-xl border p-12 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(12px)',
              borderColor: 'rgba(64, 224, 208, 0.2)',
            }}
          >
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold mb-2">No memories yet</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "No memories found matching your search"
                : "Start sharing your tango journey by creating your first memory"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

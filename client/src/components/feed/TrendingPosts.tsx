import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Heart, MessageCircle, Share2 } from "lucide-react";
import { Link } from "wouter";
import { safeDateDistance } from "@/lib/safeDateFormat";

interface TrendingPost {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
  };
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
}

export function TrendingPosts() {
  const { data: posts, isLoading } = useQuery<TrendingPost[]>({
    queryKey: ['trending-posts'],
    queryFn: async () => {
      const response = await fetch('/api/feed/trending?limit=5');
      if (!response.ok) throw new Error('Failed to fetch trending posts');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  return (
    <Card className="hidden lg:block sticky top-20" data-testid="trending-posts">
      <CardHeader className="space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending Now
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </>
        ) : posts && posts.length > 0 ? (
          posts.map((post, index) => (
            <Link key={post.id} href={`/feed?post=${post.id}`}>
              <div 
                className="hover-elevate active-elevate-2 p-3 rounded-lg cursor-pointer transition-all group"
                data-testid={`trending-post-${post.id}`}
              >
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0">
                    #{index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.user.profileImage || undefined} />
                        <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">
                        {post.user.name}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 line-clamp-2 mb-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-foreground/60">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        {post.shares}
                      </span>
                      <span className="ml-auto">
                        {safeDateDistance(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-foreground/60 text-center py-4">
            No trending posts yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}

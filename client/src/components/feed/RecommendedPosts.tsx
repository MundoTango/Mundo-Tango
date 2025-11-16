import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Heart, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { safeDateDistance } from "@/lib/safeDateFormat";

interface RecommendedPost {
  id: number;
  content: string;
  imageUrl?: string | null;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
  };
  likes: number;
  comments: number;
  createdAt: string;
}

export function RecommendedPosts() {
  const { data: posts, isLoading } = useQuery<RecommendedPost[]>({
    queryKey: ['recommended-posts'],
    queryFn: async () => {
      const response = await fetch('/api/feed/recommended?limit=6');
      if (!response.ok) throw new Error('Failed to fetch recommended posts');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <section className="my-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended for You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="my-8" data-testid="recommended-posts">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Recommended for You
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <Link key={post.id} href={`/feed?post=${post.id}`}>
            <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all overflow-hidden h-full">
              {post.imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt="Post image"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.user.profileImage || undefined} />
                    <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {post.user.name}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {safeDateDistance(post.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-sm line-clamp-3 mb-3">
                  {post.content}
                </p>
                <div className="flex items-center gap-4 text-xs text-foreground/60">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {post.comments}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

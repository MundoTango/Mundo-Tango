import { useState } from "react";
import { usePosts, useCreatePost, useToggleLike } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { SEO } from "@/components/SEO";

export default function FeedPage() {
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const { data: posts, isLoading } = usePosts();
  const createPost = useCreatePost();
  const { toast } = useToast();

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createPost.mutateAsync({
        content: content.trim(),
        visibility: 'public',
      });
      setContent("");
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
    } catch (error) {
      toast({
        title: "Failed to create post",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <SEO
        title="Home Feed"
        description="Connect with the tango community. Share your dance moments, discover events, and engage with fellow tango enthusiasts from around the world."
      />
      <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Share your thoughts</h2>
        </CardHeader>
        <form onSubmit={handleCreatePost}>
          <CardContent>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-24"
              data-testid="input-post-content"
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={!content.trim() || createPost.isPending}
              data-testid="button-create-post"
            >
              {createPost.isPending ? "Posting..." : "Post"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No posts yet. Be the first to share something!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}

function PostCard({ post }: { post: any }) {
  const toggleLike = useToggleLike();

  const handleLike = async () => {
    try {
      await toggleLike.mutateAsync(post.id);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  return (
    <Card data-testid={`card-post-${post.id}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={post.profiles?.avatar_url || undefined} />
            <AvatarFallback>{post.profiles?.full_name?.charAt(0) || post.profiles?.username?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold" data-testid="text-post-author">
                {post.profiles?.full_name || post.profiles?.username || "Unknown User"}
              </span>
              <span className="text-sm text-muted-foreground">
                @{post.profiles?.username}
              </span>
              {post.created_at && (
                <span className="text-sm text-muted-foreground">
                  · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              )}
            </div>
            <p className="text-foreground whitespace-pre-wrap" data-testid="text-post-content">
              {post.content}
            </p>
            {post.image_url && (
              <img
                src={post.image_url}
                alt=""
                className="mt-3 rounded-lg w-full object-cover max-h-96"
              />
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-6 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={toggleLike.isPending}
          data-testid={`button-like-${post.id}`}
        >
          <Heart className="h-4 w-4 mr-2" />
          {post.likes || 0}
        </Button>
        <Button variant="ghost" size="sm" data-testid={`button-comment-${post.id}`}>
          <MessageCircle className="h-4 w-4 mr-2" />
          {post.comments || 0}
        </Button>
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
}

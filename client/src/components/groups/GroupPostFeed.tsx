import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, MessageCircle, Share2, Pin, MoreVertical, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { SelectGroupPost } from "@shared/schema";
const postFormSchema = z.object({
  content: z.string().min(1, "Post content is required"),
  title: z.string().optional(),
  postType: z.string().default("discussion"),
  mediaUrls: z.array(z.string()).optional(),
  mediaType: z.string().optional(),
});

type PostFormData = z.infer<typeof postFormSchema>;

interface GroupPostFeedProps {
  groupId: number;
  canPost?: boolean;
  canModerate?: boolean;
}

export function GroupPostFeed({ groupId, canPost = false, canModerate = false }: GroupPostFeedProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: "",
      postType: "discussion",
    },
  });

  const { data: posts, isLoading } = useQuery<SelectGroupPost[]>({
    queryKey: ["/api/groups", groupId, "posts"],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/posts`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const createPost = useMutation({
    mutationFn: async (data: PostFormData) => {
      const res = await apiRequest("POST", `/api/groups/${groupId}/posts`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "posts"] });
      toast({
        title: "Post created",
        description: "Your post has been published to the group.",
      });
      form.reset();
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create post",
        description: error.message,
      });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("DELETE", `/api/groups/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "posts"] });
      toast({
        title: "Post deleted",
        description: "The post has been removed from the group.",
      });
    },
  });

  const pinPost = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("POST", `/api/groups/posts/${postId}/pin`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "posts"] });
      toast({
        title: "Post pinned",
        description: "This post is now pinned at the top of the feed.",
      });
    },
  });

  const unpinPost = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("POST", `/api/groups/posts/${postId}/unpin`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "posts"] });
      toast({
        title: "Post unpinned",
        description: "This post has been unpinned.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Post */}
      {canPost && (
        <Card>
          <CardContent className="pt-6">
            {!isCreating ? (
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground"
                onClick={() => setIsCreating(true)}
                data-testid="button-start-create-post"
              >
                Share something with the group...
              </Button>
            ) : (
              <form onSubmit={form.handleSubmit((data) => createPost.mutate(data))} className="space-y-3">
                <Textarea
                  placeholder="What's on your mind?"
                  {...form.register("content")}
                  rows={4}
                  data-testid="input-post-content"
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      form.reset();
                    }}
                    data-testid="button-cancel-post"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPost.isPending}
                    data-testid="button-submit-post"
                  >
                    {createPost.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts
            .sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            })
            .map((post) => (
              <Card key={post.id} data-testid={`card-post-${post.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">User #{post.authorId}</p>
                          {post.isPinned && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Pin className="h-3 w-3" />
                              Pinned
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {canModerate && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-post-menu-${post.id}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {post.isPinned ? (
                            <DropdownMenuItem onClick={() => unpinPost.mutate(post.id)}>
                              Unpin Post
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => pinPost.mutate(post.id)}>
                              <Pin className="h-4 w-4 mr-2" />
                              Pin Post
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => deletePost.mutate(post.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {post.title && <h3 className="font-semibold mb-2">{post.title}</h3>}
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </CardContent>
                <CardFooter className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="gap-1" data-testid={`button-like-${post.id}`}>
                    <Heart className="h-4 w-4" />
                    {post.likeCount || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1" data-testid={`button-comment-${post.id}`}>
                    <MessageCircle className="h-4 w-4" />
                    {post.commentCount || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1" data-testid={`button-share-${post.id}`}>
                    <Share2 className="h-4 w-4" />
                    {post.shareCount || 0}
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No posts yet. {canPost && "Be the first to share something!"}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

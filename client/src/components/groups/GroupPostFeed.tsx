import { useState, memo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { safeDateDistance } from "@/lib/safeDateFormat";
import type { SelectGroupPost } from "@shared/schema";
import { renderMentionPills } from "@/utils/renderMentionPills";
import { PostCreator } from "@/components/universal/PostCreator";

interface GroupPostFeedProps {
  groupId: number;
  groupName?: string;
  canPost?: boolean;
  canModerate?: boolean;
}

function GroupPostFeedComponent({ groupId, groupName = "Group", canPost = false, canModerate = false }: GroupPostFeedProps) {
  const { toast } = useToast();

  const { data: posts, isLoading } = useQuery<SelectGroupPost[]>({
    queryKey: ["/api/groups", groupId, "posts"],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/posts`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "posts"] });
  };

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
      {/* Create Post with PostCreator - includes FB/IG cross-posting */}
      {canPost && (
        <PostCreator 
          onPostCreated={handlePostCreated}
          context={{ 
            type: 'group', 
            id: String(groupId),
            name: groupName 
          }}
          className="mb-2"
          data-testid="group-post-creator"
        />
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
                          {post.createdAt && safeDateDistance(post.createdAt, { addSuffix: true })}
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
                  <div className="whitespace-pre-wrap">{renderMentionPills(post.content)}</div>
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

export const GroupPostFeed = memo(GroupPostFeedComponent);

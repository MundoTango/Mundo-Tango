import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PostActionsProps {
  postId: number;
  authorId: number;
  currentUserId: number;
  initialLiked?: boolean;
  initialSaved?: boolean;
  likeCount?: number;
  commentCount?: number;
}

export function PostActions({
  postId,
  authorId,
  currentUserId,
  initialLiked = false,
  initialSaved = false,
  likeCount = 0,
  commentCount = 0,
}: PostActionsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likes, setLikes] = useState(likeCount);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => apiRequest(`/api/posts/${postId}/like`, "POST"),
    onMutate: () => {
      // Optimistic update
      setLiked(true);
      setLikes(likes + 1);
    },
    onError: () => {
      // Rollback
      setLiked(false);
      setLikes(likes - 1);
      toast({ title: "Failed to like post", variant: "destructive" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  // Unlike mutation
  const unlikeMutation = useMutation({
    mutationFn: () => apiRequest(`/api/posts/${postId}/like`, "DELETE"),
    onMutate: () => {
      setLiked(false);
      setLikes(likes - 1);
    },
    onError: () => {
      setLiked(true);
      setLikes(likes + 1);
      toast({ title: "Failed to unlike post", variant: "destructive" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () => apiRequest(`/api/posts/${postId}/save`, "POST"),
    onMutate: () => setSaved(true),
    onError: () => {
      setSaved(false);
      toast({ title: "Failed to save post", variant: "destructive" });
    },
  });

  // Unsave mutation
  const unsaveMutation = useMutation({
    mutationFn: () => apiRequest(`/api/posts/${postId}/save`, "DELETE"),
    onMutate: () => setSaved(false),
    onError: () => {
      setSaved(true);
      toast({ title: "Failed to unsave post", variant: "destructive" });
    },
  });

  const handleLike = () => {
    if (liked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const handleSave = () => {
    if (saved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  };

  const handleShare = () => {
    // Copy link to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
    toast({ title: "Link copied to clipboard" });
  };

  const isOwnPost = currentUserId === authorId;

  return (
    <div className="flex items-center justify-between border-t pt-3" data-testid="post-actions">
      {/* Left side: Like, Comment, Share */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={liked ? "text-red-500" : ""}
          data-testid="button-like"
        >
          <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
          {likes > 0 && <span className="ml-1">{likes}</span>}
        </Button>

        <Button variant="ghost" size="sm" data-testid="button-comment">
          <MessageCircle className="h-5 w-5" />
          {commentCount > 0 && <span className="ml-1">{commentCount}</span>}
        </Button>

        <Button variant="ghost" size="sm" onClick={handleShare} data-testid="button-share">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Right side: Save, More */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className={saved ? "text-primary" : ""}
          data-testid="button-save"
        >
          <Bookmark className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" data-testid="button-more">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwnPost ? (
              <>
                <DropdownMenuItem data-testid="menu-edit">Edit post</DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-delete" className="text-destructive">
                  Delete post
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem data-testid="menu-report">Report post</DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-hide">Hide post</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

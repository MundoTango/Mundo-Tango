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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ShareModal } from "./modals/ShareModal";
import { ReportModal } from "./modals/ReportModal";
import { EditPostModal } from "./modals/EditPostModal";

interface PostActionsProps {
  postId: number;
  authorId: number;
  currentUserId: number;
  initialLiked?: boolean;
  initialSaved?: boolean;
  likeCount?: number;
  commentCount?: number;
  content?: string;
}

export function PostActions({
  postId,
  authorId,
  currentUserId,
  initialLiked = false,
  initialSaved = false,
  likeCount = 0,
  commentCount = 0,
  content = "",
}: PostActionsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likes, setLikes] = useState(likeCount);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
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
    setShareOpen(true);
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/api/posts/${postId}`, "DELETE"),
    onSuccess: () => {
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setDeleteOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

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
          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" data-testid="button-more"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwnPost ? (
              <>
                <DropdownMenuItem
                  onClick={() => setEditOpen(true)}
                  data-testid="menu-edit"
                >
                  Edit post
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  data-testid="menu-delete"
                  className="text-destructive"
                >
                  Delete post
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={() => setReportOpen(true)}
                  data-testid="menu-report"
                >
                  Report post
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-hide">Hide post</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Share Modal */}
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        postId={postId}
        postTitle={content.slice(0, 50) + (content.length > 50 ? '...' : '')}
      />

      {/* Report Modal */}
      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        postId={postId}
        contentType="post"
      />

      {/* Edit Modal */}
      <EditPostModal
        open={editOpen}
        onOpenChange={setEditOpen}
        postId={postId}
        currentContent={content}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-testid="dialog-delete-post">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical, Pencil, Trash2, Flag, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface PostActionsProps {
  postId: number;
  postContent: string;
  isOwnPost: boolean;
}

export function PostActions({ postId, postContent, isOwnPost }: PostActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedContent, setEditedContent] = useState(postContent);
  const [reportReason, setReportReason] = useState("");
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "Your post has been removed",
      });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast({
        title: "Failed to delete",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content: editedContent }),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post updated",
        description: "Your changes have been saved",
      });
      setShowEditDialog(false);
    },
    onError: () => {
      toast({
        title: "Failed to update",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${postId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ reason: reportReason }),
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "We'll review this content soon",
      });
      setShowReportDialog(false);
      setReportReason("");
    },
    onError: () => {
      toast({
        title: "Failed to report",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="hover-elevate active-elevate-2"
            data-testid={`button-post-actions-${postId}`}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyLink} data-testid={`menu-copy-link-${postId}`}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </DropdownMenuItem>
          
          {isOwnPost && (
            <>
              <DropdownMenuItem onClick={() => setShowEditDialog(true)} data-testid={`menu-edit-${postId}`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
                data-testid={`menu-delete-${postId}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Post
              </DropdownMenuItem>
            </>
          )}
          
          {!isOwnPost && (
            <DropdownMenuItem
              onClick={() => setShowReportDialog(true)}
              className="text-destructive"
              data-testid={`menu-report-${postId}`}
            >
              <Flag className="h-4 w-4 mr-2" />
              Report Post
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid={`button-cancel-delete-${postId}`}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid={`button-confirm-delete-${postId}`}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-32"
            data-testid={`input-edit-content-${postId}`}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => editMutation.mutate()}
              disabled={editMutation.isPending || !editedContent.trim()}
              data-testid={`button-save-edit-${postId}`}
            >
              {editMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
          </DialogHeader>
          <Textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Please describe why you're reporting this post..."
            className="min-h-32"
            data-testid={`input-report-reason-${postId}`}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => reportMutation.mutate()}
              disabled={reportMutation.isPending || !reportReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid={`button-submit-report-${postId}`}
            >
              {reportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

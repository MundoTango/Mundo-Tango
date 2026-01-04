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
import { useTranslation } from "react-i18next";

interface PostActionsProps {
  postId: number;
  postContent: string;
  isOwnPost: boolean;
}

export function PostActions({ postId, postContent, isOwnPost }: PostActionsProps) {
  const { t } = useTranslation("pages");
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
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["infinite-feed"] });
      toast({
        title: t("feed.toasts.postDeleted"),
        description: t("feed.toasts.postDeletedDescription"),
        action: (
          <button
            onClick={() => {
              fetch(`/api/posts/${postId}/restore`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              }).then(() => {
                queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
                queryClient.invalidateQueries({ queryKey: ["infinite-feed"] });
                toast({ 
                  title: t("feed.toasts.postRestored"), 
                  description: t("feed.toasts.postRestoredDescription") 
                });
              });
            }}
            className="text-sm font-medium underline"
            data-testid="button-undo-delete"
          >
            {t("feed.actions.undo")}
          </button>
        ),
      });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast({
        title: t("feed.toasts.deleteFailed"),
        description: t("feed.toasts.tryAgain"),
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
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ content: editedContent }),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: t("feed.toasts.postUpdated"),
        description: t("feed.toasts.postUpdatedDescription"),
      });
      setShowEditDialog(false);
    },
    onError: () => {
      toast({
        title: t("feed.toasts.updateFailed"),
        description: t("feed.toasts.tryAgain"),
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
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ reason: reportReason }),
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t("feed.toasts.reportSubmitted"),
        description: t("feed.toasts.reportSubmittedDescription"),
      });
      setShowReportDialog(false);
      setReportReason("");
    },
    onError: () => {
      toast({
        title: t("feed.toasts.reportFailed"),
        description: t("feed.toasts.tryAgain"),
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
    toast({
      title: t("feed.toasts.linkCopied"),
      description: t("feed.toasts.linkCopiedDescription"),
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
            {t("feed.actions.copyLink")}
          </DropdownMenuItem>
          
          {isOwnPost && (
            <>
              <DropdownMenuItem onClick={() => setShowEditDialog(true)} data-testid={`menu-edit-${postId}`}>
                <Pencil className="h-4 w-4 mr-2" />
                {t("feed.actions.editPost")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
                data-testid={`menu-delete-${postId}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("feed.actions.deletePost")}
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
              {t("feed.actions.reportPost")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("feed.dialogs.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("feed.dialogs.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid={`button-cancel-delete-${postId}`}>
              {t("feed.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid={`button-confirm-delete-${postId}`}
            >
              {deleteMutation.isPending ? t("feed.actions.deleting") : t("feed.actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("feed.dialogs.editTitle")}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-32"
            data-testid={`input-edit-content-${postId}`}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {t("feed.actions.cancel")}
            </Button>
            <Button
              onClick={() => editMutation.mutate()}
              disabled={editMutation.isPending || !editedContent.trim()}
              data-testid={`button-save-edit-${postId}`}
            >
              {editMutation.isPending ? t("feed.actions.saving") : t("feed.actions.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("feed.dialogs.reportTitle")}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder={t("feed.dialogs.reportPlaceholder")}
            className="min-h-32"
            data-testid={`input-report-reason-${postId}`}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              {t("feed.actions.cancel")}
            </Button>
            <Button
              onClick={() => reportMutation.mutate()}
              disabled={reportMutation.isPending || !reportReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid={`button-submit-report-${postId}`}
            >
              {reportMutation.isPending ? t("feed.actions.submitting") : t("feed.actions.submit")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EditPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: number;
  currentContent: string;
}

export function EditPostModal({ open, onOpenChange, postId, currentContent }: EditPostModalProps) {
  const [content, setContent] = useState(currentContent);
  const [editReason, setEditReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setContent(currentContent);
      setEditReason('');
    }
  }, [open, currentContent]);

  const editMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('PATCH', `/api/posts/${postId}`, {
        content,
        editReason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId] });
      toast({
        title: "Post updated",
        description: "Your changes have been saved",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Failed to update post",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (content === currentContent) {
      toast({
        title: "No changes detected",
        variant: "destructive",
      });
      return;
    }

    editMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="modal-edit-post">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="content">Post content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="mt-2 min-h-[150px]"
              data-testid="textarea-edit-content"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {content.length} characters
            </p>
          </div>

          <div>
            <Label htmlFor="reason">Reason for edit (optional)</Label>
            <Input
              id="reason"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="E.g., Fixed typo, Added more details..."
              className="mt-2"
              data-testid="input-edit-reason"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-edit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={editMutation.isPending || content === currentContent}
            data-testid="button-save-edit"
          >
            {editMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

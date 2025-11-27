import { useState, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: number;
  initialContent: string;
}

function EditPostDialogComponent({
  open,
  onOpenChange,
  postId,
  initialContent,
}: EditPostDialogProps) {
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('PATCH', `/api/posts/${postId}`, { content });

      // Clear cache to force refresh
      queryClient.removeQueries({ queryKey: ['/api/posts'] });
      queryClient.removeQueries({ queryKey: ['infinite-feed'] });
      
      // Refetch to get latest data
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/posts'] });
        queryClient.refetchQueries({ queryKey: ['infinite-feed'] });
      }, 100);
      
      toast({
        title: "Post updated!",
        description: "Your post has been successfully updated",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" data-testid="dialog-edit-post">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[150px] resize-none"
            data-testid="textarea-edit-content"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            data-testid="button-cancel-edit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            data-testid="button-save-edit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const EditPostDialog = memo(EditPostDialogComponent);

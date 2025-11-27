import { useState, useEffect, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { PostCreator } from "@/components/universal/PostCreator";
import { useEditPost } from "@/hooks/usePostInteractions";

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
  const editMutation = useEditPost();
  const [isSaving, setIsSaving] = useState(false);

  const handleEditComplete = async (postData: any) => {
    setIsSaving(true);
    try {
      await editMutation.mutateAsync({
        postId,
        data: postData,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Edit failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-post">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <PostCreator
            editMode={true}
            existingPost={{
              content: initialContent,
              id: postId,
            }}
            onPostCreated={() => {
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const EditPostDialog = memo(EditPostDialogComponent);

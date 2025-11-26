import { useState } from "react";
import { MoreVertical, Edit, Trash2, Flag, UserX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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

interface PostActionsMenuProps {
  postId: number;
  isAuthor: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
}

export const PostActionsMenu = ({
  postId,
  isAuthor,
  onEdit,
  onDelete,
  onReport,
  onBlock,
}: PostActionsMenuProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete?.();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover-elevate"
            data-testid={`button-post-menu-${postId}`}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end"
          className="w-56"
          style={{
            background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.15), rgba(30, 144, 255, 0.12))',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(64, 224, 208, 0.3)',
          }}
        >
          {isAuthor ? (
            <>
              {onEdit && (
                <DropdownMenuItem
                  onClick={onEdit}
                  className="hover-elevate cursor-pointer"
                  data-testid={`menu-edit-${postId}`}
                >
                  <Edit className="w-4 h-4 mr-2" style={{ color: '#40E0D0' }} />
                  Edit Post
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="hover-elevate cursor-pointer text-red-600"
                  data-testid={`menu-delete-${postId}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
            </>
          ) : null}

          {!isAuthor && (
            <>
              {onReport && (
                <DropdownMenuItem
                  onClick={onReport}
                  className="hover-elevate cursor-pointer"
                  data-testid={`menu-report-${postId}`}
                >
                  <Flag className="w-4 h-4 mr-2" style={{ color: '#EF4444' }} />
                  Report Post
                </DropdownMenuItem>
              )}
              {onBlock && (
                <DropdownMenuItem
                  onClick={onBlock}
                  className="hover-elevate cursor-pointer text-red-600"
                  data-testid={`menu-block-${postId}`}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Block User
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          style={{
            background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.15), rgba(30, 144, 255, 0.12))',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(64, 224, 208, 0.3)',
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-confirm-delete"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

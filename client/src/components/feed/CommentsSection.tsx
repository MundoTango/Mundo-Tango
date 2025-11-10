import { useState } from "react";
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/usePosts";
import { useLikeComment } from "@/hooks/usePostInteractions";
import { CommentItem, CommentData } from "@/components/ui/CommentItem";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CommentsSectionProps {
  postId: number;
}

export const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const { user } = useAuth();
  const [newCommentContent, setNewCommentContent] = useState('');
  const { data: comments, isLoading } = useComments(postId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const likeComment = useLikeComment();

  const handleCreateComment = async () => {
    if (!newCommentContent.trim()) return;
    
    await createComment.mutateAsync({
      postId,
      content: newCommentContent,
    });
    setNewCommentContent('');
  };

  const handleReply = async (parentId: number, content: string) => {
    await createComment.mutateAsync({
      postId,
      content,
      parentId,
    });
  };

  const handleLike = async (commentId: number) => {
    await likeComment.mutateAsync({ commentId });
  };

  const handleDelete = async (commentId: number) => {
    await deleteComment.mutateAsync({ postId, commentId });
  };

  // Build comment tree with threading
  const buildCommentTree = (allComments: any[]): CommentData[] => {
    const commentMap = new Map<number, CommentData>();
    const rootComments: CommentData[] = [];

    // First pass: Create all comment objects
    allComments.forEach(comment => {
      commentMap.set(comment.id, {
        id: comment.id,
        userId: comment.userId,
        content: comment.content,
        likes: comment.likes || 0,
        isLiked: comment.isLiked || false,
        parentId: comment.parentId || null,
        createdAt: comment.createdAt,
        user: comment.user || { 
          id: comment.userId, 
          name: 'Unknown User' 
        },
        replies: [],
      });
    });

    // Second pass: Build tree structure
    commentMap.forEach(comment => {
      if (comment.parentId === null) {
        rootComments.push(comment);
      } else {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(comment);
        }
      }
    });

    return rootComments;
  };

  const commentTree = comments ? buildCommentTree(comments) : [];

  return (
    <div className="space-y-4" data-testid={`comments-section-${postId}`}>
      {/* New Comment Input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={newCommentContent}
          onChange={(e) => setNewCommentContent(e.target.value)}
          rows={3}
          disabled={createComment.isPending}
          data-testid={`textarea-new-comment-${postId}`}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleCreateComment}
            disabled={!newCommentContent.trim() || createComment.isPending}
            size="sm"
            style={{
              background: 'linear-gradient(90deg, rgba(64, 224, 208, 0.9), rgba(30, 144, 255, 0.9))',
              color: 'white',
            }}
            data-testid={`button-submit-comment-${postId}`}
          >
            {createComment.isPending ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <MessageCircle className="w-3 h-3 mr-2" />
                Comment
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : commentTree.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              onLike={handleLike}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

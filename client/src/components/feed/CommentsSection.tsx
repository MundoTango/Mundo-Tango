import { useState, useCallback, useRef } from "react";
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/usePosts";
import { useLikeComment } from "@/hooks/usePostInteractions";
import { CommentItem, CommentData } from "@/components/ui/CommentItem";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagementWebSocket } from "@/hooks/useEngagementWebSocket";
import { queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

interface CommentsSectionProps {
  postId: number;
}

export const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const { t } = useTranslation("pages");
  const { user } = useAuth();
  const [newCommentContent, setNewCommentContent] = useState('');
  const { data: comments, isLoading } = useComments(postId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const likeComment = useLikeComment();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Feature 20: WebSocket for live comments and typing indicators
  const { typingUsers, sendTypingIndicator } = useEngagementWebSocket({
    postId,
    onNewComment: useCallback((newComment: any) => {
      // Invalidate comments query to refetch with new comment
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId, 'comments'] });
    }, [postId]),
  });

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
        user: comment.user ? {
          id: comment.user.id || comment.userId,
          name: comment.user.name,
          username: comment.user.username,
          profileImage: comment.user.profileImage,
          tangoRoles: comment.user.tangoRoles || [],
        } : { 
          id: comment.userId, 
          name: t("feed.user.unknownUser"),
          username: t("feed.user.unknownUsername"),
          profileImage: undefined,
          tangoRoles: [],
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

  // Get typing indicator text
  const getTypingText = () => {
    if (typingUsers.length === 0) return null;
    const users = typingUsers.join(', ');
    return typingUsers.length === 1 
      ? t("feed.comments.typingOne", { users })
      : t("feed.comments.typingMultiple", { users });
  };

  return (
    <div className="space-y-4" data-testid={`comments-section-${postId}`}>
      {/* Feature 20: Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="text-xs text-muted-foreground px-2 py-1 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex gap-1">
            <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>{getTypingText()}</span>
        </div>
      )}

      {/* New Comment Input */}
      <div className="space-y-2">
        <Textarea
          placeholder={t("feed.comments.placeholder")}
          value={newCommentContent}
          onChange={(e) => {
            setNewCommentContent(e.target.value);
            
            // Feature 20: Send typing indicator (debounced)
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            if (user?.name && e.target.value.trim()) {
              sendTypingIndicator(user.name);
              typingTimeoutRef.current = setTimeout(() => {
                // Stop sending after 3 seconds of no input
              }, 3000);
            }
          }}
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
                {t("feed.comments.posting")}
              </>
            ) : (
              <>
                <MessageCircle className="w-3 h-3 mr-2" />
                {t("feed.comments.submit")}
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
          {t("feed.comments.noComments")}
        </div>
      ) : (
        <div className="space-y-4">
          {commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
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

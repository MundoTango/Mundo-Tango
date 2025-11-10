import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface CommentData {
  id: number;
  userId: number;
  content: string;
  likes?: number;
  isLiked?: boolean;
  parentId?: number | null;
  createdAt: string;
  user: {
    id: number;
    name?: string;
    username?: string;
    profileImage?: string;
  };
  replies?: CommentData[];
}

interface CommentItemProps {
  comment: CommentData;
  currentUserId?: number;
  depth?: number;
  onLike?: (commentId: number) => void;
  onReply?: (commentId: number, content: string) => void;
  onDelete?: (commentId: number) => void;
}

const MAX_DEPTH = 3;

export const CommentItem = ({
  comment,
  currentUserId,
  depth = 0,
  onLike,
  onReply,
  onDelete,
}: CommentItemProps) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthor = currentUserId === comment.userId;
  const canReply = depth < MAX_DEPTH;

  const handleLike = () => {
    onLike?.(comment.id);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onReply?.(comment.id, replyContent);
      setReplyContent('');
      setShowReplyInput(false);
    } catch (error) {
      console.error('Reply failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Delete this comment?')) {
      onDelete?.(comment.id);
    }
  };

  return (
    <div
      className="flex gap-3"
      style={{
        marginLeft: depth > 0 ? `${depth * 40}px` : '0',
      }}
      data-testid={`comment-item-${comment.id}`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.user?.profileImage || ""} />
        <AvatarFallback style={{ background: 'linear-gradient(135deg, #40E0D0, #1E90FF)' }}>
          {comment.user?.name?.charAt(0) || comment.user?.username?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div 
          className="p-3 rounded-lg"
          style={{
            background: depth % 2 === 0 
              ? 'linear-gradient(135deg, rgba(64, 224, 208, 0.08), rgba(30, 144, 255, 0.05))'
              : 'linear-gradient(135deg, rgba(64, 224, 208, 0.05), rgba(30, 144, 255, 0.03))',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">
              {comment.user?.name || comment.user?.username || "Unknown User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-sm whitespace-pre-wrap" data-testid={`comment-content-${comment.id}`}>
            {comment.content}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-2 ml-3">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-xs transition-colors hover-elevate px-2 py-1 rounded"
            style={{
              color: comment.isLiked ? '#EF4444' : 'var(--muted-foreground)',
            }}
            data-testid={`button-like-comment-${comment.id}`}
          >
            <Heart 
              className="w-3.5 h-3.5" 
              fill={comment.isLiked ? '#EF4444' : 'none'}
            />
            {comment.likes ? comment.likes : null}
          </button>

          {canReply && onReply && (
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors hover-elevate px-2 py-1 rounded"
              data-testid={`button-reply-comment-${comment.id}`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Reply
            </button>
          )}

          {isAuthor && onDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors hover-elevate px-2 py-1 rounded"
              data-testid={`button-delete-comment-${comment.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
        </div>

        {/* Reply Input */}
        {showReplyInput && (
          <div className="mt-3 ml-3 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
              className="text-sm"
              data-testid={`textarea-reply-${comment.id}`}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReplyInput(false);
                  setReplyContent('');
                }}
                data-testid={`button-cancel-reply-${comment.id}`}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyContent.trim() || isSubmitting}
                style={{
                  background: 'linear-gradient(90deg, rgba(64, 224, 208, 0.9), rgba(30, 144, 255, 0.9))',
                  color: 'white',
                }}
                data-testid={`button-submit-reply-${comment.id}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Replying...
                  </>
                ) : (
                  'Reply'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                depth={depth + 1}
                onLike={onLike}
                onReply={onReply}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

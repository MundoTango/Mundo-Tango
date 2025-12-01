import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Trash2, Loader2 } from "lucide-react";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { UserRoleBadges } from "@/components/UserRoleBadges";
import { ReactionSelector } from "@/components/ui/ReactionSelector";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

export interface CommentData {
  id: number;
  userId: number;
  content: string;
  likes?: number;
  isLiked?: boolean;
  currentReaction?: string;
  reactions?: Record<string, number>;
  parentId?: number | null;
  createdAt: string;
  user: {
    id: number;
    name?: string;
    username?: string;
    profileImage?: string;
    tangoRoles?: string[];
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
  const { user } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthor = currentUserId === comment.userId;
  const canReply = depth < MAX_DEPTH;

  const displayName = comment.user?.name || comment.user?.username || `User #${comment.userId}`;
  const userInitial = comment.user?.name?.charAt(0) || comment.user?.username?.charAt(0) || "?";
  const profileLink = comment.user?.username 
    ? `/profile/${comment.user.username}` 
    : `/profile/${comment.userId}`;

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

  const currentReaction = comment.currentReaction || (comment.isLiked ? 'love' : undefined);
  const reactions = comment.reactions || { love: comment.likes || 0 };

  return (
    <div
      className="flex gap-3"
      style={{
        marginLeft: depth > 0 ? `${depth * 40}px` : '0',
      }}
      data-testid={`comment-item-${comment.id}`}
    >
      <Link href={profileLink} data-testid={`link-avatar-${comment.id}`}>
        <Avatar className="h-8 w-8 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src={comment.user?.profileImage || ""} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-xs font-medium">
            {userInitial}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <div 
          className="p-3 rounded-lg bg-muted/50 dark:bg-muted/30"
          data-testid={`comment-bubble-${comment.id}`}
        >
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link 
              href={profileLink}
              className="font-semibold text-sm hover:underline cursor-pointer"
              data-testid={`link-username-${comment.id}`}
            >
              {displayName}
            </Link>
            {comment.user?.tangoRoles && comment.user.tangoRoles.length > 0 && (
              <UserRoleBadges 
                roles={comment.user.tangoRoles} 
                size="xs" 
                maxDisplay={2} 
                data-testid={`badges-roles-${comment.id}`}
              />
            )}
            <span 
              className="text-xs text-muted-foreground"
              data-testid={`text-date-${comment.id}`}
            >
              {safeDateDistance(comment.createdAt, { addSuffix: true })}
            </span>
          </div>
          
          <p 
            className="text-sm whitespace-pre-wrap break-words" 
            data-testid={`comment-content-${comment.id}`}
          >
            {comment.content}
          </p>
        </div>

        <div className="flex items-center gap-1 mt-2 ml-1 flex-wrap">
          {user && (
            <ReactionSelector 
              targetId={comment.id}
              targetType="comment"
              currentReaction={currentReaction}
              reactions={reactions}
              data-testid={`reactions-comment-${comment.id}`}
            />
          )}

          {canReply && onReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="h-8 px-2 text-xs gap-1"
              data-testid={`button-reply-comment-${comment.id}`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Reply
            </Button>
          )}

          {isAuthor && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 px-2 text-xs gap-1 text-destructive hover:text-destructive"
              data-testid={`button-delete-comment-${comment.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          )}
        </div>

        {showReplyInput && (
          <div className="mt-3 ml-1 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
              className="text-sm"
              data-testid={`textarea-reply-${comment.id}`}
            />
            <div className="flex gap-2 flex-wrap">
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

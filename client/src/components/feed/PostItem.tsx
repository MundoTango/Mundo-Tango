import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Share2, Bookmark, BookmarkCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ReactionSelector } from "@/components/ui/ReactionSelector";
import { PostActionsMenu } from "@/components/ui/PostActionsMenu";
import { ShareModal } from "@/components/modals/ShareModal";
import { ReportModal } from "@/components/modals/ReportModal";
import { useReactToPost, useSharePost, useSavePost, useUnsavePost, useReportPost } from "@/hooks/usePostInteractions";
import { useAuth } from "@/contexts/AuthContext";
import { CommentsSection } from "./CommentsSection";
import { renderMentionPills } from "@/utils/renderMentionPills";

export interface PostItemData {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string | null;
  visibility: string;
  likes: number;
  comments: number;
  createdAt: string;
  isSaved?: boolean;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
  };
}

interface PostItemProps {
  post: PostItemData;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
}

export const PostItem = ({ post, onEdit, onDelete }: PostItemProps) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const reactMutation = useReactToPost();
  const shareMutation = useSharePost();
  const saveMutation = useSavePost();
  const unsaveMutation = useUnsavePost();
  const reportMutation = useReportPost();

  const isAuthor = user?.id === post.userId;
  const isSaved = post.isSaved || false;

  const handleReaction = async (reactionId: string) => {
    await reactMutation.mutateAsync({ postId: post.id, reactionType: reactionId });
  };

  const handleShare = async (shareType: 'timeline' | 'comment' | 'link', comment?: string) => {
    await shareMutation.mutateAsync({ postId: post.id, shareType, comment });
  };

  const handleSave = async () => {
    if (isSaved) {
      await unsaveMutation.mutateAsync({ postId: post.id });
    } else {
      await saveMutation.mutateAsync({ postId: post.id });
    }
  };

  const handleReport = async (category: string, description: string) => {
    await reportMutation.mutateAsync({ postId: post.id, category, description });
  };

  return (
    <>
      <Card 
        className="mb-4 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.08), rgba(30, 144, 255, 0.05))',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(64, 224, 208, 0.2)',
        }}
        data-testid={`post-item-${post.id}`}
      >
        {/* Header */}
        <div className="p-4 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user?.profileImage || ""} />
              <AvatarFallback style={{ background: 'linear-gradient(135deg, #40E0D0, #1E90FF)' }}>
                {post.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{post.user?.name || "Unknown"}</span>
                <span className="text-xs text-muted-foreground">
                  @{post.user?.username || "unknown"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <PostActionsMenu
            postId={post.id}
            isAuthor={isAuthor}
            isSaved={isSaved}
            onEdit={() => onEdit?.(post.id)}
            onDelete={() => onDelete?.(post.id)}
            onSave={handleSave}
            onReport={() => setShowReportModal(true)}
          />
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <div className="whitespace-pre-wrap" data-testid={`post-content-${post.id}`}>
            {renderMentionPills(post.content)}
          </div>
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className="px-4 pb-3">
            <img 
              src={post.imageUrl} 
              alt="Post media" 
              className="rounded-lg w-full object-cover max-h-96"
              data-testid={`post-image-${post.id}`}
            />
          </div>
        )}

        {/* Actions */}
        <div className="px-4 pb-3 flex items-center gap-1">
          <ReactionSelector
            postId={post.id}
            onReact={handleReaction}
            reactions={{}}
          />

          <Button
            variant="ghost"
            size="sm"
            className="hover-elevate gap-2"
            onClick={() => setShowComments(!showComments)}
            data-testid={`button-comments-${post.id}`}
          >
            <MessageCircle className="w-4 h-4" />
            {post.comments > 0 && <span className="text-xs">{post.comments}</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hover-elevate gap-2"
            onClick={() => setShowShareModal(true)}
            data-testid={`button-share-${post.id}`}
          >
            <Share2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hover-elevate ml-auto"
            onClick={handleSave}
            data-testid={`button-save-${post.id}`}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4" style={{ color: '#40E0D0' }} />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t px-4 py-3" style={{ borderColor: 'rgba(64, 224, 208, 0.2)' }}>
            <CommentsSection postId={post.id} />
          </div>
        )}
      </Card>

      {/* Modals */}
      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        postId={post.id}
        postTitle={post.content.substring(0, 100)}
      />

      <ReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={post.id}
        onReport={handleReport}
      />
    </>
  );
};

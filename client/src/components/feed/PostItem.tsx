import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Share2, Bookmark, BookmarkCheck, Users, Plane, Pizza, Drama, Mountain, Moon, Leaf, Palette, Music, Dumbbell, Camera as PhotoIcon, HeartHandshake, UserPlus, Briefcase, Target, PartyPopper } from "lucide-react";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { Link } from "wouter";
import { ReactionSelector } from "@/components/ui/ReactionSelector";
import { PostActionsMenu } from "@/components/ui/PostActionsMenu";
import { ShareModal } from "@/components/modals/ShareModal";
import { ReportModal } from "@/components/modals/ReportModal";
import { useReactToPost, useSharePost, useSavePost, useUnsavePost } from "@/hooks/usePostInteractions";
import { useAuth } from "@/contexts/AuthContext";
import { CommentsSection } from "./CommentsSection";
import { renderMentionPills } from "@/utils/renderMentionPills";
import { motion } from "framer-motion";
import { RoleIcon } from "@/components/RoleIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getRoleLabel } from "@/lib/tangoRoles";

const MEMORY_TAGS = [
  { id: "travel", label: "Travel", icon: Plane, gradient: "from-cyan-500 to-blue-500" },
  { id: "food", label: "Food", icon: Pizza, gradient: "from-orange-500 to-red-500" },
  { id: "culture", label: "Culture", icon: Drama, gradient: "from-purple-500 to-pink-500" },
  { id: "adventure", label: "Adventure", icon: Mountain, gradient: "from-green-500 to-teal-500" },
  { id: "nightlife", label: "Nightlife", icon: Moon, gradient: "from-indigo-500 to-purple-500" },
  { id: "nature", label: "Nature", icon: Leaf, gradient: "from-emerald-500 to-green-500" },
  { id: "art", label: "Art", icon: Palette, gradient: "from-pink-500 to-rose-500" },
  { id: "music", label: "Music", icon: Music, gradient: "from-violet-500 to-purple-500" },
  { id: "sports", label: "Sports", icon: Dumbbell, gradient: "from-blue-500 to-cyan-500" },
  { id: "photography", label: "Photography", icon: PhotoIcon, gradient: "from-gray-500 to-slate-500" },
  { id: "family", label: "Family", icon: HeartHandshake, gradient: "from-rose-500 to-pink-500" },
  { id: "friends", label: "Friends", icon: UserPlus, gradient: "from-yellow-500 to-orange-500" },
  { id: "work", label: "Work", icon: Briefcase, gradient: "from-slate-500 to-gray-500" },
  { id: "milestone", label: "Milestone", icon: Target, gradient: "from-red-500 to-orange-500" },
  { id: "celebration", label: "Celebration", icon: PartyPopper, gradient: "from-fuchsia-500 to-pink-500" },
];

export interface PostItemData {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  videoThumbnail?: string | null;
  visibility: string;
  likes: number;
  comments: number;
  createdAt: string;
  isSaved?: boolean;
  currentReaction?: string | null;
  reactions?: Record<string, number>;
  tags?: string[] | null;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
    friendshipStatus?: 'accepted' | 'pending' | 'none' | null;
    tangoRoles?: string[] | null;
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


  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{post.user?.name || "Unknown"}</span>
                <span className="text-xs text-muted-foreground">
                  @{post.user?.username || "unknown"}
                </span>
                {/* Tango Role Icons */}
                {post.user?.tangoRoles && post.user.tangoRoles.length > 0 && (
                  <div className="flex items-center gap-1" data-testid={`user-roles-${post.userId}`}>
                    {post.user.tangoRoles.slice(0, 3).map((role) => (
                      <Tooltip key={role}>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary">
                            <RoleIcon role={role} size={12} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs" sideOffset={8}>
                          {getRoleLabel(role)}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {post.user.tangoRoles.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{post.user.tangoRoles.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {safeDateDistance(post.createdAt, { addSuffix: true })}
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

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {post.tags.map(tagId => {
              const tag = MEMORY_TAGS.find(t => t.id === tagId);
              if (!tag) return null;
              const IconComponent = tag.icon;
              return (
                <Badge
                  key={tagId}
                  className={`bg-gradient-to-r ${tag.gradient} text-white border-0 flex items-center gap-1`}
                  data-testid={`tag-badge-${tagId}`}
                >
                  <IconComponent className="w-3 h-3" />
                  <span className="text-xs">{tag.label}</span>
                </Badge>
              );
            })}
          </div>
        )}

        {/* Image */}
        {post.imageUrl && (
          <div className="px-4 pb-3">
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
              <motion.img 
                src={post.imageUrl} 
                alt="Post media" 
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
                data-testid={`post-image-${post.id}`}
              />
            </div>
          </div>
        )}

        {/* Video */}
        {post.videoUrl && (
          <div className="px-4 pb-3">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
              <video 
                src={post.videoUrl}
                poster={post.videoThumbnail || undefined}
                controls
                preload="metadata"
                className="w-full h-full object-contain"
                data-testid={`post-video-${post.id}`}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 pb-3 flex items-center gap-1 flex-wrap">
          <ReactionSelector
            postId={post.id}
            currentReaction={post.currentReaction || undefined}
            onReact={handleReaction}
            reactions={post.reactions || {}}
            totalCount={post.likes}
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

          {/* See Friendship Button - Only for accepted friends */}
          {post.user?.friendshipStatus === 'accepted' && post.user?.id !== user?.id && (
            <Button
              variant="ghost"
              size="sm"
              className="hover-elevate gap-2"
              asChild
              data-testid={`button-see-friendship-${post.user.id}`}
            >
              <Link href={`/friendship/${post.user.id}`}>
                <Users className="w-4 h-4" style={{ color: '#14B8A6' }} />
                <span className="text-xs hidden sm:inline">See Friendship</span>
              </Link>
            </Button>
          )}

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
      </motion.div>

      {/* Modals */}
      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        postId={post.id}
        postTitle={post.content.substring(0, 100)}
      />

      <ReportModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        postId={post.id}
        contentType="post"
      />
    </>
  );
};

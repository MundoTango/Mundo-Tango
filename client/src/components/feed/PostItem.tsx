import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Share2, Bookmark, BookmarkCheck, Users, Plane, Pizza, Drama, Mountain, Moon, Leaf, Palette, Music, Dumbbell, Camera as PhotoIcon, HeartHandshake, UserPlus, Briefcase, Target, PartyPopper, MapPin, UtensilsCrossed, Coffee, Hotel, Wine, DollarSign, Star, Maximize2 } from "lucide-react";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { Link } from "wouter";
import { ReactionSelector } from "@/components/ui/ReactionSelector";
import { PostActionsMenu } from "@/components/ui/PostActionsMenu";
import { ShareModal } from "@/components/modals/ShareModal";
import { ReportModal } from "@/components/modals/ReportModal";
import { ImageLightbox } from "@/components/modals/ImageLightbox";
import { WhoLikedModal } from "@/components/modals/WhoLikedModal";
import { useReactToPost, useSharePost, useSavePost, useUnsavePost, useDeletePost, useReportPost } from "@/hooks/usePostInteractions";
import { EditPostDialog } from "@/components/modals/EditPostDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CommentsSection } from "./CommentsSection";
import { renderMentionPills } from "@/utils/renderMentionPills";
import { motion } from "framer-motion";
import { RoleIcon } from "@/components/RoleIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getRoleLabel, getRoleByValue } from "@/lib/tangoRoles";
import { useTranslation } from "react-i18next";

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

const RECOMMENDATION_CATEGORIES = [
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed, gradient: "from-amber-500 to-orange-500" },
  { id: "cafe", label: "Café", icon: Coffee, gradient: "from-amber-600 to-yellow-500" },
  { id: "hotel", label: "Hotel", icon: Hotel, gradient: "from-blue-500 to-indigo-500" },
  { id: "venue", label: "Tango Venue", icon: Star, gradient: "from-purple-500 to-pink-500" },
  { id: "activity", label: "Activity", icon: Target, gradient: "from-green-500 to-teal-500" },
  { id: "bar", label: "Bar", icon: Wine, gradient: "from-rose-500 to-red-500" },
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
  postType?: string | null;
  location?: string | null;
  richContent?: { priceRange?: string } | null;
  coordinates?: { lat: number; lng: number } | null;
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
  const { t } = useTranslation("pages");
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showWhoLiked, setShowWhoLiked] = useState(false);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);

  // Convert base64 video to Blob URL for better mobile playback
  // iOS Safari has issues with large inline base64 data URIs
  useEffect(() => {
    if (post.videoUrl && post.videoUrl.startsWith('data:video')) {
      try {
        console.log(`[Video ${post.id}] Converting base64 to blob URL...`);
        // Parse the data URI
        const [header, base64Data] = post.videoUrl.split(',');
        const mimeMatch = header.match(/data:([^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'video/mp4';
        
        // Convert base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and URL
        const blob = new Blob([bytes], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        console.log(`[Video ${post.id}] Blob URL created: ${blobUrl.substring(0, 50)}...`);
        setVideoBlobUrl(blobUrl);
        
        // Cleanup on unmount
        return () => {
          URL.revokeObjectURL(blobUrl);
        };
      } catch (err) {
        console.error(`[Video ${post.id}] Failed to convert to blob:`, err);
      }
    } else if (post.videoUrl) {
      // Non-base64 video URL, use directly
      setVideoBlobUrl(post.videoUrl);
    }
  }, [post.videoUrl, post.id]);

  const reactMutation = useReactToPost();
  const shareMutation = useSharePost();
  const saveMutation = useSavePost();
  const unsaveMutation = useUnsavePost();
  const deleteMutation = useDeletePost();
  const reportMutation = useReportPost();

  const isAuthor = user?.id === post.userId;
  const isSaved = post.isSaved || false;
  const isSaveLoading = saveMutation.isPending || unsaveMutation.isPending;
  const isReactLoading = reactMutation.isPending;
  const isDeleteLoading = deleteMutation.isPending;

  const handleReaction = async (reactionId: string) => {
    if (!user) {
      // User not logged in - show toast instead of making API call
      toast({
        title: t("feed.posts.signInRequired"),
        description: t("feed.posts.signInToReact"),
        variant: "destructive",
      });
      return;
    }
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

  const handleEdit = () => {
    setShowEditDialog(true);
    onEdit?.(post.id);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ postId: post.id });
    onDelete?.(post.id);
  };

  const handleReport = (category: string, description: string) => {
    reportMutation.mutateAsync({ postId: post.id, category, description });
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
                  <div className="flex items-center gap-1 flex-wrap" data-testid={`user-roles-${post.userId}`}>
                    {post.user.tangoRoles.map((role) => {
                      const roleData = getRoleByValue(role);
                      return (
                        <Tooltip key={role}>
                          <TooltipTrigger asChild>
                            <span 
                              className="inline-flex items-center justify-center w-5 h-5 rounded-full"
                              style={{ 
                                backgroundColor: `${roleData?.color}20`,
                                color: roleData?.color
                              }}
                            >
                              <RoleIcon role={role} size={12} />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs" sideOffset={8}>
                            {getRoleLabel(role)}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
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
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReport={() => setShowReportModal(true)}
            isDeleteLoading={isDeleteLoading}
          />
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <div className="whitespace-pre-wrap" data-testid={`post-content-${post.id}`}>
            {renderMentionPills(post.content)}
          </div>
        </div>

        {/* Recommendation Info - Hidden Gems */}
        {post.postType && RECOMMENDATION_CATEGORIES.find(c => c.id === post.postType) && (
          <div className="px-4 pb-3" data-testid={`recommendation-info-${post.id}`}>
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              {(() => {
                const category = RECOMMENDATION_CATEGORIES.find(c => c.id === post.postType);
                if (!category) return null;
                const CategoryIcon = category.icon;
                return (
                  <Badge 
                    className={`bg-gradient-to-r ${category.gradient} text-white border-0 flex items-center gap-1`}
                    data-testid={`recommendation-category-${post.id}`}
                  >
                    <CategoryIcon className="w-3 h-3" />
                    <span className="text-xs">{category.label}</span>
                  </Badge>
                );
              })()}
              
              {post.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span data-testid={`recommendation-location-${post.id}`}>{post.location}</span>
                </div>
              )}
              
              {post.richContent?.priceRange && (
                <Badge variant="outline" className="flex items-center gap-1 border-amber-500/30 text-amber-600">
                  <DollarSign className="w-3 h-3" />
                  <span data-testid={`recommendation-price-${post.id}`}>{post.richContent.priceRange}</span>
                </Badge>
              )}
            </div>
          </div>
        )}

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

        {/* Image with Lightbox (Bug #10) */}
        {post.imageUrl && (
          <div className="px-4 pb-3">
            <div 
              className="relative aspect-[16/9] overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => setShowLightbox(true)}
              data-testid={`post-image-container-${post.id}`}
            >
              <motion.div
                className="w-full h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              >
                <img 
                  src={post.imageUrl} 
                  alt="Post media" 
                  className="w-full h-full object-cover"
                  data-testid={`post-image-${post.id}`}
                />
              </motion.div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
            </div>
          </div>
        )}

        {/* Video */}
        {post.videoUrl && videoBlobUrl && (
          <div className="px-4 pb-3">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
              <video 
                src={videoBlobUrl}
                poster={post.videoThumbnail || undefined}
                controls
                preload="auto"
                playsInline
                className="w-full h-full object-contain"
                data-testid={`post-video-${post.id}`}
                onLoadStart={() => console.log(`[Video ${post.id}] Load started (blob URL)`)}
                onLoadedData={() => console.log(`[Video ${post.id}] Data loaded successfully`)}
                onCanPlay={() => console.log(`[Video ${post.id}] Can play`)}
                onError={(e) => console.error(`[Video ${post.id}] Error:`, e)}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 flex items-center gap-1 flex-wrap pt-[20px] pb-[20px]">
          <ReactionSelector
            targetId={post.id}
            targetType="post"
            currentReaction={post.currentReaction || undefined}
            onReact={handleReaction}
            reactions={post.reactions || {}}
            totalCount={post.likes}
            onCountClick={() => post.likes > 0 && setShowWhoLiked(true)}
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
            disabled={isSaveLoading}
            data-testid={`button-save-${post.id}`}
          >
            {isSaveLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isSaved ? (
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
        postTitle={(post.content || "").substring(0, 100)}
      />
      <ReportModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        postId={post.id}
        contentType="post"
      />
      <EditPostDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        postId={post.id}
        initialContent={post.content || ""}
      />
      {/* Bug #10: Image Lightbox */}
      {post.imageUrl && (
        <ImageLightbox
          open={showLightbox}
          onOpenChange={setShowLightbox}
          imageUrl={post.imageUrl}
          alt={`Post by ${post.user?.name || 'Unknown'}`}
        />
      )}
      {/* Bug #11: Who Liked Modal */}
      <WhoLikedModal
        open={showWhoLiked}
        onOpenChange={setShowWhoLiked}
        postId={post.id}
        totalLikes={post.likes}
      />
    </>
  );
};

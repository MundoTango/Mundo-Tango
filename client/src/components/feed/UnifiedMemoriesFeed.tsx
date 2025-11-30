import { memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SmartPostFeed } from "./SmartPostFeed";
import { PostItem, type PostItemData } from "./PostItem";
import { PostCreator } from "@/components/universal/PostCreator";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UnifiedMemoriesFeedProps {
  posts: PostItemData[];
  isLoading?: boolean;
  context?: {
    type: 'feed' | 'event' | 'group' | 'memory' | 'profile';
    id?: string | number;
    name?: string;
  };
  showPostCreator?: boolean;
  showFilters?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  onPostCreated?: () => void;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  className?: string;
  ownerId?: number;
}

function UnifiedMemoriesFeedComponent({
  posts,
  isLoading = false,
  context = { type: 'feed' },
  showPostCreator = false,
  showFilters = true,
  emptyMessage,
  emptyIcon: EmptyIcon = Camera,
  onPostCreated,
  onEdit,
  onDelete,
  className = "",
  ownerId,
}: UnifiedMemoriesFeedProps) {
  const { user } = useAuth();
  
  const isOwnProfile = context.type === 'profile' && ownerId === user?.id;
  const shouldShowCreator = showPostCreator || isOwnProfile;

  const defaultEmptyMessage = useMemo(() => {
    switch (context.type) {
      case 'profile':
        return isOwnProfile 
          ? "You haven't posted anything yet. Share your tango journey!" 
          : "No posts yet.";
      case 'group':
        return `No posts in ${context.name || 'this group'} yet. Be the first to share!`;
      case 'event':
        return `No posts about ${context.name || 'this event'} yet. Share your experience!`;
      case 'memory':
        return "No memories yet. Start documenting your journey!";
      default:
        return "No posts to display.";
    }
  }, [context, isOwnProfile]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`} data-testid="unified-feed-loading">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 w-full mt-4" />
            <Skeleton className="h-48 w-full mt-3 rounded-lg" />
          </Card>
        ))}
      </div>
    );
  }

  const renderPosts = () => {
    if (posts.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="overflow-hidden" data-testid="card-no-posts">
            <CardContent className="py-16 text-center">
              <EmptyIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground">
                {emptyMessage || defaultEmptyMessage}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    return (
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
            layout
            data-testid={`unified-post-wrapper-${post.id}`}
          >
            <PostItem 
              post={post}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  if (!showFilters) {
    return (
      <div className={`space-y-6 ${className}`} data-testid="unified-memories-feed">
        {shouldShowCreator && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PostCreator 
              context={{ 
                type: context.type === 'profile' ? 'memory' : context.type as any,
                id: context.id,
                name: context.name
              }}
              onPostCreated={onPostCreated}
            />
          </motion.div>
        )}
        {renderPosts()}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} data-testid="unified-memories-feed">
      {shouldShowCreator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PostCreator 
            context={{ 
              type: context.type === 'profile' ? 'memory' : context.type as any,
              id: context.id,
              name: context.name
            }}
            onPostCreated={onPostCreated}
          />
        </motion.div>
      )}
      
      <SmartPostFeed posts={posts}>
        {renderPosts()}
      </SmartPostFeed>
    </div>
  );
}

export const UnifiedMemoriesFeed = memo(UnifiedMemoriesFeedComponent);

export type { UnifiedMemoriesFeedProps, PostItemData };

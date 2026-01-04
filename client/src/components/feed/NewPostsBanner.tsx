import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationSubscription } from "@/contexts/NotificationWebSocketContext";
import { useTranslation } from "react-i18next";

interface NewPostsBannerProps {
  onLoadNewPosts: () => void;
}

export function NewPostsBanner({ onLoadNewPosts }: NewPostsBannerProps) {
  const { t } = useTranslation("pages");
  const [newPostsCount, setNewPostsCount] = useState(0);

  const handleMessage = useCallback((message: { type: string; data?: any }) => {
    if (message.type === 'new_post') {
      setNewPostsCount(prev => prev + 1);
    }
  }, []);

  useNotificationSubscription(handleMessage);

  const handleClick = () => {
    setNewPostsCount(0);
    onLoadNewPosts();
  };

  if (newPostsCount === 0) {
    return null;
  }

  const postText = newPostsCount === 1 
    ? t("feed.newPosts.singular", { count: newPostsCount })
    : t("feed.newPosts.plural", { count: newPostsCount });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        data-testid="new-posts-banner"
      >
        <Button
          onClick={handleClick}
          className="flex items-center gap-2 bg-primary/90 hover:bg-primary shadow-lg"
          data-testid="button-load-new-posts"
        >
          <ChevronUp className="w-4 h-4" />
          <span>{postText}</span>
          <RefreshCw className="w-4 h-4" />
          <Badge variant="secondary" className="ml-1">
            {newPostsCount}
          </Badge>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}

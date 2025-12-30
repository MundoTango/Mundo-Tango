import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationSubscription } from "@/contexts/NotificationWebSocketContext";

interface NewPostsBannerProps {
  onLoadNewPosts: () => void;
}

export function NewPostsBanner({ onLoadNewPosts }: NewPostsBannerProps) {
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
          <span>
            {newPostsCount} new {newPostsCount === 1 ? 'post' : 'posts'}
          </span>
          <RefreshCw className="w-4 h-4" />
          <Badge variant="secondary" className="ml-1">
            {newPostsCount}
          </Badge>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}

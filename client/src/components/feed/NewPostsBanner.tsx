import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NewPostsBannerProps {
  onLoadNewPosts: () => void;
}

export function NewPostsBanner({ onLoadNewPosts }: NewPostsBannerProps) {
  const [newPostsCount, setNewPostsCount] = useState(0);

  useEffect(() => {
    // WebSocket connection for real-time post notifications
    // Skip WebSocket in development with HMR issues - use polling instead
    if (!window.location.host || window.location.host.includes('undefined')) {
      console.warn('[NewPostsBanner] Skipping WebSocket due to invalid host');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;
    
    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const setupWebSocket = () => {
      try {
        ws = new WebSocket(wsUrl);
        reconnectAttempts = 0;
        
        ws.onopen = () => {
          console.log('[NewPostsBanner] WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'new_post') {
              setNewPostsCount(prev => prev + 1);
            }
          } catch (error) {
            console.error('[NewPostsBanner] Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[NewPostsBanner] WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('[NewPostsBanner] WebSocket disconnected');
          // Attempt reconnection
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(setupWebSocket, 3000);
          }
        };
      } catch (error) {
        console.error('[NewPostsBanner] Failed to create WebSocket:', error);
      }
    };

    setupWebSocket();

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const handleClick = () => {
    onLoadNewPosts();
    setNewPostsCount(0);
  };

  return (
    <AnimatePresence>
      {newPostsCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          data-testid="new-posts-banner"
        >
          <Button
            onClick={handleClick}
            variant="default"
            className="shadow-lg flex items-center gap-2"
            data-testid="button-load-new-posts"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{newPostsCount} new {newPostsCount === 1 ? 'post' : 'posts'}</span>
            <Badge variant="secondary" className="ml-1">
              <ChevronUp className="h-3 w-3" />
            </Badge>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

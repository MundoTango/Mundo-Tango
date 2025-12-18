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
    // Requires JWT auth token for secure connection
    try {
      if (!window.location.host || window.location.host.includes('undefined') || !window.location.hostname) {
        console.warn('[NewPostsBanner] Skipping WebSocket due to invalid host');
        return;
      }

      // Get JWT token for WebSocket authentication
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('[NewPostsBanner] No auth token, skipping WebSocket (user not logged in)');
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Include JWT token in WebSocket URL for authentication
      const wsUrl = `${protocol}//${window.location.host}/ws/notifications?token=${encodeURIComponent(token)}`;
      
      // Validate URL format before creating WebSocket
      try {
        new URL(wsUrl.replace('wss:', 'https:').replace('ws:', 'http:'));
      } catch {
        console.warn('[NewPostsBanner] Skipping WebSocket due to invalid URL format');
        return;
      }
      
      let ws: WebSocket | null = null;
      let reconnectAttempts = 0;
      const maxReconnectAttempts = 3;

      const setupWebSocket = () => {
        try {
          ws = new WebSocket(wsUrl);
          reconnectAttempts = 0;
          
          ws.onopen = () => {
            console.log('[NewPostsBanner] WebSocket connected with auth');
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

          ws.onerror = () => {
            // Silent error - don't spam console when WS fails
          };

          ws.onclose = () => {
            // Attempt reconnection silently
            if (reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              setTimeout(setupWebSocket, 5000);
            }
          };
        } catch (error) {
          // Silent fail - WebSocket is optional enhancement
        }
      };

      setupWebSocket();

      return () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      // Silent fail for WebSocket
    }
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

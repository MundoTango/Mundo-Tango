/**
 * ENGAGEMENT WEBSOCKET HOOK
 * Real-time like and comment updates for posts
 * 
 * Features:
 * - Feature 19: Live reaction/like updates
 * - Feature 20: Live comments with typing indicators
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface EngagementMessage {
  type: 'reaction_update' | 'new_comment' | 'user_typing';
  postId: number;
  userId?: number;
  username?: string;
  reactions?: Record<string, number>;
  currentReaction?: string | null;
  totalReactions?: number;
  comment?: any;
  timestamp: string;
}

interface UseEngagementWebSocketOptions {
  postId: number;
  initialReactions?: Record<string, number>;
  initialTotalReactions?: number;
  onNewComment?: (comment: any) => void;
}

export function useEngagementWebSocket({
  postId,
  initialReactions = {},
  initialTotalReactions = 0,
  onNewComment,
}: UseEngagementWebSocketOptions) {
  const [reactions, setReactions] = useState<Record<string, number>>(initialReactions);
  const [totalReactions, setTotalReactions] = useState<number>(initialTotalReactions);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const handleMessage = useCallback((message: EngagementMessage) => {
    switch (message.type) {
      case 'reaction_update':
        // Feature 19: Update reaction counts in real-time
        if (message.postId === postId) {
          setReactions(message.reactions || {});
          setTotalReactions(message.totalReactions || 0);
          console.log(`[Engagement WS] 💙 Reaction update for post ${postId}: ${message.totalReactions} total reactions`);
        }
        break;

      case 'new_comment':
        // Feature 20: New comment added
        if (message.postId === postId && message.comment) {
          console.log(`[Engagement WS] 💬 New comment on post ${postId} by user ${message.comment.userId}`);
          if (onNewComment) {
            onNewComment(message.comment);
          }
        }
        break;

      case 'user_typing':
        // Feature 20: Show typing indicator
        if (message.postId === postId && message.username) {
          console.log(`[Engagement WS] ⌨️  ${message.username} is typing on post ${postId}`);
          
          // Add user to typing list if not already there
          setTypingUsers(prev => {
            if (!prev.includes(message.username!)) {
              return [...prev, message.username!];
            }
            return prev;
          });

          // Clear existing timeout for this user
          const existingTimeout = typingTimeouts.current.get(message.username);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }

          // Set new timeout to remove user after 3 seconds
          const timeout = setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u !== message.username));
            typingTimeouts.current.delete(message.username!);
          }, 3000);
          
          typingTimeouts.current.set(message.username, timeout);
        }
        break;
    }
  }, [postId, onNewComment]);

  const { status, send } = useWebSocket({
    path: '/ws/engagement',
    onMessage: handleMessage,
    reconnect: true,
    heartbeatInterval: 30000,
  });

  // Subscribe to this post when connected
  useEffect(() => {
    if (status === 'connected') {
      send({
        type: 'subscribe',
        data: { postId },
      });
      console.log(`[Engagement WS] 📌 Subscribed to post ${postId}`);
    }

    // Cleanup: Unsubscribe when component unmounts or postId changes
    return () => {
      if (status === 'connected') {
        send({
          type: 'unsubscribe',
          data: { postId },
        });
        console.log(`[Engagement WS] 📍 Unsubscribed from post ${postId}`);
      }
      
      // Clear all typing timeouts
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
    };
  }, [status, postId, send]);

  // Feature 20: Send typing indicator
  const sendTypingIndicator = useCallback((username: string) => {
    if (status === 'connected') {
      send({
        type: 'typing',
        data: {
          postId,
          username,
        },
      });
    }
  }, [status, postId, send]);

  return {
    // Feature 19: Live reactions
    reactions,
    totalReactions,
    
    // Feature 20: Live comments & typing
    typingUsers,
    sendTypingIndicator,
    
    // Connection status
    isConnected: status === 'connected',
    connectionStatus: status,
  };
}

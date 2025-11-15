import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface WebSocketMessage {
  type: string;
  data?: any;
  userId?: number;
  timestamp?: string;
}

export interface UseWebSocketOptions {
  path: string;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  maxRetries?: number;
  heartbeatInterval?: number;
}

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    path,
    onMessage,
    onError,
    reconnect = true,
    maxRetries = 5,
    heartbeatInterval = 30000,
  } = options;

  const { user } = useAuth();
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const isManualClose = useRef(false);

  const cleanup = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = undefined;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
  }, []);

  const connect = useCallback(() => {
    if (!user) {
      console.log('[WS] No user authenticated, skipping connection');
      setStatus('disconnected');
      return;
    }

    // Don't try to connect if already connected or connecting
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('[WS] Already connected or connecting');
      return;
    }

    try {
      console.log(`[WS] Connecting to ${path} for user ${user.id}...`);
      setStatus('connecting');

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Don't send userId in URL - will authenticate via message after connection
      const wsUrl = `${protocol}//${window.location.host}${path}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`[WS] Connected to ${path} - sending auth...`);
        
        // Send authentication message immediately
        try {
          ws.send(JSON.stringify({
            type: 'auth',
            userId: user.id
          }));
          console.log(`[WS] Auth message sent for user ${user.id}`);
        } catch (error) {
          console.error(`[WS] Failed to send auth message:`, error);
        }
        
        // Note: status will be set to 'connected' when we receive confirmation
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Handle pong responses silently
          if (message.type === 'pong') {
            return;
          }

          // Handle connected confirmation - NOW we're truly connected
          if (message.type === 'connected') {
            console.log(`[WS] Authenticated as user ${message.userId}`);
            setStatus('connected');
            retriesRef.current = 0;
            isManualClose.current = false;

            // Start heartbeat ping after successful authentication
            heartbeatIntervalRef.current = setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'ping' }));
              }
            }, heartbeatInterval);
            return;
          }

          // Call user-provided message handler
          if (onMessage) {
            onMessage(message);
          }

          // Dispatch custom event for other components
          window.dispatchEvent(
            new CustomEvent('ws-message', { detail: message })
          );
        } catch (error) {
          console.error('[WS] Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error(`[WS] WebSocket error on ${path}:`, error);
        setStatus('error');
        
        if (onError) {
          onError(error);
        }
      };

      ws.onclose = (event) => {
        console.log(`[WS] Disconnected from ${path}`, {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        
        cleanup();
        setStatus('disconnected');

        // Only attempt reconnect if:
        // 1. Reconnect is enabled
        // 2. Not a manual close
        // 3. Haven't exceeded max retries
        // 4. Not unauthorized (code 4001)
        if (reconnect && 
            !isManualClose.current && 
            retriesRef.current < maxRetries &&
            event.code !== 4001) {
          
          const delay = Math.min(1000 * Math.pow(2, retriesRef.current), 30000);
          console.log(`[WS] Reconnecting in ${delay}ms (attempt ${retriesRef.current + 1}/${maxRetries})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            retriesRef.current++;
            connect();
          }, delay);
        } else if (event.code === 4001) {
          console.error('[WS] Unauthorized - not attempting reconnect');
        } else if (retriesRef.current >= maxRetries) {
          console.error('[WS] Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('[WS] Failed to create WebSocket:', error);
      setStatus('error');
    }
  }, [user, path, onMessage, onError, reconnect, maxRetries, heartbeatInterval, cleanup]);

  const disconnect = useCallback(() => {
    console.log('[WS] Manual disconnect requested');
    isManualClose.current = true;
    cleanup();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client closing');
      wsRef.current = null;
    }
    
    setStatus('disconnected');
  }, [cleanup]);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('[WS] Cannot send message - WebSocket not open');
    return false;
  }, []);

  // Connect on mount if user is authenticated
  useEffect(() => {
    if (user) {
      connect();
    }

    return () => {
      isManualClose.current = true;
      cleanup();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }
    };
  }, [user, connect, cleanup]);

  return {
    status,
    send,
    disconnect,
    reconnect: connect,
  };
}

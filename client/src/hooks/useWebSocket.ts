import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Helper to check if JWT is expired
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Add 30 second buffer to avoid edge cases
    return payload.exp * 1000 < Date.now() + 30000;
  } catch {
    return true; // Treat malformed tokens as expired
  }
}

// Helper to refresh the access token
async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      const { accessToken } = await res.json();
      localStorage.setItem('accessToken', accessToken);
      console.log('[WS] Token refreshed successfully');
      return accessToken;
    }
  } catch (error) {
    console.error('[WS] Token refresh failed:', error);
  }
  return null;
}

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
    maxRetries = 10,
    heartbeatInterval = 30000,
  } = options;

  const { user } = useAuth();
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isManualClose = useRef(false);

  const cleanup = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
      authTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
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

      // Validate host before creating WebSocket
      if (!window.location.host || window.location.host.includes('undefined')) {
        console.warn('[WS] Skipping connection - invalid host:', window.location.host);
        setStatus('error');
        return;
      }

      // Get JWT token from localStorage
      let token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('[WS] No access token found - cannot connect');
        setStatus('error');
        return;
      }

      // Check if token is expired and try to refresh
      if (isTokenExpired(token)) {
        console.log('[WS] Token expired, attempting refresh before WebSocket connection...');
        const newToken = await refreshAccessToken();
        if (newToken) {
          token = newToken;
        } else {
          console.error('[WS] Token refresh failed - cannot connect with expired token');
          setStatus('error');
          // Don't retry if token refresh fails - user needs to re-login
          isManualClose.current = true;
          return;
        }
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Send JWT token in URL query parameter for authentication
      const wsUrl = `${protocol}//${window.location.host}${path}?token=${encodeURIComponent(token)}`;
      
      console.log(`[WS] Connecting with JWT token authentication...`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Set 5-second connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.log('[WS] ⏰ Connection timeout - closing connection');
          ws.close();
          setStatus('error');
          
          // Trigger retry logic if reconnect is enabled
          if (reconnect && retriesRef.current < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, retriesRef.current), 30000);
            console.log(`[WS] Reconnecting after timeout in ${delay}ms (attempt ${retriesRef.current + 1}/${maxRetries})...`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              retriesRef.current++;
              connect();
            }, delay);
          }
        }
      }, 5000);

      ws.onopen = () => {
        console.log(`[WS] ✅ Connection established to ${path} for user ${user.id}`);
        console.log(`[WS] WebSocket readyState: ${ws.readyState}`);
        
        // Clear connection timeout since we're connected
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        // Authentication happens via JWT token in URL during handshake
        // Wait for server's auth_success/connected message to confirm
        console.log('[WS] Waiting for server authentication confirmation...');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Handle pong responses silently
          if (message.type === 'pong') {
            return;
          }

          // Handle auth success - server confirms authentication
          // Primary: auth_success, Fallback: connected (for backward compatibility)
          if (message.type === 'auth_success' || message.type === 'connected') {
            console.log(`[WS] 🎉 Authentication successful for user ${message.userId}`);
            console.log(`[WS] 📨 Received message type: ${message.type}`);
            
            // Clear all pending timeouts
            if (connectionTimeoutRef.current) {
              clearTimeout(connectionTimeoutRef.current);
              connectionTimeoutRef.current = null;
            }
            if (authTimeoutRef.current) {
              clearTimeout(authTimeoutRef.current);
              authTimeoutRef.current = null;
            }
            
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
  // Only reconnect when user ID changes (login/logout), not when user object updates
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    status,
    send,
    disconnect,
    reconnect: connect,
  };
}

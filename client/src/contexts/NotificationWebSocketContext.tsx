import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  userId?: number;
  timestamp?: string;
}

interface NotificationWebSocketContextType {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  subscribe: (callback: (message: WebSocketMessage) => void) => () => void;
  sendMessage: (message: WebSocketMessage) => void;
}

const NotificationWebSocketContext = createContext<NotificationWebSocketContextType | null>(null);

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    const expiryTime = payload.exp * 1000;
    const buffer = 60 * 1000;
    return Date.now() > (expiryTime - buffer);
  } catch {
    return true;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      const { accessToken } = await res.json();
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    }
  } catch {
    // Silent fail
  }
  return null;
}

export function NotificationWebSocketProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Set<(message: WebSocketMessage) => void>>(new Set());
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const isMountedRef = useRef(true);
  const connectingLockRef = useRef(false);
  const lastConnectTimeRef = useRef(0);

  const connect = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    if (connectingLockRef.current) {
      return;
    }

    const now = Date.now();
    if (now - lastConnectTimeRef.current < 2000) {
      return;
    }
    
    connectingLockRef.current = true;
    lastConnectTimeRef.current = now;

    try {
      if (!window.location.host || window.location.host.includes('undefined')) {
        connectingLockRef.current = false;
        return;
      }

      let token = localStorage.getItem('accessToken');
      if (!token) {
        connectingLockRef.current = false;
        return;
      }

      if (isTokenExpired(token)) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          token = newToken;
        } else {
          connectingLockRef.current = false;
          setStatus('error');
          return;
        }
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/notifications?token=${encodeURIComponent(token)}`;

      setStatus('connecting');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        connectingLockRef.current = false;
        if (!isMountedRef.current) {
          ws.close();
          return;
        }
        console.log('[NotificationWS] Connected to notification service');
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          subscribersRef.current.forEach(callback => callback(message));
        } catch (err) {
          console.error('[NotificationWS] Failed to parse message:', err);
        }
      };

      ws.onerror = () => {
        connectingLockRef.current = false;
        console.error('[NotificationWS] WebSocket error');
        setStatus('error');
      };

      ws.onclose = () => {
        connectingLockRef.current = false;
        if (!isMountedRef.current) return;
        
        console.log('[NotificationWS] Disconnected');
        setStatus('disconnected');
        wsRef.current = null;

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(3000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };
    } catch (err) {
      connectingLockRef.current = false;
      console.error('[NotificationWS] Connection error:', err);
      setStatus('error');
    }
  }, []);

  const subscribe = useCallback((callback: (message: WebSocketMessage) => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      connect();
    }

    // Listen for storage events to detect login/logout in same tab or cross-tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        if (e.newValue && !e.oldValue) {
          // User logged in - connect
          reconnectAttemptsRef.current = 0;
          connect();
        } else if (!e.newValue && e.oldValue) {
          // User logged out - disconnect
          if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
          }
          setStatus('disconnected');
        }
      }
    };

    // Custom event for same-tab login detection (storage events don't fire in same tab)
    const handleAuthChange = () => {
      const token = localStorage.getItem('accessToken');
      if (token && !wsRef.current) {
        reconnectAttemptsRef.current = 0;
        connect();
      }
    };

    const handleAuthLogout = () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setStatus('disconnected');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthLogout);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return (
    <NotificationWebSocketContext.Provider value={{ status, subscribe, sendMessage }}>
      {children}
    </NotificationWebSocketContext.Provider>
  );
}

const FALLBACK_CONTEXT: NotificationWebSocketContextType = {
  status: 'disconnected',
  subscribe: () => () => {},
  sendMessage: () => {},
};

export function useNotificationWebSocket() {
  const context = useContext(NotificationWebSocketContext);
  return context || FALLBACK_CONTEXT;
}

export function useNotificationSubscription(callback: (message: WebSocketMessage) => void) {
  const { subscribe } = useNotificationWebSocket();
  
  useEffect(() => {
    return subscribe(callback);
  }, [subscribe, callback]);
}

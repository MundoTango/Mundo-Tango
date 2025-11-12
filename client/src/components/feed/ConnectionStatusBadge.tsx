import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface ConnectionStatusBadgeProps {
  className?: string;
}

export function ConnectionStatusBadge({ className }: ConnectionStatusBadgeProps) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(true);
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  useEffect(() => {
    // Don't connect if no user is authenticated
    if (!user) {
      setWsStatus('disconnected');
      return;
    }

    // Monitor online/offline status
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // WebSocket connection monitoring
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let heartbeatInterval: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/notifications?userId=${user.id}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('[WS] Connected to notification service');
          setWsStatus('connected');
          
          // Start heartbeat ping every 30 seconds
          heartbeatInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'pong') {
              console.log('[WS] Heartbeat received');
            } else if (message.type === 'notification') {
              console.log('[WS] Notification received:', message.data);
              // Handle notification (could dispatch event or call callback)
              window.dispatchEvent(new CustomEvent('ws-notification', { detail: message.data }));
            } else if (message.type === 'connected') {
              console.log('[WS] Connection confirmed for user', message.userId);
            }
          } catch (error) {
            console.error('[WS] Error parsing message:', error);
          }
        };

        ws.onclose = () => {
          console.log('[WS] Disconnected from notification service');
          setWsStatus('disconnected');
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          // Attempt reconnection after 3 seconds
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error('[WS] WebSocket error:', error);
          setWsStatus('disconnected');
        };
      } catch (error) {
        console.error('[WS] Error creating WebSocket:', error);
        setWsStatus('disconnected');
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, [user]);

  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        label: 'Offline',
        color: 'bg-red-500',
        icon: WifiOff,
        pulse: false,
      };
    }

    switch (wsStatus) {
      case 'connected':
        return {
          label: 'Live',
          color: 'bg-green-500',
          icon: Wifi,
          pulse: true,
        };
      case 'connecting':
        return {
          label: 'Connecting',
          color: 'bg-yellow-500',
          icon: Wifi,
          pulse: true,
        };
      case 'disconnected':
        return {
          label: 'Reconnecting',
          color: 'bg-orange-500',
          icon: WifiOff,
          pulse: true,
        };
    }
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <Badge 
      variant="secondary" 
      className={`gap-1.5 text-xs ${className}`}
      data-testid="connection-status-badge"
    >
      <div className="relative">
        <Icon className="w-3 h-3" />
        {status.pulse && (
          <motion.span
            className={`absolute inset-0 ${status.color} rounded-full opacity-75`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.75, 0, 0.75],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        <span className={`absolute inset-0.5 ${status.color} rounded-full`} />
      </div>
      <span>{status.label}</span>
    </Badge>
  );
}

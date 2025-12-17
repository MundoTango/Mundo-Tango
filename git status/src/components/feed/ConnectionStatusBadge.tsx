import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { useWebSocket, WebSocketMessage } from "@/hooks/useWebSocket";

interface ConnectionStatusBadgeProps {
  className?: string;
}

export function ConnectionStatusBadge({ className }: ConnectionStatusBadgeProps) {
  const [isConnected, setIsConnected] = useState(true);

  // Use the new WebSocket hook with proper reconnection logic
  const { status: wsStatus } = useWebSocket({
    path: '/ws/notifications',
    onMessage: (message: WebSocketMessage) => {
      if (message.type === 'notification') {
        console.log('[WS] Notification received:', message.data);
        window.dispatchEvent(new CustomEvent('ws-notification', { detail: message.data }));
      }
    },
    onError: (error) => {
      console.error('[WS] Connection error:', error);
    },
    reconnect: true,
    maxRetries: 5,
    heartbeatInterval: 30000,
  });

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
      case 'error':
        return {
          label: 'Error',
          color: 'bg-red-500',
          icon: WifiOff,
          pulse: false,
        };
      case 'disconnected':
      default:
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

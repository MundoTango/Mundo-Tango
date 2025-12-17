/**
 * Autonomous Progress Hook
 * WebSocket-based real-time progress updates for autonomous workflow tasks
 * Replaces 2-second polling with push-based notifications
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface ProgressData {
  taskId: string;
  status: 'decomposing' | 'generating' | 'validating' | 'complete' | 'failed';
  step: string;
  progress: number; // 0-1
  message?: string;
  files?: string[];
  error?: string;
}

interface UseAutonomousProgressProps {
  userId: number;
  taskId?: string;
  autoConnect?: boolean;
}

interface UseAutonomousProgressReturn {
  isConnected: boolean;
  progress: ProgressData | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

export function useAutonomousProgress({
  userId,
  taskId,
  autoConnect = true
}: UseAutonomousProgressProps): UseAutonomousProgressReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  /**
   * Connect to autonomous WebSocket
   */
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[AutonomousProgress] Already connected');
      return;
    }

    try {
      setError(null);

      // Build WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const url = `${protocol}//${host}/ws/autonomous?userId=${userId}`;

      console.log('[AutonomousProgress] Connecting to:', url);

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[AutonomousProgress] Connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleProgressEvent(data);
        } catch (err) {
          console.error('[AutonomousProgress] Parse error:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[AutonomousProgress] WebSocket error:', err);
        setError('Connection error');
      };

      ws.onclose = () => {
        console.log('[AutonomousProgress] Disconnected');
        setIsConnected(false);
        wsRef.current = null;
      };

    } catch (err: any) {
      console.error('[AutonomousProgress] Connect error:', err);
      setError(err.message || 'Failed to connect');
    }
  }, [userId]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  /**
   * Handle autonomous progress events
   */
  const handleProgressEvent = useCallback((event: any) => {
    // Only process events for the current task (if taskId is specified)
    if (taskId && event.taskId !== taskId) {
      return;
    }

    console.log('[AutonomousProgress] Event:', event.type, event);

    switch (event.type) {
      case 'autonomous:started':
        setProgress({
          taskId: event.taskId,
          status: 'decomposing',
          step: 'Starting task',
          progress: 0,
          message: event.description
        });
        break;

      case 'autonomous:progress':
        setProgress(prev => ({
          ...prev,
          taskId: event.taskId,
          status: event.step as any,
          step: event.message || event.step,
          progress: event.progress,
          message: event.message
        } as ProgressData));
        break;

      case 'autonomous:file_generated':
        setProgress(prev => ({
          ...prev,
          taskId: event.taskId,
          status: 'generating',
          step: `Generated ${event.filePath}`,
          progress: event.fileIndex / (event.totalFiles || 1),
          files: [...(prev?.files || []), event.filePath]
        } as ProgressData));
        break;

      case 'autonomous:validation_complete':
        setProgress(prev => ({
          ...prev,
          taskId: event.taskId,
          status: 'validating',
          step: 'Validation complete',
          progress: 0.95,
          message: event.message
        } as ProgressData));
        break;

      case 'autonomous:completed':
        setProgress({
          taskId: event.taskId,
          status: 'complete',
          step: 'Task complete',
          progress: 1,
          message: event.message,
          files: event.files
        });
        break;

      case 'autonomous:failed':
        setProgress({
          taskId: event.taskId,
          status: 'failed',
          step: 'Task failed',
          progress: 0,
          error: event.error,
          message: event.error
        });
        setError(event.error);
        break;

      default:
        console.log('[AutonomousProgress] Unknown event type:', event.type);
    }
  }, [taskId]);

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    progress,
    error,
    connect,
    disconnect
  };
}

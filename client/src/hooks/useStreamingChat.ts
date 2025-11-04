/**
 * Streaming Chat Hook
 * Server-Sent Events for live work progress updates
 */

import { useState, useCallback, useRef } from 'react';

export interface StreamMessage {
  type: 'progress' | 'code' | 'completion' | 'error';
  status?: 'analyzing' | 'applying' | 'generating' | 'done';
  message?: string;
  code?: string;
  data?: any;
}

interface UseStreamingChatReturn {
  isStreaming: boolean;
  currentStatus: string;
  messages: StreamMessage[];
  generatedCode: string;
  error: string | null;
  sendMessage: (message: string, context?: any, mode?: string) => Promise<void>;
  clear: () => void;
}

export function useStreamingChat(): UseStreamingChatReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  /**
   * Send streaming message
   */
  const sendMessage = useCallback(async (message: string, context?: any, mode: string = 'chat') => {
    try {
      setIsStreaming(true);
      setError(null);
      setMessages([]);
      setGeneratedCode('');
      setCurrentStatus('Connecting...');

      // Get auth token
      const token = localStorage.getItem('accessToken');

      // Close existing EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create POST request to initiate stream
      const response = await fetch('/api/mrblue/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          message,
          context,
          mode
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Read stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsStreaming(false);
          setCurrentStatus('Done');
          break;
        }

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleStreamMessage(data);
            } catch (err) {
              console.error('[StreamingChat] Parse error:', err);
            }
          }
        }
      }

    } catch (err: any) {
      console.error('[StreamingChat] Error:', err);
      setError(err.message || 'Failed to send message');
      setIsStreaming(false);
      setCurrentStatus('Error');
    }
  }, []);

  /**
   * Handle stream message
   */
  const handleStreamMessage = useCallback((msg: StreamMessage) => {
    setMessages(prev => [...prev, msg]);

    switch (msg.type) {
      case 'progress':
        if (msg.message) {
          setCurrentStatus(msg.message);
        }
        break;

      case 'code':
        if (msg.code) {
          setGeneratedCode(prev => prev + msg.code);
        }
        break;

      case 'completion':
        setCurrentStatus(msg.message || 'Done');
        setIsStreaming(false);
        break;

      case 'error':
        setError(msg.message || 'Unknown error');
        setCurrentStatus('Error');
        setIsStreaming(false);
        break;
    }
  }, []);

  /**
   * Clear messages
   */
  const clear = useCallback(() => {
    setMessages([]);
    setGeneratedCode('');
    setCurrentStatus('');
    setError(null);
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  return {
    isStreaming,
    currentStatus,
    messages,
    generatedCode,
    error,
    sendMessage,
    clear
  };
}

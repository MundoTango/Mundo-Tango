/**
 * Streaming Chat Hook
 * Server-Sent Events for live work progress updates
 */

import { useState, useCallback, useRef } from 'react';

export interface FileUpdateData {
  filePath: string;
  before: string;
  after: string;
  diff: string;
  element: {
    type: string;
    text: string;
    line: number;
  };
}

export interface StreamMessage {
  type: 'progress' | 'code' | 'completion' | 'error' | 'vibe_coding_progress' | 'chat_response' | 'visual_change' | 'file_updated';
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
  isTyping: boolean;
  fileUpdates: FileUpdateData[];
  sendMessage: (message: string, context?: any, mode?: string) => Promise<void>;
  clear: () => void;
}

export function useStreamingChat(): UseStreamingChatReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [fileUpdates, setFileUpdates] = useState<FileUpdateData[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);

  /**
   * Send streaming message
   */
  const sendMessage = useCallback(async (message: string, context?: any, mode: string = 'chat') => {
    try {
      console.log('[StreamingChat] 🚀 Initiating stream request:', { message, mode });
      setIsStreaming(true);
      setIsTyping(true);
      setError(null);
      setMessages([]);
      setGeneratedCode('');
      setFileUpdates([]);
      setCurrentStatus('Connecting...');

      // Get auth token
      const token = localStorage.getItem('accessToken');

      // Close existing EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      console.log('[StreamingChat] Sending POST to /api/mrblue/stream...');

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

      console.log('[StreamingChat] Response status:', response.status, response.statusText);
      console.log('[StreamingChat] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Read stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      console.log('[StreamingChat] ✅ ReadableStream reader obtained, starting to read chunks...');

      let buffer = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log(`[StreamingChat] ✅ Stream complete after ${chunkCount} chunks`);
          setIsStreaming(false);
          setIsTyping(false);
          setCurrentStatus('Done');
          break;
        }

        chunkCount++;
        console.log(`[StreamingChat] Chunk ${chunkCount} received, size: ${value?.length} bytes`);

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });
        console.log('[StreamingChat] Buffer size after decode:', buffer.length);

        // Process complete SSE messages
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        console.log(`[StreamingChat] Processing ${lines.length} complete SSE messages`);

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              console.log('[StreamingChat] Parsing SSE message:', jsonStr.substring(0, 100));
              const data = JSON.parse(jsonStr);
              console.log('[StreamingChat] ✅ Parsed message type:', data.type);
              handleStreamMessage(data);
            } catch (err) {
              console.error('[StreamingChat] Parse error:', err, 'Line:', line.substring(0, 100));
            }
          } else if (line.trim()) {
            console.warn('[StreamingChat] Non-data SSE line:', line.substring(0, 50));
          }
        }
      }

    } catch (err: any) {
      console.error('[StreamingChat] Error:', err);
      setError(err.message || 'Failed to send message');
      setIsStreaming(false);
      setIsTyping(false);
      setCurrentStatus('Error');
    }
  }, []);

  /**
   * Handle stream message
   * MB.MD v9.2: Discriminate between chat responses and vibe coding progress
   */
  const handleStreamMessage = useCallback((msg: StreamMessage) => {
    setMessages(prev => [...prev, msg]);

    switch (msg.type) {
      // FILE UPDATED - Auto-apply success
      case 'file_updated':
        if (msg.data) {
          console.log('[StreamingChat] ✅ File updated:', msg.data);
          setFileUpdates(prev => [...prev, msg.data as FileUpdateData]);
          setCurrentStatus(msg.message || 'File updated');
        }
        break;

      // VIBE CODING PROGRESS - Shows in banner overlay
      case 'vibe_coding_progress':
      case 'visual_change':
        if (msg.message) {
          setCurrentStatus(msg.message);
        }
        break;

      // CHAT RESPONSE - Shows in conversation history (NO banner)
      case 'chat_response':
        // Don't update banner status for chat responses
        if (msg.message) {
          setCurrentStatus(''); // Clear banner
        }
        setIsStreaming(false);
        setIsTyping(false);
        break;

      // Legacy support for 'completion' type (treat as chat_response)
      case 'completion':
        if (msg.message) {
          setCurrentStatus(''); // Clear banner
        }
        setIsStreaming(false);
        setIsTyping(false);
        break;

      // Legacy progress support
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

      case 'error':
        setError(msg.message || 'Unknown error');
        setCurrentStatus('Error');
        setIsStreaming(false);
        setIsTyping(false);
        break;
    }
  }, []);

  /**
   * Clear messages
   */
  const clear = useCallback(() => {
    setMessages([]);
    setGeneratedCode('');
    setFileUpdates([]);
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
    isTyping,
    fileUpdates,
    sendMessage,
    clear
  };
}

/**
 * Realtime Voice Hook
 * WebSocket-based ChatGPT-style voice conversations
 * Powers natural voice interaction with Mr. Blue
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseRealtimeVoiceProps {
  userId: number;
  role: string;
  mode?: 'visual_editor' | 'chat' | 'global';
  page?: string;
  autoConnect?: boolean;
}

interface RealtimeVoiceReturn {
  isConnected: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  error: string | null;
  transcript: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  sendText: (text: string) => void;
  updateContext: (context: any) => void;
}

export function useRealtimeVoice({
  userId,
  role,
  mode = 'chat',
  page = '/',
  autoConnect = false
}: UseRealtimeVoiceProps): RealtimeVoiceReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);

  /**
   * Connect to Realtime API
   */
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[RealtimeVoice] Already connected');
      return;
    }

    try {
      setError(null);

      // Build WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const url = `${protocol}//${host}/ws/realtime?userId=${userId}&role=${role}&mode=${mode}&page=${encodeURIComponent(page)}`;

      console.log('[RealtimeVoice] Connecting to:', url);

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[RealtimeVoice] Connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimeEvent(data);
        } catch (err) {
          console.error('[RealtimeVoice] Parse error:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[RealtimeVoice] WebSocket error:', err);
        setError('Connection error');
      };

      ws.onclose = () => {
        console.log('[RealtimeVoice] Disconnected');
        setIsConnected(false);
        wsRef.current = null;
      };

    } catch (err: any) {
      console.error('[RealtimeVoice] Connect error:', err);
      setError(err.message || 'Failed to connect');
    }
  }, [userId, role, mode, page]);

  /**
   * Disconnect from Realtime API
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
  }, []);

  /**
   * Handle Realtime events
   */
  const handleRealtimeEvent = useCallback((event: any) => {
    switch (event.type) {
      case 'session.created':
        console.log('[RealtimeVoice] Session created:', event.session);
        break;

      case 'conversation.item.input_audio_transcription.completed':
        // User's speech transcribed
        if (event.transcript) {
          setTranscript(event.transcript);
        }
        break;

      case 'response.audio.delta':
        // Audio chunk from AI
        if (event.delta) {
          const audioData = base64ToArrayBuffer(event.delta);
          audioQueueRef.current.push(audioData);
          
          if (!isPlayingRef.current) {
            playAudioQueue();
          }
        }
        break;

      case 'response.audio.done':
        console.log('[RealtimeVoice] Audio response complete');
        setIsSpeaking(false);
        break;

      case 'response.done':
        console.log('[RealtimeVoice] Response complete');
        break;

      case 'error':
        console.error('[RealtimeVoice] Server error:', event.error);
        setError(event.error?.message || 'Unknown error');
        break;
    }
  }, []);

  /**
   * Play audio queue
   */
  const playAudioQueue = useCallback(async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);

    // Initialize AudioContext if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }

    const audioContext = audioContextRef.current;
    const audioData = audioQueueRef.current.shift()!;

    try {
      // Decode and play
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      source.onended = () => {
        playAudioQueue();
      };

      source.start(0);
    } catch (err) {
      console.error('[RealtimeVoice] Audio playback error:', err);
      isPlayingRef.current = false;
    }
  }, []);

  /**
   * Start recording
   */
  const startRecording = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected');
      return;
    }

    setIsRecording(true);
    setError(null);

    // Send start recording event
    wsRef.current.send(JSON.stringify({
      type: 'input_audio_buffer.start'
    }));
  }, []);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    setIsRecording(false);

    // Send stop recording event
    wsRef.current.send(JSON.stringify({
      type: 'input_audio_buffer.commit'
    }));

    // Trigger response
    wsRef.current.send(JSON.stringify({
      type: 'response.create'
    }));
  }, []);

  /**
   * Send text message
   */
  const sendText = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected');
      return;
    }

    // Send text conversation item
    wsRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    }));

    // Trigger response
    wsRef.current.send(JSON.stringify({
      type: 'response.create'
    }));
  }, []);

  /**
   * Update context (for Visual Editor)
   */
  const updateContext = useCallback((context: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'client.update_context',
      context
    }));
  }, []);

  /**
   * Auto-connect on mount if requested
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]);

  return {
    isConnected,
    isRecording,
    isSpeaking,
    error,
    transcript,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendText,
    updateContext
  };
}

/**
 * Helper: Convert base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
}

import { useState, useRef, useCallback, useEffect } from 'react';

interface RealtimeConfig {
  instructions?: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  turnDetection?: {
    type: 'server_vad';
    threshold?: number;
    prefix_padding_ms?: number;
    silence_duration_ms?: number;
  };
}

interface RealtimeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export function useOpenAIRealtime(config: RealtimeConfig = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  
  // Connect to OpenAI Realtime API
  const connect = useCallback(async () => {
    try {
      setError(null);
      
      // 1. Get ephemeral token from backend
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/openai-realtime/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-realtime-preview-2024-10-01',
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to get session token');
      }
      
      const { client_secret } = await response.json();
      
      // 2. Create WebRTC connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      
      // 3. Set up audio playback
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioElRef.current = audioEl;
      
      pc.ontrack = (event) => {
        console.log('📡 Received audio track');
        audioEl.srcObject = event.streams[0];
      };
      
      // 4. Set up microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000,
        },
      });
      
      streamRef.current = stream;
      
      // Add audio track to connection
      const audioTrack = stream.getAudioTracks()[0];
      pc.addTrack(audioTrack, stream);
      
      // 5. Create data channel for messages
      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;
      
      dc.addEventListener('open', () => {
        console.log('✅ Data channel open');
        
        // Configure session
        dc.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            voice: config.voice || 'alloy',
            instructions: config.instructions || 
              'You are Mr. Blue, a helpful AI assistant integrated into the Mundo Tango Visual Editor. ' +
              'You understand the MB.MD methodology (Simultaneously, Recursively, Critically) and can help users edit their pages.',
            turn_detection: config.turnDetection || {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1',
            },
          },
        }));
        
        setIsConnected(true);
        setIsRecording(true);
      });
      
      // Handle incoming messages
      dc.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'conversation.item.created':
            if (data.item.type === 'message') {
              const content = data.item.content?.[0]?.transcript || 
                             data.item.content?.[0]?.text || '';
              if (content) {
                setMessages(prev => [...prev, {
                  role: data.item.role,
                  content,
                  timestamp: Date.now(),
                }]);
              }
            }
            break;
            
          case 'input_audio_buffer.speech_started':
            console.log('🎤 User started speaking');
            break;
            
          case 'input_audio_buffer.speech_stopped':
            console.log('🎤 User stopped speaking');
            break;
            
          case 'response.audio_transcript.delta':
            // Real-time transcript updates
            console.log('📝 Transcript:', data.delta);
            break;
            
          case 'response.done':
            console.log('✅ Response complete');
            break;
            
          case 'error':
            console.error('❌ Realtime API error:', data.error);
            setError(data.error.message);
            break;
        }
      });
      
      // 6. Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // 7. Connect to OpenAI
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-10-01';
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${client_secret}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });
      
      if (!sdpResponse.ok) {
        throw new Error('Failed to connect to OpenAI Realtime API');
      }
      
      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });
      
      console.log('🎉 Connected to OpenAI Realtime API');
      
    } catch (err: any) {
      console.error('❌ Connection error:', err);
      setError(err.message);
      setIsConnected(false);
      setIsRecording(false);
    }
  }, [config]);
  
  // Disconnect
  const disconnect = useCallback(() => {
    // Stop mic
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Stop audio playback
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.srcObject = null;
      audioElRef.current = null;
    }
    
    // Close data channel
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    
    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    
    setIsConnected(false);
    setIsRecording(false);
    console.log('👋 Disconnected from Realtime API');
  }, []);
  
  // Send text message
  const sendMessage = useCallback((text: string) => {
    if (!dcRef.current || !isConnected) {
      console.warn('⚠️ Not connected');
      return;
    }
    
    dcRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text,
          },
        ],
      },
    }));
    
    // Trigger response
    dcRef.current.send(JSON.stringify({
      type: 'response.create',
    }));
    
    // Add user message to UI
    setMessages(prev => [...prev, {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }]);
  }, [isConnected]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    isConnected,
    isRecording,
    messages,
    error,
    connect,
    disconnect,
    sendMessage,
  };
}

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioConversationButtonProps {
  variant?: 'default' | 'floating' | 'inline';
  className?: string;
  onTranscription?: (text: string) => void;
  onResponse?: (text: string, audioUrl?: string) => void;
}

export function AudioConversationButton({ 
  variant = 'default',
  className = '',
  onTranscription,
  onResponse
}: AudioConversationButtonProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasVoiceAccess, setHasVoiceAccess] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio session
  const initializeSession = async () => {
    try {
      const response = await fetch('/api/mrblue/audio/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setSessionId(data.sessionId);
      return data.sessionId;
    } catch (error) {
      console.error('[AudioConversation] Session init error:', error);
      return null;
    }
  };

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:audio/webm;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasVoiceAccess(true);

      // Initialize session if needed
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = await initializeSession();
        if (!currentSessionId) return;
      }

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob, currentSessionId!);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('[AudioConversation] Recording error:', error);
      alert('Microphone access denied or not available');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process audio (transcribe and get response)
  const processAudio = async (audioBlob: Blob, sessionId: string) => {
    try {
      setIsProcessing(true);

      // Convert to base64
      const audioBase64 = await blobToBase64(audioBlob);

      // Send to backend
      const response = await fetch('/api/mrblue/audio/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          audioData: audioBase64
        })
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('[AudioConversation] Transcription:', data.transcription);
      console.log('[AudioConversation] Response:', data.response);
      console.log('[AudioConversation] Vibe Coding:', data.isVibeCoding);

      // Call onTranscription callback if provided
      if (onTranscription && data.transcription) {
        onTranscription(data.transcription);
      }

      // Call onResponse callback if provided
      if (onResponse && data.response) {
        onResponse(data.response, data.audioResponse);
      }

      // Play audio response
      if (data.audioResponse) {
        await playAudioResponse(data.audioResponse);
      }

    } catch (error) {
      console.error('[AudioConversation] Processing error:', error);
      alert('Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Play audio response from ElevenLabs
  const playAudioResponse = async (base64Audio: string) => {
    try {
      setIsPlaying(true);

      // Convert base64 to array buffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create audio context if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Decode and play
      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsPlaying(false);
      };

      source.start(0);
    } catch (error) {
      console.error('[AudioConversation] Playback error:', error);
      setIsPlaying(false);
    }
  };

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // End session on unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        fetch('/api/mrblue/audio/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        }).catch(console.error);
      }
    };
  }, [sessionId]);

  // Button states
  const isDisabled = isProcessing || isPlaying;
  const buttonVariant = isRecording ? 'destructive' : 'default';
  
  // For inline variant, use larger button size for better voice chat UX
  const isInline = variant === 'inline';
  const buttonSize = isInline ? 'lg' : 'icon';
  const iconSize = isInline ? 'h-6 w-6' : 'h-4 w-4';
  
  return (
    <Button
      onClick={toggleRecording}
      disabled={isDisabled}
      variant={buttonVariant}
      className={`${isRecording ? 'animate-pulse' : ''} ${isInline ? 'h-16 w-16 rounded-full' : ''} ${className}`}
      size={buttonSize}
      data-testid="button-audio-conversation"
    >
      {isProcessing ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : isPlaying ? (
        <Volume2 className={iconSize} />
      ) : isRecording ? (
        <MicOff className={iconSize} />
      ) : (
        <Mic className={iconSize} />
      )}
    </Button>
  );
}

export default AudioConversationButton;

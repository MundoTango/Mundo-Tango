/**
 * Voice Input Hook - MediaRecorder + Groq Whisper Integration
 * ✅ MB.MD v9.5 Fix #3: Replaced browser SpeechRecognition with MediaRecorder + Groq Whisper
 * Enables voice commands for Mr. Blue conversations with click-to-toggle UX (wisprflow.ai style)
 */

import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseVoiceInputOptions {
  onResult?: (text: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  isContinuousMode: boolean;
  continuousMode: boolean;
  audioMetrics: { snr: number; thd: number; level: number };
  noiseThreshold: number;
  isInitializing: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  enableContinuousMode: () => Promise<void>;
  disableContinuousMode: () => Promise<void>;
  setNoiseThreshold: (threshold: number) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { onResult } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported] = useState(true); // MediaRecorder is widely supported
  const [isInitializing, setIsInitializing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // ✅ Transcribe audio using Groq Whisper backend API
  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    try {
      console.log('[Voice] 📤 Sending audio to Groq Whisper for transcription...');
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/mrblue/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Voice] ✅ Groq Whisper transcription successful:', data.transcript);
      return data.transcript || null;
    } catch (error) {
      console.error('[Voice] ❌ Transcription error:', error);
      toast({
        variant: 'destructive',
        title: 'Transcription Error',
        description: 'Failed to transcribe audio. Please try again.',
      });
      return null;
    }
  }, [toast]);

  // ✅ Start recording with MediaRecorder (click-to-toggle UX)
  const startListening = useCallback(async () => {
    if (isListening) {
      // If already listening, stop (toggle behavior)
      stopListening();
      return;
    }

    try {
      console.log('[Voice] 🎤 Starting MediaRecorder...');
      setIsInitializing(true);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        }
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/wav';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('[Voice] 🛑 Recording stopped, processing audio...');
        setIsListening(false);
        setIsInitializing(false);

        // Create audio blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('[Voice] 📦 Audio blob created:', audioBlob.size, 'bytes');

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Send to Groq Whisper for transcription
        const transcriptResult = await transcribeAudio(audioBlob);

        if (transcriptResult) {
          setTranscript(transcriptResult);
          if (onResult) {
            onResult(transcriptResult);
          }
          
          toast({
            title: '🎤 Transcription Complete',
            description: `"${transcriptResult.substring(0, 50)}${transcriptResult.length > 50 ? '...' : ''}"`,
          });
        }

        // Reset for next recording
        audioChunksRef.current = [];
        mediaRecorderRef.current = null;
      };

      mediaRecorder.onerror = (event: any) => {
        console.error('[Voice] ❌ MediaRecorder error:', event.error);
        setIsListening(false);
        setIsInitializing(false);
        toast({
          variant: 'destructive',
          title: 'Recording Error',
          description: 'Failed to record audio. Please try again.',
        });
      };

      // Start recording
      mediaRecorder.start();
      setIsListening(true);
      setIsInitializing(false);
      setTranscript('');

      console.log('[Voice] ✅ Recording started with', mimeType);
      
      toast({
        title: '🎤 Recording Started',
        description: 'Speak now... Click the mic again to stop and transcribe.',
      });

    } catch (error: any) {
      console.error('[Voice] ❌ Failed to start recording:', error);
      setIsListening(false);
      setIsInitializing(false);

      let errorTitle = 'Microphone Error';
      let errorDescription = 'Could not access microphone.';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorTitle = '🎤 Microphone Permission Denied';
        errorDescription = 'Please allow microphone access in your browser settings and try again.';
      } else if (error.name === 'NotFoundError') {
        errorTitle = '🎤 No Microphone Found';
        errorDescription = 'Please connect a microphone and try again.';
      }

      toast({
        variant: 'destructive',
        title: errorTitle,
        description: errorDescription,
      });
    }
  }, [isListening, onResult, transcribeAudio, toast]);

  // ✅ Stop recording and process audio
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('[Voice] 🛑 Stopping recording...');
      mediaRecorderRef.current.stop();
    } else {
      setIsListening(false);
      setIsInitializing(false);
      
      // Clean up stream if it exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  // Continuous mode not fully implemented in this simple version
  // Kept for API compatibility but shows informational toast
  const enableContinuousMode = useCallback(async () => {
    toast({
      title: 'ℹ️ Continuous Mode',
      description: 'Continuous voice mode is not available. Use click-to-toggle recording instead.',
    });
  }, [toast]);

  const disableContinuousMode = useCallback(async () => {
    // No-op for now
  }, []);

  const handleSetNoiseThreshold = useCallback((threshold: number) => {
    // No-op for now (noise threshold not used in simple MediaRecorder mode)
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    isContinuousMode: false,
    continuousMode: false,
    audioMetrics: { snr: 0, thd: 0, level: -100 },
    noiseThreshold: -50,
    isInitializing,
    startListening,
    stopListening,
    resetTranscript,
    enableContinuousMode,
    disableContinuousMode,
    setNoiseThreshold: handleSetNoiseThreshold
  };
}

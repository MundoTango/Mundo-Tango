/**
 * Whisper Voice Conversation Hook
 * Full audio conversation using OpenAI Whisper (like ChatGPT voice)
 * - Records audio from microphone
 * - Sends to Whisper API for transcription
 * - Plays AI responses using TTS
 */

import { useState, useRef, useCallback } from 'react';

interface UseWhisperVoiceReturn {
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  speak: (text: string, voice?: string) => Promise<void>;
  stopSpeaking: () => void;
  resetTranscript: () => void;
}

export function useWhisperVoice(): UseWhisperVoiceReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm' // Best browser support
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      console.log('[WhisperVoice] Recording started');
    } catch (err: any) {
      console.error('[WhisperVoice] Recording error:', err);
      setError(err.message || 'Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;

      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);

        try {
          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          console.log('[WhisperVoice] Audio recorded, size:', audioBlob.size);

          // Get auth token from localStorage
          const token = localStorage.getItem('token');

          // Send to Whisper API
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const response = await fetch('/api/whisper/transcribe', {
            method: 'POST',
            headers: {
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: formData
          });

          const data = await response.json();

          if (data.success && data.text) {
            console.log('[WhisperVoice] Transcription:', data.text);
            setTranscript(data.text);
            resolve(data.text);
          } else {
            throw new Error(data.message || 'Transcription failed');
          }
        } catch (err: any) {
          console.error('[WhisperVoice] Transcription error:', err);
          setError(err.message || 'Failed to transcribe audio');
          resolve(null);
        } finally {
          setIsProcessing(false);

          // Stop all tracks
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.stop();
    });
  }, []);

  const speak = useCallback(async (text: string, voice: string = 'alloy') => {
    try {
      setIsSpeaking(true);
      setError(null);

      console.log('[WhisperVoice] Generating speech:', text.substring(0, 50));

      // Get auth token from localStorage
      const token = localStorage.getItem('token');

      // Request TTS from OpenAI
      const response = await fetch('/api/whisper/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ text, voice })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      // Get audio buffer
      const arrayBuffer = await response.arrayBuffer();

      // Create audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Create source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      source.onended = () => {
        setIsSpeaking(false);
        audioSourceRef.current = null;
      };

      audioSourceRef.current = source;
      source.start(0);

      console.log('[WhisperVoice] Playing audio response');
    } catch (err: any) {
      console.error('[WhisperVoice] Speech error:', err);
      setError(err.message || 'Failed to play speech');
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      } catch (err) {
        console.error('[WhisperVoice] Stop speaking error:', err);
      }
    }
    setIsSpeaking(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isRecording,
    isProcessing,
    isSpeaking,
    transcript,
    error,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
    resetTranscript
  };
}

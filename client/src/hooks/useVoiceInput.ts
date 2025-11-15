/**
 * Voice Input Hook - Web Speech API & VAD Integration
 * Enables voice commands for Mr. Blue conversations with continuous mode support
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VoiceActivityDetector } from '@/lib/voiceActivityDetection';
import { convertToAudioBlob } from '@/lib/audioUtils';
import { AudioProcessor, NoiseGate } from '@/lib/audioProcessor';
import { AudioMetrics } from '@/lib/audioMetrics';

interface UseVoiceInputOptions {
  onResult?: (text: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
}

interface AudioQualityMetrics {
  snr: number;
  thd: number;
  level: number;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  isContinuousMode: boolean;
  continuousMode: boolean;
  audioMetrics: AudioQualityMetrics;
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
  const { onResult, continuous = true, interimResults = true } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [audioMetrics, setAudioMetrics] = useState<AudioQualityMetrics>({
    snr: 0,
    thd: 0,
    level: -100
  });
  const [noiseThreshold, setNoiseThreshold] = useState(-50);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const continuousModeRef = useRef(false);
  const vadRef = useRef<VoiceActivityDetector | null>(null);
  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const audioMetricsRef = useRef<AudioMetrics | null>(null);
  const noiseGateRef = useRef<NoiseGate | null>(null);
  const metricsIntervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Transcribe audio using backend API
  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');

      const response = await fetch('/api/mrblue/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      return data.transcript || null;
    } catch (error) {
      console.error('[Voice] Transcription error:', error);
      toast({
        variant: 'destructive',
        title: 'Transcription Error',
        description: 'Failed to transcribe audio. Please try again.',
      });
      return null;
    }
  }, [toast]);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);

        // Call onResult callback when we have a final transcript
        if (finalTranscript && onResult) {
          onResult(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error !== 'no-speech') {
          toast({
            variant: 'destructive',
            title: 'Voice Input Error',
            description: `Failed to recognize speech: ${event.error}`
          });
        }
      };

      recognition.onend = () => {
        // If in continuous mode, automatically restart
        if (continuousModeRef.current) {
          console.log('[Voice] Recognition ended, restarting in continuous mode...');
          try {
            recognition.start();
            setIsListening(true);
          } catch (error) {
            console.error('[Voice] Failed to restart recognition:', error);
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (vadRef.current) {
        vadRef.current.destroy();
      }
    };
  }, [toast, continuous, interimResults, onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      continuousModeRef.current = false; // Disable continuous mode when manually stopping
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const enableContinuousMode = useCallback(async () => {
    console.log('[Voice] Button clicked - starting voice mode activation');
    setIsInitializing(true);
    
    try {
      // Step 1: Request microphone permission
      console.log('[Voice] Step 1/4: Requesting microphone permission...');
      toast({
        title: 'Initializing Voice Mode',
        description: 'Step 1/4: Requesting microphone permission...',
      });
      
      if (!audioProcessorRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 1,
          }
        });
        console.log('[Voice] ✅ Microphone permission granted');

        // Step 2: Initialize audio processing
        console.log('[Voice] Step 2/4: Initializing audio processing pipeline...');
        toast({
          title: 'Initializing Voice Mode',
          description: 'Step 2/4: Setting up audio processing...',
        });

        audioProcessorRef.current = new AudioProcessor();
        const processedStream = await audioProcessorRef.current.initialize(stream);

        // Initialize audio metrics
        const audioContext = audioProcessorRef.current.getAudioContext();
        audioMetricsRef.current = new AudioMetrics(audioContext);
        
        // Connect metrics to audio source
        const sourceNode = audioProcessorRef.current.getSourceNode();
        if (sourceNode && audioMetricsRef.current) {
          audioMetricsRef.current.connect(sourceNode);
        }

        // Initialize noise gate
        noiseGateRef.current = new NoiseGate(audioContext);
        noiseGateRef.current.setThreshold(noiseThreshold);

        // Start metrics monitoring
        metricsIntervalRef.current = window.setInterval(() => {
          if (audioMetricsRef.current) {
            setAudioMetrics({
              snr: audioMetricsRef.current.getSNR(),
              thd: audioMetricsRef.current.getTHD(),
              level: audioMetricsRef.current.getLevel(),
            });
          }
        }, 100); // Update metrics every 100ms

        console.log('[Voice] ✅ Audio processing pipeline initialized');
      }

      // Step 3: Initialize VAD (Voice Activity Detector)
      console.log('[Voice] Step 3/4: Initializing Voice Activity Detector (VAD)...');
      toast({
        title: 'Initializing Voice Mode',
        description: 'Step 3/4: Loading voice detection AI model...',
      });

      if (!vadRef.current) {
        vadRef.current = new VoiceActivityDetector();
        await vadRef.current.initialize({
          onSpeechStart: () => {
            console.log('[Continuous] Speech detected');
            setIsListening(true);
          },
          onSpeechEnd: async (audioData) => {
            console.log('[Continuous] Speech ended, processing...');
            
            // Convert Float32Array to audio blob
            const audioBlob = await convertToAudioBlob(audioData);
            
            // Send to transcription
            const transcriptResult = await transcribeAudio(audioBlob);
            
            if (transcriptResult && onResult) {
              onResult(transcriptResult);
            }
            
            setIsListening(false);
          },
          onError: (error) => {
            console.error('[VAD] Error:', error);
            toast({
              variant: 'destructive',
              title: 'Voice Detection Error',
              description: 'Failed to initialize voice detection. Please try again.',
            });
          },
        });
        console.log('[Voice] ✅ VAD initialized successfully');
      }
      
      // Step 4: Start listening
      console.log('[Voice] Step 4/4: Starting continuous listening mode...');
      toast({
        title: 'Initializing Voice Mode',
        description: 'Step 4/4: Activating continuous listening...',
      });

      await vadRef.current.start();
      setContinuousMode(true);
      setIsContinuousMode(true);
      setIsInitializing(false);
      
      console.log('[Voice] ✅ Voice mode activated successfully!');
      console.log('[Voice] Continuous mode enabled with VAD and audio processing');
      
      toast({
        title: '🎤 Voice Mode Active!',
        description: 'Start speaking naturally - I\'m listening with studio-quality audio!',
      });
    } catch (error: any) {
      console.error('[Voice] ❌ Failed to enable continuous mode:', error);
      setIsInitializing(false);
      
      // Provide specific error messages based on error type
      let errorTitle = 'Activation Failed';
      let errorDescription = 'Could not enable continuous voice mode.';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorTitle = 'Microphone Permission Denied';
        errorDescription = 'Please allow microphone access in your browser settings and try again.';
      } else if (error.name === 'NotFoundError') {
        errorTitle = 'No Microphone Found';
        errorDescription = 'Please connect a microphone and try again.';
      } else if (error.message?.includes('VAD') || error.message?.includes('vad')) {
        errorTitle = 'Voice Detection Failed';
        errorDescription = 'Could not load voice detection model. Check your internet connection and try again.';
      } else if (error.message?.includes('AudioProcessor')) {
        errorTitle = 'Audio Processing Error';
        errorDescription = 'Failed to initialize audio processing. Please refresh and try again.';
      }
      
      toast({
        variant: 'destructive',
        title: errorTitle,
        description: errorDescription,
      });
    }
  }, [onResult, transcribeAudio, toast, noiseThreshold]);

  const disableContinuousMode = useCallback(async () => {
    try {
      if (vadRef.current) {
        await vadRef.current.stop();
      }

      // Stop metrics monitoring
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
        metricsIntervalRef.current = null;
      }

      // Clean up audio processing
      if (audioMetricsRef.current) {
        audioMetricsRef.current.disconnect();
        audioMetricsRef.current = null;
      }

      if (noiseGateRef.current) {
        noiseGateRef.current.stopMonitoring();
        noiseGateRef.current = null;
      }

      if (audioProcessorRef.current) {
        audioProcessorRef.current.destroy();
        audioProcessorRef.current = null;
      }

      setContinuousMode(false);
      setIsContinuousMode(false);
      setIsListening(false);
      
      // Reset metrics
      setAudioMetrics({
        snr: 0,
        thd: 0,
        level: -100
      });
      
      console.log('[Voice] Continuous mode disabled and audio processing cleaned up');
      
      toast({
        title: 'Continuous Voice Disabled',
        description: 'Voice detection has been stopped.',
      });
    } catch (error) {
      console.error('[Voice] Failed to disable continuous mode:', error);
    }
  }, [toast]);

  const handleSetNoiseThreshold = useCallback((threshold: number) => {
    setNoiseThreshold(threshold);
    if (noiseGateRef.current) {
      noiseGateRef.current.setThreshold(threshold);
      console.log('[Audio] Noise threshold updated to', threshold, 'dB');
    }
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    isContinuousMode,
    continuousMode,
    audioMetrics,
    noiseThreshold,
    isInitializing,
    startListening,
    stopListening,
    resetTranscript,
    enableContinuousMode,
    disableContinuousMode,
    setNoiseThreshold: handleSetNoiseThreshold
  };
}

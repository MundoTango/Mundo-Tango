/**
 * Voice Input Hook - Web Speech API Integration
 * Enables voice commands for Mr. Blue conversations
 */

import { useState, useEffect, useRef, useCallback } from 'react';
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
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  enableContinuousMode: () => void;
  disableContinuousMode: () => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { onResult, continuous = true, interimResults = true } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const continuousModeRef = useRef(false);
  const { toast } = useToast();

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

  const enableContinuousMode = useCallback(() => {
    continuousModeRef.current = true;
    console.log('[Voice] Continuous mode enabled');
  }, []);

  const disableContinuousMode = useCallback(() => {
    continuousModeRef.current = false;
    console.log('[Voice] Continuous mode disabled');
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    enableContinuousMode,
    disableContinuousMode
  };
}

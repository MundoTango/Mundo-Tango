/**
 * Text-to-Speech Hook - Web Speech API
 * Enables Mr. Blue to speak responses with lip-sync tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseTextToSpeechReturn {
  speak: (text: string, onStart?: () => void, onEnd?: () => void) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const { toast } = useToast();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Prefer natural female voices (NOT Google robot voices)
        const naturalVoice = availableVoices.find(
          voice => voice.lang.startsWith('en') && 
                   (voice.name.includes('Samantha') || voice.name.includes('Karen'))
        ) || availableVoices.find(
          voice => voice.lang.startsWith('en') && 
                   (voice.name.includes('Zira') || voice.name.includes('Female'))
        ) || availableVoices.find(
          voice => voice.lang.startsWith('en') && 
                   voice.name.includes('Microsoft') && 
                   !voice.name.includes('Male')
        ) || availableVoices.find(
          voice => voice.lang.startsWith('en') && 
                   !voice.name.includes('Google')
        ) || availableVoices.find(
          voice => voice.lang.startsWith('en')
        ) || availableVoices[0];

        setSelectedVoice(naturalVoice || null);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      setIsSupported(false);
      toast({
        variant: 'destructive',
        title: 'TTS Not Supported',
        description: 'Your browser does not support text-to-speech.'
      });
    }
  }, [toast]);

  const speak = useCallback((
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ) => {
    if (!isSupported || !selectedVoice) {
      console.warn('Text-to-speech not available');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('TTS error:', event);
      setIsSpeaking(false);
      toast({
        variant: 'destructive',
        title: 'Speech Error',
        description: 'Failed to speak the message.'
      });
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, toast]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
    selectedVoice,
    setSelectedVoice
  };
}

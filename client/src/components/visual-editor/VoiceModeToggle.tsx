/**
 * Voice Mode Toggle Component
 * Enables hands-free continuous voice control with wake word detection
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceModeToggleProps {
  isListening: boolean;
  onToggle: (enabled: boolean) => void;
  onWakeWordDetected?: () => void;
  className?: string;
}

const WAKE_WORDS = ['hey mr blue', 'hey mr. blue', 'computer'];
const SILENCE_TIMEOUT = 5000; // 5 seconds

export function VoiceModeToggle({
  isListening,
  onToggle,
  onWakeWordDetected,
  className
}: VoiceModeToggleProps) {
  const [voiceMode, setVoiceMode] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [lastSpeechTime, setLastSpeechTime] = useState<number>(Date.now());
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Wake word detection
  const checkForWakeWord = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    for (const wakeWord of WAKE_WORDS) {
      if (lowerTranscript.includes(wakeWord)) {
        console.log('[VoiceMode] Wake word detected:', wakeWord);
        setWakeWordDetected(true);
        onWakeWordDetected?.();
        return true;
      }
    }
    
    return false;
  }, [onWakeWordDetected]);

  // Silence detection
  useEffect(() => {
    if (!voiceMode || !isListening) return;

    // Clear existing timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Set new timer for silence detection
    silenceTimerRef.current = setTimeout(() => {
      const now = Date.now();
      const timeSinceLastSpeech = now - lastSpeechTime;

      if (timeSinceLastSpeech >= SILENCE_TIMEOUT) {
        console.log('[VoiceMode] Silence detected, pausing listening');
        setWakeWordDetected(false);
        // Don't turn off voice mode, just wait for next wake word
      }
    }, SILENCE_TIMEOUT);

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [voiceMode, isListening, lastSpeechTime]);

  // Update last speech time when listening changes
  useEffect(() => {
    if (isListening) {
      setLastSpeechTime(Date.now());
    }
  }, [isListening]);

  const handleToggle = () => {
    const newVoiceMode = !voiceMode;
    setVoiceMode(newVoiceMode);
    onToggle(newVoiceMode);

    if (!newVoiceMode) {
      setWakeWordDetected(false);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Button
        variant={voiceMode ? 'default' : 'outline'}
        onClick={handleToggle}
        className={cn(
          'w-full gap-2',
          voiceMode && 'bg-primary'
        )}
        data-testid="button-enable-voice"
      >
        {voiceMode ? (
          <>
            <Volume2 className="h-4 w-4" />
            Voice Mode Active
          </>
        ) : (
          <>
            <MicOff className="h-4 w-4" />
            Enable Voice Mode
          </>
        )}
      </Button>

      {voiceMode && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={wakeWordDetected ? 'default' : 'secondary'}>
                {wakeWordDetected ? (
                  <>
                    <Mic className="h-3 w-3 mr-1" />
                    Listening
                  </>
                ) : (
                  'Waiting for wake word'
                )}
              </Badge>
            </div>

            {isListening && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  Recording...
                </span>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Wake words:</p>
              <ul className="list-disc list-inside space-y-0.5 pl-2">
                <li>"Hey Mr. Blue"</li>
                <li>"Computer"</li>
              </ul>
              <p className="pt-2 text-xs">
                Voice mode will pause after 5 seconds of silence. Say a wake word to resume.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface MrBlueAvatarVideoProps {
  position?: [number, number];
  size?: number;
  expression?: 'happy' | 'thoughtful' | 'excited' | 'focused' | 'friendly' | 'confident' | 'playful' | 'professional';
  isActive?: boolean;
  onInteraction?: () => void;
}

/**
 * MrBlueAvatarVideo - Luma AI generated video avatar
 * 
 * Features:
 * - Displays looping Luma-generated video of Mr. Blue
 * - Voice interaction controls
 * - Auto-fallback to 2D if video unavailable
 * - Context-aware expressions (future: different video loops)
 */
export function MrBlueAvatarVideo({
  position = [0, 0],
  size = 200,
  expression = 'friendly',
  isActive = false,
  onInteraction
}: MrBlueAvatarVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Fetch Mr. Blue avatar video
  const { data: videoData, isLoading, error } = useQuery({
    queryKey: ['/api/videos/mr-blue/avatar'],
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          console.log('User said:', transcript);
          handleUserSpeech(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-play video when loaded
  useEffect(() => {
    if (videoRef.current && videoData?.videoPath) {
      videoRef.current.play().catch(err => {
        console.warn('Video autoplay failed:', err);
      });
    }
  }, [videoData]);

  const handleUserSpeech = (transcript: string) => {
    setIsSpeaking(true);
    console.log('Processing:', transcript);
    
    setTimeout(() => {
      setIsSpeaking(false);
    }, 2000);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleVideoError = () => {
    console.error('Video failed to load');
    setVideoError(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div 
        className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse"
        style={{ width: size, height: size }}
        data-testid="mr-blue-loading"
      >
        <div className="text-primary/60 text-xs">Loading...</div>
      </div>
    );
  }

  // Show error state (fallback to 2D needed)
  if (error || videoError || !videoData?.videoPath) {
    return (
      <div 
        className="relative flex items-center justify-center rounded-full bg-muted border-2 border-dashed border-muted-foreground/20"
        style={{ width: size, height: size }}
        data-testid="mr-blue-video-error"
      >
        <VideoOff className="h-8 w-8 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Luma Video Avatar */}
      <video
        ref={videoRef}
        src={videoData.videoPath}
        loop
        muted
        playsInline
        autoPlay
        onError={handleVideoError}
        onClick={onInteraction}
        className="w-full h-full object-cover rounded-full shadow-2xl hover:shadow-primary/20 transition-shadow cursor-pointer"
        data-testid="mr-blue-video-avatar"
      />

      {/* Voice Controls */}
      <div className="absolute bottom-2 right-2 flex gap-2">
        <Button
          size="icon"
          variant={isListening ? "default" : "outline"}
          onClick={toggleListening}
          className="rounded-full w-10 h-10 shadow-lg backdrop-blur-sm bg-background/80"
          data-testid="button-toggle-voice"
        >
          {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
      </div>

      {/* Status Indicator */}
      {(isListening || isSpeaking) && (
        <div className="absolute top-2 left-2">
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-pulse backdrop-blur-sm">
            {isListening ? '🎤 Listening...' : '💬 Speaking...'}
          </div>
        </div>
      )}

      {/* Active pulse effect */}
      {isActive && (
        <div className="absolute inset-0 rounded-full border-4 border-primary/50 animate-pulse" />
      )}
    </div>
  );
}

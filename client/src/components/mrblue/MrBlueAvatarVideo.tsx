import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { MrBlueAvatar2D } from './MrBlueAvatar2D';

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
  // Note: This may fail if Luma credits are insufficient - that's OK, we'll fallback to 2D
  const { data: videoData, isLoading, error } = useQuery<{
    success: boolean;
    videoPath?: string;
    generationId?: string;
    state: string;
  }>({
    queryKey: ['/api/videos/mr-blue/avatar'],
    refetchOnWindowFocus: false,
    retry: 0, // Don't retry on failure - fail fast to 2D fallback
  });

  // Debug logging
  useEffect(() => {
    console.log('[MrBlueAvatarVideo] State:', {
      isLoading,
      error: error ? String(error) : null,
      videoError,
      videoPath: videoData?.videoPath,
      state: videoData?.state
    });
  }, [isLoading, error, videoError, videoData]);

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
    const video = videoRef.current;
    if (video && videoData?.videoPath) {
      // Force browser to load the source element
      video.load();
      
      // Wait for metadata to load, then play
      const handleCanPlay = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            // Ignore AbortError - happens when element is removed during unmount
            if (err.name !== 'AbortError') {
              console.warn('[MrBlueAvatarVideo] Video autoplay failed (not AbortError):', err);
            }
          });
        }
      };

      video.addEventListener('canplay', handleCanPlay, { once: true });
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
      };
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

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    console.error('[MrBlueAvatarVideo] Video failed to load:', {
      src: video.src,
      error: video.error,
      networkState: video.networkState,
      readyState: video.readyState
    });
    setVideoError(true);
  };

  // Fallback to 2D avatar if video unavailable or failed
  // This includes: loading, error, or Luma credits insufficient
  if (isLoading || error || videoError || !videoData?.videoPath) {
    console.log('[MrBlueAvatarVideo] Using 2D fallback:', { isLoading, error, videoError, hasVideoPath: !!videoData?.videoPath });
    return (
      <MrBlueAvatar2D
        size={size}
        expression={expression}
        isActive={isActive}
        onInteraction={onInteraction}
      />
    );
  }

  console.log('[MrBlueAvatarVideo] Rendering VIDEO element with src:', videoData.videoPath);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Luma Video Avatar */}
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        autoPlay
        onError={handleVideoError}
        onLoadedData={() => console.log('[MrBlueAvatarVideo] Video loaded successfully!')}
        onClick={onInteraction}
        className="w-full h-full object-cover rounded-full shadow-2xl hover:shadow-primary/20 transition-shadow cursor-pointer"
        data-testid="mr-blue-video-avatar"
      >
        <source src={videoData.videoPath} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

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

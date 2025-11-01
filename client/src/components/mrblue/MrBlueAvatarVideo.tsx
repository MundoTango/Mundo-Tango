import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { MrBlueAvatar2D } from './MrBlueAvatar2D';
import { useVideoStateManager, type VideoState } from '@/hooks/useVideoStateManager';

interface MrBlueAvatarVideoProps {
  position?: [number, number];
  size?: number;
  expression?: 'happy' | 'thoughtful' | 'excited' | 'focused' | 'friendly' | 'confident' | 'playful' | 'professional';
  isActive?: boolean;
  onInteraction?: () => void;
  initialState?: VideoState;
  enableStateTransitions?: boolean;
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
  onInteraction,
  initialState = 'idle',
  enableStateTransitions = true
}: MrBlueAvatarVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Video state manager for dynamic expression changes
  const videoStateManager = useVideoStateManager({
    defaultState: initialState,
    onStateChange: (state) => {
      console.log('[MrBlueAvatarVideo] State changed to:', state);
      if (state === 'listening') setIsListening(true);
      else if (state === 'speaking') setIsSpeaking(true);
      else {
        setIsListening(false);
        setIsSpeaking(false);
      }
    }
  });

  // Fetch Mr. Blue avatar video (fallback if state videos don't exist)
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

  // Get current state video path
  const currentVideoPath = enableStateTransitions 
    ? videoStateManager.getVideoPath() 
    : videoData?.videoPath;

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

  // Auto-play video when loaded or state changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && currentVideoPath) {
      // Force browser to load the new source
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
  }, [currentVideoPath]);

  const handleUserSpeech = (transcript: string) => {
    console.log('Processing:', transcript);
    
    if (enableStateTransitions) {
      // Mr. Blue speaks for ~3 seconds then returns to idle
      videoStateManager.startSpeaking(3000);
    } else {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2000);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      if (enableStateTransitions) {
        videoStateManager.returnToIdle();
      } else {
        setIsListening(false);
      }
    } else {
      recognitionRef.current.start();
      if (enableStateTransitions) {
        videoStateManager.startListening();
      } else {
        setIsListening(true);
      }
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
  if (isLoading || error || videoError || (!currentVideoPath && !videoData?.videoPath)) {
    console.log('[MrBlueAvatarVideo] Using 2D fallback:', { isLoading, error, videoError, hasVideoPath: !!currentVideoPath });
    return (
      <MrBlueAvatar2D
        size={size}
        expression={expression}
        isActive={isActive}
        onInteraction={onInteraction}
      />
    );
  }

  console.log('[MrBlueAvatarVideo] Rendering VIDEO element with src:', currentVideoPath, 'State:', videoStateManager.currentState);
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
        onLoadedData={() => console.log('[MrBlueAvatarVideo] Video loaded successfully!', videoStateManager.currentState)}
        onClick={onInteraction}
        className="w-full h-full object-cover rounded-full shadow-2xl hover:shadow-primary/20 transition-shadow cursor-pointer"
        data-testid="mr-blue-video-avatar"
      >
        <source src={currentVideoPath || videoData?.videoPath} type="video/mp4" />
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

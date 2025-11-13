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
    const errorDetails = {
      src: video.src,
      error: video.error,
      errorCode: video.error?.code,
      errorMessage: video.error?.message,
      networkState: video.networkState,
      readyState: video.readyState
    };
    console.error('[MrBlueAvatarVideo] Video error:', errorDetails);
    
    // Only fallback on actual media errors, not autoplay policy errors
    // Error codes: 1=ABORTED, 2=NETWORK, 3=DECODE, 4=SRC_NOT_SUPPORTED
    const isRealError = video.error && (video.error.code === 2 || video.error.code === 3 || video.error.code === 4);
    
    if (isRealError) {
      console.error('[MrBlueAvatarVideo] Critical video error - falling back to 2D');
      setVideoError(true);
    } else {
      console.warn('[MrBlueAvatarVideo] Non-critical video error - attempting recovery');
      // Try to play anyway
      video.play().catch(err => console.warn('[MrBlueAvatarVideo] Play failed:', err));
    }
  };

  // Fallback to 2D avatar ONLY if:
  // 1. Video failed to load (videoError)
  // 2. API error occurred  
  // 3. No video path available at all
  // Note: Don't fallback during isLoading if we have a valid path from videoStateManager
  const shouldFallback = videoError || error || (!currentVideoPath && !videoData?.videoPath);
  
  if (shouldFallback) {
    console.log('[MrBlueAvatarVideo] Using 2D fallback:', { error, videoError, hasCurrentPath: !!currentVideoPath, hasVideoDataPath: !!videoData?.videoPath });
    return (
      <MrBlueAvatar2D
        size={size}
        expression={expression}
        isActive={isActive}
        onInteraction={onInteraction}
      />
    );
  }

  // CRITICAL DEBUG: Log all video path sources
  console.log('[MrBlueAvatarVideo] Video Path Debug:', {
    currentVideoPath,
    'videoData?.videoPath': videoData?.videoPath,
    enableStateTransitions,
    currentState: videoStateManager.currentState,
    computedPath: currentVideoPath || videoData?.videoPath
  });
  
  const handleMouseEnter = () => {
    if (enableStateTransitions) {
      videoStateManager.transitionTo('happy');
    }
  };

  const handleMouseLeave = () => {
    if (enableStateTransitions && videoStateManager.currentState === 'happy') {
      videoStateManager.returnToIdle();
    }
  };

  return (
    <div 
      className="relative group" 
      style={{ 
        width: size, 
        height: size * 1.2 // Natural portrait aspect ratio
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Luma Video Avatar - No circular constraint, natural portrait */}
      <div className="relative w-full h-full">
        {/* Subtle glow effect (Option B) */}
        <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Video with edge fade mask (Option C) */}
        <video
          ref={videoRef}
          src={currentVideoPath || videoData?.videoPath}
          loop
          muted
          playsInline
          autoPlay
          preload="none"
          onError={handleVideoError}
          onLoadedData={() => console.log('[MrBlueAvatarVideo] Video loaded successfully!', videoStateManager.currentState)}
          onClick={onInteraction}
          className="w-full h-full object-cover cursor-pointer transition-all duration-300 hover:scale-105"
          style={{
            maskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, black 60%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, black 60%, transparent 100%)',
            filter: 'drop-shadow(0 10px 30px rgba(139, 92, 246, 0.3))'
          }}
          data-testid="mr-blue-video-avatar"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Voice Controls */}
      <div className="absolute bottom-2 right-2 flex gap-2">
        <Button
          size="icon"
          variant={isListening ? "default" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            toggleListening();
          }}
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

      {/* Active pulse effect - now subtle glow instead of circular border */}
      {isActive && (
        <div className="absolute inset-0 bg-primary/20 blur-md animate-pulse pointer-events-none" />
      )}
    </div>
  );
}

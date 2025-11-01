import { useState, useCallback, useRef, useEffect } from 'react';

export type VideoState = 
  | 'idle' | 'listening' | 'speaking' | 'happy' 
  | 'thinking' | 'excited' | 'surprised' | 'nodding'
  | 'walk-left' | 'walk-right';

interface VideoStateManagerOptions {
  onStateChange?: (state: VideoState) => void;
  defaultState?: VideoState;
}

/**
 * Video State Manager Hook
 * Manages Mr. Blue's dynamic video states based on user interactions
 */
export function useVideoStateManager(options: VideoStateManagerOptions = {}) {
  const { onStateChange, defaultState = 'idle' } = options;
  const [currentState, setCurrentState] = useState<VideoState>(defaultState);
  const [previousState, setPreviousState] = useState<VideoState>(defaultState);
  const stateTimeoutRef = useRef<NodeJS.Timeout>();

  // Transition to a new state
  const transitionTo = useCallback((newState: VideoState, duration?: number) => {
    // Clear any pending state transitions
    if (stateTimeoutRef.current) {
      clearTimeout(stateTimeoutRef.current);
    }

    setPreviousState(currentState);
    setCurrentState(newState);
    onStateChange?.(newState);

    // Auto-return to idle after duration (if specified)
    if (duration) {
      stateTimeoutRef.current = setTimeout(() => {
        setCurrentState('idle');
        onStateChange?.('idle');
      }, duration);
    }
  }, [currentState, onStateChange]);

  // Get video path for current state
  const getVideoPath = useCallback((state: VideoState = currentState): string => {
    // Check if state-specific video exists
    const stateVideoPath = `/videos/states/${state}.mp4`;
    
    // Fallback to default avatar if state video doesn't exist
    return stateVideoPath;
  }, [currentState]);

  // Check if state video is available
  const isStateVideoAvailable = useCallback(async (state: VideoState): Promise<boolean> => {
    try {
      const response = await fetch(`/videos/states/${state}.mp4`, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stateTimeoutRef.current) {
        clearTimeout(stateTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentState,
    previousState,
    transitionTo,
    getVideoPath,
    isStateVideoAvailable,
    
    // Convenience methods for common state transitions
    startListening: () => transitionTo('listening'),
    startSpeaking: (duration?: number) => transitionTo('speaking', duration),
    showHappy: (duration?: number) => transitionTo('happy', duration),
    showThinking: (duration?: number) => transitionTo('thinking', duration),
    showExcited: (duration?: number) => transitionTo('excited', duration),
    showSurprised: (duration?: number) => transitionTo('surprised', duration),
    startNodding: (duration?: number) => transitionTo('nodding', duration),
    walkLeft: () => transitionTo('walk-left'),
    walkRight: () => transitionTo('walk-right'),
    returnToIdle: () => transitionTo('idle'),
  };
}

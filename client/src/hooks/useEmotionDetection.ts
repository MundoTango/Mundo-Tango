import { useEffect, useRef, useCallback } from 'react';
import { analyseUserEmotion, Emotion } from '@/lib/personalityEngine';

export function useEmotionDetection(
  onEmotionChange: (emotion: Emotion) => void,
  intervalMs = 5000
) {
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const stableCallback = useCallback(onEmotionChange, []);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    const poll = async () => {
      if (!isMountedRef.current) return;
      
      try {
        const detected = await analyseUserEmotion();
        if (isMountedRef.current) {
          stableCallback(detected);
        }
      } catch (error) {
        console.error('[EmotionDetection] Error:', error);
      }
      
      if (isMountedRef.current) {
        timeoutRef.current = setTimeout(poll, intervalMs);
      }
    };
    
    poll();
    
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stableCallback, intervalMs]);
}

export function useManualEmotionControl(initialEmotion: Emotion = 'idle') {
  const emotionRef = useRef<Emotion>(initialEmotion);
  
  const setEmotion = useCallback((emotion: Emotion) => {
    emotionRef.current = emotion;
  }, []);
  
  const getEmotion = useCallback(() => emotionRef.current, []);
  
  return { setEmotion, getEmotion, currentEmotion: emotionRef.current };
}

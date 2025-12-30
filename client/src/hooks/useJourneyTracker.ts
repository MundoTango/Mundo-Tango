import { useState, useEffect, useCallback, useRef } from 'react';

export interface JourneyStep {
  timestamp: number;
  path: string;
  action?: string;
  element?: string;
  details?: Record<string, unknown>;
}

export interface JourneySnapshot {
  sessionId: string;
  userId?: number;
  currentPath: string;
  journey: JourneyStep[];
  browserInfo: {
    userAgent: string;
    viewport: { width: number; height: number };
    language: string;
    platform: string;
  };
  startedAt: number;
  lastActivity: number;
}

const generateSessionId = () => {
  return `mt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const MAX_JOURNEY_STEPS = 50;

export function useJourneyTracker(userId?: number) {
  const [sessionId] = useState(() => {
    const stored = sessionStorage.getItem('mt_session_id');
    if (stored) return stored;
    const newId = generateSessionId();
    sessionStorage.setItem('mt_session_id', newId);
    return newId;
  });

  const journeyRef = useRef<JourneyStep[]>([]);
  const startedAtRef = useRef(Date.now());
  const lastActivityRef = useRef(Date.now());

  const trackStep = useCallback((step: Omit<JourneyStep, 'timestamp'>) => {
    const newStep: JourneyStep = {
      ...step,
      timestamp: Date.now(),
    };
    journeyRef.current = [...journeyRef.current.slice(-MAX_JOURNEY_STEPS + 1), newStep];
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    trackStep({ path: window.location.pathname, action: 'page_load' });
  }, [trackStep]);

  useEffect(() => {
    const handlePopState = () => {
      trackStep({ path: window.location.pathname, action: 'navigation' });
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const testId = target.closest('[data-testid]')?.getAttribute('data-testid');
      const buttonText = target.closest('button')?.textContent?.substring(0, 50);
      const linkHref = target.closest('a')?.getAttribute('href');

      if (testId || buttonText || linkHref) {
        trackStep({
          path: window.location.pathname,
          action: 'click',
          element: testId || buttonText || linkHref || 'unknown',
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleClick, { passive: true });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick);
    };
  }, [trackStep]);

  const getSnapshot = useCallback((): JourneySnapshot => {
    return {
      sessionId,
      userId,
      currentPath: window.location.pathname,
      journey: journeyRef.current,
      browserInfo: {
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        language: navigator.language,
        platform: navigator.platform,
      },
      startedAt: startedAtRef.current,
      lastActivity: lastActivityRef.current,
    };
  }, [sessionId, userId]);

  return {
    sessionId,
    trackStep,
    getSnapshot,
  };
}

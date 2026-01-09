import { useState, useEffect, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';

export interface JourneyStep {
  timestamp: number;
  path: string;
  action?: string;
  element?: string;
  details?: Record<string, unknown>;
}

export interface ConsoleError {
  timestamp: number;
  message: string;
  stack?: string;
  type: 'error' | 'warning' | 'unhandled_rejection';
}

export interface NetworkFailure {
  timestamp: number;
  url: string;
  method: string;
  status: number;
  statusText: string;
}

export interface RageClick {
  timestamp: number;
  element: string;
  count: number;
  path: string;
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
    scrollPosition: { x: number; y: number };
    theme: string;
    locale: string;
  };
  openDialogs: string[];
  consoleErrors: ConsoleError[];
  networkFailures: NetworkFailure[];
  rageClicks: RageClick[];
  formState: Record<string, string>;
  startedAt: number;
  lastActivity: number;
}

const generateSessionId = () => {
  return `mt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const MAX_JOURNEY_STEPS = 50;
const MAX_ERRORS = 20;
const MAX_NETWORK_FAILURES = 10;
const RAGE_CLICK_THRESHOLD = 3; // 3+ clicks within 500ms
const RAGE_CLICK_WINDOW = 500; // ms

export function useJourneyTracker(userId?: number) {
  const [sessionId] = useState(() => {
    const stored = sessionStorage.getItem('mt_session_id');
    if (stored) return stored;
    const newId = generateSessionId();
    sessionStorage.setItem('mt_session_id', newId);
    return newId;
  });

  const journeyRef = useRef<JourneyStep[]>([]);
  const consoleErrorsRef = useRef<ConsoleError[]>([]);
  const networkFailuresRef = useRef<NetworkFailure[]>([]);
  const rageClicksRef = useRef<RageClick[]>([]);
  const startedAtRef = useRef(Date.now());
  const lastActivityRef = useRef(Date.now());
  
  // Rage click tracking
  const clickTracker = useRef<{ element: string; timestamps: number[] }>({ element: '', timestamps: [] });

  const trackStep = useCallback((step: Omit<JourneyStep, 'timestamp'>) => {
    const newStep: JourneyStep = {
      ...step,
      timestamp: Date.now(),
    };
    journeyRef.current = [...journeyRef.current.slice(-MAX_JOURNEY_STEPS + 1), newStep];
    lastActivityRef.current = Date.now();
  }, []);

  // Initialize on mount
  useEffect(() => {
    trackStep({ path: window.location.pathname, action: 'page_load' });
  }, [trackStep]);

  // Console error interception
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      consoleErrorsRef.current = [
        ...consoleErrorsRef.current.slice(-MAX_ERRORS + 1),
        {
          timestamp: Date.now(),
          message: message.substring(0, 500),
          type: 'error'
        }
      ];
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      // Only track warnings that look like errors
      if (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
        consoleErrorsRef.current = [
          ...consoleErrorsRef.current.slice(-MAX_ERRORS + 1),
          {
            timestamp: Date.now(),
            message: message.substring(0, 500),
            type: 'warning'
          }
        ];
      }
      originalWarn.apply(console, args);
    };
    
    // Unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      consoleErrorsRef.current = [
        ...consoleErrorsRef.current.slice(-MAX_ERRORS + 1),
        {
          timestamp: Date.now(),
          message: String(event.reason).substring(0, 500),
          stack: event.reason?.stack?.substring(0, 1000),
          type: 'unhandled_rejection'
        }
      ];
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Network failure interception
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [input, init] = args;
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
      const method = init?.method || 'GET';
      
      try {
        const response = await originalFetch.apply(window, args);
        
        // Track failed API calls (4xx, 5xx)
        if (!response.ok && url.includes('/api/')) {
          networkFailuresRef.current = [
            ...networkFailuresRef.current.slice(-MAX_NETWORK_FAILURES + 1),
            {
              timestamp: Date.now(),
              url: url.substring(0, 200),
              method,
              status: response.status,
              statusText: response.statusText
            }
          ];
        }
        
        return response;
      } catch (error) {
        // Network errors (no response at all)
        networkFailuresRef.current = [
          ...networkFailuresRef.current.slice(-MAX_NETWORK_FAILURES + 1),
          {
            timestamp: Date.now(),
            url: url.substring(0, 200),
            method,
            status: 0,
            statusText: 'Network Error'
          }
        ];
        throw error;
      }
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Click tracking with rage click detection
  useEffect(() => {
    const handlePopState = () => {
      trackStep({ path: window.location.pathname, action: 'navigation' });
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const testId = target.closest('[data-testid]')?.getAttribute('data-testid');
      const buttonText = target.closest('button')?.textContent?.substring(0, 50);
      const linkHref = target.closest('a')?.getAttribute('href');
      const elementId = testId || buttonText || linkHref || target.tagName.toLowerCase();

      // Track the click
      if (testId || buttonText || linkHref) {
        trackStep({
          path: window.location.pathname,
          action: 'click',
          element: elementId,
        });
      }
      
      // Rage click detection
      const now = Date.now();
      if (clickTracker.current.element === elementId) {
        clickTracker.current.timestamps.push(now);
        // Filter out old timestamps
        clickTracker.current.timestamps = clickTracker.current.timestamps.filter(
          t => now - t < RAGE_CLICK_WINDOW
        );
        
        if (clickTracker.current.timestamps.length >= RAGE_CLICK_THRESHOLD) {
          rageClicksRef.current = [
            ...rageClicksRef.current.slice(-10),
            {
              timestamp: now,
              element: elementId,
              count: clickTracker.current.timestamps.length,
              path: window.location.pathname
            }
          ];
          // Reset after detecting rage click
          clickTracker.current = { element: '', timestamps: [] };
        }
      } else {
        clickTracker.current = { element: elementId, timestamps: [now] };
      }
    };

    // Track scroll for context
    const handleScroll = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [trackStep]);

  // Detect open dialogs/modals
  const getOpenDialogs = useCallback((): string[] => {
    const dialogs: string[] = [];
    
    // Check for Radix Dialog
    document.querySelectorAll('[data-state="open"]').forEach(el => {
      const role = el.getAttribute('role');
      const testId = el.getAttribute('data-testid');
      if (role === 'dialog' || role === 'alertdialog' || el.matches('[data-radix-dialog-content]')) {
        dialogs.push(testId || role || 'dialog');
      }
    });
    
    // Check for modal overlays
    document.querySelectorAll('[aria-modal="true"]').forEach(el => {
      const testId = el.getAttribute('data-testid');
      const title = el.querySelector('h2, h3, [class*="title"]')?.textContent?.substring(0, 50);
      dialogs.push(testId || title || 'modal');
    });
    
    // Check for common modal patterns
    document.querySelectorAll('.fixed.inset-0, [class*="modal"], [class*="dialog"]').forEach(el => {
      if (el.querySelector('button') && window.getComputedStyle(el).display !== 'none') {
        const testId = el.getAttribute('data-testid');
        if (testId && !dialogs.includes(testId)) {
          dialogs.push(testId);
        }
      }
    });
    
    return Array.from(new Set(dialogs));
  }, []);

  // Capture form state
  const getFormState = useCallback((): Record<string, string> => {
    const formState: Record<string, string> = {};
    
    document.querySelectorAll('input, textarea, select').forEach(el => {
      const input = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const name = input.name || input.id || input.getAttribute('data-testid');
      
      if (name && input.type !== 'password' && input.type !== 'hidden') {
        // Don't capture password fields
        const value = input.value;
        if (value) {
          formState[name] = value.substring(0, 100);
        }
      }
    });
    
    return formState;
  }, []);

  // Get current theme
  const getCurrentTheme = useCallback((): string => {
    if (document.documentElement.classList.contains('dark')) return 'dark';
    if (document.documentElement.classList.contains('light')) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Get current locale
  const getCurrentLocale = useCallback((): string => {
    // Try to get from localStorage (i18next stores it there)
    const stored = localStorage.getItem('i18nextLng');
    if (stored) return stored;
    return navigator.language;
  }, []);

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
        scrollPosition: { x: window.scrollX, y: window.scrollY },
        theme: getCurrentTheme(),
        locale: getCurrentLocale(),
      },
      openDialogs: getOpenDialogs(),
      consoleErrors: consoleErrorsRef.current,
      networkFailures: networkFailuresRef.current,
      rageClicks: rageClicksRef.current,
      formState: getFormState(),
      startedAt: startedAtRef.current,
      lastActivity: lastActivityRef.current,
    };
  }, [sessionId, userId, getOpenDialogs, getFormState, getCurrentTheme, getCurrentLocale]);

  // Capture screenshot of the current page
  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    try {
      // Hide the Mr. Blue panel temporarily for clean screenshot
      const mrBluePanel = document.querySelector('[data-testid="mr-blue-panel"]');
      const mrBlueButton = document.querySelector('[data-testid="button-ask-mr-blue"]');
      
      if (mrBluePanel) (mrBluePanel as HTMLElement).style.visibility = 'hidden';
      if (mrBlueButton) (mrBlueButton as HTMLElement).style.visibility = 'hidden';
      
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 0.5, // Reduce size for faster capture
        ignoreElements: (element) => {
          // Ignore video/canvas elements that might cause issues
          return element.tagName === 'VIDEO' || 
                 element.classList.contains('mr-blue-panel') ||
                 element.getAttribute('data-testid') === 'mr-blue-panel';
        }
      });
      
      // Restore visibility
      if (mrBluePanel) (mrBluePanel as HTMLElement).style.visibility = 'visible';
      if (mrBlueButton) (mrBlueButton as HTMLElement).style.visibility = 'visible';
      
      // Convert to base64 with reduced quality for smaller size
      return canvas.toDataURL('image/jpeg', 0.6);
    } catch (error) {
      console.error('[JourneyTracker] Screenshot capture failed:', error);
      return null;
    }
  }, []);

  return {
    sessionId,
    trackStep,
    getSnapshot,
    captureScreenshot,
  };
}

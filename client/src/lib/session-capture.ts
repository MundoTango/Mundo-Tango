/**
 * Session Capture SDK - MB.MD Pattern 67
 * 
 * Captures user interactions for QA debugging purposes.
 * - Stored in-memory only (not sent to server unless issue reported)
 * - GDPR compliant - requires explicit consent
 * - Captures: clicks, scrolls, navigation, form interactions (not values)
 */

export interface SessionEvent {
  type: 'click' | 'scroll' | 'navigation' | 'form' | 'error' | 'custom';
  timestamp: number;
  data: Record<string, any>;
}

export interface SessionSnapshot {
  sessionId: string;
  userId?: number;
  startTime: number;
  events: SessionEvent[];
  currentPage: string;
  userAgent: string;
}

class SessionCaptureSDK {
  private events: SessionEvent[] = [];
  private sessionId: string;
  private startTime: number;
  private consentGiven: boolean = false;
  private maxEvents: number = 500;
  private listeners: Array<() => void> = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Enable tracking after GDPR consent
   */
  enableTracking(): void {
    if (this.consentGiven) return;
    
    this.consentGiven = true;
    this.attachListeners();
    console.log('[SessionCapture] Tracking enabled with consent');
  }

  /**
   * Disable tracking and clear data
   */
  disableTracking(): void {
    this.consentGiven = false;
    this.detachListeners();
    this.events = [];
    console.log('[SessionCapture] Tracking disabled');
  }

  /**
   * Check if tracking is enabled
   */
  isTrackingEnabled(): boolean {
    return this.consentGiven;
  }

  private attachListeners(): void {
    if (typeof window === 'undefined') return;

    const clickHandler = (e: MouseEvent) => this.captureClick(e);
    const scrollHandler = () => this.captureScroll();
    const popStateHandler = () => this.captureNavigation();
    const errorHandler = (e: ErrorEvent) => this.captureError(e);

    window.addEventListener('click', clickHandler, { passive: true });
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('popstate', popStateHandler);
    window.addEventListener('error', errorHandler);

    this.listeners.push(
      () => window.removeEventListener('click', clickHandler),
      () => window.removeEventListener('scroll', scrollHandler),
      () => window.removeEventListener('popstate', popStateHandler),
      () => window.removeEventListener('error', errorHandler)
    );

    this.captureNavigation();
  }

  private detachListeners(): void {
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
  }

  private addEvent(event: SessionEvent): void {
    if (!this.consentGiven) return;

    this.events.push(event);
    
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  private captureClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target) return;

    const eventData: SessionEvent = {
      type: 'click',
      timestamp: Date.now(),
      data: {
        tagName: target.tagName,
        className: target.className?.substring?.(0, 100) || '',
        id: target.id || undefined,
        text: target.textContent?.substring(0, 50) || undefined,
        testId: target.getAttribute('data-testid') || undefined,
        href: (target as HTMLAnchorElement).href || undefined,
        x: e.clientX,
        y: e.clientY,
      },
    };

    this.addEvent(eventData);
  }

  private captureScroll(): void {
    const eventData: SessionEvent = {
      type: 'scroll',
      timestamp: Date.now(),
      data: {
        scrollY: window.scrollY,
        scrollX: window.scrollX,
        maxScrollY: document.documentElement.scrollHeight - window.innerHeight,
      },
    };

    const lastEvent = this.events[this.events.length - 1];
    if (lastEvent?.type === 'scroll' && Date.now() - lastEvent.timestamp < 200) {
      this.events[this.events.length - 1] = eventData;
    } else {
      this.addEvent(eventData);
    }
  }

  private captureNavigation(): void {
    const eventData: SessionEvent = {
      type: 'navigation',
      timestamp: Date.now(),
      data: {
        url: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        referrer: document.referrer || undefined,
      },
    };

    this.addEvent(eventData);
  }

  private captureError(e: ErrorEvent): void {
    const eventData: SessionEvent = {
      type: 'error',
      timestamp: Date.now(),
      data: {
        message: e.message?.substring(0, 500),
        filename: e.filename?.substring(0, 200),
        lineno: e.lineno,
        colno: e.colno,
      },
    };

    this.addEvent(eventData);
  }

  /**
   * Capture form interaction (field name only, not values)
   */
  captureFormInteraction(fieldName: string, action: 'focus' | 'blur' | 'change'): void {
    if (!this.consentGiven) return;

    const eventData: SessionEvent = {
      type: 'form',
      timestamp: Date.now(),
      data: {
        fieldName,
        action,
        page: window.location.pathname,
      },
    };

    this.addEvent(eventData);
  }

  /**
   * Capture custom event (for Mr. Blue context)
   */
  captureCustomEvent(name: string, data: Record<string, any>): void {
    if (!this.consentGiven) return;

    const eventData: SessionEvent = {
      type: 'custom',
      timestamp: Date.now(),
      data: {
        eventName: name,
        ...data,
      },
    };

    this.addEvent(eventData);
  }

  /**
   * Get current page URL
   */
  getCurrentPage(): string {
    return typeof window !== 'undefined' ? window.location.pathname : '';
  }

  /**
   * Get last N events for Mr. Blue context injection
   */
  getRecentEvents(count: number = 10): SessionEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Get navigation path (unique pages visited)
   */
  getNavigationPath(): string[] {
    return this.events
      .filter(e => e.type === 'navigation')
      .map(e => e.data.pathname)
      .filter((path, index, arr) => arr.indexOf(path) === index)
      .slice(-10);
  }

  /**
   * Create snapshot for issue reporting
   */
  createSnapshot(userId?: number): SessionSnapshot {
    return {
      sessionId: this.sessionId,
      userId,
      startTime: this.startTime,
      events: this.events.slice(-50),
      currentPage: this.getCurrentPage(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };
  }

  /**
   * Get context for Mr. Blue chat
   */
  getMrBlueContext(): {
    currentPage: string;
    recentActions: string[];
    navigationPath: string[];
    lastError?: string;
  } {
    const recentEvents = this.getRecentEvents(10);
    const recentActions = recentEvents.map(e => {
      switch (e.type) {
        case 'click':
          return `Clicked ${e.data.tagName}${e.data.text ? `: "${e.data.text}"` : ''}${e.data.testId ? ` (${e.data.testId})` : ''}`;
        case 'navigation':
          return `Navigated to ${e.data.pathname}`;
        case 'form':
          return `Form ${e.data.action} on ${e.data.fieldName}`;
        case 'error':
          return `Error: ${e.data.message?.substring(0, 100)}`;
        default:
          return `${e.type}: ${JSON.stringify(e.data).substring(0, 100)}`;
      }
    });

    const lastError = this.events
      .filter(e => e.type === 'error')
      .slice(-1)[0]?.data.message;

    return {
      currentPage: this.getCurrentPage(),
      recentActions,
      navigationPath: this.getNavigationPath(),
      lastError,
    };
  }

  /**
   * Reset session (for new user or logout)
   */
  reset(): void {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

export const sessionCapture = new SessionCaptureSDK();

export default sessionCapture;

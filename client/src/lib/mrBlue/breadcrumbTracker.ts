/**
 * Breadcrumb Tracking System
 * Tracks user actions for ML pattern recognition
 * Limits: 30 clicks OR 7 days (industry standard)
 */

export interface Breadcrumb {
  id?: number;
  userId: number;
  sessionId: string;
  timestamp: Date;
  page: string;
  pageTitle?: string;
  referrer?: string;
  action: 'click' | 'view' | 'input' | 'submit' | 'error' | 'navigation';
  target?: string;
  targetId?: string;
  value?: any;
  userJourney?: string;
  userRole?: string;
  userIntent?: string;
  success?: boolean;
  error?: string;
  duration?: number;
  prediction?: string;
  confidence?: number;
  patternId?: string;
}

class BreadcrumbTracker {
  private sessionId: string;
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 30;
  private maxAgeDays = 7;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadFromStorage();
    this.cleanOldBreadcrumbs();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('mr_blue_breadcrumbs');
      if (stored) {
        const data = JSON.parse(stored);
        this.breadcrumbs = data.breadcrumbs || [];
        this.sessionId = data.sessionId || this.sessionId;
      }
    } catch (error) {
      console.error('[BreadcrumbTracker] Failed to load from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('mr_blue_breadcrumbs', JSON.stringify({
        sessionId: this.sessionId,
        breadcrumbs: this.breadcrumbs
      }));
    } catch (error) {
      console.error('[BreadcrumbTracker] Failed to save to storage:', error);
    }
  }

  private cleanOldBreadcrumbs() {
    const maxAge = this.maxAgeDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    this.breadcrumbs = this.breadcrumbs.filter(b => {
      const age = now - new Date(b.timestamp).getTime();
      return age < maxAge;
    });

    // Limit to max 30 breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }

    this.saveToStorage();
  }

  track(breadcrumb: Omit<Breadcrumb, 'sessionId' | 'timestamp'>): void {
    const newBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      sessionId: this.sessionId,
      timestamp: new Date()
    };

    this.breadcrumbs.push(newBreadcrumb);
    this.cleanOldBreadcrumbs();

    // Send to backend for ML processing (async, non-blocking)
    this.sendToBackend(newBreadcrumb);
  }

  private async sendToBackend(breadcrumb: Breadcrumb) {
    try {
      await fetch('/api/breadcrumbs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(breadcrumb)
      });
    } catch (error) {
      // Silent fail - breadcrumbs are best-effort
      console.debug('[BreadcrumbTracker] Failed to send to backend:', error);
    }
  }

  getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  getRecentActions(limit: number = 10): Breadcrumb[] {
    return this.breadcrumbs.slice(-limit);
  }

  getCurrentPage(): string | null {
    if (this.breadcrumbs.length === 0) return null;
    return this.breadcrumbs[this.breadcrumbs.length - 1].page;
  }

  clear() {
    this.breadcrumbs = [];
    this.sessionId = this.generateSessionId();
    this.saveToStorage();
  }
}

export const breadcrumbTracker = new BreadcrumbTracker();

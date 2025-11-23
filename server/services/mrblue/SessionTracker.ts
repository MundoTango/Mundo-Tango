/**
 * SessionTracker - Tracks UI changes since last backend save
 * MB.MD v9.3 - Backend Agent System
 * 
 * Purpose: Monitor all UI changes in a chat session
 * - Track file modifications
 * - Track conversation turns
 * - Track which pages were modified
 * - Detect when "Save" should be enabled
 */

export interface UIChange {
  id: string;
  timestamp: Date;
  conversationId: number;
  messageId: number;
  type: 'file_edit' | 'component_add' | 'style_change' | 'route_add';
  file: string;
  description: string;
  changes: string[];
  page?: string; // Which page was affected
}

export interface SessionState {
  conversationId: number;
  changesSinceLastSave: UIChange[];
  lastSaveTimestamp: Date | null;
  filesModified: Set<string>;
  pagesModified: Set<string>;
  totalChanges: number;
}

export class SessionTracker {
  private static instance: SessionTracker;
  
  // Track sessions by conversation ID
  private sessions: Map<number, SessionState> = new Map();
  
  private constructor() {
    console.log('[SessionTracker] 🚀 Initialized session tracking system');
  }
  
  /**
   * Singleton instance
   */
  static getInstance(): SessionTracker {
    if (!SessionTracker.instance) {
      SessionTracker.instance = new SessionTracker();
    }
    return SessionTracker.instance;
  }
  
  /**
   * Initialize a new session for a conversation
   */
  initializeSession(conversationId: number): void {
    if (!this.sessions.has(conversationId)) {
      this.sessions.set(conversationId, {
        conversationId,
        changesSinceLastSave: [],
        lastSaveTimestamp: null,
        filesModified: new Set(),
        pagesModified: new Set(),
        totalChanges: 0,
      });
      console.log(`[SessionTracker] 📋 Initialized session for conversation ${conversationId}`);
    }
  }
  
  /**
   * Track a UI change in the current session
   */
  trackChange(change: UIChange): void {
    const session = this.sessions.get(change.conversationId);
    if (!session) {
      console.warn(`[SessionTracker] ⚠️ No session found for conversation ${change.conversationId}`);
      this.initializeSession(change.conversationId);
      return this.trackChange(change);
    }
    
    session.changesSinceLastSave.push(change);
    session.filesModified.add(change.file);
    if (change.page) {
      session.pagesModified.add(change.page);
    }
    session.totalChanges++;
    
    console.log(`[SessionTracker] ✅ Tracked change: ${change.description} (${session.totalChanges} total)`);
  }
  
  /**
   * Get all changes since last save for a conversation
   */
  getChangesSinceLastSave(conversationId: number): UIChange[] {
    const session = this.sessions.get(conversationId);
    return session ? session.changesSinceLastSave : [];
  }
  
  /**
   * Get session state
   */
  getSessionState(conversationId: number): SessionState | null {
    return this.sessions.get(conversationId) || null;
  }
  
  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges(conversationId: number): boolean {
    const session = this.sessions.get(conversationId);
    return session ? session.changesSinceLastSave.length > 0 : false;
  }
  
  /**
   * Mark session as saved (clear changes)
   */
  markAsSaved(conversationId: number): void {
    const session = this.sessions.get(conversationId);
    if (session) {
      session.changesSinceLastSave = [];
      session.filesModified.clear();
      session.pagesModified.clear();
      session.lastSaveTimestamp = new Date();
      console.log(`[SessionTracker] 💾 Marked conversation ${conversationId} as saved`);
    }
  }
  
  /**
   * Get files modified since last save
   */
  getModifiedFiles(conversationId: number): string[] {
    const session = this.sessions.get(conversationId);
    return session ? Array.from(session.filesModified) : [];
  }
  
  /**
   * Get pages modified since last save
   */
  getModifiedPages(conversationId: number): string[] {
    const session = this.sessions.get(conversationId);
    return session ? Array.from(session.pagesModified) : [];
  }
  
  /**
   * Get summary of changes for Save button tooltip
   */
  getChangeSummary(conversationId: number): string {
    const session = this.sessions.get(conversationId);
    if (!session || session.changesSinceLastSave.length === 0) {
      return 'No changes to save';
    }
    
    const fileCount = session.filesModified.size;
    const pageCount = session.pagesModified.size;
    const changeCount = session.changesSinceLastSave.length;
    
    return `${changeCount} change${changeCount > 1 ? 's' : ''} across ${fileCount} file${fileCount > 1 ? 's' : ''} (${pageCount} page${pageCount > 1 ? 's' : ''})`;
  }
}

// Singleton export
export const sessionTracker = SessionTracker.getInstance();

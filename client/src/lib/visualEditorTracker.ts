/**
 * Visual Editor Tracker
 * Tracks all visual changes for AI code generation
 */

export interface VisualEdit {
  id: string;
  timestamp: Date;
  elementId: string;
  elementTestId: string;
  changeType: 'style' | 'position' | 'size' | 'text';
  changes: Record<string, { before: any; after: any }>;
  description: string;
}

class VisualEditorTrackerClass {
  private edits: VisualEdit[] = [];
  private maxHistory = 50;
  private currentSessionId: string;

  constructor() {
    this.currentSessionId = `edit-${Date.now()}`;
    this.loadFromStorage();
  }

  track(edit: Omit<VisualEdit, 'id' | 'timestamp'>): void {
    const newEdit: VisualEdit = {
      ...edit,
      id: `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.edits.push(newEdit);
    
    // Limit history
    if (this.edits.length > this.maxHistory) {
      this.edits = this.edits.slice(-this.maxHistory);
    }

    this.saveToStorage();
    this.notifyListeners(newEdit);
  }

  getRecentEdits(limit: number = 10): VisualEdit[] {
    return this.edits.slice(-limit);
  }

  getAllEdits(): VisualEdit[] {
    return [...this.edits];
  }

  undo(): VisualEdit | null {
    const lastEdit = this.edits.pop();
    if (lastEdit) {
      this.saveToStorage();
      this.notifyListeners(lastEdit, 'undo');
    }
    return lastEdit || null;
  }

  clear(): void {
    this.edits = [];
    this.saveToStorage();
  }

  serialize(): string {
    return JSON.stringify({
      sessionId: this.currentSessionId,
      edits: this.edits,
      totalChanges: this.edits.length
    });
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('visual_editor_session');
      if (stored) {
        const data = JSON.parse(stored);
        this.edits = data.edits || [];
        this.currentSessionId = data.sessionId || this.currentSessionId;
      }
    } catch (error) {
      console.error('[VisualEditorTracker] Load error:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('visual_editor_session', this.serialize());
    } catch (error) {
      console.error('[VisualEditorTracker] Save error:', error);
    }
  }

  private listeners: Array<(edit: VisualEdit, action?: 'add' | 'undo') => void> = [];

  addListener(callback: (edit: VisualEdit, action?: 'add' | 'undo') => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (edit: VisualEdit, action?: 'add' | 'undo') => void): void {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  private notifyListeners(edit: VisualEdit, action: 'add' | 'undo' = 'add'): void {
    this.listeners.forEach(listener => listener(edit, action));
  }
}

export const visualEditorTracker = new VisualEditorTrackerClass();

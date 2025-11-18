/**
 * Visual Editor Tracker
 * Tracks all visual changes for AI code generation
 * Syncs with iframeInjector undo/redo system
 */

import type { HistoryEntry } from './iframeInjector';

export interface VisualEdit {
  id: string;
  timestamp: Date;
  elementId: string;
  elementTestId: string;
  changeType: 'style' | 'position' | 'size' | 'text' | 'class' | 'html';
  changes: Record<string, { before: any; after: any }>;
  description: string;
  screenshot?: string; // Synced from HistoryEntry
}

class VisualEditorTrackerClass {
  private edits: VisualEdit[] = [];
  private maxHistory = 100; // Increased to match iframeInjector
  private currentSessionId: string;
  private undoStack: VisualEdit[] = [];
  private redoStack: VisualEdit[] = [];

  constructor() {
    this.currentSessionId = `edit-${Date.now()}`;
    this.loadFromStorage();
  }

  /**
   * Track a visual edit
   */
  track(edit: Omit<VisualEdit, 'id' | 'timestamp'>): void {
    const newEdit: VisualEdit = {
      ...edit,
      id: `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.edits.push(newEdit);
    this.undoStack.push(newEdit);
    this.redoStack = []; // Clear redo stack
    
    // Limit history
    if (this.edits.length > this.maxHistory) {
      this.edits = this.edits.slice(-this.maxHistory);
    }
    
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack = this.undoStack.slice(-this.maxHistory);
    }

    this.saveToStorage();
    this.notifyListeners(newEdit, 'add');
  }

  /**
   * Sync with iframeInjector HistoryEntry
   */
  syncFromHistoryEntry(entry: HistoryEntry): void {
    const visualEdit: VisualEdit = {
      id: entry.id,
      timestamp: new Date(entry.timestamp),
      elementId: entry.targetElement.id || entry.targetElement.selector,
      elementTestId: entry.targetElement.testId || '',
      changeType: entry.type === 'class' ? 'style' : entry.type as any,
      changes: entry.property
        ? { [entry.property]: { before: entry.oldValue, after: entry.newValue } }
        : {},
      description: entry.description,
      screenshot: entry.screenshot,
    };
    
    // Add without duplicate tracking
    this.edits.push(visualEdit);
    
    if (this.edits.length > this.maxHistory) {
      this.edits = this.edits.slice(-this.maxHistory);
    }
    
    this.saveToStorage();
  }

  getRecentEdits(limit: number = 10): VisualEdit[] {
    return this.edits.slice(-limit);
  }

  getAllEdits(): VisualEdit[] {
    return [...this.edits];
  }

  /**
   * Undo last edit
   */
  undo(): VisualEdit | null {
    const lastEdit = this.undoStack.pop();
    if (lastEdit) {
      this.redoStack.push(lastEdit);
      this.saveToStorage();
      this.notifyListeners(lastEdit, 'undo');
    }
    return lastEdit || null;
  }

  /**
   * Redo last undone edit
   */
  redo(): VisualEdit | null {
    const redoEdit = this.redoStack.pop();
    if (redoEdit) {
      this.undoStack.push(redoEdit);
      this.saveToStorage();
      this.notifyListeners(redoEdit, 'redo');
    }
    return redoEdit || null;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.edits = [];
    this.undoStack = [];
    this.redoStack = [];
    this.saveToStorage();
  }

  serialize(): string {
    return JSON.stringify({
      sessionId: this.currentSessionId,
      edits: this.edits,
      totalChanges: this.edits.length,
      undoStack: this.undoStack,
      redoStack: this.redoStack,
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

  private listeners: Array<(edit: VisualEdit, action?: 'add' | 'undo' | 'redo') => void> = [];

  addListener(callback: (edit: VisualEdit, action?: 'add' | 'undo' | 'redo') => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (edit: VisualEdit, action?: 'add' | 'undo' | 'redo') => void): void {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  private notifyListeners(edit: VisualEdit, action: 'add' | 'undo' | 'redo' = 'add'): void {
    this.listeners.forEach(listener => listener(edit, action));
  }
}

export const visualEditorTracker = new VisualEditorTrackerClass();

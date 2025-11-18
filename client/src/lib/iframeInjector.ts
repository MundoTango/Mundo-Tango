/**
 * Iframe Script Injector
 * Injects component selection logic into iframe via postMessage
 * Solves cross-origin security issues
 */

import { ScreenshotCapture, captureIframeScreenshot, saveScreenshot } from './screenshotCapture';
import { visualEditorTracker } from './visualEditorTracker';

export interface StyleChangeRequest {
  type: 'style' | 'class';
  property: string;
  value: string;
}

/**
 * Comprehensive history entry for undo/redo system
 */
export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: 'style' | 'html' | 'insert' | 'delete' | 'class';
  targetElement: {
    selector: string;
    tagName: string;
    testId?: string;
    id?: string;
  };
  property?: string;  // For style/class changes
  oldValue: any;
  newValue: any;
  screenshot?: string; // Base64 thumbnail
  description: string; // Human-readable description
}

/**
 * Backward compatibility alias
 */
export type StyleChange = HistoryEntry;

/**
 * Navigation history entry for tracking iframe URL changes
 */
export interface NavigationEntry {
  url: string;
  timestamp: number;
  title?: string;
}

export interface IframeCallbacks {
  onElementSelected?: (element: HTMLElement) => void;
  onChangeApplied?: (change: HistoryEntry) => void;
  onHistoryChanged?: (undoStack: HistoryEntry[], redoStack: HistoryEntry[], currentIndex: number) => void;
  onUrlChanged?: (url: string, canGoBack: boolean, canGoForward: boolean) => void;
  onNavigationStart?: () => void;
  onNavigationEnd?: () => void;
}

export class IframeInjector {
  private iframe: HTMLIFrameElement | null = null;
  private selectedElement: HTMLElement | null = null;
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private maxHistory: number = 50;
  private onElementSelected?: (element: HTMLElement) => void;
  private onChangeApplied?: (change: HistoryEntry) => void;
  private onHistoryChanged?: (undoStack: HistoryEntry[], redoStack: HistoryEntry[], currentIndex: number) => void;
  private onUrlChanged?: (url: string, canGoBack: boolean, canGoForward: boolean) => void;
  private onNavigationStart?: () => void;
  private onNavigationEnd?: () => void;
  private messageListener?: (event: MessageEvent) => void;
  private screenshotCapture = new ScreenshotCapture();
  private keyboardListener?: (event: KeyboardEvent) => void;
  
  // URL Navigation History
  private navigationHistory: NavigationEntry[] = [];
  private navigationIndex: number = -1;
  private currentUrl: string = '';
  private isNavigating: boolean = false;
  
  initialize(iframe: HTMLIFrameElement, callbacks: IframeCallbacks) {
    this.iframe = iframe;
    this.onElementSelected = callbacks.onElementSelected;
    this.onChangeApplied = callbacks.onChangeApplied;
    this.onHistoryChanged = callbacks.onHistoryChanged;
    this.onUrlChanged = callbacks.onUrlChanged;
    this.onNavigationStart = callbacks.onNavigationStart;
    this.onNavigationEnd = callbacks.onNavigationEnd;
    
    // Initialize current URL
    if (iframe.src) {
      this.currentUrl = this.getPathFromUrl(iframe.src);
      this.addToNavigationHistory(this.currentUrl);
    }
    
    // Set up message listener for iframe events
    this.messageListener = (event: MessageEvent) => {
      if (event.data.type === 'IFRAME_ELEMENT_SELECTED') {
        const component = event.data.component;
        
        // Get the actual element from iframe
        const iframeDoc = iframe.contentDocument;
        if (iframeDoc) {
          const element = iframeDoc.getElementById(component.id) || 
                         iframeDoc.querySelector(`[data-testid="${component.testId}"]`);
          
          if (element) {
            this.selectedElement = element as HTMLElement;
            this.onElementSelected?.(element as HTMLElement);
          }
        }
      } else if (event.data.type === 'IFRAME_CHANGE_APPLIED' && this.onChangeApplied) {
        this.onChangeApplied(event.data.change);
      } else if (event.data.type === 'IFRAME_NAVIGATE') {
        // Handle navigation events from inside iframe (link clicks, form submits)
        const newUrl = event.data.url;
        if (newUrl && this.validateUrl(newUrl)) {
          this.handleNavigationEvent(newUrl);
        }
      }
    };
    
    // Set up keyboard shortcuts
    this.keyboardListener = (event: KeyboardEvent) => {
      // Ctrl+Z / Cmd+Z - Undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        this.undo();
      }
      // Ctrl+Y / Cmd+Shift+Z - Redo
      else if (
        ((event.ctrlKey || event.metaKey) && event.key === 'y') ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z')
      ) {
        event.preventDefault();
        this.redo();
      }
    };
    
    window.addEventListener('message', this.messageListener);
    window.addEventListener('keydown', this.keyboardListener);
    console.log('[IframeInjector] Initialized with callbacks and keyboard shortcuts');
  }
  
  setIframe(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
  }
  
  setSelectedElement(element: HTMLElement | null) {
    this.selectedElement = element;
  }
  
  selectElement(element: HTMLElement) {
    // Remove previous selection outline
    if (this.selectedElement) {
      this.selectedElement.style.outline = '';
    }
    
    this.selectedElement = element;
    
    // Notify callback
    this.onElementSelected?.(element);
    
    // Notify parent window
    this.notifyParent('ELEMENT_SELECTED', {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      textContent: element.textContent?.slice(0, 50),
    });
  }
  
  getSelectedElement(): HTMLElement | null {
    return this.selectedElement;
  }
  
  destroy() {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
    
    if (this.keyboardListener) {
      window.removeEventListener('keydown', this.keyboardListener);
    }
    
    const iframeDoc = this.iframe?.contentDocument;
    if (iframeDoc) {
      // Clean up any inline styles we added
      if (this.selectedElement) {
        this.selectedElement.style.outline = '';
      }
    }
    
    this.iframe = null;
    this.selectedElement = null;
    this.onElementSelected = undefined;
    this.onChangeApplied = undefined;
    this.onHistoryChanged = undefined;
    this.messageListener = undefined;
    this.keyboardListener = undefined;
    
    console.log('[IframeInjector] Destroyed and cleaned up');
  }
  
  async applyChange(change: StyleChangeRequest): Promise<void> {
    if (!this.iframe || !this.selectedElement) {
      console.warn('[IframeInjector] No iframe or selected element');
      return;
    }
    
    const iframeDoc = this.iframe.contentDocument;
    if (!iframeDoc) return;
    
    // Get the equivalent element in iframe
    const selector = this.getElementSelector(this.selectedElement);
    const targetElement = iframeDoc.querySelector(selector) as HTMLElement;
    
    if (!targetElement) {
      console.warn('[IframeInjector] Target element not found');
      return;
    }
    
    // Store previous value for undo
    let previousValue: any;
    let description: string;
    
    if (change.type === 'style') {
      previousValue = targetElement.style[change.property as any] || '';
      description = `Changed ${change.property} from "${previousValue}" to "${change.value}"`;
    } else {
      previousValue = targetElement.className;
      description = `Changed classes from "${previousValue}" to "${change.value}"`;
    }
    
    // Capture screenshot BEFORE change
    let screenshot = '';
    if (this.iframe) {
      try {
        screenshot = await captureIframeScreenshot(this.iframe);
        // Generate thumbnail (resize to 200x150)
        screenshot = await this.generateThumbnail(screenshot, 200, 150);
      } catch (error) {
        console.warn('[IframeInjector] Screenshot capture failed:', error);
      }
    }
    
    // Apply the change
    if (change.type === 'style') {
      targetElement.style[change.property as any] = change.value;
    } else if (change.type === 'class') {
      if (change.value.startsWith('+')) {
        targetElement.classList.add(change.value.slice(1));
      } else if (change.value.startsWith('-')) {
        targetElement.classList.remove(change.value.slice(1));
      } else {
        targetElement.className = change.value;
      }
    }
    
    // Create history entry
    const historyEntry: HistoryEntry = {
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: change.type as 'style' | 'class',
      targetElement: {
        selector,
        tagName: targetElement.tagName.toLowerCase(),
        testId: targetElement.getAttribute('data-testid') || undefined,
        id: targetElement.id || undefined,
      },
      property: change.property,
      oldValue: previousValue,
      newValue: change.value,
      screenshot,
      description,
    };
    
    // Add to history
    await this.addToHistory(historyEntry);
    
    // Sync with visualEditorTracker
    visualEditorTracker.track({
      elementId: historyEntry.targetElement.id || selector,
      elementTestId: historyEntry.targetElement.testId || '',
      changeType: change.type as any,
      changes: { [change.property]: { before: previousValue, after: change.value } },
      description: historyEntry.description,
    });
    
    // Send update to parent
    this.notifyParent('CHANGE_APPLIED', historyEntry);
    this.onChangeApplied?.(historyEntry);
  }
  
  async undo(): Promise<boolean> {
    if (this.undoStack.length === 0) {
      console.log('[IframeInjector] Nothing to undo');
      return false;
    }
    
    const entry = this.undoStack.pop()!;
    
    const iframeDoc = this.iframe?.contentDocument;
    if (!iframeDoc) return false;
    
    const targetElement = iframeDoc.querySelector(entry.targetElement.selector) as HTMLElement;
    if (!targetElement) {
      console.warn('[IframeInjector] Target element not found for undo');
      return false;
    }
    
    // Apply the old value
    if (entry.type === 'style' && entry.property) {
      targetElement.style[entry.property as any] = entry.oldValue;
    } else if (entry.type === 'class') {
      targetElement.className = entry.oldValue;
    } else if (entry.type === 'html') {
      targetElement.innerHTML = entry.oldValue;
    } else if (entry.type === 'delete') {
      // Restore deleted element (would need parent reference)
      console.warn('[IframeInjector] Cannot undo delete operation yet');
    }
    
    // Move to redo stack
    this.redoStack.push(entry);
    
    // Notify callbacks
    this.notifyParent('CHANGE_UNDONE', entry);
    this.notifyHistoryChanged();
    
    console.log('[IframeInjector] Undo successful:', entry.description);
    return true;
  }
  
  async redo(): Promise<boolean> {
    if (this.redoStack.length === 0) {
      console.log('[IframeInjector] Nothing to redo');
      return false;
    }
    
    const entry = this.redoStack.pop()!;
    
    const iframeDoc = this.iframe?.contentDocument;
    if (!iframeDoc) return false;
    
    const targetElement = iframeDoc.querySelector(entry.targetElement.selector) as HTMLElement;
    if (!targetElement) {
      console.warn('[IframeInjector] Target element not found for redo');
      return false;
    }
    
    // Apply the new value
    if (entry.type === 'style' && entry.property) {
      targetElement.style[entry.property as any] = entry.newValue;
    } else if (entry.type === 'class') {
      targetElement.className = entry.newValue;
    } else if (entry.type === 'html') {
      targetElement.innerHTML = entry.newValue;
    } else if (entry.type === 'insert') {
      // Re-insert element (would need parent reference)
      console.warn('[IframeInjector] Cannot redo insert operation yet');
    }
    
    // Move back to undo stack
    this.undoStack.push(entry);
    
    // Notify callbacks
    this.notifyParent('CHANGE_REDONE', entry);
    this.notifyHistoryChanged();
    
    console.log('[IframeInjector] Redo successful:', entry.description);
    return true;
  }
  
  /**
   * Undo multiple changes at once (batch undo)
   */
  async batchUndo(count: number): Promise<number> {
    let undone = 0;
    for (let i = 0; i < count && this.undoStack.length > 0; i++) {
      const success = await this.undo();
      if (success) undone++;
    }
    console.log(`[IframeInjector] Batch undo: ${undone}/${count} changes undone`);
    return undone;
  }
  
  /**
   * Jump to a specific point in history
   */
  async jumpToChange(index: number): Promise<void> {
    const totalChanges = this.undoStack.length + this.redoStack.length;
    
    if (index < 0 || index >= totalChanges) {
      console.warn('[IframeInjector] Invalid change index');
      return;
    }
    
    const currentIndex = this.undoStack.length - 1;
    
    if (index < currentIndex) {
      // Undo to reach the target
      const stepsBack = currentIndex - index;
      await this.batchUndo(stepsBack);
    } else if (index > currentIndex) {
      // Redo to reach the target
      const stepsForward = index - currentIndex;
      for (let i = 0; i < stepsForward; i++) {
        await this.redo();
      }
    }
  }
  
  /**
   * Get full history (undo stack + redo stack)
   */
  getHistory(): HistoryEntry[] {
    return [...this.undoStack, ...this.redoStack.reverse()];
  }
  
  /**
   * Get undo stack
   */
  getUndoStack(): HistoryEntry[] {
    return [...this.undoStack];
  }
  
  /**
   * Get redo stack
   */
  getRedoStack(): HistoryEntry[] {
    return [...this.redoStack];
  }
  
  /**
   * Get current position in history
   */
  getCurrentIndex(): number {
    return this.undoStack.length - 1;
  }
  
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }
  
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
  
  /**
   * Search history by filters
   */
  searchHistory(filters: {
    type?: HistoryEntry['type'];
    element?: string;
    property?: string;
    searchText?: string;
  }): HistoryEntry[] {
    const allHistory = this.getHistory();
    
    return allHistory.filter(entry => {
      if (filters.type && entry.type !== filters.type) return false;
      if (filters.element && !entry.targetElement.selector.includes(filters.element)) return false;
      if (filters.property && entry.property !== filters.property) return false;
      if (filters.searchText && !entry.description.toLowerCase().includes(filters.searchText.toLowerCase())) return false;
      return true;
    });
  }
  
  /**
   * Export history as JSON
   */
  exportHistory(): string {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalChanges: this.undoStack.length + this.redoStack.length,
      currentIndex: this.getCurrentIndex(),
      undoStack: this.undoStack,
      redoStack: this.redoStack,
    }, null, 2);
  }
  
  /**
   * Clear redo stack (called when new action is taken)
   */
  private clearRedoStack(): void {
    this.redoStack = [];
  }
  
  /**
   * Add entry to history with automatic management
   */
  private async addToHistory(entry: HistoryEntry): Promise<void> {
    // Clear redo stack when new action is taken
    this.clearRedoStack();
    
    // Add to undo stack
    this.undoStack.push(entry);
    
    // Limit history size
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift(); // Remove oldest
    }
    
    // Save screenshot to IndexedDB if present
    if (entry.screenshot) {
      try {
        await saveScreenshot(entry.id, entry.screenshot, {
          id: entry.id,
          timestamp: entry.timestamp,
          prompt: entry.description,
          type: 'after',
          changeId: entry.id,
        });
      } catch (error) {
        console.warn('[IframeInjector] Failed to save screenshot:', error);
      }
    }
    
    // Notify history changed
    this.notifyHistoryChanged();
    
    console.log('[IframeInjector] Added to history:', entry.description);
  }
  
  /**
   * Generate thumbnail from screenshot
   */
  private async generateThumbnail(dataUrl: string, width: number, height: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl); // Return original if canvas fails
          return;
        }
        
        // Calculate aspect ratio
        const aspectRatio = img.width / img.height;
        const targetRatio = width / height;
        
        let drawWidth = width;
        let drawHeight = height;
        let offsetX = 0;
        let offsetY = 0;
        
        if (aspectRatio > targetRatio) {
          // Image is wider - fit height
          drawWidth = height * aspectRatio;
          offsetX = -(drawWidth - width) / 2;
        } else {
          // Image is taller - fit width
          drawHeight = width / aspectRatio;
          offsetY = -(drawHeight - height) / 2;
        }
        
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        resolve(canvas.toDataURL('image/png', 0.7));
      };
      img.onerror = () => resolve(dataUrl); // Return original on error
      img.src = dataUrl;
    });
  }
  
  /**
   * Notify callbacks that history has changed
   */
  private notifyHistoryChanged(): void {
    this.onHistoryChanged?.(
      this.undoStack,
      this.redoStack,
      this.getCurrentIndex()
    );
  }
  
  private getElementSelector(element: HTMLElement): string {
    // Generate unique CSS selector for element
    if (element.id) {
      return `#${element.id}`;
    }
    
    const classes = Array.from(element.classList).join('.');
    const tag = element.tagName.toLowerCase();
    
    if (classes) {
      return `${tag}.${classes}`;
    }
    
    // Use nth-child if no id or classes
    const parent = element.parentElement;
    if (parent) {
      const children = Array.from(parent.children);
      const index = children.indexOf(element);
      return `${this.getElementSelector(parent)} > ${tag}:nth-child(${index + 1})`;
    }
    
    return tag;
  }
  
  private async captureScreenshot(): Promise<void> {
    // Use html2canvas to capture screenshot
    const iframeDoc = this.iframe?.contentDocument;
    if (!iframeDoc) return;
    
    // Send message to capture screenshot
    this.notifyParent('CAPTURE_SCREENSHOT', null);
  }
  
  private notifyParent(type: string, data: any) {
    window.parent.postMessage({
      type: `IFRAME_${type}`,
      data,
    }, '*');
  }
  
  /**
   * ============================================================
   * URL NAVIGATION & HISTORY MANAGEMENT
   * ============================================================
   */
  
  /**
   * Validate URL for security (prevent javascript: protocol injection)
   */
  private validateUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      console.warn('[IframeInjector] Invalid URL type');
      return false;
    }
    
    const trimmedUrl = url.trim().toLowerCase();
    
    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    for (const protocol of dangerousProtocols) {
      if (trimmedUrl.startsWith(protocol)) {
        console.error('[IframeInjector] Blocked dangerous protocol:', protocol);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Extract path from full URL
   */
  private getPathFromUrl(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname + urlObj.search + urlObj.hash;
    } catch (e) {
      // If URL parsing fails, assume it's already a path
      return url;
    }
  }
  
  /**
   * Add URL to navigation history
   */
  private addToNavigationHistory(url: string): void {
    // Remove any forward history when navigating to new URL
    if (this.navigationIndex < this.navigationHistory.length - 1) {
      this.navigationHistory = this.navigationHistory.slice(0, this.navigationIndex + 1);
    }
    
    // Add new entry
    const entry: NavigationEntry = {
      url,
      timestamp: Date.now(),
      title: this.iframe?.contentDocument?.title
    };
    
    this.navigationHistory.push(entry);
    this.navigationIndex = this.navigationHistory.length - 1;
    this.currentUrl = url;
    
    // Limit history size
    if (this.navigationHistory.length > 100) {
      this.navigationHistory.shift();
      this.navigationIndex--;
    }
    
    console.log('[IframeInjector] Navigation history updated:', {
      url,
      index: this.navigationIndex,
      total: this.navigationHistory.length
    });
    
    this.notifyUrlChanged();
  }
  
  /**
   * Handle navigation event from iframe (link clicks, etc)
   */
  private handleNavigationEvent(url: string): void {
    const path = this.getPathFromUrl(url);
    
    // Don't add duplicate if same as current
    if (path === this.currentUrl) {
      return;
    }
    
    this.addToNavigationHistory(path);
  }
  
  /**
   * Notify URL changed callback
   */
  private notifyUrlChanged(): void {
    this.onUrlChanged?.(
      this.currentUrl,
      this.canGoBack(),
      this.canGoForward()
    );
  }
  
  /**
   * Navigate to a URL (from address bar input)
   */
  navigateTo(url: string): void {
    if (!this.iframe) {
      console.warn('[IframeInjector] No iframe available for navigation');
      return;
    }
    
    // Validate URL
    if (!this.validateUrl(url)) {
      console.error('[IframeInjector] URL validation failed:', url);
      this.notifyParent('NAVIGATION_BLOCKED', { url, reason: 'Invalid URL' });
      return;
    }
    
    // Normalize to path if needed
    const path = url.startsWith('/') ? url : `/${url}`;
    
    this.isNavigating = true;
    this.onNavigationStart?.();
    
    console.log('[IframeInjector] Navigating to:', path);
    
    // Navigate iframe
    this.iframe.src = path;
    
    // Add to history (will be updated on load)
    this.addToNavigationHistory(path);
    
    // Send message to iframe
    this.iframe.contentWindow?.postMessage({
      type: 'NAVIGATE_TO',
      url: path
    }, '*');
  }
  
  /**
   * Go back in navigation history
   */
  goBack(): boolean {
    if (!this.canGoBack()) {
      console.log('[IframeInjector] Cannot go back - at beginning of history');
      return false;
    }
    
    this.navigationIndex--;
    const entry = this.navigationHistory[this.navigationIndex];
    
    this.isNavigating = true;
    this.onNavigationStart?.();
    
    console.log('[IframeInjector] Going back to:', entry.url);
    
    if (this.iframe) {
      this.iframe.src = entry.url;
    }
    
    this.currentUrl = entry.url;
    this.notifyUrlChanged();
    
    return true;
  }
  
  /**
   * Go forward in navigation history
   */
  goForward(): boolean {
    if (!this.canGoForward()) {
      console.log('[IframeInjector] Cannot go forward - at end of history');
      return false;
    }
    
    this.navigationIndex++;
    const entry = this.navigationHistory[this.navigationIndex];
    
    this.isNavigating = true;
    this.onNavigationStart?.();
    
    console.log('[IframeInjector] Going forward to:', entry.url);
    
    if (this.iframe) {
      this.iframe.src = entry.url;
    }
    
    this.currentUrl = entry.url;
    this.notifyUrlChanged();
    
    return true;
  }
  
  /**
   * Refresh current page
   */
  refresh(): void {
    if (!this.iframe) {
      console.warn('[IframeInjector] No iframe available for refresh');
      return;
    }
    
    this.isNavigating = true;
    this.onNavigationStart?.();
    
    console.log('[IframeInjector] Refreshing:', this.currentUrl);
    
    // Reload iframe
    this.iframe.src = this.iframe.src;
  }
  
  /**
   * Navigate to home page
   */
  goHome(): void {
    this.navigateTo('/');
  }
  
  /**
   * Check if can go back
   */
  canGoBack(): boolean {
    return this.navigationIndex > 0;
  }
  
  /**
   * Check if can go forward
   */
  canGoForward(): boolean {
    return this.navigationIndex < this.navigationHistory.length - 1;
  }
  
  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.currentUrl;
  }
  
  /**
   * Get navigation history
   */
  getNavigationHistory(): NavigationEntry[] {
    return [...this.navigationHistory];
  }
  
  /**
   * Handle iframe load event (navigation complete)
   */
  handleIframeLoad(): void {
    if (!this.iframe) return;
    
    this.isNavigating = false;
    this.onNavigationEnd?.();
    
    // Update current URL from iframe
    try {
      const iframePath = this.getPathFromUrl(this.iframe.contentWindow?.location.href || '');
      if (iframePath && iframePath !== this.currentUrl) {
        // Update without adding to history if it's from back/forward
        if (!this.isNavigating) {
          this.currentUrl = iframePath;
          this.notifyUrlChanged();
        }
      }
    } catch (e) {
      // Cross-origin restriction - can't access iframe location
      console.log('[IframeInjector] Cannot access iframe location (cross-origin)');
    }
    
    console.log('[IframeInjector] Navigation complete:', this.currentUrl);
  }
  
  /**
   * Inject a new component into the iframe at the specified position
   */
  async injectComponent(componentType: string, html: string, position: { x: number; y: number }): Promise<void> {
    if (!this.iframe) {
      console.warn('[IframeInjector] No iframe available');
      return;
    }
    
    const iframeDoc = this.iframe.contentDocument;
    if (!iframeDoc) {
      console.warn('[IframeInjector] Cannot access iframe document');
      return;
    }
    
    // Generate unique test ID for the component
    const testId = `component-${componentType}-${Date.now()}`;
    
    // Send INSERT_COMPONENT message to iframe
    this.iframe.contentWindow?.postMessage({
      type: 'INSERT_COMPONENT',
      payload: {
        componentType,
        html,
        position,
        testId
      }
    }, '*');
    
    console.log('[IframeInjector] Component injection requested:', componentType, testId);
    
    // Track the insertion
    this.notifyParent('COMPONENT_INSERTED', {
      componentType,
      testId,
      position,
      timestamp: Date.now()
    });
  }
}

export const IFRAME_SELECTION_SCRIPT = `
(function() {
  let hoveredElement = null;
  let selectedElement = null;
  let undoStack = [];
  
  // Add highlight animation for new components
  const style = document.createElement('style');
  style.textContent = \`
    @keyframes highlight-new {
      0% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
        transform: scale(0.95);
      }
      50% {
        box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
        transform: scale(1.02);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        transform: scale(1);
      }
    }
    
    .drop-zone-highlight {
      outline: 2px dashed #3b82f6 !important;
      outline-offset: 4px;
      background-color: rgba(59, 130, 246, 0.05) !important;
    }
  \`;
  document.head.appendChild(style);

  // Hide floating Mr. Blue buttons inside iframe
  function hideMrBlueButtons() {
    const selectors = [
      '[data-testid="global-mr-blue"]',
      '[data-testid="button-ask-mr-blue"]',
      '[data-testid="button-mr-blue"]',
      '[data-testid="button-mr-blue-open"]'
    ];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el) {
          el.style.display = 'none';
        }
      });
    });
  }

  // Hide on load and periodically
  hideMrBlueButtons();
  setInterval(hideMrBlueButtons, 500);

  // ============================================================================
  // INSTANT DOM UPDATE COMMANDS
  // ============================================================================
  function applyChange(change) {
    if (!selectedElement) {
      console.warn('[VisualEditor] No element selected');
      return;
    }

    // Save state for undo
    const previousState = {
      element: selectedElement,
      style: selectedElement.style.cssText,
      className: selectedElement.className,
      innerHTML: selectedElement.innerHTML
    };
    undoStack.push(previousState);

    // Apply change
    switch (change.type) {
      case 'style':
        if (change.property && change.value) {
          selectedElement.style[change.property] = change.value;
          console.log('[VisualEditor] Applied style:', change.property, '=', change.value);
        }
        break;

      case 'position':
        const rect = selectedElement.getBoundingClientRect();
        selectedElement.style.transform = \`translate(\${change.x || 0}px, \${change.y || 0}px)\`;
        console.log('[VisualEditor] Applied position:', change.x, change.y);
        break;

      case 'text':
        selectedElement.textContent = change.value;
        console.log('[VisualEditor] Applied text:', change.value);
        break;

      case 'html':
        // Update HTML content (already sanitized on parent side)
        selectedElement.innerHTML = change.value;
        console.log('[VisualEditor] Applied HTML content update');
        break;

      case 'class':
        if (change.add) {
          selectedElement.classList.add(change.add);
        }
        if (change.remove) {
          selectedElement.classList.remove(change.remove);
        }
        console.log('[VisualEditor] Applied class change');
        break;

      case 'delete':
        selectedElement.remove();
        selectedElement = null;
        console.log('[VisualEditor] Deleted element');
        break;

      default:
        console.warn('[VisualEditor] Unknown change type:', change.type);
    }

    // Notify parent of success
    window.parent.postMessage({
      type: 'IFRAME_CHANGE_APPLIED',
      change
    }, '*');
  }

  // Undo last change
  function undoLastChange() {
    if (undoStack.length === 0) {
      console.log('[VisualEditor] Nothing to undo');
      return;
    }

    const previousState = undoStack.pop();
    if (previousState.element && document.body.contains(previousState.element)) {
      previousState.element.style.cssText = previousState.style;
      previousState.element.className = previousState.className;
      console.log('[VisualEditor] Undo successful');
    }
  }

  // ============================================================================
  // COMPONENT INSERTION
  // ============================================================================
  function insertComponent(payload) {
    const { componentType, html, position, testId } = payload;
    
    console.log('[VisualEditor] Inserting component:', componentType, 'at', position);
    
    // Find the target element at the drop position
    const targetElement = document.elementFromPoint(position.x, position.y);
    
    if (!targetElement) {
      console.warn('[VisualEditor] No target element found at position');
      return;
    }
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    const newElement = tempDiv.firstElementChild;
    
    if (!newElement) {
      console.warn('[VisualEditor] Failed to parse component HTML');
      return;
    }
    
    // Determine insertion strategy based on target element
    const insertPosition = determineInsertPosition(targetElement, position);
    
    switch (insertPosition) {
      case 'inside':
        // Insert as last child
        targetElement.appendChild(newElement);
        break;
      case 'before':
        // Insert before target
        targetElement.parentNode.insertBefore(newElement, targetElement);
        break;
      case 'after':
        // Insert after target
        if (targetElement.nextSibling) {
          targetElement.parentNode.insertBefore(newElement, targetElement.nextSibling);
        } else {
          targetElement.parentNode.appendChild(newElement);
        }
        break;
      default:
        // Default: append to body
        document.body.appendChild(newElement);
    }
    
    // Add a subtle highlight animation
    newElement.style.animation = 'highlight-new 0.6s ease-out';
    
    // Notify parent of successful insertion
    window.parent.postMessage({
      type: 'IFRAME_COMPONENT_INSERTED',
      data: {
        componentType,
        testId,
        success: true,
        elementId: newElement.id,
        timestamp: Date.now()
      }
    }, '*');
    
    console.log('[VisualEditor] Component inserted successfully:', testId);
  }
  
  function determineInsertPosition(targetElement, position) {
    // If target is a container-type element (div, section, main, etc.)
    const containerTags = ['DIV', 'SECTION', 'MAIN', 'ARTICLE', 'HEADER', 'FOOTER', 'NAV', 'ASIDE'];
    
    if (containerTags.includes(targetElement.tagName)) {
      // Check if it has the data-component-type attribute indicating it's from our palette
      const isOurComponent = targetElement.hasAttribute('data-component-type');
      
      if (isOurComponent) {
        const componentType = targetElement.getAttribute('data-component-type');
        const layoutTypes = ['container', 'flex-row', 'flex-column', 'grid-2x2', 'grid-3x3', 'section'];
        
        if (layoutTypes.includes(componentType)) {
          return 'inside'; // Insert inside layout components
        }
      }
      
      // For generic containers, check if they have children
      if (targetElement.children.length > 0) {
        return 'after'; // Insert after if it has children
      } else {
        return 'inside'; // Insert inside if empty
      }
    }
    
    // For non-container elements, insert adjacent
    return 'after';
  }

  // ============================================================================
  // DROP ZONE HIGHLIGHTING
  // ============================================================================
  let dropZoneElement = null;
  
  function showDropZone(position) {
    hideDropZone(); // Remove previous drop zone
    
    const targetElement = document.elementFromPoint(position.x, position.y);
    if (!targetElement) return;
    
    // Add drop zone highlight
    targetElement.classList.add('drop-zone-highlight');
    dropZoneElement = targetElement;
  }
  
  function hideDropZone() {
    if (dropZoneElement) {
      dropZoneElement.classList.remove('drop-zone-highlight');
      dropZoneElement = null;
    }
  }

  // Listen for commands from parent
  window.addEventListener('message', function(event) {
    if (event.data.type === 'APPLY_CHANGE') {
      applyChange(event.data.change);
    } else if (event.data.type === 'UNDO_CHANGE') {
      undoLastChange();
    } else if (event.data.type === 'INSERT_COMPONENT') {
      insertComponent(event.data.payload);
    } else if (event.data.type === 'SHOW_DROP_ZONE') {
      showDropZone(event.data.position);
    } else if (event.data.type === 'HIDE_DROP_ZONE') {
      hideDropZone();
    }
  });

  function handleMouseMove(e) {
    const target = e.target;
    
    // Remove previous hover
    if (hoveredElement && hoveredElement !== selectedElement) {
      hoveredElement.style.outline = '';
    }

    // Add hover to new element
    if (target.tagName !== 'HTML' && target.tagName !== 'BODY') {
      target.style.outline = '2px dashed rgba(147, 51, 234, 0.5)';
      hoveredElement = target;
    }
  }

  function handleClick(e) {
    const target = e.target;
    
    // COMMAND+CLICK (or CTRL+CLICK) NAVIGATION - Like Replit
    if ((e.metaKey || e.ctrlKey) && target.tagName === 'A') {
      e.preventDefault();
      e.stopPropagation();
      
      const href = target.getAttribute('href');
      if (href && href.startsWith('/')) {
        // Send navigation request to parent
        window.parent.postMessage({
          type: 'IFRAME_NAVIGATE',
          url: href
        }, '*');
        return;
      }
    }

    // REGULAR CLICK - Element selection
    e.preventDefault();
    e.stopPropagation();
    
    // Remove previous selection
    if (selectedElement) {
      selectedElement.style.outline = '';
    }

    // Select new element
    if (target.tagName !== 'HTML' && target.tagName !== 'BODY') {
      target.style.outline = '3px solid rgb(147, 51, 234)';
      selectedElement = target;

      // Get element info
      const rect = target.getBoundingClientRect();
      const component = {
        id: target.id || 'element-' + Date.now(),
        tagName: target.tagName.toLowerCase(),
        className: target.className || '',
        text: (target.textContent || '').substring(0, 100),
        testId: target.getAttribute('data-testid') || null,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }
      };

      // Send to parent via postMessage
      window.parent.postMessage({
        type: 'IFRAME_ELEMENT_SELECTED',
        component
      }, '*');
    }
  }

  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('click', handleClick, true);

  // Notify parent that script is ready
  window.parent.postMessage({
    type: 'IFRAME_SCRIPT_READY'
  }, '*');

  console.log('[VisualEditor] Selection script injected + Mr. Blue buttons hidden');
})();
`;

export function injectSelectionScript(iframe: HTMLIFrameElement): void {
  try {
    // Strategy 1: Direct document injection
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) {
      console.warn('[VisualEditor] Cannot access iframe document - may be cross-origin');
      console.warn('[VisualEditor] Attempting postMessage fallback...');
      usePostMessageInjection(iframe);
      return;
    }

    // Check if already injected
    if (iframeDoc.querySelector('[data-visual-editor-script="true"]')) {
      console.log('[VisualEditor] Script already injected');
      return;
    }

    // Wait for DOM to be ready
    const injectWhenReady = () => {
      try {
        const script = iframeDoc.createElement('script');
        script.textContent = IFRAME_SELECTION_SCRIPT;
        script.setAttribute('data-visual-editor-script', 'true');
        script.setAttribute('type', 'text/javascript');
        
        // Inject into iframe head or body
        const target = iframeDoc.head || iframeDoc.body || iframeDoc.documentElement;
        if (target) {
          target.appendChild(script);
          console.log('[VisualEditor] ✅ Script injected successfully into', target.tagName);
          
          // Force execution check
          setTimeout(() => {
            const exists = iframeDoc.querySelector('[data-visual-editor-script="true"]');
            console.log('[VisualEditor] Script element exists after injection:', !!exists);
          }, 100);
        } else {
          console.error('[VisualEditor] ❌ No valid target for script injection');
        }
      } catch (err) {
        console.error('[VisualEditor] ❌ Injection failed:', err);
        usePostMessageInjection(iframe);
      }
    };

    // Multiple injection attempts
    if (iframeDoc.readyState === 'complete') {
      console.log('[VisualEditor] DOM is complete, injecting now');
      injectWhenReady();
    } else if (iframeDoc.readyState === 'interactive') {
      console.log('[VisualEditor] DOM is interactive, injecting now');
      injectWhenReady();
    } else {
      console.log('[VisualEditor] DOM not ready, waiting for DOMContentLoaded');
      iframeDoc.addEventListener('DOMContentLoaded', injectWhenReady);
      // Fallback timeout
      setTimeout(injectWhenReady, 500);
    }
  } catch (error) {
    console.error('[VisualEditor] ❌ Fatal injection error:', error);
    usePostMessageInjection(iframe);
  }
}

/**
 * Fallback: Use postMessage to inject script
 * Works even with cross-origin restrictions
 */
function usePostMessageInjection(iframe: HTMLIFrameElement): void {
  console.log('[VisualEditor] Using postMessage injection strategy');
  
  if (!iframe.contentWindow) {
    console.error('[VisualEditor] No contentWindow available');
    return;
  }

  // Send script via postMessage
  iframe.contentWindow.postMessage({
    type: 'INJECT_SELECTION_SCRIPT',
    script: IFRAME_SELECTION_SCRIPT
  }, '*');
  
  console.log('[VisualEditor] Script sent via postMessage');
}

/**
 * Apply instant DOM change to iframe
 */
export function applyInstantChange(iframe: HTMLIFrameElement, change: any): void {
  if (!iframe.contentWindow) {
    console.warn('[VisualEditor] Cannot access iframe window');
    return;
  }

  iframe.contentWindow.postMessage({
    type: 'APPLY_CHANGE',
    change
  }, '*');
}

/**
 * Undo last change in iframe
 */
export function undoLastChange(iframe: HTMLIFrameElement): void {
  if (!iframe.contentWindow) {
    console.warn('[VisualEditor] Cannot access iframe window');
    return;
  }

  iframe.contentWindow.postMessage({
    type: 'UNDO_CHANGE'
  }, '*');
}

/**
 * Iframe Script Injector
 * Injects component selection logic into iframe via postMessage
 * Solves cross-origin security issues
 */

import { ScreenshotCapture } from './screenshotCapture';

export interface StyleChangeRequest {
  type: 'style' | 'class';
  property: string;
  value: string;
}

export interface StyleChange {
  id: string;
  selector: string;
  property: string;
  previousValue: string;
  newValue: string;
  timestamp: number;
  screenshot?: string;
  description?: string;
}

export interface IframeCallbacks {
  onElementSelected?: (element: HTMLElement) => void;
  onChangeApplied?: (change: StyleChange) => void;
}

export class IframeInjector {
  private iframe: HTMLIFrameElement | null = null;
  private selectedElement: HTMLElement | null = null;
  private changeHistory: StyleChange[] = [];
  private changeIndex: number = -1;
  private onElementSelected?: (element: HTMLElement) => void;
  private onChangeApplied?: (change: StyleChange) => void;
  private messageListener?: (event: MessageEvent) => void;
  private screenshotCapture = new ScreenshotCapture();
  
  initialize(iframe: HTMLIFrameElement, callbacks: IframeCallbacks) {
    this.iframe = iframe;
    this.onElementSelected = callbacks.onElementSelected;
    this.onChangeApplied = callbacks.onChangeApplied;
    
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
      }
    };
    
    window.addEventListener('message', this.messageListener);
    console.log('[IframeInjector] Initialized with callbacks');
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
    this.messageListener = undefined;
    
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
    const previousValue = targetElement.style[change.property as any];
    
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
    
    // Capture screenshot after change
    let screenshot = '';
    if (this.iframe) {
      screenshot = await this.screenshotCapture.captureIframe(this.iframe);
    }
    
    // Add to history
    const styleChange: StyleChange = {
      id: `change-${Date.now()}`,
      selector,
      property: change.property,
      previousValue,
      newValue: change.value,
      timestamp: Date.now(),
      screenshot,
      description: `Changed ${change.property} from ${previousValue} to ${change.value}`,
    };
    
    // Remove any changes after current index (for redo)
    this.changeHistory = this.changeHistory.slice(0, this.changeIndex + 1);
    this.changeHistory.push(styleChange);
    this.changeIndex++;
    
    // Send update to parent
    this.notifyParent('CHANGE_APPLIED', styleChange);
  }
  
  async undo(): Promise<void> {
    if (this.changeIndex < 0) {
      console.log('[IframeInjector] Nothing to undo');
      return;
    }
    
    const change = this.changeHistory[this.changeIndex];
    
    const iframeDoc = this.iframe?.contentDocument;
    if (!iframeDoc) return;
    
    const targetElement = iframeDoc.querySelector(change.selector) as HTMLElement;
    if (targetElement) {
      targetElement.style[change.property as any] = change.previousValue;
    }
    
    this.changeIndex--;
    this.notifyParent('CHANGE_UNDONE', change);
    
    await this.captureScreenshot();
  }
  
  async redo(): Promise<void> {
    if (this.changeIndex >= this.changeHistory.length - 1) {
      console.log('[IframeInjector] Nothing to redo');
      return;
    }
    
    this.changeIndex++;
    const change = this.changeHistory[this.changeIndex];
    
    const iframeDoc = this.iframe?.contentDocument;
    if (!iframeDoc) return;
    
    const targetElement = iframeDoc.querySelector(change.selector) as HTMLElement;
    if (targetElement) {
      targetElement.style[change.property as any] = change.newValue;
    }
    
    this.notifyParent('CHANGE_REDONE', change);
    
    await this.captureScreenshot();
  }
  
  async jumpToChange(index: number): Promise<void> {
    if (index < -1 || index >= this.changeHistory.length) {
      console.warn('[IframeInjector] Invalid change index');
      return;
    }
    
    // Undo to the beginning
    while (this.changeIndex > index) {
      await this.undo();
    }
    
    // Redo to the target index
    while (this.changeIndex < index) {
      await this.redo();
    }
  }
  
  getHistory(): StyleChange[] {
    return this.changeHistory;
  }
  
  getCurrentIndex(): number {
    return this.changeIndex;
  }
  
  canUndo(): boolean {
    return this.changeIndex >= 0;
  }
  
  canRedo(): boolean {
    return this.changeIndex < this.changeHistory.length - 1;
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
}

export const IFRAME_SELECTION_SCRIPT = `
(function() {
  let hoveredElement = null;
  let selectedElement = null;
  let undoStack = [];

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

  // Listen for commands from parent
  window.addEventListener('message', function(event) {
    if (event.data.type === 'APPLY_CHANGE') {
      applyChange(event.data.change);
    } else if (event.data.type === 'UNDO_CHANGE') {
      undoLastChange();
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

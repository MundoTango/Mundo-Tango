/**
 * Hot Module Reload Handler for Mr. Blue Visual Editor
 * Implements smart reloading based on file type
 * 
 * Features:
 * - CSS: Inject <style> tag (no reload)
 * - JS/TSX: Reload affected module only
 * - HTML: Replace DOM nodes (no full reload)
 * - Uses Vite's HMR API for module reloading
 */

// ==================== TYPE DEFINITIONS ====================

export type ReloadStrategy = 'full' | 'module' | 'style' | 'dom' | 'none';

export interface HMRUpdate {
  type: 'css' | 'js' | 'html';
  filePath: string;
  content?: string;
  selector?: string;
  strategy: ReloadStrategy;
}

export interface HMRResult {
  success: boolean;
  strategy: ReloadStrategy;
  message: string;
  reloadedModules?: string[];
}

// ==================== HOT MODULE RELOAD HANDLER ====================

export class HotModuleReloadHandler {
  private iframe: HTMLIFrameElement | null = null;
  private injectedStyles: Map<string, HTMLStyleElement> = new Map();
  
  constructor(iframe?: HTMLIFrameElement) {
    this.iframe = iframe || null;
    console.log('[HMR] Hot Module Reload Handler initialized');
  }

  /**
   * Set iframe reference
   */
  setIframe(iframe: HTMLIFrameElement): void {
    this.iframe = iframe;
  }

  /**
   * Apply HMR update
   */
  async applyUpdate(update: HMRUpdate): Promise<HMRResult> {
    if (!this.iframe) {
      return {
        success: false,
        strategy: 'none',
        message: 'No iframe available'
      };
    }

    console.log('[HMR] Applying update:', update);

    try {
      switch (update.type) {
        case 'css':
          return await this.applyCSSUpdate(update);
        case 'js':
          return await this.applyJSUpdate(update);
        case 'html':
          return await this.applyHTMLUpdate(update);
        default:
          return {
            success: false,
            strategy: 'none',
            message: 'Unknown update type'
          };
      }
    } catch (error: any) {
      console.error('[HMR] Update failed:', error);
      return {
        success: false,
        strategy: update.strategy,
        message: error.message || 'Update failed'
      };
    }
  }

  /**
   * Apply CSS update (inject style tag, no reload)
   */
  private async applyCSSUpdate(update: HMRUpdate): Promise<HMRResult> {
    if (!this.iframe?.contentDocument || !update.content) {
      return {
        success: false,
        strategy: 'style',
        message: 'Invalid iframe or content'
      };
    }

    try {
      const doc = this.iframe.contentDocument;
      const styleId = `hmr-style-${update.filePath.replace(/[^a-z0-9]/gi, '-')}`;
      
      // Remove existing style tag if present
      const existingStyle = doc.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
        this.injectedStyles.delete(styleId);
      }

      // Create and inject new style tag
      const styleElement = doc.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = update.content;
      doc.head.appendChild(styleElement);
      
      this.injectedStyles.set(styleId, styleElement);

      console.log('[HMR] CSS injected:', update.filePath);
      
      return {
        success: true,
        strategy: 'style',
        message: 'CSS updated without reload'
      };
    } catch (error: any) {
      console.error('[HMR] CSS injection failed:', error);
      return {
        success: false,
        strategy: 'style',
        message: error.message || 'CSS injection failed'
      };
    }
  }

  /**
   * Apply JS/TSX update (reload module using Vite HMR)
   */
  private async applyJSUpdate(update: HMRUpdate): Promise<HMRResult> {
    if (!this.iframe?.contentWindow) {
      return {
        success: false,
        strategy: 'module',
        message: 'Invalid iframe window'
      };
    }

    try {
      const win = this.iframe.contentWindow as any;
      
      // Check if Vite HMR is available
      if (!win.import?.meta?.hot) {
        console.warn('[HMR] Vite HMR not available, falling back to full reload');
        return await this.applyFullReload();
      }

      const hot = win.import.meta.hot;
      const modulePath = update.filePath;

      // Invalidate and reload module
      const reloadedModules: string[] = [];
      
      // Notify HMR about the change
      hot.invalidate(modulePath);
      
      // Accept the update
      hot.accept(modulePath, (newModule: any) => {
        console.log('[HMR] Module reloaded:', modulePath);
        reloadedModules.push(modulePath);
      });

      // Dispatch custom event to notify about module reload
      win.dispatchEvent(new CustomEvent('vite:beforeUpdate', {
        detail: { path: modulePath }
      }));

      console.log('[HMR] Module HMR applied:', modulePath);
      
      return {
        success: true,
        strategy: 'module',
        message: 'Module reloaded',
        reloadedModules
      };
    } catch (error: any) {
      console.error('[HMR] Module reload failed:', error);
      
      // Fallback to full reload
      console.warn('[HMR] Falling back to full reload');
      return await this.applyFullReload();
    }
  }

  /**
   * Apply HTML update (replace DOM nodes, no full reload)
   */
  private async applyHTMLUpdate(update: HMRUpdate): Promise<HMRResult> {
    if (!this.iframe?.contentDocument || !update.content || !update.selector) {
      return {
        success: false,
        strategy: 'dom',
        message: 'Invalid iframe, content, or selector'
      };
    }

    try {
      const doc = this.iframe.contentDocument;
      const target = doc.querySelector(update.selector);
      
      if (!target) {
        console.warn(`[HMR] Target element not found: ${update.selector}`);
        return {
          success: false,
          strategy: 'dom',
          message: `Element not found: ${update.selector}`
        };
      }

      // Create temporary container
      const temp = doc.createElement('div');
      temp.innerHTML = update.content;
      
      // Replace target's content
      target.innerHTML = '';
      while (temp.firstChild) {
        target.appendChild(temp.firstChild);
      }

      console.log('[HMR] DOM updated:', update.selector);
      
      return {
        success: true,
        strategy: 'dom',
        message: 'DOM updated without reload'
      };
    } catch (error: any) {
      console.error('[HMR] DOM update failed:', error);
      return {
        success: false,
        strategy: 'dom',
        message: error.message || 'DOM update failed'
      };
    }
  }

  /**
   * Apply full reload (fallback)
   */
  private async applyFullReload(): Promise<HMRResult> {
    if (!this.iframe) {
      return {
        success: false,
        strategy: 'full',
        message: 'No iframe available'
      };
    }

    try {
      // Store current src to force reload
      const currentSrc = this.iframe.src;
      this.iframe.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + '_t=' + Date.now();
      
      console.log('[HMR] Full reload triggered');
      
      return {
        success: true,
        strategy: 'full',
        message: 'Full page reloaded'
      };
    } catch (error: any) {
      console.error('[HMR] Full reload failed:', error);
      return {
        success: false,
        strategy: 'full',
        message: error.message || 'Full reload failed'
      };
    }
  }

  /**
   * Clear all injected styles
   */
  clearInjectedStyles(): void {
    if (!this.iframe?.contentDocument) return;

    for (const [id, element] of this.injectedStyles) {
      element.remove();
    }
    
    this.injectedStyles.clear();
    console.log('[HMR] Cleared all injected styles');
  }

  /**
   * Get list of injected styles
   */
  getInjectedStyles(): string[] {
    return Array.from(this.injectedStyles.keys());
  }

  /**
   * Determine best reload strategy for file type
   */
  static determineStrategy(filePath: string): ReloadStrategy {
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
        return 'style';
      
      case 'tsx':
      case 'jsx':
      case 'ts':
      case 'js':
        return 'module';
      
      case 'html':
        return 'dom';
      
      default:
        return 'full';
    }
  }

  /**
   * Batch apply multiple updates
   */
  async applyBatchUpdates(updates: HMRUpdate[]): Promise<HMRResult[]> {
    console.log(`[HMR] Applying ${updates.length} updates in batch`);
    
    const results: HMRResult[] = [];
    
    // Group by strategy for optimization
    const styleUpdates = updates.filter(u => u.type === 'css');
    const moduleUpdates = updates.filter(u => u.type === 'js');
    const domUpdates = updates.filter(u => u.type === 'html');
    
    // Apply all style updates first (fastest)
    for (const update of styleUpdates) {
      results.push(await this.applyUpdate(update));
    }
    
    // Then DOM updates
    for (const update of domUpdates) {
      results.push(await this.applyUpdate(update));
    }
    
    // Finally module updates (may trigger re-renders)
    for (const update of moduleUpdates) {
      results.push(await this.applyUpdate(update));
    }
    
    return results;
  }
}

// Export singleton instance
export const hmrHandler = new HotModuleReloadHandler();

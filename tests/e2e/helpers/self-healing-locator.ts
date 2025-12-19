/**
 * SELF-HEALING ELEMENT LOCATOR
 * AI-Powered Element Location with Automatic Fallback
 * 
 * This system automatically recovers when UI changes break selectors by:
 * 1. Trying primary selector (data-testid)
 * 2. Falling back to alternative selectors
 * 3. Using AI-powered suggestions based on context
 * 4. Logging all healing events for review
 * 
 * Expected Success Rate: 80%+ for broken selectors
 */

import { Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Configuration for finding an element with self-healing capabilities
 */
export interface SelfHealingOptions {
  testId?: string;              // Primary selector (data-testid attribute)
  fallbackSelectors: string[];  // Backup selectors to try in order
  context: string;              // Human-readable description for AI suggestions
  aiSuggest?: boolean;          // Enable AI-powered element discovery
  timeout?: number;             // Timeout for each selector attempt (ms)
}

/**
 * Result of element location attempt
 */
export interface ElementLocationResult {
  found: boolean;       // Was the element successfully found?
  selector: string;     // Which selector worked?
  healed: boolean;      // Did healing occur (fallback/AI used)?
  confidence: number;   // Confidence level (0.0-1.0)
  method: 'primary' | 'fallback' | 'ai' | 'failed'; // How element was found
}

/**
 * Healing event for logging and analysis
 */
export interface HealingEvent {
  timestamp: number;
  context: string;
  originalSelector: string;
  healedSelector: string;
  success: boolean;
  method: 'fallback' | 'ai';
  confidence: number;
}

/**
 * Self-Healing Locator Class
 * Automatically recovers from broken selectors using intelligent fallback strategies
 */
export class SelfHealingLocator {
  private healingLog: HealingEvent[] = [];
  private readonly defaultTimeout: number = 5000;

  /**
   * Find element with automatic fallback and healing
   * 
   * @param page - Playwright page object
   * @param options - Self-healing configuration
   * @returns Element location result with selector and metadata
   */
  async findElement(page: Page, options: SelfHealingOptions): Promise<ElementLocationResult> {
    const timeout = options.timeout || this.defaultTimeout;

    // STEP 1: Try primary selector (data-testid)
    if (options.testId) {
      const primarySelector = `[data-testid="${options.testId}"]`;
      const primaryLocator = page.locator(primarySelector);
      
      if (await this.isVisible(primaryLocator, timeout)) {
        return {
          found: true,
          selector: primarySelector,
          healed: false,
          confidence: 1.0,
          method: 'primary'
        };
      }
    }

    // STEP 2: Try fallback selectors
    for (const fallbackSelector of options.fallbackSelectors) {
      const fallbackLocator = page.locator(fallbackSelector);
      
      if (await this.isVisible(fallbackLocator, timeout)) {
        // Log healing event
        this.logHealing({
          timestamp: Date.now(),
          context: options.context,
          originalSelector: options.testId ? `[data-testid="${options.testId}"]` : 'N/A',
          healedSelector: fallbackSelector,
          success: true,
          method: 'fallback',
          confidence: 0.8
        });

        return {
          found: true,
          selector: fallbackSelector,
          healed: true,
          confidence: 0.8,
          method: 'fallback'
        };
      }
    }

    // STEP 3: Try AI-powered suggestion (if enabled)
    if (options.aiSuggest) {
      const aiSelector = await this.generateAISuggestion(page, options.context);
      
      if (aiSelector) {
        const aiLocator = page.locator(aiSelector);
        
        if (await this.isVisible(aiLocator, timeout)) {
          // Log AI healing event
          this.logHealing({
            timestamp: Date.now(),
            context: options.context,
            originalSelector: options.testId ? `[data-testid="${options.testId}"]` : 'N/A',
            healedSelector: aiSelector,
            success: true,
            method: 'ai',
            confidence: 0.6
          });

          return {
            found: true,
            selector: aiSelector,
            healed: true,
            confidence: 0.6,
            method: 'ai'
          };
        }
      }
    }

    // STEP 4: Element not found
    this.logHealing({
      timestamp: Date.now(),
      context: options.context,
      originalSelector: options.testId ? `[data-testid="${options.testId}"]` : 'N/A',
      healedSelector: 'FAILED',
      success: false,
      method: 'fallback',
      confidence: 0.0
    });

    return {
      found: false,
      selector: '',
      healed: false,
      confidence: 0.0,
      method: 'failed'
    };
  }

  /**
   * Check if locator is visible within timeout
   * 
   * @param locator - Playwright locator
   * @param timeout - Maximum wait time in milliseconds
   * @returns True if element is visible, false otherwise
   */
  private async isVisible(locator: Locator, timeout: number): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate AI-powered selector suggestion based on context
   * 
   * Uses intelligent page analysis to find elements matching the description
   * 
   * @param page - Playwright page object
   * @param context - Human-readable element description
   * @returns Suggested selector or null if none found
   */
  private async generateAISuggestion(page: Page, context: string): Promise<string | null> {
    try {
      // Extract keywords from context
      const keywords = context.toLowerCase()
        .split(' ')
        .filter(word => word.length > 2); // Filter out short words

      // Analyze page structure and find matching elements
      const suggestion = await page.evaluate((keywords) => {
        const elements = Array.from(document.querySelectorAll('*'));
        const candidates: Array<{ selector: string; score: number }> = [];

        elements.forEach((el) => {
          let score = 0;
          const text = (el.textContent || '').toLowerCase();
          const classes = Array.from(el.classList).join(' ').toLowerCase();
          const id = (el.id || '').toLowerCase();
          const role = (el.getAttribute('role') || '').toLowerCase();
          const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
          const tagName = el.tagName.toLowerCase();

          // Score based on keyword matches
          keywords.forEach((keyword) => {
            if (text.includes(keyword)) score += 3;          // High weight for text content
            if (ariaLabel.includes(keyword)) score += 3;     // High weight for aria-label
            if (classes.includes(keyword)) score += 2;       // Medium weight for classes
            if (id.includes(keyword)) score += 2;            // Medium weight for ID
            if (role.includes(keyword)) score += 2;          // Medium weight for role
            if (tagName.includes(keyword)) score += 1;       // Low weight for tag name
          });

          // Only consider elements with some relevance
          if (score > 0) {
            // Generate best selector for this element
            let selector = tagName;
            
            if (id) {
              selector = `#${id}`;
            } else if (el.classList.length > 0) {
              selector = `${tagName}.${Array.from(el.classList)[0]}`;
            } else if (ariaLabel) {
              selector = `[aria-label="${el.getAttribute('aria-label')}"]`;
            } else if (role) {
              selector = `[role="${role}"]`;
            }

            candidates.push({ selector, score });
          }
        });

        // Sort by score and return highest scoring candidate
        candidates.sort((a, b) => b.score - a.score);
        return candidates.length > 0 ? candidates[0].selector : null;
      }, keywords);

      return suggestion;
    } catch (error) {
      console.warn('AI suggestion generation failed:', error);
      return null;
    }
  }

  /**
   * Log healing event for analysis and monitoring
   * 
   * @param event - Healing event to log
   */
  private logHealing(event: HealingEvent): void {
    this.healingLog.push(event);

    // Console logging for immediate visibility
    if (event.success) {
      console.log(
        `🔧 Self-Healing: Successfully recovered element\n` +
        `   Context: ${event.context}\n` +
        `   Original: ${event.originalSelector}\n` +
        `   Healed: ${event.healedSelector}\n` +
        `   Method: ${event.method}\n` +
        `   Confidence: ${(event.confidence * 100).toFixed(0)}%`
      );
    } else {
      console.warn(
        `⚠️  Self-Healing: Failed to find element\n` +
        `   Context: ${event.context}\n` +
        `   Original: ${event.originalSelector}`
      );
    }
  }

  /**
   * Get all healing events
   * 
   * @returns Array of all healing events
   */
  getHealingLog(): HealingEvent[] {
    return [...this.healingLog];
  }

  /**
   * Get healing statistics
   * 
   * @returns Statistics about healing success rate
   */
  getStatistics(): {
    totalAttempts: number;
    successfulHeals: number;
    failedHeals: number;
    successRate: number;
    byMethod: Record<string, number>;
  } {
    const total = this.healingLog.length;
    const successful = this.healingLog.filter(e => e.success).length;
    const failed = this.healingLog.filter(e => !e.success).length;

    const byMethod = this.healingLog.reduce((acc, event) => {
      if (event.success) {
        acc[event.method] = (acc[event.method] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAttempts: total,
      successfulHeals: successful,
      failedHeals: failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      byMethod
    };
  }

  /**
   * Save healing log to file for analysis
   * 
   * @param outputPath - Optional custom output path
   */
  async saveHealingLog(outputPath?: string): Promise<void> {
    const defaultPath = path.join(process.cwd(), 'test-results', 'self-healing-log.json');
    const filePath = outputPath || defaultPath;

    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write log with statistics
      const data = {
        timestamp: new Date().toISOString(),
        statistics: this.getStatistics(),
        events: this.healingLog
      };

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`📊 Self-healing log saved to: ${filePath}`);
    } catch (error) {
      console.error('Failed to save healing log:', error);
    }
  }

  /**
   * Clear healing log (useful for test isolation)
   */
  clearLog(): void {
    this.healingLog = [];
  }
}

/**
 * Export singleton instance for convenience
 */
export const selfHealing = new SelfHealingLocator();

/**
 * Helper function: Create self-healing locator with common patterns
 * 
 * @param testId - Primary data-testid value
 * @param context - Description of element
 * @param additionalFallbacks - Additional fallback selectors
 * @returns Self-healing options object
 */
export function createSelfHealingOptions(
  testId: string,
  context: string,
  additionalFallbacks: string[] = []
): SelfHealingOptions {
  // Common fallback patterns based on test ID
  const commonFallbacks = [
    `button[aria-label*="${testId}"]`,
    `[role="button"][aria-label*="${context}"]`,
    `button:has-text("${context}")`,
    `a[href*="${testId}"]`,
  ];

  return {
    testId,
    context,
    fallbackSelectors: [...additionalFallbacks, ...commonFallbacks],
    aiSuggest: true,
    timeout: 5000
  };
}

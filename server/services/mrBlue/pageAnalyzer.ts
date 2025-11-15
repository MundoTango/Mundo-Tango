/**
 * Page Analyzer Service
 * Parses iframe DOM structure and detects UI patterns
 * 
 * Features:
 * - Extract semantic tree from HTML
 * - Detect shadcn components by className patterns
 * - Identify common UI patterns (forms, nav, hero, cards)
 * - Build accessibility report
 * - Track all testIds, IDs, classes, and styles
 * 
 * Phase 5: AI-Powered Smart Context System
 */

import * as cheerio from 'cheerio';

// ==================== TYPES & INTERFACES ====================

/**
 * Analyzed component in DOM tree
 */
export interface ComponentNode {
  tagName: string;
  testId?: string;
  id?: string;
  className?: string;
  text?: string;
  styles: Record<string, string>;
  children: ComponentNode[];
  depth: number;
  isShadcnComponent?: boolean;
  shadcnType?: string; // 'Button', 'Card', 'Badge', etc.
}

/**
 * Detected UI pattern
 */
export interface UIPattern {
  type: 'hero' | 'navigation' | 'form' | 'card-grid' | 'footer' | 'sidebar' | 'table' | 'list';
  confidence: number; // 0-1
  selector: string;
  description: string;
  componentCount: number;
}

/**
 * Accessibility analysis result
 */
export interface AccessibilityReport {
  score: number; // 0-100
  issues: AccessibilityIssue[];
  passedChecks: string[];
  failedChecks: string[];
}

/**
 * Individual accessibility issue
 */
export interface AccessibilityIssue {
  severity: 'critical' | 'warning' | 'info';
  type: 'missing-alt' | 'poor-contrast' | 'no-labels' | 'missing-aria' | 'keyboard-trap' | 'heading-order';
  message: string;
  selector: string;
  suggestion: string;
}

/**
 * Complete page analysis
 */
export interface PageAnalysis {
  url: string;
  components: ComponentNode[];
  patterns: UIPattern[];
  accessibility: AccessibilityReport;
  shadcnComponents: string[]; // ['Button', 'Card', 'Badge']
  customElements: string[]; // Custom element selectors
  stats: {
    totalElements: number;
    totalTestIds: number;
    shadcnUsage: number;
    formElements: number;
    interactiveElements: number;
  };
  timestamp: number;
}

// ==================== SHADCN COMPONENT DETECTION ====================

/**
 * Shadcn component patterns (based on shadcn/ui class conventions)
 */
const SHADCN_PATTERNS = {
  Button: /\b(inline-flex|flex).*\b(items-center|justify-center).*\b(rounded-md|rounded-lg).*\b(text-sm|text-base).*\b(font-medium|font-semibold).*\b(ring-offset-background|focus-visible:outline-none)/,
  Card: /\b(rounded-lg|rounded-xl).*\b(border).*\b(bg-card).*\b(text-card-foreground).*\b(shadow-sm|shadow)/,
  Badge: /\b(inline-flex).*\b(items-center).*\b(rounded-full|rounded-md).*\b(border).*\b(px-2\.5|px-2).*\b(py-0\.5|py-1).*\b(text-xs)/,
  Input: /\b(flex).*\b(h-10|h-9).*\b(w-full).*\b(rounded-md).*\b(border).*\b(bg-background).*\b(px-3|px-4).*\b(py-2)/,
  Select: /\b(flex).*\b(h-10|h-9).*\b(items-center).*\b(justify-between).*\b(rounded-md).*\b(border)/,
  Dialog: /\b(fixed).*\b(inset-0|z-50).*\b(bg-background).*\b(data-\[state=open\])/,
  Popover: /\b(z-50).*\b(w-72|w-full).*\b(rounded-md).*\b(border).*\b(bg-popover).*\b(text-popover-foreground)/,
  Tabs: /\b(inline-flex).*\b(h-10|h-9).*\b(items-center).*\b(justify-center).*\b(rounded-md).*\b(bg-muted)/,
  Accordion: /\b(border-b).*\b(data-\[state=open\])/,
  Avatar: /\b(relative).*\b(flex).*\b(h-10|h-\d+).*\b(w-10|w-\d+).*\b(shrink-0).*\b(overflow-hidden).*\b(rounded-full)/,
  Progress: /\b(relative).*\b(h-4|h-2).*\b(w-full).*\b(overflow-hidden).*\b(rounded-full).*\b(bg-secondary)/,
  Separator: /\b(shrink-0).*\b(bg-border).*\b(h-\[1px\]|w-\[1px\])/,
  Skeleton: /\b(animate-pulse).*\b(rounded-md).*\b(bg-muted)/,
  Slider: /\b(relative).*\b(flex).*\b(w-full).*\b(touch-none).*\b(select-none).*\b(items-center)/,
  Switch: /\b(peer).*\b(inline-flex).*\b(h-6|h-5).*\b(w-11|w-9).*\b(shrink-0).*\b(rounded-full)/,
  Textarea: /\b(flex).*\b(min-h-\[80px\]|min-h-\[60px\]).*\b(w-full).*\b(rounded-md).*\b(border).*\b(bg-background)/,
  Toast: /\b(group).*\b(pointer-events-auto).*\b(relative).*\b(flex).*\b(w-full).*\b(items-center).*\b(justify-between).*\b(space-x-4).*\b(overflow-hidden).*\b(rounded-md).*\b(border)/
};

/**
 * Detect shadcn component type from className
 */
function detectShadcnComponent(className: string): { isShadcn: boolean; type?: string } {
  if (!className) return { isShadcn: false };

  for (const [componentType, pattern] of Object.entries(SHADCN_PATTERNS)) {
    if (pattern.test(className)) {
      return { isShadcn: true, type: componentType };
    }
  }

  return { isShadcn: false };
}

// ==================== PAGE ANALYZER SERVICE ====================

export class PageAnalyzerService {
  constructor() {
    console.log('[PageAnalyzer] Initialized');
  }

  /**
   * Analyze HTML structure and extract semantic tree
   */
  async analyzePage(htmlContent: string, url: string = 'unknown'): Promise<PageAnalysis> {
    console.log('[PageAnalyzer] Analyzing page:', url);

    const startTime = Date.now();

    // Parse HTML using cheerio
    const $ = cheerio.load(htmlContent);

    // Build component tree
    const components = this.buildComponentTree($, $('body'));

    // Detect UI patterns
    const patterns = this.detectUIPatterns($);

    // Run accessibility analysis
    const accessibility = this.analyzeAccessibility($);

    // Extract shadcn components
    const shadcnComponents = this.extractShadcnComponents(components);

    // Find custom elements (not shadcn, not standard HTML)
    const customElements = this.extractCustomElements(components);

    // Calculate stats
    const stats = {
      totalElements: this.countElements(components),
      totalTestIds: this.countTestIds(components),
      shadcnUsage: shadcnComponents.length,
      formElements: $('input, select, textarea, button[type="submit"]').length,
      interactiveElements: $('button, a, [role="button"], [onClick]').length
    };

    const analysisTime = Date.now() - startTime;
    console.log(`[PageAnalyzer] Analysis complete in ${analysisTime}ms - ${stats.totalElements} elements, ${shadcnComponents.length} shadcn components`);

    return {
      url,
      components,
      patterns,
      accessibility,
      shadcnComponents,
      customElements,
      stats,
      timestamp: Date.now()
    };
  }

  /**
   * Build semantic component tree from DOM
   */
  private buildComponentTree(
    $: cheerio.CheerioAPI,
    element: cheerio.Cheerio<any>,
    depth: number = 0
  ): ComponentNode[] {
    const nodes: ComponentNode[] = [];

    element.children().each((_, child) => {
      const $child = $(child);

      // Skip script, style, meta tags
      if (['script', 'style', 'meta', 'link'].includes(child.tagName?.toLowerCase())) {
        return;
      }

      const tagName = child.tagName?.toLowerCase() || 'unknown';
      const testId = $child.attr('data-testid') || undefined;
      const id = $child.attr('id') || undefined;
      const className = $child.attr('class') || undefined;

      // Extract text content (first 100 chars)
      const text = $child.text().trim().substring(0, 100) || undefined;

      // Extract computed styles
      const styles = this.extractInlineStyles($child);

      // Detect shadcn component
      const shadcnDetection = className ? detectShadcnComponent(className) : { isShadcn: false };

      // Recursively build children
      const children = this.buildComponentTree($, $child, depth + 1);

      nodes.push({
        tagName,
        testId,
        id,
        className,
        text,
        styles,
        children,
        depth,
        isShadcnComponent: shadcnDetection.isShadcn,
        shadcnType: shadcnDetection.type
      });
    });

    return nodes;
  }

  /**
   * Extract inline styles from element
   */
  private extractInlineStyles($element: cheerio.Cheerio<any>): Record<string, string> {
    const styleAttr = $element.attr('style');
    if (!styleAttr) return {};

    const styles: Record<string, string> = {};
    const stylePairs = styleAttr.split(';').filter(s => s.trim());

    stylePairs.forEach(pair => {
      const [property, value] = pair.split(':').map(s => s.trim());
      if (property && value) {
        styles[property] = value;
      }
    });

    return styles;
  }

  /**
   * Detect common UI patterns
   */
  private detectUIPatterns($: cheerio.CheerioAPI): UIPattern[] {
    const patterns: UIPattern[] = [];

    // Hero section detection
    const hero = $('section').first();
    if (hero.length && hero.height() && (hero.height() as number) > 400) {
      patterns.push({
        type: 'hero',
        confidence: 0.8,
        selector: this.generateSelector(hero),
        description: 'Large hero section detected',
        componentCount: hero.find('*').length
      });
    }

    // Navigation detection
    const nav = $('nav, header nav, [role="navigation"]');
    if (nav.length) {
      patterns.push({
        type: 'navigation',
        confidence: 0.9,
        selector: this.generateSelector(nav.first()),
        description: 'Navigation component detected',
        componentCount: nav.find('a, button').length
      });
    }

    // Form detection
    $('form').each((_, form) => {
      const $form = $(form);
      patterns.push({
        type: 'form',
        confidence: 0.95,
        selector: this.generateSelector($form),
        description: `Form with ${$form.find('input, select, textarea').length} inputs`,
        componentCount: $form.find('input, select, textarea').length
      });
    });

    // Card grid detection (3+ cards in a row/grid)
    const gridContainers = $('.grid, [class*="grid-cols"], .flex.flex-wrap');
    gridContainers.each((_, container) => {
      const $container = $(container);
      const cards = $container.children('[class*="card"], [class*="rounded"], article, .item');
      if (cards.length >= 3) {
        patterns.push({
          type: 'card-grid',
          confidence: 0.75,
          selector: this.generateSelector($container),
          description: `Grid of ${cards.length} card-like components`,
          componentCount: cards.length
        });
      }
    });

    // Footer detection
    const footer = $('footer, [role="contentinfo"]');
    if (footer.length) {
      patterns.push({
        type: 'footer',
        confidence: 0.9,
        selector: this.generateSelector(footer.first()),
        description: 'Footer component detected',
        componentCount: footer.find('*').length
      });
    }

    // Sidebar detection
    const sidebar = $('aside, [role="complementary"], .sidebar');
    if (sidebar.length) {
      patterns.push({
        type: 'sidebar',
        confidence: 0.8,
        selector: this.generateSelector(sidebar.first()),
        description: 'Sidebar component detected',
        componentCount: sidebar.find('*').length
      });
    }

    return patterns;
  }

  /**
   * Analyze accessibility issues
   */
  private analyzeAccessibility($: cheerio.CheerioAPI): AccessibilityReport {
    const issues: AccessibilityIssue[] = [];
    const passedChecks: string[] = [];
    const failedChecks: string[] = [];

    // Check 1: Images without alt text
    $('img').each((_, img) => {
      const $img = $(img);
      if (!$img.attr('alt')) {
        issues.push({
          severity: 'critical',
          type: 'missing-alt',
          message: 'Image missing alt text',
          selector: this.generateSelector($img),
          suggestion: 'Add descriptive alt attribute to image'
        });
      }
    });

    if (issues.filter(i => i.type === 'missing-alt').length === 0) {
      passedChecks.push('All images have alt text');
    } else {
      failedChecks.push('Images missing alt text');
    }

    // Check 2: Form inputs without labels
    $('input:not([type="hidden"]), textarea, select').each((_, input) => {
      const $input = $(input);
      const id = $input.attr('id');
      const ariaLabel = $input.attr('aria-label');
      const ariaLabelledby = $input.attr('aria-labelledby');

      // Check if there's a label
      const hasLabel = id && $(`label[for="${id}"]`).length > 0;

      if (!hasLabel && !ariaLabel && !ariaLabelledby) {
        issues.push({
          severity: 'warning',
          type: 'no-labels',
          message: 'Form input missing label',
          selector: this.generateSelector($input),
          suggestion: 'Add a <label> element or aria-label attribute'
        });
      }
    });

    if (issues.filter(i => i.type === 'no-labels').length === 0) {
      passedChecks.push('All form inputs have labels');
    } else {
      failedChecks.push('Form inputs missing labels');
    }

    // Check 3: Buttons without accessible text
    $('button:not([aria-label])').each((_, btn) => {
      const $btn = $(btn);
      const text = $btn.text().trim();
      
      if (!text && !$btn.attr('aria-label') && !$btn.attr('title')) {
        issues.push({
          severity: 'warning',
          type: 'missing-aria',
          message: 'Button missing accessible text',
          selector: this.generateSelector($btn),
          suggestion: 'Add text content or aria-label'
        });
      }
    });

    if (issues.filter(i => i.type === 'missing-aria').length === 0) {
      passedChecks.push('All buttons have accessible text');
    } else {
      failedChecks.push('Buttons missing accessible text');
    }

    // Check 4: Heading hierarchy
    const headings: string[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, heading) => {
      headings.push(heading.tagName?.toLowerCase() || '');
    });

    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.substring(1));
      if (index > 0 && level - previousLevel > 1) {
        issues.push({
          severity: 'info',
          type: 'heading-order',
          message: `Heading hierarchy skips level (${heading} after h${previousLevel})`,
          selector: heading,
          suggestion: 'Maintain proper heading hierarchy (h1 → h2 → h3)'
        });
      }
      previousLevel = level;
    });

    if (issues.filter(i => i.type === 'heading-order').length === 0) {
      passedChecks.push('Heading hierarchy is correct');
    } else {
      failedChecks.push('Heading hierarchy issues');
    }

    // Calculate score (100 - 10 points per critical, 5 per warning, 2 per info)
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    const score = Math.max(0, 100 - (criticalCount * 10 + warningCount * 5 + infoCount * 2));

    return {
      score,
      issues,
      passedChecks,
      failedChecks
    };
  }

  /**
   * Extract all shadcn components used
   */
  private extractShadcnComponents(components: ComponentNode[]): string[] {
    const shadcnSet = new Set<string>();

    const traverse = (nodes: ComponentNode[]) => {
      nodes.forEach(node => {
        if (node.isShadcnComponent && node.shadcnType) {
          shadcnSet.add(node.shadcnType);
        }
        if (node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(components);

    return Array.from(shadcnSet);
  }

  /**
   * Extract custom element selectors (non-shadcn, non-standard)
   */
  private extractCustomElements(components: ComponentNode[]): string[] {
    const customElements: string[] = [];

    const traverse = (nodes: ComponentNode[]) => {
      nodes.forEach(node => {
        // Custom element: has className but not shadcn, and has testId
        if (node.className && !node.isShadcnComponent && node.testId) {
          customElements.push(`[data-testid="${node.testId}"]`);
        }
        if (node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(components);

    return customElements.slice(0, 20); // Limit to 20 most relevant
  }

  /**
   * Generate unique CSS selector for element
   */
  private generateSelector($element: cheerio.Cheerio<any>): string {
    const testId = $element.attr('data-testid');
    if (testId) return `[data-testid="${testId}"]`;

    const id = $element.attr('id');
    if (id) return `#${id}`;

    const className = $element.attr('class');
    if (className) {
      const firstClass = className.split(' ')[0];
      return `.${firstClass}`;
    }

    return $element.prop('tagName')?.toLowerCase() || 'unknown';
  }

  /**
   * Count total elements in tree
   */
  private countElements(components: ComponentNode[]): number {
    let count = components.length;
    components.forEach(node => {
      if (node.children.length > 0) {
        count += this.countElements(node.children);
      }
    });
    return count;
  }

  /**
   * Count elements with testId
   */
  private countTestIds(components: ComponentNode[]): number {
    let count = 0;
    const traverse = (nodes: ComponentNode[]) => {
      nodes.forEach(node => {
        if (node.testId) count++;
        if (node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(components);
    return count;
  }
}

// Singleton instance
export const pageAnalyzer = new PageAnalyzerService();

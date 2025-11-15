/**
 * Element Selector Service
 * Parses natural language element references into CSS selectors using GPT-4o
 * 
 * Features:
 * - Natural language → CSS selector conversion
 * - Support for data-testid attributes (primary method)
 * - Fallback to semantic selectors
 * - Context-aware "that" / "this" references
 * - Few-shot learning examples
 * 
 * Examples:
 * - "the login button" → button[data-testid="button-login"]
 * - "header" → header
 * - "that div" → last selected element from context
 * - "submit button" → button[data-testid="button-submit"]
 * 
 * Phase 2: Backend Intelligence for Element Selection
 */

import { OpenAIService } from '../ai/OpenAIService';
import { conversationContext } from './conversationContext';

// ==================== TYPES & INTERFACES ====================

/**
 * Element selection result
 */
export interface ElementSelectorResult {
  selector: string;
  confidence: number; // 0-1 score
  explanation: string;
  alternatives?: string[]; // Alternative selectors
}

// ==================== ELEMENT SELECTOR SERVICE ====================

export class ElementSelectorService {
  private readonly MODEL = 'gpt-4o-mini'; // Fast selector parsing
  
  constructor() {
    console.log('[ElementSelector] Initialized with GPT-4o-mini');
  }

  /**
   * Parse natural language element reference into CSS selector
   */
  async parseElementReference(
    reference: string,
    userId?: number
  ): Promise<ElementSelectorResult> {
    const systemPrompt = `You are a CSS selector generator. Convert natural language element references into precise CSS selectors.

PRIORITY SYSTEM:
1. data-testid attributes (ALWAYS prefer these if element type matches)
2. Semantic HTML tags (header, nav, footer, main, etc.)
3. Common class patterns
4. ID selectors (last resort)

TESTID NAMING CONVENTION:
- Buttons: button[data-testid="button-{action}"]
  Examples: button-login, button-submit, button-cancel, button-save
  
- Inputs: input[data-testid="input-{field}"]
  Examples: input-email, input-password, input-search, input-name
  
- Links: a[data-testid="link-{target}"]
  Examples: link-profile, link-settings, link-home
  
- Text/Display: [data-testid="text-{content}"]
  Examples: text-username, text-status, text-title
  
- Containers: [data-testid="container-{purpose}"]
  Examples: container-feed, container-sidebar, container-modal

FEW-SHOT EXAMPLES:

Input: "the login button"
Output: button[data-testid="button-login"]

Input: "submit button"
Output: button[data-testid="button-submit"]

Input: "email input"
Output: input[data-testid="input-email"]

Input: "profile link"
Output: a[data-testid="link-profile"]

Input: "header"
Output: header

Input: "navigation bar"
Output: nav

Input: "main content area"
Output: main

Input: "sidebar"
Output: aside, [data-testid="sidebar"], .sidebar

Input: "username text"
Output: [data-testid="text-username"]

Input: "feed container"
Output: [data-testid="container-feed"]

CONTEXT REFERENCES:
- "that" / "this" / "it" → Use context from previous conversation
- Without context, default to most recently mentioned element type

Respond with JSON only:
{
  "selector": "CSS selector string",
  "confidence": number (0-1),
  "explanation": "Brief explanation of selector choice",
  "alternatives": ["alternative1", "alternative2"]
}`;

    try {
      // Check for context-dependent references
      const contextualSelector = await this.resolveContextualReference(reference, userId);
      if (contextualSelector) {
        return contextualSelector;
      }

      // Use GPT-4o to parse reference
      const response = await OpenAIService.query({
        prompt: reference,
        model: this.MODEL,
        systemPrompt,
        temperature: 0.1, // Very low for consistent selectors
        maxTokens: 200
      });

      const result = JSON.parse(response.content);

      console.log('[ElementSelector] Parsed selector:', {
        reference,
        selector: result.selector,
        confidence: result.confidence
      });

      return {
        selector: result.selector || '*',
        confidence: result.confidence || 0.8,
        explanation: result.explanation || 'Generated from natural language',
        alternatives: result.alternatives || []
      };
    } catch (error: any) {
      console.error('[ElementSelector] Parse error:', error.message);
      
      // Fallback to simple pattern matching
      return this.fallbackParse(reference);
    }
  }

  /**
   * Resolve contextual references like "that", "this", "it"
   */
  private async resolveContextualReference(
    reference: string,
    userId?: number
  ): Promise<ElementSelectorResult | null> {
    const lowerRef = reference.toLowerCase().trim();
    
    // Check for contextual keywords
    const contextualKeywords = ['that', 'this', 'it', 'the same', 'previous'];
    const isContextual = contextualKeywords.some(keyword => lowerRef.includes(keyword));
    
    if (!isContextual || !userId) {
      return null;
    }

    // Get last selected element from conversation context
    const lastElement = conversationContext.getLastSelectedElement(userId);
    
    if (lastElement) {
      console.log('[ElementSelector] Resolved contextual reference:', {
        reference,
        resolvedTo: lastElement
      });

      return {
        selector: lastElement,
        confidence: 0.9,
        explanation: 'Resolved from conversation context',
        alternatives: []
      };
    }

    return null;
  }

  /**
   * Fallback parsing using simple pattern matching
   */
  private fallbackParse(reference: string): ElementSelectorResult {
    const lowerRef = reference.toLowerCase();
    
    // Common element mappings
    const mappings: Record<string, string> = {
      'button': 'button',
      'input': 'input',
      'link': 'a',
      'header': 'header',
      'footer': 'footer',
      'nav': 'nav',
      'navigation': 'nav',
      'sidebar': 'aside',
      'main': 'main',
      'form': 'form',
      'table': 'table',
      'list': 'ul',
      'image': 'img',
      'video': 'video',
      'paragraph': 'p',
      'heading': 'h1, h2, h3',
      'card': '.card',
      'modal': '.modal',
      'dialog': 'dialog'
    };

    // Find matching element type
    for (const [keyword, selector] of Object.entries(mappings)) {
      if (lowerRef.includes(keyword)) {
        // Try to create data-testid selector
        if (['button', 'input', 'link'].includes(keyword)) {
          // Extract action/purpose from reference
          const action = lowerRef
            .replace(keyword, '')
            .trim()
            .replace(/\s+/g, '-');
          
          if (action) {
            const testidSelector = keyword === 'link' 
              ? `a[data-testid="link-${action}"]`
              : keyword === 'input'
              ? `input[data-testid="input-${action}"]`
              : `button[data-testid="button-${action}"]`;
            
            return {
              selector: testidSelector,
              confidence: 0.6,
              explanation: 'Fallback: Generated testid selector',
              alternatives: [selector]
            };
          }
        }

        return {
          selector,
          confidence: 0.5,
          explanation: 'Fallback: Simple keyword matching',
          alternatives: []
        };
      }
    }

    // Default fallback
    return {
      selector: '*',
      confidence: 0.3,
      explanation: 'Fallback: Could not determine specific element',
      alternatives: []
    };
  }

  /**
   * Validate if a selector is safe to use
   */
  validateSelector(selector: string): boolean {
    try {
      // Try to parse selector (browser-safe check)
      // This is a basic check - in real browser, we'd use document.querySelector
      
      // Disallow dangerous selectors
      const dangerous = ['*', 'html', 'body'];
      if (dangerous.includes(selector.toLowerCase())) {
        return false;
      }

      // Basic syntax check
      if (selector.length === 0 || selector.length > 200) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get multiple selector options for an element reference
   */
  async getSelectorOptions(
    reference: string,
    userId?: number
  ): Promise<string[]> {
    const result = await this.parseElementReference(reference, userId);
    
    const options = [result.selector];
    
    if (result.alternatives) {
      options.push(...result.alternatives);
    }

    // Filter valid selectors
    return options.filter(selector => this.validateSelector(selector));
  }
}

// Singleton instance
export const elementSelector = new ElementSelectorService();

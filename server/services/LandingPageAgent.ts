/**
 * LandingPageAgent - Specialized agent for LandingPage.tsx
 * 
 * MB.MD Level 3: This agent knows every element on the landing page
 * and can respond instantly to queries about buttons, sections, CTAs, etc.
 */

import fs from "node:fs/promises";
import * as path from 'path';
import { BasePageAgent, ElementLocation } from './BasePageAgent';

export class LandingPageAgent extends BasePageAgent {
  constructor() {
    super(
      'landing-page',
      'Landing Page Agent',
      ['client/src/pages/LandingPage.tsx']
    );

    // Initialize knowledge of key elements on landing page
    this.initializeKnowledge();
  }

  /**
   * Initialize knowledge of landing page elements
   */
  private async initializeKnowledge() {
    // Cache knowledge of key elements for instant <5ms responses
    // This knowledge is built by scanning the file once on startup
    try {
      const filePath = path.join(this.projectRoot, 'client/src/pages/LandingPage.tsx');
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      // Find and cache "Join Free" button
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Look for Join Free button
        if (line.includes('Join Free') || line.includes('Get Started Free')) {
          const element = this.extractElementInfo(lines, i, 'client/src/pages/LandingPage.tsx');
          if (element) {
            this.elementKnowledge.set('join-free-button', element);
            this.elementKnowledge.set('get-started-button', element);
          }
        }

        // Look for Watch Demo button
        if (line.includes('Watch Demo')) {
          const element = this.extractElementInfo(lines, i, 'client/src/pages/LandingPage.tsx');
          if (element) {
            this.elementKnowledge.set('watch-demo-button', element);
          }
        }

        // Look for other key elements
        if (line.includes('Where Tango Lives')) {
          const element = this.extractElementInfo(lines, i, 'client/src/pages/LandingPage.tsx');
          if (element) {
            this.elementKnowledge.set('hero-headline', element);
          }
        }
      }

      console.log(`[Landing Page Agent] ✅ Initialized with ${this.elementKnowledge.size} cached elements`);
    } catch (error) {
      console.error('[Landing Page Agent] Failed to initialize knowledge:', error);
    }
  }

  /**
   * Check if this agent can handle the query
   */
  async canHandle(query: string): Promise<{
    canHandle: boolean;
    confidence: number;
    element: ElementLocation | null;
    reason: string;
  }> {
    const lower = query.toLowerCase();

    // High confidence matches for known elements
    if (lower.includes('join free') || lower.includes('get started')) {
      const element = this.elementKnowledge.get('join-free-button');
      if (element) {
        return {
          canHandle: true,
          confidence: 0.95,
          element,
          reason: 'Landing Page Agent owns "Join Free" button'
        };
      }
    }

    if (lower.includes('watch demo')) {
      const element = this.elementKnowledge.get('watch-demo-button');
      if (element) {
        return {
          canHandle: true,
          confidence: 0.95,
          element,
          reason: 'Landing Page Agent owns "Watch Demo" button'
        };
      }
    }

    if (lower.includes('hero') || lower.includes('where tango lives')) {
      const element = this.elementKnowledge.get('hero-headline');
      if (element) {
        return {
          canHandle: true,
          confidence: 0.90,
          element,
          reason: 'Landing Page Agent owns hero section'
        };
      }
    }

    // Medium confidence: query mentions "landing page"
    if (lower.includes('landing') && lower.includes('page')) {
      return {
        canHandle: true,
        confidence: 0.70,
        element: null,
        reason: 'Query mentions landing page, will search my domain'
      };
    }

    // Low confidence: no specific match, but will try to help
    const element = await this.findElement(query);
    if (element) {
      return {
        canHandle: true,
        confidence: 0.60,
        element,
        reason: 'Found matching element in my domain'
      };
    }

    return {
      canHandle: false,
      confidence: 0,
      element: null,
      reason: 'No matching elements in landing page'
    };
  }

  /**
   * Find element in landing page
   */
  async findElement(query: string): Promise<ElementLocation | null> {
    console.log(`[Landing Page Agent] 🔍 Searching for: "${query}"`);

    // First, check cached knowledge
    const parsed = this.parseQuery(query);
    
    // Try exact matches in cache
    const cacheKey = `${parsed.textPattern.toLowerCase().replace(/\s+/g, '-')}-${parsed.elementType}`;
    const cached = this.elementKnowledge.get(cacheKey);
    if (cached) {
      console.log(`[Landing Page Agent] ✅ Found in cache: ${cacheKey}`);
      return cached;
    }

    // Search all cached elements for fuzzy match
    for (const [key, element] of this.elementKnowledge) {
      if (element.textContent.toLowerCase().includes(parsed.textPattern.toLowerCase())) {
        console.log(`[Landing Page Agent] ✅ Found fuzzy match in cache: ${key}`);
        return element;
      }
    }

    // Not in cache, search file directly
    try {
      const filePath = path.join(this.projectRoot, 'client/src/pages/LandingPage.tsx');
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      // Search for text pattern
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (line.includes(parsed.textPattern.toLowerCase())) {
          const element = this.extractElementInfo(lines, i, 'client/src/pages/LandingPage.tsx');
          if (element) {
            // Cache for next time
            this.elementKnowledge.set(cacheKey, element);
            console.log(`[Landing Page Agent] ✅ Found and cached: ${cacheKey}`);
            return element;
          }
        }
      }

      console.log(`[Landing Page Agent] ❌ No match found for "${query}"`);
      return null;
    } catch (error) {
      console.error('[Landing Page Agent] Error searching file:', error);
      return null;
    }
  }
}

/**
 * Design Suggestions Service
 * Uses GPT-4o to analyze page structure and generate improvement suggestions
 * 
 * Features:
 * - Accessibility recommendations
 * - UX improvements
 * - MT Ocean theme compliance
 * - Responsive design suggestions
 * - Component replacement recommendations
 * 
 * Phase 5: AI-Powered Smart Context System
 */

import { OpenAIService } from '../ai/OpenAIService';
import type { PageAnalysis } from './pageAnalyzer';

// ==================== TYPES & INTERFACES ====================

/**
 * Design suggestion
 */
export interface DesignSuggestion {
  id: string;
  type: 'accessibility' | 'ux' | 'theme' | 'responsive' | 'component';
  severity: 'critical' | 'warning' | 'suggestion' | 'info';
  message: string;
  fix: string; // What to do to fix it
  selector?: string; // Element affected
  before?: string; // Current state
  after?: string; // Recommended state
  automated: boolean; // Can Mr. Blue auto-fix this?
}

/**
 * Suggestions report
 */
export interface SuggestionsReport {
  suggestions: DesignSuggestion[];
  summary: {
    total: number;
    critical: number;
    warnings: number;
    suggestions: number;
    automated: number;
  };
  pageScore: number; // 0-100 overall quality score
  generatedAt: number;
}

// ==================== MT OCEAN THEME CONSTANTS ====================

const MT_OCEAN_THEME = {
  primary: 'hsl(220, 13%, 15%)', // Deep Charcoal
  secondary: 'hsl(25, 50%, 45%)', // Terra Cotta
  accent: 'hsl(180, 25%, 50%)', // Teal
  gold: 'hsl(40, 60%, 55%)', // Warm Gold
  plum: 'hsl(280, 30%, 40%)', // Deep Plum
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '2rem'
  },
  borderRadius: {
    small: '0.375rem',
    medium: '0.5rem',
    large: '0.75rem'
  }
};

// ==================== DESIGN SUGGESTIONS SERVICE ====================

export class DesignSuggestionsService {
  private readonly MODEL = 'gpt-4o-mini'; // Fast & cheap for suggestions

  constructor() {
    console.log('[DesignSuggestions] Initialized with GPT-4o-mini');
  }

  /**
   * Generate design suggestions from page analysis
   */
  async generateSuggestions(analysis: PageAnalysis): Promise<SuggestionsReport> {
    console.log('[DesignSuggestions] Generating suggestions for:', analysis.url);

    const startTime = Date.now();

    try {
      // Build comprehensive prompt
      const prompt = this.buildAnalysisPrompt(analysis);

      // Query GPT-4o
      const response = await OpenAIService.query({
        prompt,
        model: this.MODEL,
        systemPrompt: this.buildSystemPrompt(),
        temperature: 0.3, // Low for consistent suggestions
        maxTokens: 1500
      });

      // Parse AI response
      const suggestions = this.parseAISuggestions(response.content, analysis);

      // Add accessibility-based suggestions
      const accessibilitySuggestions = this.generateAccessibilitySuggestions(analysis);
      suggestions.push(...accessibilitySuggestions);

      // Add component replacement suggestions
      const componentSuggestions = this.generateComponentSuggestions(analysis);
      suggestions.push(...componentSuggestions);

      // Calculate summary
      const summary = {
        total: suggestions.length,
        critical: suggestions.filter(s => s.severity === 'critical').length,
        warnings: suggestions.filter(s => s.severity === 'warning').length,
        suggestions: suggestions.filter(s => s.severity === 'suggestion').length,
        automated: suggestions.filter(s => s.automated).length
      };

      // Calculate page score
      const pageScore = this.calculatePageScore(analysis, suggestions);

      const generationTime = Date.now() - startTime;
      console.log(`[DesignSuggestions] Generated ${suggestions.length} suggestions in ${generationTime}ms (score: ${pageScore}/100)`);

      return {
        suggestions,
        summary,
        pageScore,
        generatedAt: Date.now()
      };
    } catch (error: any) {
      console.error('[DesignSuggestions] Error generating suggestions:', error.message);

      // Fallback: Return basic suggestions from analysis
      const fallbackSuggestions = this.generateFallbackSuggestions(analysis);

      return {
        suggestions: fallbackSuggestions,
        summary: {
          total: fallbackSuggestions.length,
          critical: fallbackSuggestions.filter(s => s.severity === 'critical').length,
          warnings: fallbackSuggestions.filter(s => s.severity === 'warning').length,
          suggestions: fallbackSuggestions.filter(s => s.severity === 'suggestion').length,
          automated: fallbackSuggestions.filter(s => s.automated).length
        },
        pageScore: analysis.accessibility.score,
        generatedAt: Date.now()
      };
    }
  }

  /**
   * Build system prompt for GPT-4o
   */
  private buildSystemPrompt(): string {
    return `You are a senior UX/UI designer and accessibility expert analyzing web pages.

Your job: Review the page structure and provide actionable improvement suggestions.

**Focus Areas:**
1. **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen readers
2. **UX**: Information hierarchy, visual clarity, user flow, interaction patterns
3. **MT Ocean Theme**: Adherence to Deep Charcoal + Terra Cotta + Teal color palette
4. **Responsive Design**: Mobile-first approach, breakpoint optimization
5. **Component Usage**: Prefer shadcn/ui components over custom styling

**MT Ocean Theme Colors:**
- Primary: Deep Charcoal (hsl(220, 13%, 15%))
- Secondary: Terra Cotta (hsl(25, 50%, 45%))
- Accent: Teal (hsl(180, 25%, 50%))
- Gold: Warm Gold (hsl(40, 60%, 55%))
- Plum: Deep Plum (hsl(280, 30%, 40%))

**Output Format (JSON only):**
{
  "suggestions": [
    {
      "type": "accessibility|ux|theme|responsive|component",
      "severity": "critical|warning|suggestion|info",
      "message": "Brief description of issue",
      "fix": "Specific actionable fix",
      "selector": "CSS selector (if applicable)",
      "automated": true/false
    }
  ]
}

**Rules:**
- Be specific and actionable
- Prioritize high-impact improvements
- Focus on user experience
- Suggest shadcn components when appropriate
- Keep suggestions concise (<100 chars per message)`;
  }

  /**
   * Build analysis prompt from page data
   */
  private buildAnalysisPrompt(analysis: PageAnalysis): string {
    const prompt = `Analyze this web page and provide improvement suggestions:

**Page URL:** ${analysis.url}

**Structure:**
- Total Elements: ${analysis.stats.totalElements}
- Shadcn Components: ${analysis.shadcnComponents.join(', ') || 'None'}
- UI Patterns: ${analysis.patterns.map(p => p.type).join(', ') || 'None'}
- Interactive Elements: ${analysis.stats.interactiveElements}
- Form Elements: ${analysis.stats.formElements}

**Accessibility Score:** ${analysis.accessibility.score}/100
${analysis.accessibility.failedChecks.length > 0 ? `\n**Failed Checks:**\n${analysis.accessibility.failedChecks.map(c => `- ${c}`).join('\n')}` : ''}

**Current Issues:**
${analysis.accessibility.issues.slice(0, 5).map(issue => `- [${issue.severity}] ${issue.message}`).join('\n')}

**Component Usage:**
- Using ${analysis.shadcnComponents.length} shadcn components
- ${analysis.customElements.length} custom elements detected

Provide 5-10 most impactful suggestions to improve this page. Focus on:
1. Fixing critical accessibility issues
2. Improving UX and visual hierarchy
3. MT Ocean theme compliance
4. Recommending shadcn components`;

    return prompt;
  }

  /**
   * Parse AI response into structured suggestions
   */
  private parseAISuggestions(content: string, analysis: PageAnalysis): DesignSuggestion[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('[DesignSuggestions] No JSON found in AI response');
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        console.warn('[DesignSuggestions] Invalid suggestions array');
        return [];
      }

      // Transform to typed suggestions
      return parsed.suggestions.map((s: any, index: number) => ({
        id: `ai-${index + 1}`,
        type: s.type || 'ux',
        severity: s.severity || 'suggestion',
        message: s.message || 'Untitled suggestion',
        fix: s.fix || 'No fix provided',
        selector: s.selector,
        automated: s.automated || false
      }));
    } catch (error: any) {
      console.error('[DesignSuggestions] Parse error:', error.message);
      return [];
    }
  }

  /**
   * Generate suggestions from accessibility report
   */
  private generateAccessibilitySuggestions(analysis: PageAnalysis): DesignSuggestion[] {
    return analysis.accessibility.issues.slice(0, 5).map((issue, index) => ({
      id: `a11y-${index + 1}`,
      type: 'accessibility',
      severity: issue.severity === 'critical' ? 'critical' : issue.severity === 'warning' ? 'warning' : 'suggestion',
      message: issue.message,
      fix: issue.suggestion,
      selector: issue.selector,
      automated: issue.type === 'missing-alt' || issue.type === 'no-labels'
    }));
  }

  /**
   * Generate component replacement suggestions
   */
  private generateComponentSuggestions(analysis: PageAnalysis): DesignSuggestion[] {
    const suggestions: DesignSuggestion[] = [];

    // Suggest Button component if custom buttons detected
    if (analysis.customElements.some(el => el.includes('button') || el.includes('btn'))) {
      suggestions.push({
        id: 'comp-button',
        type: 'component',
        severity: 'suggestion',
        message: 'Custom buttons detected',
        fix: 'Replace with shadcn <Button> component for consistency',
        automated: false
      });
    }

    // Suggest Card component if card-like elements detected
    const hasCardPattern = analysis.patterns.some(p => p.type === 'card-grid');
    const hasShadcnCard = analysis.shadcnComponents.includes('Card');

    if (hasCardPattern && !hasShadcnCard) {
      suggestions.push({
        id: 'comp-card',
        type: 'component',
        severity: 'suggestion',
        message: 'Card-like elements detected without shadcn Card',
        fix: 'Use <Card> component for better consistency and theme integration',
        automated: false
      });
    }

    // Suggest Badge for status indicators
    if (analysis.stats.totalElements > 20 && !analysis.shadcnComponents.includes('Badge')) {
      suggestions.push({
        id: 'comp-badge',
        type: 'component',
        severity: 'info',
        message: 'Consider using Badge component for status indicators',
        fix: 'Add <Badge> components for tags, statuses, or labels',
        automated: false
      });
    }

    return suggestions;
  }

  /**
   * Generate fallback suggestions (no AI)
   */
  private generateFallbackSuggestions(analysis: PageAnalysis): DesignSuggestion[] {
    const suggestions: DesignSuggestion[] = [];

    // Accessibility fallback
    if (analysis.accessibility.score < 80) {
      suggestions.push({
        id: 'fallback-a11y',
        type: 'accessibility',
        severity: 'warning',
        message: `Accessibility score is ${analysis.accessibility.score}/100`,
        fix: 'Review and fix accessibility issues listed in the report',
        automated: false
      });
    }

    // Shadcn usage fallback
    if (analysis.shadcnComponents.length < 3) {
      suggestions.push({
        id: 'fallback-shadcn',
        type: 'component',
        severity: 'suggestion',
        message: 'Low shadcn component usage detected',
        fix: 'Consider using more shadcn components for consistency',
        automated: false
      });
    }

    // Pattern detection fallback
    if (analysis.patterns.length < 2) {
      suggestions.push({
        id: 'fallback-patterns',
        type: 'ux',
        severity: 'info',
        message: 'Few UI patterns detected',
        fix: 'Add more structured sections (hero, nav, cards, footer)',
        automated: false
      });
    }

    return suggestions;
  }

  /**
   * Calculate overall page quality score
   */
  private calculatePageScore(analysis: PageAnalysis, suggestions: DesignSuggestion[]): number {
    let score = 100;

    // Deduct for accessibility (already factored in analysis.accessibility.score)
    score = analysis.accessibility.score;

    // Deduct for critical suggestions
    const criticalCount = suggestions.filter(s => s.severity === 'critical').length;
    score -= criticalCount * 10;

    // Deduct for warnings
    const warningCount = suggestions.filter(s => s.severity === 'warning').length;
    score -= warningCount * 5;

    // Bonus for shadcn usage
    const shadcnBonus = Math.min(10, analysis.shadcnComponents.length * 2);
    score += shadcnBonus;

    // Bonus for UI patterns
    const patternBonus = Math.min(10, analysis.patterns.length * 2);
    score += patternBonus;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

// Singleton instance
export const designSuggestions = new DesignSuggestionsService();

/**
 * Style Generator Service
 * Detects style-only requests and converts natural language to CSS using GPT-4o
 * 
 * Features:
 * - Detect if request is style-only vs structural change
 * - Natural language → CSS conversion
 * - Fast path for instant CSS changes (<500ms)
 * - Smart CSS property inference
 * - Support for compound properties (margin, padding, etc.)
 * 
 * Examples:
 * - "make it blue" → { color: 'blue' }
 * - "bigger font" → { fontSize: '1.5rem' }
 * - "center that" → { textAlign: 'center', margin: '0 auto' }
 * 
 * Phase 2: Backend Intelligence for Smart Style Generation
 */

import { OpenAIService } from '../ai/OpenAIService';

// ==================== TYPES & INTERFACES ====================

/**
 * Style generation result
 */
export interface StyleResult {
  type: 'style';
  selector: string;
  css: Record<string, string | number>;
  confidence: number; // 0-1 score
  explanation: string;
}

/**
 * Detection result for style-only requests
 */
export interface StyleDetectionResult {
  isStyleOnly: boolean;
  confidence: number;
  reason: string;
}

// ==================== STYLE GENERATOR SERVICE ====================

export class StyleGeneratorService {
  private readonly DETECTION_MODEL = 'gpt-4o-mini'; // Fast & cheap for detection
  private readonly GENERATION_MODEL = 'gpt-4o-mini'; // Fast CSS generation
  
  constructor() {
    console.log('[StyleGenerator] Initialized with GPT-4o-mini');
  }

  /**
   * Detect if a prompt is requesting only style changes
   */
  async detectStyleOnly(prompt: string): Promise<StyleDetectionResult> {
    const systemPrompt = `You are a CSS intent detector. Determine if the user's request is ONLY about styling/appearance changes vs structural/functional changes.

STYLE-ONLY requests (return true):
- Color changes: "make it blue", "change text color to red"
- Size changes: "bigger font", "smaller button", "increase padding"
- Spacing: "add more margin", "reduce gap"
- Alignment: "center that", "align left"
- Typography: "bold text", "italic", "different font"
- Visual effects: "add shadow", "round corners", "make it transparent"
- Borders: "add border", "thicker outline"

NOT style-only (return false):
- Adding/removing elements: "add a button", "remove the header"
- Changing text content: "change the title to X"
- Functionality: "make it clickable", "add validation"
- Layout structure: "move it to the sidebar", "create a new section"
- Data changes: "show more posts", "filter by date"

Respond with JSON only:
{
  "isStyleOnly": boolean,
  "confidence": number (0-1),
  "reason": string
}`;

    try {
      const response = await OpenAIService.query({
        prompt,
        model: this.DETECTION_MODEL,
        systemPrompt,
        temperature: 0.1, // Low for consistent classification
        maxTokens: 150
      });

      // Parse JSON response
      const result = JSON.parse(response.content);

      console.log('[StyleGenerator] Detection result:', {
        prompt: prompt.substring(0, 50),
        isStyleOnly: result.isStyleOnly,
        confidence: result.confidence
      });

      return {
        isStyleOnly: result.isStyleOnly || false,
        confidence: result.confidence || 0.5,
        reason: result.reason || 'Unknown'
      };
    } catch (error: any) {
      console.error('[StyleGenerator] Detection error:', error.message);
      
      // Fallback: simple keyword detection
      return this.fallbackDetection(prompt);
    }
  }

  /**
   * Fallback style detection using keywords
   */
  private fallbackDetection(prompt: string): StyleDetectionResult {
    const lowerPrompt = prompt.toLowerCase();
    
    // Style keywords
    const styleKeywords = [
      'color', 'blue', 'red', 'green', 'bigger', 'smaller', 'size',
      'font', 'bold', 'italic', 'center', 'align', 'margin', 'padding',
      'border', 'shadow', 'round', 'transparent', 'opacity', 'background'
    ];

    // Structural keywords (negative indicators)
    const structuralKeywords = [
      'add', 'remove', 'delete', 'create', 'new', 'button', 'input',
      'form', 'section', 'component', 'page', 'route', 'api', 'function'
    ];

    const hasStyleKeyword = styleKeywords.some(keyword => lowerPrompt.includes(keyword));
    const hasStructuralKeyword = structuralKeywords.some(keyword => lowerPrompt.includes(keyword));

    const isStyleOnly = hasStyleKeyword && !hasStructuralKeyword;
    const confidence = isStyleOnly ? 0.6 : 0.4;

    return {
      isStyleOnly,
      confidence,
      reason: isStyleOnly 
        ? 'Detected style keywords without structural changes'
        : 'Detected structural change keywords or no clear style intent'
    };
  }

  /**
   * Generate CSS from natural language
   */
  async generateStyle(
    prompt: string,
    selectedElement?: string
  ): Promise<StyleResult | null> {
    const systemPrompt = `You are a CSS generator. Convert natural language styling requests into CSS properties.

RULES:
- Only return CSS for style/appearance changes
- Return null if request involves structural changes
- Use standard CSS property names (camelCase for JSON)
- Provide reasonable default values
- Consider responsive design (use rem/em over px when appropriate)

EXAMPLES:

Input: "make it blue"
Output: { "color": "blue" }

Input: "bigger font"
Output: { "fontSize": "1.5rem" }

Input: "center that"
Output: { "textAlign": "center", "margin": "0 auto" }

Input: "add padding"
Output: { "padding": "1rem" }

Input: "rounded corners"
Output: { "borderRadius": "0.5rem" }

Input: "shadow"
Output: { "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.1)" }

Input: "bold and larger"
Output: { "fontWeight": "bold", "fontSize": "1.25rem" }

${selectedElement ? `\nCurrent element: ${selectedElement}` : ''}

Respond with JSON only:
{
  "css": { ... CSS properties ... },
  "explanation": "Brief explanation of changes",
  "confidence": number (0-1)
}

If not a style request, respond: { "css": null, "explanation": "Not a style change", "confidence": 0 }`;

    try {
      const response = await OpenAIService.query({
        prompt,
        model: this.GENERATION_MODEL,
        systemPrompt,
        temperature: 0.2, // Low for consistent CSS
        maxTokens: 300
      });

      // Parse JSON response
      const result = JSON.parse(response.content);

      if (!result.css) {
        console.log('[StyleGenerator] Not a style request:', prompt);
        return null;
      }

      console.log('[StyleGenerator] Generated CSS:', {
        prompt: prompt.substring(0, 50),
        css: result.css,
        confidence: result.confidence
      });

      return {
        type: 'style',
        selector: selectedElement || '*', // Default to universal if no element
        css: result.css,
        confidence: result.confidence || 0.8,
        explanation: result.explanation || 'CSS generated from natural language'
      };
    } catch (error: any) {
      console.error('[StyleGenerator] Generation error:', error.message);
      
      // Try fallback simple generation
      return this.fallbackGeneration(prompt, selectedElement);
    }
  }

  /**
   * Fallback CSS generation using simple pattern matching
   */
  private fallbackGeneration(prompt: string, selectedElement?: string): StyleResult | null {
    const lowerPrompt = prompt.toLowerCase();
    const css: Record<string, string> = {};

    // Simple pattern matching
    if (lowerPrompt.includes('blue')) css.color = 'blue';
    if (lowerPrompt.includes('red')) css.color = 'red';
    if (lowerPrompt.includes('green')) css.color = 'green';
    
    if (lowerPrompt.includes('bigger') || lowerPrompt.includes('larger')) {
      css.fontSize = '1.5rem';
    }
    if (lowerPrompt.includes('smaller')) {
      css.fontSize = '0.875rem';
    }
    
    if (lowerPrompt.includes('center')) {
      css.textAlign = 'center';
      css.margin = '0 auto';
    }
    
    if (lowerPrompt.includes('bold')) css.fontWeight = 'bold';
    if (lowerPrompt.includes('italic')) css.fontStyle = 'italic';
    
    if (lowerPrompt.includes('padding')) css.padding = '1rem';
    if (lowerPrompt.includes('margin')) css.margin = '1rem';
    
    if (lowerPrompt.includes('shadow')) {
      css.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
    
    if (lowerPrompt.includes('round') || lowerPrompt.includes('corner')) {
      css.borderRadius = '0.5rem';
    }

    if (Object.keys(css).length === 0) {
      return null;
    }

    return {
      type: 'style',
      selector: selectedElement || '*',
      css,
      confidence: 0.5,
      explanation: 'Fallback CSS generation (limited capabilities)'
    };
  }

  /**
   * Quick style generation (combines detection + generation)
   */
  async quickStyle(
    prompt: string,
    selectedElement?: string
  ): Promise<StyleResult | null> {
    console.log('[StyleGenerator] Quick style request:', prompt);
    
    // Detect if style-only
    const detection = await this.detectStyleOnly(prompt);
    
    if (!detection.isStyleOnly) {
      console.log('[StyleGenerator] Not a style-only request');
      return null;
    }

    // Generate CSS
    return this.generateStyle(prompt, selectedElement);
  }
}

// Singleton instance
export const styleGenerator = new StyleGeneratorService();

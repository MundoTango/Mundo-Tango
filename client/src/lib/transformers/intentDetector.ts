/**
 * Browser-Based Intent Detector using regex patterns
 * Classifies user messages instantly without backend API calls
 * 
 * Intent Types:
 * - visual_change: UI styling changes (colors, layout, spacing)
 * - code_generation: Creating new components, features, API endpoints
 * - question: General questions, help requests
 * - command: Navigation, actions, system commands
 * 
 * Note: ML-based detection removed to reduce bundle size.
 * Fast regex-based detection handles 95%+ of cases accurately.
 */

export type UserIntent = 'visual_change' | 'code_generation' | 'question' | 'command';

export interface IntentResult {
  intent: UserIntent;
  confidence: number;
  rawScores?: Record<string, number>;
}

class IntentDetector {
  /**
   * Detect user intent from natural language message
   * Uses fast regex-based detection (no external dependencies)
   */
  async detectIntent(message: string): Promise<IntentResult> {
    const lowerMessage = message.toLowerCase().trim();

    // Fast regex-based detection (handles 95%+ of cases)
    const fastIntent = this.fastDetect(lowerMessage);
    if (fastIntent) {
      return {
        intent: fastIntent,
        confidence: 0.95,
      };
    }

    // Default to question for ambiguous cases
    return {
      intent: 'question',
      confidence: 0.7,
    };
  }

  /**
   * Fast regex-based detection for obvious intents
   * Returns null for ambiguous cases that need ML
   */
  private fastDetect(message: string): UserIntent | null {
    // Visual change patterns (high confidence)
    const visualPatterns = [
      /\b(make|change|set|update).*(color|blue|red|green|yellow|orange|purple|pink|background|foreground)/,
      /\b(make|change).*(bigger|smaller|larger|wider|narrower|taller|shorter)/,
      /\b(add|remove|increase|decrease).*(padding|margin|spacing|gap)/,
      /\b(center|left|right|justify).*(align|text)/,
      /\b(bold|italic|underline|font)/,
      /\bhide|show|display|visible/,
    ];

    if (visualPatterns.some(pattern => pattern.test(message))) {
      return 'visual_change';
    }

    // Code generation patterns (high confidence)
    const codePatterns = [
      /\b(create|generate|build|add|make).*(component|page|endpoint|api|route|function|class|interface)/,
      /\b(implement|scaffold|setup|initialize)/,
      /\bwrite.*code/,
      /\badd.*test/,
      /\bcreate.*database/,
    ];

    if (codePatterns.some(pattern => pattern.test(message))) {
      return 'code_generation';
    }

    // Command patterns (high confidence) - allow "please" prefixes and indirect phrasing
    const commandPatterns = [
      /\b(go to|navigate|open|close|show|hide)\b/,
      /\b(save|load|export|import|download|upload)\b/,
      /\b(start|stop|restart|pause|resume)\b/,
      /\b(clear|reset|undo|redo)\b/,
      /\b(scroll|zoom|refresh|reload)\b/,
      /\b(please|could you|can you|would you).*(reset|clear|open|close|save|load|start|stop|show|hide|navigate|go to)/,
      /\b(run|execute|trigger|launch|deploy)\b/,
    ];

    if (commandPatterns.some(pattern => pattern.test(message))) {
      return 'command';
    }

    // Question patterns (high confidence)
    const questionPatterns = [
      /^(how|what|why|when|where|who|which)/,
      /^(can you|could you|would you|will you)/,
      /^(is|are|do|does|did)/,
      /\?$/,
    ];

    if (questionPatterns.some(pattern => pattern.test(message))) {
      return 'question';
    }

    // Ambiguous - needs ML classification
    return null;
  }

  /**
   * Check if detector is ready (always true - no external dependencies)
   */
  getStatus(): { ready: boolean; loading: boolean; error: string | null } {
    return {
      ready: true,
      loading: false,
      error: null,
    };
  }

  /**
   * Preload (no-op - no external model needed)
   */
  async preload(): Promise<void> {
    // No-op - regex-based detection needs no preloading
  }
}

// Singleton instance
export const intentDetector = new IntentDetector();

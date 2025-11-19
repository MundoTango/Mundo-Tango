/**
 * Browser-Based Intent Detector using Transformers.js
 * Classifies user messages instantly without backend API calls
 * 
 * Intent Types:
 * - visual_change: UI styling changes (colors, layout, spacing)
 * - code_generation: Creating new components, features, API endpoints
 * - question: General questions, help requests
 * - command: Navigation, actions, system commands
 */

import { pipeline, type PipelineType } from '@xenova/transformers';

export type UserIntent = 'visual_change' | 'code_generation' | 'question' | 'command';

export interface IntentResult {
  intent: UserIntent;
  confidence: number;
  rawScores?: Record<string, number>;
}

interface ClassificationResult {
  label: string;
  score: number;
}

class TransformersIntentDetector {
  private classifier: any = null;
  private isLoading = false;
  private loadError: Error | null = null;

  /**
   * Lazy-load the text classification model
   * Model is cached in browser after first download
   */
  private async ensureModel() {
    if (this.classifier) return this.classifier;
    if (this.isLoading) {
      // Wait for ongoing load
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.classifier;
    }

    this.isLoading = true;
    try {
      console.log('[IntentDetector] Loading Transformers.js model...');
      
      // Use zero-shot classification for intent detection
      // This model can classify text into custom categories without training
      this.classifier = await pipeline(
        'zero-shot-classification' as PipelineType,
        'Xenova/distilbert-base-uncased-mnli'
      );
      
      console.log('[IntentDetector] ✅ Model loaded and cached');
      this.loadError = null;
    } catch (error) {
      console.error('[IntentDetector] Failed to load model:', error);
      this.loadError = error as Error;
      throw error;
    } finally {
      this.isLoading = false;
    }

    return this.classifier;
  }

  /**
   * Detect user intent from natural language message
   * Fast regex-based detection with ML fallback
   */
  async detectIntent(message: string): Promise<IntentResult> {
    const lowerMessage = message.toLowerCase().trim();

    // Fast regex-based detection for obvious cases (instant)
    const fastIntent = this.fastDetect(lowerMessage);
    if (fastIntent) {
      return {
        intent: fastIntent,
        confidence: 0.95, // High confidence for regex matches
      };
    }

    // Fallback to ML model for ambiguous cases
    try {
      const model = await this.ensureModel();
      
      // Define intent labels with descriptions for better classification
      const candidateLabels = [
        'changing visual appearance or styling',
        'generating or creating new code',
        'asking a question or requesting help',
        'executing a command or navigation'
      ];

      const result = await model(message, candidateLabels);
      
      // Map results to our intent types
      const intentMap: Record<number, UserIntent> = {
        0: 'visual_change',
        1: 'code_generation',
        2: 'question',
        3: 'command'
      };

      const topIndex = result.labels.indexOf(result.labels[0]);
      const topScore = result.scores[0];

      return {
        intent: intentMap[topIndex] || 'question',
        confidence: topScore,
        rawScores: {
          visual_change: result.scores[candidateLabels.indexOf('changing visual appearance or styling')],
          code_generation: result.scores[candidateLabels.indexOf('generating or creating new code')],
          question: result.scores[candidateLabels.indexOf('asking a question or requesting help')],
          command: result.scores[candidateLabels.indexOf('executing a command or navigation')]
        }
      };
    } catch (error) {
      console.error('[IntentDetector] ML classification failed, using fallback:', error);
      // Fallback to question intent if ML fails
      return {
        intent: 'question',
        confidence: 0.5,
      };
    }
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

    // Command patterns (high confidence)
    const commandPatterns = [
      /^(go to|navigate|open|close|show|hide)/,
      /^(save|load|export|import|download|upload)/,
      /^(start|stop|restart|pause|resume)/,
      /^(clear|reset|undo|redo)/,
      /^(scroll|zoom|refresh|reload)/,
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
   * Check if model is ready or loading
   */
  getStatus(): { ready: boolean; loading: boolean; error: string | null } {
    return {
      ready: this.classifier !== null,
      loading: this.isLoading,
      error: this.loadError?.message || null,
    };
  }

  /**
   * Preload model in background (optional optimization)
   */
  async preload(): Promise<void> {
    try {
      await this.ensureModel();
    } catch (error) {
      console.warn('[IntentDetector] Preload failed:', error);
    }
  }
}

// Singleton instance
export const intentDetector = new TransformersIntentDetector();

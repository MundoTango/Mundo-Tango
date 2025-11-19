/**
 * Browser-Based Sentiment Analyzer using Transformers.js
 * Analyzes user message sentiment to adjust Mr. Blue's tone
 * 
 * Sentiment Types:
 * - positive: Happy, satisfied, encouraging messages
 * - negative: Frustrated, upset, critical messages  
 * - neutral: Informational, factual messages
 */

import { pipeline, type PipelineType } from '@xenova/transformers';

export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface SentimentResult {
  sentiment: Sentiment;
  confidence: number;
  scores: {
    positive: number;
    negative: number;
    neutral: number;
  };
  suggestedTone: string;
}

class TransformersSentimentAnalyzer {
  private classifier: any = null;
  private isLoading = false;
  private loadError: Error | null = null;

  /**
   * Lazy-load the sentiment analysis model
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
      console.log('[SentimentAnalyzer] Loading Transformers.js model...');
      
      // Use DistilBERT fine-tuned for sentiment analysis
      // Fast, accurate, and browser-friendly
      this.classifier = await pipeline(
        'sentiment-analysis' as PipelineType,
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
      
      console.log('[SentimentAnalyzer] ✅ Model loaded and cached');
      this.loadError = null;
    } catch (error) {
      console.error('[SentimentAnalyzer] Failed to load model:', error);
      this.loadError = error as Error;
      throw error;
    } finally {
      this.isLoading = false;
    }

    return this.classifier;
  }

  /**
   * Analyze sentiment of user message
   * Returns sentiment type and suggested response tone
   */
  async analyzeSentiment(message: string): Promise<SentimentResult> {
    try {
      const model = await this.ensureModel();
      
      // Run sentiment analysis
      const results = await model(message);
      const result = Array.isArray(results) ? results[0] : results;
      
      // Map model output to our sentiment types
      let sentiment: Sentiment;
      let scores = {
        positive: 0,
        negative: 0,
        neutral: 0,
      };

      if (result.label === 'POSITIVE') {
        sentiment = 'positive';
        scores.positive = result.score;
        scores.negative = 1 - result.score;
        scores.neutral = 0.5; // Estimate
      } else if (result.label === 'NEGATIVE') {
        sentiment = 'negative';
        scores.negative = result.score;
        scores.positive = 1 - result.score;
        scores.neutral = 0.5; // Estimate
      } else {
        // Fallback to neutral
        sentiment = 'neutral';
        scores.neutral = 0.8;
        scores.positive = 0.1;
        scores.negative = 0.1;
      }

      // Suggest response tone based on sentiment
      const suggestedTone = this.getSuggestedTone(sentiment, result.score);

      return {
        sentiment,
        confidence: result.score,
        scores,
        suggestedTone,
      };
    } catch (error) {
      console.error('[SentimentAnalyzer] Analysis failed:', error);
      
      // Fallback to neutral sentiment
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        scores: {
          positive: 0.33,
          negative: 0.33,
          neutral: 0.34,
        },
        suggestedTone: 'friendly and helpful',
      };
    }
  }

  /**
   * Get suggested response tone based on detected sentiment
   */
  private getSuggestedTone(sentiment: Sentiment, confidence: number): string {
    if (sentiment === 'negative' && confidence > 0.7) {
      return 'empathetic, patient, and solution-focused';
    } else if (sentiment === 'negative') {
      return 'understanding and helpful';
    } else if (sentiment === 'positive' && confidence > 0.7) {
      return 'enthusiastic and encouraging';
    } else if (sentiment === 'positive') {
      return 'friendly and supportive';
    } else {
      return 'professional and informative';
    }
  }

  /**
   * Analyze sentiment with contextual awareness
   * Considers conversation history for better tone suggestions
   */
  async analyzeWithContext(
    message: string,
    previousMessages: string[] = []
  ): Promise<SentimentResult> {
    // Analyze current message
    const currentResult = await this.analyzeSentiment(message);

    // If user has been consistently frustrated, maintain empathetic tone
    if (previousMessages.length >= 2) {
      const previousSentiments = await Promise.all(
        previousMessages.slice(-3).map(msg => this.analyzeSentiment(msg))
      );

      const negativeCount = previousSentiments.filter(
        s => s.sentiment === 'negative'
      ).length;

      if (negativeCount >= 2) {
        currentResult.suggestedTone = 'extra patient and apologetic';
      }
    }

    return currentResult;
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
      console.warn('[SentimentAnalyzer] Preload failed:', error);
    }
  }
}

// Singleton instance
export const sentimentAnalyzer = new TransformersSentimentAnalyzer();

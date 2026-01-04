/**
 * Browser-Based Sentiment Analyzer using Transformers.js
 * Analyzes user message sentiment to adjust Mr. Blue's tone
 * 
 * Sentiment Types:
 * - positive: Happy, satisfied, encouraging messages
 * - negative: Frustrated, upset, critical messages  
 * - neutral: Informational, factual messages
 */

export type Sentiment = 'positive' | 'negative' | 'neutral';

// Sentiment analysis uses lightweight heuristic detection (no ML dependencies)
// This approach was chosen to improve Developer Experience:
// - No native C++/Python compilation required for npm install
// - Works immediately on any developer machine
// - Fallback quality is sufficient for tone adjustment
const transformersUnavailable = true;

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
   * Model loading disabled - always uses heuristic detection
   * Kept for API compatibility with components that call ensureModel()
   */
  private async ensureModel() {
    return null;
  }

  /**
   * Analyze sentiment of user message
   * Returns sentiment type and suggested response tone
   */
  async analyzeSentiment(message: string): Promise<SentimentResult> {
    try {
      const model = await this.ensureModel();
      
      // If ML model not available, use heuristic detection
      if (!model) {
        return this.heuristicSentiment(message);
      }
      
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
      return this.heuristicSentiment(message);
    }
  }

  /**
   * Heuristic-based sentiment detection (fallback when ML unavailable)
   */
  private heuristicSentiment(message: string): SentimentResult {
    const lower = message.toLowerCase();
    
    // Positive indicators
    const positiveWords = ['thanks', 'great', 'awesome', 'love', 'perfect', 'excellent', 'happy', 'good', 'nice', 'wonderful'];
    const negativeWords = ['frustrated', 'angry', 'broken', 'wrong', 'bad', 'hate', 'annoying', 'terrible', 'awful', 'stuck'];
    
    const positiveCount = positiveWords.filter(w => lower.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lower.includes(w)).length;
    
    let sentiment: Sentiment = 'neutral';
    let confidence = 0.6;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = 0.7;
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = 0.7;
    }
    
    return {
      sentiment,
      confidence,
      scores: {
        positive: sentiment === 'positive' ? 0.6 : 0.2,
        negative: sentiment === 'negative' ? 0.6 : 0.2,
        neutral: sentiment === 'neutral' ? 0.6 : 0.2,
      },
      suggestedTone: this.getSuggestedTone(sentiment, confidence),
    };
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

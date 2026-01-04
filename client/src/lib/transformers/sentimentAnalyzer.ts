/**
 * Browser-Based Sentiment Analyzer using regex patterns
 * Analyzes user message sentiment to adjust Mr. Blue's tone
 * 
 * Sentiment Types:
 * - positive: Happy, satisfied, encouraging messages
 * - negative: Frustrated, upset, critical messages  
 * - neutral: Informational, factual messages
 * 
 * Note: ML-based detection removed to reduce bundle size.
 * Fast regex-based detection handles common sentiment patterns accurately.
 */

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

class SentimentAnalyzer {
  /**
   * Analyze sentiment of user message using regex patterns
   * Returns sentiment type and suggested response tone
   */
  async analyzeSentiment(message: string): Promise<SentimentResult> {
    const lowerMessage = message.toLowerCase().trim();
    
    const positiveScore = this.getPositiveScore(lowerMessage);
    const negativeScore = this.getNegativeScore(lowerMessage);
    
    let sentiment: Sentiment;
    let confidence: number;
    
    if (negativeScore > positiveScore && negativeScore > 0.3) {
      sentiment = 'negative';
      confidence = Math.min(0.95, negativeScore);
    } else if (positiveScore > negativeScore && positiveScore > 0.3) {
      sentiment = 'positive';
      confidence = Math.min(0.95, positiveScore);
    } else {
      sentiment = 'neutral';
      confidence = 0.7;
    }
    
    const scores = {
      positive: positiveScore,
      negative: negativeScore,
      neutral: 1 - Math.max(positiveScore, negativeScore),
    };
    
    const suggestedTone = this.getSuggestedTone(sentiment, confidence);
    
    return {
      sentiment,
      confidence,
      scores,
      suggestedTone,
    };
  }

  /**
   * Calculate positive sentiment score based on patterns
   */
  private getPositiveScore(message: string): number {
    const positivePatterns = [
      /\b(great|awesome|amazing|excellent|wonderful|fantastic|perfect|love|thank|thanks|appreciate|happy|glad|excited|beautiful|brilliant)\b/,
      /\b(good job|well done|nice work|looks great|works well|very helpful)\b/,
      /\b(yes|yay|woo|hurray|finally)\b/,
      /[!]{1,2}$/,
      /:\)|😊|😄|👍|❤️|🎉|✨/,
    ];
    
    let score = 0;
    for (const pattern of positivePatterns) {
      if (pattern.test(message)) {
        score += 0.25;
      }
    }
    
    return Math.min(1, score);
  }

  /**
   * Calculate negative sentiment score based on patterns
   */
  private getNegativeScore(message: string): number {
    const negativePatterns = [
      /\b(broken|error|bug|issue|problem|wrong|bad|terrible|horrible|awful|hate|frustrated|annoying|annoyed|upset|angry|stupid|useless|waste)\b/,
      /\b(doesn't work|not working|doesn't help|can't|cannot|won't|failed|failing|crash|crashed)\b/,
      /\b(why|what the|seriously|again|still|ugh|argh)\b/,
      /\b(disappointing|disappointed|clumsy|awkward|confusing|confused|difficult|hard to|struggling|stuck)\b/,
      /\b(slow|laggy|unresponsive|freezing|timeout|taking too long)\b/,
      /\b(unclear|unhelpful|incomplete|missing|lacking|weird|odd|strange)\b/,
      /\b(concern|worried|worried about|nervous|anxious|unsure)\b/,
      /\b(wish|hoped|expected|should have|could have been)\b/,
      /[!?]{2,}/,
      /😡|😤|😞|😢|👎|💔|😠/,
    ];
    
    let score = 0;
    for (const pattern of negativePatterns) {
      if (pattern.test(message)) {
        score += 0.25;
      }
    }
    
    return Math.min(1, score);
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
    const currentResult = await this.analyzeSentiment(message);

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
   * Check if analyzer is ready (always true - no external dependencies)
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
    // No-op - regex-based analysis needs no preloading
  }
}

// Singleton instance
export const sentimentAnalyzer = new SentimentAnalyzer();

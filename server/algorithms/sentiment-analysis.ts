/**
 * A26: SENTIMENT ANALYSIS ALGORITHM
 * Analyzes sentiment of text content (posts, comments, messages)
 */

interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // -1 to 1
  confidence: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    excitement: number;
  };
}

export class SentimentAnalysisAlgorithm {
  private positiveWords = new Set([
    'amazing', 'beautiful', 'wonderful', 'fantastic', 'excellent', 'great', 'love', 
    'perfect', 'incredible', 'awesome', 'brilliant', 'outstanding', 'spectacular',
    'fantastic', 'happy', 'joy', 'delighted', 'excited', 'thrilled', 'grateful',
    'thankful', 'blessed', 'lucky', 'fortunate', 'pleased', 'satisfied', 'content'
  ]);

  private negativeWords = new Set([
    'terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'disgusting',
    'disappointing', 'poor', 'sad', 'angry', 'frustrated', 'annoyed', 'upset',
    'worried', 'concerned', 'afraid', 'scared', 'anxious', 'stressed', 'unhappy',
    'miserable', 'depressed', 'lonely', 'hurt', 'painful', 'difficult'
  ]);

  private emotionKeywords = {
    joy: ['happy', 'joy', 'joyful', 'cheerful', 'delighted', 'ecstatic'],
    sadness: ['sad', 'unhappy', 'miserable', 'depressed', 'down', 'blue'],
    anger: ['angry', 'furious', 'mad', 'annoyed', 'frustrated', 'irritated'],
    fear: ['afraid', 'scared', 'fearful', 'worried', 'anxious', 'nervous'],
    excitement: ['excited', 'thrilled', 'enthusiastic', 'eager', 'pumped'],
  };

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const cleanedText = this.preprocessText(text);
    const words = cleanedText.split(/\s+/);

    const score = this.calculateSentimentScore(words);
    const emotions = this.detectEmotions(words);
    const sentiment = this.classifySentiment(score);
    const confidence = this.calculateConfidence(words.length);

    return {
      sentiment,
      score,
      confidence,
      emotions,
    };
  }

  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
  }

  private calculateSentimentScore(words: string[]): number {
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (this.positiveWords.has(word)) {
        positiveCount++;
      } else if (this.negativeWords.has(word)) {
        negativeCount++;
      }
    });

    const total = positiveCount + negativeCount;
    if (total === 0) return 0;

    // Score from -1 to 1
    return (positiveCount - negativeCount) / total;
  }

  private detectEmotions(words: string[]): SentimentResult['emotions'] {
    const emotions = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      excitement: 0,
    };

    words.forEach(word => {
      Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
        if (keywords.includes(word)) {
          emotions[emotion as keyof typeof emotions]++;
        }
      });
    });

    // Normalize to 0-1 scale
    const maxCount = Math.max(...Object.values(emotions), 1);
    Object.keys(emotions).forEach(key => {
      emotions[key as keyof typeof emotions] /= maxCount;
    });

    return emotions;
  }

  private classifySentiment(score: number): 'positive' | 'neutral' | 'negative' {
    if (score > 0.2) return 'positive';
    if (score < -0.2) return 'negative';
    return 'neutral';
  }

  private calculateConfidence(wordCount: number): number {
    // More words = higher confidence
    if (wordCount < 5) return 0.3;
    if (wordCount < 15) return 0.6;
    if (wordCount < 30) return 0.8;
    return 0.9;
  }

  async analyzeBatch(texts: string[]): Promise<SentimentResult[]> {
    return Promise.all(texts.map(text => this.analyzeSentiment(text)));
  }

  async getAverageSentiment(texts: string[]): Promise<number> {
    const results = await this.analyzeBatch(texts);
    const sum = results.reduce((acc, r) => acc + r.score, 0);
    return sum / texts.length;
  }
}

export const sentimentAnalysis = new SentimentAnalysisAlgorithm();

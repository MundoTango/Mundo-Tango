import { db } from "@shared/db";
import { productReviews, marketplaceProducts, productPurchases } from "@shared/schema";
import { eq, and, desc, sql, gte, count } from "drizzle-orm";
import { RateLimitedAIOrchestrator } from "../ai/integration/rate-limited-orchestrator";

interface SentimentAnalysis {
  score: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keyPhrases: string[];
  topics: {
    quality: number;
    value: number;
    shipping: number;
    service: number;
  };
  isFakeReview: boolean;
  fakeReviewReasons: string[];
}

interface ProductSentimentSummary {
  productId: number;
  averageSentiment: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  totalReviews: number;
  topPositives: string[];
  topNegatives: string[];
  improvementSuggestions: string[];
  trendDirection: 'improving' | 'stable' | 'declining';
}

export class ReviewAnalyzerAgent {
  private static aiOrchestrator = new RateLimitedAIOrchestrator();

  static async analyzeReview(
    reviewText: string,
    reviewId?: number
  ): Promise<SentimentAnalysis> {
    const prompt = `Analyze this product review and provide:
1. Sentiment score (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
2. Key phrases mentioned (max 5)
3. Topic scores (0-10) for: quality, value, shipping, service
4. Whether this appears to be a fake/template review

Review: "${reviewText}"

Respond in JSON format:
{
  "sentimentScore": <number>,
  "keyPhrases": [<strings>],
  "topics": {"quality": <number>, "value": <number>, "shipping": <number>, "service": <number>},
  "isFake": <boolean>,
  "fakeReasons": [<strings>]
}`;

    try {
      const response = await this.aiOrchestrator.queryWithRateLimit(
        'gemini',
        'gemini-2.5-flash-lite',
        { 
          prompt,
          systemPrompt: 'You are a review analysis expert. Provide accurate sentiment analysis and fake review detection.',
          temperature: 0.3,
          maxTokens: 500
        },
        {
          priority: 1,
          maxWaitMs: 15000,
          enableRetry: true
        }
      );

      const analysis = JSON.parse(this.extractJSON(response.content));

      const sentiment = this.determineSentiment(analysis.sentimentScore);
      const confidence = Math.abs(analysis.sentimentScore) * 100;

      return {
        score: analysis.sentimentScore,
        sentiment,
        confidence,
        keyPhrases: analysis.keyPhrases || [],
        topics: analysis.topics || { quality: 0, value: 0, shipping: 0, service: 0 },
        isFakeReview: analysis.isFake || false,
        fakeReviewReasons: analysis.fakeReasons || []
      };
    } catch (error) {
      console.error('[ReviewAnalyzer] Error analyzing review:', error);
      
      return this.fallbackAnalysis(reviewText);
    }
  }

  private static extractJSON(content: string): string {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : content;
  }

  private static determineSentiment(score: number): 'positive' | 'neutral' | 'negative' {
    if (score > 0.2) return 'positive';
    if (score < -0.2) return 'negative';
    return 'neutral';
  }

  private static fallbackAnalysis(reviewText: string): SentimentAnalysis {
    const text = reviewText.toLowerCase();
    
    const positiveWords = ['great', 'excellent', 'amazing', 'love', 'best', 'perfect', 'good', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'poor', 'disappointing'];
    
    let score = 0;
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 0.2;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 0.2;
    });
    
    score = Math.max(-1, Math.min(1, score));
    
    return {
      score,
      sentiment: this.determineSentiment(score),
      confidence: 50,
      keyPhrases: [],
      topics: { quality: 5, value: 5, shipping: 5, service: 5 },
      isFakeReview: false,
      fakeReviewReasons: []
    };
  }

  static async analyzeProductReviews(productId: number): Promise<ProductSentimentSummary> {
    const reviews = await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.productId, productId))
      .orderBy(desc(productReviews.createdAt));

    if (reviews.length === 0) {
      return {
        productId,
        averageSentiment: 0,
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
        totalReviews: 0,
        topPositives: [],
        topNegatives: [],
        improvementSuggestions: [],
        trendDirection: 'stable'
      };
    }

    const sentimentAnalyses = await Promise.all(
      reviews.slice(0, 20).map(async review => {
        if (!review.review) return null;
        return {
          ...await this.analyzeReview(review.review, review.id),
          rating: review.rating,
          createdAt: review.createdAt
        };
      })
    );

    const validAnalyses = sentimentAnalyses.filter(a => a !== null) as any[];

    const avgSentiment = validAnalyses.reduce((sum, a) => sum + a.score, 0) / validAnalyses.length;

    const distribution = {
      positive: validAnalyses.filter(a => a.sentiment === 'positive').length,
      neutral: validAnalyses.filter(a => a.sentiment === 'neutral').length,
      negative: validAnalyses.filter(a => a.sentiment === 'negative').length
    };

    const allKeyPhrases = validAnalyses.flatMap(a => a.keyPhrases);
    const phraseCounts = new Map<string, number>();
    allKeyPhrases.forEach(phrase => {
      phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
    });

    const positiveReviews = validAnalyses.filter(a => a.sentiment === 'positive');
    const negativeReviews = validAnalyses.filter(a => a.sentiment === 'negative');

    const topPositives = this.extractTopPhrases(positiveReviews, 3);
    const topNegatives = this.extractTopPhrases(negativeReviews, 3);

    const improvementSuggestions = this.generateImprovementSuggestions(
      validAnalyses,
      topNegatives
    );

    const trendDirection = this.analyzeTrend(validAnalyses);

    return {
      productId,
      averageSentiment: avgSentiment,
      sentimentDistribution: distribution,
      totalReviews: reviews.length,
      topPositives,
      topNegatives,
      improvementSuggestions,
      trendDirection
    };
  }

  private static extractTopPhrases(analyses: any[], limit: number): string[] {
    const allPhrases = analyses.flatMap(a => a.keyPhrases);
    const counts = new Map<string, number>();
    
    allPhrases.forEach(phrase => {
      counts.set(phrase, (counts.get(phrase) || 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([phrase]) => phrase);
  }

  private static generateImprovementSuggestions(
    analyses: any[],
    topNegatives: string[]
  ): string[] {
    const suggestions: string[] = [];

    const avgTopics = {
      quality: 0,
      value: 0,
      shipping: 0,
      service: 0
    };

    analyses.forEach(a => {
      avgTopics.quality += a.topics.quality;
      avgTopics.value += a.topics.value;
      avgTopics.shipping += a.topics.shipping;
      avgTopics.service += a.topics.service;
    });

    Object.keys(avgTopics).forEach(key => {
      avgTopics[key as keyof typeof avgTopics] /= analyses.length;
    });

    if (avgTopics.quality < 6) {
      suggestions.push('Consider improving product quality based on customer feedback');
    }
    if (avgTopics.value < 6) {
      suggestions.push('Customers feel the price-to-value ratio could be improved');
    }
    if (avgTopics.shipping < 6) {
      suggestions.push('Shipping experience needs improvement');
    }
    if (avgTopics.service < 6) {
      suggestions.push('Customer service could be enhanced');
    }

    topNegatives.forEach(phrase => {
      suggestions.push(`Address customer concerns about: ${phrase}`);
    });

    return suggestions.slice(0, 5);
  }

  private static analyzeTrend(analyses: any[]): 'improving' | 'stable' | 'declining' {
    if (analyses.length < 6) return 'stable';

    const sorted = analyses.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const half = Math.floor(sorted.length / 2);
    const oldHalf = sorted.slice(0, half);
    const newHalf = sorted.slice(half);

    const oldAvg = oldHalf.reduce((sum, a) => sum + a.score, 0) / oldHalf.length;
    const newAvg = newHalf.reduce((sum, a) => sum + a.score, 0) / newHalf.length;

    if (newAvg > oldAvg + 0.1) return 'improving';
    if (newAvg < oldAvg - 0.1) return 'declining';
    return 'stable';
  }

  static async detectFakeReviews(productId: number): Promise<{
    suspiciousReviews: Array<{
      reviewId: number;
      reasons: string[];
      confidence: number;
    }>;
    overallRisk: 'low' | 'medium' | 'high';
  }> {
    const reviews = await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.productId, productId));

    const suspicious: Array<{
      reviewId: number;
      reasons: string[];
      confidence: number;
    }> = [];

    for (const review of reviews) {
      if (!review.review) continue;

      const reasons: string[] = [];
      let confidence = 0;

      if (review.review.length < 20) {
        reasons.push('Very short review');
        confidence += 20;
      }

      const genericPhrases = ['great product', 'highly recommend', 'five stars', 'best ever'];
      const hasGeneric = genericPhrases.some(phrase => 
        review.review!.toLowerCase().includes(phrase)
      );
      if (hasGeneric && review.review.length < 50) {
        reasons.push('Generic template language');
        confidence += 30;
      }

      if (review.rating === 5 && review.review.length < 30) {
        reasons.push('Suspiciously short 5-star review');
        confidence += 25;
      }

      if (!review.isPurchaseVerified) {
        reasons.push('Review not from verified purchase');
        confidence += 15;
      }

      if (confidence >= 40) {
        suspicious.push({
          reviewId: review.id,
          reasons,
          confidence: Math.min(confidence, 100)
        });
      }
    }

    const riskRatio = suspicious.length / Math.max(reviews.length, 1);
    let overallRisk: 'low' | 'medium' | 'high';
    
    if (riskRatio > 0.3) overallRisk = 'high';
    else if (riskRatio > 0.15) overallRisk = 'medium';
    else overallRisk = 'low';

    return {
      suspiciousReviews: suspicious,
      overallRisk
    };
  }

  static async rankReviewHelpfulness(productId: number): Promise<Array<{
    reviewId: number;
    helpfulnessScore: number;
    shouldFeature: boolean;
  }>> {
    const reviews = await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.productId, productId));

    const ranked = reviews.map(review => {
      let score = review.helpfulCount;

      if (review.review && review.review.length > 100) {
        score += 10;
      }

      if (review.isPurchaseVerified) {
        score += 20;
      }

      const daysSinceReview = Math.floor(
        (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceReview < 30) {
        score += 5;
      }

      return {
        reviewId: review.id,
        helpfulnessScore: score,
        shouldFeature: score >= 20
      };
    });

    return ranked.sort((a, b) => b.helpfulnessScore - a.helpfulnessScore);
  }
}

import { db } from "@db";
import { posts, mrBlueKnowledgeBase } from "@shared/schema";
import { desc, gte } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SentimentAnalysis {
  sentiment: string;
  topics: string[];
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

export interface FrustrationData {
  topic: string;
  frustrationScore: number;
  mentions: number;
  examples: string[];
}

export class SocialSentimentPathway {
  /**
   * Analyze recent posts for sentiment
   */
  async analyzePosts(limit: number = 50): Promise<SentimentAnalysis> {
    try {
      const recentPosts = await db
        .select()
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(limit);

      if (recentPosts.length === 0) {
        return {
          sentiment: 'neutral',
          topics: [],
          positiveCount: 0,
          negativeCount: 0,
          neutralCount: 0,
        };
      }

      // Combine post content for analysis
      const postContents = recentPosts
        .map(p => p.content)
        .filter(Boolean)
        .join('\n\n---\n\n');

      // Use AI to analyze sentiment and extract topics
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Analyze the sentiment of these social media posts. Provide:\n1. Overall sentiment (positive/negative/neutral)\n2. Top 5 topics discussed\n3. Breakdown of sentiment counts"
          },
          {
            role: "user",
            content: postContents
          }
        ],
        temperature: 0.3,
      });

      const analysis = completion.choices[0]?.message?.content || '';

      // Parse AI response (simplified - in production you'd use structured outputs)
      const sentimentCounts = {
        positive: (analysis.match(/positive/gi) || []).length,
        negative: (analysis.match(/negative/gi) || []).length,
        neutral: (analysis.match(/neutral/gi) || []).length,
      };

      // Extract topics (simplified)
      const topicsMatch = analysis.match(/topics?:?\s*(.+)/i);
      const topics = topicsMatch 
        ? topicsMatch[1].split(/[,;]/).map(t => t.trim()).slice(0, 5)
        : [];

      const overallSentiment = sentimentCounts.positive > sentimentCounts.negative
        ? 'positive'
        : sentimentCounts.negative > sentimentCounts.positive
        ? 'negative'
        : 'neutral';

      // Store analysis in knowledge base
      await db.insert(mrBlueKnowledgeBase).values({
        category: 'sentiment',
        title: `Social Sentiment Analysis - ${new Date().toISOString().split('T')[0]}`,
        content: JSON.stringify({
          sentiment: overallSentiment,
          topics,
          counts: sentimentCounts,
          postsAnalyzed: recentPosts.length,
        }),
        tags: ['sentiment', 'social', 'automated'],
      });

      return {
        sentiment: overallSentiment,
        topics,
        positiveCount: sentimentCounts.positive,
        negativeCount: sentimentCounts.negative,
        neutralCount: sentimentCounts.neutral,
      };
    } catch (error) {
      console.error('[Social Sentiment Pathway] Error analyzing posts:', error);
      return {
        sentiment: 'neutral',
        topics: [],
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
      };
    }
  }

  /**
   * Detect frustration in posts
   */
  async detectFrustration(): Promise<FrustrationData[]> {
    try {
      const recentPosts = await db
        .select()
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(100);

      const frustrationKeywords = [
        'frustrated', 'annoying', 'broken', 'doesn\'t work', 
        'terrible', 'awful', 'hate', 'can\'t', 'won\'t'
      ];

      const frustrationMap: Record<string, {
        score: number;
        mentions: number;
        examples: string[];
      }> = {};

      recentPosts.forEach(post => {
        const content = (post.content || '').toLowerCase();
        
        frustrationKeywords.forEach(keyword => {
          if (content.includes(keyword)) {
            const topic = this.extractTopic(post.content || '');
            
            if (!frustrationMap[topic]) {
              frustrationMap[topic] = { score: 0, mentions: 0, examples: [] };
            }

            frustrationMap[topic].score += 10;
            frustrationMap[topic].mentions++;
            if (frustrationMap[topic].examples.length < 3) {
              frustrationMap[topic].examples.push(post.content || '');
            }
          }
        });
      });

      return Object.entries(frustrationMap)
        .map(([topic, data]) => ({
          topic,
          frustrationScore: data.score,
          mentions: data.mentions,
          examples: data.examples,
        }))
        .sort((a, b) => b.frustrationScore - a.frustrationScore)
        .slice(0, 10);
    } catch (error) {
      console.error('[Social Sentiment Pathway] Error detecting frustration:', error);
      return [];
    }
  }

  /**
   * Extract feature requests from posts using AI
   */
  async extractFeatureRequests(): Promise<string[]> {
    try {
      const recentPosts = await db
        .select()
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(100);

      const postContents = recentPosts
        .map(p => p.content)
        .filter(Boolean)
        .join('\n\n---\n\n');

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Extract feature requests from these social media posts. Look for phrases like 'would be nice if', 'wish we had', 'need feature', etc. Return a list of clear, actionable feature requests."
          },
          {
            role: "user",
            content: postContents
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const analysis = completion.choices[0]?.message?.content || '';
      
      // Parse feature requests from AI response
      const requests = analysis
        .split('\n')
        .filter(line => line.trim().length > 10 && !line.includes('no feature requests'))
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .slice(0, 10);

      return requests;
    } catch (error) {
      console.error('[Social Sentiment Pathway] Error extracting feature requests:', error);
      return [];
    }
  }

  /**
   * Get sentiment trend over time
   */
  async getSentimentTrend(days: number = 30): Promise<{
    date: string;
    positive: number;
    negative: number;
    neutral: number;
  }[]> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const sentimentData = await db
        .select()
        .from(mrBlueKnowledgeBase)
        .where(gte(mrBlueKnowledgeBase.createdAt, since));

      const dailySentiment: Record<string, { positive: number; negative: number; neutral: number }> = {};

      sentimentData.forEach(entry => {
        const dateKey = (entry.createdAt || new Date()).toISOString().split('T')[0];
        
        try {
          const data = JSON.parse(entry.content as string);
          if (data.counts) {
            if (!dailySentiment[dateKey]) {
              dailySentiment[dateKey] = { positive: 0, negative: 0, neutral: 0 };
            }
            dailySentiment[dateKey].positive += data.counts.positive || 0;
            dailySentiment[dateKey].negative += data.counts.negative || 0;
            dailySentiment[dateKey].neutral += data.counts.neutral || 0;
          }
        } catch (e) {
          // Skip malformed data
        }
      });

      return Object.entries(dailySentiment)
        .map(([date, counts]) => ({
          date,
          ...counts,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('[Social Sentiment Pathway] Error getting sentiment trend:', error);
      return [];
    }
  }

  /**
   * Extract topic from post content
   */
  private extractTopic(content: string): string {
    // Simple keyword extraction (in production, use NLP)
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but'];
    const meaningfulWords = words.filter(w => 
      w.length > 3 && !commonWords.includes(w)
    );

    return meaningfulWords[0] || 'general';
  }
}

export const socialSentimentPathway = new SocialSentimentPathway();

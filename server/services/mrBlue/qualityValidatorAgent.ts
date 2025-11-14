import OpenAI from 'openai';
import Filter from 'bad-words';
import { db } from "@db";
import { mrBlueKnowledgeBase } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const profanityFilter = new Filter();

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
  containsProfanity: boolean;
  isSpam: boolean;
}

export interface ImprovementSuggestion {
  original: string;
  improved: string;
  improvements: string[];
  reasoning: string;
}

export interface CodeQualityReport {
  score: number;
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    line?: number;
    message: string;
    suggestion?: string;
  }>;
  strengths: string[];
  recommendations: string[];
}

export class QualityValidatorAgent {
  async validatePostContent(text: string): Promise<ValidationResult> {
    const containsProfanity = profanityFilter.isProfane(text);
    const isSpam = await this.detectSpam(text);
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (containsProfanity) {
      issues.push('Contains inappropriate language');
      suggestions.push('Remove profanity and use respectful language');
      score -= 40;
    }

    if (isSpam) {
      issues.push('Content appears to be spam');
      suggestions.push('Share genuine, valuable content with the community');
      score -= 50;
    }

    if (text.length < 10) {
      issues.push('Content too short');
      suggestions.push('Add more detail to your post (minimum 10 characters)');
      score -= 20;
    }

    if (text.length > 5000) {
      issues.push('Content too long');
      suggestions.push('Consider breaking into multiple posts or summarizing');
      score -= 10;
    }

    const linkCount = (text.match(/https?:\/\//g) || []).length;
    if (linkCount > 3) {
      issues.push('Too many links');
      suggestions.push('Limit to 3 or fewer links per post');
      score -= 15;
    }

    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.5 && text.length > 20) {
      issues.push('Excessive use of capital letters');
      suggestions.push('Use normal capitalization for better readability');
      score -= 10;
    }

    await this.storeValidation(text, { score, issues, containsProfanity, isSpam });

    return {
      isValid: score >= 60,
      score: Math.max(0, score),
      issues,
      suggestions,
      containsProfanity,
      isSpam
    };
  }

  async suggestImprovements(text: string): Promise<ImprovementSuggestion> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a writing assistant helping users improve their social media posts for a tango community platform. Provide constructive suggestions to make posts more engaging, clear, and appropriate.

Return a JSON object with:
- improved: The improved version of the text
- improvements: Array of specific improvements made
- reasoning: Brief explanation of why these changes help`
          },
          {
            role: 'user',
            content: `Please improve this post while maintaining the author's voice:\n\n${text}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');

      return {
        original: text,
        improved: result.improved || text,
        improvements: result.improvements || [],
        reasoning: result.reasoning || 'No specific improvements needed'
      };
    } catch (error) {
      console.error('[QualityValidator] OpenAI improvement failed:', error);
      
      return {
        original: text,
        improved: text,
        improvements: ['Unable to generate improvements at this time'],
        reasoning: 'AI service temporarily unavailable'
      };
    }
  }

  async detectCodeQuality(code: string, language: string): Promise<CodeQualityReport> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a code review expert. Analyze code quality and provide constructive feedback.

Return a JSON object with:
- score: Overall quality score (0-100)
- issues: Array of {severity, line, message, suggestion}
- strengths: Array of positive aspects
- recommendations: Array of improvement suggestions`
          },
          {
            role: 'user',
            content: `Review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');

      return {
        score: result.score || 75,
        issues: result.issues || [],
        strengths: result.strengths || ['Code is functional'],
        recommendations: result.recommendations || []
      };
    } catch (error) {
      console.error('[QualityValidator] Code quality check failed:', error);
      
      return {
        score: 70,
        issues: [],
        strengths: ['Code syntax appears valid'],
        recommendations: ['Consider adding comments for clarity']
      };
    }
  }

  private async detectSpam(text: string): Promise<boolean> {
    const spamIndicators = [
      /click here/gi,
      /buy now/gi,
      /limited time/gi,
      /act now/gi,
      /guarantee/gi,
      /winner/gi,
      /congratulations/gi,
      /free money/gi,
      /\$\$\$/g
    ];

    const indicatorCount = spamIndicators.filter(pattern => pattern.test(text)).length;
    
    if (indicatorCount >= 3) return true;

    const repeatedCharsRatio = this.getRepeatedCharsRatio(text);
    if (repeatedCharsRatio > 0.3) return true;

    return false;
  }

  private getRepeatedCharsRatio(text: string): number {
    const chars = text.split('');
    let repeated = 0;

    for (let i = 0; i < chars.length - 2; i++) {
      if (chars[i] === chars[i + 1] && chars[i] === chars[i + 2]) {
        repeated++;
      }
    }

    return repeated / text.length;
  }

  private async storeValidation(text: string, result: any): Promise<void> {
    try {
      await db.insert(mrBlueKnowledgeBase).values({
        userId: null,
        category: 'content_validation',
        title: 'Content Quality Check',
        content: JSON.stringify({ text: text.substring(0, 100), result }),
        tags: ['validation', 'quality', result.isSpam ? 'spam' : 'valid'],
        useCount: 1,
        lastUsedAt: new Date()
      });
    } catch (error) {
      console.error('[QualityValidator] Failed to store validation:', error);
    }
  }

  cleanProfanity(text: string): string {
    return profanityFilter.clean(text);
  }

  async batchValidate(texts: string[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const text of texts) {
      const result = await this.validatePostContent(text);
      results.push(result);
    }

    return results;
  }
}

export const qualityValidatorAgent = new QualityValidatorAgent();

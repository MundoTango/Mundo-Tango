import OpenAI from 'openai';
import { db } from "@db";
import { mrBlueKnowledgeBase } from "@shared/schema";
import * as CodeOptimization from '../CodeOptimizationService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Simple profanity filter (basic word list)
const profanityWords = [
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'crap',
  'dick', 'pussy', 'cock', 'cunt', 'fag', 'nigger', 'retard'
];

function isProfane(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityWords.some(word => lowerText.includes(word));
}

function cleanProfanity(text: string): string {
  let cleaned = text;
  profanityWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    cleaned = cleaned.replace(regex, '****');
  });
  return cleaned;
}

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
  optimizations?: CodeOptimization.OptimizationIssue[];
  performanceScore?: number;
}

export class QualityValidatorAgent {
  async validatePostContent(text: string): Promise<ValidationResult> {
    const containsProfanity = isProfane(text);
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

      const optimizations = await this.detectPerformanceIssues(code, language);
      const performanceScore = this.calculatePerformanceScore(optimizations);

      return {
        score: result.score || 75,
        issues: result.issues || [],
        strengths: result.strengths || ['Code is functional'],
        recommendations: result.recommendations || [],
        optimizations,
        performanceScore
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

  async detectPerformanceIssues(code: string, language: string): Promise<CodeOptimization.OptimizationIssue[]> {
    const issues: CodeOptimization.OptimizationIssue[] = [];

    if (language === 'typescript' || language === 'javascript') {
      if (code.includes('SELECT *')) {
        issues.push({
          type: 'slow_query',
          severity: 'medium',
          location: { file: 'code' },
          description: 'Using SELECT * can be inefficient',
          impact: {
            performance: 'medium',
            userExperience: 'low',
            estimatedSavings: '20-50ms per query'
          },
          suggestion: 'Select only the columns you need',
          autoFixAvailable: true,
          autoFix: 'Replace SELECT * with specific column names',
          detectedAt: new Date()
        });
      }

      if (code.match(/\.map\([^)]+\)\s*\.filter\(/)) {
        issues.push({
          type: 'inefficient_loop',
          severity: 'low',
          location: { file: 'code' },
          description: 'Chaining .map().filter() is inefficient',
          impact: {
            performance: 'low',
            userExperience: 'low',
            estimatedSavings: 'Reduced memory allocation'
          },
          suggestion: 'Use .reduce() or combine operations',
          autoFixAvailable: false,
          detectedAt: new Date()
        });
      }

      if (code.match(/for\s*\([^)]*\)\s*{\s*await/)) {
        issues.push({
          type: 'blocking_operation',
          severity: 'high',
          location: { file: 'code' },
          description: 'Sequential async operations in loop',
          impact: {
            performance: 'high',
            userExperience: 'high',
            estimatedSavings: 'Could be 10x faster with parallel execution'
          },
          suggestion: 'Use Promise.all() for parallel execution',
          autoFixAvailable: true,
          autoFix: 'Replace with: await Promise.all(items.map(async item => ...))',
          detectedAt: new Date()
        });
      }

      if (code.match(/useState\([^)]*\)/g)?.length && code.match(/useState\([^)]*\)/g)!.length > 10) {
        issues.push({
          type: 'unnecessary_rerender',
          severity: 'medium',
          location: { file: 'code', function: 'React component' },
          description: 'Too many useState hooks may cause excessive re-renders',
          impact: {
            performance: 'medium',
            userExperience: 'medium'
          },
          suggestion: 'Consider using useReducer or combining related state',
          autoFixAvailable: false,
          detectedAt: new Date()
        });
      }
    }

    return issues;
  }

  calculatePerformanceScore(optimizations: CodeOptimization.OptimizationIssue[]): number {
    let score = 100;
    
    for (const issue of optimizations) {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
      }
    }
    
    return Math.max(0, score);
  }

  /**
   * Detect security vulnerabilities (Learning #44)
   * Scans code for SQL injection, XSS, exposed secrets, CSRF issues
   */
  async detectSecurityVulnerabilities(code: string, language: string): Promise<{
    score: number;
    vulnerabilities: Array<{
      type: 'sql_injection' | 'xss' | 'exposed_secret' | 'csrf' | 'insecure_crypto';
      severity: 'critical' | 'high' | 'medium' | 'low';
      description: string;
      location?: string;
      fix: string;
      canAutoFix: boolean;
    }>;
  }> {
    const vulnerabilities: any[] = [];
    let score = 100;

    // SQL Injection Detection
    if (code.match(/\$\{.*\}.*\bSELECT\b|\bSELECT\b.*\$\{.*\}/i)) {
      vulnerabilities.push({
        type: 'sql_injection',
        severity: 'critical',
        description: 'Potential SQL injection vulnerability detected',
        location: 'Template literal in SQL query',
        fix: 'Use parameterized queries with db.select() or prepared statements',
        canAutoFix: false
      });
      score -= 40;
    }

    if (code.match(/query\([`'"]\s*SELECT.*\+|SELECT.*\+.*[`'"]|query\s*\(\s*[^`'"]/i)) {
      vulnerabilities.push({
        type: 'sql_injection',
        severity: 'critical',
        description: 'String concatenation in SQL query',
        location: 'SQL query construction',
        fix: 'Use ORM methods or parameterized queries instead of string concatenation',
        canAutoFix: false
      });
      score -= 40;
    }

    // XSS Detection
    if (code.match(/innerHTML\s*=|dangerouslySetInnerHTML/)) {
      vulnerabilities.push({
        type: 'xss',
        severity: 'high',
        description: 'Potential XSS vulnerability with innerHTML',
        location: 'DOM manipulation',
        fix: 'Use textContent or sanitize HTML with DOMPurify',
        canAutoFix: false
      });
      score -= 30;
    }

    // Exposed Secrets Detection
    const secretPatterns = [
      { pattern: /api[_-]?key\s*[=:]\s*['"][^'"]{20,}['"]/, name: 'API key' },
      { pattern: /password\s*[=:]\s*['"][^'"]+['"]/, name: 'Password' },
      { pattern: /secret\s*[=:]\s*['"][^'"]{20,}['"]/, name: 'Secret' },
      { pattern: /token\s*[=:]\s*['"][^'"]{20,}['"]/, name: 'Token' },
      { pattern: /sk_live_[a-zA-Z0-9]{24,}/, name: 'Stripe secret key' },
      { pattern: /AIza[a-zA-Z0-9_-]{35}/, name: 'Google API key' },
    ];

    for (const { pattern, name } of secretPatterns) {
      if (code.match(pattern)) {
        vulnerabilities.push({
          type: 'exposed_secret',
          severity: 'critical',
          description: `Hardcoded ${name} detected`,
          location: 'Code contains sensitive credentials',
          fix: `Move ${name} to environment variables (process.env.${name.toUpperCase().replace(/\s/g, '_')})`,
          canAutoFix: true
        });
        score -= 50;
      }
    }

    // CSRF Detection
    if (language === 'typescript' || language === 'javascript') {
      if (code.match(/router\.(post|put|delete|patch)/i) && !code.match(/csrf|csurf|csrfProtection/i)) {
        vulnerabilities.push({
          type: 'csrf',
          severity: 'medium',
          description: 'Mutating endpoint without CSRF protection',
          location: 'API route handler',
          fix: 'Add CSRF protection middleware to POST/PUT/DELETE routes',
          canAutoFix: false
        });
        score -= 15;
      }
    }

    // Insecure Crypto
    if (code.match(/createHash\(['"]md5['"]|createHash\(['"]sha1['"]/)) {
      vulnerabilities.push({
        type: 'insecure_crypto',
        severity: 'medium',
        description: 'Using insecure hashing algorithm (MD5/SHA1)',
        location: 'Crypto operation',
        fix: 'Use SHA-256 or bcrypt for password hashing',
        canAutoFix: true
      });
      score -= 20;
    }

    return {
      score: Math.max(0, score),
      vulnerabilities
    };
  }

  /**
   * Generate automated fix suggestions (Learning #42)
   * Returns specific code fixes for detected issues
   */
  async generateAutomatedFixes(code: string, language: string): Promise<{
    issues: Array<{
      issue: string;
      severity: 'error' | 'warning' | 'info';
      suggestedFix: string;
      canAutoFix: boolean;
      autoFixCode?: string;
    }>;
  }> {
    const issues: any[] = [];

    // Use CodeOptimizationService to detect issues
    const optimizations = await this.detectPerformanceIssues(code, language);
    
    for (const opt of optimizations) {
      issues.push({
        issue: opt.description,
        severity: opt.severity === 'critical' || opt.severity === 'high' ? 'error' : 'warning',
        suggestedFix: opt.suggestion,
        canAutoFix: opt.autoFixAvailable,
        autoFixCode: opt.autoFix
      });
    }

    // Add security fixes
    const security = await this.detectSecurityVulnerabilities(code, language);
    for (const vuln of security.vulnerabilities) {
      issues.push({
        issue: vuln.description,
        severity: vuln.severity === 'critical' || vuln.severity === 'high' ? 'error' : 'warning',
        suggestedFix: vuln.fix,
        canAutoFix: vuln.canAutoFix,
        autoFixCode: vuln.canAutoFix ? this.generateSecurityAutoFix(vuln) : undefined
      });
    }

    return { issues };
  }

  /**
   * Generate auto-fix code for security vulnerabilities
   */
  private generateSecurityAutoFix(vuln: any): string {
    if (vuln.type === 'exposed_secret') {
      const secretName = vuln.description.match(/Hardcoded ([^d]+) detected/)?.[1];
      if (secretName) {
        const envVar = secretName.toUpperCase().replace(/\s/g, '_');
        return `process.env.${envVar}`;
      }
    }

    if (vuln.type === 'insecure_crypto') {
      return `crypto.createHash('sha256')`;
    }

    return vuln.fix;
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
    return cleanProfanity(text);
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

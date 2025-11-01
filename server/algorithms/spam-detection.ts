/**
 * A4: SPAM DETECTION ALGORITHM
 * Detects spam content using pattern matching and ML-ready scoring
 */

interface SpamSignals {
  suspiciousLinks: number;
  repeatedContent: number;
  excessiveCapitals: number;
  bannedKeywords: number;
  rapidPosting: number;
}

interface SpamResult {
  isSpam: boolean;
  confidence: number;
  signals: SpamSignals;
  reason: string;
}

const BANNED_KEYWORDS = [
  'click here now', 'limited time', 'act now', 'buy now',
  'free money', 'make money fast', 'work from home', 'guaranteed'
];

export class SpamDetectionAlgorithm {
  async analyzeContent(content: string, userId: number, recentPostCount: number): Promise<SpamResult> {
    const signals: SpamSignals = {
      suspiciousLinks: this.detectSuspiciousLinks(content),
      repeatedContent: 0, // Would check against recent posts in production
      excessiveCapitals: this.detectExcessiveCapitals(content),
      bannedKeywords: this.detectBannedKeywords(content),
      rapidPosting: recentPostCount > 10 ? 1 : 0,
    };

    const score = this.calculateSpamScore(signals);
    const isSpam = score > 0.7;

    return {
      isSpam,
      confidence: score,
      signals,
      reason: this.generateReason(signals, score),
    };
  }

  private detectSuspiciousLinks(content: string): number {
    const urlPattern = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlPattern) || [];
    
    if (urls.length > 3) return 1;
    
    const suspiciousDomains = urls.filter(url => 
      url.includes('.tk') || url.includes('.ml') || url.includes('bit.ly')
    );
    
    return suspiciousDomains.length > 0 ? 1 : 0;
  }

  private detectExcessiveCapitals(content: string): number {
    const capitals = content.replace(/[^A-Z]/g, '').length;
    const total = content.replace(/[^A-Za-z]/g, '').length;
    
    if (total === 0) return 0;
    
    const ratio = capitals / total;
    return ratio > 0.5 ? 1 : 0;
  }

  private detectBannedKeywords(content: string): number {
    const lowerContent = content.toLowerCase();
    const matches = BANNED_KEYWORDS.filter(keyword => 
      lowerContent.includes(keyword)
    );
    
    return matches.length > 0 ? 1 : 0;
  }

  private calculateSpamScore(signals: SpamSignals): number {
    const weights = {
      suspiciousLinks: 0.3,
      repeatedContent: 0.25,
      excessiveCapitals: 0.15,
      bannedKeywords: 0.2,
      rapidPosting: 0.1,
    };

    return (
      signals.suspiciousLinks * weights.suspiciousLinks +
      signals.repeatedContent * weights.repeatedContent +
      signals.excessiveCapitals * weights.excessiveCapitals +
      signals.bannedKeywords * weights.bannedKeywords +
      signals.rapidPosting * weights.rapidPosting
    );
  }

  private generateReason(signals: SpamSignals, score: number): string {
    if (score < 0.3) return "Content appears legitimate";
    if (signals.bannedKeywords) return "Contains spam keywords";
    if (signals.suspiciousLinks) return "Contains suspicious links";
    if (signals.excessiveCapitals) return "Excessive capitalization detected";
    if (signals.rapidPosting) return "Unusual posting frequency";
    return "Multiple spam indicators detected";
  }
}

export const spamDetection = new SpamDetectionAlgorithm();

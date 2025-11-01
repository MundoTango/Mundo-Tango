/**
 * A31: CONTENT MODERATION ALGORITHM
 * Automated content moderation using multiple signals
 */

interface ModerationResult {
  isAllowed: boolean;
  confidence: number;
  flags: string[];
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  action: 'approve' | 'review' | 'reject' | 'ban';
}

export class ContentModerationAlgorithm {
  private bannedWords = new Set([
    'spam', 'scam', 'explicit', 'offensive', 'harassment'
  ]);

  async moderateContent(content: string, authorReputation: number): Promise<ModerationResult> {
    const flags: string[] = [];
    let severity: ModerationResult['severity'] = 'none';

    // Check banned words
    const hasBanned = this.checkBannedWords(content);
    if (hasBanned) {
      flags.push("Contains inappropriate language");
      severity = 'high';
    }

    // Check spam patterns
    const isSpammy = this.checkSpamPatterns(content);
    if (isSpammy) {
      flags.push("Spam-like patterns detected");
      severity = severity === 'none' ? 'medium' : severity;
    }

    // Check excessive links
    const hasExcessiveLinks = this.checkLinks(content);
    if (hasExcessiveLinks) {
      flags.push("Excessive external links");
      severity = severity === 'none' ? 'low' : severity;
    }

    const action = this.determineAction(severity, authorReputation);
    const isAllowed = action === 'approve';

    return {
      isAllowed,
      confidence: this.calculateConfidence(flags.length, authorReputation),
      flags,
      severity,
      action,
    };
  }

  private checkBannedWords(content: string): boolean {
    const lower = content.toLowerCase();
    return Array.from(this.bannedWords).some(word => lower.includes(word));
  }

  private checkSpamPatterns(content: string): boolean {
    const patterns = [
      /click here/gi,
      /buy now/gi,
      /limited time/gi,
      /act now/gi,
    ];

    return patterns.some(pattern => pattern.test(content));
  }

  private checkLinks(content: string): boolean {
    const urls = content.match(/https?:\/\/[^\s]+/g) || [];
    return urls.length > 3;
  }

  private determineAction(severity: string, reputation: number): ModerationResult['action'] {
    if (severity === 'critical') return 'ban';
    if (severity === 'high') return 'reject';
    if (severity === 'medium') return reputation > 0.7 ? 'review' : 'reject';
    if (severity === 'low') return 'review';
    return 'approve';
  }

  private calculateConfidence(flagCount: number, reputation: number): number {
    if (flagCount === 0) return 0.9;
    if (flagCount > 2) return 0.95;
    return 0.7 + (reputation * 0.2);
  }
}

export const contentModeration = new ContentModerationAlgorithm();

import { db } from "@shared/db";
import { moderationQueue, flaggedContent } from "@shared/schema";
import * as BadWordsModule from "bad-words";

const Filter = (BadWordsModule as any).default || BadWordsModule;
const profanityFilter = new Filter();

interface Flag {
  type: string;
  severity: number;
  confidence: number;
}

export class AutoModerationService {
  /**
   * Check content for violations and auto-flag if needed
   * @param content - The text content to check
   * @param contentType - Type of content (post, comment, message, etc.)
   * @param contentId - ID of the content
   * @param userId - ID of the user who created the content
   * @returns Object with flagged status and list of flags
   */
  static async checkContent(
    content: string,
    contentType: string,
    contentId: number,
    userId: number
  ) {
    const flags: Flag[] = [];

    // Check for profanity
    if (profanityFilter.isProfane(content)) {
      flags.push({
        type: "profanity",
        severity: 5,
        confidence: 90,
      });
    }

    // Check for spam patterns
    if (this.isSpam(content)) {
      flags.push({
        type: "spam",
        severity: 7,
        confidence: 85,
      });
    }

    // Check for suspicious links
    if (this.hasSuspiciousLinks(content)) {
      flags.push({
        type: "suspicious_links",
        severity: 8,
        confidence: 75,
      });
    }

    // Check for hate speech patterns
    if (this.hasHateSpeech(content)) {
      flags.push({
        type: "hate_speech",
        severity: 9,
        confidence: 80,
      });
    }

    // Check for excessive capitalization (shouting)
    if (this.hasExcessiveCaps(content)) {
      flags.push({
        type: "spam",
        severity: 3,
        confidence: 70,
      });
    }

    // If flagged, add to moderation queue
    if (flags.length > 0) {
      await this.addToModerationQueue(contentType, contentId, userId, flags);
    }

    return { flagged: flags.length > 0, flags };
  }

  /**
   * Check if content matches spam patterns
   */
  static isSpam(content: string): boolean {
    const spamPatterns = [
      /click here/i,
      /buy now/i,
      /limited time/i,
      /act now/i,
      /free money/i,
      /\$\$\$/,
      /(http[s]?:\/\/){3,}/g, // Multiple URLs
      /💰{3,}/, // Multiple money emojis
      /🔥{3,}/, // Multiple fire emojis (common in spam)
    ];

    return spamPatterns.some((pattern) => pattern.test(content));
  }

  /**
   * Check if content contains suspicious shortened links
   */
  static hasSuspiciousLinks(content: string): boolean {
    const suspiciousDomains = [
      "bit.ly",
      "tinyurl.com",
      "goo.gl",
      "ow.ly",
      "short.link",
      "tiny.cc",
    ];
    return suspiciousDomains.some((domain) => content.includes(domain));
  }

  /**
   * Check for hate speech patterns
   */
  static hasHateSpeech(content: string): boolean {
    // Basic hate speech patterns - in production, use a more sophisticated ML model
    const hateSpeechPatterns = [
      /\b(k[i1]ll\s+(yourself|urself|y[o0]u))\b/i,
      /\b(die\s+in\s+a\s+fire)\b/i,
      /\b(go\s+die)\b/i,
    ];

    return hateSpeechPatterns.some((pattern) => pattern.test(content));
  }

  /**
   * Check for excessive capitalization (shouting/spam indicator)
   */
  static hasExcessiveCaps(content: string): boolean {
    // Ignore short content
    if (content.length < 20) return false;

    const letters = content.replace(/[^a-zA-Z]/g, "");
    if (letters.length === 0) return false;

    const caps = content.replace(/[^A-Z]/g, "");
    const capsRatio = caps.length / letters.length;

    // If more than 70% is caps and content is long enough, likely spam/shouting
    return capsRatio > 0.7;
  }

  /**
   * Add content to moderation queue with appropriate priority
   */
  static async addToModerationQueue(
    contentType: string,
    contentId: number,
    userId: number,
    flags: Flag[]
  ) {
    try {
      const maxSeverity = Math.max(...flags.map((f) => f.severity));
      // Higher severity = lower priority number (1=highest priority)
      const priority = Math.ceil((11 - maxSeverity) / 2);

      const flagTypes = flags.map((f) => f.type).join(", ");

      // Insert into moderation queue
      await db.insert(moderationQueue).values({
        contentType,
        contentId,
        userId,
        status: "pending",
        priority,
        autoFlagged: true,
        autoFlagReason: flagTypes,
        reason: flagTypes, // Legacy field
        description: `Auto-flagged for: ${flagTypes}`, // Legacy field
      });

      // Also create flagged content records for each flag
      for (const flag of flags) {
        await db.insert(flaggedContent).values({
          contentType,
          contentId,
          flagType: flag.type,
          severity: flag.severity,
          confidence: flag.confidence,
          detectionMethod: "keyword",
          flagReason: flag.type, // Legacy field
          autoFlagged: true,
        });
      }

      console.log(
        `Auto-flagged ${contentType} #${contentId}: ${flagTypes} (severity: ${maxSeverity}, priority: ${priority})`
      );
    } catch (error) {
      console.error("Error adding to moderation queue:", error);
      throw error;
    }
  }

  /**
   * Manually flag content (user report)
   */
  static async reportContent(
    contentType: string,
    contentId: number,
    userId: number,
    reporterId: number,
    reportReason: string,
    reportDetails?: string
  ) {
    try {
      // Check if already in queue
      const existing = await db.query.moderationQueue.findFirst({
        where: (queue, { and, eq }) =>
          and(
            eq(queue.contentType, contentType),
            eq(queue.contentId, contentId),
            eq(queue.status, "pending")
          ),
      });

      if (existing) {
        console.log(
          `Content ${contentType} #${contentId} already in moderation queue`
        );
        return existing;
      }

      // Insert into moderation queue
      const [item] = await db
        .insert(moderationQueue)
        .values({
          contentType,
          contentId,
          userId,
          reportedBy: reporterId,
          reportReason,
          reportDetails,
          status: "pending",
          priority: 3, // Default medium priority for manual reports
          autoFlagged: false,
          reason: reportReason, // Legacy field
          description: reportDetails, // Legacy field
        })
        .returning();

      console.log(
        `Manually reported ${contentType} #${contentId} by user #${reporterId}`
      );

      return item;
    } catch (error) {
      console.error("Error reporting content:", error);
      throw error;
    }
  }
}

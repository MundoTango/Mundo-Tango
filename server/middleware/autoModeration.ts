/**
 * AUTO-MODERATION MIDDLEWARE
 * Profanity filter, spam detection, and auto-flagging system
 */

import { db } from "@shared/db";
import { flaggedContent, moderationQueue } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const PROFANITY_LIST = [
  "badword1", "badword2", "badword3",
];

const SPAM_KEYWORDS = [
  "buy now", "click here", "limited time", "act now", "free money",
  "work from home", "make money fast", "risk free", "100% guaranteed",
  "viagra", "casino", "lottery", "prize"
];

export interface ContentToModerate {
  type: "post" | "comment" | "event" | "user" | "housing";
  id: number;
  content: string;
  userId?: number;
}

export async function checkProfanity(text: string): Promise<boolean> {
  const lowerText = text.toLowerCase();
  return PROFANITY_LIST.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

export async function checkSpam(text: string): Promise<boolean> {
  const lowerText = text.toLowerCase();
  
  const keywordMatches = SPAM_KEYWORDS.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  ).length;
  
  if (keywordMatches >= 2) {
    return true;
  }
  
  const hasExcessiveLinks = (text.match(/https?:\/\//g) || []).length >= 3;
  const hasExcessiveCaps = text.replace(/[^A-Z]/g, '').length / text.length > 0.5;
  const hasRepeatedChars = /(.)\1{4,}/.test(text);
  
  return hasExcessiveLinks || hasExcessiveCaps || hasRepeatedChars;
}

export async function autoFlagContent(content: ContentToModerate): Promise<void> {
  const hasProfanity = await checkProfanity(content.content);
  const hasSpam = await checkSpam(content.content);
  
  if (hasProfanity) {
    await db.insert(flaggedContent).values({
      contentType: content.type,
      contentId: content.id,
      flagReason: "profanity",
      autoFlagged: true,
    });
    
    await db.insert(moderationQueue).values({
      contentType: content.type,
      contentId: content.id,
      reportedBy: null,
      reason: "inappropriate",
      description: "Auto-flagged for profanity",
      priority: 3,
    });
  }
  
  if (hasSpam) {
    await db.insert(flaggedContent).values({
      contentType: content.type,
      contentId: content.id,
      flagReason: "spam_keywords",
      autoFlagged: true,
    });
    
    await db.insert(moderationQueue).values({
      contentType: content.type,
      contentId: content.id,
      reportedBy: null,
      reason: "spam",
      description: "Auto-flagged for spam",
      priority: 2,
    });
  }
}

export async function checkMultipleReports(
  contentType: string, 
  contentId: number
): Promise<boolean> {
  const reportCount = await db.select()
    .from(moderationQueue)
    .where(and(
      eq(moderationQueue.contentType, contentType),
      eq(moderationQueue.contentId, contentId)
    ));
  
  if (reportCount.length >= 3) {
    await db.insert(flaggedContent).values({
      contentType,
      contentId,
      flagReason: "multiple_reports",
      autoFlagged: true,
    });
    
    await db.update(moderationQueue)
      .set({ priority: 5 })
      .where(and(
        eq(moderationQueue.contentType, contentType),
        eq(moderationQueue.contentId, contentId),
        eq(moderationQueue.status, "pending")
      ));
    
    return true;
  }
  
  return false;
}

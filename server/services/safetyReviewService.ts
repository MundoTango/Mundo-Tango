import { db } from '@shared/db';
import { safetyReviews } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import type { 
  InsertSafetyReview, 
  SelectSafetyReview 
} from "@shared/schema";

/**
 * Safety Review Service
 * 
 * Manages safety reviews for housing listings, user verification, and trust & safety.
 * Part 2 P0 Workflow - CRITICAL for platform trust and user safety.
 * 
 * Review Types:
 * - housing_listing: Reviews for housing marketplace listings
 * - user_verification: Background checks and user verification
 * - event_safety: Event safety reviews
 * - content_report: Safety reviews for reported content
 * 
 * Risk Levels:
 * - low: Minor concerns, routine check
 * - medium: Moderate concerns, requires review
 * - high: Significant concerns, urgent review
 * - critical: Immediate safety threat, escalate immediately
 */
export class SafetyReviewService {
  /**
   * Create a new safety review
   */
  static async createSafetyReview(
    data: InsertSafetyReview
  ): Promise<SelectSafetyReview> {
    const [review] = await db
      .insert(safetyReviews)
      .values(data)
      .returning();

    return review;
  }

  /**
   * Get pending safety reviews
   */
  static async getPendingReviews(
    targetType?: string
  ): Promise<SelectSafetyReview[]> {
    if (targetType) {
      return db
        .select()
        .from(safetyReviews)
        .where(
          and(
            eq(safetyReviews.status, 'pending'),
            eq(safetyReviews.targetType, targetType)
          )
        )
        .orderBy(desc(safetyReviews.createdAt));
    }

    return db
      .select()
      .from(safetyReviews)
      .where(eq(safetyReviews.status, 'pending'))
      .orderBy(desc(safetyReviews.createdAt));
  }

  /**
   * Get high-priority reviews (high/critical risk)
   */
  static async getHighPriorityReviews(): Promise<SelectSafetyReview[]> {
    return db
      .select()
      .from(safetyReviews)
      .where(eq(safetyReviews.status, 'pending'))
      .orderBy(desc(safetyReviews.riskLevel), desc(safetyReviews.createdAt));
  }

  /**
   * Get safety review by ID
   */
  static async getSafetyReview(id: number): Promise<SelectSafetyReview | undefined> {
    const [review] = await db
      .select()
      .from(safetyReviews)
      .where(eq(safetyReviews.id, id))
      .limit(1);

    return review;
  }

  /**
   * Get safety reviews for specific target
   */
  static async getReviewsForTarget(
    targetType: string,
    targetId: number
  ): Promise<SelectSafetyReview[]> {
    return db
      .select()
      .from(safetyReviews)
      .where(
        and(
          eq(safetyReviews.targetType, targetType),
          eq(safetyReviews.targetId, targetId)
        )
      )
      .orderBy(desc(safetyReviews.createdAt));
  }

  /**
   * Update risk level
   */
  static async updateRiskLevel(
    id: number,
    riskLevel: 'low' | 'medium' | 'high' | 'critical',
    notes?: string
  ): Promise<SelectSafetyReview> {
    const [review] = await db
      .update(safetyReviews)
      .set({ riskLevel, notes })
      .where(eq(safetyReviews.id, id))
      .returning();

    return review;
  }

  /**
   * Complete background check
   */
  static async completeBackgroundCheck(
    id: number,
    provider: string,
    result: any,
    documents?: string[]
  ): Promise<SelectSafetyReview> {
    const [review] = await db
      .update(safetyReviews)
      .set({
        backgroundCheckCompleted: true,
        backgroundCheckProvider: provider,
        backgroundCheckResult: result,
        verificationDocuments: documents,
      })
      .where(eq(safetyReviews.id, id))
      .returning();

    return review;
  }

  /**
   * Approve safety review
   */
  static async approveSafetyReview(
    id: number,
    reviewerId: number,
    actionTaken?: string,
    notes?: string
  ): Promise<SelectSafetyReview> {
    const [review] = await db
      .update(safetyReviews)
      .set({
        status: 'approved',
        reviewerId,
        actionTaken,
        notes,
        reviewedAt: new Date(),
        resolvedAt: new Date(),
      })
      .where(eq(safetyReviews.id, id))
      .returning();

    return review;
  }

  /**
   * Reject/flag safety review
   */
  static async rejectSafetyReview(
    id: number,
    reviewerId: number,
    actionTaken: string,
    notes: string,
    issues: Array<{ category: string; severity: string; description: string }>
  ): Promise<SelectSafetyReview> {
    const [review] = await db
      .update(safetyReviews)
      .set({
        status: 'rejected',
        reviewerId,
        actionTaken,
        notes,
        issues,
        reviewedAt: new Date(),
        resolvedAt: new Date(),
      })
      .where(eq(safetyReviews.id, id))
      .returning();

    return review;
  }

  /**
   * Escalate safety review
   */
  static async escalateReview(
    id: number,
    riskLevel: 'high' | 'critical',
    notes: string
  ): Promise<SelectSafetyReview> {
    const [review] = await db
      .update(safetyReviews)
      .set({
        status: 'escalated',
        riskLevel,
        notes,
      })
      .where(eq(safetyReviews.id, id))
      .returning();

    return review;
  }

  /**
   * Get safety review statistics
   */
  static async getSafetyStats(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    escalated: number;
    byRisk: { low: number; medium: number; high: number; critical: number };
    total: number;
  }> {
    const reviews = await db.select().from(safetyReviews);

    return {
      pending: reviews.filter((r: SelectSafetyReview) => r.status === 'pending').length,
      approved: reviews.filter((r: SelectSafetyReview) => r.status === 'approved').length,
      rejected: reviews.filter((r: SelectSafetyReview) => r.status === 'rejected').length,
      escalated: reviews.filter((r: SelectSafetyReview) => r.status === 'escalated').length,
      byRisk: {
        low: reviews.filter((r: SelectSafetyReview) => r.riskLevel === 'low').length,
        medium: reviews.filter((r: SelectSafetyReview) => r.riskLevel === 'medium').length,
        high: reviews.filter((r: SelectSafetyReview) => r.riskLevel === 'high').length,
        critical: reviews.filter((r: SelectSafetyReview) => r.riskLevel === 'critical').length,
      },
      total: reviews.length,
    };
  }
}

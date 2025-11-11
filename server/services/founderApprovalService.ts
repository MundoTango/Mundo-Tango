import { db } from '@shared/db';
import { featureReviewStatus } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { 
  InsertFeatureReviewStatus, 
  SelectFeatureReviewStatus 
} from "@shared/schema";

/**
 * Founder Approval Service
 * 
 * Manages the workflow for feature review and approval before production deployment.
 * Part 2 P0 Workflow - CRITICAL for production readiness.
 * 
 * Workflow Stages:
 * 1. pending_review - Feature submitted, awaiting founder review
 * 2. approved - Feature approved, ready for production
 * 3. needs_work - Feature needs changes before approval
 * 4. rejected - Feature rejected
 */
export class FounderApprovalService {
  /**
   * Submit feature for founder approval
   */
  static async submitFeatureForReview(
    data: InsertFeatureReviewStatus
  ): Promise<SelectFeatureReviewStatus> {
    const [feature] = await db
      .insert(featureReviewStatus)
      .values({
        ...data,
        status: 'pending_review',
        submittedAt: new Date(),
      })
      .returning();

    return feature;
  }

  /**
   * Get all features pending review
   */
  static async getPendingReviews(): Promise<SelectFeatureReviewStatus[]> {
    return db
      .select()
      .from(featureReviewStatus)
      .where(eq(featureReviewStatus.status, 'pending_review'))
      .orderBy(desc(featureReviewStatus.submittedAt));
  }

  /**
   * Get feature review by ID
   */
  static async getFeatureReview(id: number): Promise<SelectFeatureReviewStatus | undefined> {
    const [feature] = await db
      .select()
      .from(featureReviewStatus)
      .where(eq(featureReviewStatus.id, id))
      .limit(1);

    return feature;
  }

  /**
   * Get all features for a specific page
   */
  static async getFeaturesByPage(pageUrl: string): Promise<SelectFeatureReviewStatus[]> {
    return db
      .select()
      .from(featureReviewStatus)
      .where(eq(featureReviewStatus.pageUrl, pageUrl))
      .orderBy(desc(featureReviewStatus.submittedAt));
  }

  /**
   * Approve feature
   */
  static async approveFeature(
    id: number,
    reviewedBy: number,
    reviewNotes?: string,
    checklist?: {
      functionalityWorks: boolean;
      designMatches: boolean;
      noBugs: boolean;
      meetsRequirements: boolean;
      readyForUsers: boolean;
    }
  ): Promise<SelectFeatureReviewStatus> {
    const [feature] = await db
      .update(featureReviewStatus)
      .set({
        status: 'approved',
        reviewedBy,
        reviewNotes,
        checklist,
        reviewedAt: new Date(),
        approvedAt: new Date(),
      })
      .where(eq(featureReviewStatus.id, id))
      .returning();

    return feature;
  }

  /**
   * Request changes to feature
   */
  static async requestChanges(
    id: number,
    reviewedBy: number,
    reviewNotes: string,
    checklist?: {
      functionalityWorks: boolean;
      designMatches: boolean;
      noBugs: boolean;
      meetsRequirements: boolean;
      readyForUsers: boolean;
    }
  ): Promise<SelectFeatureReviewStatus> {
    const [feature] = await db
      .update(featureReviewStatus)
      .set({
        status: 'needs_work',
        reviewedBy,
        reviewNotes,
        checklist,
        reviewedAt: new Date(),
      })
      .where(eq(featureReviewStatus.id, id))
      .returning();

    return feature;
  }

  /**
   * Reject feature
   */
  static async rejectFeature(
    id: number,
    reviewedBy: number,
    reviewNotes: string
  ): Promise<SelectFeatureReviewStatus> {
    const [feature] = await db
      .update(featureReviewStatus)
      .set({
        status: 'rejected',
        reviewedBy,
        reviewNotes,
        reviewedAt: new Date(),
      })
      .where(eq(featureReviewStatus.id, id))
      .returning();

    return feature;
  }

  /**
   * Check if feature is approved for production
   */
  static async isFeatureApproved(pageUrl: string): Promise<boolean> {
    const [feature] = await db
      .select()
      .from(featureReviewStatus)
      .where(eq(featureReviewStatus.pageUrl, pageUrl))
      .orderBy(desc(featureReviewStatus.submittedAt))
      .limit(1);

    return feature?.status === 'approved';
  }

  /**
   * Get approval statistics
   */
  static async getApprovalStats(): Promise<{
    pending: number;
    approved: number;
    needsWork: number;
    rejected: number;
    total: number;
  }> {
    const features = await db.select().from(featureReviewStatus);

    return {
      pending: features.filter((f: SelectFeatureReviewStatus) => f.status === 'pending_review').length,
      approved: features.filter((f: SelectFeatureReviewStatus) => f.status === 'approved').length,
      needsWork: features.filter((f: SelectFeatureReviewStatus) => f.status === 'needs_work').length,
      rejected: features.filter((f: SelectFeatureReviewStatus) => f.status === 'rejected').length,
      total: features.length,
    };
  }
}

import { db } from '../../db';
import {
  tangoResumes,
  professionalEndorsements,
  roleConfirmations,
  reviews,
  InsertTangoResume,
  SelectTangoResume
} from '@shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export interface CreateResumeRequest {
  userId: number;
  headline?: string;
  bio?: string;
  yearsExperience?: number;
  specialties?: string[];
  tangoRoles?: string[];
  languages?: string[];
  teachingLocations?: string[];
  availability?: string;
  hourlyRate?: number;
  website?: string;
  youtubeChannel?: string;
  instagramHandle?: string;
}

export interface ResumeWithStats extends SelectTangoResume {
  endorsements: any[];
  roleConfirmations: any[];
  reviews: any[];
}

export class TangoResumeService {
  private userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  /**
   * Create or update tango résumé
   */
  async createOrUpdateResume(data: CreateResumeRequest): Promise<SelectTangoResume> {
    const existing = await db.query.tangoResumes.findFirst({
      where: eq(tangoResumes.userId, this.userId)
    });

    if (existing) {
      // Update existing résumé
      const [updated] = await db.update(tangoResumes)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(tangoResumes.userId, this.userId))
        .returning();

      console.log(`[TangoResumeService] Updated résumé for user ${this.userId}`);
      return updated;
    } else {
      // Create new résumé
      const [created] = await db.insert(tangoResumes)
        .values({
          userId: this.userId,
          ...data
        })
        .returning();

      console.log(`[TangoResumeService] Created résumé for user ${this.userId}`);
      return created;
    }
  }

  /**
   * Get résumé by user ID with all stats
   */
  async getResumeByUserId(userId: number): Promise<ResumeWithStats | null> {
    const resume = await db.query.tangoResumes.findFirst({
      where: eq(tangoResumes.userId, userId)
    });

    if (!resume) return null;

    // Get endorsements
    const endorsements = await db.query.professionalEndorsements.findMany({
      where: eq(professionalEndorsements.endorseeId, userId),
      orderBy: [desc(professionalEndorsements.createdAt)]
    });

    // Get role confirmations
    const confirmations = await db.query.roleConfirmations.findMany({
      where: eq(roleConfirmations.userId, userId),
      orderBy: [desc(roleConfirmations.createdAt)]
    });

    // Get reviews (polymorphic - can be for teachers, venues, etc.)
    const userReviews = await db.query.reviews.findMany({
      where: and(
        eq(reviews.reviewType, 'teacher'),
        eq(reviews.entityId, userId.toString())
      ),
      orderBy: [desc(reviews.createdAt)],
      limit: 10
    });

    return {
      ...resume,
      endorsements,
      roleConfirmations: confirmations,
      reviews: userReviews
    };
  }

  /**
   * Calculate and update professional score
   * Based on: endorsements, role confirmations, reviews, years experience
   */
  async calculateProfessionalScore(userId: number): Promise<number> {
    // Get all data
    const resume = await db.query.tangoResumes.findFirst({
      where: eq(tangoResumes.userId, userId)
    });

    if (!resume) return 0;

    const endorsements = await db.query.professionalEndorsements.findMany({
      where: eq(professionalEndorsements.endorseeId, userId)
    });

    const confirmations = await db.query.roleConfirmations.findMany({
      where: eq(roleConfirmations.userId, userId)
    });

    const userReviews = await db.query.reviews.findMany({
      where: and(
        eq(reviews.reviewType, 'teacher'),
        eq(reviews.entityId, userId.toString())
      )
    });

    // Calculate score (0-1000 points)
    let score = 0;

    // Endorsements: Up to 300 points (10 points each, max 30)
    score += Math.min(endorsements.length * 10, 300);

    // Role confirmations: Up to 200 points (20 points each, max 10)
    score += Math.min(confirmations.length * 20, 200);

    // Reviews: Up to 300 points (based on avg rating and count)
    if (userReviews.length > 0) {
      const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
      const ratingPoints = (avgRating / 5) * 200; // Max 200 for perfect 5.0 rating
      const countBonus = Math.min(userReviews.length * 5, 100); // Max 100 for review count
      score += ratingPoints + countBonus;
    }

    // Years experience: Up to 200 points (20 points per year, max 10 years)
    const yearsExperience = resume.yearsExperience || 0;
    score += Math.min(yearsExperience * 20, 200);

    // Round score
    score = Math.round(score);

    // Update résumé with calculated score
    const avgRating = userReviews.length > 0
      ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
      : null;

    await db.update(tangoResumes)
      .set({
        professionalScore: score,
        endorsementCount: endorsements.length,
        reviewCount: userReviews.length,
        avgRating,
        updatedAt: new Date()
      })
      .where(eq(tangoResumes.userId, userId));

    console.log(`[TangoResumeService] Calculated professional score for user ${userId}: ${score}`);

    return score;
  }

  /**
   * Search résumés by role, location, availability
   */
  async searchResumes(filters: {
    tangoRole?: string;
    location?: string;
    availability?: string;
    minScore?: number;
  }): Promise<SelectTangoResume[]> {
    let query = db.query.tangoResumes.findMany({
      orderBy: [desc(tangoResumes.professionalScore)]
    });

    // Apply filters
    // Note: This is a simplified version. In production, you'd use proper SQL WHERE clauses

    const results = await query;

    return results.filter(resume => {
      if (filters.tangoRole && resume.tangoRoles) {
        if (!resume.tangoRoles.includes(filters.tangoRole)) return false;
      }
      if (filters.location && resume.teachingLocations) {
        if (!resume.teachingLocations.some(loc => loc.toLowerCase().includes(filters.location!.toLowerCase()))) {
          return false;
        }
      }
      if (filters.availability && resume.availability !== filters.availability) {
        return false;
      }
      if (filters.minScore && resume.professionalScore < filters.minScore) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get top professionals by role
   */
  async getTopProfessionals(role: string, limit = 10): Promise<SelectTangoResume[]> {
    const results = await db.query.tangoResumes.findMany({
      orderBy: [desc(tangoResumes.professionalScore)],
      limit: limit * 2 // Fetch extra to filter
    });

    return results
      .filter(resume => resume.tangoRoles?.includes(role))
      .slice(0, limit);
  }

  /**
   * Verify professional (platform verification)
   */
  async verifyProfessional(userId: number, isVerified: boolean): Promise<void> {
    await db.update(tangoResumes)
      .set({ isVerified, updatedAt: new Date() })
      .where(eq(tangoResumes.userId, userId));

    console.log(`[TangoResumeService] ${isVerified ? 'Verified' : 'Unverified'} professional: ${userId}`);
  }

  /**
   * Set premium status
   */
  async setPremiumStatus(userId: number, isPremium: boolean): Promise<void> {
    await db.update(tangoResumes)
      .set({ isPremium, updatedAt: new Date() })
      .where(eq(tangoResumes.userId, userId));

    console.log(`[TangoResumeService] Premium status for user ${userId}: ${isPremium}`);
  }

  /**
   * Get résumé stats summary
   */
  async getResumeStats(userId: number): Promise<{
    professionalScore: number;
    endorsementCount: number;
    confirmationCount: number;
    reviewCount: number;
    avgRating: number | null;
    isVerified: boolean;
  }> {
    const resume = await db.query.tangoResumes.findFirst({
      where: eq(tangoResumes.userId, userId)
    });

    if (!resume) {
      return {
        professionalScore: 0,
        endorsementCount: 0,
        confirmationCount: 0,
        reviewCount: 0,
        avgRating: null,
        isVerified: false
      };
    }

    const confirmations = await db.query.roleConfirmations.findMany({
      where: eq(roleConfirmations.userId, userId)
    });

    return {
      professionalScore: resume.professionalScore,
      endorsementCount: resume.endorsementCount,
      confirmationCount: confirmations.length,
      reviewCount: resume.reviewCount,
      avgRating: resume.avgRating,
      isVerified: resume.isVerified
    };
  }
}

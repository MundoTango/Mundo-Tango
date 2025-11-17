import { db } from "@db";
import { professionalEndorsements, users, friendships } from "@db/schema";
import { eq, and, count, sql, desc, avg } from "drizzle-orm";

export interface TangoRole {
  endorsements: number;
  score: number;
  topSkills: Array<{
    skill: string;
    count: number;
  }>;
  verifiedBy: Array<{
    id: number;
    name: string;
    profileImage: string | null;
  }>;
  averageRating: number;
}

export interface TangoResume {
  roles: {
    teacher: TangoRole;
    dj: TangoRole;
    organizer: TangoRole;
    performer: TangoRole;
  };
  overallScore: number;
  totalEndorsements: number;
  uniqueEndorsers: number;
  verifiedEndorsements: number;
  averageRating: number;
  yearsExperience: number;
  highlightedSkills: Array<{
    role: string;
    skill: string;
    count: number;
  }>;
}

export class ReputationService {
  /**
   * Calculate reputation score based on endorsements
   * Score formula: (endorsements * 5) + (unique endorsers * 10) + (verified * 15) + (avg rating * 10)
   */
  async calculateReputationScore(userId: number): Promise<number> {
    const stats = await this.getEndorsementStats(userId);
    
    const score = Math.min(
      100,
      stats.totalEndorsements * 5 +
        stats.uniqueEndorsers * 10 +
        stats.verifiedEndorsements * 15 +
        stats.averageRating * 10
    );

    return Math.round(score);
  }

  /**
   * Get endorsement statistics for a user
   */
  async getEndorsementStats(userId: number) {
    const allEndorsements = await db
      .select()
      .from(professionalEndorsements)
      .where(eq(professionalEndorsements.endorseeId, userId));

    const totalEndorsements = allEndorsements.length;
    const uniqueEndorsers = new Set(allEndorsements.map((e) => e.endorserId)).size;
    const verifiedEndorsements = allEndorsements.filter((e) => e.isVerified).length;
    const averageRating =
      allEndorsements.reduce((sum, e) => sum + (e.rating || 0), 0) / (totalEndorsements || 1);

    return {
      totalEndorsements,
      uniqueEndorsers,
      verifiedEndorsements,
      averageRating: Number(averageRating.toFixed(1)),
    };
  }

  /**
   * Calculate role-specific score
   */
  async calculateRoleScore(userId: number, role: string): Promise<number> {
    const roleEndorsements = await db
      .select()
      .from(professionalEndorsements)
      .where(
        and(
          eq(professionalEndorsements.endorseeId, userId),
          eq(professionalEndorsements.tangoRole, role)
        )
      );

    if (roleEndorsements.length === 0) return 0;

    const uniqueEndorsers = new Set(roleEndorsements.map((e) => e.endorserId)).size;
    const verifiedCount = roleEndorsements.filter((e) => e.isVerified).length;
    const avgRating =
      roleEndorsements.reduce((sum, e) => sum + (e.rating || 0), 0) / roleEndorsements.length;

    const score = Math.min(
      100,
      roleEndorsements.length * 5 + uniqueEndorsers * 10 + verifiedCount * 15 + avgRating * 10
    );

    return Math.round(score);
  }

  /**
   * Get top skills for a specific role
   */
  async getTopSkillsForRole(userId: number, role: string, limit = 5) {
    const roleEndorsements = await db
      .select()
      .from(professionalEndorsements)
      .where(
        and(
          eq(professionalEndorsements.endorseeId, userId),
          eq(professionalEndorsements.tangoRole, role)
        )
      );

    const skillCounts = roleEndorsements.reduce(
      (acc, endorsement) => {
        if (endorsement.skillType) {
          acc[endorsement.skillType] = (acc[endorsement.skillType] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get verified endorsers for a role
   */
  async getVerifiedEndorsers(userId: number, role: string) {
    const verifiedEndorsements = await db
      .select({
        id: users.id,
        name: users.name,
        profileImage: users.profileImage,
      })
      .from(professionalEndorsements)
      .innerJoin(users, eq(professionalEndorsements.endorserId, users.id))
      .where(
        and(
          eq(professionalEndorsements.endorseeId, userId),
          eq(professionalEndorsements.tangoRole, role),
          eq(professionalEndorsements.isVerified, true)
        )
      );

    return verifiedEndorsements;
  }

  /**
   * Build complete Tango Resume for a user
   */
  async getTangoResume(userId: number): Promise<TangoResume> {
    const roles = ["teacher", "dj", "organizer", "performer"] as const;
    const roleData: Partial<TangoResume["roles"]> = {};

    // Build role-specific data
    for (const role of roles) {
      const endorsements = await db
        .select()
        .from(professionalEndorsements)
        .where(
          and(
            eq(professionalEndorsements.endorseeId, userId),
            eq(professionalEndorsements.tangoRole, role)
          )
        );

      const topSkills = await this.getTopSkillsForRole(userId, role, 5);
      const verifiedBy = await this.getVerifiedEndorsers(userId, role);
      const score = await this.calculateRoleScore(userId, role);

      const avgRating =
        endorsements.length > 0
          ? endorsements.reduce((sum, e) => sum + (e.rating || 0), 0) / endorsements.length
          : 0;

      roleData[role] = {
        endorsements: endorsements.length,
        score,
        topSkills,
        verifiedBy,
        averageRating: Number(avgRating.toFixed(1)),
      };
    }

    // Get overall stats
    const stats = await this.getEndorsementStats(userId);
    const overallScore = await this.calculateReputationScore(userId);

    // Get user's years of experience
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const yearsExperience = user[0]?.yearsOfDancing || 0;

    // Get highlighted skills across all roles
    const allEndorsements = await db
      .select()
      .from(professionalEndorsements)
      .where(eq(professionalEndorsements.endorseeId, userId));

    const skillsByRole = allEndorsements.reduce(
      (acc, e) => {
        if (e.skillType) {
          const key = `${e.tangoRole}:${e.skillType}`;
          if (!acc[key]) {
            acc[key] = { role: e.tangoRole, skill: e.skillType, count: 0 };
          }
          acc[key].count++;
        }
        return acc;
      },
      {} as Record<string, { role: string; skill: string; count: number }>
    );

    const highlightedSkills = Object.values(skillsByRole)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      roles: roleData as TangoResume["roles"],
      overallScore,
      totalEndorsements: stats.totalEndorsements,
      uniqueEndorsers: stats.uniqueEndorsers,
      verifiedEndorsements: stats.verifiedEndorsements,
      averageRating: stats.averageRating,
      yearsExperience,
      highlightedSkills,
    };
  }

  /**
   * Check if endorsement should be verified (mutual endorsement)
   */
  async shouldVerifyEndorsement(endorserId: number, endorseeId: number): Promise<boolean> {
    // Check if they have endorsed each other (mutual endorsement)
    const mutualEndorsement = await db
      .select()
      .from(professionalEndorsements)
      .where(
        and(
          eq(professionalEndorsements.endorserId, endorseeId),
          eq(professionalEndorsements.endorseeId, endorserId)
        )
      )
      .limit(1);

    return mutualEndorsement.length > 0;
  }

  /**
   * Create a new endorsement
   */
  async createEndorsement(data: {
    endorseeId: number;
    endorserId: number;
    tangoRole: string;
    skillType?: string;
    rating: number;
    comment?: string;
  }) {
    // Check for existing endorsement (anti-spam)
    const existing = await db
      .select()
      .from(professionalEndorsements)
      .where(
        and(
          eq(professionalEndorsements.endorseeId, data.endorseeId),
          eq(professionalEndorsements.endorserId, data.endorserId),
          eq(professionalEndorsements.tangoRole, data.tangoRole),
          data.skillType ? eq(professionalEndorsements.skillType, data.skillType) : sql`skill_type IS NULL`
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error("You have already endorsed this person for this role and skill");
    }

    // Check if should be auto-verified
    const isVerified = await this.shouldVerifyEndorsement(data.endorserId, data.endorseeId);

    const [endorsement] = await db
      .insert(professionalEndorsements)
      .values({
        ...data,
        isVerified,
      })
      .returning();

    return endorsement;
  }

  /**
   * Get all endorsements for a user with endorser details
   */
  async getEndorsementsWithDetails(userId: number, role?: string) {
    let query = db
      .select({
        id: professionalEndorsements.id,
        tangoRole: professionalEndorsements.tangoRole,
        skillType: professionalEndorsements.skillType,
        rating: professionalEndorsements.rating,
        comment: professionalEndorsements.comment,
        isVerified: professionalEndorsements.isVerified,
        createdAt: professionalEndorsements.createdAt,
        endorser: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
        },
      })
      .from(professionalEndorsements)
      .innerJoin(users, eq(professionalEndorsements.endorserId, users.id))
      .where(eq(professionalEndorsements.endorseeId, userId));

    if (role) {
      query = query.where(
        and(
          eq(professionalEndorsements.endorseeId, userId),
          eq(professionalEndorsements.tangoRole, role)
        )
      );
    }

    const endorsements = await query.orderBy(desc(professionalEndorsements.createdAt));
    return endorsements;
  }

  /**
   * Delete endorsement (only if you created it)
   */
  async deleteEndorsement(endorsementId: number, userId: number) {
    const result = await db
      .delete(professionalEndorsements)
      .where(
        and(
          eq(professionalEndorsements.id, endorsementId),
          eq(professionalEndorsements.endorserId, userId)
        )
      )
      .returning();

    if (result.length === 0) {
      throw new Error("Endorsement not found or you don't have permission to delete it");
    }

    return result[0];
  }
}

export const reputationService = new ReputationService();

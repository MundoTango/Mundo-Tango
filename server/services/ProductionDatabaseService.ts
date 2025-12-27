import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, like, or, desc, count, sql } from "drizzle-orm";
import * as schema from "@shared/schema";

export class ProductionDatabaseService {
  private db: ReturnType<typeof drizzle> | null = null;
  private isAvailable = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const productionUrl = process.env.SUPABASE_DATABASE_URL;
    
    if (!productionUrl) {
      console.warn("[ProductionDB] SUPABASE_DATABASE_URL not configured - production queries disabled");
      this.isAvailable = false;
      return;
    }

    try {
      const sqlClient = neon(productionUrl);
      this.db = drizzle(sqlClient, { schema });
      this.isAvailable = true;
      console.log("[ProductionDB] Connected to production Supabase database");
    } catch (error) {
      console.error("[ProductionDB] Failed to connect:", error);
      this.isAvailable = false;
    }
  }

  isConnected(): boolean {
    return this.isAvailable && this.db !== null;
  }

  async getUserByEmail(email: string) {
    if (!this.db) {
      throw new Error("Production database not available");
    }

    const user = await this.db.select({
      id: schema.users.id,
      email: schema.users.email,
      username: schema.users.username,
      name: schema.users.name,
      role: schema.users.role,
      waitlist: schema.users.waitlist,
      isVerified: schema.users.isVerified,
      isActive: schema.users.isActive,
      suspended: schema.users.suspended,
      createdAt: schema.users.createdAt,
      lastLoginAt: schema.users.lastLoginAt,
      city: schema.users.city,
      country: schema.users.country,
    })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return user[0] || null;
  }

  async searchUsers(query: string, limit = 20) {
    if (!this.db) {
      throw new Error("Production database not available");
    }

    const searchPattern = `%${query}%`;
    
    const users = await this.db.select({
      id: schema.users.id,
      email: schema.users.email,
      username: schema.users.username,
      name: schema.users.name,
      role: schema.users.role,
      waitlist: schema.users.waitlist,
      isVerified: schema.users.isVerified,
      isActive: schema.users.isActive,
      suspended: schema.users.suspended,
      createdAt: schema.users.createdAt,
      lastLoginAt: schema.users.lastLoginAt,
    })
      .from(schema.users)
      .where(
        or(
          like(schema.users.email, searchPattern),
          like(schema.users.name, searchPattern),
          like(schema.users.username, searchPattern)
        )
      )
      .orderBy(desc(schema.users.createdAt))
      .limit(limit);

    return users;
  }

  async getRecentUsers(limit = 50) {
    if (!this.db) {
      throw new Error("Production database not available");
    }

    const users = await this.db.select({
      id: schema.users.id,
      email: schema.users.email,
      username: schema.users.username,
      name: schema.users.name,
      role: schema.users.role,
      waitlist: schema.users.waitlist,
      isVerified: schema.users.isVerified,
      isActive: schema.users.isActive,
      suspended: schema.users.suspended,
      createdAt: schema.users.createdAt,
      lastLoginAt: schema.users.lastLoginAt,
    })
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt))
      .limit(limit);

    return users;
  }

  async getProductionStats() {
    if (!this.db) {
      throw new Error("Production database not available");
    }

    const [totalUsers, waitlistUsers, activeUsers, verifiedUsers] = await Promise.all([
      this.db.select({ count: count() }).from(schema.users),
      this.db.select({ count: count() }).from(schema.users).where(eq(schema.users.waitlist, true)),
      this.db.select({ count: count() }).from(schema.users).where(eq(schema.users.isActive, true)),
      this.db.select({ count: count() }).from(schema.users).where(eq(schema.users.isVerified, true)),
    ]);

    return {
      total: totalUsers[0]?.count || 0,
      waitlist: waitlistUsers[0]?.count || 0,
      active: activeUsers[0]?.count || 0,
      verified: verifiedUsers[0]?.count || 0,
    };
  }

  async getWaitlistUsers(limit = 100) {
    if (!this.db) {
      throw new Error("Production database not available");
    }

    const users = await this.db.select({
      id: schema.users.id,
      email: schema.users.email,
      username: schema.users.username,
      name: schema.users.name,
      waitlistDate: schema.users.waitlistDate,
      isVerified: schema.users.isVerified,
      createdAt: schema.users.createdAt,
    })
      .from(schema.users)
      .where(eq(schema.users.waitlist, true))
      .orderBy(desc(schema.users.waitlistDate))
      .limit(limit);

    return users;
  }

  async getUserLoginHistory(email: string) {
    if (!this.db) {
      throw new Error("Production database not available");
    }

    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }

    return {
      user,
      loginStatus: {
        canLogin: user.isActive && !user.suspended && user.isVerified,
        issues: [
          !user.isActive && "Account is inactive",
          user.suspended && "Account is suspended",
          !user.isVerified && "Email not verified",
          user.waitlist && "User is on waitlist (can still login)",
        ].filter(Boolean),
      },
    };
  }
}

export const productionDb = new ProductionDatabaseService();

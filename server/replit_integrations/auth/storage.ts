import { replitAuthUsers, type ReplitUser, type UpsertReplitUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<ReplitUser | undefined>;
  upsertUser(user: UpsertReplitUser): Promise<ReplitUser>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<ReplitUser | undefined> {
    const [user] = await db.select().from(replitAuthUsers).where(eq(replitAuthUsers.id, id));
    return user;
  }

  async upsertUser(userData: UpsertReplitUser): Promise<ReplitUser> {
    const [user] = await db
      .insert(replitAuthUsers)
      .values(userData)
      .onConflictDoUpdate({
        target: replitAuthUsers.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();

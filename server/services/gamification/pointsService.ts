import { db } from "../../db";
import { gamificationPoints } from "@shared/schema";
import { eq, desc, sum, sql } from "drizzle-orm";

export interface PointsLog {
  id: number;
  userId: number;
  action: string;
  pointsAwarded: number;
  reason: string | null;
  createdAt: Date | null;
}

export const POINT_RULES = {
  "chat_mr_blue": 5,
  "complete_volunteer_test": 25,
  "find_bug": 50,
  "complete_onboarding_tour": 10,
  "visual_editor_edit": 15,
  "submit_code_feedback": 20,
  "complete_live_session": 100,
} as const;

export async function awardPoints(
  userId: number,
  action: string,
  amount: number,
  reason?: string
): Promise<number> {
  const result = await db.insert(gamificationPoints).values({
    userId,
    action,
    pointsAwarded: amount,
    reason: reason || null,
  }).returning();

  const totalPoints = await getUserPoints(userId);
  return totalPoints;
}

export async function getUserPoints(userId: number): Promise<number> {
  const result = await db
    .select({ total: sum(gamificationPoints.pointsAwarded) })
    .from(gamificationPoints)
    .where(eq(gamificationPoints.userId, userId));

  return Number(result[0]?.total || 0);
}

export async function getPointsHistory(userId: number): Promise<PointsLog[]> {
  const history = await db
    .select()
    .from(gamificationPoints)
    .where(eq(gamificationPoints.userId, userId))
    .orderBy(desc(gamificationPoints.createdAt))
    .limit(100);

  return history.map(row => ({
    id: row.id,
    userId: row.userId,
    action: row.action,
    pointsAwarded: row.pointsAwarded,
    reason: row.reason,
    createdAt: row.createdAt,
  }));
}

export async function deductPoints(
  userId: number,
  amount: number,
  reason: string
): Promise<number> {
  await db.insert(gamificationPoints).values({
    userId,
    action: "deduction",
    pointsAwarded: -amount,
    reason,
  });

  const totalPoints = await getUserPoints(userId);
  return totalPoints;
}

export async function getPointsForPeriod(
  userId: number,
  startDate: Date,
  endDate?: Date
): Promise<number> {
  const conditions = [eq(gamificationPoints.userId, userId)];
  
  if (endDate) {
    const result = await db
      .select({ total: sum(gamificationPoints.pointsAwarded) })
      .from(gamificationPoints)
      .where(
        sql`${gamificationPoints.userId} = ${userId} AND ${gamificationPoints.createdAt} >= ${startDate} AND ${gamificationPoints.createdAt} <= ${endDate}`
      );
    return Number(result[0]?.total || 0);
  } else {
    const result = await db
      .select({ total: sum(gamificationPoints.pointsAwarded) })
      .from(gamificationPoints)
      .where(
        sql`${gamificationPoints.userId} = ${userId} AND ${gamificationPoints.createdAt} >= ${startDate}`
      );
    return Number(result[0]?.total || 0);
  }
}

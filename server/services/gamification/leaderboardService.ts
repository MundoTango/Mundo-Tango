import { db } from "../../db";
import { gamificationPoints, users, volunteerStats } from "@shared/schema";
import { eq, gte, lte, desc, sql, and } from "drizzle-orm";

export interface LeaderboardEntry {
  userId: number;
  username: string;
  name: string;
  profileImage: string | null;
  points: number;
  rank: number;
}

export interface UserRank {
  rank: number;
  total: number;
}

function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

export async function getWeeklyLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
  const weekStart = getWeekStart();

  const leaderboard = await db
    .select({
      userId: users.id,
      username: users.username,
      name: users.name,
      profileImage: users.profileImage,
      points: sql<number>`COALESCE(SUM(${gamificationPoints.pointsAwarded}), 0)`,
    })
    .from(users)
    .leftJoin(
      gamificationPoints,
      and(
        eq(gamificationPoints.userId, users.id),
        gte(gamificationPoints.createdAt, weekStart)
      )
    )
    .groupBy(users.id, users.username, users.name, users.profileImage)
    .orderBy(desc(sql`COALESCE(SUM(${gamificationPoints.pointsAwarded}), 0)`))
    .limit(limit);

  return leaderboard.map((entry, index) => ({
    ...entry,
    points: Number(entry.points),
    rank: index + 1,
  }));
}

export async function getMonthlyLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
  const monthStart = getMonthStart();

  const leaderboard = await db
    .select({
      userId: users.id,
      username: users.username,
      name: users.name,
      profileImage: users.profileImage,
      points: sql<number>`COALESCE(SUM(${gamificationPoints.pointsAwarded}), 0)`,
    })
    .from(users)
    .leftJoin(
      gamificationPoints,
      and(
        eq(gamificationPoints.userId, users.id),
        gte(gamificationPoints.createdAt, monthStart)
      )
    )
    .groupBy(users.id, users.username, users.name, users.profileImage)
    .orderBy(desc(sql`COALESCE(SUM(${gamificationPoints.pointsAwarded}), 0)`))
    .limit(limit);

  return leaderboard.map((entry, index) => ({
    ...entry,
    points: Number(entry.points),
    rank: index + 1,
  }));
}

export async function getAllTimeLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  const leaderboard = await db
    .select({
      userId: users.id,
      username: users.username,
      name: users.name,
      profileImage: users.profileImage,
      points: sql<number>`COALESCE(SUM(${gamificationPoints.pointsAwarded}), 0)`,
    })
    .from(users)
    .leftJoin(gamificationPoints, eq(gamificationPoints.userId, users.id))
    .groupBy(users.id, users.username, users.name, users.profileImage)
    .orderBy(desc(sql`COALESCE(SUM(${gamificationPoints.pointsAwarded}), 0)`))
    .limit(limit);

  return leaderboard.map((entry, index) => ({
    ...entry,
    points: Number(entry.points),
    rank: index + 1,
  }));
}

export async function getVolunteerLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
  const leaderboard = await db
    .select({
      userId: users.id,
      username: users.username,
      name: users.name,
      profileImage: users.profileImage,
      points: sql<number>`COALESCE(${volunteerStats.completedSessions}, 0)`,
    })
    .from(users)
    .leftJoin(volunteerStats, eq(volunteerStats.userId, users.id))
    .orderBy(desc(sql`COALESCE(${volunteerStats.completedSessions}, 0)`))
    .limit(limit);

  return leaderboard.map((entry, index) => ({
    ...entry,
    points: Number(entry.points),
    rank: index + 1,
  }));
}

export async function getBugHunterLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
  const leaderboard = await db
    .select({
      userId: users.id,
      username: users.username,
      name: users.name,
      profileImage: users.profileImage,
      points: sql<number>`COALESCE(${volunteerStats.bugsFound}, 0)`,
    })
    .from(users)
    .leftJoin(volunteerStats, eq(volunteerStats.userId, users.id))
    .orderBy(desc(sql`COALESCE(${volunteerStats.bugsFound}, 0)`))
    .limit(limit);

  return leaderboard.map((entry, index) => ({
    ...entry,
    points: Number(entry.points),
    rank: index + 1,
  }));
}

export async function getUserRank(userId: number, type: string): Promise<UserRank> {
  let leaderboard: LeaderboardEntry[] = [];

  switch (type) {
    case "weekly":
      leaderboard = await getWeeklyLeaderboard(1000);
      break;
    case "monthly":
      leaderboard = await getMonthlyLeaderboard(1000);
      break;
    case "alltime":
      leaderboard = await getAllTimeLeaderboard(1000);
      break;
    case "volunteer":
      leaderboard = await getVolunteerLeaderboard(1000);
      break;
    case "bugs":
      leaderboard = await getBugHunterLeaderboard(1000);
      break;
    default:
      leaderboard = await getAllTimeLeaderboard(1000);
  }

  const userIndex = leaderboard.findIndex(entry => entry.userId === userId);
  const rank = userIndex >= 0 ? userIndex + 1 : leaderboard.length + 1;
  
  return {
    rank,
    total: leaderboard.length,
  };
}

export async function resetWeeklyPoints(): Promise<void> {
  console.log("Weekly points reset - no action needed (points are cumulative, leaderboard filters by date)");
}
